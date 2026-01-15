# WOORIDO ERD - 구현 패턴
**트랜잭션 전략, MyBatis, Spring Boot 서비스 패턴**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 📖 기준 문서: [DB_Schema_1.0.0.md](../DB_Schema_1.0.0.md)

---

## 1. 트랜잭션 오류 해결 전략

### 1.1 Race Condition (경쟁 조건)

**문제:** 여러 유저가 동시에 챌린지 가입 시 `current_members` 카운트 오류

**해결:** Optimistic Locking + Version Column

```sql
ALTER TABLE challenges ADD version NUMBER(19) DEFAULT 0 NOT NULL;
```

```xml
<!-- MyBatis Mapper -->
<update id="incrementMembers">
  UPDATE challenges
  SET current_members = current_members + 1,
      version = version + 1
  WHERE id = #{challengeId}
    AND version = #{version}
    AND current_members < max_members
</update>
```

```java
@Service
@Transactional
public class ChallengeService {

    @Retryable(
        value = {OptimisticLockException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100)
    )
    public void joinChallenge(String userId, String challengeId) {
        Challenge challenge = challengeMapper.selectByIdWithVersion(challengeId);

        int updated = challengeMapper.incrementMembers(challengeId, challenge.getVersion());
        if (updated == 0) {
            throw new OptimisticLockException("동시 가입 발생");
        }

        challengeMemberMapper.insert(new ChallengeMember(challengeId, userId));
    }
}
```

---

### 1.2 Lost Update (갱신 손실)

**문제:** 동시 충전/출금으로 인한 잔액 불일치

**해결:** Pessimistic Locking (SELECT FOR UPDATE) + 트랜잭션 로그

```xml
<!-- MyBatis Mapper -->
<select id="selectAccountForUpdate" resultType="Account">
  SELECT * FROM accounts
  WHERE id = #{accountId}
  FOR UPDATE WAIT 3  <!-- 3초 대기 후 실패 -->
</select>
```

```java
@Transactional(isolation = Isolation.READ_COMMITTED)
public void charge(String accountId, long amount, String idempotencyKey) {
    // 1. 중복 요청 검증
    if (accountTransactionMapper.existsByIdempotencyKey(idempotencyKey)) {
        throw new DuplicateTransactionException();
    }

    // 2. Pessimistic Lock
    Account account = accountMapper.selectAccountForUpdate(accountId);

    long balanceBefore = account.getBalance();
    long balanceAfter = balanceBefore + amount;

    // 3. 잔액 업데이트
    accountMapper.updateBalance(accountId, balanceAfter);

    // 4. 트랜잭션 로그 저장
    accountTransactionMapper.insert(AccountTransaction.builder()
        .accountId(accountId)
        .type("CHARGE")
        .amount(amount)
        .balanceBefore(balanceBefore)
        .balanceAfter(balanceAfter)
        .idempotencyKey(idempotencyKey)
        .build());
}
```

---

### 1.3 Atomicity Violation (원자성 위반)

**문제:** 투표 승인 후 장부 기록 실패 시 불일치

**해결:** Single Transaction + 롤백 보장

```java
@Transactional(rollbackFor = Exception.class)
public void approveVote(String voteId) {
    Vote vote = voteMapper.selectById(voteId);

    // 1. 투표 상태 변경
    vote.setStatus("APPROVED");
    vote.setApprovedAt(LocalDateTime.now());
    voteMapper.update(vote);

    // 2. 장부 기록 생성
    LedgerEntry ledger = LedgerEntry.builder()
        .challengeId(vote.getChallengeId())
        .amount(vote.getAmount())
        .description(vote.getDescription())
        .type("EXPENSE")
        .createdBy(vote.getCreatedBy())
        .build();

    UUID ledgerId = ledgerEntryMapper.insert(ledger);

    // 3. 투표-장부 연결
    vote.setLedgerEntryId(ledgerId);
    vote.setLedgerStatus("RECORDED");
    voteMapper.update(vote);

    // 4. 챌린지 잔액 차감 (Pessimistic Lock)
    Challenge challenge = challengeMapper.selectByIdForUpdate(vote.getChallengeId());
    challengeMapper.updateBalance(challenge.getId(), challenge.getBalance() - vote.getAmount());
}
```

---

### 1.4 Denormalized Counter Drift (비정규화 카운터 오류)

**문제:** `like_count`, `comment_count` 실제값과 불일치

**해결:** Atomic Operations + Scheduled Reconciliation

```xml
<!-- Atomic Increment -->
<update id="incrementLikeCount">
  UPDATE posts
  SET like_count = like_count + 1
  WHERE id = #{postId}
</update>

<update id="decrementLikeCount">
  UPDATE posts
  SET like_count = GREATEST(like_count - 1, 0)
  WHERE id = #{postId}
</update>
```

```java
// Scheduled Job - 매일 새벽 3시 정합성 검증
@Scheduled(cron = "0 0 3 * * *")
public void reconcileCounts() {
    jdbcTemplate.execute("""
        UPDATE posts p
        SET like_count = (
            SELECT COUNT(*) FROM post_likes pl
            WHERE pl.post_id = p.id
        )
        WHERE like_count != (
            SELECT COUNT(*) FROM post_likes pl
            WHERE pl.post_id = p.id
        )
    """);
}
```

---

### 1.5 Missing CASCADE Policies

**해결:** 명시적 CASCADE 정의

```sql
-- 챌린지 삭제 시 연관 데이터 처리
CREATE TABLE challenge_members (
  ...
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE ledger_entries (
  ...
  challenge_id VARCHAR2(36) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE
);

-- 유저 삭제 시 연관 데이터 처리
CREATE TABLE posts (
  ...
  created_by VARCHAR2(36) NOT NULL REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 2. MyBatis 구현 예제

### 2.1 Optimistic Lock 패턴

```xml
<!-- ChallengeMapper.xml -->
<mapper namespace="com.woorido.mapper.ChallengeMapper">

  <!-- Version과 함께 조회 -->
  <select id="selectByIdWithVersion" resultType="Challenge">
    SELECT id, name, current_members, max_members, version, balance
    FROM challenges
    WHERE id = #{id}
      AND deleted_at IS NULL
  </select>

  <!-- Version 검증하며 회원 수 증가 -->
  <update id="incrementMembers">
    UPDATE challenges
    SET current_members = current_members + 1,
        version = version + 1,
        updated_at = SYSTIMESTAMP
    WHERE id = #{challengeId}
      AND version = #{version}
      AND current_members < max_members
      AND deleted_at IS NULL
  </update>

  <!-- 실패 시 affected rows = 0 -->

</mapper>
```

```java
@Mapper
public interface ChallengeMapper {
    Challenge selectByIdWithVersion(@Param("id") String id);
    int incrementMembers(@Param("challengeId") String challengeId, @Param("version") Long version);
}
```

### 2.2 Pessimistic Lock 패턴

```xml
<!-- AccountMapper.xml -->
<mapper namespace="com.woorido.mapper.AccountMapper">

  <!-- FOR UPDATE로 Row Lock 획득 -->
  <select id="selectAccountForUpdate" resultType="Account">
    SELECT id, user_id, balance, locked_balance, version
    FROM accounts
    WHERE id = #{accountId}
    FOR UPDATE WAIT 3  <!-- 3초 대기 후 ORA-00054 발생 -->
  </select>

  <!-- 잔액 업데이트 -->
  <update id="updateBalance">
    UPDATE accounts
    SET balance = #{newBalance},
        version = version + 1,
        updated_at = SYSTIMESTAMP
    WHERE id = #{accountId}
  </update>

  <!-- 락 잔액 업데이트 -->
  <update id="updateLockedBalance">
    UPDATE accounts
    SET locked_balance = #{newLockedBalance},
        version = version + 1,
        updated_at = SYSTIMESTAMP
    WHERE id = #{accountId}
  </update>

</mapper>
```

### 2.3 Idempotency 검증

```xml
<!-- AccountTransactionMapper.xml -->
<mapper namespace="com.woorido.mapper.AccountTransactionMapper">

  <!-- 중복 요청 검사 -->
  <select id="existsByIdempotencyKey" resultType="boolean">
    SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
    FROM account_transactions
    WHERE idempotency_key = #{idempotencyKey}
  </select>

  <!-- 트랜잭션 기록 삽입 -->
  <insert id="insert">
    INSERT INTO account_transactions (
      id, account_id, type, amount,
      balance_before, balance_after,
      locked_before, locked_after,
      idempotency_key, description,
      payment_method, payment_gateway_tx_id,
      created_at
    ) VALUES (
      SYS_GUID(), #{accountId}, #{type}, #{amount},
      #{balanceBefore}, #{balanceAfter},
      #{lockedBefore}, #{lockedAfter},
      #{idempotencyKey}, #{description},
      #{paymentMethod}, #{paymentGatewayTxId},
      SYSTIMESTAMP
    )
  </insert>

</mapper>
```

### 2.4 Soft Delete 조회

```xml
<!-- ChallengeMapper.xml -->
<mapper namespace="com.woorido.mapper.ChallengeMapper">

  <!-- 활성 챌린지만 조회 -->
  <select id="selectActiveById" resultType="Challenge">
    SELECT * FROM challenges
    WHERE id = #{id}
      AND deleted_at IS NULL
  </select>

  <!-- 삭제된 챌린지 정보 조회 (404 응답용) -->
  <select id="selectDeletedInfo" resultType="DeletedChallengeInfo">
    SELECT id, name, deleted_at, dissolution_reason
    FROM challenges
    WHERE id = #{id}
      AND deleted_at IS NOT NULL
  </select>

  <!-- 내 챌린지 목록 (삭제 포함 옵션) -->
  <select id="selectMyChallengeList" resultType="Challenge">
    SELECT c.*
    FROM challenges c
    INNER JOIN challenge_members cm ON c.id = cm.challenge_id
    WHERE cm.user_id = #{userId}
      AND cm.left_at IS NULL
      <if test="includeDeleted == false">
        AND c.deleted_at IS NULL
      </if>
    ORDER BY c.created_at DESC
  </select>

  <!-- Soft Delete 실행 -->
  <update id="softDelete">
    UPDATE challenges
    SET deleted_at = SYSTIMESTAMP,
        dissolution_reason = #{reason},
        updated_at = SYSTIMESTAMP
    WHERE id = #{challengeId}
      AND deleted_at IS NULL
  </update>

</mapper>
```

---

## 3. Spring Boot 서비스 패턴

### 3.1 Optimistic Lock 재시도 패턴

```java
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;
    private final ChallengeMemberMapper challengeMemberMapper;
    private final AccountService accountService;

    @Transactional
    @Retryable(
        value = {OptimisticLockException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    public void joinChallenge(String userId, String challengeId) {
        // 1. Version과 함께 챌린지 조회
        Challenge challenge = challengeMapper.selectByIdWithVersion(challengeId);

        if (challenge == null) {
            throw new ChallengeNotFoundException("챌린지를 찾을 수 없습니다.");
        }

        // 2. 이미 가입했는지 확인
        if (challengeMemberMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new AlreadyJoinedException("이미 가입한 챌린지입니다.");
        }

        // 3. 보증금 차감 (Pessimistic Lock)
        accountService.lockDeposit(userId, challenge.getDepositAmount());

        // 4. 챌린지 회원 수 증가 (Optimistic Lock)
        int updated = challengeMapper.incrementMembers(challengeId, challenge.getVersion());

        if (updated == 0) {
            // Version 충돌 발생 → 재시도
            throw new OptimisticLockException("동시 가입이 발생했습니다. 재시도 중...");
        }

        // 5. 회원 추가
        ChallengeMember member = ChallengeMember.builder()
            .challengeId(challengeId)
            .userId(userId)
            .role("FOLLOWER")
            .depositStatus("LOCKED")
            .depositLockedAt(LocalDateTime.now())
            .build();

        challengeMemberMapper.insert(member);
    }
}
```

### 3.2 Atomic Counter 패턴

```java
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostMapper postMapper;
    private final PostLikeMapper postLikeMapper;

    @Transactional
    public void toggleLike(String postId, String userId) {
        // 1. 이미 좋아요 했는지 확인
        boolean alreadyLiked = postLikeMapper.existsByPostAndUser(postId, userId);

        if (alreadyLiked) {
            // 좋아요 취소
            postLikeMapper.delete(postId, userId);
            postMapper.decrementLikeCount(postId);  // Atomic -1
        } else {
            // 좋아요 추가
            postLikeMapper.insert(PostLike.builder()
                .postId(postId)
                .userId(userId)
                .build());
            postMapper.incrementLikeCount(postId);  // Atomic +1
        }
    }
}
```

### 3.3 Soft Delete 처리

```java
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;

    public ChallengeDetailResponse getChallengeDetail(String challengeId) {
        // 1. 활성 챌린지 조회
        Challenge challenge = challengeMapper.selectActiveById(challengeId);

        if (challenge != null) {
            return ChallengeDetailResponse.from(challenge);
        }

        // 2. 삭제된 챌린지인지 확인
        DeletedChallengeInfo deletedInfo = challengeMapper.selectDeletedInfo(challengeId);

        if (deletedInfo != null) {
            // HTTP 404 + 삭제 정보 반환
            throw new ChallengeDeletedException(
                "이 챌린지는 " + deletedInfo.getDeletedAt() + "에 해산되었습니다.",
                deletedInfo
            );
        }

        // 3. 존재하지 않는 챌린지
        throw new ChallengeNotFoundException("챌린지를 찾을 수 없습니다.");
    }
}

// Exception Handler
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ChallengeDeletedException.class)
    public ResponseEntity<ErrorResponse> handleChallengeDeleted(ChallengeDeletedException e) {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse.builder()
                .error("CHALLENGE_DELETED")
                .message(e.getMessage())
                .deletedAt(e.getDeletedInfo().getDeletedAt())
                .dissolutionReason(e.getDeletedInfo().getDissolutionReason())
                .build());
    }
}
```

---

## 4. Django 연동 (트랜잭션 없음)

### 4.1 Spring Boot → Django 데이터 전송

```java
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RestTemplate restTemplate;
    private final ChallengeMapper challengeMapper;
    private final UserMapper userMapper;

    public List<String> getRecommendedChallenge(String userId) {
        // 1. Spring Boot가 Oracle DB에서 데이터 조회
        User user = userMapper.selectById(userId);
        List<Challenge> userHistory = challengeMapper.selectUserHistory(userId);

        // 2. Django로 전송할 JSON 생성
        Map<String, Object> requestData = Map.of(
            "user_id", userId,
            "user_history", userHistory.stream()
                .map(challenge -> Map.of(
                    "challenge_id", challenge.getId(),
                    "category", challenge.getCategory(),
                    "monthly_fee", challenge.getMonthlyFee()
                ))
                .collect(Collectors.toList())
        );

        // 3. Django API 호출 (HTTP POST)
        RecommendationResponse response = restTemplate.postForObject(
            "http://django-service:8001/api/recommend",
            requestData,
            RecommendationResponse.class
        );

        // 4. Django 분석 결과 반환
        return response.getRecommendedChallengeIds();
    }
}
```

### 4.2 Django 서비스 (DB 연결 없음)

```python
# Django views.py (DB 연결 없음)
from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np

@api_view(['POST'])
def recommend_challenge(request):
    """
    챌린지 추천 알고리즘 (DB 연결 없음)
    Spring Boot가 보낸 JSON 데이터만 처리
    """
    user_data = request.data

    # pandas DataFrame 생성
    df = pd.DataFrame(user_data['user_history'])

    # 협업 필터링 알고리즘 실행
    recommendations = collaborative_filtering(df)

    # Spring Boot로 결과 반환
    return Response({
        'recommended_challenge_ids': recommendations.tolist(),
        'confidence_score': 0.85
    })

@api_view(['POST'])
def detect_anomaly(request):
    """
    이상 거래 탐지 (통계 분석만)
    """
    transactions = pd.DataFrame(request.data['transactions'])

    # Z-Score 기반 이상치 탐지
    mean = transactions['amount'].mean()
    std = transactions['amount'].std()
    transactions['z_score'] = (transactions['amount'] - mean) / std

    anomalies = transactions[transactions['z_score'].abs() > 3]

    return Response({
        'anomaly_count': len(anomalies),
        'anomaly_ids': anomalies['id'].tolist(),
        'risk_level': 'HIGH' if len(anomalies) > 5 else 'LOW'
    })
```

---

**최종 수정**: 2026-01-13
**기준 문서**: DB_Schema_1.0.0.md

