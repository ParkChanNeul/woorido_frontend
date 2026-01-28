---
description: Guide to next PDCA step (based on current status)
allowed-tools: ["Read", "Glob"]
---

# PDCA Next Step Guide

Analyzes current project status and guides the next task to be done.

## Tasks Performed

1. **Analyze Current Status**
   - Scan document folders
   - Check PDCA stage for each feature
   - Identify incomplete tasks

2. **Determine Priority**
   - Prioritize in-progress work
   - Old incomplete tasks
   - Possibility to start new features

3. **Provide Customized Guidance**

## Situational Guidance

### When Nothing Exists
```
💡 Getting Started with PDCA

No PDCA documents in the project.

Recommended Start:
1. Initialize with /init-starter (or dynamic/enterprise)
2. PDCA will be automatically applied when you request a feature
   e.g., "Create a login feature"

📚 What is PDCA?
Plan → Do → Check → Act
A methodology for improving quality and consistency through document-driven development.
```

### When Only Plan Exists
```
📋 Current Stage: Plan Complete

The plan document for {feature} has been created.

Next Steps:
1. Write design document: /pdca-design {feature}
2. Or request "{feature} design"

💡 Tip: Implementation without design is possible,
        but having a design document enables Gap analysis later.
```

### When Design is Complete
```
📐 Current Stage: Design Complete

The design for {feature} is complete.

Next Steps:
1. Start implementation: "Implement {feature}"
2. Let me know if design modifications are needed

⚠️ Note: If implementation needs to differ from design,
         update the design document first.
```

### After Implementation
```
✅ Current Stage: Do Complete (Implementation Complete)

{feature} has been implemented.

Next Steps:
1. Gap analysis: /pdca-analyze {feature}
2. Or request "Analyze {feature}"

📊 Through analysis:
- Check design-implementation match rate
- Discover code quality issues
- Identify improvement points
```

### After Analysis
```
🔍 Current Stage: Check Complete (Analysis Complete)

Analysis for {feature} is complete.
Match Rate: {percentage}%

Next Steps:
1. Fix discovered issues (if any)
2. Completion report: /pdca-report {feature}

🎯 Issue Summary:
- Critical: {count}
- Warning: {count}
```

### After Report
```
🎉 PDCA Cycle Complete!

The entire PDCA cycle for {feature} is complete.

Options:
1. Start new feature: /pdca-plan [new-feature-name]
2. Improve existing feature: Start 2nd cycle
3. Proceed with other work

📈 Project Status:
- Completed features: {count}
- In progress: {count}
```

## Usage Examples

```
/pdca-next              # Next step based on entire project
/pdca-next login        # Next step for specific feature
```
