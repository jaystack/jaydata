$(document).ready(function () {
    module("oData_protocol");
	
	var testODataEntity = $data.Class.define("$data.testODataEntity", $data.Entity, null, {
		Id: { type: "int", key: true, computed: true },
		edmstring: { type: "Edm.String" },
		edmbool: { type: "Edm.Boolean" },
		edmint16: { type: "Edm.Int16" },
		edmint32: { type: "Edm.Int32" },
		edmint64: { type: "Edm.Int64" },
		edmdecimal: { type: "Edm.Decimal" },
		edmsingle: { type: "Edm.Single" },
		edmdouble: { type: "Edm.Double" },
		edmdec: { type: "Edm.Decimal" },
		edmguid: { type: "Edm.Guid" },
		edmbyte: { type: "Edm.Byte" },
		edmsbyte: { type: "Edm.SByte" },
		edmdatetimeoffset: { type: "Edm.DateTimeOffset" },
		edmduration: { type: "Edm.Duration" },
		edmbinary: { type: "Edm.Binary" },
		edmdate: { type: "Edm.Date" },
		edmtimeofday: { type: "Edm.TimeOfDay" },
		//enum
		edmgeographypoint: { type: "Edm.GeographyPoint" },
		edmgeometrypoint: { type: "Edm.GeometryPoint" },
		//collection of primitives
		edmcollstring: { type: $data.Array, elementType: "Edm.String" },
		edmcollint32: { type: $data.Array, elementType: "Edm.Int32" }
		
	}, null);
	
	var testODataContextClass = $data.Class.define("$data.testODataContext", $data.EntityContext, null, {
		testODataEntities: { type: $data.EntitySet, elementType: testODataEntity }
	});
	
	var testODataContext = new testODataContextClass({ name: "oData" })
	
	test("null", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = null
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.String']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.String']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.String']
			equal(escape(toDb(convertedValue)), value, 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmstring == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmstring eq null)", 'url query')
			
			start(1);
		})
    });
	
	test("true value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = true
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Boolean']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Boolean']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Boolean']
			equal(escape(toDb(convertedValue)), "true", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmbool == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmbool eq true)", 'url query')
			
			start(1);
		})
    });
	
	test("false value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = false
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Boolean']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Boolean']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Boolean']
			equal(escape(toDb(convertedValue)), "false", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmbool == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmbool eq false)", 'url query')
			
			start(1);
		})
    });
	
	test("binary value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = $data.Container.convertTo(atob("T0RhdGE="), '$data.Blob')
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Blob']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Blob']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Blob']
			deepEqual(escape(toDb(convertedValue)), "binary'T0RhdGE='", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmbinary == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmbinary eq binary'T0RhdGE=')", 'url query')
			
			start(1);
		})
    });
	
	test("int32 value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = -128
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Int32']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Int32']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Int32']
			equal(escape(toDb(convertedValue)), "-128", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmint32 == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmint32 eq -128)", 'url query')
			
			start(1);
		})
    });
	
	test("int16 value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = -128
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Int16']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Int16']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Int16']
			equal(escape(toDb(convertedValue)), "-128", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmint16 == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmint16 eq -128)", 'url query')
			
			start(1);
		})
    });
	
	test("double value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = 3.141592653589793
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Number']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Number']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Number']
			equal(escape(toDb(convertedValue)), "3.141592653589793", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdouble == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdouble eq 3.141592653589793)", 'url query')
			
			start(1);
		})
    });
	
	test("double value WebApi", 3, function () {
		stop(1);
		$data.defaults.oDataWebApi = true;

		testODataContext.onReady(function(ctx){
			var value = 3.141592653589793
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Number']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Number']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Number']
			equal(escape(toDb(convertedValue)), "3.141592653589793d", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdouble == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdouble eq 3.141592653589793d)", 'url query')
			
			$data.defaults.oDataWebApi = false;
			start(1);
		})
    });
	
	test("single value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = 5.559999942779541
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Float']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Float']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Float']
			equal(escape(toDb(convertedValue)), "5.559999942779541", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmsingle == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmsingle eq 5.559999942779541)", 'url query')
			
			start(1);
		})
    });
	
	test("single value WebApi", 3, function () {
		stop(1);
		$data.defaults.oDataWebApi = true;

		testODataContext.onReady(function(ctx){
			var value = 5.559999942779541
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Float']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Float']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Float']
			equal(escape(toDb(convertedValue)), "5.559999942779541f", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmsingle == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmsingle eq 5.559999942779541f)", 'url query')
			
			$data.defaults.oDataWebApi = false;
			start(1);
		})
    });
	
	test("decimal value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = 34.95
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Decimal']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Decimal']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Decimal']
			equal(escape(toDb(convertedValue)), "34.95", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdecimal == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdecimal eq 34.95)", 'url query')
			
			start(1);
		})
    });
	
	test("decimal value WebApi", 3, function () {
		stop(1);
		$data.defaults.oDataWebApi = true;

		testODataContext.onReady(function(ctx){
			var value = 34.95
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Decimal']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Decimal']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Decimal']
			equal(escape(toDb(convertedValue)), "34.95m", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdecimal == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdecimal eq 34.95m)", 'url query')
			
			$data.defaults.oDataWebApi = false;
			start(1);
		})
    });
	
	test("string value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = "Say \"Hello\",\nthen go"
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.String']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Boolean']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.String']
			equal(escape(toDb(convertedValue)), "'Say \"Hello\",\nthen go'", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmstring == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmstring eq 'Say \"Hello\",\nthen go')", 'url query')
			
			start(1);
		})
    });
	
	//date value
	test("date value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = '2012-12-03'
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Day']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Day']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Day']
			equal(escape(toDb(convertedValue)), "2012-12-03", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdate == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdate eq 2012-12-03)", 'url query')
			
			start(1);
		})
    });
	test("date value2", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = '-2000-02-03'
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Day']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Day']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Day']
			equal(escape(toDb(convertedValue)), "-2000-02-03", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdate == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdate eq -2000-02-03)", 'url query')
			
			start(1);
		})
    });
	
	test("datetimeoffset value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = '2012-12-03T08:16:23+01:00'
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.DateTimeOffset']
			var convertedValue = fromDb(value)
			equal(convertedValue.valueOf(), new Date("2012-12-03T07:16:23Z").valueOf(), 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.DateTimeOffset']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.DateTimeOffset']
			equal(escape(toDb(convertedValue)), "2012-12-03T07%3A16%3A23.000Z", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmdatetimeoffset == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmdatetimeoffset eq 2012-12-03T07%3A16%3A23.000Z)", 'url query')
			
			start(1);
		})
    });
	
	test("duration value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = 'P12DT23H59M59.999999999999S'
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Duration']
			var convertedValue = fromDb(value)
			equal(convertedValue, 'P12DT23H59M59.999999999999S', 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Duration']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Duration']
			equal(escape(toDb(convertedValue)), "duration'P12DT23H59M59.999999999999S'", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmduration == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmduration eq duration'P12DT23H59M59.999999999999S')", 'url query')
			
			start(1);
		})
    });
	
	test("timeOfDay value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = '07:59:59.999'
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Time']
			var convertedValue = fromDb(value)
			equal(convertedValue, '07:59:59.999', 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Time']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Time']
			equal(escape(toDb(convertedValue)), "07:59:59.999", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmtimeofday == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmtimeofday eq 07:59:59.999)", 'url query')
			
			start(1);
		})
    });
	
	test("guid value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = '01234567-89ab-cdef-0123-456789abcdef'
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Guid']
			var convertedValue = fromDb(value)
			equal(convertedValue, '01234567-89ab-cdef-0123-456789abcdef', 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Guid']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Guid']
			equal(escape(toDb(convertedValue)), "01234567-89ab-cdef-0123-456789abcdef", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmguid == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmguid eq 01234567-89ab-cdef-0123-456789abcdef)", 'url query')
			
			start(1);
		})
    });
	
	test("int64 value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = 3147483647
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Int64']
			var convertedValue = fromDb(value)
			equal(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Int64']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Int64']
			equal(escape(toDb(convertedValue)), "3147483647", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmint64 == this.val', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(edmint64 eq 3147483647)", 'url query')
			
			start(1);
		})
    });
	
	test("geographypoint value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = {"type": "Point","coordinates":[142.1,64.1]}
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.GeographyPoint']
			var convertedValue = fromDb(value)
			deepEqual(convertedValue, new $data.GeographyPoint([142.1,64.1]), 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.GeographyPoint']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.GeographyPoint']
			equal(escape(toDb(convertedValue)), "geography'SRID=4326;Point(142.1 64.1)'", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmgeographypoint.distance(this.val) < 5', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(geo.distance(edmgeographypoint,geography'SRID=4326;Point(142.1 64.1)') lt 5)", 'url query')
			
			start(1);
		})
    });
	
	test("geometrypoint value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = {"type": "Point","coordinates":[142.1,64.1]}
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.GeometryPoint']
			var convertedValue = fromDb(value)
			deepEqual(convertedValue, new $data.GeometryPoint([142.1,64.1]), 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.GeometryPoint']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.GeometryPoint']
			equal(escape(toDb(convertedValue)), "geometry'SRID=0;Point(142.1 64.1)'", 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmgeometrypoint.distance(this.val) < 5', { val: value});
			equal(query.toTraceString().queryText, "/testODataEntities?$filter=(geo.distance(edmgeometrypoint,geometry'SRID=0;Point(142.1 64.1)') lt 5)", 'url query')
			
			start(1);
		})
    });
	
	test("string collection value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = ["a1","a2","a3"]
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Array']
			var convertedValue = fromDb(value)
			deepEqual(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Array']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Array']
			equal(escape(toDb(convertedValue)), '["a1","a2","a3"]', 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmcollstring == this.val', { val: value});
			equal(query.toTraceString().queryText, '/testODataEntities?$filter=(edmcollstring eq ["a1","a2","a3"])', 'url query')
			
			start(1);
		})
    });
	
	test("int32 collection value", 3, function () {
		stop(1);

		testODataContext.onReady(function(ctx){
			var value = [12,13,14]
			
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.Array']
			var convertedValue = fromDb(value)
			deepEqual(convertedValue, value, 'fromDb converter')
			
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.Array']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.Array']
			equal(escape(toDb(convertedValue)), '[12,13,14]', 'escape converter')
			
			var query = ctx.testODataEntities.filter('it.edmcollint32 == this.val', { val: value});
			equal(query.toTraceString().queryText, '/testODataEntities?$filter=(edmcollint32 eq [12,13,14])', 'url query')
			
			start(1);
		})
    });
});