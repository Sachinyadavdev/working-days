# Dashboard access and architecture review

Reviewed: 2026-11-03

## Outcome and scope

The application is a modular monolith: one Nest API, one shared Prisma schema/database,
and one Next.js application. Feature modules exist, but independent business-service
deployment and data ownership do not. Access hardening does not require a microservice migration.

This pass checks the recommended priorities and applies targeted authorization repairs.
It does not complete the unfinished features or claim complete tenant isolation.
No database migrations, data mutations, deployments, or live-user tests were performed.
API paths and successful response structures are retained; login adds a permissions array.
Previously unauthorized operations now return access errors.

## Applied repairs

| Area | Behavior after this change |
| --- | --- |
| API identity | JWT validation checks account activity and loads current active, non-deleted roles. Roles removed after token issuance no longer authorize requests. Password-reset tokens cannot serve as API access tokens. |
| Role and permission guards | Role checks use the validated identity. Permission checks use active database assignments, canonical `module.action` keys and the injected Prisma service. Active super admins are not blocked by missing permission-catalog entries. |
| Login/UI permissions | Login returns canonical permissions from active roles. The UI permission component accepts both legacy colon and dot separators. |
| User profile | Users can edit themselves; ADMIN/SUPER_ADMIN can edit other users. |
| Employee profile | Self-service uses JWT `sub`; only phone, address and emergency contact are writable. Listing is ADMIN/SUPER_ADMIN; creation is SUPER_ADMIN. |
| Workspaces | Creation is ADMIN/SUPER_ADMIN. Identity uses `sub`; all assigned roles are considered. Details require ownership, membership or SUPER_ADMIN. |
| Projects and teams | Management mutations require ADMIN/SUPER_ADMIN/MANAGER/PROJECT_MANAGER. Permanent deletion requires SUPER_ADMIN, matching existing endpoint descriptions. |
| Tasks | Creation/cancellation require management roles. Assignees retain status/checklist updates; editing others' tasks or changing assignments/details requires management access. |
| Attendance | Correction review/listing requires management access. Shift mutations require ADMIN/SUPER_ADMIN. Admin statistics and record listing have role checks. Cross-employee calendars require ADMIN/SUPER_ADMIN/MANAGER. |
| Leave | The self-cancellation route verifies ownership before using the existing cancellation/balance workflow. |
| EOD | All-report listing and review require ADMIN/SUPER_ADMIN/MANAGER. Employee submission and own-report routes remain available. |
| Announcements | Publishing requires ADMIN/SUPER_ADMIN. |

The MANAGEMENT role choices preserve the repository's existing ADMIN/MANAGER conventions
and the PROJECT_MANAGER role used by the project/task UI. They are organization-level
permissions; manager-to-team scoping is not yet implemented.

## Remaining work, in priority order

### 1. Complete access boundaries

- **Notification sockets:** `notifications.gateway.ts` trusts a handshake `userId`
  without authenticating a token. Authenticate the socket, derive identity server-side,
  and handle token expiry/revocation and multiple sessions. HTTP JWT guards do not protect sockets.
- **Read scoping:** project, team and task lists/details and employee directory endpoints
  remain broadly readable by authenticated users. Define organization-directory versus
  private-workspace visibility before applying consistent query filters to lists,
  details, statistics, nested resources and exports.
- **Leave privacy:** request listing/details/comments still need owner/authorized-manager
  scope. Self-cancellation is repaired, but this does not secure all leave reads.
- **Notification ownership:** individual mark-as-read currently updates by notification ID
  without checking the recipient. Announcement reads also need audience filtering.
- **Manager scope:** approvals currently check management roles rather than reporting lines
  or team membership. Decide whether managers may approve across teams and their own requests.
- **Delegated administration:** review role assignment and permission editing for privilege
  escalation; `role.assign` alone must not imply authority to grant SUPER_ADMIN.
- **Profile creation:** replace its untyped creation body, remove temporary-password logging,
  and return an explicit safe response rather than a raw created user record.
- **Frontend alignment:** navigation and several management controls still need to reflect
  the server policy. The dashboard layout and middleware do not implement a complete route
  access policy. Server authorization is the enforcement boundary.

These are real remaining gaps; the application is not certified as fully isolated or
production-secure by this review.

### 2. Finish permission consistency

- The seed catalog lacks role-management and department/designation permissions used by
  the UI/API. Department/designation UI keys also use plural module names while other
  permissions use singular names. Separator compatibility alone does not resolve this.
- Feature endpoints still mix hard-coded role checks with permission checks. Define one
  action/scope policy and migrate incrementally, retaining existing legitimate roles.
- The effective-permissions service and frontend stored permissions can be stale; protected
  permission endpoints now read current assignments, but UI refresh still needs consolidation.
- Identity is normalized in the repaired profile/workspace handlers, not through a blanket
  application-wide API rewrite.

### 3. Complete unfinished dashboard features

| Feature | Source review finding |
| --- | --- |
| Main dashboard | Hard-coded statistics rather than role-scoped live aggregation. |
| Employee profile | Static example values and a nonfunctional document-upload control. |
| Salary | Placeholder page and empty controller. |
| Documents | Empty controller; upload/storage/authorization workflow is unfinished. |
| Navigation | `/activity` and `/settings` links have no corresponding index pages in the source tree. |

Complete these as separate feature changes with their own behavior and data contracts.

### 4. Strengthen modular boundaries before service extraction

- Keep the current deployment while defining ownership for identity/access, workforce,
  work management, attendance/leave, and communications.
- Replace remaining module-level `new PrismaClient()` instances in roles, permissions and
  authorization services with injected persistence dependencies.
- Remove controller access to private service persistence (for example, leave controller
  calls to `leaveService['prisma']`) in favor of explicit service methods.
- Define contracts/events and avoid direct writes to another module's tables.
- In-process EventEmitter events are not a durable service message bus. Independent services
  will need reliable delivery, idempotency, retries, observability and explicit data ownership.
- Extract a service only when it has a concrete independent deployment/scaling requirement.

## Verification

- API and web TypeScript checks passed before and after changes.
- Final API suite: **7 suites passed, 55 tests passed**, including 49 new authorization
  regression cases. `git diff --check` passed.
- Regression coverage exercises role metadata through the actual RolesGuard, ownership
  decisions, safe profile-field validation, active-account identity and permission revocation.
- Existing six smoke-test fixtures now mock missing injected dependencies. They remain smoke
  tests; the new authorization suite provides the behavioral assertions.
- Tests use mocked persistence. They do not replace browser, HTTP integration, real-database,
  concurrency or production rollout testing. JWT validation adds a database lookup per
  authenticated request; measure latency under representative load before rollout.

Reproduce from the repository root on Windows:

```powershell
.\apps\api\node_modules\.bin\tsc.cmd --noEmit -p apps/api/tsconfig.json
.\apps\web\node_modules\.bin\tsc.cmd --noEmit --incremental false -p apps/web/tsconfig.json
```

Run tests from `apps/api`:

```powershell
.\node_modules\.bin\jest.cmd --runInBand --cacheDirectory ./node_modules/.cache/access-review
```

The local binary commands avoid the pnpm launcher's attempted network download. The explicit
cache location avoids a sandbox restriction on the default Windows temporary cache.
