# WOORIDO ERD - 관리자 도메인
**admins, fee_policies, admin_logs**

> 📖 상위 문서: [00_ERD_OVERVIEW.md](./00_ERD_OVERVIEW.md)
> 
> 플랫폼 운영을 위한 관리자 전용 테이블

---

## 1. 관리자 계정 (admins)

```sql
CREATE TABLE admins (
  id VARCHAR2(36) PRIMARY KEY,                    -- 관리자 ID (UUID)
  email VARCHAR2(100) UNIQUE NOT NULL,
  password_hash VARCHAR2(255) NOT NULL,
  name VARCHAR2(50) NOT NULL,
  
  -- 권한
  role VARCHAR2(20) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'SUPPORT')),
  
  -- 상태
  is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  last_login_at TIMESTAMP,
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_admins_email ON admins(email);
CREATE INDEX idx_admins_role ON admins(role, is_active);
```

**관리자 역할:**
| 역할 | 설명 |
|------|------|
| `SUPER_ADMIN` | 최고 관리자 - 모든 권한 |
| `ADMIN` | 일반 관리자 - 유저/챌린지 관리 |
| `SUPPORT` | 고객 지원 - 신고 처리/CS |

---

## 2. 수수료 정책 (fee_policies)

> 동적 수수료율 관리 (1%/3%/1.5% 등)

```sql
CREATE TABLE fee_policies (
  id VARCHAR2(36) PRIMARY KEY,                    -- 정책 ID (UUID)
  
  -- 금액 범위
  min_amount NUMBER(19) NOT NULL,  -- 최소 금액 (이상)
  max_amount NUMBER(19),           -- 최대 금액 (이하), NULL이면 상한 없음
  
  -- 수수료율 (소수점 4자리까지, 0.0300 = 3%)
  rate NUMBER(5,4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  
  -- 상태
  is_active CHAR(1) DEFAULT 'Y' CHECK (is_active IN ('Y', 'N')),
  
  -- 감사
  created_by VARCHAR2(36) REFERENCES admins(id),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  
  -- 제약조건
  CONSTRAINT chk_fee_amount_range CHECK (min_amount >= 0 AND (max_amount IS NULL OR max_amount > min_amount))
);

CREATE INDEX idx_fee_policies_active ON fee_policies(is_active, min_amount);
```

**기본 데이터:**
```sql
-- 초기 수수료 정책 (PRODUCT_AGENDA 기준)
INSERT INTO fee_policies (id, min_amount, max_amount, rate, is_active) VALUES
  (SYS_GUID(), 0, 9999, 0.0100, 'Y'),        -- 소액: 1%
  (SYS_GUID(), 10000, 200000, 0.0300, 'Y'),  -- 일반: 3%
  (SYS_GUID(), 200001, NULL, 0.0150, 'Y');   -- 고액: 1.5%
```

**수수료 정책 조회:**
| 충전 금액 | 수수료율 | 예시 |
|----------|---------|------|
| 10,000원 미만 | 1% | 5,000원 → 50원 |
| 10,000~200,000원 | 3% | 100,000원 → 3,000원 |
| 200,000원 초과 | 1.5% | 500,000원 → 7,500원 |

---

## 3. 관리자 활동 로그 (admin_logs)

> 감사 추적용 (누가 무엇을 언제 했는지)

```sql
CREATE TABLE admin_logs (
  id VARCHAR2(36) PRIMARY KEY,                    -- 로그 ID (UUID)
  
  -- 관리자
  admin_id VARCHAR2(36) REFERENCES admins(id) ON DELETE SET NULL,
  
  -- 활동 정보
  action VARCHAR2(50) NOT NULL,  -- CREATE_FEE_POLICY, RESOLVE_REPORT, VERIFY_CHALLENGE 등
  target_type VARCHAR2(20),
  target_id VARCHAR2(36),
  
  -- 상세 내용 (JSON)
  details CLOB,
  
  -- 접속 정보
  ip_address VARCHAR2(50),
  user_agent VARCHAR2(500),
  
  -- 타임스탬프
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action, created_at DESC);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at DESC);
```

**관리자 활동 타입:**
| 액션 | 설명 |
|------|------|
| `CREATE_FEE_POLICY` | 수수료 정책 생성 |
| `UPDATE_FEE_POLICY` | 수수료 정책 수정 |
| `RESOLVE_REPORT` | 신고 처리 완료 |
| `SUSPEND_USER` | 유저 정지 |
| `VERIFY_CHALLENGE` | 챌린지 완주 인증 |
| `DISSOLVE_CHALLENGE` | 챌린지 강제 해산 |

**로그 조회 예시:**
```sql
-- 특정 관리자의 최근 활동
SELECT * FROM admin_logs
WHERE admin_id = #{adminId}
ORDER BY created_at DESC
FETCH FIRST 100 ROWS ONLY;

-- 특정 유저에 대한 관리자 조치
SELECT al.*, a.name as admin_name
FROM admin_logs al
JOIN admins a ON al.admin_id = a.id
WHERE al.target_type = 'USER' AND al.target_id = #{userId}
ORDER BY al.created_at DESC;
```

---

**최종 수정**: 2026-01-09
