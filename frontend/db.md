# Database Setup Guide

This project uses Microsoft SQL Server for the backend database. The easiest local setup is to run SQL Server in Docker, connect to it with SQL Server Management Studio (SSMS), then create `backend/.env` so the Flask API can connect.

## 1. Start SQL Server with Docker

Open PowerShell and run this from anywhere:

```powershell
docker run `
  --name hims-sqlserver `
  -e "ACCEPT_EULA=Y" `
  -e "MSSQL_SA_PASSWORD=GroupK@ADBMS" `
  -p 1433:1433 `
  -d mcr.microsoft.com/mssql/server:2022-latest
```

Check that the container is running:

```powershell
docker ps
```

If the container already exists but is stopped, start it:

```powershell
docker start hims-sqlserver
```

To view SQL Server startup logs:

```powershell
docker logs hims-sqlserver
```

Wait until the logs show that SQL Server is ready for client connections before connecting from SSMS or running the setup script.

## 2. Connect with SSMS

Open SQL Server Management Studio and use these connection details:

```text
Server type: Database Engine
Server name: localhost,1433
Authentication: SQL Server Authentication
Login: sa
Password: GroupK@ADBMS
Trust server certificate: Enabled
```

After connecting, you should see the local SQL Server instance in Object Explorer.

## 3. Create the Backend `.env` File

The backend reads environment variables from:

```text
backend/.env
```

For a fresh setup, copy the example file:

```powershell
cd C:\Projects\H.I.M.S
Copy-Item backend\.env.example backend\.env
```

The `.env` file should contain:

```env
SQLSERVER_CONNECTION_STRING=DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost,1433;DATABASE=HealthcareInventoryDB;UID=sa;PWD=GroupK@ADBMS;TrustServerCertificate=yes;Encrypt=yes;
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Do not commit `backend/.env`. It is already ignored by Git.

## 4. Initialize the Database

Install backend dependencies first if needed:

```powershell
cd C:\Projects\H.I.M.S\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Then run the database scripts:

```powershell
cd C:\Projects\H.I.M.S
python backend\scripts\init_database.py
```

This runs the SQL files in `database/` in the expected order and creates the `HealthcareInventoryDB` database.

## 5. Verify in SSMS

In SSMS, refresh Object Explorer and confirm that this database exists:

```text
HealthcareInventoryDB
```

You can test it with:

```sql
USE HealthcareInventoryDB;
SELECT name FROM sys.tables ORDER BY name;
```

## 6. Run the Backend

```powershell
cd C:\Projects\H.I.M.S\backend
venv\Scripts\activate
python run.py
```

Health check:

```text
http://127.0.0.1:5000/api/health
```

## Troubleshooting

If SSMS cannot connect, check that Docker is running and the container is healthy:

```powershell
docker ps
docker logs hims-sqlserver
```

If Python cannot connect, make sure the Microsoft ODBC Driver 18 for SQL Server is installed on Windows, because the connection string uses:

```text
DRIVER={ODBC Driver 18 for SQL Server}
```

If port `1433` is already in use, stop the other SQL Server service or map Docker to another local port and update `SERVER=localhost,1433` in `backend/.env`.
