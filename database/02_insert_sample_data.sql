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
(1, 1, 4, DATEADD(day, -150, GETDATE()), CAST(DATEADD(day, -145, GETDATE()) AS DATE), CAST(DATEADD(day, -146, GETDATE()) AS DATE), 'Completed'),
(2, 3, 4, DATEADD(day, -140, GETDATE()), CAST(DATEADD(day, -133, GETDATE()) AS DATE), CAST(DATEADD(day, -134, GETDATE()) AS DATE), 'Completed'),
(3, 5, 4, DATEADD(day, -130, GETDATE()), CAST(DATEADD(day, -122, GETDATE()) AS DATE), CAST(DATEADD(day, -122, GETDATE()) AS DATE), 'Completed'),
(4, 4, 4, DATEADD(day, -110, GETDATE()), CAST(DATEADD(day, -105, GETDATE()) AS DATE), CAST(DATEADD(day, -106, GETDATE()) AS DATE), 'Completed'),
(5, 7, 4, DATEADD(day, -100, GETDATE()), CAST(DATEADD(day, -93, GETDATE()) AS DATE), CAST(DATEADD(day, -92, GETDATE()) AS DATE), 'Completed'),
(6, 10, 4, DATEADD(day, -90, GETDATE()), CAST(DATEADD(day, -85, GETDATE()) AS DATE), CAST(DATEADD(day, -86, GETDATE()) AS DATE), 'Completed'),
(7, 9, 4, DATEADD(day, -70, GETDATE()), CAST(DATEADD(day, -58, GETDATE()) AS DATE), CAST(DATEADD(day, -59, GETDATE()) AS DATE), 'Completed'),
(8, 2, 4, DATEADD(day, -60, GETDATE()), CAST(DATEADD(day, -53, GETDATE()) AS DATE), CAST(DATEADD(day, -53, GETDATE()) AS DATE), 'Completed'),
(9, 6, 4, DATEADD(day, -45, GETDATE()), CAST(DATEADD(day, -35, GETDATE()) AS DATE), CAST(DATEADD(day, -36, GETDATE()) AS DATE), 'Completed'),
(10, 8, 4, DATEADD(day, -30, GETDATE()), CAST(DATEADD(day, -20, GETDATE()) AS DATE), NULL, 'Ordered'),
(11, 3, 4, DATEADD(day, -15, GETDATE()), CAST(DATEADD(day, -9, GETDATE()) AS DATE), CAST(DATEADD(day, -10, GETDATE()) AS DATE), 'Completed'),
(12, 1, 4, DATEADD(day, -5, GETDATE()), CAST(DATEADD(day, 0, GETDATE()) AS DATE), NULL, 'Approved');
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
(11, 7, 10, 10, 10, 18500.00),
(12, 7, 11, 30, 30, 1450.00),
(13, 8, 1, 600, 600, 3.65),
(14, 9, 2, 500, 500, 8.40),
(15, 10, 4, 50, 0, 975.00),
(16, 11, 13, 180, 180, 12.50),
(17, 11, 14, 12, 12, 6500.00),
(18, 12, 1, 200, 0, 3.50);
SET IDENTITY_INSERT dbo.PurchaseOrderDetail OFF;
GO

SET IDENTITY_INSERT dbo.StockBatch ON;
INSERT INTO dbo.StockBatch (BatchID, ItemID, SupplierID, PurchaseOrderDetailID, BatchNumber, ReceivedDate, ManufactureDate, ExpiryDate, QuantityReceived, QuantityAvailable, UnitCost) VALUES
(1, 1, 1, 1, 'PARA-B001', CAST(DATEADD(day, -146, GETDATE()) AS DATE), CAST(DATEADD(day, -180, GETDATE()) AS DATE), CAST(DATEADD(day, -10, GETDATE()) AS DATE), 200, 90, 3.50),
(2, 1, 1, 1, 'PARA-B002', CAST(DATEADD(day, -146, GETDATE()) AS DATE), CAST(DATEADD(day, -170, GETDATE()) AS DATE), CAST(DATEADD(day, 60, GETDATE()) AS DATE), 300, 300, 3.50),
(3, 2, 3, 3, 'AMOX-A101', CAST(DATEADD(day, -134, GETDATE()) AS DATE), CAST(DATEADD(day, -190, GETDATE()) AS DATE), CAST(DATEADD(day, 45, GETDATE()) AS DATE), 400, 330, 8.25),
(4, 3, 3, 4, 'CEF-C201', CAST(DATEADD(day, -134, GETDATE()) AS DATE), CAST(DATEADD(day, -170, GETDATE()) AS DATE), CAST(DATEADD(day, 2, GETDATE()) AS DATE), 150, 85, 125.00),
(5, 4, 5, 5, 'INS-I301', CAST(DATEADD(day, -122, GETDATE()) AS DATE), CAST(DATEADD(day, -150, GETDATE()) AS DATE), CAST(DATEADD(day, 5, GETDATE()) AS DATE), 120, 100, 950.00),
(6, 5, 4, 6, 'SAL-S401', CAST(DATEADD(day, -106, GETDATE()) AS DATE), CAST(DATEADD(day, -140, GETDATE()) AS DATE), CAST(DATEADD(day, 200, GETDATE()) AS DATE), 80, 55, 620.00),
(7, 6, 7, 7, 'GLO-G501', CAST(DATEADD(day, -92, GETDATE()) AS DATE), NULL, NULL, 200, 145, 1400.00),
(8, 7, 10, 2, 'MASK-M601', CAST(DATEADD(day, -146, GETDATE()) AS DATE), NULL, NULL, 300, 260, 850.00),
(9, 8, 10, 9, 'SYR-S701', CAST(DATEADD(day, -86, GETDATE()) AS DATE), NULL, NULL, 250, 190, 425.00),
(10, 9, 7, 8, 'CAN-C801', CAST(DATEADD(day, -92, GETDATE()) AS DATE), NULL, CAST(DATEADD(day, 600, GETDATE()) AS DATE), 300, 255, 55.00),
(11, 12, 7, 10, 'ECG-E901', CAST(DATEADD(day, -86, GETDATE()) AS DATE), NULL, CAST(DATEADD(day, 300, GETDATE()) AS DATE), 120, 90, 900.00),
(12, 10, 9, 11, 'BPM-X001', CAST(DATEADD(day, -59, GETDATE()) AS DATE), NULL, NULL, 8, 8, 18500.00),
(13, 11, 9, 12, 'THER-T101', CAST(DATEADD(day, -59, GETDATE()) AS DATE), NULL, NULL, 20, 15, 1450.00),
(14, 3, 3, NULL, 'CEF-OLD01', CAST(DATEADD(day, -200, GETDATE()) AS DATE), CAST(DATEADD(day, -500, GETDATE()) AS DATE), CAST(DATEADD(day, -20, GETDATE()) AS DATE), 40, 40, 118.00),
(15, 13, 3, 16, 'OME-O101', CAST(DATEADD(day, -10, GETDATE()) AS DATE), CAST(DATEADD(day, -60, GETDATE()) AS DATE), CAST(DATEADD(day, 300, GETDATE()) AS DATE), 180, 150, 12.50),
(16, 14, 9, 17, 'OXI-P101', CAST(DATEADD(day, -10, GETDATE()) AS DATE), NULL, NULL, 12, 10, 6500.00),
(17, 1, 2, 13, 'PARA-B003', CAST(DATEADD(day, -53, GETDATE()) AS DATE), CAST(DATEADD(day, -90, GETDATE()) AS DATE), CAST(DATEADD(day, 120, GETDATE()) AS DATE), 600, 600, 3.65),
(18, 2, 6, 14, 'AMOX-A102', CAST(DATEADD(day, -36, GETDATE()) AS DATE), CAST(DATEADD(day, -80, GETDATE()) AS DATE), CAST(DATEADD(day, 150, GETDATE()) AS DATE), 500, 500, 8.40);
SET IDENTITY_INSERT dbo.StockBatch OFF;
GO

SET IDENTITY_INSERT dbo.IssueRequest ON;
INSERT INTO dbo.IssueRequest (IssueRequestID, DepartmentID, RequestedByStaffID, RequestDate, RequestStatus, ApprovedByStaffID, ApprovedDate) VALUES
(1, 2, 5, DATEADD(day, -120, GETDATE()), 'Issued', 2, DATEADD(day, -120, GETDATE())),
(2, 3, 6, DATEADD(day, -110, GETDATE()), 'Issued', 2, DATEADD(day, -110, GETDATE())),
(3, 7, 9, DATEADD(day, -100, GETDATE()), 'Issued', 3, DATEADD(day, -100, GETDATE())),
(4, 8, 10, DATEADD(day, -90, GETDATE()), 'Issued', 3, DATEADD(day, -90, GETDATE())),
(5, 5, 7, DATEADD(day, -80, GETDATE()), 'Issued', 2, DATEADD(day, -80, GETDATE())),
(6, 10, 8, DATEADD(day, -70, GETDATE()), 'Issued', 2, DATEADD(day, -70, GETDATE())),
(7, 2, 5, DATEADD(day, -60, GETDATE()), 'Issued', 2, DATEADD(day, -60, GETDATE())),
(8, 4, 4, DATEADD(day, -50, GETDATE()), 'Issued', 2, DATEADD(day, -50, GETDATE())),
(9, 6, 5, DATEADD(day, -40, GETDATE()), 'Issued', 3, DATEADD(day, -40, GETDATE())),
(10, 9, 8, DATEADD(day, -30, GETDATE()), 'Issued', 2, DATEADD(day, -30, GETDATE())),
(11, 2, 5, DATEADD(day, -15, GETDATE()), 'Issued', 3, DATEADD(day, -15, GETDATE())),
(12, 3, 6, DATEADD(day, -5, GETDATE()), 'Issued', 2, DATEADD(day, -5, GETDATE())),
(13, 1, 3, DATEADD(day, -2, GETDATE()), 'Issued', 2, DATEADD(day, -2, GETDATE())),
(14, 2, 5, DATEADD(day, -1, GETDATE()), 'Pending', NULL, NULL);
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
(14, 12, 14, 2, 2, 2),
(15, 13, 1, 100, 100, 100),
(16, 14, 2, 40, 0, 0);
SET IDENTITY_INSERT dbo.IssueRequestDetail OFF;
GO

SET IDENTITY_INSERT dbo.StockTransaction ON;
INSERT INTO dbo.StockTransaction (TransactionID, BatchID, ItemID, TransactionType, Quantity, TransactionDate, ReferenceType, ReferenceID, StaffID, Notes) VALUES
(1, 1, 1, 'PURCHASE_RECEIVE', 200, DATEADD(day, -146, GETDATE()), 'PurchaseOrderDetail', 1, 4, 'Initial stock receive'),
(2, 2, 1, 'PURCHASE_RECEIVE', 300, DATEADD(day, -146, GETDATE()), 'PurchaseOrderDetail', 1, 4, 'Initial stock receive'),
(3, 3, 2, 'PURCHASE_RECEIVE', 400, DATEADD(day, -134, GETDATE()), 'PurchaseOrderDetail', 3, 4, 'Initial stock receive'),
(4, 4, 3, 'PURCHASE_RECEIVE', 150, DATEADD(day, -134, GETDATE()), 'PurchaseOrderDetail', 4, 4, 'Initial stock receive'),
(5, 5, 4, 'PURCHASE_RECEIVE', 120, DATEADD(day, -122, GETDATE()), 'PurchaseOrderDetail', 5, 4, 'Initial stock receive'),
(6, 6, 5, 'PURCHASE_RECEIVE', 80, DATEADD(day, -106, GETDATE()), 'PurchaseOrderDetail', 6, 4, 'Initial stock receive'),
(7, 7, 6, 'PURCHASE_RECEIVE', 200, DATEADD(day, -92, GETDATE()), 'PurchaseOrderDetail', 7, 4, 'Initial stock receive'),
(8, 8, 7, 'PURCHASE_RECEIVE', 300, DATEADD(day, -146, GETDATE()), 'PurchaseOrderDetail', 2, 4, 'Initial stock receive'),
(9, 9, 8, 'PURCHASE_RECEIVE', 250, DATEADD(day, -86, GETDATE()), 'PurchaseOrderDetail', 9, 4, 'Initial stock receive'),
(10, 10, 9, 'PURCHASE_RECEIVE', 300, DATEADD(day, -92, GETDATE()), 'PurchaseOrderDetail', 8, 4, 'Initial stock receive'),
(11, 11, 12, 'PURCHASE_RECEIVE', 120, DATEADD(day, -86, GETDATE()), 'PurchaseOrderDetail', 10, 4, 'Initial stock receive'),
(12, 1, 1, 'DEPARTMENT_ISSUE', 60, DATEADD(day, -120, GETDATE()), 'IssueRequest', 1, 3, 'Emergency issue'),
(13, 8, 7, 'DEPARTMENT_ISSUE', 40, DATEADD(day, -120, GETDATE()), 'IssueRequest', 1, 3, 'Emergency issue'),
(14, 5, 4, 'DEPARTMENT_ISSUE', 20, DATEADD(day, -110, GETDATE()), 'IssueRequest', 2, 3, 'ICU issue'),
(15, 10, 9, 'DEPARTMENT_ISSUE', 45, DATEADD(day, -110, GETDATE()), 'IssueRequest', 2, 3, 'ICU issue'),
(16, 3, 2, 'DEPARTMENT_ISSUE', 70, DATEADD(day, -100, GETDATE()), 'IssueRequest', 3, 3, 'Pediatric issue'),
(17, 1, 1, 'DEPARTMENT_ISSUE', 50, DATEADD(day, -90, GETDATE()), 'IssueRequest', 4, 3, 'Maternity issue'),
(18, 9, 8, 'DEPARTMENT_ISSUE', 60, DATEADD(day, -80, GETDATE()), 'IssueRequest', 5, 3, 'Laboratory issue'),
(19, 7, 6, 'DEPARTMENT_ISSUE', 55, DATEADD(day, -70, GETDATE()), 'IssueRequest', 6, 3, 'General ward issue'),
(20, 4, 3, 'DEPARTMENT_ISSUE', 65, DATEADD(day, -60, GETDATE()), 'IssueRequest', 7, 3, 'Emergency issue'),
(21, 11, 12, 'DEPARTMENT_ISSUE', 30, DATEADD(day, -50, GETDATE()), 'IssueRequest', 8, 3, 'Surgery issue'),
(22, 6, 5, 'DEPARTMENT_ISSUE', 25, DATEADD(day, -40, GETDATE()), 'IssueRequest', 9, 3, 'OPD issue'),
(23, 13, 11, 'PURCHASE_RECEIVE', 20, DATEADD(day, -59, GETDATE()), 'DirectReceive', 13, 4, 'Direct stock receive'),
(24, 13, 11, 'DEPARTMENT_ISSUE', 5, DATEADD(day, -30, GETDATE()), 'IssueRequest', 10, 3, 'Radiology issue'),
(25, 14, 3, 'PURCHASE_RECEIVE', 40, DATEADD(day, -200, GETDATE()), 'DirectReceive', 14, 4, 'Older batch receive'),
(26, 15, 13, 'PURCHASE_RECEIVE', 180, DATEADD(day, -10, GETDATE()), 'PurchaseOrderDetail', 16, 4, 'Initial stock receive'),
(27, 16, 14, 'PURCHASE_RECEIVE', 12, DATEADD(day, -10, GETDATE()), 'PurchaseOrderDetail', 17, 4, 'Initial stock receive'),
(28, 15, 13, 'DEPARTMENT_ISSUE', 30, DATEADD(day, -8, GETDATE()), 'IssueRequest', 11, 3, 'Emergency omeprazole issue'),
(29, 16, 14, 'DEPARTMENT_ISSUE', 2, DATEADD(day, -4, GETDATE()), 'IssueRequest', 12, 3, 'ICU pulse oximeter issue'),
(30, 2, 1, 'DEPARTMENT_ISSUE', 100, DATEADD(day, -2, GETDATE()), 'IssueRequest', 13, 3, 'General ward paracetamol issue'),
(31, 12, 10, 'PURCHASE_RECEIVE', 8, DATEADD(day, -59, GETDATE()), 'DirectReceive', 12, 4, 'Direct stock receive for blood pressure monitors'),
(32, 17, 1, 'PURCHASE_RECEIVE', 600, DATEADD(day, -53, GETDATE()), 'PurchaseOrderDetail', 13, 4, 'Large paracetamol batch receive'),
(33, 18, 2, 'PURCHASE_RECEIVE', 500, DATEADD(day, -36, GETDATE()), 'PurchaseOrderDetail', 14, 4, 'Amoxicillin batch receive');
SET IDENTITY_INSERT dbo.StockTransaction OFF;
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
(4, 3, SYSDATETIME(), CAST(DATEADD(day, 2, GETDATE()) AS DATE), 'Critical', 'Open'),
(5, 4, SYSDATETIME(), CAST(DATEADD(day, 5, GETDATE()) AS DATE), 'Critical', 'Open'),
(14, 3, SYSDATETIME(), CAST(DATEADD(day, -20, GETDATE()) AS DATE), 'Expired', 'Open');
GO

