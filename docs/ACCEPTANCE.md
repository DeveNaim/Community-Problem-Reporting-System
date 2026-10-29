# Acceptance Criteria Checklist (SRS Section 15)

Use this checklist for User Acceptance Testing (UAT) and final project verification.

## Functional Requirements (Must-Have)

| ID | Requirement | Status |
| :--- | :--- | :--- |
| FR-1.1 | Citizen registration (`name`, `email`, `phone`, `password`) | Done |
| FR-1.2 | Email + password validation | Done |
| FR-1.3 | Login returns JWT and role-based session | Done |
| FR-2.1–FR-2.5 | Complaint submission with up to 3 images (Cloudinary + local disk fallback) | Done |
| FR-3.1–FR-3.3 | Citizen complaint list, detail timeline, edit/delete with confirm modal, notifications | Done |
| FR-4.1–FR-4.4 | Admin portal (`AdminLayout`), complaint verify/reject/assign, admin/citizen/authority/category management | Done |
| FR-5.1–FR-5.4 | Authority portal (`AuthorityLayout`), auto-filtered department queue from email pattern (`after . before @`), disabled category filter, status updates | Done |
| FR-6.1 | In-app notifications for status changes | Done |

## Should-Have / Could-Have Requirements (Implemented)

| ID | Requirement | Status |
| :--- | :--- | :--- |
| FR-1.4 | Forgot & reset password flow | Done |
| FR-1.5 | Profile view, avatar customization & password update | Done |
| FR-3.4 | Citizen, Admin, and Authority filter/search | Done |
| FR-4.5 | Dedicated Chart.js Analytics & CSV Export pages (`/admin/analytics`, `/assigned/analytics`) | Done |
| FR-6.2 | Mark individual or all notifications as read | Done |
| FR-6.3 | Optional SMTP email notifications on status change | Done (when SMTP configured) |
| FR-7.1 | CSV export filtered by category and date range | Done |
| FR-7.2 | Dashboard KPI metrics (total, resolved %, avg resolution days, 14-day trend) | Done |

## Role-Based Access & Layout Architecture

- [x] **Only Admin pages (`/admin/*`) render under `AdminLayout`**; public/shared pages (`/`, `/about`, `/profile`) use standard `Layout`
- [x] **Only Authority pages (`/assigned/*`, `/authority/*`) render under `AuthorityLayout`**
- [x] Both `AdminLayout` and `AuthorityLayout` feature a top header with left logo + right user icon only, collapsible left sidebar, bottom collapse button + logout, and icon-only navigation on `xs`/`sm` viewports
- [x] Authority accounts (`authority.<dept>@cprs.local`) automatically detect their category from the email token between `.` and `@` and disable the category filter dropdown
- [x] Every complaint management view provides **View**, **Edit**, and **Delete** (with `DeleteConfirmModal`), plus loading, error, and empty states

## Security Review (SRS Section 12)

- [x] Passwords hashed with `bcryptjs` (cost factor 12)
- [x] JWT Bearer authentication enforced on all protected routes
- [x] Server-side RBAC (`requireRole`) and department ownership checks enforced on all endpoints
- [x] Admin self-deletion and self-demotion strictly blocked on both client and server
- [x] Image upload validation (`JPG`/`PNG`/`WEBP`, max `5MB` per file, max `3` files)
- [ ] HTTPS in production — configure at reverse proxy / load balancer deploy time (see [`docs/DEPLOYMENT.md`](DEPLOYMENT.md))

## Documentation Deliverables

- [x] Root overview & API reference: [`README.md`](../README.md)
- [x] Full System Design & Stakeholder Guide: [`docs/SYSTEM_DESIGN_AND_DOCUMENTATION.md`](SYSTEM_DESIGN_AND_DOCUMENTATION.md)
- [x] Microsoft Word (`.doc`): [`docs/CPRS_System_Design_and_Documentation.doc`](CPRS_System_Design_and_Documentation.doc)
- [x] Microsoft Word (`.docx`): [`docs/CPRS_System_Design_and_Documentation.docx`](CPRS_System_Design_and_Documentation.docx)
- [x] Printable HTML/PDF Guide: [`docs/CPRS_System_Design_and_Guide.html`](CPRS_System_Design_and_Guide.html)
- [x] Seed credentials & test cases: [`docs/SEED.md`](SEED.md)
- [x] Postman collection: [`docs/postman/CPRS.postman_collection.json`](postman/CPRS.postman_collection.json)
