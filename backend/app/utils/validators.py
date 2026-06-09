from typing import Any


def require_json_fields(payload: dict[str, Any], fields: list[str]) -> list[str]:
    missing = []
    for field in fields:
        value = payload.get(field)
        if value is None or value == "":
            missing.append(field)
    return missing


def to_int(value: Any, field_name: str, minimum: int | None = None) -> tuple[int | None, str | None]:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None, f"{field_name} must be an integer."

    if minimum is not None and parsed < minimum:
        return None, f"{field_name} must be at least {minimum}."

    return parsed, None
