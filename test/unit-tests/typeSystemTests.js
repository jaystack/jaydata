import mock$data from '../core.js';
import $data from 'jaydata/core';
import { expect } from 'chai';

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
  })
})
