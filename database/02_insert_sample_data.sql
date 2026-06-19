USE HealthcareInventoryDB;
GO

SET IDENTITY_INSERT dbo.Department ON;
INSERT INTO dbo.Department (DepartmentID, DepartmentName, Location, ContactNumber, Status) VALUES
(1, 'Pharmacy', 'Block A - Ground Floor', '011-555-0101', 'Active'),
(2, 'Emergency Department', 'Block B - Ground Floor', '011-555-0102', 'Active'),
(3, 'ICU', 'Block C - Level 2', '011-555-0103', 'Active'),
(4, 'Surgery Department', 'Block D - Level 3', '011-555-0104', 'Active'),
(5, 'Laboratory', 'Block A - Level 1', '011-555-0105', 'Active'),
(6, 'Outpatient Department', 'Block B - Level 1', '011-555-0106', 'Active'),
(7, 'Pediatric Ward', 'Block C - Level 1', '011-555-0107', 'Active'),
(8, 'Maternity Ward', 'Block C - Level 3', '011-555-0108', 'Active'),
(9, 'Radiology', 'Block E - Ground Floor', '011-555-0109', 'Active'),
(10, 'General Ward', 'Block D - Level 1', '011-555-0110', 'Active');
SET IDENTITY_INSERT dbo.Department OFF;
GO

SET IDENTITY_INSERT dbo.Staff ON;
INSERT INTO dbo.Staff (StaffID, DepartmentID, FullName, Role, Email, Phone, Username, PasswordHash, Status) VALUES
(1, 1, 'Anjali Perera', 'Admin', 'anjali.perera@hims.local', '0771000001', 'anjali.admin', 'HASHED_PASSWORD_SAMPLE_001', 'Active'),
(2, 1, 'Nuwan Silva', 'InventoryManager', 'nuwan.silva@hims.local', '0771000002', 'nuwan.inventory', 'HASHED_PASSWORD_SAMPLE_002', 'Active'),
(3, 1, 'Kavindi Fernando', 'Pharmacist', 'kavindi.fernando@hims.local', '0771000003', 'kavindi.pharma', 'HASHED_PASSWORD_SAMPLE_003', 'Active'),
(4, 4, 'Dinesh Jayasinghe', 'ProcurementOfficer', 'dinesh.jayasinghe@hims.local', '0771000004', 'dinesh.procure', 'HASHED_PASSWORD_SAMPLE_004', 'Active'),
(5, 2, 'Malith Gunasekara', 'DepartmentStaff', 'malith.gunasekara@hims.local', '0771000005', 'malith.er', 'HASHED_PASSWORD_SAMPLE_005', 'Active'),
(6, 3, 'Ruwani Weerasinghe', 'DepartmentStaff', 'ruwani.weerasinghe@hims.local', '0771000006', 'ruwani.icu', 'HASHED_PASSWORD_SAMPLE_006', 'Active'),
(7, 5, 'Samanthi Dias', 'DepartmentStaff', 'samanthi.dias@hims.local', '0771000007', 'samanthi.lab', 'HASHED_PASSWORD_SAMPLE_007', 'Active'),
(8, 10, 'Harsha Wijeratne', 'HospitalAdministrator', 'harsha.wijeratne@hims.local', '0771000008', 'harsha.admin', 'HASHED_PASSWORD_SAMPLE_008', 'Active'),
(9, 7, 'Tharushi Nanayakkara', 'DepartmentStaff', 'tharushi.nanayakkara@hims.local', '0771000009', 'tharushi.peds', 'HASHED_PASSWORD_SAMPLE_009', 'Active'),
(10, 8, 'Chamari Rajapaksha', 'DepartmentStaff', 'chamari.rajapaksha@hims.local', '0771000010', 'chamari.mat', 'HASHED_PASSWORD_SAMPLE_010', 'Active');
SET IDENTITY_INSERT dbo.Staff OFF;
GO

SET IDENTITY_INSERT dbo.Supplier ON;
INSERT INTO dbo.Supplier (SupplierID, SupplierName, ContactPerson, Phone, Email, Address, LeadTimeDays, Status) VALUES
(1, 'MediSupply Lanka', 'Rohan Alwis', '011-700-1001', 'orders@medisupply.lk', 'Colombo 05', 5, 'Active'),
(2, 'HealthCare Distributors', 'Priyantha Mendis', '011-700-1002', 'sales@healthcaredist.lk', 'Nugegoda', 7, 'Active'),
(3, 'PharmaLine Pvt Ltd', 'Ishara Senanayake', '011-700-1003', 'contact@pharmaline.lk', 'Rajagiriya', 6, 'Active'),
(4, 'SafeMed Suppliers', 'Mohan De Silva', '011-700-1004', 'support@safemed.lk', 'Dehiwala', 4, 'Active'),
(5, 'BioHealth Medicals', 'Dilini Wickramasinghe', '011-700-1005', 'info@biohealth.lk', 'Battaramulla', 8, 'Active'),
(6, 'Global Pharma Traders', 'Fazil Mohamed', '011-700-1006', 'orders@globalpharma.lk', 'Colombo 10', 10, 'Active'),
(7, 'SurgicalPro Supplies', 'Rashmi Peris', '011-700-1007', 'sales@surgicalpro.lk', 'Moratuwa', 6, 'Active'),
(8, 'LifeCare Medicals', 'Kasun Abeywickrama', '011-700-1008', 'orders@lifecare.lk', 'Kandy', 9, 'Active'),
(9, 'MediEquip Solutions', 'Heshan Kuruppu', '011-700-1009', 'sales@mediequip.lk', 'Maharagama', 12, 'Active'),
(10, 'FirstAid Distributors', 'Dinuka Peiris', '011-700-1010', 'hello@firstaid.lk', 'Gampaha', 5, 'Active');
SET IDENTITY_INSERT dbo.Supplier OFF;
GO

SET IDENTITY_INSERT dbo.InventoryItem ON;
INSERT INTO dbo.InventoryItem (ItemID, ItemName, ItemCategory, UnitOfMeasure, ReorderLevel, MaximumStockLevel, ItemStatus) VALUES
(1, 'Paracetamol 500mg', 'Medicine', 'Tablet', 120, 1000, 'Active'),
(2, 'Amoxicillin 250mg', 'Medicine', 'Capsule', 100, 800, 'Active'),
(3, 'Ceftriaxone Injection', 'Medicine', 'Vial', 60, 500, 'Active'),
(4, 'Insulin Vial', 'Medicine', 'Vial', 40, 300, 'Active'),
(5, 'Salbutamol Inhaler', 'Medicine', 'Inhaler', 35, 250, 'Active'),
(6, 'Surgical Gloves', 'Consumable', 'Box', 80, 600, 'Active'),
(7, 'Face Masks', 'Consumable', 'Box', 100, 800, 'Active'),
(8, 'Syringes 5ml', 'Consumable', 'Packet', 70, 500, 'Active'),
(9, 'IV Cannula', 'Consumable', 'Piece', 90, 700, 'Active'),
(10, 'Blood Pressure Monitor', 'Equipment', 'Unit', 5, 40, 'Active'),
(11, 'Digital Thermometer', 'Equipment', 'Unit', 10, 80, 'Active'),
(12, 'ECG Electrodes', 'Consumable', 'Packet', 50, 400, 'Active'),
(13, 'Omeprazole 20mg', 'Medicine', 'Capsule', 160, 600, 'Active'),
(14, 'Pulse Oximeter', 'Equipment', 'Unit', 12, 60, 'Active');
SET IDENTITY_INSERT dbo.InventoryItem OFF;
GO

INSERT INTO dbo.Medicine (ItemID, GenericName, BrandName, Dosage, DrugForm, StorageCondition, PrescriptionRequired) VALUES
(1, 'Paracetamol', 'Panadol', '500mg', 'Tablet', 'Store below 30 C', 0),
(2, 'Amoxicillin', 'Amoxil', '250mg', 'Capsule', 'Store below 30 C', 1),
(3, 'Ceftriaxone', 'Rocephin', '1g', 'Injection Vial', 'Store below 25 C', 1),
(4, 'Insulin Human', 'Actrapid', '10ml', 'Injection Vial', 'Refrigerate 2-8 C', 1),
(5, 'Salbutamol', 'Ventolin', '100mcg', 'Inhaler', 'Store below 30 C', 1),
(13, 'Omeprazole', 'Losec', '20mg', 'Capsule', 'Store below 30 C', 1);
GO

INSERT INTO dbo.MedicalEquipment (ItemID, EquipmentType, WarrantyMonths, MaintenanceRequired, ServiceFrequencyMonths) VALUES
(10, 'Diagnostic Monitor', 24, 1, 12),
(11, 'Diagnostic Device', 12, 1, 6),
(14, 'Patient Monitoring Device', 18, 1, 6);
GO

INSERT INTO dbo.SupplierItem (SupplierID, ItemID, SupplierUnitPrice, PreferredSupplierStatus) VALUES
(1, 1, 3.50, 1), (2, 1, 3.65, 0), (3, 2, 8.25, 1), (6, 2, 8.40, 0),
(3, 3, 125.00, 1), (5, 4, 950.00, 1), (8, 4, 975.00, 0), (4, 5, 620.00, 1),
(7, 6, 1400.00, 1), (10, 7, 850.00, 1), (10, 8, 425.00, 1), (7, 9, 55.00, 1),
(9, 10, 18500.00, 1), (9, 11, 1450.00, 1), (7, 12, 900.00, 1),
(3, 13, 12.50, 1), (9, 14, 6500.00, 1);
GO

SET IDENTITY_INSERT dbo.PurchaseOrder ON;
INSERT INTO dbo.PurchaseOrder (PurchaseOrderID, SupplierID, CreatedByStaffID, OrderDate, ExpectedDeliveryDate, CompletedDate, OrderStatus) VALUES
(1, 1, 4, '2026-01-05T09:30:00', '2026-01-10', '2026-01-09', 'Completed'),
(2, 3, 4, '2026-01-07T10:15:00', '2026-01-14', '2026-01-13', 'Completed'),
(3, 5, 4, '2026-01-10T11:00:00', '2026-01-18', '2026-01-18', 'Completed'),
(4, 4, 4, '2026-02-01T09:45:00', '2026-02-06', '2026-02-05', 'Completed'),
(5, 7, 4, '2026-02-05T14:10:00', '2026-02-12', '2026-02-14', 'Completed'),
(6, 10, 4, '2026-02-07T15:20:00', '2026-02-12', '2026-02-11', 'Completed'),
(7, 9, 4, '2026-03-01T10:00:00', '2026-03-13', NULL, 'Ordered'),
(8, 2, 4, '2026-03-05T13:00:00', '2026-03-12', NULL, 'Approved'),
(9, 6, 4, '2026-03-10T09:25:00', '2026-03-21', NULL, 'Pending'),
(10, 8, 4, '2026-03-12T16:05:00', '2026-03-22', NULL, 'Cancelled'),
(11, 3, 4, '2026-03-14T09:40:00', '2026-03-20', '2026-03-19', 'Completed');
SET IDENTITY_INSERT dbo.PurchaseOrder OFF;
GO

SET IDENTITY_INSERT dbo.PurchaseOrderDetail ON;
INSERT INTO dbo.PurchaseOrderDetail (PurchaseOrderDetailID, PurchaseOrderID, ItemID, OrderedQuantity, ReceivedQuantity, UnitPrice) VALUES
(1, 1, 1, 500, 500, 3.50),
(2, 1, 7, 300, 300, 850.00),
(3, 2, 2, 400, 400, 8.25),
(4, 2, 3, 150, 150, 125.00),
(5, 3, 4, 120, 120, 950.00),
(6, 4, 5, 80, 80, 620.00),
(7, 5, 6, 200, 200, 1400.00),
(8, 5, 9, 300, 300, 55.00),
(9, 6, 8, 250, 250, 425.00),
(10, 6, 12, 120, 120, 900.00),
(11, 7, 10, 10, 0, 18500.00),
(12, 7, 11, 30, 0, 1450.00),
(13, 8, 1, 600, 0, 3.65),
(14, 9, 2, 500, 0, 8.40),
(15, 10, 4, 50, 0, 975.00),
(16, 11, 13, 180, 180, 12.50),
(17, 11, 14, 12, 12, 6500.00);
SET IDENTITY_INSERT dbo.PurchaseOrderDetail OFF;
GO

SET IDENTITY_INSERT dbo.StockBatch ON;
INSERT INTO dbo.StockBatch (BatchID, ItemID, SupplierID, PurchaseOrderDetailID, BatchNumber, ReceivedDate, ManufactureDate, ExpiryDate, QuantityReceived, QuantityAvailable, UnitCost) VALUES
(1, 1, 1, 1, 'PARA-B001', '2026-01-09', '2025-12-01', '2026-06-10', 200, 90, 3.50),
(2, 1, 1, 1, 'PARA-B002', '2026-01-09', '2025-12-15', '2026-08-15', 300, 300, 3.50),
(3, 2, 3, 3, 'AMOX-A101', '2026-01-13', '2025-11-10', '2026-07-30', 400, 330, 8.25),
(4, 3, 3, 4, 'CEF-C201', '2026-01-13', '2025-12-05', '2026-05-25', 150, 85, 125.00),
(5, 4, 5, 5, 'INS-I301', '2026-01-18', '2025-12-20', '2026-05-20', 120, 100, 950.00),
(6, 5, 4, 6, 'SAL-S401', '2026-02-05', '2026-01-02', '2027-01-02', 80, 55, 620.00),
(7, 6, 7, 7, 'GLO-G501', '2026-02-14', NULL, NULL, 200, 145, 1400.00),
(8, 7, 10, 2, 'MASK-M601', '2026-01-09', NULL, NULL, 300, 260, 850.00),
(9, 8, 10, 9, 'SYR-S701', '2026-02-11', NULL, NULL, 250, 190, 425.00),
(10, 9, 7, 8, 'CAN-C801', '2026-02-14', NULL, '2028-02-01', 300, 255, 55.00),
(11, 12, 7, 10, 'ECG-E901', '2026-02-11', NULL, '2027-06-30', 120, 90, 900.00),
(12, 10, 9, NULL, 'BPM-X001', '2026-03-01', NULL, NULL, 8, 8, 18500.00),
(13, 11, 9, NULL, 'THER-T101', '2026-03-01', NULL, NULL, 20, 15, 1450.00),
(14, 3, 3, NULL, 'CEF-OLD01', '2025-12-01', '2025-01-01', '2026-04-20', 40, 40, 118.00),
(15, 13, 3, 16, 'OME-O101', '2026-03-19', '2026-01-20', '2027-01-20', 180, 150, 12.50),
(16, 14, 9, 17, 'OXI-P101', '2026-03-19', NULL, NULL, 12, 10, 6500.00);
SET IDENTITY_INSERT dbo.StockBatch OFF;
GO

SET IDENTITY_INSERT dbo.IssueRequest ON;
INSERT INTO dbo.IssueRequest (IssueRequestID, DepartmentID, RequestedByStaffID, RequestDate, RequestStatus, ApprovedByStaffID, ApprovedDate) VALUES
(1, 2, 5, '2026-02-15T09:10:00', 'Issued', 2, '2026-02-15T09:20:00'),
(2, 3, 6, '2026-02-17T11:00:00', 'Issued', 2, '2026-02-17T11:15:00'),
(3, 7, 9, '2026-02-18T14:30:00', 'Issued', 3, '2026-02-18T14:45:00'),
(4, 8, 10, '2026-02-20T10:20:00', 'Issued', 3, '2026-02-20T10:35:00'),
(5, 5, 7, '2026-02-21T13:05:00', 'Issued', 2, '2026-02-21T13:10:00'),
(6, 10, 8, '2026-02-25T08:50:00', 'Issued', 2, '2026-02-25T09:00:00'),
(7, 2, 5, '2026-03-03T12:25:00', 'Issued', 2, '2026-03-03T12:40:00'),
(8, 4, 4, '2026-03-06T15:15:00', 'Issued', 2, '2026-03-06T15:20:00'),
(9, 6, 5, '2026-03-08T10:00:00', 'Issued', 3, '2026-03-08T10:10:00'),
(10, 9, 8, '2026-03-10T16:30:00', 'Issued', 2, '2026-03-10T16:40:00'),
(11, 2, 5, '2026-03-20T09:15:00', 'Issued', 3, '2026-03-20T09:25:00'),
(12, 3, 6, '2026-03-21T14:00:00', 'Issued', 2, '2026-03-21T14:10:00');
SET IDENTITY_INSERT dbo.IssueRequest OFF;
GO

SET IDENTITY_INSERT dbo.IssueRequestDetail ON;
INSERT INTO dbo.IssueRequestDetail (IssueRequestDetailID, IssueRequestID, ItemID, RequestedQuantity, ApprovedQuantity, IssuedQuantity) VALUES
(1, 1, 1, 60, 60, 60),
(2, 1, 7, 40, 40, 40),
(3, 2, 4, 20, 20, 20),
(4, 2, 9, 45, 45, 45),
(5, 3, 2, 70, 70, 70),
(6, 4, 1, 50, 50, 50),
(7, 5, 8, 60, 60, 60),
(8, 6, 6, 55, 55, 55),
(9, 7, 3, 65, 65, 65),
(10, 8, 12, 30, 30, 30),
(11, 9, 5, 25, 25, 25),
(12, 10, 11, 5, 5, 5),
(13, 11, 13, 30, 30, 30),
(14, 12, 14, 2, 2, 2);
SET IDENTITY_INSERT dbo.IssueRequestDetail OFF;
GO

SET IDENTITY_INSERT dbo.StockTransaction ON;
INSERT INTO dbo.StockTransaction (TransactionID, BatchID, ItemID, TransactionType, Quantity, TransactionDate, ReferenceType, ReferenceID, StaffID, Notes) VALUES
(1, 1, 1, 'PURCHASE_RECEIVE', 200, '2026-01-09T09:00:00', 'PurchaseOrderDetail', 1, 4, 'Initial stock receive'),
(2, 2, 1, 'PURCHASE_RECEIVE', 300, '2026-01-09T09:05:00', 'PurchaseOrderDetail', 1, 4, 'Initial stock receive'),
(3, 3, 2, 'PURCHASE_RECEIVE', 400, '2026-01-13T10:00:00', 'PurchaseOrderDetail', 3, 4, 'Initial stock receive'),
(4, 4, 3, 'PURCHASE_RECEIVE', 150, '2026-01-13T10:05:00', 'PurchaseOrderDetail', 4, 4, 'Initial stock receive'),
(5, 5, 4, 'PURCHASE_RECEIVE', 120, '2026-01-18T11:00:00', 'PurchaseOrderDetail', 5, 4, 'Initial stock receive'),
(6, 6, 5, 'PURCHASE_RECEIVE', 80, '2026-02-05T10:00:00', 'PurchaseOrderDetail', 6, 4, 'Initial stock receive'),
(7, 7, 6, 'PURCHASE_RECEIVE', 200, '2026-02-14T11:00:00', 'PurchaseOrderDetail', 7, 4, 'Initial stock receive'),
(8, 8, 7, 'PURCHASE_RECEIVE', 300, '2026-01-09T09:10:00', 'PurchaseOrderDetail', 2, 4, 'Initial stock receive'),
(9, 9, 8, 'PURCHASE_RECEIVE', 250, '2026-02-11T14:00:00', 'PurchaseOrderDetail', 9, 4, 'Initial stock receive'),
(10, 10, 9, 'PURCHASE_RECEIVE', 300, '2026-02-14T11:05:00', 'PurchaseOrderDetail', 8, 4, 'Initial stock receive'),
(11, 11, 12, 'PURCHASE_RECEIVE', 120, '2026-02-11T14:05:00', 'PurchaseOrderDetail', 10, 4, 'Initial stock receive'),
(12, 1, 1, 'DEPARTMENT_ISSUE', 60, '2026-02-15T09:25:00', 'IssueRequest', 1, 3, 'Emergency issue'),
(13, 8, 7, 'DEPARTMENT_ISSUE', 40, '2026-02-15T09:26:00', 'IssueRequest', 1, 3, 'Emergency issue'),
(14, 5, 4, 'DEPARTMENT_ISSUE', 20, '2026-02-17T11:20:00', 'IssueRequest', 2, 3, 'ICU issue'),
(15, 10, 9, 'DEPARTMENT_ISSUE', 45, '2026-02-17T11:21:00', 'IssueRequest', 2, 3, 'ICU issue'),
(16, 3, 2, 'DEPARTMENT_ISSUE', 70, '2026-02-18T14:50:00', 'IssueRequest', 3, 3, 'Pediatric issue'),
(17, 1, 1, 'DEPARTMENT_ISSUE', 50, '2026-02-20T10:40:00', 'IssueRequest', 4, 3, 'Maternity issue'),
(18, 9, 8, 'DEPARTMENT_ISSUE', 60, '2026-02-21T13:15:00', 'IssueRequest', 5, 3, 'Laboratory issue'),
(19, 7, 6, 'DEPARTMENT_ISSUE', 55, '2026-02-25T09:05:00', 'IssueRequest', 6, 3, 'General ward issue'),
(20, 4, 3, 'DEPARTMENT_ISSUE', 65, '2026-03-03T12:45:00', 'IssueRequest', 7, 3, 'Emergency issue'),
(21, 11, 12, 'DEPARTMENT_ISSUE', 30, '2026-03-06T15:25:00', 'IssueRequest', 8, 3, 'Surgery issue'),
(22, 6, 5, 'DEPARTMENT_ISSUE', 25, '2026-03-08T10:15:00', 'IssueRequest', 9, 3, 'OPD issue'),
(23, 13, 11, 'PURCHASE_RECEIVE', 20, '2026-03-01T08:10:00', 'DirectReceive', 13, 4, 'Direct stock receive'),
(24, 13, 11, 'DEPARTMENT_ISSUE', 5, '2026-03-10T16:45:00', 'IssueRequest', 10, 3, 'Radiology issue'),
(25, 14, 3, 'PURCHASE_RECEIVE', 40, '2025-12-01T08:30:00', 'DirectReceive', 14, 4, 'Older batch receive'),
(26, 15, 13, 'PURCHASE_RECEIVE', 180, '2026-03-19T09:30:00', 'PurchaseOrderDetail', 16, 4, 'Initial stock receive'),
(27, 16, 14, 'PURCHASE_RECEIVE', 12, '2026-03-19T09:35:00', 'PurchaseOrderDetail', 17, 4, 'Initial stock receive'),
(28, 15, 13, 'DEPARTMENT_ISSUE', 30, '2026-03-20T09:30:00', 'IssueRequest', 11, 3, 'Emergency omeprazole issue'),
(29, 16, 14, 'DEPARTMENT_ISSUE', 2, '2026-03-21T14:20:00', 'IssueRequest', 12, 3, 'ICU pulse oximeter issue');
SET IDENTITY_INSERT dbo.StockTransaction OFF;
GO

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
    12,
    10,
    'PURCHASE_RECEIVE',
    8,
    '2026-03-01T08:00:00',
    'DirectReceive',
    12,
    4,
    'Direct stock receive for blood pressure monitors'
);
GO

INSERT INTO dbo.ReorderRule (ItemID, MinimumStockLevel, ReorderQuantity, SafetyStock, LeadTimeDays, Status) VALUES
(1, 120, 500, 60, 5, 'Active'),
(2, 100, 400, 50, 6, 'Active'),
(3, 60, 200, 30, 6, 'Active'),
(4, 40, 120, 20, 8, 'Active'),
(5, 35, 100, 15, 4, 'Active'),
(6, 80, 250, 40, 6, 'Active'),
(7, 100, 300, 50, 5, 'Active'),
(8, 70, 200, 30, 5, 'Active'),
(9, 90, 350, 45, 6, 'Active'),
(10, 5, 10, 2, 12, 'Active'),
(11, 10, 25, 5, 12, 'Active'),
(12, 50, 150, 25, 6, 'Active'),
(13, 160, 300, 40, 6, 'Active'),
(14, 12, 20, 4, 12, 'Active');
GO

INSERT INTO dbo.ExpiryAlert (BatchID, ItemID, AlertDate, ExpiryDate, AlertType, AlertStatus) VALUES
(4, 3, SYSDATETIME(), '2026-05-25', 'Critical', 'Open'),
(5, 4, SYSDATETIME(), '2026-05-20', 'Critical', 'Open'),
(14, 3, SYSDATETIME(), '2026-04-20', 'Expired', 'Open');
GO
