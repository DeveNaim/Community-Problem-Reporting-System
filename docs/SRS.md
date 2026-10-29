# Software Requirements Specification (SRS)
## Community Problem Reporting System
### A MERN Stack Web Application

---

## Table of Contents

1. Document Overview
2. Background & Problem Statement
3. Scope
4. User Roles & Personas
5. Functional Requirements
6. Non-Functional Requirements
7. System Architecture & Workflow
8. Technology Stack
9. Data Model (Key Entities)
10. API Requirements (High-Level)
11. UI/UX Requirements
12. Security Requirements
13. Assumptions & Constraints
14. Project Timeline
15. Acceptance Criteria / Definition of Done
16. References

---

## 1. Document Overview

### 1.1 Purpose

This Software Requirements Specification (SRS) translates the approved project proposal for the Community Problem Reporting System into an actionable technical specification for the development team. It defines the functional and non-functional requirements, data model, API surface, and delivery milestones needed to build, test, and deploy the system.

### 1.2 Intended Audience

This document is intended for the development team (frontend, backend, and QA), the project supervisor, and any future maintainers of the system. No prior context beyond this document should be required to begin implementation.

### 1.3 Project Summary

The Community Problem Reporting System is a MERN Stack (MongoDB, Express.js, React.js, Node.js) web application that allows citizens to report local community problems — such as damaged roads, waste management issues, water leakage, broken streetlights, drainage issues, and security concerns — directly to the responsible authorities. The platform replaces slow, untracked manual complaint processes with a centralized, transparent, and trackable digital workflow.

---

## 2. Background & Problem Statement

Citizens currently have no reliable way to report local problems to authorities. Manual reporting is slow, complaints are frequently lost or delayed, and there is no way for a citizen to track the status of an issue they've raised. Authorities, in turn, have no centralized system to manage, prioritize, or route incoming complaints. This creates communication gaps, delays in resolution, and general dissatisfaction.

The system addresses this by providing:

- A digital complaint submission channel available to any registered citizen.
- Real-time status tracking for submitted complaints.
- A centralized admin workflow for verifying and routing complaints to the correct authority.
- Transparent, auditable complaint history for all parties.

---

## 3. Scope

### 3.1 In Scope

- Citizen-facing web app: registration/login, complaint submission (with images), complaint tracking, notifications.
- Admin dashboard: complaint verification, user management, routing to authorities, analytics/reporting.
- Authority panel: view assigned complaints, update status/progress, close resolved issues.
- REST API backend (Node.js/Express.js) with MongoDB persistence.
- JWT-based authentication and role-based access control (Citizen, Admin, Authority).
- Notification system for status changes (in-app; email optional — see Section 12).

### 3.2 Out of Scope (v1.0)

- Native mobile applications (iOS/Android) — web is responsive but not a packaged app.
- Payment processing or any financial transactions.
- GIS/map-based geolocation pinning (may be considered as a future enhancement).
- Multi-language (i18n) support — v1.0 ships in a single language.

> Note: Out-of-scope items reflect the proposal's stated scope. Confirm with the supervisor/stakeholders before development begins if any of these are expected in v1.0.

---

## 4. User Roles & Personas

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **Citizen** | General public user who reports community issues. | Register/login, submit complaints with description & images, track status, receive notifications. |
| **Admin** | System administrator who oversees the platform. | Verify new complaints, manage user accounts, monitor activity, route complaints to authorities, view analytics. |
| **Authority** | Responsible department/staff assigned to resolve complaints. | View assigned complaints, update progress/status, mark complaints resolved. |

---

## 5. Functional Requirements

Each requirement is tagged with an ID for traceability during development and QA. Priority: Must-have (M), Should-have (S), Could-have (C).

### 5.1 Module: User Registration & Login (Citizen)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | A citizen shall be able to register with name, email, phone number, and password. | M |
| FR-1.2 | The system shall validate email format and enforce a minimum password strength (min. 8 characters, at least 1 number). | M |
| FR-1.3 | A citizen shall be able to log in using email and password; the system returns a JWT session token. | M |
| FR-1.4 | The system shall support 'forgot password' via email-based reset link. | S |
| FR-1.5 | A citizen shall be able to view and edit their own profile (name, phone, password). | S |

### 5.2 Module: Complaint Submission

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | A logged-in citizen shall be able to submit a complaint with: category, title, description, location/address, and up to 3 image attachments. | M |
| FR-2.2 | Complaint category shall be selected from a predefined list (e.g., Road Damage, Waste Management, Water Leakage, Streetlight, Drainage, Security, Other). | M |
| FR-2.3 | The system shall auto-generate a unique complaint ID and timestamp on submission. | M |
| FR-2.4 | Newly submitted complaints shall default to status 'Pending Verification'. | M |
| FR-2.5 | The system shall validate image uploads (type: jpg/png, max size: 5MB per file). | M |

### 5.3 Module: Complaint Tracking (Citizen)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | A citizen shall be able to view a list of their own submitted complaints with current status. | M |
| FR-3.2 | A citizen shall be able to open a complaint detail view showing status history/timeline. | M |
| FR-3.3 | A citizen shall receive an in-app notification whenever their complaint's status changes. | M |
| FR-3.4 | A citizen shall be able to filter/search their complaints by status or category. | S |

### 5.4 Module: Admin Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Admin shall be able to view all complaints across the system with filters (status, category, date, authority). | M |
| FR-4.2 | Admin shall be able to verify a pending complaint, marking it 'Verified' or 'Rejected' (with reason). | M |
| FR-4.3 | Admin shall be able to assign/forward a verified complaint to a specific Authority. | M |
| FR-4.4 | Admin shall be able to manage user accounts (view, disable/enable citizen and authority accounts). | M |
| FR-4.5 | Admin shall have access to an analytics view: complaint volume by category, by status, and resolution time trends. | S |

### 5.5 Module: Authority Management Panel

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Authority users shall see a list of complaints assigned to them. | M |
| FR-5.2 | Authority shall be able to update complaint status: e.g., 'In Progress', 'Resolved', 'Unable to Resolve'. | M |
| FR-5.3 | Authority shall be able to add progress notes/comments visible to Admin and the reporting citizen. | M |
| FR-5.4 | Status update by Authority shall trigger a notification to the citizen and update the complaint timeline. | M |

### 5.6 Module: Notification System

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | The system shall generate an in-app notification for: complaint verified, complaint rejected, complaint assigned, status updated, complaint resolved. | M |
| FR-6.2 | Users shall be able to view a notification list and mark notifications as read. | S |
| FR-6.3 | The system may optionally send email notifications for key status changes. | C |

### 5.7 Module: Reports & Analytics

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-7.1 | Admin shall be able to export a complaint summary report (CSV) filtered by date range. | S |
| FR-7.2 | The dashboard shall display key metrics: total complaints, resolved %, average resolution time. | S |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Pages should load within 3 seconds on a standard broadband connection; API responses under 500ms for typical queries. |
| **Scalability** | Backend architecture (Node.js/Express + MongoDB) should support horizontal scaling and an increasing complaint volume without redesign. |
| **Security** | Passwords stored using bcrypt hashing; all authenticated routes protected via JWT; role-based access control enforced server-side, not just in the UI. |
| **Usability** | Interface should be intuitive for non-technical citizen users; responsive design required for mobile and desktop browsers. |
| **Availability** | Target uptime of 99% for the deployed environment (excluding scheduled maintenance). |
| **Data Integrity** | Complaint status transitions must be logged (who changed it, when) to preserve an auditable history. |
| **Maintainability** | Codebase should follow a modular MVC-style structure with clear separation between routes, controllers, and models. |
| **Browser Support** | Latest two versions of Chrome, Firefox, Edge, and Safari. |

---

## 7. System Architecture & Workflow

The system follows a three-tier architecture typical of MERN applications:

- **Presentation Layer:** React.js single-page application (SPA), styled with Bootstrap/Tailwind CSS.
- **Application Layer:** Node.js + Express.js REST API handling business logic, authentication, and authorization.
- **Data Layer:** MongoDB, accessed via an ODM (e.g., Mongoose) for schema validation.

### 7.1 Core Workflow

1. Citizen registers/logs in and submits a complaint (with optional images).
2. Complaint enters the system with status 'Pending Verification'.
3. Admin reviews the complaint and either verifies or rejects it.
4. On verification, Admin assigns the complaint to the relevant Authority.
5. Authority updates progress/status until the issue is resolved.
6. Citizen is notified at each status change and can view the full history at any time.

---

## 8. Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, HTML5, CSS3, JavaScript, Bootstrap / Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (with Mongoose ODM recommended) |
| Authentication | JWT (JSON Web Token) |
| File Storage | Local/disk storage or cloud object storage (e.g., Cloudinary/S3) for complaint images — to be confirmed with dev team |
| Dev Tools | VS Code, GitHub (version control), Postman (API testing), MongoDB Compass |

---

## 9. Data Model (Key Entities)

The following entities represent the minimum schema needed. Field names/types are suggestions for the development team and can be refined during implementation.

### 9.1 User

| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | Primary key |
| name | String | Required |
| email | String | Required, unique |
| phone | String | Required |
| passwordHash | String | bcrypt hashed |
| role | Enum | citizen \| admin \| authority |
| status | Enum | active \| disabled |
| createdAt | Date | Auto |

### 9.2 Complaint

| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | Primary key |
| complaintId | String | Human-readable unique ID |
| citizenId | ObjectId | Ref: User |
| category | Enum | Road Damage \| Waste \| Water Leakage \| Streetlight \| Drainage \| Security \| Other |
| title | String | Required |
| description | String | Required |
| location | String | Address / area text |
| images | Array\<String\> | Up to 3 image URLs |
| status | Enum | Pending Verification \| Verified \| Rejected \| Assigned \| In Progress \| Resolved \| Unable to Resolve |
| assignedAuthorityId | ObjectId | Ref: User (role=authority), nullable |
| statusHistory | Array\<Object\> | { status, changedBy, note, timestamp } |
| createdAt / updatedAt | Date | Auto |

### 9.3 Notification

| Field | Type | Notes |
|-------|------|-------|
| _id | ObjectId | Primary key |
| userId | ObjectId | Recipient |
| complaintId | ObjectId | Related complaint |
| message | String | Notification text |
| isRead | Boolean | Default false |
| createdAt | Date | Auto |

---

## 10. API Requirements (High-Level)

The backend shall expose a RESTful API. Suggested endpoint groups below; exact routes/payloads to be finalized in an API specification document (e.g., via Postman collection) before frontend integration begins.

| Endpoint Group | Example Routes | Access |
|----------------|------------------|--------|
| Auth | POST /api/auth/register, POST /api/auth/login, POST /api/auth/forgot-password | Public |
| Users | GET /api/users/me, PUT /api/users/me, GET /api/users (admin) | Citizen / Admin |
| Complaints | POST /api/complaints, GET /api/complaints/mine, GET /api/complaints/:id | Citizen |
| Complaints (Admin) | GET /api/complaints, PUT /api/complaints/:id/verify, PUT /api/complaints/:id/assign | Admin |
| Complaints (Authority) | GET /api/complaints/assigned, PUT /api/complaints/:id/status | Authority |
| Notifications | GET /api/notifications, PUT /api/notifications/:id/read | Authenticated users |
| Analytics | GET /api/analytics/summary | Admin |

> Note: All routes except registration/login require a valid JWT in the Authorization header. Role-based middleware should reject requests where the user's role does not match the required permission for that route.

---

## 11. UI/UX Requirements

- Responsive layout supporting desktop, tablet, and mobile breakpoints.
- Citizen dashboard: 'My Complaints' list view with status badges (color-coded) and a 'Submit New Complaint' call-to-action.
- Complaint submission form: category dropdown, title, description, location field, image upload (drag-and-drop or file picker, up to 3 images).
- Admin dashboard: complaint queue with filters and bulk-visible status, plus a detail panel for verify/assign actions.
- Authority panel: assigned-complaints list with a status-update action and note field.
- Consistent status color coding across all roles (e.g., yellow = pending, blue = in progress, green = resolved, red = rejected).

---

## 12. Security Requirements

- All passwords hashed with bcrypt (or equivalent); plaintext passwords must never be stored or logged.
- JWT tokens should have a reasonable expiry (e.g., 24 hours) with refresh-token support if session persistence is required.
- Role-based access control (RBAC) must be enforced on the server side for every protected route, not just hidden in the UI.
- Input validation and sanitization required on all form submissions to prevent injection attacks (NoSQL injection, XSS).
- Uploaded images must be validated for file type and size before storage.
- HTTPS should be used in the production environment.

---

## 13. Assumptions & Constraints

- The system will be deployed as a web application; native mobile apps are out of scope for v1.0.
- Image storage strategy (local disk vs. cloud storage) is to be finalized by the development team based on hosting environment.
- Email delivery for notifications (if implemented) requires an SMTP provider or transactional email service (e.g., SendGrid) — not yet selected.
- The list of 'Authorities' (departments) is assumed to be manually seeded/managed by Admin, not self-registered.

> Note: These assumptions should be validated with the supervisor/stakeholders before or during the design phase to avoid rework.

---

## 14. Project Timeline

Per the proposal's working schedule, the project has a total planned duration of 7 months. The suggested phase breakdown below aligns development milestones to that schedule and should be adjusted to match the actual Gantt chart.

| Phase | Focus | Approx. Duration |
|-------|-------|------------------|
| Phase 1 | Requirements finalization, system design, DB schema | Month 1 |
| Phase 2 | Auth module, User management, base UI scaffolding | Month 2 |
| Phase 3 | Complaint submission & tracking modules | Month 3 |
| Phase 4 | Admin dashboard & complaint verification/assignment | Month 4 |
| Phase 5 | Authority panel, notifications | Month 5 |
| Phase 6 | Analytics/reporting, integration testing | Month 6 |
| Phase 7 | UAT, bug fixing, deployment, documentation | Month 7 |

---

## 15. Acceptance Criteria / Definition of Done

- All Must-have (M) functional requirements in Section 5 are implemented and pass QA testing.
- Role-based access is verified for all three user roles (Citizen, Admin, Authority).
- A citizen can submit a complaint, track its status end-to-end, and receive notifications on status change.
- The application is responsive and tested across the browsers listed in Section 6.
- No critical or high-severity security issues (e.g., missing auth checks, unsanitized inputs) remain open.
- API endpoints are documented (e.g., Postman collection) and match the implemented behavior.

---

## 16. References

- MERN Stack Official Documentation
- MongoDB Documentation
- React.js Documentation
- Node.js Documentation
- Express.js Documentation
- IEEE Research Papers on Smart Community Management Systems
- ResearchGate Articles on Complaint Management Systems
