# Practice365 — Project Brief & Build Spec

## What this project is

Practice365 is a **practice management & client/matter CRM prototype for solo and small law firms** — essentially a scoped-down clone of Clio Manage. It's being built as an assignment prototype: the goal is a working dashboard with a functioning time-tracking feature in the top-right corner, built on Next.js + shadcn/ui.

The full target product (per the spec doc) is much bigger than what's built so far — it covers leads, clients, matters, calendar, documents, billing, a client portal, e-signature, and an audit log. This document is the complete logic spec so Cursor can keep building toward it without losing the underlying rules, since a lot of this system is **logic-heavy, not just UI** — fields existing in the right place only matters if the *state transitions* around them are enforced correctly.

## What's already built

- `store/timer-store.ts` — Zustand store supporting **multiple concurrent running timers** per user, each tied to a matter, with pause/resume, a Client-Facing Description field, an Internal Note field, and a `stopTimer` that hands back a finished entry (currently just logged to console, not persisted).
- `components/dashboard/time-tracker.tsx` — the top-right timer widget: a popover off a clock button in the top bar, showing live elapsed time, letting you start a timer against a matter, and stop/save or discard each running timer.
- `components/dashboard/topbar.tsx` — top bar housing the timer widget and a user avatar.
- `components/dashboard/dashboard-cards.tsx` — firm dashboard cards: overdue deadlines, overdue invoices, retainer-not-collected matters, stale matters (14+ days no activity), pending leads. All derived live from mock data, not stored separately.
- `lib/mock-data.ts` + `lib/types.ts` — mock Matters, Deadlines, Invoices, Leads to drive the dashboard.
- `app/(dashboard)/layout.tsx` + `page.tsx` — wires the top bar and dashboard cards together.

**Not yet built:** everything else below. Matter detail pages, leads/intake, client records, billing/invoicing flow, client portal, e-signature, document management, calendar, audit log, and persistence (everything is mock/in-memory right now, nothing hits a database or API).

## Full requirements (from the spec doc)

### 1. Leads, Clients & Matter Records

- **Lead** is a distinct record type from Client. Every accepted intake submission creates a Lead, never a Client directly.
  - Fields: contact info, matter description, opposing party name(s), referral source, status (`New → Contacted → Engagement Sent → Converted / Declined / Lost`).
  - No matter, billing, or portal access exists for a Lead until conversion.
  - Declined/Lost leads are retained (never deleted) for pipeline reporting and conflict-check history.
- **Client** record is created *only* at Lead-to-Client conversion. Stores contact info, communication history, linked matters (a client can have multiple), notes, billing/payment history.
- **Lead → Client conversion logic:** triggered by exactly one event — the engagement letter/retainer agreement being signed (via e-signature, or manually marked signed). On that signature:
  - Client record auto-created from the Lead's contact info
  - Linked Matter record auto-created
  - Lead status → `Converted`
  - Client portal access granted
  - **This must be system-enforced, not just UI convention** — no Matter, billing, time entry, or portal access can exist against an unsigned engagement.
- **Matter** record: one per matter, linked to one client (or multiple for joint matters like divorce/co-defendants).
  - Fields: matter name, practice area, responsible attorney, open date, status, close date.
  - Status values are **configurable per practice area** (e.g. `Intake → Active → Awaiting Client → Closed`), firms can define custom statuses.
  - Every note, document, calendar event, time entry, invoice attaches to a matter (or directly to a client for non-matter items).
- **Retainer tracking** per matter: retainer amount agreed, collected (yes/no), date collected, amount collected (supports partial). Shown on matter summary and firm dashboard as a flag when work has begun but retainer isn't collected. Can be set manually or auto-set when a retainer payment comes through the portal.
- **Matter timeline:** all activity (notes, uploads, status changes, calendar events, communications) logged chronologically. **Entries are immutable** — edits create a new timestamped entry, never overwrite history.
- **Matter summary view:** a persistent block at the top of the matter view — current status, retainer status, last activity date, next deadline, date/method of last client contact. **Auto-updates from the timeline, not manually maintained.** "Last client contact" = most recent timeline entry tagged as client communication, regardless of entry type.
- **Custom fields:** firms can add fields beyond defaults on Lead/Client/Matter, definable per practice area. Custom field values must be first-class — included in search and dashboard/reporting, not a notes blob.

### 2. Client Intake

- Web-embeddable intake form, customizable per practice area.
- Captures: contact info, matter description, opposing party name(s) (for conflict checking), referral source.
- Submission creates a Lead in a review queue (never a Client/Matter directly).
- On review, attorney can: accept (→ Contacted), decline (→ Declined), or flag for more info.
- **Conflict check:** opposing party names entered at intake are checked against the firm's existing client/lead/opposing-party records; any match surfaces as a conflict flag before the Lead is accepted.
- Sending the engagement letter moves Lead → `Engagement Sent`; stays there until signature converts it (per Section 1.3).

### 3. Calendar & Deadlines

- Firm-wide calendar view + per-attorney calendar view.
- Events can link to a matter or stand alone (internal meetings etc).
- Any event can be flagged as a **deadline** (statute of limitations, filing date, response due).
- Deadlines support configurable reminder intervals (e.g. 30/14/7/1 days before), each generating its own notification, sent to the responsible attorney by default (additional recipients addable).
- Completed deadlines stay on the matter timeline with a completion timestamp (not deleted).
- Overdue, incomplete deadlines surface on the firm dashboard, sorted by how overdue.

### 4. Notes

- Free-text notes attach to a client or matter record.
- Timestamped, attributed to author, **not editable after creation** — edits create a new linked note, original preserved.
- Optional type tags (Client Call, Internal, Research, Court Appearance) for filtering.
- Full-text search across all notes the user can view, scoped by client/matter/keyword.

### 5. Document Management

- Documents upload to a matter (or client record for non-matter docs).
- Each matter has a folder structure; firms can define default folder templates per practice area (e.g. Pleadings, Correspondence, Discovery, Signed Documents).
- Documents support tagging independent of folder, enabling cross-folder search.
- **Versioning:** uploading a same-named file to the same location creates a new version, never overwrites. Version history shows uploader + timestamp per version.
- In-browser preview for PDF, DOCX, image formats — no download required.

### 6. Time Tracking & Billing — *primary focus, mostly built*

- **Rate resolution** (three levels, most specific wins): matter-level override rate > practice-area override rate > attorney's firm-wide default rate. A matter can instead be flagged flat-fee/contingency — time is still logged for internal tracking but doesn't generate a per-hour invoice charge.
  - **Rate changes are not retroactive** — entries keep the rate in effect when they were created.
- **Time entry:** manual or running timer. **Multiple concurrent timers per user across different matters** are supported. ✅ built.
  - Two distinct text fields: **Client-Facing Description** (shown to client on invoice/portal) and **Internal Note** (firm-only, never shown to client). ✅ built.
  - Each entry resolves to a rate automatically (Section 6.1) and computes line amount (duration × rate) **at entry time**, not deferred to invoicing. ⚠️ not yet built — currently no rate resolution logic exists.
- **Fixed Charges:** flat-dollar amounts on a matter, independent of timers/hourly rate (filing fees, flat document fees, whole flat-fee matters). Same two-field structure (Client-Facing Description + Internal Note). Markable Billable (flows into next invoice) or Non-Billable (record only, excluded from invoice). A flat-fee matter is typically billed via Fixed Charges, but time entries and Fixed Charges can coexist on the same matter.
- **Invoicing logic:**
  - Generated by selecting a date range + matter (or client); pulls all unbilled time entries + billable Fixed Charges in range into a Draft invoice.
  - Line items show Client-Facing Description, date, line total; time lines also show duration/rate, Fixed Charge lines show flat amount. **Internal Notes never appear on an invoice or in the portal, under any circumstance.**
  - Total = sum of included time entries + billable Fixed Charges + expenses; recalculates live while Draft, **locked once finalized** — further changes need a credit/adjustment entry, not editing the original.
  - Statuses: `Draft → Sent → Paid / Partially Paid / Overdue`.
  - Overdue invoices surface on the firm dashboard. ✅ dashboard card built, invoicing flow itself not built.

### 7. Client Portal

- Each client gets portal credentials scoped only to their own client record and linked matters — **no client can ever see another client's data.**
- Portal access granted automatically at Lead→Client conversion, never before.
- Client can view: matter status, documents explicitly shared (sharing is an explicit per-document action, never default), invoices, message history.
- **Messaging:** two-way thread **per matter**, not per client (multiple matters = multiple threads). Composed/read in matter view (attorney side) or portal matter view (client side) — client can't message outside a matter context.
  - Delivery: message stored as source of truth, triggers an email notification with a preview + link back to portal (full message body never emailed — email is notification-only).
  - Every message (both directions) auto-appends to the matter timeline.
  - Read-receipt logic: `Delivered` when stored, `Read` when recipient opens that matter/portal view — visible to sender as a status indicator.
  - Attachments on a portal message also file into the matter's document store, tagged by the originating thread.
- **Billing & payment:** clients see only `Sent`-or-later invoices (Draft excluded) and outstanding balances. Payment via Stripe, embedded in-portal.
  - On successful payment: invoice marked Paid/Partially Paid, payment entry logged to matter timeline, and if tagged as a retainer payment, Retainer Tracking fields update to collected.
  - Failed/disputed payments revert invoice to prior status and **notify staff** — never a silent failure.

### 8. E-Signature

- Any matter document can be sent for signature from the matter view.
- Generates a unique, single-use signing link emailed to the signer — valid for that document/signer only.
- Identity verified via the emailed link tied to the signer's email on file.
- Full audit trail: link sent, link opened, each page viewed, each required field completed, signature applied, document completed — every step timestamped and logged. Signer IP captured at signing.
- On completion: a certificate of completion (timestamps, IP, signer email, document hash) is generated and permanently attached; signed doc + certificate are immutable after generation.
- Completed documents file back into the matter's document store automatically, versioned against the unsigned original.

### 9. User & Firm Settings

- Two base roles: **Attorney** (full access to matters they're responsible for / granted access to) and **Staff/Paralegal** (configurable access, typically excluding billing rate visibility and trust-level financial detail).
- Matter-level access can be further restricted beyond base role (e.g. a sensitive matter visible only to the responsible attorney).
- Firm branding (name, logo, contact details) auto-applies to the client portal, generated invoices, and signing-link emails.

### 10. Activity & Audit Log

- Every create/edit/status-change/upload/version/time-entry/invoice-action/message/login is logged: acting user, timestamp, record affected, action description.
- This is **firm-wide and unfiltered** — distinct from a matter's timeline, which is the filtered, client-relevant view.
- **Append-only** — no entry editable or deletable by anyone, including admins.
- Queryable by user, record/matter, action type, date range.
- Permission changes are themselves logged as audit events.

### 11. Firm Dashboard — *built*

Aggregates, firm-wide and per-attorney: overdue deadlines, overdue invoices, matters with retainer not collected despite logged time, matters with no activity in a configurable trailing period (default 14 days), pending leads awaiting review. **Each item links to the underlying record — the dashboard stores nothing itself, it's a live query view.** ✅ built with mock data; needs to become a real query once persistence exists.

## Suggested build order for Cursor from here

1. **Persistence layer** — pick a DB (Postgres + Prisma is a safe default given the stack), model Lead/Client/Matter/TimeEntry/FixedCharge/Invoice/Deadline as real tables instead of mock arrays. Without this, nothing else can be "real."
2. **Rate resolution logic** (6.1) — needed before time entries can compute real line amounts.
3. **Matter detail page** — timeline, summary block, notes, since dashboard links currently go nowhere.
4. **Lead intake + conversion flow** (1.1–1.3, Section 2) — this is the system-enforced gate that the whole rest of the data model depends on (no matter/billing exists without it).
5. **Invoicing flow** (6.4) — draft → finalize → lock, pulling from time entries + fixed charges.
6. Client portal, e-signature, document management, calendar, and audit log can follow roughly in that order of dependency.

Note for whoever picks this up: several of these features have **state machines with hard rules** (Lead status, Matter status, Invoice status, timer pause/resume) — those transitions should be enforced in the data layer / API routes, not just in the UI, per the spec's repeated emphasis on things being "system-enforced, not a UI convention."