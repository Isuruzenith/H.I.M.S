from flask import Blueprint, request

from app.services.supplier_service import (
    create_supplier,
    get_supplier,
    get_suppliers,
    link_supplier_item,
    update_supplier,
)
from app.utils.errors import handle_route_errors
from app.utils.response import error_response, success_response
from app.utils.validators import require_json_fields


supplier_bp = Blueprint("supplier", __name__)


@supplier_bp.get("/suppliers")
@handle_route_errors
def suppliers():
    return success_response(get_suppliers(), "Suppliers loaded")


@supplier_bp.post("/suppliers")
@handle_route_errors
def add_supplier():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["supplier_name"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(create_supplier(payload), "Supplier created", 201)


@supplier_bp.get("/suppliers/<int:supplier_id>")
@handle_route_errors
def supplier_detail(supplier_id: int):
    supplier = get_supplier(supplier_id)
    if supplier is None:
        return error_response("Supplier was not found", status=404)
    return success_response(supplier, "Supplier loaded")


@supplier_bp.put("/suppliers/<int:supplier_id>")
@handle_route_errors
def edit_supplier(supplier_id: int):
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["supplier_name"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    supplier = update_supplier(supplier_id, payload)
    if supplier is None:
        return error_response("Supplier was not found", status=404)
    return success_response(supplier, "Supplier updated")


@supplier_bp.post("/suppliers/<int:supplier_id>/items")
@handle_route_errors
def supplier_item(supplier_id: int):
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["item_id", "supplier_unit_price"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(link_supplier_item(supplier_id, payload), "Supplier item linked")
