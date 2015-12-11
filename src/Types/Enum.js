import $data, { $C, Guard, Container, Exception, MemberDefinition } from '../TypeSystem/index.js';


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
        
        var getEnumDef = function(value){
            return { get: function() { return value }, set: function() { }, enumMember: true }
        }
        
        var defaultValue = 0;
        var isValueCalculation = [$data.Byte, $data.SByte, $data.Int16, $data.Integer, $data.Int64].indexOf(enumType) >= 0;
        
        for (var i in enumDefinition) {
            var val = enumDefinition[i]
            if (isValueCalculation && typeof val !== "number" && !val) {
               val = defaultValue;
            }
            if (typeof val === "number") {
               defaultValue = val; 
            }
            enumDefinition[i] = val;
            defaultValue++;
            classDefinition[i] = getEnumDef(val);
        }
        
        $data.Base.extend.call(this, name, container, {}, classDefinition);
        
        $data.Container.registerConverter(name, {
            'default': function (value) {
                if(typeof value == "string"){
                    var def = enumDefinition[value];
                    if(typeof def !== "undefined") {
                        return def;
                    }
                } 
                
                for (var i in enumDefinition) {
                    if(enumDefinition[i] === value)
                        return enumDefinition[i];
                }
        
                throw 0;
            }
        });
    }
});



export var Enum = $data.Enum
export default $data
