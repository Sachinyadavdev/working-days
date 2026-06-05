# Graph Report - working-days  (2026-06-05)

## Corpus Check
- 291 files · ~84,365 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1849 nodes · 4884 edges · 106 communities (91 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99f562ee`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 67|Community 67]]
- [[_COMMUNITY_Community 68|Community 68]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]

## God Nodes (most connected - your core abstractions)
1. `apiClient` - 88 edges
2. `Button` - 74 edges
3. `PrismaService` - 68 edges
4. `PaginationDto` - 56 edges
5. `DialogHeader()` - 53 edges
6. `DialogContent` - 52 edges
7. `DialogTitle` - 52 edges
8. `useAuthStore` - 46 edges
9. `Input` - 44 edges
10. `Card` - 40 edges

## Surprising Connections (you probably didn't know these)
- `ViewEmployeeModal()` --calls--> `formatDate()`  [INFERRED]
  apps/web/src/components/employees/view-employee-modal.tsx → packages/shared-utils/src/index.ts
- `FilterProjectsDto` --inherits--> `PaginationDto`  [EXTRACTED]
  apps/api/src/modules/projects/dto/filter-projects.dto.ts → apps/api/src/common/dto/pagination.dto.ts
- `FilterTeamsDto` --inherits--> `PaginationDto`  [EXTRACTED]
  apps/api/src/modules/teams/dto/filter-teams.dto.ts → apps/api/src/common/dto/pagination.dto.ts
- `LeaveRequestQueryDto` --inherits--> `PaginationDto`  [EXTRACTED]
  apps/api/src/modules/leave/dto/leave-request-query.dto.ts → apps/api/src/common/dto/pagination.dto.ts
- `AttendancePage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/attendance/page.tsx → apps/web/src/stores/auth.store.ts

## Import Cycles
- None detected.

## Communities (106 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (9): AdminCreateEmployeeDto, AdminUpdateEmployeeDto, ChangeRoleDto, ChangeStatusDto, ResetPasswordDto, CreateEmployeeDto, UpdateEmployeeDto, EmployeesController (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.16
Nodes (3): UpdateUserDto, UsersController, UsersService

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (16): cache, cache, persistent, dependsOn, cache, tasks, clean, dev (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (23): devDependencies, @ems/eslint-config, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, rimraf (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (11): description, engines, node, pnpm, lint-staged, *.{json,md,css}, *.{ts,tsx}, name (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (20): RequireRole(), RequireRoleProps, DashboardLayout(), adminNavigation, AppSidebar(), employeeNavigation, navigation, HeaderAttendance() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (32): description, devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (33): dependencies, bcrypt, class-transformer, class-validator, compression, cookie-parser, @ems/shared-types, @ems/shared-utils (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (28): dependencies, axios, class-variance-authority, clsx, @ems/shared-types, @ems/shared-utils, framer-motion, @hookform/resolvers (+20 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (42): ApiErrorResponse, ApiResponse, AuthTokens, JwtPayload, PaginationMeta, PaginationParams, ActivityLogEntity, AttendanceBreakEntity (+34 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (12): devDependencies, @ems/eslint-config, eslint, eslint-config-next, postcss, rimraf, tailwindcss, @tailwindcss/postcss (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (12): scripts, build, clean, dev, format, format:check, lint, lint:fix (+4 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (21): dependsOn, outputs, cache, cache, persistent, globalDependencies, dependsOn, cache (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (6): ChecklistItemDto, CreateTaskDto, UpdateTaskDto, TasksController, TasksModule, TasksService

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.31
Nodes (6): DesignationFormValues, DesignationModal(), DesignationModalProps, designationSchema, Designation, DesignationsPage()

### Community 17 - "Community 17"
Cohesion: 0.06
Nodes (9): AddTeamMemberDto, AssignProjectDto, CreateTeamDto, FilterTeamsDto, TransferMemberDto, UpdateMemberRoleDto, UpdateTeamDto, TeamsController (+1 more)

### Community 18 - "Community 18"
Cohesion: 0.11
Nodes (19): scripts, build, clean, db:generate, db:migrate, db:migrate:deploy, db:push, db:seed (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (16): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, outDir (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.17
Nodes (14): devDependencies, @ems/eslint-config, rimraf, typescript, main, name, private, scripts (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.17
Nodes (14): devDependencies, @ems/eslint-config, rimraf, typescript, main, name, private, scripts (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (9): inter, metadata, RootLayout(), Providers(), Theme, ThemeContext, ThemeContextType, ThemeProvider() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (11): calculateBusinessDays(), deepClone(), formatDate(), formatHours(), formatRelativeTime(), generateTaskKey(), getDisplayName(), getInitials() (+3 more)

### Community 25 - "Community 25"
Cohesion: 0.23
Nodes (10): dependencies, eslint, eslint-config-prettier, eslint-plugin-import, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, main, name (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.24
Nodes (9): collection, compilerOptions, assets, builder, deleteOutDir, plugins, watchAssets, $schema (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): code:bash (docker-compose up -d db redis), code:bash (pnpm --filter=@ems/api run db:push), code:bash (pnpm run dev), code:bash (docker-compose up -d --build), Employee Management System - Run Guide, Option 1: Development Mode (Recommended for Coding), Option 2: Production Simulation (Full Docker)

### Community 30 - "Community 30"
Cohesion: 0.25
Nodes (8): devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf, typescript

### Community 31 - "Community 31"
Cohesion: 0.39
Nodes (6): moduleFileExtensions, rootDir, testEnvironment, testRegex, transform, ^.+\\.(t|j)s$

### Community 32 - "Community 32"
Cohesion: 0.47
Nodes (4): compilerOptions, outDir, exclude, extends

### Community 33 - "Community 33"
Cohesion: 0.53
Nodes (4): containerVariants, DashboardPage(), itemVariants, stats

### Community 34 - "Community 34"
Cohesion: 0.60
Nodes (3): config, middleware(), publicPaths

### Community 47 - "Community 47"
Cohesion: 0.10
Nodes (39): Employee, employeeApi, AdminLeaveDashboard, CreateLeaveRequestDto, EmployeeLeaveDashboard, Holiday, leaveApi, LeaveBalance (+31 more)

### Community 48 - "Community 48"
Cohesion: 0.29
Nodes (7): ACTION_COLORS, ACTION_ICONS, ActivityLog, formatDateTime(), ProjectActivityFeed(), ProjectActivityFeedProps, renderChanges()

### Community 49 - "Community 49"
Cohesion: 0.09
Nodes (44): SuperAdminDashboard(), AdminAuditPage(), RequirePermission(), RequirePermissionProps, AssignRoleDialog(), PermissionMatrix(), RoleDialog(), EmployeeProfilePage() (+36 more)

### Community 50 - "Community 50"
Cohesion: 0.06
Nodes (12): UpdateSettingDto, GlobalExceptionFilter, LoggingInterceptor, TransformedResponse, TransformInterceptor, LoggerModule, LoggerService, NotificationsGateway (+4 more)

### Community 51 - "Community 51"
Cohesion: 0.39
Nodes (7): COLUMN_CONFIG, KanbanColumn, KanbanTask, PriorityIcon(), ProjectKanban(), ProjectKanbanProps, TaskCard()

### Community 52 - "Community 52"
Cohesion: 0.28
Nodes (4): RequirePermissions(), PermissionsGuard, prisma, RolesGuard

### Community 54 - "Community 54"
Cohesion: 0.16
Nodes (3): CurrentUser, EmployeeProfileController, EmployeeProfileService

### Community 55 - "Community 55"
Cohesion: 0.15
Nodes (4): JwtAuthGuard, WorkspaceController, WorkspaceModule, WorkspaceService

### Community 56 - "Community 56"
Cohesion: 0.20
Nodes (4): PermissionsController, PermissionsModule, PermissionsService, prisma

### Community 58 - "Community 58"
Cohesion: 0.16
Nodes (17): STATUS_BADGE, formatDateTime(), parseAttachment(), PRIORITY_BADGE, ProjectDetailPage(), TASK_STATUS_COLOR, AddLinkModal(), AddMemberModal() (+9 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (11): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, moduleNameMapper, rootDir, testEnvironment, testRegex (+3 more)

### Community 60 - "Community 60"
Cohesion: 0.12
Nodes (7): AddMemberDto, CreateCommentDto, CreateProjectDto, FilterProjectsDto, UpdateProjectDto, ProjectsController, ProjectsModule

### Community 61 - "Community 61"
Cohesion: 0.11
Nodes (6): AssignPermissionsDto, CreateRoleDto, UpdateRoleDto, RolesController, prisma, RolesService

### Community 62 - "Community 62"
Cohesion: 0.12
Nodes (5): Public(), prisma, HealthController, HealthModule, RedisService

### Community 63 - "Community 63"
Cohesion: 0.13
Nodes (5): AssignRoleDto, AuthorizationController, AuthorizationModule, AuthorizationService, prisma

### Community 64 - "Community 64"
Cohesion: 0.50
Nodes (3): turbo, globalDependencies, $schema

### Community 65 - "Community 65"
Cohesion: 0.18
Nodes (15): ActivityLogsModule, AttendanceModule, DatabaseModule, DepartmentModule, DesignationModule, EmployeeProfileModule, EmployeesModule, LeaveModule (+7 more)

### Community 66 - "Community 66"
Cohesion: 0.50
Nodes (3): Employee Management System - Run Guide, Option 1: Development Mode (Recommended for Coding), Option 2: Production Simulation (Full Docker)

### Community 67 - "Community 67"
Cohesion: 0.13
Nodes (4): PrismaService, Roles(), SuperAdminController, SuperAdminService

### Community 68 - "Community 68"
Cohesion: 0.31
Nodes (6): DepartmentFormValues, DepartmentModal(), DepartmentModalProps, departmentSchema, Department, DepartmentsPage()

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, start, type-check

### Community 70 - "Community 70"
Cohesion: 0.06
Nodes (13): CreateLeaveCategoryDto, CreateLeaveCommentDto, CreateLeaveRequestDto, CreateHolidayDto, UpdateHolidayDto, AdjustLeaveBalanceDto, AllocateBalanceItemDto, AllocateLeaveBalanceDto (+5 more)

### Community 71 - "Community 71"
Cohesion: 0.18
Nodes (4): DepartmentController, DepartmentService, CreateDepartmentDto, UpdateDepartmentDto

### Community 72 - "Community 72"
Cohesion: 0.18
Nodes (4): DesignationController, DesignationService, CreateDesignationDto, UpdateDesignationDto

### Community 73 - "Community 73"
Cohesion: 0.67
Nodes (3): dependsOn, outputs, build

### Community 74 - "Community 74"
Cohesion: 0.39
Nodes (3): SalaryController, SalaryModule, SalaryService

### Community 75 - "Community 75"
Cohesion: 0.60
Nodes (3): name, private, version

### Community 77 - "Community 77"
Cohesion: 0.60
Nodes (3): name, private, version

### Community 79 - "Community 79"
Cohesion: 0.46
Nodes (6): daysBetween(), ProjectTimeline(), ProjectTimelineProps, STATUS_BG, STATUS_COLORS, TimelineTask

### Community 82 - "Community 82"
Cohesion: 0.39
Nodes (3): DocumentsController, DocumentsModule, DocumentsService

### Community 84 - "Community 84"
Cohesion: 0.12
Nodes (22): ChangeRoleModal(), ChangeRoleModalProps, ChangeStatusModal(), ChangeStatusModalProps, ResetPasswordModal(), ResetPasswordModalProps, roleSchema, AddEmployeeModal() (+14 more)

### Community 85 - "Community 85"
Cohesion: 0.25
Nodes (14): AssignRoleDialogProps, PermissionGroup, PermissionMatrixProps, RoleDialogProps, RoleFormData, roleSchema, ApplyLeaveDialogProps, Checkbox (+6 more)

### Community 86 - "Community 86"
Cohesion: 0.08
Nodes (7): AuthController, AuthService, APP_CONSTANTS, LoginDto, RegisterDto, SecurityController, SecurityService

### Community 87 - "Community 87"
Cohesion: 0.39
Nodes (7): ACTION_COLORS, ACTION_ICONS, ACTION_LABELS, ActivityLog, formatRelativeTime(), TeamActivityFeed(), TeamActivityFeedProps

### Community 89 - "Community 89"
Cohesion: 0.16
Nodes (3): AttendanceCorrectionsController, AttendanceCorrectionsService, CorrectionRequestDto

### Community 91 - "Community 91"
Cohesion: 0.19
Nodes (12): CreateProjectModal(), EditProjectModal(), PRIORITY_BADGE, ProjectsPage(), STATUS_BADGE, CreateTeamModal(), EditTeamModal(), STATUS_BADGE (+4 more)

### Community 92 - "Community 92"
Cohesion: 0.10
Nodes (29): STATUS_BADGE, ROLE_BADGE, STATUS_BADGE, TABS, TeamDetailPage(), authStore, failedQueue, processQueue() (+21 more)

### Community 95 - "Community 95"
Cohesion: 0.13
Nodes (4): ActivityLogsController, PaginationDto, NotificationsController, NotificationsService

### Community 99 - "Community 99"
Cohesion: 0.21
Nodes (4): AuthModule, JwtRefreshStrategy, JwtStrategy, UsersModule

### Community 100 - "Community 100"
Cohesion: 0.19
Nodes (14): attendanceApi, CheckInDto, CorrectionRequestDto, StartBreakDto, AllEmployeesHours(), AttendanceCalendar(), AttendanceStats(), CheckInWidget() (+6 more)

### Community 104 - "Community 104"
Cohesion: 0.60
Nodes (3): main(), prisma, { PrismaClient }

### Community 110 - "Community 110"
Cohesion: 0.43
Nodes (6): CalendarEvent, DAYS, DOT_COLORS, MONTHS, TeamCalendar(), TeamCalendarProps

### Community 113 - "Community 113"
Cohesion: 0.48
Nodes (5): COLUMN_CONFIG, KanbanTask, PRIORITY_BADGE, TeamKanban(), TeamKanbanProps

### Community 114 - "Community 114"
Cohesion: 0.53
Nodes (4): AnimatedCounter(), ProjectStats(), ProjectStatsProps, statCards

### Community 115 - "Community 115"
Cohesion: 0.53
Nodes (4): AnimatedCounter(), statCards, TeamStats(), TeamStatsProps

## Knowledge Gaps
- **301 isolated node(s):** `builder`, `deleteOutDir`, `plugins`, `assets`, `watchAssets` (+296 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PrismaService` connect `Community 67` to `Community 0`, `Community 1`, `Community 14`, `Community 17`, `Community 50`, `Community 53`, `Community 54`, `Community 55`, `Community 60`, `Community 62`, `Community 65`, `Community 70`, `Community 71`, `Community 72`, `Community 86`, `Community 88`, `Community 89`, `Community 95`, `Community 103`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `PaginationDto` connect `Community 95` to `Community 0`, `Community 1`, `Community 70`, `Community 103`, `Community 14`, `Community 17`, `Community 53`, `Community 60`, `Community 94`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `ActivityLogsService` connect `Community 28` to `Community 67`, `Community 95`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `builder`, `deleteOutDir`, `plugins` to the rest of the system?**
  _301 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14512195121951219 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._