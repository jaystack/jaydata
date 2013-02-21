/* $data.Geometry */
$data.Geometry = function Geometry() {
    $data.Geospatial.apply(this, arguments);
};

$data.Geometry.parseFromString = function (strData) {
    var lparenIdx = strData.indexOf('(');
    if (lparenIdx >= 0) {
        var name = strData.substring(0, lparenIdx).toLowerCase();
        var type = $data.Geometry.registered[name];

        if (type && type.parseFromString && type != $data.Geometry) {
            return type.parseFromString(strData);
        } else {
            Guard.raise(new Exception('parseFromString', 'Not Implemented', strData));
        }
    }
};
$data.Geometry.stringifyToUrl = function (geoData) {
    if (geoData instanceof $data.Geometry && geoData.constructor && geoData.constructor.stringifyToUrl) {
        return geoData.constructor.stringifyToUrl(geoData);
    } else if (geoData instanceof $data.Geometry && geoData.constructor && Array.isArray(geoData.constructor.validMembers) && geoData.constructor.validMembers.length === 1 && geoData.constructor.validMembers[0] === 'coordinates') {
        var data = "geometry'" + geoData.type.toUpperCase() + '(';
        function buildArray(d, context) {
            if (Array.isArray(d[0])) {

                for (var i = 0; i < d.length; i++) {
                    if (i > 0) data += ',';
                    if (Array.isArray(d[i][0]))
                        data += '(';

                    buildArray(d[i]);

                    if (Array.isArray(d[i][0]))
                        data += ')';
                }

            } else {
                data += d.join(' ');
            }
        }
        buildArray(geoData.coordinates, data);

        data += ")'";
        return data;
    } else {
        Guard.raise(new Exception('stringifyToUrl on instance type', 'Not Implemented', geoData));
    }
};
$data.Geometry.registerType = function (name, type, base) {
    $data.SimpleBase.registerType(name, type, base || $data.Geometry);

    $data.Geometry.registered = $data.Geometry.registered || {};
    $data.Geometry.registered[name.toLowerCase()] = type;
};
$data.SimpleBase.registerType('Geometry', $data.Geometry, $data.Geospatial);
$data.Container.registerType(['$data.Geometry'], $data.Geometry);

/* $data.GeometryPoint */
$data.GeometryPoint = function GeometryPoint(lon, lat) {
    if (lon && typeof lon === 'object' && Array.isArray(lon)) {
        $data.Geometry.call(this, { coordinates: lon });
    } else if (lon && typeof lon === 'object') {
        $data.Geometry.call(this, lon);
    } else {
        $data.Geometry.call(this, { coordinates: [lon || 0, lat || 0] });
    }
};
$data.GeometryPoint.parseFromString = function (strData) {
    var data = strData.substring(strData.indexOf('(') + 1, strData.lastIndexOf(')'));
    var values = data.split(' ');

    return new $data.GeometryPoint(parseFloat(values[0]), parseFloat(values[1]));
};
$data.GeometryPoint.validMembers = ['coordinates'];
$data.Geometry.registerType('Point', $data.GeometryPoint);
Object.defineProperty($data.GeometryPoint.prototype, 'x', { get: function () { return this.coordinates[0]; }, set: function (v) { this.coordinates[0] = v; } });
Object.defineProperty($data.GeometryPoint.prototype, 'y', { get: function () { return this.coordinates[1]; }, set: function (v) { this.coordinates[1] = v; } });
$data.Container.registerType(['$data.GeometryPoint', 'GeometryPoint'], $data.GeometryPoint);

/* $data.GeometryLineString */
$data.GeometryLineString = function GeometryLineString(data) {
    if (Array.isArray(data)) {
        $data.Geometry.call(this, { coordinates: data });
    } else {
        $data.Geometry.call(this, data);
    }
};
$data.GeometryLineString.validMembers = ['coordinates'];
$data.Geometry.registerType('LineString', $data.GeometryLineString);
$data.Container.registerType(['$data.GeometryLineString', 'GeometryLineString'], $data.GeometryLineString);

/* $data.GeometryPolygon */
$data.GeometryPolygon = function GeometryPolygon(data) {
    if (Array.isArray(data)) {
        $data.Geometry.call(this, { coordinates: data });
    } else {
        $data.Geometry.call(this, data);
    }
};
$data.GeometryPolygon.validMembers = ['coordinates'];
$data.Geometry.registerType('Polygon', $data.GeometryPolygon);
$data.Container.registerType(['$data.GeometryPolygon', 'GeometryPolygon'], $data.GeometryPolygon);

/* $data.GeometryMultiPoint */
$data.GeometryMultiPoint = function GeometryMultiPoint(data) {
    if (Array.isArray(data)) {
        $data.Geometry.call(this, { coordinates: data });
    } else {
        $data.Geometry.call(this, data);
    }
};
$data.GeometryMultiPoint.validMembers = ['coordinates'];
$data.Geometry.registerType('MultiPoint', $data.GeometryMultiPoint);
$data.Container.registerType(['$data.GeometryMultiPoint', 'GeometryMultiPoint'], $data.GeometryMultiPoint);

/* $data.GeometryMultiLineString */
$data.GeometryMultiLineString = function GeometryMultiLineString(data) {
    if (Array.isArray(data)) {
        $data.Geometry.call(this, { coordinates: data });
    } else {
        $data.Geometry.call(this, data);
    }
};
$data.GeometryMultiLineString.validMembers = ['coordinates'];
$data.Geometry.registerType('MultiLineString', $data.GeometryMultiLineString);
$data.Container.registerType(['$data.GeometryMultiLineString', 'GeometryMultiLineString'], $data.GeometryMultiLineString);

/* $data.GeometryMultiPolygon */
$data.GeometryMultiPolygon = function GeometryMultiPolygon(data) {
    if (Array.isArray(data)) {
        $data.Geometry.call(this, { coordinates: data });
    } else {
        $data.Geometry.call(this, data);
    }
};
$data.GeometryMultiPolygon.validMembers = ['coordinates'];
$data.Geometry.registerType('MultiPolygon', $data.GeometryMultiPolygon);
$data.Container.registerType(['$data.GeometryMultiPolygon', 'GeometryMultiPolygon'], $data.GeometryMultiPolygon);

/* $data.GeometryCollection */
$data.GeometryCollection = function GeometryCollection(data) {
    $data.Geometry.call(this, data);
};
$data.Geometry.registerType('Collection', $data.GeometryCollection);
$data.Container.registerType(['$data.GeometryCollection', 'GeometryCollection'], $data.GeometryCollection);

