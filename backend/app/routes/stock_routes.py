from flask import Blueprint, request

from app.services.stock_service import get_batches, get_transactions, issue_stock, receive_stock
from app.utils.errors import handle_route_errors
from app.utils.response import error_response, success_response
from app.utils.validators import require_json_fields


stock_bp = Blueprint("stock", __name__)


@stock_bp.get("/batches")
@handle_route_errors
def batches():
    item_id = request.args.get("item_id", type=int)
    return success_response(get_batches(item_id), "Stock batches loaded")


@stock_bp.get("/transactions")
@handle_route_errors
def transactions():
    limit = request.args.get("limit", default=100, type=int)
    return success_response(get_transactions(limit), "Stock transactions loaded")


@stock_bp.post("/issue")
@handle_route_errors
def issue():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(
        payload,
        ["department_id", "requested_by_staff_id", "item_id", "requested_quantity"],
    )
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(issue_stock(payload), "Stock issued successfully")


@stock_bp.post("/receive")
@handle_route_errors
def receive():
    payload = request.get_json(silent=True) or {}
    missing = require_json_fields(
        payload,
        ["item_id", "supplier_id", "batch_number", "quantity_received", "unit_cost", "staff_id"],
    )
    if missing:
        return error_response("Validation failed", [f"{field} is required." for field in missing], 422)

    return success_response(receive_stock(payload), "Stock batch received", 201)
