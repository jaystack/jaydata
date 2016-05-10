$(function () {

    module('Handlebars');

    function xtest() { };


    test('Handlebar render methods', 22, function () {

        $data.define("Todo", { Task: String });

        var result = $data("Todo").render({ Task: "HW" }, "<li>{{Task}}</li>");
        equal(result, "<li>HW</li>");

        var result = $data("Todo").render({ Task: "HW" });
        equal(result, "<div>HW</div>");

        stop(1);
        $data("Todo")
            .save({ Task: "hello" })
            .then(function() {
                $data("Todo")
                    .read(1)
                    .then(function (item) {
                        start(1);
                        var result = item.render("<li>{{Id}}</li>");
                        equal(result, "<li>1</li>");
                    });
            });

        var r4 = new Todo({ Task: "HW" }).render("<li>{{Task}}</li>");
        equal(r4, "<li>HW</li>");

        var r5 = new Todo({ Task: "HW" }).render('{ task: "{{Task}}" }');
        equal(r5, '{ task: "HW" }');

        var r6 = new Todo({ Task: "HW" }).render();
        equal(r6, "<div>HW</div>");

        var r7 = $data.render({ abc: "abc" }, "<li>{{abc}}</li>");
        equal(r7, "<li>abc</li>");


        var data = { items: [new Todo({ Task: "t1" }), new Todo({ Task: "t2" })] };
        var r9 = $data.render(data, "<ul>{{#each items}}{{{renderEntity 'Todo_Alternative'}}}{{/each}}</ul>");
        equal(r9, "<ul><div><b>t1</b></div><div><b>t2</b></div></ul>", "entity helper works");

        var todos = [new Todo({ Task: "t1" }), new Todo({ Task: "t2" })];
        var r10 = $data("Todo").renderItems(todos);
        equal(r10, "<div>t1</div><div>t2</div>");

        var todos = [new Todo({ Task: "t1" }), new Todo({ Task: "t2" })];
        var r11 = $data("Todo").renderItems(todos,'<span>{{Task}}</span>');
        equal(r11, "<span>t1</span><span>t2</span>");

        var todos = [new Todo({ Task: "t1" }), new Todo({ Task: "t2" })];
        var r11 = $data("Todo").renderItems(todos, '<span {{entityScope}}>{{Task}}</span>');
        equal(r11, "<span data-todo-undefined data-cache-client=0 data-cache-item=0>t1</span><span data-todo-undefined data-cache-client=1 data-cache-item=1>t2</span>");

        var r12 = $data("Todo").renderItems(todos, '<span {{entityScope}}>{{Task}}</span>');
        equal(r12, "<span data-todo-undefined data-cache-client=2 data-cache-item=0>t1</span><span data-todo-undefined data-cache-client=3 data-cache-item=1>t2</span>");

        $data.setCommandHandler({
            selectTodo: function (item) {
                start(1);
                ok(item, "item selected");
                equal(item.Id, 1, 'setCommandHandler');
            }
        }, document);
        stop(1);

        $data("Todo").read(1).then(function (item) {
            start(1);
            var r13 = item.render("<li><button {{entityCommand 'select'}}></button></li>");
            equal(r13, "<li><button data-command=select data-type=Todo data-id=1 data-cache-client=4 data-cache-item=2></button></li>", 'read(1)');
            var result = $('#output').append(r13);
            stop(0);
            result.find('button').trigger("click");
        });

        $data("Todo")
            .read(15)
            .then($data.renderTo("#todoList", '<a href="#" {{entityCommand "select"}}>{{Task}}</a>'));

        stop(1);
        $data("Todo").storeToken.factory().onReady(function (db) {
            console.dir(db);
            db.Items.filter("it.Task == 'hello'").take(1).renderItemsTo("#todoList2").then(function () {
                start(1);
                ok(true, "Queryable renderItemsTo");
                equal($('#todoList2').html(), '<div>hello</div>', 'storeToken renderItemsTo');
            });
        });

        stop(1);
        $data("Todo").storeToken.factory().onReady(function (db) {
            console.dir(db);
            db.Items
             .filter("it.Task == 'hello'")
             .take(1)
             .renderTo("#todoList2","TodoItems").then(function () {
                start(1);
                ok(true, "Queryable renderTo");
                equal($('#todoList2').html(), '<div>Total count:1</div><ul><div>hello</div></ul>', 'storeToken renderTo');
            });
        });

        var container = $("<div></div>");
        new Todo({ Task: "HW" }).renderTo(container, "<div>{{Task}}</div>");
        equal(container.html(), "<div>HW</div>");

        new Todo({ Task: "HW2" }).renderTo(container, "<div>{{Task}}</div>","replaceContent");
        equal(container.html(), "<div>HW2</div>");

        new Todo({ Task: "HW" }).renderTo(container, "<div>{{Task}}</div>", "append");
        equal(container.html(), "<div>HW2</div><div>HW</div>");

        /**************************/

        //var todos = [new Todo({ Task: "t1" }), new Todo({ Task: "t2" })];
        //var r10 = $data("Todo").renderItems(todos,'<li>{{Task}}</li>');
        //equal(r10, "<div><b>t1</b></div><div><b>t2</b></div>");
        //Handlebars.registerPartial("item", "<li>{{Task}}</li>");

        //var viewModel = { items: [new Todo({ Task: "Task1" }), new Todo({ Task: "Task2" })] };

        //var r7 = $data("Todo").render(viewModel, "<ul>{{#each items}}{{>item}}{{/each}}</ul>");
        //console.log(r7);


        //stop(1);
        //$data("Todo")
        //    .save({ Task: "aaaa" })
        //    .then(function (item) {

        //    });
        //    //.then(function () { console.dir(arguments); });

        //$data("Todo").render("xxx");
        //$data("Todo")
        //    .read(1)
        //    .then(Todo.renderTo("#todoList", "<li>{{Task}}</li>", "replaceContent"));


        //Todo.renderTo("#todoList", "<li>{{Task}}</li>", "replaceContent");


        //$data("Todo")
        //    .read(1)
        //    .then($data.renderTo("#todoList"));


        //$data("Todo")
        //    .read(1)
        //    .then(function(item) {
        //        item.renderTo("#todoList","<li>{{Task}}</li>");
        //    });

        //$data("Todo")
        //.readAll()
        //.then($data.renderTo("#todoList"));


        //$data("Todo")
        //    .readAll
        //    .then(function(items) {
        //        items.forEach(function(item) {
        //            item.renderTo("#todoList","<li>{{Task}}</li>");
        //        });
        //    });
        
        //$data("Todo")
        //    .readAll
        //    .then($data.template("<li>...</li>").renderTo("#todoList","renderMode"));

        //$data("Todo")
        //    .readAll
        //    .then($data.template("Todo","edit").renderTo("#todoList","renderMode"));        

        //$data.template("Todo","edit").renderTo("#todoList","renderMode")


        //new Todo({Task:"Asdasdasd"}).renderTo("asdasd");




        //$data("Todo")
        //    .readAll
        //    .then($data("Todo").renderTo("#todoList","renderMode"));        

        //$data("Todo")
        //    .readAll
        //    .then($data("Todo").template("edit").renderTo("#todoList","renderMode"));        


        //$data("Todo")
        //    .readAll
        //    .then($data.render())
        //    .then();


        ////$data("Todo").render == ;

        //$data("Todo").readAll().then(function (items) {
        //    $data("Todo").renderTo(items, {});
        //});

        //$data("Todo").readAll().then($data.renderTo("#todoList"));
        
        //        "<li>{{Task}}</li>".renderTo("#todoList")
                

        //$data("Todo").readAll().then(;);

        //$data("Todo").readAll().then(Todo.renderTo("#todoList"));

        //Todo.renderTo({ Task: "ASdasdasd" }, { "#newItemForm","newItemTemplate" })();



        //mydatabase
        //    .Todos
        //    .filter()
        //    .renderTo("#todoList").then();

        //mydatabase
        //    .Todos
        //    .filter()
        //    .renderTo("#todoList")
        //    .then(function (items /*, nodes*/) { } );
        
        //mydatabase
        //    .Categories
        //    .filter("it.Id == 12")
        //    .then($data.renderTo("#selectedCategory"))
        //    .then(function (item) {
        //        return mydatabase.Products.filter("xxxx").toArray();
        //    })
        //    .then($data.renderTo("#products"));

        //mydatabase
        //    .Todos
        //    .filter()
        //    .render()
        //    .then(function (html/*, nodes*/) { });



        //$data("Todo").filter().then(function () { });


        //$data("Todo").render({ Task: "Hello" }, "#todoList");

        
        
        //$data
        //  .define("Todo", { Task: String })
        //  .save({ Task: "New todo" })
        //  .then($data.templates.renderTo("#todoList"));

        //$data
        //  .define("Todo", { Task: String })
        //  .save({ Task: "New todo" })
        //  .then();
        //  //.then

        //$data
        //  .define("Todo", { Task: String })
        //  .save({ Task: "New todo" })
        //  .then($data.templates.renderTo("#todoList"));


        //$data("Todo")
        //    .readAll()
        //    .then($data.templates.renderTo("#x"));

        //$data("Todo")
        //    .filter("it.Completed == x", { x: true })
        //    .then($data.renderTo("#list"));

        //$data("Todo").filter("it.Completed == true").renderTo("#list")

        //$data("Todo")
        //    .read(12)
        //    .then($data.renderTo("#list"));


        //$data
        //  .define("Todo", { Task: String })
        //  .save({ Task: "New todo" })
        //  .then(Todo.renderTo("#todoList"));

        //$data
        //  .define("Todo", { Task: String })
        //  .save({ Task: "New todo" })
        //  .then(function (item) {
        //      return item.renderTo("#todoList");
        //  });

        //$data
        //  .define("Todo", { Task: String })
        //  .save({ Task: "New todo" })
        //  .then(function (item) {
        //      return item.renderTo("#todoList");
        //  });

        ////$data
        ////  .define("Todo", { Task: String })
        ////  .save({ Task: "New todo" })
        ////  .then(function (item) {
        ////  });



        //var Todo = $data.define("TodoByID", {
        //    Id: { type: 'string', key: true },
        //    Task: String
        //});

        //$data

        //function equalityCheck(value) {

        //    return function (inParam) {
        //        console.log(inParam);
        //        start(1);
        //        ok(inParam === value);
        //    }
        //}
        //stop(1);
        //$data("TodoByID")
        //    .save({ Id: 'A1', Task: "HW" })
        //    .then($data.render())
        //    .then($('#x').appendTo())

        //$data("Todo").render({Task:"Adasdad","<a>{{Task}}</a>"});

    });
});
