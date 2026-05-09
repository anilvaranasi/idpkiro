# ServiceNow IDP Kiro - Complete Rebuild Prompt

## Project Overview

Build a complete **Internal Developer Portal (IDP)** as a ServiceNow Scoped Application that provides Port.io-style developer experience with capability-driven architecture, role-based access control, self-service actions, scorecards, and integration framework.

**Application Details:**
- **Scope Name**: `x_146833_idpkiro`
- **Scope ID**: `593e88fbc3e88750f6ebf8ddd4013112`
- **Application Name**: `idpkiro`
- **Output Directory**: `593e88fbc3e88750f6ebf8ddd4013112/update/`
- **Platform**: ServiceNow Service Portal
- **Language**: Server-side JavaScript (GlideScript/Rhino ES5), AngularJS 1.x for widgets

---

## CRITICAL: Table Naming Requirements

### ⚠️ MOST IMPORTANT RULE - READ CAREFULLY ⚠️

**ALL custom table names in XML files MUST include the full scope prefix `x_146833_idpkiro_`**

ServiceNow does NOT automatically add the scope prefix when importing tables via update set XML. You must explicitly include it in the XML.

### Correct Table Naming Examples

```xml
<!-- ✅ CORRECT - Full scope prefix included -->
<sys_db_object action="INSERT_OR_UPDATE">
    <name>x_146833_idpkiro_u_idp_capability</name>
    <sys_name>x_146833_idpkiro_u_idp_capability</sys_name>
    <label>IDP Capability</label>
    <sys_scope display_value="idpkiro">593e88fbc3e88750f6ebf8ddd4013112</sys_scope>
</sys_db_object>

<!-- ✅ CORRECT - Dictionary field reference -->
<sys_dictionary action="INSERT_OR_UPDATE">
    <name>x_146833_idpkiro_u_idp_capability</name>
    <element>capability_id</element>
</sys_dictionary>

<!-- ✅ CORRECT - Business rule table reference -->
<sys_script action="INSERT_OR_UPDATE">
    <collection>x_146833_idpkiro_u_idp_capability</collection>
</sys_script>

<!-- ✅ CORRECT - ACL table reference -->
<sys_security_acl action="INSERT_OR_UPDATE">
    <name>x_146833_idpkiro_u_idp_capability</name>
    <operation display_value="read">read</operation>
</sys_security_acl>
```

### Incorrect Examples (DO NOT DO THIS)

```xml
<!-- ❌ WRONG - Missing scope prefix -->
<name>u_idp_capability</name>

<!-- ❌ WRONG - Partial prefix -->
<name>idpkiro_u_idp_capability</name>

<!-- ❌ WRONG - Wrong prefix format -->
<name>x_idpkiro_u_idp_capability</name>
```

### Table Naming Checklist

Before generating any XML file, verify:

- [ ] Table name in `<name>` tag has full prefix: `x_146833_idpkiro_`
- [ ] Table name in `<sys_name>` tag has full prefix: `x_146833_idpkiro_`
- [ ] Dictionary `<name>` references have full prefix
- [ ] Business rule `<collection>` has full prefix
- [ ] ACL `<name>` has full prefix
- [ ] Script Include table references use full prefix
- [ ] Widget GlideRecord calls use full prefix
- [ ] REST API table queries use full prefix

### Standard ServiceNow Tables (DO NOT PREFIX)

These tables should NEVER have the scope prefix:
- `sys_user`, `sys_user_role`, `sys_user_has_role`
- `sys_user_group`, `sys_user_grmember`
- `incident`, `change_request`, `problem`
- `sc_cat_item`, `sc_category`, `sc_request`
- `cmdb_ci`, `cmdb_ci_service`
- `sp_portal`, `sp_page`, `sp_widget`, `sp_instance`, `sp_column`, `sp_container`
- Any table starting with `sys_`, `cmdb_`, `sp_`

---

## Architecture & Components

### 1. Role Model (6 Persona Roles + 2 Base Roles)

**Base Roles:**
- `x_146833_idpkiro.user` - Base role for all IDP users
- `x_146833_idpkiro.admin` - Administrative role

**Persona Roles:**
- `x_146833_idpkiro.app_developer` - Application developers
- `x_146833_idpkiro.platform_engineer` - Platform/infrastructure engineers
- `x_146833_idpkiro.sre` - Site reliability engineers
- `x_146833_idpkiro.security_engineer` - Security engineers
- `x_146833_idpkiro.product_owner` - Product owners/managers
- `x_146833_idpkiro.platform_admin` - Platform administrators

### 2. Data Model (23 Custom Tables)

**Core Tables:**
1. `x_146833_idpkiro_u_idp_capability` - Capabilities (permissions)
2. `x_146833_idpkiro_u_idp_taxonomy` - Taxonomy categories
3. `x_146833_idpkiro_u_idp_navigation_item` - Navigation menu items
4. `x_146833_idpkiro_u_idp_service_catalog_meta` - Service catalog metadata
5. `x_146833_idpkiro_u_role_capability_map` - Role-to-capability mapping
6. `x_146833_idpkiro_u_capability_taxonomy_map` - Capability-to-taxonomy mapping
7. `x_146833_idpkiro_u_catalog_capability_map` - Catalog-to-capability mapping
8. `x_146833_idpkiro_u_user_persona_override` - User persona overrides

**Build Agent Tables:**
9. `x_146833_idpkiro_u_idp_build_agent` - AI build agents
10. `x_146833_idpkiro_u_idp_agent_selection` - Agent selection history

**Scorecard Tables:**
11. `x_146833_idpkiro_u_idp_scorecard` - Scorecards
12. `x_146833_idpkiro_u_idp_scorecard_rule` - Scorecard rules
13. `x_146833_idpkiro_u_idp_scorecard_result` - Scorecard results

**Self-Service Action Tables:**
14. `x_146833_idpkiro_u_idp_action_form` - Action forms
15. `x_146833_idpkiro_u_idp_form_field` - Form fields
16. `x_146833_idpkiro_u_idp_action_execution` - Action executions
17. `x_146833_idpkiro_u_idp_approval_flow` - Approval flows
18. `x_146833_idpkiro_u_idp_approval_step` - Approval steps
19. `x_146833_idpkiro_u_idp_ttl_resource` - TTL resources

**Integration Tables:**
20. `x_146833_idpkiro_u_idp_integration_connector` - Integration connectors
21. `x_146833_idpkiro_u_idp_integration_sync` - Sync jobs
22. `x_146833_idpkiro_u_idp_external_entity` - External entities
23. `x_146833_idpkiro_u_idp_webhook_event` - Webhook events

### 3. Script Includes (10 Core Engines)

1. **IDPSecurity** - Capability checking and enforcement
2. **IDPNavigationEngine** - Dynamic navigation tree builder with caching
3. **IDPCatalogEngine** - Capability-filtered catalog access
4. **IDPAIOrchestrator** - AI operations orchestration
5. **BuildAgentSelector** - Intelligent build agent selection
6. **IDPScorecardEngine** - DORA metrics and production readiness scoring
7. **IDPSelfServiceEngine** - Self-service action execution
8. **IDPIntegrationEngine** - Integration connector management
9. **IDPKubernetesConnector** - Kubernetes integration
10. **IDPGitHubConnector** - GitHub integration
11. **IDPAWSConnector** - AWS integration

### 4. Service Portal Components

**Portal:**
- `idpkiro` portal with URL suffix `/idpkiro`

**Pages (7):**
- `idp_kiro_home` - Home page
- `idp_observability` - Observability dashboard
- `idp_catalog` - Service catalog
- `idp_pipelines` - CI/CD pipelines
- `idp_api_explorer` - API explorer
- `idp_risk_dashboard` - Risk dashboard
- `idp_approvals` - Approvals and demand

**Widgets (4):**
- `idp_dynamic_navigation` - Left navigation
- `idp_home_page` - Home page content
- `idp_observability_dashboard` - Observability metrics
- `idp_ai_assistant` - AI assistant

### 5. REST API Endpoints

Base path: `/api/x_146833_idpkiro`

**AI Endpoints:**
- `POST /ai/ask` - Ask AI questions
- `POST /ai/recommend` - Get AI recommendations
- `POST /ai/summarize` - Summarize content

**Build Agent Endpoints:**
- `POST /agent/select` - Select optimal build agent
- `GET /agent/list` - List all agents
- `POST /agent/compare` - Compare agents

**Self-Service Endpoints:**
- `GET /actions` - List available actions
- `GET /action/form/{formId}` - Get action form
- `POST /action/execute` - Execute action
- `POST /approval/process` - Process approval

**Scorecard Endpoints:**
- `POST /scorecard/calculate` - Calculate scorecard score

**Integration Endpoints:**
- `POST /connector/register` - Register connector
- `POST /connector/{id}/sync` - Trigger sync
- `POST /webhook/{type}/{id}` - Receive webhooks

**Observability Endpoints:**
- `GET /observability/metrics` - Get platform metrics

**Navigation Endpoints:**
- `GET /navigation` - Get user navigation

### 6. Business Rules

- Cache invalidation on role changes
- AI summary on incident creation
- AI root cause on deployment failure
- Scorecard daily calculation
- TTL resource cleanup

### 7. Scheduled Jobs

- Integration sync (every 15 minutes)
- Scorecard calculation (daily at 2 AM)
- TTL cleanup (every 15 minutes)

---

## Implementation Requirements

### File Structure

All XML files must be placed in: `593e88fbc3e88750f6ebf8ddd4013112/update/`

### File Naming Convention

- Tables: `sys_db_object_<unique_id>.xml`
- Dictionary: `sys_dictionary_<unique_id>.xml`
- Roles: `sys_user_role_<unique_id>.xml`
- Script Includes: `sys_script_include_<unique_id>.xml`
- Business Rules: `sys_script_<unique_id>.xml`
- REST API: `sys_ws_definition_<unique_id>.xml`, `sys_ws_operation_<unique_id>.xml`
- Portal: `sp_portal_<unique_id>.xml`
- Pages: `sp_page_<unique_id>.xml`
- Widgets: `sp_widget_<unique_id>.xml`
- ACLs: `sys_security_acl_<unique_id>.xml`

### XML Template Structure

Every XML file must follow this structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<record_update table="<table_name>">
    <<table_name> action="INSERT_OR_UPDATE">
        <!-- Fields here -->
        <sys_package display_value="idpkiro" source="x_146833_idpkiro">593e88fbc3e88750f6ebf8ddd4013112</sys_package>
        <sys_scope display_value="idpkiro">593e88fbc3e88750f6ebf8ddd4013112</sys_scope>
    </<table_name>>
</record_update>
```

### Mandatory Fields in Every XML

- `<sys_package>` - Must reference scope ID `593e88fbc3e88750f6ebf8ddd4013112`
- `<sys_scope>` - Must reference scope ID `593e88fbc3e88750f6ebf8ddd4013112`
- `<sys_created_by>` - Set to `admin`
- `<sys_updated_by>` - Set to `admin`
- `<sys_created_on>` - Use ISO format date
- `<sys_updated_on>` - Use ISO format date
- `<sys_id>` - Unique identifier (use descriptive IDs)

---

## Seed Data Requirements

### Taxonomies (5)
1. Developer Tools
2. Platform Operations
3. Reliability & Monitoring
4. Security & Compliance
5. Product & Demand Management

### Capabilities (Core 7 + DevSecOps 22)

**Core:**
- `cap_deploy_service`
- `cap_create_pipeline`
- `cap_view_incidents`
- `cap_view_observability`
- `cap_manage_risk`
- `cap_manage_approvals`
- `cap_manage_infra`

**ServiceNow Developer (10):**
- `cap_view_demand`, `cap_create_scoped_app`, `cap_access_gitlab`, `cap_run_build_pipeline`, `cap_run_atf`, `cap_run_sast`, `cap_deploy_to_instance`, `cap_view_app_logs`, `cap_create_incident`, `cap_create_change_request`

**DevSecOps Engineer AWS (12):**
- `cap_aws_provision_infra`, `cap_aws_configure_iam`, `cap_aws_deploy_lambda`, `cap_aws_configure_vpc`, `cap_aws_setup_monitoring`, `cap_aws_configure_alerts`, `cap_aws_run_security_scan`, `cap_aws_configure_waf`, `cap_aws_manage_secrets`, `cap_aws_view_costs`, `cap_aws_review_compliance`, `cap_aws_manage_certs`

### Build Agents (10)

Seed 10 AI build agents with real pricing:
- Claude 3 Opus, GPT-4 Turbo, Gemini 1.5 Pro, Claude 3 Sonnet, DeepSeek Coder, Mistral Large, CodeLlama 70B, GPT-3.5 Turbo, GitHub Copilot, Llama 3 70B

### Navigation Items (8)

- Service Catalog
- CI/CD Pipelines
- API Explorer
- Infrastructure Services
- Incidents & Alerts
- Platform Health
- Risk Dashboard
- Approvals & Demand

---

## Security & Access Control

### ACL Requirements

Create ACLs for ALL custom tables with:
- **READ**: Requires `x_146833_idpkiro.user` role
- **WRITE**: Requires `x_146833_idpkiro.admin` role
- **CREATE**: Requires `x_146833_idpkiro.admin` role
- **DELETE**: Requires `x_146833_idpkiro.admin` role

### ACL Naming Convention

ACL names must match the full table name with scope prefix:
```xml
<sys_security_acl action="INSERT_OR_UPDATE">
    <name>x_146833_idpkiro_u_idp_capability</name>
    <operation display_value="read">read</operation>
    <active>true</active>
    <admin_overrides>true</admin_overrides>
</sys_security_acl>
```

---

## Code Quality Requirements

### Script Includes

- Use ES5 JavaScript (Rhino engine)
- No arrow functions, no `let`/`const`, no template literals
- Use `var` for all variables
- Use `function() {}` syntax
- Include JSDoc comments
- Implement error handling with try-catch
- Use GlideCache for performance
- Set `client_callable: true` for GlideAjax-accessible methods

### Widgets

- Use AngularJS 1.x syntax
- Server script in GlideScript
- Client script in AngularJS
- CSS using AWS Carbon Design System principles
- Responsive design
- Accessibility compliant (WCAG 2.1 AA)

### REST APIs

- Use Scripted REST API framework
- Implement proper error handling
- Return JSON responses
- Use HTTP status codes correctly
- Validate input parameters
- Enforce capability checks

---

## Testing & Validation

After generating all files, verify:

1. **Table Names**: All custom tables have `x_146833_idpkiro_` prefix
2. **ACLs**: All tables have corresponding ACLs
3. **Scope References**: All files reference correct scope ID
4. **File Count**: Should have ~287-291 XML files
5. **No Syntax Errors**: All XML is well-formed
6. **No Hardcoded Values**: Use system properties for configuration

---

## Common Mistakes to Avoid

### ❌ DO NOT:
1. Create tables without scope prefix
2. Use arrow functions in server-side code
3. Use `let`/`const` in GlideScript
4. Forget to set `sys_package` and `sys_scope`
5. Create ACLs without matching table names
6. Use interactive commands in scheduled jobs
7. Hardcode credentials or API keys
8. Create circular dependencies
9. Use ES6+ features in ServiceNow code
10. Forget to invalidate caches on data changes

### ✅ DO:
1. Always include full scope prefix in table names
2. Use `var` and `function() {}` syntax
3. Set all mandatory XML fields
4. Create ACLs for all custom tables
5. Use GlideCache for performance
6. Implement proper error handling
7. Use system properties for configuration
8. Follow ServiceNow naming conventions
9. Test with multiple personas/roles
10. Document all APIs and functions

---

## Deliverables Checklist

- [ ] 23 custom tables with full scope prefix
- [ ] 8 base roles (2 base + 6 personas)
- [ ] 11 script includes
- [ ] 1 portal + 7 pages + 4 widgets
- [ ] 15+ REST API endpoints
- [ ] 92+ ACLs (4 per table minimum)
- [ ] 5 business rules
- [ ] 3 scheduled jobs
- [ ] Seed data for taxonomies, capabilities, agents, navigation
- [ ] All files in `593e88fbc3e88750f6ebf8ddd4013112/update/`
- [ ] Total ~287-291 XML files

---

## Success Criteria

1. All tables created with correct scope prefix `x_146833_idpkiro_`
2. REST API accessible at `/api/x_146833_idpkiro/*`
3. Portal accessible at `/idpkiro`
4. Navigation renders based on user capabilities
5. ACLs enforce proper access control
6. Build agent selection works with scoring
7. Scorecards calculate DORA metrics
8. Self-service actions execute with approvals
9. Integrations sync external entities
10. MCP server can query all APIs

---

## Post-Generation Steps

After generating all XML files:

1. Commit to git repository
2. Push to ServiceNow via Source Control integration
3. Assign `x_146833_idpkiro.user` role to test users
4. Verify tables exist with correct names
5. Test REST APIs via REST API Explorer
6. Test portal navigation
7. Verify ACLs enforce access control
8. Test MCP server integration

---

## Reference Documents

- Design: `.kiro/specs/servicenow-idp-portal/design.md`
- Tasks: `.kiro/specs/servicenow-idp-portal/tasks.md`
- Port.io Comparison: `.kiro/specs/servicenow-idp-portal/port-io-comparison.md`
- AWS IDP Comparison: `.kiro/specs/servicenow-idp-portal/aws-idp-comparison.md`

---

## Final Reminder

**THE MOST CRITICAL REQUIREMENT:**

Every custom table name in every XML file MUST include the full scope prefix:
`x_146833_idpkiro_`

This applies to:
- `<name>` tags in sys_db_object
- `<sys_name>` tags
- `<collection>` in business rules
- ACL names
- Dictionary references
- GlideRecord table names in scripts
- REST API table queries

**If you forget the prefix, the tables will be created with wrong names and the entire application will fail.**
