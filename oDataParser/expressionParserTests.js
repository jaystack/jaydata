
$(document).ready(function () {

    function parseQuery(params) {
        var paramParts = params.split('&');
        var obj = {};
        for (var i = 0; i < paramParts.length; i++) {
            var parts = paramParts[i].split('=');
            var name = parts[0].substr(1);
            obj[name] = parts[1];
        }
        return obj;
    }
    function builderTest(name, queryable, context, isCount, hasInclude) {
        test(name, 2, function () {

            var q;
            if (isCount) {
                q = queryable.toTraceString('Count');
            } else {
                q = queryable.toTraceString();
            }

            var queryParts = q.queryText.split('?');
            var obj = parseQuery(queryParts[1]);

            if (!hasInclude)
                obj.expand = '';

            obj.frame = queryParts[0].indexOf('$count') > 0 ? 'Count' : undefined;
            var builder = new $data.oDataParser.EntityExpressionBuilder(context, queryParts[0].split('/')[1]);
            var expression = builder.parse(obj).expression;

            equal(expression.getType(), q.expression.getType(), name + 'expression frame failed');
            //context.executeQuery(new $data.Queryable(context.Categories, expression), { succes: $data.debug, error: $data.debug });
            equal(JSON.stringify(expression.source, null, '    '), JSON.stringify(q.expression.source, null, '    '), name + ' builder test failed');
        });
    }

    var c = new $news.Types.NewsContext({ name: 'oData' });

    module('EntityExpressionBuilder');
    builderTest('field compare int', c.Articles.filter(function (it) { return it.Id <= 500; }), c);
    builderTest('field compare minus int', c.TestTable.filter(function (it) { return it.i0 == -15; }), c);
    builderTest('field compare int', c.Articles.filter(function (it) { return it.Id <= 500; }), c, true);
    builderTest('field compare string / $count', c.Articles.filter(function (it) { return it.Title == 'Article1'; }), c);
    //builderTest('field multipleFilter', c.Articles.filter(function (it) { return it.Title == 'Article1'; }).filter(function (it) { return it.Body.contains('Body1'); }), c);
    builderTest('field contains', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa'); }), c);
    builderTest('field contains / $count', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa'); }), c, true);
    builderTest('field compare complex', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }), c);
    builderTest('orderBy string', c.Articles.orderBy('it.Title'), c);
    builderTest('orderBy', c.Articles.orderBy(function (it) { return it.Title; }), c);
    builderTest('orderBy orderBy add', c.Articles.orderBy(function (it) { return it.Title + it.Body; }), c);
    builderTest('orderBy orderBy', c.Articles.orderBy(function (it) { return it.Title; }).orderBy(function (it) { return it.Body; }), c);
    builderTest('orderBy orderBy.call', c.Articles.orderBy(function (it) { return it.Title; }).orderBy(function (it) { return it.Body.substr(1, 2); }), c);
    builderTest('field compare, order by', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }).orderBy('it.Title'), c);
    builderTest('field compare, order by / $count', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }).orderBy('it.Title'), c, true);
    builderTest('skip', c.Articles.skip(5), c);
    builderTest('take', c.Articles.take(6), c);
    builderTest('field compare, order by, skip, take', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }).orderBy('it.Title').skip(10).take(5), c);
    builderTest('map', c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body }; }), c);
    builderTest('map navProp simple', c.Articles.map(function (it) { return { Author: { LoginName: it.Author.LoginName } }; }), c);
    builderTest('map navProp simple more field', c.Articles.map(function (it) { return { Author: { LoginName: it.Author.LoginName, Email: it.Author.Email } }; }), c);
    builderTest('map navProp complex', c.Articles.map(function (it) { return { Title: it.Title, Author: it.Author }; }), c);
    builderTest('map navProp complex deep prop', c.Articles.map(function (it) { return { Title: it.Title, Author: { LoginName: it.Author.LoginName } }; }), c);
    //builderTest('map navProp complex deep prop2', c.Articles.map(function (it) { return { Title: it.Title, Author: { Profile: { Bio: it.Author.Profile.Bio }/* it.Author.Profile*/, LoginName: it.Author.LoginName } }; }), c);
    builderTest('include singleProp', c.Articles.include('Category'), c, false, true);
    builderTest('include deep 1', c.Articles.include('Author').include('Author.Articles'), c, false, true);
    builderTest('include deep 2', c.Articles.include('Author').include('Author.Profile'), c, false, true);
    builderTest('include deep 3', c.Articles.include('Author').include('Author.Articles').include('Author.Articles.Reviewer'), c, false, true);
    builderTest('include multiple 1', c.Articles.include('Category').include('Author'), c, false, true);
    builderTest('include multiple 2 deep', c.Articles.include('Category').include('Author').include('Author.Articles'), c, false, true);

    builderTest('map - take', c.Articles.map(function (it) { return { Id: it.Id, Title: it.Title } }).take(6), c);
    //builderTest('filter some', c.Categories.filter(function(it){ return it.Articles.some(this.filter); }, { filter: c.Articles.filter(function(art){ return art.Title == 'Article1'; }) }), c);


    function selectTest(name, queryable, context, selectedFields, includes) {
        test(name, 3, function () {
            var q = queryable.toTraceString();

            var queryParts = q.queryText.split('?');
            var obj = parseQuery(queryParts[1]);

            obj.frame = queryParts[0].indexOf('$count') > 0 ? 'Count' : undefined;
            var builder = new $data.oDataParser.ODataEntityExpressionBuilder(context, queryParts[0].split('/')[1]);
            var parsed = builder.parse(obj);

            notEqual(JSON.stringify(parsed.expression.source), JSON.stringify(q.expression.source), name + ' builder test failed');

            equal(JSON.stringify(parsed.selectedFields), JSON.stringify(selectedFields), name + ' selectedFields test failed');
            equal(JSON.stringify(parsed.includes), JSON.stringify(includes), name + ' includes test failed');
        });
    }

    selectTest('selectTest map', c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body }; }), c, ['Title', 'Body'], []);
    selectTest('selectTest map 2', c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body, Author: it.Author }; }), c, ['Title', 'Body', 'Author'], ['Author']);


    function compareTest(name, queryable, refQueryable, context, isEqual) {
        test(name, 3, function () {
            var q = queryable.toTraceString();
            var q2 = refQueryable.toTraceString();

            window[isEqual ? 'equal' : 'notEqual'](q.queryText, q2.queryText, 'queryText equality failed');

            var queryParts = q.queryText.split('?');
            var obj = parseQuery(queryParts[1]);

            //obj.count = queryParts[0].indexOf('$count') > 0;
            var builder = new $data.oDataParser.ODataEntityExpressionBuilder(context, queryParts[0].split('/')[1]);
            var parsed = builder.parse(obj);

            var queryParts2 = q2.queryText.split('?');
            var obj2 = parseQuery(queryParts2[1]);

            var builder2 = new $data.oDataParser.ODataEntityExpressionBuilder(context, queryParts2[0].split('/')[1]);
            var parsed2 = builder.parse(obj2);

            equal(JSON.stringify(parsed.expression.source), JSON.stringify(parsed2.expression.source), name + ' expression compare test failed');

            var q11 = new $data.Queryable(context[queryParts[0].split('/')[1]], parsed.expression.source).toTraceString();
            var q21 = new $data.Queryable(context[queryParts2[0].split('/')[1]], parsed2.expression.source).toTraceString();

            equal(q11.queryText, q21.queryText, 'queryText 2nd run notequality failed');
        });
    }
    compareTest('compareTest map append key',
        c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body, Author: it.Author }; }),
        c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body, Author: it.Author, Id: it.Id }; }),
        c, false);
    compareTest('compareTest map append key 2',
        c.Articles.map(function (it) { return { Id: it.Id, Title: it.Title, Body: it.Body, Author: it.Author }; }),
        c.Articles.map(function (it) { return { Id: it.Id, Title: it.Title, Body: it.Body, Author: it.Author }; }),
        c, true);

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

    var tCont = new $test.TContext({ name: 'oData' });

    compareTest('compareTest map append multiple key 1',
        tCont.A.map(function (it) { return { Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3 }; }),
        tCont.A.map(function (it) { return { Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3, Id: it.Id, Id2: it.Id2 }; }),
        tCont, false);
    compareTest('compareTest map append multiple key 1 v2',
        tCont.A.map(function (it) { return { Prop1: it.Prop1, Prop3: it.Prop3 }; }),
        tCont.A.map(function (it) { return { Prop1: it.Prop1, Prop3: it.Prop3, Id: it.Id, Id2: it.Id2 }; }),
        tCont, false);
    compareTest('compareTest map append multiple key 2',
        tCont.A.map(function (it) { return { Id: it.Id, Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3 }; }),
        tCont.A.map(function (it) { return { Id: it.Id, Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3, Id2: it.Id2 }; }),
        tCont, false);
    compareTest('compareTest map append multiple key 2 v1',
        tCont.A.map(function (it) { return { Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3, Id: it.Id }; }),
        tCont.A.map(function (it) { return { Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3, Id: it.Id, Id2: it.Id2 }; }),
        tCont, false);

    compareTest('compareTest map append multiple key 2',
        tCont.A.map(function (it) { return { Id: it.Id, Id2: it.Id2, Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3 }; }),
        tCont.A.map(function (it) { return { Id: it.Id, Id2: it.Id2, Prop1: it.Prop1, Prop2: it.Prop2, Prop3: it.Prop3 }; }),
        tCont, true);


    $data.Class.define('$test.TestGeoType', $data.Entity, null, {
        Id: { type: 'int', key: true, computed: true },
        Prop1: { type: 'GeographyPoint' },
        Prop2: { type: 'GeographyPoint' },
        Prop3: { type: 'GeometryPoint' },
        Prop4: { type: 'GeometryPoint' },
        Prop5: { type: 'GeographyPolygon' },
        Prop6: { type: 'GeometryPolygon' },
        Prop7: { type: 'GeographyLineString' },
        Prop8: { type: 'GeometryLineString' }
    });

    $data.Class.define('$test.TContext2', $data.EntityContext, null, {
        A: { type: $data.EntitySet, elementType: $test.TestGeoType }
    });

    var tCont2 = new $test.TContext2({ name: 'oData' });
    
    builderTest('field geography distance call', tCont2.A.filter(function (it) { return it.Prop1.distance(it.Prop2) < 4.5; }), tCont2);
    builderTest('field geometry distance call', tCont2.A.filter(function (it) { return it.Prop3.distance(it.Prop4) > 42; }), tCont2);

    builderTest('field geography intersects call', tCont2.A.filter(function (it) { return it.Prop1.intersects(it.Prop5); }), tCont2);
    builderTest('field geometry intersects call', tCont2.A.filter(function (it) { return it.Prop3.intersects(it.Prop6); }), tCont2);

    builderTest('field geography length call', tCont2.A.filter(function (it) { return it.Prop7.length(); }), tCont2);
    builderTest('field geometry length call', tCont2.A.filter(function (it) { return it.Prop8.length(); }), tCont2);

});
