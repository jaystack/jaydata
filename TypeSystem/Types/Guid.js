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

$data.Guid.NewGuid = function () {
    var S4 = function () {
        return Math.floor(
            Math.random() * 0x10000 /* 65536 */
        ).toString(16);
    };

    return new $data.Guid((
        S4() + S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + "-" +
            S4() + S4() + S4()
        ));
};

$data.parseGuid = function (guid) {
    return new $data.Guid(guid);
};
