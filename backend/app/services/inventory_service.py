from app.db.connection import execute, execute_returning, fetch_all, fetch_one


def get_items(category: str | None = None, search: str | None = None):
    params: list[object] = []
    filters = ["1 = 1"]

    if category:
        filters.append("ItemCategory = ?")
        params.append(category)

    if search:
        filters.append("ItemName LIKE ?")
        params.append(f"%{search}%")

    return fetch_all(
        f"""
        SELECT
            ItemID,
            ItemName,
            ItemCategory,
            UnitOfMeasure,
            ReorderLevel,
            MaximumStockLevel,
            ItemStatus,
            dbo.fn_GetCurrentStock(ItemID) AS CurrentStock
        FROM dbo.InventoryItem
        WHERE {" AND ".join(filters)}
        ORDER BY ItemName
        """,
        params,
    )


def get_item(item_id: int):
    return fetch_one(
        """
        SELECT
            ItemID,
            ItemName,
            ItemCategory,
            UnitOfMeasure,
            ReorderLevel,
            MaximumStockLevel,
            ItemStatus,
            dbo.fn_GetCurrentStock(ItemID) AS CurrentStock
        FROM dbo.InventoryItem
        WHERE ItemID = ?
        """,
        [item_id],
    )


def create_item(payload: dict):
    return execute_returning(
        """
        INSERT INTO dbo.InventoryItem
            (ItemName, ItemCategory, UnitOfMeasure, ReorderLevel, MaximumStockLevel, ItemStatus)
        OUTPUT inserted.ItemID
        VALUES (?, ?, ?, ?, ?, COALESCE(?, 'Active'))
        """,
        [
            payload["item_name"],
            payload["item_category"],
            payload["unit_of_measure"],
            payload.get("reorder_level", 0),
            payload.get("maximum_stock_level", 0),
            payload.get("item_status"),
        ],
    )[0]


def update_item(item_id: int, payload: dict):
    execute(
        """
        UPDATE dbo.InventoryItem
        SET
            ItemName = ?,
            ItemCategory = ?,
            UnitOfMeasure = ?,
            ReorderLevel = ?,
            MaximumStockLevel = ?,
            ItemStatus = ?
        WHERE ItemID = ?
        """,
        [
            payload["item_name"],
            payload["item_category"],
            payload["unit_of_measure"],
            payload.get("reorder_level", 0),
            payload.get("maximum_stock_level", 0),
            payload.get("item_status", "Active"),
            item_id,
        ],
    )
    return get_item(item_id)


def update_item_status(item_id: int, status: str):
    execute(
        """
        UPDATE dbo.InventoryItem
        SET ItemStatus = ?
        WHERE ItemID = ?
        """,
        [status, item_id],
    )
    return get_item(item_id)


def get_medicines():
    return fetch_all(
        """
        SELECT
            i.ItemID,
            i.ItemName,
            i.UnitOfMeasure,
            i.ReorderLevel,
            i.MaximumStockLevel,
            dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock,
            m.GenericName,
            m.BrandName,
            m.Dosage,
            m.DrugForm,
            m.StorageCondition,
            m.PrescriptionRequired
        FROM dbo.InventoryItem AS i
        INNER JOIN dbo.Medicine AS m
            ON m.ItemID = i.ItemID
        ORDER BY i.ItemName
        """
    )


def get_equipment():
    return fetch_all(
        """
        SELECT
            i.ItemID,
            i.ItemName,
            i.UnitOfMeasure,
            i.ReorderLevel,
            i.MaximumStockLevel,
            dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock,
            e.EquipmentType,
            e.WarrantyMonths,
            e.MaintenanceRequired,
            e.ServiceFrequencyMonths
        FROM dbo.InventoryItem AS i
        INNER JOIN dbo.MedicalEquipment AS e
            ON e.ItemID = i.ItemID
        ORDER BY i.ItemName
        """
    )
