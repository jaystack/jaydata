$data.Guid = function Guid(value) {
    ///<param name="value" type="string" />

    this.value = value || '00000000-0000-0000-0000-000000000000';
};
$data.Container.registerType(['$data.Guid', 'Guid', 'guid'], $data.Guid);

$data.Guid.prototype.toJSON = function () {
    return this.value;
};

$data.Guid.prototype.valueOf = function () {
    return this.value;
};

$data.Guid.prototype.toString = function () {
    return this.value;
};

$data.parseGuid = function (guid) {
    return new $data.Guid(guid);
};
