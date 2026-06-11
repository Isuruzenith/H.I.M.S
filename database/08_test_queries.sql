USE HealthcareInventoryDB;
GO

SELECT
    'DB-01 Table counts' AS TestName,
    (SELECT COUNT(*) FROM dbo.Department) AS DepartmentCount,
    (SELECT COUNT(*) FROM dbo.Staff) AS StaffCount,
    (SELECT COUNT(*) FROM dbo.Supplier) AS SupplierCount,
    (SELECT COUNT(*) FROM dbo.InventoryItem) AS InventoryItemCount,
    (SELECT COUNT(*) FROM dbo.Medicine) AS MedicineCount,
    (SELECT COUNT(*) FROM dbo.MedicalEquipment) AS MedicalEquipmentCount,
    (SELECT COUNT(*) FROM dbo.StockBatch) AS StockBatchCount,
    (SELECT COUNT(*) FROM dbo.StockTransaction) AS StockTransactionCount,
    (SELECT COUNT(*) FROM dbo.ReorderRule) AS ReorderRuleCount;
GO

BEGIN TRY
    DECLARE @DepartmentName NVARCHAR(100) = CONCAT('Test Department ', LEFT(CONVERT(VARCHAR(36), NEWID()), 8));
    DECLARE @InsertedDepartmentID INT;

    INSERT INTO dbo.Department (DepartmentName, Location, ContactNumber, Status)
    VALUES (@DepartmentName, 'Test Wing', '011-555-0999', 'Active');

    SET @InsertedDepartmentID = SCOPE_IDENTITY();

    SELECT
        'DB-02 Valid department insert succeeded' AS TestName,
        DepartmentID,
        DepartmentName,
        Location,
        ContactNumber,
        Status
    FROM dbo.Department
    WHERE DepartmentID = @InsertedDepartmentID;
END TRY
BEGIN CATCH
    SELECT
        'DB-02 Valid department insert failed' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

SELECT
    'DB-03 fn_GetCurrentStock' AS TestName,
    i.ItemID,
    i.ItemName,
    dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock
FROM dbo.InventoryItem AS i
WHERE i.ItemID IN (1, 13, 14)
ORDER BY i.ItemID;
GO

SELECT
    'DB-04 fn_DaysToExpiry' AS TestName,
    b.BatchID,
    b.BatchNumber,
    b.ExpiryDate,
    dbo.fn_DaysToExpiry(b.BatchID) AS DaysToExpiry
FROM dbo.StockBatch AS b
WHERE b.BatchID IN (1, 4, 14, 16)
ORDER BY b.BatchID;
GO

SELECT
    'DB-05 fn_AverageMonthlyUsage' AS TestName,
    i.ItemID,
    i.ItemName,
    dbo.fn_AverageMonthlyUsage(i.ItemID) AS AverageMonthlyUsage
FROM dbo.InventoryItem AS i
WHERE i.ItemID IN (1, 3, 13, 14)
ORDER BY i.ItemID;
GO

SELECT
    'DB-06 vw_LowStockItems' AS TestName,
    ItemID,
    ItemName,
    ItemCategory,
    UnitOfMeasure,
    CurrentStock,
    ReorderLevel,
    MaximumStockLevel,
    RecommendedReorderQuantity,
    StockStatus
FROM dbo.vw_LowStockItems
ORDER BY ItemName;
GO

SELECT
    'DB-07 vw_ExpiringSoonStock' AS TestName,
    BatchID,
    ItemID,
    ItemName,
    BatchNumber,
    QuantityAvailable,
    ExpiryDate,
    DaysToExpiry,
    AlertLevel
FROM dbo.vw_ExpiringSoonStock
ORDER BY
    CASE AlertLevel
        WHEN 'Expired' THEN 1
        WHEN 'Critical' THEN 2
        WHEN 'Warning' THEN 3
        WHEN 'Safe' THEN 4
        WHEN 'No Expiry' THEN 5
        ELSE 6
    END,
    DaysToExpiry;
GO

SELECT
    'DB-08 vw_DepartmentConsumptionSummary' AS TestName,
    DepartmentID,
    DepartmentName,
    ItemID,
    ItemName,
    UsageMonth,
    UsageYear,
    TotalIssuedQuantity
FROM dbo.vw_DepartmentConsumptionSummary
ORDER BY UsageYear DESC, UsageMonth DESC, TotalIssuedQuantity DESC;
GO

SELECT
    'DB-09 vw_BIInventoryDemand' AS TestName,
    ItemID,
    ItemName,
    ItemCategory,
    TotalIssuedQuantity,
    AverageMonthlyUsage,
    CurrentStock,
    SafetyStock,
    LeadTimeDays,
    DemandCategory,
    RecommendedReorderQuantity
FROM dbo.vw_BIInventoryDemand
ORDER BY TotalIssuedQuantity DESC, ItemID;
GO

BEGIN TRY
    INSERT INTO dbo.StockBatch
    (
        ItemID,
        SupplierID,
        BatchNumber,
        ReceivedDate,
        ManufactureDate,
        ExpiryDate,
        QuantityReceived,
        QuantityAvailable,
        UnitCost
    )
    VALUES
    (
        1,
        1,
        CONCAT('NULL-EXP-', LEFT(CONVERT(VARCHAR(36), NEWID()), 8)),
        CAST(GETDATE() AS DATE),
        DATEADD(DAY, -30, CAST(GETDATE() AS DATE)),
        NULL,
        10,
        10,
        3.50
    );

    SELECT 'DB-10 Medicine null expiry trigger test unexpectedly succeeded' AS TestName;
END TRY
BEGIN CATCH
    SELECT
        'DB-10 trg_PreventInvalidStockBatch rejected medicine without expiry' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

BEGIN TRY
    INSERT INTO dbo.StockBatch
    (
        ItemID,
        SupplierID,
        BatchNumber,
        ReceivedDate,
        ManufactureDate,
        ExpiryDate,
        QuantityReceived,
        QuantityAvailable,
        UnitCost
    )
    VALUES
    (
        14,
        9,
        CONCAT('BAD-QTY-', LEFT(CONVERT(VARCHAR(36), NEWID()), 8)),
        CAST(GETDATE() AS DATE),
        NULL,
        NULL,
        10,
        15,
        6500.00
    );

    SELECT 'DB-11 Quantity constraint test unexpectedly succeeded' AS TestName;
END TRY
BEGIN CATCH
    SELECT
        'DB-11 QuantityAvailable greater than QuantityReceived correctly rejected' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

BEGIN TRY
    INSERT INTO dbo.StockBatch
    (
        ItemID,
        SupplierID,
        BatchNumber,
        ReceivedDate,
        ManufactureDate,
        ExpiryDate,
        QuantityReceived,
        QuantityAvailable,
        UnitCost
    )
    VALUES
    (
        2,
        3,
        CONCAT('TRG-EXP-', LEFT(CONVERT(VARCHAR(36), NEWID()), 8)),
        CAST(GETDATE() AS DATE),
        DATEADD(DAY, -90, CAST(GETDATE() AS DATE)),
        DATEADD(DAY, 20, CAST(GETDATE() AS DATE)),
        25,
        25,
        8.25
    );

    SELECT
        'DB-12 trg_GenerateExpiryAlert created alert' AS TestName,
        ea.AlertID,
        ea.BatchID,
        ea.AlertType,
        ea.AlertStatus
    FROM dbo.ExpiryAlert AS ea
    WHERE ea.BatchID = SCOPE_IDENTITY();
END TRY
BEGIN CATCH
    SELECT
        'DB-12 Expiry alert trigger test failed' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

BEGIN TRY
    EXEC dbo.sp_IssueStockToDepartment
        @DepartmentID = 2,
        @RequestedByStaffID = 5,
        @ItemID = 1,
        @RequestedQuantity = 30;

    SELECT 'DB-13 Valid FEFO stock issue succeeded' AS TestName;
END TRY
BEGIN CATCH
    SELECT
        'DB-13 Valid FEFO stock issue failed' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

BEGIN TRY
    EXEC dbo.sp_IssueStockToDepartment
        @DepartmentID = 2,
        @RequestedByStaffID = 5,
        @ItemID = 4,
        @RequestedQuantity = 9999;

    SELECT 'DB-14 Insufficient stock issue unexpectedly succeeded' AS TestName;
END TRY
BEGIN CATCH
    SELECT
        'DB-14 Insufficient stock issue correctly rejected' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

BEGIN TRY
    DECLARE @NewPurchaseOrder TABLE
    (
        PurchaseOrderID INT,
        Message NVARCHAR(200)
    );

    INSERT INTO @NewPurchaseOrder
    EXEC dbo.sp_CreatePurchaseOrder
        @SupplierID = 1,
        @CreatedByStaffID = 4,
        @ExpectedDeliveryDate = NULL;

    SELECT
        'DB-15 Valid purchase order procedure succeeded' AS TestName,
        PurchaseOrderID,
        Message
    FROM @NewPurchaseOrder;
END TRY
BEGIN CATCH
    SELECT
        'DB-15 Valid purchase order procedure failed' AS TestName,
        ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
GO

EXEC dbo.sp_GenerateReorderRecommendations
    @SummaryMonth = 3,
    @SummaryYear = 2026;
GO

SELECT TOP (10)
    'DB-16 Latest IssueRequest rows' AS TestName,
    IssueRequestID,
    DepartmentID,
    RequestedByStaffID,
    RequestDate,
    RequestStatus,
    ApprovedByStaffID,
    ApprovedDate
FROM dbo.IssueRequest
ORDER BY IssueRequestID DESC;
GO

SELECT TOP (10)
    'DB-17 Latest IssueRequestDetail rows' AS TestName,
    IssueRequestDetailID,
    IssueRequestID,
    ItemID,
    RequestedQuantity,
    ApprovedQuantity,
    IssuedQuantity
FROM dbo.IssueRequestDetail
ORDER BY IssueRequestDetailID DESC;
GO

SELECT TOP (15)
    'DB-18 Latest StockTransaction rows' AS TestName,
    TransactionID,
    BatchID,
    ItemID,
    TransactionType,
    Quantity,
    TransactionDate,
    ReferenceType,
    ReferenceID,
    StaffID
FROM dbo.StockTransaction
ORDER BY TransactionID DESC;
GO

SELECT
    'DB-19 Updated StockBatch quantities' AS TestName,
    BatchID,
    ItemID,
    BatchNumber,
    QuantityReceived,
    QuantityAvailable,
    ExpiryDate
FROM dbo.StockBatch
WHERE ItemID IN (1, 2, 3, 4, 13, 14)
ORDER BY ItemID, ExpiryDate, BatchID;
GO

SELECT
    'DB-20 Open ExpiryAlert rows' AS TestName,
    AlertID,
    BatchID,
    ItemID,
    AlertDate,
    ExpiryDate,
    AlertType,
    AlertStatus
FROM dbo.ExpiryAlert
WHERE AlertStatus = 'Open'
ORDER BY AlertDate DESC, AlertID DESC;
GO

SELECT
    'DB-21 BI summary rows generated' AS TestName,
    SummaryID,
    ItemID,
    SummaryMonth,
    SummaryYear,
    TotalIssuedQuantity,
    AverageDailyUsage,
    AverageMonthlyUsage,
    DemandCategory,
    ABCCategory,
    RecommendedReorderQuantity
FROM dbo.BI_DemandSummary
WHERE SummaryMonth = 3
  AND SummaryYear = 2026
ORDER BY TotalIssuedQuantity DESC, ItemID;
GO

SELECT
    'DB-22 Final BI view output' AS TestName,
    ItemID,
    ItemName,
    ItemCategory,
    TotalIssuedQuantity,
    AverageMonthlyUsage,
    CurrentStock,
    SafetyStock,
    LeadTimeDays,
    DemandCategory,
    RecommendedReorderQuantity
FROM dbo.vw_BIInventoryDemand
ORDER BY TotalIssuedQuantity DESC, ItemID;
GO

