import $data, { $C, Guard, Container, Exception, MemberDefinition } from '../TypeSystem/index.js';


$data.Enum = $data.Class.define("$data.Enum", null, null, {}, {
    extend: function(name, container, classDefinition){
        if (!classDefinition) {
            classDefinition = container;
            container = undefined;
        }
        
        $data.Base.extend.call(this, name, container, {}, classDefinition);
        
        $data.Container.registerConverter(name, {
            'default': function (value) {
                if(typeof value == "string"){
                    var def = classDefinition[value];
                    if(def && typeof def.value !== "undefined") {
                        return def.value;
                    }
                } 
                
                for (var i in classDefinition) {
                    var idef = classDefinition[i];
                    if(idef.value === value)
                        return value;
                }
        
                throw 0;
            }
        });
    }
});



export var Enum = $data.Enum
export default $data
