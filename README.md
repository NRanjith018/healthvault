# HealthVault – Digital Healthcare Management System

HealthVault is a complete, responsive full-stack digital healthcare management web application designed to empower patients to manage medical records, prescriptions, and appointments, while selectively sharing specific health documents with doctors under zero unauthorized exposure.

---

> **⚠️ DEMONSTRATION DISCLAIMER**  
> **"DEMO DATA – NOT FOR MEDICAL USE"**  
> All medical reports, laboratory test values, prescriptions, and dosages included in HealthVault are fictional demonstration records created for academic and software engineering evaluation purposes. They do not constitute medical advice.

---

## 🌟 Key Capabilities

1. **Patient-Controlled Doctor Access Management (Core Feature)**:
   - Patients have granular checkbox-level control over which doctors can access specific medical records and prescriptions.
   - Sharing one laboratory report does not expose other reports or unrelated health history.
   - Patients can view currently authorized doctors, modify permissions, or revoke access at any time with immediate effect.
2. **Pre-Configured Section 11 Demonstration**:
   - Patient **Rahul Sharma** has granted **Dr. John Smith** (General Physician) access to only 2 documents: *Blood Test Report* and *General Consultation Prescription*.
   - **Dr. Sarah Jenkins** (Cardiologist) and **Dr. David Miller** (Dermatologist) have **zero access** to Rahul's files.
3. **Automatic Dual-Operating Mode**:
   - **Live Mode**: Full-stack REST API powered by Node.js, Express, MongoDB Atlas, and JWT authentication.
   - **Demo Mode**: Automatic client fallback when the backend or MongoDB is unavailable. Uses browser `localStorage` and `IndexedDB` for file persistence without crashing.
4. **Three Dedicated User Roles**:
   - **Patient**: Upload and download lab reports, track prescriptions, manage doctor access, book appointments.
   - **Doctor**: View authorized patient records only, manage appointment schedules, issue structured digital prescriptions with medicine dosages and instructions.
   - **Admin**: Doctor registration verification and approval, patient account management, appointment monitoring, and audit log.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js 19 + Vite
  - Tailwind CSS 3
  - React Router DOM 7
  - Lucide React icons
  - Axios
  - Browser `localStorage` + `IndexedDB` for offline document storage
- **Backend**:
  - Node.js + Express.js
  - MongoDB + Mongoose ODM
  - JSON Web Tokens (JWT)
  - bcrypt password hashing
  - Multer for secure file uploads (PDF, JPG, PNG)

---

## 🔑 Predefined Demo Credentials

| Role | Name | Email | Password | Pre-Configured State |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Rahul Sharma | `patient@healthvault.com` | `Patient@123` | 5 Sample Reports, 5 Prescriptions |
| **Doctor** | Dr. John Smith | `doctor@healthvault.com` | `Doctor@123` | **Has access to 2 of Rahul's records** |
| **Doctor** | Dr. Sarah Jenkins | `sarah@healthvault.com` | `Doctor@123` | **Has NO access to Rahul's records** |
| **Doctor** | Dr. David Miller | `david@healthvault.com` | `Doctor@123` | **Has NO access to Rahul's records** |
| **Doctor** | Dr. Emily Watson | `emily@healthvault.com` | `Doctor@123` | **Pending Administrator Approval** |
| **Admin** | System Admin | `admin@healthvault.com` | `Admin@123` | Doctor verification & User management |

*(Convenient 1-click fill buttons are also available on the Login screen).*

---

## 📁 Project Folder Structure

```
HealthVault/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/          # Navbar, Footer, Sidebar, ModeBanner, Toast, etc.
│       ├── layouts/             # DashboardLayout
│       ├── pages/
│       │   ├── auth/            # LoginPage, RegisterPage
│       │   ├── patient/         # Dashboard, MedicalRecords, Prescriptions, ManageAccess, Appointments, Profile
│       │   ├── doctor/          # Dashboard, Appointments, AuthorizedRecords, Prescribe, Profile
│       │   └── admin/           # Dashboard, Patients, Doctors, Appointments
│       ├── context/             # AuthContext with automatic mode detection
│       ├── services/            # Unified API layer & demoService
│       ├── routes/              # ProtectedRoute
│       └── utils/               # initialDemoData, indexedDB helper
│
├── backend/
│   ├── config/                  # MongoDB connection & health check
│   ├── controllers/             # Auth, Patient, Doctor, Access, Appointment, Admin, Files
│   ├── middleware/              # JWT auth, Role authorization, Multer upload
│   ├── models/                  # User, Patient, Doctor, MedicalRecord, Prescription, Appointment, DoctorAccess
│   ├── routes/                  # Express REST routes
│   ├── uploads/                 # Storage directory for uploaded files
│   └── utils/                   # seed.js database seeder
│
├── docs/                        # Architecture, API docs, Demo guide, Testing checklist
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- **Node.js** v18+ and **npm** installed.
- (Optional for Live Mode): Local MongoDB or a MongoDB Atlas connection string.

---

### 2. Quick Evaluation (Demo Mode – Recommended for Instant Review)
You do **not** need MongoDB installed to evaluate the entire application.

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at the URL shown (typically `http://localhost:5173`).
3. The top banner will indicate:
   > `Demo Mode – Using Sample Data (Offline Ready)`
4. Click any of the **Quick Demo Fill** buttons on the Login page to evaluate Patient, Doctor, or Admin roles.

---

### 3. Full-Stack Setup (Live Mode with MongoDB)

1. **Setup Backend**:
   ```bash
   cd backend
   npm install
   ```
2. Configure `.env` in `backend/`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/healthvault
   JWT_SECRET=healthvault_secret_key_jwt_2026_super_secure_key
   NODE_ENV=development
   ```
   *(For MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/healthvault?retryWrites=true&w=majority`)*

3. **Seed Database with Sample Records & Permissions**:
   ```bash
   npm run seed
   ```

4. **Start Backend Server**:
   ```bash
   npm run dev
   ```
   The backend starts at `http://localhost:5000`. Test health status at `http://localhost:5000/api/health`.

5. **Start Frontend Client**:
   ```bash
   cd ../frontend
   npm run dev
   ```
   The client will detect the live backend and activate **Live Mode**!

---

## 🧪 Testing Patient-Controlled Access (Section 11)

1. **Login as Dr. John Smith** (`doctor@healthvault.com` / `Doctor@123`):
   - Open **Authorized Patient Records**.
   - Inspect patient **Rahul Sharma**: you can view only **2 documents** (*Blood Test Report* and *General Consultation Prescription*).
2. **Login as Dr. Sarah Jenkins** (`sarah@healthvault.com` / `Doctor@123`):
   - Open **Authorized Patient Records**: Rahul's private documents are completely hidden (0 documents accessible).
3. **Login as Rahul Sharma** (`patient@healthvault.com` / `Patient@123`):
   - Go to **Manage Doctor Access**.
   - Modify permissions or click **Revoke Access** on Dr. John.
   - Dr. John will immediately lose access upon page refresh.

---

## 📄 License
This project was developed for educational and software engineering demonstration purposes.
