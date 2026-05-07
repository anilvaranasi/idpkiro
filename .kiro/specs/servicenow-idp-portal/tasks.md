# Implementation Tasks

## Overview
All tasks below correspond to ServiceNow XML update set files committed to the scoped application directory `593e88fbc3e88750f6ebf8ddd4013112/update/`. Import the update set into your ServiceNow instance to apply all changes.

---

## Task Group 1: Role Model & Access Control

- [x] 1.1 Define 6 IDP persona roles (app_developer, platform_engineer, sre, security_engineer, product_owner, platform_admin)
- [x] 1.2 Define base roles (user, admin) for scoped app consumption
- [x] 1.3 Create ACL — u_idp_capability READ (requires x_146833_idpkiro.user)
- [x] 1.4 Create ACL — u_idp_capability WRITE (requires platform_admin)
- [x] 1.5 Create ACL — u_idp_navigation_item READ (requires x_146833_idpkiro.user)
- [x] 1.6 Create ACL — u_idp_taxonomy READ (requires x_146833_idpkiro.user)
- [x] 1.7 Create ACL — u_catalog_capability_map READ (requires x_146833_idpkiro.user)

---

## Task Group 2: Data Model Tables

- [x] 2.1 Create table u_idp_capability (capability_id, name, description, icon, active)
- [x] 2.2 Create table u_role_capability_map (role ref, capability ref)
- [x] 2.3 Create table u_idp_taxonomy (name, order, icon, active)
- [x] 2.4 Create table u_capability_taxonomy_map (capability ref, taxonomy ref)
- [x] 2.5 Create table u_idp_navigation_item (name, label, url, icon, taxonomy ref, required_capabilities, order, active, quick_link)
- [x] 2.6 Create table u_user_persona_override (user ref, active_roles list)
- [x] 2.7 Create table u_catalog_capability_map (catalog_item ref, capability ref)
- [x] 2.8 Create table u_idp_service_catalog_meta (name, catalog_item ref, owning_team, lifecycle_stage, version, tags, active)
- [x] 2.9 Add quick_link boolean field to u_idp_navigation_item

---

## Task Group 3: Script Includes (Core Engines)

- [x] 3.1 Create IDPSecurity Script Include — hasCapability(), hasCapabilityForUser(), getUserCapabilityIds()
- [x] 3.2 Create IDPNavigationEngine Script Include — getUserRoles(), getCapabilities(), getTaxonomy(), getNavigationItems(), buildNavigationTree(), getNavigation(), invalidateCache(), GlideCache with 5-min TTL
- [x] 3.3 Create IDPCatalogEngine Script Include — getUserCapabilities(), getAvailableCatalogItems(), filterCatalogForPortal(), canUserExecute(), invalidateCache()
- [x] 3.4 Create IDPAIOrchestrator Script Include — ask(), recommend(), summarize(), onIncidentCreated(), onDeploymentFailure()

---

## Task Group 4: Service Portal

- [x] 4.1 Create Service Portal — idpkiro (URL suffix: idpkiro, AWS Carbon CSS theme)
- [x] 4.2 Create Widget — IDP Dynamic Navigation (idp_dynamic_navigation) — GlideAjax → IDPNavigationEngine, collapsible left nav, taxonomy-grouped
- [x] 4.3 Create Widget — IDP Home Page (idp_home_page) — hero section, persona tiles, insights panel, AI assistant widget, quick links
- [x] 4.4 Create Widget — IDP Observability Dashboard (idp_observability_dashboard) — real-time tiles, trend table, dependency map placeholder, role-filtered views

---

## Task Group 5: REST API Endpoints

- [x] 5.1 Create REST API definition — IDP Kiro API (/api/x_146833_idpkiro)
- [x] 5.2 Create endpoint POST /ai/ask — calls IDPAIOrchestrator.ask()
- [x] 5.3 Create endpoint POST /ai/recommend — calls IDPAIOrchestrator.recommend()
- [x] 5.4 Create endpoint POST /ai/summarize — calls IDPAIOrchestrator.summarize()
- [x] 5.5 Create endpoint GET /observability/metrics — returns real-time platform health metrics

---

## Task Group 6: Business Rules & Event Hooks

- [x] 6.1 Create Business Rule — IDP Invalidate Nav Cache on Role Change (sys_user_has_role, after insert/delete)
- [x] 6.2 Create Business Rule — IDP AI Summary on Incident Create (incident, async insert)
- [x] 6.3 Create Business Rule — IDP AI Root Cause on Deployment Failure (change_request, async update, state→4)

---

## Task Group 7: Seed Data

- [x] 7.1 Seed 5 taxonomy records (Developer Tools, Platform Operations, Reliability & Monitoring, Security & Compliance, Product & Demand Management)
- [x] 7.2 Seed 7 capability records (cap_deploy_service, cap_create_pipeline, cap_view_incidents, cap_view_observability, cap_manage_risk, cap_manage_approvals, cap_manage_infra)
- [x] 7.3 Seed role-capability mappings (9 mappings across app_developer, platform_engineer, sre, security_engineer, product_owner)
- [x] 7.4 Seed capability-taxonomy mappings (7 mappings)
- [x] 7.5 Seed 8 navigation items (Service Catalog, CI/CD Pipelines, API Explorer, Infrastructure Services, Incidents & Alerts, Platform Health, Risk Dashboard, Approvals & Demand)

---

## Task Group 8: System Properties

- [x] 8.1 Create system property x_146833_idpkiro.ai.enabled (default: false)
- [x] 8.2 Create system property x_146833_idpkiro.ai.endpoint
- [x] 8.3 Create system property x_146833_idpkiro.ai.api_key (password2 type)

---

## Remaining / Post-Import Steps

- [ ]* 9.1 Import update set into ServiceNow instance and resolve any conflicts
- [ ]* 9.2 Assign IDP roles to test users and validate navigation rendering per persona
- [x]* 9.3 Create portal pages (sp_page) for idp_kiro_home, idp_observability, idp_catalog, idp_pipelines, idp_api_explorer, idp_risk_dashboard, idp_approvals and add widgets to page layouts
- [ ]* 9.4 Configure AI provider: set x_146833_idpkiro.ai.enabled=true, set endpoint and api_key system properties
- [ ]* 9.5 Create Service Catalog items with u_required_capabilities and u_taxonomy fields populated
- [ ]* 9.6 Wire GitLab CI/CD integration to cap_create_pipeline and cap_deploy_service capabilities via u_execution_endpoint on catalog items

---

## Task Group 10: DevSecOps Lifecycle Configuration

### ServiceNow Developer (DevOps Tenant) Persona

- [x] 10.1 Create role: x_146833_idpkiro.sn_developer
- [x] 10.2 Create taxonomy: ServiceNow DevOps
- [x] 10.3 Create capability: cap_view_demand (View Demand Intake)
- [x] 10.4 Create capability: cap_create_scoped_app (Create Scoped App)
- [x] 10.5 Create capability: cap_access_gitlab (Access GitLab Repos)
- [x] 10.6 Create capability: cap_run_build_pipeline (Run Build Pipeline)
- [x] 10.7 Create capability: cap_run_atf (Run ATF Tests)
- [x] 10.8 Create capability: cap_run_sast (Run SAST Scan)
- [x] 10.9 Create capability: cap_deploy_to_instance (Deploy to Instance)
- [x] 10.10 Create capability: cap_view_app_logs (View App Logs)
- [x] 10.11 Create capability: cap_create_incident (Create Incident)
- [x] 10.12 Create capability: cap_create_change_request (Create Change Request)
- [x] 10.13 Create 10 role-capability mappings for sn_developer role
- [x] 10.14 Create navigation items for ServiceNow DevOps taxonomy

### DevSecOps Engineer (AWS Platform) Persona

- [x] 10.15 Create role: x_146833_idpkiro.devsecops_engineer
- [x] 10.16 Create taxonomy: DevSecOps Console
- [x] 10.17 Create capability: cap_aws_provision_infra (Provision AWS Infrastructure)
- [x] 10.18 Create capability: cap_aws_configure_iam (Configure AWS IAM)
- [x] 10.19 Create capability: cap_aws_deploy_lambda (Deploy Lambda Functions)
- [x] 10.20 Create capability: cap_aws_configure_vpc (Configure VPC Networking)
- [x] 10.21 Create capability: cap_aws_setup_monitoring (Setup CloudWatch Monitoring)
- [x] 10.22 Create capability: cap_aws_configure_alerts (Configure CloudWatch Alerts)
- [x] 10.23 Create capability: cap_aws_run_security_scan (Run AWS Security Scans)
- [x] 10.24 Create capability: cap_aws_configure_waf (Configure AWS WAF)
- [x] 10.25 Create capability: cap_aws_manage_secrets (Manage AWS Secrets)
- [x] 10.26 Create capability: cap_aws_view_costs (View AWS Costs)
- [x] 10.27 Create capability: cap_aws_review_compliance (Review AWS Compliance)
- [x] 10.28 Create capability: cap_aws_manage_certs (Manage AWS Certificates)
- [x] 10.29 Create 12 role-capability mappings for devsecops_engineer role
- [x] 10.30 Create navigation items for DevSecOps Console taxonomy
