from flask import Blueprint, request

from app.services.bi_service import (
    get_abc_analysis,
    get_demand_summary,
    get_expiry_risk,
    get_reorder_recommendations,
    refresh_demand_summary,
)
from app.utils.errors import handle_route_errors
from app.utils.response import success_response


bi_bp = Blueprint("bi", __name__)


@bi_bp.post("/refresh")
@handle_route_errors
def refresh():
    payload = request.get_json(silent=True) or {}
    result = refresh_demand_summary(payload.get("month"), payload.get("year"))
    return success_response(result, "BI demand summary refreshed")


@bi_bp.get("/demand-summary")
@handle_route_errors
def demand_summary():
    return success_response(get_demand_summary(), "Demand summary loaded")


@bi_bp.get("/abc-analysis")
@handle_route_errors
def abc_analysis():
    return success_response(get_abc_analysis(), "ABC analysis loaded")


@bi_bp.get("/expiry-risk")
@handle_route_errors
def expiry_risk():
    return success_response(get_expiry_risk(), "Expiry risk analysis loaded")


@bi_bp.get("/reorder-recommendations")
@handle_route_errors
def reorder_recommendations():
    return success_response(get_reorder_recommendations(), "Reorder recommendations loaded")
