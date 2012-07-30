(function(global, $data, undefined) {

    $data.Entity.extend('Northwind.Category', {
        CategoryID: { key:true, type:'int', nullable:false, computed:true },
        CategoryName: { type:'string', nullable:false, required:true }
    });
  
    $data.Entity.extend('Northwind.Product', {
        ProductID: { key:true, type:'int', nullable:false, computed:true },
        CategoryID: { type:'int', nullable:true },
        ProductName: { type:'string', nullable:false, required:true }
    });
  
    $data.EntityContext.extend('Northwind.NorthwindContainer', {
        Categories: { type: $data.EntitySet, elementType: Northwind.Category },
        Products: { type: $data.EntitySet, elementType: Northwind.Product }
    });
  
    Northwind.context = new Northwind.NorthwindContainer( { name:'sqLite', databaseName: 'northwind.sqlite' });

})(window, $data);
