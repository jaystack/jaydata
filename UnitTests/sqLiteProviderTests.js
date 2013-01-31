$(document).ready(function () {
    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;

    module("sqLiteProviderTest");
    test("memberDefinition converter", function(){
        $data.EntityContext.extend('$conv.ConverterTest', {
            Items: { type: $data.EntitySet, elementType: $data.Entity.extend('$conv.Item', {
                    Id: { type: 'int', key: true, computed: true },
                    Value: { type: 'string', converter: {
                            sqLite: {
                                fromDb: function(value){
                                    return 'Value #' + value;
                                },
                                toDb: function(value){
                                    return value.replace('Value #', '');
                                }
                            }
                        }
                    }
                })
            }
        });
        stop();
        var c = new $conv.ConverterTest({ name: 'sqLite', databaseName: 'conv', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
        c.onReady(function(db){
            db.Items.add({ Value: 'Value #3' });
            db.saveChanges(function(cnt){
                equal(cnt, 1, 'not 1 item saved');
                db.Items.toArray(function(r){
                    equal(r.length, 1, 'not 1 item in table');
                    r = r[0];
                    ok(r instanceof $conv.Item, 'not $conv.Item');
                    equal(r.Value, 'Value #3', 'bad value');
                    start();
                })
            });
        });
    });
    test("simpleFieldDataTypeTest", function () {
        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            SimpleDataTypes: {
                dataType: $data.EntitySet, elementType: $data.Class.define("SimpleDataType", $data.Entity, null, {
                    i0: { dataType: 'integer' },
                    i1: { dataType: 'int' },
                    b0: { dataType: 'bool' },
                    b1: { dataType: 'boolean' },
                    t0: { dataType: 'text' },
                    t1: { dataType: 'string' },
                    bl: { dataType: 'blob' },
                    n0: { dataType: 'number' },
                    d1: { dataType: 'datetime' },
                    d2: { dataType: 'date' }
                }, null)
            }
        }, null);

        var c = new context({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })
        var provType = $data.storageProviders.sqLite.SqLiteStorageProvider;
        var prov = new provType({ databaseName: "ProviderTestDb", name: "sqLite" });
        var sql = prov.createSqlFromStorageModel(c._storageModel[0]);

        equal(sql, 'CREATE TABLE IF NOT EXISTS [SimpleDataTypes] ([i0] INTEGER, [i1] INTEGER, [b0] INTEGER, [b1] INTEGER, [t0] TEXT, [t1] TEXT, [bl] BLOB, [n0] REAL, [d1] REAL, [d2] REAL);', 'create table function faild');
    });
    test("requiredFieldTest", function () {
        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            SimpleDataTypes: {
                dataType: $data.EntitySet, elementType: $data.Class.define("SimpleDataType", $data.Entity, null, {
                    i0: { dataType: 'integer', required: true },
                    i1: { dataType: 'int', required: false },
                    b0: { dataType: 'bool', required: true },
                    b1: { dataType: 'boolean', required: false },
                    t0: { dataType: 'text', required: true },
                    t1: { dataType: 'string', required: false },
                    bl0: { dataType: 'blob', required: true },
                    bl1: { dataType: 'blob', required: false },
                    n0: { dataType: 'number', required: true },
                    n1: { dataType: 'number', required: false },
                    d1: { dataType: 'datetime', required: true },
                    d2: { dataType: 'date', required: false }
                }, null)
            },
            RequireWithKeys: {
                dataType: $data.EntitySet, elementType: $data.Class.define("RequireWithKey", $data.Entity, null, {
                    i0: { dataType: 'integer', required: true, key: true },
                    i1: { dataType: 'int', required: true }
                }, null)
            },
            RequireWithMultipleKeys: {
                dataType: $data.EntitySet, elementType: $data.Class.define("RequireWithMultipleKey", $data.Entity, null, {
                    i0: { dataType: 'integer', required: true, key: true },
                    i1: { dataType: 'int', required: true, key: true }
                }, null)
            },
            RequireWithComputeds: {
                dataType: $data.EntitySet, elementType: $data.Class.define("RequireWithComputed", $data.Entity, null, {
                    i0: { dataType: 'integer', required: true, key: true, computed: true },
                    i1: { dataType: 'int', required: true }
                }, null)
            }
        }, null);
        var c = new context({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })
        var provType = $data.storageProviders.sqLite.SqLiteStorageProvider;
        var prov = new provType({ databaseName: "ProviderTestDb", name: "sqLite" });

        var sql = prov.createSqlFromStorageModel(c._storageModel[0]);
        equal(sql, 'CREATE TABLE IF NOT EXISTS [SimpleDataTypes] ([i0] INTEGER NOT NULL, [i1] INTEGER, [b0] INTEGER NOT NULL, [b1] INTEGER, [t0] TEXT NOT NULL, [t1] TEXT, [bl0] BLOB NOT NULL, [bl1] BLOB, [n0] REAL NOT NULL, [n1] REAL, [d1] REAL NOT NULL, [d2] REAL);', 'create table function faild');
        var sql = prov.createSqlFromStorageModel(c._storageModel[1]);
        equal(sql, 'CREATE TABLE IF NOT EXISTS [RequireWithKeys] ([i0] INTEGER NOT NULL, [i1] INTEGER NOT NULL,PRIMARY KEY ([i0]));', 'required with key');
        var sql = prov.createSqlFromStorageModel(c._storageModel[2]);
        equal(sql, 'CREATE TABLE IF NOT EXISTS [RequireWithMultipleKeys] ([i0] INTEGER NOT NULL, [i1] INTEGER NOT NULL,PRIMARY KEY ([i0], [i1]));', 'required with multiple key');
        var sql = prov.createSqlFromStorageModel(c._storageModel[3]);
        equal(sql, 'CREATE TABLE IF NOT EXISTS [RequireWithComputeds] ([i0] INTEGER PRIMARY KEY AUTOINCREMENT, [i1] INTEGER NOT NULL);', 'required with computed field');
    });

    module("sqLiteProviderTest_createDb");
    test("attach_db", function () {


        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' }
                }, null)
            }
        }, null);
        var context2 = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' }
                }, null)
            }
        }, null);

        stop(2);
        expect(14);
        var c = new context({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }).onReady(function (db) {
            $data.Db1 = db;
            $data.Db1.name = 'db1';
            db.Table1Items.add(new db.Table1Items.createNew({ fld1: 1, fld2: 'alma' }));
            db.Table1Items.add(new db.Table1Items.createNew({ fld1: 2, fld2: 'alma2' }));
            db.saveChanges(function () {
                db.Table1Items.where(function (item) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result) {
                    start();
                    equal(result.length, 2, "Db cleanup error");
                    equal(result[0].fld1, 1, "Inconsistency data in db");
                    equal(result[0].fld2, 'alma', "Inconsistency data in db");
                    equal(result[1].fld1, 2, "Inconsistency data in db");
                    equal(result[1].fld2, 'alma2', "Inconsistency data in db");


                    new context2({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged }).onReady(function (reconnectedDb) {
                        $data.Db2 = reconnectedDb;
                        $data.Db2.name = 'db2';
                        reconnectedDb.Table1Items.add(new reconnectedDb.Table1Items.createNew({ fld1: 3, fld2: 'alma3' }));
                        reconnectedDb.Table1Items.add(new reconnectedDb.Table1Items.createNew({ fld1: 4, fld2: 'alma4' }));
                        reconnectedDb.saveChanges(function () {
                            reconnectedDb.Table1Items.where(function (item) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result2) {
                                start();
                                equal(result2.length, 4, "Db cleanup error");
                                equal(result2[0].fld1, 1, "Inconsistency data in db");
                                equal(result2[0].fld2, 'alma', "Inconsistency data in db");
                                equal(result2[1].fld1, 2, "Inconsistency data in db");
                                equal(result2[1].fld2, 'alma2', "Inconsistency data in db");
                                equal(result2[2].fld1, 3, "Inconsistency data in db");
                                equal(result2[2].fld2, 'alma3', "Inconsistency data in db");
                                equal(result2[3].fld1, 4, "Inconsistency data in db");
                                equal(result2[3].fld2, 'alma4', "Inconsistency data in db");
                            });
                        });
                    });
                });
            });
        });
    });
    test("schema_extend", function () {

        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' }
                }, null)
            }
        }, null);
        var context2 = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' }
                }, null)
            },
            Table2Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity2", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' }
                }, null)
            }
        }, null);

        stop(3);
        expect(17);
        var c = new context({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }).onReady(function (db) {
            $data.Db1 = db;
            $data.Db1.name = 'db1';
            db.Table1Items.add(new db.Table1Items.createNew({ fld1: 1, fld2: 'alma' }));
            db.Table1Items.add(new db.Table1Items.createNew({ fld1: 2, fld2: 'alma2' }));
            db.saveChanges(function () {
                db.Table1Items.where(function (item, param) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result) {
                    start();
                    equal(result.length, 2, "Db cleanup error");
                    equal(result[0].fld1, 1, "Inconsistency data in db");
                    equal(result[0].fld2, 'alma', "Inconsistency data in db");
                    equal(result[1].fld1, 2, "Inconsistency data in db");
                    equal(result[1].fld2, 'alma2', "Inconsistency data in db");

                    var c2 = new context2({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged }).onReady(function (reconnectedDb) {
                        $data.Db2 = reconnectedDb;
                        $data.Db2.name = 'db2';
                        reconnectedDb.Table1Items.add(new reconnectedDb.Table1Items.createNew({ fld1: 3, fld2: 'alma3' }));
                        reconnectedDb.Table1Items.add(new reconnectedDb.Table1Items.createNew({ fld1: 4, fld2: 'alma4' }));
                        reconnectedDb.Table2Items.add(new reconnectedDb.Table2Items.createNew({ fld1: 1, fld2: 'alma' }));
                        reconnectedDb.saveChanges(function () {
                            reconnectedDb.Table1Items.where(function (item, param) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result2) {
                                start();
                                equal(result2.length, 4, "Db cleanup error");
                                equal(result2[0].fld1, 1, "Inconsistency data in db");
                                equal(result2[0].fld2, 'alma', "Inconsistency data in db");
                                equal(result2[1].fld1, 2, "Inconsistency data in db");
                                equal(result2[1].fld2, 'alma2', "Inconsistency data in db");
                                equal(result2[2].fld1, 3, "Inconsistency data in db");
                                equal(result2[2].fld2, 'alma3', "Inconsistency data in db");
                                equal(result2[3].fld1, 4, "Inconsistency data in db");
                                equal(result2[3].fld2, 'alma4', "Inconsistency data in db");
                            });
                            reconnectedDb.Table2Items.where(function (item, param) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result3) {
                                start();
                                equal(result3.length, 1, "Db cleanup error");
                                equal(result3[0].fld1, 1, "Inconsistency data in db");
                                equal(result3[0].fld2, 'alma', "Inconsistency data in db");
                            });
                        });
                    });
                });
            });
        });
    });
    test("schema_changed", function () {

        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' }
                }, null)
            }
        }, null);
        var context2 = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true },
                    fld2: { dataType: 'string' },
                    fld3: { dataType: 'string' }
                }, null)
            }
        }, null);

        stop(2);
        expect(10);
        var c = new context({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }).onReady(function (db) {
            $data.Db1 = db;
            $data.Db1.name = 'db1';
            db.Table1Items.add(new db.Table1Items.createNew({ fld1: 1, fld2: 'alma' }));
            db.Table1Items.add(new db.Table1Items.createNew({ fld1: 2, fld2: 'alma2' }));
            db.saveChanges(function () {
                db.Table1Items.where(function (item, param) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result) {
                    start();
                    equal(result.length, 2, "Db cleanup error");
                    equal(result[0].fld1, 1, "Inconsistency data in db");
                    equal(result[0].fld2, 'alma', "Inconsistency data in db");
                    equal(result[1].fld1, 2, "Inconsistency data in db");
                    equal(result[1].fld2, 'alma2', "Inconsistency data in db");

                    var c2 = new context2({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged }).onReady(function (reconnectedDb) {
                        $data.Db2 = reconnectedDb;
                        $data.Db2.name = 'db2';
                        reconnectedDb.Table1Items.add(new reconnectedDb.Table1Items.createNew({ fld1: 3, fld2: 'alma3' }));
                        reconnectedDb.Table1Items.add(new reconnectedDb.Table1Items.createNew({ fld1: 4, fld2: 'alma4' }));
                        reconnectedDb.saveChanges(function () {
                            reconnectedDb.Table1Items.where(function (item, param) { return item.fld1 > 0; }, null).orderBy(function (item) { return item.fld1; }).toArray(function (result2) {
                                start();
                                equal(result2.length, 2, "Db cleanup error");
                                equal(result2[0].fld1, 3, "Inconsistency data in db");
                                equal(result2[0].fld2, 'alma3', "Inconsistency data in db");
                                equal(result2[1].fld1, 4, "Inconsistency data in db");
                                equal(result2[1].fld2, 'alma4', "Inconsistency data in db");
                            });
                        });
                    });
                });
            });
        });
    });

    module("sqLiteProviderTest_relations");
    test("relation_with_simple_int_pk", function () {
        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Persons: {
                dataType: $data.EntitySet, elementType: $data.Class.define("Person", $data.Entity, null, {
                    Id: { dataType: 'integer', key: true },
                    Name: { dataType: 'string' },
                    MyBlogs: { dataType: $data.EntitySet, elementType: "Blog", inverseProperty: 'Owner' }
                    //EditableBlogs: { dataType: 'EntitySet', elementType: "Blog", foreignKey: 'Administrators' },
                    //DefaultBlog: { dataType: 'Blog' }
                }, null)
            },
            Blogs: {
                dataType: $data.EntitySet, elementType: $data.Class.define("Blog", $data.Entity, null, {
                    Id: { dataType: 'integer', key: true },
                    Title: { dataType: 'string' },
                    Owner: { dataType: 'Person', inverseProperty: 'MyBlogs' }
                    //Administrators: { dataType: 'EntitySet', elementType: "Blog", foreignKey: 'EditableBlogs' },
                    //DefaultUser: { dataType: 'Person', foreignKey: 'DefaultBlog' }
                }, null)
            }
        }, null);

        stop(1);
        expect(1);
        var c = new context({ databaseName: "sqLiteProviderTest_relations", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }).onReady(function (db) {
            $data.db = db;
            var person1 = new db.Persons.createNew({ Id: 1, Name: 'person1' });
            $data.person1 = person1;
            //console.dir(person1);
            var person2 = new db.Persons.createNew({ Id: 2, Name: 'person2' });
            var person3 = new db.Persons.createNew({ Id: 3, Name: 'person3' });
            db.Persons.add(person1);
            db.Persons.add(person2);
            db.Persons.add(person3);

            var blog1 = new db.Blogs.createNew({ Id: 1, Title: 'blog1' });
            var blog2 = new db.Blogs.createNew({ Id: 2, Title: 'blog2' });
            var blog3 = new db.Blogs.createNew({ Id: 3, Title: 'blog3' });
            db.Blogs.add(blog1);
            db.Blogs.add(blog2);
            db.Blogs.add(blog3);

            person1.DefaultBlog = blog3;

            db.saveChanges(function () {
                start();
                ok(true, 'Initialize faild');
                var person4 = new db.Persons.createNew({ Id: 3, Name: 'person3', DefaultBlog: blog1 });
                //console.dir(person4);
            });
        });
    });

	module("sqLiteProviderTest_in_subselect");
    test("filter_in_subselect", function () {
        var context = $data.EntityContext.extend("ProviderTestContext", {
            Categories: {
                type: $data.EntitySet, elementType: $data.Entity.extend("Category", {
                    Id: { type: 'int', key: true, computed: true },
                    Title: { type: 'string' },
                    Articles: { type: $data.EntitySet, elementType: "Article", inverseProperty: 'Category' }
                })
            },
            Articles: {
                type: $data.EntitySet, elementType: $data.Entity.extend("Article", {
                    Id: { type: 'int', key: true, computed: true },
                    Title: { type: 'string' },
                    Category: { type: 'Category', required: true }
                })
            }
        });

        stop(2);
        expect(1);
        var c = new context({ databaseName: "sqLiteProviderTest_subselect", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }).onReady(function (db) {
			var catA = new Category({ Title: 'CatA' });
			var catB = new Category({ Title: 'CatB' });
            db.Categories.add(catA);
			db.Categories.add(catB);

			var artA = new Article({ Title: 'ArtA', Category: catA });
			var artB = new Article({ Title: 'ArtB', Category: catA });
			var artC = new Article({ Title: 'ArtC', Category: catB });

			db.Articles.add(artA);
			db.Articles.add(artB);
			db.Articles.add(artC);

            db.saveChanges(function () {
                start(1);
				try{
					db.Categories
					.filter(function(item){
						return item.Id in this.category;
					}, {
						category: db.Articles
									.map(function(item){ return item.Category.Id; })
					})
					.toArray(function(){
						start(1);
						ok(true, 'Query failed');
					});
				}catch(e){
					start(1);
					ok(false, 'Query failed');
				}
            });
        });
    });

    /*test("computedFieldTest", function () {
        expect(6);

        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            ComputedWithPrimaryKeys: { dataType: $data.EntitySet, elementType: $data.Class.define("ComputedWithPrimaryKey", $data.Entity, null, {
                i0: { dataType: 'integer', key: true, computed: true },
                i1: { dataType: 'int' },
                i2: { dataType: 'int' }
            }, null)
            },
            TwoPrimaryKeys: { dataType: $data.EntitySet, elementType: $data.Class.define("TwoPrimaryKey", null, null, {
                i0: { dataType: 'integer', key: true },
                i1: { dataType: 'int', key: true },
                i2: { dataType: 'int' }
            }, null)
            },
            TwoPrimaryKeyWithComputed1s: { dataType: $data.EntitySet, elementType: $data.Class.define("TwoPrimaryKeyWithComputed1", $data.Entity, null, {
                i0: { dataType: 'integer', key: true, computed: true },
                i1: { dataType: 'int', key: true },
                i2: { dataType: 'int' }
            }, null)
            },
            TwoPrimaryKeyWithComputed2s: { dataType: $data.EntitySet, elementType: $data.Class.define("TwoPrimaryKeyWithComputed2", $data.Entity, null, {
                i0: { dataType: 'integer', computed: true },
                i1: { dataType: 'int', key: true, computed: true },
                i2: { dataType: 'int' }
            }, null)
            },

            ComputedFieldWithoutKeys: { dataType: $data.EntitySet, elementType: $data.Class.define("ComputedFieldWithoutKey", $data.Entity, null, {
                i0: { dataType: 'integer' },
                i1: { dataType: 'int', computed: true },
                i2: { dataType: 'int' }
            }, null)
            },
            MultipleComputedAndKeys: { dataType: $data.EntitySet, elementType: $data.Class.define("MultipleComputedAndKey", $data.Entity, null, {
                i0: { dataType: 'integer', key: true, computed: true },
                i1: { dataType: 'int', key: true, computed: true },
                i2: { dataType: 'int' }
            }, null)
            }
        }, null);
        var c = new context({ databaseName: "sqLiteProviderTest_createDb", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })
        var provType = $data.storageProviders.sqLite.SqLiteStorageProvider;
        var prov = new provType({ databaseName: "ProviderTestDb", name: "sqLite" });
        var sql1 = prov.createSqlFromStorageModel(context.ComputedWithPrimaryKeys);
        equal(sql1, 'CREATE TABLE IF NOT EXISTS ComputedWithPrimaryKeys (i0 INTEGER PRIMARY KEY AUTOINCREMENT, i1 INTEGER, i2 INTEGER);', 'primary key with computed field faild');

        var sql2 = prov.createSqlFromStorageModel(c.TwoPrimaryKeys);
        equal(sql2, 'CREATE TABLE IF NOT EXISTS TwoPrimaryKeys (i0 INTEGER, i1 INTEGER, i2 INTEGER,PRIMARY KEY (i0, i1));', 'two primary key faild');

        raises(function () { prov.createSqlFromStorageModel(c.TwoPrimaryKeyWithComputed1s) }, Exception, 'multiple primary key with computed field');
        raises(function () { prov.createSqlFromStorageModel(c.TwoPrimaryKeyWithComputed2s) }, Exception, 'multiple primary key with computed field');
        raises(function () { prov.createSqlFromStorageModel(c.ComputedFieldWithoutKeys) }, Exception, 'computed field without key field');
        //raises(function () { prov.createSqlFromStorageModel(c.MultipleComputedAndKeys) }, Exception, 'multiple computed & key fields');
    });*/
});
