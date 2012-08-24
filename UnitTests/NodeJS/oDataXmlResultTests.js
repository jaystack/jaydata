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
            includes: undefined
        }

        var result = new $data.oDataResult(person, oDataBuidlerCfg, reqPoc);

        test.equal(result.contentType, 'text/xml', 'content type failed');
        var resultData = result.toString();

        var matches = resultData.split('><');
        for (var i = 0; i < matches.length; i++) {
            if (matches[i].slice(0, 8) === 'updated>') {
                matches.splice(i, 1);
            }
        }
        resultData = matches.join('><');
        test.equal(resultData,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            "<entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" d:dataservices=\"JayStrom\" m:metadata=\"OData\">" +
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
            includes: undefined
        }

        var result = new $data.oDataResult(persons, oDataBuidlerCfg, reqPoc);

        test.equal(result.contentType, 'text/xml', 'content type failed');
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
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            "<feed xmlns=\"http://www.w3.org/2005/Atom\" xmlns:d=\"http://schemas.microsoft.com/ado/2007/08/dataservices\" xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" xml:base=\"http://Example.com/testservice/People\" d:dataservices=\"JayStrom\" m:metadata=\"OData\">" +
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
}