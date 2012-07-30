app.get('/categories/add', function(req, res){
    res.render('category_add');
});

app.get('/categories/add/:name', function(req, res){
    Northwind.context.Categories.add(new Northwind.Category({ CategoryName: req.params.name }));
    Northwind.context.saveChanges(function(){
        res.redirect('/categories');
    });
});

app.get('/categories/edit/:id/:name', function(req, res){
    res.render('category_edit', { params: req.params });
});

app.get('/categories/update/:id/:name', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.attach(category);
        category.CategoryName = req.params.name;
        Northwind.context.saveChanges(function(){
            res.redirect('/categories');
        });
    });
});

app.get('/categories/delete/:id', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.remove(category);
        Northwind.context.saveChanges(function(){
            res.redirect('/categories');
        });
    });
});
