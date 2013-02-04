(function ($data) {

    function Edm_Boolean() { };
    $data.Container.registerType('Edm.Boolean', Edm_Boolean);
    $data.Container.mapType(Edm_Boolean, $data.Boolean);

    function Edm_Binary() { };
    $data.Container.registerType('Edm.Binary', Edm_Binary);
    $data.Container.mapType(Edm_Binary, $data.Blob);

    function Edm_DateTime() { };
    $data.Container.registerType('Edm.DateTime', Edm_DateTime);
    $data.Container.mapType(Edm_DateTime, $data.Date);

    function Edm_DateTimeOffset() { };
    $data.Container.registerType('Edm.DateTimeOffset', Edm_DateTimeOffset);
    $data.Container.mapType(Edm_DateTimeOffset, $data.Integer);

    function Edm_Time() { };
    $data.Container.registerType('Edm.Time', Edm_Time);
    $data.Container.mapType(Edm_Time, $data.Integer);

    function Edm_Decimal() { };
    $data.Container.registerType('Edm.Decimal', Edm_Decimal);
    $data.Container.mapType(Edm_Decimal, $data.String);

    function Edm_Single() { };
    $data.Container.registerType('Edm.Single', Edm_Single);
    $data.Container.mapType(Edm_Single, $data.Number);

    function Edm_Double() { };
    $data.Container.registerType('Edm.Double', Edm_Double);
    $data.Container.mapType(Edm_Double, $data.Number);

    function Edm_Guid() { };
    $data.Container.registerType('Edm.Guid', Edm_Guid);
    $data.Container.mapType(Edm_Guid, $data.Guid);

    function Edm_Int16() { };
    $data.Container.registerType('Edm.Int16', Edm_Int16);
    $data.Container.mapType(Edm_Int16, $data.Integer);

    function Edm_Int32() { };
    $data.Container.registerType('Edm.Int32', Edm_Int32);
    $data.Container.mapType(Edm_Int32, $data.Integer);

    function Edm_Int64() { };
    $data.Container.registerType('Edm.Int64', Edm_Int64);
    $data.Container.mapType(Edm_Int64, $data.Integer);

    function Edm_Byte() { };
    $data.Container.registerType('Edm.Byte', Edm_Byte);
    $data.Container.mapType(Edm_Byte, $data.Integer);

    function Edm_String() { };
    $data.Container.registerType('Edm.String', Edm_String);
    $data.Container.mapType(Edm_String, $data.String);

    function Edm_GeographyPoint() { };
    $data.Container.registerType('Edm.GeographyPoint', Edm_GeographyPoint);
    $data.Container.mapType(Edm_GeographyPoint, $data.GeographyPoint);

    function Edm_GeographyLineString() { };
    $data.Container.registerType('Edm.GeographyLineString', Edm_GeographyLineString);
    $data.Container.mapType(Edm_GeographyLineString, $data.GeographyLineString);

    function Edm_GeographyPolygon() { };
    $data.Container.registerType('Edm.GeographyPolygon', Edm_GeographyPolygon);
    $data.Container.mapType(Edm_GeographyPolygon, $data.GeographyPolygon);

    function Edm_GeographyMultiPoint() { };
    $data.Container.registerType('Edm.GeographyMultiPoint', Edm_GeographyMultiPoint);
    $data.Container.mapType(Edm_GeographyMultiPoint, $data.GeographyMultiPoint);

    function Edm_GeographyMultiLineString() { };
    $data.Container.registerType('Edm.GeographyMultiLineString', Edm_GeographyMultiLineString);
    $data.Container.mapType(Edm_GeographyMultiLineString, $data.GeographyMultiLineString);

    function Edm_GeographyMultiPolygon() { };
    $data.Container.registerType('Edm.GeographyMultiPolygon', Edm_GeographyMultiPolygon);
    $data.Container.mapType(Edm_GeographyMultiPolygon, $data.GeographyMultiPolygon);

    function Edm_GeographyCollection() { };
    $data.Container.registerType('Edm.GeographyCollection', Edm_GeographyCollection);
    $data.Container.mapType(Edm_GeographyCollection, $data.GeographyCollection);

    function Edm_GeometryPoint() { };
    $data.Container.registerType('Edm.GeometryPoint', Edm_GeometryPoint);
    $data.Container.mapType(Edm_GeometryPoint, $data.GeometryPoint);

    function Edm_GeometryLineString() { };
    $data.Container.registerType('Edm.GeometryLineString', Edm_GeometryLineString);
    $data.Container.mapType(Edm_GeometryLineString, $data.GeometryLineString);

    function Edm_GeometryPolygon() { };
    $data.Container.registerType('Edm.GeometryPolygon', Edm_GeometryPolygon);
    $data.Container.mapType(Edm_GeometryPolygon, $data.GeometryPolygon);

    function Edm_GeometryMultiPoint() { };
    $data.Container.registerType('Edm.GeometryMultiPoint', Edm_GeometryMultiPoint);
    $data.Container.mapType(Edm_GeometryMultiPoint, $data.GeometryMultiPoint);

    function Edm_GeometryMultiLineString() { };
    $data.Container.registerType('Edm.GeometryMultiLineString', Edm_GeometryMultiLineString);
    $data.Container.mapType(Edm_GeometryMultiLineString, $data.GeometryMultiLineString);

    function Edm_GeometryMultiPolygon() { };
    $data.Container.registerType('Edm.GeometryMultiPolygon', Edm_GeometryMultiPolygon);
    $data.Container.mapType(Edm_GeometryMultiPolygon, $data.GeometryMultiPolygon);

    function Edm_GeometryCollection() { };
    $data.Container.registerType('Edm.GeometryCollection', Edm_GeometryCollection);
    $data.Container.mapType(Edm_GeometryCollection, $data.GeometryCollection);

})($data);