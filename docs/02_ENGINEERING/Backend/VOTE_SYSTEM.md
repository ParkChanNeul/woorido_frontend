# 투표 시스템 구현 가이드

**작성일**: 2026-01-06
**대상**: Spring Boot 백엔드 개발자
**버전**: v1.0

---

## 📋 목차

1. [투표 유형 개요](#1-투표-유형-개요)
2. [패키지 구조](#2-패키지-구조)
3. [도메인 모델](#3-도메인-모델)
4. [서비스 구현](#4-서비스-구현)
5. [전략 패턴 적용](#5-전략-패턴-적용)
6. [MyBatis Mapper](#6-mybatis-mapper)
7. [API 컨트롤러](#7-api-컨트롤러)

---

## 1. 투표 유형 개요

### 1.1 네 가지 투표 타입

| 타입 | 코드 | 설명 | 필수 필드 | 승인 시 동작 |
|------|------|------|----------|------------|
| **오픈 사용 (지출)** | `EXPENSE` | 오픈(모임 금고)에서 지출 | `amount` | 장부 기록 + 오픈 차감 |
| **정기 모임 참석** | `MEETING_ATTENDANCE` | 모임 개최 참석 투표 | `meeting_title`, `meeting_date`, `meeting_location` | MEETINGS 테이블 생성 |
| **회원 강퇴** | `KICK` | 문제 회원 강제 탈퇴 | `target_user_id` | 회원 탈퇴 처리 + 보증금 락 해제 |
| **규칙 변경** | `RULE_CHANGE` | 모임 규칙 수정 | - | 모임 설정 업데이트 |

### 1.2 데이터 무결성 제약

```sql
-- EXPENSE: amount 필수
CONSTRAINT chk_vote_amount CHECK (
  (type = 'EXPENSE' AND amount IS NOT NULL AND amount > 0) OR
  (type != 'EXPENSE' AND amount IS NULL)
)

-- KICK: target_user_id 필수
CONSTRAINT chk_vote_target_user CHECK (
  (type = 'KICK' AND target_user_id IS NOT NULL) OR
  (type != 'KICK' AND target_user_id IS NULL)
)
```

---

## 2. 패키지 구조

```
com.woorido
├── domain
│   └── vote
│       ├── Vote.java                    // 엔티티
│       ├── VoteType.java                // Enum
│       ├── VoteStatus.java              // Enum
│       └── VoteRecord.java              // 투표 참여 기록
│
├── mapper
│   ├── VoteMapper.java                  // MyBatis Mapper Interface
│   └── VoteRecordMapper.java
│
├── service
│   └── vote
│       ├── VoteService.java             // 메인 서비스
│       ├── VoteApprovalService.java     // 승인 처리 서비스
│       ├── VoteStrategyFactory.java     // ⭐ NEW: 전략 팩토리
│       └── strategy
│           ├── VoteApprovalStrategy.java          // 전략 인터페이스
│           ├── ExpenseVoteStrategy.java           // 오픈 사용 투표 전략
│           ├── MeetingAttendanceVoteStrategy.java // 정기 모임 참석 투표 전략
│           ├── KickVoteStrategy.java              // 강퇴 투표 전략
│           └── RuleChangeVoteStrategy.java        // 규칙 변경 전략
│
├── controller
│   └── VoteController.java
│
└── dto
    └── vote
        ├── CreateVoteRequest.java      // Java 17 Record
        ├── CastVoteRequest.java        // Java 17 Record
        └── VoteDetailResponse.java     // Java 17 Record
```

---

## 3. 도메인 모델

### 3.1 VoteType Enum

```java
package com.woorido.domain.vote;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum VoteType {
    EXPENSE("오픈 사용 (지출)", true, false, false),
    MEETING_ATTENDANCE("정기 모임 참석", false, false, true),
    KICK("회원 강퇴", false, true, false),
    RULE_CHANGE("규칙 변경", false, false, false);

    private final String description;
    private final boolean requiresAmount;       // amount 필수 여부
    private final boolean requiresTargetUser;   // target_user_id 필수 여부
    private final boolean requiresMeetingInfo;  // 모임 정보 필수 여부 (⭐ NEW)

    public void validate(Long amount, String targetUserId, MeetingInfo meetingInfo) {
        if (requiresAmount && amount == null) {
            throw new IllegalArgumentException(
                this.name() + " 타입은 amount가 필수입니다."
            );
        }

        if (!requiresAmount && amount != null) {
            throw new IllegalArgumentException(
                this.name() + " 타입은 amount를 사용하지 않습니다."
            );
        }

        if (requiresTargetUser && targetUserId == null) {
            throw new IllegalArgumentException(
                this.name() + " 타입은 target_user_id가 필수입니다."
            );
        }

        if (!requiresTargetUser && targetUserId != null) {
            throw new IllegalArgumentException(
                this.name() + " 타입은 target_user_id를 사용하지 않습니다."
            );
        }

        // ⭐ 모임 정보 검증 추가
        if (requiresMeetingInfo && meetingInfo == null) {
            throw new IllegalArgumentException(
                this.name() + " 타입은 모임 정보(meeting_title, meeting_date, meeting_location)가 필수입니다."
            );
        }
    }

    // 오버로드: 기존 호환성 유지
    public void validate(Long amount, String targetUserId) {
        validate(amount, targetUserId, null);
    }
}
```

### 3.2 Vote 엔티티

```java
package com.woorido.domain.vote;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class Vote {
    private String id;
    private String gyeId;
    private String createdBy;

    // 투표 유형
    private VoteType type;  // EXPENSE, KICK, RULE_CHANGE

    // 투표 내용
    private String title;
    private String description;
    private Long amount;           // EXPENSE인 경우만 사용
    private String targetUserId;   // KICK인 경우만 사용

    // 투표 설정
    private Integer requiredApprovalCount;

    // 투표 상태
    private VoteStatus status;  // PENDING, APPROVED, REJECTED, EXPIRED
    private LocalDateTime approvedAt;

    // 장부 연동 (EXPENSE만)
    private String ledgerEntryId;
    private String ledgerStatus;  // PENDING, RECORDED, FAILED

    // 타임스탬프
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private LocalDateTime updatedAt;

    // 추가 정보 (조회 시)
    private String creatorNickname;
    private Integer yesCount;
    private Integer noCount;
    private String myVote;  // 현재 유저의 투표 (APPROVE/REJECT)

    /**
     * 투표 타입별 유효성 검증
     */
    public void validate() {
        if (type == null) {
            throw new IllegalArgumentException("투표 타입은 필수입니다.");
        }
        type.validate(amount, targetUserId);
    }

    /**
     * 투표 승인 가능 여부 확인
     */
    public boolean canBeApproved(int totalMembers) {
        return yesCount != null && yesCount >= requiredApprovalCount;
    }

    /**
     * 투표 거부 여부 확인
     */
    public boolean isRejected(int totalMembers) {
        // 남은 투표 가능 인원으로도 필요 찬성수에 도달 불가능
        int maxPossibleYes = yesCount + (totalMembers - yesCount - noCount);
        return maxPossibleYes < requiredApprovalCount;
    }
}
```

---

## 4. 서비스 구현

### 4.1 VoteService (투표 생성 및 참여)

```java
package com.woorido.service.vote;

import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteRecord;
import com.woorido.domain.vote.VoteStatus;
import com.woorido.domain.vote.VoteType;
import com.woorido.dto.vote.CreateVoteRequest;
import com.woorido.mapper.VoteMapper;
import com.woorido.mapper.VoteRecordMapper;
import com.woorido.mapper.GyeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteService {

    private final VoteMapper voteMapper;
    private final VoteRecordMapper voteRecordMapper;
    private final GyeMapper gyeMapper;
    private final VoteApprovalService voteApprovalService;

    /**
     * 투표 생성
     */
    @Transactional
    public String createVote(String gyeId, String userId, CreateVoteRequest request) {
        // 1. 모임 존재 및 권한 확인
        validateGyeMembership(gyeId, userId);

        // 2. Vote 엔티티 생성
        Vote vote = Vote.builder()
            .gyeId(gyeId)
            .createdBy(userId)
            .type(request.getType())
            .title(request.getTitle())
            .description(request.getDescription())
            .amount(request.getAmount())
            .targetUserId(request.getTargetUserId())
            .requiredApprovalCount(calculateRequiredApprovals(gyeId))
            .status(VoteStatus.PENDING)
            .expiresAt(LocalDateTime.now().plusDays(3))  // 3일 후 만료
            .build();

        // 3. 투표 유효성 검증
        vote.validate();

        // 4. 추가 비즈니스 로직 검증
        validateVoteCreation(vote);

        // 5. DB 저장
        voteMapper.insert(vote);

        log.info("투표 생성 완료: voteId={}, type={}, gyeId={}",
            vote.getId(), vote.getType(), gyeId);

        return vote.getId();
    }

    /**
     * 투표 참여
     */
    @Transactional
    public void castVote(String voteId, String userId, String choice) {
        // 1. 투표 조회
        Vote vote = voteMapper.selectById(voteId);

        if (vote == null) {
            throw new VoteNotFoundException("투표를 찾을 수 없습니다.");
        }

        // 2. 투표 가능 여부 확인
        validateVoteCasting(vote, userId);

        // 3. 투표 기록 저장
        VoteRecord record = VoteRecord.builder()
            .voteId(voteId)
            .userId(userId)
            .choice(choice)
            .build();

        voteRecordMapper.insert(record);

        // 4. 투표 집계 및 상태 업데이트
        updateVoteStatus(vote);

        log.info("투표 참여 완료: voteId={}, userId={}, choice={}",
            voteId, userId, choice);
    }

    /**
     * 투표 상태 업데이트 및 자동 승인/거부 처리
     */
    private void updateVoteStatus(Vote vote) {
        // 현재 찬반 집계
        int yesCount = voteRecordMapper.countByVoteIdAndChoice(vote.getId(), "APPROVE");
        int noCount = voteRecordMapper.countByVoteIdAndChoice(vote.getId(), "REJECT");
        int totalMembers = gyeMapper.selectMemberCount(vote.getGyeId());

        vote.setYesCount(yesCount);
        vote.setNoCount(noCount);

        // 승인 조건 달성
        if (vote.canBeApproved(totalMembers)) {
            voteApprovalService.approveVote(vote);
            return;
        }

        // 거부 확정 (남은 인원으로도 승인 불가능)
        if (vote.isRejected(totalMembers)) {
            vote.setStatus(VoteStatus.REJECTED);
            voteMapper.updateStatus(vote.getId(), VoteStatus.REJECTED);
            log.info("투표 자동 거부: voteId={}", vote.getId());
        }
    }

    /**
     * 필요 찬성 수 계산 (모임 인원의 50% 이상)
     */
    private int calculateRequiredApprovals(String gyeId) {
        int totalMembers = gyeMapper.selectMemberCount(gyeId);
        return (int) Math.ceil(totalMembers * 0.5);
    }

    /**
     * 투표 생성 유효성 검증
     */
    private void validateVoteCreation(Vote vote) {
        if (vote.getType() == VoteType.EXPENSE) {
            // 지출 투표: 모임 잔액 확인
            long gyeBalance = gyeMapper.selectBalance(vote.getGyeId());
            if (gyeBalance < vote.getAmount()) {
                throw new InsufficientBalanceException("모임 잔액이 부족합니다.");
            }
        }

        if (vote.getType() == VoteType.KICK) {
            // 강퇴 투표: 대상 회원이 모임에 속해있는지 확인
            boolean isMember = gyeMapper.isMember(vote.getGyeId(), vote.getTargetUserId());
            if (!isMember) {
                throw new InvalidTargetUserException("해당 회원은 이 모임에 속해있지 않습니다.");
            }
        }
    }

    private void validateGyeMembership(String gyeId, String userId) {
        boolean isMember = gyeMapper.isMember(gyeId, userId);
        if (!isMember) {
            throw new UnauthorizedException("모임 회원만 투표를 생성할 수 있습니다.");
        }
    }

    private void validateVoteCasting(Vote vote, String userId) {
        // 이미 종료된 투표
        if (vote.getStatus() != VoteStatus.PENDING) {
            throw new VoteAlreadyClosedException("이미 종료된 투표입니다.");
        }

        // 만료된 투표
        if (LocalDateTime.now().isAfter(vote.getExpiresAt())) {
            throw new VoteExpiredException("투표 기간이 만료되었습니다.");
        }

        // 중복 투표
        boolean alreadyVoted = voteRecordMapper.existsByVoteIdAndUserId(vote.getId(), userId);
        if (alreadyVoted) {
            throw new DuplicateVoteException("이미 투표에 참여하셨습니다.");
        }

        // 모임 회원 확인
        boolean isMember = gyeMapper.isMember(vote.getGyeId(), userId);
        if (!isMember) {
            throw new UnauthorizedException("모임 회원만 투표할 수 있습니다.");
        }
    }
}
```

---

## 5. 전략 패턴 적용

### 5.1 VoteApprovalStrategy 인터페이스

```java
package com.woorido.service.vote.strategy;

import com.woorido.domain.vote.Vote;

/**
 * 투표 승인 처리 전략 인터페이스
 */
public interface VoteApprovalStrategy {

    /**
     * 이 전략이 처리할 수 있는 투표 타입인지 확인
     */
    boolean supports(Vote vote);

    /**
     * 투표 승인 시 실행할 비즈니스 로직
     * @param vote 승인된 투표
     */
    void execute(Vote vote);
}
```

### 5.2 ExpenseVoteStrategy (지출 투표)

```java
package com.woorido.service.vote.strategy;

import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteType;
import com.woorido.mapper.LedgerEntryMapper;
import com.woorido.mapper.GyeMapper;
import com.woorido.mapper.VoteMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpenseVoteStrategy implements VoteApprovalStrategy {

    private final LedgerEntryMapper ledgerEntryMapper;
    private final GyeMapper gyeMapper;
    private final VoteMapper voteMapper;

    @Override
    public boolean supports(Vote vote) {
        return vote.getType() == VoteType.EXPENSE;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void execute(Vote vote) {
        log.info("지출 투표 승인 처리 시작: voteId={}, amount={}",
            vote.getId(), vote.getAmount());

        try {
            // 1. 모임 잔액 확인 (Pessimistic Lock)
            Gye gye = gyeMapper.selectByIdForUpdate(vote.getGyeId());

            if (gye.getBalance() < vote.getAmount()) {
                throw new InsufficientBalanceException("모임 잔액이 부족합니다.");
            }

            // 2. 장부 기록 생성
            LedgerEntry ledger = LedgerEntry.builder()
                .gyeId(vote.getGyeId())
                .type("EXPENSE")
                .amount(vote.getAmount())
                .description(vote.getTitle())
                .createdBy(vote.getCreatedBy())
                .approvedBy(vote.getCreatedBy())  // 투표로 승인됨
                .approvedAt(LocalDateTime.now())
                .build();

            String ledgerId = ledgerEntryMapper.insert(ledger);

            // 3. 투표-장부 연결
            vote.setLedgerEntryId(ledgerId);
            vote.setLedgerStatus("RECORDED");
            voteMapper.updateLedgerInfo(vote.getId(), ledgerId, "RECORDED");

            // 4. 모임 잔액 차감
            long newBalance = gye.getBalance() - vote.getAmount();
            gyeMapper.updateBalance(gye.getId(), newBalance);

            log.info("지출 투표 승인 완료: voteId={}, ledgerId={}, newBalance={}",
                vote.getId(), ledgerId, newBalance);

        } catch (Exception e) {
            // 실패 시 장부 상태 업데이트
            vote.setLedgerStatus("FAILED");
            voteMapper.updateLedgerInfo(vote.getId(), null, "FAILED");

            log.error("지출 투표 승인 실패: voteId={}", vote.getId(), e);
            throw e;
        }
    }
}
```

### 5.3 KickVoteStrategy (강퇴 투표)

```java
package com.woorido.service.vote.strategy;

import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteType;
import com.woorido.mapper.GyeMemberMapper;
import com.woorido.mapper.AccountMapper;
import com.woorido.mapper.AccountTransactionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class KickVoteStrategy implements VoteApprovalStrategy {

    private final GyeMemberMapper gyeMemberMapper;
    private final AccountMapper accountMapper;
    private final AccountTransactionMapper accountTransactionMapper;

    @Override
    public boolean supports(Vote vote) {
        return vote.getType() == VoteType.KICK;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void execute(Vote vote) {
        log.info("강퇴 투표 승인 처리 시작: voteId={}, targetUserId={}",
            vote.getId(), vote.getTargetUserId());

        // 1. 회원 정보 조회
        GyeMember member = gyeMemberMapper.selectByGyeAndUser(
            vote.getGyeId(),
            vote.getTargetUserId()
        );

        if (member == null) {
            throw new MemberNotFoundException("회원을 찾을 수 없습니다.");
        }

        // 2. 보증금 락 해제 (잔액 반환)
        if (member.getDepositPaid() == 'Y') {
            unlockDeposit(member);
        }

        // 3. 회원 탈퇴 처리
        gyeMemberMapper.updateLeftAt(member.getId(), LocalDateTime.now());

        log.info("강퇴 투표 승인 완료: voteId={}, targetUserId={}",
            vote.getId(), vote.getTargetUserId());
    }

    private void unlockDeposit(GyeMember member) {
        // 계좌 조회 (Pessimistic Lock)
        Account account = accountMapper.selectByUserIdForUpdate(member.getUserId());

        long depositAmount = member.getDepositAmount();  // 보증금 금액

        // 잔액 복구
        long newBalance = account.getBalance() + depositAmount;
        long newLockedBalance = account.getLockedBalance() - depositAmount;

        accountMapper.updateBalance(account.getId(), newBalance);
        accountMapper.updateLockedBalance(account.getId(), newLockedBalance);

        // 트랜잭션 기록
        accountTransactionMapper.insert(AccountTransaction.builder()
            .accountId(account.getId())
            .type("UNLOCK")
            .amount(depositAmount)
            .balanceBefore(account.getBalance())
            .balanceAfter(newBalance)
            .lockedBefore(account.getLockedBalance())
            .lockedAfter(newLockedBalance)
            .relatedGyeId(member.getGyeId())
            .description("강퇴로 인한 보증금 반환")
            .build());
    }
}
```

### 5.4 MeetingAttendanceVoteStrategy (정기 모임 참석 투표) ⭐ NEW

```java
package com.woorido.service.vote.strategy;

import com.woorido.domain.meeting.Meeting;
import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteType;
import com.woorido.mapper.MeetingMapper;
import com.woorido.mapper.VoteRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class MeetingAttendanceVoteStrategy implements VoteApprovalStrategy {

    private final MeetingMapper meetingMapper;
    private final VoteRecordMapper voteRecordMapper;

    @Override
    public boolean supports(Vote vote) {
        return vote.getType() == VoteType.MEETING_ATTENDANCE;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void execute(Vote vote) {
        log.info("정기 모임 참석 투표 승인 처리 시작: voteId={}, title={}",
            vote.getId(), vote.getTitle());

        // 1. 참석 인원 조회 (APPROVE 투표한 사람들)
        List<String> attendeeIds = voteRecordMapper.selectUserIdsByVoteIdAndChoice(
            vote.getId(), "APPROVE"
        );

        // 2. 정기 모임 레코드 생성
        Meeting meeting = Meeting.builder()
            .id(UUID.randomUUID().toString())
            .gyeId(vote.getGyeId())
            .voteId(vote.getId())
            .title(vote.getTitle())
            .description(vote.getDescription())
            .scheduledAt(vote.getMeetingDate())  // 투표에서 전달된 날짜
            .location(vote.getMeetingLocation())
            .expectedAttendees(attendeeIds.size())
            .status("CONFIRMED")
            .createdBy(vote.getCreatedBy())
            .createdAt(LocalDateTime.now())
            .build();

        meetingMapper.insert(meeting);

        // 3. 참석자 등록
        for (String userId : attendeeIds) {
            meetingMapper.insertAttendee(meeting.getId(), userId, "CONFIRMED");
        }

        log.info("정기 모임 생성 완료: meetingId={}, attendees={}",
            meeting.getId(), attendeeIds.size());
    }
}
```

### 5.5 RuleChangeVoteStrategy (규칙 변경 투표)

```java
package com.woorido.service.vote.strategy;

import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteType;
import com.woorido.mapper.GyeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RuleChangeVoteStrategy implements VoteApprovalStrategy {

    private final GyeMapper gyeMapper;

    @Override
    public boolean supports(Vote vote) {
        return vote.getType() == VoteType.RULE_CHANGE;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void execute(Vote vote) {
        log.info("규칙 변경 투표 승인 처리 시작: voteId={}, title={}",
            vote.getId(), vote.getTitle());

        // 투표 설명에 포함된 규칙 변경 내용 파싱
        // (실제로는 별도 JSON 필드나 RULE_CHANGE_DETAILS 테이블 사용 권장)

        // 예시: 월 회비 변경
        if (vote.getTitle().contains("회비 변경")) {
            // description에서 새로운 회비 금액 추출 (예: "월 회비를 10000원으로 변경")
            // 실제로는 별도 필드로 관리하는 것이 좋음
            log.info("월 회비 변경 요청 승인됨");
        }

        // 예시: 최대 인원 변경
        if (vote.getTitle().contains("인원 변경")) {
            log.info("최대 인원 변경 요청 승인됨");
        }

        log.info("규칙 변경 투표 승인 완료: voteId={}", vote.getId());
    }
}
```

### 5.5 VoteApprovalService (전략 실행)

```java
package com.woorido.service.vote;

import com.woorido.domain.vote.Vote;
import com.woorido.domain.vote.VoteStatus;
import com.woorido.mapper.VoteMapper;
import com.woorido.service.vote.strategy.VoteApprovalStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoteApprovalService {

    private final VoteMapper voteMapper;
    private final List<VoteApprovalStrategy> strategies;  // Spring이 자동 주입

    /**
     * 투표 승인 처리
     * - 투표 타입에 맞는 전략을 찾아서 실행
     */
    @Transactional(rollbackFor = Exception.class)
    public void approveVote(Vote vote) {
        log.info("투표 승인 처리 시작: voteId={}, type={}", vote.getId(), vote.getType());

        // 1. 투표 상태 변경
        vote.setStatus(VoteStatus.APPROVED);
        vote.setApprovedAt(LocalDateTime.now());
        voteMapper.updateStatus(vote.getId(), VoteStatus.APPROVED);
        voteMapper.updateApprovedAt(vote.getId(), LocalDateTime.now());

        // 2. 타입에 맞는 전략 찾기
        VoteApprovalStrategy strategy = strategies.stream()
            .filter(s -> s.supports(vote))
            .findFirst()
            .orElseThrow(() -> new UnsupportedVoteTypeException(
                "지원하지 않는 투표 타입입니다: " + vote.getType()
            ));

        // 3. 전략 실행
        try {
            strategy.execute(vote);
            log.info("투표 승인 완료: voteId={}, type={}", vote.getId(), vote.getType());
        } catch (Exception e) {
            log.error("투표 승인 실패: voteId={}, type={}", vote.getId(), vote.getType(), e);

            // 상태 롤백
            vote.setStatus(VoteStatus.PENDING);
            voteMapper.updateStatus(vote.getId(), VoteStatus.PENDING);

            throw e;
        }
    }
}
```

---

## 6. MyBatis Mapper

### 6.1 VoteMapper.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.woorido.mapper.VoteMapper">

  <!-- ResultMap -->
  <resultMap id="VoteResultMap" type="com.woorido.domain.vote.Vote">
    <id property="id" column="id"/>
    <result property="gyeId" column="gye_id"/>
    <result property="createdBy" column="created_by"/>
    <result property="type" column="type" typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    <result property="title" column="title"/>
    <result property="description" column="description"/>
    <result property="amount" column="amount"/>
    <result property="targetUserId" column="target_user_id"/>
    <result property="requiredApprovalCount" column="required_approval_count"/>
    <result property="status" column="status" typeHandler="org.apache.ibatis.type.EnumTypeHandler"/>
    <result property="approvedAt" column="approved_at"/>
    <result property="ledgerEntryId" column="ledger_entry_id"/>
    <result property="ledgerStatus" column="ledger_status"/>
    <result property="createdAt" column="created_at"/>
    <result property="expiresAt" column="expires_at"/>
    <result property="updatedAt" column="updated_at"/>
  </resultMap>

  <!-- Insert -->
  <insert id="insert" parameterType="com.woorido.domain.vote.Vote">
    <selectKey keyProperty="id" resultType="string" order="BEFORE">
      SELECT SYS_GUID() FROM DUAL
    </selectKey>

    INSERT INTO votes (
      id, gye_id, created_by, type, title, description,
      amount, target_user_id, required_approval_count,
      status, expires_at, created_at
    ) VALUES (
      #{id}, #{gyeId}, #{createdBy}, #{type}, #{title}, #{description},
      #{amount}, #{targetUserId}, #{requiredApprovalCount},
      #{status}, #{expiresAt}, SYSTIMESTAMP
    )
  </insert>

  <!-- Select by ID -->
  <select id="selectById" resultMap="VoteResultMap">
    SELECT * FROM votes WHERE id = #{voteId}
  </select>

  <!-- Select by Gye with vote counts -->
  <select id="selectByGyeIdWithCounts" resultType="com.woorido.dto.vote.VoteDetailResponse">
    SELECT
      v.*,
      u.name as creator_nickname,
      (SELECT COUNT(*) FROM vote_records WHERE vote_id = v.id AND choice = 'APPROVE') as yes_count,
      (SELECT COUNT(*) FROM vote_records WHERE vote_id = v.id AND choice = 'REJECT') as no_count,
      (SELECT choice FROM vote_records WHERE vote_id = v.id AND user_id = #{currentUserId}) as my_vote
    FROM votes v
    INNER JOIN users u ON v.created_by = u.id
    WHERE v.gye_id = #{gyeId}
      AND v.status = #{status}
    ORDER BY v.created_at DESC
  </select>

  <!-- Update Status -->
  <update id="updateStatus">
    UPDATE votes
    SET status = #{status},
        updated_at = SYSTIMESTAMP
    WHERE id = #{voteId}
  </update>

  <!-- Update Ledger Info -->
  <update id="updateLedgerInfo">
    UPDATE votes
    SET ledger_entry_id = #{ledgerEntryId},
        ledger_status = #{ledgerStatus},
        updated_at = SYSTIMESTAMP
    WHERE id = #{voteId}
  </update>

  <!-- Update Approved At -->
  <update id="updateApprovedAt">
    UPDATE votes
    SET approved_at = #{approvedAt},
        updated_at = SYSTIMESTAMP
    WHERE id = #{voteId}
  </update>

</mapper>
```

---

## 7. API 컨트롤러

### 7.1 VoteController

```java
package com.woorido.controller;

import com.woorido.dto.vote.CreateVoteRequest;
import com.woorido.dto.vote.CastVoteRequest;
import com.woorido.dto.vote.VoteListResponse;
import com.woorido.service.vote.VoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VoteController {

    private final VoteService voteService;

    /**
     * 투표 생성
     * POST /api/groups/:groupId/votes
     */
    @PostMapping("/groups/{gyeId}/votes")
    public ResponseEntity<Map<String, String>> createVote(
        @PathVariable String gyeId,
        @AuthenticationPrincipal String userId,
        @Valid @RequestBody CreateVoteRequest request
    ) {
        String voteId = voteService.createVote(gyeId, userId, request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(Map.of("voteId", voteId));
    }

    /**
     * 투표 목록 조회
     * GET /api/groups/:groupId/votes?status=PENDING
     */
    @GetMapping("/groups/{gyeId}/votes")
    public ResponseEntity<VoteListResponse> getVotes(
        @PathVariable String gyeId,
        @AuthenticationPrincipal String userId,
        @RequestParam(required = false) String status
    ) {
        VoteListResponse response = voteService.getVotes(gyeId, userId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * 투표 참여
     * POST /api/votes/:voteId/cast
     */
    @PostMapping("/votes/{voteId}/cast")
    public ResponseEntity<Map<String, Object>> castVote(
        @PathVariable String voteId,
        @AuthenticationPrincipal String userId,
        @Valid @RequestBody CastVoteRequest request
    ) {
        voteService.castVote(voteId, userId, request.getVote());

        // 업데이트된 투표 집계 반환
        Vote updatedVote = voteService.getVoteById(voteId, userId);

        return ResponseEntity.ok(Map.of(
            "yesCount", updatedVote.getYesCount(),
            "noCount", updatedVote.getNoCount(),
            "myVote", updatedVote.getMyVote()
        ));
    }
}
```

---

## 8. 요약

### 8.1 핵심 포인트

1. **투표 타입 구분**: `type` 컬럼으로 EXPENSE/KICK/RULE_CHANGE 구분
2. **데이터 무결성**: CHECK 제약조건으로 타입별 필수 필드 강제
3. **전략 패턴**: 타입별로 다른 승인 로직을 Strategy로 분리
4. **트랜잭션 안전성**: @Transactional + Pessimistic Lock
5. **자동 승인/거부**: 투표 참여 시 실시간 집계 및 상태 업데이트

### 8.2 패키지별 역할

| 패키지 | 역할 |
|--------|------|
| `domain.vote` | 엔티티, Enum (VoteType, VoteStatus) |
| `service.vote` | 비즈니스 로직 (생성, 참여, 조회) |
| `service.vote.strategy` | 승인 전략 (타입별 분기 처리) |
| `mapper` | MyBatis Mapper (DB 접근) |
| `controller` | REST API 엔드포인트 |

### 8.3 확장 가능성

**새로운 투표 타입 추가 시:**
1. `VoteType` Enum에 새 타입 추가
2. 새로운 `Strategy` 구현체 작성
3. Spring이 자동으로 감지하여 주입

**예시: DISSOLVE (모임 해산) 투표 추가**
```java
@Component
public class DissolveVoteStrategy implements VoteApprovalStrategy {
    @Override
    public boolean supports(Vote vote) {
        return vote.getType() == VoteType.DISSOLVE;
    }

    @Override
    public void execute(Vote vote) {
        // 모임 Soft Delete 처리
        gyeMapper.softDelete(vote.getGyeId(), "투표로 인한 해산");
    }
}
```

---

## 9. Factory 패턴 적용 ⭐ NEW

### 9.1 VoteStrategyFactory

> Strategy 객체 생성을 중앙화하여 VoteApprovalService의 의존성 관리 단순화

```java
package com.woorido.service.vote;

import com.woorido.domain.vote.VoteType;
import com.woorido.service.vote.strategy.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class VoteStrategyFactory {

    private final ExpenseVoteStrategy expenseStrategy;
    private final MeetingAttendanceVoteStrategy meetingStrategy;
    private final KickVoteStrategy kickStrategy;
    private final RuleChangeVoteStrategy ruleChangeStrategy;

    /**
     * VoteType에 따라 적절한 Strategy 반환
     * @param type 투표 타입
     * @return 해당 타입의 승인 전략
     */
    public VoteApprovalStrategy create(VoteType type) {
        return switch (type) {
            case EXPENSE -> expenseStrategy;
            case MEETING_ATTENDANCE -> meetingStrategy;
            case KICK -> kickStrategy;
            case RULE_CHANGE -> ruleChangeStrategy;
        };
    }
}
```

### 9.2 VoteApprovalService 리팩토링

```java
// 기존: List<Strategy>에서 supports() 검색
// 개선: Factory에서 직접 생성

@Service
@RequiredArgsConstructor
public class VoteApprovalService {

    private final VoteStrategyFactory strategyFactory;
    private final VoteMapper voteMapper;

    @Transactional
    public void processApproval(Vote vote) {
        // Factory를 통해 Strategy 획득
        VoteApprovalStrategy strategy = strategyFactory.create(vote.getType());
        strategy.execute(vote);
        
        vote.setStatus(VoteStatus.APPROVED);
        voteMapper.updateStatus(vote.getId(), vote.getStatus());
    }
}
```

**Factory 패턴 장점:**
- Strategy 생성 로직 중앙화
- 새 VoteType 추가 시 Factory만 수정
- 테스트 시 Mock Factory 주입 용이

---

## 10. Java 17 Record DTO ⭐ NEW

> DTO를 Java 17 Record로 변환하여 코드량 70% 감소 + 불변성 보장

### 10.1 CreateVoteRequest (Record)

```java
package com.woorido.dto.vote;

import com.woorido.domain.vote.VoteType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateVoteRequest(
    @NotNull(message = "투표 타입은 필수입니다")
    VoteType type,
    
    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100)
    String title,
    
    @Size(max = 500)
    String description,
    
    // EXPENSE 타입 전용
    BigDecimal amount,
    
    // MEETING_ATTENDANCE 타입 전용
    LocalDate meetingDate,
    String location,
    
    // KICK 타입 전용
    Long targetUserId
) {
    // Compact Constructor: 타입별 필수 필드 검증
    public CreateVoteRequest {
        switch (type) {
            case EXPENSE -> {
                if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new IllegalArgumentException("오픈 사용 투표는 금액이 필수입니다");
                }
            }
            case MEETING_ATTENDANCE -> {
                if (meetingDate == null) {
                    throw new IllegalArgumentException("정기 모임 투표는 날짜가 필수입니다");
                }
            }
            case KICK -> {
                if (targetUserId == null) {
                    throw new IllegalArgumentException("강퇴 투표는 대상자가 필수입니다");
                }
            }
            case RULE_CHANGE -> {
                // description 권장
            }
        }
    }
}
```

### 10.2 CastVoteRequest (Record)

```java
public record CastVoteRequest(
    @NotBlank(message = "투표 선택은 필수입니다")
    @Pattern(regexp = "APPROVE|REJECT", message = "APPROVE 또는 REJECT만 가능")
    String choice
) {}
```

### 10.3 VoteDetailResponse (Record)

```java
public record VoteDetailResponse(
    Long id,
    VoteType type,
    String title,
    String description,
    VoteStatus status,
    int yesCount,
    int noCount,
    int totalEligible,
    String myVote,
    LocalDateTime expiresAt,
    LocalDateTime createdAt
) {
    public static VoteDetailResponse from(Vote vote, int yes, int no, int total, String myVote) {
        return new VoteDetailResponse(
            vote.getId(),
            vote.getType(),
            vote.getTitle(),
            vote.getDescription(),
            vote.getStatus(),
            yes, no, total, myVote,
            vote.getExpiresAt(),
            vote.getCreatedAt()
        );
    }
    
    // 투표율 계산 (파생 필드)
    public double participationRate() {
        if (totalEligible == 0) return 0.0;
        return (double)(yesCount + noCount) / totalEligible * 100;
    }
}
```

**Record 장점:**
| 항목 | 기존 @Data | Record |
|------|-----------|--------|
| 코드량 | 30줄+ | 10줄 |
| 불변성 | ❌ | ✅ 보장 |
| equals/hashCode | Lombok 생성 | 자동 |
| Jackson 호환 | ✅ | ✅ |

---

**문서 버전**: v2.0
**최종 수정**: 2026-01-08
**작성자**: AI-Assisted Development Team
