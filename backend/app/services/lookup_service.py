from app.db.connection import fetch_all, fetch_one


def get_departments():
    return fetch_all(
        """
        SELECT DepartmentID, DepartmentName, Location, ContactNumber, Status
        FROM dbo.Department
        ORDER BY DepartmentName
        """
    )


def get_staff():
    return fetch_all(
        """
        SELECT StaffID, DepartmentID, FullName, Role, Email, Phone, Username, Status
        FROM dbo.Staff
        ORDER BY FullName
        """
    )


def get_staff_by_username(username: str):
    return fetch_one(
        """
        SELECT StaffID, DepartmentID, FullName, Role, Email, Phone, Username, PasswordHash, Status
        FROM dbo.Staff
        WHERE Username = ?
        """,
        [username],
    )
