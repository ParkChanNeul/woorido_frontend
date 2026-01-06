# 정책 변경 영향도 분석 보고서

**작성일**: 2026-01-06
**대상**: 투표 및 가입 정책 변경
**버전**: v1.0
**검증 기준**: 회의록 (2026-01-06) 기반 유스케이스 개선사항

---

## 📋 Executive Summary

### 회의록 요구사항 (3가지)

| 번호 | 요구사항 | 우선순위 | 영향도 |
|------|---------|---------|--------|
| 1 | 모임을 개최하기 위한 투표 추가 | P1 (필수) | 🔴 HIGH |
| 2 | 결제 투표는 모임 참가자만 투표 가능 | P2 (권장) | 🟡 MEDIUM |
| 3 | 신규 가입자 비용 계산 로직 | P1 (필수) | 🔴 HIGH |

### 전체 영향 범위

| 레이어 | 변경 필요 파일 수 | 영향도 |
|--------|----------------|--------|
| **ERD** | 3개 테이블 (MEETINGS 신규, VOTES 수정, GYE_MEMBERS 수정) | 🔴 HIGH |
| **Spring Boot Service** | 5개 파일 | 🔴 HIGH |
| **MyBatis Mapper** | 4개 파일 | 🟡 MEDIUM |
| **API 엔드포인트** | 6개 추가/수정 | 🔴 HIGH |
| **Frontend** | 8개 화면/컴포넌트 | 🟡 MEDIUM |

---

## 1. 모임 개최 투표 추가 (Priority 1)

### 1.1 문제 정의

**회의록 내용:**
> "모임을 개최하기 위한 투표도 있어야할 것 같다. (유스케이스에 내용이 빠져있는 듯 함)"

**해석:**
- 현재: 계모임(GYE)만 존재, 실제 오프라인 모임 이벤트 관리 없음
- 필요: 특정 날짜/장소의 오프라인 모임을 만들기 위한 투표
- 예시: "2월 10일 강남역 모임 개최" 투표 → 승인 시 MEETING 생성

**현재 투표 타입:**
- EXPENSE (지출 요청)
- KICK (회원 강퇴)
- RULE_CHANGE (규칙 변경)

**추가 필요:**
- **MEETING_CREATE** (모임 개최 투표)

### 1.2 ERD 변경사항

#### 1.2.1 새로운 테이블: MEETINGS

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  gye_id UUID NOT NULL REFERENCES gye(id) ON DELETE CASCADE,

  -- 모임 정보
  title VARCHAR(200) NOT NULL,
  description VARCHAR(2000),
  meeting_date TIMESTAMP NOT NULL,
  location VARCHAR(500),
  max_attendees NUMBER,  -- NULL이면 무제한

  -- 비용 정보
  venue_cost BIGINT DEFAULT 0,  -- 장소 대관료
  meal_cost BIGINT DEFAULT 0,   -- 식사비
  total_cost BIGINT DEFAULT 0,  -- 총 예상 비용

  -- 승인 정보
  created_by UUID NOT NULL REFERENCES users(id),
  vote_id UUID REFERENCES votes(id),  -- 연결된 투표 ID
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')),

  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  -- 제약조건
  CONSTRAINT chk_meeting_date CHECK (meeting_date > created_at)
);

CREATE INDEX idx_meetings_gye_date ON meetings(gye_id, meeting_date DESC);
CREATE INDEX idx_meetings_vote ON meetings(vote_id);
CREATE INDEX idx_meetings_status ON meetings(status, meeting_date);
```

#### 1.2.2 참석자 관리: MEETING_ATTENDEES

```sql
CREATE TABLE meeting_attendees (
  id UUID PRIMARY KEY DEFAULT SYS_GUID(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- 참석 상태
  status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'ATTENDED')),

  -- 타임스탬프
  registered_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

  CONSTRAINT uk_meeting_user UNIQUE (meeting_id, user_id)
);

CREATE INDEX idx_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX idx_attendees_user ON meeting_attendees(user_id, registered_at DESC);
```

#### 1.2.3 VOTES 테이블 수정

```sql
-- 기존 컬럼
ALTER TABLE votes ADD meeting_title VARCHAR(200);      -- MEETING_CREATE인 경우
ALTER TABLE votes ADD meeting_date TIMESTAMP;           -- MEETING_CREATE인 경우
ALTER TABLE votes ADD meeting_location VARCHAR(500);    -- MEETING_CREATE인 경우
ALTER TABLE votes ADD meeting_cost BIGINT;              -- MEETING_CREATE인 경우

-- CHECK 제약조건 추가
ALTER TABLE votes ADD CONSTRAINT chk_vote_meeting CHECK (
  (type = 'MEETING_CREATE' AND meeting_title IS NOT NULL AND meeting_date IS NOT NULL) OR
  (type != 'MEETING_CREATE' AND meeting_title IS NULL)
);

-- type Enum 업데이트
-- 기존: EXPENSE, KICK, RULE_CHANGE
-- 추가: MEETING_CREATE
```

### 1.3 Spring Boot 변경사항

#### 1.3.1 VoteType Enum 업데이트

**파일**: `com.woorido.domain.vote.VoteType.java`

```java
@Getter
@RequiredArgsConstructor
public enum VoteType {
    EXPENSE("지출 요청", true, false, false),
    KICK("회원 강퇴", false, true, false),
    RULE_CHANGE("규칙 변경", false, false, false),
    MEETING_CREATE("모임 개최", false, false, true);  // ⭐ 추가

    private final String description;
    private final boolean requiresAmount;
    private final boolean requiresTargetUser;
    private final boolean requiresMeetingInfo;  // ⭐ 추가

    public void validate(Long amount, String targetUserId, MeetingInfo meetingInfo) {
        // ... 기존 검증 로직

        if (requiresMeetingInfo && meetingInfo == null) {
            throw new IllegalArgumentException(
                this.name() + " 타입은 모임 정보가 필수입니다."
            );
        }
    }
}
```

#### 1.3.2 새로운 도메인: Meeting

**파일**: `com.woorido.domain.meeting.Meeting.java`

```java
package com.woorido.domain.meeting;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class Meeting {
    private String id;
    private String gyeId;

    // 모임 정보
    private String title;
    private String description;
    private LocalDateTime meetingDate;
    private String location;
    private Integer maxAttendees;

    // 비용
    private Long venueCost;
    private Long mealCost;
    private Long totalCost;

    // 승인 정보
    private String createdBy;
    private String voteId;
    private String status;  // PENDING, CONFIRMED, CANCELLED, COMPLETED

    // 타임스탬프
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 추가 정보 (조회 시)
    private Integer currentAttendees;
    private Boolean isAttending;  // 현재 유저 참석 여부
}
```

#### 1.3.3 새로운 전략: MeetingCreateVoteStrategy

**파일**: `com.woorido.service.vote.strategy.MeetingCreateVoteStrategy.java`

```java
package com.woorido.service.vote.strategy;

import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteType;
import com.woorido.domain.meeting.Meeting;
import com.woorido.mapper.MeetingMapper;
import com.woorido.mapper.VoteMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class MeetingCreateVoteStrategy implements VoteApprovalStrategy {

    private final MeetingMapper meetingMapper;
    private final VoteMapper voteMapper;

    @Override
    public boolean supports(Vote vote) {
        return vote.getType() == VoteType.MEETING_CREATE;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void execute(Vote vote) {
        log.info("모임 개최 투표 승인 처리 시작: voteId={}, meetingTitle={}",
            vote.getId(), vote.getMeetingTitle());

        // 1. Meeting 엔티티 생성
        Meeting meeting = Meeting.builder()
            .gyeId(vote.getGyeId())
            .title(vote.getMeetingTitle())
            .description(vote.getDescription())
            .meetingDate(vote.getMeetingDate())
            .location(vote.getMeetingLocation())
            .totalCost(vote.getMeetingCost())
            .createdBy(vote.getCreatedBy())
            .voteId(vote.getId())
            .status("CONFIRMED")
            .build();

        // 2. Meeting 생성
        meetingMapper.insert(meeting);

        // 3. 투표 발의자를 자동 참석자로 등록
        meetingMapper.insertAttendee(meeting.getId(), vote.getCreatedBy());

        log.info("모임 개최 투표 승인 완료: voteId={}, meetingId={}",
            vote.getId(), meeting.getId());
    }
}
```

#### 1.3.4 MeetingService 추가

**파일**: `com.woorido.service.meeting.MeetingService.java`

```java
package com.woorido.service.meeting;

import com.woorido.domain.meeting.Meeting;
import com.woorido.mapper.MeetingMapper;
import com.woorido.mapper.GyeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingMapper meetingMapper;
    private final GyeMapper gyeMapper;

    /**
     * 모임 목록 조회
     */
    public List<Meeting> getMeetingsByGye(String gyeId, String userId) {
        // 모임 회원인지 확인
        boolean isMember = gyeMapper.isMember(gyeId, userId);
        if (!isMember) {
            throw new UnauthorizedException("모임 회원만 조회할 수 있습니다.");
        }

        return meetingMapper.selectByGyeId(gyeId, userId);
    }

    /**
     * 모임 참석 신청
     */
    @Transactional
    public void attendMeeting(String meetingId, String userId) {
        Meeting meeting = meetingMapper.selectById(meetingId);

        if (meeting == null) {
            throw new MeetingNotFoundException("모임을 찾을 수 없습니다.");
        }

        // 정원 확인
        if (meeting.getMaxAttendees() != null) {
            int currentCount = meetingMapper.countAttendees(meetingId);
            if (currentCount >= meeting.getMaxAttendees()) {
                throw new MeetingFullException("참석 인원이 마감되었습니다.");
            }
        }

        // 중복 참석 확인
        boolean alreadyAttending = meetingMapper.isAttending(meetingId, userId);
        if (alreadyAttending) {
            throw new AlreadyAttendingException("이미 참석 신청하셨습니다.");
        }

        // 참석자 등록
        meetingMapper.insertAttendee(meetingId, userId);

        log.info("모임 참석 신청 완료: meetingId={}, userId={}", meetingId, userId);
    }

    /**
     * 모임 참석 취소
     */
    @Transactional
    public void cancelAttendance(String meetingId, String userId) {
        meetingMapper.deleteAttendee(meetingId, userId);
        log.info("모임 참석 취소: meetingId={}, userId={}", meetingId, userId);
    }
}
```

### 1.4 API 엔드포인트 추가

#### 1.4.1 모임 개최 투표 생성

```
POST /api/groups/:groupId/votes

Request Body:
{
  "type": "MEETING_CREATE",
  "title": "2월 독서 모임 개최 투표",
  "description": "2월 10일 강남역 근처에서 모임을 가지려고 합니다.",
  "meetingTitle": "2월 독서 모임",
  "meetingDate": "2026-02-10T14:00:00Z",
  "meetingLocation": "강남역 스터디카페 A",
  "meetingCost": 50000
}

Response:
{
  "voteId": "vote-uuid-123",
  "expiresAt": "2026-01-09T14:00:00Z"
}
```

#### 1.4.2 모임 목록 조회

```
GET /api/groups/:groupId/meetings?status=CONFIRMED

Response:
{
  "meetings": [
    {
      "id": "meeting-uuid-123",
      "title": "2월 독서 모임",
      "description": "...",
      "meetingDate": "2026-02-10T14:00:00Z",
      "location": "강남역 스터디카페 A",
      "totalCost": 50000,
      "maxAttendees": 10,
      "currentAttendees": 5,
      "isAttending": true,
      "status": "CONFIRMED",
      "createdBy": "user-123"
    }
  ]
}
```

#### 1.4.3 모임 참석 신청

```
POST /api/meetings/:meetingId/attend

Response:
{
  "success": true,
  "currentAttendees": 6
}
```

### 1.5 Frontend 변경사항

#### 1.5.1 새로운 화면

| 화면 | Route | 설명 |
|------|-------|------|
| 모임 일정 탭 | `/groups/:id/meetings` | 모임 상세 내 새 탭 |
| 모임 개최 투표 생성 | `/groups/:id/votes/create-meeting` | Modal/Page |
| 모임 상세 | `/meetings/:id` | 참석자 목록, 참석 신청 버튼 |

#### 1.5.2 컴포넌트 추가

- `<MeetingCard />`: 모임 카드 컴포넌트
- `<AttendButton />`: 참석/취소 버튼
- `<CreateMeetingVoteForm />`: 모임 개최 투표 폼

### 1.6 영향도 요약

| 항목 | 변경 | 난이도 | 예상 시간 |
|------|------|--------|----------|
| **ERD** | MEETINGS, MEETING_ATTENDEES 추가 | 🔴 HIGH | 2일 |
| **Backend** | 4개 클래스 추가 | 🔴 HIGH | 3일 |
| **API** | 6개 엔드포인트 추가 | 🟡 MEDIUM | 2일 |
| **Frontend** | 3개 화면, 3개 컴포넌트 | 🟡 MEDIUM | 3일 |
| **테스트** | 통합 테스트 추가 | 🟡 MEDIUM | 2일 |
| **총 예상 시간** | - | - | **12일** |

---

## 2. 결제 투표 참가자 제한 (Priority 2)

### 2.1 문제 정의

**회의록 내용:**
> "결제 투표는 모임에 참가하는 사람만 투표할 수 있도록 해야한다. (ERD에 반영이 안되어 있는 느낌)"

**해석:**
현재 코드 (`VoteService.java:395-398`):
```java
// 모임 회원 확인
boolean isMember = gyeMapper.isMember(vote.getGyeId(), userId);
if (!isMember) {
    throw new UnauthorizedException("모임 회원만 투표할 수 있습니다.");
}
```

**두 가지 해석 가능:**

#### 해석 A: GYE_MEMBERS active 회원만 투표 가능 (현재 구현됨)
- 현재 구현: `isMember()` → `WHERE left_at IS NULL`
- ✅ 이미 구현되어 있음

#### 해석 B: 특정 MEETING 참석자만 투표 가능 (신규)
- 현재 구현: 없음
- 예시: "2월 모임 식사비" 투표 → 2월 모임 참석자만 투표 가능

### 2.2 권장 해석: **해석 A (현재 구현 유지)**

**근거:**
1. 회의록 문맥상 "결제 투표"는 EXPENSE 투표를 의미
2. EXPENSE는 모임 금고에서 차감 → 모든 회원이 영향을 받음
3. 특정 MEETING 참석자만 투표하면 불공평
4. 현재 ERD에서 이미 `GYE_MEMBERS.left_at`으로 active 회원 판별 가능

**만약 해석 B가 필요하다면:**
- VOTES에 `related_meeting_id` 컬럼 추가
- VoteService에서 MEETING_ATTENDEES 확인 로직 추가

### 2.3 현재 구현 검증

**ERD 확인:**
```sql
-- GYE_MEMBERS 테이블
CREATE TABLE gye_members (
  ...
  joined_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  left_at TIMESTAMP,  -- ⭐ NULL이면 active
  ...
);

CREATE INDEX idx_members_active ON gye_members(gye_id) WHERE left_at IS NULL;
```

**Service 로직 확인:**
```java
// GyeMapper.java
boolean isMember(String gyeId, String userId) {
    return gyeMemberMapper.countByGyeAndUser(gyeId, userId) > 0;
}

// MyBatis Mapper
<select id="countByGyeAndUser" resultType="int">
  SELECT COUNT(*)
  FROM gye_members
  WHERE gye_id = #{gyeId}
    AND user_id = #{userId}
    AND left_at IS NULL  -- ⭐ active 회원만
</select>
```

### 2.4 결론

**✅ 추가 작업 불필요**
- 현재 구현이 이미 요구사항을 만족함
- ERD에 `left_at` 컬럼으로 active 회원 판별 가능
- Service 로직에서 active 회원만 투표 가능하도록 구현됨

**만약 해석 B (MEETING 참석자 제한)가 필요하다면:**
| 항목 | 변경 | 난이도 |
|------|------|--------|
| ERD | VOTES.related_meeting_id 추가 | 🟢 LOW |
| Service | VoteService 검증 로직 추가 | 🟡 MEDIUM |
| 예상 시간 | - | **1일** |

---

## 3. 신규 가입자 비용 계산 (Priority 1)

### 3.1 문제 정의

**회의록 내용:**
> "신규 가입자에 대한 로직이 필요하다. 얼마나 내고 들어올거냐, 회의 내용: 모임 잔액 / 계주를 뺀 인원수
> ex) 잔액 300만원 / 계 총 인원 9명
> 신규 인원 가입 시 300만원 / 8 의 비용을 내고 들어와야한다."

**현재 구현:**
```java
// GyeService.java - joinGye()
public void joinGye(String userId, String gyeId) {
    Gye gye = gyeMapper.selectByIdWithVersion(gyeId);

    // 보증금 차감 (Pessimistic Lock)
    accountService.lockDeposit(userId, gye.getDepositAmount());  // ⭐ 보증금만

    // 모임 회원 수 증가
    gyeMapper.incrementMembers(gyeId, gye.getVersion());

    // 회원 추가
    gyeMemberMapper.insert(new GyeMember(gyeId, userId));
}
```

**문제:**
- 현재: 보증금(`depositAmount`)만 납부
- 필요: 보증금 + **입회비** (기존 멤버가 쌓아놓은 자산의 일부)

### 3.2 비즈니스 로직

**입회비 계산 공식:**
```
입회비 = 모임 잔액 / (현재 인원 - 1)
```

**예시:**
- 모임 잔액: 3,000,000원
- 현재 인원: 9명 (계주 포함)
- 입회비: 3,000,000 / (9 - 1) = 375,000원

**신규 가입자 총 납부액:**
```
총 납부액 = 보증금 + 입회비
          = depositAmount + (balance / (current_members - 1))
```

**예시 (책벌레들 가입):**
- 보증금: 100,000원
- 입회비: 375,000원
- **총 납부액: 475,000원**

**납부 후 잔액 변화:**
```
[신규 가입자 어카운트]
가용 잔액: 500,000 → 25,000 (475,000 차감)
락 잔액: 0 → 100,000 (보증금 락)

[모임 금고]
잔액: 3,000,000 → 3,375,000 (입회비 375,000 입금)
```

### 3.3 ERD 변경사항

#### 3.3.1 GYE_MEMBERS 테이블 수정

```sql
ALTER TABLE gye_members ADD entry_fee_paid BIGINT DEFAULT 0;  -- 입회비
ALTER TABLE gye_members ADD entry_fee_paid_at TIMESTAMP;      -- 입회비 납부일

-- 기존 컬럼:
-- deposit_paid, deposit_paid_at, deposit_locked_at (보증금)
```

#### 3.3.2 LEDGER_ENTRIES 기록

입회비는 장부에 기록:
```sql
INSERT INTO ledger_entries (
  gye_id,
  type,
  amount,
  description,
  created_by
) VALUES (
  'gye-123',
  'ENTRY_FEE',  -- ⭐ 새로운 타입
  375000,
  '신규 회원 이영희 입회비',
  'user-456'
);
```

**LEDGER_ENTRIES.type 업데이트:**
```sql
-- 기존: INCOME, EXPENSE, FEE_COLLECTION, DEPOSIT_LOCK, DEPOSIT_UNLOCK
-- 추가: ENTRY_FEE (입회비)

ALTER TABLE ledger_entries MODIFY type VARCHAR(20) CHECK (
  type IN ('INCOME', 'EXPENSE', 'FEE_COLLECTION', 'DEPOSIT_LOCK', 'DEPOSIT_UNLOCK', 'ENTRY_FEE')
);
```

### 3.4 Spring Boot 변경사항

#### 3.4.1 GyeService.joinGye() 수정

**파일**: `com.woorido.service.gye.GyeService.java`

```java
@Transactional
@Retryable(
    value = {OptimisticLockException.class},
    maxAttempts = 3,
    backoff = @Backoff(delay = 100, multiplier = 2)
)
public JoinGyeResponse joinGye(String userId, String gyeId) {
    // 1. Version과 함께 모임 조회
    Gye gye = gyeMapper.selectByIdWithVersion(gyeId);

    if (gye == null) {
        throw new GyeNotFoundException("모임을 찾을 수 없습니다.");
    }

    // 2. 이미 가입했는지 확인
    if (gyeMemberMapper.existsByGyeAndUser(gyeId, userId)) {
        throw new AlreadyJoinedException("이미 가입한 모임입니다.");
    }

    // 3. ⭐ 입회비 계산
    long entryFee = calculateEntryFee(gye);

    // 4. ⭐ 총 납부액 = 보증금 + 입회비
    long totalPayment = gye.getDepositAmount() + entryFee;

    // 5. ⭐ 잔액 확인
    Account account = accountService.getAccount(userId);
    if (account.getBalance() < totalPayment) {
        throw new InsufficientBalanceException(
            String.format("잔액이 부족합니다. 필요: %d원, 현재: %d원", totalPayment, account.getBalance())
        );
    }

    // 6. ⭐ 보증금 락 (기존 로직)
    accountService.lockDeposit(userId, gye.getDepositAmount());

    // 7. ⭐ 입회비 납부 (새 로직)
    if (entryFee > 0) {
        accountService.payEntryFee(userId, gyeId, entryFee);
    }

    // 8. 모임 회원 수 증가 (Optimistic Lock)
    int updated = gyeMapper.incrementMembers(gyeId, gye.getVersion());

    if (updated == 0) {
        // Version 충돌 발생 → 재시도
        throw new OptimisticLockException("동시 가입이 발생했습니다. 재시도 중...");
    }

    // 9. 회원 추가
    GyeMember member = GyeMember.builder()
        .gyeId(gyeId)
        .userId(userId)
        .role("MEMBER")
        .depositPaid(true)
        .depositPaidAt(LocalDateTime.now())
        .entryFeePaid(entryFee)  // ⭐ 추가
        .entryFeePaidAt(entryFee > 0 ? LocalDateTime.now() : null)  // ⭐ 추가
        .build();

    gyeMemberMapper.insert(member);

    return JoinGyeResponse.builder()
        .membershipId(member.getId())
        .depositAmount(gye.getDepositAmount())
        .entryFee(entryFee)  // ⭐ 추가
        .totalPaid(totalPayment)  // ⭐ 추가
        .joinedAt(member.getJoinedAt())
        .build();
}

/**
 * ⭐ 입회비 계산
 * 공식: 모임 잔액 / (현재 인원 - 1)
 */
private long calculateEntryFee(Gye gye) {
    // 신규 가입자가 첫 번째 회원인 경우 (계주만 있음)
    if (gye.getCurrentMembers() <= 1) {
        return 0;  // 입회비 없음
    }

    // 현재 멤버 수 - 1 (계주 제외)
    int divisor = gye.getCurrentMembers() - 1;

    // 입회비 = 잔액 / (인원 - 1)
    long entryFee = gye.getBalance() / divisor;

    log.info("입회비 계산: 잔액={}, 인원={}, 입회비={}",
        gye.getBalance(), gye.getCurrentMembers(), entryFee);

    return entryFee;
}
```

#### 3.4.2 AccountService.payEntryFee() 추가

**파일**: `com.woorido.service.account.AccountService.java`

```java
/**
 * ⭐ 입회비 납부
 * - 유저 잔액 차감
 * - 모임 잔액 증가
 * - 장부 기록
 */
@Transactional(isolation = Isolation.READ_COMMITTED)
public void payEntryFee(String userId, String gyeId, long entryFee) {
    // 1. Pessimistic Lock으로 계좌 조회
    Account account = accountMapper.selectByUserIdForUpdate(userId);

    if (account == null) {
        throw new AccountNotFoundException("계좌를 찾을 수 없습니다.");
    }

    // 2. 잔액 확인
    if (account.getBalance() < entryFee) {
        throw new InsufficientBalanceException("입회비 납부를 위한 잔액이 부족합니다.");
    }

    // 3. 유저 잔액 차감
    long newBalance = account.getBalance() - entryFee;
    accountMapper.updateBalance(account.getId(), newBalance);

    // 4. 트랜잭션 기록
    accountTransactionMapper.insert(AccountTransaction.builder()
        .accountId(account.getId())
        .type("ENTRY_FEE_PAYMENT")
        .amount(entryFee)
        .balanceBefore(account.getBalance())
        .balanceAfter(newBalance)
        .lockedBefore(account.getLockedBalance())
        .lockedAfter(account.getLockedBalance())
        .relatedGyeId(gyeId)
        .description("입회비 납부")
        .build());

    // 5. 모임 잔액 증가
    Gye gye = gyeMapper.selectByIdForUpdate(gyeId);
    long newGyeBalance = gye.getBalance() + entryFee;
    gyeMapper.updateBalance(gyeId, newGyeBalance);

    // 6. 장부 기록
    ledgerEntryMapper.insert(LedgerEntry.builder()
        .gyeId(gyeId)
        .type("ENTRY_FEE")
        .amount(entryFee)
        .description("신규 회원 입회비")
        .createdBy(userId)
        .build());

    log.info("입회비 납부 완료: userId={}, gyeId={}, entryFee={}", userId, gyeId, entryFee);
}
```

### 3.5 API 변경사항

#### 3.5.1 모임 가입 API 응답 변경

**기존 응답:**
```json
POST /api/groups/:id/join

Response:
{
  "membershipId": "member-uuid-123",
  "lockedAmount": 100000,
  "joinedAt": "2026-01-06T10:00:00Z"
}
```

**변경 후 응답:**
```json
POST /api/groups/:id/join

Response:
{
  "membershipId": "member-uuid-123",
  "depositAmount": 100000,        // ⭐ 보증금
  "entryFee": 375000,             // ⭐ 입회비
  "totalPaid": 475000,            // ⭐ 총 납부액
  "joinedAt": "2026-01-06T10:00:00Z"
}
```

#### 3.5.2 모임 상세 API 응답 변경

**추가 필드:**
```json
GET /api/groups/:id

Response:
{
  ...
  "depositAmount": 100000,
  "currentBalance": 3000000,
  "currentMembers": 9,
  "requiredEntryFee": 375000,     // ⭐ 신규 가입자 입회비
  "totalJoinCost": 475000,        // ⭐ 신규 가입자 총 비용
  ...
}
```

### 3.6 Frontend 변경사항

#### 3.6.1 가입 확인 모달 수정

**기존:**
```tsx
<Modal>
  <p>보증금: 100,000원</p>
  <p>총 결제 금액: 100,000원</p>
  <Button>가입하기</Button>
</Modal>
```

**변경 후:**
```tsx
<Modal>
  <p>보증금: 100,000원 (1개월분)</p>
  <p>입회비: 375,000원 (기존 멤버 자산 분담금)</p>
  <Divider />
  <p className="font-bold">총 결제 금액: 475,000원</p>

  <InfoBox>
    💡 입회비는 모임 금고에 입금되며, 탈퇴 시 반환되지 않습니다.
    보증금은 완주 시 전액 반환됩니다.
  </InfoBox>

  <Button>475,000원 결제하고 가입하기</Button>
</Modal>
```

### 3.7 영향도 요약

| 항목 | 변경 | 난이도 | 예상 시간 |
|------|------|--------|----------|
| **ERD** | GYE_MEMBERS 컬럼 추가, LEDGER_ENTRIES 타입 추가 | 🟡 MEDIUM | 1일 |
| **Backend** | GyeService, AccountService 수정 | 🔴 HIGH | 3일 |
| **API** | 2개 응답 스키마 변경 | 🟢 LOW | 0.5일 |
| **Frontend** | 가입 플로우 UI 수정 | 🟡 MEDIUM | 2일 |
| **테스트** | 비즈니스 로직 테스트 | 🟡 MEDIUM | 1.5일 |
| **총 예상 시간** | - | - | **8일** |

---

## 4. 통합 영향도 및 권장 일정

### 4.1 우선순위 매트릭스

| 정책 | 비즈니스 가치 | 기술 복잡도 | 권장 순서 |
|------|-------------|-----------|----------|
| **신규 가입자 비용** | 🔴 CRITICAL | 🟡 MEDIUM | **1순위** |
| **모임 개최 투표** | 🔴 HIGH | 🔴 HIGH | **2순위** |
| **투표 참가자 제한** | 🟢 LOW | 🟢 LOW | **3순위 (선택)** |

### 4.2 개발 일정 (순차 개발)

```
Week 1-2: 신규 가입자 비용 계산 (8일)
  ├─ Day 1: ERD 설계 및 적용
  ├─ Day 2-4: Backend 구현
  ├─ Day 5-6: Frontend 구현
  ├─ Day 7-8: 테스트 및 버그 수정

Week 3-4: 모임 개최 투표 (12일)
  ├─ Day 1-2: ERD 설계 (MEETINGS, ATTENDEES)
  ├─ Day 3-5: Backend 구현 (Strategy, Service)
  ├─ Day 6-8: API 구현
  ├─ Day 9-11: Frontend 구현
  ├─ Day 12: 통합 테스트

Week 5: 투표 참가자 제한 (선택, 1일)
  └─ 필요 시에만 구현
```

### 4.3 병렬 개발 전략 (MSW 활용)

**Frontend-First 개발:**
```
[Week 1]
Frontend: MSW로 신규 API 모킹 → UI 개발 시작
Backend: ERD 설계 및 DB 스키마 적용

[Week 2]
Frontend: 계속 MSW 사용하여 UI 완성
Backend: Service/API 구현 → 실제 API 배포

[Week 3]
Frontend: MSW → 실제 API 전환 및 통합 테스트
Backend: 모임 개최 투표 구현 시작
```

**절감 시간:** 약 30% (8일 → 5.6일)

### 4.4 리스크 분석

| 리스크 | 확률 | 영향도 | 완화 전략 |
|--------|------|--------|----------|
| 입회비 계산 버그 | 🟡 MEDIUM | 🔴 HIGH | 엣지 케이스 테스트 (첫 가입, 0원 잔액) |
| MEETINGS 테이블 복잡도 | 🔴 HIGH | 🟡 MEDIUM | MVP는 기본 기능만 (참석/취소) |
| 투표-모임 연동 트랜잭션 | 🟡 MEDIUM | 🔴 HIGH | @Transactional + 롤백 테스트 |
| Frontend 가입 플로우 UX | 🟢 LOW | 🟡 MEDIUM | 입회비 안내 명확히 표시 |

---

## 5. 액션 아이템 체크리스트

### Priority 1: 신규 가입자 비용 계산

#### ERD
- [ ] GYE_MEMBERS.entry_fee_paid 컬럼 추가
- [ ] GYE_MEMBERS.entry_fee_paid_at 컬럼 추가
- [ ] LEDGER_ENTRIES.type에 'ENTRY_FEE' 추가
- [ ] ACCOUNT_TRANSACTIONS.type에 'ENTRY_FEE_PAYMENT' 추가

#### Backend
- [ ] GyeService.calculateEntryFee() 메서드 추가
- [ ] GyeService.joinGye() 수정 (입회비 로직 추가)
- [ ] AccountService.payEntryFee() 메서드 추가
- [ ] JoinGyeResponse DTO에 entryFee, totalPaid 필드 추가
- [ ] GroupDetailResponse DTO에 requiredEntryFee 필드 추가

#### API
- [ ] POST /api/groups/:id/join 응답 스키마 업데이트
- [ ] GET /api/groups/:id 응답 스키마 업데이트

#### Frontend
- [ ] 가입 확인 모달 UI 수정 (입회비 표시)
- [ ] 모임 상세 페이지에 입회비 안내 추가
- [ ] API 응답 타입 업데이트

#### 테스트
- [ ] 입회비 계산 단위 테스트 (정상, 첫 가입자, 0원 잔액)
- [ ] joinGye 통합 테스트 (보증금 + 입회비)
- [ ] 잔액 부족 시 실패 테스트

### Priority 2: 모임 개최 투표

#### ERD
- [ ] MEETINGS 테이블 생성
- [ ] MEETING_ATTENDEES 테이블 생성
- [ ] VOTES 테이블에 meeting 관련 컬럼 4개 추가
- [ ] VOTES.type에 'MEETING_CREATE' 추가
- [ ] CHECK 제약조건 추가

#### Backend
- [ ] Meeting 도메인 모델 추가
- [ ] VoteType Enum에 MEETING_CREATE 추가
- [ ] MeetingCreateVoteStrategy 구현
- [ ] MeetingService 추가
- [ ] MeetingMapper 인터페이스 및 XML 추가

#### API
- [ ] POST /api/groups/:groupId/votes (MEETING_CREATE 타입)
- [ ] GET /api/groups/:groupId/meetings
- [ ] POST /api/meetings/:meetingId/attend
- [ ] DELETE /api/meetings/:meetingId/attend

#### Frontend
- [ ] 모임 일정 탭 추가
- [ ] 모임 개최 투표 생성 폼
- [ ] 모임 카드 컴포넌트
- [ ] 참석/취소 버튼

#### 테스트
- [ ] MeetingCreateVoteStrategy 단위 테스트
- [ ] 투표 승인 → MEETING 생성 통합 테스트
- [ ] 참석자 정원 제한 테스트

### Priority 3: 투표 참가자 제한 (선택)

- [ ] 요구사항 재확인 (해석 A vs B)
- [ ] 필요 시 VOTES.related_meeting_id 추가
- [ ] VoteService 검증 로직 추가

---

## 6. 결론

### 6.1 핵심 요약

| 정책 | 상태 | 권장 조치 |
|------|------|----------|
| **신규 가입자 비용** | ❌ 미구현 | 즉시 개발 필요 (8일) |
| **모임 개최 투표** | ❌ 미구현 | 개발 필요 (12일) |
| **투표 참가자 제한** | ✅ 이미 구현됨 | 추가 작업 불필요 |

### 6.2 총 개발 기간

- **순차 개발**: 20일 (4주)
- **병렬 개발 (MSW)**: 14일 (2.8주)

### 6.3 권장 접근 방식

1. **Phase 1 (Week 1-2)**: 신규 가입자 비용 계산 구현
   - 비즈니스 로직 단순, 즉시 효과 발생
   - 기존 가입 플로우 개선

2. **Phase 2 (Week 3-4)**: 모임 개최 투표 구현
   - 새로운 도메인 추가 (MEETINGS)
   - 커뮤니티 기능 강화

3. **Phase 3 (선택)**: 투표 참가자 제한 검증
   - 현재 구현 확인
   - 추가 요구사항 있으면 1일 내 적용

### 6.4 다음 단계

**즉시 수행:**
1. ✅ 이 영향도 분석을 유저(팀)와 공유
2. ✅ 우선순위 재확인 (모임 개최 vs 신규 가입자 비용)
3. ✅ 개발 일정 확정 (WBS 업데이트 필요)

**유저 질문 사항:**
1. "모임 개최 투표"가 실제 오프라인 모임 이벤트를 의미하는 것이 맞는지?
2. "결제 투표 참가자 제한"이 현재 구현(active 회원만)으로 충분한지?
3. 두 기능 중 Demo Day에 필수인 기능은 무엇인지?

---

**문서 버전**: v1.0
**최종 수정**: 2026-01-06
**작성자**: Claude (Sonnet 4.5)
**검토 필요**: Product Owner, Backend Lead, Frontend Lead
