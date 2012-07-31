
$(document).ready(function () {
    function builderTest(name, queryable, context, isCount, hasInclude) {
        test(name, 2, function () {

            var q;
            if (isCount) {
                q = queryable.toTraceString('Count');
            } else {
                q = queryable.toTraceString();
            }

            var queryParts = q.queryText.split('?');
            var paramParts = queryParts[1].split('&');
            var obj = {};
            for (var i = 0; i < paramParts.length; i++) {
                var parts = paramParts[i].split('=');
                var name = parts[0].substr(1);
                obj[name] = parts[1];
            }
            if (!hasInclude)
                obj.expand = '';

            obj.count = queryParts[0].indexOf('$count') > 0;
            var builder = new $data.oDataParser.EntityExpressionBuilder(context, queryParts[0].split('/')[1]);
            var expression = builder.parse(obj).expression;

            equal(expression.getType(), q.expression.getType(), name + 'expression frame failed');
            equal(JSON.stringify(expression.source), JSON.stringify(q.expression.source), name + ' builder test failed');
        });
    }

    function selectTest(name, queryable, context, selectedFields, includes) {
        test(name, 3, function () {
            var q = queryable.toTraceString();

            var queryParts = q.queryText.split('?');
            var paramParts = queryParts[1].split('&');
            var obj = {};
            for (var i = 0; i < paramParts.length; i++) {
                var parts = paramParts[i].split('=');
                var name = parts[0].substr(1);
                obj[name] = parts[1];
            }

            obj.count = queryParts[0].indexOf('$count') > 0;
            var builder = new $data.oDataParser.ODataEntityExpressionBuilder(context, queryParts[0].split('/')[1]);
            var parsed = builder.parse(obj);

            notEqual(JSON.stringify(parsed.expression.source), JSON.stringify(q.expression.source), name + ' builder test failed');

            equal(JSON.stringify(parsed.selectedFields), JSON.stringify(selectedFields), name + ' selectedFields test failed');
            equal(JSON.stringify(parsed.includes), JSON.stringify(includes), name + ' includes test failed');
        });
    }

    var c = new $news.Types.NewsContext({ name: 'oData' });

    module('EntityExpressionBuilder');
    builderTest('field compare int', c.Articles.filter(function (it) { return it.Id <= 500; }), c);
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
    builderTest('orderBy orderBy.call', c.Articles.orderBy(function (it) { return it.Title; }).orderBy(function (it) { return it.Body.substr(1,2); }), c);
    builderTest('field compare, order by', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }).orderBy('it.Title'), c);
    builderTest('field compare, order by / $count', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }).orderBy('it.Title'), c, true);
    builderTest('skip', c.Articles.skip(5), c);
    builderTest('take', c.Articles.take(6), c);
    builderTest('field compare, order by, skip, take', c.Articles.filter(function (it) { return it.Author.LoginName.contains('almafa') && it.CreateDate > '2001/05/05' && it.Id <= 500; }).orderBy('it.Title').skip(10).take(5), c);
    builderTest('map', c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body }; }), c);
    builderTest('map navProp simple', c.Articles.map(function (it) { return { Author: it.Author.LoginName }; }), c);
    builderTest('map navProp complex', c.Articles.map(function (it) { return { Title: it.Title, Author: it.Author }; }), c);
    builderTest('map navProp complex deep prop', c.Articles.map(function (it) { return { Title: it.Title, Author: it.Author.LoginName }; }), c);
    builderTest('include singleProp', c.Articles.include('Category'), c, false, true);
    builderTest('include deep 1', c.Articles.include('Author.Articles'), c, false, true);
    builderTest('include deep 2', c.Articles.include('Author.Profile'), c, false, true);
    builderTest('include deep 3', c.Articles.include('Author.Articles.Reviewer'), c, false, true);
    builderTest('include multiple 1', c.Articles.include('Category').include('Author'), c, false, true);
    builderTest('include multiple 2 deep', c.Articles.include('Category').include('Author.Articles'), c, false, true);

    selectTest('selectTest map', c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body }; }), c, ['Title', 'Body'], []);
    selectTest('selectTest map', c.Articles.map(function (it) { return { Title: it.Title, Body: it.Body, Author: it.Author }; }), c, ['Title', 'Body', 'Author'], ['Author']);
});