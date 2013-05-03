/* $data.GeographyBase */
$data.GeographyBase = function GeographyBase() {
    $data.Geospatial.apply(this, arguments);

    this.crs = $data.GeographyBase.defaultCrs;
    $data.GeographyBase.validateGeoJSON(this);
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
$data.GeographyBase.validateGeoJSON = function (geoData) {
    var type = geoData.type;
    if (type) {
        var geoType = $data.GeographyBase.registered[type.toLowerCase()];
        if (typeof geoType.validateGeoJSON === 'function') {
            var isValid = geoType.validateGeoJSON(geoData);
            if (isValid) {
                return isValid;
            } else {
                Guard.raise(new Exception("Invalid '" + type + "' format!", 'Format Exception', geoData));
            }
        }
    }
    console.log('GeoJSON validation missing', geoData);
    return;
};
$data.SimpleBase.registerType('GeographyBase', $data.GeographyBase, $data.Geospatial);
$data.Container.registerType(['$data.GeographyBase'], $data.GeographyBase);

/* $data.GeographyPoint */
$data.GeographyPoint = function GeographyPoint(lon, lat) {
    if (lon && typeof lon === 'object' && Array.isArray(lon)) {
        $data.GeographyBase.call(this, { coordinates: lon });
    } else if (lon && typeof lon === 'object' && ('longitude' in lon || 'latitude' in lon)) {
        $data.GeographyBase.call(this, { coordinates: [lon.longitude, lon.latitude] });
    } else if (lon && typeof lon === 'object' && ('lng' in lon || 'lat' in lon)) {
        $data.GeographyBase.call(this, { coordinates: [lon.lng, lon.lat] });
    } else if (lon && typeof lon === 'object') {
        $data.GeographyBase.call(this, lon);
    } else {
        $data.GeographyBase.call(this, { coordinates: [lon || 0, lat || 0] });
    }
};
$data.GeographyPoint.validateGeoJSON = function (geoData) {
    return geoData && 
        Array.isArray(geoData.coordinates) && 
        geoData.coordinates.length == 2 && 
        typeof geoData.coordinates[0] === 'number' &&
        typeof geoData.coordinates[1] === 'number';
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
$data.GeographyLineString.validateGeoJSON = function (geoData) {
    var isValid = geoData &&
        Array.isArray(geoData.coordinates);

    for (var i = 0; isValid && i < geoData.coordinates.length; i++) {
        var point = geoData.coordinates[i];
        isValid = isValid &&
            Array.isArray(point) &&
            point.length == 2 &&
            typeof point[0] === 'number' &&
            typeof point[1] === 'number';
    }
    
    return isValid;
};
$data.GeographyLineString.validMembers = ['coordinates'];
$data.GeographyBase.registerType('LineString', $data.GeographyLineString);
$data.Container.registerType(['$data.GeographyLineString', 'GeographyLineString'], $data.GeographyLineString);

/* $data.GeographyPolygon */
$data.GeographyPolygon = function GeographyPolygon(data) {
    if (typeof data === 'object' && (('topLeft' in data && 'bottomRight' in data) || ('topRight' in data && 'bottomLeft' in data))) {
        var tl, tr, bl, br;

        if ('topLeft' in data && 'bottomRight' in data) {
            tl = data.topLeft instanceof $data.GeographyPoint ? data.topLeft : new $data.GeographyPoint(data.topLeft);
            br = data.bottomRight instanceof $data.GeographyPoint ? data.bottomRight : new $data.GeographyPoint(data.bottomRight);
            tr = new $data.GeographyPoint([br.coordinates[0], tl.coordinates[1]]);
            bl = new $data.GeographyPoint([tl.coordinates[0], br.coordinates[1]]);
        } else {
            tr = data.topRight instanceof $data.GeographyPoint ? data.topRight : new $data.GeographyPoint(data.topRight);
            bl = data.bottomLeft instanceof $data.GeographyPoint ? data.bottomLeft : new $data.GeographyPoint(data.bottomLeft);
            tl = new $data.GeographyPoint([bl.coordinates[0], tr.coordinates[1]]);
            br = new $data.GeographyPoint([tr.coordinates[0], bl.coordinates[1]]);
        }

        var coordinates = [];
        coordinates.push([].concat(tl.coordinates));
        coordinates.push([].concat(tr.coordinates));
        coordinates.push([].concat(br.coordinates));
        coordinates.push([].concat(bl.coordinates));
        coordinates.push([].concat(tl.coordinates));

        $data.GeographyBase.call(this, { coordinates: [coordinates] });

    }else if (Array.isArray(data)) {
        $data.GeographyBase.call(this, { coordinates: data });
    } else {
        $data.GeographyBase.call(this, data);
    }
};
$data.GeographyPolygon.validateGeoJSON = function (geoData) {
    var isValid = geoData &&
        Array.isArray(geoData.coordinates);

    for (var i = 0; isValid && i < geoData.coordinates.length; i++) {
        var polygon = geoData.coordinates[i];
        var isValid = isValid && Array.isArray(polygon);
            
        for (var j = 0; isValid && j < polygon.length; j++) {
            var point = polygon[j];

            isValid = isValid &&
                Array.isArray(point) &&
                point.length == 2 &&
                typeof point[0] === 'number' &&
                typeof point[1] === 'number';
        }
    }

    return isValid;
};
$data.GeographyPolygon.parseFromString = function (strData) {
    var data = strData.substring(strData.indexOf('(') + 1, strData.lastIndexOf(')'));
    var rings = data.substring(data.indexOf('(') + 1, data.lastIndexOf(')')).split('),(');

    var data = [];
    for (var i = 0; i < rings.length; i++) {
        var polyPoints = [];
        var pairs = rings[i].split(',');
        for (var j = 0; j < pairs.length; j++) {
            var values = pairs[j].split(' ');

            polyPoints.push([parseFloat(values[0]), parseFloat(values[1])]);
        }
        data.push(polyPoints);
    }

    return new $data.GeographyPolygon(data);
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
$data.GeographyMultiPoint.validateGeoJSON = function (geoData) {
    var isValid = geoData &&
        Array.isArray(geoData.coordinates);

    for (var i = 0; isValid && i < geoData.coordinates.length; i++) {
        var point = geoData.coordinates[i];
        isValid = isValid &&
            Array.isArray(point) &&
            point.length == 2 &&
            typeof point[0] === 'number' &&
            typeof point[1] === 'number';
    }

    return isValid;
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
$data.GeographyMultiLineString.validateGeoJSON = function (geoData) {
    var isValid = geoData &&
        Array.isArray(geoData.coordinates);

    for (var i = 0; isValid && i < geoData.coordinates.length; i++) {
        var polygon = geoData.coordinates[i];
        var isValid = isValid && Array.isArray(polygon);

        for (var j = 0; isValid && j < polygon.length; j++) {
            var point = polygon[j];

            isValid = isValid &&
                Array.isArray(point) &&
                point.length == 2 &&
                typeof point[0] === 'number' &&
                typeof point[1] === 'number';
        }
    }

    return isValid;
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
$data.GeographyMultiPolygon.validateGeoJSON = function (geoData) {
    var isValid = geoData &&
        Array.isArray(geoData.coordinates);

    for (var k = 0; isValid && k < geoData.coordinates.length; k++) {
        var polygons = geoData.coordinates[k];
        var isValid = isValid && Array.isArray(polygons);

        for (var i = 0; isValid && i < polygons.length; i++) {
            var polygon = polygons[i];
            var isValid = isValid && Array.isArray(polygon);

            for (var j = 0; isValid && j < polygon.length; j++) {
                var point = polygon[j];

                isValid = isValid &&
                    Array.isArray(point) &&
                    point.length == 2 &&
                    typeof point[0] === 'number' &&
                    typeof point[1] === 'number';
            }
        }
    }

    return isValid;
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
$data.GeographyCollection.validateGeoJSON = function (geoData) {
    var isValid = geoData &&
        Array.isArray(geoData.geometries);

    for (var i = 0; isValid && i < geoData.geometries.length; i++) {
        var geometry = geoData.geometries[i];
        try {
            isValid = isValid && $data.GeographyBase.validateGeoJSON(geometry);
        } catch (e) {
            isValid = false;
        }
    }

    return isValid;
};
$data.GeographyCollection.validMembers = ['geometries'];
$data.GeographyBase.registerType('GeometryCollection', $data.GeographyCollection);
$data.Container.registerType(['$data.GeographyCollection', 'GeographyCollection'], $data.GeographyCollection);


/* converters */
$data.Container.registerConverter($data.GeographyPoint, $data.Object, function (value) {
    return value ? new $data.GeographyPoint(value) : value;
});
$data.Container.registerConverter($data.GeographyLineString, $data.Object, function (value) {
    return value ? new $data.GeographyLineString(value) : value;
});
$data.Container.registerConverter($data.GeographyPolygon, $data.Object, function (value) {
    return value ? new $data.GeographyPolygon(value) : value;
});
$data.Container.registerConverter($data.GeographyMultiPoint, $data.Object, function (value) {
    return value ? new $data.GeographyMultiPoint(value) : value;
});
$data.Container.registerConverter($data.GeographyMultiLineString, $data.Object, function (value) {
    return value ? new $data.GeographyMultiLineString(value) : value;
});
$data.Container.registerConverter($data.GeographyMultiPolygon, $data.Object, function (value) {
    return value ? new $data.GeographyMultiPolygon(value) : value;
});
$data.Container.registerConverter($data.GeographyCollection, $data.Object, function (value) {
    return value ? new $data.GeographyCollection(value) : value;
});
