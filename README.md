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
login and set as an httpOnly cookie, so it is unreadable from JavaScript.
`isAuthenticated` verifies it on every protected route and attaches the user id
and role to the request. Nothing about the session is stored in the browser; on
page load the client calls `/user/me` to restore it.

**Roles are enforced server-side.** A user is a `student` or a `recruiter`.
The `authorize(role)` middleware gates every role-specific route, and
controllers also check ownership: a recruiter can only edit their own
companies and jobs and only review applicants for jobs they posted.

**Errors always get a response.** Controllers are wrapped in `catchAsync` and
throw `ApiError`; one error middleware turns those, plus Mongoose and multer
errors, into `{ success: false, message }` with the right status code.

**File uploads never touch the app server's disk.** Résumés, photos and company
logos go through `multer` in memory → `datauri` → **Cloudinary** (under a
`jobsetu/` folder), and only the resulting URL is stored. Résumés are opened
through `/user/resume/:id`, which redirects to a short-lived signed link, so
they work even when the Cloudinary account blocks public PDF delivery.

---

## Features

### For students
- Browse and search jobs without logging in; filter by location, job type,
  salary band and experience, and sort by newest or highest salary
- One-click apply, with duplicate-application protection, and withdraw while
  an application is still pending
- Save jobs for later
- Track every application and its status
- Profile with bio, skills, photo and an uploadable PDF résumé

### For recruiters
- Register companies and manage their profile and logo
- Post, edit, close/reopen and delete jobs
- Dashboard numbers: jobs posted, open jobs, applicants, awaiting review
- See every applicant for a role, with their skills and résumé
- Move applications between **pending / accepted / rejected**

---

## Architecture

```
jobsetu/
├── backend/
│   ├── models/          # User, Company, Job, Application (Mongoose)
│   ├── controllers/     # business logic, one per resource
│   ├── routes/          # Express routers mounted under /api/v1
│   ├── middlewares/
│   │   ├── isAuthenticated.js   # verifies the JWT cookie, authorize(role)
│   │   ├── multer.js            # in-memory uploads with type and size limits
│   │   └── error.js             # 404 and error responses
│   ├── seed/seed.js     # demo data
│   └── utils/           # db connection, Cloudinary, ApiError
└── frontend/
    ├── src/components/
    │   ├── admin/       # recruiter dashboard (jobs, companies, applicants)
    │   ├── auth/        # login / signup
    │   ├── shared/      # navbar, footer, layout, route guards, states
    │   └── ui/          # shadcn/ui primitives
    ├── src/redux/       # auth slice
    ├── src/hooks/       # useFetch, useSavedJobs
    └── src/lib/         # axios client, formatters, filter options
```

### Data model

| Model | Key fields |
|---|---|
| **User** | `fullname`, `email`, `phoneNumber`, `password` (bcrypt), `role: student \| recruiter`, `profile { bio, skills[], resume, resumeOriginalName, profilePhoto }`, `savedJobs[]` |
| **Company** | `name`, `description`, `website`, `location`, `logo`, `userId` (owner) |
| **Job** | `title`, `description`, `requirements[]`, `salary` (LPA), `experienceLevel` (years), `location`, `jobType`, `position`, `isOpen`, `company`, `created_by`, `applications[]` |
| **Application** | `job`, `applicant`, `status: pending \| accepted \| rejected` (unique per job + applicant) |

---

## API

All routes are mounted under `/api/v1`. 🔒 = requires a valid JWT cookie,
S = students only, R = recruiters only.

### `/user`
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/register` | Create an account (multipart — optional profile photo) |
| `POST` | `/login` | Authenticate; sets the httpOnly JWT cookie |
| `GET` | `/logout` | Clear the cookie |
| `GET` | `/me` 🔒 | The logged-in user |
| `POST` | `/profile/update` 🔒 | Update details, skills, photo and résumé |
| `GET` | `/resume/:id` 🔒 | Open a résumé (own, or any applicant's for recruiters) |
| `GET` | `/saved` 🔒 S | Saved jobs |
| `POST` | `/saved/:id` 🔒 S | Save or unsave a job |

### `/company`
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/register` 🔒 R | Register a company |
| `GET` | `/get` 🔒 R | Companies owned by the caller |
| `GET` | `/get/:id` 🔒 | A single company |
| `PUT` | `/update/:id` 🔒 R | Update details and logo (owner) |
| `DELETE` | `/delete/:id` 🔒 R | Delete a company with its jobs and applications (owner) |

### `/job`
| Method | Route | Purpose |
|---|---|---|
| `GET` | `/get` | Search open jobs (`keyword`, `location`, `jobType`, `salaryMin`, `salaryMax`, `experienceMax`, `sort`) |
| `GET` | `/meta` | Locations, job types and totals for the filters and home page |
| `GET` | `/get/:id` | A single job, with the caller's application status when logged in |
| `POST` | `/post` 🔒 R | Post a job under a company the caller owns |
| `GET` | `/getadminjobs` 🔒 R | Jobs posted by the caller, with applicant counts |
| `PUT` | `/update/:id` 🔒 R | Edit a job (owner) |
| `PATCH` | `/status/:id` 🔒 R | Close or reopen a job (owner) |
| `DELETE` | `/delete/:id` 🔒 R | Delete a job and its applications (owner) |

### `/application`
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/apply/:id` 🔒 S | Apply to a job |
| `GET` | `/get` 🔒 S | The caller's applications |
| `DELETE` | `/withdraw/:id` 🔒 S | Withdraw a pending application |
| `GET` | `/:id/applicants` 🔒 R | Applicants for a job (owner) |
| `POST` | `/status/:id/update` 🔒 R | Set an application to pending, accepted or rejected (owner) |

---

## Running it locally

**Prerequisites:** Node.js 18+, a MongoDB database (Atlas or local), and a
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
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/jobsetu
SECRET_KEY=your_jwt_signing_secret
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
# optional, defaults to http://localhost:5173
CLIENT_URL=http://localhost:5173
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

The frontend calls `http://localhost:8000/api/v1` by default; set
`VITE_API_URL` in `frontend/.env` to point it elsewhere.

### Demo data

```bash
cd backend
npm run seed
```

This **deletes every user, company, job and application** in the database and
creates 6 recruiters, 24 students, 12 companies, about 50 jobs and about 220
applications, including edge cases (closed jobs, jobs with no applicants, an
unpaid role, students with no résumé or skills, a recruiter with no company).

Every demo account uses the password `Demo@1234`:

| Role | Email |
|---|---|
| Student | `student@jobsetu.dev` |
| Recruiter | `recruiter@jobsetu.dev` |
| Recruiter with no company yet | `new.recruiter@jobsetu.dev` |

---

## Tech stack

| Layer | Choices |
|---|---|
| **Frontend** | React 18, Vite, Redux Toolkit, React Router 6, Tailwind CSS, shadcn/ui (Radix), Framer Motion, Axios, Sonner |
| **Backend** | Node.js, Express 4, Mongoose 8, JWT, bcryptjs, multer, datauri, cookie-parser, CORS |
| **Storage** | MongoDB, Cloudinary (résumés, photos & logos) |

---

## Author

**Ayush Garg** — [GitHub](https://github.com/Ayush44gt) · [LinkedIn](https://www.linkedin.com/in/ayush44/)
