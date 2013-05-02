$data.Entity.extend('NorthwindModel.Category', {
    CategoryID: { key: true, type: 'id', nullable: false, computed: true },
    CategoryName: { type: 'string', nullable: false, required: true, maxLength: 15 },
    Description: { type: 'string', maxLength: Number.POSITIVE_INFINITY },
    Picture: { type: 'blob', maxLength: Number.POSITIVE_INFINITY },
    Products: { type: 'Array', elementType: 'NorthwindModel.Product', inverseProperty: 'Category' }
});

$data.Entity.extend('NorthwindModel.Customer', {
    CustomerID: { key: true, type: 'string', nullable: false, required: true, maxLength: 5 },
    CompanyName: { type: 'string', nullable: false, required: true, maxLength: 40 },
    ContactName: { type: 'string', maxLength: 30 },
    ContactTitle: { type: 'string', maxLength: 30 },
    Address: { type: 'string', maxLength: 60 },
    City: { type: 'string', maxLength: 15 },
    Region: { type: 'string', maxLength: 15 },
    PostalCode: { type: 'string', maxLength: 10 },
    Country: { type: 'string', maxLength: 15 },
    Phone: { type: 'string', maxLength: 24 },
    Fax: { type: 'string', maxLength: 24 },
    Orders: { type: 'Array', elementType: 'NorthwindModel.Order', inverseProperty: 'Customer' }
});

$data.Entity.extend('NorthwindModel.Employee', {
    EmployeeID: { key: true, type: 'id', nullable: false, computed: true },
    LastName: { type: 'string', nullable: false, required: true, maxLength: 20 },
    FirstName: { type: 'string', nullable: false, required: true, maxLength: 10 },
    Title: { type: 'string', maxLength: 30 },
    BirthDate: { type: 'datetime' },
    HireDate: { type: 'datetime' },
    Address: { type: 'string', maxLength: 60 },
    City: { type: 'string', maxLength: 15 },
    Region: { type: 'string', maxLength: 15 },
    PostalCode: { type: 'string', maxLength: 10 },
    Country: { type: 'string', maxLength: 15 },
    HomePhone: { type: 'string', maxLength: 24 },
    Extension: { type: 'string', maxLength: 4 },
    Photo: { type: 'blob', maxLength: Number.POSITIVE_INFINITY },
    Notes: { type: 'string', maxLength: Number.POSITIVE_INFINITY },
    ReportsTo: { type: 'int' },
    Orders: { type: 'Array', elementType: 'NorthwindModel.Order', inverseProperty: 'Employee' }
});

$data.Entity.extend('NorthwindModel.Order_Detail', {
    OrderID: { key: true, type: 'id', nullable: false, required: true },
    ProductID: { key: true, type: 'id', nullable: false, required: true },
    UnitPrice: { type: 'decimal', nullable: false, required: true },
    Quantity: { type: 'int', nullable: false, required: true },
    Discount: { type: 'number', nullable: false, required: true },
    Product: { type: 'NorthwindModel.Product', required: true, inverseProperty: 'Order_Details' },
    Order: { type: 'NorthwindModel.Order', required: true, inverseProperty: 'Order_Details' }
});

$data.Entity.extend('NorthwindModel.Order', {
    OrderID: { key: true, type: 'id', nullable: false, required: true },
    ShipName: { type: 'string', maxLength: 40 },
    ShipAddress: { type: 'string', maxLength: 60 },
    ShipCity: { type: 'string', maxLength: 15 },
    ShipRegion: { type: 'string', maxLength: 15 },
    ShipPostalCode: { type: 'string', maxLength: 10 },
    ShipCountry: { type: 'string', maxLength: 15 },
    OrderDate: { type: 'datetime' },
    RequiredDate: { type: 'datetime' },
    ShippedDate: { type: 'datetime' },
    Freight: { type: 'decimal' },
    Customer: { type: 'NorthwindModel.Customer', required: true, inverseProperty: 'Orders' },
    Employee: { type: 'NorthwindModel.Employee', inverseProperty: 'Orders' },
    Order_Details: { type: 'Array', elementType: 'NorthwindModel.Order_Detail', inverseProperty: 'Order' },
    Shipper: { type: 'NorthwindModel.Shipper', inverseProperty: 'Orders' }
});

$data.Entity.extend('NorthwindModel.Product', {
    ProductID: { key: true, type: 'id', nullable: false, computed: true },
    ProductName: { type: 'string', nullable: false, required: true, maxLength: 40 },
    EnglishName: { type: 'string', maxLength: 40 },
    QuantityPerUnit: { type: 'string', maxLength: 20 },
    UnitPrice: { type: 'decimal' },
    UnitsInStock: { type: 'int' },
    UnitsOnOrder: { type: 'int' },
    ReorderLevel: { type: 'int' },
    Discontinued: { type: 'bool', nullable: false, required: true },
    Category: { type: 'NorthwindModel.Category', inverseProperty: 'Products' },
    Order_Details: { type: 'Array', elementType: 'NorthwindModel.Order_Detail', inverseProperty: 'Product' },
    Supplier: { type: 'NorthwindModel.Supplier', inverseProperty: 'Products' }
});

$data.Entity.extend('NorthwindModel.Shipper', {
    ShipperID: { key: true, type: 'id', nullable: false, computed: true },
    CompanyName: { type: 'string', nullable: false, required: true, maxLength: 40 },
    Orders: { type: 'Array', elementType: 'NorthwindModel.Order', inverseProperty: 'Shipper' }
});

$data.Entity.extend('NorthwindModel.Supplier', {
    SupplierID: { key: true, type: 'id', nullable: false, computed: true },
    CompanyName: { type: 'string', nullable: false, required: true, maxLength: 40 },
    ContactName: { type: 'string', maxLength: 30 },
    ContactTitle: { type: 'string', maxLength: 30 },
    Address: { type: 'string', maxLength: 60 },
    City: { type: 'string', maxLength: 15 },
    Region: { type: 'string', maxLength: 15 },
    PostalCode: { type: 'string', maxLength: 10 },
    Country: { type: 'string', maxLength: 15 },
    Phone: { type: 'string', maxLength: 24 },
    Fax: { type: 'string', maxLength: 24 },
    Products: { type: 'Array', elementType: 'NorthwindModel.Product', inverseProperty: 'Supplier' }
});

$data.EntityContext.extend('NorthwindModel', {
    Categories: { type: $data.EntitySet, elementType: NorthwindModel.Category },
    Customers: { type: $data.EntitySet, elementType: NorthwindModel.Customer },
    Employees: { type: $data.EntitySet, elementType: NorthwindModel.Employee },
    Order_Details: { type: $data.EntitySet, elementType: NorthwindModel.Order_Detail },
    Orders: { type: $data.EntitySet, elementType: NorthwindModel.Order },
    Products: { type: $data.EntitySet, elementType: NorthwindModel.Product },
    Shippers: { type: $data.EntitySet, elementType: NorthwindModel.Shipper },
    Suppliers: { type: $data.EntitySet, elementType: NorthwindModel.Supplier }
});

module.exports = exports = NorthwindModel;
