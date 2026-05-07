# Design Document: ServiceNow Internal Developer Portal (IDP)

## Overview

This is a minimal design stub created to satisfy the requirements-first workflow prerequisite. The implementation is a **ServiceNow Scoped Application** (`x_146833_idpkiro`, app sys_id: `593e88fbc3e88750f6ebf8ddd4013112`) that delivers a Port.io-style Internal Developer Portal on the ServiceNow Service Portal framework.

All deliverables are ServiceNow update set XML files placed in `593e88fbc3e88750f6ebf8ddd4013112/update/`. The implementation language is **ServiceNow server-side JavaScript** (GlideScript / Rhino ES5) for Script Includes and Business Rules, and **AngularJS 1.x + HTML/CSS** for Service Portal widgets.

---

## Architecture

### Platform
- ServiceNow Service Portal (sp framework)
- Scoped application scope: `x_146833_idpkiro`
- All records delivered as update set XML (`INSERT_OR_UPDATE` actions)

### Key Components

| Component | Type | Purpose |
|---|---|---|
| Roles (6) | `sys_user_role` | Least-privilege RBAC personas |
| Tables (8) | `sys_dictionary` | Metadata-driven capability/nav/catalog data model |
| IDPSecurity | Script Include | Server-side capability enforcement |
| IDPNavigationEngine | Script Include | Dynamic nav tree builder with GlideCache |
| IDPCatalogEngine | Script Include | Capability-filtered catalog access |
| IDPAIOrchestration | Script Include + REST API | AI layer stubs |
| idpkiro Portal | `sp_portal` | Portal shell with Carbon theme |
| idp_dynamic_navigation | Widget | Left nav rendered via GlideAjax |
| idp_kiro_home | Page + Widget | Personalized home page |
| Observability Widget | Widget | Role-filtered platform health dashboard |
| ACLs | `sys_security_acl` | Server-side table/record access control |
| Seed Data BRs | Business Rules | Install-time data population |

### Data Model

```
u_idp_capability ──< u_role_capability_map >── sys_user_role
u_idp_capability ──< u_capability_taxonomy_map >── u_idp_taxonomy
u_idp_capability ──< u_idp_navigation_item (required_capabilities list)
u_idp_capability ──< u_catalog_capability_map >── sc_cat_item
sc_cat_item ──< u_idp_service_catalog_meta
sys_user ──< u_user_persona_override (active_roles list)
```

### Caching Strategy
- Navigation cache key: `idp_nav_<user_sys_id>`, TTL 300 seconds
- Catalog cache key: `idp_catalog_<user_sys_id>`, TTL 300 seconds
- Cache invalidated on role assignment change via Business Rule

---

## Correctness Properties

**Property 1: Navigation Confluence**
For any two users U1 and U2 with identical role sets R, `getNavigation(U1) == getNavigation(U2)` regardless of role assignment order.
_Validates: Requirements 8.7_

**Property 2: Navigation Idempotence**
For any user U with no role/capability changes between calls, `getNavigation(U)` called twice returns identical trees.
_Validates: Requirements 8.8, 5.8, 5.9_

**Property 3: Capability Monotonicity**
Adding a capability mapping to a role never reduces the set of navigation items visible to users with that role.
_Validates: Requirements 8.4, 5.12_

**Property 4: Least-Privilege Enforcement**
For any capability C not mapped to role R, `IDPSecurity.hasCapability(C)` returns false for all users whose only role is R.
_Validates: Requirements 1.10, 1.11, 8.5_

---

## File Naming Convention

All update set XML files follow the ServiceNow naming pattern:
- `sys_user_role_<sys_id>.xml`
- `sys_dictionary_<sys_id>.xml`
- `sys_script_include_<sys_id>.xml`
- `sp_portal_<sys_id>.xml`
- `sp_widget_<sys_id>.xml`
- `sp_page_<sys_id>.xml`
- `sys_security_acl_<sys_id>.xml`
- `sys_script_<sys_id>.xml` (Business Rules)
- `sys_ws_definition_<sys_id>.xml` (Scripted REST API)
