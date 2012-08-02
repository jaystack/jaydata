entityFields = {
    type: { type: [$data.String, $data.Function, $data.Array], input: 'text', description: '' },
    elementType: { type: [$data.String, $data.Function], input: 'text', description: '' },
    inverseProperty: { type: $data.String, input: 'text', description: '' },
    key: { type: $data.Boolean, input: 'checkbox', description: '' },
    computed: { type: $data.Boolean, input: 'checkbox', description: '' },
    nullable: { type: $data.Boolean, input: 'checkbox', description: '' },
    required: { type: $data.Boolean, input: 'checkbox', description: '' },
    customValidator: { type: $data.Function, input: 'textarea', description: '' },
    minValue: { type: [$data.Integer, $data.Number, $data.Date], value: [$data.Integer, $data.Number, $data.Date], input: { '$data.Integer': 'number', '$data.Number': 'number', '$data.Date': 'datepicker' }, description: '' },
    maxValue: { type: [$data.Integer, $data.Number, $data.Date], value: [$data.Integer, $data.Number, $data.Date], input: { '$data.Integer': 'number', '$data.Number': 'number', '$data.Date': 'datepicker' }, description: '' },
    minLength: { type: $data.Integer, value: [$data.String, $data.Array], input: 'number', description: '' },
    maxLength: { type: $data.Integer, value: [$data.String, $data.Array], input: 'number', description: '' },
    length: { type: $data.Integer, value: [$data.String, $data.Array], input: 'number', description: '' },
    regex: { type: $data.String, value: $data.String, input: 'string', description: '' }
};

function ContextModel(context){
    var self = this;
    
    self.context = ko.observable(context);
    self.edit = ko.observable(false);
    
    self.addEntityEnabled = ko.observable(false);
    self.addEntityTypeName = ko.observable('');
    
    self.entitySetCollection = ko.observableArray(self.context() ? self.context().memberDefinitions.getPublicMappedProperties() : []);
    self.entityCollection = ko.observableArray(self.context() ? self.entitySetCollection().map(function(it){ return it.elementType; }) : []);
    
    self.selectedEntitySet = ko.observable(self.entitySetCollection()[0]);
    self.selectedEntity = ko.observable(self.entityCollection()[0]);
    
    self.entityField = function(field){
        return field.name +
            ' [' + Container.resolveName(Container.resolveType(field.type)) + ']' +
            (field.type === $data.Array ? ' [' + Container.resolveName(Container.resolveType(field.elementType)) + ']' : '');
    };
    
    self.selectEntitySet = function(entitySet){
        self.selectedEntitySet(entitySet);
        if (entitySet.elementType) self.selectEntity(entitySet.elementType);
    };
    
    self.selectEntity = function(entity){
        self.selectedEntity(entity);
    };
    
    self.addEntityValidator = function(data, event){
        self.addEntityTypeName(event.srcElement.value);
        self.addEntityEnabled(self.addEntityTypeName() !== '');
    };
    
    self.addEntity = function(){
        
    };
    
    self.editEntity = function(entity){
        
    };
    
    self.insertAsEntitySet = function(entity){
        alert(entity.name);
    };
    
    self.removeEntitySet = function(entitySet){
        
    };
    
    self.removeEntity = function(entity){
        
    };
}

window.addEventListener('load', function(){
    ko.applyBindings(new ContextModel(Northwind.NorthwindContainer));
}, false);
