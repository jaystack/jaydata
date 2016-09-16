[![JayData Logo](https://s3.amazonaws.com/jaydata-cdn/logo_jaydata_dark.png)](http://jaydata.org)

[![NPM](https://nodei.co/npm/jaydata.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jaydata/)

[![npm version](https://badge.fury.io/js/jaydata.svg)](https://badge.fury.io/js/jaydata)
[![Dependency Status](https://david-dm.org/jaystack/jaydata.svg)](https://david-dm.org/jaystack/jaydata)
[![Issue Stats](http://issuestats.com/github/jaystack/jaydata/badge/issue?style=flat)](http://issuestats.com/github/jaydata/jaydata)
[![Issue Stats](http://issuestats.com/github/jaystack/jaydata/badge/pr?style=flat)](http://issuestats.com/github/jaydata/jaydata)

[![license MIT](http://img.shields.io/badge/license-MIT-blue.svg)](license-MIT)
[![license GPL](http://img.shields.io/badge/license-GPL-blue.svg)](license-GPL)

JayData is a unified data access library for JavaScript to CRUD data from different sources like WebSQL/SQLite,
IndexedDB, MongoDb, OData, HTML5 localStorage.
The library can be integrated with React, Angular2, Durandal, KendoUI, Knockout.js, Handlebars.js or Sencha Touch 2 and can be used on
Node.js as well. Check out the latest [JayData examples](https://github.com/jaystack/odata-v4-client-examples) 

JayData not only provides JavaScript Language Query (JSLQ) syntax to access local (in-browser and mobile)
and remote databases, but builds the queries and executes/processes the requests of the essential data
sources and data services to make developers able to concentrate only on the business logic.

Microsoft .NET developers can utilize Entity Framework and LINQ on server-side to perform operations on
data from different databases. The aim of JayData library is to give a similar tool to JavaScript developers.

JayData is cross-platform (runs on HTML5 desktop and mobile browsers, can be hosted in Cordova/PhoneGap environment
on iPhone, iPad, Android or Windows Phone 8+) and cross-layer as it works on client-side and server-side (Node.JS).

Please read the release notes for current status of the providers.

Visit http://jaydata.org for detailed information and documentation.

Official builds are released on CodePlex (http://jaydata.codeplex.com) can be used to develop applications, to get
the structured sourcecode to develop JayData itself, visit http://github.com/jaystack/jaydata

Feed of Latest releases, tutorials: https://twitter.com/jaydataorg
Feed of commits in development branch: https://twitter.com/jaydatadev

JayData comes with multiple licensing: you can use it under MIT license if ship software software under MIT,
but it should be used under GPL if you distribute your software under GPLv2. JayData Pro is a closed-source
commercial product recommended for enterprise projects and commercial development efforts.
http://jaystack.com/licensing

## Installation

```bash
$ npm install jaydata
```

## How to build

```bash
$ git clone https://github.com/jaystack/jaydata.git
$ cd jaydata
$ npm install
$ gulp
```

## Use JayData as a standalone global library

```html
<script  type="text/javascript" src="jaydata.min.js"></script>
```

Providers are lazy loaded from the same location as the core JayData script under the ```jaydataproviders``` folder.
If you want to use a JayData module, include it manually in a ```<script>``` tag.

## Use Jaydata with System.js

Using JayData with System.js needs a little bit of a setup and you have to map all providers you want to use in your application.

```javascript
var map = {
    'jaydata/core': 'lib/jaydata/jaydata.min',
    'jaydata/odata': 'lib/jaydata/jaydataproviders/oDataProvider.min'
};

var meta = {
    'jaydata/odata': {
        format: 'cjs',
        deps: ['jaydata/core']
    }
};

var config = {
    map: map,
    meta: meta
};

System.config(config);
```

With this setup you can now import the ```jaydata/odata``` module in your application code. See a full example in Angular2 [here](https://github.com/jaystack/odata-v4-client-examples/tree/master/angular2-product-editor).

## Use JayData with Require.js

If you want to use Require.js to import JayData into your application, you need to set the path configuration correctly:

```javascript
requirejs.config({
    paths: {
        'jaydata/core': '../lib/jaydata/jaydata.min',
        'jaydata/odata': '../lib/jaydata/jaydataproviders/oDataProvider.min',
    }
});
```

See a working example using Require.js and Durandal [here](https://github.com/jaystack/odata-v4-client-examples/tree/master/durandal-product-editor).

## JayData basics in 7 simple steps

In most scenarios, the 7 simple steps of JayData basics are enough to handle data of your application. For more details, visit [http://jaydata.org](http://jaydata.org).

### Step 1 - Define your data model

Simple model that works online and offline as well. Define your data model:

```javascript
var Todo = $data.Entity.extend("Todo", {
    Id: { type: "int", key: true, computed: true },
    Task: { type: String, required: true, maxLength: 200 },
    DueDate: { type: Date },
    Completed: { type: Boolean }
});

var TodoDatabase = $data.EntityContext.extend("TodoDatabase", {
    Todos: { type: $data.EntitySet, elementType: "Todo" }
});
```

### Step 2 - Initialize the data storage

#### OData

You can Initialize your context to handle an OData endpoint just by passing the OData service URL as a single string parameter.

```javascript
var todoDB = new TodoDatabase("http://mysite.com/my.svc");
```

#### Local database

If you want to use a local database, pass the name of your database as a string.
JayData automatically detects what type of local database solution is available on the client and creates a context to an IndexedDB, WebSQL, LocalStorage or InMemory database.

```javascript
var todoDB = new TodoDatabase("MyTodoDatase");
```

#### WebSQL

You can even specify, what type of database you want to use by providing a storage provider configuration object.

```javascript
var todoDB = new TodoDatabase({ 
    provider: 'webSql', databaseName: 'MyTodoDatabase' 
});
```

### Step 3 - Create data

You can create new data by adding new entities to an entity set.

#### Simple

You can add a single entity to an entity set...

```javascript
todoDB.onReady(function(){
    var task = todoDB.Todos.add({ Task: 'Step0: Get this list', Completed: true });
    todoDB.saveChanges(function(){
        alert(task.Id);
    });
});
```

#### Batch

...or you can create multiple new entities by using the ```addMany``` function. In the handler of the ```saveChanges``` function you will get how many entities were saved.

```javascript
todoDB.onReady(function(){
    var tasks = todoDB.Todos.addMany([
        { Task: 'Step1: Define your data model'},
        { Task: 'Step2: Initialize the data storage'},
        { Task: 'Step3: Create data' }
    ]);
    todoDB.saveChanges(function(count){
        alert("Created " + count + " new task");
        tasks.forEach(function(todo){ alert(todo.Id); });
    });
});
```

### Step 4 - Read data

#### All items

To retrieve all database items as an array, use the ```toArray``` function.

```javascript
todoDB.onReady(function(){
    todoDB.Todos.toArray(function(todos){
        yourTemplate.render(todos);
    });
});
```

#### Filter #1

You can filter your data just like the native ```filter``` function of JavaScript. If you want to handle your result in a loop use the ```forEach``` function. 

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .filter(function(todo){
            return todo.Completed == true || todo.Task.startsWith("Step2");
        })
        .forEach(function(todo){
            yourTemplate.render(todo);
        });
});
```

Using ```forEach``` is equivalent to this:

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .filter(function(todo){
            return todo.Completed == true || todo.Task.startsWith("Step2");
        })
        .toArray(function(todos){
            todos.forEach(function(todo){
                yourTemplate.render(todo);
            });
        });
});
```

#### Filter #2

You can pass a query parameters object as the second argument of the ```filter``` function and access these query parameters on ```this``` in the query function. 

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .filter(function(todo){
            return todo.Completed == true || todo.Task.startsWith(this.stepName);
        }, {
            stepName: 'Step2'
        })
        .forEach(function(todo){
            yourTemplate.render(todo); 
        });
});
```

#### Filter #3

Instead of a JavaScript function you can use a query string in the ```filter``` function. This is specially useful, when you want to create your query dynamically.

```javascript
todoDB.onReady(function(){
    var stepName = 'Step2';
    todoDB.Todos
        .filter("it.Completed || it.task.startsWith('" + stepName + "')")
        .forEach(function(todo){
            yourTemplate.render(todo); 
        });
});
```

#### Mapping

In some scenarios you want to just retrieve some fields of your entity and map these fields as different names.

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .map(function(todo){
            return {
                _task: todo.Task,
                _completed: todo.Completed
            }
        })
        .toArray(function(todos){
            yourTemplate.render(todos);
        });
});
```

#### Paging

As you store more and more entities in your database, it's practical to retrieve only a subset of your data by using paging functions. 

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .skip(2)
        .take(3)
        .toArray(function(todo){
            yourTemplate.render(todo);
        });
});
```

#### Ordering

If you want to sort your result by a selected field, use ```orderBy``` or ```orderByDescending```. As you can still use a string instead of a function in the query function, you can dynamically construct your ordering query.

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .orderBy("it.Task")
        .toArray(function(todo){
            yourTemplate.render(todo);
        });
});
```

If you want more dynamic control over order direction, use the ```order``` function. If you need descending ordering on the field, use the ```-``` sign before the field name.

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .order("-it.Task")
        .toArray(function(todo){
            yourTemplate.render(todo);
        });
});
```

### Step 5 - Update data

To update an entity, attach it to the context and JayData will track the changes on the entity. On calling the ```saveChanges``` function, your attached and updated entities will be saved.

```javascript
todoDB.onReady(function(){
    todoDB.Todos.single("it.Id == 1", function(todo){
        todoDB.attach(todo);
        todo.Completed = true;
        todoDB.saveChanges(function(count){
            alert("Updated " + count + " task");
        });
    });
});
```

### Step 6 - Delete data

#### Simple

Just like updating data, but instead of ```attach``` you will use ```remove```.

```javascript
todoDB.onReady(function(){
    todoDB.Todos.single("it.Id == 3", function(todo){
        todoDB.Todos.remove(todo);
        todoDB.saveChanges(function(count){
            alert("Removed " + count + " task");
        });
    });
});
```

#### Batch

Use the ```removeAll``` function if you want to truncate all data in a single entity set.

```javascript
todoDB.onReady(function(){
    todoDB.Todos.removeAll(function(){
        alert("Removed all tasks");
    });
});
```

### Step 7 - Generate some UI with jQuery

```javascript
todoDB.onReady(function(){
    todoDB.Todos
        .forEach(function(todo) {
            $('#todos')
                .append('<li><b>' + todo.Task + '</b>' + (todo.Completed ? ' - completed' : '') + '</li>');
        });
});
```

## Related projects

[JaySvcUtil](https://github.com/jaystack/jaysvcutil) - Code generator tool that builds JayData data model classes from $metadata service of OData endpoints. 
