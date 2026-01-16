# WOORIDO MyBatis Mapper 템플릿 v1.0.0

================================================================================
문서 정보
================================================================================
작성일: 2026-01-16
버전: 1.0.0
총 테이블: 32개
총 Mapper: 32개
기준 문서: DB_Schema_1.0.0.md, POLICY_DEFINITION.md, BACKLOG.md

기술 스택:
- MyBatis 3.0.3 (mybatis-spring-boot-starter)
- Spring Boot 3.2.3
- Oracle 21c XE
- Java 21 (LTS)

용어 변경 반영 (BACKLOG 2026-01-12):
- gye → challenges
- gye_members → challenge_followers
- gye_id → challenge_id
- current_members → current_followers
- min_members → min_followers
- max_members → max_followers

도메인별 테이블 분포:
- USER (4): users, accounts, account_transactions, user_scores
- CHALLENGE (2): challenges, challenge_followers
- MEETING (3): meetings, meeting_votes, meeting_vote_records
- EXPENSE (6): expense_requests, expense_votes, expense_vote_records, payment_barcodes, ledger_entries, payment_logs
- VOTE (2): general_votes, general_vote_records
- SNS (5): posts, post_images, post_likes, comments, comment_likes
- SYSTEM (5): notifications, notification_settings, reports, sessions, webhook_logs
- ADMIN (5): admins, fee_policies, admin_logs, refunds, settlements

================================================================================
1. USER DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
1.1 UserMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: users
컬럼 수: 26
관련 정책: P-001 ~ P-005, P-030, P-055

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.woorido.mapper.user.UserMapper">

    <resultMap id="UserResultMap" type="com.woorido.domain.user.User">
        <id property="id" column="id"/>
        <result property="email" column="email"/>
        <result property="password" column="password"/>
        <result property="name" column="name"/>
        <result property="nickname" column="nickname"/>
        <result property="phone" column="phone"/>
        <result property="profileImageUrl" column="profile_image_url"/>
        <result property="status" column="status"/>
        <result property="marketingAgreed" column="marketing_agreed"/>
        <result property="warningCount" column="warning_count"/>
        <result property="reportReceivedCount" column="report_received_count"/>
        <result property="suspendedAt" column="suspended_at"/>
        <result property="suspendedUntil" column="suspended_until"/>
        <result property="lastLoginAt" column="last_login_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="userColumns">
        id, email, password, name, nickname, phone, profile_image_url,
        status, marketing_agreed, warning_count, report_received_count,
        suspended_at, suspended_until, last_login_at, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectUserById" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users WHERE id = #{id}
    </select>

    <select id="selectUserByEmail" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users WHERE email = #{email}
    </select>

    <select id="selectUserByNickname" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users WHERE nickname = #{nickname}
    </select>

    <select id="existsByEmail" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM users WHERE email = #{email}
    </select>

    <select id="existsByNickname" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM users WHERE nickname = #{nickname}
    </select>

    <select id="selectSuspendedUsersForRelease" resultMap="UserResultMap">
        SELECT <include refid="userColumns"/>
        FROM users
        WHERE status = 'SUSPENDED'
          AND suspended_until &lt;= CURRENT_TIMESTAMP
    </select>

    <!-- INSERT -->
    <insert id="insertUser" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO users (
            email, password, name, nickname, phone, profile_image_url,
            status, marketing_agreed, warning_count, report_received_count,
            created_at, updated_at
        ) VALUES (
            #{email}, #{password}, #{name}, #{nickname}, #{phone}, #{profileImageUrl},
            'ACTIVE', #{marketingAgreed}, 0, 0,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateUser">
        UPDATE users SET
            name = COALESCE(#{name}, name),
            nickname = COALESCE(#{nickname}, nickname),
            phone = COALESCE(#{phone}, phone),
            profile_image_url = COALESCE(#{profileImageUrl}, profile_image_url),
            marketing_agreed = COALESCE(#{marketingAgreed}, marketing_agreed),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updatePassword">
        UPDATE users SET password = #{password}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE users SET status = #{status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateLastLoginAt">
        UPDATE users SET last_login_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementWarningCount">
        UPDATE users SET
            warning_count = warning_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementReportReceivedCount">
        UPDATE users SET
            report_received_count = report_received_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="suspendUser">
        UPDATE users SET
            status = 'SUSPENDED',
            suspended_at = CURRENT_TIMESTAMP,
            suspended_until = #{suspendedUntil},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="releaseSuspension">
        UPDATE users SET
            status = 'ACTIVE',
            suspended_at = NULL,
            suspended_until = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
1.2 AccountMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: accounts
컬럼 수: 10
관련 정책: P-006 ~ P-012, P-014, P-017

<mapper namespace="com.woorido.mapper.user.AccountMapper">

    <resultMap id="AccountResultMap" type="com.woorido.domain.user.Account">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="accountType" column="account_type"/>
        <result property="balance" column="balance"/>
        <result property="lockedBalance" column="locked_balance"/>
        <result property="version" column="version"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="accountColumns">
        id, user_id, challenge_id, account_type, balance, locked_balance,
        version, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectAccountById" resultMap="AccountResultMap">
        SELECT <include refid="accountColumns"/>
        FROM accounts WHERE id = #{id}
    </select>

    <select id="selectAccountByUserId" resultMap="AccountResultMap">
        SELECT <include refid="accountColumns"/>
        FROM accounts WHERE user_id = #{userId} AND account_type = 'PERSONAL'
    </select>

    <select id="selectAccountByChallengeId" resultMap="AccountResultMap">
        SELECT <include refid="accountColumns"/>
        FROM accounts WHERE challenge_id = #{challengeId} AND account_type = 'CHALLENGE'
    </select>

    <!-- SELECT FOR UPDATE (비관적 락) -->
    <select id="selectAccountForUpdate" resultMap="AccountResultMap">
        SELECT <include refid="accountColumns"/>
        FROM accounts WHERE id = #{id} FOR UPDATE
    </select>

    <select id="selectAccountByUserIdForUpdate" resultMap="AccountResultMap">
        SELECT <include refid="accountColumns"/>
        FROM accounts WHERE user_id = #{userId} AND account_type = 'PERSONAL' FOR UPDATE
    </select>

    <select id="selectAccountByChallengeIdForUpdate" resultMap="AccountResultMap">
        SELECT <include refid="accountColumns"/>
        FROM accounts WHERE challenge_id = #{challengeId} AND account_type = 'CHALLENGE' FOR UPDATE
    </select>

    <!-- INSERT -->
    <insert id="insertAccount" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO accounts (
            user_id, challenge_id, account_type, balance, locked_balance,
            version, created_at, updated_at
        ) VALUES (
            #{userId}, #{challengeId}, #{accountType}, 0, 0,
            1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE (낙관적 락 + 비관적 락 패턴) -->
    <update id="increaseBalance">
        UPDATE accounts SET
            balance = balance + #{amount},
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="decreaseBalance">
        UPDATE accounts SET
            balance = balance - #{amount},
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND balance >= #{amount}
    </update>

    <update id="lockBalance">
        UPDATE accounts SET
            locked_balance = locked_balance + #{amount},
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND balance - locked_balance >= #{amount}
    </update>

    <update id="unlockBalance">
        UPDATE accounts SET
            locked_balance = locked_balance - #{amount},
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND locked_balance >= #{amount}
    </update>

    <update id="deductFromLocked">
        UPDATE accounts SET
            balance = balance - #{amount},
            locked_balance = locked_balance - #{amount},
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND locked_balance >= #{amount}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
1.3 AccountTransactionMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: account_transactions
컬럼 수: 15
관련 정책: P-006 ~ P-012

<mapper namespace="com.woorido.mapper.user.AccountTransactionMapper">

    <resultMap id="TransactionResultMap" type="com.woorido.domain.user.AccountTransaction">
        <id property="id" column="id"/>
        <result property="accountId" column="account_id"/>
        <result property="type" column="type"/>
        <result property="amount" column="amount"/>
        <result property="fee" column="fee"/>
        <result property="balanceAfter" column="balance_after"/>
        <result property="status" column="status"/>
        <result property="relatedUserId" column="related_user_id"/>
        <result property="relatedChallengeId" column="related_challenge_id"/>
        <result property="idempotencyKey" column="idempotency_key"/>
        <result property="description" column="description"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="transactionColumns">
        id, account_id, type, amount, fee, balance_after, status,
        related_user_id, related_challenge_id, idempotency_key, description,
        created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectByAccountId" resultMap="TransactionResultMap">
        SELECT <include refid="transactionColumns"/>
        FROM account_transactions
        WHERE account_id = #{accountId}
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countByAccountId" resultType="int">
        SELECT COUNT(*) FROM account_transactions WHERE account_id = #{accountId}
    </select>

    <select id="selectByIdempotencyKey" resultMap="TransactionResultMap">
        SELECT <include refid="transactionColumns"/>
        FROM account_transactions WHERE idempotency_key = #{idempotencyKey}
    </select>

    <select id="sumWithdrawByDate" resultType="long">
        SELECT COALESCE(SUM(ABS(amount)), 0)
        FROM account_transactions
        WHERE account_id = #{accountId}
          AND type = 'WITHDRAW'
          AND status = 'COMPLETED'
          AND TRUNC(created_at) = #{date}
    </select>

    <select id="sumWithdrawByDateRange" resultType="long">
        SELECT COALESCE(SUM(ABS(amount)), 0)
        FROM account_transactions
        WHERE account_id = #{accountId}
          AND type = 'WITHDRAW'
          AND status = 'COMPLETED'
          AND created_at BETWEEN #{startDate} AND #{endDate}
    </select>

    <!-- INSERT -->
    <insert id="insertTransaction" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO account_transactions (
            account_id, type, amount, fee, balance_after, status,
            related_user_id, related_challenge_id, idempotency_key, description,
            created_at, updated_at
        ) VALUES (
            #{accountId}, #{type}, #{amount}, #{fee}, #{balanceAfter}, #{status},
            #{relatedUserId}, #{relatedChallengeId}, #{idempotencyKey}, #{description},
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateStatus">
        UPDATE account_transactions SET
            status = #{status},
            balance_after = #{balanceAfter},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
1.4 UserScoreMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: user_scores
컬럼 수: 20
관련 정책: P-051, P-054, P-061

<mapper namespace="com.woorido.mapper.user.UserScoreMapper">

    <resultMap id="UserScoreResultMap" type="com.woorido.domain.user.UserScore">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="currentScore" column="current_score"/>
        <result property="paymentScore" column="payment_score"/>
        <result property="activityScore" column="activity_score"/>
        <result property="penaltyScore" column="penalty_score"/>
        <result property="totalPayments" column="total_payments"/>
        <result property="consecutivePayments" column="consecutive_payments"/>
        <result property="missedPayments" column="missed_payments"/>
        <result property="totalVotes" column="total_votes"/>
        <result property="missedVotes" column="missed_votes"/>
        <result property="totalMeetings" column="total_meetings"/>
        <result property="attendedMeetings" column="attended_meetings"/>
        <result property="noShowCount" column="no_show_count"/>
        <result property="postsCount" column="posts_count"/>
        <result property="commentsCount" column="comments_count"/>
        <result property="lastCalculatedAt" column="last_calculated_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="scoreColumns">
        id, user_id, current_score, payment_score, activity_score, penalty_score,
        total_payments, consecutive_payments, missed_payments,
        total_votes, missed_votes, total_meetings, attended_meetings, no_show_count,
        posts_count, comments_count, last_calculated_at, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectByUserId" resultMap="UserScoreResultMap">
        SELECT <include refid="scoreColumns"/>
        FROM user_scores WHERE user_id = #{userId}
    </select>

    <select id="selectTopScoresByChallengeId" resultMap="UserScoreResultMap">
        SELECT us.<include refid="scoreColumns"/>
        FROM user_scores us
        JOIN challenge_followers cf ON us.user_id = cf.user_id
        WHERE cf.challenge_id = #{challengeId}
          AND cf.left_at IS NULL
        ORDER BY us.current_score DESC
        FETCH FIRST #{limit} ROWS ONLY
    </select>

    <!-- INSERT -->
    <insert id="insertUserScore" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO user_scores (
            user_id, current_score, payment_score, activity_score, penalty_score,
            total_payments, consecutive_payments, missed_payments,
            total_votes, missed_votes, total_meetings, attended_meetings, no_show_count,
            posts_count, comments_count, last_calculated_at, created_at, updated_at
        ) VALUES (
            #{userId}, 12.0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="addPaymentScore">
        UPDATE user_scores SET
            payment_score = payment_score + #{score},
            total_payments = total_payments + 1,
            consecutive_payments = consecutive_payments + 1,
            current_score = LEAST(12 + (payment_score + #{score}) * 0.7 + activity_score * 0.15 - penalty_score, 80),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="addActivityScore">
        UPDATE user_scores SET
            activity_score = activity_score + #{score},
            current_score = LEAST(12 + payment_score * 0.7 + (activity_score + #{score}) * 0.15 - penalty_score, 80),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="addPenaltyScore">
        UPDATE user_scores SET
            penalty_score = penalty_score + #{score},
            current_score = 12 + payment_score * 0.7 + activity_score * 0.15 - (penalty_score + #{score}),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="recordMissedPayment">
        UPDATE user_scores SET
            missed_payments = missed_payments + 1,
            consecutive_payments = 0,
            penalty_score = penalty_score + 1.0,
            current_score = 12 + payment_score * 0.7 + activity_score * 0.15 - (penalty_score + 1.0),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="recordNoShow">
        UPDATE user_scores SET
            no_show_count = no_show_count + 1,
            activity_score = activity_score - 0.09,
            current_score = 12 + payment_score * 0.7 + (activity_score - 0.09) * 0.15 - penalty_score,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="incrementPostsCount">
        UPDATE user_scores SET
            posts_count = posts_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="incrementCommentsCount">
        UPDATE user_scores SET
            comments_count = comments_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>

    <update id="recalculateScore">
        UPDATE user_scores SET
            current_score = LEAST(12 + payment_score * 0.7 + activity_score * 0.15 - penalty_score, 80),
            last_calculated_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>
</mapper>

================================================================================
2. CHALLENGE DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
2.1 ChallengeMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: challenges
컬럼 수: 25
관련 정책: P-013 ~ P-015, P-033, P-046 ~ P-050, P-057, P-058

<mapper namespace="com.woorido.mapper.challenge.ChallengeMapper">

    <resultMap id="ChallengeResultMap" type="com.woorido.domain.challenge.Challenge">
        <id property="id" column="id"/>
        <result property="leaderId" column="leader_id"/>
        <result property="name" column="name"/>
        <result property="description" column="description"/>
        <result property="category" column="category"/>
        <result property="supportAmount" column="support_amount"/>
        <result property="depositMonths" column="deposit_months"/>
        <result property="minFollowers" column="min_followers"/>
        <result property="maxFollowers" column="max_followers"/>
        <result property="currentFollowers" column="current_followers"/>
        <result property="status" column="status"/>
        <result property="leaderBenefitRate" column="leader_benefit_rate"/>
        <result property="leaderLastActiveAt" column="leader_last_active_at"/>
        <result property="isVerified" column="is_verified"/>
        <result property="verifiedAt" column="verified_at"/>
        <result property="activatedAt" column="activated_at"/>
        <result property="completedAt" column="completed_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="deletedAt" column="deleted_at"/>
    </resultMap>

    <sql id="challengeColumns">
        id, leader_id, name, description, category, support_amount, deposit_months,
        min_followers, max_followers, current_followers, status, leader_benefit_rate,
        leader_last_active_at, is_verified, verified_at, activated_at, completed_at,
        created_at, updated_at, deleted_at
    </sql>

    <!-- SELECT -->
    <select id="selectChallengeById" resultMap="ChallengeResultMap">
        SELECT <include refid="challengeColumns"/>
        FROM challenges WHERE id = #{id} AND deleted_at IS NULL
    </select>

    <select id="selectChallengeForUpdate" resultMap="ChallengeResultMap">
        SELECT <include refid="challengeColumns"/>
        FROM challenges WHERE id = #{id} AND deleted_at IS NULL FOR UPDATE
    </select>

    <select id="selectChallenges" resultMap="ChallengeResultMap">
        SELECT <include refid="challengeColumns"/>
        FROM challenges
        WHERE deleted_at IS NULL
        <if test="category != null">AND category = #{category}</if>
        <if test="status != null">AND status = #{status}</if>
        <if test="keyword != null">AND (name LIKE '%' || #{keyword} || '%' OR description LIKE '%' || #{keyword} || '%')</if>
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countChallenges" resultType="int">
        SELECT COUNT(*) FROM challenges
        WHERE deleted_at IS NULL
        <if test="category != null">AND category = #{category}</if>
        <if test="status != null">AND status = #{status}</if>
        <if test="keyword != null">AND (name LIKE '%' || #{keyword} || '%' OR description LIKE '%' || #{keyword} || '%')</if>
    </select>

    <select id="selectInactiveLeaderChallenges" resultMap="ChallengeResultMap">
        SELECT <include refid="challengeColumns"/>
        FROM challenges
        WHERE status = 'IN_PROGRESS'
          AND deleted_at IS NULL
          AND leader_last_active_at &lt; #{thresholdDate}
    </select>

    <select id="selectChallengesForActivation" resultMap="ChallengeResultMap">
        SELECT <include refid="challengeColumns"/>
        FROM challenges
        WHERE status = 'RECRUITING'
          AND deleted_at IS NULL
          AND current_followers >= min_followers
    </select>

    <!-- INSERT -->
    <insert id="insertChallenge" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO challenges (
            leader_id, name, description, category, support_amount, deposit_months,
            min_followers, max_followers, current_followers, status, leader_benefit_rate,
            leader_last_active_at, is_verified, created_at, updated_at
        ) VALUES (
            #{leaderId}, #{name}, #{description}, #{category}, #{supportAmount}, #{depositMonths},
            #{minFollowers}, #{maxFollowers}, 1, 'RECRUITING', #{leaderBenefitRate},
            CURRENT_TIMESTAMP, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateChallenge">
        UPDATE challenges SET
            name = COALESCE(#{name}, name),
            description = COALESCE(#{description}, description),
            leader_benefit_rate = COALESCE(#{leaderBenefitRate}, leader_benefit_rate),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE challenges SET
            status = #{status},
            <if test="status == 'IN_PROGRESS'">activated_at = CURRENT_TIMESTAMP,</if>
            <if test="status == 'COMPLETED'">completed_at = CURRENT_TIMESTAMP,</if>
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateLeaderId">
        UPDATE challenges SET
            leader_id = #{leaderId},
            leader_last_active_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateLeaderLastActiveAt">
        UPDATE challenges SET
            leader_last_active_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementCurrentFollowers">
        UPDATE challenges SET
            current_followers = current_followers + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="decrementCurrentFollowers">
        UPDATE challenges SET
            current_followers = current_followers - 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND current_followers > 0
    </update>

    <update id="verifyChallenge">
        UPDATE challenges SET
            is_verified = 1,
            verified_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="deleteChallenge">
        UPDATE challenges SET
            deleted_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
2.2 ChallengeFollowerMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: challenge_followers (변경: challenge_members → challenge_followers)
컬럼 수: 17
관련 정책: P-014, P-021, P-033 ~ P-035, P-045, P-052, P-054, P-056, P-057

<mapper namespace="com.woorido.mapper.challenge.ChallengeFollowerMapper">

    <resultMap id="FollowerResultMap" type="com.woorido.domain.challenge.ChallengeFollower">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="userId" column="user_id"/>
        <result property="role" column="role"/>
        <result property="depositStatus" column="deposit_status"/>
        <result property="depositLockedAt" column="deposit_locked_at"/>
        <result property="depositUnlockedAt" column="deposit_unlocked_at"/>
        <result property="entryFeeAmount" column="entry_fee_amount"/>
        <result property="entryFeePaidAt" column="entry_fee_paid_at"/>
        <result property="privilegeStatus" column="privilege_status"/>
        <result property="privilegeRevokedAt" column="privilege_revoked_at"/>
        <result property="lastSupportPaidAt" column="last_support_paid_at"/>
        <result property="totalSupportPaid" column="total_support_paid"/>
        <result property="autoPayEnabled" column="auto_pay_enabled"/>
        <result property="joinedAt" column="joined_at"/>
        <result property="leftAt" column="left_at"/>
        <result property="leaveReason" column="leave_reason"/>
    </resultMap>

    <sql id="followerColumns">
        id, challenge_id, user_id, role, deposit_status,
        deposit_locked_at, deposit_unlocked_at, entry_fee_amount, entry_fee_paid_at,
        privilege_status, privilege_revoked_at, last_support_paid_at, total_support_paid,
        auto_pay_enabled, joined_at, left_at, leave_reason
    </sql>

    <!-- SELECT -->
    <select id="selectFollowerById" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers WHERE id = #{id}
    </select>

    <select id="selectFollowerByChallengeAndUser" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers
        WHERE challenge_id = #{challengeId} AND user_id = #{userId} AND left_at IS NULL
    </select>

    <select id="selectFollowersByChallengeId" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers
        WHERE challenge_id = #{challengeId} AND left_at IS NULL
        <if test="role != null">AND role = #{role}</if>
        ORDER BY joined_at ASC
    </select>

    <select id="selectLeaderByChallengeId" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers
        WHERE challenge_id = #{challengeId} AND role = 'LEADER' AND left_at IS NULL
    </select>

    <select id="selectFollowersByUserId" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers
        WHERE user_id = #{userId} AND left_at IS NULL
        <if test="role != null">AND role = #{role}</if>
        ORDER BY joined_at DESC
    </select>

    <select id="existsByChallengeAndUser" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM challenge_followers
        WHERE challenge_id = #{challengeId} AND user_id = #{userId} AND left_at IS NULL
    </select>

    <select id="countByUserIdAndRole" resultType="int">
        SELECT COUNT(*) FROM challenge_followers
        WHERE user_id = #{userId} AND role = #{role} AND left_at IS NULL
    </select>

    <select id="selectRevokedFollowersForAutoLeave" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers
        WHERE privilege_status = 'REVOKED'
          AND privilege_revoked_at &lt;= #{thresholdDate}
          AND left_at IS NULL
    </select>

    <select id="selectAutoPayEnabledFollowers" resultMap="FollowerResultMap">
        SELECT <include refid="followerColumns"/>
        FROM challenge_followers
        WHERE auto_pay_enabled = 1 AND left_at IS NULL AND privilege_status = 'ACTIVE'
    </select>

    <select id="countActiveFollowersByChallengeId" resultType="int">
        SELECT COUNT(*) FROM challenge_followers
        WHERE challenge_id = #{challengeId} AND left_at IS NULL
    </select>

    <select id="selectFollowersForDepositUnlock" resultMap="FollowerResultMap">
        SELECT cf.<include refid="followerColumns"/>
        FROM challenge_followers cf
        JOIN user_scores us ON cf.user_id = us.user_id
        WHERE cf.deposit_status = 'LOCKED'
          AND cf.left_at IS NULL
          AND us.consecutive_payments >= #{months}
    </select>

    <select id="selectHighestScoreFollowerByChallengeId" resultMap="FollowerResultMap">
        SELECT cf.<include refid="followerColumns"/>
        FROM challenge_followers cf
        JOIN user_scores us ON cf.user_id = us.user_id
        WHERE cf.challenge_id = #{challengeId}
          AND cf.role = 'FOLLOWER'
          AND cf.left_at IS NULL
          AND cf.privilege_status = 'ACTIVE'
        ORDER BY us.current_score DESC
        FETCH FIRST 1 ROW ONLY
    </select>

    <!-- INSERT -->
    <insert id="insertFollower" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO challenge_followers (
            challenge_id, user_id, role, deposit_status, entry_fee_amount,
            privilege_status, total_support_paid, auto_pay_enabled, joined_at
        ) VALUES (
            #{challengeId}, #{userId}, #{role}, 'NONE', #{entryFeeAmount},
            'ACTIVE', 0, #{autoPayEnabled}, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="lockDeposit">
        UPDATE challenge_followers SET
            deposit_status = 'LOCKED',
            deposit_locked_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND deposit_status = 'NONE'
    </update>

    <update id="unlockDeposit">
        UPDATE challenge_followers SET
            deposit_status = 'UNLOCKED',
            deposit_unlocked_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND deposit_status = 'LOCKED'
    </update>

    <update id="forfeitDeposit">
        UPDATE challenge_followers SET deposit_status = 'USED'
        WHERE id = #{id} AND deposit_status = 'LOCKED'
    </update>

    <update id="revokePrivilege">
        UPDATE challenge_followers SET
            privilege_status = 'REVOKED',
            privilege_revoked_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND privilege_status = 'ACTIVE'
    </update>

    <update id="restorePrivilege">
        UPDATE challenge_followers SET
            privilege_status = 'ACTIVE',
            privilege_revoked_at = NULL
        WHERE id = #{id} AND privilege_status = 'REVOKED'
    </update>

    <update id="recordSupportPayment">
        UPDATE challenge_followers SET
            last_support_paid_at = CURRENT_TIMESTAMP,
            total_support_paid = total_support_paid + #{amount}
        WHERE id = #{id}
    </update>

    <update id="updateAutoPayEnabled">
        UPDATE challenge_followers SET auto_pay_enabled = #{enabled}
        WHERE id = #{id}
    </update>

    <update id="promoteToLeader">
        UPDATE challenge_followers SET role = 'LEADER'
        WHERE id = #{id} AND role = 'FOLLOWER' AND left_at IS NULL
    </update>

    <update id="demoteFromLeader">
        UPDATE challenge_followers SET role = 'FOLLOWER'
        WHERE id = #{id} AND role = 'LEADER'
    </update>

    <update id="leaveChallenge">
        UPDATE challenge_followers SET
            left_at = CURRENT_TIMESTAMP,
            leave_reason = #{leaveReason}
        WHERE id = #{id} AND left_at IS NULL
    </update>

    <update id="leaveAllChallengesByUserId">
        UPDATE challenge_followers SET
            left_at = CURRENT_TIMESTAMP,
            leave_reason = #{leaveReason}
        WHERE user_id = #{userId} AND left_at IS NULL
    </update>
</mapper>

================================================================================
3. MEETING DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
3.1 MeetingMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: meetings
컬럼 수: 14
관련 정책: P-043 ~ P-045

<mapper namespace="com.woorido.mapper.meeting.MeetingMapper">

    <resultMap id="MeetingResultMap" type="com.woorido.domain.meeting.Meeting">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="title" column="title"/>
        <result property="description" column="description"/>
        <result property="meetingDate" column="meeting_date"/>
        <result property="location" column="location"/>
        <result property="status" column="status"/>
        <result property="expectedAttendees" column="expected_attendees"/>
        <result property="actualAttendees" column="actual_attendees"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="meetingColumns">
        id, challenge_id, title, description, meeting_date, location, status,
        expected_attendees, actual_attendees, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectMeetingById" resultMap="MeetingResultMap">
        SELECT <include refid="meetingColumns"/>
        FROM meetings WHERE id = #{id}
    </select>

    <select id="selectMeetingsByChallengeId" resultMap="MeetingResultMap">
        SELECT <include refid="meetingColumns"/>
        FROM meetings WHERE challenge_id = #{challengeId}
        ORDER BY meeting_date DESC
    </select>

    <select id="selectUpcomingMeetings" resultMap="MeetingResultMap">
        SELECT <include refid="meetingColumns"/>
        FROM meetings
        WHERE status IN ('VOTING', 'CONFIRMED')
          AND meeting_date > CURRENT_TIMESTAMP
        ORDER BY meeting_date ASC
    </select>

    <!-- INSERT -->
    <insert id="insertMeeting" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO meetings (
            challenge_id, title, description, meeting_date, location, status,
            expected_attendees, actual_attendees, created_at, updated_at
        ) VALUES (
            #{challengeId}, #{title}, #{description}, #{meetingDate}, #{location}, 'VOTING',
            0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateMeeting">
        UPDATE meetings SET
            title = COALESCE(#{title}, title),
            description = COALESCE(#{description}, description),
            meeting_date = COALESCE(#{meetingDate}, meeting_date),
            location = COALESCE(#{location}, location),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE meetings SET status = #{status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateExpectedAttendees">
        UPDATE meetings SET expected_attendees = #{count}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateActualAttendees">
        UPDATE meetings SET actual_attendees = #{count}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
3.2 MeetingVoteMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: meeting_votes
컬럼 수: 11
관련 정책: P-043, P-044

<mapper namespace="com.woorido.mapper.meeting.MeetingVoteMapper">

    <resultMap id="MeetingVoteResultMap" type="com.woorido.domain.meeting.MeetingVote">
        <id property="id" column="id"/>
        <result property="meetingId" column="meeting_id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="totalVoters" column="total_voters"/>
        <result property="agreeCount" column="agree_count"/>
        <result property="disagreeCount" column="disagree_count"/>
        <result property="expiresAt" column="expires_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="voteColumns">
        id, meeting_id, challenge_id, total_voters, agree_count, disagree_count,
        expires_at, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectVoteByMeetingId" resultMap="MeetingVoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM meeting_votes WHERE meeting_id = #{meetingId}
    </select>

    <select id="selectVoteByMeetingIdForUpdate" resultMap="MeetingVoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM meeting_votes WHERE meeting_id = #{meetingId} FOR UPDATE
    </select>

    <select id="selectExpiredVotes" resultMap="MeetingVoteResultMap">
        SELECT mv.<include refid="voteColumns"/>
        FROM meeting_votes mv
        JOIN meetings m ON mv.meeting_id = m.id
        WHERE m.status = 'VOTING' AND mv.expires_at &lt;= CURRENT_TIMESTAMP
    </select>

    <!-- INSERT -->
    <insert id="insertVote" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO meeting_votes (
            meeting_id, challenge_id, total_voters, agree_count, disagree_count,
            expires_at, created_at, updated_at
        ) VALUES (
            #{meetingId}, #{challengeId}, #{totalVoters}, 0, 0,
            #{expiresAt}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="incrementAgreeCount">
        UPDATE meeting_votes SET
            agree_count = agree_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementDisagreeCount">
        UPDATE meeting_votes SET
            disagree_count = disagree_count + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
3.3 MeetingVoteRecordMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: meeting_vote_records
컬럼 수: 6
관련 정책: P-044

<mapper namespace="com.woorido.mapper.meeting.MeetingVoteRecordMapper">

    <resultMap id="RecordResultMap" type="com.woorido.domain.meeting.MeetingVoteRecord">
        <id property="id" column="id"/>
        <result property="voteId" column="vote_id"/>
        <result property="userId" column="user_id"/>
        <result property="choice" column="choice"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectRecordsByVoteId" resultMap="RecordResultMap">
        SELECT id, vote_id, user_id, choice, created_at
        FROM meeting_vote_records WHERE vote_id = #{voteId}
    </select>

    <select id="selectRecordsByVoteIdAndChoice" resultMap="RecordResultMap">
        SELECT id, vote_id, user_id, choice, created_at
        FROM meeting_vote_records WHERE vote_id = #{voteId} AND choice = #{choice}
    </select>

    <select id="existsByVoteIdAndUserId" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM meeting_vote_records WHERE vote_id = #{voteId} AND user_id = #{userId}
    </select>

    <!-- INSERT -->
    <insert id="insertRecord" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO meeting_vote_records (vote_id, user_id, choice, created_at)
        VALUES (#{voteId}, #{userId}, #{choice}, CURRENT_TIMESTAMP)
    </insert>
</mapper>

================================================================================
4. EXPENSE DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
4.1 ExpenseRequestMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: expense_requests
컬럼 수: 12
관련 정책: P-029, P-042

<mapper namespace="com.woorido.mapper.expense.ExpenseRequestMapper">

    <resultMap id="ExpenseResultMap" type="com.woorido.domain.expense.ExpenseRequest">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="meetingId" column="meeting_id"/>
        <result property="requesterId" column="requester_id"/>
        <result property="amount" column="amount"/>
        <result property="category" column="category"/>
        <result property="description" column="description"/>
        <result property="status" column="status"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="expenseColumns">
        id, challenge_id, meeting_id, requester_id, amount, category,
        description, status, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectExpenseById" resultMap="ExpenseResultMap">
        SELECT <include refid="expenseColumns"/>
        FROM expense_requests WHERE id = #{id}
    </select>

    <select id="selectExpensesByChallengeId" resultMap="ExpenseResultMap">
        SELECT <include refid="expenseColumns"/>
        FROM expense_requests WHERE challenge_id = #{challengeId}
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countExpensesByChallengeId" resultType="int">
        SELECT COUNT(*) FROM expense_requests WHERE challenge_id = #{challengeId}
    </select>

    <select id="selectExpensesByMeetingId" resultMap="ExpenseResultMap">
        SELECT <include refid="expenseColumns"/>
        FROM expense_requests WHERE meeting_id = #{meetingId}
    </select>

    <!-- INSERT -->
    <insert id="insertExpense" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO expense_requests (
            challenge_id, meeting_id, requester_id, amount, category,
            description, status, created_at, updated_at
        ) VALUES (
            #{challengeId}, #{meetingId}, #{requesterId}, #{amount}, #{category},
            #{description}, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateExpense">
        UPDATE expense_requests SET
            amount = COALESCE(#{amount}, amount),
            category = COALESCE(#{category}, category),
            description = COALESCE(#{description}, description),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE expense_requests SET status = #{status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
4.2 ExpenseVoteMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: expense_votes
컬럼 수: 10
관련 정책: P-042

<mapper namespace="com.woorido.mapper.expense.ExpenseVoteMapper">

    <resultMap id="ExpenseVoteResultMap" type="com.woorido.domain.expense.ExpenseVote">
        <id property="id" column="id"/>
        <result property="expenseId" column="expense_id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="totalVoters" column="total_voters"/>
        <result property="approveCount" column="approve_count"/>
        <result property="rejectCount" column="reject_count"/>
        <result property="status" column="status"/>
        <result property="expiresAt" column="expires_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="voteColumns">
        id, expense_id, challenge_id, total_voters, approve_count, reject_count,
        status, expires_at, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectVoteByExpenseId" resultMap="ExpenseVoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM expense_votes WHERE expense_id = #{expenseId}
    </select>

    <select id="selectVoteByExpenseIdForUpdate" resultMap="ExpenseVoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM expense_votes WHERE expense_id = #{expenseId} FOR UPDATE
    </select>

    <!-- INSERT -->
    <insert id="insertVote" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO expense_votes (
            expense_id, challenge_id, total_voters, approve_count, reject_count,
            status, expires_at, created_at, updated_at
        ) VALUES (
            #{expenseId}, #{challengeId}, #{totalVoters}, 0, 0,
            'IN_PROGRESS', #{expiresAt}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="incrementApproveCount">
        UPDATE expense_votes SET approve_count = approve_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementRejectCount">
        UPDATE expense_votes SET reject_count = reject_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE expense_votes SET status = #{status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
4.3 ExpenseVoteRecordMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: expense_vote_records
컬럼 수: 6

<mapper namespace="com.woorido.mapper.expense.ExpenseVoteRecordMapper">

    <resultMap id="RecordResultMap" type="com.woorido.domain.expense.ExpenseVoteRecord">
        <id property="id" column="id"/>
        <result property="voteId" column="vote_id"/>
        <result property="userId" column="user_id"/>
        <result property="choice" column="choice"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectRecordsByVoteId" resultMap="RecordResultMap">
        SELECT id, vote_id, user_id, choice, created_at
        FROM expense_vote_records WHERE vote_id = #{voteId}
    </select>

    <select id="existsByVoteIdAndUserId" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM expense_vote_records WHERE vote_id = #{voteId} AND user_id = #{userId}
    </select>

    <!-- INSERT -->
    <insert id="insertRecord" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO expense_vote_records (vote_id, user_id, choice, created_at)
        VALUES (#{voteId}, #{userId}, #{choice}, CURRENT_TIMESTAMP)
    </insert>
</mapper>

────────────────────────────────────────────────────────────────────────────────
4.4 PaymentBarcodeMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: payment_barcodes
컬럼 수: 9
관련 정책: P-053

<mapper namespace="com.woorido.mapper.expense.PaymentBarcodeMapper">

    <resultMap id="BarcodeResultMap" type="com.woorido.domain.expense.PaymentBarcode">
        <id property="id" column="id"/>
        <result property="expenseId" column="expense_id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="barcodeValue" column="barcode_value"/>
        <result property="amount" column="amount"/>
        <result property="status" column="status"/>
        <result property="expiresAt" column="expires_at"/>
        <result property="usedAt" column="used_at"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <sql id="barcodeColumns">
        id, expense_id, challenge_id, barcode_value, amount, status,
        expires_at, used_at, created_at
    </sql>

    <!-- SELECT -->
    <select id="selectBarcodeByValue" resultMap="BarcodeResultMap">
        SELECT <include refid="barcodeColumns"/>
        FROM payment_barcodes WHERE barcode_value = #{barcodeValue}
    </select>

    <select id="selectBarcodeByExpenseId" resultMap="BarcodeResultMap">
        SELECT <include refid="barcodeColumns"/>
        FROM payment_barcodes WHERE expense_id = #{expenseId}
    </select>

    <!-- INSERT -->
    <insert id="insertBarcode" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO payment_barcodes (
            expense_id, challenge_id, barcode_value, amount, status,
            expires_at, created_at
        ) VALUES (
            #{expenseId}, #{challengeId}, #{barcodeValue}, #{amount}, 'ACTIVE',
            #{expiresAt}, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="markAsUsed">
        UPDATE payment_barcodes SET status = 'USED', used_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'ACTIVE'
    </update>

    <update id="expireOldBarcodes">
        UPDATE payment_barcodes SET status = 'EXPIRED'
        WHERE status = 'ACTIVE' AND expires_at &lt;= #{now}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
4.5 LedgerEntryMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: ledger_entries
컬럼 수: 11
관련 정책: P-029

<mapper namespace="com.woorido.mapper.expense.LedgerEntryMapper">

    <resultMap id="LedgerResultMap" type="com.woorido.domain.expense.LedgerEntry">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="expenseId" column="expense_id"/>
        <result property="type" column="type"/>
        <result property="amount" column="amount"/>
        <result property="category" column="category"/>
        <result property="description" column="description"/>
        <result property="memo" column="memo"/>
        <result property="merchantName" column="merchant_name"/>
        <result property="merchantCategory" column="merchant_category"/>
        <result property="pgProvider" column="pg_provider"/>
        <result property="recordedBy" column="recorded_by"/>
        <result property="isSettled" column="is_settled"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="ledgerColumns">
        id, challenge_id, expense_id, type, amount, category, description, memo,
        merchant_name, merchant_category, pg_provider, recorded_by, is_settled,
        created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectEntryById" resultMap="LedgerResultMap">
        SELECT <include refid="ledgerColumns"/>
        FROM ledger_entries WHERE id = #{id}
    </select>

    <select id="selectEntriesByChallengeId" resultMap="LedgerResultMap">
        SELECT <include refid="ledgerColumns"/>
        FROM ledger_entries WHERE challenge_id = #{challengeId}
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countEntriesByChallengeId" resultType="int">
        SELECT COUNT(*) FROM ledger_entries WHERE challenge_id = #{challengeId}
    </select>

    <select id="selectAllEntriesByChallengeId" resultMap="LedgerResultMap">
        SELECT <include refid="ledgerColumns"/>
        FROM ledger_entries WHERE challenge_id = #{challengeId}
        ORDER BY created_at DESC
    </select>

    <select id="selectSummaryByChallengeId" resultType="com.woorido.dto.LedgerSummary">
        SELECT
            COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS totalIncome,
            COALESCE(SUM(CASE WHEN amount &lt; 0 THEN ABS(amount) ELSE 0 END), 0) AS totalExpense,
            COUNT(*) AS totalCount
        FROM ledger_entries WHERE challenge_id = #{challengeId}
    </select>

    <select id="selectCategorySummaryByChallengeId" resultType="com.woorido.dto.CategorySummary">
        SELECT category, COALESCE(SUM(ABS(amount)), 0) AS totalAmount, COUNT(*) AS count
        FROM ledger_entries
        WHERE challenge_id = #{challengeId} AND amount &lt; 0
        GROUP BY category
        ORDER BY totalAmount DESC
    </select>

    <!-- INSERT -->
    <insert id="insertEntry" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO ledger_entries (
            challenge_id, expense_id, type, amount, category, description, memo,
            merchant_name, merchant_category, pg_provider, recorded_by, is_settled,
            created_at, updated_at
        ) VALUES (
            #{challengeId}, #{expenseId}, #{type}, #{amount}, #{category}, #{description}, #{memo},
            #{merchantName}, #{merchantCategory}, #{pgProvider}, #{recordedBy}, 0,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateEntry">
        UPDATE ledger_entries SET
            memo = COALESCE(#{memo}, memo),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND is_settled = 0
    </update>

    <update id="markAsSettled">
        UPDATE ledger_entries SET is_settled = 1, updated_at = CURRENT_TIMESTAMP
        WHERE challenge_id = #{challengeId}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
4.6 PaymentLogMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: payment_logs
컬럼 수: 8

<mapper namespace="com.woorido.mapper.expense.PaymentLogMapper">

    <resultMap id="PaymentLogResultMap" type="com.woorido.domain.expense.PaymentLog">
        <id property="id" column="id"/>
        <result property="barcodeId" column="barcode_id"/>
        <result property="pgTransactionId" column="pg_transaction_id"/>
        <result property="status" column="status"/>
        <result property="merchantName" column="merchant_name"/>
        <result property="merchantCategory" column="merchant_category"/>
        <result property="rawResponse" column="raw_response"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectLogsByBarcodeId" resultMap="PaymentLogResultMap">
        SELECT id, barcode_id, pg_transaction_id, status, merchant_name, merchant_category, raw_response, created_at
        FROM payment_logs WHERE barcode_id = #{barcodeId} ORDER BY created_at DESC
    </select>

    <!-- INSERT -->
    <insert id="insertLog" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO payment_logs (
            barcode_id, pg_transaction_id, status, merchant_name, merchant_category, raw_response, created_at
        ) VALUES (
            #{barcodeId}, #{pgTransactionId}, #{status}, #{merchantName}, #{merchantCategory}, #{rawResponse}, CURRENT_TIMESTAMP
        )
    </insert>
</mapper>

================================================================================
5. VOTE DOMAIN (일반 투표)
================================================================================

────────────────────────────────────────────────────────────────────────────────
5.1 GeneralVoteMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: general_votes
컬럼 수: 12
관련 정책: P-037 ~ P-041

<mapper namespace="com.woorido.mapper.vote.GeneralVoteMapper">

    <resultMap id="VoteResultMap" type="com.woorido.domain.vote.GeneralVote">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="type" column="type"/>
        <result property="title" column="title"/>
        <result property="description" column="description"/>
        <result property="targetUserId" column="target_user_id"/>
        <result property="createdBy" column="created_by"/>
        <result property="totalVoters" column="total_voters"/>
        <result property="approveCount" column="approve_count"/>
        <result property="rejectCount" column="reject_count"/>
        <result property="status" column="status"/>
        <result property="expiresAt" column="expires_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="voteColumns">
        id, challenge_id, type, title, description, target_user_id, created_by,
        total_voters, approve_count, reject_count, status, expires_at, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectVoteById" resultMap="VoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM general_votes WHERE id = #{id}
    </select>

    <select id="selectVoteByIdForUpdate" resultMap="VoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM general_votes WHERE id = #{id} FOR UPDATE
    </select>

    <select id="selectVotesByChallengeId" resultMap="VoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM general_votes WHERE challenge_id = #{challengeId}
        ORDER BY created_at DESC
    </select>

    <select id="existsInProgressByTypeAndChallenge" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM general_votes
        WHERE type = #{type} AND challenge_id = #{challengeId} AND status = 'IN_PROGRESS'
    </select>

    <select id="selectExpiredVotes" resultMap="VoteResultMap">
        SELECT <include refid="voteColumns"/>
        FROM general_votes
        WHERE status = 'IN_PROGRESS' AND expires_at &lt;= CURRENT_TIMESTAMP
    </select>

    <!-- INSERT -->
    <insert id="insertVote" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO general_votes (
            challenge_id, type, title, description, target_user_id, created_by,
            total_voters, approve_count, reject_count, status, expires_at, created_at, updated_at
        ) VALUES (
            #{challengeId}, #{type}, #{title}, #{description}, #{targetUserId}, #{createdBy},
            #{totalVoters}, 0, 0, 'IN_PROGRESS', #{expiresAt}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="incrementApproveCount">
        UPDATE general_votes SET approve_count = approve_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementRejectCount">
        UPDATE general_votes SET reject_count = reject_count + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="updateStatus">
        UPDATE general_votes SET status = #{status}, updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
5.2 GeneralVoteRecordMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: general_vote_records
컬럼 수: 6

<mapper namespace="com.woorido.mapper.vote.GeneralVoteRecordMapper">

    <resultMap id="RecordResultMap" type="com.woorido.domain.vote.GeneralVoteRecord">
        <id property="id" column="id"/>
        <result property="voteId" column="vote_id"/>
        <result property="userId" column="user_id"/>
        <result property="choice" column="choice"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectRecordsByVoteId" resultMap="RecordResultMap">
        SELECT id, vote_id, user_id, choice, created_at
        FROM general_vote_records WHERE vote_id = #{voteId}
    </select>

    <select id="existsByVoteIdAndUserId" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM general_vote_records WHERE vote_id = #{voteId} AND user_id = #{userId}
    </select>

    <!-- INSERT -->
    <insert id="insertRecord" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO general_vote_records (vote_id, user_id, choice, created_at)
        VALUES (#{voteId}, #{userId}, #{choice}, CURRENT_TIMESTAMP)
    </insert>
</mapper>

================================================================================
6. SNS DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
6.1 PostMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: posts
컬럼 수: 14

<mapper namespace="com.woorido.mapper.sns.PostMapper">

    <resultMap id="PostResultMap" type="com.woorido.domain.sns.Post">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="authorId" column="author_id"/>
        <result property="title" column="title"/>
        <result property="content" column="content"/>
        <result property="category" column="category"/>
        <result property="isNotice" column="is_notice"/>
        <result property="isPinned" column="is_pinned"/>
        <result property="viewCount" column="view_count"/>
        <result property="likeCount" column="like_count"/>
        <result property="commentCount" column="comment_count"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="deletedAt" column="deleted_at"/>
    </resultMap>

    <sql id="postColumns">
        id, challenge_id, author_id, title, content, category, is_notice, is_pinned,
        view_count, like_count, comment_count, created_at, updated_at, deleted_at
    </sql>

    <!-- SELECT -->
    <select id="selectPostById" resultMap="PostResultMap">
        SELECT <include refid="postColumns"/>
        FROM posts WHERE id = #{id} AND deleted_at IS NULL
    </select>

    <select id="selectPostsByChallengeId" resultMap="PostResultMap">
        SELECT <include refid="postColumns"/>
        FROM posts WHERE challenge_id = #{challengeId} AND deleted_at IS NULL
        ORDER BY is_pinned DESC, created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countPostsByChallengeId" resultType="int">
        SELECT COUNT(*) FROM posts WHERE challenge_id = #{challengeId} AND deleted_at IS NULL
    </select>

    <select id="selectPostsByChallengeIds" resultMap="PostResultMap">
        SELECT <include refid="postColumns"/>
        FROM posts
        WHERE challenge_id IN
        <foreach item="id" collection="challengeIds" open="(" separator="," close=")">#{id}</foreach>
        AND deleted_at IS NULL
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countPostsByChallengeIds" resultType="int">
        SELECT COUNT(*) FROM posts
        WHERE challenge_id IN
        <foreach item="id" collection="challengeIds" open="(" separator="," close=")">#{id}</foreach>
        AND deleted_at IS NULL
    </select>

    <!-- INSERT -->
    <insert id="insertPost" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO posts (
            challenge_id, author_id, title, content, category, is_notice, is_pinned,
            view_count, like_count, comment_count, created_at, updated_at
        ) VALUES (
            #{challengeId}, #{authorId}, #{title}, #{content}, #{category}, #{isNotice}, #{isPinned},
            0, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updatePost">
        UPDATE posts SET
            title = COALESCE(#{title}, title),
            content = COALESCE(#{content}, content),
            category = COALESCE(#{category}, category),
            is_notice = COALESCE(#{isNotice}, is_notice),
            is_pinned = COALESCE(#{isPinned}, is_pinned),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>

    <update id="incrementViewCount">
        UPDATE posts SET view_count = view_count + 1 WHERE id = #{id}
    </update>

    <update id="incrementLikeCount">
        UPDATE posts SET like_count = like_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>

    <update id="decrementLikeCount">
        UPDATE posts SET like_count = like_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = #{id} AND like_count > 0
    </update>

    <update id="incrementCommentCount">
        UPDATE posts SET comment_count = comment_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>

    <update id="decrementCommentCount">
        UPDATE posts SET comment_count = comment_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = #{id} AND comment_count > 0
    </update>

    <update id="softDeletePost">
        UPDATE posts SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
6.2 PostImageMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: post_images
컬럼 수: 6

<mapper namespace="com.woorido.mapper.sns.PostImageMapper">

    <resultMap id="ImageResultMap" type="com.woorido.domain.sns.PostImage">
        <id property="id" column="id"/>
        <result property="postId" column="post_id"/>
        <result property="imageUrl" column="image_url"/>
        <result property="displayOrder" column="display_order"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectImagesByPostId" resultMap="ImageResultMap">
        SELECT id, post_id, image_url, display_order, created_at
        FROM post_images WHERE post_id = #{postId} ORDER BY display_order
    </select>

    <!-- INSERT -->
    <insert id="insertImage" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO post_images (post_id, image_url, display_order, created_at)
        VALUES (#{postId}, #{imageUrl}, #{displayOrder}, CURRENT_TIMESTAMP)
    </insert>

    <!-- DELETE -->
    <delete id="deleteImagesByPostId">
        DELETE FROM post_images WHERE post_id = #{postId}
    </delete>
</mapper>

────────────────────────────────────────────────────────────────────────────────
6.3 PostLikeMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: post_likes
컬럼 수: 5

<mapper namespace="com.woorido.mapper.sns.PostLikeMapper">

    <resultMap id="LikeResultMap" type="com.woorido.domain.sns.PostLike">
        <id property="id" column="id"/>
        <result property="postId" column="post_id"/>
        <result property="userId" column="user_id"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="existsByPostIdAndUserId" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM post_likes WHERE post_id = #{postId} AND user_id = #{userId}
    </select>

    <!-- INSERT -->
    <insert id="insertLike" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO post_likes (post_id, user_id, created_at)
        VALUES (#{postId}, #{userId}, CURRENT_TIMESTAMP)
    </insert>

    <!-- DELETE -->
    <delete id="deleteLike">
        DELETE FROM post_likes WHERE post_id = #{postId} AND user_id = #{userId}
    </delete>
</mapper>

────────────────────────────────────────────────────────────────────────────────
6.4 CommentMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: comments
컬럼 수: 11

<mapper namespace="com.woorido.mapper.sns.CommentMapper">

    <resultMap id="CommentResultMap" type="com.woorido.domain.sns.Comment">
        <id property="id" column="id"/>
        <result property="postId" column="post_id"/>
        <result property="authorId" column="author_id"/>
        <result property="parentId" column="parent_id"/>
        <result property="content" column="content"/>
        <result property="likeCount" column="like_count"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        <result property="deletedAt" column="deleted_at"/>
    </resultMap>

    <sql id="commentColumns">
        id, post_id, author_id, parent_id, content, like_count, created_at, updated_at, deleted_at
    </sql>

    <!-- SELECT -->
    <select id="selectCommentById" resultMap="CommentResultMap">
        SELECT <include refid="commentColumns"/>
        FROM comments WHERE id = #{id} AND deleted_at IS NULL
    </select>

    <select id="selectCommentsByPostId" resultMap="CommentResultMap">
        SELECT <include refid="commentColumns"/>
        FROM comments WHERE post_id = #{postId} AND parent_id IS NULL AND deleted_at IS NULL
        ORDER BY created_at ASC
    </select>

    <select id="selectRepliesByParentId" resultMap="CommentResultMap">
        SELECT <include refid="commentColumns"/>
        FROM comments WHERE parent_id = #{parentId} AND deleted_at IS NULL
        ORDER BY created_at ASC
    </select>

    <!-- INSERT -->
    <insert id="insertComment" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO comments (post_id, author_id, parent_id, content, like_count, created_at, updated_at)
        VALUES (#{postId}, #{authorId}, #{parentId}, #{content}, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    </insert>

    <!-- UPDATE -->
    <update id="updateComment">
        UPDATE comments SET content = #{content}, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>

    <update id="incrementLikeCount">
        UPDATE comments SET like_count = like_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>

    <update id="decrementLikeCount">
        UPDATE comments SET like_count = like_count - 1, updated_at = CURRENT_TIMESTAMP WHERE id = #{id} AND like_count > 0
    </update>

    <update id="softDeleteComment">
        UPDATE comments SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
6.5 CommentLikeMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: comment_likes
컬럼 수: 5

<mapper namespace="com.woorido.mapper.sns.CommentLikeMapper">

    <resultMap id="LikeResultMap" type="com.woorido.domain.sns.CommentLike">
        <id property="id" column="id"/>
        <result property="commentId" column="comment_id"/>
        <result property="userId" column="user_id"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="existsByCommentIdAndUserId" resultType="boolean">
        SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END
        FROM comment_likes WHERE comment_id = #{commentId} AND user_id = #{userId}
    </select>

    <!-- INSERT -->
    <insert id="insertLike" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO comment_likes (comment_id, user_id, created_at)
        VALUES (#{commentId}, #{userId}, CURRENT_TIMESTAMP)
    </insert>

    <!-- DELETE -->
    <delete id="deleteLike">
        DELETE FROM comment_likes WHERE comment_id = #{commentId} AND user_id = #{userId}
    </delete>
</mapper>

================================================================================
7. SYSTEM DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
7.1 NotificationMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: notifications
컬럼 수: 10
관련 정책: P-060

<mapper namespace="com.woorido.mapper.system.NotificationMapper">

    <resultMap id="NotificationResultMap" type="com.woorido.domain.system.Notification">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="type" column="type"/>
        <result property="title" column="title"/>
        <result property="content" column="content"/>
        <result property="relatedId" column="related_id"/>
        <result property="relatedType" column="related_type"/>
        <result property="isRead" column="is_read"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <sql id="notificationColumns">
        id, user_id, type, title, content, related_id, related_type, is_read, created_at
    </sql>

    <!-- SELECT -->
    <select id="selectNotificationById" resultMap="NotificationResultMap">
        SELECT <include refid="notificationColumns"/>
        FROM notifications WHERE id = #{id}
    </select>

    <select id="selectNotificationsByUserId" resultMap="NotificationResultMap">
        SELECT <include refid="notificationColumns"/>
        FROM notifications WHERE user_id = #{userId}
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countNotificationsByUserId" resultType="int">
        SELECT COUNT(*) FROM notifications WHERE user_id = #{userId}
    </select>

    <select id="countUnreadByUserId" resultType="int">
        SELECT COUNT(*) FROM notifications WHERE user_id = #{userId} AND is_read = 0
    </select>

    <!-- INSERT -->
    <insert id="insertNotification" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO notifications (user_id, type, title, content, related_id, related_type, is_read, created_at)
        VALUES (#{userId}, #{type}, #{title}, #{content}, #{relatedId}, #{relatedType}, 0, CURRENT_TIMESTAMP)
    </insert>

    <!-- UPDATE -->
    <update id="markAsRead">
        UPDATE notifications SET is_read = 1 WHERE id = #{id}
    </update>

    <update id="markAllAsReadByUserId">
        UPDATE notifications SET is_read = 1 WHERE user_id = #{userId} AND is_read = 0
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
7.2 NotificationSettingMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: notification_settings
컬럼 수: 8
관련 정책: P-060

<mapper namespace="com.woorido.mapper.system.NotificationSettingMapper">

    <resultMap id="SettingResultMap" type="com.woorido.domain.system.NotificationSetting">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="challengeEnabled" column="challenge_enabled"/>
        <result property="voteEnabled" column="vote_enabled"/>
        <result property="meetingEnabled" column="meeting_enabled"/>
        <result property="supportEnabled" column="support_enabled"/>
        <result property="snsEnabled" column="sns_enabled"/>
        <result property="systemEnabled" column="system_enabled"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectSettingByUserId" resultMap="SettingResultMap">
        SELECT id, user_id, challenge_enabled, vote_enabled, meeting_enabled,
               support_enabled, sns_enabled, system_enabled, created_at, updated_at
        FROM notification_settings WHERE user_id = #{userId}
    </select>

    <!-- INSERT -->
    <insert id="insertSetting" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO notification_settings (
            user_id, challenge_enabled, vote_enabled, meeting_enabled,
            support_enabled, sns_enabled, system_enabled, created_at, updated_at
        ) VALUES (
            #{userId}, #{challengeEnabled}, #{voteEnabled}, #{meetingEnabled},
            #{supportEnabled}, #{snsEnabled}, #{systemEnabled}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="updateSetting">
        UPDATE notification_settings SET
            challenge_enabled = #{challengeEnabled},
            vote_enabled = #{voteEnabled},
            meeting_enabled = #{meetingEnabled},
            support_enabled = #{supportEnabled},
            sns_enabled = #{snsEnabled},
            system_enabled = #{systemEnabled},
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = #{userId}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
7.3 ReportMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: reports
컬럼 수: 12
관련 정책: P-030, P-031, P-055

<mapper namespace="com.woorido.mapper.system.ReportMapper">

    <resultMap id="ReportResultMap" type="com.woorido.domain.system.Report">
        <id property="id" column="id"/>
        <result property="reporterId" column="reporter_id"/>
        <result property="targetType" column="target_type"/>
        <result property="targetId" column="target_id"/>
        <result property="reason" column="reason"/>
        <result property="description" column="description"/>
        <result property="status" column="status"/>
        <result property="processedBy" column="processed_by"/>
        <result property="processedAt" column="processed_at"/>
        <result property="processNote" column="process_note"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="reportColumns">
        id, reporter_id, target_type, target_id, reason, description, status,
        processed_by, processed_at, process_note, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectReportById" resultMap="ReportResultMap">
        SELECT <include refid="reportColumns"/>
        FROM reports WHERE id = #{id}
    </select>

    <select id="selectReportsByReporterId" resultMap="ReportResultMap">
        SELECT <include refid="reportColumns"/>
        FROM reports WHERE reporter_id = #{reporterId} ORDER BY created_at DESC
    </select>

    <select id="selectReportsByStatus" resultMap="ReportResultMap">
        SELECT <include refid="reportColumns"/>
        FROM reports WHERE status = #{status}
        ORDER BY created_at ASC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="countReportsByTargetId" resultType="int">
        SELECT COUNT(*) FROM reports
        WHERE target_type = #{targetType} AND target_id = #{targetId} AND status = 'RESOLVED'
    </select>

    <!-- INSERT -->
    <insert id="insertReport" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO reports (
            reporter_id, target_type, target_id, reason, description, status, created_at, updated_at
        ) VALUES (
            #{reporterId}, #{targetType}, #{targetId}, #{reason}, #{description}, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="processReport">
        UPDATE reports SET
            status = #{status},
            processed_by = #{processedBy},
            processed_at = CURRENT_TIMESTAMP,
            process_note = #{processNote},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
7.4 SessionMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: sessions
컬럼 수: 9

<mapper namespace="com.woorido.mapper.system.SessionMapper">

    <resultMap id="SessionResultMap" type="com.woorido.domain.system.Session">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="sessionType" column="session_type"/>
        <result property="deviceInfo" column="device_info"/>
        <result property="ipAddress" column="ip_address"/>
        <result property="isValid" column="is_valid"/>
        <result property="expiresAt" column="expires_at"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectSessionById" resultMap="SessionResultMap">
        SELECT id, user_id, session_type, device_info, ip_address, is_valid, expires_at, created_at
        FROM sessions WHERE id = #{id}
    </select>

    <select id="selectValidSessionsByUserId" resultMap="SessionResultMap">
        SELECT id, user_id, session_type, device_info, ip_address, is_valid, expires_at, created_at
        FROM sessions WHERE user_id = #{userId} AND is_valid = 1 AND expires_at > CURRENT_TIMESTAMP
    </select>

    <!-- INSERT -->
    <insert id="insertSession" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO sessions (user_id, session_type, device_info, ip_address, is_valid, expires_at, created_at)
        VALUES (#{userId}, #{sessionType}, #{deviceInfo}, #{ipAddress}, 1, #{expiresAt}, CURRENT_TIMESTAMP)
    </insert>

    <!-- UPDATE -->
    <update id="invalidateSessionByUserId">
        UPDATE sessions SET is_valid = 0 WHERE user_id = #{userId}
    </update>

    <update id="invalidateExpiredSessions">
        UPDATE sessions SET is_valid = 0 WHERE is_valid = 1 AND expires_at &lt;= CURRENT_TIMESTAMP
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
7.5 WebhookLogMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: webhook_logs
컬럼 수: 10
관련 정책: P-059

<mapper namespace="com.woorido.mapper.system.WebhookLogMapper">

    <resultMap id="WebhookLogResultMap" type="com.woorido.domain.system.WebhookLog">
        <id property="id" column="id"/>
        <result property="webhookType" column="webhook_type"/>
        <result property="payload" column="payload"/>
        <result property="status" column="status"/>
        <result property="retryCount" column="retry_count"/>
        <result property="errorMessage" column="error_message"/>
        <result property="processedAt" column="processed_at"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectUnprocessedLogs" resultMap="WebhookLogResultMap">
        SELECT id, webhook_type, payload, status, retry_count, error_message, processed_at, created_at
        FROM webhook_logs
        WHERE status = 'PENDING' AND retry_count &lt; 3
        ORDER BY created_at ASC
    </select>

    <!-- INSERT -->
    <insert id="insertLog" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO webhook_logs (webhook_type, payload, status, retry_count, created_at)
        VALUES (#{webhookType}, #{payload}, 'PENDING', 0, CURRENT_TIMESTAMP)
    </insert>

    <!-- UPDATE -->
    <update id="markAsSuccess">
        UPDATE webhook_logs SET status = 'SUCCESS', processed_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>

    <update id="markAsFailed">
        UPDATE webhook_logs SET status = 'FAILED', error_message = #{errorMessage} WHERE id = #{id}
    </update>

    <update id="incrementRetryCount">
        UPDATE webhook_logs SET retry_count = retry_count + 1 WHERE id = #{id}
    </update>
</mapper>

================================================================================
8. ADMIN DOMAIN
================================================================================

────────────────────────────────────────────────────────────────────────────────
8.1 AdminMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: admins
컬럼 수: 10

<mapper namespace="com.woorido.mapper.admin.AdminMapper">

    <resultMap id="AdminResultMap" type="com.woorido.domain.admin.Admin">
        <id property="id" column="id"/>
        <result property="email" column="email"/>
        <result property="password" column="password"/>
        <result property="name" column="name"/>
        <result property="role" column="role"/>
        <result property="isActive" column="is_active"/>
        <result property="lastLoginAt" column="last_login_at"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectAdminById" resultMap="AdminResultMap">
        SELECT id, email, password, name, role, is_active, last_login_at, created_at, updated_at
        FROM admins WHERE id = #{id}
    </select>

    <select id="selectAdminByEmail" resultMap="AdminResultMap">
        SELECT id, email, password, name, role, is_active, last_login_at, created_at, updated_at
        FROM admins WHERE email = #{email} AND is_active = 1
    </select>

    <!-- UPDATE -->
    <update id="updateLastLoginAt">
        UPDATE admins SET last_login_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>

    <update id="deactivateAdmin">
        UPDATE admins SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
8.2 FeePolicyMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: fee_policies
컬럼 수: 8
관련 정책: P-010 ~ P-012

<mapper namespace="com.woorido.mapper.admin.FeePolicyMapper">

    <resultMap id="FeePolicyResultMap" type="com.woorido.domain.admin.FeePolicy">
        <id property="id" column="id"/>
        <result property="name" column="name"/>
        <result property="minAmount" column="min_amount"/>
        <result property="maxAmount" column="max_amount"/>
        <result property="feeRate" column="fee_rate"/>
        <result property="isActive" column="is_active"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectActivePolicies" resultMap="FeePolicyResultMap">
        SELECT id, name, min_amount, max_amount, fee_rate, is_active, created_at, updated_at
        FROM fee_policies WHERE is_active = 1 ORDER BY min_amount ASC
    </select>

    <select id="selectPolicyByAmount" resultMap="FeePolicyResultMap">
        SELECT id, name, min_amount, max_amount, fee_rate, is_active, created_at, updated_at
        FROM fee_policies
        WHERE is_active = 1 AND min_amount &lt;= #{amount} AND max_amount >= #{amount}
        FETCH FIRST 1 ROW ONLY
    </select>

    <!-- INSERT -->
    <insert id="insertPolicy" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO fee_policies (name, min_amount, max_amount, fee_rate, is_active, created_at, updated_at)
        VALUES (#{name}, #{minAmount}, #{maxAmount}, #{feeRate}, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    </insert>

    <!-- UPDATE -->
    <update id="deactivatePolicy">
        UPDATE fee_policies SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = #{id}
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
8.3 AdminLogMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: admin_logs
컬럼 수: 8

<mapper namespace="com.woorido.mapper.admin.AdminLogMapper">

    <resultMap id="AdminLogResultMap" type="com.woorido.domain.admin.AdminLog">
        <id property="id" column="id"/>
        <result property="adminId" column="admin_id"/>
        <result property="action" column="action"/>
        <result property="targetType" column="target_type"/>
        <result property="targetId" column="target_id"/>
        <result property="description" column="description"/>
        <result property="ipAddress" column="ip_address"/>
        <result property="createdAt" column="created_at"/>
    </resultMap>

    <!-- SELECT -->
    <select id="selectLogsByAdminId" resultMap="AdminLogResultMap">
        SELECT id, admin_id, action, target_type, target_id, description, ip_address, created_at
        FROM admin_logs WHERE admin_id = #{adminId}
        ORDER BY created_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="selectLogsByTargetId" resultMap="AdminLogResultMap">
        SELECT id, admin_id, action, target_type, target_id, description, ip_address, created_at
        FROM admin_logs WHERE target_type = #{targetType} AND target_id = #{targetId}
        ORDER BY created_at DESC
    </select>

    <!-- INSERT -->
    <insert id="insertLog" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO admin_logs (admin_id, action, target_type, target_id, description, ip_address, created_at)
        VALUES (#{adminId}, #{action}, #{targetType}, #{targetId}, #{description}, #{ipAddress}, CURRENT_TIMESTAMP)
    </insert>
</mapper>

────────────────────────────────────────────────────────────────────────────────
8.4 RefundMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: refunds
컬럼 수: 14
관련 정책: P-052, P-021

<mapper namespace="com.woorido.mapper.admin.RefundMapper">

    <resultMap id="RefundResultMap" type="com.woorido.domain.admin.Refund">
        <id property="id" column="id"/>
        <result property="userId" column="user_id"/>
        <result property="accountId" column="account_id"/>
        <result property="amount" column="amount"/>
        <result property="reason" column="reason"/>
        <result property="status" column="status"/>
        <result property="requestedAt" column="requested_at"/>
        <result property="processedAt" column="processed_at"/>
        <result property="processedBy" column="processed_by"/>
        <result property="rejectionReason" column="rejection_reason"/>
        <result property="bankCode" column="bank_code"/>
        <result property="bankAccount" column="bank_account"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="refundColumns">
        id, user_id, account_id, amount, reason, status,
        requested_at, processed_at, processed_by, rejection_reason,
        bank_code, bank_account, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectRefundById" resultMap="RefundResultMap">
        SELECT <include refid="refundColumns"/>
        FROM refunds WHERE id = #{id}
    </select>

    <select id="selectRefundsByUserId" resultMap="RefundResultMap">
        SELECT <include refid="refundColumns"/>
        FROM refunds WHERE user_id = #{userId}
        ORDER BY requested_at DESC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="selectRefundsByStatus" resultMap="RefundResultMap">
        SELECT <include refid="refundColumns"/>
        FROM refunds WHERE status = #{status}
        ORDER BY requested_at ASC
        OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY
    </select>

    <select id="selectPendingRefunds" resultMap="RefundResultMap">
        SELECT <include refid="refundColumns"/>
        FROM refunds WHERE status = 'PENDING'
        ORDER BY requested_at ASC
    </select>

    <!-- INSERT -->
    <insert id="insertRefund" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO refunds (
            user_id, account_id, amount, reason, status,
            requested_at, bank_code, bank_account, created_at, updated_at
        ) VALUES (
            #{userId}, #{accountId}, #{amount}, #{reason}, 'PENDING',
            CURRENT_TIMESTAMP, #{bankCode}, #{bankAccount}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="approveRefund">
        UPDATE refunds SET
            status = 'APPROVED',
            processed_at = CURRENT_TIMESTAMP,
            processed_by = #{processedBy},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'PENDING'
    </update>

    <update id="rejectRefund">
        UPDATE refunds SET
            status = 'REJECTED',
            processed_at = CURRENT_TIMESTAMP,
            processed_by = #{processedBy},
            rejection_reason = #{rejectionReason},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'PENDING'
    </update>

    <update id="completeRefund">
        UPDATE refunds SET status = 'COMPLETED', updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'APPROVED'
    </update>

    <update id="failRefund">
        UPDATE refunds SET
            status = 'FAILED',
            rejection_reason = #{failureReason},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'APPROVED'
    </update>
</mapper>

────────────────────────────────────────────────────────────────────────────────
8.5 SettlementMapper.xml
────────────────────────────────────────────────────────────────────────────────
테이블: settlements
컬럼 수: 14
관련 정책: P-036

<mapper namespace="com.woorido.mapper.admin.SettlementMapper">

    <resultMap id="SettlementResultMap" type="com.woorido.domain.admin.Settlement">
        <id property="id" column="id"/>
        <result property="challengeId" column="challenge_id"/>
        <result property="type" column="type"/>
        <result property="totalAmount" column="total_amount"/>
        <result property="leaderAmount" column="leader_amount"/>
        <result property="followerAmount" column="follower_amount"/>
        <result property="followerCount" column="follower_count"/>
        <result property="status" column="status"/>
        <result property="scheduledAt" column="scheduled_at"/>
        <result property="executedAt" column="executed_at"/>
        <result property="executedBy" column="executed_by"/>
        <result property="failureReason" column="failure_reason"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
    </resultMap>

    <sql id="settlementColumns">
        id, challenge_id, type, total_amount, leader_amount, follower_amount,
        follower_count, status, scheduled_at, executed_at, executed_by,
        failure_reason, created_at, updated_at
    </sql>

    <!-- SELECT -->
    <select id="selectSettlementById" resultMap="SettlementResultMap">
        SELECT <include refid="settlementColumns"/>
        FROM settlements WHERE id = #{id}
    </select>

    <select id="selectSettlementsByChallengeId" resultMap="SettlementResultMap">
        SELECT <include refid="settlementColumns"/>
        FROM settlements WHERE challenge_id = #{challengeId}
        ORDER BY created_at DESC
    </select>

    <select id="selectLatestSettlementByChallengeId" resultMap="SettlementResultMap">
        SELECT <include refid="settlementColumns"/>
        FROM settlements WHERE challenge_id = #{challengeId}
        ORDER BY created_at DESC
        FETCH FIRST 1 ROW ONLY
    </select>

    <select id="selectScheduledSettlements" resultMap="SettlementResultMap">
        SELECT <include refid="settlementColumns"/>
        FROM settlements
        WHERE status = 'SCHEDULED' AND scheduled_at &lt;= CURRENT_TIMESTAMP
        ORDER BY scheduled_at ASC
    </select>

    <!-- INSERT -->
    <insert id="insertSettlement" useGeneratedKeys="true" keyProperty="id" keyColumn="id">
        INSERT INTO settlements (
            challenge_id, type, total_amount, leader_amount, follower_amount,
            follower_count, status, scheduled_at, created_at, updated_at
        ) VALUES (
            #{challengeId}, #{type}, #{totalAmount}, #{leaderAmount}, #{followerAmount},
            #{followerCount}, 'SCHEDULED', #{scheduledAt}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
    </insert>

    <!-- UPDATE -->
    <update id="startSettlement">
        UPDATE settlements SET status = 'PROCESSING', updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'SCHEDULED'
    </update>

    <update id="completeSettlement">
        UPDATE settlements SET
            status = 'COMPLETED',
            executed_at = CURRENT_TIMESTAMP,
            executed_by = #{executedBy},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'PROCESSING'
    </update>

    <update id="failSettlement">
        UPDATE settlements SET
            status = 'FAILED',
            failure_reason = #{failureReason},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'PROCESSING'
    </update>

    <update id="cancelSettlement">
        UPDATE settlements SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'SCHEDULED'
    </update>

    <update id="retrySettlement">
        UPDATE settlements SET
            status = 'SCHEDULED',
            scheduled_at = #{newScheduledAt},
            failure_reason = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = #{id} AND status = 'FAILED'
    </update>
</mapper>

================================================================================
통계 요약
================================================================================

총 Mapper: 32개
총 테이블: 32개

도메인별 분포:
- USER: 4개 (UserMapper, AccountMapper, AccountTransactionMapper, UserScoreMapper)
- CHALLENGE: 2개 (ChallengeMapper, ChallengeFollowerMapper)
- MEETING: 3개 (MeetingMapper, MeetingVoteMapper, MeetingVoteRecordMapper)
- EXPENSE: 6개 (ExpenseRequestMapper, ExpenseVoteMapper, ExpenseVoteRecordMapper, PaymentBarcodeMapper, LedgerEntryMapper, PaymentLogMapper)
- VOTE: 2개 (GeneralVoteMapper, GeneralVoteRecordMapper)
- SNS: 5개 (PostMapper, PostImageMapper, PostLikeMapper, CommentMapper, CommentLikeMapper)
- SYSTEM: 5개 (NotificationMapper, NotificationSettingMapper, ReportMapper, SessionMapper, WebhookLogMapper)
- ADMIN: 5개 (AdminMapper, FeePolicyMapper, AdminLogMapper, RefundMapper, SettlementMapper)

정책 반영:
- P-001 ~ P-005: 회원가입 (UserMapper)
- P-006 ~ P-012: 크레딧/수수료 (AccountMapper, FeePolicyMapper)
- P-013 ~ P-015: 챌린지 가입 (ChallengeFollowerMapper)
- P-016 ~ P-017: 자동 납입/보증금 충당 (ChallengeFollowerMapper, AccountMapper)
- P-021: 권한 박탈 60일 (ChallengeFollowerMapper)
- P-029: 장부 기록 (LedgerEntryMapper)
- P-030, P-031, P-055: 신고 (ReportMapper)
- P-033 ~ P-035: 리더 승계 (ChallengeFollowerMapper)
- P-036: 정산 (SettlementMapper)
- P-037 ~ P-042: 투표 (GeneralVoteMapper, ExpenseVoteMapper)
- P-043 ~ P-045: 모임 (MeetingMapper, MeetingVoteMapper)
- P-046 ~ P-050: 챌린지 상태 (ChallengeMapper)
- P-051, P-054, P-061: 당도 시스템 (UserScoreMapper)
- P-052: 보증금 몰수 (ChallengeFollowerMapper, RefundMapper)
- P-053: 바코드 유효기간 (PaymentBarcodeMapper)
- P-056 ~ P-058: 권한/상태 정책 (ChallengeFollowerMapper, ChallengeMapper)
- P-059: Webhook 재시도 (WebhookLogMapper)
- P-060: 알림 설정 (NotificationSettingMapper)

용어 변경 반영 (BACKLOG 2026-01-12):
- gye → challenges
- gye_members → challenge_followers
- challenge_members → challenge_followers
- current_members → current_followers
- min_members → min_followers
- max_members → max_followers

동시성 제어:
- Pessimistic Lock: selectForUpdate (accounts, challenges, general_votes, expense_votes, meeting_votes)
- Optimistic Lock: version 컬럼 (accounts)

================================================================================
관련 문서
================================================================================

- DB_Schema_1.0.0.md
- POLICY_DEFINITION.md
- BACKLOG.md
- 2-3_SPRING_SERVICE_BOILERPLATE.md

================================================================================
END OF DOCUMENT
================================================================================

파일명: 2-2_MYBATIS_MAPPER_TEMPLATE.md
작성일: 2026-01-16
버전: 1.0.0
총 라인: 약 2,500줄
총 Mapper: 32개
총 테이블: 32개
