# Applicant Management — Current UI Spec

> Source: `frontend/src/components/modules/ApplicantManagement.tsx` (9,197 lines)
> Route: `/admin/_applicant-management/applicants` + `/superadmin/_applicant-management/applicants`
> Role prop only changes eyebrow text. ~91 `<Button>` total.

---

## 1. Page header (always visible, lines 4326–4382)

**What it is:** `PageHeader` — eyebrow (`Admin — Recruitment` / `Super Admin — Recruitment`), title `Applicant Management`, description `spaCy NER resume screening, candidate ranking, interview scheduling and evaluation.`

**What you see:** 4 clickable stat cards + `Generate Report` button top-right.

### Stat cards (click = shortcut filter + navigation)

| Card | Number shown | Click does | You land on |
|---|---|---|---|
| Total Applicants | `rows.length` | `goToApplicants("all")` — clears all filters | Ranking tab, table reset + scrolled to list |
| Passed Screening | `rows.filter(score >= passing).length` | `goToApplicants("passed")` — sets `rankingFilter=passed` | Ranking tab, badge `Passed screening` + filtered table |
| Today Scheduled Interviews | `interviews.filter(date === TODAY_ISO).length` | `goToTodayInterviews()` | Scheduling tab, calendar jumped to today |
| Ready for Interview | `readyToAssess.length` | `goToReadyToAssess()` | Interview tab, filter `Ready for Interview` |

### Header buttons

| Button | Purpose | What happens |
|---|---|---|
| Generate Report (Download icon) | Open export dialog | Opens `Generate Report` dialog: pick All / By Status / By Position / Screening Results / Interview Summary → per-row Generate → PDF / DOCX / Excel download via `handleExportApplicantReport` |

---

## 2. Tab bar (lines 4383–4427)

7 horizontal `TabsTrigger`. Clicking only swaps `TabsContent` (no dialog).

| Tab | Value | Icon | Purpose |
|---|---|---|---|
| Ranking & Applicants | `ranking` | Trophy | Screening results + full applicant table |
| Interview Scheduling | `scheduling` | CalendarClock | Calendar + booking form + scheduled table |
| Interview | `interview` | ClipboardCheck | Ready queue + completed assessments |
| Assessment Test | `test` | BookMarked | Job-specific test queue + results |
| Practical Assessment | `practical` | Wrench | Hands-on exam, designated positions only (`PRACTICAL_POSITIONS`, `requiresPractical()`) |
| Final Evaluation | `final` | CheckCircle2 | Whole-process verdict |
| History & Audit | `history` | History | Full activity trail + exports |

---

## 3. Tab 1 — Ranking & Applicants (`ranking`, 4430–4879)

### 3a. Candidate Ranking card (left)
**What you see:** Donut `PieChart` (green/amber/red slices via `statusChartColor`), center `{screenedTotal} Resumes`, right legend with counts, subtitle `Resume screening results — N resumes processed for {positionFilter}`.

**Controls:**
- Position dropdown (`All positions` + `displayPositions`) — filters chart, Top-5, and Applicant List (shared `positionFilter` state).

### 3b. Top 5 Candidates Today (right)
**What you see per row:** Rank circle (#1 gold), avatar initials, name, position, tier badge (`computeTopCandidateTier` + `topCandidateTierMeta`), status badge, score%.

| Button | Purpose | Result |
|---|---|---|
| Review (per candidate, full-width) | Open screening review for that person | Same Review dialog as table (`setReview(a)`) — resume preview, score breakdown, Accept/Reject |

### 3c. Applicant List
**What you see:** Table columns — Applicant (avatar+name+id) | Contact (email+phone) | Position | Applied | Score% | Status badge | Stage | Actions. Sortable headers (name/contact/position/applied/score/status/stage). Pagination footer.

**Filters (all live-filter the table):**
- Search input — name/id/email
- Position select, Status select (`statusMeta` keys), Stage select (`Screened, Accepted, Interview Scheduled, Assessed, Offer, Hired, Rejected`)
- Quick-filter badge (`Passed screening` / `Ready to assess` when arriving via stat card) + `?` clear button → clears `rankingFilter`

| Button | Purpose | Result |
|---|---|---|
| Review (FileText, per row) | Open screening review | Review dialog for that row; can Accept & schedule / Refer / Reject |

---

## 4. Tab 2 — Interview Scheduling (`scheduling`, 4883–6603)

Two cards side-by-side + full-width table below.

### 4a. Interview Calendar (left, 4886–5252)
**What you see:** Month grid (42 cells), color legend, `Interviews on {date}` list (time pill, applicant/position, interviewer/mode, Cancelled badge).

**Buttons:**

| Button | Purpose | Result |
|---|---|---|
| Today | Jump to today | `viewMonth` + `schedule.date` reset to today |
| ‹ / › | Prev / next month | Grid recomputed, label updates |
| Gear (Slot settings) | Open capacity/time config | Opens Slot Settings dialog (see 4c) |
| Expand (Full calendar) | Open large month modal | Opens Full Calendar dialog (see 4d) |

**Filters:** Month/Year popover selects; day-cell click sets booking date (colors: green Free/Schedulable, red Full, gold Today, grey Not-schedulable); day-list Search input + Status select (`All/Scheduled/Completed/Cancelled/No Show`); trash icon per row (non-cancelled) → opens Cancel-confirm dialog.

### 4b. Book an Interview (right, 5255–6386)
**What you see:** Cascading form + live summary box + reschedule banner (yellow, when rescheduling).

**Dropdowns (each resets downstream):**
1. Filter by Department (`All` + `displayDepartments`, `Posting` badge if hiring) → filters positions
2. Position (`Posting` badge if active job) → filters applicants
3. Select Applicant (`scheduleApplicants` = accepted in dept/pos; empty text if none)
4. Interview Date (date input, syncs calendar)
5. Select Time Slot (`slotsForSelected`; full slots disabled, shows `N left` / `full`; header shows `N slots — M applicants each`)
6. Mode (`On-site`/`Virtual`) → filters facilities + info text
7. Interviewer (`scheduleInterviewers`: name — role)
8. Request Facility (rooms filtered by mode, shows capacity; help text: `Requesting X — confirmed once approved` vs `Required — reserve room`)

| Button | Purpose | Result |
|---|---|---|
| Request Facility to Scheduled (Mail, large, full-width) | Create or update interview + facility request | Disabled until applicant+date+time+interviewer+facility filled (tooltip lists missing). Success → toast, row appears in day list + Scheduled table with `Waiting for Facility Approval`; reschedule → updates existing + audit `Interview Rescheduled`. Fail → toast (slot full / DB error) |

### 4c. Slot Settings dialog
**What you see:** Left config + right Daily Schedule Preview (slot list with Break/Available badges + Summary grid: capacity/slot, interviewers, rooms, slots/day, duration, break window, walk-ins, default type, schedulable days).

**Controls:** Interviewers count + Rooms count (number inputs; `capacityPerSlot = min(both)`, drives Full threshold); First-slot time, Slot duration (15/20/30/45/60), Slot count (6–20); Schedulable days Mon–Sun toggle pills (draft until Save); Break switch + start/end time + presets (`Lunch Break`, `15 min`, `30 min`, `1 hour`); Walk-ins switch; Default mode select.

| Button | Purpose | Result |
|---|---|---|
| Lunch Break / 15 min / 30 min / 1 hour | Preset break window | start/end inputs update, preview re-renders |
| Reset to default | Discard edits in-memory | Inputs revert to `DEFAULT_SLOT_SETTINGS` |
| Save settings | Persist + close | Saves `schedulableDays` (+ API upsert), closes, calendar colors recompute, toast `Slot settings saved` |

### 4d. Full Calendar View dialog
**What you see:** Month grid (single-click select, double-click drill to day) OR day panel (`PLACES` card: big date, ON-SITE room buttons with door icon + booked count, VIRTUAL button; right: Daily Schedule Preview filtered by facility select).

| Button | Purpose | Result |
|---|---|---|
| Today / ‹ / › | Navigate modal month | Grid updates |
| Back to calendar | Day → month | Returns to grid, keeps selected date |
| Room / Virtual buttons | Pick facility | Ring highlight moves, right schedule list filters |

### 4e. Scheduled Interviews table (6392–6603)
**What you see:** Columns — Applicant | Position | Schedule (date — time) | Mode badge | Interviewer | Facility (name + `Approved`/`Waiting`/`Declined`/`Not Required` badge) | Status badge (`Need to Schedule`/`Scheduled`/`Completed`/`Cancelled`/`No Show`) | Actions. Pagination.

**Filters:** Search, Status select, Mode select, sortable headers.

| Button | Purpose | Result |
|---|---|---|
| Schedule (pending rows) | Accept pending applicant into scheduler | Jumps to booking form prefilled, toast `Pick suggested date/slot` |
| Reschedule / Re-book | Start reschedule flow | Prefills form + yellow banner `Rescheduling X from…`; next confirm updates record. If interview locked (finalized) shows italic `Interview finalized` instead — no button |
| Cancel (red, non-cancelled) | Request cancellation | Opens Cancel-confirm dialog → status `Cancelled` |

---

## 5. Tab 3 — Interview (`interview`, 6954–7225)

**What it is:** Work queue — who still needs interviewing vs who is done.
**What you see:** `Candidates ready for interview and those already interviewed.` Table: Candidate | Position | Department | Score | Status | Details (`Interview booked/not booked` or `Interviewed {date} — {remarks}`) | Date | Time | Action.

**Filters:** Search (`candidate, position—`), View select (`Ready`/`Completed`/`All`), Department select, Outcome select (`Ready/ Recommended / Hold / Not Recommended / Rejected`), sortable headers, pagination.

| Button | Purpose | Result |
|---|---|---|
| Start Interview (ready rows) | Open scoring form | Disabled unless interview booked for TODAY (`title` explains why). Opens Interview dialog prefilled (assessor = matched interviewer, scores reset to 4). |
| View (Eye, done rows) | See saved scorecard | Opens View Interview dialog (locked note: `Candidate rejected — decision locked` or `Decision moved to Final Evaluation`) |

---

## 6. Tab 4 — Assessment Test (`test`, 6607–6708)

**What it is:** Job-specific quiz after passed interview.
**What you see:** `Candidates who passed their interview take a job-specific test…` Ready queue (only `stage=Assessed` + interview `Passed`; row: name + `position — interview assessment passed`) + `TEST RESULTS` list (title + `name — position · date` + `Passed/Failed — N%` badge). Empty states explain the gate.

| Button | Purpose | Result |
|---|---|---|
| Start Assessment Test (BookMarked, per ready row) | Launch quiz | Opens Assessment Test Runner dialog for that candidate |
| View (Eye, per result) | See score | Opens View Assessment Result dialog |

No filters in this tab.

---

## 7. Tab 5 — Practical Assessment (`practical`, 6709–6805)

**What it is:** Hands-on demo, only for `PRACTICAL_POSITIONS` (`requiresPractical(position)`).
**What you see:** `Hands-on practical exam… only for designated positions (X, Y).` Ready queue (only `stage=Assessment Test` + requires-practical + test `Passed`) + `PRACTICAL RESULTS` list. Empty states explain the gate.

| Button | Purpose | Result |
|---|---|---|
| Record Practical Exam (Wrench) | Open scoring form | Opens Practical Assessment dialog |
| View (Eye, per result) | See saved practical score | Opens View Practical dialog |

No filters.

---

## 8. Tab 6 — Final Evaluation (`final`, 6806–6953)

**What it is:** Whole-process verdict (screening + interview + test + practical if required).
**What you see:** Ready queue (non-practical: `Assessment Test` + test Passed; practical-required: also practical Passed; row: name + `position — all process stages completed`) + `FINAL EVALUATION RESULTS` (name — position + date + `Verified decision` if verified + recommendation badge: green `Recommended for Hire` / yellow `For Another Position` / red `Not Recommended` + `Verified — decision pending` or hired/rejected badge).

| Button | Purpose | Result |
|---|---|---|
| Complete Final Evaluation (CheckCircle2) | Open verdict form | Opens Final Evaluation dialog with auto snapshot preview |
| Verify Candidate Decision (ShieldCheck; only if unverified + not hired/rejected) | Confirm recorded recommendation | Opens Verify dialog (radios + reject shortcut) |
| View (Eye, always) | See saved evaluation | Opens View Final dialog |

No filters.

---

## 9. Tab 7 — History & Audit (`history`, 7226–7459)

**What it is:** `Complete trail of applicant activity — screening, transfers, interview booking, completion and cancellation, assessments and hiring decisions.`
**What you see:** Table — Date & time | Performed by | Position | Department | Action badge (`auditBadgeClass`: green Accepted/Completed, red Rejected/Cancelled/No-Show, blue Booked/Scheduled/Started, amber Transferred/Status Change) | Applicant | Module | Details. Sortable, paginated. States: `Loading audit history…`, `No audit history yet…`, `No activity matches your filters.`

**Filters:** Search activity input; Action select (`All actions` + `auditActionTypes`); Department select; Actor select (`All users` + `auditActors`).

| Button | Purpose | Result |
|---|---|---|
| Generate Report (Download, dropdown) | Export filtered log | Menu: Export as PDF / DOCX / Excel → `handleExportAuditReport(format)` download |
| Reset (only when any filter active) | Clear all history filters | Search + 3 selects reset |

---

## 10. Dialogs (7460–9197)

### Generate Report (7460–7501)
Pick report type → Generate → format. Rows: All Applicants / By Status / By Position / Screening Results / Interview Summary (each with description). Buttons per row: `Generate` dropdown → `Export as PDF/DOCX/Excel`.

### Resume Screening Result — Review (7685–8204, widest `1500px`)
**What you see:** Title `{name} — {position} — applied {at} — source — {id}`. Left (sticky 460px): filename (click → new tab), zoom out / % / zoom in (50–300%), preview (image scaled / PDF loader→iframe or fallback + Open file / DOCX rendering→container or fallback / DOC localhost→Open in Word vs Office Viewer iframe / unsupported→Open file / none→`No resume file`). Right: Match score N% + status badge + `Passed threshold/Below threshold` + verdict; Matched keywords (green) / Missing (grey); 2×2 grid Work experience / Education / Key skills / Red flags; `ScreeningAnalysisSections` (missing info, recognized/unrecognized roles, credential analysis + verification risk pill LOW/MEDIUM/HIGH + penalty + flags); alternative-job suggestion; `Why this result` reasons; Recommendation text; `SupportingDocumentVerificationSection` (doc accordion + Re-verify).

| Button | Purpose | Result |
|---|---|---|
| Accept & schedule (CheckCircle2) | Accept + jump to scheduler | `acceptAndSchedule(review)` — stage Accepted, scheduler prefilled |
| Schedule interview (when already Accepted) | Book | Same accept-and-schedule path |
| Refer to other position (Repeat2) | Transfer vacancy | Opens Refer dialog |
| Reject (XCircle) | Reject + close | `reject(review)`, dialog closes |
| Info line (when locked) | Status only | `This applicant is already at {stage}…` — actions hidden |

### Refer to Other Position (8207–8261)
Radio list of vacancies (`title !== current`, `filled < headcount`; `Best match` badge if flagged; `dept — N seats — salary`). `Cancel` closes; `Confirm referral` (disabled until pick) transfers.

### Interview scoring (8264–8402)
Assessor select (system users; `No system users found.` empty), Interview date input, table Category/Rate (`5/4/3/2/1` select)/Comments (textarea) per `assessmentCriteria`, Overall Evaluation textarea, computed score `sum/(n*5)*100%`. Footer verdict: `Passed` → `saveAssessment("Passed")`, `Failed` → `saveAssessment("Failed")`.

### Assessment Test Runner (8405–8546)
`{step+1}/{total}` pill + progress bar + timer `mm:ss` + `{name} — {position} · {title} · Passing N% · answered/total`. Question: `Question` + speaker, title, scenario, `Select one`, option buttons (`selectTestOption`, selected = blue, `Press n` hint), `Clear answer`. Footer: `Prev` (disabled step 0), `Next` or `Finish — auto-check` (red, disabled until all answered → `saveAssessmentTest()` auto-grades).

### Practical Assessment (8549–8700)
Task input (`e.g. Bartender — Mixology Practical`), Assessor select, Date input, table Criterion/Rate (5–1)/Comments per `practicalCriteria` (+ per-criterion comments), Overall Evaluation textarea, computed score. Footer: `Passed` → `savePractical("Passed")`, `Failed` → `savePractical("Failed")`.

### Final Evaluation (8703–8797, widest `7xl`)
`Evaluated by` select, Date input, `stageResultBlocks` snapshot preview (every stage score), Overall remarks textarea. Footer: `Cancel` + 3 verdict buttons → `saveFinalEvaluation("Recommended for Hire" / "For Another Position" / "Not Recommended")`.

### Verify Candidate Decision (7509–7603)
Read-only Evaluated-by + Date, stage blocks, overall remarks, Recommendation radios (Hire / Another Position / Not Recommended). `Cancel` closes; `Reject` (red outline) → instant `Not Recommended`; `Confirm` (disabled until choice) finalizes (opens position picker if Another Position).

### Recommended position picker (7606–7661)
Radio `displayPositions` (title+dept). `Cancel` closes; `Accept candidate` (disabled until pick) hires into chosen (`acceptFinalEvaluation`).

### Cancel interview (7664–7683)
`Cancel this interview? — {applicant} on {date} — {time} will be marked Cancelled.` `Keep interview` closes; `Yes, cancel` (red) → `performCancelInterview`.

### View dialogs (read-only + Close)
- Final Result (8801): stage blocks + recommendation + remarks. `Close` only.
- Interview Result (8843): total N% + outcome badge + Passed/Failed + Category/Rate/Comments table + Overall Evaluation. `Close`.
- Assessment Result (8936): `Score N% + Passing M% · C/L correct` + badge. `View Test & Answer` → opens answers dialog; `Close`.
- Practical Result (8999): computed N% + badge + Criterion/Rate/Comments table + overall text. `Close`.
- Test & Answers (9079): per-question correct-answer (green) / your-answer (red-wrong/green-right) badges, or Q + Correct/Wrong badge (non-mock). `Close`.

---

## 11. Embedded helper sections (inside Review dialog)

- `ScreeningAnalysisSections` — missing essential info, recognized vs unrecognized job roles, credential analysis list, credential verification (risk pill, penalty pts, summary, WARNING/INFO flags), invalid-credential disclaimer.
- `SupportingDocumentVerificationSection` — per-doc accordion (`expandedId`), resume-claim vs file comparison, Re-verify button (`reverifyDocument`).
- `ScreeningReferenceManager` (exported, admin vocabulary CRUD): stats badges (Skills/Job Roles/Certifications/active), type filter + search, table (Type badge / Canonical / Aliases / Active switch / edit+delete icon buttons), `Add entry` → Add/Edit dialog (Type select, Canonical input, Aliases textarea) → Save; delete → confirm dialog. Changes apply to next screening run.
