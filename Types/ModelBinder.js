$data.Class.define('$data.ModelBinder', null, null, {

    constructor: function(context){
        this.context = context;
        this.cache = {};
    },

    call: function (data, meta) {
        if (!Object.getOwnPropertyNames(meta).length) {
            return data;
        }
        var data = data;
		if (meta.$type){
			var type = Container.resolveName(meta.$type);
			var converter = this.context.storageProvider.fieldConverter.fromDb[type];
			var result = converter ? converter() : Container['create' + Container.resolveType(meta.$type).name]();
		}

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
						    if ((typeof part[path[0]] === 'undefined') || (part[path[0]] === null)) {
								if (i === metaSelector.length){
									return undefined;
								}else if (path.length){
									break;
								}
							}else{
								part = part[path[0]];
								path = path.slice(1);
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

		if (meta.$value){
			if (typeof meta.$value === 'function'){
				result = meta.$value();
            }else if (meta.$type){
                var type = Container.resolveName(meta.$type);
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                result = converter ? converter(meta.$value) : Container['create' + Container.resolveType(meta.$type).name](meta.$value);
            }else result = meta.$value;
        }else if (meta.$source){
            if (meta.$type){
                var type = Container.resolveName(meta.$type);
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                result = converter ? converter(data[meta.$source]) : Container['create' + Container.resolveType(meta.$type).name](data[meta.$source]);
            }else result = (meta.$source.split(':')[0] == 'attr' && data.getAttribute) ? data.getAttribute(meta.$source.split(':')[1]) : (meta.$source == 'textContent' && !data[meta.$source] ? $(data).text() : data[meta.$source]);
        }else if (meta.$item){
            for (var i = 0; i < data.length; i++){
                var r = this.call(data[i], meta.$item);
                result.push(r);
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
                                    result[j] = converter ? converter(data[meta[j]]) : Container['create' + Container.resolveType(meta.$type.memberDefinitions.getMember(j).type).name](data[meta[j]]);
                                } else { result[j] = meta[j].$source ? data[meta[j].$source] : data[meta[j]]; }
                            } else { result[j] = this.call(data, meta[j]); }
                        }
                    }
                    this.cache[key] = result;
                }else{
                    result = this.cache[key];
                    for (var j in meta){
                        if (j.indexOf('$') < 0){
                            if (meta[j].$item) { result[j].push(this.call(data, meta[j].$item)); }
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
                                result[j] = converter ? converter(data[meta[j]]) : Container['create' + Container.resolveType(meta.$type.memberDefinitions.getMember(j).type).name](data[meta[j]]);
                            } else { result[j] = meta[j].$source ? data[meta[j].$source] : data[meta[j]]; }
                        } else { result[j] = this.call(data, meta[j]); }
                    }
                }
            }
        }

        return result;
    }
});