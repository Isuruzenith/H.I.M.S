from flask import Blueprint

from app.db.connection import fetch_one
from app.utils.errors import handle_route_errors
from app.utils.response import success_response


health_bp = Blueprint("health", __name__)


@health_bp.get("/api/health")
@handle_route_errors
def health_check():
    database = fetch_one("SELECT DB_NAME() AS database_name, SYSDATETIME() AS server_time")
    return success_response(
        {
            "api": "ok",
            "database": database,
        },
        "API and database connection are healthy",
    )
