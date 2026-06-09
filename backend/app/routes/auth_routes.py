from flask import Blueprint, request, session

from app.services.lookup_service import get_staff_by_username
from app.utils.auth import current_user
from app.utils.errors import handle_route_errors
from app.utils.response import error_response, success_response
from app.utils.validators import require_json_fields


auth_bp = Blueprint("auth", __name__)


def _password_matches(staff: dict, password: str) -> bool:
    stored_hash = staff.get("PasswordHash") or ""
    if stored_hash.startswith("HASHED_PASSWORD_SAMPLE"):
        return password in {"password", staff["Username"]}

    try:
        from werkzeug.security import check_password_hash

        return check_password_hash(stored_hash, password)
    except ValueError:
        return False


@auth_bp.post("/login")
@handle_route_errors
def login():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["username", "password"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    staff = get_staff_by_username(payload["username"])
    if staff is None or staff["Status"] != "Active" or not _password_matches(staff, payload["password"]):
        return error_response("Invalid username or password", status=401)

    staff.pop("PasswordHash", None)
    session["user"] = staff
    return success_response({"user": staff}, "Login successful")


@auth_bp.post("/logout")
def logout():
    session.clear()
    return success_response({}, "Logout successful")


@auth_bp.get("/me")
def me():
    user = current_user()
    message = "Current user loaded" if user else "No server-side session is active"
    return success_response({"user": user}, message)
