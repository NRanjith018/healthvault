# HealthVault System Architecture & Security Design

HealthVault is designed with a patient-first architectural philosophy: patients possess unilateral authority over their medical information, and doctors are granted read access solely to explicitly authorized records.

---

## 1. High-Level Dual-Operating Mode Architecture

HealthVault implements an automated dual-mode runtime architecture:

```
                  ┌────────────────────────────────────────┐
                  │       HealthVault Frontend Client       │
                  │   (React.js + Vite + Tailwind CSS)     │
                  └───────────────────┬────────────────────┘
                                      │
                         GET /api/health Probe (2.5s)
                                      │
                   ┌──────────────────┴──────────────────┐
                   │                                     │
           [Online & DB Ready]                  [Offline or DB Down]
                   ▼                                     ▼
        ┌─────────────────────┐               ┌─────────────────────┐
        │      LIVE MODE      │               │      DEMO MODE      │
        │  • Express REST API │               │  • localStorage Data│
        │  • MongoDB Atlas    │               │  • IndexedDB Blobs  │
        │  • JWT Auth & Bcrypt│               │  • Instant 1-Click  │
        │  • Multer File Store│               │  • Zero-Crash Fall- │
        │                     │               │    back Mechanism   │
        └─────────────────────┘               └─────────────────────┘
```

### Automatic Mode Transition Protocol
1. Upon application initialization, `checkBackendHealth()` probes `http://localhost:5000/api/health`.
2. If the backend responds with `status: "ok"` and `database.connected: true`, the application seamlessly connects to Live Mode.
3. If the backend is unreachable or MongoDB is offline, the client automatically engages **Demo Mode** and renders:
   > `Demo Mode – Using Sample Data`
4. In Demo Mode, all data operations (profile updates, document creation, doctor access grants, appointment booking, digital prescriptions, admin approvals) execute against browser `localStorage` and `IndexedDB`.
5. Changes persist across browser refreshes and can be restored anytime with **Reset Demo Data**.

---

## 2. Patient-Controlled Access Security Model

Unlike traditional hospital management systems where any doctor in an organization can read an entire chart, HealthVault enforces strict access isolation:

```
┌──────────────────────────────────────────────────────────────┐
│                    Patient: Rahul Sharma                     │
│                                                              │
│  [Record 1: Blood Test Report]      ──► Permitted to Dr. John│
│  [Record 2: CBC Report]             ──► Private (No Access)  │
│  [Prescription 1: General Consult]  ──► Permitted to Dr. John│
│  [Prescription 2: Fever Consult]    ──► Private (No Access)  │
└───────────────────────────────┬──────────────────────────────┘
                                │
               ┌────────────────┴────────────────┐
               ▼                                 ▼
      Dr. John Smith                    Dr. Sarah Jenkins
   (General Physician)                   (Cardiologist)
               │                                 │
     Permitted: 2 Records              Permitted: 0 Records
  • Blood Test Report               • No Documents Visible
  • General Consult Rx              • Access Denied
```

### Permission Enforcement Rules
1. **Granular Checkboxes**: Patients select specific documents per doctor; sharing one lab report does not expose others.
2. **Strict Doctor Filtering**: When a doctor requests a patient's records via `GET /api/doctor/authorized-patients/:patientId/documents`, the server queries the `DoctorAccess` collection for `(patientId, doctorId, status: 'active')`.
3. **Instant Revocation**: When a patient revokes permissions, `DoctorAccess.status` is set to `'revoked'` and document arrays are cleared. Subsequent requests immediately return HTTP `403 Forbidden`.
4. **Zero Administrative Backdoor**: Administrator accounts can manage users and approve practitioners, but cannot silently view private medical documents.
