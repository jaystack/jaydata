/*Netflix.context.prepareRequest = function(cfg){
    cfg.url += '&$format=json&$callback=callback';
    cfg.dataType = 'jsonp';
    cfg.jsonpCallback = "callback";
};*/

var itemTpl = new Ext.XTemplate(
    '<tpl if="BoxArt.SmallUrl">',
    '<img src="{BoxArt.SmallUrl}"/>',
    '</tpl>',
    '<h2>{ShortName}</h2>',
    '<tpl if="ShortSynopsis">',
    '<p>{ShortSynopsis}</p>',
    '</tpl>'
);

var detailsTpl = new Ext.XTemplate(
    '<h1>{ShortName}</h1>',
    '<tpl if="BoxArt.HighDefinitionUrl">',
    '<img src="{BoxArt.HighDefinitionUrl}"/>',
    '<tpl elseif="BoxArt.LargeUrl">',
    '<img src="{BoxArt.LargeUrl}"/>',
    '<tpl elseif="BoxArt.MediumUrl">',
    '<img src="{BoxArt.MediumUrl}"/>',
    '<tpl elseif="BoxArt.SmallUrl">',
    '<img src="{BoxArt.SmallUrl}"/>',
    '</tpl>',
    '<h3>{Name} <span>({ReleaseYear})</span> <span>{AverageRating}</span></h3>',
    '<ul>',
    '<tpl for="Genres">',
    '<li>{Name}</li>',
    '</tpl>',
    '</ul>',
    '<p>{Synopsis}</p>',
    '<table>',
    '<tr>',
    '<td>Runtime</td>',
    '<td>',
    '<tpl if="Runtime">',
    '{[Math.floor(values.Runtime / 60) || "-"]}mins',
    '<tpl else>',
    '-',
    '</tpl>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td>Rating</td>',
    '<td>',
    '<tpl if="Rating">',
    '{Rating}',
    '<tpl else>',
    '-',
    '</tpl>',
    '</td>',
    '</tr>',
    '<tr>',
    '<td>Type</td>',
    '<td>',
    '<tpl if="Type">',
    '{Type}',
    '<tpl else>',
    '-',
    '</tpl>',
    '</td>',
    '</tr>',
    '</table>',
    '<tpl if="BluRay && BluRay.Available">',
    '<fieldset>',
    '<legend>BluRay</legend>',
    '<table>',
    '<tr><td>Available from</td><td>{BluRay.AvailableFrom:date("l, F d, Y")}</td></tr>',
    '<tr><td>Available to</td><td>{BluRay.AvailableTo:date("l, F d, Y")}</td></tr>',
    '<tr><td>Rating</td><td>{BluRay.Rating}</td></tr>',
    '<tr><td>Runtime</td><td>{[Math.floor(values.BluRay.Runtime / 60) || "-"]}mins</td></tr>',
    '</table>',
    '</fieldset>',
    '</tpl>',
    '<tpl if="Dvd && Dvd.Available">',
    '<fieldset>',
    '<legend>DVD</legend>',
    '<table>',
    '<tr><td>Available from</td><td>{Dvd.AvailableFrom:date("l, F d, Y")}</td></tr>',
    '<tr><td>Available to</td><td>{Dvd.AvailableTo:date("l, F d, Y")}</td></tr>',
    '<tr><td>Rating</td><td>{Dvd.Rating}</td></tr>',
    '<tr><td>Runtime</td><td>{[Math.floor(values.Dvd.Runtime / 60) || "-"]}mins</td></tr>',
    '</table>',
    '</fieldset>',
    '</tpl>',
    '<h3>Languages</h3>',
    '<ul>',
    '<tpl for="Languages">',
    '<li>{Name}</li>',
    '</tpl>',
    '</ul>',
    '<h3>Awards</h3>',
    '<ul>',
    '<tpl for="Awards">',
    '<li>{Type} {Category} {Year} {[values.Won ? "Won" : ""]}</li>',
    '</tpl>',
    '</ul>',
    '<h3>Directors</h3>',
    '<ul>',
    '<tpl for="Directors">',
    '<li>{Name}</li>',
    '</tpl>',
    '</ul>',
    '<h3>Cast</h3>',
    '<ul>',
    '<tpl for="Cast">',
    '<li>{Name}</li>',
    '</tpl>',
    '</ul>'
);

Ext.define('Netflix.view.Movies', {
    extend: 'Ext.tab.Panel',
    id: 'viewport',

    config: {
        fullscreen: true,
        tabBarPosition: 'bottom',

        items: [{
            id: 'movies',
            xtype: 'list',
            title: 'Movies',
            iconCls: 'star',
            itemTpl: itemTpl,
            styleHtmlContent: true,
            grouped: true,
            indexBar: {
                letters: [],
                listeners: {
                    index: function(index, html, target, opts){
                        var store = Ext.getCmp('movies').getStore();
                        
                        store.clearFilter();
                        store.filterBy(function(it){
                            return it.ShortName.startsWith(html);
                        });
                        store.load();
                    }
                }
            },
            store: {
                fields: $data.Entity.buildExtFields(Netflix.Catalog.v2.Title),
                remoteFilter: true,
                remoteSort: true,
                pageSize: 5,
                sorters: [{
                    property: 'ReleaseYear',
                    direction: 'DESC'
                }, {
                    property: 'DateModified',
                    direction: 'DESC'
                }, {
                    property: 'ShortName',
                    direction: 'ASC'
                }],
                grouper: {
                    groupFn: function(record) {
                        return record.get('ReleaseYear');
                    }
                },
                proxy: {
                    type: 'JayData',
                    queryable: Netflix.context.Titles
                }
            },
            plugins: [{
                xclass: 'Ext.plugin.ListPaging',
                autoPaging: true
            }],
            listeners: {
                activate: function(panel){
                    var store = panel.getStore();
                    if (store.getCount() == 0){
                        panel.setMasked({
                            xtype: 'loadmask'
                        });
                        store.load();
                    }
                },
                itemtap: function(view, index, target, record, e, opts){
                    Netflix.context.Titles
                    .filter(function(it){ return it.Id == this.id; }, { id: record.get('Id') })
                    .include('AudioFormats')
                    .include('Awards')
                    .include('ScreenFormats')
                    .include('Languages')
                    .include('Cast')
                    .include('Directors')
                    .include('Genres')
                    .toArray(function(data){
                        var cmp = Ext.getCmp('details');
                        Ext.getCmp('details-toolbar').setTitle(data[0].ShortName);
                        cmp.setHtml(detailsTpl.apply(data[0]));
                        cmp.getParent().setActiveItem(cmp);
                    });
                }
            },
            items: [{
                xtype: 'toolbar',
                docked: 'top',
                items: [{
                    xtype: 'textfield',
                    placeHolder: 'Search...',
                    listeners: {
                        change: function(text){
                            var store = Ext.getCmp('movies').getStore();
                        
                            store.clearFilter();
                            store.filterBy(function(it){
                                return it.ShortName == '' || it.ShortName.contains(this.search);
                            }, { search: text.getValue() || '' });
                            Ext.getCmp('movies').setMasked({
                                xtype: 'loadmask'
                            });
                            store.loadPage(1);
                        },
                        clearicontap: function(text){
                            var store = Ext.getCmp('movies').getStore();
                        
                            store.clearFilter();
                            Ext.getCmp('movies').setMasked({
                                xtype: 'loadmask'
                            });
                            store.load();
                        }
                    }
                }]
            }]
        }, {
            id: 'details',
            xtype: 'panel',
            title: 'Details',
            iconCls: 'action',
            scrollable: 'vertical',
            styleHtmlContent: true,
            items: [{
                id: 'details-toolbar',
                xtype: 'toolbar',
                docked: 'top',
                title: ''
            }]
        }]
    }
});

Ext.application({
    name: 'Netflix',

    launch: function () {
        Ext.create('Netflix.view.Movies');
    }
});
