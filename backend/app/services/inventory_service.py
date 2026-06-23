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
    item = fetch_one(
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
    if not item:
        return None

    if item["ItemCategory"] == "Medicine":
        med = fetch_one(
            """
            SELECT GenericName, BrandName, Dosage, DrugForm, StorageCondition, PrescriptionRequired
            FROM dbo.Medicine
            WHERE ItemID = ?
            """,
            [item_id]
        )
        if med:
            item.update(med)
    elif item["ItemCategory"] == "Equipment":
        eq = fetch_one(
            """
            SELECT EquipmentType, WarrantyMonths, MaintenanceRequired, ServiceFrequencyMonths
            FROM dbo.MedicalEquipment
            WHERE ItemID = ?
            """,
            [item_id]
        )
        if eq:
            item.update(eq)

    return item


def create_item(payload: dict):
    item_id = execute_returning(
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
    )[0]["ItemID"]

    category = payload["item_category"]
    if category == "Medicine":
        execute(
            """
            INSERT INTO dbo.Medicine
                (ItemID, GenericName, BrandName, Dosage, DrugForm, StorageCondition, PrescriptionRequired)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [
                item_id,
                payload.get("generic_name", payload["item_name"]),
                payload.get("brand_name"),
                payload.get("dosage", "N/A"),
                payload.get("drug_form", "N/A"),
                payload.get("storage_condition"),
                1 if payload.get("prescription_required") else 0,
            ]
        )
    elif category == "Equipment":
        execute(
            """
            INSERT INTO dbo.MedicalEquipment
                (ItemID, EquipmentType, WarrantyMonths, MaintenanceRequired, ServiceFrequencyMonths)
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                item_id,
                payload.get("equipment_type", "General"),
                payload.get("warranty_months", 0),
                1 if payload.get("maintenance_required") else 0,
                payload.get("service_frequency_months"),
            ]
        )
    return get_item(item_id)


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

    category = payload["item_category"]
    if category == "Medicine":
        exists = fetch_one("SELECT 1 FROM dbo.Medicine WHERE ItemID = ?", [item_id])
        if exists:
            execute(
                """
                UPDATE dbo.Medicine
                SET GenericName = ?,
                    BrandName = ?,
                    Dosage = ?,
                    DrugForm = ?,
                    StorageCondition = ?,
                    PrescriptionRequired = ?
                WHERE ItemID = ?
                """,
                [
                    payload.get("generic_name", payload["item_name"]),
                    payload.get("brand_name"),
                    payload.get("dosage", "N/A"),
                    payload.get("drug_form", "N/A"),
                    payload.get("storage_condition"),
                    1 if payload.get("prescription_required") else 0,
                    item_id
                ]
            )
        else:
            execute(
                """
                INSERT INTO dbo.Medicine
                    (ItemID, GenericName, BrandName, Dosage, DrugForm, StorageCondition, PrescriptionRequired)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    item_id,
                    payload.get("generic_name", payload["item_name"]),
                    payload.get("brand_name"),
                    payload.get("dosage", "N/A"),
                    payload.get("drug_form", "N/A"),
                    payload.get("storage_condition"),
                    1 if payload.get("prescription_required") else 0,
                ]
            )
    elif category == "Equipment":
        exists = fetch_one("SELECT 1 FROM dbo.MedicalEquipment WHERE ItemID = ?", [item_id])
        if exists:
            execute(
                """
                UPDATE dbo.MedicalEquipment
                SET EquipmentType = ?,
                    WarrantyMonths = ?,
                    MaintenanceRequired = ?,
                    ServiceFrequencyMonths = ?
                WHERE ItemID = ?
                """,
                [
                    payload.get("equipment_type", "General"),
                    payload.get("warranty_months", 0),
                    1 if payload.get("maintenance_required") else 0,
                    payload.get("service_frequency_months"),
                    item_id
                ]
            )
        else:
            execute(
                """
                INSERT INTO dbo.MedicalEquipment
                    (ItemID, EquipmentType, WarrantyMonths, MaintenanceRequired, ServiceFrequencyMonths)
                VALUES (?, ?, ?, ?, ?)
                """,
                [
                    item_id,
                    payload.get("equipment_type", "General"),
                    payload.get("warranty_months", 0),
                    1 if payload.get("maintenance_required") else 0,
                    payload.get("service_frequency_months"),
                ]
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
