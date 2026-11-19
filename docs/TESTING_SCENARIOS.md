# HealthVault Comprehensive Testing Scenarios (Section 17 Checklist)

| # | Test Scenario | Verified Behavior | Status |
| :- | :--- | :--- | :-: |
| 1 | **Patient registration and login** | Form validates email, password, demographics; redirects to Patient Dashboard. | PASSED |
| 2 | **Doctor registration and admin approval** | Public doctor registration sets `approvalStatus: pending`; blocks login until approved. | PASSED |
| 3 | **Admin login and dashboard** | Admin logs in; views system statistics, patient directory, and pending doctor registrations. | PASSED |
| 4 | **Patient profile update** | Editing demographics and emergency contact reflects in session and persistent storage. | PASSED |
| 5 | **Medical report upload and download** | Uploads PDF/JPG/PNG with metadata; downloads file from IndexedDB/vault. | PASSED |
| 6 | **Prescription upload / manual entry** | Patients can manually log medicines or upload existing doctor slips. | PASSED |
| 7 | **Doctor creates digital prescription** | Doctor creates structured prescription; automatically available in patient's vault. | PASSED |
| 8 | **Appointment booking** | Patients select approved doctors, date and time slots; appointment status updates. | PASSED |
| 9 | **Duplicate appointment prevention** | Booking the same doctor and time slot where status is pending/approved triggers alert. | PASSED |
| 10 | **Patient grants access to selected doctor** | Patient selects specific checkboxes; doctor receives access to permitted records only. | PASSED |
| 11 | **Doctor views authorized records only** | Dr. John can view only the 2 shared documents for Rahul Sharma. | PASSED |
| 12 | **Doctor cannot access unauthorized records** | Dr. Sarah & Dr. David see zero records for Rahul; unpermitted files remain hidden. | PASSED |
| 13 | **Patient revokes access** | Patient clicks Revoke Access; access token invalidated immediately. | PASSED |
| 14 | **Access is denied after revocation** | Doctor's page reflects revocation immediately with 403 / zero document view. | PASSED |
| 15 | **Demo Mode works without backend** | If backend or MongoDB is offline, app detects health status and switches to Demo Mode. | PASSED |
| 16 | **Demo data persists after refresh** | Uses `localStorage` + `IndexedDB`; modifications persist across browser reload. | PASSED |
| 17 | **Live Mode with MongoDB** | Seamlessly connects when backend & MongoDB Atlas are active; seed script seeds DB. | PASSED |
| 18 | **Demo and live data isolation** | Demo session keys and live JWT headers remain isolated. | PASSED |
