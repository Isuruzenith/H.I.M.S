USE HealthcareInventoryDB;
GO

CREATE OR ALTER PROCEDURE dbo.sp_IssueStockToDepartment
    @DepartmentID INT,
    @RequestedByStaffID INT,
    @ItemID INT,
    @RequestedQuantity INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE
        @CurrentStock INT,
        @RemainingQuantity INT,
        @IssueRequestID INT,
        @IssueRequestDetailID INT,
        @BatchID INT,
        @BatchQuantity INT,
        @IssueQuantity INT;

    IF @RequestedQuantity <= 0
        THROW 52001, 'Requested quantity must be greater than zero.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.Department WHERE DepartmentID = @DepartmentID AND Status = 'Active')
            THROW 52002, 'Active department was not found.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffID = @RequestedByStaffID AND Status = 'Active')
            THROW 52003, 'Active staff member was not found.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.InventoryItem WHERE ItemID = @ItemID AND ItemStatus = 'Active')
            THROW 52004, 'Active inventory item was not found.', 1;

        SELECT @CurrentStock = dbo.fn_GetCurrentStock(@ItemID);

        IF @RequestedQuantity > @CurrentStock
            THROW 52005, 'Insufficient available stock for the requested item.', 1;

        INSERT INTO dbo.IssueRequest
        (
            DepartmentID,
            RequestedByStaffID,
            RequestDate,
            RequestStatus,
            ApprovedByStaffID,
            ApprovedDate
        )
        VALUES
        (
            @DepartmentID,
            @RequestedByStaffID,
            SYSDATETIME(),
            'Approved',
            @RequestedByStaffID,
            SYSDATETIME()
        );

        SET @IssueRequestID = SCOPE_IDENTITY();

        INSERT INTO dbo.IssueRequestDetail
        (
            IssueRequestID,
            ItemID,
            RequestedQuantity,
            ApprovedQuantity,
            IssuedQuantity
        )
        VALUES
        (
            @IssueRequestID,
            @ItemID,
            @RequestedQuantity,
            @RequestedQuantity,
            0
        );

        SET @IssueRequestDetailID = SCOPE_IDENTITY();
        SET @RemainingQuantity = @RequestedQuantity;

        DECLARE stock_cursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT BatchID, QuantityAvailable
            FROM dbo.StockBatch WITH (UPDLOCK, ROWLOCK)
            WHERE ItemID = @ItemID
              AND QuantityAvailable > 0
              AND (ExpiryDate IS NULL OR ExpiryDate >= CAST(GETDATE() AS DATE))
            ORDER BY
              CASE WHEN ExpiryDate IS NULL THEN 1 ELSE 0 END,
              ExpiryDate,
              ReceivedDate,
              BatchID;

        OPEN stock_cursor;
        FETCH NEXT FROM stock_cursor INTO @BatchID, @BatchQuantity;

        WHILE @@FETCH_STATUS = 0 AND @RemainingQuantity > 0
        BEGIN
            SET @IssueQuantity =
                CASE
                    WHEN @BatchQuantity >= @RemainingQuantity THEN @RemainingQuantity
                    ELSE @BatchQuantity
                END;

            UPDATE dbo.StockBatch
            SET QuantityAvailable = QuantityAvailable - @IssueQuantity
            WHERE BatchID = @BatchID
              AND QuantityAvailable >= @IssueQuantity;

            IF @@ROWCOUNT = 0
                THROW 52006, 'Stock batch update failed because available quantity changed.', 1;

            INSERT INTO dbo.StockTransaction
            (
                BatchID,
                ItemID,
                TransactionType,
                Quantity,
                TransactionDate,
                ReferenceType,
                ReferenceID,
                StaffID,
                Notes
            )
            VALUES
            (
                @BatchID,
                @ItemID,
                'DEPARTMENT_ISSUE',
                @IssueQuantity,
                SYSDATETIME(),
                'IssueRequest',
                @IssueRequestID,
                @RequestedByStaffID,
                'Issued to department using FEFO logic'
            );

            SET @RemainingQuantity = @RemainingQuantity - @IssueQuantity;

            FETCH NEXT FROM stock_cursor INTO @BatchID, @BatchQuantity;
        END;

        CLOSE stock_cursor;
        DEALLOCATE stock_cursor;

        IF @RemainingQuantity > 0
            THROW 52007, 'Unable to allocate enough non-expired stock batches.', 1;

        UPDATE dbo.IssueRequestDetail
        SET IssuedQuantity = @RequestedQuantity
        WHERE IssueRequestDetailID = @IssueRequestDetailID;

        UPDATE dbo.IssueRequest
        SET RequestStatus = 'Issued'
        WHERE IssueRequestID = @IssueRequestID;

        COMMIT TRANSACTION;

        SELECT
            CAST(1 AS BIT) AS Success,
            'Stock issued successfully using FEFO logic.' AS Message,
            @IssueRequestID AS IssueRequestID,
            @IssueRequestDetailID AS IssueRequestDetailID,
            @ItemID AS ItemID,
            @RequestedQuantity AS IssuedQuantity,
            dbo.fn_GetCurrentStock(@ItemID) AS RemainingCurrentStock;
    END TRY
    BEGIN CATCH
        DECLARE @CursorStatus INT;

        SET @CursorStatus = CURSOR_STATUS('local', 'stock_cursor');

        IF @CursorStatus >= 0
        BEGIN
            CLOSE stock_cursor;
        END;

        IF @CursorStatus > -3
        BEGIN
            DEALLOCATE stock_cursor;
        END;

        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CreatePurchaseOrder
    @SupplierID INT,
    @CreatedByStaffID INT,
    @ExpectedDeliveryDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @PurchaseOrderID INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF NOT EXISTS (SELECT 1 FROM dbo.Supplier WHERE SupplierID = @SupplierID AND Status = 'Active')
            THROW 52101, 'Active supplier was not found.', 1;

        IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffID = @CreatedByStaffID AND Status = 'Active')
            THROW 52102, 'Active staff member was not found.', 1;

        IF @ExpectedDeliveryDate IS NOT NULL AND @ExpectedDeliveryDate < CAST(GETDATE() AS DATE)
            THROW 52103, 'Expected delivery date cannot be in the past.', 1;

        INSERT INTO dbo.PurchaseOrder
        (
            SupplierID,
            CreatedByStaffID,
            ExpectedDeliveryDate,
            OrderStatus
        )
        VALUES
        (
            @SupplierID,
            @CreatedByStaffID,
            @ExpectedDeliveryDate,
            'Pending'
        );

        SET @PurchaseOrderID = SCOPE_IDENTITY();

        COMMIT TRANSACTION;

        SELECT
            @PurchaseOrderID AS PurchaseOrderID,
            'Purchase order created successfully.' AS Message;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_AddPurchaseOrderDetail
    @PurchaseOrderID INT,
    @ItemID INT,
    @OrderedQuantity INT,
    @UnitPrice DECIMAL(12,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.PurchaseOrder WHERE PurchaseOrderID = @PurchaseOrderID AND OrderStatus <> 'Cancelled')
        THROW 52201, 'Valid purchase order was not found.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.InventoryItem WHERE ItemID = @ItemID AND ItemStatus = 'Active')
        THROW 52202, 'Active inventory item was not found.', 1;

    IF @OrderedQuantity <= 0
        THROW 52203, 'Ordered quantity must be greater than zero.', 1;

    IF @UnitPrice < 0
        THROW 52204, 'Unit price cannot be negative.', 1;

    INSERT INTO dbo.PurchaseOrderDetail
    (
        PurchaseOrderID,
        ItemID,
        OrderedQuantity,
        UnitPrice
    )
    VALUES
    (
        @PurchaseOrderID,
        @ItemID,
        @OrderedQuantity,
        @UnitPrice
    );

    SELECT
        CAST(1 AS BIT) AS Success,
        'Purchase order detail added successfully.' AS Message,
        SCOPE_IDENTITY() AS PurchaseOrderDetailID;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_ReceiveStockBatch
    @ItemID INT,
    @SupplierID INT,
    @PurchaseOrderDetailID INT = NULL,
    @BatchNumber VARCHAR(60),
    @ReceivedDate DATE = NULL,
    @ManufactureDate DATE = NULL,
    @ExpiryDate DATE = NULL,
    @QuantityReceived INT,
    @UnitCost DECIMAL(12,2),
    @StaffID INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @BatchID INT;

    IF @QuantityReceived <= 0
        THROW 52301, 'Quantity received must be greater than zero.', 1;

    IF @UnitCost < 0
        THROW 52302, 'Unit cost cannot be negative.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.InventoryItem WHERE ItemID = @ItemID AND ItemStatus = 'Active')
        THROW 52303, 'Active inventory item was not found.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.Supplier WHERE SupplierID = @SupplierID AND Status = 'Active')
        THROW 52304, 'Active supplier was not found.', 1;

    IF NOT EXISTS (SELECT 1 FROM dbo.Staff WHERE StaffID = @StaffID AND Status = 'Active')
        THROW 52305, 'Active staff member was not found.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.StockBatch
        (
            ItemID,
            SupplierID,
            PurchaseOrderDetailID,
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
            @ItemID,
            @SupplierID,
            @PurchaseOrderDetailID,
            @BatchNumber,
            COALESCE(@ReceivedDate, CAST(GETDATE() AS DATE)),
            @ManufactureDate,
            @ExpiryDate,
            @QuantityReceived,
            @QuantityReceived,
            @UnitCost
        );

        SET @BatchID = SCOPE_IDENTITY();

        INSERT INTO dbo.StockTransaction
        (
            BatchID,
            ItemID,
            TransactionType,
            Quantity,
            TransactionDate,
            ReferenceType,
            ReferenceID,
            StaffID,
            Notes
        )
        VALUES
        (
            @BatchID,
            @ItemID,
            'PURCHASE_RECEIVE',
            @QuantityReceived,
            SYSDATETIME(),
            CASE WHEN @PurchaseOrderDetailID IS NULL THEN 'DirectReceive' ELSE 'PurchaseOrderDetail' END,
            COALESCE(@PurchaseOrderDetailID, @BatchID),
            @StaffID,
            'Stock batch received'
        );

        IF @PurchaseOrderDetailID IS NOT NULL
        BEGIN
            UPDATE dbo.PurchaseOrderDetail
            SET ReceivedQuantity = ReceivedQuantity + @QuantityReceived
            WHERE PurchaseOrderDetailID = @PurchaseOrderDetailID
              AND ReceivedQuantity + @QuantityReceived <= OrderedQuantity;

            IF @@ROWCOUNT = 0
                THROW 52306, 'Received quantity exceeds ordered quantity.', 1;
        END;

        COMMIT TRANSACTION;

        SELECT
            CAST(1 AS BIT) AS Success,
            'Stock batch received successfully.' AS Message,
            @BatchID AS BatchID;
    END TRY
    BEGIN CATCH
        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_GenerateReorderRecommendations
    @SummaryMonth TINYINT = NULL,
    @SummaryYear SMALLINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @SummaryMonth = COALESCE(@SummaryMonth, MONTH(GETDATE()));
    SET @SummaryYear = COALESCE(@SummaryYear, YEAR(GETDATE()));

    IF @SummaryMonth NOT BETWEEN 1 AND 12
        THROW 52401, 'Summary month must be between 1 and 12.', 1;

    WITH MonthlyIssue AS
    (
        SELECT
            ItemID,
            SUM(Quantity) AS TotalIssuedQuantity
        FROM dbo.StockTransaction
        WHERE TransactionType = 'DEPARTMENT_ISSUE'
          AND MONTH(TransactionDate) = @SummaryMonth
          AND YEAR(TransactionDate) = @SummaryYear
        GROUP BY ItemID
    ),
    AverageCost AS
    (
        SELECT
            ItemID,
            AVG(CAST(NULLIF(UnitCost, 0) AS DECIMAL(12,2))) AS AverageUnitCost
        FROM dbo.StockBatch
        GROUP BY ItemID
    ),
    DemandSource AS
    (
        SELECT
            i.ItemID,
            COALESCE(mi.TotalIssuedQuantity, 0) AS TotalIssuedQuantity,
            COALESCE(ac.AverageUnitCost, 0) AS AverageUnitCost,
            COALESCE(rr.SafetyStock, 0) AS SafetyStock,
            COALESCE(rr.LeadTimeDays, 0) AS LeadTimeDays,
            dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock
        FROM dbo.InventoryItem AS i
        LEFT JOIN MonthlyIssue AS mi
            ON mi.ItemID = i.ItemID
        LEFT JOIN AverageCost AS ac
            ON ac.ItemID = i.ItemID
        LEFT JOIN dbo.ReorderRule AS rr
            ON rr.ItemID = i.ItemID
           AND rr.Status = 'Active'
        WHERE i.ItemStatus = 'Active'
    ),
    Scored AS
    (
        SELECT
            ItemID,
            TotalIssuedQuantity,
            CAST(TotalIssuedQuantity / 30.0 AS DECIMAL(12,2)) AS AverageDailyUsage,
            CAST(TotalIssuedQuantity AS DECIMAL(12,2)) AS AverageMonthlyUsage,
            CAST(TotalIssuedQuantity * AverageUnitCost AS DECIMAL(14,2)) AS ConsumptionValue,
            CASE
                WHEN TotalIssuedQuantity >= 100 THEN 'Fast Moving'
                WHEN TotalIssuedQuantity BETWEEN 30 AND 99 THEN 'Medium Moving'
                ELSE 'Slow Moving'
            END AS DemandCategory,
            CASE
                WHEN TotalIssuedQuantity * AverageUnitCost >= 50000 THEN 'A'
                WHEN TotalIssuedQuantity * AverageUnitCost >= 15000 THEN 'B'
                ELSE 'C'
            END AS ABCCategory,
            CAST(CEILING(CASE
                WHEN CurrentStock < SafetyStock
                    THEN (TotalIssuedQuantity / 30.0) * LeadTimeDays + SafetyStock - CurrentStock
                ELSE (TotalIssuedQuantity / 30.0) * LeadTimeDays + SafetyStock
            END) AS INT) AS RecommendedReorderQuantity
        FROM DemandSource
    )
    MERGE dbo.BI_DemandSummary AS target
    USING Scored AS source
        ON target.ItemID = source.ItemID
       AND target.SummaryMonth = @SummaryMonth
       AND target.SummaryYear = @SummaryYear
    WHEN MATCHED THEN
        UPDATE SET
            TotalIssuedQuantity = source.TotalIssuedQuantity,
            AverageDailyUsage = source.AverageDailyUsage,
            AverageMonthlyUsage = source.AverageMonthlyUsage,
            ConsumptionValue = source.ConsumptionValue,
            DemandCategory = source.DemandCategory,
            ABCCategory = source.ABCCategory,
            RecommendedReorderQuantity = source.RecommendedReorderQuantity,
            GeneratedDate = SYSDATETIME()
    WHEN NOT MATCHED THEN
        INSERT
        (
            ItemID,
            SummaryMonth,
            SummaryYear,
            TotalIssuedQuantity,
            AverageDailyUsage,
            AverageMonthlyUsage,
            ConsumptionValue,
            DemandCategory,
            ABCCategory,
            RecommendedReorderQuantity
        )
        VALUES
        (
            source.ItemID,
            @SummaryMonth,
            @SummaryYear,
            source.TotalIssuedQuantity,
            source.AverageDailyUsage,
            source.AverageMonthlyUsage,
            source.ConsumptionValue,
            source.DemandCategory,
            source.ABCCategory,
            source.RecommendedReorderQuantity
        );

    SELECT
        CAST(1 AS BIT) AS Success,
        'BI demand summary and reorder recommendations generated successfully.' AS Message,
        @SummaryMonth AS SummaryMonth,
        @SummaryYear AS SummaryYear;
END;
GO
