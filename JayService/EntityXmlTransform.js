$data.Class.define('$data.oDataServer.EntityXmlTransform', $data.oDataServer.EntityTransform, null, {
    constructor: function (context, requesUrl, config) {
        ///	<signature>
        ///     <summary>Transform class for Atom format</summary>
        ///     <description>Transform class for Atom format</description>
        ///     <param name="context" type="$data.EntityContext">Context instance</param>
        ///     <param name="requesUrl" type="String">Service Url</param>
        ///     <param name="config" type="Object">Config for customize xml</param>
        /// </signature>

        this.cfg = $data.typeSystem.extend({
            m: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
            d: 'http://schemas.microsoft.com/ado/2007/08/dataservices',

            xmlns: 'http://www.w3.org/2005/Atom',
            scheme: 'http://schemas.microsoft.com/ado/2007/08/dataservices/scheme',
            related: 'http://schemas.microsoft.com/ado/2007/08/dataservices/related',

            xmlHead: '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>',

            headers: [],
            excelUserAgent: 'PowerPivot',

            gml: 'http://www.opengis.net/gml',
            georss: 'http://www.georss.org/georss'

        }, config);

    },
    convertToResponse: function (results, collectionNameOrElementType, selectedFields, includes) {
        ///	<signature>
        ///     <summary>Transform entities for JSON verbose format</summary>
        ///     <description>Transform entities for JSON verbose format</description>
        ///     <param name="results" type="Array">Array of Entities from any EntitySet of context</param>
        ///     <param name="collectionNameOrElementType" type="function">elementType of input items</param>
        ///     <param name="selectedFields" type="Array">Fields for result</param>
        ///     <param name="includes" type="Array">navigation property includes</param>
        ///     <return type="String" />
        /// </signature>
        ///	<signature>
        ///     <summary>Transform entities for JSON verbose format</summary>
        ///     <description>Transform entities for JSON verbose format</description>
        ///     <param name="results" type="Array">Array of Entities from any EntitySet of context</param>
        ///     <param name="collectionNameOrElementType" type="string">EntitySet name</param>
        ///     <param name="selectedFields" type="Array">Fields for result</param>
        ///     <param name="includes" type="Array">navigation property includes</param>
        ///     <return type="String" />
        /// </signature>

        if (!collectionNameOrElementType)
            return '<error />';

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
                return selectedFields.indexOf(memDef.name) >= 0 || selectedFields.filter(function(it){ return it.split('.')[0] === memDef.name }).length;
            });
        }

        var xmlResult = this.cfg.xmlHead;
        this.xml = new $data.Xml.XmlCreator();

        this.xml.startDocument();
        if ($data.Array.isArray(results)) {
            this._buildFeed(results, entitySetDef, defaultType, memDefs, selectedFields, includes, '');
        } else {
            this._buildEntry(results, entitySetDef, defaultType, memDefs, selectedFields, includes, true, '');
        }
        this.xml.endDocument();
        xmlResult += this.xml.getXmlString();
        return xmlResult;
    },

    _buildFeed: function (data, esDef, elementType, memDefs, selectedFields, includes, path, rootHref) {
        var feed = this.xml.declareElement('feed');
        this.xml.startElement(feed);

        if (!path){
            this._addMainNamespaces(esDef);
        }

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
            .addAttribute(href, rootHref || esDef.name)
            .endElement();

        for (var i = 0; i < data.length; i++) {
            this._buildEntry(data[i], esDef, elementType, memDefs, selectedFields, includes, false, path);
        }

        if (data.length === 0) {
            var author = this.xml.declareElement('author');
            var name = this.xml.declareElement('name');
            this.xml.startElement(author)
                .startElement(name).endElement()
                .endElement();
        }

        this.xml.endElement();
    },
    _buildEntry: function (data, esDef, elementType, memDefs, selectedFields, includes, isRoot, path) {
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
        this._buildNavProperties(data, esDef, elementType, itemUrl, memDefs, selectedFields, includes, path);

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
        this._buildProperties(data, esDef, elementType, memDefs, selectedFields, includes, path);
        this.xml.endElement()
           .endElement()
           .endElement();
    },
    _addMainNamespaces: function (esDef) {
        var xmlns = this.xml.declareAttribute('xmlns');
        this.xml.addAttribute(xmlns, this.cfg.xmlns);

        var d = this.xml.declareNamespace(this.cfg.d, 'd');
        this.xml.addNamespace(d);

        var m = this.xml.declareNamespace(this.cfg.m, 'm');
        this.xml.addNamespace(m);

        var base = this.xml.declareAttribute('xml:base');
        this.xml.addAttribute(base, this.requesUrl + '/' + esDef.name);
    },

    _buildNavProperties: function (data, esDef, elementType, itemUrl, memDefs, selectedFields, includes, path) {
        var memDefs = elementType.memberDefinitions.getPublicMappedProperties();
        if (path && selectedFields && selectedFields.length > 0)
            memDefs = memDefs.filter(function(it){ return selectedFields.indexOf(path + '.' + it.name) >= 0; });

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
                    .addAttribute(rel, this.cfg.related + '/' + (type === $data.Array ? linkEsDef.name : memDef.name))
                    .addAttribute(atype, 'application/atom+xml;type=' + linkType)
                    .addAttribute(href, itemUrl.slice(this.requesUrl.length + 1) + '/' + memDef.name);

                //includes
                if (data[memDef.name] !== undefined){
                    var m = this.xml.declareNamespace(this.cfg.m, 'm');
                    var inline = this.xml.declareElement(m, 'inline');
                    this.xml.startElement(inline);
                    
                    var defaultType = Container.resolveType(memDef.elementType || memDef.type);
                    var esType = this._getEntitySetDefByType(defaultType);
                    var path = path ? path + '.' + memDef.name : memDef.name;
                    if (memDef.elementType){
                        this._buildFeed(data[memDef.name], esType, defaultType, defaultType.memberDefinitions.getPublicMappedProperties(), selectedFields, includes, path, itemUrl.slice(this.requesUrl.length + 1) + '/' + memDef.name);
                    }else{
                        this._buildEntry(data[memDef.name], esType, defaultType, memDefs, selectedFields, includes, false, path);
                    }
                    
                    this.xml.endElement();
                }

                this.xml.endElement();
            }
        }
    },
    _buildProperties: function (data, esDef, elementType, memDefs, selectedFields, includes, path) {
        var m = this.xml.declareNamespace(this.cfg.m, 'm');
        var d = this.xml.declareNamespace(this.cfg.d, 'd');

        var memDefs = elementType.memberDefinitions.getPublicMappedProperties();
        if (path){
            if (selectedFields && selectedFields.length > 0)
                memDefs = memDefs.filter(function(it){
                    return (selectedFields.indexOf(path) >= 0 && selectedFields.indexOf(path + '.' + it.name) < 0) ||
                        selectedFields.indexOf(path + '.' + it.name) >= 0; });
        }else{
            if (selectedFields && selectedFields.length > 0)
                memDefs = memDefs.filter(function(it){ return selectedFields.indexOf(it.name) >= 0; });
        }

        for (var i = 0; i < memDefs.length; i++) {
            var memDef = memDefs[i];
            if (memDef.inverseProperty === undefined && (memDef.lazyLoad !== true || (Array.isArray(selectedFields) && selectedFields.indexOf(memDef.name) >= 0))) {
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
                    var converter = this._valueConverters.xmlEscape[typeName];
                    this.xml.addText(converter ? converter.call(this, value) : value.toString());
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
                var converter = this._valueConverters.xmlEscape[typeName];
                this.xml.addText(converter ? converter.call(this, data[i]) : data[i].toString());
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

    _buildSpatialPoint: function (value, srsName) {
        var gml = this.xml.declareNamespace(this.cfg.gml, 'gml');
        var point = this.xml.declareElement(gml, value.type);
        var srsNameAttr = this.xml.declareAttribute(gml, 'srsName');

        this.xml.startElement(point)
            .addAttribute(srsNameAttr, srsName);

        var pos = this.xml.declareElement(gml, 'pos');
        this.xml.startElement(pos);
        this.xml.addText(value.coordinates.join(' '));
        this.xml.endElement();

        this.xml.endElement();
    },

    _buildSpatialLineString: function (value, srsName) {
        var gml = this.xml.declareNamespace(this.cfg.gml, 'gml');
        var point = this.xml.declareElement(gml, value.type);
        var srsNameAttr = this.xml.declareAttribute(gml, 'srsName');

        this.xml.startElement(point)
            .addAttribute(srsNameAttr, srsName);

        var pos = this.xml.declareElement(gml, 'posList');
        this.xml.startElement(pos);

        var valueText = '';
        if (value.coordinates) {
            for (var i = 0; i < value.coordinates.length; i++) {
                if (Array.isArray(value.coordinates[i])) {
                    if (i !== 0) valueText += ' ';
                    valueText += value.coordinates[i].join(' ');
                }
            }
        }
        this.xml.addText(valueText);
        this.xml.endElement();

        this.xml.endElement();
    },

    _edmTypeMapping:{
        value: $data.oDataEdmMapping
    },
    _valueConverters: {
        value: $data.oDataConverter
    },
    supports: {
        value: {
            'PowerPivot': [
                'Edm.Byte',
                'Edm.SByte',
                'Edm.Decimal',
                'Edm.Float',
                'Edm.Int16',
                'Edm.Int64',
                'Edm.DateTimeOffset',
                'Edm.Time',
                'Edm.Boolean',
                'Edm.Binary',
                'Edm.DateTime',
                'Edm.Double',
                'Edm.Int32',
                'Edm.String',
                'Edm.Guid'
            ]
        }
    },
    _getUserAgent: function () {
        return this.cfg.headers['user-agent'] || this.cfg.headers['User-Agent'] || '';
    }
});
