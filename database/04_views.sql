USE HealthcareInventoryDB;
GO

CREATE OR ALTER VIEW dbo.vw_LowStockItems
AS
SELECT
    i.ItemID,
    i.ItemName,
    i.ItemCategory,
    i.UnitOfMeasure,
    s.CurrentStock,
    i.ReorderLevel,
    i.MaximumStockLevel,
    CASE
        WHEN s.CurrentStock < i.ReorderLevel THEN i.MaximumStockLevel - s.CurrentStock
        ELSE 0
    END AS RecommendedReorderQuantity,
    CASE
        WHEN s.CurrentStock = 0 THEN 'Out of Stock'
        WHEN s.CurrentStock > 0 AND s.CurrentStock < i.ReorderLevel THEN 'Low Stock'
        ELSE 'Sufficient'
    END AS StockStatus
FROM dbo.InventoryItem AS i
CROSS APPLY
(
    SELECT dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock
) AS s
WHERE i.ItemStatus = 'Active'
  AND s.CurrentStock < i.ReorderLevel;
GO

CREATE OR ALTER VIEW dbo.vw_ExpiringSoonStock
AS
SELECT
    b.BatchID,
    b.ItemID,
    i.ItemName,
    b.BatchNumber,
    b.QuantityAvailable,
    b.ExpiryDate,
    e.DaysToExpiry,
    CASE
        WHEN b.ExpiryDate IS NULL THEN 'No Expiry'
        WHEN e.DaysToExpiry < 0 THEN 'Expired'
        WHEN e.DaysToExpiry BETWEEN 0 AND 30 THEN 'Critical'
        WHEN e.DaysToExpiry BETWEEN 31 AND 60 THEN 'Warning'
        ELSE 'Safe'
    END AS AlertLevel
FROM dbo.StockBatch AS b
INNER JOIN dbo.InventoryItem AS i
    ON i.ItemID = b.ItemID
CROSS APPLY
(
    SELECT dbo.fn_DaysToExpiry(b.BatchID) AS DaysToExpiry
) AS e
WHERE b.QuantityAvailable > 0;
GO

CREATE OR ALTER VIEW dbo.vw_DepartmentConsumptionSummary
AS
SELECT
    d.DepartmentID,
    d.DepartmentName,
    i.ItemID,
    i.ItemName,
    MONTH(st.TransactionDate) AS UsageMonth,
    YEAR(st.TransactionDate) AS UsageYear,
    SUM(st.Quantity) AS TotalIssuedQuantity
FROM dbo.StockTransaction AS st
INNER JOIN dbo.IssueRequest AS ir
    ON st.ReferenceType = 'IssueRequest'
   AND st.ReferenceID = ir.IssueRequestID
INNER JOIN dbo.Department AS d
    ON d.DepartmentID = ir.DepartmentID
INNER JOIN dbo.InventoryItem AS i
    ON i.ItemID = st.ItemID
WHERE st.TransactionType = 'DEPARTMENT_ISSUE'
GROUP BY
    d.DepartmentID,
    d.DepartmentName,
    i.ItemID,
    i.ItemName,
    MONTH(st.TransactionDate),
    YEAR(st.TransactionDate);
GO

CREATE OR ALTER VIEW dbo.vw_SupplierPerformance
AS
SELECT
    s.SupplierID,
    s.SupplierName,
    COUNT(DISTINCT po.PurchaseOrderID) AS TotalOrders,
    COUNT(DISTINCT CASE WHEN po.OrderStatus = 'Completed' THEN po.PurchaseOrderID END) AS CompletedOrders,
    COUNT(DISTINCT CASE WHEN po.OrderStatus = 'Cancelled' THEN po.PurchaseOrderID END) AS CancelledOrders,
    COUNT(DISTINCT CASE WHEN po.ExpectedDeliveryDate IS NOT NULL
              AND (po.CompletedDate > po.ExpectedDeliveryDate
                   OR (po.CompletedDate IS NULL AND po.OrderStatus NOT IN ('Completed', 'Cancelled') AND CAST(GETDATE() AS DATE) > po.ExpectedDeliveryDate))
             THEN po.PurchaseOrderID END) AS DelayedOrders,
    AVG(CAST(s.LeadTimeDays AS DECIMAL(10,2))) AS AverageLeadTimeDays,
    AVG(CAST(pod.UnitPrice AS DECIMAL(12,2))) AS AverageItemCost
FROM dbo.Supplier AS s
LEFT JOIN dbo.PurchaseOrder AS po
    ON po.SupplierID = s.SupplierID
LEFT JOIN dbo.PurchaseOrderDetail AS pod
    ON pod.PurchaseOrderID = po.PurchaseOrderID
GROUP BY
    s.SupplierID,
    s.SupplierName;
GO

CREATE OR ALTER VIEW dbo.vw_BIInventoryDemand
AS
WITH Issued AS
(
    SELECT
        ItemID,
        SUM(Quantity) AS TotalIssuedQuantity
    FROM dbo.StockTransaction
    WHERE TransactionType = 'DEPARTMENT_ISSUE'
    GROUP BY ItemID
),
DemandBase AS
(
    SELECT
        i.ItemID,
        i.ItemName,
        i.ItemCategory,
        COALESCE(iss.TotalIssuedQuantity, 0) AS TotalIssuedQuantity,
        COALESCE(dbo.fn_AverageMonthlyUsage(i.ItemID), 0) AS AverageMonthlyUsage,
        dbo.fn_GetCurrentStock(i.ItemID) AS CurrentStock,
        COALESCE(rr.SafetyStock, 0) AS SafetyStock,
        COALESCE(rr.LeadTimeDays, 0) AS LeadTimeDays
    FROM dbo.InventoryItem AS i
    LEFT JOIN Issued AS iss
        ON iss.ItemID = i.ItemID
    LEFT JOIN dbo.ReorderRule AS rr
        ON rr.ItemID = i.ItemID
       AND rr.Status = 'Active'
    WHERE i.ItemStatus = 'Active'
)
SELECT
    ItemID,
    ItemName,
    ItemCategory,
    TotalIssuedQuantity,
    AverageMonthlyUsage,
    CurrentStock,
    SafetyStock,
    LeadTimeDays,
    CASE
        WHEN TotalIssuedQuantity >= 100 THEN 'Fast Moving'
        WHEN TotalIssuedQuantity BETWEEN 30 AND 99 THEN 'Medium Moving'
        ELSE 'Slow Moving'
    END AS DemandCategory,
    CAST(CEILING((AverageMonthlyUsage / 30.0) * LeadTimeDays + SafetyStock) AS INT) AS RecommendedReorderQuantity
FROM DemandBase;
GO

CREATE OR ALTER VIEW dbo.vw_StockTransactionReport
AS
SELECT
    st.TransactionID,
    i.ItemName,
    b.BatchNumber,
    st.TransactionType,
    st.Quantity,
    st.TransactionDate,
    st.ReferenceType,
    st.ReferenceID,
    s.FullName AS StaffName,
    st.Notes
FROM dbo.StockTransaction AS st
INNER JOIN dbo.InventoryItem AS i
    ON i.ItemID = st.ItemID
INNER JOIN dbo.StockBatch AS b
    ON b.BatchID = st.BatchID
INNER JOIN dbo.Staff AS s
    ON s.StaffID = st.StaffID;
GO
