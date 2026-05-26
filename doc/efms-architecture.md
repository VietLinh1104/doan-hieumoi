---
name: efms-architecture
description: General architecture and standards for the EFMS (Enterprise Financial Management System) backend.
---

# EFMS Backend Architecture

This skill provides an overview of the EFMS backend architecture, which consists of three main microservices working together to provide enterprise financial management features.

1. **efms-api-gateway (Port: 8080)**: The central entry point for all client requests, responsible for dynamic routing and global security (JWT validation).
2. **efms-identity-service (Port: 8081 - typical)**: Manages authentication, multi-tenant company structure, users, roles, and permissions (RBAC).
3. **efms-core-service (Port: 8082 - typical)**: Handles all financial and accounting operations (Invoices, Payments, Ledgers, Bank Accounts).
4. **efms-common-service (Port: 8083 - typical)**: Manages common operations like document attachments and comments for various entities across modules.

## Key Architectural Principles

- **Microservices Boundary**: Identity and Core services operate on separate, isolated databases or distinct schemas.
- **Routing Strategy**: 
  - All external requests are sent to API Gateway on port `8080`.
  - Prefix `http://localhost:8080/api/identity/**` routes to `efms-identity-service`.
  - Prefix `http://localhost:8080/api/core/**` routes to `efms-core-service`.
- **Loose Coupling**: Services communicate via REST APIs or Feign Client. Core service references Identity entities (users, companies) exclusively bypassing their UUIDs. There are NO hard database-level foreign keys across microservices.
- **Multi-tenancy**: Every business entity is linked to a `company_id`. Queries must isolate data by this ID.
- **Authentication & Authorization**: 
  - **Phase 1 (Gateway)**: Validates JWT token from the `Authorization` header.
  - **Phase 2 (Injection)**: Gateway extracts user claims and injects them into custom headers (`X-User-Id`, `X-User-Email`, `X-User-Company-Id`, `X-User-Permission`).
  - **Phase 3 (Local Context)**: Downstream services use a `GatewayHeaderFilter` to read these headers and populate the Spring Security `SecurityContextHolder`.
  - **Phase 4 (Access Control)**: Developers use `@PreAuthorize("hasAuthority('...')")` on methods to enforce permissions.
- **Standard API Responses**: All REST APIs must use the generic `ApiResponse<T>` wrapper for consistency (`status`, `message`, `data`).

## Technology Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.3.x, Spring Cloud (Gateway, Config)
- **Build Tool**: Maven
- **Database**: PostgreSQL (v4 Schema Documented in `doc/`)
- **Mandatory Libraries**: **Lombok** (minimizing boilerplate), **MapStruct** (for Entity-to-DTO conversion), **JJWT** (Security).

## Package Naming Convention
- `com.linhdv.efms_api_gateway`
- `com.linhdv.efms_identity_service`
- `com.linhdv.efms_core_service`

## Development Guidelines
1. Always include `companyId` in service methods and queries to ensure strict data isolation.
2. Use `UUID` for all Primary Keys (`id`) and Foreign Keys referencing other services.
3. Keep Controllers thin by delegating complex business logic to Services.
4. Ensure proper audit logging for all data manipulations using the internal Audit service.
5. Provide detailed Swagger/OpenAPI annotations on Controllers.

---
name: efms-database
description: Reference for the EFMS (Enterprise Financial Management System) PostgreSQL v4 schema.
---

# EFMS Database Schema (v4)

This skill provides a reference for the PostgreSQL v4 database schema used in the EFMS application.

## Schema Overview
The database is divided into three logical sections corresponding to the three main services: Identity, Core, and Collaboration.

### Section 1: EFMS Identity Service
Database responsible for organizations, users, and permissions.

- `companies`: Multi-company support.
- `roles`: Access roles (e.g., Admin, Accountant).
- `permissions`: Individual resource permissions (e.g., invoice:read).
- `role_permissions`: Role-based mapping.
- `users`: Registered users.
- `audit_logs` (Identity): Changes to identity data.

### Section 2: EFMS Core Service
Database containing accounting and financial data. Note that foreign keys to Identity entities (e.g., `company_id`, `created_by`) are NOT enforced at the database level.

- `fiscal_periods`: Accounting cycles.
- `accounts`: Chart of accounts.
- `partners`: Customers and vendors.
- `journal_entries`: Accounting document header.
- `journal_lines`: Double-entry transaction lines.
- `invoices`: Sales (AR) and Purchase (AP) invoices.
- `invoice_lines`: Itemized billing details.
- `payments`: Cash or bank payment records.
- `invoice_payments`: Many-to-many link between invoices and payments.
- `bank_accounts`: Bank and cash GL accounts.
- `bank_transactions`: Bank statement records.
- `audit_logs` (Core): Changes to financial data.

### Section 3: EFMS Common Service
Database handling document, attachments, and internal communications for any entity without hard foreign keys.

- `attachments`: File attachments generic table metadata (standalone).
- `comments`: Comments for workflows and discussions (standalone).
- `entity_links`: Universal polymorphic many-to-many link table. Links any core entity to either 'comment' or 'attachment'.
- `audit_logs` (Common): Changes to document/common data.

## Key Principles
- **UUID Keys**: All IDs use the `gen_random_uuid()` function.
- **Audit Logging**: Use `JSONB` for `old_data` and `new_data` columns in audit tables.
- **Precision**: Monetary amounts use `NUMERIC(18,2)`.
- **Indexing**: Frequent filters like `company_id`, `entry_date`, and `status` should always have an index.

---
name: efms-api-gateway
description: API Gateway for EFMS, handling routing and security.
---

# EFMS API Gateway

The API Gateway is the central entry point for all requests to the EFMS backend (runs on default port `8080`).

## Responsibilities
- **Dynamic Routing**: Proxying API requests to the appropriate downstream microservice (Identity, Core) using Spring Cloud Gateway mappings.
- **Authentication Validation**: Intercepting requests to validate the signature and expiration of JWT tokens issued by the Identity Service.
- **Cross-Cutting Concerns**: Managing CORS, centralized logging, rate limiting, and global error handling before requests even hit the inner services.

## Routing Mapping
Requests are mapped dynamically based on the URL prefix from the client:
- `http://localhost:8080/api/identity/**` -> Forwards to **`efms-identity-service`**
- `http://localhost:8080/api/core/**` -> Forwards to **`efms-core-service`**
- `http://localhost:8080/api/common/**` -> Forwards to **`efms-common-service`**

## Security Mechanism
- **JWT Decoding**: The Gateway validates the JWT Secret (shared or central).
- **Authorization Flow**: The Gateway performs structural and basic validity checks of the JWT token. Once verified, it extracts claims (userId, email, companyId, permissions) and injects them into custom headers (`X-User-Id`, `X-User-Email`, `X-User-Company-Id`, `X-User-Permission`) for downstream services. Detailed action-level permission checks (RBAC) are handled by the inner services using these headers.

## Guidelines & Code Structure
- **Package**: `com.linhdv.efms_api_gateway`
- **Key Components**:
  - `config/`: CORS Configurations, Route Locator setups.
  - `filter/`: Custom Gateway Filters (e.g., `AuthenticationFilter` to check headers and JWT).
  - `exception/`: Global Exception Handlers to translate Gateway timeout or unauthorized errors into standardized `ApiResponse` formats.
- **Endpoints Rule**: All endpoints routed through the gateway require a valid JWT `Authorization` header, EXCEPT explicitly whitelisted endpoints (like `/api/identity/auth/logig`, `/api/identity/auth/register`).

---
name: efms-identity-service
description: Identity, multi-company, role, and permission management for EFMS.
---

# EFMS Identity Service

The Identity service manages the organizational structure and access control (Auth and RBAC) for the entire EFMS application.

## Core Responsibilities
- **Authentication**: Issuing JWT tokens upon user login.
- **Multi-Company (Companies)**: Manages different organizational entities in a multi-tenant layout.
- **Roles & Permissions (RBAC)**: Fine-grained access control with users assigned to roles, and roles bound to permissions.
- **Users**: User profiles and status.
- **Audit Logs**: Tracking changes to identity data globally.

## Identity Database Schema
- `companies`: `id` (UUID), `name`, `address`, `currency`, `is_active`, `createdAt`.
- `roles`: `id` (UUID), `name`, `description`, `is_active`.
- `permissions`: `id` (UUID), `resource` (e.g., 'invoice'), `action` (e.g., 'create'), `description`.
- `role_permissions`: Mapping of `role_id` and `permission_id`.
- `users`: `id` (UUID), `company_id` (FK to companies), `role_id` (FK to roles), `name`, `email`, `password`, `is_active`.
- `audit_logs`: `id` (UUID), `table_name`, `record_id`, `action`, `changed_by`, `changed_at`, `old_data` (JSON), `new_data` (JSON).
- `oauth_clients`: OAuth 2.1 client registration for external application access (e.g. MCP servers).

## API Endpoints (v1)

**Context Path:** `http://localhost:8080/api/identity` (routed via API Gateway)

- **Auth Controller**:
  - `POST /auth/login`: Authenticate and return JWT token.
  - `POST /auth/register`: Create a new user account.
- **OAuth Controller**:
  - `GET /.well-known/oauth-authorization-server`: OAuth 2.1 metadata endpoint.
  - `GET /oauth/authorize`: Authorization endpoint (redirects to frontend login with oauth params).
  - `GET /oauth/callback`: Callback handler for internal token generation.
  - `POST /oauth/token`: Token endpoint for authorization_code exchange.
- **User Controller**:
  - `/v1/users`: Management of user profiles (`id`, `update`, `delete`, `getAllUsers`).
- **Role Controller**:
  - `/v1/roles`: CRUD operations for roles and assignment of permissions.
- **Permission Controller**:
  - `/v1/permissions`: CRUD for static system permissions patterns (`resource:action`).
- **Company Controller**:
  - `/v1/companies`: Create, Read, Update, Delete for companies.
- **Audit Log Controller**:
  - `/v1/audit-logs`: Access system change history with pagination (`page`, `size`).
  - `/v1/audit-logs/record`: Fetch changes for a specific `recordId` and `tableName`.
- **Internal Controller** (Cross-service communication):
  - `POST /internal/users/batch`: Fetch basic info (`id`, `fullName`, `email`, `avatar`) for a list of UUIDs. Requires `X-Company-Id` header.

## Implementation Details

- **Package**: `com.linhdv.efms_identity_service`
- **Security & Authorization**: 
    - JWT-based authentication using **jjwt 0.11.5**. User passwords hashed securely with **BCrypt**.
    - **Shared Trust**: Can also act as a downstream service, accepting `X-User-*` headers from the Gateway.
    - **RBAC**: Uses Spring Security's `SecurityContextHolder` and `@PreAuthorize` (e.g., `@PreAuthorize("hasAuthority('USER:READ')")`) to protect administrative endpoints.
- **Data Mapping**: Mandatory use of **MapStruct** (`mapper` package) for `Entity` to `DTO` conversions.
- **Response Format**: All REST APIs must wrap their return data in the generic `ApiResponse<T>` (`wrapper` / `dto.common` package) object.
- **Validation**: Ensure `@Valid` is used for all incoming request payloads (`dto/request`).

## Code Structure Rules
- **`controller`**: REST API definitions. Minimal business logic. Returns `ApiResponse`.
- **`service` / `service.impl`**: Core business and validation logic.
- **`repository`**: Spring Data JPA interfaces. Includes `company_id` filtering.
- **`entity`**: JPA Mappings representing the Database schema.
- **`dto`**: POJOs for transferring data between Controller and Service layers (`request` and `response` packages).
- **`mapper`**: MapStruct interfaces (`@Mapper(componentModel = "spring")`).
- **`config` / `security`**: Setup filters, WebSecurity, JWT parser logic.

## Guidelines
1. When modifying `permissions`, ensure they follow the `resource:action` pattern (e.g. `user:create`).
2. Changes to any business entity MUST be intercepted or logged using the internal `AuditService`.
3. Multi-tenancy must be strictly applied on Users and Roles using `company_id`.

---
name: efms-core-service
description: Financial and accounting operations for EFMS.
---

# EFMS Core Service

The Core Service handles all major financial accounting operations, double-entry ledger automation, and cash flows. It is built with **Spring Boot 3** and integrates with **Camunda 8 SaaS** for approval workflows.

> **🎓 Đồ án Scope**: Module này đã được tinh gọn so với thiết kế ERP đầy đủ. Chỉ giữ các module thiết yếu cho luồng nghiệp vụ lõi (Procure-to-Pay). Xem mục cuối để biết chi tiết.

---

## Core Responsibilities (Active)
- **Chart of Accounts (COA)**: Quản lý danh mục tài khoản kế toán.
- **Partners**: Quản lý danh bạ Khách hàng (AR) và Nhà cung cấp (AP).
- **Invoices (AP Bill / AR Invoice)**: Tạo, phê duyệt qua DB state machine, và theo dõi trạng thái hóa đơn.
- **Payments**: Ghi nhận thanh toán (Cash In/Out), phân bổ vào hóa đơn, post lên Sổ cái.
- **Bank Accounts**: Quản lý tài khoản ngân hàng dùng làm nguồn tiền cho Payments.
- **Journal Entries (Read-only)**: Xem danh sách bút toán kép được hệ thống tự động sinh ra.

---

## Core Database Schema
> DB Schema vẫn giữ nguyên đầy đủ. Các bảng không dùng (xem bên dưới) chỉ bị bỏ qua ở tầng Application.

- `accounts`: Chart of accounts (asset, liability, equity, revenue, expense).
- `partners`: Customers and vendors.
- `journal_entries` & `journal_lines`: Double-entry accounting records — **chỉ ghi bởi hệ thống**, không cho phép nhập tay.
- `invoices` & `invoice_lines`: Receivables (AR) and payables (AP) tracking.
- `payments` & `invoice_payments`: Bank/cash operations and allocation mapping to invoices.
- `bank_accounts`: Bank accounts used as funding sources for payments.
- `fiscal_periods` *(schema only)*: Tồn tại trong DB nhưng không có ORM mapping hay UI/API ở phạm vi đồ án.
- `bank_transactions` *(schema only)*: Tồn tại trong DB nhưng không có ORM mapping hay UI/API ở phạm vi đồ án.

---

## Approval Workflow (DB State Machine — Không dùng Camunda)
- **Không còn Camunda 8**: Quy trình phê duyệt AP Bill được quản lý hoàn toàn bằng trạng thái lưu trong DB.
- **Luồng trạng thái AP Bill**:
  - `draft` → `confirm()` → `status=open`, `approval_status=pending`
  - `open/pending` → `approve(comment?)` → `approval_status=approved` → (TODO: trigger tạo JournalEntry)
  - `open/pending` → `reject(comment?)` → `approval_status=rejected`
  - Bất kỳ → `cancel()` → `status=cancelled`
- **Luồng AR Invoice**: `draft` → `confirm()` → `status=open` (không cần phê duyệt).
- **Xem danh sách chờ duyệt**: `GET /v1/invoice-tasks/tasks?companyId=...` — filter `type=AP, status=open, approvalStatus=pending` trực tiếp từ DB.

---

## API Endpoints (v1)

**Context Path:** `http://localhost:8080/api/core` (routed via API Gateway)

| Module | Endpoints | Ghi chú |
|---|---|---|
| **Partners** | `GET/POST/PUT /v1/partners` | CRUD đối tác |
| **Bank Accounts** | `GET/POST/PUT /v1/finance/bank-accounts` | CRUD tài khoản ngân hàng |
| **Accounts (COA)** | `GET/POST/PUT /v1/accounting/accounts` | Chart of Accounts |
| **Journal Entries** | `GET /v1/accounting/journals` | **Read-only** — Chỉ xem danh sách & chi tiết |
| **Invoices** | `GET/POST/PUT/DELETE /v1/invoices` | CRUD AP/AR. Draft cho phép xóa |
| **Invoice Approvals** | `GET /v1/invoice-tasks/tasks?companyId=...` | Danh sách AP Bill chờ duyệt (filter DB) |
| | `GET /v1/invoice-tasks/tasks/{invoiceId}/invoice` | Chi tiết hóa đơn chờ duyệt |
| | `POST /v1/invoices/{id}/approve?comment=...` | Phê duyệt AP Bill |
| | `POST /v1/invoices/{id}/reject?comment=...` | Từ chối AP Bill |
| **Payments** | `GET/POST/PUT/DELETE /v1/payments` | CRUD thanh toán |
| | `POST /v1/payments/{id}/post` | Post payment → ghi Sổ cái |
| | `POST /v1/payments/{id}/allocate` | Phân bổ payment vào Invoice |

> **Đã xóa khỏi codebase**: `/v1/finance/bank-transactions`, `/v1/finance/reconciliation`, `/v1/accounting/fiscal-periods`, `/v1/accounting/trial-balance`, `/v1/reports/*`

---

## Accounting Rules
- **Double-Entry**: Mọi `journal_entry` được tạo bởi hệ thống phải có ít nhất 2 `journal_lines`, trong đó tổng Nợ (Debit) bằng tổng Có (Credit).
- **Automated Journals Only**: Bút toán chỉ được sinh tự động qua `CreateJournalEntryWorker` (khi Invoice Approved) và `PaymentService.post()` (khi Payment Posted). **Không cho phép nhập tay**.
- **Draft vs Posted**: Giao dịch bắt đầu ở `draft`, phải qua bước `/post` để chính thức ghi nhận.
- **BigDecimal**: Bắt buộc dùng `BigDecimal` cho mọi giá trị tiền tệ.

---

## Implementation Details

- **Package**: `com.linhdv.efms_core_service`
- **Identity Links**: `company_id`, `created_by`, `updated_by` là `UUID` tham chiếu sang `efms-identity-service`. Không có FK database — isolation thực hiện bằng cách filter `companyId` trên tầng Service.
- **Security & Authorization**:
  - **`GatewayHeaderFilter`**: Filter tùy chỉnh đọc các header `X-User-*` do API Gateway inject vào.
  - **`SecurityContextHolder`**: Được populate với identity và authorities từ header `X-User-Permission`.
  - **Method Security**: `@PreAuthorize("hasAuthority('RESOURCE:ACTION')")` ở Controller/Service.

---

## Code Structure Rules
- **`controller`**: Nhóm theo domain: `controller.accounting`, `controller.finance`, `controller.invoice`. Luôn trả về `ApiResponse<T>`.
- **`service`**: Business logic, validation. **Không** dùng Camunda, **không** check fiscal period.
- **`service/accounting`**: Accounting service (Journal).
- **`service/finance`**: Finance service (Payment, BankAccount).
- **`repository`**: Truy vấn DB, luôn filter theo `companyId`.
- **`entity` / `dto` / `wrapper`**: Entity map 1-1 với table. DTO tách biệt request/response. Dùng `ApiResponse<T>` và `PagedResponse<T>` làm wrapper chuẩn.

---

## Guidelines
1. **KHÔNG** check `fiscal_period` — Validation này đã bị loại bỏ ở phạm vi đồ án.
2. Validate `@Valid` trên tất cả `xxxRequest` DTO đầu vào.
3. Mọi thay đổi tài chính nên được ghi vào `audit_logs` nếu có thời gian.

---

## 🎓 Thesis Scope Adaptations — Những thứ đã lược bỏ

Các module sau đã bị **xóa hoàn toàn khỏi codebase** (Controller, Service, Repository, DTO, Entity):

| Module đã xóa | Lý do |
|---|---|
| `FiscalPeriod` (Controller, Service, Repo, Entity) | Quá phức tạp, không cần cho demo |
| `TrialBalance` (Controller, Service, DTO) | Gộp vào Dashboard frontend |
| `BankTransaction` (Controller, Service, Repo, Entity) | Không cần nhập sao kê ngân hàng |
| `Reconciliation` (Controller, Service) | Nghiệp vụ quá phức tạp |
| `Report` (Controller, Service, toàn bộ thư mục) | Gộp vào Dashboard frontend |
| Manual Journal Entry (POST/PUT/DELETE `/journals`) | Bút toán chỉ được sinh tự động |

**DB Schema KHÔNG thay đổi** — Các bảng tương ứng vẫn tồn tại trong PostgreSQL để đảm bảo tính toàn vẹn và cho phép mở rộng sau này.

---
name: efms-common-service
description: Guidelines and architectural rules for developing the EFMS Common Service (Attachments, Comments).
---

# EFMS Common Service Development Guidelines

This skill provides context and guidelines whenever you are working on the `efms_common_service` module.

## 1. Overview
The **EFMS Common Service** is responsible for managing cross-cutting concerns that apply to various entities across the entire system, regardless of which core module they belong to.
Specifically:
- **Attachments**: File metadata and storage management (file sizes, names, URLs).
- **Comments**: Discussions, activity logs, and workflow approval comments.
- **Audit Logs**: Tracking historical changes (`old_data`, `new_data`, `action`) made to records across different tables, keeping track of who made the changes and when.

It typically runs on Port `8083` and expects incoming gateway requests prefixing `/api/common`.

## 2. Database & Data Association (Polymorphic)
Unlike the Core or Identity service, the Common service heavily utilizes **polymorphic relationships** to maintain independence.
- It does **not** rely on explicit foreign keys (e.g. `REFERENCES invoices(id)`).
- Attachments and Comments are standalone entities.
- Data is linked via a universal intermediate table `entity_links`.
  - `reference_id`: The UUID of the external business object (e.g., Invoice ID).
  - `reference_type`: A string identifier for the target object class (e.g., `'invoice'`, `'payment'`).
  - `item_id`: The UUID of the target comment or attachment.
  - `item_type`: A discriminator string, either `'comment'` or `'attachment'`.

When building endpoints to fetch/upload attachments, or append comments:
- Always enforce multi-tenancy checking (`company_id`) to ensure users only see comments belonging to their enterprise.
- Use `reference_id` and `reference_type` in the API path or payload so that Common Service knows what it's mapping to.

### 2.1 Cross-Service Data Enrichment (Batch Fetching)
To avoid the N+1 problem and maintain microservice independence:
- **Do not** store user or company names directly in Common Service.
- Use `IdentityServiceClient` to batch fetch user details (name, avatar) from the Identity Service.
- The service layer should collect all unique IDs, call the Identity Service once, and enrich the `Response` DTOs (`authorName`, `createdByName`) before returning data to the client.

## 3. Authentication & Security
- Must implement JWT checking for `/api/common/**` identical to how Core and Identity validate the stateless token.
- Validate `companyId` and `userId` directly from the Spring Security Context claims or via `X-Company-Id` / `X-User-Id` headers when called through the Gateway.

## 4. Tech Stack & Standardization
- **Package format**: `com.linhdv.efms_common_service.*`
- Maintain consistency using: Java 21, Spring Boot 3.3.x, Lombok, MapStruct.
- **Inter-service Communication**: Use `WebClient` (configured in `WebClientConfig`) for REST calls to other services.
- Controllers must strictly wrap responses using the generic `ApiResponse<T>` object. Exception handlers must convert any DB isolation or invalid references into appropriate HTTP error codes bundled within the `ApiResponse`.

---
name: efms-mcp-server
description: >
  MCP Server (Node.js/TypeScript) đóng vai trò trung gian giữa Claude AI và hệ thống EFMS.
  Tham khảo skill này khi cần: tạo tool mới, xử lý auth (stdio OAuth hoặc HTTP JWT),
  gọi EFMS API, hoặc hiểu luồng dữ liệu từ Claude → MCP → EFMS API Gateway.
---

# EFMS MCP Server — Skill Reference

## Tổng quan nhanh

```
Claude (AI)
    │  MCP Protocol (stdio hoặc HTTP+SSE)
    ▼
efms-mcp-server  ←── skill này cover toàn bộ phần này
    │  REST + JWT
    ▼
EFMS API Gateway :8080
    ├── /api/identity/** → Identity Service :8081
    └── /api/core/**    → Core Service :8082
```

---

## Cấu trúc project

```
efms-mcp-server/
├── src/
│   ├── index.ts              # Entry point stdio
│   ├── index-http.ts         # Entry point HTTP + SSE
│   ├── auth/
│   │   ├── tokenManager.ts   # OAuth browser flow + file cache (stdio)
│   │   └── jwtVerifier.ts    # Verify Bearer token từ header (HTTP)
│   ├── client/
│   │   └── efmsClient.ts     # axios instance với auth interceptor
│   ├── tools/
│   │   ├── index.ts          # registerAllTools()
│   │   └── efms.ts           # All registered tools
│   └── types/
│       └── efms.ts
├── package.json
└── tsconfig.json
```

---

## Auth — Giao thức HTTP + SSE (OAuth 2.1)

Hệ thống EFMS MCP Server sử dụng 100% **HTTP + SSE Transport** kết hợp với luồng xác thực **OAuth 2.1** tiêu chuẩn.

### Nguyên tắc hoạt động

1. **Không tự mở Browser:** MCP Server không tự gọi trình duyệt. Thay vào đó, Claude Desktop (đóng vai trò là OAuth Client) sẽ đọc cấu hình, mở trình duyệt để xác thực.
2. **Xác thực từng Request:** Mỗi request từ Claude Desktop gửi lên `/mcp` đều kèm theo header `Authorization: Bearer <token>`.
3. **Mỗi Session một User:** Server sẽ verify token bằng cách gọi về EFMS Identity Service. Khi token hợp lệ, nó sẽ tạo một `McpServer` instance gắn với `companyId` của user đó để phân quyền dữ liệu (Multi-tenant).

---

### OAuth Metadata Endpoint (Bắt buộc)

Claude Desktop tự động tìm thông tin xác thực tại endpoint này (theo chuẩn RFC 8414).

```typescript
app.get("/.well-known/oauth-authorization-server", (req, res) => {
  const baseUrl = process.env.PRIVATE_EFMS_BASE_URL || "http://localhost:8080";
  res.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/identity/oauth/authorize`,
    token_endpoint: `${baseUrl}/api/identity/oauth/token`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["openid", "profile", "email"]
  });
});
```

### Endpoint /mcp (StreamableHTTP Transport)

Đây là nơi Claude Desktop gửi lệnh thực thi tools. Khác với thiết kế SSE cũ chia làm 2 endpoint `/sse` và `/message`, MCP SDK mới sử dụng `StreamableHTTPServerTransport` gói gọn trong duy nhất endpoint `/mcp` (POST).

```typescript
app.post("/mcp", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    console.error("[MCP] ❌ Thiếu token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.slice(7);

  try {
    // Gọi Identity Service để verify token và lấy thông tin User
    const identityRes = await axios.get(
      `${process.env.PRIVATE_EFMS_BASE_URL}/api/identity/auth/me`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const user = identityRes.data.data;
    if (!user?.companyId) {
      return res.status(400).json({ error: "Missing companyId" });
    }

    console.error(`[MCP] 👤 ${user.email} | ${req.body?.method}`);

    // Khởi tạo MCP server instance riêng cho mỗi request với context
    const server = new McpServer({ name: "efms-mcp-server", version: "1.0.0" });
    registerAllTools(server, { token, companyId: user.companyId });

    // Dùng transport mới (StreamableHTTP)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    } as any);

    await server.connect(transport as any);
    await transport.handleRequest(req, res, req.body);

  } catch (error: any) {
    console.error(`[MCP] ❌ ${error.message}`);
    if (!res.headersSent) {
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  }
});
```

---

### Cấu hình Claude Desktop

Vì sử dụng Remote HTTP Server, cấu hình trong `claude_desktop_config.json` cần chỉ định loại `http` và phần `oauth` để trỏ về API Gateway của hệ thống.

```json
{
  "mcpServers": {
    "efms-mcp": {
      "type": "http",
      "url": "https://efms-mcp-server-sse-production.up.railway.app/mcp",
      "oauth": {
        "authorization_server_metadata_url": "https://efms-api-gateway-production.up.railway.app/api/identity/.well-known/oauth-authorization-server",
        "client_id": "claude-connector"
      }
    }
  }
}
```

---

## Viết Tool mới

Mọi tool đều theo cấu trúc này:

```typescript
// src/tools/efms.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createEfmsClient } from "../client/efmsClient.js";

export function registerEfmsTools(server: McpServer, ctx: { token: string; companyId?: string }) {
  const client = createEfmsClient(ctx.token, ctx.companyId);

  server.tool(
    "list_invoices",
    "Liệt kê danh sách hóa đơn",
    {
      status: z.string().optional(),
      invoiceType: z.string().optional(),
      partnerId: z.string().optional(),
      page: z.number().default(0),
      size: z.number().default(20),
    },
    async (params) => {
      const response = await client.get("/api/core/v1/invoices", { 
        params: { ...params, companyId: ctx.companyId } 
      });
      return {
        content: [{ type: "text", text: JSON.stringify(response.data.data, null, 2) }],
      };
    }
  );

  // Thêm các tool khác tương tự...
}
```

```typescript
// src/tools/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerEfmsTools, type McpContext } from "./efms.js";

export function registerAllTools(server: McpServer, ctx: McpContext) {
  registerEfmsTools(server, ctx);
}
```

---

## Danh sách tools cần implement

### Invoices
- `list_invoices` — filter: status, type, partner, fromDate, toDate
- `get_invoice` — trả về invoice + invoice_lines
- `create_invoice` — tạo draft, validate fiscal_period mở
- `confirm_invoice` — POST /post → trigger Camunda
- `delete_invoice` — chỉ khi status = draft
- `list_approval_tasks` — Gọi `/api/core/v1/invoice-tasks/tasks` trả về danh sách kèm taskId
- `complete_approval_task` — (Sắp tới) Tích hợp Zeebe REST API v2 `/v2/user-tasks/{taskId}/completion`

### Payments
- `list_payments`, `get_payment`, `create_payment`
- `post_payment` — POST /v1/payments/{id}/post
- `allocate_payment` — POST /v1/payments/{id}/allocate

### Journals
- `list_journals`, `get_journal`, `create_journal`, `delete_journal`

### Partners & Accounts
- `list_partners`, `get_partner`, `create_partner`
- `list_accounts` — Chart of Accounts

### Reports
- `get_trial_balance` — params: fiscalPeriodId
- `get_aging_report` — params: type (AR/AP), asOfDate

---

## Quy tắc quan trọng

1. **Luôn gọi `tokenManager.getToken()`** trước mọi request (đã tự động qua axios interceptor).
2. **Không hardcode companyId** — lấy từ token claims hoặc ctx được truyền vào.
3. **Fiscal period phải open** trước khi tạo/post transaction — gọi `/v1/accounting/fiscal-periods` kiểm tra trước.
4. **Monetary amounts dùng string** khi truyền vào tool args — EFMS xử lý `BigDecimal`, tránh float precision.
5. **HTTP transport:** mỗi SSE session tạo một McpServer instance riêng để isolate context user.
6. **stdio transport:** token file lưu tại `~/.efms-mcp/token.json`, refresh tự động 60 giây trước khi hết hạn.

---

## Biến môi trường

| Biến | stdio | HTTP | Mô tả |
|---|:---:|:---:|---|
| `PRIVATE_EFMS_BASE_URL` | ✓ | ✓ | Base URL của EFMS API Gateway |
| `EFMS_AUTH_URL` | ✓ | ✓ | URL trang login EFMS |
| `EFMS_CALLBACK_PORT` | ✓ | — | Port localhost để hứng OAuth callback (mặc định 9999) |
| `JWT_SECRET` | — | ✓ | Shared secret để verify JWT local (nếu không dùng /auth/me) |
| `PORT` | — | ✓ | Port HTTP server (mặc định 3000) |

---

## So sánh nhanh stdio vs HTTP

| | stdio | HTTP + SSE |
|---|---|---|
| Chạy ở đâu | Máy user | Server remote |
| Ai mở browser | MCP Server tự mở | MCP Client tự mở |
| Token lưu ở đâu | `~/.efms-mcp/token.json` | MCP Client giữ |
| Phân quyền | Dùng chung 1 token | Mỗi user 1 token riêng |
| Phù hợp | Nội bộ, dev, ít user | Production, nhiều user |