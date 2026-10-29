# Seeded Test Credentials

These accounts are created by `npm run seed` (or automatically ensured on server startup via `ensureSeedUsers.js`).
All seeded accounts use the `@cprs.local` email domain.

> **Do not use these passwords in production.**

## Run the Seed Script

**From the project root (Recommended):**
```bash
npm run seed
```

**Or from the `server/` directory:**
```bash
cd server
npm run seed
```

---

## All Seeded Accounts (10 Users)

| Role | Department / Name | Email | Auto-Mapped Category (Token) | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | System Admin | `admin@cprs.local` | All Categories | `Admin123!` |
| **Authority** | Roads & Highway Maintenance | `authority.roads@cprs.local` | **Road Damage** (`roads`) | `Authority123!` |
| **Authority** | Waste Management & Sanitation | `authority.waste@cprs.local` | **Waste Management** (`waste`) | `Authority123!` |
| **Authority** | Water Supply & WASA | `authority.water@cprs.local` | **Water Leakage** (`water`) | `Authority123!` |
| **Authority** | Streetlight & Electrical | `authority.lights@cprs.local` | **Streetlight** (`lights`) | `Authority123!` |
| **Authority** | Drainage & Stormwater | `authority.drainage@cprs.local` | **Drainage** (`drainage`) | `Authority123!` |
| **Authority** | Public Parks & Security | `authority.security@cprs.local` | **Security** (`security`) | `Authority123!` |
| **Authority** | General Municipal Works | `authority.general@cprs.local` | **Other** (`general`) | `Authority123!` |
| **Citizen** | Rahim Uddin | `citizen1@cprs.local` | — | `Citizen123!` |
| **Citizen** | Karima Begum | `citizen2@cprs.local` | — | `Citizen123!` |

### Automatic Authority Category Detection
When any authority user logs in, the system inspects the email token **after `.` and before `@`** (e.g., `authority.roads@cprs.local` → `roads` → `Road Damage`), automatically filters their dashboard, complaints table, and analytics to that category, and locks (`disabled`) the category filter dropdown.

---

## Sample Seeded Complaints (7 Varied Statuses)

| Citizen | Category | Assigned Authority | Status |
| :--- | :--- | :--- | :--- |
| `citizen1@cprs.local` | Road Damage | — | `Pending Verification` |
| `citizen1@cprs.local` | Waste Management | — | `Verified` |
| `citizen1@cprs.local` | Water Leakage | — | `Rejected` |
| `citizen2@cprs.local` | Streetlight | `authority.lights@cprs.local` | `Assigned` |
| `citizen2@cprs.local` | Drainage | `authority.drainage@cprs.local` | `In Progress` |
| `citizen2@cprs.local` | Security | `authority.security@cprs.local` | `Resolved` |
| `citizen1@cprs.local` | Other | `authority.general@cprs.local` | `Unable to Resolve` |

Each complaint includes a complete `statusHistory` timeline and generates corresponding citizen notifications.

---

## Quick QA Verification Steps

1. **Citizen (`citizen1@cprs.local` / `Citizen123!`)** → Navigate to `/complaints` to view submitted complaints, edit/delete with confirmation modal, or submit a new complaint at `/complaints/new`.
2. **Admin (`admin@cprs.local` / `Admin123!`)** → Navigate to `/admin` to view the executive dashboard, `/admin/analytics` for Chart.js graphs & CSV export, `/admin/complaints` to verify/assign complaints, and `/admin/admins`, `/admin/citizens`, `/admin/authorities` to manage accounts.
3. **Authority (`authority.roads@cprs.local` / `Authority123!`)** → Navigate to `/assigned` to view the Road Damage department dashboard, `/assigned/complaints` (with locked category filter) to update complaint status, and `/assigned/analytics` to export department CSV reports.
