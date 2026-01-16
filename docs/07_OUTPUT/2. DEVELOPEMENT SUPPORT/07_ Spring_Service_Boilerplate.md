# WOORIDO Spring Service 보일러플레이트 v1.0.0

================================================================================
문서 정보
================================================================================
작성일: 2026-01-16
버전: 1.0.0
총 Service: 16개
총 API: 83개 (Spring Boot)
기준 문서: API_SCHEMA_1.0.0.md, DB_Schema_1.0.0.md, POLICY_DEFINITION.md

용어 변경 반영 (BACKLOG 2026-01-12):
- challenge_members → challenge_followers
- current_members → current_followers
- member → follower (리더 제외 일반 참여자)

기술 스택:
- Java 21 (LTS)
- Spring Boot 3.2.3
- MyBatis 3.0.3
- Oracle 21c XE
- Spring Retry 2.0.5

================================================================================
1. AUTH SERVICE (8 APIs)
================================================================================

/**
 * 인증 서비스
 * 
 * 001 POST /auth/signup           회원가입           P0
 * 002 POST /auth/login            로그인             P0
 * 003 POST /auth/logout           로그아웃           P0
 * 004 POST /auth/refresh          토큰 갱신          P0
 * 005 POST /auth/email/verify     인증 코드 발송     P1
 * 006 POST /auth/email/confirm    인증 코드 확인     P1
 * 007 POST /auth/password/reset   비밀번호 재설정 요청 P0
 * 008 PUT  /auth/password/reset   비밀번호 재설정 실행 P1
 * 
 * 관련 정책: P-001 ~ P-005
 * 관련 테이블: users, sessions
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserMapper userMapper;
    private final SessionMapper sessionMapper;
    private final AccountMapper accountMapper;
    private final UserScoreMapper userScoreMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RedisTemplate<String, String> redisTemplate;

    // ==================== 001 회원가입 ====================
    /**
     * P-001: 약관 동의 필수
     * P-002: 마케팅 동의 선택
     * P-003: 이름 2~10자 한글
     * P-004: 이메일 형식/중복 확인
     * P-005: 비밀번호 8자 이상, 영문+숫자, 특수문자 허용
     */
    @Transactional
    public SignupResponse signup(SignupRequest request) {
        // 1. 이메일 중복 확인
        if (userMapper.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.USER_002); // 이미 존재하는 이메일
        }

        // 2. 닉네임 중복 확인
        if (userMapper.existsByNickname(request.getNickname())) {
            throw new BusinessException(ErrorCode.USER_006); // 닉네임 중복
        }

        // 3. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 4. 사용자 생성
        User user = User.builder()
                .email(request.getEmail())
                .password(encodedPassword)
                .name(request.getName())
                .nickname(request.getNickname())
                .phone(request.getPhone())
                .status("ACTIVE")
                .marketingAgreed(request.isMarketingAgreed())
                .build();
        userMapper.insertUser(user);

        // 5. 개인 어카운트 생성
        Account account = Account.builder()
                .userId(user.getId())
                .accountType("PERSONAL")
                .balance(0L)
                .lockedBalance(0L)
                .build();
        accountMapper.insertAccount(account);

        // 6. 당도 점수 초기화 (P-051: 기본값 12)
        UserScore userScore = UserScore.builder()
                .userId(user.getId())
                .currentScore(12.0)
                .paymentScore(0.0)
                .activityScore(0.0)
                .build();
        userScoreMapper.insertUserScore(userScore);

        // 7. 토큰 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        return SignupResponse.of(user, accessToken, refreshToken);
    }

    // ==================== 002 로그인 ====================
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // 1. 사용자 조회
        User user = userMapper.selectUserByEmail(request.getEmail());
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001); // 사용자를 찾을 수 없습니다
        }

        // 2. 계정 상태 확인
        if ("SUSPENDED".equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.AUTH_003); // 정지된 계정
        }
        if ("WITHDRAWN".equals(user.getStatus())) {
            throw new BusinessException(ErrorCode.USER_005); // 탈퇴 대기 상태
        }

        // 3. 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.USER_003); // 비밀번호 불일치
        }

        // 4. 세션 생성
        Session session = Session.builder()
                .userId(user.getId())
                .sessionType("LOGIN")
                .deviceInfo(request.getDeviceInfo())
                .ipAddress(request.getIpAddress())
                .expiresAt(LocalDateTime.now().plusDays(14))
                .build();
        sessionMapper.insertSession(session);

        // 5. 토큰 발급
        String accessToken = jwtTokenProvider.createAccessToken(user.getId());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());

        return LoginResponse.of(user, accessToken, refreshToken);
    }

    // ==================== 003 로그아웃 ====================
    @Transactional
    public void logout(Long userId, String accessToken) {
        // 1. 현재 세션 무효화
        sessionMapper.invalidateSessionByUserId(userId);

        // 2. 토큰 블랙리스트 등록 (Redis)
        long expiration = jwtTokenProvider.getExpiration(accessToken);
        redisTemplate.opsForValue().set(
            "blacklist:" + accessToken, 
            "true", 
            expiration, 
            TimeUnit.MILLISECONDS
        );
    }

    // ==================== 004 토큰 갱신 ====================
    @Transactional
    public TokenResponse refresh(RefreshRequest request) {
        // 1. 리프레시 토큰 검증
        if (!jwtTokenProvider.validateRefreshToken(request.getRefreshToken())) {
            throw new BusinessException(ErrorCode.AUTH_004); // 리프레시 토큰 만료
        }

        // 2. 사용자 ID 추출
        Long userId = jwtTokenProvider.getUserIdFromRefreshToken(request.getRefreshToken());

        // 3. 사용자 존재 확인
        User user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        // 4. 새 토큰 발급
        String newAccessToken = jwtTokenProvider.createAccessToken(userId);
        String newRefreshToken = jwtTokenProvider.createRefreshToken(userId);

        return TokenResponse.of(newAccessToken, newRefreshToken);
    }

    // ==================== 005 인증 코드 발송 ====================
    @Transactional
    public void sendVerificationCode(EmailVerifyRequest request) {
        // 1. Rate Limit 확인 (P-007: 10회/분)
        String rateLimitKey = "email:ratelimit:" + request.getEmail();
        Long count = redisTemplate.opsForValue().increment(rateLimitKey);
        if (count == 1) {
            redisTemplate.expire(rateLimitKey, 1, TimeUnit.MINUTES);
        }
        if (count > 10) {
            throw new BusinessException(ErrorCode.AUTH_007); // 잠시 후 다시 시도
        }

        // 2. 인증 코드 생성 (6자리)
        String verificationCode = String.format("%06d", new Random().nextInt(1000000));

        // 3. Redis 저장 (5분 유효)
        String codeKey = "email:code:" + request.getEmail();
        redisTemplate.opsForValue().set(codeKey, verificationCode, 5, TimeUnit.MINUTES);

        // 4. 이메일 발송
        emailService.sendVerificationEmail(request.getEmail(), verificationCode);
    }

    // ==================== 006 인증 코드 확인 ====================
    public void confirmVerificationCode(EmailConfirmRequest request) {
        String codeKey = "email:code:" + request.getEmail();
        String storedCode = redisTemplate.opsForValue().get(codeKey);

        if (storedCode == null) {
            throw new BusinessException(ErrorCode.AUTH_008); // 인증 코드 만료
        }
        if (!storedCode.equals(request.getCode())) {
            throw new BusinessException(ErrorCode.AUTH_006); // 인증 코드 불일치
        }

        // 인증 완료 표시
        redisTemplate.opsForValue().set(
            "email:verified:" + request.getEmail(), 
            "true", 
            30, 
            TimeUnit.MINUTES
        );
        redisTemplate.delete(codeKey);
    }

    // ==================== 007 비밀번호 재설정 요청 ====================
    @Transactional
    public void requestPasswordReset(PasswordResetRequest request) {
        // 1. 사용자 확인
        User user = userMapper.selectUserByEmail(request.getEmail());
        if (user == null) {
            // 보안: 존재 여부 노출하지 않음
            return;
        }

        // 2. 재설정 토큰 생성
        String resetToken = UUID.randomUUID().toString();

        // 3. Redis 저장 (1시간 유효)
        redisTemplate.opsForValue().set(
            "password:reset:" + resetToken,
            user.getId().toString(),
            1,
            TimeUnit.HOURS
        );

        // 4. 이메일 발송
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
    }

    // ==================== 008 비밀번호 재설정 실행 ====================
    @Transactional
    public void resetPassword(PasswordResetExecuteRequest request) {
        // 1. 토큰 검증
        String userIdStr = redisTemplate.opsForValue().get("password:reset:" + request.getToken());
        if (userIdStr == null) {
            throw new BusinessException(ErrorCode.AUTH_009); // 재설정 토큰 만료
        }

        Long userId = Long.parseLong(userIdStr);

        // 2. 비밀번호 업데이트
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        userMapper.updatePassword(userId, encodedPassword);

        // 3. 토큰 삭제
        redisTemplate.delete("password:reset:" + request.getToken());

        // 4. 모든 세션 무효화
        sessionMapper.invalidateSessionByUserId(userId);
    }
}

================================================================================
2. USER SERVICE (6 APIs)
================================================================================

/**
 * 사용자 서비스
 * 
 * 009 GET    /users/me              내 정보 조회       P0
 * 010 PUT    /users/me              내 정보 수정       P0
 * 011 PUT    /users/me/password     비밀번호 변경      P1
 * 012 DELETE /users/me              회원 탈퇴          P1
 * 013 GET    /users/{userId}        사용자 조회        P1
 * 014 GET    /users/check-nickname  닉네임 중복 체크   P0
 * 
 * 관련 테이블: users, user_scores, accounts
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserMapper userMapper;
    private final UserScoreMapper userScoreMapper;
    private final AccountMapper accountMapper;
    private final ChallengeFollowerMapper challengeFollowerMapper;
    private final PasswordEncoder passwordEncoder;

    // ==================== 009 내 정보 조회 ====================
    public UserDetailResponse getMyInfo(Long userId) {
        User user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        UserScore score = userScoreMapper.selectByUserId(userId);
        Account account = accountMapper.selectAccountByUserId(userId);

        return UserDetailResponse.of(user, score, account);
    }

    // ==================== 010 내 정보 수정 ====================
    @Transactional
    public UserDetailResponse updateMyInfo(Long userId, UserUpdateRequest request) {
        User user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        // 닉네임 변경 시 중복 확인
        if (request.getNickname() != null && 
            !request.getNickname().equals(user.getNickname())) {
            if (userMapper.existsByNickname(request.getNickname())) {
                throw new BusinessException(ErrorCode.USER_006);
            }
        }

        userMapper.updateUser(userId, request);

        return getMyInfo(userId);
    }

    // ==================== 011 비밀번호 변경 ====================
    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.USER_003); // 현재 비밀번호 불일치
        }

        // 새 비밀번호 저장
        String encodedPassword = passwordEncoder.encode(request.getNewPassword());
        userMapper.updatePassword(userId, encodedPassword);
    }

    // ==================== 012 회원 탈퇴 ====================
    @Transactional
    public void withdraw(Long userId, WithdrawRequest request) {
        User user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        // 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.USER_003);
        }

        // 활성 챌린지 확인 (리더인 챌린지가 있으면 탈퇴 불가)
        int leaderCount = challengeFollowerMapper.countByUserIdAndRole(userId, "LEADER");
        if (leaderCount > 0) {
            throw new BusinessException(ErrorCode.MEMBER_002); // 리더는 탈퇴 불가
        }

        // 모든 챌린지에서 탈퇴 처리
        challengeFollowerMapper.leaveAllChallengesByUserId(userId, "VOLUNTARY");

        // 상태 변경 (WITHDRAWN)
        userMapper.updateStatus(userId, "WITHDRAWN");
    }

    // ==================== 013 사용자 조회 ====================
    public UserResponse getUser(Long userId) {
        User user = userMapper.selectUserById(userId);
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_001);
        }

        UserScore score = userScoreMapper.selectByUserId(userId);

        return UserResponse.of(user, score);
    }

    // ==================== 014 닉네임 중복 체크 ====================
    public NicknameCheckResponse checkNickname(String nickname) {
        boolean available = !userMapper.existsByNickname(nickname);
        return NicknameCheckResponse.of(available);
    }
}

================================================================================
3. ACCOUNT SERVICE (7 APIs)
================================================================================

/**
 * 어카운트 서비스
 * 
 * 015 GET  /accounts/me               내 어카운트 조회     P0
 * 016 GET  /accounts/me/transactions  거래 내역 조회       P0
 * 017 POST /accounts/charge           크레딧 충전          P0
 * 018 POST /accounts/charge/callback  충전 콜백 (내부)     P0
 * 019 POST /accounts/withdraw         출금                 P0
 * 020 POST /accounts/support          서포트 수동 납입     P0
 * 021 GET  /accounts/fee-policy       수수료 정책 조회     P2
 * 
 * 관련 정책: P-006 ~ P-012, P-060
 * 관련 테이블: accounts, account_transactions, fee_policies
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountService {

    private final AccountMapper accountMapper;
    private final AccountTransactionMapper transactionMapper;
    private final FeePolicyMapper feePolicyMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final TossPayClient tossPayClient;

    // ==================== 015 내 어카운트 조회 ====================
    public AccountResponse getMyAccount(Long userId) {
        Account account = accountMapper.selectAccountByUserId(userId);
        if (account == null) {
            throw new BusinessException(ErrorCode.ACCOUNT_001);
        }
        return AccountResponse.of(account);
    }

    // ==================== 016 거래 내역 조회 ====================
    public Page<TransactionResponse> getTransactions(Long userId, Pageable pageable) {
        Account account = accountMapper.selectAccountByUserId(userId);
        if (account == null) {
            throw new BusinessException(ErrorCode.ACCOUNT_001);
        }

        List<AccountTransaction> transactions = transactionMapper.selectByAccountId(
            account.getId(), 
            pageable.getOffset(), 
            pageable.getPageSize()
        );
        int total = transactionMapper.countByAccountId(account.getId());

        return new PageImpl<>(
            transactions.stream().map(TransactionResponse::of).toList(),
            pageable,
            total
        );
    }

    // ==================== 017 크레딧 충전 ====================
    /**
     * P-006: 최소 충전 10,000원
     * P-007: 단일 충전 최대 1,000,000원
     */
    @Transactional
    public ChargeResponse charge(Long userId, ChargeRequest request) {
        // 1. 금액 검증
        if (request.getAmount() < 10000) {
            throw new BusinessException(ErrorCode.ACCOUNT_002); // 최소 10,000원
        }
        if (request.getAmount() > 1000000) {
            throw new BusinessException(ErrorCode.ACCOUNT_002); // 최대 1,000,000원
        }

        // 2. 어카운트 조회
        Account account = accountMapper.selectAccountByUserId(userId);
        if (account == null) {
            throw new BusinessException(ErrorCode.ACCOUNT_001);
        }

        // 3. 결제 요청 (TossPay)
        String idempotencyKey = UUID.randomUUID().toString();
        PaymentResult result = tossPayClient.requestPayment(
            request.getAmount(),
            idempotencyKey,
            "WOORIDO 크레딧 충전"
        );

        // 4. 거래 내역 생성 (PENDING)
        AccountTransaction transaction = AccountTransaction.builder()
            .accountId(account.getId())
            .type("CHARGE")
            .amount(request.getAmount())
            .balanceAfter(account.getBalance()) // 콜백에서 업데이트
            .status("PENDING")
            .idempotencyKey(idempotencyKey)
            .description("크레딧 충전")
            .build();
        transactionMapper.insertTransaction(transaction);

        return ChargeResponse.of(result.getPaymentUrl(), idempotencyKey);
    }

    // ==================== 018 충전 콜백 (내부) ====================
    /**
     * TossPay Webhook 콜백
     * idempotency_key로 중복 처리 방지
     */
    @Transactional
    public void chargeCallback(ChargeCallbackRequest request) {
        // 1. 거래 조회 (idempotency_key)
        AccountTransaction transaction = transactionMapper.selectByIdempotencyKey(
            request.getIdempotencyKey()
        );
        if (transaction == null || !"PENDING".equals(transaction.getStatus())) {
            return; // 이미 처리됨
        }

        // 2. 결제 성공 시
        if ("SUCCESS".equals(request.getStatus())) {
            // 어카운트 잔액 증가 (비관적 락)
            Account account = accountMapper.selectAccountForUpdate(transaction.getAccountId());
            accountMapper.increaseBalance(account.getId(), transaction.getAmount());

            // 거래 완료 처리
            transactionMapper.updateStatus(
                transaction.getId(), 
                "COMPLETED",
                account.getBalance() + transaction.getAmount()
            );
        } else {
            // 결제 실패
            transactionMapper.updateStatus(transaction.getId(), "FAILED", null);
        }
    }

    // ==================== 019 출금 ====================
    /**
     * P-008: 가용 크레딧 한도 내 출금
     * P-010 ~ P-012: 수수료 정책
     */
    @Transactional
    public WithdrawResponse withdraw(Long userId, WithdrawRequest request) {
        // 1. 어카운트 조회 (비관적 락)
        Account account = accountMapper.selectAccountByUserIdForUpdate(userId);
        if (account == null) {
            throw new BusinessException(ErrorCode.ACCOUNT_001);
        }

        // 2. 가용 잔액 확인
        long availableBalance = account.getBalance() - account.getLockedBalance();
        if (request.getAmount() > availableBalance) {
            throw new BusinessException(ErrorCode.ACCOUNT_003); // 출금 가능 금액 초과
        }

        // 3. 일일/월간 한도 확인
        LocalDate today = LocalDate.now();
        long dailyWithdrawn = transactionMapper.sumWithdrawByDate(account.getId(), today);
        if (dailyWithdrawn + request.getAmount() > 5000000) {
            throw new BusinessException(ErrorCode.ACCOUNT_005); // 일일 한도 초과
        }

        LocalDate monthStart = today.withDayOfMonth(1);
        long monthlyWithdrawn = transactionMapper.sumWithdrawByDateRange(
            account.getId(), monthStart, today
        );
        if (monthlyWithdrawn + request.getAmount() > 50000000) {
            throw new BusinessException(ErrorCode.ACCOUNT_006); // 월간 한도 초과
        }

        // 4. 수수료 계산
        long fee = calculateFee(request.getAmount());
        long netAmount = request.getAmount() - fee;

        // 5. 잔액 차감
        accountMapper.decreaseBalance(account.getId(), request.getAmount());

        // 6. 거래 내역 생성
        AccountTransaction transaction = AccountTransaction.builder()
            .accountId(account.getId())
            .type("WITHDRAW")
            .amount(-request.getAmount())
            .fee(fee)
            .balanceAfter(account.getBalance() - request.getAmount())
            .status("COMPLETED")
            .description("출금")
            .build();
        transactionMapper.insertTransaction(transaction);

        return WithdrawResponse.of(netAmount, fee);
    }

    // ==================== 020 서포트 수동 납입 ====================
    @Transactional
    public SupportResponse paySupport(Long userId, SupportRequest request) {
        // 1. 팔로워 확인
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            request.getChallengeId(), userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003); // 멤버가 아님
        }

        // 2. 권한 상태 확인 (P-021)
        if ("REVOKED".equals(follower.getPrivilegeStatus())) {
            throw new BusinessException(ErrorCode.MEMBER_003); // 정지된 멤버
        }

        // 3. 개인 어카운트 조회
        Account personalAccount = accountMapper.selectAccountByUserIdForUpdate(userId);
        if (personalAccount.getBalance() - personalAccount.getLockedBalance() < request.getAmount()) {
            throw new BusinessException(ErrorCode.ACCOUNT_004); // 잔액 부족
        }

        // 4. 챌린지 어카운트 조회
        Account challengeAccount = accountMapper.selectAccountByChallengeIdForUpdate(
            request.getChallengeId()
        );

        // 5. 이체 처리
        accountMapper.decreaseBalance(personalAccount.getId(), request.getAmount());
        accountMapper.increaseBalance(challengeAccount.getId(), request.getAmount());

        // 6. 거래 내역 생성 (개인)
        transactionMapper.insertTransaction(AccountTransaction.builder()
            .accountId(personalAccount.getId())
            .type("SUPPORT")
            .amount(-request.getAmount())
            .relatedChallengeId(request.getChallengeId())
            .balanceAfter(personalAccount.getBalance() - request.getAmount())
            .status("COMPLETED")
            .description("서포트 납입")
            .build());

        // 7. 거래 내역 생성 (챌린지)
        transactionMapper.insertTransaction(AccountTransaction.builder()
            .accountId(challengeAccount.getId())
            .type("SUPPORT")
            .amount(request.getAmount())
            .relatedUserId(userId)
            .balanceAfter(challengeAccount.getBalance() + request.getAmount())
            .status("COMPLETED")
            .description("서포트 수령")
            .build());

        // 8. 팔로워 납입 기록 업데이트
        followerMapper.recordSupportPayment(follower.getId(), request.getAmount());

        return SupportResponse.of(request.getAmount());
    }

    // ==================== 021 수수료 정책 조회 ====================
    public List<FeePolicyResponse> getFeePolicy() {
        List<FeePolicy> policies = feePolicyMapper.selectActivePolicies();
        return policies.stream().map(FeePolicyResponse::of).toList();
    }

    // ==================== Private Methods ====================
    /**
     * P-010: 소액 (0~9,999원) 1%
     * P-011: 일반 (10,000~200,000원) 3%
     * P-012: 고액 (200,001원 이상) 1.5%
     */
    private long calculateFee(long amount) {
        if (amount <= 9999) {
            return (long) (amount * 0.01);
        } else if (amount <= 200000) {
            return (long) (amount * 0.03);
        } else {
            return (long) (amount * 0.015);
        }
    }
}

================================================================================
4. CHALLENGE SERVICE (8 APIs)
================================================================================

/**
 * 챌린지 서비스
 * 
 * 022 POST   /challenges                         챌린지 생성          P0
 * 023 GET    /challenges                         챌린지 목록 조회     P0
 * 024 GET    /challenges/{challengeId}           챌린지 상세 조회     P0
 * 025 PUT    /challenges/{challengeId}           챌린지 수정          P0
 * 026 DELETE /challenges/{challengeId}           챌린지 삭제          P1
 * 027 GET    /challenges/me                      내 챌린지 목록       P0
 * 028 GET    /challenges/{challengeId}/account   챌린지 어카운트 조회 P0
 * 029 PUT    /challenges/{challengeId}/support/settings  자동 납입 설정 P1
 * 
 * 관련 정책: P-013 ~ P-015, P-046 ~ P-050
 * 관련 테이블: challenges, challenge_followers, accounts
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChallengeService {

    private final ChallengeMapper challengeMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final AccountMapper accountMapper;
    private final UserScoreMapper userScoreMapper;

    // ==================== 022 챌린지 생성 ====================
    /**
     * P-013: 당도 음수 사용자 가입 불가
     * CHALLENGE_007: 리더당 챌린지 생성 한도 3개
     */
    @Transactional
    public ChallengeResponse createChallenge(Long userId, ChallengeCreateRequest request) {
        // 1. 당도 확인
        UserScore score = userScoreMapper.selectByUserId(userId);
        if (score.getCurrentScore() < 0) {
            throw new BusinessException(ErrorCode.USER_004); // 당도 음수
        }

        // 2. 생성 한도 확인
        int leaderCount = followerMapper.countByUserIdAndRole(userId, "LEADER");
        if (leaderCount >= 3) {
            throw new BusinessException(ErrorCode.CHALLENGE_007); // 한도 초과
        }

        // 3. 챌린지 생성
        Challenge challenge = Challenge.builder()
            .leaderId(userId)
            .name(request.getName())
            .description(request.getDescription())
            .category(request.getCategory())
            .supportAmount(request.getSupportAmount())
            .depositMonths(request.getDepositMonths())
            .minFollowers(request.getMinFollowers())
            .maxFollowers(request.getMaxFollowers())
            .currentFollowers(1)
            .status("RECRUITING")
            .leaderBenefitRate(request.getLeaderBenefitRate())
            .build();
        challengeMapper.insertChallenge(challenge);

        // 4. 챌린지 어카운트 생성
        Account challengeAccount = Account.builder()
            .challengeId(challenge.getId())
            .accountType("CHALLENGE")
            .balance(0L)
            .lockedBalance(0L)
            .build();
        accountMapper.insertAccount(challengeAccount);

        // 5. 리더를 팔로워로 등록
        ChallengeFollower leader = ChallengeFollower.builder()
            .challengeId(challenge.getId())
            .userId(userId)
            .role("LEADER")
            .depositStatus("NONE")
            .privilegeStatus("ACTIVE")
            .autoPayEnabled(true)
            .build();
        followerMapper.insertFollower(leader);

        return ChallengeResponse.of(challenge);
    }

    // ==================== 023 챌린지 목록 조회 ====================
    public Page<ChallengeListResponse> getChallenges(ChallengeSearchRequest request, Pageable pageable) {
        List<Challenge> challenges = challengeMapper.selectChallenges(
            request.getCategory(),
            request.getStatus(),
            request.getKeyword(),
            pageable.getOffset(),
            pageable.getPageSize()
        );
        int total = challengeMapper.countChallenges(
            request.getCategory(),
            request.getStatus(),
            request.getKeyword()
        );

        return new PageImpl<>(
            challenges.stream().map(ChallengeListResponse::of).toList(),
            pageable,
            total
        );
    }

    // ==================== 024 챌린지 상세 조회 ====================
    public ChallengeDetailResponse getChallenge(Long challengeId, Long userId) {
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_001);
        }

        // 가입 여부 확인
        boolean isMember = false;
        String role = null;
        if (userId != null) {
            ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
                challengeId, userId
            );
            if (follower != null) {
                isMember = true;
                role = follower.getRole();
            }
        }

        return ChallengeDetailResponse.of(challenge, isMember, role);
    }

    // ==================== 025 챌린지 수정 ====================
    @Transactional
    public ChallengeResponse updateChallenge(Long challengeId, Long userId, ChallengeUpdateRequest request) {
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_001);
        }

        // 리더 확인
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004); // 리더만 가능
        }

        // 수정
        challengeMapper.updateChallenge(challengeId, request);

        // P-058: 리더 활동 갱신
        challengeMapper.updateLeaderLastActiveAt(challengeId);

        return ChallengeResponse.of(challengeMapper.selectChallengeById(challengeId));
    }

    // ==================== 026 챌린지 삭제 ====================
    @Transactional
    public void deleteChallenge(Long challengeId, Long userId) {
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (challenge == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_001);
        }

        // 리더 확인
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // IN_PROGRESS 상태면 삭제 불가
        if ("IN_PROGRESS".equals(challenge.getStatus())) {
            throw new BusinessException(ErrorCode.CHALLENGE_010);
        }

        // Soft Delete
        challengeMapper.deleteChallenge(challengeId);
    }

    // ==================== 027 내 챌린지 목록 ====================
    public List<MyChallengeResponse> getMyChallenges(Long userId) {
        List<ChallengeFollower> followers = followerMapper.selectFollowersByUserId(userId, null);
        
        return followers.stream().map(f -> {
            Challenge challenge = challengeMapper.selectChallengeById(f.getChallengeId());
            return MyChallengeResponse.of(challenge, f);
        }).toList();
    }

    // ==================== 028 챌린지 어카운트 조회 ====================
    public ChallengeAccountResponse getChallengeAccount(Long challengeId, Long userId) {
        // 멤버 확인
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        Account account = accountMapper.selectAccountByChallengeId(challengeId);
        return ChallengeAccountResponse.of(account);
    }

    // ==================== 029 자동 납입 설정 ====================
    @Transactional
    public void updateAutoPaySetting(Long challengeId, Long userId, AutoPayRequest request) {
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        followerMapper.updateAutoPayEnabled(follower.getId(), request.isEnabled());
    }
}

================================================================================
5. CHALLENGE FOLLOWER SERVICE (5 APIs)
================================================================================

/**
 * 챌린지 팔로워 서비스 (용어 변경: member → follower)
 * 
 * 030 POST   /challenges/{challengeId}/join                 챌린지 가입      P0
 * 031 DELETE /challenges/{challengeId}/leave                챌린지 탈퇴      P0
 * 032 GET    /challenges/{challengeId}/members              멤버 목록 조회   P0
 * 033 GET    /challenges/{challengeId}/members/{memberId}   멤버 상세 조회   P1
 * 034 POST   /challenges/{challengeId}/delegate             리더 위임        P1
 * 
 * 관련 정책: P-013 ~ P-015, P-021, P-033 ~ P-035, P-052
 * 관련 테이블: challenge_followers, challenges, accounts
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChallengeFollowerService {

    private final ChallengeFollowerMapper followerMapper;
    private final ChallengeMapper challengeMapper;
    private final AccountMapper accountMapper;
    private final UserScoreMapper userScoreMapper;
    private final AccountTransactionMapper transactionMapper;

    // ==================== 030 챌린지 가입 ====================
    /**
     * P-013: 당도 음수 가입 불가
     * P-014: 보증금 = 서포트 * depositMonths
     * P-015: 입회비 = 챌린지 잔액 / (현재 팔로워 수 - 1), 잔액 > 0일 때만
     */
    @Transactional
    public JoinResponse joinChallenge(Long challengeId, Long userId) {
        // 1. 챌린지 확인
        Challenge challenge = challengeMapper.selectChallengeForUpdate(challengeId);
        if (challenge == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_001);
        }

        // 2. 모집 중 확인
        if (!"RECRUITING".equals(challenge.getStatus())) {
            throw new BusinessException(ErrorCode.CHALLENGE_006);
        }

        // 3. 정원 확인
        if (challenge.getCurrentFollowers() >= challenge.getMaxFollowers()) {
            throw new BusinessException(ErrorCode.CHALLENGE_005);
        }

        // 4. 중복 가입 확인
        if (followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_002);
        }

        // 5. 당도 확인
        UserScore score = userScoreMapper.selectByUserId(userId);
        if (score.getCurrentScore() < 0) {
            throw new BusinessException(ErrorCode.USER_004);
        }

        // 6. 개인 어카운트 확인
        Account personalAccount = accountMapper.selectAccountByUserIdForUpdate(userId);
        
        // 7. 보증금 계산
        long depositAmount = challenge.getSupportAmount() * challenge.getDepositMonths();

        // 8. 입회비 계산 (P-015)
        long entryFee = 0;
        Account challengeAccount = accountMapper.selectAccountByChallengeId(challengeId);
        if (challengeAccount.getBalance() > 0 && challenge.getCurrentFollowers() > 1) {
            entryFee = challengeAccount.getBalance() / (challenge.getCurrentFollowers() - 1);
        }

        // 9. 총 필요 금액 확인
        long totalRequired = depositAmount + entryFee;
        long availableBalance = personalAccount.getBalance() - personalAccount.getLockedBalance();
        if (availableBalance < totalRequired) {
            throw new BusinessException(ErrorCode.ACCOUNT_004);
        }

        // 10. 보증금 락
        accountMapper.lockBalance(personalAccount.getId(), depositAmount);

        // 11. 입회비 이체 (있는 경우)
        if (entryFee > 0) {
            accountMapper.decreaseBalance(personalAccount.getId(), entryFee);
            accountMapper.increaseBalance(challengeAccount.getId(), entryFee);

            // 거래 내역
            transactionMapper.insertTransaction(AccountTransaction.builder()
                .accountId(personalAccount.getId())
                .type("ENTRY_FEE")
                .amount(-entryFee)
                .relatedChallengeId(challengeId)
                .balanceAfter(personalAccount.getBalance() - entryFee)
                .status("COMPLETED")
                .description("입회비 납입")
                .build());
        }

        // 12. 팔로워 등록
        ChallengeFollower follower = ChallengeFollower.builder()
            .challengeId(challengeId)
            .userId(userId)
            .role("FOLLOWER")
            .depositStatus("LOCKED")
            .entryFeeAmount(entryFee)
            .privilegeStatus("ACTIVE")
            .autoPayEnabled(true)
            .build();
        followerMapper.insertFollower(follower);
        followerMapper.lockDeposit(follower.getId());

        // 13. 챌린지 인원 증가
        challengeMapper.incrementCurrentFollowers(challengeId);

        return JoinResponse.of(depositAmount, entryFee);
    }

    // ==================== 031 챌린지 탈퇴 ====================
    /**
     * P-052: 정상 탈퇴 시 보증금 반환
     */
    @Transactional
    public void leaveChallenge(Long challengeId, Long userId) {
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.MEMBER_001);
        }

        // 리더는 탈퇴 불가 (위임 먼저 필요)
        if ("LEADER".equals(follower.getRole())) {
            throw new BusinessException(ErrorCode.MEMBER_002);
        }

        // 보증금 반환 (LOCKED 상태인 경우)
        if ("LOCKED".equals(follower.getDepositStatus())) {
            Challenge challenge = challengeMapper.selectChallengeById(challengeId);
            long depositAmount = challenge.getSupportAmount() * challenge.getDepositMonths();

            Account personalAccount = accountMapper.selectAccountByUserIdForUpdate(userId);
            accountMapper.unlockBalance(personalAccount.getId(), depositAmount);

            followerMapper.unlockDeposit(follower.getId());
        }

        // 탈퇴 처리
        followerMapper.leaveChallenge(follower.getId(), "VOLUNTARY");

        // 챌린지 인원 감소
        challengeMapper.decrementCurrentFollowers(challengeId);
    }

    // ==================== 032 멤버 목록 조회 ====================
    public List<MemberResponse> getMembers(Long challengeId, Long userId) {
        // 멤버 확인
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<ChallengeFollower> followers = followerMapper.selectFollowersByChallengeId(
            challengeId, null
        );

        return followers.stream().map(f -> {
            UserScore score = userScoreMapper.selectByUserId(f.getUserId());
            return MemberResponse.of(f, score);
        }).toList();
    }

    // ==================== 033 멤버 상세 조회 ====================
    public MemberDetailResponse getMember(Long challengeId, Long memberId, Long userId) {
        // 요청자 멤버 확인
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        ChallengeFollower follower = followerMapper.selectFollowerById(memberId);
        if (follower == null || !follower.getChallengeId().equals(challengeId)) {
            throw new BusinessException(ErrorCode.MEMBER_001);
        }

        UserScore score = userScoreMapper.selectByUserId(follower.getUserId());

        return MemberDetailResponse.of(follower, score);
    }

    // ==================== 034 리더 위임 ====================
    /**
     * P-033 ~ P-035: 리더 승계 정책
     */
    @Transactional
    public void delegateLeader(Long challengeId, Long userId, DelegateRequest request) {
        // 현재 리더 확인
        ChallengeFollower currentLeader = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (currentLeader == null || !"LEADER".equals(currentLeader.getRole())) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // 자기 자신 위임 불가
        if (userId.equals(request.getTargetUserId())) {
            throw new BusinessException(ErrorCode.MEMBER_004);
        }

        // 위임 대상 확인
        ChallengeFollower newLeader = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, request.getTargetUserId()
        );
        if (newLeader == null) {
            throw new BusinessException(ErrorCode.MEMBER_001);
        }

        // 권한 박탈 상태면 위임 불가
        if ("REVOKED".equals(newLeader.getPrivilegeStatus())) {
            throw new BusinessException(ErrorCode.MEMBER_003);
        }

        // 리더 변경
        followerMapper.demoteFromLeader(currentLeader.getId());
        followerMapper.promoteToLeader(newLeader.getId());

        // 챌린지 리더 ID 변경
        challengeMapper.updateLeaderId(challengeId, request.getTargetUserId());

        // P-058: 리더 활동 갱신
        challengeMapper.updateLeaderLastActiveAt(challengeId);
    }
}

================================================================================
6. MEETING SERVICE (6 APIs)
================================================================================

/**
 * 모임 서비스
 * 
 * 035 GET  /challenges/{challengeId}/meetings  모임 목록 조회   P0
 * 036 GET  /meetings/{meetingId}               모임 상세 조회   P0
 * 037 POST /challenges/{challengeId}/meetings  모임 생성        P0
 * 038 PUT  /meetings/{meetingId}               모임 수정        P1
 * 039 POST /meetings/{meetingId}/attendance    참석 의사 표시   P0
 * 040 POST /meetings/{meetingId}/complete      모임 완료 처리   P0
 * 
 * 관련 정책: P-043 ~ P-045, P-054
 * 관련 테이블: meetings, meeting_votes, meeting_vote_records
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MeetingService {

    private final MeetingMapper meetingMapper;
    private final MeetingVoteMapper voteMapper;
    private final MeetingVoteRecordMapper voteRecordMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final ChallengeMapper challengeMapper;
    private final UserScoreMapper userScoreMapper;

    // ==================== 035 모임 목록 조회 ====================
    public List<MeetingResponse> getMeetings(Long challengeId, Long userId) {
        // 멤버 확인
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<Meeting> meetings = meetingMapper.selectMeetingsByChallengeId(challengeId);
        return meetings.stream().map(MeetingResponse::of).toList();
    }

    // ==================== 036 모임 상세 조회 ====================
    public MeetingDetailResponse getMeeting(Long meetingId, Long userId) {
        Meeting meeting = meetingMapper.selectMeetingById(meetingId);
        if (meeting == null) {
            throw new BusinessException(ErrorCode.MEETING_001);
        }

        // 멤버 확인
        if (!followerMapper.existsByChallengeAndUser(meeting.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // 투표 현황
        MeetingVote vote = voteMapper.selectVoteByMeetingId(meetingId);
        List<MeetingVoteRecord> records = voteRecordMapper.selectRecordsByVoteId(vote.getId());

        return MeetingDetailResponse.of(meeting, vote, records);
    }

    // ==================== 037 모임 생성 ====================
    /**
     * P-043: 과반수 참석 필수
     */
    @Transactional
    public MeetingResponse createMeeting(Long challengeId, Long userId, MeetingCreateRequest request) {
        // 리더 확인
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // 모임 생성
        Meeting meeting = Meeting.builder()
            .challengeId(challengeId)
            .title(request.getTitle())
            .description(request.getDescription())
            .meetingDate(request.getMeetingDate())
            .location(request.getLocation())
            .status("VOTING")
            .build();
        meetingMapper.insertMeeting(meeting);

        // 투표 생성
        MeetingVote vote = MeetingVote.builder()
            .meetingId(meeting.getId())
            .challengeId(challengeId)
            .totalVoters(challenge.getCurrentFollowers())
            .agreeCount(0)
            .disagreeCount(0)
            .expiresAt(LocalDateTime.now().plusDays(3))
            .build();
        voteMapper.insertVote(vote);

        // P-058: 리더 활동 갱신
        challengeMapper.updateLeaderLastActiveAt(challengeId);

        return MeetingResponse.of(meeting);
    }

    // ==================== 038 모임 수정 ====================
    @Transactional
    public MeetingResponse updateMeeting(Long meetingId, Long userId, MeetingUpdateRequest request) {
        Meeting meeting = meetingMapper.selectMeetingById(meetingId);
        if (meeting == null) {
            throw new BusinessException(ErrorCode.MEETING_001);
        }

        // 리더 확인
        Challenge challenge = challengeMapper.selectChallengeById(meeting.getChallengeId());
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // VOTING 상태에서만 수정 가능
        if (!"VOTING".equals(meeting.getStatus())) {
            throw new BusinessException(ErrorCode.MEETING_002);
        }

        meetingMapper.updateMeeting(meetingId, request);

        return MeetingResponse.of(meetingMapper.selectMeetingById(meetingId));
    }

    // ==================== 039 참석 의사 표시 ====================
    /**
     * P-044: 참석자만 투표 가능
     * MeetingVoteChoice: AGREE / DISAGREE
     */
    @Transactional
    public void vote(Long meetingId, Long userId, AttendanceRequest request) {
        Meeting meeting = meetingMapper.selectMeetingById(meetingId);
        if (meeting == null) {
            throw new BusinessException(ErrorCode.MEETING_001);
        }

        // 멤버 확인
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            meeting.getChallengeId(), userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // VOTING 상태 확인
        if (!"VOTING".equals(meeting.getStatus())) {
            throw new BusinessException(ErrorCode.MEETING_002);
        }

        // 투표 조회
        MeetingVote vote = voteMapper.selectVoteByMeetingIdForUpdate(meetingId);

        // 중복 투표 확인
        if (voteRecordMapper.existsByVoteIdAndUserId(vote.getId(), userId)) {
            throw new BusinessException(ErrorCode.MEETING_003);
        }

        // 투표 기록
        MeetingVoteRecord record = MeetingVoteRecord.builder()
            .voteId(vote.getId())
            .userId(userId)
            .choice(request.getChoice()) // AGREE / DISAGREE
            .build();
        voteRecordMapper.insertRecord(record);

        // 투표 수 업데이트
        if ("AGREE".equals(request.getChoice())) {
            voteMapper.incrementAgreeCount(vote.getId());
        } else {
            voteMapper.incrementDisagreeCount(vote.getId());
        }

        // 과반수 달성 시 모임 확정 (P-043)
        int totalVoters = vote.getTotalVoters();
        int agreeCount = vote.getAgreeCount() + ("AGREE".equals(request.getChoice()) ? 1 : 0);
        if (agreeCount > totalVoters / 2) {
            meetingMapper.updateStatus(meetingId, "CONFIRMED");
        }
    }

    // ==================== 040 모임 완료 처리 ====================
    /**
     * P-054: NO_SHOW 패널티 -0.09점
     */
    @Transactional
    public void completeMeeting(Long meetingId, Long userId, MeetingCompleteRequest request) {
        Meeting meeting = meetingMapper.selectMeetingById(meetingId);
        if (meeting == null) {
            throw new BusinessException(ErrorCode.MEETING_001);
        }

        // 리더 확인
        Challenge challenge = challengeMapper.selectChallengeById(meeting.getChallengeId());
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // CONFIRMED 상태 확인
        if (!"CONFIRMED".equals(meeting.getStatus())) {
            throw new BusinessException(ErrorCode.MEETING_002);
        }

        // 참석자 처리 (당도 +0.09)
        for (Long attendeeId : request.getAttendeeIds()) {
            userScoreMapper.addActivityScore(attendeeId, 0.09);
        }

        // NO_SHOW 처리 (P-054: -0.09)
        MeetingVote vote = voteMapper.selectVoteByMeetingId(meetingId);
        List<MeetingVoteRecord> agreeRecords = voteRecordMapper.selectRecordsByVoteIdAndChoice(
            vote.getId(), "AGREE"
        );
        for (MeetingVoteRecord record : agreeRecords) {
            if (!request.getAttendeeIds().contains(record.getUserId())) {
                userScoreMapper.addActivityScore(record.getUserId(), -0.09);
            }
        }

        // 모임 완료 처리
        meetingMapper.updateStatus(meetingId, "COMPLETED");
        meetingMapper.updateActualAttendees(meetingId, request.getAttendeeIds().size());
    }
}

================================================================================
7. VOTE SERVICE (5 APIs)
================================================================================

/**
 * 일반 투표 서비스 (강퇴/리더 강퇴/해산)
 * 
 * 041 GET  /challenges/{challengeId}/votes  투표 목록 조회   P0
 * 042 GET  /votes/{voteId}                  투표 상세 조회   P0
 * 043 POST /challenges/{challengeId}/votes  투표 생성        P0
 * 044 PUT  /votes/{voteId}/cast             투표하기         P0
 * 045 GET  /votes/{voteId}/result           투표 결과 조회   P1
 * 
 * 관련 정책: P-037 ~ P-042
 * VoteType: KICK, LEADER_KICK, DISSOLVE
 * GeneralVoteChoice: APPROVE / REJECT
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VoteService {

    private final GeneralVoteMapper voteMapper;
    private final GeneralVoteRecordMapper recordMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final ChallengeMapper challengeMapper;

    // ==================== 041 투표 목록 조회 ====================
    public List<VoteResponse> getVotes(Long challengeId, Long userId) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<GeneralVote> votes = voteMapper.selectVotesByChallengeId(challengeId);
        return votes.stream().map(VoteResponse::of).toList();
    }

    // ==================== 042 투표 상세 조회 ====================
    public VoteDetailResponse getVote(Long voteId, Long userId) {
        GeneralVote vote = voteMapper.selectVoteById(voteId);
        if (vote == null) {
            throw new BusinessException(ErrorCode.VOTE_001);
        }

        if (!followerMapper.existsByChallengeAndUser(vote.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<GeneralVoteRecord> records = recordMapper.selectRecordsByVoteId(voteId);
        boolean hasVoted = recordMapper.existsByVoteIdAndUserId(voteId, userId);

        return VoteDetailResponse.of(vote, records, hasVoted);
    }

    // ==================== 043 투표 생성 ====================
    /**
     * P-037 ~ P-041: 투표 정책
     * VOTE_002: 마감 시간 최소 24시간
     * VOTE_004: 동일 유형 투표 진행 중 불가
     */
    @Transactional
    public VoteResponse createVote(Long challengeId, Long userId, VoteCreateRequest request) {
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // 권한 박탈 상태 확인
        if ("REVOKED".equals(follower.getPrivilegeStatus())) {
            throw new BusinessException(ErrorCode.VOTE_003);
        }

        // 마감 시간 검증
        if (request.getExpiresAt().isBefore(LocalDateTime.now().plusHours(24))) {
            throw new BusinessException(ErrorCode.VOTE_002);
        }

        // 동일 유형 진행 중 투표 확인
        if (voteMapper.existsInProgressByTypeAndChallenge(request.getType(), challengeId)) {
            throw new BusinessException(ErrorCode.VOTE_004);
        }

        // LEADER_KICK은 일반 팔로워만 생성 가능 (P-035)
        if ("LEADER_KICK".equals(request.getType()) && "LEADER".equals(follower.getRole())) {
            throw new BusinessException(ErrorCode.VOTE_003);
        }

        Challenge challenge = challengeMapper.selectChallengeById(challengeId);

        GeneralVote vote = GeneralVote.builder()
            .challengeId(challengeId)
            .type(request.getType())
            .title(request.getTitle())
            .description(request.getDescription())
            .targetUserId(request.getTargetUserId())
            .createdBy(userId)
            .totalVoters(challenge.getCurrentFollowers())
            .approveCount(0)
            .rejectCount(0)
            .status("IN_PROGRESS")
            .expiresAt(request.getExpiresAt())
            .build();
        voteMapper.insertVote(vote);

        return VoteResponse.of(vote);
    }

    // ==================== 044 투표하기 ====================
    @Transactional
    public void castVote(Long voteId, Long userId, VoteCastRequest request) {
        GeneralVote vote = voteMapper.selectVoteByIdForUpdate(voteId);
        if (vote == null) {
            throw new BusinessException(ErrorCode.VOTE_001);
        }

        // 멤버 확인
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            vote.getChallengeId(), userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // 권한 확인
        if ("REVOKED".equals(follower.getPrivilegeStatus())) {
            throw new BusinessException(ErrorCode.VOTE_003);
        }

        // 진행 중 확인
        if (!"IN_PROGRESS".equals(vote.getStatus())) {
            throw new BusinessException(ErrorCode.VOTE_005);
        }

        // 만료 확인
        if (vote.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.VOTE_005);
        }

        // 중복 투표 확인
        if (recordMapper.existsByVoteIdAndUserId(voteId, userId)) {
            throw new BusinessException(ErrorCode.VOTE_006);
        }

        // 투표 기록
        GeneralVoteRecord record = GeneralVoteRecord.builder()
            .voteId(voteId)
            .userId(userId)
            .choice(request.getChoice()) // APPROVE / REJECT
            .build();
        recordMapper.insertRecord(record);

        // 투표 수 업데이트
        if ("APPROVE".equals(request.getChoice())) {
            voteMapper.incrementApproveCount(voteId);
        } else {
            voteMapper.incrementRejectCount(voteId);
        }

        // 투표 결과 확인 및 처리
        checkVoteResult(vote);
    }

    // ==================== 045 투표 결과 조회 ====================
    public VoteResultResponse getVoteResult(Long voteId, Long userId) {
        GeneralVote vote = voteMapper.selectVoteById(voteId);
        if (vote == null) {
            throw new BusinessException(ErrorCode.VOTE_001);
        }

        if (!followerMapper.existsByChallengeAndUser(vote.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // 진행 중이면 결과 조회 불가
        if ("IN_PROGRESS".equals(vote.getStatus())) {
            throw new BusinessException(ErrorCode.VOTE_007);
        }

        return VoteResultResponse.of(vote);
    }

    // ==================== Private Methods ====================
    private void checkVoteResult(GeneralVote vote) {
        int totalVoters = vote.getTotalVoters();
        int approveCount = vote.getApproveCount();
        int rejectCount = vote.getRejectCount();

        // 과반수 승인
        if (approveCount > totalVoters / 2) {
            voteMapper.updateStatus(vote.getId(), "APPROVED");
            executeVoteResult(vote);
        }
        // 과반수 거절
        else if (rejectCount > totalVoters / 2) {
            voteMapper.updateStatus(vote.getId(), "REJECTED");
        }
    }

    private void executeVoteResult(GeneralVote vote) {
        switch (vote.getType()) {
            case "KICK" -> executeKick(vote);
            case "LEADER_KICK" -> executeLeaderKick(vote);
            case "DISSOLVE" -> executeDissolve(vote);
        }
    }

    private void executeKick(GeneralVote vote) {
        followerMapper.leaveChallenge(
            followerMapper.selectFollowerByChallengeAndUser(
                vote.getChallengeId(), vote.getTargetUserId()
            ).getId(),
            "KICKED"
        );
        challengeMapper.decrementCurrentFollowers(vote.getChallengeId());
    }

    private void executeLeaderKick(GeneralVote vote) {
        // 리더 강퇴 시 당도 최고자에게 승계
        ChallengeFollower highestScoreFollower = followerMapper
            .selectHighestScoreFollowerByChallengeId(vote.getChallengeId());
        
        ChallengeFollower currentLeader = followerMapper.selectLeaderByChallengeId(
            vote.getChallengeId()
        );
        
        followerMapper.demoteFromLeader(currentLeader.getId());
        followerMapper.leaveChallenge(currentLeader.getId(), "KICKED");
        followerMapper.promoteToLeader(highestScoreFollower.getId());
        challengeMapper.updateLeaderId(vote.getChallengeId(), highestScoreFollower.getUserId());
        challengeMapper.decrementCurrentFollowers(vote.getChallengeId());
    }

    private void executeDissolve(GeneralVote vote) {
        challengeMapper.updateStatus(vote.getChallengeId(), "COMPLETED");
        // 정산 로직은 SettlementService에서 처리
    }
}

================================================================================
8. EXPENSE SERVICE (6 APIs)
================================================================================

/**
 * 지출 서비스
 * 
 * 046 GET    /challenges/{challengeId}/expenses  지출 목록 조회   P0
 * 047 GET    /expenses/{expenseId}               지출 상세 조회   P0
 * 048 POST   /challenges/{challengeId}/expenses  지출 요청        P0
 * 049 PUT    /expenses/{expenseId}               지출 요청 수정   P1
 * 050 DELETE /expenses/{expenseId}               지출 요청 취소   P1
 * 051 POST   /expenses/{expenseId}/execute       지출 실행        P0
 * 
 * 관련 정책: P-029, P-042, P-053
 * ExpenseStatus: PENDING, VOTING, APPROVED, REJECTED, EXECUTING, COMPLETED, CANCELLED
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRequestMapper expenseMapper;
    private final ExpenseVoteMapper voteMapper;
    private final ExpenseVoteRecordMapper recordMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final ChallengeMapper challengeMapper;
    private final AccountMapper accountMapper;
    private final LedgerEntryMapper ledgerMapper;
    private final PaymentBarcodeMapper barcodeMapper;

    // ==================== 046 지출 목록 조회 ====================
    public Page<ExpenseResponse> getExpenses(Long challengeId, Long userId, Pageable pageable) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<ExpenseRequest> expenses = expenseMapper.selectExpensesByChallengeId(
            challengeId, pageable.getOffset(), pageable.getPageSize()
        );
        int total = expenseMapper.countExpensesByChallengeId(challengeId);

        return new PageImpl<>(
            expenses.stream().map(ExpenseResponse::of).toList(),
            pageable,
            total
        );
    }

    // ==================== 047 지출 상세 조회 ====================
    public ExpenseDetailResponse getExpense(Long expenseId, Long userId) {
        ExpenseRequest expense = expenseMapper.selectExpenseById(expenseId);
        if (expense == null) {
            throw new BusinessException(ErrorCode.EXPENSE_001);
        }

        if (!followerMapper.existsByChallengeAndUser(expense.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.EXPENSE_003);
        }

        ExpenseVote vote = voteMapper.selectVoteByExpenseId(expenseId);
        List<ExpenseVoteRecord> records = vote != null 
            ? recordMapper.selectRecordsByVoteId(vote.getId()) 
            : List.of();

        return ExpenseDetailResponse.of(expense, vote, records);
    }

    // ==================== 048 지출 요청 ====================
    @Transactional
    public ExpenseResponse createExpense(Long challengeId, Long userId, ExpenseCreateRequest request) {
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // 권한 확인
        if ("REVOKED".equals(follower.getPrivilegeStatus())) {
            throw new BusinessException(ErrorCode.EXPENSE_003);
        }

        // 잔액 확인
        Account challengeAccount = accountMapper.selectAccountByChallengeId(challengeId);
        if (request.getAmount() > challengeAccount.getBalance()) {
            throw new BusinessException(ErrorCode.EXPENSE_004);
        }

        // 지출 요청 생성
        ExpenseRequest expense = ExpenseRequest.builder()
            .challengeId(challengeId)
            .requesterId(userId)
            .meetingId(request.getMeetingId())
            .amount(request.getAmount())
            .category(request.getCategory())
            .description(request.getDescription())
            .status("PENDING")
            .build();
        expenseMapper.insertExpense(expense);

        return ExpenseResponse.of(expense);
    }

    // ==================== 049 지출 요청 수정 ====================
    @Transactional
    public ExpenseResponse updateExpense(Long expenseId, Long userId, ExpenseUpdateRequest request) {
        ExpenseRequest expense = expenseMapper.selectExpenseById(expenseId);
        if (expense == null) {
            throw new BusinessException(ErrorCode.EXPENSE_001);
        }

        // 요청자 확인
        if (!expense.getRequesterId().equals(userId)) {
            throw new BusinessException(ErrorCode.EXPENSE_006);
        }

        // PENDING 상태만 수정 가능
        if (!"PENDING".equals(expense.getStatus())) {
            throw new BusinessException(ErrorCode.EXPENSE_005);
        }

        expenseMapper.updateExpense(expenseId, request);

        return ExpenseResponse.of(expenseMapper.selectExpenseById(expenseId));
    }

    // ==================== 050 지출 요청 취소 ====================
    @Transactional
    public void cancelExpense(Long expenseId, Long userId) {
        ExpenseRequest expense = expenseMapper.selectExpenseById(expenseId);
        if (expense == null) {
            throw new BusinessException(ErrorCode.EXPENSE_001);
        }

        if (!expense.getRequesterId().equals(userId)) {
            throw new BusinessException(ErrorCode.EXPENSE_006);
        }

        if (!"PENDING".equals(expense.getStatus()) && !"VOTING".equals(expense.getStatus())) {
            throw new BusinessException(ErrorCode.EXPENSE_005);
        }

        expenseMapper.updateStatus(expenseId, "CANCELLED");
    }

    // ==================== 051 지출 실행 ====================
    /**
     * P-053: 바코드 발급 후 10분 유효
     */
    @Transactional
    public ExpenseExecuteResponse executeExpense(Long expenseId, Long userId) {
        ExpenseRequest expense = expenseMapper.selectExpenseById(expenseId);
        if (expense == null) {
            throw new BusinessException(ErrorCode.EXPENSE_001);
        }

        // 리더 또는 요청자만 실행 가능
        Challenge challenge = challengeMapper.selectChallengeById(expense.getChallengeId());
        if (!challenge.getLeaderId().equals(userId) && !expense.getRequesterId().equals(userId)) {
            throw new BusinessException(ErrorCode.EXPENSE_006);
        }

        // APPROVED 상태만 실행 가능
        if (!"APPROVED".equals(expense.getStatus())) {
            throw new BusinessException(ErrorCode.EXPENSE_005);
        }

        // 바코드 생성 (P-053: 10분 유효)
        String barcodeValue = generateBarcodeValue();
        PaymentBarcode barcode = PaymentBarcode.builder()
            .expenseId(expenseId)
            .challengeId(expense.getChallengeId())
            .barcodeValue(barcodeValue)
            .amount(expense.getAmount())
            .status("ACTIVE")
            .expiresAt(LocalDateTime.now().plusMinutes(10))
            .build();
        barcodeMapper.insertBarcode(barcode);

        // 상태 변경
        expenseMapper.updateStatus(expenseId, "EXECUTING");

        return ExpenseExecuteResponse.of(barcodeValue, barcode.getExpiresAt());
    }

    private String generateBarcodeValue() {
        return "WRD" + System.currentTimeMillis() + 
               String.format("%04d", new Random().nextInt(10000));
    }
}

================================================================================
9. LEDGER SERVICE (5 APIs)
================================================================================

/**
 * 장부 서비스
 * 
 * 052 GET  /challenges/{challengeId}/ledger         장부 조회       P0
 * 053 GET  /challenges/{challengeId}/ledger/export  장부 내보내기   P2
 * 054 GET  /challenges/{challengeId}/ledger/summary 장부 요약       P1
 * 055 POST /challenges/{challengeId}/ledger         장부 등록       P1
 * 056 PUT  /ledger/{entryId}                        장부 수정       P1
 * 
 * 관련 정책: P-029
 * 관련 테이블: ledger_entries, expenses
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LedgerService {

    private final LedgerEntryMapper ledgerMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final ChallengeMapper challengeMapper;

    // ==================== 052 장부 조회 ====================
    public Page<LedgerEntryResponse> getLedger(Long challengeId, Long userId, Pageable pageable) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<LedgerEntry> entries = ledgerMapper.selectEntriesByChallengeId(
            challengeId, pageable.getOffset(), pageable.getPageSize()
        );
        int total = ledgerMapper.countEntriesByChallengeId(challengeId);

        return new PageImpl<>(
            entries.stream().map(LedgerEntryResponse::of).toList(),
            pageable,
            total
        );
    }

    // ==================== 053 장부 내보내기 ====================
    public byte[] exportLedger(Long challengeId, Long userId, String format) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<LedgerEntry> entries = ledgerMapper.selectAllEntriesByChallengeId(challengeId);

        if ("csv".equalsIgnoreCase(format)) {
            return exportToCsv(entries);
        } else {
            return exportToExcel(entries);
        }
    }

    // ==================== 054 장부 요약 ====================
    public LedgerSummaryResponse getLedgerSummary(Long challengeId, Long userId) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        LedgerSummary summary = ledgerMapper.selectSummaryByChallengeId(challengeId);
        List<CategorySummary> categoryBreakdown = ledgerMapper.selectCategorySummaryByChallengeId(
            challengeId
        );

        return LedgerSummaryResponse.of(summary, categoryBreakdown);
    }

    // ==================== 055 장부 등록 ====================
    /**
     * P-029: 리더만 수동 등록 가능
     */
    @Transactional
    public LedgerEntryResponse createLedgerEntry(Long challengeId, Long userId, LedgerCreateRequest request) {
        // 리더 확인
        Challenge challenge = challengeMapper.selectChallengeById(challengeId);
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // 금액 검증
        if (request.getAmount() < 1) {
            throw new BusinessException(ErrorCode.LEDGER_001);
        }

        LedgerEntry entry = LedgerEntry.builder()
            .challengeId(challengeId)
            .type(request.getType())
            .amount(request.getAmount())
            .category(request.getCategory())
            .description(request.getDescription())
            .memo(request.getMemo())
            .recordedBy(userId)
            .build();
        ledgerMapper.insertEntry(entry);

        return LedgerEntryResponse.of(entry);
    }

    // ==================== 056 장부 수정 ====================
    @Transactional
    public LedgerEntryResponse updateLedgerEntry(Long entryId, Long userId, LedgerUpdateRequest request) {
        LedgerEntry entry = ledgerMapper.selectEntryById(entryId);
        if (entry == null) {
            throw new BusinessException(ErrorCode.LEDGER_004);
        }

        // 리더 확인
        Challenge challenge = challengeMapper.selectChallengeById(entry.getChallengeId());
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // 정산 완료된 항목은 수정 불가
        if (entry.isSettled()) {
            throw new BusinessException(ErrorCode.LEDGER_003);
        }

        ledgerMapper.updateEntry(entryId, request);

        return LedgerEntryResponse.of(ledgerMapper.selectEntryById(entryId));
    }

    // ==================== Private Methods ====================
    private byte[] exportToCsv(List<LedgerEntry> entries) {
        StringBuilder sb = new StringBuilder();
        sb.append("날짜,유형,금액,카테고리,설명,메모\n");
        for (LedgerEntry entry : entries) {
            sb.append(String.format("%s,%s,%d,%s,%s,%s\n",
                entry.getCreatedAt().toLocalDate(),
                entry.getType(),
                entry.getAmount(),
                entry.getCategory(),
                entry.getDescription(),
                entry.getMemo() != null ? entry.getMemo() : ""
            ));
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private byte[] exportToExcel(List<LedgerEntry> entries) {
        // Apache POI 사용
        // 실제 구현 시 추가
        return new byte[0];
    }
}

================================================================================
10. POST SERVICE (9 APIs)
================================================================================

/**
 * 게시글 서비스
 * 
 * 057 GET    /posts/feed                      피드 조회          P1
 * 058 GET    /challenges/{challengeId}/posts  게시글 목록 조회   P1
 * 059 GET    /posts/{postId}                  게시글 상세 조회   P1
 * 060 POST   /challenges/{challengeId}/posts  게시글 작성        P1
 * 061 PUT    /posts/{postId}                  게시글 수정        P1
 * 062 DELETE /posts/{postId}                  게시글 삭제        P1
 * 063 POST   /posts/{postId}/like             게시글 좋아요      P1
 * 064 DELETE /posts/{postId}/like             게시글 좋아요 취소 P1
 * 065 POST   /upload/image                    이미지 업로드      P0
 * 
 * 관련 테이블: posts, post_images, post_likes
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PostService {

    private final PostMapper postMapper;
    private final PostImageMapper imageMapper;
    private final PostLikeMapper likeMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final S3Client s3Client;

    // ==================== 057 피드 조회 ====================
    public Page<PostFeedResponse> getFeed(Long userId, Pageable pageable) {
        // 내가 가입한 챌린지들의 게시글
        List<Long> myChallengeIds = followerMapper.selectFollowersByUserId(userId, null)
            .stream()
            .map(ChallengeFollower::getChallengeId)
            .toList();

        if (myChallengeIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<Post> posts = postMapper.selectPostsByChallengeIds(
            myChallengeIds, pageable.getOffset(), pageable.getPageSize()
        );
        int total = postMapper.countPostsByChallengeIds(myChallengeIds);

        return new PageImpl<>(
            posts.stream().map(p -> {
                List<PostImage> images = imageMapper.selectImagesByPostId(p.getId());
                boolean liked = likeMapper.existsByPostIdAndUserId(p.getId(), userId);
                return PostFeedResponse.of(p, images, liked);
            }).toList(),
            pageable,
            total
        );
    }

    // ==================== 058 게시글 목록 조회 ====================
    public Page<PostListResponse> getPosts(Long challengeId, Long userId, Pageable pageable) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        List<Post> posts = postMapper.selectPostsByChallengeId(
            challengeId, pageable.getOffset(), pageable.getPageSize()
        );
        int total = postMapper.countPostsByChallengeId(challengeId);

        return new PageImpl<>(
            posts.stream().map(PostListResponse::of).toList(),
            pageable,
            total
        );
    }

    // ==================== 059 게시글 상세 조회 ====================
    @Transactional
    public PostDetailResponse getPost(Long postId, Long userId) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!followerMapper.existsByChallengeAndUser(post.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.POST_002);
        }

        // 조회수 증가
        postMapper.incrementViewCount(postId);

        List<PostImage> images = imageMapper.selectImagesByPostId(postId);
        boolean liked = likeMapper.existsByPostIdAndUserId(postId, userId);

        return PostDetailResponse.of(post, images, liked);
    }

    // ==================== 060 게시글 작성 ====================
    @Transactional
    public PostResponse createPost(Long challengeId, Long userId, PostCreateRequest request) {
        ChallengeFollower follower = followerMapper.selectFollowerByChallengeAndUser(
            challengeId, userId
        );
        if (follower == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        // 공지는 리더만 가능
        if (request.isNotice() && !"LEADER".equals(follower.getRole())) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        Post post = Post.builder()
            .challengeId(challengeId)
            .authorId(userId)
            .title(request.getTitle())
            .content(request.getContent())
            .category(request.getCategory())
            .isNotice(request.isNotice())
            .isPinned(request.isPinned())
            .build();
        postMapper.insertPost(post);

        // 이미지 저장
        if (request.getImageUrls() != null) {
            int order = 1;
            for (String url : request.getImageUrls()) {
                PostImage image = PostImage.builder()
                    .postId(post.getId())
                    .imageUrl(url)
                    .displayOrder(order++)
                    .build();
                imageMapper.insertImage(image);
            }
        }

        return PostResponse.of(post);
    }

    // ==================== 061 게시글 수정 ====================
    @Transactional
    public PostResponse updatePost(Long postId, Long userId, PostUpdateRequest request) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!post.getAuthorId().equals(userId)) {
            throw new BusinessException(ErrorCode.POST_003);
        }

        postMapper.updatePost(postId, request);

        // 이미지 업데이트
        if (request.getImageUrls() != null) {
            imageMapper.deleteImagesByPostId(postId);
            int order = 1;
            for (String url : request.getImageUrls()) {
                PostImage image = PostImage.builder()
                    .postId(postId)
                    .imageUrl(url)
                    .displayOrder(order++)
                    .build();
                imageMapper.insertImage(image);
            }
        }

        return PostResponse.of(postMapper.selectPostById(postId));
    }

    // ==================== 062 게시글 삭제 ====================
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!post.getAuthorId().equals(userId)) {
            throw new BusinessException(ErrorCode.POST_003);
        }

        // Soft Delete
        postMapper.softDeletePost(postId);
    }

    // ==================== 063 게시글 좋아요 ====================
    @Transactional
    public void likePost(Long postId, Long userId) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!followerMapper.existsByChallengeAndUser(post.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.POST_002);
        }

        if (likeMapper.existsByPostIdAndUserId(postId, userId)) {
            return; // 이미 좋아요 상태
        }

        PostLike like = PostLike.builder()
            .postId(postId)
            .userId(userId)
            .build();
        likeMapper.insertLike(like);

        postMapper.incrementLikeCount(postId);
    }

    // ==================== 064 게시글 좋아요 취소 ====================
    @Transactional
    public void unlikePost(Long postId, Long userId) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!likeMapper.existsByPostIdAndUserId(postId, userId)) {
            return; // 이미 좋아요 취소 상태
        }

        likeMapper.deleteLike(postId, userId);
        postMapper.decrementLikeCount(postId);
    }

    // ==================== 065 이미지 업로드 ====================
    @Transactional
    @Retryable(
        retryFor = { S3Exception.class },
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public ImageUploadResponse uploadImage(Long userId, MultipartFile file) {
        // 파일 검증
        validateImageFile(file);

        // S3 업로드
        String fileName = generateFileName(userId, file.getOriginalFilename());
        String imageUrl = s3Client.upload(file, fileName);

        return ImageUploadResponse.of(imageUrl);
    }

    private void validateImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException(ErrorCode.FILE_001);
        }
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new BusinessException(ErrorCode.FILE_002);
        }
    }

    private String generateFileName(Long userId, String originalName) {
        String ext = originalName.substring(originalName.lastIndexOf("."));
        return String.format("posts/%d/%s%s", userId, UUID.randomUUID(), ext);
    }
}

================================================================================
11. COMMENT SERVICE (6 APIs)
================================================================================

/**
 * 댓글 서비스
 * 
 * 066 GET    /posts/{postId}/comments    댓글 목록 조회      P1
 * 067 POST   /posts/{postId}/comments    댓글 작성           P1
 * 068 PUT    /comments/{commentId}       댓글 수정           P1
 * 069 DELETE /comments/{commentId}       댓글 삭제           P1
 * 070 POST   /comments/{commentId}/like  댓글 좋아요         P2
 * 071 DELETE /comments/{commentId}/like  댓글 좋아요 취소    P2
 * 
 * 관련 테이블: comments, comment_likes
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentMapper commentMapper;
    private final CommentLikeMapper likeMapper;
    private final PostMapper postMapper;
    private final ChallengeFollowerMapper followerMapper;

    // ==================== 066 댓글 목록 조회 ====================
    public List<CommentResponse> getComments(Long postId, Long userId) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!followerMapper.existsByChallengeAndUser(post.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.POST_002);
        }

        List<Comment> comments = commentMapper.selectCommentsByPostId(postId);
        
        return comments.stream().map(c -> {
            List<Comment> replies = commentMapper.selectRepliesByParentId(c.getId());
            boolean liked = likeMapper.existsByCommentIdAndUserId(c.getId(), userId);
            return CommentResponse.of(c, replies, liked);
        }).toList();
    }

    // ==================== 067 댓글 작성 ====================
    @Transactional
    public CommentResponse createComment(Long postId, Long userId, CommentCreateRequest request) {
        Post post = postMapper.selectPostById(postId);
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_001);
        }

        if (!followerMapper.existsByChallengeAndUser(post.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.POST_002);
        }

        // 대댓글인 경우 부모 댓글 확인
        if (request.getParentId() != null) {
            Comment parent = commentMapper.selectCommentById(request.getParentId());
            if (parent == null || !parent.getPostId().equals(postId)) {
                throw new BusinessException(ErrorCode.COMMENT_001);
            }
        }

        Comment comment = Comment.builder()
            .postId(postId)
            .authorId(userId)
            .parentId(request.getParentId())
            .content(request.getContent())
            .build();
        commentMapper.insertComment(comment);

        // 게시글 댓글 수 증가
        postMapper.incrementCommentCount(postId);

        return CommentResponse.of(comment, List.of(), false);
    }

    // ==================== 068 댓글 수정 ====================
    @Transactional
    public CommentResponse updateComment(Long commentId, Long userId, CommentUpdateRequest request) {
        Comment comment = commentMapper.selectCommentById(commentId);
        if (comment == null) {
            throw new BusinessException(ErrorCode.COMMENT_001);
        }

        if (!comment.getAuthorId().equals(userId)) {
            throw new BusinessException(ErrorCode.COMMENT_002);
        }

        commentMapper.updateComment(commentId, request.getContent());

        return CommentResponse.of(commentMapper.selectCommentById(commentId), List.of(), false);
    }

    // ==================== 069 댓글 삭제 ====================
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentMapper.selectCommentById(commentId);
        if (comment == null) {
            throw new BusinessException(ErrorCode.COMMENT_001);
        }

        if (!comment.getAuthorId().equals(userId)) {
            throw new BusinessException(ErrorCode.COMMENT_002);
        }

        // Soft Delete
        commentMapper.softDeleteComment(commentId);

        // 게시글 댓글 수 감소
        postMapper.decrementCommentCount(comment.getPostId());
    }

    // ==================== 070 댓글 좋아요 ====================
    @Transactional
    public void likeComment(Long commentId, Long userId) {
        Comment comment = commentMapper.selectCommentById(commentId);
        if (comment == null) {
            throw new BusinessException(ErrorCode.COMMENT_001);
        }

        Post post = postMapper.selectPostById(comment.getPostId());
        if (!followerMapper.existsByChallengeAndUser(post.getChallengeId(), userId)) {
            throw new BusinessException(ErrorCode.POST_002);
        }

        if (likeMapper.existsByCommentIdAndUserId(commentId, userId)) {
            return;
        }

        CommentLike like = CommentLike.builder()
            .commentId(commentId)
            .userId(userId)
            .build();
        likeMapper.insertLike(like);

        commentMapper.incrementLikeCount(commentId);
    }

    // ==================== 071 댓글 좋아요 취소 ====================
    @Transactional
    public void unlikeComment(Long commentId, Long userId) {
        Comment comment = commentMapper.selectCommentById(commentId);
        if (comment == null) {
            throw new BusinessException(ErrorCode.COMMENT_001);
        }

        if (!likeMapper.existsByCommentIdAndUserId(commentId, userId)) {
            return;
        }

        likeMapper.deleteLike(commentId, userId);
        commentMapper.decrementLikeCount(commentId);
    }
}

================================================================================
12. REPORT SERVICE (2 APIs)
================================================================================

/**
 * 신고 서비스
 * 
 * 072 POST /reports    신고 접수         P1
 * 073 GET  /reports/me 내 신고 내역 조회 P2
 * 
 * 관련 정책: P-030, P-031, P-055
 * ReportReason: SPAM, HARASSMENT, INAPPROPRIATE, FRAUD, OTHER
 * ReportStatus: PENDING, REVIEWING, RESOLVED, REJECTED
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportMapper reportMapper;
    private final UserMapper userMapper;

    // ==================== 072 신고 접수 ====================
    /**
     * P-030: 신고 대상 - USER, POST, COMMENT, CHALLENGE
     */
    @Transactional
    public ReportResponse createReport(Long userId, ReportCreateRequest request) {
        // 신고 대상 존재 확인
        validateReportTarget(request.getTargetType(), request.getTargetId());

        Report report = Report.builder()
            .reporterId(userId)
            .targetType(request.getTargetType())
            .targetId(request.getTargetId())
            .reason(request.getReason())
            .description(request.getDescription())
            .status("PENDING")
            .build();
        reportMapper.insertReport(report);

        return ReportResponse.of(report);
    }

    // ==================== 073 내 신고 내역 조회 ====================
    public List<ReportResponse> getMyReports(Long userId) {
        List<Report> reports = reportMapper.selectReportsByReporterId(userId);
        return reports.stream().map(ReportResponse::of).toList();
    }

    private void validateReportTarget(String targetType, Long targetId) {
        boolean exists = switch (targetType) {
            case "USER" -> userMapper.selectUserById(targetId) != null;
            case "POST" -> true; // PostMapper 주입 필요
            case "COMMENT" -> true; // CommentMapper 주입 필요
            case "CHALLENGE" -> true; // ChallengeMapper 주입 필요
            default -> false;
        };

        if (!exists) {
            throw new BusinessException(ErrorCode.REPORT_002);
        }
    }
}

================================================================================
13. NOTIFICATION SERVICE (5 APIs)
================================================================================

/**
 * 알림 서비스
 * 
 * 074 GET /notifications                      알림 목록 조회   P0
 * 075 PUT /notifications/{notificationId}/read 알림 읽음 처리  P1
 * 076 PUT /notifications/read-all             전체 읽음 처리   P1
 * 077 GET /notifications/settings             알림 설정 조회   P1
 * 078 PUT /notifications/settings             알림 설정 변경   P1
 * 
 * 관련 정책: P-060
 * NotificationType: CHALLENGE, VOTE, MEETING, SUPPORT, SNS, SYSTEM
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationMapper notificationMapper;
    private final NotificationSettingMapper settingMapper;

    // ==================== 074 알림 목록 조회 ====================
    public Page<NotificationResponse> getNotifications(Long userId, Pageable pageable) {
        List<Notification> notifications = notificationMapper.selectNotificationsByUserId(
            userId, pageable.getOffset(), pageable.getPageSize()
        );
        int total = notificationMapper.countNotificationsByUserId(userId);

        return new PageImpl<>(
            notifications.stream().map(NotificationResponse::of).toList(),
            pageable,
            total
        );
    }

    // ==================== 075 알림 읽음 처리 ====================
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationMapper.selectNotificationById(notificationId);
        if (notification == null) {
            throw new BusinessException(ErrorCode.NOTIFICATION_001);
        }

        if (!notification.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.NOTIFICATION_001);
        }

        notificationMapper.markAsRead(notificationId);
    }

    // ==================== 076 전체 읽음 처리 ====================
    @Transactional
    public void markAllAsRead(Long userId) {
        notificationMapper.markAllAsReadByUserId(userId);
    }

    // ==================== 077 알림 설정 조회 ====================
    public NotificationSettingResponse getSettings(Long userId) {
        NotificationSetting setting = settingMapper.selectSettingByUserId(userId);
        if (setting == null) {
            // 기본 설정 생성
            setting = NotificationSetting.builder()
                .userId(userId)
                .challengeEnabled(true)
                .voteEnabled(true)
                .meetingEnabled(true)
                .supportEnabled(true)
                .snsEnabled(true)
                .systemEnabled(true)
                .build();
            settingMapper.insertSetting(setting);
        }
        return NotificationSettingResponse.of(setting);
    }

    // ==================== 078 알림 설정 변경 ====================
    @Transactional
    public NotificationSettingResponse updateSettings(Long userId, NotificationSettingRequest request) {
        NotificationSetting setting = settingMapper.selectSettingByUserId(userId);
        if (setting == null) {
            setting = NotificationSetting.builder()
                .userId(userId)
                .challengeEnabled(request.isChallengeEnabled())
                .voteEnabled(request.isVoteEnabled())
                .meetingEnabled(request.isMeetingEnabled())
                .supportEnabled(request.isSupportEnabled())
                .snsEnabled(request.isSnsEnabled())
                .systemEnabled(request.isSystemEnabled())
                .build();
            settingMapper.insertSetting(setting);
        } else {
            settingMapper.updateSetting(userId, request);
        }

        return NotificationSettingResponse.of(settingMapper.selectSettingByUserId(userId));
    }
}

================================================================================
14. REFUND SERVICE (2 APIs)
================================================================================

/**
 * 환불 서비스
 * 
 * 079 POST /refunds            환불 요청       P1
 * 080 GET  /refunds/{refundId} 환불 상태 조회  P1
 * 
 * RefundStatus: PENDING, PROCESSING, COMPLETED, REJECTED
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RefundService {

    private final RefundMapper refundMapper;
    private final AccountMapper accountMapper;

    // ==================== 079 환불 요청 ====================
    @Transactional
    public RefundResponse createRefund(Long userId, RefundCreateRequest request) {
        Account account = accountMapper.selectAccountByUserId(userId);
        if (account == null) {
            throw new BusinessException(ErrorCode.ACCOUNT_001);
        }

        // 환불 가능 금액 확인
        long availableBalance = account.getBalance() - account.getLockedBalance();
        if (request.getAmount() > availableBalance) {
            throw new BusinessException(ErrorCode.REFUND_001);
        }

        Refund refund = Refund.builder()
            .userId(userId)
            .accountId(account.getId())
            .amount(request.getAmount())
            .reason(request.getReason())
            .bankCode(request.getBankCode())
            .bankAccount(request.getBankAccount())
            .status("PENDING")
            .build();
        refundMapper.insertRefund(refund);

        return RefundResponse.of(refund);
    }

    // ==================== 080 환불 상태 조회 ====================
    public RefundResponse getRefund(Long refundId, Long userId) {
        Refund refund = refundMapper.selectRefundById(refundId);
        if (refund == null || !refund.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.REFUND_001);
        }

        return RefundResponse.of(refund);
    }
}

================================================================================
15. SETTLEMENT SERVICE (2 APIs)
================================================================================

/**
 * 정산 서비스
 * 
 * 081 POST /challenges/{challengeId}/settle    챌린지 정산     P0
 * 082 GET  /challenges/{challengeId}/settlement 정산 내역 조회 P1
 * 
 * 관련 정책: P-036
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettlementService {

    private final SettlementMapper settlementMapper;
    private final ChallengeMapper challengeMapper;
    private final ChallengeFollowerMapper followerMapper;
    private final AccountMapper accountMapper;
    private final AccountTransactionMapper transactionMapper;

    // ==================== 081 챌린지 정산 ====================
    /**
     * P-036: 챌린지 종료 시 정산
     * 리더 혜택률 적용 후 팔로워에게 분배
     */
    @Transactional
    public SettlementResponse settle(Long challengeId, Long userId) {
        Challenge challenge = challengeMapper.selectChallengeForUpdate(challengeId);
        if (challenge == null) {
            throw new BusinessException(ErrorCode.CHALLENGE_001);
        }

        // 리더 확인
        if (!challenge.getLeaderId().equals(userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_004);
        }

        // 이미 정산 진행 중인지 확인
        Settlement existingSettlement = settlementMapper.selectLatestSettlementByChallengeId(challengeId);
        if (existingSettlement != null && "PROCESSING".equals(existingSettlement.getStatus())) {
            throw new BusinessException(ErrorCode.SETTLEMENT_001);
        }
        if (existingSettlement != null && "COMPLETED".equals(existingSettlement.getStatus())) {
            throw new BusinessException(ErrorCode.SETTLEMENT_002);
        }

        // 챌린지 어카운트 조회
        Account challengeAccount = accountMapper.selectAccountByChallengeIdForUpdate(challengeId);
        long totalAmount = challengeAccount.getBalance();

        // 팔로워 목록 조회
        List<ChallengeFollower> followers = followerMapper.selectFollowersByChallengeId(challengeId, null);
        int followerCount = followers.size();

        // 리더 혜택 계산
        long leaderAmount = (long) (totalAmount * challenge.getLeaderBenefitRate() / 100.0);
        long remainingAmount = totalAmount - leaderAmount;
        long followerAmount = remainingAmount / followerCount;

        // 정산 기록 생성
        Settlement settlement = Settlement.builder()
            .challengeId(challengeId)
            .type("COMPLETION")
            .totalAmount(totalAmount)
            .leaderAmount(leaderAmount)
            .followerAmount(followerAmount)
            .followerCount(followerCount)
            .status("PROCESSING")
            .build();
        settlementMapper.insertSettlement(settlement);

        // 각 팔로워에게 정산금 이체
        for (ChallengeFollower follower : followers) {
            long amount = "LEADER".equals(follower.getRole()) 
                ? followerAmount + leaderAmount 
                : followerAmount;

            Account personalAccount = accountMapper.selectAccountByUserIdForUpdate(follower.getUserId());
            accountMapper.increaseBalance(personalAccount.getId(), amount);

            transactionMapper.insertTransaction(AccountTransaction.builder()
                .accountId(personalAccount.getId())
                .type("SETTLEMENT")
                .amount(amount)
                .relatedChallengeId(challengeId)
                .balanceAfter(personalAccount.getBalance() + amount)
                .status("COMPLETED")
                .description("챌린지 정산금")
                .build());
        }

        // 챌린지 어카운트 잔액 차감
        accountMapper.decreaseBalance(challengeAccount.getId(), totalAmount);

        // 정산 완료
        settlementMapper.completeSettlement(settlement.getId(), userId);

        // 챌린지 상태 변경
        challengeMapper.updateStatus(challengeId, "COMPLETED");

        return SettlementResponse.of(settlementMapper.selectSettlementById(settlement.getId()));
    }

    // ==================== 082 정산 내역 조회 ====================
    public SettlementResponse getSettlement(Long challengeId, Long userId) {
        if (!followerMapper.existsByChallengeAndUser(challengeId, userId)) {
            throw new BusinessException(ErrorCode.CHALLENGE_003);
        }

        Settlement settlement = settlementMapper.selectLatestSettlementByChallengeId(challengeId);
        if (settlement == null) {
            return null;
        }

        return SettlementResponse.of(settlement);
    }
}

================================================================================
16. BATCH SERVICE (배치 처리)
================================================================================

/**
 * 배치 서비스 (Spring Batch)
 * 
 * P-016: 자동 서포트 납입 (매월 1일 00:00)
 * P-017: 보증금 충당 (잔액 부족 시)
 * P-021: 60일 자동 탈퇴
 * P-022: 보증금 해제 (12개월 연속 납입)
 * P-052: 자동 탈퇴 시 보증금 몰수
 * P-053: 바코드 만료 처리
 * P-059: Webhook 실패 재시도
 */
@Service
@RequiredArgsConstructor
public class BatchService {

    private final ChallengeFollowerMapper followerMapper;
    private final AccountMapper accountMapper;
    private final AccountTransactionMapper transactionMapper;
    private final ChallengeMapper challengeMapper;
    private final PaymentBarcodeMapper barcodeMapper;
    private final WebhookLogMapper webhookLogMapper;
    private final UserScoreMapper userScoreMapper;

    // ==================== P-016: 자동 서포트 납입 ====================
    @Scheduled(cron = "0 0 0 1 * *") // 매월 1일 00:00
    @Transactional
    public void autoPaySupport() {
        List<ChallengeFollower> autoPayFollowers = followerMapper.selectAutoPayEnabledFollowers();

        for (ChallengeFollower follower : autoPayFollowers) {
            try {
                Challenge challenge = challengeMapper.selectChallengeById(follower.getChallengeId());
                if (!"IN_PROGRESS".equals(challenge.getStatus())) {
                    continue;
                }

                long supportAmount = challenge.getSupportAmount();
                Account personalAccount = accountMapper.selectAccountByUserIdForUpdate(
                    follower.getUserId()
                );

                long availableBalance = personalAccount.getBalance() - personalAccount.getLockedBalance();

                if (availableBalance >= supportAmount) {
                    // 정상 납입
                    processSupport(follower, challenge, personalAccount, supportAmount);
                } else {
                    // P-017: 보증금 충당
                    processDepositDeduction(follower, challenge, personalAccount, supportAmount);
                }
            } catch (Exception e) {
                log.error("Auto pay failed for follower: {}", follower.getId(), e);
            }
        }
    }

    // ==================== P-021: 60일 자동 탈퇴 ====================
    @Scheduled(cron = "0 0 1 * * *") // 매일 01:00
    @Transactional
    public void processAutoLeave() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(60);
        List<ChallengeFollower> revokedFollowers = followerMapper
            .selectRevokedFollowersForAutoLeave(threshold);

        for (ChallengeFollower follower : revokedFollowers) {
            try {
                // P-052: 보증금 몰수
                followerMapper.forfeitDeposit(follower.getId());

                // 탈퇴 처리
                followerMapper.leaveChallenge(follower.getId(), "AUTO_LEAVE");
                challengeMapper.decrementCurrentFollowers(follower.getChallengeId());

                log.info("Auto leave processed for follower: {}", follower.getId());
            } catch (Exception e) {
                log.error("Auto leave failed for follower: {}", follower.getId(), e);
            }
        }
    }

    // ==================== P-053: 바코드 만료 처리 ====================
    @Scheduled(cron = "0 * * * * *") // 매분
    @Transactional
    public void expireBarcodes() {
        barcodeMapper.expireOldBarcodes(LocalDateTime.now());
    }

    // ==================== P-059: Webhook 실패 재시도 ====================
    @Scheduled(cron = "0 */5 * * * *") // 5분마다
    @Transactional
    public void retryFailedWebhooks() {
        List<WebhookLog> failedLogs = webhookLogMapper.selectUnprocessedLogs();

        for (WebhookLog log : failedLogs) {
            if (log.getRetryCount() >= 3) {
                // 최대 재시도 초과 - 관리자 알림
                webhookLogMapper.markAsFailed(log.getId());
                notifyAdmin(log);
                continue;
            }

            try {
                // 재시도
                retryWebhook(log);
                webhookLogMapper.markAsSuccess(log.getId());
            } catch (Exception e) {
                webhookLogMapper.incrementRetryCount(log.getId());
            }
        }
    }

    // ==================== P-022: 보증금 해제 ====================
    @Scheduled(cron = "0 0 2 1 * *") // 매월 1일 02:00
    @Transactional
    public void processDepositUnlock() {
        // 12개월 연속 납입 완료한 팔로워 조회 및 보증금 해제
        List<ChallengeFollower> eligibleFollowers = followerMapper
            .selectFollowersForDepositUnlock(12);

        for (ChallengeFollower follower : eligibleFollowers) {
            try {
                Challenge challenge = challengeMapper.selectChallengeById(follower.getChallengeId());
                long depositAmount = challenge.getSupportAmount() * challenge.getDepositMonths();

                Account personalAccount = accountMapper.selectAccountByUserIdForUpdate(
                    follower.getUserId()
                );
                accountMapper.unlockBalance(personalAccount.getId(), depositAmount);
                followerMapper.unlockDeposit(follower.getId());

                log.info("Deposit unlocked for follower: {}", follower.getId());
            } catch (Exception e) {
                log.error("Deposit unlock failed for follower: {}", follower.getId(), e);
            }
        }
    }

    // ==================== Private Methods ====================
    private void processSupport(ChallengeFollower follower, Challenge challenge, 
                                 Account personalAccount, long supportAmount) {
        Account challengeAccount = accountMapper.selectAccountByChallengeIdForUpdate(
            challenge.getId()
        );

        accountMapper.decreaseBalance(personalAccount.getId(), supportAmount);
        accountMapper.increaseBalance(challengeAccount.getId(), supportAmount);

        transactionMapper.insertTransaction(AccountTransaction.builder()
            .accountId(personalAccount.getId())
            .type("SUPPORT")
            .amount(-supportAmount)
            .relatedChallengeId(challenge.getId())
            .balanceAfter(personalAccount.getBalance() - supportAmount)
            .status("COMPLETED")
            .description("자동 서포트 납입")
            .build());

        followerMapper.recordSupportPayment(follower.getId(), supportAmount);
    }

    private void processDepositDeduction(ChallengeFollower follower, Challenge challenge,
                                          Account personalAccount, long supportAmount) {
        long availableBalance = personalAccount.getBalance() - personalAccount.getLockedBalance();
        long shortfall = supportAmount - availableBalance;

        // 가용 잔액으로 일부 납입
        if (availableBalance > 0) {
            processSupport(follower, challenge, personalAccount, availableBalance);
        }

        // 보증금에서 충당
        if (personalAccount.getLockedBalance() >= shortfall) {
            accountMapper.deductFromLocked(personalAccount.getId(), shortfall);

            transactionMapper.insertTransaction(AccountTransaction.builder()
                .accountId(personalAccount.getId())
                .type("DEPOSIT_DEDUCT")
                .amount(-shortfall)
                .relatedChallengeId(challenge.getId())
                .balanceAfter(personalAccount.getBalance())
                .status("COMPLETED")
                .description("보증금 충당")
                .build());

            // 권한 박탈 (P-021)
            followerMapper.revokePrivilege(follower.getId());
        }
    }

    private void retryWebhook(WebhookLog log) {
        // Webhook 재시도 로직
    }

    private void notifyAdmin(WebhookLog log) {
        // 관리자 알림 로직
    }
}

================================================================================
통계 요약
================================================================================

Service 수: 16개
API 총 수: 83개 (Spring Boot)

도메인별 분포:
- AUTH: 8 APIs
- USER: 6 APIs
- ACCOUNT: 7 APIs
- CHALLENGE: 8 APIs
- CHALLENGE FOLLOWER: 5 APIs
- MEETING: 6 APIs
- VOTE: 5 APIs
- EXPENSE: 6 APIs
- LEDGER: 5 APIs
- POST: 9 APIs
- COMMENT: 6 APIs
- REPORT: 2 APIs
- NOTIFICATION: 5 APIs
- REFUND: 2 APIs
- SETTLEMENT: 2 APIs
- BATCH: 6 Jobs (P-016, P-017, P-021, P-022, P-053, P-059)

정책 반영:
- P-001 ~ P-005: 회원가입 정책 (AuthService)
- P-006 ~ P-012: 크레딧/수수료 정책 (AccountService)
- P-013 ~ P-015: 챌린지 가입 정책 (ChallengeFollowerService)
- P-016 ~ P-017: 자동 납입/보증금 충당 (BatchService)
- P-021: 권한 박탈 60일 자동 탈퇴 (BatchService)
- P-022: 보증금 해제 12개월 (BatchService)
- P-029: 장부 기록 (LedgerService)
- P-030 ~ P-031: 신고 정책 (ReportService)
- P-033 ~ P-035: 리더 승계 정책 (ChallengeFollowerService, VoteService)
- P-036: 정산 정책 (SettlementService)
- P-037 ~ P-042: 투표 정책 (VoteService, ExpenseService)
- P-043 ~ P-045: 모임 정책 (MeetingService)
- P-046 ~ P-050: 챌린지 상태 정책 (ChallengeService)
- P-051: 당도 시스템 (UserService, MeetingService)
- P-052: 보증금 몰수 (BatchService)
- P-053: 바코드 10분 유효 (ExpenseService, BatchService)
- P-054: NO_SHOW 패널티 (MeetingService)
- P-055: 허위 신고 제재 (ReportService - Admin)
- P-056: 권한 복구 (ChallengeFollowerService)
- P-057: PAUSED 상태 (ChallengeService)
- P-058: 리더 활동 갱신 (ChallengeService, MeetingService)
- P-059: Webhook 재시도 (BatchService)
- P-060: 알림 설정 (NotificationService)
- P-061: 당도 배치 계산 (Django - 별도)

용어 변경 반영 (BACKLOG 2026-01-12):
- challenge_members → challenge_followers (테이블명)
- current_members → current_followers (컬럼명)
- min_members → min_followers
- max_members → max_followers
- ChallengeMemberService → ChallengeFollowerService (클래스명)
- MemberMapper → ChallengeFollowerMapper

동시성 제어:
- Pessimistic Lock: selectForUpdate (accounts, challenges, votes)
- Optimistic Lock: version 컬럼 (accounts 테이블)
- idempotency_key: 결제 중복 방지 (account_transactions)

외부 서비스 연동:
- TossPay: 결제 API (Spring Retry 제외, idempotency_key 사용)
- Django: 분석/검색/추천 API (@Retryable 적용)
- AWS S3: 이미지 업로드 (@Retryable 적용)
- Redis: 토큰 블랙리스트, 이메일 인증 코드, Rate Limit

================================================================================
관련 문서
================================================================================

- API_SCHEMA_1.0.0.md
- DB_Schema_1.0.0.md
- POLICY_DEFINITION.md
- BACKLOG.md
- 2-2_MAPPER_*.xml (32개 MyBatis Mapper)
- 1-3_POLICY_API_MAPPING.md
- 1-4_ERROR_CODE.md

================================================================================
END OF DOCUMENT
================================================================================

파일명: 2-3_SPRING_SERVICE_BOILERPLATE.md
작성일: 2026-01-16
버전: 1.0.0
총 라인: 약 2,800줄
총 Service: 16개
총 API: 83개 (Spring Boot)
총 Batch Job: 6개