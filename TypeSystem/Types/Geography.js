/* $data.GeographyBase */
$data.GeographyBase = function GeographyBase() {
    $data.Geospatial.apply(this, arguments);

    this.crs = $data.GeographyBase.defaultCrs;
};

$data.GeographyBase.defaultCrs = {
    properties: {
        name: 'EPSG:4326'
    },
    type: 'name'
};

$data.GeographyBase.parseFromString = function (strData) {
    var lparenIdx = strData.indexOf('(');
    if(lparenIdx >= 0){
        var name = strData.substring(0, lparenIdx).toLowerCase();
        var type = $data.GeographyBase.registered[name];

        if (type && type.parseFromString && type != $data.GeographyBase) {
            return type.parseFromString(strData);
        } else {
            Guard.raise(new Exception('parseFromString', 'Not Implemented', strData));
        }
    }
};
$data.GeographyBase.stringifyToUrl = function (geoData) {
    if (geoData instanceof $data.GeographyBase && geoData.constructor && geoData.constructor.stringifyToUrl) {
        return geoData.constructor.stringifyToUrl(geoData);
    } else if (geoData instanceof $data.GeographyBase && geoData.constructor && Array.isArray(geoData.constructor.validMembers) && geoData.constructor.validMembers[0] === 'coordinates') {
        var data = "geography'" + geoData.type.toUpperCase() + '(';
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
$data.GeographyBase.registerType = function (name, type, base) {
    $data.SimpleBase.registerType(name, type, base || $data.GeographyBase);

    $data.GeographyBase.registered = $data.GeographyBase.registered || {};
    $data.GeographyBase.registered[name.toLowerCase()] = type;
};
$data.SimpleBase.registerType('GeographyBase', $data.GeographyBase, $data.Geospatial);
$data.Container.registerType(['$data.GeographyBase'], $data.GeographyBase);

/* $data.GeographyPoint */
$data.GeographyPoint = function GeographyPoint(lon, lat) {
    if (lon && typeof lon === 'object' && Array.isArray(lon)) {
        $data.GeographyBase.call(this, { coordinates: lon });
    } else if (lon && typeof lon === 'object') {
        $data.GeographyBase.call(this, lon);
    } else {
        $data.GeographyBase.call(this, { coordinates: [lon || 0, lat || 0] });
    }
};
$data.GeographyPoint.parseFromString = function (strData) {
    var data = strData.substring(strData.indexOf('(') + 1, strData.lastIndexOf(')'));
    var values = data.split(' ');

    return new $data.GeographyPoint(parseFloat(values[0]), parseFloat(values[1]));
};
$data.GeographyPoint.validMembers = ['coordinates'];
$data.GeographyBase.registerType('Point', $data.GeographyPoint);
Object.defineProperty($data.GeographyPoint.prototype, 'longitude', { get: function () { return this.coordinates[0]; }, set: function (v) { this.coordinates[0] = v; } });
Object.defineProperty($data.GeographyPoint.prototype, 'latitude', { get: function () { return this.coordinates[1]; }, set: function (v) { this.coordinates[1] = v; } });
$data.Container.registerType(['$data.GeographyPoint', 'GeographyPoint', '$data.Geography', 'Geography', 'geography', 'geo'], $data.GeographyPoint);
$data.Geography = $data.GeographyPoint;

/* $data.GeographyLineString */
$data.GeographyLineString = function GeographyLineString(data) {
    if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { coordinates: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyLineString.validMembers = ['coordinates'];
$data.GeographyBase.registerType('LineString', $data.GeographyLineString);
$data.Container.registerType(['$data.GeographyLineString', 'GeographyLineString'], $data.GeographyLineString);

/* $data.GeographyPolygon */
$data.GeographyPolygon = function GeographyPolygon(data) {
    if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { coordinates: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyPolygon.validMembers = ['coordinates'];
$data.GeographyBase.registerType('Polygon', $data.GeographyPolygon);
$data.Container.registerType(['$data.GeographyPolygon', 'GeographyPolygon'], $data.GeographyPolygon);

/* $data.GeographyMultiPoint */
$data.GeographyMultiPoint = function GeographyMultiPoint(data) {
    if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { coordinates: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyMultiPoint.validMembers = ['coordinates'];
$data.GeographyBase.registerType('MultiPoint', $data.GeographyMultiPoint);
$data.Container.registerType(['$data.GeographyMultiPoint', 'GeographyMultiPoint'], $data.GeographyMultiPoint);

/* $data.GeographyMultiLineString */
$data.GeographyMultiLineString = function GeographyMultiLineString(data) {
    if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { coordinates: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyMultiLineString.validMembers = ['coordinates'];
$data.GeographyBase.registerType('MultiLineString', $data.GeographyMultiLineString);
$data.Container.registerType(['$data.GeographyMultiLineString', 'GeographyMultiLineString'], $data.GeographyMultiLineString);

/* $data.GeographyMultiPolygon */
$data.GeographyMultiPolygon = function GeographyMultiPolygon(data) {
    if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { coordinates: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyMultiPolygon.validMembers = ['coordinates'];
$data.GeographyBase.registerType('MultiPolygon', $data.GeographyMultiPolygon);
$data.Container.registerType(['$data.GeographyMultiPolygon', 'GeographyMultiPolygon'], $data.GeographyMultiPolygon);

/* $data.GeographyCollection */
$data.GeographyCollection = function GeographyCollection(data) {
    if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { geometries: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyCollection.validMembers = ['geometries'];
$data.GeographyBase.registerType('GeometryCollection', $data.GeographyCollection);
$data.Container.registerType(['$data.GeographyCollection', 'GeographyCollection'], $data.GeographyCollection);

