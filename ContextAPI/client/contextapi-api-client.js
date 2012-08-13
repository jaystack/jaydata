$data.Base.extend('$data.ContextAPI.FunctionImport', {
    /*addEntity: $data.ServiceOperation.extend({
        params: [
            { name: 'name', type: 'string' },
            { name: 'fullname', type: 'string' },
            { name: 'namespace', type: 'string' }
        ],
        returnType: 'int'
    }),
    removeEntityByID: $data.ServiceOperation.params([{ name: 'id', type: 'id' }]).returns('int'),
    removeEntityByName: $data.ServiceOperation.params([{ name: 'name', type: 'string' }]).returns('int'),
    removeEntityByFullName: $data.ServiceOperation.params([{ name: 'fullname', type: 'string' }]).returns('int'),*/
    getAllEntities: $data.ServiceOperation.extend({
        returnType: $data.Array,
        elementType: $data.ContextAPI.Entity
    }),//.returns($data.Array, $data.ContextAPI.Entity),
    /*getEntityByID: $data.ServiceOperation.params([{ name: 'id', type: 'id' }]).returns($data.ContextAPI.Entity),
    getEntityByName: $data.ServiceOperation.params([{ name: 'name', type: 'string' }]).returns($data.ContextAPI.Entity),
    getEntityByFullName: $data.ServiceOperation.params([{ name: 'fullname', type: 'string' }]).returns($data.ContextAPI.Entity),
    getEntityByNamespace: $data.ServiceOperation.params([{ name: 'namespace', type: 'string' }]).returns($data.ContextAPI.Entity),
    addFieldToEntity: $data.ServiceOperation.params([
        { name: 'entity', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'elementType', type: 'string' },
        { name: 'inverseProperty', type: 'string' },
        { name: 'key', type: 'bool' },
        { name: 'computed', type: 'bool' },
        { name: 'nullable', type: 'bool' },
        { name: 'required', type: 'bool' },
        { name: 'customValidator', type: 'string' },
        { name: 'minValue', type: 'string' },
        { name: 'maxValue', type: 'string' },
        { name: 'minLength', type: 'int' },
        { name: 'maxLength', type: 'int' },
        { name: 'length', type: 'int' },
        { name: 'regex', type: 'string' }
    ]).returns('int'),
    removeFieldByEntityIDAndName: $data.ServiceOperation.params([
        { name: 'entityid', type: 'id' },
        { name: 'name', type: 'string' }
    ]).returns('int'),
    removeAllFieldsByEntityID: $data.ServiceOperation.params([{ name: 'entityid', type: 'id' }]).returns('int'),
    getAllFields: $data.ServiceOperation.returns($data.Array, $data.ContextAPI.EntityField),
    getAllFieldsByEntityID: $data.ServiceOperation.params([{ name: 'entityid', type: 'id' }]).returns($data.Array, $data.ContextAPI.EntityField),
    addEntitySet: $data.ServiceOperation.params([
        { name: 'name', type: 'string' },
        { name: 'elementType', type: 'string' },
        { name: 'tableName', type: 'string' },
        { name: 'publish', type: 'bool' }
    ]).returns('int'),
    removeEntitySetByName: $data.ServiceOperation.params([{ name: 'name', type: 'string' }]).returns('int'),
    getAllEntitySets: $data.ServiceOperation.returns($data.Array, $data.ContextAPI.EntitySet),
    getEntitySetByID: $data.ServiceOperation.params([{ name: 'id', type: 'id' }]).returns($data.ContextAPI.EntitySet),
    getEntitySetByName: $data.ServiceOperation.params([{ name: 'name', type: 'string' }]).returns($data.ContextAPI.EntitySet),
    getEntitySetByEntityID: $data.ServiceOperation.params([{ name: 'id', type: 'id' }]).returns($data.ContextAPI.EntitySet),*/
    getContext: $data.ServiceOperation.extend({
        params:[{ name: 'name', type: 'string' }],
        returnType: $data.Object
    })/*,
    getContextJS: function(name){
        return function(success, error){
            var self = this;
            var builder = this.context.getContext.asFunction(name);
            builder.apply({
                context: this.context,
                success: function(context){
                    var js = '';
                    for (var i in context){
                        var c = context[i];
                        if (i != name){
                            js += '$data.Entity.extend("' + i + '", {\n';
                            var trim = false;
                            for (var prop in c){
                                var p = c[prop];
                                js += '    ' + prop + ': { ';
                                for (var attr in p){
                                    js += attr + ': ' + JSON.stringify(p[attr]) + ', ';
                                }
                                var lio = js.lastIndexOf(', ');
                                js = js.substring(0, lio);
                                js += ' },\n';
                                trim = true;
                            }
                            if (trim){
                                var lio = js.lastIndexOf(',');
                                js = js.substring(0, lio);
                            }
                            js += '\n});\n\n';
                        }
                    }
                    var c = context[name];
                    js += '$data.EntityContext.extend("' + name + '", {\n';
                    for (var i in c){
                        var es = c[i];
                        js += '    ' + i + ': { type: $data.EntitySet, elementType: ' + es.elementType + (es.tableName ? ', tableName: "' + es.tableName + '" ' : '') + ' },\n';
                    }
                    var lio = js.lastIndexOf(',');
                    js = js.substring(0, lio);
                    js += '\n});';
                    self.success(js);
                },
                error: this.error
            }, success, error);
        };
    }*/
});

$data.Class.defineEx('$data.ContextAPI.API', [$data.ContextAPI.Context, $data.ContextAPI.FunctionImport]);
$data.ContextAPI.API.context = new $data.ContextAPI.API({ name: 'oData', oDataServiceHost: 'http://localhost:3000/contextapi.svc' });
