# bkit 자동화 강화 설계서 v1.4.0 (통합본)

> **Summary**: bkit 플러그인의 자연어 트리거 및 PDCA 자동화 수준을 95%+로 강화하는 듀얼 플랫폼(Claude Code + Gemini CLI) 통합 설계
>
> **Project**: bkit Vibecoding Kit
> **Version**: 1.4.0
> **Author**: AI (POPUP STUDIO)
> **Date**: 2026-01-24
> **Status**: Draft (Consolidated)
> **Planning Doc**: [claudecode-bkit-automation-enhancement-plan-v1.4.0.md](../../01-plan/claudecode-bkit-automation-enhancement-plan-v1.4.0.md)
> **Analysis Doc**: [30-gemini-cli-automation-analysis.md](../../03-analysis/30-gemini-cli-automation-analysis.md)
> **Merged From**: Claude Code 설계서 + Gemini CLI 설계서

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A |
| Phase 2 | Coding Conventions | ✅ (lib/common.js 컨벤션 유지) |
| Phase 3 | Mockup | N/A (CLI 기반) |
| Phase 4 | API Spec | N/A (내부 함수) |

---

## 1. Overview

### 1.1 Design Goals

1. **Dual-Platform Consistency**: Claude Code와 Gemini CLI에서 동일한 PDCA 자동화 경험 제공
2. **Natural Language First**: 95%+ 기능을 자연어로 트리거 가능하게 구현
3. **Zero Manual Commands**: Feature급 작업에서 수동 명령어 0-1회로 감소
4. **Autonomous Check-Act Loop**: 90% 미만 시 자동 반복 개선

### 1.2 Design Principles

- **Single Source of Truth**: `lib/common.js`에 핵심 로직 집중, 플랫폼별 어댑터 패턴
- **Graceful Degradation**: 플랫폼별 제약 시 기능 축소 동작 (에러 없음)
- **Non-Blocking Hooks**: Hook 타임아웃(5초) 내 완료, 무거운 작업은 제안만
- **Backward Compatibility**: 기존 명령어/워크플로우 100% 호환

---

## 2. Architecture

### 2.1 Dual-Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     bkit v1.4.0 Dual-Platform Architecture                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐                    ┌──────────────────┐               │
│  │   Claude Code    │                    │   Gemini CLI     │               │
│  │  (hooks.json)    │                    │(gemini-extension)│               │
│  └────────┬─────────┘                    └────────┬─────────┘               │
│           │                                       │                          │
│           │  SessionStart                         │  SessionStart            │
│           │  PreToolUse(Write|Edit)               │  BeforeTool(write_file)  │
│           │  PostToolUse(Write)                   │  AfterTool(write_file)   │
│           │                                       │                          │
│           └───────────────────┬───────────────────┘                          │
│                               │                                              │
│                               ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Platform Abstraction Layer                          │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│  │  │  lib/common.js                                                   │  │ │
│  │  │  ├─ isGeminiCli() / isClaudeCode() - 플랫폼 감지                 │  │ │
│  │  │  ├─ formatOutput() - 플랫폼별 출력 포맷팅                        │  │ │
│  │  │  ├─ getHookContext() - Hook 컨텍스트 추출 (NEW)                  │  │ │
│  │  │  └─ emitUserPrompt() - AskUserQuestion 페이로드 생성 (NEW)       │  │ │
│  │  └─────────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                               │                                              │
│                               ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      Core Automation Engine                            │ │
│  │                                                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │   Intent    │ │  Ambiguity  │ │   PDCA      │ │  Pipeline   │      │ │
│  │  │  Detector   │ │  Detector   │ │  AutoStart  │ │ Transition  │      │ │
│  │  │   (NEW)     │ │   (NEW)     │ │   (NEW)     │ │   (NEW)     │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  │                                                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │ Requirement │ │  Implicit   │ │  Check-Act  │ │   Multi-    │      │ │
│  │  │ Fulfillment │ │  Trigger    │ │   Loop      │ │  Feature    │      │ │
│  │  │   (NEW)     │ │ Agent+Skill │ │   (NEW)     │ │   Context   │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                               │                                              │
│                               ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          Scripts Layer                                  │ │
│  │  ├─ hooks/session-start.js   - 세션 초기화 + 자동 온보딩              │ │
│  │  ├─ scripts/pre-write.js     - 설계 문서 체크 + 자동 생성 제안        │ │
│  │  ├─ scripts/pdca-post-write.js - 구현 후 Check 제안                   │ │
│  │  ├─ scripts/gap-detector-stop.js - Check 완료 + 자동 Act 제안 (NEW)   │ │
│  │  ├─ scripts/iterator-stop.js - Act 완료 + 자동 재Check (NEW)          │ │
│  │  └─ scripts/phase-transition.js - Phase 완료 + 다음 Phase 제안 (NEW)  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Hook Event Mapping (Platform Comparison)

| Event | Claude Code (hooks.json) | Gemini CLI (gemini-extension.json) | Script |
|-------|--------------------------|-------------------------------------|--------|
| Session Start | `SessionStart` | `SessionStart` | `hooks/session-start.js` |
| Before Write | `PreToolUse` (matcher: Write\|Edit) | `BeforeTool` (matcher: write_file\|replace) | `scripts/pre-write.js` |
| After Write | `PostToolUse` (matcher: Write) | `AfterTool` (matcher: write_file) | `scripts/pdca-post-write.js` |
| Before Bash | `PreToolUse` (matcher: Bash) | `BeforeTool` (matcher: run_shell_command) | `scripts/qa-pre-bash.js` |
| After Bash | `PostToolUse` (matcher: Bash) | `AfterTool` (matcher: run_shell_command) | `scripts/qa-monitor-post.js` |

### 2.3 Gemini CLI Function Calling + Hooks 결합 매커니즘

> 참조: docs/03-analysis/30-gemini-cli-automation-analysis.md

Gemini CLI에서 bkit의 자동화는 **Function Calling**과 **Hooks**의 결합으로 구현됩니다:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  Gemini CLI: Function Calling + Hooks Flow                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  사용자: "로그인 기능 구현해줘"                                              │
│       │                                                                      │
│       ▼                                                                      │
│  [Gemini Model]                                                              │
│  │  LLM이 사용자 의도 분석                                                  │
│  │  → Function Calling 결정: write_file() 호출                              │
│  │                                                                           │
│       ▼                                                                      │
│  [BeforeTool Hook 발동] ─────────────────────────────────────────────────── │
│  │  scripts/pre-write.js 실행                                               │
│  │                                                                           │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  │ 1. 설계 문서 존재 여부 확인                                         │ │
│  │  │    checkDesignDocExists('login') → false                            │ │
│  │  │                                                                      │ │
│  │  │ 2. PDCA 정책 결정                                                    │ │
│  │  │    shouldAutoStartPdca('login', 'Feature') → true                   │ │
│  │  │                                                                      │ │
│  │  │ 3. 결과 출력 (Non-blocking Suggestion)                              │ │
│  │  │    "🚫 설계 문서 없음. /pdca-design login 먼저 실행하시겠습니까?"   │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │
│  │                                                                           │
│  │  ├─ 차단(Block): 위반 시 도구 실행 중단                                 │
│  │  └─ 허용(Allow): 제안만 하고 도구 실행 계속                             │
│  │                                                                           │
│       ▼                                                                      │
│  [도구 실행: write_file()]                                                   │
│  │  파일 생성/수정                                                          │
│  │                                                                           │
│       ▼                                                                      │
│  [AfterTool Hook 발동] ──────────────────────────────────────────────────── │
│  │  scripts/pdca-post-write.js 실행                                         │
│  │                                                                           │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  │ "✅ 구현 완료. 검증(Gap Analysis)을 진행할까요?"                    │ │
│  │  │ [검증 진행] [나중에] [건너뛰기]                                      │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │
│  │                                                                           │
│       ▼                                                                      │
│  [사용자 선택 → 후속 워크플로우]                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**핵심 포인트**:
1. **LLM이 먼저 판단**: 사용자의 자연어를 LLM이 분석하여 어떤 도구를 호출할지 결정
2. **Hook이 정책 강제**: BeforeTool에서 PDCA 정책(설계 먼저)을 강제
3. **Non-blocking 제안**: 무거운 작업은 직접 실행하지 않고 **제안(Suggestion)** 메시지만 출력

### 2.4 Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PDCA Auto-Trigger Data Flow                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User Input: "로그인 기능 만들어줘"                                          │
│       │                                                                      │
│       ▼                                                                      │
│  [1. Intent Detection]                                                       │
│  │   detectNewFeatureIntent(userMessage)                                     │
│  │   → { isNewFeature: true, featureName: 'login', confidence: 0.92 }       │
│  │                                                                           │
│  │       ▼                                                                   │
│  [2. Ambiguity Check]                                                        │
│  │   calculateAmbiguityScore(userMessage, context)                           │
│  │   → { score: 45, factors: ['scope_undefined'] }                          │
│  │                                                                           │
│  │   if (score >= 50) → generateClarifyingQuestions()                       │
│  │                                                                           │
│  │       ▼                                                                   │
│  [3. Design Doc Check]                                                       │
│  │   checkDesignDocExists('login')                                           │
│  │   → false                                                                 │
│  │                                                                           │
│  │       ▼                                                                   │
│  [4. Task Classification]                                                    │
│  │   classifyTaskByLines(estimatedChanges)                                   │
│  │   → 'Feature' (requires design doc)                                       │
│  │                                                                           │
│  │       ▼                                                                   │
│  [5. PDCA Auto-Start Decision]                                               │
│  │   shouldAutoStartPdca('login', 'Feature')                                 │
│  │   → true (Feature급 이상)                                                 │
│  │                                                                           │
│  │       ▼                                                                   │
│  [6. AskUserQuestion Emit]                                                   │
│  │   emitUserPrompt({                                                        │
│  │     question: "새 기능입니다. 어떻게 진행할까요?",                        │
│  │     options: [설계부터, 계획부터, 바로 구현]                              │
│  │   })                                                                      │
│  │                                                                           │
│  │       ▼                                                                   │
│  [7. Auto-Execute Command]                                                   │
│       User selects "설계부터 (권장)"                                         │
│       → /pdca-design login 자동 실행                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.5 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Intent Detector | lib/common.js | 자연어에서 기능명/의도 추출 |
| Ambiguity Detector | Intent Detector | 모호성 점수 기반 질문 생성 |
| PDCA AutoStart | Design Doc Check, Task Classifier | 자동 PDCA 시작 결정 |
| Check-Act Loop | gap-detector, pdca-iterator | 자동 반복 개선 |
| Pipeline Transition | Phase Deliverables Check | Phase 완료 시 자동 전환 제안 |

---

## 3. Data Model

### 3.1 PDCA Status Schema v2.0

```typescript
// lib/common.js - PDCA Status Interface

interface PdcaStatusV2 {
  version: '2.0';
  lastUpdated: string;  // ISO 8601

  // Multi-feature support
  activeFeatures: string[];     // 현재 활성화된 기능들
  primaryFeature: string | null; // 주 작업 기능

  // Feature-specific status
  features: {
    [featureName: string]: FeatureStatus;
  };

  // Pipeline status (optional)
  pipeline?: {
    currentPhase: number;  // 1-9
    level: 'Starter' | 'Dynamic' | 'Enterprise';
    phaseHistory: PhaseCompletion[];
  };

  // Session context
  session: {
    startedAt: string;
    onboardingCompleted: boolean;
    lastActivity: string;
  };
}

interface FeatureStatus {
  phase: 'plan' | 'design' | 'do' | 'check' | 'act' | 'completed';
  matchRate: number | null;     // Check 단계 결과 (0-100)
  iterationCount: number;       // Act 반복 횟수
  requirements: RequirementStatus[];
  documents: {
    plan?: string;    // 파일 경로
    design?: string;
    analysis?: string;
    report?: string;
  };
  timestamps: {
    started: string;
    lastUpdated: string;
    completed?: string;
  };
}

interface RequirementStatus {
  id: string;           // REQ-001
  text: string;         // 요구사항 텍스트
  priority: 'high' | 'medium' | 'low';
  status: 'fulfilled' | 'partial' | 'unfulfilled' | 'unknown';
  score: number;        // 0, 50, 100
  evidence?: string;    // 구현 증거 (파일:라인)
}

interface PhaseCompletion {
  phase: number;
  completedAt: string;
  deliverables: string[];  // 생성된 산출물 경로
}
```

### 3.2 Intent Detection Result

```typescript
// lib/common.js - Intent Detection Interface

interface IntentDetectionResult {
  isNewFeature: boolean;
  featureName: string | null;
  confidence: number;  // 0.0 - 1.0
  intentType: 'create' | 'modify' | 'fix' | 'analyze' | 'unknown';
  extractedKeywords: string[];
  suggestedAgent?: string;  // 암시적 트리거 매칭 시
}

interface AmbiguityResult {
  score: number;  // 0-100
  factors: AmbiguityFactor[];
  shouldClarify: boolean;  // score >= 50
  clarifyingQuestions?: ClarifyingQuestion[];
}

interface AmbiguityFactor {
  type: 'scope_undefined' | 'multi_interpretation' | 'conflict_detected' | 'missing_details';
  description: string;
  weight: number;  // 가중치
}

interface ClarifyingQuestion {
  question: string;
  header: string;
  options: Array<{
    label: string;
    description: string;
  }>;
}
```

### 3.3 Platform Configuration

```typescript
// lib/common.js - Platform Config Interface

interface BkitConfig {
  pdca: {
    matchRateThreshold: number;  // default: 90
    maxIterations: number;       // default: 5
    autoIterate: boolean;        // default: true
    requireDesignDoc: boolean;   // default: true (Feature급 이상)
  };
  triggers: {
    implicitEnabled: boolean;    // default: true
    confidenceThreshold: number; // default: 0.8
    clarifyAmbiguity: boolean;   // default: true
  };
  pipeline: {
    autoTransition: boolean;     // default: true
    skipConfirmation: boolean;   // default: false
  };
}
```

---

## 4. API Specification

### 4.1 New Functions in lib/common.js

#### 4.1.1 Intent Detection Functions

```javascript
/**
 * 사용자 메시지에서 새 기능 요청 의도 감지
 * @param {string} userMessage - 사용자 입력
 * @returns {IntentDetectionResult}
 */
function detectNewFeatureIntent(userMessage) {
  // 8개 언어 지원: EN, KO, JA, ZH, ES, FR, DE, IT
  const patterns = {
    en: [  // English
      /(create|implement|add|build|develop)\s+(?:a\s+)?(.+?)\s*(feature|functionality|module)/i,
      /(make|write)\s+(?:a\s+)?(.+)/i
    ],
    ko: [  // Korean
      /(.+?)(기능|feature)\s*(만들어|구현|추가|개발|작성)/i,
      /(.+?)\s*(작성|생성|만들)\s*해\s*줘/i,
      /(.+?)(을|를)\s*(구현|개발|추가)/i
    ],
    ja: [  // Japanese
      /(.+?)(機能|フィーチャー)\s*(作って|実装|追加)/i,
      /(.+?)(を)?(作成|実装|開発)(して|する)/i
    ],
    zh: [  // Chinese
      /(创建|实现|添加|开发)(.+?)(功能|模块)/i,
      /(做|写|建)(.+?)(功能|系统)/i
    ],
    es: [  // Spanish
      /(crear|implementar|añadir|desarrollar)\s+(?:una?\s+)?(.+?)\s*(función|funcionalidad|módulo)/i,
      /(hacer|escribir)\s+(?:una?\s+)?(.+)/i
    ],
    fr: [  // French
      /(créer|implémenter|ajouter|développer)\s+(?:une?\s+)?(.+?)\s*(fonction|fonctionnalité|module)/i,
      /(faire|écrire)\s+(?:une?\s+)?(.+)/i
    ],
    de: [  // German
      /(erstellen|implementieren|hinzufügen|entwickeln)\s+(?:eine?n?\s+)?(.+?)\s*(Funktion|Funktionalität|Modul)/i,
      /(machen|schreiben)\s+(?:eine?n?\s+)?(.+)/i
    ],
    it: [  // Italian
      /(creare|implementare|aggiungere|sviluppare)\s+(?:una?\s+)?(.+?)\s*(funzione|funzionalità|modulo)/i,
      /(fare|scrivere)\s+(?:una?\s+)?(.+)/i
    ]
  };

  // Pattern matching with confidence scoring
  // ...
}

/**
 * 암시적 에이전트 트리거 매칭
 * @param {string} userMessage - 사용자 입력
 * @returns {{ agent: string, confidence: number, pattern: string } | null}
 */
function matchImplicitAgentTrigger(userMessage) {
  // 8개 언어 지원: EN, KO, JA, ZH, ES, FR, DE, IT
  const implicitPatterns = {
    'gap-detector': {
      patterns: [
        // EN (English)
        /is this (right|correct)/i, /does this match/i,
        // KO (Korean)
        /맞아\?/, /괜찮아\?/, /설계대로/,
        // JA (Japanese)
        /正しい/, /合ってる/, /これで(いい|大丈夫)/,
        // ZH (Chinese)
        /对吗/, /对不对/, /正确吗/,
        // ES (Spanish)
        /está (bien|correcto)/i, /es correcto/i,
        // FR (French)
        /c'est (bon|correct)/i, /est-ce correct/i,
        // DE (German)
        /ist (das|es) (richtig|korrekt)/i,
        // IT (Italian)
        /è (giusto|corretto)/i, /va bene/i
      ],
      contextRequired: ['design', 'implementation']
    },
    'code-analyzer': {
      patterns: [
        // EN (English)
        /any (issues|problems)/i, /something (wrong|off)/i,
        // KO (Korean)
        /이상해/, /뭔가.*이상/, /문제.*있/,
        // JA (Japanese)
        /おかしい/, /問題/, /品質/,
        // ZH (Chinese)
        /有问题/, /质量/, /奇怪/,
        // ES (Spanish)
        /hay (problemas|errores)/i, /algo (mal|raro)/i,
        // FR (French)
        /il y a (des problèmes|des erreurs)/i,
        // DE (German)
        /gibt es (Probleme|Fehler)/i,
        // IT (Italian)
        /ci sono (problemi|errori)/i, /qualcosa (di sbagliato|non va)/i
      ],
      contextRequired: ['code']
    },
    'pdca-iterator': {
      patterns: [
        // EN (English)
        /make.*better/i, /improve/i, /fix (this|it)/i,
        // KO (Korean)
        /고쳐/, /더.*좋게/, /개선/,
        // JA (Japanese)
        /直して/, /修正/, /改善/,
        // ZH (Chinese)
        /改进/, /修复/, /改善/,
        // ES (Spanish)
        /mejorar/i, /arreglar/i, /corregir/i,
        // FR (French)
        /améliorer/i, /corriger/i, /réparer/i,
        // DE (German)
        /verbessern/i, /reparieren/i, /korrigieren/i,
        // IT (Italian)
        /migliorare/i, /correggere/i, /riparare/i
      ],
      contextRequired: ['check', 'act']
    },
    'report-generator': {
      patterns: [
        // EN (English)
        /what did we/i, /status/i, /progress/i, /summary/i,
        // KO (Korean)
        /뭐.*했어/, /진행.*상황/, /요약/,
        // JA (Japanese)
        /何をした/, /進捗/, /状況/,
        // ZH (Chinese)
        /做了什么/, /进度/, /状态/,
        // ES (Spanish)
        /qué hicimos/i, /estado/i, /progreso/i,
        // FR (French)
        /qu'avons-nous fait/i, /statut/i, /progrès/i,
        // DE (German)
        /was haben wir/i, /Status/i, /Fortschritt/i,
        // IT (Italian)
        /cosa abbiamo fatto/i, /stato/i, /progresso/i
      ],
      contextRequired: ['any']
    },
    'starter-guide': {
      patterns: [
        // EN (English)
        /help.*understand/i, /don't understand/i, /confused/i,
        // KO (Korean)
        /이해.*안.*돼/, /설명해/, /어려워/, /모르겠/,
        // JA (Japanese)
        /わからない/, /教えて/, /難しい/,
        // ZH (Chinese)
        /不懂/, /不明白/, /太难/,
        // ES (Spanish)
        /no entiendo/i, /explica/i, /difícil/i,
        // FR (French)
        /je ne comprends pas/i, /explique/i, /difficile/i,
        // DE (German)
        /verstehe nicht/i, /erkläre/i, /schwierig/i,
        // IT (Italian)
        /non capisco/i, /spiega/i, /difficile/i
      ],
      contextRequired: ['any']
    }
  };

  // Pattern matching with context validation
  // ...
}

/**
 * 암시적 스킬 트리거 매칭 (Skills도 자동 트리거됨!)
 * @param {string} userMessage - 사용자 입력
 * @returns {{ skill: string, confidence: number, pattern: string } | null}
 *
 * NOTE: Claude Code 공식 문서에 따르면 Skills도 description 필드 기반으로 자동 트리거됨
 * - user-invocable: false → 사용자는 호출 못하지만 Claude가 자동 로드
 * - disable-model-invocation: true → Claude 자동 로드 방지 (side-effect 있는 skill용)
 */
function matchImplicitSkillTrigger(userMessage) {
  // 8개 언어 지원: EN, KO, JA, ZH, ES, FR, DE, IT
  const implicitSkillPatterns = {
    'starter': {
      patterns: [
        // EN
        /static (website|site)/i, /portfolio/i, /landing page/i, /beginner/i, /first (website|project)/i,
        // KO
        /정적\s*(웹|사이트)/, /포트폴리오/, /랜딩/, /초보/, /첫\s*(웹|프로젝트)/,
        // JA
        /静的(サイト|ウェブ)/, /ポートフォリオ/, /初心者/, /初めて/,
        // ZH
        /静态(网站|网页)/, /作品集/, /初学者/, /新手/,
        // ES
        /sitio (web )?estático/i, /portafolio/i, /principiante/i,
        // FR
        /site (web )?statique/i, /portfolio/i, /débutant/i,
        // DE
        /statische (Webseite|Website)/i, /Portfolio/i, /Anfänger/i,
        // IT
        /sito (web )?statico/i, /portfolio/i, /principiante/i
      ],
      excludePatterns: [/backend/, /database/, /authentication/, /login/]
    },
    'dynamic': {
      patterns: [
        // EN
        /fullstack/i, /full-stack/i, /BaaS/i, /login (feature|system)/i, /authentication/i, /database/i,
        // KO
        /풀스택/, /로그인\s*기능/, /인증/, /회원가입/, /데이터베이스/,
        // JA
        /フルスタック/, /ログイン機能/, /認証/, /データベース/,
        // ZH
        /全栈/, /登录功能/, /身份验证/, /数据库/,
        // ES
        /fullstack/i, /autenticación/i, /base de datos/i,
        // FR
        /fullstack/i, /authentification/i, /base de données/i,
        // DE
        /Fullstack/i, /Authentifizierung/i, /Datenbank/i,
        // IT
        /fullstack/i, /autenticazione/i, /database/i
      ],
      excludePatterns: [/kubernetes/i, /terraform/i, /microservice/i]
    },
    'enterprise': {
      patterns: [
        // EN
        /microservice/i, /kubernetes/i, /k8s/i, /terraform/i, /AWS/i, /enterprise/i,
        // KO
        /마이크로서비스/, /쿠버네티스/, /테라폼/, /엔터프라이즈/,
        // JA
        /マイクロサービス/, /クベルネテス/, /エンタープライズ/,
        // ZH
        /微服务/, /企业级/, /云架构/,
        // ES
        /microservicios/i, /empresarial/i,
        // FR
        /microservices/i, /entreprise/i,
        // DE
        /Microservices/i, /Unternehmen/i,
        // IT
        /microservizi/i, /aziendale/i
      ]
    },
    'mobile-app': {
      patterns: [
        // EN
        /mobile app/i, /react native/i, /flutter/i, /expo/i, /iOS app/i, /android app/i,
        // KO
        /모바일\s*앱/, /리액트\s*네이티브/, /플러터/, /아이폰\s*앱/, /안드로이드\s*앱/,
        // JA
        /モバイルアプリ/, /リアクトネイティブ/, /フラッター/,
        // ZH
        /移动应用/, /手机应用/,
        // ES
        /aplicación móvil/i, /app móvil/i,
        // FR
        /application mobile/i, /app mobile/i,
        // DE
        /mobile App/i, /Handy-App/i,
        // IT
        /app mobile/i, /applicazione mobile/i
      ]
    },
    'desktop-app': {
      patterns: [
        // EN
        /desktop app/i, /electron/i, /tauri/i, /mac app/i, /windows app/i,
        // KO
        /데스크톱\s*앱/, /일렉트론/, /타우리/, /맥\s*앱/, /윈도우\s*앱/,
        // JA
        /デスクトップアプリ/, /エレクトロン/,
        // ZH
        /桌面应用/, /桌面程序/,
        // ES
        /aplicación de escritorio/i,
        // FR
        /application de bureau/i,
        // DE
        /Desktop-App/i, /Desktop-Anwendung/i,
        // IT
        /applicazione desktop/i
      ]
    },

    // === PDCA & Pipeline Skills ===

    'zero-script-qa': {
      patterns: [
        // EN
        /zero script qa/i, /log.based test/i, /docker log/i, /no test script/i,
        // KO
        /제로\s*스크립트/, /로그\s*기반\s*테스트/, /도커\s*로그/,
        // JA
        /ゼロスクリプト/, /ログベース/, /Dockerログ/,
        // ZH
        /零脚本/, /日志测试/, /Docker日志/,
        // ES/FR/DE/IT
        /sin scripts de prueba/i, /sans scripts de test/i, /ohne Testskripte/i, /senza script di test/i
      ]
    },
    'bkit-templates': {
      patterns: [
        // EN
        /template/i, /plan document/i, /design document/i, /analysis document/i,
        // KO
        /템플릿/, /계획서/, /설계서/, /분석서/, /보고서/,
        // JA
        /テンプレート/, /計画書/, /設計書/, /分析書/,
        // ZH
        /模板/, /计划书/, /设计书/, /分析报告/
      ]
    },
    'bkit-rules': {
      patterns: [
        // EN
        /bkit/i, /PDCA/i, /develop/i, /implement/i, /feature/i,
        // KO
        /개발/, /기능/, /버그/, /코드/, /설계/,
        // JA
        /開発/, /機能/, /バグ/, /コード/,
        // ZH
        /开发/, /功能/, /代码/, /设计/
      ]
    },
    'development-pipeline': {
      patterns: [
        // EN
        /pipeline/i, /development order/i, /where.*start/i, /what.*first/i,
        // KO
        /파이프라인/, /개발\s*순서/, /뭐부터/, /어디서부터/, /순서/,
        // JA
        /パイプライン/, /開発順序/, /何から/, /どこから/,
        // ZH
        /开发流程/, /从哪里开始/, /开发顺序/
      ]
    },

    // === Phase Skills (Phase 1-9) ===

    'phase-1-schema': {
      patterns: [
        // EN
        /schema/i, /terminology/i, /data model/i, /entity/i,
        // KO
        /스키마/, /용어/, /데이터\s*모델/, /엔티티/,
        // JA
        /スキーマ/, /用語/, /データモデル/,
        // ZH
        /模式/, /术语/, /数据模型/
      ]
    },
    'phase-2-convention': {
      patterns: [
        // EN
        /convention/i, /coding style/i, /naming rule/i, /code standard/i,
        // KO
        /컨벤션/, /코딩\s*스타일/, /네이밍\s*규칙/, /코드\s*표준/,
        // JA
        /コンベンション/, /コーディングスタイル/, /命名規則/,
        // ZH
        /编码规范/, /命名规则/, /代码标准/
      ]
    },
    'phase-3-mockup': {
      patterns: [
        // EN
        /mockup/i, /prototype/i, /wireframe/i, /UI design/i,
        // KO
        /목업/, /프로토타입/, /와이어프레임/, /UI\s*디자인/,
        // JA
        /モックアップ/, /プロトタイプ/, /ワイヤーフレーム/,
        // ZH
        /原型/, /线框图/, /UI设计/
      ]
    },
    'phase-4-api': {
      patterns: [
        // EN
        /API design/i, /REST API/i, /backend/i, /endpoint/i,
        // KO
        /API\s*설계/, /백엔드/, /엔드포인트/,
        // JA
        /API設計/, /バックエンド/, /エンドポイント/,
        // ZH
        /API设计/, /后端/, /接口/
      ]
    },
    'phase-5-design-system': {
      patterns: [
        // EN
        /design system/i, /component library/i, /design token/i, /shadcn/i,
        // KO
        /디자인\s*시스템/, /컴포넌트\s*라이브러리/, /디자인\s*토큰/,
        // JA
        /デザインシステム/, /コンポーネントライブラリ/,
        // ZH
        /设计系统/, /组件库/, /设计令牌/
      ]
    },
    'phase-6-ui-integration': {
      patterns: [
        // EN
        /UI implementation/i, /API integration/i, /state management/i,
        // KO
        /UI\s*구현/, /API\s*연동/, /상태\s*관리/,
        // JA
        /UI実装/, /API連携/, /状態管理/,
        // ZH
        /UI实现/, /API集成/, /状态管理/
      ]
    },
    'phase-7-seo-security': {
      patterns: [
        // EN
        /SEO/i, /security/i, /meta tag/i, /XSS/i, /CSRF/i,
        // KO
        /검색\s*최적화/, /보안/, /메타\s*태그/,
        // JA
        /SEO/, /セキュリティ/, /メタタグ/,
        // ZH
        /搜索优化/, /安全/, /元标签/
      ]
    },
    'phase-8-review': {
      patterns: [
        // EN
        /code review/i, /architecture review/i, /quality check/i, /gap analysis/i,
        // KO
        /코드\s*리뷰/, /아키텍처\s*리뷰/, /품질\s*검사/, /갭\s*분석/,
        // JA
        /コードレビュー/, /アーキテクチャレビュー/, /品質チェック/,
        // ZH
        /代码审查/, /架构审查/, /质量检查/
      ]
    },
    'phase-9-deployment': {
      patterns: [
        // EN
        /deployment/i, /CI\/CD/i, /production/i, /vercel/i, /kubernetes/i,
        // KO
        /배포/, /프로덕션/, /운영\s*환경/,
        // JA
        /デプロイ/, /本番/, /運用環境/,
        // ZH
        /部署/, /生产环境/, /运维/
      ]
    }
  };

  // Pattern matching with exclusion check
  // ...
}
```

#### 4.1.2 Ambiguity Detection Functions

```javascript
/**
 * 요청의 모호성 점수 계산
 * @param {string} userRequest - 사용자 요청
 * @param {object} context - 현재 컨텍스트 (파일, PDCA 상태 등)
 * @returns {AmbiguityResult}
 */
function calculateAmbiguityScore(userRequest, context) {
  // === Magic Word Bypass (from Gemini Design) ===
  // !hotfix, !prototype 키워드로 PDCA 체크 우회 가능
  const bypassKeywords = ['!hotfix', '!prototype', '!bypass'];
  for (const keyword of bypassKeywords) {
    if (userRequest.includes(keyword)) {
      return {
        score: 0,
        factors: [],
        shouldClarify: false,
        bypassed: true,
        bypassReason: `Magic word "${keyword}" detected`
      };
    }
  }

  let score = 0;
  const factors = [];

  // === Addition Factors (점수 증가) ===

  // 1. 구체적 명사/동사 부재 체크 (+20)
  if (!hasSpecificNouns(userRequest)) {
    score += 20;
    factors.push({ type: 'missing_details', weight: 20 });
  }

  // 2. 범위 미지정 체크 (+20)
  if (!hasScopeDefinition(userRequest)) {
    score += 20;
    factors.push({ type: 'scope_undefined', weight: 20 });
  }

  // 3. 다중 해석 가능 체크 (+30)
  if (hasMultipleInterpretations(userRequest)) {
    score += 30;
    factors.push({ type: 'multi_interpretation', weight: 30 });
  }

  // 4. 기존 코드/문서와 충돌 가능 체크 (+30)
  if (detectContextConflicts(userRequest, context)) {
    score += 30;
    factors.push({ type: 'conflict_detected', weight: 30 });
  }

  // === Deduction Factors (점수 감소 - from Gemini Design) ===

  // 5. 파일 경로/확장자 포함 시 (-30)
  if (containsFilePath(userRequest)) {
    score -= 30;
    factors.push({ type: 'has_file_path', weight: -30 });
  }

  // 6. 기술 용어 포함 시 (-20)
  if (containsTechnicalTerms(userRequest)) {
    score -= 20;
    factors.push({ type: 'has_technical_terms', weight: -20 });
  }

  // 최소값 0 보장
  score = Math.max(0, score);

  return {
    score,
    factors,
    shouldClarify: score >= 50,
    clarifyingQuestions: score >= 50 ? generateClarifyingQuestions(userRequest, factors) : undefined,
    bypassed: false
  };
}

/**
 * 파일 경로/확장자 포함 여부 확인 (Gemini 설계서 추가)
 */
function containsFilePath(text) {
  const patterns = [
    /\.(js|ts|tsx|jsx|py|go|rs|java|cpp|c|h|md|json|yaml|yml)(\s|$)/i,
    /(src|lib|scripts|hooks|docs|tests?|spec)\//i,
    /[A-Za-z]:\\|\/[A-Za-z]+\//  // Windows/Unix paths
  ];
  return patterns.some(p => p.test(text));
}

/**
 * 기술 용어 포함 여부 확인 (Gemini 설계서 추가)
 */
function containsTechnicalTerms(text) {
  const technicalTerms = [
    // Functions/Methods
    /function\s+\w+/i, /class\s+\w+/i, /interface\s+\w+/i,
    // Framework specific
    /useState|useEffect|component|module|import|export/i,
    // API terms
    /REST|GraphQL|endpoint|API|HTTP|GET|POST|PUT|DELETE/i,
    // Database
    /SELECT|INSERT|UPDATE|DELETE|JOIN|WHERE/i,
    // bkit specific
    /PDCA|gap-detector|pdca-iterator|pipeline/i
  ];
  return technicalTerms.some(p => p.test(text));
}

/**
 * 명확화 질문 생성
 * @param {string} userRequest - 원본 요청
 * @param {AmbiguityFactor[]} factors - 모호성 요인
 * @returns {ClarifyingQuestion[]}
 */
function generateClarifyingQuestions(userRequest, factors) {
  const questions = [];

  for (const factor of factors) {
    switch (factor.type) {
      case 'scope_undefined':
        questions.push({
          question: `"${extractFeatureName(userRequest)}" 기능의 범위를 정해주세요`,
          header: 'Scope',
          options: [
            { label: '최소 기능', description: '핵심 기능만 구현' },
            { label: '기본 기능', description: '일반적인 기능 포함' },
            { label: '전체 기능', description: '모든 관련 기능 포함' }
          ]
        });
        break;
      case 'conflict_detected':
        questions.push({
          question: '기존 코드와 관계를 정해주세요',
          header: 'Conflict',
          options: [
            { label: '확장', description: '기존 코드 확장' },
            { label: '교체', description: '새 코드로 대체' },
            { label: '별도 생성', description: '새 파일/모듈로 분리' }
          ]
        });
        break;
      // ... 기타 케이스
    }
  }

  return questions;
}
```

#### 4.1.3 PDCA Automation Functions

```javascript
/**
 * PDCA 자동 시작 결정
 * @param {string} feature - 기능명
 * @param {string} taskClassification - Quick Fix | Minor Change | Feature | Major
 * @returns {boolean}
 */
function shouldAutoStartPdca(feature, taskClassification) {
  const config = getBkitConfig();

  // Quick Fix → 자동 시작 안 함
  if (taskClassification === 'Quick Fix') return false;

  // Minor Change → 설정에 따라
  if (taskClassification === 'Minor Change') {
    return config.pdca.requireDesignDoc;
  }

  // Feature, Major → 강력 권장 (true)
  return true;
}

/**
 * PDCA 페이즈 자동 진행
 * @param {string} feature - 기능명
 * @param {string} currentPhase - 현재 페이즈
 * @param {object} result - 페이즈 결과 (matchRate 등)
 * @returns {{ nextPhase: string, autoExecute: boolean, command?: string }}
 */
function autoAdvancePdcaPhase(feature, currentPhase, result) {
  const transitions = {
    'plan': { next: 'design', command: `/pdca-design ${feature}` },
    'design': { next: 'do', command: null }, // Do는 자동 실행 없음
    'do': { next: 'check', command: `/pdca-analyze ${feature}` },
    'check': {
      next: result.matchRate >= 90 ? 'completed' : 'act',
      command: result.matchRate >= 90
        ? `/pdca-report ${feature}`
        : `/pdca-iterate ${feature}`
    },
    'act': { next: 'check', command: `/pdca-analyze ${feature}` }
  };

  const transition = transitions[currentPhase];
  return {
    nextPhase: transition.next,
    autoExecute: transition.command !== null,
    command: transition.command
  };
}

/**
 * 요구사항 충족도 계산
 * @param {string} planDocPath - Plan 문서 경로
 * @param {object} implementationAnalysis - 구현 분석 결과
 * @returns {{ overall: number, requirements: RequirementStatus[], gaps: string[] }}
 */
function calculateRequirementFulfillment(planDocPath, implementationAnalysis) {
  const requirements = extractRequirementsFromPlan(planDocPath);
  const results = [];
  let totalScore = 0;

  for (const req of requirements) {
    const status = analyzeRequirementImplementation(req, implementationAnalysis);
    results.push(status);
    totalScore += status.score;
  }

  const overall = requirements.length > 0
    ? Math.round(totalScore / requirements.length)
    : 0;

  const gaps = results
    .filter(r => r.status !== 'fulfilled')
    .map(r => `${r.id}: ${r.text}`);

  return { overall, requirements: results, gaps };
}
```

#### 4.1.4 Platform Abstraction Functions

```javascript
/**
 * Hook 컨텍스트 추출 (플랫폼 통합)
 * @returns {HookContext}
 */
function getHookContext() {
  const isGemini = isGeminiCli();

  if (isGemini) {
    return {
      platform: 'gemini',
      toolName: process.env.TOOL_NAME || 'unknown',
      toolInput: JSON.parse(process.env.TOOL_INPUT || '{}'),
      filePath: process.env.FILE_PATH,
      sessionId: process.env.SESSION_ID
    };
  } else {
    return {
      platform: 'claude',
      toolName: process.env.TOOL_NAME || 'unknown',
      toolInput: JSON.parse(process.env.TOOL_PARAMS || '{}'),
      filePath: process.env.FILE_PATH,
      sessionId: process.env.SESSION_ID
    };
  }
}

/**
 * AskUserQuestion 페이로드 생성 (플랫폼 통합)
 * @param {object} options - 질문 옵션
 * @returns {string} - 출력할 JSON 또는 텍스트
 */
function emitUserPrompt(options) {
  const isGemini = isGeminiCli();

  const payload = {
    type: 'ask_user',
    questions: options.questions || [{
      question: options.question,
      header: options.header || 'Question',
      options: options.options,
      multiSelect: options.multiSelect || false
    }]
  };

  if (isGemini) {
    // Gemini CLI: JSON 출력
    return JSON.stringify(payload);
  } else {
    // Claude Code: 포맷된 텍스트
    return formatAskUserQuestion(payload);
  }
}

/**
 * 도구 실행 차단 출력 (플랫폼별 - from Gemini Design)
 * @param {string} reason - 차단 사유
 * @param {string} suggestion - 제안 명령어
 * @returns {void} - 플랫폼에 맞게 출력 후 종료
 */
function outputBlock(reason, suggestion) {
  const isGemini = isGeminiCli();

  if (isGemini) {
    // Gemini CLI: stderr로 출력 + exit 1
    console.error(`🚫 ${reason}`);
    if (suggestion) {
      console.error(`💡 Suggestion: ${suggestion}`);
    }
    process.exit(1);  // Exit 1 = Block tool execution
  } else {
    // Claude Code: JSON decision block
    console.log(JSON.stringify({
      decision: 'block',
      reason: reason,
      suggestion: suggestion
    }));
  }
}

/**
 * 도구 실행 허용 + 컨텍스트 출력 (플랫폼별 - from Gemini Design)
 * @param {string} context - 추가 컨텍스트/제안 메시지
 * @returns {void} - 플랫폼에 맞게 출력
 */
function outputAllow(context) {
  const isGemini = isGeminiCli();

  if (isGemini) {
    // Gemini CLI: stdout으로 JSON 출력 (Non-blocking suggestion)
    // 중요: stdout 오염 방지를 위해 최소한의 출력만
    if (context) {
      console.log(JSON.stringify({ type: 'context', message: context }));
    }
    process.exit(0);  // Exit 0 = Allow tool execution
  } else {
    // Claude Code: JSON decision allow with optional context
    console.log(JSON.stringify({
      decision: 'allow',
      ...(context && { add_context: context })
    }));
  }
}
```

### 4.2 Script Modifications

#### 4.2.1 hooks/session-start.js 수정

```javascript
// 추가할 로직

async function enhancedOnboarding() {
  const pdcaStatus = getPdcaStatusFull();
  const level = detectLevel();

  // 1. 기존 작업 확인
  if (pdcaStatus.activeFeatures?.length > 0) {
    const primary = pdcaStatus.primaryFeature;
    const status = pdcaStatus.features[primary];

    console.log(emitUserPrompt({
      question: `이전 작업이 있습니다. 어떻게 할까요?`,
      header: 'Resume',
      options: [
        { label: `${primary} 계속 (${status.phase})`, description: '이전 작업 이어하기' },
        { label: '새 작업 시작', description: '다른 기능 개발' },
        { label: '상태 확인', description: 'PDCA 현황 보기' }
      ]
    }));
    return;
  }

  // 2. 신규 사용자 온보딩
  console.log(emitUserPrompt({
    question: '무엇을 도와드릴까요?',
    header: 'Help Type',
    options: [
      { label: 'bkit 학습', description: '소개 및 9단계 파이프라인' },
      { label: 'Claude Code 학습', description: '설정 및 사용법' },
      { label: '새 프로젝트 시작', description: '프로젝트 초기화' },
      { label: '자유롭게 시작', description: '가이드 없이 진행' }
    ]
  }));
}
```

#### 4.2.2 scripts/gap-detector-stop.js 수정

```javascript
// 자동 Act 트리거 로직 추가

async function handleGapDetectorResult(result) {
  const { matchRate, feature } = result;
  const config = getBkitConfig();

  if (matchRate >= config.pdca.matchRateThreshold) {
    // 90% 이상: 완료 제안
    console.log(emitUserPrompt({
      question: `매치율 ${matchRate}%입니다. 완료 보고서를 생성할까요?`,
      header: 'Complete',
      options: [
        { label: '보고서 생성 (권장)', description: '/pdca-report 실행' },
        { label: '추가 개선', description: '/pdca-iterate 실행' },
        { label: '나중에', description: '현재 상태 유지' }
      ]
    }));
  } else {
    // 90% 미만: 자동 개선 제안
    const pdcaStatus = getPdcaStatusFull();
    const iterCount = pdcaStatus.features[feature]?.iterationCount || 0;

    if (iterCount >= config.pdca.maxIterations) {
      console.log(formatOutput(
        `⚠️ 최대 반복 횟수(${config.pdca.maxIterations})에 도달했습니다.\n수동 검토가 필요합니다.`,
        'warning'
      ));
      return;
    }

    console.log(emitUserPrompt({
      question: `매치율 ${matchRate}%입니다. 자동 개선할까요?`,
      header: 'Auto-Fix',
      options: [
        { label: '자동 개선 (권장)', description: `/pdca-iterate 실행 (${iterCount + 1}/${config.pdca.maxIterations})` },
        { label: '수동 수정', description: '직접 코드 수정 후 재분석' },
        { label: '현재 상태로 완료', description: '경고와 함께 진행' }
      ]
    }));
  }
}
```

#### 4.2.3 scripts/iterator-stop.js 수정

```javascript
// 자동 재Check 트리거 로직 추가

async function handleIteratorResult(result) {
  const { improved, feature, changes } = result;
  const pdcaStatus = getPdcaStatusFull();
  const featureStatus = pdcaStatus.features[feature];

  updatePdcaStatus({
    features: {
      [feature]: {
        ...featureStatus,
        iterationCount: (featureStatus.iterationCount || 0) + 1
      }
    }
  });

  if (improved) {
    // 개선됨: 자동 재분석 제안
    console.log(formatOutput(
      `✅ 개선 완료: ${changes.length}개 파일 수정됨`,
      'success'
    ));

    console.log(emitUserPrompt({
      question: '재분석을 진행할까요?',
      header: 'Re-Analyze',
      options: [
        { label: '재분석 (권장)', description: '/pdca-analyze 실행' },
        { label: '추가 수정', description: '계속 수정 후 재분석' },
        { label: '완료', description: '현재 상태로 완료' }
      ]
    }));
  } else {
    // 개선 실패/변경 없음
    console.log(formatOutput(
      `⚠️ 자동 개선이 추가 변경을 찾지 못했습니다.`,
      'warning'
    ));
  }
}
```

---

## 5. Implementation Guide

### 5.1 File Structure

```
bkit-claude-code/
├── lib/
│   └── common.js                    # 핵심 유틸리티 (모든 NEW 함수 추가)
│
├── hooks/
│   ├── hooks.json                   # Claude Code hook 정의
│   └── session-start.js             # 세션 시작 훅 (수정)
│
├── scripts/
│   ├── pre-write.js                 # Write 전 훅 (수정)
│   ├── pdca-post-write.js           # Write 후 훅 (수정)
│   ├── gap-detector-stop.js         # Check 완료 훅 (수정)
│   ├── iterator-stop.js             # Act 완료 훅 (수정)
│   ├── phase-transition.js          # Phase 전환 훅 (NEW)
│   ├── phase1-schema-stop.js        # Phase 1 완료 훅 (NEW)
│   ├── phase2-convention-stop.js    # Phase 2 완료 훅 (NEW)
│   ├── phase3-mockup-stop.js        # Phase 3 완료 훅 (NEW)
│   └── phase7-seo-stop.js           # Phase 7 완료 훅 (NEW)
│
├── agents/
│   ├── gap-detector.md              # 트리거 키워드 확장
│   ├── code-analyzer.md             # 트리거 키워드 확장
│   ├── pdca-iterator.md             # 트리거 키워드 확장
│   ├── report-generator.md          # 트리거 키워드 확장
│   └── starter-guide.md             # 트리거 키워드 확장
│
├── gemini-extension.json            # Gemini CLI hook 정의 (수정)
└── GEMINI.md                        # Gemini 컨텍스트 문서 (수정)
```

### 5.2 Implementation Order

1. **Priority 1: Critical (P1-001 ~ P1-009)**
   - [ ] lib/common.js: `detectNewFeatureIntent()` 구현
   - [ ] lib/common.js: `matchImplicitAgentTrigger()` 구현
   - [ ] lib/common.js: `shouldAutoStartPdca()` 구현
   - [ ] lib/common.js: `emitUserPrompt()` 구현
   - [ ] hooks/session-start.js: 자동 시작 로직 통합
   - [ ] agents/*.md: 암시적 트리거 키워드 추가
   - [ ] scripts/gap-detector-stop.js: 자동 Act 트리거
   - [ ] scripts/iterator-stop.js: 자동 재Check 트리거
   - [ ] 통합 테스트

2. **Priority 2: High (P2-001 ~ P2-009)**
   - [ ] lib/common.js: `extractRequirementsFromPlan()` 구현
   - [ ] lib/common.js: `calculateRequirementFulfillment()` 구현
   - [ ] lib/common.js: `calculateAmbiguityScore()` 구현
   - [ ] lib/common.js: `generateClarifyingQuestions()` 구현
   - [ ] lib/common.js: `detectContextConflicts()` 구현
   - [ ] hooks/session-start.js: 모호성 감지 통합
   - [ ] scripts/gap-detector-stop.js: 충족도 연동
   - [ ] 통합 테스트

3. **Priority 3: Medium (P3-001 ~ P3-007)**
   - [ ] lib/common.js: `checkPhaseDeliverables()` 구현
   - [ ] lib/common.js: `validatePdcaTransition()` 구현
   - [ ] scripts/phase-transition.js 생성
   - [ ] scripts/phase1-schema-stop.js 생성
   - [ ] scripts/phase2-convention-stop.js 생성
   - [ ] scripts/phase3-mockup-stop.js 생성
   - [ ] scripts/phase7-seo-stop.js 생성
   - [ ] 기존 Phase Stop 훅 개선

4. **Priority 4: Low (P4-001 ~ P4-006)**
   - [ ] lib/common.js: PDCA Status Schema v2.0 마이그레이션
   - [ ] lib/common.js: 다중 기능 컨텍스트 관리
   - [ ] lib/common.js: `getBkitConfig()` 확장
   - [ ] CLAUDE.md 파서 확장
   - [ ] 성능 최적화 (캐싱)
   - [ ] 최종 통합 테스트

---

## 6. Cross-Platform Consistency

### 6.1 Hook Configuration Synchronization

| Feature | hooks.json (Claude) | gemini-extension.json (Gemini) | 일관성 |
|---------|---------------------|--------------------------------|:------:|
| Session Start | ✅ | ✅ | ✅ |
| Pre-Write | Write\|Edit | write_file\|replace | ✅ |
| Post-Write | Write | write_file | ✅ |
| Pre-Bash | Bash | run_shell_command | ✅ |
| Post-Bash | Bash | run_shell_command | ✅ |
| Timeout | 10000ms | 5000ms | ⚠️ 조정 필요 |

### 6.2 Output Format Mapping

```javascript
// lib/common.js - 출력 포맷 통합

function formatOutput(message, type = 'info') {
  const isGemini = isGeminiCli();

  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️',
    question: '❓'
  };

  if (isGemini) {
    // Gemini: JSON-wrapped or plain text
    return `${icons[type]} ${message}`;
  } else {
    // Claude Code: Markdown-friendly
    return `${icons[type]} **${type.toUpperCase()}**: ${message}`;
  }
}
```

### 6.3 Environment Variable Mapping

| Purpose | Claude Code | Gemini CLI | Unified Access |
|---------|-------------|------------|----------------|
| Tool Name | `TOOL_NAME` | `TOOL_NAME` | `getHookContext().toolName` |
| Tool Input | `TOOL_PARAMS` | `TOOL_INPUT` | `getHookContext().toolInput` |
| File Path | `FILE_PATH` | `FILE_PATH` | `getHookContext().filePath` |
| Session ID | `SESSION_ID` | `SESSION_ID` | `getHookContext().sessionId` |
| Platform | - | `BKIT_PLATFORM=gemini` | `isGeminiCli()` |

---

## 7. Error Handling

### 7.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| BKIT-001 | Design doc not found | 설계 문서 없이 구현 시도 | AskUserQuestion으로 생성 제안 |
| BKIT-002 | Ambiguous request | 모호성 점수 50+ | 명확화 질문 자동 생성 |
| BKIT-003 | Max iterations reached | 5회 이상 반복 | 수동 개입 안내 |
| BKIT-004 | Hook timeout | 5초 초과 | Graceful exit + 후속 제안 |
| BKIT-005 | Platform mismatch | 플랫폼별 기능 미지원 | Graceful degradation |
| BKIT-006 | Context conflict | 기존 코드와 충돌 | 충돌 해결 옵션 제안 |

### 7.2 Graceful Degradation

```javascript
// 플랫폼별 기능 제약 처리

function safeExecute(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    if (error.code === 'PLATFORM_UNSUPPORTED') {
      console.log(formatOutput(
        `이 기능은 ${isGeminiCli() ? 'Gemini CLI' : 'Claude Code'}에서 제한됩니다.`,
        'warning'
      ));
      return fallback();
    }
    throw error;
  }
}
```

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Method |
|------|--------|--------|
| Unit Test | lib/common.js 신규 함수 | Jest mock |
| Integration Test | Hook → Script → Lib 연동 | E2E 시나리오 |
| Platform Test | Claude Code / Gemini CLI 동작 | 수동 검증 |
| Regression Test | 기존 명령어 호환성 | 기존 테스트 유지 |

### 8.2 Test Scenarios

#### Scenario 1: 자연어 → PDCA 자동 시작

```
Given: 사용자가 새 세션에서 "로그인 기능 만들어줘" 입력
When: session-start.js가 실행됨
Then:
  - Intent Detection: { isNewFeature: true, featureName: 'login' }
  - Design Doc Check: false (없음)
  - AskUserQuestion 출력: "새 기능입니다. 어떻게 진행할까요?"
  - 옵션: [설계부터 (권장), 계획부터, 바로 구현]
```

#### Scenario 2: 암시적 트리거 → 에이전트 호출

```
Given: 로그인 기능 구현 후 사용자가 "이거 괜찮아?" 입력
When: 메시지가 분석됨
Then:
  - matchImplicitAgentTrigger() → { agent: 'gap-detector', confidence: 0.88 }
  - AskUserQuestion 출력: "설계와 비교하여 검증할까요?"
  - 옵션: [검증 (권장), 코드 분석, 무시]
```

#### Scenario 3: Check-Act 자동 반복

```
Given: gap-detector 완료, matchRate = 75%
When: gap-detector-stop.js 실행
Then:
  - AskUserQuestion 출력: "매치율 75%입니다. 자동 개선할까요?"
  - 사용자 선택: "자동 개선"
  - pdca-iterator 자동 호출
  - 개선 후 자동 재분석 제안
```

---

## 9. Risk Management (from Gemini Design)

> 참조: Gemini 설계서의 Risks & Mitigation 섹션 통합

### 9.1 Risk Matrix

| Risk ID | Risk | Impact | Probability | Mitigation |
|---------|------|--------|-------------|------------|
| RISK-001 | 정상적인 빠른 프로토타이핑 차단 | High | Medium | Magic Word bypass (`!hotfix`, `!prototype`) 도입 |
| RISK-002 | Markdown 파싱 실패 | Medium | Low | Fuzzy matching + "Manual Verification Needed" 기본값 |
| RISK-003 | Hook 타임아웃 (5초) | High | Medium | Non-blocking suggestion 패턴 + 비동기 처리 |
| RISK-004 | Stdout 오염으로 JSON 파싱 실패 | Critical | High (Gemini) | stderr 분리 + 최소 stdout 출력 |
| RISK-005 | 플랫폼 간 동작 불일치 | Medium | Medium | 통합 테스트 + Platform Abstraction Layer |
| RISK-006 | 모호성 점수 오탐 (False Positive) | Medium | Medium | 감점 요소 도입 (-30 파일경로, -20 기술용어) |

### 9.2 Mitigation Strategies

#### A. Magic Word Bypass (RISK-001 대응)

```javascript
// 긴급 상황에서 PDCA 체크를 우회할 수 있는 키워드
const bypassKeywords = ['!hotfix', '!prototype', '!bypass'];

// 사용 예시:
// "로그인 버그 수정해줘 !hotfix"  → PDCA 체크 건너뜀
// "!prototype 빠르게 테스트용 페이지 만들어줘"  → 설계 문서 체크 건너뜀
```

**주의사항**:
- Bypass 사용 시 PDCA 상태에 기록 (`bypassed: true, reason: "..."`)
- 보고서 생성 시 bypass 횟수 통계 포함
- 남용 방지를 위해 세션당 최대 3회 권장

#### B. Graceful Timeout Handling (RISK-003 대응)

```javascript
// Hook 실행 시간 제한 (Gemini: 5초, Claude: 10초)
const HOOK_TIMEOUT = isGeminiCli() ? 4500 : 9500;  // 500ms 여유

async function executeWithTimeout(fn, fallbackMessage) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), HOOK_TIMEOUT)
  );

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error) {
    if (error.message === 'TIMEOUT') {
      // 타임아웃 시 제안만 출력하고 허용
      outputAllow(fallbackMessage);
    }
    throw error;
  }
}
```

#### C. Stdout Pollution Prevention (RISK-004 대응)

```javascript
// Gemini CLI에서 stdout 오염 방지
function safeLog(message, isError = false) {
  if (isGeminiCli()) {
    // Gemini: 컨텍스트는 stderr, 결과만 stdout
    if (isError) {
      console.error(message);  // stderr → LLM에 전달되지 않음
    } else {
      // stdout은 JSON만 허용
      console.log(JSON.stringify({ type: 'info', message }));
    }
  } else {
    // Claude Code: 일반 출력
    console.log(message);
  }
}
```

### 9.3 Contingency Plans

| Scenario | Trigger Condition | Action |
|----------|------------------|--------|
| Hook 완전 실패 | Exception 발생 | 무조건 `allow` + 경고 메시지 |
| PDCA 상태 파일 손상 | JSON 파싱 실패 | 새 상태 파일 생성 + 백업 시도 |
| 설계 문서 없이 구현 완료 | PostWrite에서 감지 | 사후 설계 문서 생성 제안 |
| 5회 반복 후에도 90% 미달 | iterationCount >= 5 | 수동 개입 요청 + 진행 옵션 제공 |

---

## 10. Security Considerations

- [x] Hook 스크립트에서 `console.log`만 사용 (stdout 오염 방지)
- [x] 사용자 입력 sanitization (XSS, 명령어 삽입 방지)
- [x] 파일 경로 검증 (디렉토리 탈출 방지)
- [x] 환경 변수 최소 노출
- [ ] Hook 실행 권한 검증 (추후 구현)

---

## 11. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-01-24 | 초기 설계 문서 작성 (Claude Code) | AI |
| 0.2 | 2026-01-24 | Gemini CLI 설계서 통합: Magic Word bypass, 감점 요소, Risk Management, Platform Wrappers | AI |
| 0.3 | 2026-01-24 | 다국어 지원 8개 언어로 확장 (EN, KO, JA, ZH, ES, FR, DE, IT) | AI |
| 0.4 | 2026-01-24 | Skills 자동 트리거 추가 (Agents만이 아닌 Skills도 description 기반 자동 로드) | AI |
| 0.5 | 2026-01-24 | 18개 스킬 전체 커버리지 완료: Level(5), Phase(9), Core(4) + Appendix A.3 현황표 추가 | AI |

---

## Appendix A: Auto-Trigger 메커니즘 (Agents + Skills)

> 참조: Claude Code 공식 문서 https://code.claude.com/docs/en/skills, https://code.claude.com/docs/en/sub-agents

### A.1 Agents vs Skills 자동 트리거 비교

| 항목 | Agents | Skills |
|------|--------|--------|
| 트리거 기반 | `description` 필드 | `description` 필드 |
| 자동 트리거 제어 | 기본 활성화 | `disable-model-invocation: true` |
| 사용자 호출 제어 | 기본 활성화 | `user-invocable: false` |
| 연결 가능 | `skills:` 필드로 Skill 연결 | `agent:` 필드로 Agent 연결 |
| Hooks 지원 | ✅ Stop 훅 등 | ✅ PreToolUse/PostToolUse 등 |

### A.2 자동 트리거 설정 조합

| 설정 | 사용자 호출 | Claude 자동 호출 | 사용 사례 |
|------|-------------|------------------|----------|
| (기본값) | ✅ | ✅ | 일반 skills/agents |
| `disable-model-invocation: true` | ✅ | ❌ | 배포, 커밋 등 side-effect |
| `user-invocable: false` | ❌ | ✅ | 백그라운드 지식, 자동 적용 규칙 |
| 둘 다 설정 | ❌ | ❌ | (실질적으로 비활성화) |

### A.3 bkit Skills 자동 트리거 현황 (18개 전체)

#### Level Skills (5개)
| Skill | user-invocable | Triggers 예시 |
|-------|----------------|---------------|
| starter | `false` | static website, 포트폴리오, 初心者 |
| dynamic | `false` | fullstack, 로그인 기능, 認証 |
| enterprise | `false` | microservices, 쿠버네티스, 微服务 |
| mobile-app | `false` | React Native, 모바일 앱, モバイル |
| desktop-app | `false` | Electron, 데스크톱 앱, 桌面应用 |

#### Pipeline Phase Skills (9개)
| Skill | user-invocable | Triggers 예시 |
|-------|----------------|---------------|
| phase-1-schema | `false` | schema, 스키마, データモデル |
| phase-2-convention | - | convention, 컨벤션, 编码规范 |
| phase-3-mockup | - | mockup, 목업, プロトタイプ |
| phase-4-api | `false` | API design, 백엔드, 接口 |
| phase-5-design-system | - | design system, 디자인 시스템, 组件库 |
| phase-6-ui-integration | `false` | UI implementation, API 연동, 状态管理 |
| phase-7-seo-security | - | SEO, 보안, セキュリティ |
| phase-8-review | - | code review, 갭 분석, 代码审查 |
| phase-9-deployment | - | deployment, 배포, 部署 |

#### Core Skills (4개)
| Skill | user-invocable | Triggers 예시 |
|-------|----------------|---------------|
| bkit-rules | - | PDCA, 개발, 機能, 代码 |
| bkit-templates | - | template, 설계서, テンプレート |
| zero-script-qa | - | docker logs, 제로 스크립트, ログベース |
| development-pipeline | - | pipeline, 뭐부터, 何から |

### A.4 Description 작성 Best Practices

**나쁜 예시 (모호함):**
```yaml
description: API design patterns for this codebase
```

**좋은 예시 (명확함):**
```yaml
description: |
  Design REST API endpoints following conventions.

  Use proactively when building APIs, writing endpoints,
  or designing request/response formats.

  Triggers: API, endpoint, REST, GraphQL, request, response,
  API 설계, 엔드포인트, API設計, エンドポイント, API设计, 端点
```

**핵심 포인트:**
1. **"Use proactively when..."** 명시 → Claude가 자동 위임할 가능성 증가
2. **Triggers 키워드** 명시 → 8개 언어로 다국어 트리거 지원
3. **Do NOT use for** 명시 → 오탐(False Positive) 방지

---

## Appendix B: Agent Trigger Keyword Extensions

### gap-detector.md 추가 트리거

```markdown
Triggers: 검증, verify, check, 확인, 갭 분석, gap analysis,
맞아?, 이거 괜찮아?, 설계대로야?, is this right?, is this correct?,
正しい?, 合ってる?, 对吗?, 对不对?,
これで大丈夫?, 문제 없어?, any issues with this?
```

### code-analyzer.md 추가 트리거

```markdown
Triggers: 분석, analyze, quality, 품질, 코드 분석,
이상해, 뭔가 이상해, 괜찮아 보여?, any issues?, any problems?,
品質チェック, 品質確認, 质量检查, 代码分析
```

### pdca-iterator.md 추가 트리거

```markdown
Triggers: 개선, improve, iterate, 고쳐, fix, 반복,
더 좋게, make it better, 문제 해결해줘, auto-fix,
改善して, 直して, 改进, 修复
```

---

## Appendix C: PDCA Status Migration Script

```javascript
// lib/common.js - v1.x → v2.0 마이그레이션

function migratePdcaStatusToV2(oldStatus) {
  if (oldStatus.version === '2.0') return oldStatus;

  const newStatus = {
    version: '2.0',
    lastUpdated: new Date().toISOString(),
    activeFeatures: oldStatus.currentFeature ? [oldStatus.currentFeature] : [],
    primaryFeature: oldStatus.currentFeature || null,
    features: {},
    session: {
      startedAt: oldStatus.sessionStartedAt || new Date().toISOString(),
      onboardingCompleted: true,
      lastActivity: new Date().toISOString()
    }
  };

  // 기존 기능 데이터 마이그레이션
  if (oldStatus.currentFeature) {
    newStatus.features[oldStatus.currentFeature] = {
      phase: oldStatus.currentPhase || 'plan',
      matchRate: oldStatus.lastMatchRate || null,
      iterationCount: oldStatus.iterationCount || 0,
      requirements: [],
      documents: {
        plan: oldStatus.planDoc,
        design: oldStatus.designDoc,
        analysis: oldStatus.analysisDoc,
        report: oldStatus.reportDoc
      },
      timestamps: {
        started: oldStatus.featureStartedAt || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    };
  }

  return newStatus;
}
```
