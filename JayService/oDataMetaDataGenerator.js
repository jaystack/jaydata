var xmldom = require('xmldom');

$data.Class.define('$data.oDataServer.MetaDataGeneratorRole', null, null, {
    constructor: function (typeName, entitySetName, multiplicity) {
        this.typeName = typeName;
        this.entitySetName = entitySetName;
        this.multiplicity = multiplicity;
    },
    typeName: {},
    multiplicity: {},
    entitySetName: {}
});
$data.Class.define('$data.oDataServer.MetaDataGeneratorAssoctiation', null, null, {
    constructor: function (name, srole, trole) {
        this.name = name,
            this.source = srole;
        this.target = trole;
    },
    name: {},
    source: {},
    target: {}
});

$data.Class.define('$data.oDataServer.MetaDataGenerator', null, null, {
    constructor: function (config, context) {
        ///	<signature>
        ///     <summary>Generator for standard OData Metadata from context</summary>
        ///     <description>Generator for standard OData Metadata from context</description>
        ///     <param name="config" type="Object">
        ///         configurable                defaultValue 
        ///         -----------------------------------------
        ///         version:                    'V2',
        ///         maxVersion:                 'V2',
        ///         dsVersion:                  'V1',
        ///         extended:                   true,
        ///         edmTypeMapping:             true,
        ///         
        ///         edmx:                       'http://schemas.microsoft.com/ado/2007/06/edmx',
        ///         m:                          'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
        ///         d:                          'http://schemas.microsoft.com/ado/2007/08/dataservices',
        ///         namespace:                  'http://schemas.microsoft.com/ado/2008/09/edm',
        ///         
        ///         nsV1:                       'http://schemas.microsoft.com/ado/2006/04/edm',
        ///         nsV2:                       'http://schemas.microsoft.com/ado/2008/09/edm',
        ///         nsV3:                       'http://schemas.microsoft.com/ado/2009/11/edm',
        ///         
        ///         V1:                         '1.0',
        ///         V2:                         '2.0',
        ///         V3:                         '3.0',
        ///         
        ///         xmlHead:                    '&#60;?xml version="1.0" encoding="UTF-8" standalone="yes" ?&#62;',
        ///         
        ///         customPropertyNS:           'http://jaydata.org/extendedproperties',
        ///         customPropertyNSName:       'Jay',
        ///         
        ///         contextNamespace:           context.namespace || 'MyContext'
        ///     </param>
        ///     <param name="context" type="$data.EntityContext">Context instance</param>
        /// </signature>
        ///	<signature>
        ///     <summary>Transform class for JSON verbose format</summary>
        ///     <description>Transform class for JSON verbose format</description>
        ///     <param name="config" type="Object">
        ///         configurable                defaultValue 
        ///         -----------------------------------------
        ///         version:                    'V2',
        ///         maxVersion:                 'V2',
        ///         dsVersion:                  'V1',
        ///         extended:                   true,
        ///         edmTypeMapping:             true,
        ///         
        ///         edmx:                       'http://schemas.microsoft.com/ado/2007/06/edmx',
        ///         m:                          'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
        ///         d:                          'http://schemas.microsoft.com/ado/2007/08/dataservices',
        ///         namespace:                  'http://schemas.microsoft.com/ado/2008/09/edm',
        ///         
        ///         nsV1:                       'http://schemas.microsoft.com/ado/2006/04/edm',
        ///         nsV2:                       'http://schemas.microsoft.com/ado/2008/09/edm',
        ///         nsV3:                       'http://schemas.microsoft.com/ado/2009/11/edm',
        ///         
        ///         V1:                         '1.0',
        ///         V2:                         '2.0',
        ///         V3:                         '3.0',
        ///         
        ///         xmlHead:                    '&#60;?xml version="1.0" encoding="UTF-8" standalone="yes" ?&#62;',
        ///         
        ///         customPropertyNS:           'http://jaydata.org/extendedproperties',
        ///         customPropertyNSName:       'Jay',
        ///         
        ///         contextNamespace:           context.namespace || 'MyContext'
        ///     </param>
        ///     <param name="context" type="function">Context type</param>
        /// </signature>

        var _context = context;
        if (_context instanceof $data.EntityContext)
            _context = _context.getType();

        this.context = _context;
        this.isJayDataClass = !!this.context.isAssignableTo;

        this.cfg = $data.typeSystem.extend({
            version: 'V2',
            maxVersion: 'V2',
            dsVersion: 'V1', //DataServiceVersion have to V1
            extended: true,
            edmTypeMapping: true,

            edmx: 'http://schemas.microsoft.com/ado/2007/06/edmx',
            m: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
            d: 'http://schemas.microsoft.com/ado/2007/08/dataservices',
            namespace: 'http://schemas.microsoft.com/ado/2008/09/edm',

            nsV1: 'http://schemas.microsoft.com/ado/2006/04/edm',
            nsV2: 'http://schemas.microsoft.com/ado/2008/09/edm',
            nsV3: 'http://schemas.microsoft.com/ado/2009/11/edm',

            V1: '1.0',
            V2: '2.0',
            V3: '3.0',

            xmlHead: '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>',

            customPropertyNS: 'http://jaydata.org/extendedproperties',
            customPropertyNSName: 'Jay',

            contextNamespace: this.context.namespace || 'MyContext'

        }, config);
    },
    generateMetadataXml: function () {
        ///	<signature>
        ///     <summary>Convert $metadata XML from context</summary>
        ///     <description>Convert $metadata XML from context</description>
        ///     <return type="string" />
        /// </signature>
        var xml = new $data.Xml.XmlCreator();
        var xmlResult = this.cfg.xmlHead;

        xml.startDocument();
        this._buildEdmx(xml);
        xml.endDocument();

        xmlResult += xml.getXmlString();
        return xmlResult;
    },


    _buildEdmx: function (xml) {
        var ns = xml.declareNamespace(this.cfg.edmx, 'edmx');
        var edmx = xml.declareElement(ns, 'Edmx');
        var version = xml.declareAttribute('Version');

        xml.startElement(edmx)
            .addAttribute(version, '1.0');

        this._buildDataServices(xml);
        xml.endElement();
    },

    _buildDataServices: function (xml) {
        var ns = xml.declareNamespace(this.cfg.edmx, 'edmx');
        var dataservice = xml.declareElement(ns, 'DataServices');
        var m = xml.declareNamespace(this.cfg.m, 'm');
        var dataServiceVersion = xml.declareAttribute(m, 'DataServiceVersion');
        var maxDataServiceVersion = xml.declareAttribute(m, 'MaxDataServiceVersion');

        xml.startElement(dataservice)
            .addAttribute(dataServiceVersion, this.cfg[this.cfg.dsVersion])
            .addAttribute(maxDataServiceVersion, this.cfg[this.cfg.maxVersion]);

        this._buildSchema(xml);
        xml.endElement();
    },

    _buildSchema: function (xml) {
        var xmlns = xml.declareAttribute('xmlns');
        var schema = xml.declareElement('Schema');
        var namespace = xml.declareAttribute('Namespace');

        xml.startElement(schema)
            .addAttribute(xmlns, this.cfg['ns' + this.cfg.version])
            .addAttribute(namespace, this.cfg.contextNamespace);

        this.registredTypes = [];
        this.complexTypes = [];
        this.entitySetDefinitions = [];
        this.associations = [];

        if (this.isJayDataClass) {
            this._buildEntitySets(xml);
        }

        this._discoverFunctionImports();

        //complexTypes
        this._buildComplexTypes(xml);

        //Association
        if (this.isJayDataClass) {
            this._buildAssociations(xml);
        }

        //entityContainer
        this._buildEntityContainer(xml);

        xml.endElement();
    },

    _buildEntityContainer: function (xml) {
        var entityContainer = xml.declareElement('EntityContainer');
        var name = xml.declareAttribute('Name');
        var m = xml.declareNamespace(this.cfg.m, 'm');
        var isDefaultEntityContainer = xml.declareAttribute(m, 'IsDefaultEntityContainer');

        xml.startElement(entityContainer)
            .addAttribute(name, this.context.name)
            .addAttribute(isDefaultEntityContainer, 'true');

        if (this.isJayDataClass) {
            //entitySets
            var entitySet = xml.declareElement('EntitySet');
            var entityType = xml.declareAttribute('EntityType')
            this.entitySetDefinitions.forEach(function (memDef) {
                var elementType = Container.resolveType(memDef.elementType);
                xml.startElement(entitySet)
                    .addAttribute(name, memDef.name)
                    .addAttribute(entityType, this.cfg.contextNamespace + '.' + elementType.name);
                xml.endElementInline();
            }, this);
        }
        //FunctionImports
        this._buildFunctionImports(xml);

        if (this.isJayDataClass) {
            //AssociationSet
            this._buildAssociationSets(xml);
        }

        xml.endElement();
    },

    _buildEntitySets: function (xml) {
        this.context.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            if (!memDef.type)
                return;

            var type = Container.resolveType(memDef.type);
            if (type.isAssignableTo && type.isAssignableTo($data.EntitySet))
                this._buildEntitySet(xml, memDef)

        }, this);

    },
    _buildComplexTypes: function (xml) {
        if (this.cfg.extended && this.UnknownTypes.length > 0) {
            this.complexTypes = this.complexTypes.concat(this.UnknownTypes);
        }

        //recursive complex types
        while (this.complexTypes.length > 0) {
            var complexTypes = [].concat(this.complexTypes);
            this.complexTypes = [];
            complexTypes.forEach(function (complexType) {
                this._buildType(xml, complexType, 'ComplexType')
            }, this);
        }
    },
    _buildEntitySet: function (xml, memDef) {
        var elementType = Container.resolveType(memDef.elementType);

        this.entitySetDefinitions.push(memDef);
        this.entitySetDefinitions[memDef.name] = memDef;

        this._buildType(xml, elementType, 'EntityType', true);
    },

    _buildType: function (xml, type, xmlElementName, buildKey) {
        if (typeof type.isAssignableTo === 'function' && type.isAssignableTo($data.Entity) && this.registredTypes.indexOf(type) === -1) {
            this.registredTypes.push(type);

            var rootElement = xml.declareElement(xmlElementName);
            var name = xml.declareAttribute('Name');

            xml.startElement(rootElement)
                .addAttribute(name, type.name);

            if (buildKey)
                this._buildEntityKeys(xml, type);
            this._buildProperties(xml, type);

            //entity ImportFunctions

            xml.endElement();
        }
    },
    _buildAssociations: function (xml) {
        var association = xml.declareElement('Association');
        var name = xml.declareAttribute('Name');

        var end = xml.declareElement('End');
        var type = xml.declareAttribute('Type');
        var role = xml.declareAttribute('Role');
        var multiplicity = xml.declareAttribute('Multiplicity');

        var assocKeys = Object.keys(this.associations);
        assocKeys.forEach(function (assocKey) {
            var assoc = this.associations[assocKey];

            xml.startElement(association)
                .addAttribute(name, assoc.name);

            xml.startElement(end)
                .addAttribute(type, assoc.source.typeName)
                .addAttribute(role, assoc.name + '_Source')
                .addAttribute(multiplicity, assoc.source.multiplicity)
            xml.endElementInline();;

            xml.startElement(end)
                .addAttribute(type, assoc.target.typeName)
                .addAttribute(role, assoc.name + '_Target')
                .addAttribute(multiplicity, assoc.target.multiplicity);
            xml.endElementInline();

            xml.endElement();
        }, this);
    },
    _buildAssociationSets: function (xml) {
        var associationSet = xml.declareElement('AssociationSet');
        var name = xml.declareAttribute('Name');
        var association = xml.declareAttribute('Association');

        var end = xml.declareElement('End');
        var role = xml.declareAttribute('Role');
        var entitySet = xml.declareAttribute('EntitySet');

        var assocKeys = Object.keys(this.associations);
        assocKeys.forEach(function (assocKey) {
            var assoc = this.associations[assocKey];

            xml.startElement(associationSet)
                .addAttribute(name, assoc.name)
                .addAttribute(association, this.cfg.contextNamespace + '.' + assoc.name);

            xml.startElement(end)
                .addAttribute(role, assoc.name + '_Source')
                .addAttribute(entitySet, assoc.source.entitySetName);
            xml.endElementInline();

            xml.startElement(end)
                .addAttribute(role, assoc.name + '_Target')
                .addAttribute(entitySet, assoc.target.entitySetName);
            xml.endElementInline();

            xml.endElement();
        }, this);
    },
    _buildFunctionImports: function (xml) {
        var functionImport = xml.declareElement('FunctionImport');
        var parameter = xml.declareElement('Parameter');
        var name = xml.declareAttribute('Name');
        var type = xml.declareAttribute('Type');

        for (var i = 0; i < this.FunctionImports.length; i++) {
            var vMember = this.FunctionImports[i];

            if (!this.cfg.extended && vMember.extended)
                continue;

            xml.startElement(functionImport);

            //entitySetName
            if (!vMember.entitySetName && vMember.returnType && this.isJayDataClass) {
                var eType = Container.resolveType(vMember.returnType);
                if (eType.isAssignableTo && eType.isAssignableTo($data.Queryable) && vMember.elementType)
                    eType = Container.resolveType(vMember.elementType);

                var esMemDef = this._findEntitySetDef(eType);
                if (esMemDef)
                    vMember.entitySetName = esMemDef.name;
            }

            //attributes
            var keys = Object.keys(vMember);

            keys.forEach(function (prop) {
                this._buildPropertyAttribute(xml, prop, vMember[prop], vMember);
            }, this);

            //param elements
            var methodParameters = vMember.params;
            if (methodParameters) {
                methodParameters.forEach(function (param) {
                    xml.startElement(parameter)
                        .addAttribute(name, param.name || param)
                        .addAttribute(type, this._resolveTypeName(param.type || 'string'));
                    xml.endElementInline();

                }, this);
            }

            xml.endElement();
        }
    },

    _buildEntityKeys: function (xml, type) {
        var key = xml.declareElement('Key');
        var propRef = xml.declareElement('PropertyRef');
        var name = xml.declareAttribute('Name');

        var keys = type.memberDefinitions.getKeyProperties();
        if (keys.length > 0) {
            xml.startElement(key);
            keys.forEach(function (memDef) {
                xml.startElement(propRef)
                    .addAttribute(name, memDef.name);
                xml.endElementInline();
            }, this);
            xml.endElement();
        }
    },
    _buildProperties: function (xml, type) {
        type.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            if (memDef.inverseProperty !== undefined) {
                this._buildNavigationProperty(xml, type, memDef);
            } else {
                this._buildProperty(xml, memDef);

                var memDef_type = Container.resolveType(memDef.type);
                if (memDef_type === $data.Array && memDef.elementType) {
                    memDef_type = Container.resolveType(memDef.elementType);
                }

                if (memDef_type.isAssignableTo && memDef_type.isAssignableTo($data.Entity)) {
                    this.complexTypes.push(memDef_type)
                }
            }
        }, this);
    },
    _buildProperty: function (xml, memDef) {
        var property = xml.declareElement('Property');

        xml.startElement(property);

        var keys = Object.keys(memDef);
        keys.forEach(function (prop) {
            this._buildPropertyAttribute(xml, prop, memDef[prop], memDef);
        }, this);

        xml.endElementInline();
    },
    _buildPropertyAttribute: function (xml, name, value, memDef) {
        var resolvedConfig = this._supportedPropertyAttributes[name];
        var attr;
        if (typeof resolvedConfig === 'object') {
            if (!resolvedConfig.cancelRender || !resolvedConfig.cancelRender.call(this, name, memDef)) {
                if (resolvedConfig.namespaceName) {
                    var ns = xml.declareNamespace(resolvedConfig.namespace, resolvedConfig.namespaceName)
                    attr = xml.declareAttribute(ns, resolvedConfig.name);
                } else {
                    attr = xml.declareAttribute(resolvedConfig.name);
                }

                var value = resolvedConfig.converter ? resolvedConfig.converter.call(this, name, value, memDef) : value;
                xml.addAttribute(attr, value.toString());
            }
        } else {
            if (name.indexOf('$') === 0) {
                var val = value.toString();
                if (typeof val === 'string') {
                    var customNs = xml.declareNamespace(this.cfg.customPropertyNS, this.cfg.customPropertyNSName);
                    attr = xml.declareAttribute(customNs, name.slice(1));
                    xml.addAttribute(attr, value.toString());
                }
            }
        }

    },
    _buildNavigationProperty: function (xml, classType, memDef) {
        var navProperty = xml.declareElement('NavigationProperty');
        xml.startElement(navProperty);

        var assocObj = this._createOrGetAssociation(classType, memDef);
        var association = assocObj.association;
        var fromRoleValue = association.name + (!assocObj.source ? '_Source' : '_Target');
        var toRoleValue = association.name + (assocObj.source ? '_Source' : '_Target');

        var name = xml.declareAttribute('Name');
        xml.addAttribute(name, memDef.name);

        var relationship = xml.declareAttribute('Relationship');
        xml.addAttribute(relationship, this.cfg.contextNamespace + '.' + association.name);

        var fromRole = xml.declareAttribute('FromRole');
        xml.addAttribute(fromRole, fromRoleValue);

        var toRole = xml.declareAttribute('ToRole');
        xml.addAttribute(toRole, toRoleValue);

        xml.endElement();
    },
    _createOrGetAssociation: function (classType, memDef) {
        var assocName = classType.name + '_' + memDef.name;
        if (this.associations[assocName])
            return { association: this.associations[assocName], source: false };

        //build association
        //targetType
        var type = Container.resolveType(memDef.type);
        var multiplicity;
        if (type === $data.Array || type.isAssignableTo($data.EntitySet)) {
            type = Container.resolveType(memDef.elementType);
            multiplicity = '*';
        } else {
            multiplicity = memDef.required ? '1' : '0..1';
        }

        if (memDef.inverseProperty !== '$$unbound')
            assocName = type.name + '_' + memDef.inverseProperty;

        //sourceRole
        var esMemDef = this._findEntitySetDef(type);
        var sourceRole = new $data.oDataServer.MetaDataGeneratorRole(this.cfg.contextNamespace + '.' + type.name, (esMemDef ? esMemDef.name : ''), multiplicity);


        //targetRole
        var tMultiplicity = '';
        var targetType = Container.resolveType(esMemDef.elementType);
        var targetMemDef = targetType.memberDefinitions.getMember(memDef.inverseProperty);

        if (memDef.inverseProperty === '$$unbound') {
            if (multiplicity === '*') {
                tMultiplicity = '0..1';
            } else {
                tMultiplicity = '*'
            }
        } else {
            tMultiplicity = (targetMemDef.elementType !== undefined) ? '*' : (targetMemDef.required ? '1' : '0..1');
        }
        esMemDef = this._findEntitySetDef(classType);
        var targetRole = new $data.oDataServer.MetaDataGeneratorRole(this.cfg.contextNamespace + '.' + classType.name, (esMemDef ? esMemDef.name : ''), tMultiplicity);


        var association = new $data.oDataServer.MetaDataGeneratorAssoctiation(assocName, sourceRole, targetRole);
        this.associations[assocName] = association;
        return { association: association, source: true };
    },
    _findEntitySetDef: function (elementType) {
        var entityDefs = this.context.memberDefinitions.getPublicMappedProperties();
        for (var i = 0; i < entityDefs.length; i++) {
            var esMemDef = entityDefs[i];
            if (esMemDef.elementType && Container.resolveType(esMemDef.elementType) === elementType) {
                return esMemDef;
            }
        }
        return null;
    },
    _resolveTypeName: function (type) {
        var resolvedType = Container.getType(type);
        if (typeof resolvedType.isAssignableTo === 'function' && resolvedType.isAssignableTo($data.Entity)) {
            return this.cfg.contextNamespace + '.' + resolvedType.name;
        } else {
            var resolvedName = Container.resolveName(resolvedType);
            if (this.cfg.edmTypeMapping) {
                return this._edmTypeMapping[resolvedName] || resolvedName;
            } else {
                return resolvedName;
            }
        }
    },
    _supportedPropertyAttributes: {
        value: {
            name: {
                name: 'Name',
                cancelRender: function (name, memDef) {
                    return memDef.serviceOpName !== undefined;
                }
            },
            required: {
                name: 'Nullable',
                converter: function (name, value) {
                    return !value;
                }
            },
            nullable: {
                name: 'Nullable',
                cancelRender: function (name, memDef) {
                    return memDef.required !== undefined;
                }
            },
            regex: {
                name: 'RegExp'
            },
            maxLength: {
                name: 'MaxLength',
                converter: function (name, value) {
                    return value === Number.POSITIVE_INFINITY ? 'Max' : value
                }
            },
            concurrencyMode: {
                name: 'ConcurrencyMode',
                converter: function (name, value) {
                    return value[0].toUpperCase() + value.slice(1);
                }
            },
            type: {
                name: 'Type',
                converter: function (name, value, memDef) {
                    var type = Container.resolveType(value);
                    if (type === $data.Array && memDef.elementType) {
                        type = Container.resolveType(memDef.elementType);
                        return 'Collection(' + this._resolveTypeName(type) + ')';
                    }
                        
                    return this._resolveTypeName(type);
                },
                cancelRender: function (name, memdef) {
                    return memdef.type === undefined
                }
            },
            computed: {
                name: 'StoreGeneratedPattern',
                namespace: 'http://schemas.microsoft.com/ado/2009/02/edm/annotation',
                namespaceName: 'p6',
                converter: function (name, value, memDef) {
                    return memDef.key ? 'Identity' : 'Computed';
                }
            },
            edmx_FixedLength: { name: 'FixedLength' },
            edmx_Unicode: { name: 'Unicode' },
            edmx_Precision: { name: 'Precision' },
            edmx_Scale: { name: 'Scale' },

            serviceOpName: { name: 'Name' },
            method: {
                name: 'HttpMethod',
                namespace: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
                namespaceName: 'm'
            },
            entitySetName: { name: 'EntitySet' },
            returnType: {
                name: 'ReturnType',
                converter: function (name, value, memDef) {
                    var type = Container.getType(value);
                    var typeName = this._resolveTypeName(type);
                    if (memDef.elementType && ((type.isAssignableTo && type.isAssignableTo($data.Queryable)) || type === $data.Array)) {
                        var elementName = this._resolveTypeName(memDef.elementType);
                        return 'Collection(' + elementName + ')';
                    }
                    return typeName;
                },
                cancelRender: function (name, memDef) {
                    if (!memDef.returnType)
                        return true;

                    var type = Container.getType(memDef.returnType);
                    return ((type.isAssignableTo && type.isAssignableTo($data.Queryable)) || type === $data.Array) && !memDef.elementType;
                }
            }

        }
    },
    _edmTypeMapping: {
        value: $data.oDataEdmMapping
    },

    _discoverFunctionImports: function () {
        this.FunctionImports = [];
        this.UnknownTypes = [];

        var serviceDefParser = new $data.oDataServer.serviceDefinitionParser();

        var allMembers;
        if (this.isJayDataClass) {
            allMembers = this.context.memberDefinitions.asArray();
        } else {
            allMembers = [];
            var protMembers = Object.keys(this.context.prototype);
            for (var i = 0, l = protMembers.length; i < l; i++) {
                allMembers.push({
                    kind: 'method',
                    name: protMembers[i],
                    method: this.context.prototype[protMembers[i]]
                })
            }

        }
        for (var i = 0; i < allMembers.length; i++) {
            var member = allMembers[i];

            if (member.kind !== 'method' || member.name === 'getType' || member.name === 'constructor' || member.definedBy === $data.Base || member.definedBy === $data.ServiceBase || member.definedBy === $data.EntityContext /*!this.context.prototype.hasOwnProperty(member.name)*/) {
                continue;
            }

            var parsedInfo = serviceDefParser.parseFromMethod(member.method);
            var vMember = {};

            mMember = member.method || member;
            for (var prop in mMember) {
                if (mMember.hasOwnProperty(prop)) {
                    vMember[prop] = mMember[prop];
                }
            }

            vMember = $data.typeSystem.extend({ serviceOpName: member.name, method: vMember.returnType ? 'GET' : 'POST' }, parsedInfo, vMember);

            if (vMember.returnType && this._isExtendedType(vMember.returnType)) {
                var uType = Container.resolveType(vMember.returnType);
                if (this.UnknownTypes.indexOf(uType) === -1) {
                    this.UnknownTypes.push(uType);
                    vMember.extended = true;
                }
            }

            if (vMember.elementType && this._isExtendedType(vMember.elementType)) {
                var uType = Container.resolveType(vMember.elementType);
                if (this.UnknownTypes.indexOf(uType) === -1) {
                    this.UnknownTypes.push(uType);
                    vMember.extended = true;
                }
            }

            if (vMember.params) {
                for (var j = 0, l = vMember.params.length; j < l; j++) {
                    var param = vMember.params[j];
                    if (param && param.type && this._isExtendedType(param.type)) {
                        var uType = Container.resolveType(param.type);
                        if (this.UnknownTypes.indexOf(uType) === -1) {
                            this.UnknownTypes.push(uType);
                            vMember.extended = true;
                        }
                    }
                }
            }

            this.FunctionImports.push(vMember);
        }
    },
    _isExtendedType: function (type) {
        var resolvedType = Container.resolveType(type);
        if (typeof resolvedType.isAssignableTo === 'function' && resolvedType.isAssignableTo($data.Entity)) {

            var esDef;
            if (typeof this.context.isAssignableTo === 'function' && this.context.isAssignableTo($data.EntityContext))
                esDef = this._findEntitySetDef(resolvedType);

            return !esDef && this.complexTypes.indexOf(resolvedType) === -1;
        }

        return resolvedType === $data.Object;
    }
});


$data.Class.define('$data.oDataServer.serviceDefinitionParser', null, null, {
    constructor: function () {
        ///	<signature>
        ///     <summary>VSDoc annotation parser</summary>
        ///     <description>VSDoc annotation parser</description>
        /// </signature>
    },
    parseFromMethod: function (method, target) {
        ///	<signature>
        ///     <summary>Parse VSDoc annotation from function</summary>
        ///     <description>Parse VSDoc annotation from function</description>
        ///     <param name="method" type="function" />
        ///     <param name="target" type="Object">output object</param>
        ///     <returns type="Object"/>
        /// </signature>

        var lines = method.toString().split('\n');
        var commentLines = [];
        for (var i = 1, l = lines.length; i < l; i++) {
            var line = this.ltrim(lines[i]);
            if (line.indexOf('///') === 0) {
                commentLines.push(line.slice(3));
            } else {
                break;
            }
        }

        if (commentLines.length === 0)
            return target || {};

        var xmlString = '<root>' + commentLines.join('\n') + '</root>';

        var xml = (new xmldom.DOMParser()).parseFromString(xmlString, 'application/xml');

        var resultDef = target || {};

        for (var defName in this.supportedFunctionDefinitisons) {
            var def = this.supportedFunctionDefinitisons[defName];
            var fieldName = def.fieldName || defName;
            var elements = xml.getElementsByTagName(def.elementName || defName);
            if (def.single) {
                if (def.attrValue) {
                    if (elements.length === 0)
                        continue;
                    var attr = elements[0].getAttribute(def.attrValue);
                    if (attr)
                        resultDef[fieldName] = resultDef[fieldName] || attr;
                } else {
                    if (elements.length > 0)
                        resultDef[fieldName] = resultDef[fieldName] || true;
                }
            } else if (def.valueConverter && typeof def.valueConverter === 'function') {
                def.valueConverter.call(resultDef, elements);
            }
        }

        return resultDef;
    },
    ltrim: function (str) {
        return str.replace(/^\s+/, '');
    },
    supportedFunctionDefinitisons: {
        value: {
            returns: {
                single: true,
                attrValue: 'type',
                fieldName: 'returnType'
            },
            resultType: {
                single: true,
                attrValue: 'type',
                fieldName: 'resultType'
            },
            entitySet: {
                single: true,
                attrValue: 'name',
                fieldName: 'entitySetName'
            },
            serviceMethod: {
                single: true,
                attrValue: 'name',
                fieldName: 'serviceOpName'
            },
            method: {
                single: true,
                attrValue: 'type',
                fieldName: 'method'
            },
            elementType: {
                elementName: 'returns',
                single: true,
                attrValue: 'elementType',
                fieldName: 'elementType'
            },
            responseType: {
                single: true,
                attrValue: 'type',
                fieldName: 'responseType'
            },
            param: {
                valueConverter: function (xmlDomElements) {
                    for (var i = 0, l = xmlDomElements.length; i < l; i++) {
                        if (i === 0)
                            this.params = [];

                        var nameAttr = xmlDomElements[i].getAttribute('name');
                        var typeAttr = xmlDomElements[i].getAttribute('type');
                        if (nameAttr && typeAttr) {
                            var param = {};
                            param['name'] = nameAttr;
                            param['type'] = typeAttr;
                            this.params.push(param);
                        }

                    }
                }
            },
            socketio: {
                single: true,
                fieldName: 'socketio'
            }
        }
    }
});

Function.prototype.annotateFromVSDoc = function () {
    ///	<signature>
    ///     <summary>Parse current constructor function public function's annotations and decorate it with used variables</summary>
    ///     <description>Parse current constructor function public function's annotations and decorate it with used variables</description>
    /// </signature>

    if (this.prototype) {
        var parser = new $data.oDataServer.serviceDefinitionParser();
        for (var funcName in this.prototype) {
            if (funcName.indexOf('_') === 0 || typeof this.prototype[funcName] !== 'function')
                continue;

            var annotations = parser.parseFromMethod(this.prototype[funcName]);

            if (annotations) {
                for (var name in annotations) {
                    this.prototype[funcName][name] = this.prototype[funcName][name] || annotations[name];
                }
            }
        }
    }
}

