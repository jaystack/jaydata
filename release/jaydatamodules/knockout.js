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
(function ($data) {

    /*converters*/
    Object.keys($data.Container.converters.to).forEach(function (typeName) {
        var origConverter = $data.Container.converters.to[typeName] ? $data.Container.converters.to[typeName]['$data.Function'] || $data.Container.converters.to[typeName]['default'] : undefined;
        $data.Container.registerConverter(typeName, '$data.Function', function (value) {
            if (ko.isObservable(value)) {
                return value;
            } else if (origConverter) {
                return origConverter.apply($data.Container.converters[typeName], arguments);
            } else {
                Guard.raise(new Exception('Type Error', 'value is not koObservable', value));
            }
        });
    });

    function ObservableFactory(originalType, observableClassNem) {
        var instanceDefinition = {
            constructor: function () {
                var _this = this;

                _this.getEntity().propertyChanged.attach(function (sender, val) {
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
                    koProperty = new ko.observable(_this.getEntity()[propertyName]);

                    koProperty.subscribe(function (val) {
                        _this.getEntity()[propertyName] = val;
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
            instanceDefinition["ValidationErrors"] = {
                type: ko.observable
            };
        }

        $data.Class.defineEx(
            observableClassNem,
            [{ type: $data.KoObservableEntity, params: [new ConstructorParameter(0), function () { return originalType }] }],
            null,
            instanceDefinition,
            {
                isWrappedType: function (type) { return type === originalType; }
            });
    };

    if (typeof ko !== 'undefined') {
		// custom bindings
		var ieVersion = (function() {
			var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

			// Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
			while (
				div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
				iElems[0]
			){};
			return version > 4 ? version : undefined;
		}());

		ko.utils.ensureSelectElementIsRenderedCorrectly = function(selectElement) {
            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
            if (ieVersion >= 9) {
                var originalWidth = selectElement.style.width;
                selectElement.style.width = 0;
                selectElement.style.width = originalWidth;
            }
        };

		ko.utils.setOptionNodeSelectionState = function (optionNode, isSelected) {
            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
            if (navigator.userAgent.indexOf("MSIE 6") >= 0)
                optionNode.setAttribute("selected", isSelected);
            else
                optionNode.selected = isSelected;
        };

		ko.utils.setTextContent = function(element, textContent) {
            var value = ko.utils.unwrapObservable(textContent);
            if ((value === null) || (value === undefined))
                value = "";

            'innerText' in element ? element.innerText = value
                                   : element.textContent = value;

            if (ieVersion >= 9) {
                // Believe it or not, this actually fixes an IE9 rendering bug
                // (See https://github.com/SteveSanderson/knockout/issues/209)
                element.style.display = element.style.display;
            }
        };

		function ensureDropdownSelectionIsConsistentWithModelValue(element, modelValue, preferModelValue) {
			if (preferModelValue) {
				if (modelValue !== ko.selectExtensions.readValue(element))
					ko.selectExtensions.writeValue(element, modelValue);
			}

			// No matter which direction we're syncing in, we want the end result to be equality between dropdown value and model value.
			// If they aren't equal, either we prefer the dropdown value, or the model value couldn't be represented, so either way,
			// change the model value to match the dropdown.
			if (modelValue !== ko.selectExtensions.readValue(element))
				ko.utils.triggerEvent(element, "change");
		};

		ko.bindingHandlers['options'] = {
			'update': function (element, valueAccessor, allBindingsAccessor) {
				if (element.tagName.toLowerCase() !== "select")
					throw new Error("options binding applies only to SELECT elements");

				var selectWasPreviouslyEmpty = element.length == 0;
				var previousSelectedValues = ko.utils.arrayMap(ko.utils.arrayFilter(element.childNodes, function (node) {
					return node.tagName && (node.tagName.toLowerCase() === "option") && node.selected;
				}), function (node) {
					return ko.selectExtensions.readValue(node) || node.innerText || node.textContent;
				});
				var previousScrollTop = element.scrollTop;

				var value = ko.utils.unwrapObservable(valueAccessor());
				var selectedValue = element.value;

				// Remove all existing <option>s.
				// Need to use .remove() rather than .removeChild() for <option>s otherwise IE behaves oddly (https://github.com/SteveSanderson/knockout/issues/134)
				while (element.length > 0) {
					ko.cleanNode(element.options[0]);
					element.remove(0);
				}

				if (value) {
					var allBindings = allBindingsAccessor();
					if (typeof value.length != "number")
						value = [value];
					if (allBindings['optionsCaption']) {
						var option = document.createElement("option");
						ko.utils.setHtml(option, allBindings['optionsCaption']);
						ko.selectExtensions.writeValue(option, allBindings['optionsCaptionValue'] || undefined);
						element.appendChild(option);
					}
					for (var i = 0, j = value.length; i < j; i++) {
						var option = document.createElement("option");

						// Apply a value to the option element
						var optionValue = typeof allBindings['optionsValue'] == "string" ? value[i][allBindings['optionsValue']] : value[i];
						optionValue = ko.utils.unwrapObservable(optionValue);
						ko.selectExtensions.writeValue(option, optionValue);

						// Apply some text to the option element
						var optionsTextValue = allBindings['optionsText'];
						var optionText;
						if (typeof optionsTextValue == "function")
							optionText = optionsTextValue(value[i]); // Given a function; run it against the data value
						else if (typeof optionsTextValue == "string")
							optionText = value[i][optionsTextValue]; // Given a string; treat it as a property name on the data value
						else
							optionText = optionValue;				 // Given no optionsText arg; use the data value itself
						if ((optionText === null) || (optionText === undefined))
							optionText = "";

						ko.utils.setTextContent(option, optionText);

						element.appendChild(option);
					}

					// IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
					// That's why we first added them without selection. Now it's time to set the selection.
					var newOptions = element.getElementsByTagName("option");
					var countSelectionsRetained = 0;
					for (var i = 0, j = newOptions.length; i < j; i++) {
						if (ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[i])) >= 0) {
							ko.utils.setOptionNodeSelectionState(newOptions[i], true);
							countSelectionsRetained++;
						}
					}

					element.scrollTop = previousScrollTop;

					if (selectWasPreviouslyEmpty && ('value' in allBindings)) {
						// Ensure consistency between model value and selected option.
						// If the dropdown is being populated for the first time here (or was otherwise previously empty),
						// the dropdown selection state is meaningless, so we preserve the model value.
						ensureDropdownSelectionIsConsistentWithModelValue(element, ko.utils.unwrapObservable(allBindings['value']), /* preferModelValue */ true);
					}

					// Workaround for IE9 bug
					ko.utils.ensureSelectElementIsRenderedCorrectly(element);
				}
			}
		};
		ko.bindingHandlers['options'].optionValueDomDataKey = '__ko.optionValueDomData__';

        /* Observable Query*/
        function checkObservableValue(expression, context) {
            if (expression instanceof $data.Expressions.ConstantExpression && ko.isObservable(expression.value)) {
                context.some(function (item) {
                    if (item.observable === expression.value) {
                        item.skipExecute = true;
                    }
                });
                context.push({
                    observable: expression.value,
                    skipExecute: false
                });
                var observableValue = expression.value();
                return Container.createConstantExpression(observableValue, Container.getTypeName(observableValue), expression.name + '$Observable');
            }
            return expression;
        }

        //$data.Expressions.ParameterResolverVisitor.prototype.resolvedObservables = [];
        var prVisitor = $data.Expressions.ParameterResolverVisitor.prototype.VisitProperty;
        $data.Expressions.ParameterResolverVisitor.prototype.VisitProperty = function (eNode, context) {
            var expression = prVisitor.call(this, eNode, context);
            this.resolvedObservables = this.resolvedObservables || [];
            return checkObservableValue(expression, this.resolvedObservables);
        }

        var qecVisitConstantExpression = $data.Expressions.QueryExpressionCreator.prototype.VisitConstantExpression;
        $data.Expressions.QueryExpressionCreator.prototype.VisitConstantExpression = function (expression, context) {
            if (qecVisitConstantExpression)
                expression = qecVisitConstantExpression.call(this, expression, context);

            return checkObservableValue(expression, this.resolvedObservables);
        }

        //$data.Expressions.QueryExpressionCreator.prototype.resolvedObservables = [];
        var qecVisitCodeExpression = $data.Expressions.QueryExpressionCreator.prototype.VisitCodeExpression;
        $data.Expressions.QueryExpressionCreator.prototype.VisitCodeExpression = function (expression, context) {
            ///<summary>Converts the CodeExpression into an EntityExpression</summary>
            ///<param name="expression" type="$data.Expressions.CodeExpression" />
            var source = expression.source.toString();
            var jsCodeTree = Container.createCodeParser(this.scopeContext).createExpression(source);
            this.scopeContext.log({ event: "JSCodeExpression", data: jsCodeTree });

            //TODO rename classes to reflex variable names
            //TODO engage localValueResolver here
            //var globalVariableResolver = Container.createGlobalContextProcessor(window);
            var constantResolver = Container.createConstantValueResolver(expression.parameters, window, this.scopeContext);
            var parameterProcessor = Container.createParameterResolverVisitor();

            jsCodeTree = parameterProcessor.Visit(jsCodeTree, constantResolver);

            //added
            this.resolvedObservables = (this.resolvedObservables || []).concat(parameterProcessor.resolvedObservables);

            this.scopeContext.log({ event: "JSCodeExpressionResolved", data: jsCodeTree });
            var code2entity = Container.createCodeToEntityConverter(this.scopeContext);

            ///user provided query parameter object (specified as thisArg earlier) is passed in
            var entityExpression = code2entity.Visit(jsCodeTree, { queryParameters: expression.parameters, lambdaParameters: this.lambdaTypes, frameType: context.frameType });

            ///parameters are referenced, ordered and named, also collected in a flat list of name value pairs
            var result = Container.createParametricQueryExpression(entityExpression, code2entity.parameters);
            this.scopeContext.log({ event: "EntityExpression", data: entityExpression });

            return result;
        }

        var qecVisit = $data.Expressions.QueryExpressionCreator.prototype.Visit;
        $data.Expressions.QueryExpressionCreator.prototype.Visit = function (expression, context) {

            var expressionRes;
            if (expression instanceof $data.Expressions.FrameOperator) {
                this.resolvedObservables = [];
                var expressionRes = qecVisit.call(this, expression, context);

                expressionRes.observables = this.resolvedObservables;
                expressionRes.baseExpression = expression;

            } else {
                expressionRes = qecVisit.call(this, expression, context);
            }
            return expressionRes;
        };

        var esExecuteQuery = $data.EntityContext.prototype.executeQuery;
        $data.EntityContext.prototype.executeQuery = function (expression, on_ready, transaction) {
            var self = this;
            var observables = expression.expression.observables;
            if (observables && observables.length > 0) {
                observables.forEach(function (obsObj) {
                    if (!obsObj)
                        return;

                    obsObj.observable.subscribe(function () {
                        if (!obsObj.skipExecute) {
                            var preparator = Container.createQueryExpressionCreator(self);
                            var newExpression = preparator.Visit(expression.expression.baseExpression);

                            esExecuteQuery.call(self, Container.createQueryable(expression, newExpression), on_ready, transaction);
                        }
                    });
                });
            }

            esExecuteQuery.call(self, expression, on_ready, transaction);
        };

        /* Observable Query End*/

        /* Observable entities */
        $data.EntityWrapper.extend('$data.KoObservableEntity', {
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

                this._wrappedType = wrappedType;
                this.innerInstance = innerInstance;
            },
            getEntity: function () {
                return this.innerInstance;
            },
            updateEntity: function (entity) {
                var data;
                if (entity instanceof this._wrappedType)
                    data = entity;
                else if (entity && !(entity instanceof $data.Entity) && entity instanceof $data.Object)
                    data = entity;
                else
                    Guard.raise('entity is an invalid object');

                var members = this._wrappedType.memberDefinitions.getPublicMappedProperties();
                for (var i = 0; i < members.length; i++) {
                    var memDef = members[i];
                    if (data[memDef.name] !== undefined) {
                        this[memDef.name](data[memDef.name]);
                        var idx = this.innerInstance.changedProperties.indexOf(memDef);
                        if (idx >= 0)
                            this.innerInstance.changedProperties.splice(idx, 1);
                    }
                }

            },
            
            getProperties: function() {
                //todo cache!
                var self = this;
                var props = this.innerInstance.getType().memberDefinitions.getPublicMappedProperties();
                //todo remove map
                var koData = props.map( function(memberInfo) {
                    return {
                        type: memberInfo.type,
                        name: memberInfo.name,
                        owner: self,
                        metadata: memberInfo,
                        value: self[memberInfo.name]
                    }
                });
                return koData;
            }
        });

        $data.Entity.prototype.asKoObservable = function () {
            var type = this.getType();
            var observableTypeName = type.namespace + '.Observable' + type.name;
            if (!Container.isTypeRegistered(observableTypeName)) {
                ObservableFactory(type, observableTypeName);
            }
            var observableType = Container.resolveType(observableTypeName);

            if (!observableType.isWrappedType(type)) {
                ObservableFactory(type, observableTypeName);
                observableType = Container.resolveType(observableTypeName);
            }

            return new observableType(this);
        };

        var queryableToArray = $data.Queryable.prototype.toArray;
        $data.Queryable.prototype.toArray = function (onResult_items, transaction) {
            if (ko.isObservable(onResult_items)) {
                if (typeof onResult_items.push !== 'undefined') {
                    var callBack = $data.typeSystem.createCallbackSetting();

                    return this.toArray(function (results, tran) {
                        onResult_items([]);
                        results.forEach(function (result, idx) {
                            if (result instanceof $data.Entity) {
                                onResult_items.push(result.asKoObservable());
                            } else {
                                callBack.error('Not Implemented: Observable result has anonymous objects');
                            }
                        });
                    }, transaction);
                } else {
                    return queryableToArray.call(this, function (result, tran) { onResult_items(result); }, transaction);
                }
            } else {
                return queryableToArray.call(this, onResult_items, transaction);
            }
        }
        /* Observable entities End*/


    } else {
        function requiredError() {
            Guard.raise(new Exception('Knockput js is required', 'Not Found!'));
        }

        $data.Entity.prototype.asKoObservable = requiredError
    }

})($data);
