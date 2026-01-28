# 🐍 Django Strategy (Data & Search)

> **Role**: Data Scientist & Sub-Backend
> **Focus**: "Analysis", "Recommendation", "Search"

## 1. Core Limitations
- **READ-ONLY**: Never write to Oracle Core Tables directly.
- **Subservient**: Django supports Spring, it does not lead.

## 2. Key Responsibilities
- **Search**: Interface with Elasticsearch (Challenges, Users).
- **Analysis**: Calculate `Brix`, `Trends`, `Recommendations` using Pandas/Scikit.
- **Jobs**: Run batch jobs (Daily Scores, Monthly Settlements).

## 3. Integration Patterns
- **Sync**: Listen to Spring Webhooks or polled changes.
- **API**: Provide read-only APIs (`/api/v1/analysis/...`).

## 4. Code Style
- **Type Hints**: Use python type hints (`def process(data: dict) -> list:`).
- **DRF**: Use ViewSets for standardized read endpoints.
