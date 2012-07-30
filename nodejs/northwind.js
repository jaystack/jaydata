var $data = require('jaydata');
var express = require('express');
require('./context.js');

var app = express.createServer();

app.use(express.bodyParser());
app.set('view engine', 'html');
app.register('.html', require('jqtpl').express);

app.get('/categories', function(req, res){
    Northwind.context.Categories.toArray(function(result){
        res.render('categories', { result: result });
    });
});

app.get('/categories/:id/products/add', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        res.render('product_add', { category: category });
    });
});

app.post('/categories/:id/products/add', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.Products.add(new Northwind.Product({ ProductName: req.body.name, CategoryID: req.params.id }));
        Northwind.context.saveChanges(function(count){
            res.redirect('/categories/' + req.params.id + '/products');
        });
    });
});

app.get('/categories/:id/products/edit/:pid', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.Products
        .single(function(product){ return product.ProductID == this.ProductID }, { ProductID: req.params.pid }, function(product){
            res.render('product_edit', { product: product, category: category });
        });
    });
});

app.post('/categories/:id/products/update/:pid', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.Products
        .single(function(product){ return product.ProductID == this.ProductID }, { ProductID: req.params.pid }, function(product){
            Northwind.context.attach(product);
            product.ProductName = req.body.name;
            Northwind.context.saveChanges(function(count){
                res.redirect('/categories/' + req.params.id + '/products');
            });
        });
    });
});

app.get('/categories/:id/products/delete/:pid', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.Products
        .single(function(product){ return product.ProductID == this.ProductID }, { ProductID: req.params.pid }, function(product){
            Northwind.context.Products.remove(product);
            Northwind.context.saveChanges(function(count){
                res.redirect('/categories/' + req.params.id + '/products');
            });
        });
    });
});

app.get('/categories/:id/products', function(req, res){
    Northwind.context.Categories
    .single(function(category){ return category.CategoryID == this.CategoryID; }, { CategoryID: req.params.id }, function(category){
        Northwind.context.Products
        .filter(function(product){ return product.CategoryID == this.CategoryID; }, { CategoryID: req.params.id })
        .toArray(function(result){
            res.render('products', { result: result, category: category });
        });
    });
});

app.get('/products/length', function(req, res){
    Northwind.context.Products.count(function(cnt){
        res.send('cnt:' + cnt);
    });
});

app.listen(80);
