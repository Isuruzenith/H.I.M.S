from app.db.connection import execute, execute_returning, fetch_all, fetch_one


def get_suppliers():
    return fetch_all(
        """
        SELECT SupplierID, SupplierName, ContactPerson, Phone, Email, Address, LeadTimeDays, Status
        FROM dbo.Supplier
        ORDER BY SupplierName
        """
    )


def get_supplier(supplier_id: int):
    return fetch_one(
        """
        SELECT SupplierID, SupplierName, ContactPerson, Phone, Email, Address, LeadTimeDays, Status
        FROM dbo.Supplier
        WHERE SupplierID = ?
        """,
        [supplier_id],
    )


def create_supplier(payload: dict):
    return execute_returning(
        """
        INSERT INTO dbo.Supplier
            (SupplierName, ContactPerson, Phone, Email, Address, LeadTimeDays, Status)
        OUTPUT inserted.SupplierID
        VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, 'Active'))
        """,
        [
            payload["supplier_name"],
            payload.get("contact_person"),
            payload.get("phone"),
            payload.get("email"),
            payload.get("address"),
            payload.get("lead_time_days", 7),
            payload.get("status"),
        ],
    )[0]


def update_supplier(supplier_id: int, payload: dict):
    execute(
        """
        UPDATE dbo.Supplier
        SET
            SupplierName = ?,
            ContactPerson = ?,
            Phone = ?,
            Email = ?,
            Address = ?,
            LeadTimeDays = ?,
            Status = ?
        WHERE SupplierID = ?
        """,
        [
            payload["supplier_name"],
            payload.get("contact_person"),
            payload.get("phone"),
            payload.get("email"),
            payload.get("address"),
            payload.get("lead_time_days", 7),
            payload.get("status", "Active"),
            supplier_id,
        ],
    )
    return get_supplier(supplier_id)


def link_supplier_item(supplier_id: int, payload: dict):
    execute(
        """
        MERGE dbo.SupplierItem AS target
        USING (SELECT ? AS SupplierID, ? AS ItemID) AS source
            ON target.SupplierID = source.SupplierID
           AND target.ItemID = source.ItemID
        WHEN MATCHED THEN
            UPDATE SET
                SupplierUnitPrice = ?,
                PreferredSupplierStatus = ?
        WHEN NOT MATCHED THEN
            INSERT (SupplierID, ItemID, SupplierUnitPrice, PreferredSupplierStatus)
            VALUES (source.SupplierID, source.ItemID, ?, ?);
        """,
        [
            supplier_id,
            payload["item_id"],
            payload["supplier_unit_price"],
            payload.get("preferred_supplier_status", False),
            payload["supplier_unit_price"],
            payload.get("preferred_supplier_status", False),
        ],
    )
    return fetch_one(
        """
        SELECT SupplierID, ItemID, SupplierUnitPrice, PreferredSupplierStatus
        FROM dbo.SupplierItem
        WHERE SupplierID = ? AND ItemID = ?
        """,
        [supplier_id, payload["item_id"]],
    )
