# WordPress ACF Fields — Portfolio Projects

Add the following fields to the existing **"Project Details"** field group attached to the `portfolio_project` custom post type. The group already contains `role`, `year`, `tech_stack`, `featured`, `live_url`, and `github_url`.

---

## New Fields

### `project_status`
| Setting | Value |
|---|---|
| Field type | Select |
| Field name | `project_status` |
| Field key | `field_project_status` |
| Choices | `completed : Completed` / `in-progress : In Progress` / `paused : Paused` / `archived : Archived` |
| Default value | `completed` |
| Return format | Value |
| Required | No |

> WPGraphQL exposes this as `projectFields.projectStatus`

---

### `project_start_date`
| Setting | Value |
|---|---|
| Field type | Date Picker |
| Field name | `project_start_date` |
| Field key | `field_project_start_date` |
| Display format | F Y (e.g. "June 2023") |
| Return format | `Y-m` |
| Required | No |

> WPGraphQL exposes this as `projectFields.projectStartDate`

---

### `project_end_date`
| Setting | Value |
|---|---|
| Field type | Date Picker |
| Field name | `project_end_date` |
| Field key | `field_project_end_date` |
| Display format | F Y |
| Return format | `Y-m` |
| Required | No |
| Instructions | Leave blank if the project is ongoing. |

> WPGraphQL exposes this as `projectFields.projectEndDate`

---

### `project_category`
| Setting | Value |
|---|---|
| Field type | Text |
| Field name | `project_category` |
| Field key | `field_project_category` |
| Placeholder | e.g. Web App, Open Source, Mobile, Design System, Freelance, Side Project |
| Required | No |

> WPGraphQL exposes this as `projectFields.projectCategory`

---

### `project_impact`
| Setting | Value |
|---|---|
| Field type | Textarea |
| Field name | `project_impact` |
| Field key | `field_project_impact` |
| Rows | 2 |
| Instructions | One sentence describing the outcome or key metric, e.g. "Reduced page load time by 40%". |
| Required | No |

> WPGraphQL exposes this as `projectFields.projectImpact`

---

### `project_collaborators`
| Setting | Value |
|---|---|
| Field type | Repeater |
| Field name | `project_collaborators` |
| Field key | `field_project_collaborators` |
| Button label | Add Collaborator |
| Required | No |

**Sub-fields:**

| Sub-field | Type | Field name | Notes |
|---|---|---|---|
| Name | Text | `collab_name` | Required within repeater row |
| URL | URL | `collab_url` | Optional — links the name chip on the frontend |

> WPGraphQL exposes this as `projectFields.projectCollaborators { collabName collabUrl }`

---

### `project_gallery`
| Setting | Value |
|---|---|
| Field type | Gallery |
| Field name | `project_gallery` |
| Field key | `field_project_gallery` |
| Return format | Array |
| Preview size | Medium |
| Instructions | Additional screenshots shown below the hero image on the project detail page. |
| Required | No |

> WPGraphQL exposes this as `projectFields.projectGallery { sourceUrl altText }`
> Requires the **WPGraphQL for ACF** plugin with Gallery field support enabled.

---

## WPGraphQL Registration

If you are registering fields manually (instead of via the ACF UI → WPGraphQL settings), add `show_in_graphql: true` to each field and ensure the field group itself has:

```php
'show_in_graphql' => true,
'graphql_field_name' => 'projectFields',
```

The repeater sub-fields map as follows:
- `collab_name` → `collabName`
- `collab_url` → `collabUrl`
