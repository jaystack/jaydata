VERSION = '1.0.8'
TARGET_DIR = ./build
RELEASE_DIR = ./release
TEMP_DIR = $(TARGET_DIR)/tmp
NPM_DIR = $(TARGET_DIR)/npm
NPM_BASE_DIR = ./npm
TYPESYSTEM_DIR = ./TypeSystem
TYPES_DIR = ./Types
JAYSVCUTIL_DIR = ./JaySvcUtil
JSERVICE_DIR = ./JayService
BASEMODULE_DIR = ./JayDataModules
ODATAPARSER_DIR = ./oDataParser
COMPILER = ./Tools/compiler.jar
GPL_LIC = ./GPL-LICENSE.txt
MIT_LIC = ./MIT-LICENSE.txt
CREDITS_BASE = ./CREDITS.txt
CREDITS = $(TEMP_DIR)/CREDITS.txt

TYPE_SYSTEM_CLIENT = ./Scripts/acorn.js\
	$(TYPESYSTEM_DIR)/initializeJayDataClient.js

TYPE_SYSTEM_NPM = TypeSystem/initializeJayData.js

TYPE_SYSTEM = $(TYPESYSTEM_DIR)/initializeJayData.js\
	$(TYPESYSTEM_DIR)/Exception.js\
	$(TYPESYSTEM_DIR)/utils.js\
	$(TYPESYSTEM_DIR)/PreHtml5Compatible.js\
	$(TYPESYSTEM_DIR)/TypeSystem.js\
	$(TYPESYSTEM_DIR)/Types/Types.js\
	$(TYPESYSTEM_DIR)/Trace/Trace.js\
	$(TYPESYSTEM_DIR)/Trace/Logger.js\
	$(TYPESYSTEM_DIR)/Types/Types.js\
	$(TYPESYSTEM_DIR)/Types/SimpleBase.js\
	$(TYPESYSTEM_DIR)/Types/Geospatial.js\
	$(TYPESYSTEM_DIR)/Types/Geography.js\
	$(TYPESYSTEM_DIR)/Types/Geometry.js\
	$(TYPESYSTEM_DIR)/Types/Guid.js\
	$(TYPESYSTEM_DIR)/Types/Blob.js\
	$(TYPESYSTEM_DIR)/Types/EdmTypes.js\
	$(TYPESYSTEM_DIR)/Types/Converter.js\
	$(TYPESYSTEM_DIR)/Extensions.js\

JAYDATA_SOURCE = $(TYPES_DIR)/Expressions/ExpressionNode2.js\
	$(TYPES_DIR)/Expressions/ArrayLiteralExpression.js\
	$(TYPES_DIR)/Expressions/CallExpression.js\
	$(TYPES_DIR)/Expressions/CodeParser.js\
	$(TYPES_DIR)/Expressions/ConstantExpression.js\
	$(TYPES_DIR)/Expressions/FunctionExpression.js\
	$(TYPES_DIR)/Expressions/ObjectFieldExpression.js\
	$(TYPES_DIR)/Expressions/ObjectLiteralExpression.js\
	$(TYPES_DIR)/Expressions/PagingExpression.js\
	$(TYPES_DIR)/Expressions/ParameterExpression.js\
	$(TYPES_DIR)/Expressions/PropertyExpression.js\
	$(TYPES_DIR)/Expressions/SimpleBinaryExpression.js\
	$(TYPES_DIR)/Expressions/ThisExpression.js\
	$(TYPES_DIR)/Expressions/Visitors/ExpressionVisitor.js\
	$(TYPES_DIR)/Expressions/Visitors/ParameterProcessor.js\
	$(TYPES_DIR)/Expressions/Visitors/GlobalContextProcessor.js\
	$(TYPES_DIR)/Expressions/Visitors/LocalContextProcessor.js\
	$(TYPES_DIR)/Expressions/Visitors/LambdaParameterProcessor.js\
	$(TYPES_DIR)/Expressions/Visitors/ParameterResolverVisitor.js\
	$(TYPES_DIR)/Expressions/Visitors/LogicalSchemaBinderVisitor.js\
	$(TYPES_DIR)/Expressions/Visitors/ExpTreeVisitor.js\
	$(TYPES_DIR)/Expressions/Visitors/SetExecutableVisitor.js\
	$(TYPES_DIR)/Expressions/Visitors/ExecutorVisitor.js\
	$(TYPES_DIR)/Expressions/ExpressionBuilder.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/AssociationInfoExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/CodeExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/CodeToEntityConverter.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/ComplexTypeExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/EntityContextExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/EntityExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/EntityExpressionVisitor.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/ExpressionMonitor.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/EntityFieldExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/EntityFieldOperationExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/EntitySetExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/FrameOperationExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/FilterExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/IncludeExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/MemberInfoExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/OrderExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/ParametricQueryExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/ProjectionExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/QueryExpressionCreator.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/QueryParameterExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/RepresentationExpression.js\
	$(TYPES_DIR)/Expressions/EntityExpressions/ServiceOperationExpression.js\
	$(TYPES_DIR)/Expressions/ContinuationExpressionBuilder.js\
	$(TYPES_DIR)/Validation/EntityValidationBase.js\
	$(TYPES_DIR)/Validation/EntityValidation.js\
	$(TYPES_DIR)/Notifications/ChangeDistributorBase.js\
	$(TYPES_DIR)/Notifications/ChangeCollectorBase.js\
	$(TYPES_DIR)/Notifications/ChangeDistributor.js\
	$(TYPES_DIR)/Notifications/ChangeCollector.js\
	$(TYPES_DIR)/Transaction.js\
	$(TYPES_DIR)/Access.js\
	$(TYPES_DIR)/Promise.js\
	$(TYPES_DIR)/Entity.js\
	$(TYPES_DIR)/EntityContext.js\
	$(TYPES_DIR)/QueryProvider.js\
	$(TYPES_DIR)/ModelBinder.js\
	$(TYPES_DIR)/QueryBuilder.js\
	$(TYPES_DIR)/Query.js\
	$(TYPES_DIR)/Queryable.js\
	$(TYPES_DIR)/EntitySet.js\
	$(TYPES_DIR)/EntityState.js\
	$(TYPES_DIR)/EntityAttachModes.js\
	$(TYPES_DIR)/EntityStateManager.js\
	$(TYPES_DIR)/ItemStore.js\
	$(TYPES_DIR)/StorageProviderLoader.js\
	$(TYPES_DIR)/StorageProviderBase.js\
	$(TYPES_DIR)/ServiceOperation.js\
	$(TYPES_DIR)/EntityWrapper.js\
	$(TYPES_DIR)/Ajax/jQueryAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/ExtJSAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/AjaxStub.js\
	$(TYPES_DIR)/StorageProviders/modelBinderConfigCompiler.js\
	$(TYPES_DIR)/Authentication/AuthenticationBase.js\
	$(TYPES_DIR)/Authentication/Anonymous.js\
	$(TYPES_DIR)/Authentication/FacebookAuth.js\
	$(TYPES_DIR)/Authentication/BasicAuth.js\
	$(JAYSVCUTIL_DIR)/JaySvcUtil.js\
	$(BASEMODULE_DIR)/deferred.js\

JAYDATA_SERVER = $(BASEMODULE_DIR)/qDeferred.js\
	$(JSERVICE_DIR)/Scripts/datajs-1.0.3-patched.js\
	$(JSERVICE_DIR)/Scripts/XMLHttpRequest-patched.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataConverter.js\
	$(JSERVICE_DIR)/JayService.js\
	$(JSERVICE_DIR)/OData/Helpers.js\
	$(JSERVICE_DIR)/oDataMetaDataGenerator.js\
	$(JSERVICE_DIR)/XMLCreator.js\
	$(JSERVICE_DIR)/XmlResult.js\
	$(JSERVICE_DIR)/ArgumentBinder.js\
	$(JSERVICE_DIR)/JSObjectAdapter.js\
	$(JSERVICE_DIR)/ServiceBase.js\
	$(JSERVICE_DIR)/EntityTransform.js\
	$(JSERVICE_DIR)/EntityXmlTransform.js\
	$(JSERVICE_DIR)/oDataResponseDataBuilder.js\
	$(JSERVICE_DIR)/OData/ServiceDefinitionXml.js\
	$(JSERVICE_DIR)/OData/BatchProcessor.js\
	$(JSERVICE_DIR)/OData/EntitySetProcessor.js\
	$(ODATAPARSER_DIR)/RequestExpressionBuilder.js\
	$(ODATAPARSER_DIR)/RequestLexer.js\
	$(ODATAPARSER_DIR)/RequestParser.js\
	$(ODATAPARSER_DIR)/EntityExpressionBuilder.js\
	$(ODATAPARSER_DIR)/ODataEntityExpressionBuilder.js\
	$(ODATAPARSER_DIR)/Visitors/ObjectLiteralBuilderVisitor.js\

DbCommand = $(TYPES_DIR)/DbClient/DbCommand.js\
	$(TYPES_DIR)/DbClient/DbConnection.js\
	$(TYPES_DIR)/DbClient/OpenDatabaseClient/OpenDbCommand.js\
	$(TYPES_DIR)/DbClient/OpenDatabaseClient/OpenDbConnection.js\
	$(TYPES_DIR)/DbClient/JayStorageClient/JayStorageCommand.js\
	$(TYPES_DIR)/DbClient/JayStorageClient/JayStorageConnection.js\
	$(TYPES_DIR)/DbClient/SqLiteNjClient/SqLiteNjCommand.js\
	$(TYPES_DIR)/DbClient/SqLiteNjClient/SqLiteNjConnection.js\

SqLiteProvider = $(DbCommand)\
	$(TYPES_DIR)/StorageProviders/SqLite/SqLiteConverter.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqLiteStorageProvider.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqLiteCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlPagingCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlOrderCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlProjectionCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlExpressionMonitor.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlFilterCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/ModelBinder/sqLite_ModelBinderCompiler.js\

MongoDbProvider = $(TYPES_DIR)/StorageProviders/InMemory/InMemoryConverter.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBConverter.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBModelBinderConfigCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBProjectionCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBFilterCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBOrderCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBPagingCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBFunctionCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBCompiler.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/mongoDBStorageProvider.js\
	$(TYPES_DIR)/StorageProviders/mongoDB/ClientObjectID.js\

clean: 
	@@test ! -d $(TARGET_DIR) || rm -r $(TARGET_DIR)
	@@test ! -d $(RELEASE_DIR) || rm -r $(RELEASE_DIR)

release: all
	@@echo "Create release folder..."
	@@test -d $(RELEASE_DIR) || mkdir -p $(RELEASE_DIR)
	@@cp $(TARGET_DIR)/jaydata.js $(RELEASE_DIR)
	@@cp $(TARGET_DIR)/jaydata.min.js $(RELEASE_DIR)

all: jaydatamin jaydata npms
	@@rm -r $(TEMP_DIR)

npms: npmjaydata

npmjaydata: $(TYPE_SYSTEM) $(JAYDATA_SOURCE) $(CREDITS)
	@@echo "Building jaydata npm package..."
	@@test -d $(NPM_DIR)/jaydata || mkdir -p $(NPM_DIR)/jaydata
	@@cp -r $(NPM_BASE_DIR)/jaydata/* $(NPM_DIR)/jaydata
	@@rsync -R $(TYPE_SYSTEM) $(NPM_DIR)/jaydata/lib
	@@cat $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM) | \
	sed -e 's/$data.version = "JayData [0-9].[0-9].[0-9]"/$data.version = "JayData $(VERSION)"/;s/$data.versionNumber = "[0-9].[0-9].[0-9]"/$data.versionNumber = "$(VERSION)"/' > $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM).bak
	@@mv $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM).bak $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM)
	@@rsync -R $(JAYDATA_SOURCE) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(SqLiteProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(MongoDbProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(JAYDATA_SERVER) $(NPM_DIR)/jaydata/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/jaydata
	@@cp -r $(MIT_LIC) $(NPM_DIR)/jaydata
	@@cp -r $(CREDITS) $(NPM_DIR)/jaydata
	@$(foreach dir,$(TYPE_SYSTEM),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/index.js;)
	@$(foreach dir,$(JAYDATA_SOURCE),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/index.js;)
	@$(foreach dir,$(SqLiteProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/sqlite_index.js;)
	@$(foreach dir,$(MongoDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/mongodb_index.js;)
	@$(foreach dir,$(JAYDATA_SERVER),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/service_index.js;)
	@@echo "require('./sqlite_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./mongodb_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./service_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/jaydata/lib/index.js
	@@sed -e 's/"dependencies": {},/"dependencies": {"datajs": "1.0.3", "q": "0.8.5", "qs": "0.5.0", "xmldom": "0.1.11", "url": ">0.0.1", "acorn": "0.1.0"},/;s/jaydata@[0-9].[0-9].[0-9]/jaydata@$(VERSION)/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/' $(NPM_BASE_DIR)/jaydata/package.json > $(NPM_DIR)/jaydata/package.json

jaydatamin: jaydata $(CREDITS)
	@@echo "Minifying JayData library..."
	@@test -d $(TARGET_DIR) || mkdir -p $(TARGET_DIR)
	@@java -jar $(COMPILER) --js $(TARGET_DIR)/jaydata.js --js_output_file $(TEMP_DIR)/jaydata.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/jaydata.min.js > $(TARGET_DIR)/jaydata.min.js

jaydata: $(TEMP_DIR)/TypeSystems.js $(CREDITS)
	@@echo "Building JayData library..."
	@@test -d $(TARGET_DIR) || mkdir -p $(TARGET_DIR)
	@@cat $(TEMP_DIR)/TypeSystems.js $(JAYDATA_SOURCE) > $(TEMP_DIR)/jaydata.js
	@@cat $(CREDITS) $(TEMP_DIR)/jaydata.js > $(TARGET_DIR)/jaydata.js

$(TEMP_DIR)/TypeSystems.js : $(TYPE_SYSTEM) $(TYPE_SYSTEM_CLIENT)
	@@echo "Building JayData type system..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(TYPE_SYSTEM_CLIENT) $(TYPE_SYSTEM) | \
	sed -e 's/$data.version = "JayData [0-9].[0-9].[0-9]"/$data.version = "JayData $(VERSION)"/;s/$data.versionNumber = "[0-9].[0-9].[0-9]"/$data.versionNumber = "$(VERSION)"/' > $(TEMP_DIR)/TypeSystems.js

$(CREDITS): $(CREDITS_BASE)
	@@echo "Create CREDITS.txt file"
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@sed -e 's/JayData [0-9].[0-9].[0-9]/JayData $(VERSION)/' $(CREDITS_BASE) > $(CREDITS)

.PHONY: JayDataMin JayData JayDataStandaloneMin JayDataStandalone All

