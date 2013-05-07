$data.Class.define('$data.oDataServer.ServiceDefinitionXml', null, null, {
    constructor: function (config) {
        this.cfg = $data.typeSystem.extend({

            xmlns: 'http://www.w3.org/2007/app',
            atomNs: 'http://www.w3.org/2005/Atom',
            appNs: 'http://www.w3.org/2007/app',

            xmlHead: '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'

        }, config);

    },
    convertToResponse: function (contextInstance, requestUrl) {
        var xml = new $data.Xml.XmlCreator();
        var xmlResult = this.cfg.xmlHead;

        xml.startDocument();
        
        var service = xml.declareElement('service');
        xml.startElement(service);

        //atom
        var atomNs = xml.declareNamespace(this.cfg.atomNs, 'atom');
        xml.addNamespace(atomNs);

        //xmlns
        var xmlns = xml.declareAttribute('xmlns');
        xml.addAttribute(xmlns, this.cfg.xmlns);

        //base
        var base = xml.declareAttribute('xml:base');
        xml.addAttribute(base, requestUrl + '/');

        this._buildWorkspaces(xml, contextInstance, atomNs);

        xml.endElement();
        xml.endDocument();

        xmlResult += xml.getXmlString();

        return xmlResult;

    },
    _buildWorkspaces: function (xml, context, atomNs) {
        var workspace = xml.declareElement('workspace');
        xml.startElement(workspace);

        //Default
        var title = xml.declareElement(atomNs, 'title');
        xml.startElement(title).addText('Default').endElement();

        for (var esName in context._entitySetReferences) {
            var entitySet = context._entitySetReferences[esName];
            if (entitySet instanceof $data.EntitySet) {
                this._buildCollection(xml, entitySet, atomNs);
            }
        }

        xml.endElement();
    },
    _buildCollection: function (xml, entitySet, atomNs) {
        var href = xml.declareAttribute('href');
        var collection = xml.declareElement('collection');
        xml.startElement(collection)
            .addAttribute(href, entitySet.collectionName);

        var title = xml.declareElement(atomNs, 'title');
        xml.startElement(title).addText(entitySet.collectionName).endElement();

        xml.endElement();
    }
});
