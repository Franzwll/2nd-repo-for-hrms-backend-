# UI Consistency Prompt — Oxford Suites Makati HRMS

Source of truth: **Applicant Management** and **Recruitment Management** modules.
Apply this prompt to every other module: Dashboard, Settings, Employee Records,
Core HCM, ESS, Onboarding, Audit Logs, User Management, etc.

---

## 1. Page header

Every page starts with this exact structure — no `gold-rule mt-4`, no `PageHeader`.

```tsx
<div className="-mx-1 mb-4 space-y-3 px-1 pb-1 pt-1">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex items-start gap-4">
      {/* Icon — always present, right beside the title + description */}
      <span className="flex h-14 w-14 shrink-0 items-center justify-center text-primary">
        <ModuleIcon className="h-11 w-11 fill-current" strokeWidth={1.25} />
      </span>
      <div>
        <h1 className="font-display text-[1.8rem] font-bold leading-tight tracking-tight sm:text-[2rem]">
          Module Name
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          One clear sentence. No fluff.
        </p>
      </div>
    </div>
    {/* Right-aligned actions — ONLY if the module already has them.
        Do NOT add Generate Report or Settings buttons to pages that
        don't have report generation or a settings dialog. */}
    {hasActions && (
      <div className="flex items-center gap-2 self-start">
        {/* <ReportMenu /> — only if the module generates reports */}
        {/* <Button size="icon" variant="outline"> gear — only if
            the module has a settings dialog (e.g. screening setup,
            re-apply cooldown) */}
      </div>
    )}
  </div>
</div>
```

Rules:
- Icon is a **solid SVG** with at least one **punched-out hole** (`<svg>` + `fillRule="evenodd"`, or lucide with `fill-current` when the glyph already has an inner cut) — **not** a flat filled blob and **not** a stroke outline. The hole is what keeps a heavy mark readable at `h-11 w-11`. Reference: the Recruitment Management briefcase (handle punched out).
  - Audit Logs: document with a badge knocked out (mask, check mark shows through).
  - User Management: shield with the person punched out.
  - Settings: gear with the hub punched out.
- Icon sits to the **left** of the title, not above it.
- Title uses `font-display` (Cormorant Garamond), description is plain `text-sm text-muted-foreground`.
- **No** `gold-rule mt-4` divider. **No** `PageHeader` component. Hand-write the block exactly as above.
- Actions sit **right-aligned** on the same row as the title — but **only include buttons the module actually owns**:
  - `Generate Report` → only if the module has exportable report data (e.g. Applicant Management, Recruitment Management, Employee Records).
  - Settings gear → only if the module has a settings dialog (e.g. re-apply cooldown in Applicant Management, screening setup in Recruitment Management).
  - **Do NOT invent buttons.** If the original page has no report generation or settings dialog, the right-side actions area is simply omitted.

---

## 2. Metric cards — 4 interactive tiles

Immediately after the header. Always **4 cards**, always this grid:

```tsx
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {metrics.map((m) => (
    <button
      key={m.label}
      type="button"
      onClick={m.onClick}
      className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <m.icon className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-muted-foreground">
          {m.label}
        </span>
        <span className="mt-1 block font-display text-[1.45rem] font-bold leading-none tabular-nums text-foreground">
          {m.value.toLocaleString()}
        </span>
      </span>
    </button>
  ))}
</div>
```

Rules:
- Each card is a `<button>` — clicking filters or navigates to the relevant section.
- Icon chip: `h-12 w-12 rounded-xl bg-primary/10 text-primary`, icon `h-6 w-6`.
- Label: `text-xs font-medium text-muted-foreground` — keep it short (2–3 words max).
- Value: `font-display text-[1.45rem] font-bold leading-none tabular-nums`.
- **No subtitle or hint text** visible inside the card — tooltip via `title` attribute if needed.
- Loading skeleton: same grid, each cell = `flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5` with `<Skeleton className="h-12 w-12 rounded-xl" />` + two text skeletons.

Reference metrics per module:
- **Applicant Management**: Total Applicants · New Applications · Perfect for the Job · Today's Interviews
- **Recruitment Management**: Active Postings · Total Vacancies · Pending Requisitions · High Urgency
- **Dashboard**: adapt 4 KPIs relevant to the overview
- **Employee Records**: Total Employees · Active · On Leave · New This Month
- **Settings**: adapt or omit (settings pages may skip metric cards)

---

## 3. Table card — title left, controls right

The card holds its own title, and the controls sit together at the **top right**
of that card, on the card background. Reference: the Applicant Management
"screening queue" card.

```tsx
<Card className="rounded-xl border-border/60 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
  <CardContent className="p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-base font-bold">
        <Icon className="h-4.5 w-4.5 text-primary" />
        Card Title
      </h2>

      {/* Controls — grouped together, right-aligned, same background as the
          table body. No muted band, no border-b strip. */}
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        {/* Search — first, icon inside the input */}
        <div className="relative min-w-[12rem] flex-1 sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search positions…"
            className="w-full pl-8"
          />
        </div>

        {/* Filter dropdowns — after search */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[calc(50%-0.25rem)] sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            …
          </SelectContent>
        </Select>

        {/* Clear filters — appears only when a filter is active */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 px-2 text-xs text-muted-foreground">
            Clear filters
          </Button>
        )}

        {/* Action buttons — last, inside the same group */}
        <Button size="sm" className="h-9">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New record
        </Button>
      </div>
    </div>

    <div className="mt-3 overflow-x-auto">
      <Table>…</Table>
    </div>
    <TablePagination … />
  </CardContent>
</Card>
```

Rules:
- The toolbar uses the **same background as the table body** (`bg-card`). Never
  wrap it in a `bg-muted/20` band, `rounded-t-xl`, or a `border-b` strip.
- The controls form **one group** at the top right of the card, beside the card
  title. They never span the full card width on desktop.
- Search icon: `left-2.5`, input `pl-8`. **Never** `left-3`/`pl-9`.
- Search placeholder: names the object + ellipsis ("Search applicants…", "Search positions…").
- Every filter `<Select>` defaults to an explicit "All …" item — never blank.
- Filter widths: `sm:w-36` (short labels), `sm:w-40` (medium), `sm:w-44` (long labels like Department).
- Functional buttons (New, Add, Import) sit **last inside the group**, not on their own row.
- Card padding: `p-4 sm:p-5`. Table body starts at `mt-3`, so the card never
  leaves a band of empty space between the controls and the rows.
- Table under it: `text-xs`, plain `<TableHeader>` — no `bg-muted/40` or
  `bg-muted/30` fill, the table shares the card background and the row rule is
  the separation. Sortable via `SortHead`, paginated with `TablePagination`,
  wrapped in `ListBody` for stable height.

---

## 3b. Card titles — title only

A card inside a page shows a **title and nothing else** in its header: no
description, no subtitle, no helper sentence under the title. Explanations
belong in the page description or in the empty state, never under a card title.

```tsx
<h2 className="flex items-center gap-2 font-display text-base font-bold">
  <Icon className="h-4.5 w-4.5 text-primary" />
  Card Title
</h2>
```

Do not ship a `subtitle` / `description` prop on a shared card wrapper either —
if no card uses it, delete it.


---

## 4. Generate Report — dropdown for one report, modal picker for many

Flow:

1. Page → `Generate Report` button.
2. ONE report → the trigger itself is a dropdown: `Export as PDF`, `Export as
   DOCX`, `Export as Excel`, `Export as CSV`, separator, `Print…`.
3. SEVERAL reports → a modal opens with one row per report (title only). Each row has
   exactly **one** `Generate` button on the right.
4. Pressing that `Generate` opens a dropdown with `Export as PDF`, `Export as
   DOCX`, `Export as Excel`, `Export as CSV`, separator, `Print…` — the same
   order and icons as the single-report trigger.
5. Picking a format opens the password dialog, then downloads.

Never put one button per format in the row itself. The row shows one action;
the formats live inside its menu.

The password dialog stays short: title, report name, one file-name line, two
password fields, one AES-256 note. No paragraph explaining why the file is
zipped.

The report picker itself carries no description either: no subtitle under the
dialog title, no AES explainer, no per-report note. Title, rows, one `Generate`
per row, `Close`. Anything that does not help the user pick a format is removed.

> **IMPORTANT: Only add Generate Report if the module actually generates reports.**
> Dashboard, for example, has no exportable report data — do not add a Generate
> Report button to it. Only modules that build `ReportData` objects (Applicant
> Management, Recruitment Management, Employee Records, etc.) should have this.

```tsx
<ReportMenu
  reports={[
    {
      id: "overview",
      title: "Overview Report",
      recordCount: rows.length,
      build: () => buildOverviewReport(),
    },
    {
      id: "audit",
      title: "History & Audit",
      recordCount: auditLog.length,
      build: () => buildAuditReport(),
    },
  ]}
/>

{/* Single-report module: same trigger, formats straight in the dropdown */}
<ReportMenu report={buildAuditReport} recordCount={meta.total} label="Generate Report" />
```

The `ReportMenu` component handles everything:
- **One report** → dropdown on the trigger. **Several reports** → modal with one
  row per report and one `Generate` menu per row.
- Each row: title + optional one-line note + `Generate`. The menu holds
  `Export as PDF` / `DOCX` / `Excel` / `CSV`, then `Print…`.
- Every export is **password-protected** (AES-256 ZIP). The component prompts for a file password automatically.
- The trigger renders as: `<Button variant="outline" size="sm"><Download /> Generate Report</Button>`.

Reference report sets:
- **Applicant Management**: Pipeline Status · Screening Summary · Interview Schedule · Assessment Results · History & Audit (5 reports → modal)
- **Recruitment Management**: Vacancies & Postings · Vacancy Requisitions · Time-to-Fill & Funnel (3 reports → modal)
- **Employee Records**: Employee Masterlist · Headcount by Department · Employment Status · Tenure & Regularization · New Hire & Turnover · Record Completion (6 reports → modal)
- Apply the same pattern to any module with reports, including single-report modules.

---

## 5. Visual DNA — keep it simple, modern, human

These rules prevent the UI from looking AI-generated or overdesigned:

**Typography**
- `font-display` (Cormorant Garamond) for: page title, card titles, metric values, section headers.
- Default sans (Jost) for: everything else — labels, body, tables, controls.
- Page title: `text-[1.8rem] sm:text-[2rem]`. Card title: `text-base font-bold`. Metric value: `text-[1.45rem]`.

**Colours — tokens only**
- `text-primary` / `bg-primary/10` = maroon (action, current, active).
- `text-gold` / `bg-gold-soft` = champagne gold (accent, attention, quality).
- `text-success` / `bg-success/10` = green (hired, passed, confirmed).
- `text-warning` / `bg-warning/10` = orange (needs review).
- `text-destructive` / `bg-destructive/10` = red (rejected, failed, delete).
- `text-muted-foreground` / `bg-muted` = neutral (inactive, draft).
- **Never** use raw Tailwind palette (`amber-*`, `emerald-*`, `sky-*`, `blue-*`, `red-*`).

**Shape**
- Cards: `rounded-xl`, `border-border/60`, `shadow-[0_1px_2px_rgba(16,24,40,0.04)]`.
- Controls/inputs: `rounded-md`, `h-9`.
- Pills/badges: `rounded-full`, `text-[0.68rem] font-semibold`.
- One shadow only. No gradients, no glassmorphism, no illustrations on operational screens.

**Interaction**
- Card hover: `hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md transition-all`.
- Row hover: `hover:bg-muted/50`.
- Every mutation shows a `toast` (sonner). Every destructive action opens a confirmation dialog first.

**Simplicity checklist**
- Remove any subtext or description that doesn't help the user act.
- No "AI-powered" badges, sparkle decorations, or marketing language in operational screens.
- Left-aligned, scannable layout. Never center operational content.
- One primary reading column. Side panels are secondary and narrower.
- Max 4 metric cards. Max 3–4 filter dropdowns. No filter overkill.

---

## 6. Card & modal spacing — no dead space

Cards and dialogs must hug their content. Empty bands between the last control
and the card edge are bugs, not breathing room. A stretched card with a stranded
footer is the case to delete.

Rules:
- Default: cards in a grid keep their own content height. Use `items-start` on
  the grid. Do not stretch a card that has nothing to fill the space.
- **Paired-card exception.** When two cards in one row must line up (Preferences
  beside Security in Settings), the short one takes `h-full` and its shared
  wrapper must be `flex flex-1 flex-col` so the footer can reach the bottom.
  Then pin the footer with `mt-auto` and keep the rail classes
  `flex items-center justify-end gap-2 border-t border-border/60 pt-4`. The
  `border-t` rail is what makes the space above it read as a footer, not a hole.
  Keep the card's rows in one tight `space-y-2.5` block at the top — spread them
  apart and the gap just moves up.
- Without the exception, a card footer sits directly under the content:
  `border-t border-border/60 pt-4`, no `mt-auto`.
- Do not add filler text, spacer divs, or `min-h-*` to make a short card look
  taller. If adjacent cards differ in height and the row is not a pair, let the
  short card end.
- Scroll areas need an explicit `max-h-*`. Never a growing `flex-1` that turns
  into blank space when the content is short.
- Dialogs size to their content. No fixed `min-h`, no empty flex spacer, no
  `justify-between` actions row in a tall dialog. `DialogContent` shrink-wraps
  the title, the fields, and the action row.
- Use `space-y-*` only between real siblings, and drop trailing margins.
- Before shipping, resize the window and open every dialog: if the bottom of a
  card or dialog is empty for more than its own padding (about 24px), fix the
  layout.

---

## 7. Quick reference — component reuse

| Need | Use | Don't |
|---|---|---|
| Page title | Hand-written icon + title block (§1) | `PageHeader`, `gold-rule` |
| Page icon | Solid SVG with a punched-out hole (§1) | Flat filled blob, stroke-only outline |
| Metrics | Interactive `<button>` tiles (§2) | `StatCard`, plain `<div>` tiles |
| Table | `Table` + `SortHead` + `ListBody` + `TablePagination` | Custom scroll, infinite scroll |
| Table controls | One group at the card's top right, on the card background (§3) | `bg-muted/20` band, `border-b` strip, full-width toolbar |
| Card header | Title only (§3b) | Description / subtitle / helper line under the title |
| Empty state | `ListEmptyState` or dashed-border empty card | Blank space, "Loading…" text |
| Loading | `Skeleton` blocks matching final layout | Spinner, "Loading…" sentence |
| Reports | `ReportMenu`: dropdown for one report, modal with one `Generate` menu per row for several (§4) — **only if the module has reports** | One button per format inside a row, adding `ReportMenu` to pages with no report data |
| Settings gear | Only if the module has a settings dialog | Adding a gear button that opens nothing |
| Dialogs | `Dialog` from `ui/dialog`, sized per content | Custom overlays, inline expansion |
| Card height | Content height; `items-start` on the grid | Stretching a card that has nothing to fill the space |
| Paired card height | `h-full` + `flex flex-1 flex-col` body + `mt-auto` footer with `border-t` (§6) | Equal height with an empty band and no footer rail |
| Status pills | Soft-fill `rounded-full` with token colours | Raw colour classes, plain text |
| Toasts | `toast` from sonner | `alert()`, console-only errors |
| **Header actions** | **Only buttons the module already owns** | **Inventing Generate Report or Settings for pages that don't have them** |

---

## 8. One-paragraph version (for short prompts)

> Build it like Applicant Management: a solid SVG icon (h-14 w-14, fill-current,
> text-primary) with a punched-out hole sits left of the display-serif page title
> and one-line muted description — no gold-rule divider. Right-aligned actions are
> conditional: only include "Generate Report" or a settings gear if the module
> actually has those features — do not invent buttons. Below: 4 interactive metric
> tiles in a responsive grid (sm:2, xl:4) — each a button with a rounded-xl icon
> chip (h-12 w-12, bg-primary/10), a short muted label, and a bold serif number.
> Tables sit inside rounded-xl cards that carry their own title on the left and
> one group of controls on the top right, on the card background: search input
> (icon at left-2.5, pl-8), filter dropdowns (default "All …"), then action
> buttons. Never a muted toolbar band across the card top. Card headers show a
> title only — no description under the title. Table body is text-xs, plain
> header (no muted fill), sortable, paginated, with skeleton loading and empty states.
> Generate Report is a format dropdown for one report; with several reports it
> opens a modal where each row has one Generate button that holds the same
> dropdown. The password dialog stays short.
> Status pills use soft-fill token colours (never raw palette). Cards and dialogs
> hug their content: no empty bands and no filler spacers. A paired row may use
> `h-full` only with an `mt-auto` footer above a `border-t` rail. Dialogs confirm
> destructive actions. Toasts report
> every mutation. Dark mode is espresso & champagne, not an inversion. Tokens only
> — no new colours, shadows, or fonts.
