from contextlib import contextmanager
import re
from typing import Any, Iterable

from app.config import Config


class DatabaseConnectionError(RuntimeError):
    pass


def _load_pyodbc():
    try:
        import pyodbc  # type: ignore
    except ModuleNotFoundError as exc:
        raise DatabaseConnectionError(
            "pyodbc is not installed. Run `pip install -r backend/requirements.txt`."
        ) from exc

    return pyodbc


def get_connection(autocommit: bool = False, database: str | None = None):
    if not Config.SQLSERVER_CONNECTION_STRING:
        raise DatabaseConnectionError("SQLSERVER_CONNECTION_STRING is not configured.")

    conn_str = Config.SQLSERVER_CONNECTION_STRING
    if database is not None:
        pattern = re.compile(r'(database\s*=\s*)[^;]+', re.IGNORECASE)
        if pattern.search(conn_str):
            conn_str = pattern.sub(rf'\g<1>{database}', conn_str)
        else:
            conn_str = conn_str.rstrip(";") + f";DATABASE={database};"

    pyodbc = _load_pyodbc()
    return pyodbc.connect(conn_str, autocommit=autocommit)


@contextmanager
def connection_scope(autocommit: bool = False, database: str | None = None):
    connection = get_connection(autocommit=autocommit, database=database)
    try:
        yield connection
        if not autocommit:
            connection.commit()
    except Exception:
        if not autocommit:
            connection.rollback()
        raise
    finally:
        connection.close()


def rows_to_dicts(cursor) -> list[dict[str, Any]]:
    if cursor.description is None:
        return []

    columns = [column[0] for column in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def fetch_all(sql: str, params: Iterable[Any] | None = None) -> list[dict[str, Any]]:
    with connection_scope() as connection:
        cursor = connection.cursor()
        cursor.execute(sql, tuple(params or ()))
        return rows_to_dicts(cursor)


def fetch_one(sql: str, params: Iterable[Any] | None = None) -> dict[str, Any] | None:
    rows = fetch_all(sql, params)
    return rows[0] if rows else None


def execute(sql: str, params: Iterable[Any] | None = None) -> int:
    with connection_scope() as connection:
        cursor = connection.cursor()
        cursor.execute(sql, tuple(params or ()))
        return cursor.rowcount


def execute_returning(sql: str, params: Iterable[Any] | None = None) -> list[dict[str, Any]]:
    with connection_scope() as connection:
        cursor = connection.cursor()
        cursor.execute(sql, tuple(params or ()))
        return rows_to_dicts(cursor)
