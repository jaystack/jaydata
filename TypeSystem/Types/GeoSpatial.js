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