$data.ServiceBase.extend('$data.JayStormAPI.FunctionImport', {
    /*addEntity: (function(name, fullname, namespace){
        return function(success, error){
            var self = this;
            this.context.Entities.filter(function(it){ return it.FullName === this.fullname; }, { fullname: fullname }).length(function(cnt){
                if (cnt) self.error('Entity type already exists.');
                else{
                    self.context.Entities.add(new $data.JayStormAPI.Entity({
                        Name: name,
                        FullName: fullname,
                        Namespace: namespace
                    }));
                    self.context.saveChanges(self);
                }
            });
        };
    }).toServiceOperation().params([
        { name: 'name', type: 'string' },
        { name: 'fullname', type: 'string' },
        { name: 'namespace', type: 'string' }
    ]).returns('int'),
    removeEntityByID: (function(id){
        return function(success, error){
            var self = this;
            this.context.Entities.single(function(it){ return it.EntityID === this.id; }, { id: id }, {
                success: function(entity){
                    self.context.Entities.remove(entity);
                    self.context.EntityFields.filter(function(it){ return it.EntityID === this.entityid; }, { entityid: entity.EntityID }).toArray({
                        success: function(fields){
                            for (var i = 0; i < fields.length; i++) self.context.EntityFields.remove(fields[i]);
                            self.context.saveChanges(self);
                        },
                        error: self.error
                    });
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([{ name: 'id', type: 'id' }]).returns('int'),
    removeEntityByName: (function(name){
        return function(success, error){
            var self = this;
            this.context.Entities.single(function(it){ return it.Name === this.name; }, { name: name }, {
                success: function(entity){
                    self.context.Entities.remove(entity);
                    self.context.EntityFields.filter(function(it){ return it.EntityID === this.entityid; }, { entityid: entity.EntityID }).toArray({
                        success: function(fields){
                            for (var i = 0; i < fields.length; i++) self.context.EntityFields.remove(fields[i]);
                            self.context.saveChanges(self);
                        },
                        error: self.error
                    });
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([{ name: 'name', type: 'string' }]).returns('int'),
    removeEntityByFullName: (function(fullname){
        return function(success, error){
            var self = this;
            this.context.Entities.single(function(it){ return it.FullName === this.fullname; }, { fullname: fullname }, {
                success: function(entity){
                    self.context.Entities.remove(entity);
                    self.context.EntityFields.filter(function(it){ return it.EntityID === this.entityid; }, { entityid: entity.EntityID }).toArray({
                        success: function(fields){
                            for (var i = 0; i < fields.length; i++) self.context.EntityFields.remove(fields[i]);
                            self.context.saveChanges(self);
                        },
                        error: self.error
                    });
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([{ name: 'fullname', type: 'string' }]).returns('int'),
    getAllEntities: (function(){
        return this.context.Entities.toArray(this);
    }).toServiceOperation().returns($data.Array, $data.JayStormAPI.Entity),
    getEntityByID: (function(id){
        return this.context.Entities.single(function(it){ return it.EntityID === this.id; }, { id: id }, this);
    }).toServiceOperation().params([{ name: 'id', type: 'id' }]).returns($data.JayStormAPI.Entity),
    getEntityByName: (function(name){
        return this.context.Entities.single(function(it){ return it.Name === this.name; }, { name: name }, this);
    }).toServiceOperation().params([{ name: 'name', type: 'string' }]).returns($data.JayStormAPI.Entity),
    getEntityByFullName: (function(fullname){
        return this.context.Entities.single(function(it){ return it.FullName === this.fullname; }, { fullname: fullname }, this);
    }).toServiceOperation().params([{ name: 'fullname', type: 'string' }]).returns($data.JayStormAPI.Entity),
    getEntityByNamespace: (function(namespace){
        return this.context.Entities.single(function(it){ return it.Namespace === this.namespace; }, { namespace: namespace }, this);
    }).toServiceOperation().params([{ name: 'namespace', type: 'string' }]).returns($data.JayStormAPI.Entity),
    addFieldToEntity: (function(entity, name, type, elementType, inverseProperty, key, computed, nullable, required, customValidator, minValue, maxValue, minLength, maxLength, length, regex){
        return function(success, error){
            var self = this;
            this.context.Entities.single(function(it){ return it.Name === this.entity || it.FullName === this.entity; }, { entity: entity }, {
                success: function(result){
                    self.context.EntityFields.add(new $data.JayStormAPI.EntityField({
                        EntityID: result.EntityID,
                        Name: name,
                        Type: type,
                        ElementType: elementType,
                        InverseProperty: inverseProperty,
                        Key: key,
                        Computed: computed,
                        Nullable: nullable,
                        Required: required,
                        CustomValidator: customValidator,
                        MinValue: minValue,
                        MaxValue: maxValue,
                        MinLength: minLength,
                        MaxLength: maxLength,
                        Length: length,
                        RegExp: regex
                    }));
                    self.context.saveChanges(self);
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([
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
    removeFieldByEntityIDAndName: (function(entityid, name){
        return function(success, error){
            var self = this;
            this.context.EntityFields.single(function(it){ return it.EntityID === this.entityid && it.Name === this.name; }, { entityid: entityid, name: name }, {
                success: function(field){
                    self.context.EntityFields.remove(field);
                    self.context.saveChanges(self);
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([
        { name: 'entityid', type: 'id' },
        { name: 'name', type: 'string' }
    ]).returns('int'),
    removeAllFieldsByEntityID: (function(entityid){
        return function(success, error){
            var self = this;
            this.context.EntityFields.filter(function(it){ return it.EntityID === this.entityid; }, { entityid: entityid }).toArray({
                success: function(result){
                    if (result.length){
                        for (var i = 0; i < result.length; i++) self.context.EntityFields.remove(result[i]);
                        self.context.saveChanges(self);
                    }
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([{ name: 'entityid', type: 'id' }]).returns('int'),
    getAllFields: (function(){
        return this.context.EntityFields.toArray(this);
    }).toServiceOperation().returns($data.Array, $data.JayStormAPI.EntityField),
    getAllFieldsByEntityID: (function(entityid){
        return this.context.EntityFields.filter(function(it){ return it.EntityID === this.entityid; }, { entityid: entityid }).toArray(this);
    }).toServiceOperation().params([{ name: 'entityid', type: 'id' }]).returns($data.Array, $data.JayStormAPI.EntityField),
    addEntitySet: (function(name, elementType, tableName, publish){
        return function(success, error){
            var self = this;
            console.log(name, elementType, tableName, publish);
            this.context.Entities.single(function(it){ return it.Name === this.elementType || it.FullName === this.elementType; }, { elementType: elementType }, {
                success: function(result){
                    self.context.EntitySets.filter(function(it){ return it.Name === this.name; }, { name: name }).length(function(cnt){
                        if (cnt) self.error('EntitySet already exists.');
                        else{
                            self.context.EntitySets.add(new $data.JayStormAPI.EntitySet({
                                Name: name,
                                ElementType: elementType,
                                ElementTypeID: result.EntityID,
                                TableName: tableName,
                                Publish: publish
                            }));
                            self.context.saveChanges(self);
                        }
                    });
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([
        { name: 'name', type: 'string' },
        { name: 'elementType', type: 'string' },
        { name: 'tableName', type: 'string' },
        { name: 'publish', type: 'bool' }
    ]).returns('int'),
    removeEntitySetByName: (function(name){
        return function(success, error){
            var self = this;
            this.context.EntitySets.first(function(it){ return it.Name === this.name; }, { name: name }, {
                success: function(entitySet){
                    self.context.EntitySets.remove(entitySet);
                    self.context.saveChanges(self);
                },
                error: self.error
            });
        };
    }).toServiceOperation().params([{ name: 'name', type: 'string' }]).returns('int'),
    getAllEntitySets: (function(){
        return this.context.EntitySets.toArray(this);
    }).toServiceOperation().returns($data.Array, $data.JayStormAPI.EntitySet),
    getEntitySetByID: (function(id){
        return this.context.EntitySets.single(function(it){ return it.EntitySetID === this.id; }, { id: id }, this);
    }).toServiceOperation().params([{ name: 'id', type: 'id' }]).returns($data.JayStormAPI.EntitySet),
    getEntitySetByName: (function(name){
        return this.context.EntitySets.single(function(it){ return it.Name === this.name; }, { name: name }, this);
    }).toServiceOperation().params([{ name: 'name', type: 'string' }]).returns($data.JayStormAPI.EntitySet),
    getEntitySetByEntityID: (function(id){
        return this.context.EntitySets.single(function(it){ return it.EntitySetID === this.id; }, { id: id }, this);
    }).toServiceOperation().params([{ name: 'id', type: 'id' }]).returns($data.JayStormAPI.EntitySet),*/
    getContext: (function(db){
        return function(success, error){
            var self = this;
            var nsContext;
            var context = {};
            var entities = [];
            var entityIds = [];
            var entitySets = {};
            this.context.Databases.single(function(it){ return it.Name == this.db; }, { db: db }, function(db){
                nsContext = db.Namespace + '.Context';
                context.ContextName = nsContext;
                self.context.EntitySets.filter(function(it){ return it.Publish && it.DatabaseID == this.db; }, { db: db.DatabaseID }).toArray({
                    success: function(result){
                        var ret = {};
                        for (var i = 0; i < result.length; i++){
                            var r = result[i];
                            ret[r.Name] = {
                                type: '$data.EntitySet',
                                elementType: db.Namespace + '.' + r.ElementType
                            };
                            if (r.TableName) ret[r.Name].tableName = r.TableName;
                            entitySets[r.EntitySetID] = ret[r.Name];
                            //entities.push(r.ElementType);
                        }
                        context[nsContext] = ret;
                        //console.log(entities);
                    },
                    error: self.error
                }).then(function(){
                    self.context.Entities.filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID }) /*.filter(function(it){ return it.FullName in this.entities; }, { entities: entities })*/.toArray({
                        success: function(result){
                            entities = result;
                            self.context.ComplexTypes.filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID }).toArray(function(result){
                                if (result.length) entities = entities.concat(result);
                                entityIds = entities.map(function(it){ return it.EntityID; });
                                /*for (var i = 0; i < result.length; i++){
                                    var r = result[i];
                                    //entityIds.push(r.EntityID);
                                    context[r.FullName] = {};
                                    
                                    for (var j = 0; j < r.Fields.length; j++){
                                        var rf = r.Fields[j];
                                        var f = {};
                                                
                                        f.type = rf.Type;
                                        if (rf.ElementType) f.elementType = rf.ElementType;
                                        if (rf.InverseProperty) f.inverseProperty = rf.InverseProperty;
                                        if (rf.Key) f.key = true;
                                        if (rf.Computed) f.computed = true;
                                        if (rf.Nullable !== undefined && r.Nullable !== null) f.nullable = !!rf.Nullable;
                                        if (rf.Required) f.required = true;
                                        if (rf.CustomValidator) f.customValidator = rf.CustomValidator;
                                        if (rf.MinValue !== undefined && rf.MinValue !== null) f.minValue = rf.MinValue;
                                        if (rf.MaxValue !== undefined && rf.MaxValue !== null) f.maxValue = rf.MaxValue;
                                        if (rf.MinLength !== undefined && rf.MinLength !== null) f.minLength = rf.MinLength;
                                        if (rf.MaxLength !== undefined && rf.MaxLength !== null) f.maxLength = rf.MaxLength;
                                        if (rf.Length !== undefined && rf.Length !== null) f.length = rf.Length;
                                        if (rf.RegExp) f.regex = rf.RegExp;
                                        if (rf.ExtensionAttributes && rf.ExtensionAttributes.length){
                                            for (var k = 0; k < rf.ExtensionAttributes.length; k++){
                                                var kv = rf.ExtensionAttributes[k];
                                                f[kv.Key] = kv.Value;
                                            }
                                        }
                                        
                                        context[r.FullName][rf.Name] = f;
                                    }
                                }
                                
                                self.success(context);*/
                                
                                self.context.EntityFields.filter(function(it){ return it.EntityID in this.entityid && it.DatabaseID == this.db; }, { db: db.DatabaseID, entityid: entityIds }).toArray({
                                    success: function(result){
                                        for (var i = 0; i < result.length; i++){
                                            var r = result[i];
                                            var e = entities.filter(function(it){ return it.EntityID === r.EntityID; })[0];
                                            
                                            var f = {};
                                            if (!context[e.FullName || ((e.Namespace || db.Namespace) + e.Name)]) context[e.FullName || ((e.Namespace || db.Namespace) + e.Name)] = {};
                                            
                                            f.type = r.Type;
                                            if (r.ElementType) f.elementType = r.ElementType;
                                            if (r.InverseProperty) f.inverseProperty = r.InverseProperty;
                                            if (r.Key) f.key = true;
                                            if (r.Computed) f.computed = true;
                                            if (r.Nullable !== undefined && r.Nullable !== null) f.nullable = !!r.Nullable;
                                            if (r.Required) f.required = true;
                                            if (r.CustomValidator) f.customValidator = r.CustomValidator;
                                            if (r.MinValue !== undefined && r.MinValue !== null) f.minValue = r.MinValue;
                                            if (r.MaxValue !== undefined && r.MaxValue !== null) f.maxValue = r.MaxValue;
                                            if (r.MinLength !== undefined && r.MinLength !== null) f.minLength = r.MinLength;
                                            if (r.MaxLength !== undefined && r.MaxLength !== null) f.maxLength = r.MaxLength;
                                            if (r.Length !== undefined && r.Length !== null) f.length = r.Length;
                                            if (r.RegExp) f.regex = r.RegExp;
                                            
                                            context[e.FullName || ((e.Namespace || db.Namespace) + e.Name)][r.Name] = f;
                                        }
                                        
                                        self.context.EventHandlers.filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID }).toArray({
                                            success: function(result){
                                                for (var i = 0; i < result.length; i++){
                                                    var r = result[i];
                                                    entitySets[r.EntitySetID][r.Type] = r.Handler;
                                                }
                                                self.success(context);
                                            },
                                            error: self.error
                                        });
                                    },
                                    error: self.error
                                });
                            });
                        },
                        error: self.error
                    });
                });
            });
        };
    }).toServiceOperation().params([{ name: 'db', type: 'string' }]).returns($data.Object),
    getContextJS: (function(db){
        return function(success, error){
            var self = this;
            this.context.getContext.asFunction(db).apply({
                context: this.context,
                success: function(context){
                    var js = '';
                    var events = {
                        afterCreate: true,
                        afterRead: true,
                        afterUpdate: true,
                        afterDelete: true,
                        beforeCreate: true,
                        beforeRead: true,
                        beforeUpdate: true,
                        beforeDelete: true
                    };
                    for (var i in context){
                        var c = context[i];
                        if (i != context.ContextName && i != 'ContextName'){
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
                    var c = context[context.ContextName];
                    js += '$data.EntityContext.extend("' + context.ContextName + '", {\n';
                    for (var i in c){
                        var es = c[i];
                        js += '    ' + i + ': { type: $data.EntitySet, elementType: ' + es.elementType + (es.tableName ? ', tableName: "' + es.tableName + '" ' : '');
                        for (var e in events){
                            console.log(i, e, es[e]);
                            if (es[e]) js += (',\n        ' + e + ': ' + es[e]);
                        }
                        js += ' },\n';
                    }
                    var lio = js.lastIndexOf(',');
                    js = js.substring(0, lio);
                    js += '\n});';
                    console.log(js);
                    self.success(js);
                },
                error: this.error
            }, success, error);
        };
    }).toServiceOperation().params([{ name: 'db', type: 'string' }]).returns('string')//.asResult($data.JavaScriptResult)
});
