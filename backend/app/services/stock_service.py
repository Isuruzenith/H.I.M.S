from app.db.connection import execute_returning, fetch_all


def get_batches(item_id: int | None = None):
    params: list[object] = []
    filters = ["1 = 1"]
    if item_id is not None:
        filters.append("b.ItemID = ?")
        params.append(item_id)

    return fetch_all(
        f"""
        SELECT
            b.BatchID,
            b.ItemID,
            i.ItemName,
            b.SupplierID,
            s.SupplierName,
            b.BatchNumber,
            b.ReceivedDate,
            b.ManufactureDate,
            b.ExpiryDate,
            b.QuantityReceived,
            b.QuantityAvailable,
            b.UnitCost,
            dbo.fn_DaysToExpiry(b.BatchID) AS DaysToExpiry
        FROM dbo.StockBatch AS b
        INNER JOIN dbo.InventoryItem AS i
            ON i.ItemID = b.ItemID
        INNER JOIN dbo.Supplier AS s
            ON s.SupplierID = b.SupplierID
        WHERE {" AND ".join(filters)}
        ORDER BY i.ItemName, b.ExpiryDate, b.BatchID
        """,
        params,
    )


def get_transactions(limit: int = 100):
    return fetch_all(
        """
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
        ORDER BY TransactionDate DESC, TransactionID DESC
        """,
        [limit],
    )


def issue_stock(payload: dict):
    return execute_returning(
        """
        EXEC dbo.sp_IssueStockToDepartment
            @DepartmentID = ?,
            @RequestedByStaffID = ?,
            @ItemID = ?,
            @RequestedQuantity = ?
        """,
        [
            payload["department_id"],
            payload["requested_by_staff_id"],
            payload["item_id"],
            payload["requested_quantity"],
        ],
    )[0]


def receive_stock(payload: dict):
    return execute_returning(
        """
        EXEC dbo.sp_ReceiveStockBatch
            @ItemID = ?,
            @SupplierID = ?,
            @PurchaseOrderDetailID = ?,
            @BatchNumber = ?,
            @ReceivedDate = ?,
            @ManufactureDate = ?,
            @ExpiryDate = ?,
            @QuantityReceived = ?,
            @UnitCost = ?,
            @StaffID = ?
        """,
        [
            payload["item_id"],
            payload["supplier_id"],
            payload.get("purchase_order_detail_id"),
            payload["batch_number"],
            payload.get("received_date"),
            payload.get("manufacture_date"),
            payload.get("expiry_date"),
            payload["quantity_received"],
            payload["unit_cost"],
            payload["staff_id"],
        ],
    )[0]
