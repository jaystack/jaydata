// JayData 1.3.6
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
//
// More info: http://jaydata.org
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

            if (operation.getAction() == 'read')
                return me.doRead(request, operation, callback, scope);

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
                operation: operation,
                proxy: me
            });

            operation.setRequest(request);

            return request;
        },

        doRead: function (request, operation, callback, scope) {
            var me = this;
            var queryable = me.buildQueryable(operation, me.getQueryable());

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
        }

    });

})($data, Ext);
