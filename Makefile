TEMP_DIR = ./TMP
TARGET_DIR = ./Build
MODULE_DIR = $(TARGET_DIR)/Module
COMPILER = ./Tools/compiler.jar

TYPE_SYSTEM = ./TypeSystem/initializeJayData.js\
	./TypeSystem/utils.js\
	./TypeSystem/PreHtml5Compatible.js\
	./TypeSystem/JayLint.js\
	./TypeSystem/TypeSystem.js\

INCLUDED_LIBRARY = ./Scripts/datajs-1.0.2.js\

VSDOC_SOURCE = ./TypeSystem/VS2010Intellisense.js\

JAYDATA_SOURCE = ./Types/Expressions/ASTParser.js\
	./Types/Expressions/ASTParser.js\
	./Types/Expressions/ExpressionNode2.js\
	./Types/Expressions/ArrayLiteralExpression.js\
	./Types/Expressions/CallExpression.js\
	./Types/Expressions/CodeParser.js\
	./Types/Expressions/ConstantExpression.js\
	./Types/Expressions/FunctionExpression.js\
	./Types/Expressions/ObjectFieldExpression.js\
	./Types/Expressions/ObjectLiteralExpression.js\
	./Types/Expressions/PagingExpression.js\
	./Types/Expressions/ParameterExpression.js\
	./Types/Expressions/PropertyExpression.js\
	./Types/Expressions/SimpleBinaryExpression.js\
	./Types/Expressions/ThisExpression.js\
	./Types/Expressions/Visitors/ExpressionVisitor.js\
	./Types/Expressions/Visitors/ParameterProcessor.js\
	./Types/Expressions/Visitors/GlobalContextProcessor.js\
	./Types/Expressions/Visitors/LocalContextProcessor.js\
	./Types/Expressions/Visitors/LambdaParameterProcessor.js\
	./Types/Expressions/Visitors/ParameterResolverVisitor.js\
	./Types/Expressions/Visitors/LogicalSchemaBinderVisitor.js\
	./Types/Expressions/Visitors/ExpTreeVisitor.js\
	./Types/Expressions/Visitors/SetExecutableVisitor.js\
	./Types/Expressions/Visitors/ExecutorVisitor.js\
	./Types/Expressions/ExpressionBuilder.js\
	./Types/Expressions/EntityExpressions/AssociationInfoExpression.js\
	./Types/Expressions/EntityExpressions/CodeExpression.js\
	./Types/Expressions/EntityExpressions/CodeToEntityConverter.js\
	./Types/Expressions/EntityExpressions/ComplexTypeExpression.js\
	./Types/Expressions/EntityExpressions/EntityContextExpression.js\
	./Types/Expressions/EntityExpressions/EntityExpression.js\
	./Types/Expressions/EntityExpressions/EntityExpressionVisitor.js\
	./Types/Expressions/EntityExpressions/EntityFieldExpression.js\
	./Types/Expressions/EntityExpressions/EntityFieldOperationExpression.js\
	./Types/Expressions/EntityExpressions/EntitySetExpression.js\
	./Types/Expressions/EntityExpressions/FrameOperationExpression.js\
	./Types/Expressions/EntityExpressions/FilterExpression.js\
	./Types/Expressions/EntityExpressions/IncludeExpression.js\
	./Types/Expressions/EntityExpressions/MemberInfoExpression.js\
	./Types/Expressions/EntityExpressions/OrderExpression.js\
	./Types/Expressions/EntityExpressions/ParametricQueryExpression.js\
	./Types/Expressions/EntityExpressions/ProjectionExpression.js\
	./Types/Expressions/EntityExpressions/QueryExpressionCreator.js\
	./Types/Expressions/EntityExpressions/QueryParameterExpression.js\
	./Types/Expressions/EntityExpressions/RepresentationExpression.js\
	./Types/Validation/EntityValidationBase.js\
	./Types/Validation/EntityValidation.js\
	./Types/Notifications/ChangeDistributorBase.js\
	./Types/Notifications/ChangeCollectorBase.js\
	./Types/Notifications/ChangeDistributor.js\
	./Types/Notifications/ChangeCollector.js\
	./Types/Promise.js\
	./Types/Entity.js\
	./Types/EntityContext.js\
	./Types/QueryProvider.js\
	./Types/ModelBinder.js\
	./Types/Query.js\
	./Types/Queryable.js\
	./Types/EntitySet.js\
	./Types/EntityState.js\
	./Types/EntityStateManager.js\
	./Types/Exception.js\
	./Types/StorageProviderBase.js\
	./Types/EntityWrapper.js\
	./Types/Ajax/jQueryAjaxWrapper.js\
	./Types/Ajax/WinJSAjaxWrapper.js\	
	./Types/Ajax/ExtJSAjaxWrapper.js\
	./Types/Ajax/AjaxStub.js\
	./Types/DbClient/DbCommand.js\
	./Types/DbClient/DbConnection.js\
	./Types/DbClient/OpenDatabaseClient/OpenDbCommand.js\
	./Types/DbClient/OpenDatabaseClient/OpenDbConnection.js\
	./Types/DbClient/JayStorageClient/JayStorageCommand.js\
	./Types/DbClient/JayStorageClient/JayStorageConnection.js\
	./Types/DbClient/SqLiteNjClient/SqLiteNjCommand.js\
	./Types/DbClient/SqLiteNjClient/SqLiteNjConnection.js\
	./Types/StorageProviders/SqLite/SqLiteStorageProvider.js\
	./Types/StorageProviders/SqLite/SqLiteCompiler.js\
	./Types/StorageProviders/SqLite/SqlPagingCompiler.js\
	./Types/StorageProviders/SqLite/SqlOrderCompiler.js\
	./Types/StorageProviders/SqLite/SqlProjectionCompiler.js\
	./Types/StorageProviders/SqLite/ExpressionMonitor.js\
	./Types/StorageProviders/SqLite/SqlFilterCompiler.js\
	./Types/StorageProviders/SqLite/ModelBinder/sqLite_ModelBinderCompiler.js\
	./Types/StorageProviders/oData/oDataProvider.js\
	./Types/StorageProviders/oData/oDataCompiler.js\
	./Types/StorageProviders/oData/oDataWhereCompiler.js\
	./Types/StorageProviders/oData/oDataOrderCompiler.js\
	./Types/StorageProviders/oData/oDataPagingCompiler.js\
	./Types/StorageProviders/oData/oDataProjectionCompiler.js\
	./Types/StorageProviders/modelBinderConfigCompiler.js\
	./Types/StorageProviders/IndexedDB/IndexedDBStorageProvider.js\
	./Types/Authentication/AuthenticationBase.js\
	./Types/Authentication/Anonymous.js\
	./Types/Authentication/FacebookAuth.js\
	./Types/StorageProviders/Facebook/FacebookProvider.js\
	./Types/StorageProviders/Facebook/FacebookCompiler.js\
	./Types/StorageProviders/Facebook/EntitySets/FQL/user.js\
	./Types/StorageProviders/Facebook/EntitySets/FQL/friend.js\
	./Types/StorageProviders/Facebook/EntitySets/FQL/page.js\
	./Types/StorageProviders/Facebook/EntitySets/FQLContext.js\
	./Types/StorageProviders/YQL/YQLProvider.js\
	./Types/StorageProviders/YQL/YQLCompiler.js\
	./Types/StorageProviders/YQL/EntitySets/geo.js\
	./Types/StorageProviders/YQL/EntitySets/YQLContext.js\

All:JayDataStandaloneMin JayDataStandalone JayDataVsDoc JayDataMin JayData
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR) && cp ./JayDataModules/* $(MODULE_DIR)
	@@rm -r $(TEMP_DIR)

JayDataStandaloneMin: JayDataStandalone $(TARGET_DIR)/JayData-standalone.js
	@@echo "Minifying Jaydata standalone..."
	@@java -jar $(COMPILER) --js $(TARGET_DIR)/JayData-standalone.js --js_output_file $(TEMP_DIR)/JayData-standalone.min.js
	@@cat CREDITS.txt $(TEMP_DIR)/JayData-standalone.min.js > $(TARGET_DIR)/JayData-standalone.min.js

JayDataStandalone: $(TEMP_DIR)/TypeSystems.js $(INCLUDED_LIBRARY)
	@@echo "Building JayData standalone version..."
	@@test -d $(TARGET_DIR) || mkdir -p $(TARGET_DIR)
	@@cat $(TEMP_DIR)/TypeSystems.js $(INCLUDED_LIBRARY) $(JAYDATA_SOURCE) > $(TEMP_DIR)/JayData-standalone.js
	@@cat CREDITS.txt $(TEMP_DIR)/JayData-standalone.js > $(TARGET_DIR)/JayData-standalone.js

JayDataVsDoc: JayData
	@@echo "Building JayData vsdoc version..."
	@@cat $(VSDOC_SOURCE) $(TEMP_DIR)/JayData.js > $(TEMP_DIR)/JayData-vsdoc.js
	@@cat CREDITS.txt $(TEMP_DIR)/JayData-vsdoc.js > $(TARGET_DIR)/JayData-vsdoc.js

JayDataMin: JayData
	@@echo "Minifying JayData library..."
	@@java -jar $(COMPILER) --js $(TARGET_DIR)/JayData.js --js_output_file $(TEMP_DIR)/JayData.min.js
	@@cat CREDITS.txt $(TEMP_DIR)/JayData.min.js > $(TARGET_DIR)/JayData.min.js

JayData: $(TEMP_DIR)/TypeSystems.js
	@@echo "Building JayData library..."
	@@test -d $(TARGET_DIR) || mkdir -p $(TARGET_DIR)
	@@cat $(TEMP_DIR)/TypeSystems.js $(JAYDATA_SOURCE) > $(TEMP_DIR)/JayData.js
	@@cat CREDITS.txt $(TEMP_DIR)/JayData.js > $(TARGET_DIR)/JayData.js

$(TEMP_DIR)/TypeSystems.js : $(TYPE_SYSTEM)
	@@echo "Building JayData type system..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(TYPE_SYSTEM) > $(TEMP_DIR)/TypeSystems.js

.PHONY: JayDataMin JayData JayDataStandaloneMin JayDataStandalone

