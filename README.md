# Community Problem Reporting System (CPRS)

A full-stack MERN (MongoDB, Express.js, React 18, Node.js) web application that enables citizens to report local community problems—such as road damage, waste accumulation, water leakage, streetlight outages, drainage blockages, and public security hazards—directly to municipal authorities with an auditable status workflow, Chart.js analytics, and role-based portals.

Requirements source of truth: [`docs/SRS.md`](docs/SRS.md).

---

## Project Structure

```
Community-Problems/
├── client/                                         # React 18 SPA (Vite 6 + Tailwind CSS 4 + Chart.js)
│   └── src/
│       ├── api/client.js                           # Axios API client (JWT bearer auth, multipart & CSV download)
│       ├── components/                             # Layout, AdminLayout, AuthorityLayout, Header, DeleteConfirmModal, etc.
│       ├── constants/                              # Categories, workflow statuses, seed credentials
│       ├── context/AuthContext.jsx                 # Global authentication & profile context
│       ├── pages/
│       │   ├── admin/                              # AdminDashboard, AdminAnalytics, AdminAdmins, AdminCitizens, AdminAuthorities, AdminComplaints
│       │   ├── authority/                          # AuthorityDashboard, AuthorityAssigned, AuthorityAnalytics
│       │   └── ...                                 # Home, About, Login, Register, Profile, SubmitComplaint, MyComplaints, ComplaintDetail, EditComplaint
│       └── utils/authorityCategory.js              # Extracts authority department from email token (after '.' and before '@')
├── server/                                         # Node.js + Express REST API (MVC Architecture)
│   ├── scripts/seed.js                             # Idempotent database seeder (10 accounts + 7 complaints)
│   └── src/
│       ├── config/                                 # MongoDB connection (db.js), Multer (upload.js), Cloudinary (cloudinary.js)
│       ├── controllers/                            # auth, user, complaint, category, notification, analytics controllers
│       ├── middleware/                             # JWT authentication (auth.js) & RBAC (rbac.js)
│       ├── models/                                 # User, Complaint, Category, Notification, PasswordReset schemas
│       ├── routes/                                 # Express route groups (/api/auth, /api/users, /api/complaints, etc.)
│       └── utils/                                  # authorityCategory.js, statusChange.js, complaintId.js, email.js, jwt.js
├── docs/                                           # Complete System Design, SRS, Seed Credentials, UAT & Postman Collection
├── scripts/                                        # Concurrent dev runner (dev.js) & Word doc generator (generate_docs.py)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally (`mongodb://127.0.0.1:27017/cprs`) or a **MongoDB Atlas** connection URI in `server/.env`

---

## Setup & Run

### Option 1: Centralized Root Commands (Recommended)

From the project root (`Community-Problems-main/`):

```bash
npm run install:all    # Installs dependencies for both server and client
npm run seed           # Seeds MongoDB with default Admin, 7 Authorities, 2 Citizens, and sample complaints
npm run dev            # Starts BOTH Express API (:5000) and Vite React client (:5173)
```

Additional root commands:
- `npm run dev:server` — Run only the Express API (`http://localhost:5000`)
- `npm run dev:client` — Run only the React SPA (`http://localhost:5173`)
- `npm run build` — Build the production React bundle (`client/dist/`)
- `npm start` — Run server and client preview in production mode

### Option 2: Run Server & Client Separately

```bash
# Terminal 1 — Backend API (port 5000)
cd server
cp .env.example .env   # Configure MONGODB_URI, JWT_SECRET, optional CLOUDINARY_* / SMTP_*
npm install
npm run seed
npm run dev

# Terminal 2 — Frontend SPA (port 5173)
cd client
npm install
npm run dev
```

---

## Role Portals & Authority Email Pattern

### 1. Citizen Portal (`/complaints`, `/complaints/new`, `/complaints/:id`, `/complaints/:id/edit`)
- Register and sign in to submit complaints with up to **3 photos** (`JPG`/`PNG`/`WEBP`, max `5MB` each via Cloudinary or local `/uploads/`).
- Track real-time resolution timelines (`Pending Verification` → `Verified` → `Assigned` → `In Progress` → `Resolved` / `Unable to Resolve` / `Rejected`).
- Edit or delete own complaints (protected by confirmation modal) and receive lazy-loaded in-app notifications.

### 2. Admin Portal (`/admin/*` under `AdminLayout`)
- Dedicated layout with top header (left logo + right user profile icon) and collapsible sidebar (icon-only on `xs`/`sm` screens, bottom collapse toggle + logout).
- **Dashboard (`/admin`)**: Executive KPI cards, 14-day Chart.js Line & Doughnut charts, and recent complaints table.
- **Analytics & Export (`/admin/analytics`)**: Full Chart.js visualizations (Line, Bar, Doughnut), category breakdown table, date/category filters, and authenticated **CSV Export**.
- **Admins (`/admin/admins`)**: Create, edit, and delete admin accounts (self-deletion strictly blocked).
- **Users (`/admin/citizens`)**: Search/filter citizens, block/unblock accounts, and delete with confirmation modal.
- **Authorities (`/admin/authorities`)**: Manage department authorities and custom report categories (`/api/categories`).
- **Complaints (`/admin/complaints`)**: Filter/search all complaints, **Verify / Reject**, **Assign Authority**, **View**, **Edit**, and **Delete**.

### 3. Authority Portal (`/assigned/*` & `/authority/*` under `AuthorityLayout`)
- Follows the exact same layout and flow as the Admin Portal (`Dashboard`, `Complaints`, `Analytics & Export`, collapsible sidebar).
- **Automatic Department Detection & Locked Category Filter**:
  Every authority account follows the email pattern `authority.<department>@cprs.local`. The system extracts the token **after `.` and before `@`** to automatically resolve the authority's complaint category, filters all complaints and analytics to that department on both backend and frontend, and locks (`disabled`) the category filter dropdown:

| Authority Department | Login Email | Token (`after . before @`) | Auto-Filtered Category | Password |
| :--- | :--- | :--- | :--- | :--- |
| Roads & Highway Maintenance | `authority.roads@cprs.local` | `roads` | **Road Damage** | `Authority123!` |
| Waste Management & Sanitation | `authority.waste@cprs.local` | `waste` | **Waste Management** | `Authority123!` |
| Water Supply & WASA | `authority.water@cprs.local` | `water` | **Water Leakage** | `Authority123!` |
| Streetlight & Electrical | `authority.lights@cprs.local` | `lights` | **Streetlight** | `Authority123!` |
| Drainage & Stormwater | `authority.drainage@cprs.local` | `drainage` | **Drainage** | `Authority123!` |
| Public Parks & Security | `authority.security@cprs.local` | `security` | **Security** | `Authority123!` |
| General Municipal Works | `authority.general@cprs.local` | `general` | **Other** | `Authority123!` |

---

## Complete REST API Reference

### Route Groups
| Group | Base Path | Description |
| :--- | :--- | :--- |
| **Health** | `/api/health` | Service & MongoDB connection diagnostics |
| **Auth** | `/api/auth` | Registration, JWT login, forgot/reset password, default account seeding |
| **Users** | `/api/users` | Current profile (`/me`) and Admin user CRUD & status control |
| **Categories** | `/api/categories` | Public category listing & Admin category CRUD |
| **Complaints** | `/api/complaints` | Citizen submission/tracking, Admin verification/assignment, Authority status updates, shared CRUD |
| **Notifications** | `/api/notifications` | In-app status change alerts and read state management |
| **Analytics** | `/api/analytics` | Executive KPI summary, Chart.js time-series/breakdowns, and CSV export |

### Endpoints Breakdown

#### 1. Auth (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new citizen account (`name`, `email`, `phone`, `password`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and return `{ token, user }` |
| `POST` | `/api/auth/forgot-password` | Public | Generate password reset token and send reset link |
| `POST` | `/api/auth/reset-password` | Public | Reset password with valid token |
| `GET/POST` | `/api/auth/seed` | Public | Ensure default admin, authority, and citizen accounts exist |

#### 2. Users (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/me` | JWT (Any) | Get current authenticated user profile |
| `PUT` | `/api/users/me` | JWT (Any) | Update own name, phone, or password |
| `GET` | `/api/users` | Admin | List users (`?role=citizen\|authority\|admin`, `?status=active\|disabled`, `?search=`) |
| `GET` | `/api/users/:id` | Admin | Get single user details by ID |
| `POST` | `/api/users` | Admin | Create new Admin, Authority, or Citizen account |
| `PUT` | `/api/users/:id` | Admin | Update user details (`name`, `phone`, `category`, `password`, `role`) |
| `PUT` | `/api/users/:id/status` | Admin | Activate or disable user account (`{ status: "active" \| "disabled" }`) |
| `DELETE` | `/api/users/:id` | Admin | Delete user account (self-deletion prevented) |

#### 3. Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all complaint categories (auto-seeds 7 defaults if empty) |
| `POST` | `/api/categories` | Admin | Create a new complaint category (`name`, `description`) |
| `PUT` | `/api/categories/:id` | Admin | Update an existing complaint category |
| `DELETE` | `/api/categories/:id` | Admin | Delete a complaint category |

#### 4. Complaints (`/api/complaints`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Citizen | Submit complaint (`multipart/form-data`: `category`, `title`, `description`, `location`, up to 3 `images`) |
| `GET` | `/api/complaints/mine` | Citizen | List own complaints (`?status=`, `?category=`, `?search=`) |
| `GET` | `/api/complaints/assigned` | Authority | List complaints automatically scoped to the authority's department category (`?status=`, `?search=`) |
| `GET` | `/api/complaints` | Admin | List all complaints (`?status=`, `?category=`, `?authority=`, `?dateFrom=`, `?dateTo=`, `?search=`) |
| `GET` | `/api/complaints/:id` | JWT (Authorized) | Get full complaint details + `statusHistory` timeline |
| `PUT` | `/api/complaints/:id` | JWT (Authorized) | Edit complaint details and optionally replace images |
| `DELETE` | `/api/complaints/:id` | JWT (Authorized) | Permanently delete complaint and associated notifications |
| `PUT` | `/api/complaints/:id/verify` | Admin | Verify or reject pending complaint (`{ decision: "verified" \| "rejected", reason? }`) |
| `PUT` | `/api/complaints/:id/assign` | Admin | Assign verified complaint to an active authority (`{ authorityId }`) |
| `PUT` | `/api/complaints/:id/status` | Authority | Update department complaint status (`In Progress`, `Resolved`, `Unable to Resolve`) with note |

#### 5. Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | JWT (Any) | List user's in-app notifications |
| `PUT` | `/api/notifications/:id/read` | JWT (Any) | Mark a single notification as read |
| `PUT` | `/api/notifications/read-all` | JWT (Any) | Mark all notifications for the current user as read |

#### 6. Analytics (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/summary` | Admin, Authority | KPI totals, status/category breakdowns, 14-day daily trend, and recent complaints (auto-scoped for Authority) |
| `GET` | `/api/analytics/export` | Admin, Authority | Download filtered complaints as a CSV file (`?category=`, `?dateFrom=`, `?dateTo=`) |

---

## Documentation Index

| Document | Description |
| :--- | :--- |
| [`docs/SYSTEM_DESIGN_AND_DOCUMENTATION.md`](docs/SYSTEM_DESIGN_AND_DOCUMENTATION.md) | Complete System Design (Frontend & Backend), Architecture Diagrams, API Reference & Database Guide |
| [`docs/CPRS_System_Design_and_Documentation.doc`](docs/CPRS_System_Design_and_Documentation.doc) | Microsoft Word (`.doc`) System Design & Stakeholder Guide |
| [`docs/CPRS_System_Design_and_Documentation.docx`](docs/CPRS_System_Design_and_Documentation.docx) | Microsoft Word (`.docx`) OpenXML Document |
| [`docs/CPRS_System_Design_and_Guide.html`](docs/CPRS_System_Design_and_Guide.html) | Printable / PDF-ready HTML Documentation |
| [`docs/SRS.md`](docs/SRS.md) | Software Requirements Specification |
| [`docs/SEED.md`](docs/SEED.md) | Seeded Test Accounts & Credentials (`npm run seed`) |
| [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md) | User Acceptance Testing (UAT) Checklist |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Production Deployment & Environment Configuration Guide |
| [`docs/postman/CPRS.postman_collection.json`](docs/postman/CPRS.postman_collection.json) | Complete Postman API Collection |
