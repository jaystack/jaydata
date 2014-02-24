VERSION = '1.3.6'
TARGET_DIR = ./build
RELEASE_DIR = ./release
TEMP_DIR = $(TARGET_DIR)/tmp
MODULE_DIR = $(TARGET_DIR)/jaydatamodules
PROVIDERS_DIR = $(TARGET_DIR)/jaydataproviders
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

VSDOC_SOURCE = $(TYPESYSTEM_DIR)/VS2010Intellisense.js\

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
	$(TYPES_DIR)/Ajax/WinJSAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/ExtJSAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/AjaxStub.js\
	$(TYPES_DIR)/StorageProviders/modelBinderConfigCompiler.js\
	$(TYPES_DIR)/Authentication/AuthenticationBase.js\
	$(TYPES_DIR)/Authentication/Anonymous.js\
	$(TYPES_DIR)/Authentication/FacebookAuth.js\
	$(TYPES_DIR)/Authentication/BasicAuth.js\
	$(JAYSVCUTIL_DIR)/JaySvcUtil.js\
	$(BASEMODULE_DIR)/deferred.js\
	$(TYPES_DIR)/JayStorm.js\

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

IndexedDbProvider = $(TYPES_DIR)/StorageProviders/IndexedDB/IndexedDBConverter.js\
	$(TYPES_DIR)/StorageProviders/IndexedDB/IndexedDBStorageProvider.js\

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

oDataProvider = $(TYPES_DIR)/StorageProviders/oData/oDataConverter.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataProvider.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataWhereCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataOrderCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataPagingCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataProjectionCompiler.js\

FacebookProvider = $(TYPES_DIR)/StorageProviders/Facebook/FacebookConverter.js\
	$(TYPES_DIR)/StorageProviders/Facebook/FacebookProvider.js\
	$(TYPES_DIR)/StorageProviders/Facebook/FacebookCompiler.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQL/user.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQL/friend.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQL/page.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQLContext.js\

YQLProvider = $(TYPES_DIR)/StorageProviders/YQL/YQLConverter.js\
	$(TYPES_DIR)/StorageProviders/YQL/YQLProvider.js\
	$(TYPES_DIR)/StorageProviders/YQL/YQLCompiler.js\
	$(TYPES_DIR)/StorageProviders/YQL/EntitySets/geo.js\
	$(TYPES_DIR)/StorageProviders/YQL/EntitySets/YQLContext.js\

InMemoryProvider = $(TYPES_DIR)/StorageProviders/InMemory/InMemoryConverter.js\
	$(TYPES_DIR)/StorageProviders/InMemory/InMemoryProvider.js\
	$(TYPES_DIR)/StorageProviders/InMemory/InMemoryCompiler.js\
	$(TYPES_DIR)/StorageProviders/InMemory/InMemoryFunctionCompiler.js\

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

StormProvider = $(TYPES_DIR)/StorageProviders/Storm/StormStorageProvider.js\

WebApiProvider = $(TYPES_DIR)/StorageProviders/WebApi/WebApiConverter.js\
	$(TYPES_DIR)/StorageProviders/WebApi/WebApiProvider.js\

DeferredModule = $(BASEMODULE_DIR)/deferred.js\

ErrorHandlerModule = $(BASEMODULE_DIR)/errorhandler.js\

FormBinderModule = $(BASEMODULE_DIR)/formBinder.js\

HandlebarsModule = $(BASEMODULE_DIR)/handlebars.js\

InMemoryModule = $(BASEMODULE_DIR)/inMemory.js\

KendoModule = $(BASEMODULE_DIR)/kendo.js\

KnockoutModule = $(BASEMODULE_DIR)/knockout.js\

QDeferredModule = $(BASEMODULE_DIR)/qDeferred.js\

SenchaModule = $(BASEMODULE_DIR)/sencha.js\

TemplateModule = $(BASEMODULE_DIR)/template.js\

ValidateModule = $(BASEMODULE_DIR)/validate.js\

AngularModule = $(BASEMODULE_DIR)/angular.js\

MsCrmModule = $(BASEMODULE_DIR)/jaydata.mscrm.js\

MsCrmServerModule = $(BASEMODULE_DIR)/jaydata.mscrm.server.js\


clean: 
	@@test ! -d $(TARGET_DIR) || rm -r $(TARGET_DIR)
	@@test ! -d $(RELEASE_DIR) || rm -r $(RELEASE_DIR)

modules: jaydatamodules
	@@rm -r $(TEMP_DIR)

release: all
	@@echo "Create release folder..."
	@@test -d $(RELEASE_DIR) || mkdir -p $(RELEASE_DIR)
	@@test -d $(RELEASE_DIR)/jaydatamodules || mkdir -p $(RELEASE_DIR)/jaydatamodules
	@@test -d $(RELEASE_DIR)/jaydataproviders || mkdir -p $(RELEASE_DIR)/jaydataproviders
	@@cp -r $(MODULE_DIR)/* $(RELEASE_DIR)/jaydatamodules
	@@cp -r $(PROVIDERS_DIR)/* $(RELEASE_DIR)/jaydataproviders
	@@cp $(TARGET_DIR)/jaydata.js $(RELEASE_DIR)
	@@cp $(TARGET_DIR)/jaydata.min.js $(RELEASE_DIR)
	@@cp $(TARGET_DIR)/jaydata-vsdoc.js $(RELEASE_DIR)

all: jaydatavsdoc jaydatamin jaydata providers jaydatamodules npms
	@@rm -r $(TEMP_DIR)

npms: npmjaydata npmjaydata-core npmjaydata-server npmindexeddb npmsqlite npmodata npminmemory npmmongodb npmstorm npmwebapi

npmjaydata-core: $(TYPE_SYSTEM) $(JAYDATA_SOURCE) $(CREDITS)
	@@echo "Building jaydata-core npm package..."
	@@test -d $(NPM_DIR)/jaydata-core || mkdir -p $(NPM_DIR)/jaydata-core
	@@cp -r $(NPM_BASE_DIR)/jaydata/* $(NPM_DIR)/jaydata-core
	@@cp -r $(TYPESYSTEM_DIR) $(NPM_DIR)/jaydata-core/lib
	@@cat $(NPM_DIR)/jaydata-core/lib/$(TYPE_SYSTEM_NPM) | \
	sed -e 's/$data.version = "JayData [0-9].[0-9].[0-9]"/$data.version = "JayData $(VERSION)"/;s/$data.versionNumber = "[0-9].[0-9].[0-9]"/$data.versionNumber = "$(VERSION)"/' > $(NPM_DIR)/jaydata-core/lib/$(TYPE_SYSTEM_NPM).bak
	@@mv $(NPM_DIR)/jaydata-core/lib/$(TYPE_SYSTEM_NPM).bak $(NPM_DIR)/jaydata-core/lib/$(TYPE_SYSTEM_NPM)
	@@rsync -R $(JAYDATA_SOURCE) $(NPM_DIR)/jaydata-core/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/jaydata-core
	@@cp -r $(MIT_LIC) $(NPM_DIR)/jaydata-core
	@@cp -r $(CREDITS) $(NPM_DIR)/jaydata-core
	@$(foreach dir,$(TYPE_SYSTEM),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata-core/lib/index.js;)
	@$(foreach dir,$(JAYDATA_SOURCE),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata-core/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/jaydata-core/lib/index.js
	@@sed -e 's/"dependencies": {},/"dependencies": {"datajs": "1.0.3", "q": "0.8.5", "qs": "0.5.0", "xmldom": "0.1.11", "url": ">0.0.1", "acorn": "0.1.0"},/;s/"name": "jaydata"/"name": "jaydata-core"/;s/jaydata@[0-9].[0-9].[0-9]/jaydata@$(VERSION)/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/' $(NPM_BASE_DIR)/jaydata/package.json > $(NPM_DIR)/jaydata-core/package.json

npmjaydata-server: $(JAYDATA_SERVER) $(CREDITS)
	@@echo "Building jaydata-server npm package..."
	@@test -d $(NPM_DIR)/jaydata-server || mkdir -p $(NPM_DIR)/jaydata-server
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/jaydata-server
	@@rsync -R $(JAYDATA_SERVER) $(NPM_DIR)/jaydata-server/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/jaydata-server
	@@cp -r $(MIT_LIC) $(NPM_DIR)/jaydata-server
	@@cp -r $(CREDITS) $(NPM_DIR)/jaydata-server
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/jaydata-server/lib/index.js;
	@$(foreach dir,$(JAYDATA_SERVER),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata-server/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/jaydata-server/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-server"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/jaydata-server/package.json

npmjaydata: $(TYPE_SYSTEM) $(JAYDATA_SOURCE) $(CREDITS)
	@@echo "Building jaydata npm package..."
	@@test -d $(NPM_DIR)/jaydata || mkdir -p $(NPM_DIR)/jaydata
	@@cp -r $(NPM_BASE_DIR)/jaydata/* $(NPM_DIR)/jaydata
	@@rsync -R $(TYPE_SYSTEM) $(NPM_DIR)/jaydata/lib
	@@cat $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM) | \
	sed -e 's/$data.version = "JayData [0-9].[0-9].[0-9]"/$data.version = "JayData $(VERSION)"/;s/$data.versionNumber = "[0-9].[0-9].[0-9]"/$data.versionNumber = "$(VERSION)"/' > $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM).bak
	@@mv $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM).bak $(NPM_DIR)/jaydata/lib/$(TYPE_SYSTEM_NPM)
	@@rsync -R $(JAYDATA_SOURCE) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(IndexedDbProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(SqLiteProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(oDataProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(WebApiProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(InMemoryProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(MongoDbProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(StormProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(FacebookProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(YQLProvider) $(NPM_DIR)/jaydata/lib
	@@rsync -R $(JAYDATA_SERVER) $(NPM_DIR)/jaydata/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/jaydata
	@@cp -r $(MIT_LIC) $(NPM_DIR)/jaydata
	@@cp -r $(CREDITS) $(NPM_DIR)/jaydata
	@$(foreach dir,$(TYPE_SYSTEM),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/index.js;)
	@$(foreach dir,$(JAYDATA_SOURCE),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/indexeddb_index.js;)
	@$(foreach dir,$(IndexedDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/indexeddb_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/sqlite_index.js;)
	@$(foreach dir,$(SqLiteProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/sqlite_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/odata_index.js;)
	@$(foreach dir,$(oDataProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/odata_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/webapi_index.js;)
	@$(foreach dir,$(WebApiProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/webapi_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/inmemory_index.js;)
	@$(foreach dir,$(InMemoryProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/inmemory_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/mongodb_index.js;)
	@$(foreach dir,$(MongoDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/mongodb_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/storm_index.js;)
	@$(foreach dir,$(StormProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/storm_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/facebook_index.js;)
	@$(foreach dir,$(FacebookProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/facebook_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/yql_index.js;)
	@$(foreach dir,$(YQLProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/yql_index.js;)
	@@rm -f $(NPM_DIR)/jaydata/lib/service_index.js;)
	@$(foreach dir,$(JAYDATA_SERVER),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/service_index.js;)
	@@echo "require('./indexeddb_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./sqlite_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./odata_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./webapi_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./inmemory_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./mongodb_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./storm_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./facebook_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./yql_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo "require('./service_index.js');" >> $(NPM_DIR)/jaydata/lib/index.js;
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/jaydata/lib/index.js
	@@sed -e 's/"dependencies": {},/"dependencies": {"datajs": "1.0.3", "q": "0.8.5", "qs": "0.5.0", "xmldom": "0.1.11", "url": ">0.0.1", "acorn": "0.1.0"},/;s/jaydata@[0-9].[0-9].[0-9]/jaydata@$(VERSION)/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/' $(NPM_BASE_DIR)/jaydata/package.json > $(NPM_DIR)/jaydata/package.json

npmindexeddb: $(IndexedDbProvider) $(CREDITS)
	@@echo "Building IndexedDb provider npm package..."
	@@test -d $(NPM_DIR)/indexeddb || mkdir -p $(NPM_DIR)/indexeddb
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/indexeddb
	@@rsync -R $(IndexedDbProvider) $(NPM_DIR)/indexeddb/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/indexeddb
	@@cp -r $(MIT_LIC) $(NPM_DIR)/indexeddb
	@@cp -r $(CREDITS) $(NPM_DIR)/indexeddb
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/indexeddb/lib/index.js;
	@$(foreach dir,$(IndexedDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/indexeddb/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/indexeddb/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-indexeddb"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/indexeddb/package.json

npmsqlite: $(SqLiteProvider) $(CREDITS)
	@@echo "Building SqLiteProvider provider npm package..."
	@@test -d $(NPM_DIR)/sqlite || mkdir -p $(NPM_DIR)/sqlite
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/sqlite
	@@rsync -R $(SqLiteProvider) $(NPM_DIR)/sqlite/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/sqlite
	@@cp -r $(MIT_LIC) $(NPM_DIR)/sqlite
	@@cp -r $(CREDITS) $(NPM_DIR)/sqlite
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/sqlite/lib/index.js;
	@$(foreach dir,$(SqLiteProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/sqlite/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/sqlite/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-sqlite"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/sqlite/package.json

npmodata: $(oDataProvider) $(CREDITS)
	@@echo "Building oDataProvider provider npm package..."
	@@test -d $(NPM_DIR)/odata || mkdir -p $(NPM_DIR)/odata
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/odata
	@@rsync -R $(oDataProvider) $(NPM_DIR)/odata/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/odata
	@@cp -r $(MIT_LIC) $(NPM_DIR)/odata
	@@cp -r $(CREDITS) $(NPM_DIR)/odata
	@@echo "require('datajs');" >> $(NPM_DIR)/odata/lib/index.js;
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/odata/lib/index.js;
	@$(foreach dir,$(oDataProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/odata/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/odata/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-odata"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)","datajs": "1.0.3"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/odata/package.json

npmwebapi: $(WebApiProvider) $(CREDITS)
	@@echo "Building WebApiProvider provider npm package..."
	@@test -d $(NPM_DIR)/webapi || mkdir -p $(NPM_DIR)/webapi
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/webapi
	@@rsync -R $(WebApiProvider) $(NPM_DIR)/webapi/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/webapi
	@@cp -r $(MIT_LIC) $(NPM_DIR)/webapi
	@@cp -r $(CREDITS) $(NPM_DIR)/webapi
	@@echo "require('datajs');" >> $(NPM_DIR)/webapi/lib/index.js;
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/webapi/lib/index.js;
	@$(foreach dir,$(WebApiProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/webapi/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/webapi/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-webapi"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)","datajs": "1.0.3"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/webapi/package.json


npminmemory: $(InMemoryProvider) $(CREDITS)
	@@echo "Building InMemoryProvider provider npm package..."
	@@test -d $(NPM_DIR)/inmemory || mkdir -p $(NPM_DIR)/inmemory
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/inmemory
	@@rsync -R $(InMemoryProvider) $(NPM_DIR)/inmemory/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/inmemory
	@@cp -r $(MIT_LIC) $(NPM_DIR)/inmemory
	@@cp -r $(CREDITS) $(NPM_DIR)/inmemory
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/inmemory/lib/index.js;
	@$(foreach dir,$(InMemoryProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/inmemory/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/inmemory/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-inmemory"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/inmemory/package.json

npmmongodb: $(MongoDbProvider) $(CREDITS)
	@@echo "Building MongoDbProvider provider npm package..."
	@@test -d $(NPM_DIR)/mongodb || mkdir -p $(NPM_DIR)/mongodb
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/mongodb
	@@rsync -R $(MongoDbProvider) $(NPM_DIR)/mongodb/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/mongodb
	@@cp -r $(MIT_LIC) $(NPM_DIR)/mongodb
	@@cp -r $(CREDITS) $(NPM_DIR)/mongodb
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/mongodb/lib/index.js;
	@$(foreach dir,$(MongoDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/mongodb/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/mongodb/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-mongodb"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/mongodb/package.json

npmstorm: $(StormProvider) $(CREDITS)
	@@echo "Building StormProvider provider npm package..."
	@@test -d $(NPM_DIR)/storm || mkdir -p $(NPM_DIR)/storm
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/storm
	@@rsync -R $(StormProvider) $(NPM_DIR)/storm/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/storm
	@@cp -r $(MIT_LIC) $(NPM_DIR)/storm
	@@cp -r $(CREDITS) $(NPM_DIR)/storm
	@@echo "try{ require('jaydata-core'); }catch(e){}" >> $(NPM_DIR)/storm/lib/index.js;
	@$(foreach dir,$(StormProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/storm/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/storm/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-storm"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata-core": "[0-9].[0-9].[0-9]"/"jaydata-core":"$(VERSION)","jaydata-inmemory": "$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/storm/package.json

providers: indexeddbprovider sqliteprovider odataprovider facebookprovider yqlprovider inmemoryprovider mongodbprovider stormprovider webapiprovider

indexeddbprovider: $(IndexedDbProvider) $(CREDITS)
	@@echo "Building IndexedDbProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(IndexedDbProvider) > $(PROVIDERS_DIR)/IndexedDbProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/IndexedDbProvider.js --js_output_file $(TEMP_DIR)/IndexedDbProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/IndexedDbProvider.min.js > $(PROVIDERS_DIR)/IndexedDbProvider.min.js

sqliteprovider: $(SqLiteProvider) $(CREDITS)
	@@echo "Building SqLiteProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(SqLiteProvider) > $(PROVIDERS_DIR)/SqLiteProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/SqLiteProvider.js --js_output_file $(TEMP_DIR)/SqLiteProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/SqLiteProvider.min.js > $(PROVIDERS_DIR)/SqLiteProvider.min.js

odataprovider: $(oDataProvider) $(CREDITS)
	@@echo "Building oDataProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(oDataProvider) > $(PROVIDERS_DIR)/oDataProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/oDataProvider.js --js_output_file $(TEMP_DIR)/oDataProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/oDataProvider.min.js > $(PROVIDERS_DIR)/oDataProvider.min.js

webapiprovider: $(WebApiProvider) $(CREDITS)
	@@echo "Building WebApiProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(WebApiProvider) > $(PROVIDERS_DIR)/WebApiProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/WebApiProvider.js --js_output_file $(TEMP_DIR)/WebApiProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/WebApiProvider.min.js > $(PROVIDERS_DIR)/WebApiProvider.min.js

facebookprovider: $(FacebookProvider) $(CREDITS)
	@@echo "Building FacebookProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(FacebookProvider) > $(PROVIDERS_DIR)/FacebookProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/FacebookProvider.js --js_output_file $(TEMP_DIR)/FacebookProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/FacebookProvider.min.js > $(PROVIDERS_DIR)/FacebookProvider.min.js

yqlprovider: $(YQLProvider) $(CREDITS)
	@@echo "Building YQLProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(YQLProvider) > $(PROVIDERS_DIR)/YQLProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/YQLProvider.js --js_output_file $(TEMP_DIR)/YQLProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/YQLProvider.min.js > $(PROVIDERS_DIR)/YQLProvider.min.js

inmemoryprovider: $(InMemoryProvider) $(CREDITS)
	@@echo "Building InMemoryProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(InMemoryProvider) > $(PROVIDERS_DIR)/InMemoryProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/InMemoryProvider.js --js_output_file $(TEMP_DIR)/InMemoryProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/InMemoryProvider.min.js > $(PROVIDERS_DIR)/InMemoryProvider.min.js

mongodbprovider: $(MongoDbProvider) $(CREDITS)
	@@echo "Building MongoDbProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(MongoDbProvider) > $(PROVIDERS_DIR)/MongoDbProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/MongoDbProvider.js --js_output_file $(TEMP_DIR)/MongoDbProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/MongoDbProvider.min.js > $(PROVIDERS_DIR)/MongoDbProvider.min.js

stormprovider: $(StormProvider) $(CREDITS)
	@@echo "Building StormProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(StormProvider) > $(PROVIDERS_DIR)/StormProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/StormProvider.js --js_output_file $(TEMP_DIR)/StormProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/StormProvider.min.js > $(PROVIDERS_DIR)/StormProvider.min.js

jaydatamodules: deferredmodule errorhandlermodule formbindermodule handlebarsmodule inmemorymodule kendomodule knockoutmodule qdeferredmodule senchamodule templatemodule validatemodule mscrmmodule mscrmservermodule angularmodule

deferredmodule: $(DeferredModule) $(CREDITS)
	@@echo "Building Deferred module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(DeferredModule) > $(MODULE_DIR)/deferred.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/deferred.js --js_output_file $(TEMP_DIR)/deferred.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/deferred.min.js > $(MODULE_DIR)/deferred.min.js

errorhandlermodule: $(ErrorHandlerModule) $(CREDITS)
	@@echo "Building ErrorHandler module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(ErrorHandlerModule) > $(MODULE_DIR)/errorhandler.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/errorhandler.js --js_output_file $(TEMP_DIR)/errorhandler.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/errorhandler.min.js > $(MODULE_DIR)/errorhandler.min.js

formbindermodule: $(FormBinderModule) $(CREDITS)
	@@echo "Building FormBinder module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(FormBinderModule) > $(MODULE_DIR)/formBinder.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/formBinder.js --js_output_file $(TEMP_DIR)/formBinder.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/formBinder.min.js > $(MODULE_DIR)/formBinder.min.js

handlebarsmodule: $(HandlebarsModule) $(CREDITS)
	@@echo "Building Handlebars module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(HandlebarsModule) > $(MODULE_DIR)/handlebars.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/handlebars.js --js_output_file $(TEMP_DIR)/handlebars.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/handlebars.min.js > $(MODULE_DIR)/handlebars.min.js

inmemorymodule: $(InMemoryModule) $(CREDITS)
	@@echo "Building InMemory module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(InMemoryModule) > $(MODULE_DIR)/inMemory.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/inMemory.js --js_output_file $(TEMP_DIR)/inMemory.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/inMemory.min.js > $(MODULE_DIR)/inMemory.min.js

kendomodule: $(KendoModule) $(CREDITS)
	@@echo "Building Kendo module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(KendoModule) > $(MODULE_DIR)/kendo.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/kendo.js --js_output_file $(TEMP_DIR)/kendo.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/kendo.min.js > $(MODULE_DIR)/kendo.min.js

knockoutmodule: $(KnockoutModule) $(CREDITS)
	@@echo "Building Knockout module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(KnockoutModule) > $(MODULE_DIR)/knockout.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/knockout.js --js_output_file $(TEMP_DIR)/knockout.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/knockout.min.js > $(MODULE_DIR)/knockout.min.js

qdeferredmodule: $(QDeferredModule) $(CREDITS)
	@@echo "Building QDeferred module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(QDeferredModule) > $(MODULE_DIR)/qDeferred.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/qDeferred.js --js_output_file $(TEMP_DIR)/qDeferred.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/qDeferred.min.js > $(MODULE_DIR)/qDeferred.min.js

senchamodule: $(SenchaModule) $(CREDITS)
	@@echo "Building Sencha module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(SenchaModule) > $(MODULE_DIR)/sencha.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/sencha.js --js_output_file $(TEMP_DIR)/sencha.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/sencha.min.js > $(MODULE_DIR)/sencha.min.js

templatemodule: $(TemplateModule) $(CREDITS)
	@@echo "Building Template module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(TemplateModule) > $(MODULE_DIR)/template.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/template.js --js_output_file $(TEMP_DIR)/template.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/template.min.js > $(MODULE_DIR)/template.min.js

validatemodule: $(ValidateModule) $(CREDITS)
	@@echo "Building Validate module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(ValidateModule) > $(MODULE_DIR)/validate.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/validate.js --js_output_file $(TEMP_DIR)/validate.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/validate.min.js > $(MODULE_DIR)/validate.min.js

angularmodule: $(AngularModule) $(CREDITS)
	@@echo "Building Angular module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(AngularModule) > $(MODULE_DIR)/angular.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/angular.js --js_output_file $(TEMP_DIR)/angular.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/angular.min.js > $(MODULE_DIR)/angular.min.js

mscrmmodule: $(MsCrmModule) $(CREDITS)
	@@echo "Building MsCrm module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(MsCrmModule) > $(MODULE_DIR)/jaydata.mscrm.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/jaydata.mscrm.js --js_output_file $(TEMP_DIR)/jaydata.mscrm.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/jaydata.mscrm.min.js > $(MODULE_DIR)/jaydata.mscrm.min.js

mscrmservermodule: $(MsCrmServerModule) $(CREDITS)
	@@echo "Building MsCrm Server module..."
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR)
	@@cat $(CREDITS) $(MsCrmServerModule) > $(MODULE_DIR)/jaydata.mscrm.server.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR)/jaydata.mscrm.server.js --js_output_file $(TEMP_DIR)/jaydata.mscrm.server.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/jaydata.mscrm.server.min.js > $(MODULE_DIR)/jaydata.mscrm.server.min.js

jaydatavsdoc: jaydata $(CREDITS)
	@@echo "Building JayData vsdoc version..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(VSDOC_SOURCE) $(TEMP_DIR)/jaydata.js > $(TEMP_DIR)/jaydata-vsdoc.js
	@@cat $(CREDITS) $(TEMP_DIR)/jaydata-vsdoc.js > $(TARGET_DIR)/jaydata-vsdoc.js

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

-include ./Pro/Makefile

.PHONY: JayDataMin JayData JayDataStandaloneMin JayDataStandalone All

