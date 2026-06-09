from functools import wraps
from typing import Callable

from flask import session

from app.utils.response import error_response


def current_user() -> dict | None:
    user = session.get("user")
    return user if isinstance(user, dict) else None


def login_required(route: Callable):
    @wraps(route)
    def wrapped(*args, **kwargs):
        if current_user() is None:
            return error_response("Authentication required", status=401)
        return route(*args, **kwargs)

    return wrapped


def roles_required(*roles: str):
    allowed = set(roles)

    def decorator(route: Callable):
        @wraps(route)
        def wrapped(*args, **kwargs):
            user = current_user()
            if user is None:
                return error_response("Authentication required", status=401)
            if user.get("Role") not in allowed:
                return error_response("You do not have permission to access this resource", status=403)
            return route(*args, **kwargs)

        return wrapped

    return decorator
