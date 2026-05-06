# Implementation Plan: ServiceNow Internal Developer Portal (IDP)

## Overview

Each task produces one or more ServiceNow update set XML files in `593e88fbc3e88750f6ebf8ddd4013112/update/`. All files use `INSERT_OR_UPDATE` actions and are scoped to `x_146833_idpkiro` (sys_package `593e88fbc3e88750f6ebf8ddd4013112`). Use realistic 32-character hex sys_ids for every new record. Server-side logic is ServiceNow GlideScript (Rhino ES5); widget client scripts are AngularJS 1.x.

---

## Tasks

- [x] 1. Create role XML update set files
  - [x] 1.1 Create `sys_user_role_<sys_id>.xml` for `x_146833_idpkiro.app_developer`
    - Fields: `name`, `suffix`, `description`, `can_delegate=true`, `grantable=true`, `includes_roles` (empty), `sys_package`, `sys_scope`
    - Pattern: mirror existing `sys_user_role_a13e88fbc3e88750f6ebf8ddd4013133.xml` structure
    - _Requirements: 1.1, 1.4_
  - [x] 1.2 Create `sys_user_role_<sys_id>.xml` for `x_146833_idpkiro.platform_engineer`
    - `includes_roles` must reference the `app_developer` role sys_id (role inheritance per Req 1.3)
    - _Requirements: 1.1, 1.3, 1.5_
  - [x] 1.3 Create `sys_user_role_<sys_id>.xml` for `x_146833_idpkiro.sre`
    - `includes_roles` empty; standalone role
    - _Requirements: 1.1, 1.6_
  - [x] 1.4 Create `sys_user_role_<sys_id>.xml` for `x_146833_idpkiro.security_engineer`
    - `includes_roles` empty; standalone role
    - _Requirements: 1.1, 1.7_
  - [x] 1.5 Create `sys_user_role_<sys_id>.xml` for `x_146833_idpkiro.product_owner`
    - `includes_roles` empty; standalone role
    - _Requirements: 1.1, 1.8_
  - [x] 1.6 Create `sys_user_role_<sys_id>.xml` for `x_146833_idpkiro.platform_admin`
    - `includes_roles` must reference sys_ids of all five other IDP roles (app_developer, platform_engineer, sre, security_engineer, product_owner) — comma-separated
    - _Requirements: 1.1, 1.2, 1.9_

- [x] 2. Create table definition XML files (sys_dictionary records)
  - [x] 2.1 Create dictionary XML for `u_idp_capability` table
    - One `sys_dictionary` XML per field: `capability_id` (string, unique), `name` (string), `description` (string), `icon` (string), `active` (boolean, default true)
    - Also create the table-level `sys_dictionary` record (internal_type=collection)
    - File naming: `sys_dictionary_<sys_id>.xml` per field
    - _Requirements: 5.1_
  - [x] 2.2 Create dictionary XML for `u_role_capability_map` table
    - Fields: `role` (reference → `sys_user_role`), `capability` (reference → `u_idp_capability`)
    - _Requirements: 5.2_
  - [x] 2.3 Create dictionary XML for `u_idp_taxonomy` table
    - Fields: `name` (string), `order` (integer), `icon` (string), `active` (boolean, default true)
    - _Requirements: 5.3_
  - [x] 2.4 Create dictionary XML for `u_capability_taxonomy_map` table
    - Fields: `capability` (reference → `u_idp_capability`), `taxonomy` (reference → `u_idp_taxonomy`)
    - _Requirements: 5.4_
  - [x] 2.5 Create dictionary XML for `u_idp_navigation_item` table
    - Fields: `name` (string), `label` (string), `url` (string), `icon` (string), `taxonomy` (reference → `u_idp_taxonomy`), `required_capabilities` (glide_list → `u_idp_capability`), `order` (integer), `active` (boolean, default true)
    - _Requirements: 5.5_
  - [x] 2.6 Create dictionary XML for `u_catalog_capability_map` table
    - Fields: `catalog_item` (reference → `sc_cat_item`), `capability` (reference → `u_idp_capability`)
    - _Requirements: 4.4_
  - [x] 2.7 Create dictionary XML for `u_idp_service_catalog_meta` table
    - Fields: `name` (string), `catalog_item` (reference → `sc_cat_item`), `owning_team` (reference → `sys_user_group`), `lifecycle_stage` (choice: alpha, beta, ga, deprecated), `version` (string), `tags` (string), `active` (boolean, default true)
    - _Requirements: 4.3_
  - [x] 2.8 Create dictionary XML for `u_user_persona_override` table
    - Fields: `user` (reference → `sys_user`), `active_roles` (glide_list → `sys_user_role`)
    - _Requirements: 5.14_

- [ ] 3. Checkpoint — Verify role and table XML structure
  - Ensure all role XML files reference the correct `sys_package` and `sys_scope` values (`593e88fbc3e88750f6ebf8ddd4013112`)
  - Ensure `platform_admin` `includes_roles` lists all five subordinate role sys_ids
  - Ensure all dictionary records reference the correct `sys_scope`
  - Ask the user if any structural questions arise before proceeding.

- [-] 4. Create `IDPSecurity` Script Include XML
  - [x] 4.1 Create `sys_script_include_<sys_id>.xml` for `IDPSecurity`
    - Class name: `IDPSecurity`, `client_callable=true`, `access=public`
    - Implement `hasCapability(capabilityId)` method:
      - Get current user sys_id via `gs.getUserID()`
      - Query `u_role_capability_map` joining to `sys_user_role` to find roles assigned to current user
      - Query `u_idp_capability` where `capability_id = capabilityId` to get capability sys_id
      - Return `true` if any role-capability mapping exists for the user's roles and the given capability
      - Return `false` on any error or no match; never throw unhandled exceptions
    - _Requirements: 5.16, 8.5, 1.10, 1.11_
  - [ ] 4.2 Create `sys_script_include_<sys_id>.xml` for `IDPSecurity` unit test helper (optional inline test method `_testHasCapability`)
    - Add a `_selfTest()` method that can be invoked from a background script to verify true/false returns
    - _Requirements: 5.16_

- [ ] 5. Create `IDPNavigationEngine` Script Include XML
  - [x] 5.1 Create `sys_script_include_<sys_id>.xml` for `IDPNavigationEngine`
    - Class name: `IDPNavigationEngine`, `client_callable=true`, `access=public`
    - Implement `getUserRoles(userId)`: query `sys_user_has_role` for active roles of userId; if a `u_user_persona_override` record exists for userId, return `active_roles` from that record instead
    - Implement `getCapabilities(roles)`: query `u_role_capability_map` where role IN roles array; return array of capability sys_ids
    - Implement `getTaxonomy(capabilities)`: query `u_capability_taxonomy_map` where capability IN capabilities; return distinct active taxonomy records from `u_idp_taxonomy`
    - Implement `getNavigationItems(capabilities)`: query `u_idp_navigation_item` where active=true; filter to items whose `required_capabilities` list intersects with the capabilities array
    - Implement `buildNavigationTree(items, taxonomies)`: group items by taxonomy, sort by `order` field, return JSON object `{ taxonomies: [{ sys_id, name, icon, order, items: [...] }] }`
    - Implement `getNavigation(userId)`: orchestrate the full sequence; check GlideCache key `idp_nav_<userId>` first (TTL 300s); on miss, build tree, store in cache, return result
    - _Requirements: 5.6, 5.7, 5.8, 5.9, 5.15, 8.7, 8.8_
  - [x] 5.2 Add cache invalidation Business Rule XML
    - Create `sys_script_<sys_id>.xml` (Business Rule on `sys_user_has_role`, after insert/delete)
    - Invalidate GlideCache key `idp_nav_<user_sys_id>` for the affected user
    - _Requirements: 5.10_

- [ ] 6. Create `IDPCatalogEngine` Script Include XML
  - [x] 6.1 Create `sys_script_include_<sys_id>.xml` for `IDPCatalogEngine`
    - Class name: `IDPCatalogEngine`, `client_callable=false`, `access=public`
    - Implement `getUserCapabilities(userId)`: reuse IDPNavigationEngine capability resolution logic (instantiate IDPNavigationEngine and call getCapabilities); cache result under key `idp_catalog_<userId>` TTL 300s
    - Implement `getAvailableCatalogItems(userId)`: get user capabilities; query `u_catalog_capability_map` for matching catalog items; also include items with no capability mapping (visible to all `x_146833_idpkiro.user` holders)
    - Implement `filterCatalogForPortal(userId)`: call `getAvailableCatalogItems`; enrich each item with metadata from `u_idp_service_catalog_meta`; return structured array with fields: sys_id, name, category, lifecycle_stage, owning_team, tags
    - Implement `canUserExecute(catalogItemSysId, userId)`: check if userId has at least one capability mapped to the catalog item via `u_catalog_capability_map`; return boolean
    - _Requirements: 4.5, 4.6, 4.10_

- [ ] 7. Create Portal XML and Carbon theme
  - [x] 7.1 Create `sp_portal_<sys_id>.xml` for the `idpkiro` portal
    - Fields: `title=IDP Kiro`, `url_suffix=idpkiro`, `homepage` (reference to idp_kiro_home page), `login_page`, `theme` (reference to Carbon theme record)
    - _Requirements: 2.1, 2.2_
  - [ ] 7.2 Create `sp_ng_template_<sys_id>.xml` or inline CSS theme record with Carbon Design System tokens
    - Define CSS custom properties: `--cds-interactive-01`, `--cds-ui-background`, `--cds-text-01`, `--cds-text-02`, `--cds-ui-01`, `--cds-ui-02`, `--cds-support-01` (danger), `--cds-support-03` (warning), `--cds-support-02` (success)
    - Apply IBM Plex Sans font stack
    - Define base layout: top nav bar (48px), left nav panel (256px collapsible), main content area
    - _Requirements: 2.2, 2.12_

- [-] 8. Create `idp_dynamic_navigation` Widget XML
  - [ ] 8.1 Create `sp_widget_<sys_id>.xml` for `idp_dynamic_navigation`
    - **Server script**: instantiate `IDPNavigationEngine`, call `getNavigation(gs.getUserID())`, set `data.navTree` on the response object
    - **Client script** (AngularJS): call GlideAjax `IDPNavigationEngine` with function `getNavigation`; on response parse JSON and bind to `c.data.navTree`; implement `toggleCollapse(taxonomyId)` to expand/collapse taxonomy groups; persist collapsed state in `$window.sessionStorage`
    - **HTML template**: render `<nav>` with Carbon-style left nav; outer `<ul>` iterates taxonomies (`ng-repeat`); each taxonomy renders an icon + label header that toggles child items; inner `<ul>` iterates nav items with `<a href>` links; apply `bx--side-nav` CSS classes
    - **CSS**: Carbon side-nav styles — `bx--side-nav`, `bx--side-nav__item`, `bx--side-nav__link`, collapsed state hides labels and shows only icons at 48px width
    - _Requirements: 2.5, 2.6, 5.11, 5.12, 5.13_

- [ ] 9. Create `idp_kiro_home` Page and Hero Widget XML
  - [ ] 9.1 Create `sp_page_<sys_id>.xml` for `idp_kiro_home`
    - Page ID: `idp_kiro_home`, title: `IDP Home`, portal reference to idpkiro portal
    - Layout: full-width container with rows for hero, persona tiles, insights panel, AI assistant, quick links
    - _Requirements: 3.1_
  - [ ] 9.2 Create `sp_widget_<sys_id>.xml` for `idp_hero_section` widget
    - **Server script**: set `data.userName = gs.getUser().getDisplayName()`; query `u_idp_navigation_item` filtered by user capabilities for quick action buttons; set `data.quickActions` array
    - **HTML**: Carbon hero banner with `<h1>Welcome, {{c.data.userName}}</h1>`; quick action `<button>` elements rendered via `ng-repeat` over `c.data.quickActions`
    - _Requirements: 3.1, 3.2_
  - [ ] 9.3 Create `sp_widget_<sys_id>.xml` for `idp_persona_tiles` widget
    - **Server script**: determine user's roles; for each IDP persona role the user holds, build a tile object with label, icon, description, and primary link URL; set `data.tiles`
    - **HTML**: Carbon tile grid (`bx--tile`) with `ng-repeat`; each tile shows persona icon, name, description, and a "Go to [Persona] view" link
    - _Requirements: 3.3, 3.4_
  - [ ] 9.4 Create `sp_widget_<sys_id>.xml` for `idp_insights_panel` widget
    - **Server script**: query `incident` table for active incidents count; query deployment records for last-24h count; query `sysapproval_approver` for pending approvals; query security findings table for open count; cache results 60s; set `data.metrics`; include `data.lastUpdated` timestamp
    - **HTML**: Carbon structured list or stat tiles showing each metric; display `data.lastUpdated` when data is stale
    - _Requirements: 3.5, 3.6_
  - [ ] 9.5 Create `sp_widget_<sys_id>.xml` for `idp_ai_assistant_placeholder` widget
    - **HTML**: Carbon text input + submit button labeled "Ask Platform AI"; `ng-model` bound to `c.data.question`
    - **Client script**: on submit, call `$http.post('/api/x_146833_idpkiro/idp/ai/ask', { question: c.data.question })`; display response text or graceful error message if unavailable
    - _Requirements: 3.7, 6.1_
  - [ ] 9.6 Create `sp_widget_<sys_id>.xml` for `idp_quick_links` widget
    - **Server script**: query `u_idp_navigation_item` where `quick_link=true` and active=true, filtered by user capabilities; set `data.links`
    - **HTML**: Carbon link list rendered via `ng-repeat`; no hardcoded URLs in template
    - _Requirements: 3.8, 8.1_

- [ ] 10. Checkpoint — Verify portal, page, and widget XML integrity
  - Ensure `sp_portal` references the correct home page sys_id
  - Ensure all widget server scripts use scoped GlideRecord table names (prefixed `u_`)
  - Ensure no hardcoded navigation URLs or role names appear in any widget HTML template
  - Ask the user if any questions arise before proceeding.

- [ ] 11. Create ACL XML records for all custom tables
  - [ ] 11.1 Create read ACL XMLs for `u_idp_capability`
    - Create `sys_security_acl_<sys_id>.xml` for table-level read: condition script calls `IDPSecurity.hasCapability` or checks `gs.hasRole('x_146833_idpkiro.user')`
    - _Requirements: 1.10_
  - [ ] 11.2 Create write ACL XMLs for `u_idp_capability`
    - Create `sys_security_acl_<sys_id>.xml` for table-level write: condition checks `gs.hasRole('x_146833_idpkiro.platform_admin')`
    - _Requirements: 1.11_
  - [ ] 11.3 Create read and write ACL XMLs for `u_role_capability_map`
    - Read: `x_146833_idpkiro.user` role required; Write: `x_146833_idpkiro.platform_admin` required
    - _Requirements: 1.10, 1.11_
  - [ ] 11.4 Create read and write ACL XMLs for `u_idp_taxonomy`
    - Read: `x_146833_idpkiro.user`; Write: `x_146833_idpkiro.platform_admin`
    - _Requirements: 1.10, 1.11_
  - [ ] 11.5 Create read and write ACL XMLs for `u_capability_taxonomy_map`
    - Read: `x_146833_idpkiro.user`; Write: `x_146833_idpkiro.platform_admin`
    - _Requirements: 1.10, 1.11_
  - [ ] 11.6 Create read and write ACL XMLs for `u_idp_navigation_item`
    - Read: `x_146833_idpkiro.user`; Write: `x_146833_idpkiro.platform_admin`
    - _Requirements: 1.10, 1.11_
  - [ ] 11.7 Create read and write ACL XMLs for `u_catalog_capability_map`
    - Read: `x_146833_idpkiro.user`; Write: `x_146833_idpkiro.platform_admin`
    - _Requirements: 1.10, 1.11_
  - [ ] 11.8 Create read and write ACL XMLs for `u_idp_service_catalog_meta`
    - Read: `x_146833_idpkiro.user`; Write: `x_146833_idpkiro.platform_admin`
    - _Requirements: 1.10, 1.11_
  - [ ] 11.9 Create read and write ACL XMLs for `u_user_persona_override`
    - Read: `x_146833_idpkiro.user` (own record only — add condition `current.user == gs.getUserID()`); Write: `x_146833_idpkiro.platform_admin`
    - _Requirements: 1.10, 1.11_
  - [ ] 11.10 Create portal page ACL / login redirect configuration
    - Ensure portal `sp_portal` record has `login_page` set so unauthenticated users are redirected to ServiceNow login
    - Create `sys_security_acl_<sys_id>.xml` for portal page access requiring `x_146833_idpkiro.user` role
    - _Requirements: 1.12, 1.13_

- [ ] 12. Create seed data Business Rule XML files
  - [ ] 12.1 Create `sys_script_<sys_id>.xml` Business Rule: seed `u_idp_taxonomy` records
    - Table: `sys_app` (on after insert, condition: `current.sys_id == '593e88fbc3e88750f6ebf8ddd4013112'`)
    - Insert taxonomy nodes: Application Services, Infrastructure Services, CI/CD Services, Security & Compliance, Observability (each with name, order 10/20/30/40/50, icon, active=true)
    - Use `GlideRecord.insertWithReferences()` and check for existing records before inserting (idempotent)
    - _Requirements: 4.1, 5.3_
  - [ ] 12.2 Create `sys_script_<sys_id>.xml` Business Rule: seed `u_idp_capability` records
    - Insert one capability per persona area: `cap_app_dev`, `cap_platform_eng`, `cap_sre`, `cap_security`, `cap_product_owner`, `cap_admin`, `cap_catalog_read`, `cap_catalog_write`, `cap_observability_full`, `cap_observability_limited`
    - _Requirements: 5.1, 1.4–1.9_
  - [ ] 12.3 Create `sys_script_<sys_id>.xml` Business Rule: seed `u_role_capability_map` records
    - Map each IDP role to its corresponding capabilities per the requirements matrix (e.g., `app_developer` → `cap_app_dev`, `cap_catalog_read`; `sre` → `cap_sre`, `cap_observability_full`; etc.)
    - _Requirements: 1.4–1.9, 5.2_
  - [ ] 12.4 Create `sys_script_<sys_id>.xml` Business Rule: seed `u_capability_taxonomy_map` records
    - Map each capability to its taxonomy node (e.g., `cap_app_dev` → Application Services taxonomy)
    - _Requirements: 5.4_
  - [ ] 12.5 Create `sys_script_<sys_id>.xml` Business Rule: seed `u_idp_navigation_item` records
    - Insert navigation items for each persona area with name, label, url (portal page suffix), icon, taxonomy reference, required_capabilities, order, active=true
    - Include at least 2 items per taxonomy; mark quick-link items with `quick_link=true`
    - _Requirements: 5.5, 3.8_

- [ ] 13. Create `IDPAIOrchestration` Script Include and REST API XML
  - [ ] 13.1 Create `sys_script_include_<sys_id>.xml` for `IDPAIOrchestration`
    - Class name: `IDPAIOrchestration`, `client_callable=false`, `access=public`
    - Implement `ask(question)`: stub — log the question, return `{ status: 'stub', message: 'AI service not yet connected. Question received: ' + question }`
    - Implement `recommend(context)`: stub — return `{ status: 'stub', recommendations: [] }`
    - Implement `summarize(recordRef)`: stub — return `{ status: 'stub', summary: 'Summary unavailable — AI backend not configured.' }`
    - All methods must catch exceptions and return graceful degradation objects (never throw)
    - _Requirements: 6.2, 6.5, 6.6_
  - [ ] 13.2 Create `sys_ws_definition_<sys_id>.xml` for Scripted REST API `idp_ai_api`
    - Base path: `/api/x_146833_idpkiro/idp`
    - _Requirements: 6.2_
  - [ ] 13.3 Create `sys_ws_operation_<sys_id>.xml` for `POST /ai/ask`
    - Operation name: `ai_ask`; HTTP method: POST; relative path: `/ai/ask`
    - Script: parse `request.body.data.question`; instantiate `IDPAIOrchestration`; call `ask(question)`; set `response.setBody(result)`
    - Require `x_146833_idpkiro.user` role on the REST resource
    - _Requirements: 6.2_
  - [ ] 13.4 Create `sys_ws_operation_<sys_id>.xml` for `POST /ai/recommend`
    - Operation name: `ai_recommend`; HTTP method: POST; relative path: `/ai/recommend`
    - Script: parse `request.body.data`; call `IDPAIOrchestration.recommend(context)`; return result
    - _Requirements: 6.2_
  - [ ] 13.5 Create `sys_ws_operation_<sys_id>.xml` for `POST /ai/summarize`
    - Operation name: `ai_summarize`; HTTP method: POST; relative path: `/ai/summarize`
    - Script: parse `request.body.data.recordRef`; call `IDPAIOrchestration.summarize(recordRef)`; return result
    - _Requirements: 6.2_

- [ ] 14. Create Observability Dashboard Widget XML
  - [ ] 14.1 Create `sp_widget_<sys_id>.xml` for `idp_observability_dashboard`
    - **Server script**:
      - Determine user's highest IDP role (platform_admin/sre > platform_engineer > app_developer > product_owner)
      - Query deployment records for success rate percentage (last 24h)
      - Query `incident` table grouped by severity for active incident counts
      - Calculate MTTR from resolved incidents (last 7 days)
      - Query service availability records per monitored service
      - Apply role filter: if `sre` or `platform_admin` → set `data.viewMode = 'full'`; if `app_developer` → `data.viewMode = 'limited'` (own team services only, no MTTR, no dependency map); if `product_owner` → `data.viewMode = 'summary'` (deployment rate + 30-day trend only)
      - Set `data.tiles`, `data.trends`, `data.services`
    - **Client script**: set up `$interval` polling every 30 seconds to refresh data via `$http.get`; update tile values without full page reload
    - **HTML template**:
      - Render status tiles with Carbon `bx--tile` classes; apply `bx--tag--warning` CSS class when availability < 99.5%; apply `bx--tag--red` CSS class when availability < 95%
      - Render trend graph placeholders (Canvas or SVG) for 7-day and 30-day deployment success rate and incident count — use inline SVG path rendering driven by `data.trends` arrays
      - Render service dependency map placeholder div (hidden for `limited` and `summary` view modes)
      - Use `ng-if="c.data.viewMode === 'full'"` guards for SRE-only sections
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  - [ ] 14.2 Create `sp_page_<sys_id>.xml` for `idp_observability` page
    - Page ID: `idp_observability`; title: `Platform Health`; add `idp_observability_dashboard` widget to the page layout
    - _Requirements: 7.1_

- [ ] 15. Final checkpoint — Ensure all XML files are complete and consistent
  - Verify every XML file in `593e88fbc3e88750f6ebf8ddd4013112/update/` has correct `sys_package` (`593e88fbc3e88750f6ebf8ddd4013112`) and `sys_scope` (`593e88fbc3e88750f6ebf8ddd4013112`) values
  - Verify no widget HTML template contains hardcoded role names, navigation URLs, or menu items (Req 8.1, 8.2)
  - Verify `IDPSecurity.hasCapability` is the sole server-side capability enforcement point — no widget server scripts perform direct role checks for capability-gated content
  - Verify seed data Business Rules are idempotent (check-before-insert pattern)
  - Ask the user if any final questions arise before marking the implementation complete.

---

## Notes

- All sys_ids in new files must be realistic 32-character lowercase hex strings not already used in the repository
- The `platform_admin` role `includes_roles` field must list the sys_ids of the five subordinate roles — update this field after Tasks 1.1–1.5 are complete and sys_ids are known
- Seed data Business Rules fire on `sys_app` insert for the IDP app sys_id — this ensures data is populated on first install and is idempotent on re-install
- The AI Orchestration layer (Task 13) is intentionally stubbed; the REST API structure is production-ready for future backend wiring without portal code changes
- Widget server scripts must use `new x_146833_idpkiro.IDPNavigationEngine()` syntax (scoped instantiation) when calling Script Includes from within the same scope
