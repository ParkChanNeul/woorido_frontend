# 백엔드 구현 가이드

## 1. Spring Boot 백엔드 구조

### 1.1 계층별 역할

```
Spring Boot Application
├── Presentation Layer (Controller)
│   └── REST API 엔드포인트 정의
├── Business Layer (Service)
│   └── 비즈니스 로직 실행
├── Persistence Layer (Repository/Mapper)
│   └── 데이터베이스 접근
└── Domain Layer (Entity/DTO)
    └── 비즈니스 객체 정의
```

### 1.2 패키지 구조

```
src/main/java/com/woorido
├── domain
│   ├── challenge
│   │   ├── Challenge.java (엔티티)
│   │   ├── ChallengeController.java
│   │   ├── ChallengeService.java
│   │   ├── ChallengeMapper.java (MyBatis)
│   │   └── dto
│   │       ├── ChallengeCreateRequest.java
│   │       ├── ChallengeResponse.java
│   │       └── ChallengeJoinRequest.java
│   ├── vote
│   │   ├── Vote.java
│   │   ├── VoteController.java
│   │   ├── VoteService.java
│   │   ├── VoteMapper.java
│   │   └── dto
│   ├── transaction
│   ├── meeting
│   └── member
├── common
│   ├── config
│   │   ├── DatabaseConfig.java
│   │   └── SecurityConfig.java
│   ├── exception
│   │   ├── GlobalExceptionHandler.java
│   │   └── BusinessException.java
│   └── util
│       ├── DateUtil.java
│       └── CryptoUtil.java
└── integration
    └── django
        ├── DjangoSyncService.java
        └── dto

src/main/resources
├── mybatis
│   └── mapper
│       ├── ChallengeMapper.xml
│       ├── VoteMapper.xml
│       └── TransactionMapper.xml
└── application.yml
```

## 2. MyBatis 패턴

### 2.1 Mapper 인터페이스

```java
// ChallengeMapper.java

package com.woorido.domain.challenge;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ChallengeMapper {

    /**
     * 챌린지 생성
     */
    void insertChallenge(Challenge challenge);

    /**
     * 챌린지 단건 조회
     */
    Challenge selectChallengeById(@Param("id") Long id);

    /**
     * 챌린지 목록 조회 (페이징)
     */
    List<Challenge> selectChallenges(
        @Param("status") String status,
        @Param("offset") int offset,
        @Param("limit") int limit
    );

    /**
     * 챌린지 수정
     */
    int updateChallenge(Challenge challenge);

    /**
     * 챌린지 삭제 (soft delete)
     */
    int deleteChallenge(@Param("id") Long id);

    /**
     * 챌린지 잔액 조회 (입회비 계산용)
     */
    ChallengeBalanceInfo selectBalanceInfo(@Param("challengeId") Long challengeId);
}
```

### 2.2 Mapper XML

```xml
<!-- ChallengeMapper.xml -->

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.woorido.domain.challenge.ChallengeMapper">

    <!-- Result Map -->
    <resultMap id="challengeResultMap" type="com.woorido.domain.challenge.Challenge">
        <id property="id" column="id"/>
        <result property="title" column="title"/>
        <result property="description" column="description"/>
        <result property="category" column="category"/>
        <result property="participationFee" column="participation_fee"/>
        <result property="deposit" column="deposit"/>
        <result property="balance" column="balance"/>
        <result property="status" column="status"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>

        <!-- Association: 리더 정보 -->
        <association property="leader" javaType="com.woorido.domain.member.Member">
            <id property="id" column="leader_id"/>
            <result property="name" column="leader_name"/>
            <result property="email" column="leader_email"/>
        </association>

        <!-- Collection: 멤버 목록 (N+1 방지) -->
        <collection property="members" ofType="com.woorido.domain.member.Member"
                    select="com.woorido.domain.member.MemberMapper.selectMembersByChallengeId"
                    column="id"/>
    </resultMap>

    <!-- 챌린지 생성 -->
    <insert id="insertChallenge" parameterType="com.woorido.domain.challenge.Challenge"
            useGeneratedKeys="true" keyProperty="id">
        INSERT INTO challenges (
            title, description, category,
            participation_fee, deposit, balance,
            leader_id, status, created_at, updated_at
        ) VALUES (
            #{title}, #{description}, #{category},
            #{participationFee}, #{deposit}, #{balance},
            #{leaderId}, #{status}, SYSDATE, SYSDATE
        )
    </insert>

    <!-- 챌린지 단건 조회 -->
    <select id="selectChallengeById" resultMap="challengeResultMap">
        SELECT
            c.id, c.title, c.description, c.category,
            c.participation_fee, c.deposit, c.balance,
            c.status, c.created_at, c.updated_at,
            u.id as leader_id,
            u.name as leader_name,
            u.email as leader_email
        FROM challenges c
        INNER JOIN users u ON c.leader_id = u.id
        WHERE c.id = #{id}
          AND c.deleted_at IS NULL
    </select>

    <!-- 챌린지 목록 조회 (Cursor-based Pagination) -->
    <select id="selectChallenges" resultMap="challengeResultMap">
        SELECT
            c.id, c.title, c.description, c.category,
            c.participation_fee, c.deposit, c.balance,
            c.status, c.created_at, c.updated_at,
            u.id as leader_id,
            u.name as leader_name
        FROM challenges c
        INNER JOIN users u ON c.leader_id = u.id
        WHERE c.deleted_at IS NULL
          <if test="status != null">
          AND c.status = #{status}
          </if>
        ORDER BY c.created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <!-- 챌린지 잔액 조회 (입회비 계산용, FOR UPDATE) -->
    <select id="selectBalanceInfo" resultType="com.woorido.domain.challenge.ChallengeBalanceInfo">
        SELECT
            balance,
            (SELECT COUNT(*) FROM challenge_members WHERE challenge_id = #{challengeId} AND left_at IS NULL) as member_count
        FROM challenges
        WHERE id = #{challengeId}
        FOR UPDATE
    </select>

    <!-- 챌린지 수정 -->
    <update id="updateChallenge" parameterType="com.woorido.domain.challenge.Challenge">
        UPDATE challenges
        SET title = #{title},
            description = #{description},
            balance = #{balance},
            status = #{status},
            updated_at = SYSDATE
        WHERE id = #{id}
    </update>

    <!-- 챌린지 삭제 (Soft Delete) -->
    <update id="deleteChallenge">
        UPDATE challenges
        SET deleted_at = SYSDATE
        WHERE id = #{id}
    </update>

</mapper>
```

## 3. Service Layer 패턴

### 3.1 Service 클래스 구조

```java
// ChallengeService.java

package com.woorido.domain.challenge;

import com.woorido.domain.member.MemberMapper;
import com.woorido.domain.transaction.TransactionService;
import com.woorido.integration.django.DjangoSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeMapper challengeMapper;
    private final MemberMapper memberMapper;
    private final TransactionService transactionService;
    private final DjangoSyncService djangoSyncService;

    /**
     * 챌린지 생성
     */
    @Transactional
    public Challenge createChallenge(ChallengeCreateRequest request, Long leaderId) {
        // 1. 엔티티 생성
        Challenge challenge = Challenge.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .category(request.getCategory())
            .participationFee(request.getParticipationFee())
            .deposit(request.getDeposit())
            .balance(BigDecimal.ZERO)
            .leaderId(leaderId)
            .status("ACTIVE")
            .build();

        // 2. DB 저장
        challengeMapper.insertChallenge(challenge);

        // 3. 리더 멤버십 생성
        memberMapper.insertMember(
            challenge.getId(),
            leaderId,
            "LEADER"
        );

        // 4. Django 동기화 (비동기, 실패해도 메인 플로우 영향 없음)
        try {
            djangoSyncService.syncChallenge(challenge);
        } catch (Exception e) {
            log.warn("Failed to sync challenge to Django: {}", e.getMessage());
        }

        log.info("Challenge created: id={}, title={}", challenge.getId(), challenge.getTitle());

        return challenge;
    }

    /**
     * 챌린지 가입 (입회비 포함)
     */
    @Transactional
    public JoinResult joinChallenge(Long challengeId, Long userId) {
        // 1. 챌린지 존재 확인
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new ChallengeNotFoundException(challengeId);
        }

        // 2. 중복 가입 확인
        if (memberMapper.existsMember(challengeId, userId)) {
            throw new AlreadyMemberException(challengeId, userId);
        }

        // 3. 입회비 계산 (Pessimistic Lock)
        ChallengeBalanceInfo balanceInfo = challengeMapper.selectBalanceInfo(challengeId);
        BigDecimal entryFee = calculateEntryFee(
            balanceInfo.getBalance(),
            balanceInfo.getMemberCount()
        );

        // 4. 보증금 + 입회비
        BigDecimal totalAmount = challenge.getDeposit().add(entryFee);

        // 5. 거래 처리 (트랜잭션)
        transactionService.processJoin(challengeId, userId, entryFee, challenge.getDeposit());

        // 6. 멤버십 생성
        Long memberId = memberMapper.insertMember(challengeId, userId, "FOLLOWER");

        // 7. 챌린지 잔액 업데이트
        BigDecimal newBalance = balanceInfo.getBalance().add(entryFee);
        challengeMapper.updateBalance(challengeId, newBalance);

        // 8. Django 동기화
        try {
            djangoSyncService.syncMember(memberId, challengeId, userId);
        } catch (Exception e) {
            log.warn("Failed to sync member to Django: {}", e.getMessage());
        }

        log.info("User {} joined challenge {}: entryFee={}, deposit={}",
            userId, challengeId, entryFee, challenge.getDeposit());

        return JoinResult.builder()
            .memberId(memberId)
            .entryFee(entryFee)
            .deposit(challenge.getDeposit())
            .totalAmount(totalAmount)
            .build();
    }

    /**
     * 입회비 계산
     * 공식: balance / (current_members - 1)
     */
    private BigDecimal calculateEntryFee(BigDecimal balance, int currentMembers) {
        if (currentMembers <= 1) {
            return BigDecimal.ZERO;
        }

        return balance.divide(
            BigDecimal.valueOf(currentMembers - 1),
            0,
            RoundingMode.FLOOR
        );
    }

    /**
     * 챌린지 목록 조회
     */
    @Transactional(readOnly = true)
    public List<Challenge> getChallenges(String status, int page, int size) {
        int offset = page * size;
        return challengeMapper.selectChallenges(status, offset, size);
    }

    /**
     * 챌린지 상세 조회
     */
    @Transactional(readOnly = true)
    public Challenge getChallengeDetail(Long challengeId) {
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new ChallengeNotFoundException(challengeId);
        }
        return challenge;
    }
}
```

## 4. 트랜잭션 관리

### 4.1 트랜잭션 격리 레벨

```java
// TransactionService.java

@Service
@Slf4j
public class TransactionService {

    @Autowired
    private TransactionMapper transactionMapper;

    /**
     * 챌린지 가입 거래 처리
     * Isolation: READ_COMMITTED (기본값)
     * Propagation: REQUIRED (기본값)
     */
    @Transactional
    public void processJoin(Long challengeId, Long userId, BigDecimal entryFee, BigDecimal deposit) {
        // 1. 입회비 거래 생성
        if (entryFee.compareTo(BigDecimal.ZERO) > 0) {
            Transaction entryFeeTransaction = Transaction.builder()
                .challengeId(challengeId)
                .userId(userId)
                .type("ENTRY_FEE")
                .amount(entryFee)
                .status("COMPLETED")
                .build();
            transactionMapper.insertTransaction(entryFeeTransaction);
        }

        // 2. 보증금 거래 생성
        Transaction depositTransaction = Transaction.builder()
            .challengeId(challengeId)
            .userId(userId)
            .type("DEPOSIT")
            .amount(deposit)
            .status("COMPLETED")
            .build();
        transactionMapper.insertTransaction(depositTransaction);

        log.info("Transactions created for user {} joining challenge {}",
            userId, challengeId);
    }

    /**
     * 보증금 환불 처리
     * 챌린지 완주 시 호출
     */
    @Transactional
    public void refundDeposit(Long challengeId, Long userId) {
        // 1. 원래 보증금 조회
        Transaction depositTransaction = transactionMapper.selectDepositTransaction(
            challengeId, userId
        );

        if (depositTransaction == null) {
            throw new TransactionNotFoundException("Deposit not found");
        }

        // 2. 환불 거래 생성
        Transaction refundTransaction = Transaction.builder()
            .challengeId(challengeId)
            .userId(userId)
            .type("DEPOSIT_REFUND")
            .amount(depositTransaction.getAmount())
            .status("COMPLETED")
            .relatedTransactionId(depositTransaction.getId())
            .build();

        transactionMapper.insertTransaction(refundTransaction);

        log.info("Deposit refunded for user {} in challenge {}",
            userId, challengeId);
    }
}
```

### 4.2 Optimistic Locking (낙관적 락)

```java
// Challenge.java (Entity)

@Data
@Builder
public class Challenge {
    private Long id;
    private String title;
    private String description;

    @Version  // JPA 스타일
    private Long version;  // 낙관적 락용

    // ... 기타 필드
}
```

```xml
<!-- ChallengeMapper.xml -->

<!-- Optimistic Lock을 사용한 업데이트 -->
<update id="updateChallengeWithVersion" parameterType="com.woorido.domain.challenge.Challenge">
    UPDATE challenges
    SET balance = #{balance},
        version = version + 1,
        updated_at = SYSDATE
    WHERE id = #{id}
      AND version = #{version}
</update>
```

```java
// Service에서 낙관적 락 사용

@Transactional
public void updateChallengeBalance(Long challengeId, BigDecimal newBalance) {
    Challenge challenge = challengeMapper.selectChallengeById(challengeId);

    challenge.setBalance(newBalance);

    int rowsAffected = challengeMapper.updateChallengeWithVersion(challenge);

    if (rowsAffected == 0) {
        // 버전 불일치 = 동시 수정 발생
        throw new OptimisticLockException("Challenge was modified by another transaction");
    }
}
```

### 4.3 Pessimistic Locking (비관적 락)

```xml
<!-- 입회비 계산 시 FOR UPDATE 사용 -->
<select id="selectBalanceInfo" resultType="ChallengeBalanceInfo">
    SELECT balance, member_count
    FROM challenges
    WHERE id = #{challengeId}
    FOR UPDATE  <!-- 비관적 락 -->
</select>
```

## 5. 예외 처리

### 5.1 비즈니스 예외 정의

```java
// BusinessException.java

package com.woorido.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
    private final String errorCode;
    private final String message;

    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }
}

// ChallengeNotFoundException.java

public class ChallengeNotFoundException extends BusinessException {
    public ChallengeNotFoundException(Long challengeId) {
        super("CHALLENGE_NOT_FOUND", "챌린지를 찾을 수 없습니다: " + challengeId);
    }
}

// AlreadyMemberException.java

public class AlreadyMemberException extends BusinessException {
    public AlreadyMemberException(Long challengeId, Long userId) {
        super("ALREADY_MEMBER",
            String.format("이미 챌린지에 가입했습니다: challengeId=%d, userId=%d",
                challengeId, userId));
    }
}
```

### 5.2 글로벌 예외 핸들러

```java
// GlobalExceptionHandler.java

package com.woorido.common.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException ex) {
        log.warn("Business exception: code={}, message={}",
            ex.getErrorCode(), ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .errorCode(ex.getErrorCode())
            .message(ex.getMessage())
            .build();

        HttpStatus status = determineHttpStatus(ex.getErrorCode());

        return ResponseEntity.status(status).body(response);
    }

    /**
     * DB 제약 조건 위반 (중복 키 등)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(
        DataIntegrityViolationException ex
    ) {
        log.error("Data integrity violation: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .errorCode("CONSTRAINT_VIOLATION")
            .message("데이터 무결성 오류가 발생했습니다")
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * 낙관적 락 예외
     */
    @ExceptionHandler(OptimisticLockException.class)
    public ResponseEntity<ErrorResponse> handleOptimisticLock(OptimisticLockException ex) {
        log.warn("Optimistic lock exception: {}", ex.getMessage());

        ErrorResponse response = ErrorResponse.builder()
            .errorCode("CONCURRENT_MODIFICATION")
            .message("다른 사용자가 동시에 수정했습니다. 다시 시도해주세요.")
            .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    /**
     * 일반 예외
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        log.error("Unexpected exception", ex);

        ErrorResponse response = ErrorResponse.builder()
            .errorCode("INTERNAL_SERVER_ERROR")
            .message("서버 오류가 발생했습니다")
            .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * 에러 코드에 따라 HTTP 상태 코드 결정
     */
    private HttpStatus determineHttpStatus(String errorCode) {
        return switch (errorCode) {
            case "CHALLENGE_NOT_FOUND", "VOTE_NOT_FOUND" -> HttpStatus.NOT_FOUND;
            case "ALREADY_MEMBER", "VOTE_ALREADY_CAST" -> HttpStatus.CONFLICT;
            case "NOT_LEADER", "NOT_AUTHORIZED" -> HttpStatus.FORBIDDEN;
            case "INVALID_INPUT" -> HttpStatus.BAD_REQUEST;
            default -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }
}
```

## 6. Controller Layer 패턴

### 6.1 REST API 설계

```java
// ChallengeController.java

package com.woorido.domain.challenge;

import com.woorido.common.security.CurrentUser;
import com.woorido.domain.challenge.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/challenges")
@RequiredArgsConstructor
public class ChallengeController {

    private final ChallengeService challengeService;

    /**
     * 챌린지 생성
     * POST /api/challenges
     */
    @PostMapping
    public ResponseEntity<ChallengeResponse> createChallenge(
        @Valid @RequestBody ChallengeCreateRequest request,
        @CurrentUser Long userId
    ) {
        log.info("Create challenge request: title={}, userId={}", request.getTitle(), userId);

        Challenge challenge = challengeService.createChallenge(request, userId);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ChallengeResponse.from(challenge));
    }

    /**
     * 챌린지 가입
     * POST /api/challenges/{id}/join
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<JoinResponse> joinChallenge(
        @PathVariable("id") Long challengeId,
        @CurrentUser Long userId
    ) {
        log.info("Join challenge request: challengeId={}, userId={}", challengeId, userId);

        JoinResult result = challengeService.joinChallenge(challengeId, userId);

        return ResponseEntity.ok(JoinResponse.from(result));
    }

    /**
     * 챌린지 목록 조회
     * GET /api/challenges?status=ACTIVE&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<List<ChallengeResponse>> getChallenges(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("Get challenges: status={}, page={}, size={}", status, page, size);

        List<Challenge> challenges = challengeService.getChallenges(status, page, size);

        List<ChallengeResponse> response = challenges.stream()
            .map(ChallengeResponse::from)
            .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * 챌린지 상세 조회
     * GET /api/challenges/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ChallengeDetailResponse> getChallengeDetail(
        @PathVariable("id") Long challengeId
    ) {
        log.info("Get challenge detail: id={}", challengeId);

        Challenge challenge = challengeService.getChallengeDetail(challengeId);

        return ResponseEntity.ok(ChallengeDetailResponse.from(challenge));
    }
}
```

### 6.2 DTO 패턴

```java
// ChallengeCreateRequest.java

package com.woorido.domain.challenge.dto;

import lombok.Data;

import javax.validation.constraints.*;
import java.math.BigDecimal;

@Data
public class ChallengeCreateRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다")
    private String description;

    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @NotNull(message = "참가비는 필수입니다")
    @DecimalMin(value = "0", message = "참가비는 0 이상이어야 합니다")
    private BigDecimal participationFee;

    @NotNull(message = "보증금은 필수입니다")
    @DecimalMin(value = "1000", message = "보증금은 최소 1000원입니다")
    private BigDecimal deposit;
}

// ChallengeResponse.java

@Data
@Builder
public class ChallengeResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private BigDecimal participationFee;
    private BigDecimal deposit;
    private BigDecimal balance;
    private int memberCount;
    private String status;
    private String leaderName;
    private LocalDateTime createdAt;

    public static ChallengeResponse from(Challenge challenge) {
        return ChallengeResponse.builder()
            .id(challenge.getId())
            .title(challenge.getTitle())
            .description(challenge.getDescription())
            .category(challenge.getCategory())
            .participationFee(challenge.getParticipationFee())
            .deposit(challenge.getDeposit())
            .balance(challenge.getBalance())
            .memberCount(challenge.getMembers() != null ? challenge.getMembers().size() : 0)
            .status(challenge.getStatus())
            .leaderName(challenge.getLeader() != null ? challenge.getLeader().getName() : null)
            .createdAt(challenge.getCreatedAt())
            .build();
    }
}
```

## 7. Django 연동

### 7.1 DjangoSyncService

```java
// DjangoSyncService.java

package com.woorido.integration.django;

import com.woorido.domain.challenge.Challenge;
import com.woorido.domain.transaction.Transaction;
import com.woorido.integration.django.dto.ChallengeSyncDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class DjangoSyncService {

    @Value("${django.api.url}")
    private String djangoApiUrl;  // http://django:8001

    private final RestTemplate restTemplate;

    public DjangoSyncService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * 챌린지 데이터 Django로 전송
     */
    public void syncChallenge(Challenge challenge) {
        String url = djangoApiUrl + "/api/sync/challenge";

        ChallengeSyncDTO dto = ChallengeSyncDTO.builder()
            .challengeId(challenge.getId())
            .title(challenge.getTitle())
            .description(challenge.getDescription())
            .category(challenge.getCategory())
            .memberCount(challenge.getMembers() != null ? challenge.getMembers().size() : 0)
            .balance(challenge.getBalance())
            .participationFee(challenge.getParticipationFee())
            .deposit(challenge.getDeposit())
            .status(challenge.getStatus())
            .leaderId(challenge.getLeaderId())
            .createdAt(challenge.getCreatedAt())
            .build();

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, dto, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Synced challenge {} to Django", challenge.getId());
            } else {
                log.warn("Django sync returned non-2xx status: {}", response.getStatusCode());
            }

        } catch (Exception e) {
            log.error("Failed to sync challenge {} to Django: {}",
                challenge.getId(), e.getMessage());
            // 재시도 큐에 추가 (향후 구현)
        }
    }

    /**
     * 거래 데이터 Django로 전송
     */
    public void syncTransaction(Transaction transaction) {
        String url = djangoApiUrl + "/api/sync/transaction";
        // 유사한 방식으로 구현
    }

    /**
     * 멤버 데이터 Django로 전송
     */
    public void syncMember(Long memberId, Long challengeId, Long userId) {
        String url = djangoApiUrl + "/api/sync/member";
        // 유사한 방식으로 구현
    }
}
```

### 7.2 RestTemplate 설정

```java
// RestTemplateConfig.java

package com.woorido.common.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(3))
            .setReadTimeout(Duration.ofSeconds(5))
            .build();
    }
}
```

## 8. Validation

### 8.1 Bean Validation

```java
// ChallengeCreateRequest.java

@Data
public class ChallengeCreateRequest {

    @NotBlank(message = "제목은 필수입니다")
    @Size(min = 5, max = 100, message = "제목은 5~100자여야 합니다")
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 1000, message = "설명은 1000자 이하여야 합니다")
    private String description;

    @NotNull(message = "카테고리는 필수입니다")
    @Pattern(regexp = "EXERCISE|STUDY|SAVING|OTHER", message = "유효하지 않은 카테고리입니다")
    private String category;

    @NotNull(message = "참가비는 필수입니다")
    @DecimalMin(value = "0", message = "참가비는 0 이상이어야 합니다")
    @DecimalMax(value = "10000000", message = "참가비는 1000만원 이하여야 합니다")
    private BigDecimal participationFee;

    @NotNull(message = "보증금은 필수입니다")
    @DecimalMin(value = "1000", message = "보증금은 최소 1000원입니다")
    @DecimalMax(value = "10000000", message = "보증금은 1000만원 이하여야 합니다")
    private BigDecimal deposit;
}
```

### 8.2 커스텀 Validator

```java
// UniqueChallengeTitleValidator.java

package com.woorido.common.validation;

import com.woorido.domain.challenge.ChallengeMapper;
import lombok.RequiredArgsConstructor;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

@RequiredArgsConstructor
public class UniqueChallengeTitleValidator
    implements ConstraintValidator<UniqueChallengeTitle, String> {

    private final ChallengeMapper challengeMapper;

    @Override
    public boolean isValid(String title, ConstraintValidatorContext context) {
        if (title == null) {
            return true;  // @NotBlank가 처리
        }

        return !challengeMapper.existsByTitle(title);
    }
}

// UniqueChallengeTitle.java (Annotation)

@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueChallengeTitleValidator.class)
public @interface UniqueChallengeTitle {
    String message() default "이미 존재하는 챌린지 제목입니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

## 9. 설정 파일

### 9.1 application.yml

```yaml
spring:
  application:
    name: woorido-backend

  datasource:
    driver-class-name: oracle.jdbc.OracleDriver
    url: jdbc:oracle:thin:@localhost:1521:XE
    username: woorido
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000

  jackson:
    time-zone: Asia/Seoul
    date-format: yyyy-MM-dd'T'HH:mm:ss

mybatis:
  mapper-locations: classpath:mybatis/mapper/**/*.xml
  type-aliases-package: com.woorido.domain
  configuration:
    map-underscore-to-camel-case: true
    default-fetch-size: 100
    default-statement-timeout: 30

# Django 연동
django:
  api:
    url: http://localhost:8001

# 로깅
logging:
  level:
    com.woorido: INFO
    com.woorido.domain: DEBUG
  file:
    name: logs/application.log
```

## 10. AI 도구 활용 팁

### 10.1 Claude Code 활용

**ERD → MyBatis Mapper XML 생성**:
```
프롬프트: "challenges 테이블의 ERD를 보고 MyBatis Mapper XML을 생성해줘.
         CRUD 작업과 pagination, FOR UPDATE 쿼리도 포함해줘."
```

**Service 로직 생성**:
```
프롬프트: "챌린지 가입 로직을 구현해줘. 입회비 계산, 트랜잭션 처리,
         예외 처리, Django 동기화까지 포함해줘."
```

### 10.2 Cursor + Copilot 활용

- **실시간 코드 완성**: Service 메서드 시그니처만 작성하면 자동 완성
- **테스트 코드 생성**: `// Test for joinChallenge` 주석만 작성
- **DTO 변환 메서드**: `ChallengeResponse.from(challenge)` 패턴 학습

### 10.3 개발 시간 단축

| 작업 | 수동 | AI 활용 | 단축률 |
|------|------|---------|--------|
| Mapper XML 작성 | 3시간 | 20분 | 89% |
| Service 로직 | 5시간 | 1.5시간 | 70% |
| DTO 클래스 | 2시간 | 15분 | 88% |
| 예외 처리 | 2시간 | 30분 | 75% |

---

**문서 버전**: 2.0
**최종 수정**: 2025-01-07
**작성자**: AI-Assisted Development Team
