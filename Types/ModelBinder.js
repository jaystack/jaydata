$data.Class.define('$data.ModelBinder', null, null, {

    constructor: function(context){
        this.context = context;
        this.providerName = null;
        if (this.context.storageProvider && typeof this.context.storageProvider.getType === 'function'){
            this.references = !(this.context.storageProvider.providerConfiguration.modelBinderOptimization || false);
            for (var i in $data.RegisteredStorageProviders){
                if ($data.RegisteredStorageProviders[i] === this.context.storageProvider.getType()){
                    this.providerName = i;
                }
            }
        }
    },
    
    _buildSelector: function(meta, context){
        if (meta.$selector){
            if (!(meta.$selector instanceof Array)){
                meta.$selector = [meta.$selector];
            }
            
            for (var i = 0; i < meta.$selector.length; i++){
                var selector = meta.$selector[i].replace('json:', '');
                context.src += 'if(';
                var path = selector.split('.');
                for (var j = 0; j < path.length; j++){
                    context.src += 'di.' + path.slice(0, j + 1).join('.') + (j < path.length - 1 ? ' && ' : ' !== undefined && typeof di.' + selector + ' === "object"');
                }
                context.src += '){di = di.' + selector + ';}' + (i < meta.$selector.length - 1 ? 'else ' : '');
            }
            
            context.src += 'if (di === null){';
            if (context.iter) context.src += context.iter + ' = null;';
            context.src += 'return null;';
            context.src += '}';
        }
    },
    
    _buildKey: function(name, type, keys, context, data){
        if (keys){
            var type = Container.resolveType(type).fullName;
            context.src += 'var ' + name + 'Fn = function(di){';
            if (!(keys instanceof Array) || keys.length == 1){
                if (typeof keys !== 'string') keys = keys[0];
                context.src += 'var key = ("' + type + '_' + keys + '#" + di.' + keys + ');';
            }else{
                context.src += 'var key = "";';
                for (var i = 0; i < keys.length; i++){
                    var id = typeof keys[i] !== 'object' ? keys[i] : keys[i].$source;
                    context.src += 'if (di.' + id + ' === null) return null;';
                    context.src += 'if (typeof di.' + id + ' === "undefined") return undefined;';
                    context.src += 'key += ("' + type + '_' + id + '#" + di.' + id + ');';
                }
            }
            
            context.src += 'return key;};';
        }
        
        context.src += 'var ' + name + ' = ' + (keys ? name + 'Fn(' + (data || 'di') + ')' : 'undefined') + ';';
    },

    build: function(meta, context){
        if (meta.$selector){
            if (!(meta.$selector instanceof Array)) meta.$selector = [meta.$selector];
            for (var i = 0; i < meta.$selector.length; i++){
                meta.$selector[i] = meta.$selector[i].replace('json:', '');
            }
        }
        
        if (meta.$value){
            if (typeof meta.$value === 'function'){
                context.src += 'var fn = function(){ return meta' + (context.meta.length ? '.' + context.meta.join('.') : '') + '.$value.call(self, meta' + (context.meta.length ? '.' + context.meta.join('.') : '') + ', di); };';
                context.item = 'fn()';
            }else if (meta.$type){
                var type = Container.resolveName(Container.resolveType(meta.$type));
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                if (converter){
                    context.item = 'self.context.storageProvider.fieldConverter.fromDb["' + type + '"](' + meta.$value + ')';
                }else{
                    context.item = 'new ' + type + '(' + meta.$value + ')';
                }
            }else context.item = meta.$value;
        }else if (meta.$source){
            var type = Container.resolveName(Container.resolveType(meta.$type));
            var converter = this.context.storageProvider.fieldConverter.fromDb[type];
            var item = '_' + type.replace(/\./gi, '_') + '_';
            if (!context.forEach) context.src += 'var di = data;';
            context.item = item;
            this._buildSelector(meta, context);
            if (converter){
                context.src += 'var ' + item + ' = self.context.storageProvider.fieldConverter.fromDb["' + type + '"](di.' + meta.$source + ');';
            }else{
                context.src += 'var ' + item + ' = new ' + type + '(di.' + meta.$source + ');';
            }
        }else if (meta.$item){
            context.meta.push('$item');
            context.src += 'var fn = function(di){';
            var iter = (context.item && context.current ? context.item + '.' + context.current : (context.item ? context.item : 'result'));
            context.src += iter + ' = [];';
            context.iter = iter;
            if (this.references && meta.$item.$keys) context.src += 'var keycache_' + iter.replace(/\./gi, '_') + ' = ' + (meta.$item.$keys ? '[]' : 'null') + ';';
            context.src += 'if (typeof di !== "undefined" && !(di instanceof Array)){';
            this._buildSelector(meta, context);
            context.src += '}';
            if (this.references && meta.$keys) this._buildKey('forKey', meta.$type, meta.$keys, context);
            context.iter = undefined;
            context.forEach = true;
            context.src += 'di.forEach(function(di, i){';
            context.src += 'var diBackup = di;';
            var item = context.item || 'iter';
            context.item = item;
            if (!meta.$item.$source){
                this._buildSelector(meta.$item, context);
            }
            this.build(meta.$item, context);
            if (this.references && meta.$keys){
                context.src += 'if (forKey){';
                context.src += 'if (cache[forKey]){';
                context.src += iter + ' = cache[forKey];';
                context.src += 'if (' + iter + '.indexOf(' + (context.item || item) + ') < 0){';
                context.src += iter + '.push(' + (context.item || item) + ');';
                context.src += '}}else{';
                context.src += 'cache[forKey] = ' + iter + ';';
                context.src += iter + '.push(' + (context.item || item) + ');';
                context.src += '}}else{';
                if (this.references && meta.$item.$keys) this._buildKey('cacheKey', meta.$type, meta.$item.$keys, context, 'diBackup');
                context.src += 'if (cacheKey !== null){';
                context.src += 'if (keycache_' + iter.replace(/\./gi, '_') + ' && cacheKey){';
                context.src += 'if (keycache_' + iter.replace(/\./gi, '_') + '.indexOf(cacheKey) < 0){';
                context.src += iter + '.push(' + (context.item || item) + ');';
                context.src += 'keycache_' + iter.replace(/\./gi, '_') + '.push(cacheKey);';
                context.src += '}';
                context.src += '}else{';
                context.src += iter + '.push(' + (context.item || item) + ');';
                context.src += '}';
                context.src += '}';
                context.src += '}';
            }else{
                context.src += iter + '.push(' + (context.item || item) + ');';
            }
            context.src += '});';
            context.forEach = false;
            context.item = null;
            context.src += '};fn(typeof di === "undefined" ? data : di);'
            context.meta.pop();
        }else if (meta.$type){
            if (!context.forEach){
                context.src += 'if (typeof di === "undefined"){';
                context.src += 'var di = data;';
                this._buildSelector(meta, context);
                context.src += '}';
            }
            var type = Container.resolveName(Container.resolveType(meta.$type));
            var item = '_' + type.replace(/\./gi, '_') + '_';
            if (context.item == item) item += 'new_';
            context.item = item;
            
            var resolvedType = Container.resolveType(meta.$type);
            var isPrimitive = false;
            if (!meta.$source && !meta.$value && resolvedType !== $data.Array && resolvedType !== $data.Object && !resolvedType.isAssignableTo)
                isPrimitive = true;
            if (resolvedType === $data.Object || resolvedType === $data.Array){
                var keys = Object.keys(meta);
                if (keys.length == 1 || (keys.length == 2 && meta.$selector)) isPrimitive = true;
            }

            if (isPrimitive) {
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                if (converter){
                    context.src += 'var ' + item + ' = di != undefined ? self.context.storageProvider.fieldConverter.fromDb["' + type + '"](di) : di;';
                }else{
                    context.src += 'var ' + item + ' = di;';
                }
            } else {
                if (this.references && meta.$keys){
                    this._buildKey('itemKey', meta.$type, meta.$keys, context);
                    context.src += 'var ' + item + ';';
                    context.src += 'if (itemKey && cache[itemKey]){';
                    context.src += item + ' = cache[itemKey];';
                    context.src += '}else{';
                    context.src += item + ' = new ' + type + '();';
                }else{
                    context.src += 'var ' + item + ' = new ' + type + '();';
                }
            }
            for (var i in meta){
                if (i.indexOf('$') < 0){
                    context.current = i;
                    if (!meta[i].$item){
                        if (meta[i].$value){
                            context.meta.push(i);
                            var item = context.item;
                            this.build(meta[i], context);
                            context.src += item + '.' + i + ' = ' + context.item + ';';
                            context.item = item;
                            context.meta.pop();
                        }else if (meta[i].$source){
                            context.src += 'var fn = function(di){';
                            this._buildSelector(meta[i], context);
                            if (meta[i].$type){
                                var type = Container.resolveName(Container.resolveType(meta[i].$type));
                                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                                if (converter){
                                    context.src += 'return self.context.storageProvider.fieldConverter.fromDb["' + type + '"](di.' + meta[i].$source + ');';
                                }else{
                                    context.src += 'return new ' + type + '(di.' + meta[i].$source + ');';
                                }
                            }else{
                                context.src += item + '.' + i + ' = di.' + meta[i].$source + ';';
                            }
                            context.src += '};';
                            if (meta[i].$type) context.src += item + '.' + i + ' = fn(di);';
                            else context.src += 'fn(di);';
                        }else if (meta[i].$type){
                            context.meta.push(i);
                            context.src += 'var fn = function(di){';
                            this._buildSelector(meta[i], context);
                            this.build(meta[i], context);
                            context.src += 'return ' + context.item + ';};';
                            context.src += item + '.' + i + ' = fn(di);';
                            context.item = item;
                            context.meta.pop();
                        }else if (meta.$type){
                            var memDef = Container.resolveType(meta.$type).memberDefinitions.getMember(i);
                            var type = Container.resolveName(memDef.type);
                            var entityType = Container.resolveName(Container.resolveType(meta.$type));
                            var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                            if (this.providerName && memDef && memDef.converter && memDef.converter[this.providerName] && typeof memDef.converter[this.providerName].fromDb == 'function'){
                                context.src += item + '.' + i + ' = Container.resolveType("' + entityType + '").memberDefinitions.getMember("' + i + '").converter.' + this.providerName + '.fromDb(di.' + meta[i] + ', Container.resolveType("' + entityType + '").memberDefinitions.getMember("' + i + '"), self.context, Container.resolveType("' + entityType + '"));';
                            }else if (converter){
                                context.src += item + '.' + i + ' = self.context.storageProvider.fieldConverter.fromDb["' + type + '"](di.' + meta[i] + ');';
                            }else{
                                var type = Container.resolveName(Container.resolveType(type.memberDefinitions.getMember(i).type));
                                context.src += item + '.' + i + ' = new ' + type + '(di.' + meta[i] + ');';
                            }
                        }
                    }else{
                        context.meta.push(i);
                        this.build(meta[i], context);
                        context.item = item;
                        context.meta.pop();
                    }
                }
            }
            if (this.references && meta.$keys){
                context.src += 'if (itemKey){';
                context.src += 'cache[itemKey] = ' + item + ';';
                context.src += '}';
                context.src += 'if (' + item + ' instanceof $data.Entity){' + item + '.changedProperties = undefined;}';
                context.src += '}';
            }else{
                context.src += 'if (' + item + ' instanceof $data.Entity){' + item + '.changedProperties = undefined;}';
            }
        }
    },

    call: function (data, meta) {
        if (!Object.getOwnPropertyNames(meta).length){
            return data;
        }
        var context = {
            src: '',
            meta: []
        };
        context.src += 'var self = this;';
        context.src += 'var result;';
        context.src += 'var cache = {};';
        this.build(meta, context);
        if (context.item) context.src += 'if (!result) result = ' + context.item + ';';
        context.src += 'return result;';
        var fn = new Function('meta', 'data', context.src).bind(this);
        var ret = fn(meta, data);
        return ret;
    }
});
