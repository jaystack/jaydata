require('../../NewsReaderContext.js');


var transform = new $data.oDataServer.EntityTransform($news.Types.NewsContext, 'http://example.com');

exports.Tests = {
    'type exists': function (test) {
        test.expect(1);
        test.equal(typeof $data.oDataServer.EntityTransform, 'function', '$data.oDataServer.EntityTransform exists');
        test.done();
    },
    'single value int // Count data': function (test) {
        test.expect(3);

        var res = transform.convertToResponse(5);
        test.equal(res, 5, 'result Data failed');

        var res = transform.convertToResponse(6, 'Categories');
        test.equal(res, 6, 'result Data failed');

        var res = transform.convertToResponse(7, $news.Types.Article);
        test.equal(res, 7, 'result Data failed');

        test.done();
    },
    'single value string': function (test) {
        test.expect(3);

        var res = transform.convertToResponse('result');
        test.equal(res, 'result', 'result Data failed');

        var res = transform.convertToResponse('result2', 'Categories');
        test.equal(res, 'result2', 'result Data failed');

        var res = transform.convertToResponse('result3', $news.Types.Article);
        test.equal(res, 'result3', 'result Data failed');

        test.done();
    },
    'single value date': function (test) {
        test.expect(3);

        var date = new Date();
        var res = transform.convertToResponse(date);
        test.equal(res, date, 'result Data failed');

        var res = transform.convertToResponse(date, 'Categories');
        test.equal(res, date, 'result Data failed');

        var res = transform.convertToResponse(date, $news.Types.Article);
        test.equal(res, date, 'result Data failed');

        test.done();
    },
    'single value object': function (test) {
        test.expect(6);

        var object = { a: '13', b: 'test', c: 15, d: new Date() };
        var res = transform.convertToResponse(object);
        test.equal(res, object, 'result Data failed');
        test.equal(res.a, '13', 'result.a Data failed');

        var res = transform.convertToResponse(object, 'Categories');
        test.equal(res, object, 'result Data failed');
        test.equal(res.a, '13', 'result.a Data failed');

        var res = transform.convertToResponse(object, $news.Types.Article);
        test.equal(res, object, 'result Data failed');
        test.equal(res.a, '13', 'result.a Data failed');

        test.done();
    },
    'single value entity': function (test) {
        test.expect(6);

        var entity = new $news.Types.Article({ Id: 1, Title: 'title', Body: 'body' });
        var res = transform.convertToResponse([entity])[0];
        test.deepEqual(res, entity, 'result Data failed');
        test.equal(res.Title, 'title', 'result.Title Data failed');

        var res = transform.convertToResponse([entity], 'Articles')[0];
        test.notDeepEqual(res, entity, 'result Data failed');
        test.equal(res.Title, 'title', 'result.Title Data failed');

        var res = transform.convertToResponse([entity], $news.Types.Article)[0];
        test.notDeepEqual(res, entity, 'result Data failed');
        test.equal(res.Title, 'title', 'result.Title Data failed');

        test.done();
    },
    'array value not entity': function (test) {
        test.expect(13);

        var item0 = { Title: 'string' };
        var array = [item0, 'array'];
        var res = transform.convertToResponse(array);
        test.equal(res, array, 'result Data failed');
        test.equal(res[0], item0, 'result[0] Data failed');
        test.equal(res[1], 'array', 'result[0] Data failed');

        var res = transform.convertToResponse(array, 'Articles');
        test.notEqual(res, array, 'result Data failed');
        test.notEqual(res[0], item0, 'result[0] Data failed');
        test.equal(res[0].Title, 'string', 'result[0].Title Data failed');
        test.notEqual(res[1], 'array', 'result[1] Data failed');
        test.equal(res[1].Title, undefined, 'result[1].Title Data failed');

        var res = transform.convertToResponse(array, $news.Types.Article);
        test.notEqual(res, array, 'result Data failed');
        test.notEqual(res[0], item0, 'result[0] Data failed');
        test.equal(res[0].Title, 'string', 'result[0].Title Data failed');
        test.notEqual(res[1], 'array', 'result[1] Data failed');
        test.equal(res[1].Title, undefined, 'result[1].Title Data failed');

        test.done();
    },
    'array value entity': function (test) {
        test.expect(10);

        var entityArray = [new $news.Types.Article({ Id: 1, Title: 'title', Body: 'body' })];
        var res = transform.convertToResponse(entityArray);
        test.equal(res, entityArray, 'result Data failed');
        test.equal(res[0] instanceof $news.Types.Article, true, 'result Datatype changed');
        test.equal(res[0].Title, 'title', 'result[0].Title Data failed');

        res = transform.convertToResponse(entityArray, 'Articles');
        test.equal(res[0] instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
        test.notEqual(res[0].__metadata, undefined, '__metadata is undefined');
        var url = 'http://example.com/Articles(1)';
        test.deepEqual(res[0].__metadata, { type: '$news.Types.Article', id: url, uri: url }, '__metadata is undefined');
        test.equal(res[0].Title, 'title', 'result.Title Data failed');
        test.equal(res[0].Body, 'body', 'result.Body Data failed');
        test.equal(res[0].Lead, undefined, 'result.Lead Data failed');

        var res2 = transform.convertToResponse(entityArray, $news.Types.Article);
        test.deepEqual(res, res2, 'object compare deep equal failed');


        test.done();
    },
    'array value entities': function (test) {
        test.expect(34);

        var entityArray = [
            new $news.Types.Article({ Id: 0, Title: 'title0', Body: 'body0' }),
            new $news.Types.Article({ Id: 1, Title: 'title1', Body: 'body1' }),
            new $news.Types.Article({ Id: 2, Title: 'title2', Body: 'body2' })
        ];
        var res = transform.convertToResponse(entityArray);
        test.equal(res, entityArray, 'result Data failed');
        test.equal(res[0] instanceof $news.Types.Article, true, 'result Datatype changed');
        test.equal(res[0].Id, 0, 'result[0].Id Data failed');
        test.equal(res[0].Title, 'title0', 'result[0].Title Data failed');
        test.equal(res[1].Id, 1, 'result[1].Id Data failed');
        test.equal(res[1].Title, 'title1', 'result[1].Title Data failed');

        res = transform.convertToResponse(entityArray, 'Articles');
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            var meta = {
                type: '$news.Types.Article',
                uri: 'http://example.com/Articles(' + item.Id + ')',
                id: 'http://example.com/Articles(' + item.Id + ')'
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            var catDeferred = {
                __deferred: {
                    uri: meta.uri + '/Category'
                }
            }
            test.deepEqual(item.Category, catDeferred, 'Category deferred failed');

            var authorDeferred = {
                __deferred: {
                    uri: meta.uri + '/Author'
                }
            }
            test.deepEqual(item.Author, authorDeferred, 'Author deferred failed');

            test.equal(item.Id, i, 'result.Id Data failed');
            test.equal(item.Title, 'title' + i, 'result.Title Data failed');
            test.equal(item.Body, 'body' + i, 'result.Body Data failed');
            test.equal(item.Lead, undefined, 'result.Title Lead failed');
        }

        var res2 = transform.convertToResponse(entityArray, $news.Types.Article);
        test.deepEqual(res, res2, 'object compare deep equal failed');

        test.done();
    },
    'array value complex type': function (test) {
        test.expect(2 + 3 * 7);

        var entityArray = [
            new $news.Types.Location({ Address: 'Address0', City: 'City0', Zip: 1000, Country: 'Country0' }),
            new $news.Types.Location({ Address: 'Address1', City: 'City1', Zip: 1001, Country: 'Country1' }),
            new $news.Types.Location({ Address: 'Address2', City: 'City2', Zip: 1002, Country: 'Country2' })
        ];
        var res = transform.convertToResponse(entityArray);
        test.equal(res, entityArray, 'result Data failed');
        test.equal(res[0] instanceof $news.Types.Location, true, 'result Datatype changed');

        res = transform.convertToResponse(entityArray, $news.Types.Location);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            var meta = {
                type: '$news.Types.Location'
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Address, 'Address' + i, 'result.Address Data failed');
            test.equal(item.City, 'City' + i, 'result.City Data failed');
            test.equal(item.Zip, 1000 + i, 'result.Zip Data failed');
            test.equal(item.Country, 'Country' + i, 'result.Country Lead failed');
        }

        test.done();
    },
    'array value entities with complex type': function (test) {
        test.expect(6 + 4 * 4 + 3 * 5 + 2 + 1);

        var entityArray = [
            new $news.Types.UserProfile({ Id: 0, FullName: 'FullName0', Bio: 'Bio0', Location: new $news.Types.Location({ Address: 'Address0', City: 'City0', Zip: 1000, Country: 'Country0' }), Birthday: new Date('2000/05/01') }),
            new $news.Types.UserProfile({ Id: 1, FullName: 'FullName1', Bio: 'Bio1', Location: new $news.Types.Location({ Address: 'Address1', City: 'City1', Zip: 1001, Country: 'Country1' }), Birthday: new Date('2000/05/02') }),
            new $news.Types.UserProfile({ Id: 2, FullName: 'FullName2', Bio: 'Bio2', Location: new $news.Types.Location({ Address: 'Address2', City: 'City2', Zip: 1002, Country: 'Country2' }), Birthday: new Date('2000/05/03') }),
            new $news.Types.UserProfile({ Id: 3, FullName: 'FullName3', Bio: 'Bio3', Location: null, Birthday: new Date('2000/05/04') })
        ];
        var res = transform.convertToResponse(entityArray);
        test.equal(res, entityArray, 'result Data failed');
        test.equal(res[0] instanceof $news.Types.UserProfile, true, 'result Datatype changed');
        test.equal(res[0].Id, 0, 'result[0].Id Data failed');
        test.equal(res[0].FullName, 'FullName0', 'result[0].FullName Data failed');
        test.equal(res[1].Id, 1, 'result[1].Id Data failed');
        test.equal(res[1].FullName, 'FullName1', 'result[1].FullName Data failed');

        res = transform.convertToResponse(entityArray, 'UserProfiles');
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Birthday, '/Date(' + new Date('2000/05/0' + (i + 1)).valueOf() + ')/', 'result[i].Birthday Data failed');

            var meta = {
                type: '$news.Types.UserProfile',
                uri: 'http://example.com/UserProfiles(' + item.Id + ')',
                id: 'http://example.com/UserProfiles(' + item.Id + ')'
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            if (item.Location) {
                test.deepEqual(item.Location.__metadata, {
                    type: '$news.Types.Location'
                }, 'result.Location.Address Data failed')

                test.equal(item.Location.Address, 'Address' + i, 'result.Location.Address Data failed');
                test.equal(item.Location.City, 'City' + i, 'result.Location.City Data failed');
                test.equal(item.Location.Zip, 1000 + i, 'result.Location.Zip Data failed');
                test.equal(item.Location.Country, 'Country' + i, 'result.Location.Country Lead failed');
            } else {
                test.equal(i, 3, 'invalid Location not exists');
                test.equal(item.Location, null, 'Location value failed');
            }
        }

        var res2 = transform.convertToResponse(entityArray, $news.Types.UserProfile);
        test.deepEqual(res, res2, 'object compare deep equal failed');

        test.done();
    },
    'array value entities nav Props no include': function (test) {
        test.expect(12);

        var entityArray = [
            new $news.Types.Article({ Id: 0, Title: 'title0', Body: 'body0', Category: new $news.Types.Category({ Id: 1, Name: 'Sport' }) }),
            new $news.Types.Article({ Id: 1, Title: 'title1', Body: 'body1', Category: new $news.Types.Category({ Id: 1, Name: 'Sport' }) }),
            new $news.Types.Article({ Id: 2, Title: 'title2', Body: 'body2', Category: new $news.Types.Category({ Id: 2, Name: 'JayData' }) }),
            new $news.Types.Article({ Id: 3, Title: 'title3', Body: 'body3', Category: null })
        ];
        var res = transform.convertToResponse(entityArray, 'Articles');
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            var meta = {
                type: '$news.Types.Article',
                uri: 'http://example.com/Articles(' + item.Id + ')',
                id: 'http://example.com/Articles(' + item.Id + ')'
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            var catDeferred = {
                __deferred: {
                    uri: meta.uri + '/Category'
                }
            }

            test.deepEqual(item.Category, catDeferred, 'Category deferred failed');

            var authorDeferred = {
                __deferred: {
                    uri: meta.uri + '/Author'
                }
            }
            test.deepEqual(item.Category, catDeferred, 'Author deferred failed');
        }

        test.done();
    },
    'array value entities nav Props value (include)': function (test) {
        test.expect(13);

        var sportCategory = new $news.Types.Category({ Id: 1, Title: 'Sport' });
        var entityArray = [
            new $news.Types.Article({ Id: 0, Title: 'title0', Body: 'body0', Category: sportCategory }),
            new $news.Types.Article({ Id: 1, Title: 'title1', Body: 'body1', Category: sportCategory }),
            new $news.Types.Article({ Id: 2, Title: 'title2', Body: 'body2', Category: new $news.Types.Category({ Id: 2, Title: 'JayData' }) }),
            new $news.Types.Article({ Id: 3, Title: 'title3', Body: 'body3', Category: null })
        ];
        var res = transform.convertToResponse(entityArray, 'Articles', null, ['Category']);

        for (var i = 0; i < res.length; i++) {
            var category = res[i].Category;
            if (category) {
                test.deepEqual(category.__metadata, {
                    type: '$news.Types.Category',
                    uri: 'http://example.com/Categories(' + category.Id + ')',
                    id: 'http://example.com/Categories(' + category.Id + ')'
                }, '__metadata object failed');

                test.deepEqual(category.Articles, {
                    __deferred: {
                        uri: 'http://example.com/Categories(' + category.Id + ')/Articles'
                    }
                }, 'Articles deferred failed');
            } else {
                test.equal(i, 3, 'invalid category not exists');
                test.equal(category, null, 'category value failed');
            }
        }

        var item = res[0].Category;
        test.equal(item.Id, 1, 'item[0].Id Data failed');
        test.equal(item.Title, 'Sport', 'item[0].Name Data failed');

        test.deepEqual(item, res[1].Category, 'res[0].Category && res[1].Category is not equal');

        item = res[2].Category;
        test.equal(item.Id, 2, 'item[2].Id Data failed');
        test.equal(item.Title, 'JayData', 'item[2].Name Data failed');

        test.done();
    },
    'array value entities List Props value (include)': function (test) {
        test.expect(2 * 5 + 1 * 2 * 5 + 2);

        var entityArray = [
            new $news.Types.Category({ Id: 0, Title: 'title0', Articles: [new $news.Types.Article({ Id: 1, Title: 'Title1', Body: 'body1', Lead: 'lead' })] }),
            new $news.Types.Category({ Id: 1, Title: 'title1', Articles: [new $news.Types.Article({ Id: 2, Title: 'Title2', Body: 'body2', Lead: 'lead' })] }),
            new $news.Types.Category({ Id: 2, Title: 'title2', Articles: [new $news.Types.Article({ Id: 2, Title: 'Title2', Body: 'body2', Lead: 'lead' }), new $news.Types.Article({ Id: 3, Title: 'Title3', Body: 'body3', Lead: 'lead' })] }),
            new $news.Types.Category({ Id: 3, Title: 'title3', Articles: null })
        ];
        var res = transform.convertToResponse(entityArray, $news.Types.Category, null, ['Articles']);

        for (var i = 0; i < res.length; i++) {
            var articles = res[i].Articles;
            if (articles) {
                for (var j = 0; j < articles.length; j++) {
                    var article = articles[j];

                    test.deepEqual(article.__metadata, {
                        type: '$news.Types.Article',
                        uri: 'http://example.com/Articles(' + article.Id + ')',
                        id: 'http://example.com/Articles(' + article.Id + ')'
                    }, '__metadata object failed');

                    test.deepEqual(article.Author, {
                        __deferred: {
                            uri: 'http://example.com/Articles(' + article.Id + ')/Author'
                        }
                    }, 'Author deferred failed');

                    test.equal(article.Title, 'Title' + article.Id, 'item[i].Articles[ij].Title Data failed');
                    test.equal(article.Body, 'body' + article.Id, 'item[i].Articles[ij].Body Data failed');
                    test.equal(article.Lead, 'lead', 'item[i].Articles[ij].Lead Data failed');
                }
            } else {
                test.equal(i, 3, 'invalid articles not exists');
                test.equal(articles, null, 'articles value failed');
            }
        }

        test.done();
    },

    'select fields from entity': function (test) {
        test.expect(24);

        var entityArray = [
            new $news.Types.Article({ Id: 0, Title: 'title0', Body: 'body0', Lead: 'lead0' }),
            new $news.Types.Article({ Id: 1, Title: 'title1', Body: 'body1', Lead: 'lead1' }),
            new $news.Types.Article({ Id: 2, Title: 'title2', Body: 'body2', Lead: 'lead2' })
        ];

        var res = transform.convertToResponse(entityArray, 'Articles', ['Title', 'Body', 'Author']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            var meta = {
                type: '$news.Types.Article',
                uri: 'http://example.com/Articles(' + i + ')',
                id: 'http://example.com/Articles(' + i + ')'
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            var authorDeferred = {
                __deferred: {
                    uri: meta.uri + '/Author'
                }
            }
            test.deepEqual(item.Author, authorDeferred, 'Author deferred failed');

            test.equal(item.Title, 'title' + i, 'result.Title Data failed');
            test.equal(item.Body, 'body' + i, 'result.Body Data failed');
            test.equal(item.Lead, undefined, 'result.Title Lead failed');
        }

        test.done();
    },
    'select fields from entity miltipleKeys': function (test) {
        test.expect(3 * 8);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string' },
            Prop3: { type: 'string' }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0' }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1' }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2' })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A', ['Prop1', 'Prop3']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            test.equal(item.Id2, undefined, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Lead failed');
            test.equal(item.Prop3, 'lead' + i, 'result.Prop3 Data failed');
        }

        test.done();
    },
    'select fields from entities with complex type': function (test) {
        test.expect(6 + 4 * 6 + 3 * 5 + 2 + 1);

        var entityArray = [
            new $news.Types.UserProfile({ Id: 0, FullName: 'FullName0', Bio: 'Bio0', Location: new $news.Types.Location({ Address: 'Address0', City: 'City0', Zip: 1000, Country: 'Country0' }), Birthday: new Date('2000/05/01') }),
            new $news.Types.UserProfile({ Id: 1, FullName: 'FullName1', Bio: 'Bio1', Location: new $news.Types.Location({ Address: 'Address1', City: 'City1', Zip: 1001, Country: 'Country1' }), Birthday: new Date('2000/05/02') }),
            new $news.Types.UserProfile({ Id: 2, FullName: 'FullName2', Bio: 'Bio2', Location: new $news.Types.Location({ Address: 'Address2', City: 'City2', Zip: 1002, Country: 'Country2' }), Birthday: new Date('2000/05/03') }),
            new $news.Types.UserProfile({ Id: 3, FullName: 'FullName3', Bio: 'Bio3', Location: null, Birthday: new Date('2000/05/04') })
        ];
        var res = transform.convertToResponse(entityArray);
        test.equal(res, entityArray, 'result Data failed');
        test.equal(res[0] instanceof $news.Types.UserProfile, true, 'result Datatype changed');
        test.equal(res[0].Id, 0, 'result[0].Id Data failed');
        test.equal(res[0].FullName, 'FullName0', 'result[0].FullName Data failed');
        test.equal(res[1].Id, 1, 'result[1].Id Data failed');
        test.equal(res[1].FullName, 'FullName1', 'result[1].FullName Data failed');

        res = transform.convertToResponse(entityArray, 'UserProfiles', ['FullName', 'Bio', 'Location.Address', 'Location.City']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result[i].Birthday Data failed');
            test.equal(item.FullName, 'FullName' + i, 'result[i].Birthday Data failed');
            test.equal(item.Birthday, undefined, 'result[i].Birthday Data failed');

            var meta = {
                type: '$news.Types.UserProfile',
                uri: 'http://example.com/UserProfiles(' + i + ')',
                id: 'http://example.com/UserProfiles(' + i + ')'
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            if (item.Location) {
                test.deepEqual(item.Location.__metadata, {
                    type: '$news.Types.Location'
                }, 'result.Location.Address Data failed')

                test.equal(item.Location.Address, 'Address' + i, 'result.Location.Address Data failed');
                test.equal(item.Location.City, 'City' + i, 'result.Location.City Data failed');
                test.equal(item.Location.Zip, undefined, 'result.Location.Zip Data failed');
                test.equal(item.Location.Country, undefined, 'result.Location.Country Lead failed');
            } else {
                test.equal(i, 3, 'invalid Location not exists');
                test.equal(item.Location, null, 'Location value failed');
            }
        }

        var res2 = transform.convertToResponse(entityArray, $news.Types.UserProfile, ['FullName', 'Bio', 'Location.Address', 'Location.City']);
        test.deepEqual(res, res2, 'object compare deep equal failed');

        test.done();
    },
    'transform - entity has lazyLoadProperty': function (test) {
        test.expect(3 * 8);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string', lazyLoad: true },
            Prop3: { type: 'string' }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0' }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1' }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2' })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A'/*, ['Prop1', 'Prop3']*/);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, i, 'result.Id Data failed');
            test.equal(item.Id2, i+1, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1,  i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, 'lead' + i, 'result.Prop3 Data failed');
        }

        test.done();
    },
    'transform - select entity has lazyLoadProperty': function (test) {
        test.expect(3 * 8);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string', lazyLoad: true },
            Prop3: { type: 'string' }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0' }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1' }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2' })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A', ['Prop1', 'Prop2']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            test.equal(item.Id2, undefined, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, 'body' + i, 'result.Prop2 Data failed');
            test.equal(item.Prop3, undefined, 'result.Prop3 Data failed');
        }

        test.done();
    },
    'transform - entity has lazyLoad Complex Property': function (test) {
        test.expect(3 * 9);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string', lazyLoad: true },
            Prop3: { type: 'string' },
            Prop4: { type: '$test.AComplexProperty', lazyLoad: true }
        });

        $data.Class.define('$test.AComplexProperty', $data.Entity, null, {
            PropA: { type: 'string' },
            PropB: { type: 'string' }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0', Prop4: new $test.AComplexProperty({ PropA: 'A0', PropB: 'B' }) }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1', Prop4: new $test.AComplexProperty({ PropA: 'A1', PropB: 'B' }) }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2', Prop4: new $test.AComplexProperty({ PropA: 'A2', PropB: 'B' }) })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A'/*, ['Prop1', 'Prop3']*/);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, i, 'result.Id Data failed');
            test.equal(item.Id2, i + 1, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, 'lead' + i, 'result.Prop3 Data failed');
            test.equal(item.Prop4, undefined, 'result.Prop4 Data failed');
        }

        test.done();
    },
    'transform - select entity has lazyLoad Complex Property': function (test) {
        test.expect(3 * 11);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string', lazyLoad: true },
            Prop3: { type: 'string' },
            Prop4: { type: '$test.AComplexProperty', lazyLoad: true }
        });

        $data.Class.define('$test.AComplexProperty', $data.Entity, null, {
            PropA: { type: 'string' },
            PropB: { type: 'string' }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0', Prop4: new $test.AComplexProperty({ PropA: 'A0', PropB: 'B' }) }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1', Prop4: new $test.AComplexProperty({ PropA: 'A1', PropB: 'B' }) }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2', Prop4: new $test.AComplexProperty({ PropA: 'A2', PropB: 'B' }) })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A', ['Prop1', 'Prop4']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            test.equal(item.Id2, undefined, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, undefined, 'result.Prop3 Data failed');

            var cMeta = {
                type: '$test.AComplexProperty'
            };
            test.deepEqual(item.Prop4.__metadata, cMeta, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropA, 'A' + i, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropB, 'B', 'result.Prop4 instance failed');
        }

        test.done();
    },
    'transform - entity has lazyLoad Complex Field': function (test) {
        test.expect(3 * 11);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string', lazyLoad: true },
            Prop3: { type: 'string' },
            Prop4: { type: '$test.AComplexProperty' }
        });

        $data.Class.define('$test.AComplexProperty', $data.Entity, null, {
            PropA: { type: 'string' },
            PropB: { type: 'string', lazyLoad: true }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0', Prop4: new $test.AComplexProperty({ PropA: 'A0', PropB: 'B' }) }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1', Prop4: new $test.AComplexProperty({ PropA: 'A1', PropB: 'B' }) }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2', Prop4: new $test.AComplexProperty({ PropA: 'A2', PropB: 'B' }) })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A'/*, ['Prop1', 'Prop3']*/);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, i, 'result.Id Data failed');
            test.equal(item.Id2, i + 1, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, 'lead' + i, 'result.Prop3 Data failed');
            
            var cMeta = {
                type: '$test.AComplexProperty'
            };
            test.deepEqual(item.Prop4.__metadata, cMeta, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropA, 'A' + i, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropB, undefined, 'result.Prop4 instance failed');
        }

        test.done();
    },
    'transform - select entity has lazyLoad Complex Field': function (test) {
        test.expect(3 * 11 * 3);

        $data.Class.define('$test.A', $data.Entity, null, {
            Id: { type: 'int', key: true },
            Id2: { type: 'int', key: true },
            Prop1: { type: 'int' },
            Prop2: { type: 'string', lazyLoad: true },
            Prop3: { type: 'string' },
            Prop4: { type: '$test.AComplexProperty' }
        });

        $data.Class.define('$test.AComplexProperty', $data.Entity, null, {
            PropA: { type: 'string' },
            PropB: { type: 'string', lazyLoad: true }
        });

        $data.Class.define('$test.TContext', $data.EntityContext, null, {
            A: { type: $data.EntitySet, elementType: $test.A }
        });

        var entityArray = [
            new $test.A({ Id: 0, Id2: 1, Prop1: 0, Prop2: 'body0', Prop3: 'lead0', Prop4: new $test.AComplexProperty({ PropA: 'A0', PropB: 'B' }) }),
            new $test.A({ Id: 1, Id2: 2, Prop1: 1, Prop2: 'body1', Prop3: 'lead1', Prop4: new $test.AComplexProperty({ PropA: 'A1', PropB: 'B' }) }),
            new $test.A({ Id: 2, Id2: 3, Prop1: 2, Prop2: 'body2', Prop3: 'lead2', Prop4: new $test.AComplexProperty({ PropA: 'A2', PropB: 'B' }) })
        ];

        var tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A', ['Prop1', 'Prop4']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            test.equal(item.Id2, undefined, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1,  i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, undefined, 'result.Prop3 Data failed');

            var cMeta = {
                type: '$test.AComplexProperty'
            };
            test.deepEqual(item.Prop4.__metadata, cMeta, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropA, 'A' + i, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropB, undefined, 'result.Prop4 instance failed');
        }

        tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A', ['Prop1', 'Prop4.PropA', 'Prop4.PropB']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            test.equal(item.Id2, undefined, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, undefined, 'result.Prop3 Data failed');

            var cMeta = {
                type: '$test.AComplexProperty'
            };
            test.deepEqual(item.Prop4.__metadata, cMeta, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropA, 'A' + i, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropB, 'B', 'result.Prop4 instance failed');
        }

        tr = new $data.oDataServer.EntityTransform($test.TContext, 'http://example.com');
        res = tr.convertToResponse(entityArray, 'A', ['Prop1', 'Prop4.PropB']);
        for (var i = 0; i < res.length; i++) {
            var item = res[i];

            test.equal(item instanceof $data.Entity, false, 'entity is not instanceof $data.Entity failed');
            test.notEqual(item.__metadata, undefined, '__metadata is undefined');

            test.equal(item.Id, undefined, 'result.Id Data failed');
            test.equal(item.Id2, undefined, 'result.Id2 Data failed');
            var meta = {
                type: '$test.A',
                uri: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
                id: 'http://example.com/A(Id=' + i + ',Id2=' + (i + 1) + ')',
            };
            test.deepEqual(item.__metadata, meta, '__metadata object failed');

            test.equal(item.Prop1, i, 'result.Prop1 Data failed');
            test.equal(item.Prop2, undefined, 'result.Prop2 Data failed');
            test.equal(item.Prop3, undefined, 'result.Prop3 Data failed');

            var cMeta = {
                type: '$test.AComplexProperty'
            };
            test.deepEqual(item.Prop4.__metadata, cMeta, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropA, undefined, 'result.Prop4 instance failed');
            test.equal(item.Prop4.PropB, 'B', 'result.Prop4 instance failed');
        }

        test.done();
    }
};