$data.Class.define('$data.ModelBinder', null, null, {

    constructor: function(context){
        this.context = context;
        this.cache = {};
    },

    deepExtend: function(o, r){
        for (var i in r){
            if (o.hasOwnProperty(i)){
                if (typeof r[i] === 'object'){
                    if (Array.isArray(r[i])){
                        for (var j = 0; j < r[i].length; j++){
                            if (o[i].indexOf(r[i][j]) < 0){
                                o[i].push(r[i][j]);
                            }
                        }
                    }else this.deepExtend(o[i], r[i]);
                }
            }else{
                o[i] = r[i];
            }
        }
    },

    call: function (data, meta) {
        if (!Object.getOwnPropertyNames(meta).length) {
            return data;
        }
        var data = data;
        var result;

        if (meta.$selector){
			var metaSelector = meta.$selector;
			if (!(metaSelector instanceof Array)){
				metaSelector = [metaSelector];
			}

			var i = 0;
			var part;
			while (i < metaSelector.length){
				part = data;
				var selector = metaSelector[i];
				var type = selector.split(':');
				switch (type[0]){
					case 'json':
						var path = type[1].split('.');
						while (path.length) {
						    if (typeof part[path[0]] === 'undefined') {
								if (i === metaSelector.length){
									return undefined;
								}else if (path.length){
									break;
								}
							}else{
								part = part[path[0]];
								path = path.slice(1);
								if (part === null) return part;
							}
						}
						if (!path.length){
							i = metaSelector.length;
						}
						break;
					case 'css':
					case 'xml':
						if (part.querySelector){
							part = part[meta.$item ? 'querySelectorAll' : 'querySelector'](type[1]);
						}else{
							part = $(part).find(type[1]);
							if (!meta.$item) part = part[0];
						}
						break;
				}
				i++;
			}

			data = part;
			if (!data){
				return data;
			}
        }
        
        if (meta.$type) {
            var resolvedType = Container.resolveType(meta.$type);
            var isPrimitive = false;
            if (!meta.$source && !meta.$value && resolvedType !== $data.Array && resolvedType !== $data.Object && !resolvedType.isAssignableTo)
                isPrimitive = true;
            if (resolvedType === $data.Object || resolvedType === $data.Array){
                var keys = Object.keys(meta);
                if (keys.length == 1 || (keys.length == 2 && meta.$selector)) isPrimitive = true;
            }

            var type = Container.resolveName(meta.$type);
            var converter = this.context.storageProvider.fieldConverter.fromDb[type];
            if (isPrimitive) {
                if (data != undefined && converter)
                    return converter(data);
                else
                    return data;
            } else {
                result = converter ? converter() : new (Container.resolveType(meta.$type))(); //Container['create' + Container.resolveType(meta.$type).name]();
            }
        }

		if (meta.$value){
			if (typeof meta.$value === 'function'){
				result = meta.$value.call(this, meta, data);
            }else if (meta.$type){
                var type = Container.resolveName(meta.$type);
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                result = converter ? converter(meta.$value) : new (Container.resolveType(meta.$type))(meta.$value); //Container['create' + Container.resolveType(meta.$type).name](meta.$value);
            }else result = meta.$value;
        }else if (meta.$source){
            if (meta.$type){
                var type = Container.resolveName(meta.$type);
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                result = converter ? converter(data[meta.$source]) : new (Container.resolveType(meta.$type))(data[meta.$source]); //Container['create' + Container.resolveType(meta.$type).name](data[meta.$source]);
            }else result = (meta.$source.split(':')[0] == 'attr' && data.getAttribute) ? data.getAttribute(meta.$source.split(':')[1]) : (meta.$source == 'textContent' && !data[meta.$source] ? $(data).text() : data[meta.$source]);
        } else if (meta.$item) {
            var keycache;
            if (meta.$item.$keys) keycache = [];
            
            if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    var key = '';
                    if (meta.$keys) for (var j = 0; j < meta.$keys.length; j++) { key += (meta.$type + '_' + meta.$keys[j] + '#' + data[i][meta.$keys[j]]); }
                    var r = this.call(data[i], meta.$item);
                    if (key){
                        if (this.cache[key]){
                            result = this.cache[key];
                            if (result.indexOf(r) < 0){
                                result.push(r);
                            }
                        }else{
                            this.cache[key] = result;
                            result.push(r);
                        }
                    }else{
                        var key = '';
                        if (meta.$item.$keys) for (var j = 0; j < meta.$item.$keys.length; j++) { key += (meta.$type + '_' + meta.$item.$keys[j] + '#' + data[i][meta.$item.$keys[j]]); }
                        if (keycache){
                            if (keycache.indexOf(key) < 0){
                                result.push(r);
                                keycache.push(key);
                            }
                        }else result.push(r);
                    }
                }
            } else {
                var key = '';
                if (meta.$keys) for (var j = 0; j < meta.$keys.length; j++) { key += (meta.$type + '_' + meta.$keys[j] + '#' + data[meta.$keys[j]]); }
                var r = this.call(data, meta.$item);
                if (key){
                    if (this.cache[key]){
                        result = this.cache[key];
                        if (result.indexOf(r) < 0){
                            result.push(r);
                        }
                    }else{
                        this.cache[key] = result;
                        result.push(r);
                    }
                }else{
                    var key = '';
                    if (meta.$item.$keys) for (var j = 0; j < meta.$item.$keys.length; j++) { key += (meta.$type + '_' + meta.$item.$keys[j] + '#' + data[meta.$item.$keys[j]]); }
                    if (keycache){
                        if (keycache.indexOf(key) < 0){
                            result.push(r);
                            keycache.push(key);
                        }
                    }else result.push(r);
                }
            }
        }else{
            var key = '';
            if (meta.$keys){
                for (var j = 0; j < meta.$keys.length; j++) { key += (meta.$type + '_' + meta.$keys[j] + '#' + data[meta.$keys[j]]); }
                if (!this.cache[key]){
                    for (var j in meta){
                        if (j.indexOf('$') < 0){
                            if (!meta[j].$item) {
                                if (meta[j].$type || meta[j].$source) { result[j] = this.call(data, meta[j]); }
                                else if (meta.$type) {
                                    var type = Container.resolveName(meta.$type.memberDefinitions.getMember(j).type);
                                    var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                                    result[j] = converter ? converter(data[meta[j]]) : new (Container.resolveType(meta.$type.memberDefinitions.getMember(j).type))(data[meta[j]]); //Container['create' + Container.resolveType(meta.$type.memberDefinitions.getMember(j).type).name](data[meta[j]]);
                                } else { result[j] = meta[j].$source ? data[meta[j].$source] : data[meta[j]]; }
                            } else { result[j] = this.call(data, meta[j]); }
                        }
                    }
                    this.cache[key] = result;
                }else{
                    result = this.cache[key];
                    for (var j in meta){
                        if (j.indexOf('$') < 0){
                            if (meta[j].$item) {
                                if (meta[j].$item.$keys){
                                    var key = '';
                                    for (var k = 0; k < meta[j].$item.$keys.length; k++) { key += (meta[j].$item.$type + '_' + meta[j].$item.$keys[k] + '#' + data[meta[j].$item.$keys[k]]); }
                                    var r = this.call(data, meta[j].$item);
                                    if (!this.cache[key]){
                                        this.cache[key] = r;
                                        result[j].push(r);
                                    }else{
                                        if (result[j].indexOf(this.cache[key]) < 0){
                                            result[j].push(this.cache[key]);
                                        }
                                    }
                                }else{
                                    result[j].push(this.call(data, meta[j].$item));
                                }
                            }else{
                                if (typeof meta[j] === 'object'){
                                    var r = this.call(data, meta[j]);
                                    this.deepExtend(result[j], r);
                                }
                            }
                        }
                    }
                }
            }else{
                for (var j in meta){
                    if (j.indexOf('$') < 0){
                        if (!meta[j].$item) {
                            if (meta[j].$type || meta[j].$source) { result[j] = this.call(data, meta[j]); }
                            else if (meta.$type) {
                                var type = Container.resolveName(Container.resolveType(meta.$type).memberDefinitions.getMember(j).type);
                                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                                result[j] = converter ? converter(data[meta[j]]) : new (Container.resolveType(meta.$type.memberDefinitions.getMember(j).type))(data[meta[j]]); //Container['create' + Container.resolveType(meta.$type.memberDefinitions.getMember(j).type).name](data[meta[j]]);
                            } else { result[j] = meta[j].$source ? data[meta[j].$source] : data[meta[j]]; }
                        } else { result[j] = this.call(data, meta[j]); }
                    }
                }
            }
        }


		if (result instanceof $data.Entity)
		    result.changedProperties = undefined;
        return result;
    }
});
