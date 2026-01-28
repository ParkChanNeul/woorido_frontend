# Vibe Coding Strategy: Docs + Skills Synergy

> **목적**: 정보 과부하를 방지하고 AI(바이브코딩) 개발 효율성을 극대화하기 위한 콘텐츠 전략 정의
> **핵심**: "모든 것을 패키지에 담지 말고, **패턴**만 담아라."

---

## 1. 🏗️ 기본 철학: 역할 분리 (Docs vs Skills)

개발에 필요한 지식을 "참조용 지식(Reference)"과 "실행용 지식(Executable)"으로 분리하여 AI의 Context 비용을 최적화합니다.

| 구분 | Docs (`/docs`) | Skills (`SKILL.md`) |
| :--- | :--- | :--- |
| **별칭** | **도서관 (Library)** | **작업 지침서 (Instruction)** |
| **내용** | **What & Why** <br> (정책, 데이터 구조, API 명세) | **How** <br> (구현 패턴, 코드 템플릿, 스타일 가이드) |
| **형태** | 방대한 텍스트 및 테이블 | 실행 가능한 코드 스니펫 (Hook, Utility) |
| **사용법** | 필요할 때만 AI가 읽어옴 (`open_file`) | AI 프롬프트에 상주하여 항상 기억함 |

## 2. 🚀 확장 전략: Generic Patterns

**"Case-by-Case"가 아닌 "Rule-based" 접근**을 사용합니다.

### ✅ Best Practice (지향)
**"5가지 핵심 제네릭 패턴"**만 정의하여 모든 API에 적용합니다.

#### 1. API 통신 패턴 (Communication)
> "모든 API 요청은 `ApiResponse<T>`로 래핑되며, `axios` 인터셉터가 토큰을 자동 주입한다."

#### 2. 에러 처리 패턴 (Error Handling)
> "에러 발생 시 `GlobalErrorBoundary`가 처리하거나, `useToast`로 사용자에게 알린다. (Error Code 포맷 준수)"

#### 3. UX/UI 패턴 (Design System)
> "색상은 무조건 WDS 토큰(`--color-expense` 등)을 사용하고, 숫자는 `tabular-nums` 폰트를 적용한다."

#### 4. 데이터 포맷팅 패턴 (Formatting)
> "금액은 `Intl.NumberFormat` (한국 원화), 날짜는 `dayjs` (YYYY-MM-DD) 형식을 따른다."

#### 5. 페이지네이션 패턴 (Pagination)
> "목록 조회는 `useInfiniteQuery`를 사용하며, 서버의 `Page<T>` 응답 규격을 준수한다."

---

## 3. 🛠️ 워크플로우 예시

1.  **개발자(User)**: "챌린지 가입 버튼 만들어줘. 입회비 얼마인지 보여주고."
2.  **AI (Search Docs)**: `POLICY_DEFINITION.md`를 읽고 **P-015 (입회비 공식)**을 찾아냄. (What)
3.  **AI (Apply Skills)**: `SKILL.md`의 **Hook 패턴**을 적용하여 `useEntryFeeCalculator` 생성. (How)
4.  **결과**: 문서를 통해 **정확성**을 확보하고, 스킬을 통해 **코드 품질**을 확보.
