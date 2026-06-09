USE HealthcareInventoryDB;
GO

IF OBJECT_ID(N'dbo.BI_DemandSummary', N'U') IS NOT NULL DROP TABLE dbo.BI_DemandSummary;
IF OBJECT_ID(N'dbo.ExpiryAlert', N'U') IS NOT NULL DROP TABLE dbo.ExpiryAlert;
IF OBJECT_ID(N'dbo.ReorderRule', N'U') IS NOT NULL DROP TABLE dbo.ReorderRule;
IF OBJECT_ID(N'dbo.StockTransaction', N'U') IS NOT NULL DROP TABLE dbo.StockTransaction;
IF OBJECT_ID(N'dbo.IssueRequestDetail', N'U') IS NOT NULL DROP TABLE dbo.IssueRequestDetail;
IF OBJECT_ID(N'dbo.IssueRequest', N'U') IS NOT NULL DROP TABLE dbo.IssueRequest;
IF OBJECT_ID(N'dbo.StockBatch', N'U') IS NOT NULL DROP TABLE dbo.StockBatch;
IF OBJECT_ID(N'dbo.PurchaseOrderDetail', N'U') IS NOT NULL DROP TABLE dbo.PurchaseOrderDetail;
IF OBJECT_ID(N'dbo.PurchaseOrder', N'U') IS NOT NULL DROP TABLE dbo.PurchaseOrder;
IF OBJECT_ID(N'dbo.SupplierItem', N'U') IS NOT NULL DROP TABLE dbo.SupplierItem;
IF OBJECT_ID(N'dbo.MedicalEquipment', N'U') IS NOT NULL DROP TABLE dbo.MedicalEquipment;
IF OBJECT_ID(N'dbo.Medicine', N'U') IS NOT NULL DROP TABLE dbo.Medicine;
IF OBJECT_ID(N'dbo.InventoryItem', N'U') IS NOT NULL DROP TABLE dbo.InventoryItem;
IF OBJECT_ID(N'dbo.Supplier', N'U') IS NOT NULL DROP TABLE dbo.Supplier;
IF OBJECT_ID(N'dbo.Staff', N'U') IS NOT NULL DROP TABLE dbo.Staff;
IF OBJECT_ID(N'dbo.Department', N'U') IS NOT NULL DROP TABLE dbo.Department;
GO

CREATE TABLE dbo.Department
(
    DepartmentID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Department PRIMARY KEY,
    DepartmentName NVARCHAR(100) NOT NULL,
    Location NVARCHAR(100) NULL,
    ContactNumber VARCHAR(25) NULL,
    Status VARCHAR(20) NOT NULL CONSTRAINT DF_Department_Status DEFAULT ('Active'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Department_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT UQ_Department_DepartmentName UNIQUE (DepartmentName),
    CONSTRAINT CK_Department_Status CHECK (Status IN ('Active', 'Inactive'))
);
GO

CREATE TABLE dbo.Staff
(
    StaffID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Staff PRIMARY KEY,
    DepartmentID INT NOT NULL,
    FullName NVARCHAR(120) NOT NULL,
    Role VARCHAR(40) NOT NULL,
    Email VARCHAR(120) NOT NULL,
    Phone VARCHAR(25) NULL,
    Username VARCHAR(60) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Status VARCHAR(20) NOT NULL CONSTRAINT DF_Staff_Status DEFAULT ('Active'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Staff_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_Staff_Department FOREIGN KEY (DepartmentID) REFERENCES dbo.Department(DepartmentID),
    CONSTRAINT UQ_Staff_Email UNIQUE (Email),
    CONSTRAINT UQ_Staff_Username UNIQUE (Username),
    CONSTRAINT CK_Staff_Role CHECK (Role IN ('Admin', 'InventoryManager', 'Pharmacist', 'ProcurementOfficer', 'DepartmentStaff', 'HospitalAdministrator')),
    CONSTRAINT CK_Staff_Status CHECK (Status IN ('Active', 'Inactive'))
);
GO

CREATE TABLE dbo.Supplier
(
    SupplierID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Supplier PRIMARY KEY,
    SupplierName NVARCHAR(120) NOT NULL,
    ContactPerson NVARCHAR(100) NULL,
    Phone VARCHAR(25) NULL,
    Email VARCHAR(120) NULL,
    Address NVARCHAR(255) NULL,
    LeadTimeDays INT NOT NULL CONSTRAINT DF_Supplier_LeadTimeDays DEFAULT (7),
    Status VARCHAR(20) NOT NULL CONSTRAINT DF_Supplier_Status DEFAULT ('Active'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_Supplier_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT UQ_Supplier_SupplierName UNIQUE (SupplierName),
    CONSTRAINT UQ_Supplier_Email UNIQUE (Email),
    CONSTRAINT CK_Supplier_LeadTimeDays CHECK (LeadTimeDays >= 0),
    CONSTRAINT CK_Supplier_Status CHECK (Status IN ('Active', 'Inactive'))
);
GO

CREATE TABLE dbo.InventoryItem
(
    ItemID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_InventoryItem PRIMARY KEY,
    ItemName NVARCHAR(150) NOT NULL,
    ItemCategory VARCHAR(30) NOT NULL,
    UnitOfMeasure VARCHAR(30) NOT NULL,
    ReorderLevel INT NOT NULL CONSTRAINT DF_InventoryItem_ReorderLevel DEFAULT (0),
    MaximumStockLevel INT NOT NULL CONSTRAINT DF_InventoryItem_MaximumStockLevel DEFAULT (0),
    ItemStatus VARCHAR(20) NOT NULL CONSTRAINT DF_InventoryItem_ItemStatus DEFAULT ('Active'),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_InventoryItem_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT UQ_InventoryItem_ItemName UNIQUE (ItemName),
    CONSTRAINT CK_InventoryItem_ItemCategory CHECK (ItemCategory IN ('Medicine', 'Equipment', 'Consumable')),
    CONSTRAINT CK_InventoryItem_ReorderLevel CHECK (ReorderLevel >= 0),
    CONSTRAINT CK_InventoryItem_MaximumStockLevel CHECK (MaximumStockLevel >= ReorderLevel),
    CONSTRAINT CK_InventoryItem_ItemStatus CHECK (ItemStatus IN ('Active', 'Inactive'))
);
GO

CREATE TABLE dbo.Medicine
(
    ItemID INT NOT NULL CONSTRAINT PK_Medicine PRIMARY KEY,
    GenericName NVARCHAR(120) NOT NULL,
    BrandName NVARCHAR(120) NULL,
    Dosage VARCHAR(50) NOT NULL,
    DrugForm VARCHAR(50) NOT NULL,
    StorageCondition NVARCHAR(120) NULL,
    PrescriptionRequired BIT NOT NULL CONSTRAINT DF_Medicine_PrescriptionRequired DEFAULT (0),
    CONSTRAINT FK_Medicine_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID)
);
GO

CREATE TABLE dbo.MedicalEquipment
(
    ItemID INT NOT NULL CONSTRAINT PK_MedicalEquipment PRIMARY KEY,
    EquipmentType NVARCHAR(100) NOT NULL,
    WarrantyMonths INT NOT NULL CONSTRAINT DF_MedicalEquipment_WarrantyMonths DEFAULT (0),
    MaintenanceRequired BIT NOT NULL CONSTRAINT DF_MedicalEquipment_MaintenanceRequired DEFAULT (0),
    ServiceFrequencyMonths INT NULL,
    CONSTRAINT FK_MedicalEquipment_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT CK_MedicalEquipment_WarrantyMonths CHECK (WarrantyMonths >= 0),
    CONSTRAINT CK_MedicalEquipment_ServiceFrequencyMonths CHECK (ServiceFrequencyMonths IS NULL OR ServiceFrequencyMonths > 0)
);
GO

CREATE TABLE dbo.SupplierItem
(
    SupplierID INT NOT NULL,
    ItemID INT NOT NULL,
    SupplierUnitPrice DECIMAL(12,2) NOT NULL,
    PreferredSupplierStatus BIT NOT NULL CONSTRAINT DF_SupplierItem_Preferred DEFAULT (0),
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SupplierItem_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT PK_SupplierItem PRIMARY KEY (SupplierID, ItemID),
    CONSTRAINT FK_SupplierItem_Supplier FOREIGN KEY (SupplierID) REFERENCES dbo.Supplier(SupplierID),
    CONSTRAINT FK_SupplierItem_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT CK_SupplierItem_SupplierUnitPrice CHECK (SupplierUnitPrice >= 0)
);
GO

CREATE TABLE dbo.PurchaseOrder
(
    PurchaseOrderID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PurchaseOrder PRIMARY KEY,
    SupplierID INT NOT NULL,
    CreatedByStaffID INT NOT NULL,
    OrderDate DATETIME2(0) NOT NULL CONSTRAINT DF_PurchaseOrder_OrderDate DEFAULT (SYSDATETIME()),
    ExpectedDeliveryDate DATE NULL,
    CompletedDate DATE NULL,
    OrderStatus VARCHAR(30) NOT NULL CONSTRAINT DF_PurchaseOrder_OrderStatus DEFAULT ('Pending'),
    CONSTRAINT FK_PurchaseOrder_Supplier FOREIGN KEY (SupplierID) REFERENCES dbo.Supplier(SupplierID),
    CONSTRAINT FK_PurchaseOrder_Staff FOREIGN KEY (CreatedByStaffID) REFERENCES dbo.Staff(StaffID),
    CONSTRAINT CK_PurchaseOrder_OrderStatus CHECK (OrderStatus IN ('Pending', 'Approved', 'Ordered', 'PartiallyReceived', 'Completed', 'Cancelled')),
    CONSTRAINT CK_PurchaseOrder_DeliveryDates CHECK (ExpectedDeliveryDate IS NULL OR CompletedDate IS NULL OR CompletedDate >= CAST(OrderDate AS DATE))
);
GO

CREATE TABLE dbo.PurchaseOrderDetail
(
    PurchaseOrderDetailID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PurchaseOrderDetail PRIMARY KEY,
    PurchaseOrderID INT NOT NULL,
    ItemID INT NOT NULL,
    OrderedQuantity INT NOT NULL,
    ReceivedQuantity INT NOT NULL CONSTRAINT DF_PurchaseOrderDetail_ReceivedQuantity DEFAULT (0),
    UnitPrice DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_PurchaseOrderDetail_PurchaseOrder FOREIGN KEY (PurchaseOrderID) REFERENCES dbo.PurchaseOrder(PurchaseOrderID),
    CONSTRAINT FK_PurchaseOrderDetail_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT UQ_PurchaseOrderDetail_OrderItem UNIQUE (PurchaseOrderID, ItemID),
    CONSTRAINT CK_PurchaseOrderDetail_OrderedQuantity CHECK (OrderedQuantity > 0),
    CONSTRAINT CK_PurchaseOrderDetail_ReceivedQuantity CHECK (ReceivedQuantity >= 0 AND ReceivedQuantity <= OrderedQuantity),
    CONSTRAINT CK_PurchaseOrderDetail_UnitPrice CHECK (UnitPrice >= 0)
);
GO

CREATE TABLE dbo.StockBatch
(
    BatchID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_StockBatch PRIMARY KEY,
    ItemID INT NOT NULL,
    SupplierID INT NOT NULL,
    PurchaseOrderDetailID INT NULL,
    BatchNumber VARCHAR(60) NOT NULL,
    ReceivedDate DATE NOT NULL CONSTRAINT DF_StockBatch_ReceivedDate DEFAULT (CAST(GETDATE() AS DATE)),
    ManufactureDate DATE NULL,
    ExpiryDate DATE NULL,
    QuantityReceived INT NOT NULL,
    QuantityAvailable INT NOT NULL,
    UnitCost DECIMAL(12,2) NOT NULL,
    CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_StockBatch_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_StockBatch_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT FK_StockBatch_Supplier FOREIGN KEY (SupplierID) REFERENCES dbo.Supplier(SupplierID),
    CONSTRAINT FK_StockBatch_PurchaseOrderDetail FOREIGN KEY (PurchaseOrderDetailID) REFERENCES dbo.PurchaseOrderDetail(PurchaseOrderDetailID),
    CONSTRAINT UQ_StockBatch_ItemSupplierBatch UNIQUE (ItemID, SupplierID, BatchNumber),
    CONSTRAINT CK_StockBatch_QuantityReceived CHECK (QuantityReceived > 0),
    CONSTRAINT CK_StockBatch_QuantityAvailable CHECK (QuantityAvailable >= 0 AND QuantityAvailable <= QuantityReceived),
    CONSTRAINT CK_StockBatch_UnitCost CHECK (UnitCost >= 0),
    CONSTRAINT CK_StockBatch_ExpiryAfterManufacture CHECK (ManufactureDate IS NULL OR ExpiryDate IS NULL OR ExpiryDate > ManufactureDate)
);
GO

CREATE TABLE dbo.IssueRequest
(
    IssueRequestID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_IssueRequest PRIMARY KEY,
    DepartmentID INT NOT NULL,
    RequestedByStaffID INT NOT NULL,
    RequestDate DATETIME2(0) NOT NULL CONSTRAINT DF_IssueRequest_RequestDate DEFAULT (SYSDATETIME()),
    RequestStatus VARCHAR(20) NOT NULL CONSTRAINT DF_IssueRequest_RequestStatus DEFAULT ('Pending'),
    ApprovedByStaffID INT NULL,
    ApprovedDate DATETIME2(0) NULL,
    CONSTRAINT FK_IssueRequest_Department FOREIGN KEY (DepartmentID) REFERENCES dbo.Department(DepartmentID),
    CONSTRAINT FK_IssueRequest_RequestedByStaff FOREIGN KEY (RequestedByStaffID) REFERENCES dbo.Staff(StaffID),
    CONSTRAINT FK_IssueRequest_ApprovedByStaff FOREIGN KEY (ApprovedByStaffID) REFERENCES dbo.Staff(StaffID),
    CONSTRAINT CK_IssueRequest_RequestStatus CHECK (RequestStatus IN ('Pending', 'Approved', 'Issued', 'Rejected', 'Cancelled'))
);
GO

CREATE TABLE dbo.IssueRequestDetail
(
    IssueRequestDetailID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_IssueRequestDetail PRIMARY KEY,
    IssueRequestID INT NOT NULL,
    ItemID INT NOT NULL,
    RequestedQuantity INT NOT NULL,
    ApprovedQuantity INT NOT NULL CONSTRAINT DF_IssueRequestDetail_ApprovedQuantity DEFAULT (0),
    IssuedQuantity INT NOT NULL CONSTRAINT DF_IssueRequestDetail_IssuedQuantity DEFAULT (0),
    CONSTRAINT FK_IssueRequestDetail_IssueRequest FOREIGN KEY (IssueRequestID) REFERENCES dbo.IssueRequest(IssueRequestID),
    CONSTRAINT FK_IssueRequestDetail_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT CK_IssueRequestDetail_RequestedQuantity CHECK (RequestedQuantity > 0),
    CONSTRAINT CK_IssueRequestDetail_ApprovedQuantity CHECK (ApprovedQuantity >= 0 AND ApprovedQuantity <= RequestedQuantity),
    CONSTRAINT CK_IssueRequestDetail_IssuedQuantity CHECK (IssuedQuantity >= 0 AND IssuedQuantity <= ApprovedQuantity)
);
GO

CREATE TABLE dbo.StockTransaction
(
    TransactionID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_StockTransaction PRIMARY KEY,
    BatchID INT NOT NULL,
    ItemID INT NOT NULL,
    TransactionType VARCHAR(30) NOT NULL,
    Quantity INT NOT NULL,
    TransactionDate DATETIME2(0) NOT NULL CONSTRAINT DF_StockTransaction_TransactionDate DEFAULT (SYSDATETIME()),
    ReferenceType VARCHAR(40) NULL,
    ReferenceID INT NULL,
    StaffID INT NOT NULL,
    Notes NVARCHAR(255) NULL,
    CONSTRAINT FK_StockTransaction_StockBatch FOREIGN KEY (BatchID) REFERENCES dbo.StockBatch(BatchID),
    CONSTRAINT FK_StockTransaction_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT FK_StockTransaction_Staff FOREIGN KEY (StaffID) REFERENCES dbo.Staff(StaffID),
    CONSTRAINT CK_StockTransaction_TransactionType CHECK (TransactionType IN ('PURCHASE_RECEIVE', 'DEPARTMENT_ISSUE', 'RETURN', 'ADJUSTMENT', 'EXPIRED_REMOVAL', 'DAMAGED_REMOVAL')),
    CONSTRAINT CK_StockTransaction_Quantity CHECK (Quantity > 0)
);
GO

CREATE TABLE dbo.ReorderRule
(
    ReorderRuleID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ReorderRule PRIMARY KEY,
    ItemID INT NOT NULL,
    MinimumStockLevel INT NOT NULL CONSTRAINT DF_ReorderRule_MinimumStockLevel DEFAULT (0),
    ReorderQuantity INT NOT NULL CONSTRAINT DF_ReorderRule_ReorderQuantity DEFAULT (0),
    SafetyStock INT NOT NULL CONSTRAINT DF_ReorderRule_SafetyStock DEFAULT (0),
    LeadTimeDays INT NOT NULL CONSTRAINT DF_ReorderRule_LeadTimeDays DEFAULT (7),
    Status VARCHAR(20) NOT NULL CONSTRAINT DF_ReorderRule_Status DEFAULT ('Active'),
    CONSTRAINT FK_ReorderRule_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT UQ_ReorderRule_ItemID UNIQUE (ItemID),
    CONSTRAINT CK_ReorderRule_MinimumStockLevel CHECK (MinimumStockLevel >= 0),
    CONSTRAINT CK_ReorderRule_ReorderQuantity CHECK (ReorderQuantity >= 0),
    CONSTRAINT CK_ReorderRule_SafetyStock CHECK (SafetyStock >= 0),
    CONSTRAINT CK_ReorderRule_LeadTimeDays CHECK (LeadTimeDays >= 0),
    CONSTRAINT CK_ReorderRule_Status CHECK (Status IN ('Active', 'Inactive'))
);
GO

CREATE TABLE dbo.ExpiryAlert
(
    AlertID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ExpiryAlert PRIMARY KEY,
    BatchID INT NOT NULL,
    ItemID INT NOT NULL,
    AlertDate DATETIME2(0) NOT NULL CONSTRAINT DF_ExpiryAlert_AlertDate DEFAULT (SYSDATETIME()),
    ExpiryDate DATE NOT NULL,
    AlertType VARCHAR(20) NOT NULL,
    AlertStatus VARCHAR(20) NOT NULL CONSTRAINT DF_ExpiryAlert_AlertStatus DEFAULT ('Open'),
    ResolvedDate DATETIME2(0) NULL,
    CONSTRAINT FK_ExpiryAlert_StockBatch FOREIGN KEY (BatchID) REFERENCES dbo.StockBatch(BatchID),
    CONSTRAINT FK_ExpiryAlert_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT CK_ExpiryAlert_AlertType CHECK (AlertType IN ('Expired', 'Critical', 'Warning')),
    CONSTRAINT CK_ExpiryAlert_AlertStatus CHECK (AlertStatus IN ('Open', 'Resolved'))
);
GO

CREATE TABLE dbo.BI_DemandSummary
(
    SummaryID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_BI_DemandSummary PRIMARY KEY,
    ItemID INT NOT NULL,
    SummaryMonth TINYINT NOT NULL,
    SummaryYear SMALLINT NOT NULL,
    TotalIssuedQuantity INT NOT NULL CONSTRAINT DF_BI_DemandSummary_TotalIssuedQuantity DEFAULT (0),
    AverageDailyUsage DECIMAL(12,2) NOT NULL CONSTRAINT DF_BI_DemandSummary_AverageDailyUsage DEFAULT (0),
    AverageMonthlyUsage DECIMAL(12,2) NOT NULL CONSTRAINT DF_BI_DemandSummary_AverageMonthlyUsage DEFAULT (0),
    ConsumptionValue DECIMAL(14,2) NOT NULL CONSTRAINT DF_BI_DemandSummary_ConsumptionValue DEFAULT (0),
    DemandCategory VARCHAR(20) NOT NULL CONSTRAINT DF_BI_DemandSummary_DemandCategory DEFAULT ('Slow Moving'),
    ABCCategory CHAR(1) NOT NULL CONSTRAINT DF_BI_DemandSummary_ABCCategory DEFAULT ('C'),
    RecommendedReorderQuantity INT NOT NULL CONSTRAINT DF_BI_DemandSummary_RecommendedReorderQuantity DEFAULT (0),
    GeneratedDate DATETIME2(0) NOT NULL CONSTRAINT DF_BI_DemandSummary_GeneratedDate DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_BI_DemandSummary_InventoryItem FOREIGN KEY (ItemID) REFERENCES dbo.InventoryItem(ItemID),
    CONSTRAINT UQ_BI_DemandSummary_ItemMonthYear UNIQUE (ItemID, SummaryMonth, SummaryYear),
    CONSTRAINT CK_BI_DemandSummary_SummaryMonth CHECK (SummaryMonth BETWEEN 1 AND 12),
    CONSTRAINT CK_BI_DemandSummary_TotalIssuedQuantity CHECK (TotalIssuedQuantity >= 0),
    CONSTRAINT CK_BI_DemandSummary_AverageDailyUsage CHECK (AverageDailyUsage >= 0),
    CONSTRAINT CK_BI_DemandSummary_AverageMonthlyUsage CHECK (AverageMonthlyUsage >= 0),
    CONSTRAINT CK_BI_DemandSummary_ConsumptionValue CHECK (ConsumptionValue >= 0),
    CONSTRAINT CK_BI_DemandSummary_DemandCategory CHECK (DemandCategory IN ('Fast Moving', 'Medium Moving', 'Slow Moving')),
    CONSTRAINT CK_BI_DemandSummary_ABCCategory CHECK (ABCCategory IN ('A', 'B', 'C')),
    CONSTRAINT CK_BI_DemandSummary_RecommendedReorderQuantity CHECK (RecommendedReorderQuantity >= 0)
);
GO

CREATE INDEX IX_Staff_DepartmentID ON dbo.Staff(DepartmentID);
CREATE INDEX IX_InventoryItem_CategoryStatus ON dbo.InventoryItem(ItemCategory, ItemStatus);
CREATE INDEX IX_Supplier_Status ON dbo.Supplier(Status);
CREATE INDEX IX_PurchaseOrder_SupplierStatus ON dbo.PurchaseOrder(SupplierID, OrderStatus);
CREATE INDEX IX_PurchaseOrderDetail_ItemID ON dbo.PurchaseOrderDetail(ItemID);
CREATE INDEX IX_StockBatch_ItemAvailability ON dbo.StockBatch(ItemID, QuantityAvailable, ExpiryDate);
CREATE INDEX IX_StockBatch_SupplierID ON dbo.StockBatch(SupplierID);
CREATE INDEX IX_IssueRequest_DepartmentStatus ON dbo.IssueRequest(DepartmentID, RequestStatus);
CREATE INDEX IX_IssueRequestDetail_ItemID ON dbo.IssueRequestDetail(ItemID);
CREATE INDEX IX_StockTransaction_ItemDate ON dbo.StockTransaction(ItemID, TransactionDate);
CREATE INDEX IX_StockTransaction_BatchID ON dbo.StockTransaction(BatchID);
CREATE INDEX IX_ExpiryAlert_StatusType ON dbo.ExpiryAlert(AlertStatus, AlertType);
CREATE UNIQUE INDEX UX_ExpiryAlert_OpenBatchType ON dbo.ExpiryAlert(BatchID, AlertType) WHERE AlertStatus = 'Open';
GO
