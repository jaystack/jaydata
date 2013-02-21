/* $data.SimpleBase */
$data.SimpleBase = function SimpleBase(data) {
    if (typeof data === 'object' && data) {
        if (Array.isArray(this.constructor.validMembers)) {
            for (var i = 0; i < this.constructor.validMembers.length; i++) {
                var name = this.constructor.validMembers[i];

                if (data[name] !== undefined) {
                    this[name] = data[name];
                }
            }

        } else {
            delete data.type;
            $data.typeSystem.extend(this, data);
        }
    }
}
$data.SimpleBase.registerType = function (name, type, base) {
    base = base || $data.SimpleBase;

    type.type = name;
    type.prototype = Object.create(base.prototype);
    type.prototype.constructor = type;
}
$data.Container.registerType(['$data.SimpleBase', 'SimpleBase'], $data.SimpleBase);