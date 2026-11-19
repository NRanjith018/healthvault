# HealthVault REST API Documentation

All live mode API endpoints are hosted at `/api`. Protected routes require a Bearer JWT header:
`Authorization: Bearer <jwt-token>`

---

## 1. Health & Status
- **`GET /api/health`**
  - **Access**: Public
  - **Description**: Probes server status and MongoDB connectivity.
  - **Sample Response**:
    ```json
    {
      "status": "ok",
      "mode": "live",
      "timestamp": "2026-11-18T17:23:15.633Z",
      "database": {
        "connected": true,
        "statusText": "Connected to MongoDB"
      },
      "version": "1.0.0"
    }
    ```

---

## 2. Authentication (`/api/auth`)
- **`POST /api/auth/register/patient`**
  - **Body**: `{ name, email, password, phone, dateOfBirth, gender, bloodGroup, address }`
  - **Role**: Created with `role: "patient"`
- **`POST /api/auth/register/doctor`**
  - **Body**: `{ name, email, password, phone, specialization, qualification, experience, hospitalClinic }`
  - **Role**: Created with `role: "doctor"`, `approvalStatus: "pending"`
- **`POST /api/auth/login`**
  - **Body**: `{ email, password }`
  - **Validation**: Verifies bcrypt hash. If role is `doctor`, requires `approvalStatus === "approved"`.
  - **Response**: `{ success: true, token, user, profile }`
- **`GET /api/auth/me`**
  - **Header**: `Bearer <token>`
  - **Returns**: Current authenticated user and linked profile.
- **`POST /api/auth/logout`**
  - **Response**: `{ success: true, message: "Logged out successfully" }`

---

## 3. Patient Module (`/api/patient`)
- **`GET /api/patient/profile`**: Get current patient profile.
- **`PUT /api/patient/profile`**: Update demographics and emergency contact.
- **`GET /api/patient/records?category=Blood Test&search=glucose`**: List patient's medical reports.
- **`POST /api/patient/records`**: Upload report with Multer (PDF, JPG, PNG).
- **`DELETE /api/patient/records/:id`**: Delete medical record and clean associated doctor permissions.
- **`GET /api/patient/prescriptions`**: View patient prescriptions.
- **`POST /api/patient/prescriptions`**: Add prescription details manually or upload file.
- **`DELETE /api/patient/prescriptions/:id`**: Delete prescription.

---

## 4. Doctor Access Management (`/api/access`)
- **`POST /api/access/grant`**
  - **Access**: Patient only
  - **Body**:
    ```json
    {
      "doctorId": "65b...",
      "permittedRecordIds": ["65b...", "65b..."],
      "permittedPrescriptionIds": ["65b..."],
      "expiryDate": "2027-11-14"
    }
    ```
- **`GET /api/access/my-permissions`**: View all granted doctor permissions and shared document lists.
- **`POST /api/access/revoke`** or **`DELETE /api/access/:id`**: Revoke access immediately.

---

## 5. Doctor Module (`/api/doctor`)
- **`GET /api/doctor/list?specialization=Cardiologist`**: Public/searchable list of approved doctors.
- **`GET /api/doctor/profile`**: Get current doctor profile.
- **`PUT /api/doctor/profile`**: Update doctor specialization, clinic, and availability slots.
- **`GET /api/doctor/authorized-patients`**: View patients who granted active access.
- **`GET /api/doctor/authorized-patients/:patientId/documents`**:
  - **Security**: Validates active permission token.
  - **Returns**: Strictly permitted medical reports and prescriptions only.
- **`POST /api/doctor/prescriptions`**: Issue digital prescription to patient.
- **`POST /api/doctor/consultations`**: Record consultation diagnosis notes.

---

## 6. Appointments (`/api/appointments`)
- **`POST /api/appointments`**: Patient books consultation slot (duplicate prevention enforced).
- **`GET /api/appointments`**: Role-based appointment listing.
- **`PATCH /api/appointments/:id/status`**: Accept, reject, complete or cancel appointment.

---

## 7. Admin Control (`/api/admin`)
- **`GET /api/admin/stats`**: System dashboard metrics.
- **`GET /api/admin/patients`**: Search and list all patients.
- **`PUT /api/admin/patients/:id`**: Edit patient details.
- **`GET /api/admin/doctors?status=pending`**: Filter doctors by approval status.
- **`PATCH /api/admin/doctors/:id/approve`**: Approve pending doctor registration.
- **`PATCH /api/admin/doctors/:id/reject`**: Reject doctor registration.
- **`PATCH /api/admin/users/:userId/toggle-status`**: Activate or deactivate account.
- **`GET /api/admin/appointments`**: Monitor system-wide appointments.
