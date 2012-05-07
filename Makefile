SRC_DIR = ./Types
TEMP_DIR = ./TMP
COMPILER = ./Tools/compiler.jar

TYPE_SYSTEM = ./TypeSystem/JayLint.js\
	./TypeSystem/initializeJayData.js\
	./TypeSystem/utils.js\
	./TypeSystem/PreHtml5Compatible.js\
	./TypeSystem/TypeSystem.js\

EXPRESSIONS = ${SRC_DIR}/Expressions/ASTParser.js\
	$(SRC_DIR)/Expressions/ExpressionNode2.js\
	$(SRC_DIR)/Expressions/ArrayLiteralExpression.js\
	$(SRC_DIR)/Expressions/CallExpression.js\
	$(SRC_DIR)/Expressions/CodeParser.js\
	$(SRC_DIR)/Expressions/ConstantExpression.js\
	$(SRC_DIR)/Expressions/FunctionExpression.js\
	$(SRC_DIR)/Expressions/ObjectFieldExpression.js\
	$(SRC_DIR)/Expressions/ObjectLiteralExpression.js\
	$(SRC_DIR)/Expressions/PagingExpression.js\
	$(SRC_DIR)/Expressions/ParameterExpression.js\
	$(SRC_DIR)/Expressions/PropertyExpression.js\
	$(SRC_DIR)/Expressions/SimpleBinaryExpression.js\
	$(SRC_DIR)/Expressions/ThisExpression.js\
	$(SRC_DIR)/Expressions/Visitors/ExpressionVisitor.js\
	$(SRC_DIR)/Expressions/Visitors/ParameterProcessor.js\
	$(SRC_DIR)/Expressions/Visitors/GlobalContextProcessor.js\
	$(SRC_DIR)/Expressions/Visitors/LocalContextProcessor.js\
	$(SRC_DIR)/Expressions/Visitors/LambdaParameterProcessor.js\
	$(SRC_DIR)/Expressions/Visitors/ParameterResolverVisitor.js\
	$(SRC_DIR)/Expressions/Visitors/LogicalSchemaBinderVisitor.js\
	$(SRC_DIR)/Expressions/Visitors/ExpTreeVisitor.js\
	$(SRC_DIR)/Expressions/Visitors/SetExecutableVisitor.js\
	$(SRC_DIR)/Expressions/Visitors/ExecutorVisitor.js\
	$(SRC_DIR)/Expressions/ExpressionBuilder.js\
	$(SRC_DIR)/Expressions/EntityExpressions/AssociationInfoExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/CodeExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/CodeToEntityConverter.js\
	$(SRC_DIR)/Expressions/EntityExpressions/ComplexTypeExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/EntityContextExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/EntityExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/EntityExpressionVisitor.js\
	$(SRC_DIR)/Expressions/EntityExpressions/EntityFieldExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/EntityFieldOperationExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/EntitySetExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/FilterExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/IncludeExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/MemberInfoExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/OrderExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/ParametricQueryExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/ProjectionExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/QueryExpressionCreator.js\
	$(SRC_DIR)/Expressions/EntityExpressions/QueryParameterExpression.js\
	$(SRC_DIR)/Expressions/EntityExpressions/RepresentationExpression.js\

PLUGINS = $(SRC_DIR)/Validation/EntityValidationBase.js\
	$(SRC_DIR)/Validation/EntityValidation.js\
	$(SRC_DIR)/Notifications/ChangeDistributorBase.js\
	$(SRC_DIR)/Notifications/ChangeCollectorBase.js\
	$(SRC_DIR)/Notifications/ChangeDistributor.js\
	$(SRC_DIR)/Notifications/ChangeCollector.js\
	$(SRC_DIR)/Promise.js\
	$(SRC_DIR)/Entity.js\
	$(SRC_DIR)/EntityContext.js\
	$(SRC_DIR)/QueryProvider.js\
	$(SRC_DIR)/RowConverter.js\
	$(SRC_DIR)/Query.js\
	$(SRC_DIR)/Queryable.js\
	$(SRC_DIR)/EntitySet.js\
	$(SRC_DIR)/AuthEntityContext.js\
	$(SRC_DIR)/EntityState.js\
	$(SRC_DIR)/EntityStateManager.js\
	$(SRC_DIR)/Exception.js\
	$(SRC_DIR)/StorageProviderBase.js\

PROVIDERS = $(SRC_DIR)/DbClient/DbCommand.js\
	$(SRC_DIR)/DbClient/DbConnection.js\
	$(SRC_DIR)/DbClient/OpenDatabaseClient/OpenDbCommand.js\
	$(SRC_DIR)/DbClient/OpenDatabaseClient/OpenDbConnection.js\
	$(SRC_DIR)/DbClient/JayStorageClient/JayStorageCommand.js\
	$(SRC_DIR)/DbClient/JayStorageClient/JayStorageConnection.js\
	$(SRC_DIR)/DbClient/SqLiteNjClient/SqLiteNjCommand.js\
	$(SRC_DIR)/DbClient/SqLiteNjClient/SqLiteNjConnection.js\
	$(SRC_DIR)/StorageProviders/SqLite/SqLiteStorageProvider.js\
	$(SRC_DIR)/StorageProviders/SqLite/SqLiteCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/SqlPagingCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/SqlOrderCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/SqlProjectionCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/ExpressionMonitor.js\
	$(SRC_DIR)/StorageProviders/SqLite/SqlFilterCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/ModelBinder/sqLiteEFModelBinderCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/ModelBinder/sqLiteModelBinderCompiler.js\
	$(SRC_DIR)/StorageProviders/SqLite/ModelBinder/sqLiteOLModelBinderCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/oDataProvider.js\
	$(SRC_DIR)/StorageProviders/oData/oDataCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/oDataWhereCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/oDataOrderCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/oDataPagingCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/oDataProjectionCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/ModelBinder/oDataModelBinderCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/ModelBinder/oDataEFModelBinderCompiler.js\
	$(SRC_DIR)/StorageProviders/oData/ModelBinder/oDataOLModelBinderCompiler.js\
	$(SRC_DIR)/StorageProviders/IndexedDB/IndexedDBStorageProvider.js\
	$(SRC_DIR)/Authentication/AuthenticationBase.js\
	$(SRC_DIR)/Authentication/Anonymous.js\
	$(SRC_DIR)/Authentication/FacebookAuth.js\
	$(SRC_DIR)/StorageProviders/Facebook/FacebookProvider.js\
	$(SRC_DIR)/StorageProviders/Facebook/FacebookCompiler.js\
	$(SRC_DIR)/StorageProviders/Facebook/EntitySets/FQL/user.js\
	$(SRC_DIR)/StorageProviders/Facebook/EntitySets/FQL/friend.js\
	$(SRC_DIR)/StorageProviders/Facebook/EntitySets/FQL/page.js\
	$(SRC_DIR)/StorageProviders/Facebook/EntitySets/FQLContext.js\
	$(SRC_DIR)/StorageProviders/YQL/YQLProvider.js\
	$(SRC_DIR)/StorageProviders/YQL/YQLCompiler.js\
	$(SRC_DIR)/StorageProviders/YQL/EntitySets/geo.js\
	$(SRC_DIR)/StorageProviders/YQL/EntitySets/YQLContext.js\
	./Modules/deferred.js\
	./Modules/formBinder.js\
	./Modules/template.js\
	./Modules/validate.js\

JayDataMin: JayData ./JayData.js
	@@echo "Build Jaydata standalone min..."
	@@java -jar $(COMPILER) --js ./JayData.js --js_output_file ./JayData.min.js

JayData: JayDataStandalone ./JayData_standalone.js ./Scripts/datajs-1.0.2.js
	@@cat ./Scripts/datajs-1.0.2.js ./JayData_standalone.js > JayData.js

JayDataStandaloneMin: JayDataStandalone ./JayData_standalone.js
	@@echo "Build Jaydata standalone min..."
	@@java -jar $(COMPILER) --js ./JayData_standalone.js --js_output_file ./JayData_standalone.min.js

JayDataStandalone: $(TEMP_DIR)/JayDataRaw.js
	@@cat $(TEMP_DIR)/JayDataRaw.js > JayData_standalone.js

$(TEMP_DIR)/JayDataRaw.js : $(TEMP_DIR)/Plugins.js $(PROVIDERS)
	@@cat $(TEMP_DIR)/Plugins.js $(PROVIDERS) > $(TEMP_DIR)/JayDataRaw.js

$(TEMP_DIR)/Plugins.js : $(TEMP_DIR)/Expressions.js $(PLUGINS)
	@@cat $(TEMP_DIR)/Expressions.js $(PLUGINS) > $(TEMP_DIR)/Plugins.js

$(TEMP_DIR)/Expressions.js : $(TEMP_DIR)/TypeSystems.js $(EXPRESSIONS)
	@@cat $(TEMP_DIR)/TypeSystems.js $(EXPRESSIONS) > $(TEMP_DIR)/Expressions.js

$(TEMP_DIR)/TypeSystems.js : $(TYPE_SYSTEM)
	@@echo ${SRC_DIR}
	@@cat $(TYPE_SYSTEM) > $(TEMP_DIR)/TypeSystems.js

.PHONY: JayDataMin JayData JayDataStandaloneMin JayDataStandalone

