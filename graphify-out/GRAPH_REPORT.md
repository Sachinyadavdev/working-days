# Graph Report - working-days  (2026-05-22)

## Corpus Check
- 132 files · ~15,194 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 742 nodes · 994 edges · 46 communities (39 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e17cfa08`
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 22 edges
2. `PaginationDto` - 20 edges
3. `scripts` - 19 edges
4. `PrismaService` - 17 edges
5. `compilerOptions` - 17 edges
6. `RedisService` - 15 edges
7. `LoggerService` - 14 edges
8. `compilerOptions` - 14 edges
9. `compilerOptions` - 14 edges
10. `cn()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  apps/web/src/lib/utils.ts → apps/web/package.json
- `bootstrap()` --calls--> `compression`  [INFERRED]
  apps/api/src/main.ts → apps/api/package.json
- `bootstrap()` --calls--> `helmet`  [INFERRED]
  apps/api/src/main.ts → apps/api/package.json
- `LoginPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(auth)/login/page.tsx → apps/web/src/stores/auth.store.ts
- `RegisterPage()` --calls--> `useAuthStore`  [EXTRACTED]
  apps/web/src/app/(auth)/register/page.tsx → apps/web/src/stores/auth.store.ts

## Communities (46 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (14): AttendanceController, AttendanceModule, AttendanceService, PrismaService, CurrentUser, Roles(), CheckInDto, CreateLeaveRequestDto (+6 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (11): AuthController, AuthService, APP_CONSTANTS, Public(), LoginDto, RegisterDto, PermissionsGuard, HealthController (+3 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (11): GlobalExceptionFilter, LoggingInterceptor, TransformedResponse, TransformInterceptor, LoggerModule, LoggerService, NotificationsController, NotificationsGateway (+3 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (36): devDependencies, @ems/eslint-config, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prisma, rimraf (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (11): ActivityLogsController, ActivityLogsModule, AuthModule, DatabaseModule, JwtAuthGuard, RolesGuard, JwtRefreshStrategy, JwtStrategy (+3 more)

### Community 5 - "Community 5"
Cohesion: 0.13
Nodes (20): DashboardLayout(), AppSidebar(), navigation, Header(), apiClient, authStore, cn(), LoginPage() (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (32): description, devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, prettier, rimraf (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (32): dependencies, bcrypt, class-transformer, class-validator, compression, cookie-parser, @ems/shared-types, @ems/shared-utils (+24 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (26): CorrelationIdMiddleware, dependencies, axios, class-variance-authority, clsx, @ems/shared-types, @ems/shared-utils, framer-motion (+18 more)

### Community 9 - "Community 9"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+17 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (22): ActivityLogEntity, AttendanceEntity, BaseEntity, EmployeeEntity, LeaveRequestEntity, NotificationEntity, PermissionEntity, ProjectEntity (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (22): devDependencies, @ems/eslint-config, eslint, eslint-config-next, postcss, rimraf, tailwindcss, @tailwindcss/postcss (+14 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (5): CreateProjectDto, UpdateProjectDto, ProjectsController, ProjectsModule, ProjectsService

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (21): dependsOn, outputs, cache, cache, persistent, globalDependencies, dependsOn, cache (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (4): CreateTaskDto, UpdateTaskDto, TasksController, TasksService

### Community 15 - "Community 15"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 16 - "Community 16"
Cohesion: 0.16
Nodes (5): CreateEmployeeDto, UpdateEmployeeDto, EmployeesController, EmployeesModule, EmployeesService

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

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (10): dependencies, eslint, eslint-config-prettier, eslint-plugin-import, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, main, name (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): collection, compilerOptions, assets, deleteOutDir, plugins, watchAssets, $schema, sourceRoot

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

## Knowledge Gaps
- **323 isolated node(s):** `name`, `version`, `private`, `description`, `dev` (+318 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 7` to `Community 3`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **Why does `LoggerService` connect `Community 2` to `Community 0`, `Community 1`, `Community 7`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `bootstrap()` connect `Community 7` to `Community 2`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _323 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05959183673469388 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.058693244739756366 - nodes in this community are weakly interconnected._