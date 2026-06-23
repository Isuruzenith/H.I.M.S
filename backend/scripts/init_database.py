from pathlib import Path
import sys


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.db.sql_runner import run_database_scripts  # noqa: E402


if __name__ == "__main__":
    results = run_database_scripts()
    for result in results:
        print(f"{result['script']}: {result['batches_executed']} batches executed")
