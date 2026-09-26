# JobSetu

> A role-based campus job portal — students discover and apply, recruiters post roles and manage applicants.

JobSetu connects students with internships and jobs shared by recruiters. The
same application serves two very different users, so authorisation is not an
afterthought bolted onto the UI: **every route is scoped by role on the server**,
and the client simply reflects what the API will allow.

```
React 18 · Redux Toolkit · Tailwind + shadcn/ui · Node.js · Express · MongoDB · JWT · Cloudinary
```

---

## Why it's built this way

**Auth lives in an httpOnly cookie, not localStorage.** The JWT is issued on
login and set as an httpOnly cookie, so it is unreadable from JavaScript and
immune to token theft via XSS. `isAuthenticated` verifies it on every protected
route and attaches the user id to the request.

**Roles are enforced server-side.** A user is a `student` or a `recruiter`.
Recruiter-only actions — creating a company, posting a job, listing applicants,
moving an application through its status — are gated in the controller, not by
hiding a button. A student hitting a recruiter endpoint directly gets rejected.

**State is predictable and survives refresh.** Redux Toolkit holds auth, jobs,
companies and applications; `redux-persist` rehydrates the store on reload so a
refresh mid-application doesn't drop the user back to the login screen.

**File uploads never touch the app server's disk.** Résumés and company logos go
through `multer` in memory → `datauri` → **Cloudinary**, and only the resulting
URL is stored on the document. The API stays stateless and horizontally
scalable.

---

## Features

### For students
- Browse and search jobs; filter by location, role and salary band
- One-click apply, with duplicate-application protection
- Track every application and its live status
- Profile with bio, skills and an uploadable résumé

### For recruiters
- Register a company and manage its profile and logo
- Post jobs against a company, with full requirement details
- See every applicant for a role, with their profile and résumé
- Move applications through **accepted / rejected** states

---

## Architecture

```
jobsetu/
├── backend/
│   ├── models/          # User, Company, Job, Application (Mongoose)
│   ├── controllers/     # business logic, one per resource
│   ├── routes/          # Express routers mounted under /api/v1
│   ├── middlewares/
│   │   ├── isAuthenticated.js   # verifies the JWT cookie
│   │   └── mutler.js            # in-memory single-file upload
│   └── utils/db.js      # Mongo connection
└── frontend/
    ├── src/components/
    │   ├── admin/       # recruiter dashboard (jobs, companies, applicants)
    │   ├── auth/        # login / signup
    │   ├── shared/      # navbar, footer
    │   └── ui/          # shadcn/ui primitives
    ├── src/redux/       # RTK slices + persisted store
    └── src/hooks/       # data-fetching hooks
```

### Data model

| Model | Key fields |
|---|---|
| **User** | `fullname`, `email`, `phoneNumber`, `password` (bcrypt), `role: student \| recruiter`, `profile { bio, skills[], resume, company, profilePhoto }` |
| **Company** | `name`, `description`, `website`, `location`, `logo`, `userId` (owner) |
| **Job** | `title`, `description`, `requirements[]`, `salary`, `experienceLevel`, `location`, `jobType`, `position`, `company`, `created_by`, `applications[]` |
| **Application** | `job`, `applicant`, `status: pending \| accepted \| rejected` |

---

## API

All routes are mounted under `/api/v1`. 🔒 = requires a valid JWT cookie.

### `/user`
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/register` | Create an account (multipart — optional profile photo) |
| `POST` | `/login` | Authenticate; sets the httpOnly JWT cookie |
| `GET` | `/logout` | Clear the cookie |
| `POST` | `/profile/update` 🔒 | Update bio, skills and résumé |

### `/company`
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/register` 🔒 | Register a company |
| `GET` | `/get` 🔒 | Companies owned by the caller |
| `GET` | `/get/:id` 🔒 | A single company |
| `PUT` | `/update/:id` 🔒 | Update details and logo |

### `/job`
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/post` 🔒 | Post a job (recruiter) |
| `GET` | `/get` 🔒 | Browse/search all jobs (student) |
| `GET` | `/getadminjobs` 🔒 | Jobs posted by the caller (recruiter) |
| `GET` | `/get/:id` 🔒 | A single job |

### `/application`
| Method | Route | Purpose |
|---|---|---|
| `GET` | `/apply/:id` 🔒 | Apply to a job |
| `GET` | `/get` 🔒 | The caller's applications |
| `GET` | `/:id/applicants` 🔒 | Applicants for a job (recruiter) |
| `POST` | `/status/:id/update` 🔒 | Accept or reject an application |

---

## Running it locally

**Prerequisites:** Node.js 18+, a MongoDB instance (local or Atlas), and a
Cloudinary account.

```bash
git clone https://github.com/Ayush44gt/JobSetu.git
cd JobSetu
```

**Backend**

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/jobsetu
SECRET_KEY=your_jwt_signing_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

```bash
npm run dev          # http://localhost:8000
```

**Frontend**

```bash
cd ../frontend
npm install
npm run dev          # http://localhost:5173
```

The backend's CORS allowlist expects the client on `http://localhost:5173`.

---

## Tech stack

| Layer | Choices |
|---|---|
| **Frontend** | React 18, Vite, Redux Toolkit, redux-persist, React Router 6, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Axios, Sonner |
| **Backend** | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, multer, datauri, cookie-parser, CORS |
| **Storage** | MongoDB, Cloudinary (résumés & logos) |

---

## Author

**Ayush Garg** — [GitHub](https://github.com/Ayush44gt) · [LinkedIn](https://www.linkedin.com/in/ayush44/)
