(function ($data, Handlebars) {
    var oldProcessor = $data.Entity.inheritedTypeProcessor;
    var templateCache = {};

    


    function getTemplate(templateName) {
        return templateCache[templateName] || (templateCache[templateName] = (templateName[0] === '<' ? Handlebars.compile(templateName) : Handlebars.compile($('#' + templateName).html())));
    }



    function handleBarTemplateCompiler(templateCode) {
        return Handlebars.compile(templateCode);
    }

    function htmlTemplateResolver(type, templateName) {
        if (!templateName) {
            return undefined;
        }
        templateName = templateName.trim();
        return (templateName ? ( (templateName[0] === "<" || templateName[0] === "{") ? templateName : undefined) : undefined);
    }

    function typeTemplateResolver(type, templateName) {

        //if (!templateName) {
        //    var sname = $data.Container.resolveName(type).split(".");
        //    var name = sname[sname.length - 1];
        //    templateName = name;
        //}
        //var template = getTemplate(templateName);
        return undefined;
    }

    function globalTemplateNameResolver(type, templateName) {
        if (!templateName) {
            var sname = $data.Container.resolveName(type).split(".");
            var name = sname[sname.length - 1];
            templateName = name;
        }
        return $('#' + templateName).html();
    }

    
    var templateEngine = {
        templateResolvers: [htmlTemplateResolver, typeTemplateResolver, globalTemplateNameResolver],
        templateCompiler: handleBarTemplateCompiler,
        templateCache: { },
        getTemplate: function (type, templateName) {
            var template, incache;
            var cacheKey = type.fullName + "::" + templateName;
            incache = template = this.templateCache[cacheKey], i = 0;
            while (!template && i < this.templateResolvers.length) {
                template = this.templateResolvers[i++](type, templateName);
            }
            if (template && !incache) {
                template = this.templateCache[cacheKey] = this.templateCompiler(template);
            }
            if (!template) {
                console.log("Can not find template: " + templateName);
            } 
            return template;
        }
    };
    
    $data.templateEngine = templateEngine;

    $data.render = function (data, templateName) {
        if (data instanceof $data.Entity) {
            return data.render(templateName);
        }

        var typeName;
        for (var field in data) {
            if (data.hasOwnProperty(field)) {
                typeName += (field + "::");
            }
        };
        var type = { fullName: typeName };
        var template = templateEngine.getTemplate(type, templateName);
        return template(data);
    }

    $data.renderItems = function (data, templateName) {
        var result = '';
        for (var i = 0; i < data.length; i++) {
            result += $data.render(data[i], templateName);
        }
        return result;
    }

    //render modes: replace, replaceContent, append, before, after
    $data.renderTo = function (selector, templateName, renderMode) {
        renderMode = renderMode || "replaceContent";
        if (renderMode === 'replaceContent') {
            $(selector).empty();
        };

        return function (data) {
            var result;
            if (data instanceof $data.Entity) {
                result = $data.render(data, templateName);
            } else {
                result = $data.renderItems(data, templateName);
            }
            switch (renderMode) {
                case "append":
                case "replaceContent":
                    $(selector).append(result);
                    break;
                case "replace":
                    $(selector).replaceWith(result);
                    break;
                case "after":
                    $(selector).after(result);
                    break;
                case "before":
                    $(selector).before(result);
                    break;
            }
            
            return data;
        }
    }


    $data.Entity.inheritedTypeProcessor = function (type) {
        if (oldProcessor) {
            oldProcessor(type);
        }

        
        function render(item, templateName) {
            var template = templateEngine.getTemplate(type, templateName);
            if (! (item instanceof $data.Entity)) {
                item = new type(item);
            }
            return template(item);
        }

        type.render = render;

        function renderItems(items, templateName) {
            var result ='';
            for (var i = 0; i < items.length; i++) {
                result += render(items[i], templateName);
            }
            return result;
        }

        type.renderItems = renderItems;
    }


    $data.Entity.prototype.render = function (templateName) {
        return this.getType().render(this, templateName);
    }

    $data.Queryable.prototype.renderTo = function (selector, templateName, renderMode) {
        return this.toArray().then(function (items) {
            return data.renderTo(selector, templateName, renderMode)(items);
        });
    };

    Object.defineProperty($data.Entity.prototype, "fields", {
        get: function () {
            var self = this;
            var results = [];
            this.getType().memberDefinitions.getPublicMappedProperties().forEach(function (md) {
                var name = md.name;
                if (md.kind === "property") {
                    var field = {
                        name: md.name,
                        metadata: md,
                        get value() { return self[name]; },
                    }
                    results.push(field);
                }
            });
            return results;
        }
    });

    Handlebars.registerHelper("entity", function (templateName) {
        return $data.render(this, templateName);
    });

    $data.displayCache = {};
    var _cacheItemId = 0;
    var _clientId = 0;

    function addToCache(item, clientId) {
        if ('undefined' === typeof clientId) {
            clientId = clientId || _clientId++;
        }
        var key = item.cacheKey;
        if ('undefined' === typeof key) {
            key = item.cacheKey = _cacheItemId++;
            $data.displayCache[item.cacheKey] = {
                value: item,
                references: [clientId]
            }
        } else {
            var value = $data.displayCache[key];
            if (value.references.indexOf(clientId) < 0) {
                value.references.push(clientId);
            }
        }
        return { cacheKey: key, clientId: clientId };
    }

    Handlebars.registerHelper("entityScope", function () {

        var sname = $data.Container.resolveName(this.getType()).split(".");
        var name = sname[sname.length - 1];
        var key = this.getType().memberDefinitions.getKeyProperties()[0];
        var id = this[key.name];
        
        var result = "data-" + name.toLowerCase() + "-" + id;
        var cacheInfo = addToCache(this);
        result += " data-cache-client=" + cacheInfo.clientId;
        result += " data-cache-item=" + cacheInfo.cacheKey;
        return result;
    });


    Handlebars.registerHelper("entityCommand", function (command) {
        var self = this;
        $data.entityCache = $data.entityCache || {};
        var sname = $data.Container.resolveName(this.getType()).split(".");
        var name = sname[sname.length - 1];
        var key = self.getType().memberDefinitions.getKeyProperties()[0];
        var id = self[key.name];
        var entKey = name + ":" + id;

        if (!$data.entityCache[entKey]) {
            $data.entityCache[entKey] = self;
        }
        var result = "data-command=" + command + " data-type=" + name + " data-id=" + id;
        var cacheInfo = addToCache(this);
        result += " data-cache-client=" + cacheInfo.clientId;
        result += " data-cache-item=" + cacheInfo.cacheKey;
        return result;
    });

    $data.setCommandHandler = function (app, root) {
        root = root || document;
        $(root).delegate("[data-command]", "click", function () {
            var entKey = $(this).data("type") + ":" + $(this).data("id");
            var method = app[$(this).data("command") + $(this).data("type")];
            var cacheKey = $(this).data("cache-item");
            var entity = $data.displayCache[cacheKey].value;
            var args = [entity, $(this).data("id")];
            method.apply(app, args);
        });
    }

    $(document).delegate(".single-select", "click", function (evt) {
        var result = $(evt.srcElement).parentsUntil(this);
        $(this).children().removeClass("active");
        result.addClass("active");
    });
})($data, Handlebars);