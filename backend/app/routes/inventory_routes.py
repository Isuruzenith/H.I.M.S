from flask import Blueprint, request

from app.services.inventory_service import (
    create_item,
    get_equipment,
    get_item,
    get_items,
    get_medicines,
    update_item,
    update_item_status,
)
from app.services.lookup_service import get_departments, get_staff
from app.utils.errors import handle_route_errors
from app.utils.response import error_response, success_response
from app.utils.validators import require_json_fields


inventory_bp = Blueprint("inventory", __name__)


@inventory_bp.get("/departments")
@handle_route_errors
def departments():
    return success_response(get_departments(), "Departments loaded")


@inventory_bp.get("/staff")
@handle_route_errors
def staff():
    return success_response(get_staff(), "Staff loaded")


@inventory_bp.get("/items")
@handle_route_errors
def items():
    return success_response(
        get_items(
            category=request.args.get("category"),
            search=request.args.get("search"),
        ),
        "Inventory items loaded",
    )


@inventory_bp.post("/items")
@handle_route_errors
def add_item():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["item_name", "item_category", "unit_of_measure"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(create_item(payload), "Inventory item created", 201)


@inventory_bp.get("/items/<int:item_id>")
@handle_route_errors
def item_detail(item_id: int):
    item = get_item(item_id)
    if item is None:
        return error_response("Inventory item was not found", status=404)
    return success_response(item, "Inventory item loaded")


@inventory_bp.put("/items/<int:item_id>")
@handle_route_errors
def edit_item(item_id: int):
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["item_name", "item_category", "unit_of_measure"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    item = update_item(item_id, payload)
    if item is None:
        return error_response("Inventory item was not found", status=404)
    return success_response(item, "Inventory item updated")


@inventory_bp.patch("/items/<int:item_id>/status")
@handle_route_errors
def item_status(item_id: int):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if status not in {"Active", "Inactive"}:
        return error_response("Status must be Active or Inactive", status=422)

    item = update_item_status(item_id, status)
    if item is None:
        return error_response("Inventory item was not found", status=404)
    return success_response(item, "Inventory item status updated")


@inventory_bp.get("/medicines")
@handle_route_errors
def medicines():
    return success_response(get_medicines(), "Medicines loaded")


@inventory_bp.get("/equipment")
@handle_route_errors
def equipment():
    return success_response(get_equipment(), "Equipment loaded")
