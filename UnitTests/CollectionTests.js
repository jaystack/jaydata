
$data.Entity.extend('JayData.Models.CollectionProp.TestEntity', {
    'Id': { 'key': true, 'type': 'Edm.Int32', 'nullable': false, 'computed': true },
    'Name': { 'type': 'Edm.String' },
    'Groups': { 'type': 'Array', 'elementType': 'Edm.String' },
    'Complexes': { 'type': 'Array', 'elementType': 'JayData.Models.CollectionProp.ComplexEntity', 'nullable': false, 'required': true }
});

$data.Entity.extend('JayData.Models.CollectionProp.ComplexEntity', {
    'Name': { 'type': 'Edm.String' },
    'Created': { 'type': 'Edm.DateTime', 'nullable': false, 'required': true },
    'Index': { 'type': 'Edm.Int32', 'nullable': false, 'required': true },
    'LargeNum': { 'type': 'Edm.Int64', 'nullable': false, 'required': true }
});

$data.EntityContext.extend('CollectionContext', {
    'CollectionProps': { type: $data.EntitySet, elementType: JayData.Models.CollectionProp.TestEntity }
});


function CollectionTests(providerConfig, msg) {
    msg = msg || '';
    module("CollectionTests_" + msg);



    function _getContext() {
        stop();
        var pConf = JSON.parse(JSON.stringify(providerConfig));
        return new CollectionContext(pConf).onReady()
            .then(function (context) {
                if (providerConfig.noCreate) {
                    return context;
                } else {
                    return context.CollectionProps.toArray()
                        .then(function (items) {
                            items.forEach(function (item) {
                                context.remove(item);
                            });
                            return context.saveChanges()
                        })
                        .then(function (items) {
                            context.add(new JayData.Models.CollectionProp.TestEntity({
                                Name: "Name",
                                Groups: [ "name1", "name2" ],
                                Complexes: [
                                    new JayData.Models.CollectionProp.ComplexEntity({ Name: "Name", Created: new Date(), Index: 1, LargeNum: '156315313513' }),
                                    new JayData.Models.CollectionProp.ComplexEntity({ Name: "Name2", Created: new Date(), Index: 3, LargeNum: '64651321353' }),
                                    new JayData.Models.CollectionProp.ComplexEntity({ Name: "Name3", Created: new Date(), Index: 2, LargeNum: '9879323132' })
                                ]
                            }));
                            context.add(new JayData.Models.CollectionProp.TestEntity({
                                Name: "Name",
                                Groups: ["name1", "name2"],
                                Complexes: [
                                    new JayData.Models.CollectionProp.ComplexEntity({ Name: "Name", Created: new Date(), Index: 1, LargeNum: '156315313513' }),
                                    new JayData.Models.CollectionProp.ComplexEntity({ Name: "Name2", Created: new Date(), Index: 3, LargeNum: '64651321353' }),
                                    new JayData.Models.CollectionProp.ComplexEntity({ Name: "Name3", Created: new Date(), Index: 2, LargeNum: '9879323132' })
                                ]
                            }));

                            return context.saveChanges()
                        })
                        .then(function () {
                            return context;
                        });
                }
            })
            .fail(function (err) {
                console.log(err);
                start();
            });
    }

    function _finishCb(context) {
        if (context.storageProvider.db && context.storageProvider.db.close)
            context.storageProvider.db.close();

        start();
    }

    test('Read complex data', 20, function () {
        _getContext()
            .then(function (context) {
                return context.CollectionProps.toArray(function (items) {
                    expect(20 * items.length || 20);
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];

                        equal(typeof item.Id, 'number', 'Id is number');

                        equal(Array.isArray(item.Groups), true, 'Groups is Array');
                        equal(typeof item.Groups[0], 'string', 'Groups element is string');
                        equal(typeof item.Groups[1], 'string', 'Groups element is string');

                        equal(Array.isArray(item.Complexes), true, 'Complexes is Array');
                        for (var j = 0; j < item.Complexes.length; j++) {
                            var complex = item.Complexes[j];
                            equal(complex instanceof JayData.Models.CollectionProp.ComplexEntity, true, 'Complex element is typed');
                            equal(typeof complex.Name, 'string', 'complex.Name is string');
                            equal(complex.Created instanceof Date, true, 'complex.Created is date');
                            equal(typeof complex.Index, 'number', 'complex.Index is string');
                            equal(typeof complex.LargeNum, 'string', 'complex.LargeNum is string');
                        }
                    }

                    _finishCb(context);
                });
            })
             .fail(function (err) {
                 console.log(err);
                 start();
             });;
    });

}

