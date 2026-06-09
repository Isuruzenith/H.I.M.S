# HIMS Flask Backend

Flask REST API for the Smart Healthcare Inventory Management System.

## Setup

```powershell
cd C:\Projects\H.I.M.S\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

The project reads environment variables from `backend/.env`. Use `backend/.env.example` as a template.

## Initialize the Database

```powershell
cd C:\Projects\H.I.M.S
python backend\scripts\init_database.py
```

This runs the SQL files in `database/` in dependency order.

## Run the API

```powershell
cd C:\Projects\H.I.M.S\backend
python run.py
```

Health check:

```text
GET http://127.0.0.1:5000/api/health
```

Demo login accepts the sample users below. All sample users use password `password`.

| Role | Username | Password |
|---|---|---|
| Admin | `anjali.admin` | `password` |
| InventoryManager | `nuwan.inventory` | `password` |
| Pharmacist | `kavindi.pharma` | `password` |
| ProcurementOfficer | `dinesh.procure` | `password` |
| DepartmentStaff | `malith.er` | `password` |
| HospitalAdministrator | `harsha.admin` | `password` |
