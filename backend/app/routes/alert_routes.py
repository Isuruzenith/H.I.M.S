from flask import Blueprint, request
from app.db.connection import fetch_all, execute
from app.utils.auth import roles_required
from app.utils.errors import handle_route_errors
from app.utils.response import success_response, error_response

alert_bp = Blueprint("alert", __name__)


@alert_bp.get("/expiry-alerts")
@roles_required("Admin", "InventoryManager", "Pharmacist", "HospitalAdministrator", "ProcurementOfficer")
@handle_route_errors
def get_expiry_alerts():
    status = request.args.get("status", default="Open")
    alerts = fetch_all(
        """
        SELECT
            ea.AlertID,
            ea.BatchID,
            ea.ItemID,
            i.ItemName,
            sb.BatchNumber,
            ea.AlertDate,
            ea.ExpiryDate,
            ea.AlertType,
            ea.AlertStatus
        FROM dbo.ExpiryAlert ea
        INNER JOIN dbo.InventoryItem i ON i.ItemID = ea.ItemID
        INNER JOIN dbo.StockBatch sb ON sb.BatchID = ea.BatchID
        WHERE ea.AlertStatus = ?
        ORDER BY ea.ExpiryDate ASC
        """,
        [status]
    )
    return success_response(alerts, "Expiry alerts loaded")


@alert_bp.patch("/expiry-alerts/<int:alert_id>/resolve")
@roles_required("Admin", "InventoryManager", "Pharmacist", "ProcurementOfficer")
@handle_route_errors
def resolve_expiry_alert(alert_id: int):
    count = execute(
        """
        UPDATE dbo.ExpiryAlert
        SET AlertStatus = 'Resolved',
            ResolvedDate = CAST(GETDATE() AS DATETIME2(0))
        WHERE AlertID = ? AND AlertStatus = 'Open'
        """,
        [alert_id]
    )
    if count == 0:
        return error_response("Open expiry alert was not found", status=404)
    return success_response(None, "Expiry alert resolved successfully")
