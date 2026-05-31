# Graph Report - working-days  (2026-05-31)

## Corpus Check
- 272 files · ~72,239 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1409 nodes · 2512 edges · 103 communities (71 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5d302aff`
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
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]

## God Nodes (most connected - your core abstractions)
1. `apiClient` - 42 edges
2. `Button` - 34 edges
3. `useAuthStore` - 28 edges
4. `PrismaService` - 26 edges
5. `DialogHeader()` - 26 edges
6. `TeamsService` - 25 edges
7. `DialogContent` - 25 edges
8. `DialogTitle` - 25 edges
9. `TeamsController` - 24 edges
10. `cn()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  apps/web/src/lib/utils.ts → apps/web/package.json
- `ViewEmployeeModal()` --calls--> `formatDate()`  [INFERRED]
  apps/web/src/components/employees/view-employee-modal.tsx → packages/shared-utils/src/index.ts
- `AttendancePage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/attendance/page.tsx → apps/web/src/stores/auth.store.ts
- `EmployeeDirectoryPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/employees/page.tsx → apps/web/src/stores/auth.store.ts
- `ProjectsPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/projects/page.tsx → apps/web/src/stores/auth.store.ts

## Communities (103 total, 32 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (10): AdminCreateEmployeeDto, AdminUpdateEmployeeDto, ChangeRoleDto, ChangeStatusDto, ResetPasswordDto, CreateEmployeeDto, UpdateEmployeeDto, EmployeesController (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (3): UpdateUserDto, UsersController, UsersService

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (5): GlobalExceptionFilter, LoggingInterceptor, TransformedResponse, TransformInterceptor, AppModule

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (23): devDependencies, @ems/eslint-config, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, rimraf (+15 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (5): CreateLeaveRequestDto, UpdateLeaveStatusDto, LeaveController, LeaveModule, LeaveService

### Community 5 - "Community 5"
Cohesion: 0.23
Nodes (13): DashboardLayout(), adminNavigation, AppSidebar(), employeeNavigation, navigation, HeaderAttendance(), Header(), cn() (+5 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (32): description, devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (34): dependencies, bcrypt, class-transformer, class-validator, compression, cookie-parser, @ems/shared-types, @ems/shared-utils (+26 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (27): dependencies, axios, class-variance-authority, clsx, @ems/shared-types, @ems/shared-utils, framer-motion, @hookform/resolvers (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.09
Nodes (31): ActivityLogEntity, AttendanceBreakEntity, AttendanceCorrectionEntity, AttendanceEntity, BaseEntity, EmployeeEntity, LeaveRequestEntity, NotificationEntity (+23 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (12): devDependencies, @ems/eslint-config, eslint, eslint-config-next, postcss, rimraf, tailwindcss, @tailwindcss/postcss (+4 more)

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (4): RequirePermission(), RequirePermissionProps, AssignRoleDialog(), User

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
Cohesion: 0.42
Nodes (5): AddMemberDto, CreateCommentDto, CreateProjectDto, FilterProjectsDto, UpdateProjectDto

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

### Community 48 - "Community 48"
Cohesion: 0.20
Nodes (5): ACTION_COLORS, ACTION_ICONS, ActivityLog, ProjectActivityFeed(), ProjectActivityFeedProps

### Community 49 - "Community 49"
Cohesion: 0.17
Nodes (9): PermissionMatrix(), RoleDialog(), Role, Card, CardContent, CardDescription, CardFooter, CardHeader (+1 more)

### Community 50 - "Community 50"
Cohesion: 0.26
Nodes (3): UpdateSettingDto, SettingsModule, SettingsService

### Community 51 - "Community 51"
Cohesion: 0.10
Nodes (14): PRIORITY_BADGE, TASK_STATUS_COLOR, AddLinkModal(), AddMemberModal(), BAR_COLORS, DONUT_COLORS, ProjectContributions(), ProjectContributionsProps (+6 more)

### Community 52 - "Community 52"
Cohesion: 0.16
Nodes (5): AssignRoleDto, AuthorizationController, RequirePermissions(), PermissionsGuard, prisma

### Community 54 - "Community 54"
Cohesion: 0.16
Nodes (3): EmployeeProfileController, EmployeeProfileModule, EmployeeProfileService

### Community 55 - "Community 55"
Cohesion: 0.17
Nodes (4): CurrentUser, WorkspaceController, WorkspaceModule, WorkspaceService

### Community 56 - "Community 56"
Cohesion: 0.16
Nodes (5): JwtAuthGuard, PermissionsController, PermissionsModule, PermissionsService, prisma

### Community 58 - "Community 58"
Cohesion: 0.18
Nodes (11): RequireRole(), RequireRoleProps, ProjectDetailPage(), LoginPage(), Comment, ProjectComments(), ProjectCommentsProps, RegisterPage() (+3 more)

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (11): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, moduleNameMapper, rootDir, testEnvironment, testRegex (+3 more)

### Community 65 - "Community 65"
Cohesion: 0.25
Nodes (7): ActivityLogsModule, AuthorizationModule, NotificationsModule, ProjectsModule, RedisModule, RolesModule, TeamsModule

### Community 66 - "Community 66"
Cohesion: 0.47
Nodes (4): AssignPermissionsDto, CreateRoleDto, UpdateRoleDto, prisma

### Community 67 - "Community 67"
Cohesion: 0.20
Nodes (4): Roles(), SuperAdminController, SuperAdminModule, SuperAdminService

### Community 68 - "Community 68"
Cohesion: 0.05
Nodes (80): attendanceApi, CheckInDto, CorrectionRequestDto, StartBreakDto, AllEmployeesHours(), AttendanceCalendar(), AttendanceStats(), CheckInWidget() (+72 more)

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, start, type-check

### Community 71 - "Community 71"
Cohesion: 0.26
Nodes (4): DepartmentModule, DepartmentService, CreateDepartmentDto, UpdateDepartmentDto

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
Cohesion: 0.18
Nodes (3): ActivityLogsController, PaginationDto, NotificationsService

### Community 82 - "Community 82"
Cohesion: 0.47
Nodes (3): DocumentsController, DocumentsModule, DocumentsService

### Community 83 - "Community 83"
Cohesion: 0.29
Nodes (6): STATUS_COLORS, STATUS_LABELS, StatusItem, TeamAnalytics(), TeamAnalyticsProps, WorkloadMember

### Community 84 - "Community 84"
Cohesion: 0.20
Nodes (9): AddEmployeeModal(), EditEmployeeModal(), EmployeeDirectoryPage(), CreateTaskModal(), EditTaskModal(), TasksPage(), ViewTaskModal(), DataTable() (+1 more)

### Community 85 - "Community 85"
Cohesion: 0.32
Nodes (7): AddTeamMemberDto, AssignProjectDto, CreateTeamDto, FilterTeamsDto, TransferMemberDto, UpdateMemberRoleDto, UpdateTeamDto

### Community 86 - "Community 86"
Cohesion: 0.06
Nodes (12): AuthController, AuthModule, AuthService, APP_CONSTANTS, LoginDto, RegisterDto, SecurityController, SecurityModule (+4 more)

### Community 87 - "Community 87"
Cohesion: 0.08
Nodes (22): ROLE_BADGE, STATUS_BADGE, TABS, AddTeamMemberModal(), AssignProjectModal(), ACTION_COLORS, ACTION_ICONS, ACTION_LABELS (+14 more)

### Community 91 - "Community 91"
Cohesion: 0.20
Nodes (8): CreateProjectModal(), EditProjectModal(), PRIORITY_BADGE, ProjectsPage(), STATUS_BADGE, ProjectStats(), ProjectStatsProps, statCards

### Community 96 - "Community 96"
Cohesion: 0.32
Nodes (3): Public(), HealthController, HealthModule

## Knowledge Gaps
- **451 isolated node(s):** `name`, `version`, `private`, `description`, `dev` (+446 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 7` to `Community 75`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `bootstrap()` connect `Community 7` to `Community 2`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 3` to `Community 75`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _451 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10793650793650794 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Community 6` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._