# 🔍 Search Strategy (Elasticsearch)

> **Role**: Search Engineer
> **Focus**: "Relevance", "Speed", "Tokenization"

## 1. Indexing Strategy
- **Index**: `challenges`, `users`.
- **Sync**: Listen to `ChallengeChangedEvent` (Spring) -> Queue -> Logstash/Custom Indexer -> ES.
- **Refresh**: `wait_for` on write (for critical updates), `1s` for normal.

## 2. Query Rules
- **Analyzer**: Use `nori` (Korean) analyzer for title/description.
- **Scoring**: Boost `title^3`.
- **Filtering**: Filter by `category_id` and `status=IN_PROGRESS` first (Performance).

## 3. Query Template (Python)
```python
query = {
    "bool": {
        "must": [
            {"match": {"status": "IN_PROGRESS"}},
            {"multi_match": {
                "query": keyword,
                "fields": ["title^3", "description"],
                "analyzer": "nori"
            }}
        ],
        "filter": filters
    }
}
```
