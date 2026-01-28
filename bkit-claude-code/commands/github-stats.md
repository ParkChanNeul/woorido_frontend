---
description: Collect GitHub repository statistics and update Confluence page
allowed-tools: ["Bash", "Read", "Write"]
---

# GitHub Statistics Collector

Collect bkit-claude-code GitHub repository statistics and update Confluence report page.

## Configuration

- **Repository**: popup-studio-ai/bkit-claude-code
- **Confluence Page ID**: 43515905
- **Confluence Space**: POPUPSTUDI

## Tasks Performed

### 1. Collect GitHub Statistics

Use `gh` CLI to collect the following data:

```bash
# Basic repo info (stars, forks, watchers)
gh repo view popup-studio-ai/bkit-claude-code --json stargazerCount,forkCount,watchers,issues,pullRequests,createdAt,pushedAt

# Traffic views (last 14 days)
gh api repos/popup-studio-ai/bkit-claude-code/traffic/views

# Clone statistics (last 14 days)
gh api repos/popup-studio-ai/bkit-claude-code/traffic/clones

# Referrer sources
gh api repos/popup-studio-ai/bkit-claude-code/traffic/popular/referrers

# Popular content paths
gh api repos/popup-studio-ai/bkit-claude-code/traffic/popular/paths
```

### 2. Generate Report Content

Create Markdown report with:

1. **Header**
   - Report date (today)
   - GitHub API 14-day limitation notice

2. **Basic Info**
   - Repository name and description
   - Created date, last push date

3. **Popularity Metrics**
   - Stars, Forks, Watchers
   - Open Issues, Open PRs

4. **Traffic Summary (Last 14 Days)**
   - Total views and unique visitors
   - Total clones and unique cloners

5. **Daily Views Table**
   - Date, views, unique visitors

6. **Daily Clones Table**
   - Date, clones, unique users

7. **Referrer Sources**
   - Source, count, unique visitors

8. **Popular Content TOP 10**
   - Rank, page, views, unique visitors

9. **Key Insights**
   - Growth trends
   - Conversion rate (views to clones)
   - Marketing effectiveness
   - Technical interest areas

10. **Monitoring Recommendations**

### 3. Update Confluence Page

Use Atlassian MCP tool to update the existing page:

- **Page ID**: 43515905
- **Title**: 6. GitHub 이용 통계 (2026.01.21) - Keep original title with creation date
- **Content**: Replace with new statistics data

## Output Format

```
📊 GitHub Statistics Collection Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Summary (as of {date})
• Stars: {count}
• Forks: {count}
• Views (14d): {count} ({unique} unique)
• Clones (14d): {count} ({unique} unique)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Confluence page updated successfully
   URL: https://popupstudio.atlassian.net/wiki/spaces/POPUPSTUDI/pages/43515905

💡 Next collection: Run /github-stats again tomorrow
```

## Important Notes

- GitHub Traffic API only provides **last 14 days** of data
- Previous data cannot be retrieved, so regular collection is essential
- Run this command daily to maintain historical records
- The Confluence page accumulates data over time

## Error Handling

| Error | Solution |
|-------|----------|
| gh CLI not authenticated | Run `gh auth login` |
| Confluence API error | Check MCP Atlassian configuration |
| Rate limit exceeded | Wait and retry later |

## Schedule Recommendation

Run this command **daily** for 14 days to build complete traffic history.
After initial 14 days, weekly collection is sufficient for trend analysis.
