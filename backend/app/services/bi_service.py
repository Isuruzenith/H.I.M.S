from app.db.connection import execute_returning, fetch_all


def refresh_demand_summary(month: int | None = None, year: int | None = None):
    return execute_returning(
        """
        EXEC dbo.sp_GenerateReorderRecommendations
            @SummaryMonth = ?,
            @SummaryYear = ?
        """,
        [month, year],
    )[0]


def get_demand_summary():
    return fetch_all(
        """
        SELECT
            SummaryID,
            ItemID,
            SummaryMonth,
            SummaryYear,
            TotalIssuedQuantity,
            AverageDailyUsage,
            AverageMonthlyUsage,
            ConsumptionValue,
            DemandCategory,
            ABCCategory,
            RecommendedReorderQuantity,
            GeneratedDate
        FROM dbo.BI_DemandSummary
        ORDER BY SummaryYear DESC, SummaryMonth DESC, TotalIssuedQuantity DESC, ItemID
        """
    )


def get_abc_analysis():
    return fetch_all(
        """
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
            GROUP BY i.ItemID, i.ItemName
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
        ORDER BY ConsumptionValue DESC
        """
    )


def get_expiry_risk():
    return fetch_all(
        """
        SELECT AlertLevel, COUNT(*) AS BatchCount, SUM(QuantityAvailable) AS QuantityAtRisk
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
            END
        """
    )


def get_reorder_recommendations():
    return fetch_all(
        """
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
        ORDER BY RecommendedReorderQuantity DESC, TotalIssuedQuantity DESC
        """
    )


def get_dashboard_summary():
    return fetch_all(
        """
        SELECT 'total_items' AS Metric, COUNT(*) AS Value FROM dbo.InventoryItem WHERE ItemStatus = 'Active'
        UNION ALL
        SELECT 'medicine_items', COUNT(*) FROM dbo.InventoryItem WHERE ItemCategory = 'Medicine' AND ItemStatus = 'Active'
        UNION ALL
        SELECT 'equipment_items', COUNT(*) FROM dbo.InventoryItem WHERE ItemCategory = 'Equipment' AND ItemStatus = 'Active'
        UNION ALL
        SELECT 'low_stock_items', COUNT(*) FROM dbo.vw_LowStockItems
        UNION ALL
        SELECT 'expiring_batches', COUNT(*) FROM dbo.vw_ExpiringSoonStock WHERE AlertLevel IN ('Expired', 'Critical', 'Warning')
        UNION ALL
        SELECT 'pending_purchase_orders', COUNT(*) FROM dbo.PurchaseOrder WHERE OrderStatus IN ('Pending', 'Approved', 'Ordered')
        UNION ALL
        SELECT 'monthly_issued_quantity', COALESCE(SUM(Quantity), 0)
        FROM dbo.StockTransaction
        WHERE TransactionType = 'DEPARTMENT_ISSUE'
          AND MONTH(TransactionDate) = MONTH(GETDATE())
          AND YEAR(TransactionDate) = YEAR(GETDATE())
        """
    )
