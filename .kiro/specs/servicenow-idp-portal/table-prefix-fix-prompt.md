# ServiceNow IDP Kiro - Table Prefix Fix Task

## Problem Statement

All ServiceNow tables in the scoped application `x_146833_idpkiro` (scope ID: `593e88fbc3e88750f6ebf8ddd4013112`) were created without the proper scope prefix. 

**Current state:** Tables are named `u_idp_capability`, `u_idp_taxonomy`, etc.
**Required state:** Tables should be named `x_146833_idpkiro_u_idp_capability`, `x_146833_idpkiro_u_idp_taxonomy`, etc.

## Root Cause

When tables are imported via ServiceNow update set XML files, the scope prefix is NOT automatically added by ServiceNow. The XML files must explicitly include the full table name with the scope prefix.

## Task Requirements

Update all 291 XML files in the directory `593e88fbc3e88750f6ebf8ddd4013112/update/` to include the scope prefix `x_146833_idpkiro_` for all custom table names.

## Tables That Need Prefix

The following table names need to be prefixed with `x_146833_idpkiro_`:

1. `u_idp_capability`
2. `u_idp_taxonomy`
3. `u_idp_navigation_item`
4. `u_idp_service_catalog_meta`
5. `u_role_capability_map`
6. `u_capability_taxonomy_map`
7. `u_catalog_capability_map`
8. `u_user_persona_override`
9. `u_idp_build_agent`
10. `u_idp_agent_selection`
11. `u_idp_scorecard`
12. `u_idp_scorecard_rule`
13. `u_idp_scorecard_result`
14. `u_idp_action_form`
15. `u_idp_form_field`
16. `u_idp_action_execution`
17. `u_idp_approval_flow`
18. `u_idp_approval_step`
19. `u_idp_ttl_resource`
20. `u_idp_integration_connector`
21. `u_idp_integration_sync`
22. `u_idp_external_entity`
23. `u_idp_webhook_event`

## XML Patterns to Update

In each XML file, replace the following patterns:

### Pattern 1: Table name in `<name>` tag
```xml
<!-- BEFORE -->
<name>u_idp_capability</name>

<!-- AFTER -->
<name>x_146833_idpkiro_u_idp_capability</name>
```

### Pattern 2: Table name in `<sys_name>` tag
```xml
<!-- BEFORE -->
<sys_name>u_idp_capability</sys_name>

<!-- AFTER -->
<sys_name>x_146833_idpkiro_u_idp_capability</sys_name>
```

### Pattern 3: Table name in `table` attribute
```xml
<!-- BEFORE -->
<record_update table="u_idp_capability">

<!-- AFTER -->
<record_update table="x_146833_idpkiro_u_idp_capability">
```

### Pattern 4: Table references in other elements
```xml
<!-- BEFORE -->
<reference>u_idp_capability</reference>

<!-- AFTER -->
<reference>x_146833_idpkiro_u_idp_capability</reference>
```

## Important Constraints

1. **DO NOT replace compound sys_name values**: Some `<sys_name>` tags contain compound values like `u_idp_service_catalog_meta lifecycle_stage alpha`. Only replace when the table name appears as a standalone value.

2. **Preserve XML encoding**: Files are UTF-8 encoded. Maintain encoding when writing files.

3. **Exact matching only**: Only replace exact table name matches, not partial matches.

4. **Case sensitivity**: Table names are case-sensitive.

5. **Do not modify**: 
   - Standard ServiceNow tables (incident, change_request, etc.)
   - Service Portal tables (sp_page, sp_widget, sp_column, sp_container, etc.)
   - System tables (sys_*, cmdb_*, etc.)

## Implementation Approach

### PowerShell Script (Windows)

```powershell
$scope = "x_146833_idpkiro_"
$tables = @(
    "u_idp_capability", "u_idp_taxonomy", "u_idp_navigation_item",
    "u_idp_service_catalog_meta", "u_role_capability_map", 
    "u_capability_taxonomy_map", "u_catalog_capability_map", 
    "u_user_persona_override", "u_idp_build_agent", "u_idp_agent_selection",
    "u_idp_scorecard", "u_idp_scorecard_rule", "u_idp_scorecard_result",
    "u_idp_action_form", "u_idp_form_field", "u_idp_action_execution",
    "u_idp_approval_flow", "u_idp_approval_step", "u_idp_ttl_resource",
    "u_idp_integration_connector", "u_idp_integration_sync",
    "u_idp_external_entity", "u_idp_webhook_event"
)

$files = Get-ChildItem "593e88fbc3e88750f6ebf8ddd4013112/update/*.xml"
$totalUpdated = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $modified = $false
    
    foreach ($table in $tables) {
        $prefixed = "$scope$table"
        
        # Pattern 1: <name>table</name>
        if ($content -match "<name>$table</name>") {
            $content = $content -replace "<name>$table</name>", "<name>$prefixed</name>"
            $modified = $true
        }
        
        # Pattern 2: <sys_name>table</sys_name> (exact match only)
        if ($content -match "<sys_name>$table</sys_name>") {
            $content = $content -replace "<sys_name>$table</sys_name>", "<sys_name>$prefixed</sys_name>"
            $modified = $true
        }
        
        # Pattern 3: table="table"
        if ($content -match "table=`"$table`"") {
            $content = $content -replace "table=`"$table`"", "table=`"$prefixed`""
            $modified = $true
        }
        
        # Pattern 4: <reference>table</reference>
        if ($content -match "<reference>$table</reference>") {
            $content = $content -replace "<reference>$table</reference>", "<reference>$prefixed</reference>"
            $modified = $true
        }
    }
    
    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        $totalUpdated++
    }
}

Write-Host "Updated $totalUpdated files out of $($files.Count)"
```

### Bash Script (Linux/Mac)

```bash
#!/bin/bash

SCOPE="x_146833_idpkiro_"
TABLES=(
    "u_idp_capability" "u_idp_taxonomy" "u_idp_navigation_item"
    "u_idp_service_catalog_meta" "u_role_capability_map"
    "u_capability_taxonomy_map" "u_catalog_capability_map"
    "u_user_persona_override" "u_idp_build_agent" "u_idp_agent_selection"
    "u_idp_scorecard" "u_idp_scorecard_rule" "u_idp_scorecard_result"
    "u_idp_action_form" "u_idp_form_field" "u_idp_action_execution"
    "u_idp_approval_flow" "u_idp_approval_step" "u_idp_ttl_resource"
    "u_idp_integration_connector" "u_idp_integration_sync"
    "u_idp_external_entity" "u_idp_webhook_event"
)

cd 593e88fbc3e88750f6ebf8ddd4013112/update

for file in *.xml; do
    modified=false
    
    for table in "${TABLES[@]}"; do
        prefixed="${SCOPE}${table}"
        
        # Check if file contains the table name
        if grep -q "<name>${table}</name>" "$file" || \
           grep -q "<sys_name>${table}</sys_name>" "$file" || \
           grep -q "table=\"${table}\"" "$file" || \
           grep -q "<reference>${table}</reference>" "$file"; then
            
            # Perform replacements
            sed -i.bak \
                -e "s|<name>${table}</name>|<name>${prefixed}</name>|g" \
                -e "s|<sys_name>${table}</sys_name>|<sys_name>${prefixed}</sys_name>|g" \
                -e "s|table=\"${table}\"|table=\"${prefixed}\"|g" \
                -e "s|<reference>${table}</reference>|<reference>${prefixed}</reference>|g" \
                "$file"
            
            modified=true
        fi
    done
    
    if [ "$modified" = true ]; then
        echo "Updated: $file"
        rm "${file}.bak"
    fi
done
```

## Verification Steps

After running the script, verify the changes:

### 1. Check that old patterns are gone
```powershell
# Should return 0
Select-String -Path "593e88fbc3e88750f6ebf8ddd4013112/update/*.xml" -Pattern "<name>u_idp_capability</name>" | Measure-Object | Select-Object -ExpandProperty Count
```

### 2. Check that new patterns exist
```powershell
# Should return > 0
Select-String -Path "593e88fbc3e88750f6ebf8ddd4013112/update/*.xml" -Pattern "<name>x_146833_idpkiro_u_idp_capability</name>" | Measure-Object | Select-Object -ExpandProperty Count
```

### 3. Sample file check
```powershell
Get-Content "593e88fbc3e88750f6ebf8ddd4013112/update/sys_db_object_d0010000000000000000000000000001.xml" | Select-String -Pattern "name>"
```

Expected output should show:
```xml
<name>x_146833_idpkiro_u_idp_capability</name>
<sys_name>x_146833_idpkiro_u_idp_capability</sys_name>
```

## Post-Fix Steps in ServiceNow

After updating all XML files:

1. **Delete existing tables** in ServiceNow (they have wrong names)
2. **Commit changes to git** repository
3. **Pull changes** in ServiceNow via Source Control integration
4. **Verify tables** are created with correct prefix `x_146833_idpkiro_u_idp_*`

## Expected Outcome

- All 291 XML files updated with correct table name prefixes
- Tables will be created with proper scoped names when imported
- REST API calls will work with correct table names
- ACLs will properly match table names

## File Locations

- XML files: `593e88fbc3e88750f6ebf8ddd4013112/update/*.xml`
- Total files: 291
- Files to update: ~50-80 (only files referencing custom tables)

## Additional Context

- Scope name: `x_146833_idpkiro`
- Scope ID: `593e88fbc3e88750f6ebf8ddd4013112`
- Application name: `idpkiro`
- ServiceNow instance: `https://dev203024.service-now.com`
