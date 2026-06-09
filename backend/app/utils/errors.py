from functools import wraps

from app.db.connection import DatabaseConnectionError
from app.utils.response import error_response


def handle_route_errors(route):
    @wraps(route)
    def wrapped(*args, **kwargs):
        try:
            return route(*args, **kwargs)
        except DatabaseConnectionError as exc:
            return error_response(str(exc), status=503)
        except Exception as exc:
            return error_response("Request failed", [str(exc)], status=500)

    return wrapped
