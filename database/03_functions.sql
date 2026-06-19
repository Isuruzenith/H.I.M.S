USE HealthcareInventoryDB;
GO

CREATE OR ALTER FUNCTION dbo.fn_GetCurrentStock
(
    @ItemID INT
)
RETURNS INT
AS
BEGIN
    DECLARE @CurrentStock INT;

    SELECT @CurrentStock = COALESCE(SUM(QuantityAvailable), 0)
    FROM dbo.StockBatch
    WHERE ItemID = @ItemID
      AND QuantityAvailable > 0
      AND (ExpiryDate IS NULL OR ExpiryDate >= CAST(GETDATE() AS DATE));

    RETURN COALESCE(@CurrentStock, 0);
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_DaysToExpiry
(
    @BatchID INT
)
RETURNS INT
AS
BEGIN
    DECLARE @DaysToExpiry INT;

    SELECT @DaysToExpiry =
        CASE
            WHEN ExpiryDate IS NULL THEN NULL
            ELSE DATEDIFF(DAY, CAST(GETDATE() AS DATE), ExpiryDate)
        END
    FROM dbo.StockBatch
    WHERE BatchID = @BatchID;

    RETURN @DaysToExpiry;
END;
GO

CREATE OR ALTER FUNCTION dbo.fn_AverageMonthlyUsage
(
    @ItemID INT
)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @AverageMonthlyUsage DECIMAL(12,2);

    WITH UsageBounds AS
    (
        SELECT
            SUM(Quantity) AS TotalQuantity,
            DATEDIFF(MONTH, MIN(TransactionDate), MAX(TransactionDate)) + 1 AS MonthCount
        FROM dbo.StockTransaction
        WHERE ItemID = @ItemID
          AND TransactionType = 'DEPARTMENT_ISSUE'
    )
    SELECT @AverageMonthlyUsage =
        CAST(COALESCE(TotalQuantity, 0) AS DECIMAL(12,2)) / NULLIF(MonthCount, 0)
    FROM UsageBounds;

    RETURN COALESCE(@AverageMonthlyUsage, 0);
END;
GO

