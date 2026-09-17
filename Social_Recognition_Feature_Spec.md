# Social Recognition — Feature Specification
### Module: Human Resource Management System (HRMS/HCM) → Performance & Development
### Sub-Tab: Employee Self-Service (ESS) → Recognition

---

## 1. Overview

Social Recognition is a new tab added under the **ESS Portal**, alongside Overview, Attendance, Payroll, Performance, and Company Documents. It allows employees and supervisors to publicly acknowledge good work tied to Oxford Suites Makati's service values, turning informal praise into measurable, reportable data.

---

## 2. Core Fields (Must-Have)

| # | Field | Description |
|---|-------|-------------|
| 1 | **Recipient + Sender** | Identifies who gave the recognition and who received it. This is what makes it "social" recognition rather than just a comment box. |
| 2 | **Core Value / Category Tag** | The most important field. Ties each recognition to an actual company value (e.g., *Guest Delight, Teamwork, Going the Extra Mile, Integrity*). Enables reporting and feeds into HR Analytics and Performance Management — free text alone gives no usable data. |
| 3 | **Short Message** | The "why" behind the recognition. Limited to 150–200 characters so employees actually write it instead of skipping the field. |
| 4 | **Recognition History (Profile)** | Displayed as a 5th card in the ESS Overview section, alongside Attendance, Payroll, Performance, and Documents. Shows all recognitions received/given by the employee. |
| 5 | **Comments / Reactions / Extended Features** | Includes comments and reactions on posts, "Employee of the Month" nomination workflows, reward redemption catalogs, and moderation queues. |

---

## 3. ESS Dashboard Integration

The Recognition card should appear in the **ESS Overview** section using the same visual pattern as existing cards:

```
🏅 RECOGNITION
3 Received · 1 Given
This month
```

---

## 4. Data Structure (Reference)

```
recognition_id
sender_id
recipient_id
category (Core Value tag)
message (150–200 char limit)
status (posted / pending / approved)
created_at
comments[]
reactions[]
```

---

## 5. Notes

- Category tags should be finalized based on Oxford Suites Makati's official service values.
- Extended features (comments, reactions, nominations, rewards catalog, moderation) can be scoped for a later phase once the core recognition flow is validated.
