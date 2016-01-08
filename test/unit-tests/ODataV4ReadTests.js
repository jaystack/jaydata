import mock$data from '../core.js';
import $data from 'jaydata/core';
import oData from '../../src/Types/StorageProviders/oData'
import atob from 'atob'
import { expect } from 'chai';

//$data.setModelContainer(global)
$data.defaults.oDataWebApi = true;



describe('OData Enum', () => {

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

	before(function(done){
		ctx.onReady(function(ctx){
			done()
		})
	})

	describe('enum assignment', () => {

		it('enum value int', () => {
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myEnum = 1;
			expect(enumEnitiy.myEnum).to.equal(1)
		})

		it('enum value string', () => {
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myEnum = "Customer";
			expect(enumEnitiy.myEnum).to.equal(2);
		})

		it('enum value property', () => {
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myEnum = $data.testEnum.Guest;
			expect(enumEnitiy.myEnum).to.equal(4)
		})

	})

	describe('enum value', () => {
		var value = $data.testEnum.Customer;
		var convertedValue = undefined;

		it('enumType', () => {
			expect($data.testEnum.__enumType).to.equal($data.Integer)
		})

		it('fromDb converter', () => {
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.testEnum']
			convertedValue = fromDb(value)
			expect(convertedValue).to.equal(value)
		})

		it('escape converter', () => {
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.testEnum']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.testEnum']
			expect(escape(toDb(convertedValue))).to.equal( "$data.testEnum'2'")
		})

		it('url query', () => {
			var query = ctx.testEnumEntities.filter('it.myEnum == this.val', { val: value });
			expect(query.toTraceString().queryText).to.equal("/testEnumEntities?$filter=(myEnum eq $data.testEnum'2')")
		})
	})

	describe('str enum assignment', () => {

		it('enum value int', () => {
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myStrEnum = 'admin';
			expect(enumEnitiy.myStrEnum).to.equal('admin')
		})

		it('enum value string', () => {
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myStrEnum = "Customer";
			expect(enumEnitiy.myStrEnum).to.equal('customer');
		})

		it('enum value property', () => {
			var enumEnitiy = new testEnumEntity();
			enumEnitiy.myStrEnum = $data.testStrEnum.Guest;
			expect(enumEnitiy.myStrEnum).to.equal('guest')
		})

	})

	describe('str enum value', () => {
		var value = $data.testStrEnum.Customer;
		var convertedValue = undefined;

		it('enumType', () => {
			expect($data.testStrEnum.__enumType).to.equal($data.String)
		})

		it('fromDb converter', () => {
			var fromDb = ctx.storageProvider.fieldConverter.fromDb['$data.testStrEnum']
			convertedValue = fromDb(value)
			expect(convertedValue).to.equal(value)
		})

		it('escape converter', () => {
			var toDb = ctx.storageProvider.fieldConverter.toDb['$data.testStrEnum']
			var escape = ctx.storageProvider.fieldConverter.escape['$data.testStrEnum']
			expect(escape(toDb(convertedValue))).to.equal( "$data.testStrEnum'customer'")
		})

		it('url query', () => {
			var query = ctx.testEnumEntities.filter('it.myStrEnum == this.val', { val: value });
			expect(query.toTraceString().queryText).to.equal("/testEnumEntities?$filter=(myStrEnum eq $data.testStrEnum'customer')")
		})
	})

})


describe('OData protocol tests', function () {
	this.timeout(30 * 1000)

	// $data.Entity.extend('JayData.Test.CommonItems.Entities.User', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	LoginName: { type: 'Edm.String' },
	// 	Email: { type: 'Edm.String' },
	// 	UserType: { type: 'JayData.Test.CommonItems.Entities.UserType', nullable: false },
	// 	AuthoredArticles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Author" },
	// 	ReviewedArticles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Reviewer" },
	// 	Profile: { type: 'JayData.Test.CommonItems.Entities.UserProfile' }
	// })
	//
	// var UserType = $data.createEnum("JayData.Test.CommonItems.Entities.UserType", [
	// 	{ name: 'Admin', value: 0 },
	// 	{ name: 'Customer', value: 1 },
	// 	{ name: 'Guest', value: 2 }
	// ])
	//
	// var base_MyTClass = $data.Entity.extend('JayData.Test.CommonItems.Entities.MyTClass', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	Title: { type: 'Edm.String' }
	// }, {
	// 	openType: { value: true }
	// })
	//
	// var articleClass = base_MyTClass.extend('JayData.Test.CommonItems.Entities.Article',{
	// 	RowVersion: { type: 'Edm.Binary' },
	// 	Lead: { type: 'Edm.String' },
	// 	Body: { type: 'Edm.String' },
	// 	CreateDate: { type: 'Edm.DateTimeOffset' },
	// 	Thumbnail_LowRes: { type: 'Edm.Binary' },
	// 	Thumbnail_HighRes: { type: 'Edm.Binary' },
	// 	Category: { type: 'JayData.Test.CommonItems.Entities.Category', inverseProperty: "Articles" },
	// 	Tags: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.TagConnection', inverseProperty: "Article" },
	// 	Author: { type: 'JayData.Test.CommonItems.Entities.User', inverseProperty: "AuthoredArticles" },
	// 	Reviewer: { type: 'JayData.Test.CommonItems.Entities.User', inverseProperty: "ReviewedArticles" }
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.UserProfile', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	FullName: { type: 'Edm.String' },
	// 	Bio: { type: 'Edm.Binary' },
	// 	Avatar: { type: 'Edm.String' },
	// 	Birthday: { type: 'Edm.DateTimeOffset' },
	// 	Location: { type: 'JayData.Test.CommonItems.Entities.Location' },
	// 	User: { type: 'JayData.Test.CommonItems.Entities.User', required: true, nullable: false, inverseProperty: "Profile" }
	// })
	//
	// base_MyTClass.extend('JayData.Test.CommonItems.Entities.Category', {
	// 	RowVersion: { type: 'Edm.Binary' },
	// 	Subtitle: { type: 'Edm.String' },
	// 	Description: { type: 'Edm.String' },
	// 	Articles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Category" }
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.Tag', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	Title: { type: 'Edm.String' },
	// 	Articles: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.TagConnection', inverseProperty: "Tag" },
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.TestItem', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	i0: { type: 'Edm.Int32' },
	// 	b0: { type: 'Edm.Boolean' },
	// 	s0: { type: 'Edm.String' },
	// 	blob: { type: 'Array', elementType: 'Edm.Byte' },
	// 	n0: { type: 'Edm.Double' },
	// 	d0: { type: 'Edm.DateTimeOffset' },
	// 	g0: { type: 'Edm.Guid' },
	// 	l0: { type: 'Edm.Int64' },
	// 	de0: { type: 'Edm.Decimal', nullable: false, required: true },
	// 	b1: { type: 'Edm.Byte' }
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.TagConnection', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	Article: { type: 'JayData.Test.CommonItems.Entities.Article', inverseProperty: "Tags" },
	// 	Tag: { type: 'JayData.Test.CommonItems.Entities.Tag', inverseProperty: "Articles" }
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.TestItemGuid', {
	// 	Id: { type: 'Edm.Guid', nullable: false, required: true, key: true },
	// 	i0: { type: 'Edm.Int32' },
	// 	b0: { type: 'Edm.Boolean' },
	// 	s0: { type: 'Edm.String' },
	// 	time: { type: 'Edm.TimeOfDay', nullable: false },
	// 	date: { type: 'Edm.Date', nullable: false },
	// 	t: { type: 'Edm.DateTimeOffset', nullable: false },
	// 	dur: { type: 'Edm.Duration', nullable: false },
	// 	dtOffset: { type: 'Edm.DateTimeOffset', nullable: false },
	// 	lng: { type: 'Edm.Int64', nullable: false },
	// 	dec: { type: 'Edm.Decimal', nullable: false },
	// 	flt: { type: 'Edm.Single', nullable: false },
	// 	emails: { type: 'Array', elementType: 'Edm.String' },
	// 	Group: { type: 'JayData.Test.CommonItems.Entities.TestItemGroup', inverseProperty: "Items" },
	// 	GetDisplayText: { type: $data.ServiceAction, namespace: "Default", returnType: 'Edm.String', params: [] }
	// }, {
	// 	openType: { value: true }
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.TestItemGroup', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	Name: { type: 'Edm.String' },
	// 	Items: { type: 'Array', elementType: 'JayData.Test.CommonItems.Entities.TestItemGuid', inverseProperty: "Group" },
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.TestItemType', {
	// 	Id: { type: 'Edm.Int32', nullable: false, required: true, key: true },
	// 	blob: { type: 'Edm.Binary' },
	// 	b0: { type: 'Edm.Boolean' },
	// 	b1: { type: 'Edm.Byte' },
	// 	d0: { type: 'Edm.DateTimeOffset' },
	// 	de0: { type: 'Edm.Decimal', nullable: false, required: true },
	// 	n0: { type: 'Edm.Double' },
	// 	si0: { type: 'Edm.Single' },
	// 	g0: { type: 'Edm.Guid' },
	// 	i16: { type: 'Edm.Int16' },
	// 	i0: { type: 'Edm.Int32' },
	// 	i64: { type: 'Edm.Int64' },
	// 	s0: { type: 'Edm.String' }
	// })
	//
	// $data.Entity.extend('JayData.Test.CommonItems.Entities.Location', {
	// 	Address: { type: 'Edm.String' },
	// 	City: { type: 'Edm.String' },
	// 	Zip: { type: 'Edm.Int32', nullable: false, required: true },
	// 	Country: { type: 'Edm.String' }
	// })
	//
	//
	// var Context = $data.EntityContext.extend('Default.Container', {
	// 	Users: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.User' },
	// 	Articles: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.Article' },
	// 	UserProfiles: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.UserProfile' },
	// 	Categories: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.Category' },
	// 	Tags: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.Tag' },
	// 	TestTable: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItem' },
	// 	TagConnections: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TagConnection' },
	// 	TestTable2: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItemGuid',
	// 		actions: {
	// 			GetTitles: { type: $data.ServiceAction, namespace: "Default", returnType: '$data.Queryable', elementType: 'Edm.String', params: [{ name: 'count', type: 'Edm.Int32' }] }
	// 		}
	// 	},
	// 	TestItemGroups: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItemGroup' },
	// 	TestItemTypes: { type: $data.EntitySet, elementType: 'JayData.Test.CommonItems.Entities.TestItemType' },
	// 	SAction1: { type: $data.ServiceAction, returnType: 'Edm.String', params: [{ name: 'number', type: 'Edm.Int32' }] },
	// 	SAction2: { type: $data.ServiceAction, returnType: '$data.Queryable', elementType: 'JayData.Test.CommonItems.Entities.Article', EntitySet: 'Articles', params: [{ name: 'count', type: 'Edm.Int32' }] },
	// 	SFunction1: { type: $data.ServiceAction, returnType: 'Edm.String', params: [{ name: 'number', type: 'Edm.Int32' }] }
	// })
	//
	//
	// var ctx = new Context('http://localhost:9000/odata')
	// ctx.prepareRequest = function(r){
	// 	r[0].headers = {
	// 		"Accept": "application/json;odata.metadata=full;q=0.9, */*;q=0.1",
	// 		"Content-Type": "application/json;IEEE754Compatible=true"
	// 	}
	// }
	//
	// before(function(done){
	// 	ctx.onReady(function(ctx){
	// 		done()
	// 	})
	// })

    // var ctx = null
    // var base_MyTClass = null
    // before(function(done){
    //     var loader = new $data.MetadataDownloader({ url: "http://localhost:9000/odata/$metadata" })
    //     loader.load(function(factory){
    //         ctx = factory()
    //         ctx.prepareRequest = function(r){
    //             r[0].headers = {
    //                 "Accept": "application/json;odata.metadata=full;q=0.9, */*;q=0.1",
    //                 "Content-Type": "application/json;IEEE754Compatible=true"
    //             }
    //         }
    //         ctx.onReady(function(ctx){
    //             base_MyTClass = $data.Container.resolveType('JayData.Test.CommonItems.Entities.MyTClass')
    //
    //             done()
    //         })
    //     })
    // })

    // var ctx = null
    // var base_MyTClass = null
    // before(function(done){
    //     $data.service("http://localhost:9000/odata", function(factory){
    //         ctx = factory()
    //         ctx.prepareRequest = function(r){
    //             r[0].headers = {
    //                 "Accept": "application/json;odata.metadata=full;q=0.9, */*;q=0.1",
    //                 "Content-Type": "application/json;IEEE754Compatible=true"
    //             }
    //         }
    //         ctx.onReady(function(ctx){
    //             base_MyTClass = $data.Container.resolveType('JayData.Test.CommonItems.Entities.MyTClass')
    //
    //             done()
    //         })
    //     })
    // })

    var ctx = null
    var base_MyTClass = null
    before(function(done){
        $data.initService("http://localhost:9000/odata", {}, function(_ctx){
            ctx = _ctx
            ctx.prepareRequest = function(r){
                r[0].headers = {
                    "Accept": "application/json;odata.metadata=full;q=0.9, */*;q=0.1",
                    "Content-Type": "application/json;IEEE754Compatible=true"
                }
            }

            base_MyTClass = $data.Container.resolveType('JayData.Test.CommonItems.Entities.MyTClass')
            done()
        })
    })

	var createTest = function (typeName, setName, setLength, setFilterLength, propName, propValue, writeValue, propType, cfg) {
		cfg = cfg || {}
		//cfg.isDeepEqual
		cfg.valueConverter = cfg.valueConverter || function(v) { return v }

		describe('read ' + typeName, () => {

			it('read', (done) => {
				ctx[setName].toArray(function (r) {
					expect(r.length > 0).to.equal(true)
					expect(r.length).to.equal(setLength)

					if(r.length){
						var item = r[0]
						expect(typeof item[propName]).to.equal(propType)
						if(cfg.isDeepEqual){
							expect(item[propName]).to.deep.equal(propValue)
						} else {
							expect(cfg.valueConverter(item[propName])).to.equal(cfg.valueConverter(propValue))
						}
					}

					done();
				}, done)
			})

			if (!cfg.noFilter) {
				it('filter', (done) => {

					ctx[setName].filter('it.'+ propName + ' == this.val', {val:propValue}).toArray(function (r) {
						expect(r.length > 0).to.equal(true)
						expect(r.length).to.equal(setFilterLength)

						if(r.length){
							var item = r[0]
							expect(typeof item[propName]).to.equal(propType)
							if(cfg.isDeepEqual){
								expect(item[propName]).to.deep.equal(propValue)
							} else {
								expect(cfg.valueConverter(item[propName])).to.equal(cfg.valueConverter(propValue))
							}
						}

						done();
					}, done)
				})
			}

			it('map', (done) => {
				ctx[setName].map('it.' + propName).toArray(function (r) {
					expect(r.length > 0).to.equal(true)
					expect(r.length).to.equal(setLength)

					if(r.length){
						var item = r[0]
						expect(typeof item).to.equal(propType)
						if(cfg.isDeepEqual){
							expect(item).to.deep.equal(propValue)
						} else {
							expect(cfg.valueConverter(item)).to.equal(cfg.valueConverter(propValue))
						}
					}

					done();
				}, done)
			})

		})

		if (writeValue != undefined){
			describe('write ' + typeName, () => {

				it('write', (done) => {
					ctx[setName].toArray(function (r) {
						expect(r.length > 0).to.equal(true)
						expect(r.length).to.equal(setLength)

						if(r.length){
							var item = r[0]
							ctx[setName].attach(item);
							item[propName] = writeValue;

							ctx.saveChanges(function(cnt){
								expect(cnt).to.equal(1);
								ctx[setName].attach(item);
								item[propName] = propValue;
								ctx.saveChanges(function(cnt){
									expect(cnt).to.equal(1);
									done();
								}, done);
							}, done);
						}
					}, done);
				});

			})
		}
	}


	createTest('int16', 'TestItemTypes', 3, 1, 'i16', 23, 46, 'number')
	createTest('int32', 'TestItemTypes', 3, 1, 'i0', 42, 84, 'number')
	createTest('int64', 'TestItemTypes', 3, 1, 'i64', '1337', '2674', 'string')
	createTest('decimal', 'TestItemTypes', 3, 1, 'de0', '2.20', '4.40', 'string')
	createTest('float', 'TestItemTypes', 3, 1, 'si0', 4.25, 8.5, 'number')
	createTest('double', 'TestItemTypes', 3, 1, 'n0', 34.5, 71.25, 'number')
	createTest('byte', 'TestItemTypes', 3, 1, 'b1', 1, 2, 'number')
	createTest('boolean', 'TestItemTypes', 3, 2, 'b0', false, true, 'boolean')
	createTest('string', 'TestItemTypes', 3, 1, 's0', 'JayData', 'JayStack', 'string')
	createTest('binary', 'TestItemTypes', 3, 1, 'blob', $data.Container.convertTo(atob("aGVsbG8gamF5ZGF0YQ=="), '$data.Blob'), $data.Container.convertTo('hello jaystack', '$data.Blob'), 'object', { isDeepEqual: true })
	createTest('guid', 'TestItemTypes', 3, 1, 'g0', 'd89ade51-c58b-48a2-ba72-e9157165eb6e', 'd89ade51-c58b-48a2-ba72-e9157165eb6f', 'string')
	createTest('datetimeoffset', 'TestItemTypes', 3, 1, 'd0', new Date("2015-12-12T00:00:00+01:00"), new Date("2016-01-07T00:00:00+01:00"), 'object', {
		valueConverter: function(v) { return v.valueOf() }
	})

	createTest('timeofday', 'TestTable2', 3, 1, 'time', "15:10:15.000", undefined, 'string')
	createTest('date', 'TestTable2', 3, 1, 'date', "2015-12-12", undefined, 'string')
	createTest('duration', 'TestTable2', 3, 1, 'dur', "-PT5H45M", undefined, 'string')
	createTest('collection string', 'TestTable2', 3, 1, 'emails', ["a@example.com","b@example.com","c@example.com"], undefined, 'object', { isDeepEqual: true, noFilter: true })
	createTest('enum', 'Users', 6, 1, 'UserType', 0, undefined, 'number')

	describe('write', () => {
		it('create new', (done) => {
			var item = ctx.TestItemTypes.add({
				blob: 'hello jaystack',
				b0: true,
				b1: 255,
				d0: new Date("2016-01-07T00:00:00+01:00"),
				de0: '42.42',
				n0: 42.1,
				si0: 12.34,
				g0: 'd89ade51-c58b-48a2-ba72-e9157165eb6f',
				i16: 1234,
				i0: 42481,
				i64: '123457',
				s0: 'write me'
			})
			ctx.saveChanges(function(cnt){
				expect(cnt).to.equal(1);
				expect(typeof item.Id).to.equal('number');
				done();
			}, done)
		})

		it('delete', (done) => {
			ctx.TestItemTypes.filter(function(it){ return it.s0 == this.s0; }, { s0: 'write me' }).toArray(function(r){
				var item = r[0];
				ctx.TestItemTypes.remove(item);
				ctx.saveChanges(function(cnt){
					expect(cnt).to.equal(1);
					done();
				}, done)
			}, done);
		})
	})

	describe('read base type', () => {

		it('read articles', (done) => {
			ctx.Articles.toArray(function(articles){
				expect(articles.length > 0).to.equal(true)

				if(articles.length){
					var item = articles[0]
					expect(item instanceof base_MyTClass).to.equal(true)
					expect(typeof item.Id).to.equal("number")
					expect(typeof item.Title).to.equal("string")

					done()
				}
			})
		})

		it('read categories', (done) => {
			ctx.Articles.toArray(function(articles){
				expect(articles.length > 0).to.equal(true)

				if(articles.length){
					var item = articles[0]
					expect(item instanceof base_MyTClass).to.equal(true)
					expect(typeof item.Id).to.equal("number")
					expect(typeof item.Title).to.equal("string")

					done()
				}
			})
		})
	})
    
    describe('take - skip test', () => {
		it('read articles', (done) => {
			ctx.Articles.skip(3).take(5).toArray(function(articles){
				expect(articles.length === 5).to.equal(true)

				if(articles.length){
					var item = articles[0]
					expect(item instanceof base_MyTClass).to.equal(true)
					expect(typeof item.Id).to.equal("number")
					expect(typeof item.Title).to.equal("string")

					done()
				}
			})
		})
	})

	describe('read open type', () => {

		it('read items', (done) => {
			ctx.TestTable2.toArray(function(items){
				expect(items.length > 1).to.equal(true)

				if(items.length){
					var item = items[2]

					expect(typeof item.Dynamics).to.equal("object");
					if(item.Dynamics) {
						expect(item.Dynamics.t0).to.equal(1);
						expect(item.Dynamics.t1).to.equal("xx");
						expect(item.Dynamics.t2).to.equal("2015-12-15T18:33:10.9354508+01:00");
						expect(item.Dynamics.t3).to.equal("2015-12-15");
						expect(item.Dynamics.t4).to.equal(false);
					}
				}

				done()
			})
		})
	})

	describe('OData Actions', () => {
		describe('read Service Action', () => {

			it('Action string result', (done) => {
				ctx.SAction1(2, function(result){
					expect(result).to.equal('a1_ 2');
					done()
				})
			})

			it('Action Entity result', (done) => {
				ctx.SAction2(2, function(articles){
					expect(articles.length > 1).to.equal(true)

					if(articles.length){
						var item = articles[1]
						expect(item instanceof ctx.Articles.elementType).to.equal(true);
					}
					done()
				})
			})
		})

		describe('read Collection Action', () => {
			it('Action string list result', (done) => {
				ctx.TestTable2.GetTitles(3).toArray(function(result){

					expect(JSON.parse(JSON.stringify(result))).to.deep.equal(["1st row", "2nd row", "3rd row"]);

					done();
				})
			})
		})

		describe('read Entity Action', () => {
			it('item GetDisplayText action result', (done) => {
				ctx.TestTable2.toArray(function(items){
					expect(items.length > 0).to.equal(true)

					if(items.length){

						items[0].GetDisplayText(function(text){
							expect(text).to.equal(items[0].Id + " - item");

							done()
						})
					}
				})
			})
		})

	})

})
