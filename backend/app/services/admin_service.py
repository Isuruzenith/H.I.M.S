from werkzeug.security import generate_password_hash

from app.db.connection import execute, execute_returning, fetch_all, fetch_one


STAFF_COLUMNS = """
    s.StaffID,
    s.DepartmentID,
    d.DepartmentName,
    s.FullName,
    s.Role,
    s.Email,
    s.Phone,
    s.Username,
    s.Status,
    s.CreatedAt
"""


def get_admin_staff(search: str | None = None):
    params: list[object] = []
    filters = ["1 = 1"]
    if search:
        filters.append("(s.FullName LIKE ? OR s.Username LIKE ? OR s.Email LIKE ? OR d.DepartmentName LIKE ?)")
        token = f"%{search}%"
        params.extend([token, token, token, token])

    return fetch_all(
        f"""
        SELECT {STAFF_COLUMNS}
        FROM dbo.Staff AS s
        INNER JOIN dbo.Department AS d
            ON d.DepartmentID = s.DepartmentID
        WHERE {" AND ".join(filters)}
        ORDER BY s.FullName
        """,
        params,
    )


def get_admin_staff_member(staff_id: int):
    return fetch_one(
        f"""
        SELECT {STAFF_COLUMNS}
        FROM dbo.Staff AS s
        INNER JOIN dbo.Department AS d
            ON d.DepartmentID = s.DepartmentID
        WHERE s.StaffID = ?
        """,
        [staff_id],
    )


def create_admin_staff(payload: dict):
    password = payload.get("password") or payload["username"]
    rows = execute_returning(
        """
        INSERT INTO dbo.Staff
            (DepartmentID, FullName, Role, Email, Phone, Username, PasswordHash, Status)
        OUTPUT inserted.StaffID
        VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 'Active'))
        """,
        [
            payload["department_id"],
            payload["full_name"],
            payload["role"],
            payload["email"],
            payload.get("phone"),
            payload["username"],
            generate_password_hash(password),
            payload.get("status"),
        ],
    )
    return get_admin_staff_member(rows[0]["StaffID"])


def update_admin_staff(staff_id: int, payload: dict):
    execute(
        """
        UPDATE dbo.Staff
        SET
            DepartmentID = ?,
            FullName = ?,
            Role = ?,
            Email = ?,
            Phone = ?,
            Username = ?,
            Status = ?
        WHERE StaffID = ?
        """,
        [
            payload["department_id"],
            payload["full_name"],
            payload["role"],
            payload["email"],
            payload.get("phone"),
            payload["username"],
            payload.get("status", "Active"),
            staff_id,
        ],
    )

    if payload.get("password"):
        execute(
            """
            UPDATE dbo.Staff
            SET PasswordHash = ?
            WHERE StaffID = ?
            """,
            [generate_password_hash(payload["password"]), staff_id],
        )

    return get_admin_staff_member(staff_id)


def update_admin_staff_status(staff_id: int, status: str):
    execute(
        """
        UPDATE dbo.Staff
        SET Status = ?
        WHERE StaffID = ?
        """,
        [status, staff_id],
    )
    return get_admin_staff_member(staff_id)


def get_admin_departments(search: str | None = None):
    params: list[object] = []
    filters = ["1 = 1"]
    if search:
        filters.append("(DepartmentName LIKE ? OR Location LIKE ? OR ContactNumber LIKE ?)")
        token = f"%{search}%"
        params.extend([token, token, token])

    return fetch_all(
        f"""
        SELECT DepartmentID, DepartmentName, Location, ContactNumber, Status, CreatedAt
        FROM dbo.Department
        WHERE {" AND ".join(filters)}
        ORDER BY DepartmentName
        """,
        params,
    )


def get_admin_department(department_id: int):
    return fetch_one(
        """
        SELECT DepartmentID, DepartmentName, Location, ContactNumber, Status, CreatedAt
        FROM dbo.Department
        WHERE DepartmentID = ?
        """,
        [department_id],
    )


def create_admin_department(payload: dict):
    rows = execute_returning(
        """
        INSERT INTO dbo.Department
            (DepartmentName, Location, ContactNumber, Status)
        OUTPUT inserted.DepartmentID
        VALUES (?, ?, ?, COALESCE(?, 'Active'))
        """,
        [
            payload["department_name"],
            payload.get("location"),
            payload.get("contact_number"),
            payload.get("status"),
        ],
    )
    return get_admin_department(rows[0]["DepartmentID"])


def update_admin_department(department_id: int, payload: dict):
    execute(
        """
        UPDATE dbo.Department
        SET
            DepartmentName = ?,
            Location = ?,
            ContactNumber = ?,
            Status = ?
        WHERE DepartmentID = ?
        """,
        [
            payload["department_name"],
            payload.get("location"),
            payload.get("contact_number"),
            payload.get("status", "Active"),
            department_id,
        ],
    )
    return get_admin_department(department_id)


def update_admin_department_status(department_id: int, status: str):
    execute(
        """
        UPDATE dbo.Department
        SET Status = ?
        WHERE DepartmentID = ?
        """,
        [status, department_id],
    )
    return get_admin_department(department_id)
