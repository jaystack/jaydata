(function ($data, Handlebars) {
    var oldProcessor = $data.Entity.inheritedTypeProcessor;
    var templateCache = {};

    function getTemplate(templateName) {
        return templateCache[templateName] || (templateCache[templateName] = Handlebars.compile($('#' + templateName).html()));
    }
    $data.Entity.inheritedTypeProcessor = function (type) {
        if (oldProcessor) {
            oldProcessor(type);
        }
        type.prototype.renderTo = function (selector, templateName, renderMode) {
            renderMode = renderMode || "append";
            if (!templateName) {
                var sname = $data.Container.resolveName(this.getType()).split(".");
                var name = sname[sname.length - 1];
                templateName = name;
            }
            if (typeof selector === 'string') {
                selector = $(selector);
            }
            var template = getTemplate(templateName);
            if ("replaceContent" == renderMode) {
                selector.empty();
                renderMode = "append";
            }
            if ("append" == renderMode) {
                selector.append(template(this));
            } else if ("prepend" == renderMode) {
                selector.prepend(template(this));
            } else {
                throw new Error("unknown render mode: " + renderMode);
            }
            var d = new $.Deferred();
            return d.resolve(this);
        }
    }

    $data.Queryable.prototype.renderTo = function (selector, templateName, renderMode) {
        renderMode = renderMode || "replaceContent";

        if (!templateName) {
            var sname = $data.Container.resolveName(this.defaultType).split(".");
            var name = sname[sname.length - 1];
            templateName = name;
        }
        var template = getTemplate(templateName);
        if (typeof selector === 'string') {
            selector = $(selector);
        }
        return this.toArray().then(function (items) {
            var result = [];
            if ("replaceContent" == renderMode) {
                selector.empty();
            }
            items.forEach(function (item) {
                var res = selector.append(template(item));
                result.push(res);
            });
            var d = new $.Deferred();
            return d.resolve(items, result);
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


    Handlebars.registerHelper("entityScope", function () {
        var sname = $data.Container.resolveName(this.getType()).split(".");
        var name = sname[sname.length - 1];
        var key = this.getType().memberDefinitions.getKeyProperties()[0];
        var id = this[key.name];
        var result = "data-" + name.toLowerCase() + "-" + id;
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
        return result;
    });

    Handlebars.setCommandHandler = function(root, app) {
        $(root).delegate("[data-command]", "click", function () {
            var entKey = $(this).data("type") + ":" + $(this).data("id");
            var method = app[$(this).data("command") + $(this).data("type")];
            var args = [$data.entityCache[entKey], $(this).data("id")];
            method.apply(app, args);
        });
    }

    $(document).delegate(".single-select", "click", function (evt) {
        var result = $(evt.srcElement).parentsUntil(this);
        $(this).children().removeClass("active");
        result.addClass("active");
    });
})($data, Handlebars);