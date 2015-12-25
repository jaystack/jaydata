$(document).ready(function () {
    module("oData_read");
		
	$data.Entity.extend('JayData.Test.CommonItems.Entities.User', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		LoginName: { type: 'Edm.String' },
		Email: { type: 'Edm.String' },
		UserType: { type: 'JayData.Test.CommonItems.Entities.UserType', nullable: false },
		AuthoredArticles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Author" },
		ReviewedArticles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Reviewer" },
		Profile: { type: 'JayData.Test.CommonItems.Entities.UserProfile' }
	})
	
	var UserType = $data.createEnum("JayData.Test.CommonItems.Entities.UserType", [
		{ name: 'Admin', value: 0 },
		{ name: 'Customer', value: 1 },
		{ name: 'Guest', value: 2 }
	])
	
	var base_MyTClass = $data.Entity.extend('JayData.Test.CommonItems.Entities.MyTClass', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		Title: { type: 'Edm.String' }
	}, {
		openType: { value: true }
	})
	
	base_MyTClass.extend('JayData.Test.CommonItems.Entities.Article',{
		RowVersion: { type: 'Edm.Binary' },
		Lead: { type: 'Edm.String' },
		Body: { type: 'Edm.String' },
		CreateDate: { type: 'Edm.DateTimeOffset' },
		Thumbnail_LowRes: { type: 'Edm.Binary' },
		Thumbnail_HighRes: { type: 'Edm.Binary' },
		Category: { type: 'JayData.Test.CommonItems.Entities.Category', inverseProperty: "Articles" },
		Tags: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.TagConnection', inverseProperty: "Article" },
		Author: { type: 'JayData.Test.CommonItems.Entities.User', inverseProperty: "AuthoredArticles" },
		Reviewer: { type: 'JayData.Test.CommonItems.Entities.User', inverseProperty: "ReviewedArticles" }
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.UserProfile', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		FullName: { type: 'Edm.String' },
		Bio: { type: 'Edm.Binary' },
		Avatar: { type: 'Edm.String' },
		Birthday: { type: 'Edm.DateTimeOffset' },
		Location: { type: 'JayData.Test.CommonItems.Entities.Location' },
		User: { type: 'JayData.Test.CommonItems.Entities.User', required: true, nullable: false, inverseProperty: "Profile" }
	})
	
	base_MyTClass.extend('JayData.Test.CommonItems.Entities.Category', {
		RowVersion: { type: 'Edm.Binary' },
		Subtitle: { type: 'Edm.String' },
		Description: { type: 'Edm.String' },
		Articles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Category" }
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.Tag', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		Title: { type: 'Edm.String' },
		Articles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.TagConnection', inverseProperty: "Tag" },
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.TestItem', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		i0: { type: 'Edm.Int32' },
		b0: { type: 'Edm.Boolean' },
		s0: { type: 'Edm.String' },
		blob: { type: 'Array', elementType: 'Edm.Byte' },
		n0: { type: 'Edm.Double' },
		d0: { type: 'Edm.DateTimeOffset' },
		g0: { type: 'Edm.Guid' },
		l0: { type: 'Edm.Int64' },
		de0: { type: 'Edm.Decimal', nullable: false, required: true },
		b1: { type: 'Edm.Byte' }
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.TagConnection', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		Article: { type: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Tags" },
		Tag: { type: 'JayData.Test.CommonItems.Entities.Tag', inverseProperty: "Articles" }
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.TestItemGuid', {
		Id: { type: 'Edm.Guid', nullable: false, required: true, key: true },
		i0: { type: 'Edm.Int32' },
		b0: { type: 'Edm.Boolean' },
		s0: { type: 'Edm.String' },
		time: { type: 'Edm.TimeOfDay', nullable: false },
		date: { type: 'Edm.Date', nullable: false },
		t: { type: 'Edm.DateTimeOffset', nullable: false },
		dur: { type: 'Edm.Duration', nullable: false },
		dtOffset: { type: 'Edm.DateTimeOffset', nullable: false },
		lng: { type: 'Edm.Int64', nullable: false },
		dec: { type: 'Edm.Decimal', nullable: false },
		flt: { type: 'Edm.Single', nullable: false },
		emails: { type: 'Array', elementType: 'Edm.String' },
		Group: { type: 'JayData.Test.CommonItems.Entities.TestItemGroup', inverseProperty: "Items" },
		GetDisplayText: { type: $data.ServiceAction, namespace: "Default", returnType: 'Edm.String', params: [] }
	}, {
		openType: { value: true }
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.TestItemGroup', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		Name: { type: 'Edm.String' },
		Items: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.TestItemGuid', inverseProperty: "Group" },
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.TestItemType', {
		Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
		blob: { type: 'Edm.Binary' },
		b0: { type: 'Edm.Boolean' },
		b1: { type: 'Edm.Byte' },
		d0: { type: 'Edm.DateTimeOffset' },
		de0: { type: 'Edm.Decimal', nullable: false, required: true },
		n0: { type: 'Edm.Double' },
		si0: { type: 'Edm.Single' },
		g0: { type: 'Edm.Guid' },
		i16: { type: 'Edm.Int16' },
		i0: { type: 'Edm.Int32' },
		i64: { type: 'Edm.Int64' },
		s0: { type: 'Edm.String' }
	})
	
	$data.Entity.extend('JayData.Test.CommonItems.Entities.Location', {
		Address: { type: 'Edm.String' },
		City: { type: 'Edm.String' },
		Zip: { type: 'Edm.Int32', nullable: false, required: true },
		Country: { type: 'Edm.String' }
	})
	
	
	var Context = $data.EntityContext.extend('Default.Container', {
		Users: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.User' },
		Articles: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.Article' },
		UserProfiles: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.UserProfile' },
		Categories: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.Category' },
		Tags: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.Tag' },
		TestTable: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItem' },
		TagConnections: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TagConnection' },
		TestTable2: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItemGuid',
			actions: {
				GetTitles: { type: $data.ServiceAction, namespace: "Default", returnType: '$data.Queryable', elementType: 'Edm.String', params: [{ name: 'count', type: 'Edm.Int32' }] }
			}
		},
		TestItemGroups: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItemGroup' },
		TestItemTypes: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItemType' },
		SAction1: { type: $data.ServiceAction, returnType: 'Edm.String', params: [{ name: 'number', type: 'Edm.Int32' }] },
		SAction2: { type: $data.ServiceAction, returnType: '$data.Queryable', elementType: 'JayData.Test.CommonItems.Entities.Article', EntitySet: 'Articles', params: [{ name: 'count', type: 'Edm.Int32' }] },
		SFunction1: { type: $data.ServiceAction, returnType: 'Edm.String', params: [{ name: 'number', type: 'Edm.Int32' }] }
	})

	
	function tErro() {
		ok(false, 'error')
		start(1)
	}
	var ctx = window.c = new Default.Container('http://localhost:9000/odata')
	ctx.prepareRequest = function(r){
		r[0].headers = {
			"Accept": "application/json;odata.metadata=full;q=0.9, */*;q=0.1",
			"Content-Type": "application/json;IEEE754Compatible=true"
		}
	}

	var createTest = function (typeName, setName, setLength, setFilterLength, propName, propValue, propType, cfg){
		cfg = cfg || {}
		//cfg.isDeepEqual
		cfg.valueConverter = cfg.valueConverter || function(v) { return v }
		
		var stops = 4;
		var asserts = 12;
		if(cfg.noFilter){
			stops--;
			asserts -= 4;
		}
		
		test("read " + typeName, asserts, function () {
			stop(stops);
	
			ctx.onReady(function(ctx){
				
				ctx[setName].toArray(function(r){
					ok(r.length > 0, 'has result')
					equal(r.length, setLength, 'result count')
					
					if(r.length){
						var item = r[0]
						equal(typeof item[propName], propType, 'read type check')
						if(cfg.isDeepEqual){
							deepEqual(item[propName], propValue, 'read value check')
						} else {
							equal(cfg.valueConverter(item[propName]), cfg.valueConverter(propValue), 'read value check')
						}
					}
					
					start(1);
				}, tErro)
				
				if (!cfg.noFilter) {
					ctx[setName].filter('it.'+ propName + ' == this.val', {val:propValue}).toArray(function(r){
						ok(r.length > 0, 'query has result')
						equal(r.length, setFilterLength, 'query result count')
						
						if(r.length){
							var item = r[0]
							equal(typeof item[propName], propType, 'query read type check')
							if(cfg.isDeepEqual){
								deepEqual(item[propName], propValue, 'query read value check')
							} else {
								equal(cfg.valueConverter(item[propName]), cfg.valueConverter(propValue), 'query read value check')
							}
						}
						
						start(1);
					}, tErro)
				}
				
				ctx[setName].map('it.' + propName).toArray(function(r){
					ok(r.length > 0, 'map has result')
					equal(r.length, setLength, 'map result count')
					
					if(r.length){
						var item = r[0]
						equal(typeof item, propType, 'map read type check')
						if(cfg.isDeepEqual){
							deepEqual(item, propValue, 'map read value check')
						} else {
							equal(cfg.valueConverter(item), cfg.valueConverter(propValue), 'map read value check')
						}
					}
					
					start(1);
				}, tErro)
					
				start(1);
			})
		});
		
	}
	
	createTest('int16', 'TestItemTypes', 3, 1, 'i16', 23, 'number')
	createTest('int32', 'TestItemTypes', 3, 1, 'i0', 42, 'number')
	createTest('int64', 'TestItemTypes', 3, 1, 'i64', '1337', 'string')
	createTest('decimal', 'TestItemTypes', 3, 1, 'de0', '2.20', 'string')
	createTest('float', 'TestItemTypes', 3, 1, 'si0', 4.25, 'number')
	createTest('double', 'TestItemTypes', 3, 1, 'n0', 34.5, 'number')
	createTest('byte', 'TestItemTypes', 3, 1, 'b1', 1, 'number')
	createTest('boolean', 'TestItemTypes', 3, 2, 'b0', false, 'boolean')
	createTest('string', 'TestItemTypes', 3, 1, 's0', 'JayData', 'string')
	createTest('binary', 'TestItemTypes', 3, 1, 'blob', $data.Container.convertTo(atob("aGVsbG8gamF5ZGF0YQ=="), '$data.Blob'), 'object', { isDeepEqual: true })
	createTest('guid', 'TestItemTypes', 3, 1, 'g0', 'd89ade51-c58b-48a2-ba72-e9157165eb6e', 'string')
	createTest('datetimeoffset', 'TestItemTypes', 3, 1, 'd0', new Date("2015-12-12T00:00:00+01:00"), 'object', {
		valueConverter: function(v) { return v.valueOf() }
	})
	
	createTest('timeofday', 'TestTable2', 3, 1, 'time', "15:10:15.000", 'string')
	createTest('date', 'TestTable2', 3, 1, 'date', "2015-12-12", 'string')
	createTest('duration', 'TestTable2', 3, 1, 'dur', "-PT5H45M", 'string')
	createTest('collection string', 'TestTable2', 3, 1, 'emails', ["a@example.com","b@example.com","c@example.com"], 'object', { isDeepEqual: true, noFilter: true })
	createTest('enum', 'Users', 6, 1, 'UserType', 0, 'number')
	
	
	test('read base type', 8, function () {
		stop(3);
		
		ctx.onReady(function(){
			
			ctx.Articles.toArray(function(articles){
				ok(articles.length > 0, 'read articles')
				
				if(articles.length){
					var item = articles[0]
					equal(item instanceof JayData.Test.CommonItems.Entities.MyTClass, true, 'base type check')
					equal(typeof item.Id, "number", 'int property from baseType');
					equal(typeof item.Title, "string", 'string property from baseType');
				}
				
				
				start(1);
			})
			
			
			ctx.Categories.toArray(function(categories){
				ok(categories.length > 0, 'read categories')
				
				if(categories.length){
					var item = categories[0]
					equal(item instanceof JayData.Test.CommonItems.Entities.MyTClass, true, 'base type check')
					equal(typeof item.Id, "number", 'int property from baseType');
					equal(typeof item.Title, "string", 'string property from baseType');
				}
				
				
				start(1);
			})
			
			start(1);			
		})
	})
	
	test('read open type', 7, function () {
		stop(2);
		
		ctx.onReady(function(){
			
			ctx.TestTable2.toArray(function(items){
				ok(items.length > 1, 'read items')
				
				if(items.length){
					var item = items[2]
					
					equal(typeof item.Dynamics, "object", 'Dynamics property type');
					if(item.Dynamics) {
						equal(item.Dynamics.t0, 1, 't0 property');
						equal(item.Dynamics.t1, "xx", 't1 property');
						equal(item.Dynamics.t2, "2015-12-15T18:33:10.9354508+01:00", 't2 property');
						equal(item.Dynamics.t3, "2015-12-15", 't3 property');
						equal(item.Dynamics.t4, false, 't4 property');
					
					}
				}
				
				
				start(1);
			})
						
			start(1);			
		})
	})
	
	test('read Service Action', 3, function () {
		stop(3);
		
		ctx.onReady(function(){
			
			ctx.SAction1(2, function(result){
				
				equal(result, 'a1_ 2', 'Action string result');
				
				start(1);
			})
			
			ctx.SAction2(2, function(articles){
				
				ok(articles.length > 1, 'read articles')
				
				if(articles.length){
					var item = articles[1]
					equal(item instanceof JayData.Test.CommonItems.Entities.Article, true, 'item type');
				}
				
				
				start(1);
			})
						
			start(1);			
		})
	})
	
	test('read Collection Action', 1, function () {
		stop(2);
		
		ctx.onReady(function(){
			
			ctx.TestTable2.GetTitles(3).toArray(function(result){
				deepEqual(result, ["1st row", "2nd row", "3rd row"], 'Action string list result');
				
				start(1);
			})
						
			start(1);			
		})
	})
	
	test('read Entity Action', 2, function () {
		stop(3);
		
		ctx.onReady(function(){
			
			ctx.TestTable2.toArray(function(items){
				ok(items.length > 0, 'has items')
				
				if(items.length){
					
					items[0].GetDisplayText(function(text){
						equal(text, items[0].Id + " - item", 'item GetDisplayText action result');
						
						start(1)
					})
					
				}				
				
				start(1);
			})
						
			start(1);			
		})
	})
});