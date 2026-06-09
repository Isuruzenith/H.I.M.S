from pathlib import Path
from typing import Iterable

from app.db.connection import connection_scope


DATABASE_DIR = Path(__file__).resolve().parents[3] / "database"
DEFAULT_SCRIPT_ORDER = [
    "00_create_database.sql",
    "01_create_tables.sql",
    "02_insert_sample_data.sql",
    "03_functions.sql",
    "04_views.sql",
    "05_triggers.sql",
    "06_stored_procedures.sql",
    "07_bi_queries.sql",
]


def split_batches(script_text: str) -> list[str]:
    batches: list[str] = []
    current: list[str] = []

    for line in script_text.splitlines():
        if line.strip().upper() == "GO":
            batch = "\n".join(current).strip()
            if batch:
                batches.append(batch)
            current = []
        else:
            current.append(line)

    trailing = "\n".join(current).strip()
    if trailing:
        batches.append(trailing)

    return batches


def run_sql_file(path: Path) -> int:
    batches = split_batches(path.read_text(encoding="utf-8-sig"))
    with connection_scope(autocommit=True) as connection:
        cursor = connection.cursor()
        for batch in batches:
            cursor.execute(batch)
            while cursor.nextset():
                pass

    return len(batches)


def run_database_scripts(script_names: Iterable[str] = DEFAULT_SCRIPT_ORDER) -> list[dict[str, int | str]]:
    results: list[dict[str, int | str]] = []
    for script_name in script_names:
        script_path = DATABASE_DIR / script_name
        results.append(
            {
                "script": script_name,
                "batches_executed": run_sql_file(script_path),
            }
        )

    return results
