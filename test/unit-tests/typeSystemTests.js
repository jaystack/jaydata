import mock$data from '../core.js';
import $data from 'jaydata/core';
import { expect } from 'chai';

function equal(actual, expected, msg) {
  it(msg, () => {
    expect(actual).to.equal(expected);
  });
}

function deepEqual(actual, expected, msg) {
  it(msg, () => {
    expect(actual).to.deepEqual(expected);
  });
}

function notEqual(actual, expected, msg) {
  it(msg, () => {
    expect(actual).to.not.equal(expected);
  });
}

function ok(actual, msg) {
  it(msg, () => {
    expect(actual !== undefined).to.equal(true);
  });
}

describe('typeSystemTests', () => {
  describe('Class framework initialization', () => {

    it('$data is defined', () => {
      expect($data).to.not.equal(undefined, "$data is not defined");
    });

    it('Class is defined', () => {
      expect("Class" in $data).to.equal(true, "Class is not defined");
    });
  });
  
  //define class
  var dataClass = $data.Class.define('dataClass', null, null, {
    constructor: function (param) {
      this.testProp = 5;
      this.param = param;
      this.testFunc2 = function () { return 'testfunc2'; };
    },
    testFunc: function () { return 'testfunc'; },
    getParam: function () { return this.param; },
    testProperty: {}
  }, null);

  describe('Type definition', () => {

    it('dataClass __class', () => {
      expect(dataClass.__class).to.equal(true);
    });

    it("dataClass name", () => {
      expect(dataClass.name).to.equal("dataClass");
    });

    it("dataClass equal with ctor", () => {
      expect(dataClass).to.equal(dataClass.prototype.constructor);
    });

    it("dataClass inherits from Base", () => {
      expect(dataClass.inheritsFrom.name).to.equal("Base");
    });

    it("dataClass memberDefinitions exists", () => {
      expect(dataClass.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });

    var defs = dataClass.memberDefinitions.asArray()
    it("dataClass memberDefinitions count", () => {
      expect(defs.length).to.equal(8);
    });

    it("dataClass memberDefinitions[0] type", () => {
      expect(defs[0].kind).to.equal("method");
    });

    it("dataClass memberDefinitions[3] type", () => {
      expect(defs[3].kind).to.equal("property");
    });
  });

  describe("Type definition - type alias", () => {
    var typeAlias = $data.Class.define('typeAlias', null, null, {
      prop1: { dataType: "@integer", key: true },
      prop2: { type: "@string" },
      prop3: { type: "@$data.String" },
      prop4: {},
      prop5: { type: $data.String },
      prop6: { type: "@date" }
    }, null);
    var memDef1 = typeAlias.getMemberDefinition('prop1');
    var memDef2 = typeAlias.getMemberDefinition('prop2');
    var memDef3 = typeAlias.getMemberDefinition('prop3');
    var memDef4 = typeAlias.getMemberDefinition('prop4');
    var memDef5 = typeAlias.getMemberDefinition('prop5');
    var memDef6 = typeAlias.getMemberDefinition('prop6');

    it('type equal failed', () => {
      expect(memDef1.dataType === "integer").to.be.true;
    });
    it('type equal failed', () => {
      expect(memDef1.type === "integer").to.be.true;
    });
    it('type equal failed', () => {
      expect($data.Container.resolveType(memDef1.dataType) === $data.Integer).to.be.true;
    });

    it('type equal failed', () => {
      expect(memDef2.dataType === "string").to.be.true;
    });
    it('type equal failed', () => {
      expect(memDef2.type === "string").to.be.true;
    });
    it('type equal failed', () => {
      expect($data.Container.resolveType(memDef2.dataType) === $data.String).to.be.true;
    });

    it('type equal failed', () => {
      expect(memDef3.dataType === "$data.String").to.be.true;
    });
    it('type equal failed', () => {
      expect(memDef3.type === "$data.String").to.be.true;
    });
    it('type equal failed', () => {
      expect($data.Container.resolveType(memDef3.dataType) === $data.String).to.be.true;
    });

    it('type equal failed', () => {
      expect(memDef4.dataType === undefined).to.be.true;
    });
    it('type equal failed', () => {
      expect(memDef4.type === undefined).to.be.true;
    });

    it('type equal failed', () => {
      expect(memDef5.dataType === $data.String).to.be.true;
    });
    it('type equal failed', () => {
      expect(memDef5.type === $data.String).to.be.true;
    });
    it('type equal failed', () => {
      expect($data.Container.resolveType(memDef5.dataType) === $data.String).to.be.true;
    });

    it('type equal failed', () => {
      expect(memDef6.dataType === "date").to.be.true;
    });
    it('type equal failed', () => {
      expect(memDef6.type === "date").to.be.true;
    });
    it('type equal failed', () => {
      expect($data.Container.resolveType(memDef6.dataType) === $data.Date).to.be.true;
    });
  });

  describe("Type instance", () => {
    var testClass = new dataClass('testParam');
    it("testClass is dataClass", () => {
      expect(testClass instanceof dataClass).to.be.true;
    });
    it("testClass is $data.MemberDefinitionCollection", () => {
      expect(testClass.constructor.memberDefinitions instanceof $data.MemberDefinitionCollection).to.be.true;
    });
    it("testClass invoke func", () => {
      expect(testClass.testFunc()).to.equal("testfunc");
    });
    it("testClass invoke func2", () => {
      expect(testClass.testFunc2()).to.equal("testfunc2");
    });
    it("testClass invoke property", () => {
      expect(testClass.param).to.equal("testParam");
    });
    it("testClass invoke property2", () => {
      expect(testClass.testProp).to.equal(5);
    });
    it("getPublicMappedProperties length", () => {
      expect(testClass.constructor.memberDefinitions.getPublicMappedProperties().length).to.equal(1);
    });
  });

  describe("Type definition - name with namespace", () => {
    var nsClass = $data.Class.define('$namespace5.hello.world.nsClass', null, null, {}, null);
    var myNsClass = new nsClass();

    it("nsClass is defined", () => {
      expect(nsClass).to.not.equal(undefined);
    });
    // it("$namespace5.hello.world.nsClass is defined", () => {
    //   expect($namespace5.hello.world.nsClass).to.be.undefined;
    // });
    it("$namespace5.hello.world.nsClass name is nsClass", () => {
      expect(nsClass.name).to.equal("nsClass");
    });
  });
  
  
  //define class with inheritence
  var classBase = $data.Class.define('classBase', dataClass, null, {
    constructor: function (param) {
      this.param2 = param;
    },
    classProp: {},
    classFunc: function (value) { return value; }
  }, null);

  describe("Type definition - Inheritance", () => {

    it("classBase __class", () => {
      expect(classBase.__class).to.equal(true);
    });
    it("classBase name", () => {
      expect(classBase.name).to.equal("classBase");
    });
    it("classBase equal with ctor", () => {
      expect(classBase).to.equal(classBase.prototype.constructor);
    });
    it("classBase inherits from dataClass", () => {
      expect(classBase.inheritsFrom.name).to.equal("dataClass");
    });
    it("dataClass memberDefinitions exists", () => {
      expect(classBase.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });

    var defs = classBase.memberDefinitions.asArray();
    it("classBase memberDefinitions count", () => {
      expect(defs.length).to.equal(10);
    });
    it("classBase memberDefinitions[0] - constructor type", () => {
      expect(defs[0].kind).to.equal("method");
    });
    it("classBase memberDefinitions[4] type", () => {
      expect(defs[4].kind).to.equal("method");
    });
    it("classBase memberDefinitions[5] type", () => {
      expect(defs[5].kind).to.equal("property");
    });
  });

  describe("Type instance - Inheritance", () => {
    var class2 = new classBase('class2Param');
    it("class2 is classBase", () => {
      expect(class2 instanceof classBase).to.equal(true);
    });
    it("class2 is dataClass", () => {
      expect(class2 instanceof dataClass).to.equal(true);
    });
    it("class2 is $data.MemberDefinitionCollection", () => {
      expect(class2.constructor.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });
    it("getPublicMappedProperties length", () => {
      expect(class2.constructor.memberDefinitions.getPublicMappedProperties().length).to.equal(2);
    });
    it("class2 invoke base func", () => {
      expect(class2.testFunc()).to.equal("testfunc");
    });
    it("class2 invoke base func2", () => {
      expect(class2.testFunc2()).to.equal("testfunc2");
    });
    it("class2 invoke base property", () => {
      expect(class2.param).to.equal("class2Param");
    });
    it("class2 invoke base property2", () => {
      expect(class2.testProp).to.equal(5);
    });
    it("testClass invoke property2", () => {
      expect(class2.param).to.equal(class2.param2);
    });
  });

  describe("Type instance - getType()", () => {
    var testClass = new dataClass('testParam');
    it("testClass getType", () => {
      expect(testClass.getType()).to.not.equal(undefined);
    });
    it("testClass getType name equal type name", () => {
      expect(testClass.getType().name).to.equal(dataClass.name);
    });
    it("testClass getType name equal ctor name", () => {
      expect(testClass.getType().name).to.equal(testClass.constructor.name);
    });

    var class2 = new classBase('class2Param');
    it("class2 getType name equal type name", () => {
      expect(class2.getType().name).to.equal(classBase.name);
    });
    it("class2 getType name equal ctor name", () => {
      expect(class2.getType().name).to.equal(class2.constructor.name);
    });


    it("class2 getType name notequal ctor name", () => {
      class2.constructor = function () { return {}; };
      expect(class2.getType().name).to.not.equal(class2.constructor.name);
    });
    it("class2 getType name equal type name", () => {
      expect(class2.getType().name).to.equal(classBase.name);
    });
  });

  var propertyDataClass = $data.Class.define('propertyDataClass', $data.Entity, null, {
    prop1: { dataType: "integer", value: 5, enumerable: true },
    prop2: { dataType: "string", value: "hello world" },
    prop3: { dataType: "string", enumerable: true },
    prop4: { dataType: "integer", value: 5, enumerable: false },
    prop5: { dataType: "string", enumerable: false },
    prop5_1: { dataType: "string" },
    prop6: 10,
    prop7: "hello world",
  }, null);

  describe("Type instance - properties", () => {
    var myPropClass = new propertyDataClass('testParam');
    it("prop1 is 5", () => {
      expect(myPropClass.prop1).to.equal(5);
    });
    it("prop1 is 'hello world'", () => {
      expect(myPropClass.prop2).to.equal("hello world");
    });
    it("prop1 is undefined", () => {
      expect(myPropClass.prop3).to.equal(undefined);
    });

    it('prop1 is enumberable', () => {
      expect(Object.keys(myPropClass).some(function (s) { return s == 'prop1'; })).to.equal(propertyDataClass.__copyPropertiesToInstance);
    });
    it('prop3 is enumberable', () => {
      expect(Object.keys(myPropClass).some(function (s) { return s == 'prop3'; })).to.equal(propertyDataClass.__copyPropertiesToInstance);
    });
    it('prop4 is not enumberable', () => {
      expect(Object.keys(myPropClass).some(function (s) { return s == 'prop4'; })).to.equal(false);
    });
    it('prop5_1 is enumberable', () => {
      expect(Object.keys(myPropClass).some(function (s) { return s == 'prop5_1'; })).to.equal(propertyDataClass.__copyPropertiesToInstance);
    });

    it("prop6 is 5", () => {
      expect(myPropClass.prop6).to.equal(10);
    });
    it("prop6 is 'hello world'", () => {
      expect(myPropClass.prop7).to.equal("hello world");
    });
  });

  describe("Type instance - property events", () => {
    var myPropClass = new propertyDataClass();
    it('event store property undefined', () => {
      expect(myPropClass._propertyChanging).to.equal(undefined);
    });
    it('event property defined', () => {
      expect(myPropClass.propertyChanging.getType().name).to.equal("Event");
    });
    it('event store property not undefined', () => {
      expect(myPropClass._propertyChanging).to.not.equal(undefined);
    });

    it('event property defined', () => {
      expect(myPropClass.propertyChanged.getType().name).to.equal("Event");
    });
    it('event store property not undefined', () => {
      expect(myPropClass._propertyChanged).to.not.equal(undefined);
    });

    myPropClass.prop3 = 5;
    myPropClass.propertyChanged.attach(function (sender, eventData) {
      it("event sender", () => {
        expect(myPropClass).to.equal(sender);
      });
      it("changed property name", () => {
        expect(eventData.propertyName).to.equal('prop3');
      });
      it("old property value", () => {
        expect(eventData.oldValue == 5).to.equal(true);
      });
      it("new property value", () => {
        expect(eventData.newValue == 7).to.equal(true);
      });
    });

    myPropClass.prop3 = 7;
  });
  
  //defineEx class with inheritence
  var classEx = $data.Class.define('classEx', dataClass, null, {
    constructor: function (param) {
      this.param2 = param;
    },
    classProp: {},
    classFunc: function (value) { return value; }
  }, null);

  describe("Type definition - Inheritance", () => {
    it("classEx __class", () => {
      expect(classEx.__class).to.equal(true);
    });
    it("classEx name", () => {
      expect(classEx.name).to.equal("classEx");
    });
    it("classEx equal with ctor", () => {
      expect(classEx).to.equal(classEx.prototype.constructor);
    });
    it("classEx inherits from dataClass", () => {
      expect(classEx.inheritsFrom.name).to.equal("dataClass");
    });
    it("classEx memberDefinitions exists", () => {
      expect(classEx.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });
    it("classEx memberDefinitions count", () => {
      expect(classEx.memberDefinitions.asArray().length).to.equal(10);
    });


    it("classEx memberDefinitions[0] type", () => {
      expect(classBase.memberDefinitions.asArray()[0].kind).to.equal("method");
    });
    it("classEx memberDefinitions[4] type", () => {
      expect(classBase.memberDefinitions.asArray()[4].kind).to.equal("method");
    });
    it("classEx memberDefinitions[5] type", () => {
      expect(classBase.memberDefinitions.asArray()[5].kind).to.equal("property");
    });
  });

  describe("Type instance extended - Inheritance", () => {
    var class2 = new classBase('class2Param');
    it("class2 is classBase", () => {
      expect(class2 instanceof classBase).to.equal(true);
    });
    it("class2 is dataClass", () => {
      expect(class2 instanceof dataClass).to.equal(true);
    });
    it("class2 has members", () => {
      expect(class2.constructor.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });
    it("class2 invoke func", () => {
      expect(class2.testFunc()).to.equal("testfunc");
    });
    it("class2 invoke func2", () => {
      expect(class2.testFunc2()).to.equal("testfunc2");
    });
    it("class2 invoke property", () => {
      expect(class2.param).to.equal("class2Param");
    });
    it("class2 invoke property2", () => {
      expect(class2.testProp).to.equal(5);
    });

    it("class2 is dataClass", () => {
      expect(class2 instanceof dataClass).to.equal(true);
    });
    it("testClass invoke property2", () => {
      expect(class2.param).to.equal(class2.param2);
    });
  });

  var simpleClass = $data.Class.define('simpleClass', null, null, {
    constructor: function () {
      this.simpleProp = 5;
      this.ctorArguments = arguments;
      this.array = [];
    },
    simpleProp: {},
    simpleFunc: function (input) { return input + this.simpleProp; },
    reverse: function (input) { return input.reverse(); },
    reverse2: function (input) { return input.reverse(); }
  }, null);

  describe("Type instance calculated val", () => {
    var class3 = new simpleClass();
    it("class3 property", () => {
      expect(class3.simpleProp).to.equal(5);
    });
    it("class3 calculated val func", () => {
      expect(class3.simpleFunc(3)).to.equal(8);
    });

    it("class3 property", () => {
      expect(class3.simpleProp + 2).to.equal(7);
    });
    it("class3 calculated val func", () => {
      expect(class3.simpleFunc(3) + 2).to.equal(10);
    });

    var class3_1 = new simpleClass();
    it("inst1 array length must be 0", () => {
      expect(class3.array.length).to.equal(0);
    });
    it("inst2 array length must be 0", () => {
      expect(class3_1.array.length).to.equal(0);
    });

    it("inst1 array length must be 1", () => {
      class3.array.push('j');
      expect(class3.array.length).to.equal(1);
    });
    it("inst2 array length must be 0", () => {
      expect(class3_1.array.length).to.equal(0);
    });
    it("array is defined on instace", () => {
      expect(class3.hasOwnProperty("array")).to.equal(true);
    });
  });

  var simpleClass2 = $data.Class.define('simpleClass2', null, null, {
    constructor: function () {
      this.ctorArguments = arguments;
    }
  }, null);

  var mixClass2 = $data.Class.defineEx('mixClass2', [
    { type: dataClass, params: [new $data.Class.ConstructorParameter(0), 'hello2', 1337] },
    { type: simpleClass, propagateTo: 'simpleClass' },
    { type: simpleClass2, params: [new $data.Class.ConstructorParameter(1), 8080], propagateTo: 'simpleClass2' }
  ], null, {
      constructor: function () {
        this.ctorArguments = arguments;
      },
      reverse2: function (input) { return input; },
      simpleClass: {},
      simpleClass2: {}
    }, null);

  describe("Type instance - propagation - ctor parameters", () => {
    var class4 = new mixClass2('param0', 'world', 1, 2, 3, 4, 5);
    it("class4 is dataClass", () => {
      expect(class4 instanceof dataClass).to.equal(true);
    });
    it("class4 is simpleClass", () => {
      expect(class4 instanceof simpleClass).to.equal(false);
    });
    it("class4 is simpleClass2", () => {
      expect(class4 instanceof simpleClass2).to.equal(false);
    });

    it('mixin exists', () => {
      expect(class4.simpleClass).to.not.equal(undefined);
    });
    it('mixin exists', () => {
      expect(class4.simpleClass2).to.not.equal(undefined);
    });

    it('class4 constructor parameters count', () => {
      expect(class4.ctorArguments.length).to.equal(7);
    });
    it('class4 constructor parameter', () => {
      expect(class4.ctorArguments[0]).to.equal('param0');
    });
    it('class4 constructor parameter', () => {
      expect(class4.ctorArguments[1]).to.equal('world');
    });
    it('class4 constructor parameter', () => {
      expect(class4.ctorArguments[2]).to.equal(1);
    });

    it("class4 simpleClass's constructor parameter count", () => {
      expect(class4.simpleClass.ctorArguments.length).to.equal(7);
    });

    it("class4 simpleClass2's constructor parameter count", () => {
      expect(class4.simpleClass2.ctorArguments.length).to.equal(2);
    });
    it("class4 simpleClass2's constructor parameter", () => {
      expect(class4.simpleClass2.ctorArguments[0]).to.equal('world');
    });
    it("class4 simpleClass2's constructor parameter", () => {
      expect(class4.simpleClass2.ctorArguments[1]).to.equal(8080);
    });

    var class5 = new mixClass2('hello', 'world');
    it('class5 constructor parameters count', () => {
      expect(class5.ctorArguments.length).to.equal(2);
    });
    it('class5 constructor parameter', () => {
      expect(class5.ctorArguments[0]).to.equal('hello');
    });
    it('class5 constructor parameter', () => {
      expect(class5.ctorArguments[1]).to.equal('world');
    });
    it('class5 constructor parameter', () => {
      expect(class5.ctorArguments[2]).to.equal(undefined);
    });

    it("class5 simpleClass's constructor parameter count", () => {
      expect(class5.simpleClass.ctorArguments.length).to.equal(2);
    });

    it("class5 simpleClass2's constructor parameter count", () => {
      expect(class5.simpleClass2.ctorArguments.length).to.equal(2);
    });
    it("class5 simpleClass2's constructor parameter", () => {
      expect(class5.simpleClass2.ctorArguments[0]).to.equal('world');
    });
    it("class5 simpleClass2's constructor parameter", () => {
      expect(class5.simpleClass2.ctorArguments[1]).to.equal(8080);
    });
  });

  var simpleClass3 = $data.Class.define('simpleClass3', null, null, {
    constructor: function () {
      this.ctorArguments = arguments;
    },
  }, null);

  var mixClass3 = $data.Class.defineEx('mixClass3', [
    { type: dataClass, params: [new $data.Class.ConstructorParameter(0), 'almafa', 1337] },
    { type: simpleClass, propagateTo: 'simpleClass' },
    { type: simpleClass3, params: [function () { return this; }, function () { return this.simpleClass; }, new $data.Class.ConstructorParameter(1), 8080], propagateTo: 'simpleClass3' }
  ], null, {
      constructor: function () {
        this.ctorArguments = arguments;
      },
      reverse2: function (input) { return input; },
      simpleClass: {},
      simpleClass3: {}
    }, null);

  describe("Type instance - propagation - ctor parameters", () => {
    var class4 = new mixClass3('param0');
    it("class4 constructor parameters count", () => {
      expect(class4.simpleClass3.ctorArguments.length).to.equal(4);
    });
    it("class4 not defined parameter", () => {
      expect(class4.simpleClass3.ctorArguments[2]).to.equal(undefined);
    });
    it("class4 first function parameter", () => {
      expect(class4.simpleClass3.ctorArguments[0].constructor.name).to.equal(mixClass3.name);
    });
    it("class4 second funtion parameter", () => {
      expect(class4.simpleClass3.ctorArguments[1].constructor.name).to.equal(simpleClass.name);
    });
  });

  var propClass = $data.Class.define('propClass', null, null, {
    constructor: function () {
      this.prop1 = 1;
      this.prop2 = 2;
      this.prop3 = 3;
      this.prop4 = 4;
    },
    prop1: {},
    prop2: {},
    prop3: {},
    prop4: {}
  }, null);

  var mixinClass = $data.Class.defineEx('mixinClass', [
    { type: null },
    { type: propClass }
  ], null, {
      constructor: function () {
        this.prop2 = 12;
        this.prop5 = 5;
      },
      prop2: {},
      prop5: {},
      testFunc: function (input) { return input; }
    }, null);

  describe("Type definition - mixin", () => {
    it("mixinClass __class", () => {
      expect(mixinClass.__class).to.equal(true);
    });
    it("mixinClass name", () => {
      expect(mixinClass.name).to.equal("mixinClass");
    });
    it("mixinClass equal with ctor", () => {
      expect(mixinClass).to.equal(mixinClass.prototype.constructor);
    });
    it("mixinClass inherits from Base", () => {
      expect(mixinClass.inheritsFrom.name).to.equal("Base");
    });
    it("mixinClass memberDefinitions exists", () => {
      expect(mixinClass.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });
    it("mixinClass memberDefinitions count", () => {
      expect(mixinClass.memberDefinitions.asArray().length).to.equal(11);
    });

    it("mixinClass mixins count", () => {
      expect(mixinClass.mixins.length).to.equal(1);
    });
    it("mixinClass mixin - simpleClass", () => {
      expect(mixinClass.mixins[0].type).to.equal(propClass);
    });
  });

  describe("Type instance - mixin", () => {
    var class4 = new mixinClass();
    it("class4 has members", () => {
      expect(class4.constructor.memberDefinitions instanceof $data.MemberDefinitionCollection).to.equal(true);
    });
    it("class4 member count", () => {
      expect(class4.constructor.memberDefinitions.asArray().length).to.equal(11);
    });

    it("class4 mixin's prop value", () => {
      expect(class4.prop1).to.equal(1);
    });
    it("class4 prop value, mixin not override", () => {
      expect(class4.prop2).to.equal(12);
    });
    it("class4 prop value", () => {
      expect(class4.prop5).to.equal(5);
    });
  });

  var propClass2 = $data.Class.define('propClass2', null, null, {
    constructor: function () {
      this.prop11 = 11;
      this.prop12 = 12;
      this.prop13 = 13;
    },
    prop11: {},
    prop12: {},
    prop13: {},
    prop14: {}
  }, null);

  var mixinClass2 = $data.Class.defineEx('mixinClass', [
    { type: null },
    { type: propClass, kind: 'mixin' },
    { type: propClass2, kind: 'mixin' }
  ], null, {
      constructor: function () {
        this.prop2 = 12;
        this.prop12 = 5;
      },
      prop2: {},
      prop5: {},
      testFunc: function (input) { return input; }
    }, null);

  describe("Type instance - mixin double", () => {
    var class4 = new mixinClass2();
    it("mixinClass2 mixins count", () => {
      expect(mixinClass2.mixins.length).to.equal(2);
    });
    it("class4 member count", () => {
      expect(class4.constructor.memberDefinitions.asArray().length).to.equal(15);
    });

    it("class4 prop value not set", () => {
      expect(class4.prop5).to.equal(undefined);
    });

    it("class4 prop value", () => {
      expect(class4.prop11).to.equal(11);
    });
    it("class4 mixin property set in constructor", () => {
      expect(class4.prop12).to.equal(5);
    });
    it("class4 mixin's prop value not set", () => {
      expect(class4.prop14).to.equal(undefined);
    });
  });

  var mixinClass3 = $data.Class.defineEx('mixinClass', [
    { type: null },
    { type: propClass, propagateTo: 'propClass' },
    { type: propClass2 }
  ], null, {
      constructor: function () {
        //not inicialized exception
        //this.prop2 = 12;
        this.prop12 = 5;
      },
      prop5: {},
      propClass: {},
      testFunc: function (input) { return input; }
    }, null);

  describe("Type instance - mixin & propagation", () => {
    it("mixinClass2 mixins count", () => {
      expect(mixinClass2.mixins.length).to.equal(2);
    });

    equal(mixinClass3.propagations.length, 1, "mixinClass2 propagations count");
    equal(mixinClass3.mixins.length, 1, "mixinClass2 mixins count");

    var class4 = new mixinClass3();

    equal(class4.prop1, 1, "class4 propagations's prop value");
    equal(class4.prop2, class4.propClass.prop2, "class4 propagations prop value override");
    notEqual(class4.prop2, 12, "class4 propagations prop value override");
    equal(class4.prop2, 2, "class4 propagations prop value override");

    equal(class4.prop3, 3, "class4 propagations prop value override");
    equal(class4.prop5, undefined, "class4 prop value not set");

    equal(class4.prop11, 11, "class4 prop value");
    equal(class4.prop12, 5, "class4 mixin property set in constructor");
    equal(class4.prop14, undefined, "class4 mixin's prop value not set");

  });

  describe("Container - override", () => {
    try {
      $data.Container.resolveType('$some.int');
      ok(false, "exception were expected");
    } catch (e) {
      equal(e.message, 'Unable to resolve type:$some.int', 'type override throw error failed');
    }

    $data.Container.registerType('$some.int', $data.Integer);
    console.log('int overrid - TEST! $data.Integer to $data.Integer');
    equal($data.Container.resolveType('$some.int'), $data.Integer, 'int override failed');

  });

  describe("Type simple mixin", () => {
    var Types = {};
    Types.A = $data.Class.define("Types.A", null, null, {
    });

    Types.B = $data.Class.define("Types.B", null, null, {
    });

    Types.C = $data.Class.defineEx("Types.C", [Types.A, Types.B], null, {
    });

    equal(Types.C.mixins.length, 1, 'mixins count failed');
    equal(Types.C.mixins[0].type.fullName, 'Types.B', 'mixin failed');
    equal(Types.C.inheritsFrom.fullName, 'Types.A', 'mixin failed');

  });

  describe('Type inhertitance ctor init', () => {
    var Types = {};
    Types.AA = $data.Entity.extend("Types.AA", {
      Title: { type: 'string' }
    });

    Types.BB = Types.AA.extend("Types.BB", {
      Desc: { type: 'string' }
    });

    var item = new Types.AA({ Title: 'hello', Desc: 'world', Age: 23 });
    equal(item.Title, 'hello', 'AA.Title ctor init failed');
    notEqual(item.Desc, 'world', 'AA.Desc ctor init failed');
    equal(item.Desc, undefined, 'AA.Desc ctor init failed');
    notEqual(item.Age, 23, 'AA.Age ctor init failed');
    equal(item.Age, undefined, 'AA.Age ctor init failed');

    item = new Types.BB({ Title: 'hello', Desc: 'world', Age: 23 });
    equal(item.Title, 'hello', 'BB.Title ctor init failed');
    equal(item.Desc, 'world', 'BB.Desc ctor init failed');
    notEqual(item.Age, 23, 'BB.Age ctor init failed');
    equal(item.Age, undefined, 'BB.Age ctor init failed');
  });

  describe("Extends fail", () => {
    try {
      var target = "";
      var obj = { a: 1 };
      $data.typeSystem.extend(target, obj);
      ok(false, "exception were expected");
    } catch (e) {
      equal(e.message, 'Exception thrown');
    }
  });

  describe("Extends noparam", () => {
    var target = { a: 1 };
    $data.typeSystem.extend(target);
    equal(Object.keys(target).length, 1, "Key count");
    equal(target.a, 1, "Param value");
  });

  describe("Extends multiple param", () => {
    var target = { a: 1 };
    var obj1 = { b: 2 };
    var obj2 = { c: 3 };
    $data.typeSystem.extend(target, obj1, obj2);
    equal(Object.keys(target).length, 3, "Key count");
    equal(target.a, 1, "Param 'a'");
    equal(target.b, 2, "Param 'b'");
    equal(target.c, 3, "Param 'c'");
  });

  describe("Extends overwrite", () => {
    var target = { a: 1 };
    var obj = { a: 2 };
    $data.typeSystem.extend(target, obj);
    equal(Object.keys(target).length, 1, "Key count");
    equal(target.a, 2, "Param 'a'");
  });

  describe("Extends multiple param overwrite", () => {
    var target = { a: 1 };
    var obj1 = { a: 2 };
    var obj2 = { a: 3 };
    $data.typeSystem.extend(target, obj1, obj2);
    equal(Object.keys(target).length, 1, "Key count");
    equal(target.a, 3, "Param 'a'");
  });

  describe("Trace tests", () => {
    equal(typeof $data.TraceBase, 'function', '$data.TraceBase exists failed');

    notEqual(typeof $data.Trace, 'undefined', '$data.Trace exists failed');

    equal(typeof $data.Logger, 'function', '$data.Logger exists failed');

    try {
      $data.Trace.log('hello', 'console', 42, { prop: 24 }, [1, 2, 3]);
      $data.Trace = new $data.Logger();
      $data.Trace.log('hello', 'console', 42, { prop: 24 }, [1, 2, 3]);
      $data.Trace = new $data.TraceBase();
      ok(true, '$data.Trace not throw exception');
    } catch (e) {
      ok(false, '$data.Trace failed: ' + e);
    }
  });

  describe('Type add member', () => {
    var Types = {};
    Types.AAExtended = $data.Entity.extend("Types.AAExtended", {
      Title: { type: 'string' }
    });

    var item = new Types.AAExtended({ Title: 'hello', Desc: 'world', Age: 23 });
    equal(item.Title, 'hello', '1 Title ctor init failed');
    notEqual(item.Desc, 'world', '1 Desc ctor init failed');
    equal(item.Desc, undefined, '1 Desc ctor init failed');
    notEqual(item.Age, 23, '1 Age ctor init failed');
    equal(item.Age, undefined, '1 Age ctor init failed');

    it('1 public members failed', () => {
      var props = Types.AAExtended.memberDefinitions.getPublicMappedProperties().map(function (def) { return def.name; });
      expect(props).to.deepEqual(['Title']);
    });

    Types.AAExtended.addMember('Desc', {
      type: 'string'
    });

    item = new Types.AAExtended({ Title: 'hello', Desc: 'world', Age: 23 });
    equal(item.Title, 'hello', '2 Title ctor init failed');
    equal(item.Desc, 'world', '2 Desc ctor init failed');
    notEqual(item.Age, 23, '2 Age ctor init failed');
    equal(item.Age, undefined, '2 Age ctor init failed');

    
    it('1 public members failed', () => {
      var props = Types.AAExtended.memberDefinitions.getPublicMappedProperties().map(function (def) { return def.name; });
      expect(props).to.deepEqual(['Title', 'Desc']);
    });


    Types.BBExtended = Types.AAExtended.extend("Types.BBExtended", {
      Age: { type: 'int' }
    });

    item = new Types.AAExtended({ Title: 'hello', Desc: 'world', Age: 23 });
    equal(item.Title, 'hello', '3 Title ctor init failed');
    equal(item.Desc, 'world', '3 Desc ctor init failed');
    notEqual(item.Age, 23, '3 Age ctor init failed');
    equal(item.Age, undefined, '3 Age ctor init failed');

    var props = Types.AAExtended.memberDefinitions.getPublicMappedProperties().map(function (def) { return def.name; });
    deepEqual(props, ['Title', 'Desc'], '1 public members failed');

    item = new Types.BBExtended({ Title: 'hello', Desc: 'world', Age: 23 });
    equal(item.Title, 'hello', '3 Title ctor init failed');
    equal(item.Desc, 'world', '3 Desc ctor init failed');
    equal(item.Age, 23, '3 Age ctor init failed');

    props = Types.BBExtended.memberDefinitions.getPublicMappedProperties().map(function (def) { return def.name; });
    deepEqual(props, ['Age', 'Title', 'Desc'], '1 public members failed');


    Types.AAExtended.addMember('memberFunc', function (param1) {
      return 'hello world' + param1;
    });

    equal(typeof item.memberFunc, 'function', 'function defined');
    equal(item.memberFunc('!!!'), 'hello world!!!', 'defined function call');
    var props = Types.AAExtended.memberDefinitions.getPublicMappedProperties().map(function (def) { return def.name; });
    deepEqual(props, ['Title', 'Desc'], 'public members failed 2');
    var member = Types.AAExtended.memberDefinitions.getMember('memberFunc');
    equal(member instanceof $data.MemberDefinition, true, 'member type');
    equal(member.kind, 'method', 'member kind');
    equal(typeof member.method, 'function', 'member method');

  });
  
  
  
  
  //////////////////////////////////


  describe('type with default values', () => {
    var sharedArray = [];
    var mt = $data.define("MyType", {
      Field: { type: String, defaultValue: "alma" },
      Field2: { type: String, defaultValue: function () { return "korte" } },
      Field3: { type: "Array", defaultValue: function () { return [] } },
      Field4: { type: Array, defaultValue: sharedArray }
    });

    var i = new mt();
    equal(i.Field, "alma", "primitive default value set");
    equal(i.Field2, "korte", "function based default value set");

    var i2 = new mt({ Field: "huhu" });
    equal(i2.Field, "huhu", "init data overrides default values");
    equal(i2.Field2, undefined, "upon init data default values are not set");

    var i3 = new mt({});
    equal(i3.Field, "alma", "empty init data is no init data");

    var i4 = new mt({}, { setDefaultValues: false });
    equal(i4.Field, undefined, "opt out init data");
    equal(i4.Field2, undefined, "opt out init data");

    var i0 = new mt();
    var i1 = new mt();
    ok(i0.Field3 !== i1.Field3, "pointer values differ");
    ok(i0.Field4 === i1.Field4, "pointer values equal");


  });

  describe('forward declaration', () => {


    var Apple = $data.define("Apple", { Basket: "Basket" });
    equal(Apple.getMemberDefinition("Basket").type, "Basket", "forward declared type is not resolved yet");
    var Basket = $data.define("Basket", {});
    equal(Apple.getMemberDefinition("Basket").type, "Basket", "forward declared type is not resolved yet");
    Apple.resolveForwardDeclarations();
    equal(Apple.getMemberDefinition("Basket").type, Basket, "forward declared type is resolved");

    var BeeHive = $data.define("BeeHive", {
      Bees: { type: "Array", elementType: "Bee" },
      Wasps: { type: "Array", elementType: "Wasp" }
    });
    equal(BeeHive.getMemberDefinition("Bees").type, "Array", "declared type is not resolved");
    equal(BeeHive.getMemberDefinition("Bees").elementType, "Bee", "forward declared type is not resolved yet");

    var Bee = $data.define("Bee", {});
    var Wasp = $data.define("Wasp", {});
    equal(BeeHive.getMemberDefinition("Bees").elementType, "Bee", "forward declared type is not resolved yet");
    equal(BeeHive.getMemberDefinition("Bees").type, "Array", "declared type is not yet resolved");
    BeeHive.resolveForwardDeclarations();
    equal(BeeHive.getMemberDefinition("Bees").elementType, Bee, "forward declared type is resolved ");
    equal(BeeHive.getMemberDefinition("Bees").type, $data.Array, "declared type is resolved");
    equal(BeeHive.getMemberDefinition("Wasps").elementType, Wasp, "forward declared type is resolved ");
    equal(BeeHive.getMemberDefinition("Wasps").type, $data.Array, "declared type is resolved");

    var c1 = $data.createContainer();
    var T1 = $data.define("T1", c1, { F1: { type: "T2" } });
    try {
      T1.resolveForwardDeclarations();
      ok(false, "T2 type should not be found");
    } catch (exception) {
      ok(true, "T2 not found exception");
    };

    var T11 = $data.define("T11", c1, { F1: { type: "T2" } });
    var T2 = $data.define("T2", {});
    try {
      T11.resolveForwardDeclarations();
      ok(true, "T2 type should be found in global container");
    } catch (exception) {
      ok(false, "T2 not found exception");
    };


    var T12 = $data.define("T12", c1, { F1: { type: "T2" } });
    var T2_ = $data.define("T2", c1, {});
    try {
      T12.resolveForwardDeclarations();
      ok(true, "T2 type should be found in global container");
    } catch (exception) {
      ok(false, "T2 not found exception");
    };
    equal(T12.getMemberDefinition("F1").type, T2_, "local type found");

    var TParent = $data.define("TParent", {
      F1: { type: "TSub" }
    });

    var TSub = $data.define("TSub", {
      F1: { type: "TSubSub" }
    });

    var TSubSub = $data.define("TSubSub", {
    });

    TParent.resolveForwardDeclarations();
    equal(TSub.getMemberDefinition("F1").type, TSubSub, "second level is resolved");

    //var T3 = $data.define("T2", c)

    //var c2 = $data.createContainer();
  });

  describe('Containers', () => {
    var container = $data.createContainer();
    var dynaType = $data.Entity.extend("FoobarTypeName", container, {
      F1: { type: 'String' }
    }, {

      });
    equal(typeof FoobarTypeName, "undefined", "type is not globally visible");
    equal(typeof container.FoobarTypeName, "function", "type is visible on container");
    ok($data.Container.resolveType(container.FoobarTypeName), "main container can resolve type");
    ok(container.resolveType(container.FoobarTypeName), "sub container can resolve type");
    equal($data.Container.resolveName(container.FoobarTypeName), "FoobarTypeName", "main container can resolve type");

    $data.define("RuntimeType1", {});
    equal(typeof RuntimeType1, "function", "type is globally visible");

    $data.define("RuntimeType2", container, { F1: { type: String, defaultValue: 'foobar' } });
    equal(typeof RuntimeType2, "undefined", "type is globally not visible");
    equal(typeof container.RuntimeType2, "function", "type is container visible");
    ok($data.Container.getIndex(container.RuntimeType2) > 0, "local type has global index");
    var instance = new container.RuntimeType2();
    equal(instance.F1, 'foobar', 'contained type supports defaultValue');


  });

  describe('IoC', () => {

    var pt = $data.Entity.extend("PureType", {});

    var ip = $data.Entity.extend("ImplementationType", { F1: { type: 'string' } });

    var i = pt.create();
    ok(i instanceof pt, "type initially is type");
    $data.Container.mapType(pt, ip);
    var i2 = pt.create();
    ok(i2 instanceof ip, "type is mapped");

    var container = $data.createContainer();

    var ptc = $data.Entity.extend("PureType", container, {});

    var ipc = $data.Entity.extend("ImplementationType", container, { F1: { type: 'string' } });

    var i3 = ptc.create();
    ok(i3 instanceof ptc, "contained type initially is type");
    $data.Container.mapType(ptc, ipc);
    var i4 = ptc.create();
    ok(i4 instanceof ipc, "contained type is mapped");

  })


});
