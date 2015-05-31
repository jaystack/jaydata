var reqPoc = {
    headers: {}
};

exports.Test = {
    'Entity item': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        var person = new $example.Person({ Id: 'idString', Name: 'Person', Description: 'desc', Age: 10 });

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: true,
            collectionName: 'People',
            selectedFields: undefined,
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(person, oDataBuidlerCfg);

        test.equal(result.contentType, 'application/atom+xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
            }
        }
        resultData = matches.join('><');
        //console.log(resultData);
        test.equal(resultData,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<entry xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                "<id>" +
                    "http://Example.com/testservice/People('idString')" +
                "</id>" +
                "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                "<link href=\"People('idString')\" rel=\"edit\" title=\"Person\"></link>" +
                "<title></title>" +
                "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                "<author>" +
                    "<name></name>" +
                "</author>" +
                "<content type=\"application/xml\">" +
                    "<m:properties>" +
                        "<d:Id>idString</d:Id>" +
                        "<d:Name>Person</d:Name>" +
                        "<d:Description>desc</d:Description>" +
                        "<d:Age m:type=\"Edm.Int32\">10</d:Age>" +
                    "</m:properties>" +
                "</content>" +
            "</entry>", 'entity result failed');

        test.done();
    },
    'Feed Items items': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        var persons = [
            new $example.Person({ Id: 'idString', Name: 'Person', Description: 'desc', Age: 10 }),
            new $example.Person({ Id: 'idString2', Name: 'Person2', Description: 'desc2', Age: 12 })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'People',
            selectedFields: undefined,
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(persons, oDataBuidlerCfg);

        test.equal(result.contentType, 'application/atom+xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
                i--;
            }
        }
        resultData = matches.join('><');
        test.equal(resultData,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/People' +
                '</id>' +
                '<title type="text">People</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="People" rel="self" title="People"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:Name>Person</d:Name>" +
                            "<d:Description>desc</d:Description>" +
                            "<d:Age m:type=\"Edm.Int32\">10</d:Age>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString2')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString2')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString2</d:Id>" +
                            "<d:Name>Person2</d:Name>" +
                            "<d:Description>desc2</d:Description>" +
                            "<d:Age m:type=\"Edm.Int32\">12</d:Age>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>", 'entity result failed');

        test.done();
    },
    'Feed Items items map': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        var persons = [
            new $example.Person({ Id: 'idString', Name: 'Person', Description: 'desc', Age: 10 }),
            new $example.Person({ Id: 'idString2', Name: 'Person2', Description: 'desc2', Age: 12 })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'People',
            selectedFields: ['Id', 'Name'],
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(persons, oDataBuidlerCfg);

        test.equal(result.contentType, 'application/atom+xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
                i--;
            }
        }
        resultData = matches.join('><');
        test.equal(resultData,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/People' +
                '</id>' +
                '<title type="text">People</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="People" rel="self" title="People"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:Name>Person</d:Name>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString2')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString2')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString2</d:Id>" +
                            "<d:Name>Person2</d:Name>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>", 'entity result failed');

        test.done();
    },
    'Feed Items items - LazyLoad Property': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Person.getMemberDefinition('Name').lazyLoad = true;
        var persons = [
            new $example.Person({ Id: 'idString', Name: 'Person', Description: 'desc', Age: 10 }),
            new $example.Person({ Id: 'idString2', Name: 'Person2', Description: 'desc2', Age: 12 })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'People',
            selectedFields: undefined,
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(persons, oDataBuidlerCfg);

        test.equal(result.contentType, 'application/atom+xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
                i--;
            }
        }
        resultData = matches.join('><');
        test.equal(resultData,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/People' +
                '</id>' +
                '<title type="text">People</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="People" rel="self" title="People"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:Description>desc</d:Description>" +
                            "<d:Age m:type=\"Edm.Int32\">10</d:Age>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString2')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString2')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString2</d:Id>" +
                            "<d:Description>desc2</d:Description>" +
                            "<d:Age m:type=\"Edm.Int32\">12</d:Age>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>", 'entity result failed');

        delete $example.Person.getMemberDefinition('Name').lazyLoad;
        test.done();
    },
    'Feed Items items map - LazyLoad Property': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Person.getMemberDefinition('Name').lazyLoad = true;
        var persons = [
            new $example.Person({ Id: 'idString', Name: 'Person', Description: 'desc', Age: 10 }),
            new $example.Person({ Id: 'idString2', Name: 'Person2', Description: 'desc2', Age: 12 })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'People',
            selectedFields: ['Id', 'Name'],
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(persons, oDataBuidlerCfg);

        test.equal(result.contentType, 'application/atom+xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
                i--;
            }
        }
        resultData = matches.join('><');
        test.equal(resultData,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/People' +
                '</id>' +
                '<title type="text">People</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="People" rel="self" title="People"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:Name>Person</d:Name>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString2')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString2')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString2</d:Id>" +
                            "<d:Name>Person2</d:Name>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>", 'entity result failed');

        delete $example.Person.getMemberDefinition('Name').lazyLoad;
        test.done();
    },
    'With null value field': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        var persons = [
            new $example.Person({ Id: 'idString', Name: 'Person', Description: 'desc', Age: 10 }),
            new $example.Person({ Id: 'idString2', Name: null, Description: 'desc2', Age: null })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'People',
            selectedFields: undefined,
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(persons, oDataBuidlerCfg);

        test.equal(result.contentType, 'application/atom+xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
                i--;
            }
        }
        resultData = matches.join('><');
        test.equal(resultData,
            '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/People' +
                '</id>' +
                '<title type="text">People</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="People" rel="self" title="People"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:Name>Person</d:Name>" +
                            "<d:Description>desc</d:Description>" +
                            "<d:Age m:type=\"Edm.Int32\">10</d:Age>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/People('idString2')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.Person\"></category>" +
                    "<link href=\"People('idString2')\" rel=\"edit\" title=\"Person\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString2</d:Id>" +
                            "<d:Name m:null=\"true\"></d:Name>" +
                            "<d:Description>desc2</d:Description>" +
                            "<d:Age m:null=\"true\" m:type=\"Edm.Int32\"></d:Age>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>", 'entity result failed');

        test.done();
    },
    'Feed ComplexEntity': function (test) {
        var context = $example.Context.getContext();
        var items = [
            new $example.ATable({
                Id: 'idString',
                ComplexData: new $example.Complex1({ Field1: 111, Field2: 'hello world2' }),
                ComplexArray: [new $example.Complex2({ Field3: 13, Field4: 'hello world4' }), new $example.Complex2({ Field3: 13, Field4: 'hello world4' })],
                ComplexArrayPrim: ['hello', 'world', 'jaydata'],
                ComplexEntity: new $example.Order({ Value: 5, Completed: true, Data: null }),
                ComplexEntityArray: [new $example.Order({ Value: 6, Completed: true, Data: {} }), new $example.Order({ Value: 7, Completed: true, Data: { a: 5, b: 'prop' } })]
            })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'ATables',
            selectedFields: undefined,
            includes: undefined,
            request: reqPoc
        }

        var result = new $data.oDataResult(items, oDataBuidlerCfg);

        var resultData = result.toString();
        var strResult = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/ATables\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/ATables' +
                '</id>' +
                '<title type="text">ATables</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="ATables" rel="self" title="ATables"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/ATables('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.ATable\"></category>" +
                    "<link href=\"ATables('idString')\" rel=\"edit\" title=\"ATable\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:ComplexData m:type=\"$example.Complex1\">" +
                                "<d:Field1 m:type=\"Edm.Int32\">111</d:Field1>" +
                                "<d:Field2>hello world2</d:Field2>" +
                            "</d:ComplexData>" +
                            "<d:ComplexArray m:type=\"Collection($example.Complex2)\">" +
                                "<m:item type=\"$example.Complex2\">" +
                                    "<d:Field3 m:type=\"Edm.Int32\">13</d:Field3>" +
                                    "<d:Field4>hello world4</d:Field4>" +
                                "</m:item>" +
                                "<m:item type=\"$example.Complex2\">" +
                                    "<d:Field3 m:type=\"Edm.Int32\">13</d:Field3>" +
                                    "<d:Field4>hello world4</d:Field4>" +
                                "</m:item>" +
                            "</d:ComplexArray>" +
                            "<d:ComplexArrayPrim m:type=\"Collection(Edm.String)\">" +
                                "<m:item>hello</m:item>" +
                                "<m:item>world</m:item>" +
                                "<m:item>jaydata</m:item>" +
                            "</d:ComplexArrayPrim>" +
                            "<d:ComplexEntity m:type=\"$example.Order\">" +
                                "<d:Id m:null=\"true\"></d:Id>" +
                                "<d:Value m:type=\"Edm.Int32\">5</d:Value>" +
                                "<d:Date m:null=\"true\" m:type=\"Edm.DateTime\"></d:Date>" +
                                "<d:Completed m:type=\"Edm.Boolean\">true</d:Completed>" +
                                "<d:Data m:null=\"true\" m:type=\"$data.Object\"></d:Data>" +
                            "</d:ComplexEntity>" +
                            "<d:ComplexEntityArray m:type=\"Collection($example.Order)\">" +
                                "<m:inline>" +
                                    "<m:item type=\"$example.Order\">" +
                                        "<d:Id m:null=\"true\"></d:Id>" +
                                        "<d:Value m:type=\"Edm.Int32\">6</d:Value>" +
                                        "<d:Date m:null=\"true\" m:type=\"Edm.DateTime\"></d:Date>" +
                                        "<d:Completed m:type=\"Edm.Boolean\">true</d:Completed>" +
                                        "<d:Data m:type=\"$data.Object\">{}</d:Data>" +
                                    "</m:item>" +
                                    "<m:item type=\"$example.Order\">" +
                                        "<d:Id m:null=\"true\"></d:Id>" +
                                        "<d:Value m:type=\"Edm.Int32\">7</d:Value>" +
                                        "<d:Date m:null=\"true\" m:type=\"Edm.DateTime\"></d:Date>" +
                                        "<d:Completed m:type=\"Edm.Boolean\">true</d:Completed>" +
                                        "<d:Data m:type=\"$data.Object\">{\"a\":5,\"b\":\"prop\"}</d:Data>" +
                                    "</m:item>" +
                                "</m:inline>" +
                            "</d:ComplexEntityArray>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>"


        var matches = resultData.split('><');
        var strMatches = strResult.split('><');
        
        test.expect(matches.length + 2);
        test.equal(result.contentType, 'application/atom+xml', 'content type failed');

        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                var cut = matches.splice(i, 1);
                i--;
            }
            test.equal('<' + matches[i] + '>', '<' + strMatches[i] + '>', 'xml line ' + i + ' result failed');
        }

        resultData = matches.join('><');
        strResult = strMatches.join('><');

        test.equal(resultData, strResult, 'xml result failed');

        test.done();
    },
    'Feed ComplexEntity Pivot': function (test) {
        var context = $example.Context.getContext();
        var items = [
            new $example.ATable({
                Id: 'idString',
                ComplexData: new $example.Complex1({ Field1: 111, Field2: 'hello world2' }),
                ComplexArray: [new $example.Complex2({ Field3: 13, Field4: 'hello world4' }), new $example.Complex2({ Field3: 13, Field4: 'hello world4' })],
                ComplexArrayPrim: ['hello', 'world', 'jaydata'],
                ComplexEntity: new $example.Order({ Value: 5, Completed: true, Data: null }),
                ComplexEntityArray: [new $example.Order({ Value: 6, Completed: true, Data: {} }), new $example.Order({ Value: 7, Completed: true, Data: { a: 5, b: 'prop' } })]
            })
        ]

        var oDataBuidlerCfg = {
            version: 'V2',
            baseUrl: 'http://Example.com/testservice',
            context: context.getType(),
            simpleResult: false,
            singleResult: false,
            collectionName: 'ATables',
            selectedFields: undefined,
            includes: undefined,
            request: {
                headers: {
                    "user-agent": "PowerPivot"
                }
            }
        };

        var result = new $data.oDataResult(items, oDataBuidlerCfg);

        var resultData = result.toString();
        var strResult = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>' +
            "<feed xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/ATables\" xmlns=\"http://www.w3.org/2005/Atom\">" +
                '<id>' +
                    'http://Example.com/testservice/ATables' +
                '</id>' +
                '<title type="text">ATables</title>' +
                '' + //<updated>2012-08-24T13:05:48Z</updated>
                '<link href="ATables" rel="self" title="ATables"></link>' +
                "<entry>" +
                    "<id>" +
                        "http://Example.com/testservice/ATables('idString')" +
                    "</id>" +
                    "<category scheme=\"http://schemas.microsoft.com/ado/2007/08/dataservices/scheme\" term=\"$example.ATable\"></category>" +
                    "<link href=\"ATables('idString')\" rel=\"edit\" title=\"ATable\"></link>" +
                    "<title></title>" +
                    "" + //<updated>2012-08-24T14:03:56.084Z</updated>
                    "<author>" +
                        "<name></name>" +
                    "</author>" +
                    "<content type=\"application/xml\">" +
                        "<m:properties>" +
                            "<d:Id>idString</d:Id>" +
                            "<d:ComplexData m:type=\"$example.Complex1\">" +
                                "<d:Field1 m:type=\"Edm.Int32\">111</d:Field1>" +
                                "<d:Field2>hello world2</d:Field2>" +
                            "</d:ComplexData>" +
                            "<d:ComplexEntity m:type=\"$example.Order\">" +
                                "<d:Id m:null=\"true\"></d:Id>" +
                                "<d:Value m:type=\"Edm.Int32\">5</d:Value>" +
                                "<d:Date m:null=\"true\" m:type=\"Edm.DateTime\"></d:Date>" +
                                "<d:Completed m:type=\"Edm.Boolean\">true</d:Completed>" +
                            "</d:ComplexEntity>" +
                        "</m:properties>" +
                    "</content>" +
                "</entry>" +
            "</feed>"


        var matches = resultData.split('><');
        var strMatches = strResult.split('><');

        test.expect(matches.length + 2);
        test.equal(result.contentType, 'application/atom+xml', 'content type failed');

        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                var cut = matches.splice(i, 1);
                i--;
            }
            test.equal('<' + matches[i] + '>', '<' + strMatches[i] + '>', 'xml line ' + i + ' result failed');
        }

        resultData = matches.join('><');
        strResult = strMatches.join('><');

        test.equal(resultData, strResult, 'xml result failed');

        test.done();
    },
}
