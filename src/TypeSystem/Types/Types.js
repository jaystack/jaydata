$data.Number = typeof Number !== 'undefined' ? Number : function JayNumber() { };
$data.Date = typeof Date !== 'undefined' ? Date : function JayDate() { };
$data.String = typeof String !== 'undefined' ? String : function JayString() { };
$data.Boolean = typeof Boolean !== 'undefined' ? Boolean : function JayBoolean() { };
$data.Array = typeof Array !== 'undefined' ? Array : function JayArray() { };
$data.Object = typeof Object !== 'undefined' ? Object : function JayObject() { };
$data.Function = Function;

$data.Byte = function JayByte() { };
$data.SByte = function JaySByte() { };
$data.Decimal = function JayDecimal() { };
$data.Float = $data.Single = function JayFloat() { };
$data.Integer = function JayInteger() { };
$data.Int16 = function JayInt16(v) { };
$data.Int32 = function JayInt32() { };
$data.Int64 = function JayInt64(v) { };
$data.ObjectID = typeof $data.mongoDBDriver !== 'undefined' && typeof $data.mongoDBDriver.ObjectID !== 'undefined' ? $data.mongoDBDriver.ObjectID : function JayObjectID() { };
$data.Time = function JayTime() { };
$data.DateTimeOffset = function JayDateTimeOffset(val) {
    this.value = val;
};
$data.DateTimeOffset.prototype.toJSON = function () {
    return this.value instanceof Date ? this.value.toISOString() : this.value;
};

$data.Container.registerType(["$data.Number", "number", "JayNumber", "double"], $data.Number);
$data.Container.registerType(["$data.Integer", "int", "integer", "JayInteger"], $data.Integer);
$data.Container.registerType(["$data.Int32", "int32", "JayInt32"], $data.Int32);
$data.Container.registerType(["$data.Byte", "byte", "JayByte"], $data.Byte);
$data.Container.registerType(["$data.SByte", "sbyte", "JaySByte"], $data.SByte);
$data.Container.registerType(["$data.Decimal", "decimal", "JayDecimal"], $data.Decimal);
$data.Container.registerType(["$data.Float", "$data.Single", "float", "single", "JayFloat"], $data.Float);
$data.Container.registerType(["$data.Int16", "int16", "word", "JayInt16"], $data.Int16);
$data.Container.registerType(["$data.Int64", "int64", "long", "JayInt64"], $data.Int64);
$data.Container.registerType(["$data.String", "string", "text", "character", "JayString"], $data.String);
$data.Container.registerType(["$data.Array", "array", "Array", "[]", "JayArray"], $data.Array, function () {
    return $data.Array.apply(undefined, arguments);
});
$data.Container.registerType(["$data.Date", "datetime", "date", "JayDate"], $data.Date);
$data.Container.registerType(["$data.Time", "time", "JayTime"], $data.Time);
$data.Container.registerType(["$data.DateTimeOffset", "offset", "datetimeoffset", "JayDateTimeOffset"], $data.DateTimeOffset);
$data.Container.registerType(["$data.Boolean", "bool", "boolean", "JayBoolean"], $data.Boolean);
$data.Container.registerType(["$data.Object", "Object", "object", "{}", "JayObject"], $data.Object);
$data.Container.registerType(["$data.Function", "Function", "function"], $data.Function);
$data.Container.registerType(['$data.ObjectID', 'ObjectID', 'objectId', 'objectid', 'ID', 'Id', 'id', 'JayObjectID'], $data.ObjectID);
