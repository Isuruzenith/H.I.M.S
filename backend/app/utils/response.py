from flask import jsonify


def success_response(data=None, message: str = "Operation completed successfully", status: int = 200):
    return jsonify({"success": True, "message": message, "data": data if data is not None else {}}), status


def error_response(message: str, errors=None, status: int = 400):
    return jsonify({"success": False, "message": message, "errors": errors or []}), status
