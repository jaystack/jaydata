/* $data.Geometry */
$data.GeometryBase = function GeometryBase() {
    $data.Geospatial.apply(this, arguments);

    this.crs = $data.GeometryBase.defaultCrs;
};

$data.GeometryBase.defaultCrs = {
    properties: {
        name: 'EPSG:0'
    },
    type: 'name'
};

$data.GeometryBase.parseFromString = function (strData) {
    var lparenIdx = strData.indexOf('(');
    if (lparenIdx >= 0) {
        var name = strData.substring(0, lparenIdx).toLowerCase();
        var type = $data.GeometryBase.registered[name];

        if (type && type.parseFromString && type != $data.GeometryBase) {
            return type.parseFromString(strData);
        } else {
            Guard.raise(new Exception('parseFromString', 'Not Implemented', strData));
        }
    }
};
$data.GeometryBase.stringifyToUrl = function (geoData) {
    if (geoData instanceof $data.GeometryBase && geoData.constructor && geoData.constructor.stringifyToUrl) {
        return geoData.constructor.stringifyToUrl(geoData);
    } else if (geoData instanceof $data.GeometryBase && geoData.constructor && Array.isArray(geoData.constructor.validMembers) && geoData.constructor.validMembers[0] === 'coordinates') {
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
$data.GeometryBase.registerType = function (name, type, base) {
    $data.SimpleBase.registerType(name, type, base || $data.GeometryBase);

    $data.GeometryBase.registered = $data.GeometryBase.registered || {};
    $data.GeometryBase.registered[name.toLowerCase()] = type;
};
$data.SimpleBase.registerType('GeometryBase', $data.GeometryBase, $data.Geospatial);
$data.Container.registerType(['$data.GeometryBase'], $data.GeometryBase);

/* $data.GeometryPoint */
$data.GeometryPoint = function GeometryPoint(x, y) {
    var param = x;
    if (param && typeof param === 'object' && Array.isArray(param)) {
        $data.GeometryBase.call(this, { coordinates: param });
    } else if (param && typeof param === 'object' && ('x' in param || 'y' in param)) {
        $data.GeometryBase.call(this, { coordinates: [param.x, param.y] });
    } else if (param && typeof param === 'object') {
        $data.GeometryBase.call(this, param);
    } else {
        $data.GeometryBase.call(this, { coordinates: [x || 0, y || 0] });
    }
};
$data.GeometryPoint.parseFromString = function (strData) {
    var data = strData.substring(strData.indexOf('(') + 1, strData.lastIndexOf(')'));
    var values = data.split(' ');

    return new $data.GeometryPoint(parseFloat(values[0]), parseFloat(values[1]));
};
$data.GeometryPoint.validMembers = ['coordinates'];
$data.GeometryBase.registerType('Point', $data.GeometryPoint);
Object.defineProperty($data.GeometryPoint.prototype, 'x', { get: function () { return this.coordinates[0]; }, set: function (v) { this.coordinates[0] = v; } });
Object.defineProperty($data.GeometryPoint.prototype, 'y', { get: function () { return this.coordinates[1]; }, set: function (v) { this.coordinates[1] = v; } });
$data.Container.registerType(['$data.GeometryPoint', 'GeometryPoint'], $data.GeometryPoint);

/* $data.GeometryLineString */
$data.GeometryLineString = function GeometryLineString(data) {
    if (Array.isArray(data)) {
        $data.GeometryBase.call(this, { coordinates: data });
    } else {
        $data.GeometryBase.call(this, data);
    }
};
$data.GeometryLineString.validMembers = ['coordinates'];
$data.GeometryBase.registerType('LineString', $data.GeometryLineString);
$data.Container.registerType(['$data.GeometryLineString', 'GeometryLineString'], $data.GeometryLineString);

/* $data.GeometryPolygon */
$data.GeometryPolygon = function GeometryPolygon(data) {
    if (Array.isArray(data)) {
        $data.GeometryBase.call(this, { coordinates: data });
    } else {
        $data.GeometryBase.call(this, data);
    }
};
$data.GeometryPolygon.validMembers = ['coordinates'];
$data.GeometryBase.registerType('Polygon', $data.GeometryPolygon);
$data.Container.registerType(['$data.GeometryPolygon', 'GeometryPolygon'], $data.GeometryPolygon);

/* $data.GeometryMultiPoint */
$data.GeometryMultiPoint = function GeometryMultiPoint(data) {
    if (Array.isArray(data)) {
        $data.GeometryBase.call(this, { coordinates: data });
    } else {
        $data.GeometryBase.call(this, data);
    }
};
$data.GeometryMultiPoint.validMembers = ['coordinates'];
$data.GeometryBase.registerType('MultiPoint', $data.GeometryMultiPoint);
$data.Container.registerType(['$data.GeometryMultiPoint', 'GeometryMultiPoint'], $data.GeometryMultiPoint);

/* $data.GeometryMultiLineString */
$data.GeometryMultiLineString = function GeometryMultiLineString(data) {
    if (Array.isArray(data)) {
        $data.GeometryBase.call(this, { coordinates: data });
    } else {
        $data.GeometryBase.call(this, data);
    }
};
$data.GeometryMultiLineString.validMembers = ['coordinates'];
$data.GeometryBase.registerType('MultiLineString', $data.GeometryMultiLineString);
$data.Container.registerType(['$data.GeometryMultiLineString', 'GeometryMultiLineString'], $data.GeometryMultiLineString);

/* $data.GeometryMultiPolygon */
$data.GeometryMultiPolygon = function GeometryMultiPolygon(data) {
    if (Array.isArray(data)) {
        $data.GeometryBase.call(this, { coordinates: data });
    } else {
        $data.GeometryBase.call(this, data);
    }
};
$data.GeometryMultiPolygon.validMembers = ['coordinates'];
$data.GeometryBase.registerType('MultiPolygon', $data.GeometryMultiPolygon);
$data.Container.registerType(['$data.GeometryMultiPolygon', 'GeometryMultiPolygon'], $data.GeometryMultiPolygon);

/* $data.GeometryCollection */
$data.GeometryCollection = function GeometryCollection(data) {
    if (Array.isArray(data)) {
        $data.GeometryBase.call(this, { geometries: data });
    } else {
        $data.GeometryBase.call(this, data);
    }
};
$data.GeometryCollection.validMembers = ['geometries'];
$data.GeometryBase.registerType('GeometryCollection', $data.GeometryCollection);
$data.Container.registerType(['$data.GeometryCollection', 'GeometryCollection'], $data.GeometryCollection);

/* converters */
$data.Container.registerConverter($data.GeometryPoint, $data.Object, function (value) {
    return value ? new $data.GeometryPoint(value) : value;
});
$data.Container.registerConverter($data.GeometryLineString, $data.Object, function (value) {
    return value ? new $data.GeometryLineString(value) : value;
});
$data.Container.registerConverter($data.GeometryPolygon, $data.Object, function (value) {
    return value ? new $data.GeometryPolygon(value) : value;
});
$data.Container.registerConverter($data.GeometryMultiPoint, $data.Object, function (value) {
    return value ? new $data.GeometryMultiPoint(value) : value;
});
$data.Container.registerConverter($data.GeometryMultiLineString, $data.Object, function (value) {
    return value ? new $data.GeometryMultiLineString(value) : value;
});
$data.Container.registerConverter($data.GeometryMultiPolygon, $data.Object, function (value) {
    return value ? new $data.GeometryMultiPolygon(value) : value;
});
$data.Container.registerConverter($data.GeometryCollection, $data.Object, function (value) {
    return value ? new $data.GeometryCollection(value) : value;
});