
$data.Class.define('$data.Yahoo.types.Geo.placeTypeNameCf', $data.Entity, null, {
    code: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.countryCf', $data.Entity, null, {
    code: { type: 'string' },
    type: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.adminCf', $data.Entity, null, {
    code: { type: 'string' },
    type: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.localityCf', $data.Entity, null, {
    code: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.centroidCf', $data.Entity, null, {
    latitude: { type: 'string' },
    longitude: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.postalCf', $data.Entity, null, {
    type: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.boundingBoxCf', $data.Entity, null, {
    southWest: { type: 'centroidRef' },
    northEast: { type: 'centroidRef' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.PlaceMeta', null, null, {
    woeid: { type: 'int', key: true },
    name: { type: 'string' },
    uri: { type: 'string' },
    placeTypeName: { type: 'placeTypeNameRef' },
    lang: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.PlaceMetaFull', [{ type: null }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    country: { type: 'countryRef' },
    admin1: { type: 'adminRef' },
    admin2: { type: 'adminRef' },
    admin3: { type: 'adminRef' },
    locality1: { type: 'localityRef' },
    locality2: { type: 'localityRef' },
    postal: { type: 'postalRef' },
    centroid: { type: 'centroidRef' },
    boundingBox: { type: 'boundingBoxRef' },
    areaRank: { type: 'int' },
    popRank: { type: 'int' }
}, null);


$data.Class.define('$data.Yahoo.types.Geo.placetype', $data.Entity, null, {
    placeTypeDescription: { type: 'string' },
    uri: { type: 'string', key: true },
    placeTypeName: { type: 'placeTypeNameRef' },
    lang: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.sibling', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    sibling_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.parent', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    child_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.neighbor', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    neighbor_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.common', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    woeid1: { type: 'string' },
    woeid2: { type: 'string' },
    woeid3: { type: 'string' },
    woeid4: { type: 'string' },
    woeid5: { type: 'string' },
    woeid6: { type: 'string' },
    woeid7: { type: 'string' },
    woeid8: { type: 'string' },
    'long': { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.children', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    parent_woeid: { type: 'string' },
    placetype: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.belongto', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    member_woeid: { type: 'string' },
    placetype: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.ancestor', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    descendant_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.place', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    text: { type: 'string' },
    focus: { type: 'string' },
    placetype: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.county', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.country', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.district', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.sea', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.state', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.continent', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' },
    view: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.ocean', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' },
    view: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.descendant', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    ancestor_woeid: { type: 'string' },
    placetype: { type: 'string' },
    degree: { type: 'string' },
    view: { type: 'string' }
}, null);

Container.registerType('placeTypeNameRef', $data.Yahoo.types.Geo.placeTypeNameCf);
Container.registerType('centroidRef', $data.Yahoo.types.Geo.centroidCf);
Container.registerType('countryRef', $data.Yahoo.types.Geo.countryCf);
Container.registerType('adminRef', $data.Yahoo.types.Geo.adminCf);
Container.registerType('localityRef', $data.Yahoo.types.Geo.localityCf);
Container.registerType('postalRef', $data.Yahoo.types.Geo.postalCf);
Container.registerType('boundingBoxRef', $data.Yahoo.types.Geo.boundingBoxCf);
