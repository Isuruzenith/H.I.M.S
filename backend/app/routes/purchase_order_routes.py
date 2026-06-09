from flask import Blueprint, request

from app.services.purchase_order_service import (
    add_purchase_order_detail,
    create_purchase_order,
    get_purchase_order,
    get_purchase_orders,
    update_purchase_order_status,
)
from app.utils.errors import handle_route_errors
from app.utils.response import error_response, success_response
from app.utils.validators import require_json_fields


purchase_order_bp = Blueprint("purchase_order", __name__)


@purchase_order_bp.get("")
@handle_route_errors
def purchase_orders():
    return success_response(get_purchase_orders(), "Purchase orders loaded")


@purchase_order_bp.post("")
@handle_route_errors
def add_purchase_order():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["supplier_id", "created_by_staff_id"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(create_purchase_order(payload), "Purchase order created", 201)


@purchase_order_bp.get("/<int:purchase_order_id>")
@handle_route_errors
def purchase_order_detail(purchase_order_id: int):
    purchase_order = get_purchase_order(purchase_order_id)
    if purchase_order is None:
        return error_response("Purchase order was not found", status=404)
    return success_response(purchase_order, "Purchase order loaded")


@purchase_order_bp.post("/<int:purchase_order_id>/details")
@handle_route_errors
def add_detail(purchase_order_id: int):
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(payload, ["item_id", "ordered_quantity", "unit_price"])
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(
        add_purchase_order_detail(purchase_order_id, payload),
        "Purchase order detail added",
        201,
    )


@purchase_order_bp.patch("/<int:purchase_order_id>/status")
@handle_route_errors
def update_status(purchase_order_id: int):
    payload = request.get_json(silent=True) or {}
    status = payload.get("status")
    if status not in {"Pending", "Approved", "Ordered", "PartiallyReceived", "Completed", "Cancelled"}:
        return error_response("Invalid purchase order status", status=422)

    purchase_order = update_purchase_order_status(purchase_order_id, status)
    if purchase_order is None:
        return error_response("Purchase order was not found", status=404)
    return success_response(purchase_order, "Purchase order status updated")
