
$data.Class.define("$data.Yahoo.YQLContext", $data.EntityContext, null, {
    //Geo
    Continents: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.continent, tableName: 'geo.continents' },
    Counties: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.county, tableName: 'geo.counties' },
    Countries: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.country, tableName: 'geo.countries' },
    Districts: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.district, tableName: 'geo.districts' },
    Oceans: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.ocean, tableName: 'geo.oceans' },
    Places: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.place, tableName: 'geo.places' },
    PlaceTypes: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.placetype, tableName: 'geo.placetypes' },
    PlaceSiblings: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.sibling, tableName: 'geo.places.siblings' },
    PlaceParents: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.parent, tableName: 'geo.places.parent' },
    PlaceNeighbors: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.neighbor, tableName: 'geo.places.neighbors' },
    PlaceCommons: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.common, tableName: 'geo.places.common' },
    PlaceChildrens: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.children, tableName: 'geo.places.children' },
    PlaceBelongtos: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.belongto, tableName: 'geo.places.belongtos' },
    PlaceAncestors: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.ancestor, tableName: 'geo.places.ancestors' },
    Seas: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.sea, tableName: 'geo.seas' },
    States: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.state, tableName: 'geo.states' },
    PlaceDescendants: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.descendant, tableName: 'geo.places.descendants' },

    placeTypeNameRef: { value: $data.Yahoo.types.Geo.placeTypeNameCf },
    centroidRef: { value: $data.Yahoo.types.Geo.centroidCf },
    countryRef: { value: $data.Yahoo.types.Geo.countryCf },
    adminRef: { value: $data.Yahoo.types.Geo.adminCf },
    localityRef: { value: $data.Yahoo.types.Geo.localityCf },
    postalRef: { value: $data.Yahoo.types.Geo.postalCf },
    boundingBoxRef: { value: $data.Yahoo.types.Geo.boundingBoxCf },

    //Data
    Atom: {
        anonymousResult: true,
        tableName: 'atom',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLAtom", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true }
        }, null)
    },
    Csv: {
        anonymousResult: true,
        tableName: 'csv',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLCsv", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            charset: { type: 'string', searchable: true },
            columns: { type: 'string', searchable: true }
        }, null)
    },
    DataUri: {
        anonymousResult: true,
        tableName: 'data.uri',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLDataUri", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true }
        }, null)
    },
    Feed: {
        anonymousResult: true,
        tableName: 'feed',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLFeed", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true }
        }, null)
    },
    FeedNormalizer: {
        anonymousResult: true,
        tableName: 'feednormalizer',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLFeedNormalizer", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            output: { type: 'string', searchable: true },
            prexslurl: { type: 'string', searchable: true },
            postxslurl: { type: 'string', searchable: true },
            timeout: { type: 'string', searchable: true }
        }, null)
    },
    Html: {
        anonymousResult: true,
        tableName: 'html',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLHtml", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            charset: { type: 'string', searchable: true },
            browser: { type: 'bool', searchable: true },
            xpath: { type: 'string', searchable: true },
            compat: { type: 'string', searchable: true, description: "valid values for compat is 'html5' and 'html4'" },
            Result: { type: 'string', searchable: true }
        }, null)
    },
    Json: {
        anonymousResult: true,
        tableName: 'json',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLJson", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            itemPath: { type: 'string', searchable: true }
        }, null)
    },
    Rss: {
        anonymousResult: false,
        tableName: 'rss',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLRss", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            guid: { type: 'GuidField' },
            title: { type: 'string' },
            description: { type: 'string' },
            link: { type: 'string' },
            pubDate: { type: 'string' }
        }, null)
    },
    GuidField: {
        type: $data.Class.define("GuidField", $data.Entity, null, {
            isPermaLink: { type: 'string' },
            content: { type: 'string' }
        }, null)
    },
    Xml: {
        anonymousResult: true,
        tableName: 'xml',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLXml", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            itemPath: { type: 'string', searchable: true }
        }, null)
    },
    Xslt: {
        anonymousResult: true,
        tableName: 'xslt',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLXslt", $data.Entity, null, {
            url: { type: 'string', searchable: true },
            xml: { type: 'string', searchable: true },
            stylesheet: { type: 'string', searchable: true },
            stylesheetliteral: { type: 'string', searchable: true },
            wrapperelement: { type: 'string', searchable: true }
        }, null)
    }

}, null);