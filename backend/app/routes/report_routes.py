from flask import Blueprint

from app.services.report_service import (
    get_department_consumption,
    get_expiring_soon,
    get_low_stock,
    get_supplier_performance,
)
from app.services.stock_service import get_transactions
from app.utils.errors import handle_route_errors
from app.utils.response import success_response


report_bp = Blueprint("report", __name__)


@report_bp.get("/low-stock")
@handle_route_errors
def low_stock():
    return success_response(get_low_stock(), "Low-stock report loaded")


@report_bp.get("/expiring-soon")
@handle_route_errors
def expiring_soon():
    return success_response(get_expiring_soon(), "Expiring-soon report loaded")


@report_bp.get("/department-consumption")
@handle_route_errors
def department_consumption():
    return success_response(get_department_consumption(), "Department consumption report loaded")


@report_bp.get("/supplier-performance")
@handle_route_errors
def supplier_performance():
    return success_response(get_supplier_performance(), "Supplier performance report loaded")


@report_bp.get("/stock-transactions")
@handle_route_errors
def stock_transactions():
    return success_response(get_transactions(200), "Stock transaction report loaded")
