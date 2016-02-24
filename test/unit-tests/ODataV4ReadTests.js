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
    var ctx = null
    //var base_MyTClass = null
    before(function(done){
        $data.initService("http://localhost:9000/odata", {}, function(_ctx){
            ctx = _ctx
            ctx.prepareRequest = function(r){
                r[0].headers = {
                    "Accept": "application/json;odata.metadata=full;q=0.9, */*;q=0.1",
                    "Content-Type": "application/json;IEEE754Compatible=true"
                }
            }
            //base_MyTClass = $data.Container.resolveType('JayData.Test.CommonItems.Entities.MyTClass')
            ctx.InitDb(function(){
                done()
            })
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

	/*describe('read base type', () => {

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
	})*/
    
    describe('take - skip test', () => {
		it('read articles', (done) => {
			ctx.Articles.skip(3).take(5).toArray(function(articles){
				expect(articles.length === 5).to.equal(true)

				if(articles.length){
					var item = articles[0]
					expect(item instanceof ctx.Articles.elementType).to.equal(true)
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

					expect(typeof item.dynamicProperties).to.equal("object");
					if(item.dynamicProperties) {
						expect(item.dynamicProperties.t0).to.equal(1);
						expect(item.dynamicProperties.t1).to.equal("xx");
						expect(item.dynamicProperties.t2).to.equal("2015-12-15T18:33:10.9354508+01:00");
						expect(item.dynamicProperties.t3).to.equal("2015-12-15");
						expect(item.dynamicProperties.t4).to.equal(false);
					}
				}

				done()
			})
		})
        
        it('create class', () => {
            var a = new ctx.TestTable2.elementType();
            var b = new ctx.TestTable2.elementType();
            
            expect(typeof a.dynamicProperties).to.equal("object");
            expect(typeof b.dynamicProperties).to.equal("object");
            
            expect(a.dynamicProperties).to.not.equal(b.dynamicProperties);
            
            a.dynamicProperties.p1 = 'jaydata'
            expect(a.dynamicProperties.p1).to.equal('jaydata');
            expect(b.dynamicProperties.p1).to.not.equal('jaydata');
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
        
        describe('function parameter alias', () => {
			it('no alias', () => {
                var q = ctx.Categories.SFunction1(3, "4", ["p3", "p4"]).toTraceString();
                
                expect(q.queryText).to.equal("/Categories/Default.SFunction1(p1=3,p2='4',p3=['p3','p4'])")
			})
            
            it('parameter config', () => {
                var config = ctx.getType().getMemberDefinition("Categories").actions.SFunction1.params[0]; 
                config.useAlias = true
                var q = ctx.Categories.SFunction1(3, "4", ["p3", "p4"]).toTraceString();
                
                expect(q.queryText).to.equal("/Categories/Default.SFunction1(p1=@p1,p2='4',p3=['p3','p4'])?@p1=3")
                delete config.useAlias;
			})
            
            it('service function config', () => {
                var config = ctx.getType().getMemberDefinition("Categories").actions.SFunction1; 
                config.useAlias = true
                var q = ctx.Categories.SFunction1(3, "4", ["p3", "p4"]).toTraceString();
                
                expect(q.queryText).to.equal("/Categories/Default.SFunction1(p1=@p1,p2=@p2,p3=@p3)?@p1=3&@p2='4'&@p3=['p3','p4']")
                delete config.useAlias;
			})
            
            it('context instance config', () => {
                var config = ctx.storageProvider.providerConfiguration; 
                config.useParameterAlias = true
                var q = ctx.Categories.SFunction1(3, "4", ["p3", "p4"]).toTraceString();
                
                expect(q.queryText).to.equal("/Categories/Default.SFunction1(p1=@p1,p2=@p2,p3=@p3)?@p1=3&@p2='4'&@p3=['p3','p4']")
                delete config.useParameterAlias;
			})
            
            it('global config', () => {
                var config = $data.defaults.OData; 
                config.useParameterAlias = true
                var q = ctx.Categories.SFunction1(3, "4", ["p3", "p4"]).toTraceString();
                
                expect(q.queryText).to.equal("/Categories/Default.SFunction1(p1=@p1,p2=@p2,p3=@p3)?@p1=3&@p2='4'&@p3=['p3','p4']")
                delete config.useParameterAlias;
			})
		})
        
        describe('read Collection Action with collection param', () => {
			it('Action string list result', (done) => {
                ctx.Categories.SAction1(3, "4", ["p3", "p4"]).toArray(function(result){

					expect(JSON.parse(JSON.stringify(result))).to.deep.equal(["a1_ ", "3", "4", "p3", "p4"]);

					done();
				})
			})
		})
        
        describe('read Collection Function with collection param', () => {
			it('Function string list result', (done) => {
                ctx.Categories.SFunction1(3, "4", ["p3", "p4"]).toArray(function(result){

					expect(JSON.parse(JSON.stringify(result))).to.deep.equal(["f1_ ", "3", "4", "p3", "p4"]);

					done();
				})
			})
		})

	})

})

