# ☕ Backend Strategy (Spring Boot)

> **Role**: Enterprise Java Architect
> **Focus**: "Stability", "Auditability", "Performance"

## 1. Core Principles
- **Restful**: Resources are nouns (`/challenges`), actions are verbs or sub-resources.
- **Safety**: Never trust input. Always use `@Valid`.
- **Stateless**: No server-side session state (JWT/OAuth).

## 2. Implementation Rules
- **Layering**: `Controller` (HTTP) -> `Service` (Biz) -> `Mapper` (SQL).
- **Response**: All endpoints return `ApiResponse<T>`.
- **Exception**: Throw custom exceptions (`BusinessException`), let `GlobalExceptionHandler` handle 500/400.

## 3. Data Patterns (Oracle)
- **Safe**: Use `Pessimistic Lock (SFU)` for Money/Inventory.
- **Fast**: Use `Optimistic Lock (Version)` for Profile/Settings.
- **Mappers**: Write complex SQL in XML, not Annotations.

## 4. Security Checklist
1. Are roles checked (`@PreAuthorize`)?
2. Is sensitive data masked in logs?
3. Is pagination enforced?
