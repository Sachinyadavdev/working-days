# Graph Report - working-days  (2026-05-26)

## Corpus Check
- 234 files · ~46,533 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1169 nodes · 1991 edges · 80 communities (64 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4e73772`
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

## God Nodes (most connected - your core abstractions)
1. `apiClient` - 30 edges
2. `PrismaService` - 24 edges
3. `compilerOptions` - 22 edges
4. `useAuthStore` - 22 edges
5. `PaginationDto` - 21 edges
6. `cn()` - 21 edges
7. `scripts` - 19 edges
8. `Button` - 19 edges
9. `ProjectsService` - 18 edges
10. `RedisService` - 18 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  apps/web/src/lib/utils.ts → apps/web/package.json
- `ViewEmployeeModal()` --calls--> `formatDate()`  [INFERRED]
  apps/web/src/components/employees/view-employee-modal.tsx → packages/shared-utils/src/index.ts
- `EmployeeDirectoryPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/employees/page.tsx → apps/web/src/stores/auth.store.ts
- `ProjectsPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(dashboard)/projects/page.tsx → apps/web/src/stores/auth.store.ts
- `bootstrap()` --calls--> `compression`  [INFERRED]
  apps/api/src/main.ts → apps/api/package.json

## Communities (80 total, 16 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.11
Nodes (10): AdminCreateEmployeeDto, AdminUpdateEmployeeDto, ChangeRoleDto, ChangeStatusDto, ResetPasswordDto, CreateEmployeeDto, UpdateEmployeeDto, EmployeesController (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (8): AuthController, AuthService, APP_CONSTANTS, LoginDto, RegisterDto, SecurityController, SecurityModule, SecurityService

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (11): GlobalExceptionFilter, LoggingInterceptor, TransformedResponse, TransformInterceptor, LoggerModule, LoggerService, NotificationsController, NotificationsGateway (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (22): devDependencies, @ems/eslint-config, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, rimraf (+14 more)

### Community 4 - "Community 4"
Cohesion: 0.18
Nodes (5): CreateLeaveRequestDto, UpdateLeaveStatusDto, LeaveController, LeaveModule, LeaveService

### Community 5 - "Community 5"
Cohesion: 0.32
Nodes (8): DashboardLayout(), adminNavigation, AppSidebar(), employeeNavigation, navigation, Header(), SidebarState, useSidebarStore

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (32): description, devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): dependencies, bcrypt, class-transformer, class-validator, compression, cookie-parser, @ems/shared-types, @ems/shared-utils (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (25): dependencies, axios, class-variance-authority, clsx, @ems/shared-types, @ems/shared-utils, framer-motion, @hookform/resolvers (+17 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (22): ActivityLogEntity, AttendanceEntity, BaseEntity, EmployeeEntity, LeaveRequestEntity, NotificationEntity, PermissionEntity, ProjectEntity (+14 more)

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
Cohesion: 0.15
Nodes (5): CreateTaskDto, UpdateTaskDto, TasksController, TasksModule, TasksService

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.39
Nodes (5): AddMemberDto, CreateProjectDto, FilterProjectsDto, UpdateProjectDto, ProjectsModule

### Community 17 - "Community 17"
Cohesion: 0.16
Nodes (5): CreateTeamDto, UpdateTeamDto, TeamsController, TeamsModule, TeamsService

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
Cohesion: 0.15
Nodes (3): UpdateUserDto, UsersController, UsersService

### Community 48 - "Community 48"
Cohesion: 0.10
Nodes (14): PRIORITY_BADGE, STATUS_BADGE, TASK_STATUS_COLOR, AddMemberModal(), ACTION_COLORS, ACTION_ICONS, ActivityLog, ProjectActivityFeed() (+6 more)

### Community 49 - "Community 49"
Cohesion: 0.23
Nodes (5): Card, CardContent, CardFooter, CardHeader, CardTitle

### Community 50 - "Community 50"
Cohesion: 0.09
Nodes (8): Roles(), UpdateSettingDto, SettingsController, SettingsModule, SettingsService, SuperAdminController, SuperAdminModule, SuperAdminService

### Community 51 - "Community 51"
Cohesion: 0.18
Nodes (12): RequireRole(), RequireRoleProps, ProjectDetailPage(), LoginPage(), RegisterPage(), AuthState, useAuthStore, User (+4 more)

### Community 52 - "Community 52"
Cohesion: 0.16
Nodes (5): AssignRoleDto, AuthorizationController, RequirePermissions(), PermissionsGuard, prisma

### Community 53 - "Community 53"
Cohesion: 0.16
Nodes (5): AttendanceController, AttendanceModule, AttendanceService, CurrentUser, CheckInDto

### Community 54 - "Community 54"
Cohesion: 0.16
Nodes (3): EmployeeProfileController, EmployeeProfileModule, EmployeeProfileService

### Community 55 - "Community 55"
Cohesion: 0.19
Nodes (3): WorkspaceController, WorkspaceModule, WorkspaceService

### Community 56 - "Community 56"
Cohesion: 0.22
Nodes (4): PermissionsController, PermissionsModule, PermissionsService, prisma

### Community 59 - "Community 59"
Cohesion: 0.18
Nodes (11): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, moduleNameMapper, rootDir, testEnvironment, testRegex (+3 more)

### Community 65 - "Community 65"
Cohesion: 0.28
Nodes (6): AuthorizationModule, DocumentsController, DocumentsModule, DocumentsService, RedisModule, RolesModule

### Community 66 - "Community 66"
Cohesion: 0.47
Nodes (4): AssignPermissionsDto, CreateRoleDto, UpdateRoleDto, prisma

### Community 67 - "Community 67"
Cohesion: 0.29
Nodes (3): ActivityLogsController, ActivityLogsModule, PaginationDto

### Community 68 - "Community 68"
Cohesion: 0.05
Nodes (71): AssignRoleDialogProps, DepartmentFormValues, DepartmentModal(), DepartmentModalProps, departmentSchema, DesignationFormValues, DesignationModal(), DesignationModalProps (+63 more)

### Community 69 - "Community 69"
Cohesion: 0.29
Nodes (7): scripts, build, clean, dev, lint, start, type-check

### Community 70 - "Community 70"
Cohesion: 0.12
Nodes (7): AuthModule, JwtAuthGuard, prisma, RolesGuard, JwtRefreshStrategy, JwtStrategy, UsersModule

### Community 71 - "Community 71"
Cohesion: 0.15
Nodes (5): DepartmentController, DepartmentModule, DepartmentService, CreateDepartmentDto, UpdateDepartmentDto

### Community 72 - "Community 72"
Cohesion: 0.15
Nodes (5): DesignationController, DesignationModule, DesignationService, CreateDesignationDto, UpdateDesignationDto

### Community 73 - "Community 73"
Cohesion: 0.32
Nodes (3): Public(), HealthController, HealthModule

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

## Knowledge Gaps
- **396 isolated node(s):** `name`, `version`, `private`, `description`, `dev` (+391 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 7` to `Community 75`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `bootstrap()` connect `Community 7` to `Community 2`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `LoggerService` connect `Community 2` to `Community 1`, `Community 58`, `Community 50`, `Community 7`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _396 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.10793650793650794 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06951219512195123 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.058693244739756366 - nodes in this community are weakly interconnected._