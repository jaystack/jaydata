$data.Geospatial = function Geospatial() {
    this.type = this.constructor.type;
    if (Array.isArray(this.constructor.validMembers)) {
        for (var i = 0; i < this.constructor.validMembers.length; i++) {
            var name = this.constructor.validMembers[i];
            this[name] = undefined;
        }
    }

    $data.SimpleBase.apply(this, arguments);
    this.type = this.constructor.type || 'Unknown';
};
$data.SimpleBase.registerType('Geospatial', $data.Geospatial);
$data.Container.registerType(['$data.Geospatial', 'Geospatial'], $data.Geospatial);

$data.point = function (arg) {
    if (arg && arg.crs) {
        if (arg.crs.properties && arg.crs.properties.name === $data.GeometryBase.defaultCrs.properties.name) {
            return new $data.GeometryPoint(arg);
        } else {
            return new $data.GeographyPoint(arg);
        }
    } else if(arg) {
        if ('x' in arg && 'y' in arg) {
            return new $data.GeometryPoint(arg.x, arg.y);
        } else if ('longitude' in arg && 'latitude' in arg) {
            return new $data.GeographyPoint(arg.longitude, arg.latitude);
        } else if ('lng' in arg && 'lat' in arg) {
            return new $data.GeographyPoint(arg.lng, arg.lat);
        }
    }
};
