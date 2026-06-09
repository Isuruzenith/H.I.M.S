from flask import Blueprint, request

from app.services.audit_service import get_audit_stock_transactions
from app.utils.auth import roles_required
from app.utils.errors import handle_route_errors
from app.utils.response import success_response


audit_bp = Blueprint("audit", __name__)


@audit_bp.get("/stock-transactions")
@roles_required("Admin", "InventoryManager", "HospitalAdministrator")
@handle_route_errors
def stock_transactions():
    return success_response(
        get_audit_stock_transactions(
            search=request.args.get("search"),
            transaction_type=request.args.get("transaction_type"),
            limit=request.args.get("limit", default=100, type=int),
        ),
        "Audit transactions loaded",
    )
