from flask import Blueprint

from app.services.bi_service import get_dashboard_summary
from app.utils.errors import handle_route_errors
from app.utils.response import success_response


dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get("/summary")
@handle_route_errors
def summary():
    metrics = {row["Metric"]: row["Value"] for row in get_dashboard_summary()}
    return success_response(metrics, "Dashboard summary loaded")
