import $data, { $C, Guard, Container, Exception, MemberDefinition } from '../TypeSystem/index.js';


$data.createEnum = function (name, container, enumType, enumDefinition) {
    return $data.Enum.extend(name, container, enumType, enumDefinition);
}


$data.Enum = $data.Class.define("$data.Enum", null, null, {
    constructor: function(){
        return Guard.raise(new Exception("Type Error", "Cannot create instance from enum type!"))  
    }
}, {
    extend: function(name, container, enumType, enumDefinition){
        if (!enumDefinition) {
            if(!enumType){
                enumDefinition = container;
                container = undefined;    
            } else {
                enumDefinition = enumType;
                enumType = container;
                container = undefined;    
            }
        }
        
        enumType = enumType || $data.Integer;
        enumType = Container.resolveType(enumType);
        var classDefinition = {
            __enumType: { get: function(){ return enumType }, set: function() { }, enumerable: false, writable: false }
        };
        
        var getEnumDef = function(value, index){
            return { get: function() { return value }, set: function() { }, enumMember: true, index: index }
        }
        
        var defaultValue = 0;
        var isValueCalculation = [$data.Byte, $data.SByte, $data.Int16, $data.Integer, $data.Int64].indexOf(enumType) >= 0;
        var hasIndex = false;
        
        var enumDef = [];
        if (Array.isArray(enumDefinition)) {
            for(var i = 0; i < enumDefinition.length; i++){
                var enumValA = enumDefinition[i];
                if(typeof enumValA === "object" && typeof enumValA.name === "string"){
                    enumDef.push({ name: enumValA.name, value: enumValA.value, index: enumValA.index });
                    if(typeof enumValA.index !== "undefined") {
                         hasIndex = true;
                    }
                } else if(typeof enumValA === "string") {
                    enumDef.push({ name: enumValA, value: undefined, index: undefined });
                } else {
                    return Guard.raise(new Exception("Type Error", "Invalid enum member"))  
                }
            }
        } else if (typeof enumDefinition === "object"){
            for(var enumName in enumDefinition){
                var enumValO = enumDefinition[enumName];
                if(typeof enumValO === "object"){
                    enumDef.push({ name: enumName, value: enumValO.value, index: enumValO.index });
                    if(typeof enumValO.index !== "undefined") { 
                        hasIndex = true;
                    }
                } else {
                    enumDef.push({ name: enumName, value: enumValO, index: undefined });
                }
            }
        }
        
        if(hasIndex){
            enumDef.sort(function (a,b) {
                if (a.index < b.index)
                    return -1;
                if (a.index > b.index)
                    return 1;
                return 0;
            })
        }
        
        var enumOptions = [];
        for (var i = 0; i < enumDef.length; i++) {
            var enumVal = enumDef[i]
            if (isValueCalculation && typeof enumVal.value !== "number" && !enumVal.value) {
               enumVal.value = defaultValue;
            }
            if (typeof enumVal.value === "number") {
               defaultValue = enumVal.value; 
            }
            defaultValue++;
            enumOptions.push(enumVal.name);
            classDefinition[enumVal.name] = getEnumDef(enumVal.value, enumVal.index);
        }
        
        var enumClass = $data.Base.extend.call(this, name, container, {}, classDefinition);
        
        $data.Container.registerConverter(name, {
            'default': function (value) {
                if(typeof value == "string" && enumOptions.indexOf(value) >= 0){
                    var enumMember = enumClass.staticDefinitions.getMember(value);
                    if(enumMember){
                        return enumMember.get();
                    }
                } 
                
                for (var i = 0; i < enumDef.length; i++) {
                    var enumVal = enumDef[i]
                    if(enumVal.value === value)
                        return value;
                }
        
                throw 0;
            }
        });
        
        return enumClass;
    }
});



export var Enum = $data.Enum
export default $data
