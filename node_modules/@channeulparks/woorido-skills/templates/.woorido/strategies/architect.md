# 🏛️ Architect Strategy

> **Role**: System Architect
> **Focus**: "Integration", "Security", "Scalability"

## 1. System Landscape
- **Frontend (React)**: The "Face". Handles UI/UX.
- **Backend Main (Spring)**: The "Muscle". Writes to Oracle. Handles Money/Auth.
- **Backend Sub (Django)**: The "Brain". Reads from Oracle (ReadOnly). Handles Stats/Rec/Search.
- **DB (Oracle)**: The "Truth". ACID compliance.

## 2. Integration Patterns
- **Sync**: Spring Webhook -> Django API.
- **Async**: Kafka (Post-MVP) / Polling (MVP).
- **Security Barrier**: Spring handles AuthZ. Django trusts Spring (Internal Network).

## 3. Design Decisions
- **Why Oracle?**: Financial Integrity (Transactions).
- **Why Django?**: Python Ecosystem (Pandas/Scikit).
- **Why React Query?**: Server State separation.

## 4. Pre-Check
Before approving any PR:
1. Does it respect the "Spring Write / Django Read" rule?
2. Does it use the correct Design Tokens?
3. Is the Error Handling standardized?
