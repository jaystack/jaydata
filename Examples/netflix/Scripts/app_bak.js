//We've added a third and final item to our tab panel - scroll down to see it



(function ($data, Ext) {

    $data.Entity.buildExtFields = function (type, config) {
        if (!type.isAssignableTo)
            return [];

        var fields = type.memberDefinitions.getPublicMappedProperties().map(function (memDef) { return memDef.name; });

        if (config instanceof $data.Array) {
            config.forEach(function (fieldConfig) {
                if (typeof fieldConfig === 'object' && fieldConfig.name) {
                    var fieldIndex = fields.indexOf(fieldConfig.name);
                    if (fieldIndex >= 0) {
                        fields[fieldIndex] = fieldConfig;
                    } else {
                        fields.push(fieldConfig);
                    }
                }
            });
        }
        return fields;
    }

    Ext.define('Ext.data.proxy.JayData', {
        extend: 'Ext.data.proxy.Server',

        alias: 'proxy.JayData',
        alternateClassName: ['Ext.data.JayData'],

        config: {
            queryable: null
        },


        doRequest: function (operation, callback, scope) {
            var me = this,
             request = this.buildRequest(operation);

            if (!me.config.queryable)
                me.processResponse(false, operation, request, null, callback, scope);

            switch (operation.getAction()) {
                case 'create':
                    return me.doCreate(request, operation, callback, scope);
                case 'read':
                    return me.doRead(request, operation, callback, scope);
                case 'update':
                    return me.doUpdate(request, operation, callback, scope);
                case 'destroy':
                    return me.doDelete(request, operation, callback, scope);
                default:
                    break;
            }
            return request;
        },

        buildRequest: function (operation) {
            var me = this,
            params = Ext.applyIf(operation.getParams() || {}, me.getExtraParams() || {}),
            request;

            //copy any sorters, filters etc into the params so they can be sent over the wire
            params = Ext.applyIf(params, me.getParams(operation));

            request = Ext.create('Ext.data.Request', {
                params: params,
                action: operation.getAction(),
                records: operation.getRecords(),
                //url: operation.getUrl(),
                operation: operation,
                proxy: me
            });

            //request.setUrl(me.buildUrl(request));
            operation.setRequest(request);

            return request;
        },

        doRead: function (request, operation, callback, scope) {
            var me = this;
            var queryable = me.buildQueryable(operation, me.config.queryable);

            queryable.toArray({
                success: function (response) {
                    me.processResponse(true, operation, request, response, callback, scope);
                },
                error: function (response) {
                    me.processResponse(false, operation, request, response, callback, scope);
                }
            });

            return request;
        },
        buildQueryable: function (operation, queryable) {
            if (!queryable)
                return queryable;

            var filters = operation.getFilters();
            if (filters) {
                filters.forEach(function (filter) {
                    if (filter.config.hasOwnProperty('scope'))
                        queryable = queryable.filter(filter.getFilterFn(), filter.getScope());
                    else if (filter.getProperty() && filter.getValue())
                        queryable = queryable.filter('it.' + filter.getProperty() + ' == this.value', { value: filter.getValue() });
                });
            }

            var sorters = operation.getSorters();
            if (sorters) {
                sorters.forEach(function (sorter) {
                    var direction = sorter.getDirection() === 'ASC' ? queryable.orderBy : queryable.orderByDescending;
                    if (sorter.getSorterFn())
                        queryable = direction.call(queryable, sorter.getSorterFn());
                    else
                        queryable = direction.call(queryable, 'it.' + sorter.getProperty());

                });
            }

            var pageNum = operation.getPage();
            var pageLimit = operation.getLimit();
            if (pageNum > 1)
                queryable = queryable.skip((pageNum - 1) * pageLimit);

            queryable = queryable.take(pageLimit);

            return queryable;
        },

        doUpdate: function (request, operation, callback, scope) {
            var me = this;
            var queryable = me.config.queryable;
            var entitySet = queryable.entitySet;
            var entityContext = entitySet.entityContext;
            var entityType = entitySet.createNew;

            var records = operation.getRecords();
            for (var i = 0; i < records.length; i++) {
                var entity = new entityType();
                me.updateProperties(entity, records[i], entityType.memberDefinitions.getKeyProperties());
                entity = entitySet.attachOrGet(entity);
                me.updateProperties(entity, records[i], entityType.memberDefinitions.getPublicMappedProperties());
            }

            entityContext.saveChanges({
                success: function (response) {
                    me.processResponse(true, operation, request, response, callback, scope);
                },
                error: function (response) {
                    me.processResponse(false, operation, request, response, callback, scope);
                }
            });

            return request;
        },
        doCreate: function (request, operation, callback, scope) {
            var me = this;
            var queryable = me.config.queryable;
            var entitySet = queryable.entitySet;
            var entityContext = entitySet.entityContext;
            var entityType = entitySet.createNew;

            var records = operation.getRecords();
            for (var i = 0; i < records.length; i++) {
                var entity = new entityType();
                me.updateProperties(entity, records[i], entityType.memberDefinitions.getPublicMappedProperties());
                entitySet.add(entity);
            }

            entityContext.saveChanges({
                success: function (response) {
                    me.processResponse(true, operation, request, response, callback, scope);
                },
                error: function (response) {
                    me.processResponse(false, operation, request, response, callback, scope);
                }
            });

            return request;
        },
        doDelete: function (request, operation, callback, scope) {
            var me = this;
            var queryable = me.config.queryable;
            var entitySet = queryable.entitySet;
            var entityContext = entitySet.entityContext;
            var entityType = entitySet.createNew;

            var records = operation.getRecords();
            for (var i = 0; i < records.length; i++) {
                var entity = new entityType();
                me.updateProperties(entity, records[i], entityType.memberDefinitions.getKeyProperties());
                entitySet.remove(entity);
            }

            entityContext.saveChanges({
                success: function (response) {
                    me.processResponse(true, operation, request, response, callback, scope);
                },
                error: function (response) {
                    me.processResponse(false, operation, request, response, callback, scope);
                }
            });

            return request;
        },
        updateProperties: function (entity, record, memberDefs) {
            var data = record.getData();
            memberDefs.forEach(function (key) {
                if (data.hasOwnProperty(key.name))
                    entity[key.name] = data[key.name];
            });
        }



    });

})($data, Ext);


var northwind = new Northwind.NorthwindEntities({ name: 'oData', oDataServiceHost: 'Northwind.svc' });

var store = Ext.create('Ext.data.TreeStore', {
    //fields: [
    //    'Product_Name', 'Category_ID', 'English_Name', 'Product_ID',
    //    { name: 'leaf', defaultValue: true }
    //],

    fields: $data.Entity.buildExtFields(NorthwindModel.Product, [{ name: 'leaf', defaultValue: true }]),

    root: {
        leaf: false
    },

    remoteFilter: true,
    remoteSort: true,
    pageSize: 100,
    destroyRemovedRecords: false,
    syncRemovedRecords: false,

    proxy: {
        type: 'JayData',
        queryable: northwind.Products,
        reader: {
            type: 'json'
        }
    },

    listeners: {
        load: function () {

        }
    }
});

var fieldUpdater = function (field, value) {
    Ext.getCmp('product-edit').getRecord().set(field.getName(), value);
}

Ext.define('MyApp.view.Welcome', {
    extend: 'Ext.tab.Panel',
    id: 'viewport',

    config: {
        fullscreen: true,
        tabBarPosition: 'bottom',

        items: [
                {
                    toolbar: {
                        items: [
                            {
                                text: 'Refresh',
                                handler: function () { Ext.getCmp('categories').getStore().load(); }
                            }
                        ]
                    },

                    id: 'categories',
                    xtype: 'nestedlist',
                    title: 'Categories',
                    iconCls: 'action',
                    displayField: 'Category_Name',
                    store: {
                        type: 'tree',
                        fields: ['Category_Name', 'Category_ID',
                        { name: 'leaf', defaultValue: true }
                        ],

                        root: {
                            leaf: false
                        },

                        remoteFilter: true,
                        remoteSort: true,
                        pageSize: 100,

                        proxy: {
                            type: 'JayData',
                            queryable: northwind.Categories,
                            reader: {
                                type: 'json'
                            }
                        }
                    },
                    listeners: {
                        activate: function () {
                            var cmp = Ext.getCmp('products');
                            if (cmp) {
                                cmp.setTitle('Products');
                                cmp.config.title = 'Products';
                            }
                        },
                        itemtap: function (nested, list, i, target, record, e, eopts) {
                            store.filter('Category_ID', record.get('Category_ID'));
                            Ext.getCmp('products').setTitle(record.get('Category_Name'));
                            Ext.getCmp('products').config.title = record.get('Category_Name');
                            Ext.getCmp('viewport').setActiveItem(1);
                            //Ext.getCmp('products').getStore().load();
                        }
                    }
                },
                {
                    toolbar: {
                        items: [
                            {
                                id: 'btn-product-delete',
                                text: 'Delete',
                                align: 'right',
                                hidden: true,
                                handler: function () {
                                    var record = Ext.getCmp('products').getLastNode();
                                    record.destroy();
                                }
                            },
                            {
                                id: 'btn-product-edit',
                                text: 'Edit',
                                align: 'right',
                                ui: 'forward',
                                hidden: true,
                                handler: function () {
                                    Ext.getCmp('viewport').setActiveItem(2);
                                    Ext.getCmp('product-edit').setRecord(Ext.getCmp('products').getLastNode());
                                }
                            }
                        ]
                    },

                    id: 'products',
                    xtype: 'nestedlist',
                    title: 'Products',
                    iconCls: 'star',
                    displayField: 'Product_Name',

                    store: store,

                    detailCard: {
                        xtype: 'panel',
                        scrollable: true,
                        styleHtmlContent: true,
                        listeners: {
                            deactivate: function () {
                                Ext.getCmp('btn-product-edit').hide();
                            }
                        }
                    },

                    listeners: {
                        activate: function () {
                            store.load();
                        },
                        deactivate: function (panel) {
                            store.clearFilter();
                        },
                        itemtap: function (nested, list, index, element, post) {
                            this.getDetailCard().setHtml(post.get('English_Name'));
                            Ext.getCmp('btn-product-edit').show();
                        }
                    }
                },
                {
                    toolbar: {
                        items: [
                            {
                                text: 'Save',
                                handler: function () {
                                    Ext.getCmp('product-edit').getRecord().commit();
                                    Ext.getCmp('product-edit').getRecord().save();
                                    //store.sync();
                                }
                            }
                        ]
                    },
                    xtype: 'nestedlist',
                    title: 'Edit product',
                    iconCls: 'add',
                    listeners: {
                        deactivate: function () {
                            var record = Ext.getCmp('product-edit').getRecord();
                            if (record) record.reject();
                        }
                    },
                    items: [
                        {
                            id: 'product-edit',
                            xtype: 'formpanel',
                            items: [
                                {
                                    xtype: 'fieldset',
                                    title: 'New product',
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            name: 'Product_Name',
                                            label: 'Name',
                                            listeners: {
                                                change: fieldUpdater
                                            }
                                        },
                                        {
                                            xtype: 'textfield',
                                            name: 'English_Name',
                                            label: 'Description',
                                            listeners: {
                                                change: fieldUpdater
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
        ]
    }
});

Ext.application({
    name: 'Sencha',

    launch: function () {
        Ext.create('MyApp.view.Welcome');
    }
});
