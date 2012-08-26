$data.Class.define('$data.oDataServer.EntityXmlTransform', $data.oDataServer.EntityTransform, null, {
    constructor: function (context, requesUrl, config) {
        this.cfg = $data.typeSystem.extend({
            version: 'V2',

            edmx: 'http://schemas.microsoft.com/ado/2007/06/edmx',
            m: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
            d: 'http://schemas.microsoft.com/ado/2007/08/dataservices',
            namespace: 'http://schemas.microsoft.com/ado/2008/09/edm',

            xmlns: 'http://www.w3.org/2005/Atom',
            scheme: 'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme',
            related: 'http://schemas.microsoft.com/ado/2007/08/dataservices/related',

            xmlHead: '<?xml version="1.0" encoding="iso-8859-1" standalone="yes" ?>',

            customPropertyNS: 'http://jaydata.org/extendedproperties',
            customPropertyNSName: 'Jay',

            contextNamespace: this.context.namespace || 'System',

            headers: [],
            excelUserAgent: 'PowerPivot'

        }, config);

    },
    convertToResponse: function (results, collectionNameOrElementType, selectedFields, includes) {
        if (!collectionNameOrElementType)
            return '<error />'

        if (!selectedFields) selectedFields = [];
        if (!includes) includes = [];

        var entitySetDef;
        var defaultType = collectionNameOrElementType;
        if (typeof collectionNameOrElementType === 'string') {
            entitySetDef = this.context.memberDefinitions.getMember(collectionNameOrElementType);
            defaultType = entitySetDef.elementType;
        } else {
            entitySetDef = this._getEntitySetDefByType(defaultType);
        }

        var memDefs = defaultType.memberDefinitions.getPublicMappedProperties();
        if (selectedFields && selectedFields.length > 0) {
            memDefs = memDefs.filter(function (memDef) {
                return selectedFields.indexOf(memDef.name) >= 0
            });
        }

        self = this;

        var xmlResult = this.cfg.xmlHead;
        this.xml = new $data.GenxXMLCreator();
        this.xml.writer.on('data', function (data) {
            xmlResult += data;
        });

        this.xml.startDocument();
        if ($data.Array.isArray(results)) {
            this._buildFeed(results, entitySetDef, defaultType, memDefs);
        } else {
            this._buildEntry(results, entitySetDef, defaultType, memDefs, includes, true);
        }
        this.xml.endDocument();

        return xmlResult.replace('xml__base', 'xml:base');
    },

    _buildFeed: function (data, esDef, elementType, selectedFields, includes) {
        var feed = this.xml.declareElement('feed');
        this.xml.startElement(feed);

        this._addMainNamespaces(esDef);

        //id
        var id = this.xml.declareElement('id');
        this.xml.startElement(id)
            .addText(this.generateUri(null, esDef)).endElement();

        //title
        var type = this.xml.declareAttribute('type');
        var title = this.xml.declareElement('title');
        this.xml.startElement(title)
            .addAttribute(type, 'text')
            .addText(esDef.name).endElement();

        //updated
        var updated = this.xml.declareElement('updated');
        this.xml.startElement(updated)
            .addText(new Date().toISOString()).endElement();

        //link
        var rel = this.xml.declareAttribute('rel');
        var title = this.xml.declareAttribute('title');
        var href = this.xml.declareAttribute('href');
        var link = this.xml.declareElement('link');
        this.xml.startElement(link)
            .addAttribute(rel, 'self')
            .addAttribute(title, esDef.name)
            .addAttribute(href, esDef.name)
            .endElement();

        for (var i = 0; i < data.length; i++) {
            this._buildEntry(data[i], esDef, elementType, selectedFields, includes);
        }

        this.xml.endElement();
    },
    _buildEntry: function (data, esDef, elementType, selectedFields, includes, isRoot) {
        var entry = this.xml.declareElement('entry');
        this.xml.startElement(entry);

        if (isRoot)
            this._addMainNamespaces(esDef);

        var itemUrl = this.generateUri(data, esDef);
        //id
        var id = this.xml.declareElement('id');
        this.xml.startElement(id)
            .addText(itemUrl).endElement();

        //category
        var term = this.xml.declareAttribute('term');
        var scheme = this.xml.declareAttribute('scheme');
        var category = this.xml.declareElement('category');
        this.xml.startElement(category)
            .addAttribute(term, Container.resolveName(esDef.elementType))
            .addAttribute(scheme, this.cfg.scheme).endElement();

        //link
        var rel = this.xml.declareAttribute('rel');
        var title = this.xml.declareAttribute('title');
        var href = this.xml.declareAttribute('href');
        var link = this.xml.declareElement('link');
        var typeName = elementType.name;
        this.xml.startElement(link)
            .addAttribute(rel, 'edit')
            .addAttribute(title, typeName)
            .addAttribute(href, itemUrl.slice(this.requesUrl.length + 1))
            .endElement();

        //navProperties
        this._buildNavProperties(data, esDef, elementType, itemUrl, selectedFields, includes);

        //title
        var title = this.xml.declareElement('title');
        this.xml.startElement(title).endElement();

        //updated
        var updated = this.xml.declareElement('updated');
        this.xml.startElement(updated)
            .addText(new Date().toISOString()).endElement();

        //author
        var author = this.xml.declareElement('author');
        var name = this.xml.declareElement('name');
        this.xml.startElement(author)
            .startElement(name).endElement()
            .endElement();

        //content
        var content = this.xml.declareElement('content');
        var contentType = this.xml.declareAttribute('type');
        var m = this.xml.declareNamespace(this.cfg.m, 'm');
        var properties = this.xml.declareElement(m, 'properties');
        this.xml.startElement(content)
            .addAttribute(contentType, 'application/xml')
            .startElement(properties);
        this._buildProperties(data, esDef, elementType, selectedFields, includes);
        this.xml.endElement()
           .endElement()
           .endElement();
    },
    _addMainNamespaces: function (esDef) {
        var xmlns = this.xml.declareAttribute('xmlns');
        this.xml.addAttribute(xmlns, this.cfg.xmlns);

        var d = this.xml.declareNamespace(this.cfg.d, 'd');
        var dummyd = this.xml.declareAttribute(d, 'dataservices');
        this.xml.addAttribute(dummyd, 'JayStrom');

        var m = this.xml.declareNamespace(this.cfg.m, 'm');
        var dummym = this.xml.declareAttribute(m, 'metadata');
        this.xml.addAttribute(dummym, 'OData');

        //var xml = this.xml.declareNamespace('http://dunno', 'xml');
        var base = this.xml.declareAttribute('xml__base');
        this.xml.addAttribute(base, this.requesUrl + '/' + esDef.name);
    },

    _buildNavProperties: function (data, esDef, elementType, itemUrl, selectedFields, includes) {
        var memDefs = elementType.memberDefinitions.getPublicMappedProperties();
        if (selectedFields && selectedFields.length > 0)
            memDefs = selectedFields;

        for (var i = 0; i < memDefs.length; i++) {
            var memDef = memDefs[i];
            if (memDef.inverseProperty !== undefined) {
                var linkType = 'entry';
                var type = Container.resolveType(memDef.type);
                var linkEsDef;

                if (type === $data.Array) {
                    linkType = 'feed';
                    var type = Container.resolveType(memDef.elementType);
                    linkEsDef = this._getEntitySetDefByType(type);
                } else {
                    linkEsDef = this._getEntitySetDefByType(type);
                }

                var rel = this.xml.declareAttribute('rel');
                var atype = this.xml.declareAttribute('type');
                var href = this.xml.declareAttribute('href');
                var link = this.xml.declareElement('link');
                var typeName = elementType.name;
                this.xml.startElement(link)
                    .addAttribute(rel, related + '/' + linkEsDef.name)
                    .addAttribute(atype, 'application/atom+xml;type=' + linkType)
                    .addAttribute(href, itemUrl.slice(this.requesUrl.length + 1) + '/' + memDef.name);

                //includes

                this.xml.endElement();
            }
        }
    },
    _buildProperties: function (data, esDef, elementType, selectedFields, includes) {
        var m = this.xml.declareNamespace(this.cfg.m, 'm');
        var d = this.xml.declareNamespace(this.cfg.d, 'd');

        var memDefs = elementType.memberDefinitions.getPublicMappedProperties();
        if (selectedFields && selectedFields.length > 0)
            memDefs = selectedFields;

        for (var i = 0; i < memDefs.length; i++) {
            var memDef = memDefs[i];
            if (memDef.inverseProperty === undefined) {
                this._buildProperty(data, memDef, m, d);
            }
        }


    },
    _buildProperty: function (data, memDef, m, d) {
        var resolvedUserAgent = this.supports[this._getUserAgent()];
        var typeName = this._resolveEdmType(memDef);
        var type = Container.resolveType(memDef.type);

        if (!resolvedUserAgent || (resolvedUserAgent && resolvedUserAgent.indexOf(typeName) >= 0) || (type.isAssignableTo && type.isAssignableTo($data.Entity))) {

            var memberType = this.xml.declareAttribute(m, 'type');
            var prop = this.xml.declareElement(d, memDef.name);

            this.xml.startElement(prop);

            if (typeName !== 'Edm.String')
                this.xml.addAttribute(memberType, typeName);

            var value = data[memDef.name];
            if (value !== null && value !== undefined) {

                if (type === $data.Array) {
                    type = Container.resolveType(memDef.elementType);
                    if (type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                        var subEntitySet = this._getEntitySetDefByType(type);
                        if (subEntitySet) {
                            //array of ComplexEntitys

                            var inline = this.xml.declareElement(m, 'inline');
                            this.xml.startElement(inline);
                            this._buildComplexArray(data[memDef.name], type, m, d);

                            this.xml.endElement();
                        } else {
                            this._buildComplexArray(data[memDef.name], type, m, d);
                        }
                    } else {
                        //array of Primitive types
                        if (this._getUserAgent() !== this.cfg.excelUserAgent) {
                            this._buildComplexArray(data[memDef.name], type, m, d);
                        }
                    }
                } else if (type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                        //complexType
                    this._buildProperties(data[memDef.name], undefined, type);
                } else {
                    //primitive types
                    var typeName = Container.resolveName(type);
                    this.xml.addText(this._valueConverters[typeName] ? this._valueConverters[typeName](value) : value.toString());
                }
            } else {
                var nullValue = this.xml.declareAttribute(m, 'null');
                this.xml.addAttribute(nullValue, 'true');
            }

            this.xml.endElement();
        }
    },
    _buildComplexArray: function (data, type, m, d) {
        var item = this.xml.declareElement(m, 'item');
        var itemType = this.xml.declareAttribute('type');

        if (type.isAssignableTo && type.isAssignableTo($data.Entity)) {
            for (var i = 0; i < data.length; i++) {
                this.xml.startElement(item)
                    .addAttribute(itemType, Container.resolveName(type));
                this._buildProperties(data[i], undefined, type);
                this.xml.endElement();
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                var typeName = Container.resolveName(type);
                var edmTypeName = this._edmTypeMapping[typeName] ? this._edmTypeMapping[typeName] : typeName;

                this.xml.startElement(item);
                if (edmTypeName !== 'Edm.String')
                    this.xml.addAttribute(itemType, edmTypeName);
                this.xml.addText(this._valueConverters[typeName] ? this._valueConverters[typeName](data[i]) : data[i].toString());
                this.xml.endElement();
            }
        }
    },

    _resolveEdmType: function (memDef) {
        var type = Container.resolveType(memDef.type);
        var typeName = Container.resolveName(type);
        if (type === $data.Array) {
            type = Container.resolveType(memDef.elementType);
            typeName = Container.resolveName(type);
            return 'Collection(' + (this._edmTypeMapping[typeName] ? this._edmTypeMapping[typeName] : typeName) + ')';
        }
        return this._edmTypeMapping[typeName] ? this._edmTypeMapping[typeName] : typeName;
    },
    _edmTypeMapping: {
        value: {
            '$data.Boolean': 'Edm.Boolean',
            '$data.Blob': 'Edm.Binary',
            '$data.Date': 'Edm.DateTime',
            '$data.Number': 'Edm.Decimal',
            '$data.Integer': 'Edm.Int32',
            '$data.String': 'Edm.String',
            '$data.ObjectID': 'Edm.String'
        }
    },
    _valueConverters: {
        value: {
            '$data.Boolean': function (v) { return v.toString(); },
            '$data.Blob': function (v) { return v.toString(); },
            '$data.Date': function (v) { return v.toISOString(); },
            '$data.Number': function (v) { return v.toString(); },
            '$data.Integer': function (v) { return v.toString(); },
            '$data.String': function (v) { return v; },
            '$data.ObjectID': function (v) { return v.toString(); },
            '$data.Object': function (v) { return JSON.stringify(v); },
        }
    },
    supports: {
        value: {
            'PowerPivot': [
                'Edm.Boolean',
                'Edm.Binary',
                'Edm.DateTime',
                'Edm.Decimal',
                'Edm.Int32',
                'Edm.String'
            ]
        }
    },
    _getUserAgent: function () {
        return this.cfg.headers['user-agent'] || this.cfg.headers['User-Agent'] || '';
    }
});
