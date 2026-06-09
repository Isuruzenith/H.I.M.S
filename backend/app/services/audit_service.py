from app.db.connection import fetch_all


def get_audit_stock_transactions(
    search: str | None = None,
    transaction_type: str | None = None,
    limit: int = 100,
):
    params: list[object] = []
    filters = ["1 = 1"]

    if transaction_type:
        filters.append("TransactionType = ?")
        params.append(transaction_type)

    if search:
        filters.append(
            """
            (
                ItemName LIKE ?
                OR BatchNumber LIKE ?
                OR StaffName LIKE ?
                OR ReferenceType LIKE ?
                OR Notes LIKE ?
            )
            """
        )
        token = f"%{search}%"
        params.extend([token, token, token, token, token])

    return fetch_all(
        f"""
        SELECT TOP (?)
            TransactionID,
            ItemName,
            BatchNumber,
            TransactionType,
            Quantity,
            TransactionDate,
            ReferenceType,
            ReferenceID,
            StaffName,
            Notes
        FROM dbo.vw_StockTransactionReport
        WHERE {" AND ".join(filters)}
        ORDER BY TransactionDate DESC, TransactionID DESC
        """,
        [limit, *params],
    )
