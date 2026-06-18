USE HealthcareInventoryDB;
GO

EXEC dbo.sp_GenerateReorderRecommendations
    @SummaryMonth = NULL,
    @SummaryYear = NULL;
GO

SELECT
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
ORDER BY TotalIssuedQuantity DESC, RecommendedReorderQuantity DESC;
GO

WITH Consumption AS
(
    SELECT
        i.ItemID,
        i.ItemName,
        SUM(CASE WHEN st.TransactionType = 'DEPARTMENT_ISSUE' THEN st.Quantity ELSE 0 END) AS TotalIssuedQuantity,
        CAST(SUM(CASE WHEN st.TransactionType = 'DEPARTMENT_ISSUE' THEN st.Quantity * b.UnitCost ELSE 0 END) AS DECIMAL(14,2)) AS ConsumptionValue
    FROM dbo.InventoryItem AS i
    LEFT JOIN dbo.StockTransaction AS st
        ON st.ItemID = i.ItemID
    LEFT JOIN dbo.StockBatch AS b
        ON b.BatchID = st.BatchID
    GROUP BY
        i.ItemID,
        i.ItemName
),
RankedConsumption AS
(
    SELECT
        ItemID,
        ItemName,
        TotalIssuedQuantity,
        ConsumptionValue,
        SUM(ConsumptionValue) OVER () AS GrandTotalValue,
        SUM(ConsumptionValue) OVER (ORDER BY ConsumptionValue DESC ROWS UNBOUNDED PRECEDING) AS CumulativeValue
    FROM Consumption
)
SELECT
    ItemID,
    ItemName,
    TotalIssuedQuantity,
    ConsumptionValue,
    CAST(CASE WHEN GrandTotalValue = 0 THEN 0 ELSE (CumulativeValue / GrandTotalValue) * 100 END AS DECIMAL(8,2)) AS CumulativeValuePercent,
    CASE
        WHEN GrandTotalValue = 0 THEN 'C'
        WHEN CumulativeValue / GrandTotalValue <= 0.70 THEN 'A'
        WHEN CumulativeValue / GrandTotalValue <= 0.90 THEN 'B'
        ELSE 'C'
    END AS ABCCategory
FROM RankedConsumption
ORDER BY ConsumptionValue DESC;
GO

SELECT
    AlertLevel,
    COUNT(*) AS BatchCount,
    SUM(QuantityAvailable) AS QuantityAtRisk
FROM dbo.vw_ExpiringSoonStock
GROUP BY AlertLevel
ORDER BY
    CASE AlertLevel
        WHEN 'Expired' THEN 1
        WHEN 'Critical' THEN 2
        WHEN 'Warning' THEN 3
        WHEN 'Safe' THEN 4
        WHEN 'No Expiry' THEN 5
        ELSE 6
    END;
GO

SELECT
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
    SupplierID,
    SupplierName,
    TotalOrders,
    CompletedOrders,
    CancelledOrders,
    DelayedOrders,
    AverageLeadTimeDays,
    AverageItemCost
FROM dbo.vw_SupplierPerformance
ORDER BY DelayedOrders DESC, CompletedOrders DESC, SupplierName;
GO

SELECT
    i.ItemID,
    i.ItemName,
    dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock,
    rr.SafetyStock,
    rr.LeadTimeDays,
    dbo.fn_AverageMonthlyUsage(i.ItemID) AS AverageMonthlyUsage,
    CAST(CEILING((dbo.fn_AverageMonthlyUsage(i.ItemID) / 30.0) * rr.LeadTimeDays + rr.SafetyStock) AS INT) AS CalculatedReorderQuantity
FROM dbo.InventoryItem AS i
INNER JOIN dbo.ReorderRule AS rr
    ON rr.ItemID = i.ItemID
WHERE i.ItemStatus = 'Active'
ORDER BY CalculatedReorderQuantity DESC;
GO
