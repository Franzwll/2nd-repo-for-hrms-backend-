# Job Post Editor — Fields & Entity Alignment

Reference for the **Job Post Builder** in Recruitment Management: what each
field is, where its value comes from, and which database entity owns it.

- Frontend: `frontend/src/components/modules/RecruitmentManagement.tsx`
- Backend: `backend-laravel/Modules/RecruitmentManagement/`
- Core HCM source: `backend-laravel/Modules/CoreHCM/`

---

## 1. Field ownership at a glance

Every Job Info field resolves to exactly one owning entity. Nothing is typed
twice: the builder reads Core HCM and writes only the recruitment-side record.

| Builder field | Reads from | Written to | Auto? |
|---|---|---|---|
| Title | `positions.title` | derived on save | auto |
| Department | `departments.name` | `job_posts.department_id` | selected |
| Type | — | `job_posts.employment_type` | manual |
| Schedule | — | `job_posts.schedule` | selected |
| **Vacancies** | `requisitions.requested_count`, else `positions.headcount − filled_count` | `job_posts.vacancies` | **auto** |
| **Salary min** | `salary_grades.min_salary` via position's band | `job_posts.salary_min` | **auto** |
| **Salary max** | `salary_grades.max_salary` via position's band | `job_posts.salary_max` | **auto** |
| Education level | requirement templates | `job_posts.education_level` | selected |
| Experience level | requirement templates | `job_posts.experience_level` | selected |
| Description / Responsibilities / Qualifications / Skills / Instructions / About | AI draft or manual | `*_json` columns | manual / AI |
| Picture of hiring | upload | `job_posts.picture` | manual |

---

## 2. Entity relationship

```
departments ──1:N──> positions ──1:N──> job_posts ──1:N──> applicants
      │                    │                 │
      │                    │                 └──> job_post_platforms (Website/Facebook/Instagram/Indeed)
      │                    │
      │                    ├──N:1──> salary_grades   (the band: min_salary / max_salary)
      │                    │                 │
      │                    │                 └──> source of Salary min / max
      │                    │
      │                    └── headcount / filled_count  (source of Vacancies)
      │
      └── name (label shown in the builder)

requisitions ──> departments + positions      (requested_count → Vacancies)
      │
      └── converted_job_post_id ──> job_posts  (Pending → Done → Converted)
```

### Ownership rules

| Entity | Owns | Never stores |
|---|---|---|
| `departments` | name, code, head | vacancy counts |
| `positions` | title, headcount, filled_count, salary_grade_id | posting text, published status |
| `salary_grades` | code, title, min_salary, max_salary, level | which post uses it |
| `requisitions` | requested_count, urgency, justification, status | salary, published content |
| `job_posts` | the published ad: salary, vacancies, content, platforms | headcount (lives on the position) |

`positions.headcount − positions.filled_count` is the **open slots** figure.
`PositionResource` already exposes it as a computed `vacancies` field, so no
extra column is required.

---

## 3. Auto-filled fields

### 3.1 Salary min / max

The band is resolved from Core HCM and written straight into the two inputs.
No grade selector, no "apply" button.

```
positions.salary_grade_id ──> salary_grades ──> min_salary / max_salary
                                                     │
                                                     ▼
                                        Salary min (₱) / Salary max (₱)
```

Resolution order for the band:

1. `draft.salaryGradeId` (set when a position is chosen)
2. `draftPosition.salaryGradeId` — the position's assigned grade
3. `draftPosition.salaryGradeMin/Max` — band values already resolved on load

Behaviour:

- Picking a position or linking a requisition fills both fields automatically.
- Typing a figure sets `salaryLocked` — your number is then preserved.
- Changing the position/grade re-arms the sync (`bandSourceRef`), refilling both.
- **Reset to band** appears under Salary max only while `salaryLocked` is true;
  it clears the lock and restores the Core HCM figures.
- `Edit Template` starts locked so an already-published post's live salary is
  never silently rewritten.

### 3.2 Vacancies

Priority order:

| # | Source | Value | Label shown to HR |
|---|--------|-------|-------------------|
| 1 | Linked requisition | `requested_count` | requisition `REQ-00007` |
| 2 | Core HCM position | `headcount − filled_count` | open slots |
| 3 | Neither | `1` | — |

- Floor of **1**: a fully-staffed position still needs a posting.
- Floor of **filled**: a post can never advertise fewer slots than the hires it
  already recorded.
- Editing the field sets `vacanciesLocked`; **Reset vacancies** restores the
  Core HCM figure.
- Changing the position or requisition re-arms the sync automatically
  (`vacancySourceRef`).
- Admins converting from a requisition get the input `disabled` — the requested
  count is authoritative and must not be hand-edited.

---

## 4. Editor flow

```
                    ┌──────────────────────────────┐
  New post ─────────>│                              │
  Copy & Use ──────>│      JOB POST BUILDER        │──> Save draft ──> status: Draft
  Convert req ─────>│   (9 draggable content       │                  active: false
  Edit Template ───>│    blocks + Job Info)        │──> Publish  ───> status: Open
                    │                              │                  active: true
                    └──────────────────────────────┘
```

### Entry points and their seeding

| Entry | `editingJobId` | Salary | Vacancies |
|---|---|---|---|
| **New post** | `null` | auto from band | auto from position |
| **Copy & Use Template** | `null` | auto (unlocked) | auto (unlocked) |
| **Convert requisition** | `null` | auto from band | requested count, locked for admins |
| **Edit Template** | job id | **locked** — keeps published values | **locked** — keeps published values |
| **Link pending request** | unchanged | re-armed | re-armed |

### The 9 blocks

| Block | Content |
|---|---|
| `title` | Position + department pickers |
| `info` | Type, schedule, vacancies, salary min/max, education, experience |
| `description` | Job description |
| `responsibilities` | Key responsibilities |
| `qualifications` | Qualifications |
| `skills` | Required skills |
| `instructions` | Application instructions |
| `about` | About the company |
| `picture` | Hiring poster upload |

Publishing requires title, department, and all six text blocks. Missing blocks
are added to the canvas automatically and focus moves to the first one.

---

## 5. Server-side behaviour

`RecruitmentManagementController`:

| Concern | Behaviour |
|---|---|
| Salary defaulting | `applyPositionSalaryDefaults()` fills blank `salary_min`/`salary_max` from the position's grade — called in **both** `store()` and `update()` |
| Title / slug | Derived from the linked position by the `JobPost` model, so a post can never drift from its position |
| Duplicate guard | One posting per position + department; `POST` → 409 `DUPLICATE_JOB_POST` with `existing_job_post_id`; `PUT` only 409s when the pair genuinely changes |
| Poster serving | `GET /job-posts/{id}/picture` tries several legacy paths, falls back to the composed template poster, never 404s |
| Vacancy lifecycle | `fillOneSlot()` increments `filled_count` and auto-closes the post at 0 slots |
| Position creation | `StorePositionRequest` requires `salary_grade_id` and `headcount ≥ 1` |

---

## 6. Known gaps

| Gap | Impact |
|---|---|
| `job_posts.vacancies` is never validated against `positions.headcount` | A post can advertise more slots than HR approved |
| `UpdateJobPostRequest` drops the `gte:salary_min` check that `StoreJobPostRequest` has | An edit can save `salary_max < salary_min` |
| Salary band can only be changed in Core HCM, not the builder | Recruiters must leave the job post screen to move a role to another band |
| A stale duplicate `JobPost` model exists at `backend-laravel/app/Models/JobPost.php` | Missing `requires_practical` / `picture`; the module model is the one controllers use |
| The `info` block is ~200 lines of JSX inside an 8,000-line file | Candidate for extraction into a `JobInfoPanel` component |