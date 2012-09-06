$data.Geography = function Geography(lon, lat) {
    if (typeof lon === 'object' && Array.isArray(lon.coordinates)) {
        this.longitude = lon.coordinates[0];
        this.latitude = lon.coordinates[1];
    } else {
        this.longitude = lon;
        this.latitude = lat;
    }
};
$data.Container.registerType(['$data.Geography', 'Geography', 'geography', 'geo'], $data.Geography);

$data.Geography.prototype.toJSON = function () {
    return {

        //http://www.odata.org/blog/2011/5/3/geospatial-data-support-in-odata but http://services.odata.org/V3/OData/OData.svc/Suppliers(1) has this values
        //__metadata: { type: 'Edm.GeographyPoint' },
        type: 'Point',
        coordinates: [this.longitude, this.latitude]/*,
        crs: {
            type: 'name',
            properties: {
                name: "EPSG:4326"
            }
        }*/
    }
};
