$(document).ready(function () {
    module("oData_enum");
	
	// $data.Enum.extend("$data.testEnum", {
	// 	Admin: "",
	// 	User: undefined,
	// 	Customer: "",
	// 	Guest: 4
	// })
	
	// $data.createEnum("$data.testEnum", [
	// 	'Admin',
	// 	'User',
	// 	'Customer',
	// 	{ name: "Guest", value: 4 }
	// ])
	
	$data.createEnum("$data.testEnum", {
		Admin: undefined,
		User: false,
		Customer: {},
		Guest: { value: 4 }
	})
	
	$data.createEnum("$data.testStrEnum", "Edm.String", {
		Admin: 'admin',
		User: 'user',
		Customer: 'customer',
		Guest: 'guest'
	})
	
	var testEnumEntity = $data.Class.define("$data.testEnumEntity", $data.Entity, null, {
		Id: { type: "int", key: true, computed: true },
		myEnum: { type: $data.testEnum },
		myStrEnum: { type: $data.testStrEnum }	
	}, null);
	
	var testEnumContextClass = $data.Class.define("$data.testEnumContext", $data.EntityContext, null, {
		testEnumEntities: { type: $data.EntitySet, elementType: testEnumEntity }
	});
	
	var ctx = new $data.testEnumContext({ name: "oData" })

	test("enum assignment", 3, function () {
		stop(1);

		ctx.onReady(function(ctx){
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myEnum = 1;
			equal(enumEnitiy.myEnum, 1, 'enum value int');
			
			enumEnitiy.myEnum = "Customer";
			equal(enumEnitiy.myEnum, 2, 'enum value string');
			
			enumEnitiy.myEnum = $data.testEnum.Guest;
			equal(enumEnitiy.myEnum, 4, 'enum value property');
						
			start(1);
		})
    });
	
	test("enum value", 4, function () {
		stop(1);

		ctx.onReady(function(ctx){
			
			equal($data.testEnum.__enumType, $data.Integer, 'enumType')
			
			var value = $data.testEnum.Customer;
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.testEnum']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.testEnum']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.testEnum']
			equal(escape(toDb(convertedValue)), "$data.testEnum'2'", 'escape converter')
			
			var query = ctx.testEnumEntities.filter('it.myEnum == this.val', { val: value });
			equal(query.toTraceString().queryText, "/testEnumEntities?$filter=(myEnum eq $data.testEnum'2')", 'url query')
			
			start(1);
		})
    });
	
	
	test("str enum assignment", 3, function () {
		stop(1);

		ctx.onReady(function(ctx){
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myStrEnum = 'admin';
			equal(enumEnitiy.myStrEnum, 'admin', 'enum value int');
			
			enumEnitiy.myStrEnum = "Customer";
			equal(enumEnitiy.myStrEnum, 'customer', 'enum value string');
			
			enumEnitiy.myStrEnum = $data.testStrEnum.Guest;
			equal(enumEnitiy.myStrEnum, 'guest', 'enum value property');
						
			start(1);
		})
    });
	
	test("str enum value", 4, function () {
		stop(1);

		ctx.onReady(function(ctx){
			
			equal($data.testStrEnum.__enumType, $data.String, 'enumType')
			
			var value = $data.testStrEnum.Customer;
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.testStrEnum']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.testStrEnum']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.testStrEnum']
			equal(escape(toDb(convertedValue)), "$data.testStrEnum'customer'", 'escape converter')
			
			var query = ctx.testEnumEntities.filter('it.myStrEnum == this.val', { val: value });
			equal(query.toTraceString().queryText, "/testEnumEntities?$filter=(myStrEnum eq $data.testStrEnum'customer')", 'url query')
			
			start(1);
		})
    });
});