from app.db.connection import fetch_all


def get_low_stock():
    return fetch_all(
        """
        SELECT
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
        ORDER BY StockStatus, ItemName
        """
    )


def get_expiring_soon():
    return fetch_all(
        """
        SELECT
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
            DaysToExpiry
        """
    )


def get_department_consumption():
    return fetch_all(
        """
        SELECT DepartmentID, DepartmentName, ItemID, ItemName, UsageMonth, UsageYear, TotalIssuedQuantity
        FROM dbo.vw_DepartmentConsumptionSummary
        ORDER BY UsageYear DESC, UsageMonth DESC, TotalIssuedQuantity DESC
        """
    )


def get_supplier_performance():
    return fetch_all(
        """
        SELECT SupplierID, SupplierName, TotalOrders, CompletedOrders, CancelledOrders,
               DelayedOrders, AverageLeadTimeDays, AverageItemCost
        FROM dbo.vw_SupplierPerformance
        ORDER BY DelayedOrders DESC, CompletedOrders DESC, SupplierName
        """
    )
