from app.db.connection import execute, execute_returning, fetch_all, fetch_one


def get_purchase_orders():
    return fetch_all(
        """
        SELECT
            po.PurchaseOrderID,
            po.SupplierID,
            s.SupplierName,
            po.CreatedByStaffID,
            st.FullName AS CreatedBy,
            po.OrderDate,
            po.ExpectedDeliveryDate,
            po.CompletedDate,
            po.OrderStatus
        FROM dbo.PurchaseOrder AS po
        INNER JOIN dbo.Supplier AS s
            ON s.SupplierID = po.SupplierID
        INNER JOIN dbo.Staff AS st
            ON st.StaffID = po.CreatedByStaffID
        ORDER BY po.OrderDate DESC, po.PurchaseOrderID DESC
        """
    )


def get_purchase_order(purchase_order_id: int):
    header = fetch_one(
        """
        SELECT
            po.PurchaseOrderID,
            po.SupplierID,
            s.SupplierName,
            po.CreatedByStaffID,
            st.FullName AS CreatedBy,
            po.OrderDate,
            po.ExpectedDeliveryDate,
            po.CompletedDate,
            po.OrderStatus
        FROM dbo.PurchaseOrder AS po
        INNER JOIN dbo.Supplier AS s
            ON s.SupplierID = po.SupplierID
        INNER JOIN dbo.Staff AS st
            ON st.StaffID = po.CreatedByStaffID
        WHERE po.PurchaseOrderID = ?
        """,
        [purchase_order_id],
    )

    if header is None:
        return None

    header["details"] = fetch_all(
        """
        SELECT
            pod.PurchaseOrderDetailID,
            pod.ItemID,
            i.ItemName,
            pod.OrderedQuantity,
            pod.ReceivedQuantity,
            pod.UnitPrice
        FROM dbo.PurchaseOrderDetail AS pod
        INNER JOIN dbo.InventoryItem AS i
            ON i.ItemID = pod.ItemID
        WHERE pod.PurchaseOrderID = ?
        ORDER BY pod.PurchaseOrderDetailID
        """,
        [purchase_order_id],
    )
    return header


def create_purchase_order(payload: dict):
    return execute_returning(
        """
        EXEC dbo.sp_CreatePurchaseOrder
            @SupplierID = ?,
            @CreatedByStaffID = ?,
            @ExpectedDeliveryDate = ?
        """,
        [
            payload["supplier_id"],
            payload["created_by_staff_id"],
            payload.get("expected_delivery_date"),
        ],
    )[0]


def add_purchase_order_detail(purchase_order_id: int, payload: dict):
    return execute_returning(
        """
        EXEC dbo.sp_AddPurchaseOrderDetail
            @PurchaseOrderID = ?,
            @ItemID = ?,
            @OrderedQuantity = ?,
            @UnitPrice = ?
        """,
        [
            purchase_order_id,
            payload["item_id"],
            payload["ordered_quantity"],
            payload["unit_price"],
        ],
    )[0]


def update_purchase_order_status(purchase_order_id: int, status: str):
    execute(
        """
        UPDATE dbo.PurchaseOrder
        SET
            OrderStatus = ?,
            CompletedDate = CASE WHEN ? = 'Completed' THEN CAST(GETDATE() AS DATE) ELSE CompletedDate END
        WHERE PurchaseOrderID = ?
        """,
        [status, status, purchase_order_id],
    )
    return get_purchase_order(purchase_order_id)
