================================================================================
WOORIDO 동시성 테스트 시나리오
================================================================================

버전            1.0.0
작성일          2026-01-16
기준 문서       DB_Schema_1.0.0.md, POLICY_DEFINITION.md, BACKLOG.md
총 시나리오     35개

================================================================================
목차
================================================================================

1. 개요
2. 동시성 전략 요약
3. 계좌 동시성 테스트 (8개)
4. 투표 동시성 테스트 (7개)
5. 챌린지 동시성 테스트 (6개)
6. 장부/지출 동시성 테스트 (5개)
7. 바코드 동시성 테스트 (4개)
8. 배치 동시성 테스트 (5개)

================================================================================
1. 개요
================================================================================

1.1 목적
--------
동시 요청 상황에서 데이터 정합성과 트랜잭션 안전성 검증

1.2 테스트 환경
---------------
항목                  설정값
─────────────────     ──────────────────────────────
Database              Oracle 21c XE
Isolation Level       READ_COMMITTED
Lock Strategy         Hybrid (Pessimistic + Optimistic)
Thread Model          Virtual Threads (Java 21)
Retry                 Spring Retry 2.0.5
Test Tool             JMeter / Gatling / k6

1.3 동시성 테스트 분류
----------------------
구분                  시나리오 수     Lock 방식
─────────────────     ─────────────   ──────────────────
계좌 동시성           8               Optimistic Lock
투표 동시성           7               Pessimistic Lock
챌린지 동시성         6               Pessimistic Lock
장부/지출 동시성      5               Pessimistic Lock
바코드 동시성         4               Pessimistic Lock
배치 동시성           5               Pessimistic Lock
─────────────────     ─────────────   ──────────────────
합계                  35

1.4 시나리오 ID 규칙
--------------------
형식: CC-{도메인}-{번호}

도메인 코드:
  ACCT      계좌
  VOTE      투표
  CHAL      챌린지
  LDGR      장부/지출
  BARC      바코드
  BATCH     배치


================================================================================
2. 동시성 전략 요약
================================================================================

2.1 Optimistic Lock (낙관적 잠금)
---------------------------------
적용 대상        accounts 테이블
구현 방식        version 컬럼 사용
동작             UPDATE ... WHERE id = ? AND version = ?
실패 처리        OptimisticLockException → 재시도 (Spring Retry)

SQL 예시:
┌─────────────────────────────────────────────────────────────────────────────┐
│  UPDATE accounts                                                            │
│  SET balance = balance + :amount,                                           │
│      version = version + 1,                                                 │
│      updated_at = CURRENT_TIMESTAMP                                         │
│  WHERE id = :id AND version = :version                                      │
└─────────────────────────────────────────────────────────────────────────────┘

2.2 Pessimistic Lock (비관적 잠금)
----------------------------------
적용 대상        투표, 챌린지, 장부, 바코드
구현 방식        SELECT ... FOR UPDATE
동작             행 잠금 후 업데이트
실패 처리        대기 후 순차 처리

SQL 예시:
┌─────────────────────────────────────────────────────────────────────────────┐
│  SELECT * FROM meeting_votes                                                │
│  WHERE id = :id                                                             │
│  FOR UPDATE                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘

2.3 Lock 대상 테이블
--------------------
테이블                  Lock 방식           version 컬럼
─────────────────────   ─────────────────   ────────────
accounts                Optimistic          ✅ 있음
challenges              Pessimistic         ✅ 있음
meeting_votes           Pessimistic         ✅ 있음
expense_votes           Pessimistic         ✅ 있음
general_votes           Pessimistic         ✅ 있음
payment_barcodes        Pessimistic         ❌ 없음
ledger_entries          Pessimistic         ❌ 없음

2.4 Spring Retry 설정
---------------------
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Retryable(                                                                │
│      retryFor = { OptimisticLockException.class },                          │
│      maxAttempts = 3,                                                       │
│      backoff = @Backoff(delay = 100, multiplier = 2)                        │
│  )                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
3. 계좌 동시성 테스트 (8개)
================================================================================

--------------------------------------------------------------------------------
CC-ACCT-001: 동시 충전 요청
--------------------------------------------------------------------------------
시나리오        동일 계좌에 10개 스레드가 동시에 10,000원씩 충전
전제조건        balance = 0, version = 0
동시 요청       10개 스레드 × 10,000원 충전
기대결과        최종 balance = 100,000원
                version = 10
검증항목        1. 모든 충전 성공 (재시도 포함)
                2. 금액 누락 없음
                3. account_transactions 10건 생성
Lock 방식       Optimistic Lock + Spring Retry
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_충전_10건() throws InterruptedException {                         │
│      int threadCount = 10;                                                  │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  accountService.charge(accountId, 10000L);                  │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      Account account = accountRepository.findById(accountId);               │
│      assertThat(account.getBalance()).isEqualTo(100000L);                   │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-ACCT-002: 동시 출금 요청 - 잔액 충분
--------------------------------------------------------------------------------
시나리오        동일 계좌에 5개 스레드가 동시에 10,000원씩 출금
전제조건        balance = 100,000원, version = 0
동시 요청       5개 스레드 × 10,000원 출금
기대결과        최종 balance = 50,000원
                version = 5
                모든 출금 성공
검증항목        1. 5건 모두 성공
                2. 잔액 정확
                3. account_transactions 5건 생성
Lock 방식       Optimistic Lock + Spring Retry

--------------------------------------------------------------------------------
CC-ACCT-003: 동시 출금 요청 - 잔액 부족 경합
--------------------------------------------------------------------------------
시나리오        동일 계좌에 10개 스레드가 동시에 20,000원씩 출금
전제조건        balance = 100,000원
동시 요청       10개 스레드 × 20,000원 출금
기대결과        5건 성공, 5건 실패 (잔액 부족)
                최종 balance = 0원
검증항목        1. 정확히 5건만 성공
                2. 5건 ACCOUNT_003 에러
                3. 잔액 음수 안됨
Lock 방식       Optimistic Lock + 잔액 검증
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_출금_잔액부족_경합() throws InterruptedException {                  │
│      int threadCount = 10;                                                  │
│      AtomicInteger successCount = new AtomicInteger(0);                     │
│      AtomicInteger failCount = new AtomicInteger(0);                        │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  accountService.withdraw(accountId, 20000L);                │
│                  successCount.incrementAndGet();                            │
│              } catch (InsufficientBalanceException e) {                     │
│                  failCount.incrementAndGet();                               │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      assertThat(successCount.get()).isEqualTo(5);                           │
│      assertThat(failCount.get()).isEqualTo(5);                              │
│      Account account = accountRepository.findById(accountId);               │
│      assertThat(account.getBalance()).isEqualTo(0L);                        │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-ACCT-004: 동시 충전 + 출금 혼합
--------------------------------------------------------------------------------
시나리오        동일 계좌에 충전 5건 + 출금 5건 동시 요청
전제조건        balance = 50,000원
동시 요청       충전 5건 × 10,000원 + 출금 5건 × 10,000원
기대결과        최종 balance = 50,000원 (변동 없음)
                version = 10
검증항목        1. 모든 요청 처리
                2. 최종 잔액 정확
                3. 트랜잭션 10건 기록
Lock 방식       Optimistic Lock + Spring Retry

--------------------------------------------------------------------------------
CC-ACCT-005: 동시 보증금 락 요청
--------------------------------------------------------------------------------
시나리오        동일 계좌에 3개 챌린지 동시 가입 (보증금 락)
전제조건        balance = 300,000원, lockedBalance = 0
동시 요청       3개 스레드 × 100,000원 보증금 락
기대결과        최종 balance = 0원
                lockedBalance = 300,000원
검증항목        1. 3건 모두 성공
                2. 보증금 락 정확
                3. 트랜잭션 3건 (DEPOSIT_LOCK)
Lock 방식       Optimistic Lock + Spring Retry

--------------------------------------------------------------------------------
CC-ACCT-006: 동시 보증금 락 - 잔액 부족 경합
--------------------------------------------------------------------------------
시나리오        동일 계좌에 5개 챌린지 동시 가입 시도
전제조건        balance = 200,000원 (2개만 가능)
동시 요청       5개 스레드 × 100,000원 보증금 락
기대결과        2건 성공, 3건 실패
                최종 balance = 0원
                lockedBalance = 200,000원
검증항목        1. 정확히 2건만 성공
                2. 3건 잔액 부족 에러
                3. 잔액 음수 안됨
Lock 방식       Optimistic Lock + 잔액 검증

--------------------------------------------------------------------------------
CC-ACCT-007: 동시 서포트 납입
--------------------------------------------------------------------------------
시나리오        동일 사용자가 3개 챌린지에 동시 서포트 납입
전제조건        balance = 150,000원
동시 요청       3개 스레드 × 50,000원 서포트
기대결과        최종 balance = 0원
                3개 챌린지 balance 각각 +50,000원
검증항목        1. 3건 모두 성공
                2. 사용자 잔액 정확
                3. 각 챌린지 잔액 정확
Lock 방식       Optimistic Lock (accounts) + Pessimistic Lock (challenges)

--------------------------------------------------------------------------------
CC-ACCT-008: 충전 콜백 중복 방지 (Idempotency)
--------------------------------------------------------------------------------
시나리오        동일 PG 콜백이 3번 중복 수신
전제조건        idempotency_key = "PG_TX_12345"
동시 요청       3개 스레드 × 동일 콜백
기대결과        1건만 처리, 2건 무시
                최종 balance += 충전금액 (1회만)
검증항목        1. idempotency_key 중복 체크
                2. account_transactions 1건만 생성
                3. 중복 콜백 무시
Lock 방식       UK_account_tx_idempotency 제약조건
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 충전_콜백_중복_방지() throws InterruptedException {                     │
│      String idempotencyKey = "PG_TX_12345";                                 │
│      int threadCount = 3;                                                   │
│      AtomicInteger successCount = new AtomicInteger(0);                     │
│      AtomicInteger duplicateCount = new AtomicInteger(0);                   │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  accountService.processChargeCallback(                      │
│                      accountId, 50000L, idempotencyKey);                    │
│                  successCount.incrementAndGet();                            │
│              } catch (DuplicateKeyException e) {                            │
│                  duplicateCount.incrementAndGet();                          │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      assertThat(successCount.get()).isEqualTo(1);                           │
│      assertThat(duplicateCount.get()).isEqualTo(2);                         │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
4. 투표 동시성 테스트 (7개)
================================================================================

--------------------------------------------------------------------------------
CC-VOTE-001: 동시 모임 참석 투표
--------------------------------------------------------------------------------
시나리오        10명이 동시에 모임 참석 투표
전제조건        meeting_votes.attend_count = 0
동시 요청       10개 스레드 × AGREE 투표
기대결과        attend_count = 10
                meeting_vote_records 10건 생성
검증항목        1. 카운트 정확
                2. 중복 투표 없음
                3. 모든 기록 생성
Lock 방식       Pessimistic Lock (SELECT FOR UPDATE)
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_모임_참석_투표() throws InterruptedException {                     │
│      int threadCount = 10;                                                  │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          final Long userId = userIds.get(i);                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  meetingVoteService.castVote(meetingVoteId, userId, AGREE); │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      MeetingVote vote = meetingVoteRepository.findById(meetingVoteId);      │
│      assertThat(vote.getAttendCount()).isEqualTo(10);                       │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-VOTE-002: 동시 투표로 과반수 도달
--------------------------------------------------------------------------------
시나리오        5명 동시 투표로 과반수(6/10) 도달 시점
전제조건        attend_count = 5, required_count = 6
동시 요청       5개 스레드 × AGREE 투표
기대결과        정확히 1번만 status → APPROVED 전환
                attend_count = 10
검증항목        1. 상태 전환 1회만 발생
                2. 중복 상태 전환 없음
                3. meetings.status = CONFIRMED
Lock 방식       Pessimistic Lock + 상태 전환 원자성

--------------------------------------------------------------------------------
CC-VOTE-003: 동시 중복 투표 시도
--------------------------------------------------------------------------------
시나리오        동일 사용자가 3번 동시 투표 시도
전제조건        user_id = 1, 아직 투표 안함
동시 요청       3개 스레드 × 동일 user_id
기대결과        1건 성공, 2건 실패 (VOTE_006)
                meeting_vote_records 1건만 생성
검증항목        1. UK 제약조건 동작
                2. 중복 투표 방지
                3. 카운트 1회만 증가
Lock 방식       UK_meeting_vote_records_vote_user + Pessimistic Lock
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_중복_투표_방지() throws InterruptedException {                     │
│      int threadCount = 3;                                                   │
│      AtomicInteger successCount = new AtomicInteger(0);                     │
│      AtomicInteger duplicateCount = new AtomicInteger(0);                   │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  meetingVoteService.castVote(                               │
│                      meetingVoteId, sameUserId, AGREE);                     │
│                  successCount.incrementAndGet();                            │
│              } catch (AlreadyVotedException e) {                            │
│                  duplicateCount.incrementAndGet();                          │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      assertThat(successCount.get()).isEqualTo(1);                           │
│      assertThat(duplicateCount.get()).isEqualTo(2);                         │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-VOTE-004: 동시 지출 투표
--------------------------------------------------------------------------------
시나리오        5명이 동시에 지출 투표
전제조건        expense_votes.approve_count = 0
동시 요청       5개 스레드 × APPROVE 투표
기대결과        approve_count = 5
                expense_vote_records 5건 생성
검증항목        1. 카운트 정확
                2. 참석자만 투표
                3. 모든 기록 생성
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-VOTE-005: 동시 강퇴 투표 - 승인 조건 도달
--------------------------------------------------------------------------------
시나리오        7명 동시 투표로 강퇴 승인(70%) 도달
전제조건        general_votes (KICK), eligible_count = 10
동시 요청       7개 스레드 × APPROVE 투표
기대결과        approve_count = 7
                status → APPROVED
                대상 멤버 강제 탈퇴
검증항목        1. 70% 조건 정확히 판단
                2. 강퇴 처리 1회만 실행
                3. 보증금 반환
Lock 방식       Pessimistic Lock + 후속 처리 원자성

--------------------------------------------------------------------------------
CC-VOTE-006: 동시 해산 투표 - 전원 동의
--------------------------------------------------------------------------------
시나리오        10명 동시 투표로 해산 전원 동의
전제조건        general_votes (DISSOLVE), eligible_count = 10
동시 요청       10개 스레드 × APPROVE 투표
기대결과        approve_count = 10
                status → APPROVED
                챌린지 status → COMPLETED
검증항목        1. 100% 조건 정확히 판단
                2. 정산 처리 1회만 실행
                3. 잔액 분배
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-VOTE-007: 투표 마감 직전 동시 투표
--------------------------------------------------------------------------------
시나리오        expires_at 직전에 5명 동시 투표
전제조건        expires_at = NOW + 100ms
동시 요청       5개 스레드 × 투표 (50ms 지연 후)
기대결과        마감 전 투표는 성공
                마감 후 투표는 VOTE_005 에러
검증항목        1. 마감 시점 정확히 판단
                2. 경계 조건 처리
Lock 방식       Pessimistic Lock + 시간 검증


================================================================================
5. 챌린지 동시성 테스트 (6개)
================================================================================

--------------------------------------------------------------------------------
CC-CHAL-001: 동시 챌린지 가입 - 정원 충분
--------------------------------------------------------------------------------
시나리오        10명이 동시에 챌린지 가입 (정원 20명)
전제조건        current_members = 5, max_members = 20
동시 요청       10개 스레드 × 가입
기대결과        current_members = 15
                challenge_members 10건 생성
검증항목        1. 멤버 수 정확
                2. 모든 가입 성공
                3. 각 사용자 보증금 락
Lock 방식       Pessimistic Lock (challenges)
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_챌린지_가입() throws InterruptedException {                        │
│      int threadCount = 10;                                                  │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          final Long userId = userIds.get(i);                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  challengeService.join(challengeId, userId);                │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      Challenge challenge = challengeRepository.findById(challengeId);       │
│      assertThat(challenge.getCurrentMembers()).isEqualTo(15);               │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-CHAL-002: 동시 챌린지 가입 - 정원 초과 경합
--------------------------------------------------------------------------------
시나리오        10명이 동시에 챌린지 가입 (잔여 3명)
전제조건        current_members = 17, max_members = 20
동시 요청       10개 스레드 × 가입
기대결과        3건 성공, 7건 실패 (CHALLENGE_005)
                current_members = 20
검증항목        1. 정확히 3건만 성공
                2. 정원 초과 에러 7건
                3. 정원 초과 안됨
Lock 방식       Pessimistic Lock + 정원 검증

--------------------------------------------------------------------------------
CC-CHAL-003: 동시 가입으로 ACTIVE 전환
--------------------------------------------------------------------------------
시나리오        2명 동시 가입으로 최소 인원(3명) 도달
전제조건        current_members = 1, min_members = 3, status = RECRUITING
동시 요청       2개 스레드 × 가입
기대결과        current_members = 3
                status → IN_PROGRESS
                activated_at 설정
                전체 멤버 보증금 락
검증항목        1. 상태 전환 1회만 발생
                2. 기존 멤버 보증금 락 처리
                3. activated_at 정확
Lock 방식       Pessimistic Lock + 상태 전환 원자성

--------------------------------------------------------------------------------
CC-CHAL-004: 동시 챌린지 탈퇴
--------------------------------------------------------------------------------
시나리오        5명이 동시에 챌린지 탈퇴
전제조건        current_members = 10
동시 요청       5개 스레드 × 탈퇴
기대결과        current_members = 5
                5명 보증금 해제
검증항목        1. 멤버 수 정확
                2. 보증금 정확히 해제
                3. 각 사용자 balance 복구
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-CHAL-005: 동시 가입 + 탈퇴 혼합
--------------------------------------------------------------------------------
시나리오        가입 5건 + 탈퇴 3건 동시 발생
전제조건        current_members = 10
동시 요청       가입 5개 스레드 + 탈퇴 3개 스레드
기대결과        current_members = 12
검증항목        1. 멤버 수 정확
                2. 트랜잭션 정합성
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-CHAL-006: 동시 리더 위임 시도
--------------------------------------------------------------------------------
시나리오        리더가 2명에게 동시에 위임 시도
전제조건        리더 = user_id_1
동시 요청       2개 스레드 × 위임 (대상: user_id_2, user_id_3)
기대결과        1건 성공, 1건 실패
                리더 1명만 존재
검증항목        1. 리더 중복 방지
                2. 정확히 1명만 리더
Lock 방식       Pessimistic Lock


================================================================================
6. 장부/지출 동시성 테스트 (5개)
================================================================================

--------------------------------------------------------------------------------
CC-LDGR-001: 동시 지출 실행 - 잔액 충분
--------------------------------------------------------------------------------
시나리오        3건 지출이 동시에 실행 (총 90,000원)
전제조건        challenges.balance = 100,000원
동시 요청       3개 스레드 × 30,000원 지출
기대결과        최종 balance = 10,000원
                ledger_entries 3건 생성
검증항목        1. 잔액 정확
                2. 장부 3건 기록
                3. 순서 상관없이 모두 성공
Lock 방식       Pessimistic Lock (challenges)
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_지출_실행() throws InterruptedException {                         │
│      int threadCount = 3;                                                   │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          final Long expenseId = expenseIds.get(i);                          │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  expenseService.execute(expenseId);                         │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      Challenge challenge = challengeRepository.findById(challengeId);       │
│      assertThat(challenge.getBalance()).isEqualTo(10000L);                  │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-LDGR-002: 동시 지출 실행 - 잔액 부족 경합
--------------------------------------------------------------------------------
시나리오        5건 지출이 동시에 실행 (각 30,000원, 총 150,000원)
전제조건        challenges.balance = 100,000원
동시 요청       5개 스레드 × 30,000원 지출
기대결과        3건 성공, 2건 실패 (LEDGER_002)
                최종 balance = 10,000원
검증항목        1. 정확히 3건만 성공
                2. 잔액 부족 에러 2건
                3. 잔액 음수 안됨
Lock 방식       Pessimistic Lock + 잔액 검증

--------------------------------------------------------------------------------
CC-LDGR-003: 동시 서포트 입금 + 지출
--------------------------------------------------------------------------------
시나리오        서포트 입금 5건 + 지출 3건 동시 발생
전제조건        challenges.balance = 50,000원
동시 요청       입금 5건 × 10,000원 + 지출 3건 × 20,000원
기대결과        최종 balance = 50,000 + 50,000 - 60,000 = 40,000원
검증항목        1. 잔액 정확
                2. 장부 8건 기록
                3. balance_before/after 정확
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-LDGR-004: 동시 장부 메모 수정
--------------------------------------------------------------------------------
시나리오        동일 장부 항목에 3명이 동시에 메모 수정
전제조건        ledger_entries.memo = null
동시 요청       3개 스레드 × 메모 수정 (각각 다른 내용)
기대결과        1건만 최종 반영
                memo_updated_at, memo_updated_by 정확
검증항목        1. 마지막 업데이트 반영
                2. 덮어쓰기 허용
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-LDGR-005: 동시 정산 시도
--------------------------------------------------------------------------------
시나리오        챌린지 종료 후 3명이 동시에 정산 요청
전제조건        challenges.status = COMPLETED
동시 요청       3개 스레드 × 정산 요청
기대결과        1건 성공, 2건 실패 (SETTLEMENT_001)
                settlements 1건만 생성
검증항목        1. 정산 중복 방지
                2. 잔액 분배 1회만 실행
Lock 방식       Pessimistic Lock + 상태 체크
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_정산_중복_방지() throws InterruptedException {                     │
│      int threadCount = 3;                                                   │
│      AtomicInteger successCount = new AtomicInteger(0);                     │
│      AtomicInteger duplicateCount = new AtomicInteger(0);                   │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  settlementService.settle(challengeId);                     │
│                  successCount.incrementAndGet();                            │
│              } catch (SettlementInProgressException e) {                    │
│                  duplicateCount.incrementAndGet();                          │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      assertThat(successCount.get()).isEqualTo(1);                           │
│      assertThat(duplicateCount.get()).isEqualTo(2);                         │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
7. 바코드 동시성 테스트 (4개)
================================================================================

--------------------------------------------------------------------------------
CC-BARC-001: 동시 바코드 사용 시도
--------------------------------------------------------------------------------
시나리오        동일 바코드를 3개 단말에서 동시 사용
전제조건        payment_barcodes.status = ACTIVE
동시 요청       3개 스레드 × 바코드 사용
기대결과        1건 성공, 2건 실패
                status = USED
검증항목        1. 바코드 1회만 사용
                2. 중복 사용 방지
                3. 장부 1건만 기록
Lock 방식       Pessimistic Lock (SELECT FOR UPDATE)
테스트 코드:
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Test                                                                      │
│  void 동시_바코드_사용_방지() throws InterruptedException {                   │
│      int threadCount = 3;                                                   │
│      AtomicInteger successCount = new AtomicInteger(0);                     │
│      AtomicInteger failCount = new AtomicInteger(0);                        │
│      ExecutorService executor = Executors.newFixedThreadPool(threadCount);  │
│      CountDownLatch latch = new CountDownLatch(threadCount);                │
│                                                                             │
│      for (int i = 0; i < threadCount; i++) {                                │
│          executor.submit(() -> {                                            │
│              try {                                                          │
│                  barcodeService.use(barcodeId, merchantInfo);               │
│                  successCount.incrementAndGet();                            │
│              } catch (BarcodeAlreadyUsedException e) {                      │
│                  failCount.incrementAndGet();                               │
│              } finally {                                                    │
│                  latch.countDown();                                         │
│              }                                                              │
│          });                                                                │
│      }                                                                      │
│                                                                             │
│      latch.await();                                                         │
│      assertThat(successCount.get()).isEqualTo(1);                           │
│      assertThat(failCount.get()).isEqualTo(2);                              │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-BARC-002: 바코드 만료 직전 사용 시도
--------------------------------------------------------------------------------
시나리오        expires_at 직전에 바코드 사용 시도
전제조건        expires_at = NOW + 100ms
동시 요청       2개 스레드 (50ms 지연, 150ms 지연)
기대결과        50ms: 성공 (만료 전)
                150ms: 실패 (만료 후)
검증항목        1. 만료 시점 정확히 판단
                2. 경계 조건 처리
Lock 방식       Pessimistic Lock + 시간 검증

--------------------------------------------------------------------------------
CC-BARC-003: 동시 바코드 발급 요청
--------------------------------------------------------------------------------
시나리오        동일 지출 요청에 3번 바코드 발급 시도
전제조건        expense_requests.status = APPROVED
동시 요청       3개 스레드 × 바코드 발급
기대결과        1건 성공, 2건 실패
                payment_barcodes 1건만 생성
검증항목        1. UK 제약조건 동작
                2. 중복 발급 방지
Lock 방식       UK_payment_barcodes_expense_request_id

--------------------------------------------------------------------------------
CC-BARC-004: PG 웹훅 동시 수신
--------------------------------------------------------------------------------
시나리오        동일 결제 건 웹훅이 3번 중복 수신
전제조건        webhook_logs에 event_id 없음
동시 요청       3개 스레드 × 동일 event_id
기대결과        1건만 처리, 2건 무시
                webhook_logs 1건만 생성
검증항목        1. UK_webhook_logs_event_id 동작
                2. 중복 처리 방지
                3. 장부 1건만 기록
Lock 방식       UK_webhook_logs_event_id 제약조건


================================================================================
8. 배치 동시성 테스트 (5개)
================================================================================

--------------------------------------------------------------------------------
CC-BATCH-001: 매월 1일 서포트 자동 납입 배치
--------------------------------------------------------------------------------
시나리오        1,000명 사용자 동시 서포트 납입
전제조건        IN_PROGRESS 챌린지 100개, 총 멤버 1,000명
동시 실행       배치 스케줄러 실행
기대결과        1,000건 서포트 납입 처리
                각 챌린지 balance 증가
검증항목        1. 모든 납입 성공
                2. 데드락 없음
                3. 잔액 정확
Lock 방식       Pessimistic Lock + 순차 처리 (챌린지별)
배치 설계:
┌─────────────────────────────────────────────────────────────────────────────┐
│  // 챌린지별로 순차 처리하여 데드락 방지                                       │
│  @Scheduled(cron = "0 0 0 1 * *")                                           │
│  @Transactional                                                             │
│  public void processMonthlySupport() {                                      │
│      List<Challenge> challenges = challengeRepository                       │
│          .findByStatus(IN_PROGRESS);                                        │
│                                                                             │
│      for (Challenge challenge : challenges) {                               │
│          processChallengeSupport(challenge.getId()); // 개별 트랜잭션        │
│      }                                                                      │
│  }                                                                          │
│                                                                             │
│  @Transactional(propagation = REQUIRES_NEW)                                 │
│  public void processChallengeSupport(Long challengeId) {                    │
│      Challenge challenge = challengeRepository                              │
│          .findByIdForUpdate(challengeId); // SELECT FOR UPDATE              │
│      // 멤버별 납입 처리                                                      │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-BATCH-002: 60일 미충전 자동 탈퇴 배치
--------------------------------------------------------------------------------
시나리오        100명 자동 탈퇴 대상 동시 처리
전제조건        privilege_revoked_at < NOW - 60일
동시 실행       배치 스케줄러 실행
기대결과        100건 자동 탈퇴 처리
                보증금 몰수 100건
검증항목        1. 모든 탈퇴 처리
                2. 보증금 정확히 몰수
                3. 리더에게 알림
Lock 방식       Pessimistic Lock + 순차 처리

--------------------------------------------------------------------------------
CC-BATCH-003: 당도 점수 월간 재계산 배치
--------------------------------------------------------------------------------
시나리오        10,000명 사용자 당도 재계산
전제조건        user_scores 10,000건
동시 실행       Django 배치 (매월 1일 00:00)
기대결과        10,000건 점수 업데이트
                calculated_at 갱신
검증항목        1. 모든 점수 재계산
                2. Pessimistic Lock 사용
                3. Redis 일일 카운트 반영
Lock 방식       Pessimistic Lock (P-061)
배치 설계:
┌─────────────────────────────────────────────────────────────────────────────┐
│  # Django 배치                                                              │
│  @transaction.atomic                                                        │
│  def calculate_monthly_brix():                                              │
│      users = UserScore.objects.select_for_update().all()                    │
│      for user_score in users:                                               │
│          # Redis에서 일일 카운트 조회                                         │
│          daily_counts = redis.get(f"user:{user_score.user_id}:counts")      │
│          # 점수 재계산                                                       │
│          user_score.total_score = calculate_brix(daily_counts)              │
│          user_score.calculated_at = timezone.now()                          │
│          user_score.save()                                                  │
└─────────────────────────────────────────────────────────────────────────────┘

--------------------------------------------------------------------------------
CC-BATCH-004: 바코드 자동 만료 배치
--------------------------------------------------------------------------------
시나리오        500건 만료 바코드 상태 변경
전제조건        expires_at < NOW, status = ACTIVE
동시 실행       배치 스케줄러 실행 (1분 간격)
기대결과        500건 status → EXPIRED
검증항목        1. 모든 만료 처리
                2. 사용 중인 바코드 보호
Lock 방식       Pessimistic Lock

--------------------------------------------------------------------------------
CC-BATCH-005: 완주 인증 자동 부여 배치
--------------------------------------------------------------------------------
시나리오        50개 챌린지 완주 인증 부여
전제조건        activated_at < NOW - 365일, is_verified = 'N'
동시 실행       배치 스케줄러 실행 (매일 00:00)
기대결과        50건 is_verified → 'Y'
                verified_at 설정
검증항목        1. 모든 인증 처리
                2. 정확히 365일 경과 확인
Lock 방식       Pessimistic Lock


================================================================================
부록: 데드락 방지 전략
================================================================================

A.1 Lock 순서 규칙
------------------
여러 테이블을 동시에 Lock 할 때 항상 동일한 순서로 Lock:

순서    테이블
────    ─────────────────
1       users
2       accounts
3       challenges
4       challenge_members
5       meetings
6       *_votes
7       *_vote_records
8       ledger_entries
9       payment_barcodes

A.2 트랜잭션 격리 수준
----------------------
설정                  값
─────────────────     ────────────────
Isolation Level       READ_COMMITTED
Lock Timeout          30초
Statement Timeout     60초

A.3 재시도 전략
---------------
┌─────────────────────────────────────────────────────────────────────────────┐
│  @Retryable(                                                                │
│      retryFor = {                                                           │
│          OptimisticLockException.class,                                     │
│          CannotAcquireLockException.class                                   │
│      },                                                                     │
│      maxAttempts = 3,                                                       │
│      backoff = @Backoff(delay = 100, multiplier = 2, maxDelay = 1000)       │
│  )                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘


================================================================================
변경 이력
================================================================================

버전      일자          작성자      변경 내용
──────    ──────────    ────────    ─────────────────────────────
1.0.0     2026-01-16    System      초기 버전 생성
                                    - 계좌 동시성 테스트 8개
                                    - 투표 동시성 테스트 7개
                                    - 챌린지 동시성 테스트 6개
                                    - 장부/지출 동시성 테스트 5개
                                    - 바코드 동시성 테스트 4개
                                    - 배치 동시성 테스트 5개
                                    - 데드락 방지 전략 부록


================================================================================
                              END OF DOCUMENT
================================================================================