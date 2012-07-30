exports.exists = function (test) {
    test.expect(1);
    test.equal(typeof $data.oDataServer.MetaDataGenerator, 'function', '$data.oDataServer.MetaDataGenerator exists');
    test.done();
};

$data.Class.define('$test.exampleClass1', $data.Entity, null, {
    prop1: { type: 'int' },
    prop2: { type: 'string' },
    prop3: { type: 'date' },
    prop4: { type: 'bool' }
});

$data.Class.define('$test.exampleClass1withKey', $data.Entity, null, {
    prop1: { type: 'int', key: true },
    prop2: { type: 'string' },
    prop3: { type: 'date' },
    prop4: { type: 'bool' }
});

$data.Class.define('$test.complextTypeClass1', $data.Entity, null, {
    complexType1: { type: $test.exampleClass1 },
    complexType2: { type: $test.exampleClass1withKey }
});

exports['functionContext'] = {
    'empty': function (test) {
        test.expect(1);

        function ServiceClass() { };

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'V1': function (test) {
        test.expect(1);

        function ServiceClass() { };

        var generator = new $data.oDataServer.MetaDataGenerator({ version: 'V1' }, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="1.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2006/04/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'V2 - max3': function (test) {
        test.expect(1);

        function ServiceClass() { };

        var generator = new $data.oDataServer.MetaDataGenerator({ version: 'V2', maxVersion: 'V3' }, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="3.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'V3 - max3': function (test) {
        test.expect(1);

        function ServiceClass() { };

        var generator = new $data.oDataServer.MetaDataGenerator({ version: 'V3', maxVersion: 'V3' }, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="3.0" m:MaxDataServiceVersion="3.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2009/11/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - multiple': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod2 = function () { };

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                            '<FunctionImport Name="webMethod2" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - serviceOpName': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.serviceOpName = 'newWebMethodName';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="newWebMethodName" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - string': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'string';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.String" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - int': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'int';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Int32" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - bool': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'bool';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - blob': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'blob';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Binary" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - number': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'number';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Decimal" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - date': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'date';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.DateTime" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - method - GET': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.method = 'GET';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - method - POST': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.method = 'POST';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="POST">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - elementType - string': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'Array';
        ServiceClass.prototype.webMethod.elementType = 'string';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Collection(Edm.String)" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - elementType - int': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'Array';
        ServiceClass.prototype.webMethod.elementType = 'int';

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Collection(Edm.Int32)" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - parameter': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'string';
        ServiceClass.prototype.webMethod.params = [{ name: 'a', type: 'string' }];


        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.String" m:HttpMethod="GET">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - parameters': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () { };
        ServiceClass.prototype.webMethod.returnType = 'string';
        ServiceClass.prototype.webMethod.params = [{ name: 'a', type: 'string' }, { name: 'b', type: $data.Integer }, { name: 'c', type: $data.Date }];


        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.String" m:HttpMethod="GET">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                                '<Parameter Name="b" Type="Edm.Int32"></Parameter>' +
                                '<Parameter Name="c" Type="Edm.DateTime"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - extended': {
        'return object': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = 'object';

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="$data.Object" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return objectArray': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = 'Array';
            ServiceClass.prototype.webMethod.elementType = 'object';

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Collection($data.Object)" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex type': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = $test.exampleClass1;

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="System.exampleClass1" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex type with key': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = $test.exampleClass1withKey;

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="System.exampleClass1withKey" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex type in complexType': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = '$test.complextTypeClass1';

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="complextTypeClass1">' +
                                '<Property Name="complexType1" Type="System.exampleClass1"></Property>' +
                                '<Property Name="complexType2" Type="System.exampleClass1withKey"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="System.complextTypeClass1" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex typeArray': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = 'Array';
            ServiceClass.prototype.webMethod.elementType = $test.exampleClass1;

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Collection(System.exampleClass1)" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'paramType complex type': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = 'bool';
            ServiceClass.prototype.webMethod.params = [{ name: 'a', type: $test.exampleClass1 }];

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                                    '<Parameter Name="a" Type="System.exampleClass1"></Parameter>' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'paramTypes complex type': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = 'bool';
            ServiceClass.prototype.webMethod.params = [{ name: 'a', type: $test.exampleClass1 }, { name: 'b', type: $test.exampleClass1withKey }];

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                                    '<Parameter Name="a" Type="System.exampleClass1"></Parameter>' +
                                    '<Parameter Name="b" Type="System.exampleClass1withKey"></Parameter>' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'paramType complex type in complexType': function (test) {
            test.expect(1);

            function ServiceClass() { };
            ServiceClass.prototype.webMethod = function () { };
            ServiceClass.prototype.webMethod.returnType = 'bool';
            ServiceClass.prototype.webMethod.params = [{ name: 'a', type: $test.complextTypeClass1 }];

            var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                            '<ComplexType Name="complextTypeClass1">' +
                                '<Property Name="complexType1" Type="System.exampleClass1"></Property>' +
                                '<Property Name="complexType2" Type="System.exampleClass1withKey"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                                    '<Parameter Name="a" Type="System.complextTypeClass1"></Parameter>' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        }
    },
    'FunctionImport - data from VSdoc': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () {
            ///<serviceMethod name="webMethodName" />
            ///<returns type="Array" elementType="string" />
            ///<method type="POST" />
            ///<param name="a" type="string" />
            ///<param name="b" type="int" />
            ///<param name="c" type="$test.exampleClass1" />
            ///<responseType type="application/xml" />
        };

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<ComplexType Name="exampleClass1">' +
                            '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                            '<Property Name="prop2" Type="Edm.String"></Property>' +
                            '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                            '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                        '</ComplexType>' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethodName" ReturnType="Collection(Edm.String)" m:HttpMethod="POST">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                                '<Parameter Name="b" Type="Edm.Int32"></Parameter>' +
                                '<Parameter Name="c" Type="System.exampleClass1"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - data from VSdoc returns error': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () {
            ///<serviceMethod name="webMethodName" />
            ///<returns type="int" elementType="string" />
            ///<method type="POST" />
            ///<param name="a" type="string" />
            ///<param name="b" type="int" />
            ///<param name="c" type="$test.exampleClass1" />
            ///<responseType type="application/xml" />
        };

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<ComplexType Name="exampleClass1">' +
                            '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                            '<Property Name="prop2" Type="Edm.String"></Property>' +
                            '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                            '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                        '</ComplexType>' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethodName" ReturnType="Edm.Int32" m:HttpMethod="POST">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                                '<Parameter Name="b" Type="Edm.Int32"></Parameter>' +
                                '<Parameter Name="c" Type="System.exampleClass1"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - data from VSdoc returns error 2': function (test) {
        test.expect(1);

        function ServiceClass() { };
        ServiceClass.prototype.webMethod = function () {
            ///<serviceMethod name="webMethodName" />
            ///<returns elementType="string" />
            ///<method type="POST" />
            ///<param name="a" type="string" />
            ///<param name="b" type="int" />
            ///<param name="c" type="$test.exampleClass1" />
            ///<responseType type="application/xml" />
        };

        var generator = new $data.oDataServer.MetaDataGenerator({}, ServiceClass);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="System">' +
                        '<ComplexType Name="exampleClass1">' +
                            '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                            '<Property Name="prop2" Type="Edm.String"></Property>' +
                            '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                            '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                        '</ComplexType>' +
                        '<EntityContainer Name="ServiceClass" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethodName" m:HttpMethod="POST">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                                '<Parameter Name="b" Type="Edm.Int32"></Parameter>' +
                                '<Parameter Name="c" Type="System.exampleClass1"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    }
};

exports['entityContext'] = {
    'empty': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextEmpty', $data.EntityContext, null, {});

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextEmpty);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextEmpty" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'namespace': function (test) {
        test.expect(1);

        $data.Class.define('$test.long.namespace.contextNameSpace', $data.EntityContext, null, {});

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.long.namespace.contextNameSpace);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test.long.namespace">' +
                        '<EntityContainer Name="contextNameSpace" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'V1': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextV1', $data.EntityContext, null, {});

        var generator = new $data.oDataServer.MetaDataGenerator({ version: 'V1' }, $test.contextV1);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="1.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2006/04/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextV1" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'V2 - max3': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextV2', $data.EntityContext, null, {});

        var generator = new $data.oDataServer.MetaDataGenerator({ version: 'V2', maxVersion: 'V3' }, $test.contextV2);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="3.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextV2" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'V3 - max3': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextV3', $data.EntityContext, null, {});

        var generator = new $data.oDataServer.MetaDataGenerator({ version: 'V3', maxVersion: 'V3' }, $test.contextV3);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="3.0" m:MaxDataServiceVersion="3.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2009/11/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextV3" m:IsDefaultEntityContainer="true">' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFI', $data.EntityContext, null, {
            webMethod: function () { }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFI);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFI" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - multiple': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIMultiple', $data.EntityContext, null, {
            webMethod: function () { },
            webMethod2: function () { }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIMultiple);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIMultiple" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                            '<FunctionImport Name="webMethod2" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - serviceOpName': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIserviceOpName', $data.EntityContext, null, {
            webMethod: function () {
                ///<serviceMethod name="newWebMethodName" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIserviceOpName);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIserviceOpName" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="newWebMethodName" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - string': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIreturnsString', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="string" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnsString);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIreturnsString" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.String" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - int': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIreturnsInt', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="int" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnsInt);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIreturnsInt" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Int32" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - bool': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIreturnBool', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="bool" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnBool);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIreturnBool" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - blob': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIreturnBlob', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="blob" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnBlob);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIreturnBlob" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Binary" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - number': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIreturnNumber', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="number" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnNumber);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIreturnNumber" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.Decimal" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - returnType - date': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIreturnDate', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="date" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnDate);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIreturnDate" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.DateTime" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - method - GET': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFImethodGET', $data.EntityContext, null, {
            webMethod: function () {
                ///<method type="GET" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFImethodGET);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFImethodGET" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - method - POST': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFImethodPOST', $data.EntityContext, null, {
            webMethod: function () {
                ///<method type="POST" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFImethodPOST);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFImethodPOST" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" m:HttpMethod="POST">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - elementType - string': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIelementTypeString', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="Array" elementType="string"/>
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIelementTypeString);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIelementTypeString" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Collection(Edm.String)" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - elementType - int': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIelementTypeInt', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="Array" elementType="int"/>
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIelementTypeInt);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIelementTypeInt" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Collection(Edm.Int32)" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - parameter': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIparameter', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="string"/>
                ///<param name="a" type="string" />
            }
        });


        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIparameter);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIparameter" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.String" m:HttpMethod="GET">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - parameters': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIparameters', $data.EntityContext, null, {
            webMethod: function () {
                ///<returns type="string"/>
                ///<param name="a" type="string" />
                ///<param name="b" type="$data.Integer" />
                ///<param name="c" type="$data.Date" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIparameters);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityContainer Name="contextFIparameters" m:IsDefaultEntityContainer="true">' +
                            '<FunctionImport Name="webMethod" ReturnType="Edm.String" m:HttpMethod="GET">' +
                                '<Parameter Name="a" Type="Edm.String"></Parameter>' +
                                '<Parameter Name="b" Type="Edm.Int32"></Parameter>' +
                                '<Parameter Name="c" Type="Edm.DateTime"></Parameter>' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - extended': {
        'return object': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIreturnObject', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="object"/>
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnObject);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<EntityContainer Name="contextFIreturnObject" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="$data.Object" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return objectArray': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIreturnObjectArray', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="Array" elementType="object"/>
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnObjectArray);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<EntityContainer Name="contextFIreturnObjectArray" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Collection($data.Object)" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex type': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIreturnComplexType', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="$test.exampleClass1"/>
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnComplexType);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIreturnComplexType" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="$test.exampleClass1" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex type with key': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIreturnComplexTypeWithKey', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="$test.exampleClass1withKey"/>
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnComplexTypeWithKey);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIreturnComplexTypeWithKey" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="$test.exampleClass1withKey" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex type in complexType': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIreturnComplexTypeInComplexType', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="$test.complextTypeClass1"/>
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnComplexTypeInComplexType);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="complextTypeClass1">' +
                                '<Property Name="complexType1" Type="$test.exampleClass1"></Property>' +
                                '<Property Name="complexType2" Type="$test.exampleClass1withKey"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIreturnComplexTypeInComplexType" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="$test.complextTypeClass1" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'return complex typeArray': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIreturnComplexTypeArray', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="Array" elementType="$test.exampleClass1"/>
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIreturnComplexTypeArray);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIreturnComplexTypeArray" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Collection($test.exampleClass1)" m:HttpMethod="GET">' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'paramType complex type': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIparamTypeComplexType', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="bool" />
                    ///<param name="a" type="$test.exampleClass1" />
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIparamTypeComplexType);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIparamTypeComplexType" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                                    '<Parameter Name="a" Type="$test.exampleClass1"></Parameter>' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'paramTypes complex type': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIparamTypesComplexType', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="bool" />
                    ///<param name="a" type="$test.exampleClass1" />
                    ///<param name="b" type="$test.exampleClass1withKey" />
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIparamTypesComplexType);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIparamTypesComplexType" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                                    '<Parameter Name="a" Type="$test.exampleClass1"></Parameter>' +
                                    '<Parameter Name="b" Type="$test.exampleClass1withKey"></Parameter>' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        },
        'paramType complex type in complexType': function (test) {
            test.expect(1);

            $data.Class.define('$test.contextFIparamTypeComplexTypeInComplexType', $data.EntityContext, null, {
                webMethod: function () {
                    ///<returns type="bool" />
                    ///<param name="a" type="$test.complextTypeClass1" />
                }
            });

            var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIparamTypeComplexTypeInComplexType);
            var xmlStr = generator.generateMetadataXml();

            test.equal(xmlStr,
                '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
                '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                    '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                        '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                            '<ComplexType Name="complextTypeClass1">' +
                                '<Property Name="complexType1" Type="$test.exampleClass1"></Property>' +
                                '<Property Name="complexType2" Type="$test.exampleClass1withKey"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<ComplexType Name="exampleClass1withKey">' +
                                '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                                '<Property Name="prop2" Type="Edm.String"></Property>' +
                                '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                                '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                            '</ComplexType>' +
                            '<EntityContainer Name="contextFIparamTypeComplexTypeInComplexType" m:IsDefaultEntityContainer="true">' +
                                '<FunctionImport Name="webMethod" ReturnType="Edm.Boolean" m:HttpMethod="GET">' +
                                    '<Parameter Name="a" Type="$test.complextTypeClass1"></Parameter>' +
                                '</FunctionImport>' +
                            '</EntityContainer>' +
                        '</Schema>' +
                    '</edmx:DataServices>' +
                '</edmx:Edmx>', 'Metadata string error');

            test.done();
        }
    },
    'EntitySet': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextES', $data.EntityContext, null, {
            Es1: { type: $data.EntitySet, elementType: $test.exampleClass1withKey }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextES);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClass1withKey">' +
                            '<Key>' +
                                '<PropertyRef Name="prop1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                            '<Property Name="prop2" Type="Edm.String"></Property>' +
                            '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                            '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextES" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClass1withKey" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet multiple': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESMultiple', $data.EntityContext, null, {
            Es1: { type: $data.EntitySet, elementType: $test.exampleClass1withKey },
            Es2: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClass2', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    p2: { type: 'string' },
                    p3: { type: 'number' }
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESMultiple);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClass1withKey">' +
                            '<Key>' +
                                '<PropertyRef Name="prop1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                            '<Property Name="prop2" Type="Edm.String"></Property>' +
                            '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                            '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                        '</EntityType>' +
                        '<EntityType Name="exampleClass2">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<Property Name="p2" Type="Edm.String"></Property>' +
                            '<Property Name="p3" Type="Edm.Decimal"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESMultiple" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClass1withKey" Name="Es1"></EntitySet>' +
                            '<EntitySet EntityType="$test.exampleClass2" Name="Es2"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet - properties - required': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESpropsReq', $data.EntityContext, null, {
            Es1: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClassReq', $data.Entity, null, {
                    p1: { type: 'int', key: true, required: true },
                    p2: { type: 'string', required: true },
                    p3: { type: 'number', required: true }
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESpropsReq);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClassReq">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Nullable="false" Type="Edm.Int32"></Property>' +
                            '<Property Name="p2" Nullable="false" Type="Edm.String"></Property>' +
                            '<Property Name="p3" Nullable="false" Type="Edm.Decimal"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESpropsReq" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClassReq" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet - properties - computed': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESpropsComp', $data.EntityContext, null, {
            Es1: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClassComp', $data.Entity, null, {
                    p1: { type: 'int', key: true, computed: true },
                    p2: { type: 'string' },
                    p3: { type: 'number', computed: true }
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESpropsComp);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClassComp">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" Name="p1" Type="Edm.Int32" p6:StoreGeneratedPattern="Identity"></Property>' +
                            '<Property Name="p2" Type="Edm.String"></Property>' +
                            '<Property xmlns:p6="http://schemas.microsoft.com/ado/2009/02/edm/annotation" Name="p3" Type="Edm.Decimal" p6:StoreGeneratedPattern="Computed"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESpropsComp" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClassComp" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet - properties - nullable': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESpropsNullable', $data.EntityContext, null, {
            Es1: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClassNullable', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    p2: { type: 'string', nullable: false },
                    p3: { type: 'number', nullable: true },
                    p4: { type: 'number', nullable: false, required: false }, // => nullable
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESpropsNullable);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClassNullable">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<Property Name="p2" Nullable="false" Type="Edm.String"></Property>' +
                            '<Property Name="p3" Nullable="true" Type="Edm.Decimal"></Property>' +
                            '<Property Name="p4" Nullable="true" Type="Edm.Decimal"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESpropsNullable" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClassNullable" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet - properties - maxLength': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESpropsMax', $data.EntityContext, null, {
            Es1: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClassMax', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    p2: { type: 'string', maxLength: 50 },
                    p3: { type: 'string', maxLength: Number.POSITIVE_INFINITY }
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESpropsMax);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClassMax">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<Property MaxLength="50" Name="p2" Type="Edm.String"></Property>' +
                            '<Property MaxLength="MAX" Name="p3" Type="Edm.String"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESpropsMax" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClassMax" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet - properties - concurrencyMode': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESpropsConc', $data.EntityContext, null, {
            Es1: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClassConc', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    p2: { type: 'string', maxLength: 50 },
                    p3: { type: 'string', maxLength: Number.POSITIVE_INFINITY },
                    RowVersion: { type: 'blob', maxLength: 8, concurrencyMode: $data.ConcurrencyMode.Fixed },
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESpropsConc);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClassConc">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<Property MaxLength="50" Name="p2" Type="Edm.String"></Property>' +
                            '<Property MaxLength="MAX" Name="p3" Type="Edm.String"></Property>' +
                            '<Property ConcurrencyMode="Fixed" MaxLength="8" Name="RowVersion" Type="Edm.Binary"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESpropsConc" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClassConc" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'EntitySet - properties - edmCustomProps': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextESpropsCustom', $data.EntityContext, null, {
            Es1: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleClassCustom', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    p2: { type: 'string', maxLength: 50, edmx_FixedLength: true, edmx_Unicode: false, edmx_Precision: true, edmx_Scale: false },
                    p3: { type: 'string', maxLength: Number.POSITIVE_INFINITY, edmx_FixedLength: false, edmx_Unicode: false, edmx_Precision: false, edmx_Scale: false },
                    p4: { type: 'string', maxLength: 8, edmx_FixedLength: true, edmx_Unicode: true, edmx_Precision: true, edmx_Scale: true },
                })
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextESpropsCustom);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClassCustom">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<Property FixedLength="true" MaxLength="50" Name="p2" Precision="true" Scale="false" Type="Edm.String" Unicode="false"></Property>' +
                            '<Property FixedLength="false" MaxLength="MAX" Name="p3" Precision="false" Scale="false" Type="Edm.String" Unicode="false"></Property>' +
                            '<Property FixedLength="true" MaxLength="8" Name="p4" Precision="true" Scale="true" Type="Edm.String" Unicode="true"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextESpropsCustom" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClassCustom" Name="Es1"></EntitySet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'FunctionImport - From EntitySet': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextFIES', $data.EntityContext, null, {
            Es1: { type: $data.EntitySet, elementType: $test.exampleClass1withKey },
            webMethod: function () {
                ///<returns type="$test.exampleClass1withKey" />
            },
            webMethod2: function () {
                ///<returns type="$data.Queryable" elementType="$test.exampleClass1withKey" />
            }
        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextFIES);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleClass1withKey">' +
                            '<Key>' +
                                '<PropertyRef Name="prop1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="prop1" Type="Edm.Int32"></Property>' +
                            '<Property Name="prop2" Type="Edm.String"></Property>' +
                            '<Property Name="prop3" Type="Edm.DateTime"></Property>' +
                            '<Property Name="prop4" Type="Edm.Boolean"></Property>' +
                        '</EntityType>' +
                        '<EntityContainer Name="contextFIES" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleClass1withKey" Name="Es1"></EntitySet>' +
                            '<FunctionImport EntitySet="Es1" Name="webMethod" ReturnType="$test.exampleClass1withKey" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                            '<FunctionImport EntitySet="Es1" Name="webMethod2" ReturnType="Collection($test.exampleClass1withKey)" m:HttpMethod="GET">' +
                            '</FunctionImport>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'Association 0..1-*': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextAssoc', $data.EntityContext, null, {
            ASet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES1', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    ASetItem: { type: '$test.exampleES2', inverseProperty: 'BSetItem' }
                })
            },
            BSet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES2', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    BSetItem: { type: 'Array', elementType: '$test.exampleES1', inverseProperty: 'ASetItem' }
                })
            }

        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextAssoc);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleES1">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES2_BSetItem_Target" Name="ASetItem" Relationship="$test.exampleES2_BSetItem" ToRole="exampleES2_BSetItem_Source"></NavigationProperty>' +
                        '</EntityType>' +
                        '<EntityType Name="exampleES2">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES2_BSetItem_Source" Name="BSetItem" Relationship="$test.exampleES2_BSetItem" ToRole="exampleES2_BSetItem_Target"></NavigationProperty>' +
                        '</EntityType>' +
                        '<Association Name="exampleES2_BSetItem">' +
                            '<End Multiplicity="0..1" Role="exampleES2_BSetItem_Source" Type="$test.exampleES2"></End>' +
                            '<End Multiplicity="*" Role="exampleES2_BSetItem_Target" Type="$test.exampleES1"></End>' +
                        '</Association>' +
                        '<EntityContainer Name="contextAssoc" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleES1" Name="ASet"></EntitySet>' +
                            '<EntitySet EntityType="$test.exampleES2" Name="BSet"></EntitySet>' +
                            '<AssociationSet Association="$test.exampleES2_BSetItem" Name="exampleES2_BSetItem">' +
                                '<End EntitySet="BSet" Role="exampleES2_BSetItem_Source"></End>' +
                                '<End EntitySet="ASet" Role="exampleES2_BSetItem_Target"></End>' +
                            '</AssociationSet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'Association 1-*': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextAssoc2', $data.EntityContext, null, {
            ASet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES10', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    ASetItem: { type: '$test.exampleES20', inverseProperty: 'BSetItem', required: true }
                })
            },
            BSet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES20', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    BSetItem: { type: 'Array', elementType: '$test.exampleES10', inverseProperty: 'ASetItem' }
                })
            }

        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextAssoc2);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleES10">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES20_BSetItem_Target" Name="ASetItem" Relationship="$test.exampleES20_BSetItem" ToRole="exampleES20_BSetItem_Source"></NavigationProperty>' +
                        '</EntityType>' +
                        '<EntityType Name="exampleES20">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES20_BSetItem_Source" Name="BSetItem" Relationship="$test.exampleES20_BSetItem" ToRole="exampleES20_BSetItem_Target"></NavigationProperty>' +
                        '</EntityType>' +
                        '<Association Name="exampleES20_BSetItem">' +
                            '<End Multiplicity="1" Role="exampleES20_BSetItem_Source" Type="$test.exampleES20"></End>' +
                            '<End Multiplicity="*" Role="exampleES20_BSetItem_Target" Type="$test.exampleES10"></End>' +
                        '</Association>' +
                        '<EntityContainer Name="contextAssoc2" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleES10" Name="ASet"></EntitySet>' +
                            '<EntitySet EntityType="$test.exampleES20" Name="BSet"></EntitySet>' +
                            '<AssociationSet Association="$test.exampleES20_BSetItem" Name="exampleES20_BSetItem">' +
                                '<End EntitySet="BSet" Role="exampleES20_BSetItem_Source"></End>' +
                                '<End EntitySet="ASet" Role="exampleES20_BSetItem_Target"></End>' +
                            '</AssociationSet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'Association 1-0..1': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextAssoc3', $data.EntityContext, null, {
            ASet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES100', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    ASetItem: { type: '$test.exampleES200', inverseProperty: 'BSetItem', required: true }
                })
            },
            BSet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES200', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    BSetItem: { type: '$test.exampleES100', inverseProperty: 'ASetItem' }
                })
            }

        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextAssoc3);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleES100">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES200_BSetItem_Target" Name="ASetItem" Relationship="$test.exampleES200_BSetItem" ToRole="exampleES200_BSetItem_Source"></NavigationProperty>' +
                        '</EntityType>' +
                        '<EntityType Name="exampleES200">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES200_BSetItem_Source" Name="BSetItem" Relationship="$test.exampleES200_BSetItem" ToRole="exampleES200_BSetItem_Target"></NavigationProperty>' +
                        '</EntityType>' +
                        '<Association Name="exampleES200_BSetItem">' +
                            '<End Multiplicity="1" Role="exampleES200_BSetItem_Source" Type="$test.exampleES200"></End>' +
                            '<End Multiplicity="0..1" Role="exampleES200_BSetItem_Target" Type="$test.exampleES100"></End>' +
                        '</Association>' +
                        '<EntityContainer Name="contextAssoc3" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleES100" Name="ASet"></EntitySet>' +
                            '<EntitySet EntityType="$test.exampleES200" Name="BSet"></EntitySet>' +
                            '<AssociationSet Association="$test.exampleES200_BSetItem" Name="exampleES200_BSetItem">' +
                                '<End EntitySet="BSet" Role="exampleES200_BSetItem_Source"></End>' +
                                '<End EntitySet="ASet" Role="exampleES200_BSetItem_Target"></End>' +
                            '</AssociationSet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'Association 1-* $$unbound': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextAssoc4', $data.EntityContext, null, {
            ASet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES1000', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                })
            },
            BSet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES2000', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    BSetItem: { type: 'Array', elementType: '$test.exampleES1000', inverseProperty: '$$unbound' }
                })
            }

        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextAssoc4);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleES1000">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                        '</EntityType>' +
                        '<EntityType Name="exampleES2000">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES2000_BSetItem_Target" Name="BSetItem" Relationship="$test.exampleES2000_BSetItem" ToRole="exampleES2000_BSetItem_Source"></NavigationProperty>' +
                        '</EntityType>' +
                        '<Association Name="exampleES2000_BSetItem">' +
                            '<End Multiplicity="*" Role="exampleES2000_BSetItem_Source" Type="$test.exampleES1000"></End>' +
                            '<End Multiplicity="0..1" Role="exampleES2000_BSetItem_Target" Type="$test.exampleES2000"></End>' +
                        '</Association>' +
                        '<EntityContainer Name="contextAssoc4" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleES1000" Name="ASet"></EntitySet>' +
                            '<EntitySet EntityType="$test.exampleES2000" Name="BSet"></EntitySet>' +
                            '<AssociationSet Association="$test.exampleES2000_BSetItem" Name="exampleES2000_BSetItem">' +
                                '<End EntitySet="ASet" Role="exampleES2000_BSetItem_Source"></End>' +
                                '<End EntitySet="BSet" Role="exampleES2000_BSetItem_Target"></End>' +
                            '</AssociationSet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    },
    'Association 1-0..1 $$unbound': function (test) {
        test.expect(1);

        $data.Class.define('$test.contextAssoc5', $data.EntityContext, null, {
            ASet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES10000', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                })
            },
            BSet: {
                type: $data.EntitySet, elementType: $data.Class.define('$test.exampleES20000', $data.Entity, null, {
                    p1: { type: 'int', key: true },
                    BSetItem: { type: '$test.exampleES10000', inverseProperty: '$$unbound' }
                })
            }

        });

        var generator = new $data.oDataServer.MetaDataGenerator({}, $test.contextAssoc5);
        var xmlStr = generator.generateMetadataXml();

        test.equal(xmlStr,
            '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>' +
            '<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx" Version="1.0">' +
                '<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0" m:MaxDataServiceVersion="2.0">' +
                    '<Schema xmlns="http://schemas.microsoft.com/ado/2008/09/edm" Namespace="$test">' +
                        '<EntityType Name="exampleES10000">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                        '</EntityType>' +
                        '<EntityType Name="exampleES20000">' +
                            '<Key>' +
                                '<PropertyRef Name="p1"></PropertyRef>' +
                            '</Key>' +
                            '<Property Name="p1" Type="Edm.Int32"></Property>' +
                            '<NavigationProperty FromRole="exampleES20000_BSetItem_Target" Name="BSetItem" Relationship="$test.exampleES20000_BSetItem" ToRole="exampleES20000_BSetItem_Source"></NavigationProperty>' +
                        '</EntityType>' +
                        '<Association Name="exampleES20000_BSetItem">' +
                            '<End Multiplicity="0..1" Role="exampleES20000_BSetItem_Source" Type="$test.exampleES10000"></End>' +
                            '<End Multiplicity="*" Role="exampleES20000_BSetItem_Target" Type="$test.exampleES20000"></End>' +
                        '</Association>' +
                        '<EntityContainer Name="contextAssoc5" m:IsDefaultEntityContainer="true">' +
                            '<EntitySet EntityType="$test.exampleES10000" Name="ASet"></EntitySet>' +
                            '<EntitySet EntityType="$test.exampleES20000" Name="BSet"></EntitySet>' +
                            '<AssociationSet Association="$test.exampleES20000_BSetItem" Name="exampleES20000_BSetItem">' +
                                '<End EntitySet="ASet" Role="exampleES20000_BSetItem_Source"></End>' +
                                '<End EntitySet="BSet" Role="exampleES20000_BSetItem_Target"></End>' +
                            '</AssociationSet>' +
                        '</EntityContainer>' +
                    '</Schema>' +
                '</edmx:DataServices>' +
            '</edmx:Edmx>', 'Metadata string error');

        test.done();
    }
    //associations
};

exports.annotateFromVSDoc = function (test) {
    test.expect(5);

    function ServiceClass() { };
    ServiceClass.prototype.webMethod = function () {
        ///<serviceMethod name="webMethodName" />
        ///<returns type="Array" elementType="string" />
        ///<method type="POST" />
        ///<param name="a" type="string" />
        ///<param name="b" type="int" />
        ///<param name="c" type="$test.exampleClass1" />
        ///<responseType type="application/xml" />
    };

    ServiceClass.annotateFromVSDoc();

    test.equal(ServiceClass.prototype.webMethod.returnType, 'Array', 'returns read failed');
    test.equal(ServiceClass.prototype.webMethod.elementType, 'string', 'elementType read failed');
    test.equal(ServiceClass.prototype.webMethod.method, 'POST', 'method read failed');
    test.equal(ServiceClass.prototype.webMethod.responseType, 'application/xml', 'responseType read failed');
    test.deepEqual(ServiceClass.prototype.webMethod.params, [
        { name: 'a', type: 'string' },
        { name: 'b', type: 'int' },
        { name: 'c', type: '$test.exampleClass1' }
    ], 'params read failed');

    test.done();
};