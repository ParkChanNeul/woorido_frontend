---
description: Run Check phase (design-implementation gap analysis)
allowed-tools: ["Read", "Write", "Glob", "Grep", "LSP", "Task"]
---

# Gap Analysis Execution

Receives feature name via $ARGUMENTS. (e.g., /pdca-analyze login)

## Tasks Performed

1. **Read Design Document**
   - docs/02-design/features/{feature}.design.md
   - Extract API endpoints, data models, component list

2. **Analyze Implementation Code**
   - Explore src/features/{feature}/ or related paths
   - Extract actually implemented APIs, models, components

3. **Perform Gap Analysis**
   - Compare design vs implementation
   - Classify as matched/unimplemented/design-missing

4. **Code Quality Analysis** (Optional)
   - Complexity check
   - Security issue scan
   - Code smell detection

5. **Generate Analysis Report**
   - Create docs/03-analysis/{feature}.analysis.md
   - Include match rate, issue list, recommended actions

6. **Task System Integration (v1.3.1)**
   - Create a Task for tracking: `TaskCreate` with subject `[Check] {feature}`
   - Set metadata: `{ pdcaPhase: "check", feature: "{feature}", matchRate: XX }`
   - Set dependency: `blockedBy: [Do Task ID]` (implementation must be done first)
   - If match rate < 90%: Create `[Act] {feature}` Task for iteration

## Usage Examples

```
/pdca-analyze login           # Analyze login feature
/pdca-analyze login --full    # Full analysis (includes quality+security)
/pdca-analyze all             # Batch analyze all features
```

## Output Example

```
🔍 Gap Analysis Complete: login

┌─────────────────────────────────────────────┐
│  Analysis Result Summary                     │
├─────────────────────────────────────────────┤
│  Design-Implementation Match Rate: 85%       │
│                                             │
│  ✅ Matched:       17 items                  │
│  ⚠️ Design Missing: 2 items (only in impl)   │
│  ❌ Unimplemented:  1 item (only in design)  │
└─────────────────────────────────────────────┘

📋 Key Findings:
   1. POST /api/auth/social - Not in design (needs addition)
   2. DELETE /api/auth/logout - Not implemented (needs implementation)

📄 Detailed Report:
   docs/03-analysis/login.analysis.md

📋 Task System:
   Task #3: [Do] login → completed ✓
   Task #4: [Check] login → completed
   Metadata: { pdcaPhase: "check", matchRate: 85 }
   → Match Rate 85% < 90%, creating Act Task...
   Task #5: [Act] login → pending (blockedBy: #4)

📝 Next Steps:
   1. Fix Critical issues first
   2. Update design document (design-missing items)
   3. Write completion report with /pdca-report login
```

## Analysis Items

### Basic Analysis
- API endpoint matching
- Data model field matching
- Component structure matching

### Extended Analysis (--full)
- Code complexity
- Security vulnerabilities (hardcoded secrets, input validation, etc.)
- Test coverage
- Performance issues (N+1 queries, etc.)

## Cautions

- Cannot analyze without design document (create design first)
- Use Task agent for large-scale analysis
- Analysis results are for reference, final judgment by humans
