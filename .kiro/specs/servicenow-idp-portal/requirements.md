# Requirements Document

## Introduction

This document defines the requirements for the **ServiceNow Internal Developer Portal (IDP)** — a scoped application (`x_146833_idpkiro`) built on the ServiceNow platform. The portal delivers a Port.io-style developer experience aligned with the ESC (Engineering Self-service Catalog) framework, using AWS Carbon Design System UI principles.

The IDP provides multi-persona access, platform governance, AI-assisted orchestration, and developer self-service capabilities. All navigation, catalog access, and security enforcement are metadata-driven and dynamically generated at runtime — no static role-to-menu mappings exist anywhere in the system.

The application is organized into seven functional modules:
1. Role Model & Access Control
2. ESC Portal Shell (AWS Carbon Theme)
3. Home Page
4. IDP Service Catalog Foundation
5. Capability-Driven Navigation Engine
6. AI Orchestration Layer (Future-Ready)
7. Observability & Platform Health Dashboard

---

## Glossary

- **IDP**: Internal Developer Portal — the scoped ServiceNow application (`x_146833_idpkiro`) described in this document.
- **ESC**: Engineering Self-service Catalog — the framework governing catalog structure and capability-driven access.
- **Scoped_App**: The ServiceNow scoped application with scope prefix `x_146833_idpkiro`.
- **Portal**: The ServiceNow Service Portal instance with URL suffix `idpkiro`.
- **RBAC**: Role-Based Access Control — the mechanism by which user roles determine access to portal features.
- **ACL**: Access Control List — a ServiceNow record-level security rule enforced server-side.
- **Capability**: A named, database-defined unit of access that maps roles to navigation items and catalog items.
- **Taxonomy**: A named grouping of navigation items used to organize the left navigation tree.
- **Navigation_Engine**: The `IDPNavigationEngine` Script Include that builds navigation trees dynamically from database tables.
- **Catalog_Engine**: The `IDPCatalogEngine` Script Include that filters catalog items based on user capabilities.
- **IDP_Security**: The `IDPSecurity` Script Include that enforces capability checks server-side.
- **Persona**: A named user archetype (e.g., Application Developer, Platform Engineer) mapped to one or more roles.
- **Application_Developer**: A persona representing engineers who build and deploy applications.
- **Platform_Engineer**: A persona representing engineers who build and maintain platform infrastructure.
- **SRE**: Site Reliability Engineer / Operations Engineer persona responsible for reliability and incident response.
- **Security_Engineer**: Security Engineer / Risk & Compliance Owner persona.
- **Product_Owner**: Product Owner / Engineering Manager persona.
- **Platform_Admin**: ServiceNow Platform Administrator persona with the highest privilege level.
- **Carbon_Theme**: The AWS Carbon Design System visual theme applied to the portal.
- **GlideAjax**: The ServiceNow client-side mechanism for calling Script Includes asynchronously.
- **Widget**: A ServiceNow Service Portal component that renders UI elements.
- **Script_Include**: A server-side JavaScript class in ServiceNow used for reusable business logic.
- **Cache**: The GlideCache or session-scoped storage used to store navigation trees with a TTL.
- **TTL**: Time-to-live — the duration (5–10 minutes) after which a cached navigation tree is invalidated.
- **Catalog_Item**: A ServiceNow `sc_cat_item` record representing a self-service request.
- **Lifecycle_Stage**: A metadata field on catalog items indicating the maturity stage (e.g., alpha, beta, GA).
- **Execution_Type**: A choice field on catalog items indicating how the item is fulfilled (workflow, API, or pipeline).
- **AI_Assistant**: The "Platform AI Assistant" portal component providing AI-driven recommendations and summaries.
- **MTTR**: Mean Time to Recover — a reliability metric tracked in the Observability Dashboard.

---

## Requirements

### Requirement 1: Role Model and Least-Privilege Access Control

**User Story:** As a Platform_Admin, I want each persona to have the minimum permissions required for their role, so that the principle of least privilege is enforced across all IDP modules.

#### Acceptance Criteria

1. THE Scoped_App SHALL define the following roles within the `x_146833_idpkiro` scope: `app_developer`, `platform_engineer`, `sre`, `security_engineer`, `product_owner`, and `platform_admin`.
2. THE Scoped_App SHALL define a role inheritance hierarchy where `platform_admin` includes all permissions of `platform_engineer`, `sre`, `security_engineer`, `product_owner`, and `app_developer`.
3. THE Scoped_App SHALL define a role inheritance hierarchy where `platform_engineer` includes all permissions of `app_developer`.
4. WHEN a user is assigned the `app_developer` role, THE Portal SHALL grant read access to application catalog items, CI/CD service items, and the developer home page, and SHALL deny write access to infrastructure and security catalog items.
5. WHEN a user is assigned the `platform_engineer` role, THE Portal SHALL grant read and write access to infrastructure catalog items and CI/CD service items, and SHALL deny access to security compliance reports.
6. WHEN a user is assigned the `sre` role, THE Portal SHALL grant full read access to the Observability Dashboard and incident management items, and SHALL deny write access to catalog item definitions.
7. WHEN a user is assigned the `security_engineer` role, THE Portal SHALL grant read and write access to security and compliance catalog items and audit logs, and SHALL deny access to CI/CD pipeline execution.
8. WHEN a user is assigned the `product_owner` role, THE Portal SHALL grant read access to deployment metrics, approval workflows, and service catalog summaries, and SHALL deny write access to infrastructure and security items.
9. WHEN a user is assigned the `platform_admin` role, THE Portal SHALL grant full read and write access to all IDP modules, tables, portal pages, and API endpoints within the `x_146833_idpkiro` scope.
10. THE Scoped_App SHALL define ACLs on all scoped tables (`u_idp_capability`, `u_role_capability_map`, `u_idp_taxonomy`, `u_capability_taxonomy_map`, `u_idp_navigation_item`, `u_catalog_capability_map`, `u_idp_service_catalog_meta`, `u_user_persona_override`) such that read access requires at minimum the `x_146833_idpkiro.user` role.
11. THE Scoped_App SHALL define ACLs on all scoped tables such that write access requires at minimum the `x_146833_idpkiro.platform_admin` role.
12. THE Scoped_App SHALL define ACLs on all IDP portal pages such that unauthenticated users are redirected to the ServiceNow login page.
13. IF a user attempts to access a portal page or API endpoint for which they lack the required capability, THEN THE Portal SHALL return an HTTP 403 response and display an "Access Denied" message.
14. THE Scoped_App SHALL support multi-app consumption by exposing roles that can be granted by other scoped applications without requiring modifications to the IDP scoped app.

---

### Requirement 2: ESC Portal Shell with AWS Carbon Theme

**User Story:** As an Application_Developer, I want a visually consistent portal shell styled with the AWS Carbon Design System, so that I have a familiar and accessible developer experience.

#### Acceptance Criteria

1. THE Portal SHALL be accessible at the URL suffix `idpkiro` on the ServiceNow instance.
2. THE Portal SHALL apply the Carbon_Theme to all portal pages, including typography, color tokens, spacing, and component styles consistent with the AWS Carbon Design System.
3. THE Portal SHALL render a top navigation bar that displays the IDP application name, a global search bar, a notifications panel icon, and the authenticated user's avatar with a persona-switcher dropdown.
4. WHEN a user's role changes, THE Portal SHALL update the top navigation bar persona indicator within one page refresh cycle.
5. THE Portal SHALL render a left collapsible navigation panel that displays service category groupings derived from the `u_idp_taxonomy` table.
6. WHEN the left navigation panel is collapsed, THE Portal SHALL display only taxonomy icons and SHALL preserve the collapsed state across page navigations within the same session.
7. THE Portal SHALL render a global search bar that accepts free-text input and returns results from catalog items, navigation items, and knowledge articles scoped to the IDP.
8. WHEN a search query is submitted, THE Portal SHALL return results within 3 seconds for datasets up to 10,000 indexed records.
9. THE Portal SHALL render a notifications panel that displays CI/CD pipeline events, approval requests, and active incidents relevant to the authenticated user.
10. WHEN a new notification arrives, THE Portal SHALL increment the notification badge count on the notifications panel icon without requiring a full page reload.
11. THE Portal SHALL apply persona-aware landing behavior such that each role is directed to its designated home page section upon login, as defined in the `u_role_capability_map` table.
12. THE Portal SHALL meet WCAG 2.1 Level AA accessibility standards for all shell components.

---

### Requirement 3: Home Page

**User Story:** As any authenticated user, I want a personalized home page that surfaces relevant actions, insights, and tools for my role, so that I can quickly access what I need without navigating multiple menus.

#### Acceptance Criteria

1. THE Portal SHALL render a hero section on the home page (`idp_kiro_home`) that displays a dynamic welcome message including the authenticated user's display name.
2. THE Portal SHALL render quick action buttons in the hero section whose labels and target URLs are driven by the user's capabilities as resolved by the Navigation_Engine.
3. THE Portal SHALL render persona tiles on the home page whose visibility is controlled by the user's assigned roles, with each tile linking to the primary capability area for that persona.
4. WHEN a user's role assignment changes, THE Portal SHALL update the visible persona tiles on the home page upon the next page load.
5. THE Portal SHALL render an insights panel on the home page that displays the following metrics: total deployments in the last 24 hours, count of active incidents, count of pending approvals, and count of open security findings.
6. WHEN the insights panel data source is unavailable, THE Portal SHALL display the last successfully cached metric values and indicate the data staleness with a timestamp.
7. THE Portal SHALL render an AI Assistant widget placeholder labeled "Ask Platform AI" that accepts free-text input and is wired to the `/ai/ask` API endpoint defined in the AI Orchestration Layer.
8. THE Portal SHALL render a quick links section on the home page whose links are sourced from the `u_idp_navigation_item` table filtered by a `quick_link` flag, ensuring no hardcoded URLs exist in the widget template.

---

### Requirement 4: IDP Service Catalog Foundation

**User Story:** As an Application_Developer, I want to browse and request services from a structured catalog organized by category, so that I can self-serve infrastructure, CI/CD, and security capabilities without raising manual tickets.

#### Acceptance Criteria

1. THE Catalog_Engine SHALL organize catalog items into the following top-level categories: Application Services, Infrastructure Services, CI/CD Services, Security & Compliance Services, and Observability Services.
2. THE Scoped_App SHALL extend the `sc_cat_item` table with the following fields: `u_required_capabilities` (list), `u_taxonomy` (reference to `u_idp_taxonomy`), `u_owner_group` (reference to `sys_user_group`), `u_execution_type` (choice: workflow, api, pipeline), and `u_execution_endpoint` (string).
3. THE Scoped_App SHALL create the `u_idp_service_catalog_meta` table with fields: `name`, `catalog_item` (reference to `sc_cat_item`), `owning_team` (reference to `sys_user_group`), `lifecycle_stage` (choice: alpha, beta, ga, deprecated), `version` (string), `tags` (string), and `active` (boolean).
4. THE Scoped_App SHALL create the `u_catalog_capability_map` table with fields: `catalog_item` (reference to `sc_cat_item`) and `capability` (reference to `u_idp_capability`).
5. WHEN a catalog item has one or more entries in `u_catalog_capability_map`, THE Catalog_Engine SHALL only display that item to users who possess at least one of the mapped capabilities.
6. WHEN a catalog item has no entries in `u_catalog_capability_map`, THE Catalog_Engine SHALL display that item to all authenticated users with the `x_146833_idpkiro.user` role.
7. THE Scoped_App SHALL define base catalog item templates for each of the five catalog categories, each template including: a description, an owner group reference, an approval workflow hook, an SLA definition, and at least one tag.
8. WHEN a user submits a catalog item request, THE Portal SHALL trigger the approval workflow defined on the catalog item's `u_owner_group` if an approval workflow is configured.
9. IF a catalog item's `u_execution_type` is `api` or `pipeline`, THEN THE Catalog_Engine SHALL invoke the URL specified in `u_execution_endpoint` upon request approval.
10. THE Catalog_Engine SHALL expose the `getUserCapabilities(userId)`, `getAvailableCatalogItems(userId)`, `filterCatalogForPortal(userId)`, and `canUserExecute(catalogItem, userId)` methods as a Script_Include named `IDPCatalogEngine`.

---

### Requirement 5: Capability-Driven Navigation Engine

**User Story:** As a Platform_Admin, I want all portal navigation to be generated dynamically from database tables at runtime, so that adding or removing navigation items requires no code changes.

#### Acceptance Criteria

1. THE Scoped_App SHALL create the `u_idp_capability` table with fields: `capability_id` (string, unique), `name` (string), `description` (string), `icon` (string), and `active` (boolean).
2. THE Scoped_App SHALL create the `u_role_capability_map` table with fields: `role` (reference to `sys_user_role`) and `capability` (reference to `u_idp_capability`).
3. THE Scoped_App SHALL create the `u_idp_taxonomy` table with fields: `name` (string), `order` (integer), `icon` (string), and `active` (boolean).
4. THE Scoped_App SHALL create the `u_capability_taxonomy_map` table with fields: `capability` (reference to `u_idp_capability`) and `taxonomy` (reference to `u_idp_taxonomy`).
5. THE Scoped_App SHALL create the `u_idp_navigation_item` table with fields: `name` (string), `label` (string), `url` (string), `icon` (string), `taxonomy` (reference to `u_idp_taxonomy`), `required_capabilities` (list, reference to `u_idp_capability`), `order` (integer), and `active` (boolean).
6. THE Navigation_Engine SHALL expose the following methods in a Script_Include named `IDPNavigationEngine`: `getUserRoles(userId)`, `getCapabilities(roles)`, `getTaxonomy(capabilities)`, `getNavigationItems(capabilities)`, `buildNavigationTree(items)`, and `getNavigation(userId)`.
7. WHEN `getNavigation(userId)` is called, THE Navigation_Engine SHALL execute the following sequence: resolve user roles via `getUserRoles`, resolve capabilities via `getCapabilities`, resolve taxonomy groupings via `getTaxonomy`, resolve navigation items via `getNavigationItems`, and assemble the tree via `buildNavigationTree`.
8. WHEN `getNavigation(userId)` is called and a valid cache entry with key `idp_nav_<user_sys_id>` exists and has not exceeded its TTL, THE Navigation_Engine SHALL return the cached navigation tree without querying the database.
9. WHEN `getNavigation(userId)` is called and no valid cache entry exists, THE Navigation_Engine SHALL query the database, build the navigation tree, store the result in cache with key `idp_nav_<user_sys_id>` and a TTL between 5 and 10 minutes, and return the tree.
10. WHEN a user's role assignment is modified, THE Navigation_Engine SHALL invalidate the cache entry `idp_nav_<user_sys_id>` for that user so that the next call to `getNavigation` reflects the updated roles.
11. THE Scoped_App SHALL create a Widget named `idp_dynamic_navigation` that calls `IDPNavigationEngine.getNavigation` via GlideAjax and renders the returned navigation tree as the left navigation panel.
12. WHEN a new `u_idp_navigation_item` record is created with `active` set to true, THE Portal SHALL display the new item in the navigation for all users who possess the required capabilities upon their next navigation load, without any code deployment.
13. WHEN a `u_idp_navigation_item` record's `active` field is set to false, THE Portal SHALL remove the item from the navigation for all users upon their next navigation load, without any code deployment.
14. THE Scoped_App SHALL create the `u_user_persona_override` table with fields: `user` (reference to `sys_user`) and `active_roles` (list, reference to `sys_user_role`).
15. WHEN a user has an active record in `u_user_persona_override`, THE Navigation_Engine SHALL use the roles listed in `active_roles` instead of the user's system-assigned roles when building the navigation tree.
16. THE IDP_Security Script_Include SHALL expose a `hasCapability(capabilityId)` method that returns true if and only if the currently authenticated user possesses the specified capability, as determined by querying `u_role_capability_map`.
17. IF a user navigates directly to a portal page URL for which they lack the required capability, THEN THE Portal SHALL deny access via ACL enforcement and SHALL NOT rely solely on UI-level filtering to restrict access.

---

### Requirement 6: AI Orchestration Layer (Future-Ready)

**User Story:** As an Application_Developer, I want an AI assistant available in the portal that can answer platform questions and provide recommendations, so that I can resolve issues faster without escalating to the platform team.

#### Acceptance Criteria

1. THE Portal SHALL render a "Platform AI Assistant" widget on the home page and as a persistent floating component accessible from all portal pages.
2. THE Scoped_App SHALL define an API abstraction layer with the following endpoints within the `x_146833_idpkiro` scope: `/ai/ask` (accepts a free-text question and returns a text response), `/ai/recommend` (accepts a context object and returns a list of recommended catalog items or actions), and `/ai/summarize` (accepts a record reference and returns a text summary).
3. WHEN an incident record is created in ServiceNow, THE AI Orchestration Layer SHALL trigger an event hook that calls `/ai/summarize` with the incident reference and stores the resulting summary on the incident record.
4. WHEN a CI/CD pipeline deployment failure event is received, THE AI Orchestration Layer SHALL trigger an event hook that calls `/ai/recommend` with the failure context and stores the root cause suggestion on the associated change or deployment record.
5. IF the AI backend service is unavailable, THEN THE AI Orchestration Layer SHALL return a graceful degradation response indicating the service is temporarily unavailable, without throwing an unhandled exception.
6. THE AI Orchestration Layer SHALL be implemented as a set of placeholder Script_Includes and REST API endpoints that can be connected to an external AI provider without modifying the portal widget or navigation code.

---

### Requirement 7: Observability and Platform Health Dashboard

**User Story:** As an SRE, I want a real-time platform health dashboard that shows deployment success rates, active incidents, MTTR, and service availability, so that I can monitor platform health and respond to issues proactively.

#### Acceptance Criteria

1. THE Portal SHALL render an Observability Dashboard page accessible to users with the `sre`, `platform_engineer`, or `platform_admin` role.
2. THE Portal SHALL display the following real-time status tiles on the Observability Dashboard: deployment success rate (percentage), count of active incidents by severity, MTTR (hours), and service availability percentage per monitored service.
3. WHEN the Observability Dashboard is loaded, THE Portal SHALL refresh status tile data at an interval not exceeding 60 seconds without requiring a full page reload.
4. THE Portal SHALL display trend graphs on the Observability Dashboard showing deployment success rate and incident count over the trailing 7-day and 30-day periods.
5. THE Portal SHALL display a service dependency map placeholder on the Observability Dashboard that renders a static topology diagram and is designed to accept dynamic data from a future integration.
6. WHEN a user with the `sre` or `platform_admin` role views the Observability Dashboard, THE Portal SHALL display all status tiles, trend graphs, and the service dependency map.
7. WHEN a user with the `app_developer` role views the Observability Dashboard, THE Portal SHALL display only the status tiles for services owned by teams the user belongs to, and SHALL NOT display the service dependency map or MTTR metrics.
8. WHEN a user with the `product_owner` role views the Observability Dashboard, THE Portal SHALL display only the deployment success rate tile and the 30-day trend graph, and SHALL NOT display incident severity details or MTTR.
9. IF a monitored service's availability drops below 99.5%, THEN THE Portal SHALL highlight the corresponding status tile in a warning state using the Carbon_Theme warning color token.
10. IF a monitored service's availability drops below 95%, THEN THE Portal SHALL highlight the corresponding status tile in a critical state using the Carbon_Theme danger color token and SHALL trigger a notification to users with the `sre` role.

---

### Requirement 8: Metadata-Driven Architecture Invariants

**User Story:** As a Platform_Admin, I want the IDP architecture to enforce that all navigation, catalog access, and security decisions are driven exclusively from database metadata, so that the system remains extensible without code changes.

#### Acceptance Criteria

1. THE Scoped_App SHALL contain no hardcoded navigation menu items in any Widget, Script_Include, UI Page, or portal configuration record.
2. THE Scoped_App SHALL contain no hardcoded role-to-menu mappings in any Widget, Script_Include, UI Page, or portal configuration record.
3. WHEN a new `u_idp_taxonomy` record is created with `active` set to true, THE Portal SHALL display the new taxonomy grouping in the left navigation panel for all users whose capabilities map to that taxonomy, without any code deployment.
4. WHEN a new `u_idp_capability` record is created and mapped to a role via `u_role_capability_map`, THE Portal SHALL grant access to all navigation items and catalog items requiring that capability to users with the mapped role, without any code deployment.
5. THE IDP_Security Script_Include SHALL be the sole enforcement point for capability checks in all server-side business logic, ensuring that UI-level filtering is never the only access control mechanism.
6. WHEN a capability mapping is removed from `u_role_capability_map`, THE Portal SHALL deny access to all navigation items and catalog items requiring that capability to the affected role upon the next navigation load, without any code deployment.
7. THE Navigation_Engine SHALL produce identical navigation trees for two users with identical role assignments, regardless of the order in which their roles were assigned (confluence property).
8. WHEN `getNavigation(userId)` is called twice consecutively for the same user without any role or capability changes between calls, THE Navigation_Engine SHALL return the same navigation tree both times (idempotence property).
