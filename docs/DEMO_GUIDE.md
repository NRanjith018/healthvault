# HealthVault Demonstration & Evaluation Guide

This guide provides step-by-step instructions for testing and evaluating HealthVault – Digital Healthcare Management System.

---

## 1. Demo Mode Operating Principles
HealthVault operates **100% independently in Demo Mode** when MongoDB or the backend server is offline. No external database installation is required for a complete evaluation.

### Predefined Demo Credentials

| Role | Name | Email | Password | Pre-Configured State |
| :--- | :--- | :--- | :--- | :--- |
| **Patient** | Rahul Sharma | `patient@healthvault.com` | `Patient@123` | Has 5 records, 5 prescriptions |
| **Doctor** | Dr. John Smith | `doctor@healthvault.com` | `Doctor@123` | **Has access to 2 of Rahul's documents** |
| **Doctor** | Dr. Sarah Jenkins | `sarah@healthvault.com` | `Doctor@123` | **Has NO access to Rahul's documents** |
| **Doctor** | Dr. David Miller | `david@healthvault.com` | `Doctor@123` | **Has NO access to Rahul's documents** |
| **Doctor** | Dr. Emily Watson | `emily@healthvault.com` | `Doctor@123` | **Pending Admin Approval** |
| **Admin** | System Admin | `admin@healthvault.com` | `Admin@123` | System oversight & Doctor verification |

---

## 2. Step-by-Step Scenario Validations

### Scenario A: Testing Section 11 Access Control Isolation
1. **Login as Dr. John Smith** (`doctor@healthvault.com` / `Doctor@123`).
   - Navigate to **Authorized Patient Records**.
   - Notice Rahul Sharma is listed.
   - Click to inspect Rahul's dossier: **Only 2 items are visible**:
     - *Blood Test Report (Complete Metabolic Panel)*
     - *General Consultation Prescription*
   - Rahul's other 3 medical reports and 4 prescriptions are completely hidden!
2. **Logout and Login as Dr. Sarah Jenkins** (`sarah@healthvault.com` / `Doctor@123`).
   - Navigate to **Authorized Patient Records**.
   - Notice **0 Authorized Patients**: Dr. Sarah cannot view any of Rahul's private records.
3. **Logout and Login as Dr. David Miller** (`david@healthvault.com` / `Doctor@123`).
   - Notice **0 Authorized Patients**: Dr. David is also strictly blocked.

---

### Scenario B: Patient Modifies & Revokes Permissions
1. **Login as Rahul Sharma** (`patient@healthvault.com` / `Patient@123`).
2. Go to **Manage Doctor Access**:
   - Locate Dr. John Smith under **Currently Authorized Doctors**.
   - Click **Modify Permissions**: check *CBC Report* and save.
   - Or click **Revoke Access**: Dr. John's permission is immediately revoked.
3. **Switch back to Dr. John Smith**:
   - Dr. John now has 0 access to Rahul's files.

---

### Scenario C: Admin Doctor Verification Workflow
1. **Login as Administrator** (`admin@healthvault.com` / `Admin@123`).
2. Navigate to **Doctors & Approvals**:
   - Filter by **Pending Approvals**.
   - Notice **Dr. Emily Watson** is pending verification.
   - Click **Approve**.
3. Now attempt logging in as Dr. Emily Watson: login succeeds!

---

### Scenario D: Digital Prescription Creation & Printing
1. **Login as Dr. John Smith**.
2. Click **Issue Digital Prescription** in sidebar:
   - Select patient Rahul Sharma.
   - Add medicines with dosage, frequency (e.g. 1-0-1), and instructions.
   - Click **Issue Prescription**.
3. **Login as Rahul Sharma**:
   - Go to **Prescriptions**: the new digital prescription is instantly in Rahul's vault!
   - Click **View Slip**: preview the styled Rx slip and test **Print / Save PDF**.

---

### Scenario E: Resetting Demo Data
At any point during evaluation, click the **Reset Demo Data** button in the top Mode Banner to restore initial sample accounts, records, prescriptions, and permissions.
