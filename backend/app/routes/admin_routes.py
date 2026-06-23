from flask import Blueprint, request

from app.services.admin_service import (
    create_admin_department,
    create_admin_staff,
    get_admin_department,
    get_admin_departments,
    get_admin_staff,
    get_admin_staff_member,
    update_admin_department,
    update_admin_department_status,
    update_admin_staff,
    update_admin_staff_status,
)
from app.utils.auth import roles_required, current_user
from app.utils.errors import handle_route_errors
from app.utils.response import error_response, success_response
from app.utils.validators import require_json_fields


admin_bp = Blueprint("admin", __name__)


ROLES = {
    "Admin",
    "InventoryManager",
    "Pharmacist",
    "ProcurementOfficer",
    "DepartmentStaff",
    "HospitalAdministrator",
}


@admin_bp.get("/staff")
@roles_required("Admin")
@handle_route_errors
def staff():
    return success_response(get_admin_staff(request.args.get("search")), "Staff loaded")


@admin_bp.post("/staff")
@roles_required("Admin")
@handle_route_errors
def add_staff():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["department_id", "full_name", "role", "email", "username"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)
    if payload.get("role") not in ROLES:
        return error_response("Role is not valid", status=422)

    return success_response(create_admin_staff(payload), "Staff member created", 201)


@admin_bp.put("/staff/<int:staff_id>")
@handle_route_errors
def edit_staff(staff_id: int):
    user = current_user()
    if user is None:
        return error_response("Authentication required", status=401)

    is_admin = user.get("Role") == "Admin"
    is_self = user.get("StaffID") == staff_id

    if not (is_admin or is_self):
        return error_response("You do not have permission to access this resource", status=403)

    payload = request.get_json(silent=True) or {}

    if is_self and not is_admin:
        current_record = get_admin_staff_member(staff_id)
        if not current_record:
            return error_response("Staff member was not found", status=404)
        # Prevent self-privilege escalation by locking fields to their current DB values
        payload["department_id"] = current_record["DepartmentID"]
        payload["role"] = current_record["Role"]
        payload["status"] = current_record["Status"]
        payload["username"] = current_record["Username"]
        payload["full_name"] = current_record["FullName"]
        payload["email"] = current_record["Email"]
        payload["phone"] = payload.get("phone") or current_record.get("Phone")
    else:
        missing = require_json_fields(payload, ["department_id", "full_name", "role", "email", "username"])
        if missing:
            return error_response("Validation failed", [f"{field} is required." for field in missing], 422)
        if payload.get("role") not in ROLES:
            return error_response("Role is not valid", status=422)

    staff_member = update_admin_staff(staff_id, payload)
    if staff_member is None:
        return error_response("Staff member was not found", status=404)
    return success_response(staff_member, "Staff member updated")


@admin_bp.patch("/staff/<int:staff_id>/status")
@roles_required("Admin")
@handle_route_errors
def staff_status(staff_id: int):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if status not in {"Active", "Inactive"}:
        return error_response("Status must be Active or Inactive", status=422)

    staff_member = update_admin_staff_status(staff_id, status)
    if staff_member is None:
        return error_response("Staff member was not found", status=404)
    return success_response(staff_member, "Staff status updated")


@admin_bp.get("/departments")
@roles_required("Admin")
@handle_route_errors
def departments():
    return success_response(get_admin_departments(request.args.get("search")), "Departments loaded")


@admin_bp.post("/departments")
@roles_required("Admin")
@handle_route_errors
def add_department():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["department_name"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(create_admin_department(payload), "Department created", 201)


@admin_bp.put("/departments/<int:department_id>")
@roles_required("Admin")
@handle_route_errors
def edit_department(department_id: int):
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["department_name"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    department = update_admin_department(department_id, payload)
    if department is None:
        return error_response("Department was not found", status=404)
    return success_response(department, "Department updated")


@admin_bp.patch("/departments/<int:department_id>/status")
@roles_required("Admin")
@handle_route_errors
def department_status(department_id: int):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if status not in {"Active", "Inactive"}:
        return error_response("Status must be Active or Inactive", status=422)

    department = update_admin_department_status(department_id, status)
    if department is None:
        return error_response("Department was not found", status=404)
    return success_response(department, "Department status updated")
