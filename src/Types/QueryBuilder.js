$C('$data.queryBuilder', null, null, {
    constructor: function () {
        this._fragments = {};
        this.selectedFragment = null;
        this._binderConfig = {};
        this.modelBinderConfig = this._binderConfig;
        this._binderConfigPropertyStack = [];
    },
    selectTextPart: function (name) {
        if (!this._fragments[name]) {
            this._fragments[name] = { text: '', params: [] };
        }
        this.selectedFragment = this._fragments[name];
    },
    getTextPart: function (name) {
        return this._fragments[name];
    },
    addText: function (textParticle) {
        this.selectedFragment.text += textParticle;
    },
    addParameter: function (param) {
        this.selectedFragment.params.push(param);
    },
    selectModelBinderProperty: function (name) {
        this._binderConfigPropertyStack.push(this.modelBinderConfig);
        if (!(name in this.modelBinderConfig)) {
            this.modelBinderConfig[name] = {};
        }
        this.modelBinderConfig = this.modelBinderConfig[name];
    },
    popModelBinderProperty: function () {
        if (this._binderConfigPropertyStack.length === 0) {
            this.modelBinderConfig = this._binderConfig();
        } else {
            this.modelBinderConfig = this._binderConfigPropertyStack.pop();
        }
    },
    resetModelBinderProperty: function (name) {
        this._binderConfigPropertyStack = [];
        this.modelBinderConfig = this._binderConfig;
    },
    addKeyField: function (name) {
        if(!this.modelBinderConfig['$keys']){
            this.modelBinderConfig['$keys'] = new Array();
        }
        this.modelBinderConfig['$keys'].push(name);
    }
});
