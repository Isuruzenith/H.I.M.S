USE HealthcareInventoryDB;
GO

CREATE OR ALTER TRIGGER dbo.trg_PreventInvalidStockBatch
ON dbo.StockBatch
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted
        WHERE QuantityAvailable > QuantityReceived
           OR QuantityAvailable < 0
           OR QuantityReceived <= 0
           OR UnitCost < 0
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51001, 'Invalid stock batch quantity or unit cost.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS b
        INNER JOIN dbo.InventoryItem AS i
            ON i.ItemID = b.ItemID
        WHERE i.ItemCategory = 'Medicine'
          AND b.ExpiryDate IS NULL
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51002, 'Medicine stock batches must include an expiry date.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS b
        INNER JOIN dbo.InventoryItem AS i
            ON i.ItemID = b.ItemID
        WHERE i.ItemCategory = 'Medicine'
          AND b.ManufactureDate IS NOT NULL
          AND b.ExpiryDate <= b.ManufactureDate
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51003, 'Medicine expiry date must be later than manufacture date.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_GenerateExpiryAlert
ON dbo.StockBatch
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.ExpiryAlert (BatchID, ItemID, AlertDate, ExpiryDate, AlertType, AlertStatus)
    SELECT
        i.BatchID,
        i.ItemID,
        SYSDATETIME(),
        i.ExpiryDate,
        CASE
            WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) < 0 THEN 'Expired'
            WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) BETWEEN 0 AND 30 THEN 'Critical'
            WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) BETWEEN 31 AND 60 THEN 'Warning'
        END,
        'Open'
    FROM inserted AS i
    WHERE i.ExpiryDate IS NOT NULL
      AND i.QuantityAvailable > 0
      AND DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) <= 60
      AND NOT EXISTS
      (
          SELECT 1
          FROM dbo.ExpiryAlert AS ea
          WHERE ea.BatchID = i.BatchID
            AND ea.AlertStatus = 'Open'
            AND ea.AlertType =
                CASE
                    WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) < 0 THEN 'Expired'
                    WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) BETWEEN 0 AND 30 THEN 'Critical'
                    WHEN DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) BETWEEN 31 AND 60 THEN 'Warning'
                END
      );
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ValidateInventorySubtypes
ON dbo.InventoryItem
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.Medicine AS m
            ON m.ItemID = i.ItemID
        WHERE i.ItemCategory <> 'Medicine'
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51004, 'Items linked to Medicine must keep ItemCategory as Medicine.', 1;
    END;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS i
        INNER JOIN dbo.MedicalEquipment AS e
            ON e.ItemID = i.ItemID
        WHERE i.ItemCategory <> 'Equipment'
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51005, 'Items linked to MedicalEquipment must keep ItemCategory as Equipment.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ValidateMedicineCategory
ON dbo.Medicine
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS m
        INNER JOIN dbo.InventoryItem AS i
            ON i.ItemID = m.ItemID
        WHERE i.ItemCategory <> 'Medicine'
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51006, 'Medicine records must reference InventoryItem rows with ItemCategory = Medicine.', 1;
    END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ValidateEquipmentCategory
ON dbo.MedicalEquipment
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS
    (
        SELECT 1
        FROM inserted AS e
        INNER JOIN dbo.InventoryItem AS i
            ON i.ItemID = e.ItemID
        WHERE i.ItemCategory <> 'Equipment'
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 51007, 'MedicalEquipment records must reference InventoryItem rows with ItemCategory = Equipment.', 1;
    END;
END;
GO

