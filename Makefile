TARGET_DIR = ./build
TEMP_DIR = $(TARGET_DIR)/TMP
MODULE_DIR = $(TARGET_DIR)/Modules
PROVIDERS_DIR = $(TARGET_DIR)/Providers
COMPILER = ./Tools/compiler.jar

TYPE_SYSTEM = ./TypeSystem/initializeJayData.js\
	./TypeSystem/utils.js\
	./TypeSystem/PreHtml5Compatible.js\
	./TypeSystem/JayLint.js\
	./TypeSystem/TypeSystem.js\

VSDOC_SOURCE = ./TypeSystem/VS2010Intellisense.js\

JAYDATA_SOURCE = ./Types/Expressions/ASTParser.js\
	./Types/Expressions/ArrayLiteralExpression.js\
	./Types/Expressions/ExpressionNode2.js\
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
	./Types/Expressions/EntityExpressions/ServiceOperationExpression.js\
	./Types/Validation/EntityValidationBase.js\
	./Types/Validation/EntityValidation.js\
	./Types/Notifications/ChangeDistributorBase.js\
	./Types/Notifications/ChangeCollectorBase.js\
	./Types/Notifications/ChangeDistributor.js\
	./Types/Notifications/ChangeCollector.js\
	./Types/Access.js\
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
	./Types/ServiceOperation.js\
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
	./Types/StorageProviders/modelBinderConfigCompiler.js\
	./Types/Authentication/AuthenticationBase.js\
	./Types/Authentication/Anonymous.js\
	./Types/Authentication/FacebookAuth.js\
	./Types/Authentication/BasicAuth.js\

IndexDbProvider = ./Types/StorageProviders/IndexedDB/IndexedDBStorageProvider.js\

SqLiteProvider = ./Types/StorageProviders/SqLite/SqLiteStorageProvider.js\
	./Types/StorageProviders/SqLite/SqLiteCompiler.js\
	./Types/StorageProviders/SqLite/SqlPagingCompiler.js\
	./Types/StorageProviders/SqLite/SqlOrderCompiler.js\
	./Types/StorageProviders/SqLite/SqlProjectionCompiler.js\
	./Types/StorageProviders/SqLite/ExpressionMonitor.js\
	./Types/StorageProviders/SqLite/SqlFilterCompiler.js\
	./Types/StorageProviders/SqLite/ModelBinder/sqLite_ModelBinderCompiler.js\

oDataProvider = ./Types/StorageProviders/oData/oDataProvider.js\
	./Types/StorageProviders/oData/oDataCompiler.js\
	./Types/StorageProviders/oData/oDataWhereCompiler.js\
	./Types/StorageProviders/oData/oDataOrderCompiler.js\
	./Types/StorageProviders/oData/oDataPagingCompiler.js\
	./Types/StorageProviders/oData/oDataProjectionCompiler.js\

FacebookProvider = ./Types/StorageProviders/Facebook/FacebookProvider.js\
	./Types/StorageProviders/Facebook/FacebookCompiler.js\
	./Types/StorageProviders/Facebook/EntitySets/FQL/user.js\
	./Types/StorageProviders/Facebook/EntitySets/FQL/friend.js\
	./Types/StorageProviders/Facebook/EntitySets/FQL/page.js\
	./Types/StorageProviders/Facebook/EntitySets/FQLContext.js\

YQLProvider = ./Types/StorageProviders/YQL/YQLProvider.js\
	./Types/StorageProviders/YQL/YQLCompiler.js\
	./Types/StorageProviders/YQL/EntitySets/geo.js\
	./Types/StorageProviders/YQL/EntitySets/YQLContext.js\

InMemoryProvider = ./Types/StorageProviders/InMemory/InMemoryProvider.js\
	./Types/StorageProviders/InMemory/InMemoryCompiler.js\
	./Types/StorageProviders/InMemory/InMemoryFunctionCompiler.js\

MongoDbProvider = ./Types/StorageProviders/mongoDB/mongoDBStorageProvider.js\

StormProvider = ./Types/StorageProviders/Storm/StormStorageProvider.js\

all: jaydatavsdoc jaydatamin jaydata providers
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR) && cp ./JayDataModules/* $(MODULE_DIR)
	@@rm -r $(TEMP_DIR)

providers: indexdbprovider sqliteprovider odataprovider facebookprovider yqlprovider inmemoryprovider mongodbprovider stormprovider

indexdbprovider: $(IndexDbProvider)
	@@echo "Building IndexDbProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(IndexDbProvider) > $(PROVIDERS_DIR)/IndexDbProvider.js

sqliteprovider: $(SqLiteProvider)
	@@echo "Building SqLiteProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(SqLiteProvider) > $(PROVIDERS_DIR)/SqLiteProvider.js

odataprovider: $(oDataProvider)
	@@echo "Building oDataProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(oDataProvider) > $(PROVIDERS_DIR)/oDataProvider.js

facebookprovider: $(FacebookProvider)
	@@echo "Building FacebookProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(FacebookProvider) > $(PROVIDERS_DIR)/FacebookProvider.js

yqlprovider: $(YQLProvider)
	@@echo "Building YQLProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(YQLProvider) > $(PROVIDERS_DIR)/YQLProvider.js

inmemoryprovider: $(InMemoryProvider)
	@@echo "Building InMemoryProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(InMemoryProvider) > $(PROVIDERS_DIR)/InMemoryProvider.js

mongodbprovider: $(MongoDbProvider)
	@@echo "Building MongoDbProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(MongoDbProvider) > $(PROVIDERS_DIR)/MongoDbProvider.js

stormprovider: $(StormProvider)
	@@echo "Building StormProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(StormProvider) > $(PROVIDERS_DIR)/StormProvider.js

jaydatavsdoc: jaydata
	@@echo "Building JayData vsdoc version..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(VSDOC_SOURCE) $(TEMP_DIR)/jaydata.js > $(TEMP_DIR)/jaydata-vsdoc.js
	@@cat CREDITS.txt $(TEMP_DIR)/jaydata-vsdoc.js > $(TARGET_DIR)/jaydata-vsdoc.js

jaydatamin: jaydata
	@@echo "Minifying JayData library..."
	@@test -d $(TARGET_DIR) || mkdir -p $(TARGET_DIR)
	@@java -jar $(COMPILER) --js $(TARGET_DIR)/jaydata.js --js_output_file $(TEMP_DIR)/jaydata.min.js
	@@cat CREDITS.txt $(TEMP_DIR)/jaydata.min.js > $(TARGET_DIR)/jaydata.min.js

jaydata: $(TEMP_DIR)/TypeSystems.js
	@@echo "Building JayData library..."
	@@test -d $(TARGET_DIR) || mkdir -p $(TARGET_DIR)
	@@cat $(TEMP_DIR)/TypeSystems.js $(JAYDATA_SOURCE) > $(TEMP_DIR)/jaydata.js
	@@cat CREDITS.txt $(TEMP_DIR)/jaydata.js > $(TARGET_DIR)/jaydata.js

$(TEMP_DIR)/TypeSystems.js : $(TYPE_SYSTEM)
	@@echo "Building JayData type system..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(TYPE_SYSTEM) > $(TEMP_DIR)/TypeSystems.js

.PHONY: JayDataMin JayData JayDataStandaloneMin JayDataStandalone All

