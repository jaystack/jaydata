$data.Class.define('$data.Xml.XmlCreator', null, null, {
    constructor: function () {
        //init
        this.startDocument();
    },
    startDocument: function () {
        this.elements = [];
        this.namespaces = {};
        this.currentElement = undefined;

        this.xmlPart = '';

        return this;
    },
    endDocument: function () {
        if (this.elements.length !== 0) {
            return '<error>invalidXml</error>';
        }

        return this;
    },
    getXmlString: function () {
        if (this.elements.length !== 0) {
            return '<error>invalidXml</error>';
        }

        return this.xmlPart;
    },

    startElement: function (element) {
        if (this.currentElement) {
            this.currentElement.HasChild = true;
            this.elements.push(this.currentElement);

            if (!this.currentElement.PersistStarted)
                this.persistNode(this.currentElement, true, false);
        }

        var inheritedNamespaces = this.currentElement ? [].concat(this.currentElement.InheritedNamespaces, this.currentElement.Namespaces) : [];
        this.currentElement = new $data.Xml.XmlNode(element, inheritedNamespaces);

        if (element.Namespace && this.currentElement.InheritedNamespaces.indexOf(element.Namespace.Name) === -1) {
            this.currentElement.Namespaces.push(element.Namespace.Name);
            this.namespaces[element.Namespace.Name] = element.Namespace;
        }

        return this;
    },
    endElement: function (isInline) {
        this.persistNode(this.currentElement, isInline);
        this.currentElement = this.elements.pop();
        return this;
    },
    endElementInline: function () {
        return this.endElement(true);
    },

    addAttribute: function (attr, value) {
        attr.Value = value;
        var key = attr.Namespace ? (attr.Name + '_' + attr.Namespace.Name) : attr.Name;
        this.currentElement.Attributes.push(key);
        this.currentElement.Attributes[key] = attr;

        if (attr.Namespace && this.currentElement.InheritedNamespaces.indexOf(attr.Namespace.Name) === -1 && this.currentElement.Namespaces.indexOf(attr.Namespace.Name) === -1) {
            this.currentElement.Namespaces.push(attr.Namespace.Name);
            this.namespaces[attr.Namespace.Name] = attr.Namespace;
        }

        return this;
    },

    addNamespace: function (namespace) {
        if (this.currentElement.InheritedNamespaces.indexOf(namespace.Name) === -1 && this.currentElement.Namespaces.indexOf(namespace.Name) === -1) {
            this.currentElement.Namespaces.push(namespace.Name);
            this.namespaces[namespace.Name] = namespace;
        }
        return this;
    },

    addText: function (text) {
        this.currentElement.Text += text;

        return this;
    },

    declareNamespace: function (schema, schemaName) {
        return new $data.Xml.XmlNamespace(schema, schemaName);
    },
    declareElement: function (namespaceOrName, name) {
        if (typeof namespaceOrName === 'string') {
            return new $data.Xml.XmlElement(namespaceOrName);
        } else {
            return new $data.Xml.XmlElement(name, namespaceOrName);
        }
    },
    declareAttribute: function (namespaceOrName, name) {
        if (typeof namespaceOrName === 'string') {
            return new $data.Xml.XmlAttribute(namespaceOrName);
        } else {
            return new $data.Xml.XmlAttribute(name, namespaceOrName);
        }
    },
    persistNode: function (node, isInline) {
        if (!node.PersistStarted) {
            if (node.Element.Namespace) {
                var ns = node.Element.Namespace;
                this.xmlPart += '<' + ns.Name + ':' + node.Element.Name;
            } else {
                this.xmlPart += '<' + node.Element.Name;
            }

            for (var i = 0; i < node.Namespaces.length; i++) {
                var ns = this.namespaces[node.Namespaces[i]];
                this.xmlPart += ' xmlns:' + ns.Name + '="' + ns.Schema + '"';
            }

            var attrs = node.Attributes.sort();
            for (var i = 0; i < attrs.length; i++) {
                var attrName = node.Attributes[i];
                var attr = node.Attributes[attrName];
                if (attr.Namespace) {
                    this.xmlPart += ' ' + attr.Namespace.Name + ':' + attr.Name + '="' + attr.Value + '"';
                } else {
                    this.xmlPart += ' ' + attr.Name + '="' + attr.Value + '"';
                }
            }

            if (node.HasChild) {
                this.xmlPart += '>';
                node.PersistStarted = true;
            } else {
                if (isInline && !node.Text) {
                    this.xmlPart += '/>';
                } else {
                    this.xmlPart += '>' + this.escapeText(node.Text);

                    if (node.Element.Namespace) {
                        var ns = node.Element.Namespace;
                        this.xmlPart += '</' + ns.Name + ':' + node.Element.Name + '>';
                    } else {
                        this.xmlPart += '</' + node.Element.Name + '>';
                    }
                }
            }
        } else {
            if (node.Element.Namespace) {
                var ns = node.Element.Namespace;
                this.xmlPart += '</' + ns.Name + ':' + node.Element.Name + '>';
            } else {
                this.xmlPart += '</' + node.Element.Name + '>';
            }
        }
    },
    escapeText: function (text) {
        if (text) {
            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')/*.replace(/"/g, '&quot;').replace(/'/g, '&apos;')*/;
        }
        return text;
    }
});

$data.Class.define('$data.Xml.XmlElement', null, null, {
    constructor: function(name, ns){
        this.Name = name;
        this.Namespace = ns;
    },
    Name: { type: 'string' },
    Namespace: { type: '$data.Xml.XmlNamespace' }
});
$data.Class.define('$data.Xml.XmlNamespace', null, null, {
    constructor: function (schema, name) {
        this.Schema = schema;
        this.Name = name;
    },
    Name: { type: 'string' },
    Schema: { type: 'string' }
});
$data.Class.define('$data.Xml.XmlAttribute', null, null, {
    constructor: function (name, ns, value) {
        this.Name = name;
        this.Namespace = ns;
        this.Value = value;
    },
    Name: { type: 'string' },
    Namespace: { type: '$data.Xml.XmlNamespace' },
    Value: { type: 'string' }
});
$data.Class.define('$data.Xml.XmlNode', null, null, {
    constructor: function (element, inherited) {
        this.Element = element;
        this.Attributes = [];
        this.Namespaces =  [];
        this.InheritedNamespaces = inherited;
        this.Text = "";
    },
    Element: { type: '$data.Xml.XmlElement' },
    Attributes: { type: 'Array', elementType: 'string' },
    Text: { type: 'string' },

    Namespaces: { type: 'Array', elementType: 'string' },
    InheritedNamespaces: { type: 'Array', elementType: 'string' },
    HasChild: { type: 'bool' },
    PersistStarted: { type: 'bool' }
});
