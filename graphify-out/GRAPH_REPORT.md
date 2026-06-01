# Graph Report - working-days  (2026-06-01)

## Corpus Check
- 289 files · ~82,798 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1511 nodes · 2716 edges · 117 communities (85 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `29560c4c`
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
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 99|Community 99]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 108|Community 108]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 114|Community 114]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]

## God Nodes (most connected - your core abstractions)
1. `apiClient` - 44 edges
2. `Button` - 37 edges
3. `useAuthStore` - 30 edges
4. `DialogHeader()` - 27 edges
5. `PrismaService` - 26 edges
6. `DialogContent` - 26 edges
7. `DialogTitle` - 26 edges
8. `LeaveController` - 25 edges
9. `TeamsService` - 25 edges
10. `TeamsController` - 24 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  apps/web/src/lib/utils.ts → apps/web/package.json
- `ViewEmployeeModal()` --calls--> `formatDate()`  [INFERRED]
  apps/web/src/components/employees/view-employee-modal.tsx → packages/shared-utils/src/index.ts
- `EmployeeDirectoryPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/employees/page.tsx → apps/web/src/stores/auth.store.ts
- `LeavePage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/leave/page.tsx → apps/web/src/stores/auth.store.ts
- `ProjectDetailPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/projects/[id]/page.tsx → apps/web/src/stores/auth.store.ts

## Communities (117 total, 32 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (10): AdminCreateEmployeeDto, AdminUpdateEmployeeDto, ChangeRoleDto, ChangeStatusDto, ResetPasswordDto, CreateEmployeeDto, UpdateEmployeeDto, EmployeesController (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (5): GlobalExceptionFilter, LoggingInterceptor, TransformedResponse, TransformInterceptor, AppModule

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (23): devDependencies, @ems/eslint-config, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, rimraf (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.23
Nodes (11): CreateLeaveCategoryDto, CreateLeaveCommentDto, CreateLeaveRequestDto, CreateHolidayDto, UpdateHolidayDto, AdjustLeaveBalanceDto, AllocateBalanceItemDto, AllocateLeaveBalanceDto (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (28): attendanceApi, CheckInDto, CorrectionRequestDto, StartBreakDto, AllEmployeesHours(), AttendanceCalendar(), AttendanceStats(), CheckInWidget() (+20 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (32): description, devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (30): dependencies, bcrypt, class-transformer, class-validator, cookie-parser, @ems/shared-types, @ems/shared-utils, ioredis (+22 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (27): dependencies, axios, class-variance-authority, clsx, @ems/shared-types, @ems/shared-utils, framer-motion, @hookform/resolvers (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (36): ActivityLogEntity, AttendanceBreakEntity, AttendanceCorrectionEntity, AttendanceEntity, BaseEntity, EmployeeEntity, HolidayEntity, LeaveBalanceEntity (+28 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (12): devDependencies, @ems/eslint-config, eslint, eslint-config-next, postcss, rimraf, tailwindcss, @tailwindcss/postcss (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (8): RequirePermission(), RequirePermissionProps, AssignRoleDialog(), PermissionMatrix(), RoleDialog(), Role, CardDescription, User

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (21): dependsOn, outputs, cache, cache, persistent, globalDependencies, dependsOn, cache (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.13
Nodes (6): ChecklistItemDto, CreateTaskDto, UpdateTaskDto, TasksController, TasksModule, TasksService

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.34
Nodes (6): AddMemberDto, CreateCommentDto, CreateProjectDto, FilterProjectsDto, UpdateProjectDto, ProjectsModule

### Community 17 - "Community 17"
Cohesion: 0.05
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
Cohesion: 0.13
Nodes (14): devDependencies, @ems/eslint-config, rimraf, typescript, main, name, private, scripts (+6 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (14): devDependencies, @ems/eslint-config, rimraf, typescript, main, name, private, scripts (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (7): inter, metadata, Providers(), Theme, ThemeContext, ThemeContextType, ThemeProvider()

### Community 24 - "Community 24"
Cohesion: 0.17
Nodes (3): ViewEmployeeModal(), formatDate(), formatRelativeTime()

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (10): dependencies, eslint, eslint-config-prettier, eslint-plugin-import, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, main, name (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.20
Nodes (9): collection, compilerOptions, assets, builder, deleteOutDir, plugins, watchAssets, $schema (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): code:bash (docker-compose up -d db redis), code:bash (pnpm --filter=@ems/api run db:push), code:bash (pnpm run dev), code:bash (docker-compose up -d --build), Employee Management System - Run Guide, Option 1: Development Mode (Recommended for Coding), Option 2: Production Simulation (Full Docker)

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (6): ApiErrorResponse, ApiResponse, AuthTokens, JwtPayload, PaginationMeta, PaginationParams

### Community 31 - "Community 31"
Cohesion: 0.29
Nodes (6): moduleFileExtensions, rootDir, testEnvironment, testRegex, transform, ^.+\\.(t|j)s$

### Community 32 - "Community 32"
Cohesion: 0.40
Nodes (4): compilerOptions, outDir, exclude, extends

### Community 33 - "Community 33"
Cohesion: 0.40
Nodes (3): containerVariants, itemVariants, stats

### Community 47 - "Community 47"
Cohesion: 0.10
Nodes (29): Employee, employeeApi, AdminLeaveDashboard, CreateLeaveRequestDto, EmployeeLeaveDashboard, Holiday, leaveApi, LeaveBalance (+21 more)

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (5): ACTION_COLORS, ACTION_ICONS, ActivityLog, ProjectActivityFeed(), ProjectActivityFeedProps

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (5): Card, CardContent, CardFooter, CardHeader, CardTitle

### Community 50 - "Community 50"
Cohesion: 0.16
Nodes (4): UpdateSettingDto, SettingsController, SettingsModule, SettingsService

### Community 51 - "Community 51"
Cohesion: 0.25
Nodes (5): COLUMN_CONFIG, KanbanColumn, KanbanTask, ProjectKanban(), ProjectKanbanProps

### Community 52 - "Community 52"
Cohesion: 0.21
Nodes (6): AssignRoleDto, RequirePermissions(), PermissionsGuard, prisma, prisma, RolesGuard

### Community 54 - "Community 54"
Cohesion: 0.16
Nodes (3): EmployeeProfileController, EmployeeProfileModule, EmployeeProfileService

### Community 55 - "Community 55"
Cohesion: 0.14
Nodes (4): JwtAuthGuard, WorkspaceController, WorkspaceModule, WorkspaceService

### Community 56 - "Community 56"
Cohesion: 0.19
Nodes (4): PermissionsController, PermissionsModule, PermissionsService, prisma

### Community 58 - "Community 58"
Cohesion: 0.13
Nodes (11): PRIORITY_BADGE, ProjectDetailPage(), TASK_STATUS_COLOR, AddLinkModal(), AddMemberModal(), Comment, ProjectComments(), ProjectCommentsProps (+3 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (11): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, moduleNameMapper, rootDir, testEnvironment, testRegex (+3 more)

### Community 65 - "Community 65"
Cohesion: 0.38
Nodes (5): AuthorizationModule, LeaveModule, RedisModule, RolesModule, TeamsModule

### Community 66 - "Community 66"
Cohesion: 0.47
Nodes (4): AssignPermissionsDto, CreateRoleDto, UpdateRoleDto, prisma

### Community 67 - "Community 67"
Cohesion: 0.23
Nodes (3): SuperAdminController, SuperAdminModule, SuperAdminService

### Community 68 - "Community 68"
Cohesion: 0.11
Nodes (13): DepartmentFormValues, DepartmentModal(), DepartmentModalProps, departmentSchema, DesignationFormValues, DesignationModal(), DesignationModalProps, designationSchema (+5 more)

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, start, type-check

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (5): DepartmentController, DepartmentModule, DepartmentService, CreateDepartmentDto, UpdateDepartmentDto

### Community 72 - "Community 72"
Cohesion: 0.15
Nodes (5): DesignationController, DesignationModule, DesignationService, CreateDesignationDto, UpdateDesignationDto

### Community 73 - "Community 73"
Cohesion: 0.22
Nodes (7): Credential, CREDENTIAL_TYPES, CredentialRow(), getTypeIcon(), getTypeLabel(), ProjectDocs(), ProjectDocsProps

### Community 74 - "Community 74"
Cohesion: 0.47
Nodes (3): SalaryController, SalaryModule, SalaryService

### Community 75 - "Community 75"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 77 - "Community 77"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 79 - "Community 79"
Cohesion: 0.33
Nodes (6): daysBetween(), ProjectTimeline(), ProjectTimelineProps, STATUS_BG, STATUS_COLORS, TimelineTask

### Community 80 - "Community 80"
Cohesion: 0.24
Nodes (5): ActivityLogsController, ActivityLogsModule, Roles(), PaginationDto, UpdateUserDto

### Community 82 - "Community 82"
Cohesion: 0.47
Nodes (3): DocumentsController, DocumentsModule, DocumentsService

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (6): STATUS_COLORS, STATUS_LABELS, StatusItem, TeamAnalytics(), TeamAnalyticsProps, WorkloadMember

### Community 84 - "Community 84"
Cohesion: 0.13
Nodes (16): ChangeRoleModal(), ChangeRoleModalProps, ChangeStatusModal(), ChangeStatusModalProps, ResetPasswordModal(), ResetPasswordModalProps, roleSchema, AddEmployeeModal() (+8 more)

### Community 85 - "Community 85"
Cohesion: 0.19
Nodes (14): AssignRoleDialogProps, PermissionGroup, PermissionMatrixProps, RoleDialogProps, RoleFormData, roleSchema, ViewEmployeeModalProps, ApplyLeaveDialogProps (+6 more)

### Community 86 - "Community 86"
Cohesion: 0.21
Nodes (3): SecurityController, SecurityModule, SecurityService

### Community 87 - "Community 87"
Cohesion: 0.25
Nodes (6): ACTION_COLORS, ACTION_ICONS, ACTION_LABELS, ActivityLog, TeamActivityFeed(), TeamActivityFeedProps

### Community 91 - "Community 91"
Cohesion: 0.14
Nodes (16): LeaveDetailSheet(), LeaveDetailSheetProps, statusConfig, LeaveHistoryProps, statusConfig, CreateProjectModal(), EditProjectModal(), PRIORITY_BADGE (+8 more)

### Community 92 - "Community 92"
Cohesion: 0.24
Nodes (12): AddLinkModalProps, AddMemberModalProps, CreateProjectModalProps, EditProjectModalProps, CreateTaskModalProps, EditTaskModalProps, DialogDescription, DialogFooter() (+4 more)

### Community 93 - "Community 93"
Cohesion: 0.20
Nodes (3): pino, LoggerModule, LoggerService

### Community 95 - "Community 95"
Cohesion: 0.15
Nodes (4): CurrentUser, NotificationsController, NotificationsModule, NotificationsService

### Community 96 - "Community 96"
Cohesion: 0.32
Nodes (3): Public(), HealthController, HealthModule

### Community 97 - "Community 97"
Cohesion: 0.14
Nodes (13): ROLE_BADGE, STATUS_BADGE, TABS, AddTeamMemberModal(), AddTeamMemberModalProps, TEAM_ROLES, AssignProjectModal(), AssignProjectModalProps (+5 more)

### Community 99 - "Community 99"
Cohesion: 0.21
Nodes (4): AuthModule, JwtRefreshStrategy, JwtStrategy, UsersModule

### Community 100 - "Community 100"
Cohesion: 0.30
Nodes (7): cn(), Avatar, AvatarFallback, AvatarImage, Loading(), LoadingProps, sizeMap

### Community 108 - "Community 108"
Cohesion: 0.50
Nodes (3): APP_CONSTANTS, LoginDto, RegisterDto

### Community 110 - "Community 110"
Cohesion: 0.29
Nodes (6): CalendarEvent, DAYS, DOT_COLORS, MONTHS, TeamCalendar(), TeamCalendarProps

### Community 112 - "Community 112"
Cohesion: 0.33
Nodes (5): BAR_COLORS, DONUT_COLORS, ProjectContributions(), ProjectContributionsProps, Task

### Community 113 - "Community 113"
Cohesion: 0.33
Nodes (5): COLUMN_CONFIG, KanbanTask, PRIORITY_BADGE, TeamKanban(), TeamKanbanProps

### Community 114 - "Community 114"
Cohesion: 0.40
Nodes (3): ProjectStats(), ProjectStatsProps, statCards

### Community 115 - "Community 115"
Cohesion: 0.40
Nodes (3): statCards, TeamStats(), TeamStatsProps

### Community 116 - "Community 116"
Cohesion: 0.67
Nodes (3): compression, helmet, bootstrap()

## Knowledge Gaps
- **472 isolated node(s):** `name`, `version`, `private`, `description`, `dev` (+467 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 7` to `Community 75`, `Community 116`, `Community 93`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `bootstrap()` connect `Community 116` to `Community 2`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `LoggerService` connect `Community 93` to `Community 2`, `Community 101`, `Community 108`, `Community 81`, `Community 50`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _472 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10793650793650794 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.09024390243902439 - nodes in this community are weakly interconnected._