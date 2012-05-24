(function ($data) {

    function ObservableFactory(originalType, observableClassNem) {
        var instanceDefinition = {
            constructor: function () {
                var _this = this;

                _this.innerInstance.propertyChanged.attach(function (sender, val) {
                    if (_this[val.propertyName]() !== val.newValue) {
                        _this[val.propertyName](val.newValue);
                    }
                });
            },

            retrieveProperty: function (memberDefinition) {
                var _this = this;
                var propertyName = memberDefinition.name
                var backingFieldName = "_" + propertyName;

                if (!_this[backingFieldName]) {
                    koProperty = new ko.observable(_this.innerInstance[propertyName]);

                    koProperty.subscribe(function (val) {
                        _this.innerInstance[propertyName] = val;
                    });

                    _this[backingFieldName] = koProperty;
                }

                return _this[backingFieldName];
            },
            storeProperty: function (memberDefinition, value) {
            },
            equalityComparers: { type: $data.Object }
        };

        var properties = originalType.memberDefinitions.getPublicMappedProperties();
        for (var i = 0, l = properties.length; i < l; i++) {
            propName = properties[i].name;
            instanceDefinition[propName] = {
                type: ko.observable
            };
        }

        $data.Class.defineEx(
            observableClassNem,
            [{ type: $data.KoObservableEntity, params: [new ConstructorParameter(0), function () { return originalType }] }],
            null,
            instanceDefinition,
            null);
    };

    if (typeof ko !== 'undefined') {
        $data.ObjectWrapper.extend('$data.KoObservableEntity', {
            constructor: function (innerData, wrappedType) {
                if (!(wrappedType && wrappedType.isAssignableTo && wrappedType.isAssignableTo($data.Entity))) {
                    Guard.raise(new Exception("Type: '" + wrappedType + "' is not assignable to $data.Entity"));
                }

                var innerInstance;
                if (innerData instanceof wrappedType) {
                    innerInstance = innerData;
                } else if (innerData instanceof $data.Entity) {
                    Guard.raise(new Exception("innerData is instance of '$data.Entity' instead of '" + wrappedType.fullName + "'"));
                } else {
                    innerInstance = new wrappedType(innerData);
                }

                Object.defineProperty(this, 'innerInstance', { enumerable: false, configurable: true, writable: true, value: innerInstance });
            },
            getInstance: function () {
                return this.innerInstance;
            }
        });

        $data.Entity.prototype.asKoObservable = function () {
            var type = this.getType();
            var observableTypeName = type.namespace + '.Observable' + type.name;
            if (!Container.isTypeRegistered(observableTypeName)) {
                ObservableFactory(type, observableTypeName);
            }
            var observableType = Container.resolveType(observableTypeName);

            return new observableType(this);
        };

        var queryableToArray = $data.Queryable.prototype.toArray;
        $data.Queryable.prototype.toArray = function (onResult_items) {
            if (ko.isObservable(onResult_items)) {
                if (typeof onResult_items.push !== 'undefined') {
                    var callBack = $data.typeSystem.createCallbackSetting();

                    return this.forEach(function (result, idx) {
                        if (idx === 0)
                            onResult_items([]);

                        if (result instanceof $data.Entity) {
                            onResult_items.push(result.asKoObservable());
                        } else {
                            callBack.error('Not Implemented: Observable result has anonymous objects');
                        }
                    });
                } else {
                    return queryableToArray.call(this, function (result) { onResult_items(result); });
                }
            } else {
                return queryableToArray.call(this, onResult_items);
            }
        }


    } else {
        function requiredError() {
            Guard.raise(new Exception('Knockput js is required', 'Not Found!'));
        }

        $data.Entity.prototype.asKoObservable = requiredError
    }

})($data);