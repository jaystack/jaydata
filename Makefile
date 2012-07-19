VERSION = '0.0.0'
TARGET_DIR = ./build
TEMP_DIR = $(TARGET_DIR)/tmp
MODULE_DIR = $(TARGET_DIR)/modules
PROVIDERS_DIR = $(TARGET_DIR)/providers
NPM_DIR = $(TARGET_DIR)/npm
NPM_BASE_DIR = ./npm
TYPESYSTEM_DIR = ./TypeSystem
TYPES_DIR = ./Types
COMPILER = ./Tools/compiler.jar
GPL_LIC = ./GPL-LICENSE.txt
MIT_LIC = ./MIT-LICENSE.txt
CREDITS_BASE = ./CREDITS.txt
CREDITS = $(TEMP_DIR)/CREDITS.txt

TYPE_SYSTEM_CLIENT = $(TYPESYSTEM_DIR)/initializeJayDataClient.js\

TYPE_SYSTEM = $(TYPESYSTEM_DIR)/initializeJayData.js\
	$(TYPESYSTEM_DIR)/utils.js\
	$(TYPESYSTEM_DIR)/PreHtml5Compatible.js\
	$(TYPESYSTEM_DIR)/JayLint.js\
	$(TYPESYSTEM_DIR)/TypeSystem.js\

VSDOC_SOURCE = $(TYPESYSTEM_DIR)/VS2010Intellisense.js\

JAYDATA_SOURCE = $(TYPES_DIR)/Expressions/ASTParser.js\
	$(TYPES_DIR)/Expressions/ExpressionNode2.js\
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
	$(TYPES_DIR)/Validation/EntityValidationBase.js\
	$(TYPES_DIR)/Validation/EntityValidation.js\
	$(TYPES_DIR)/Notifications/ChangeDistributorBase.js\
	$(TYPES_DIR)/Notifications/ChangeCollectorBase.js\
	$(TYPES_DIR)/Notifications/ChangeDistributor.js\
	$(TYPES_DIR)/Notifications/ChangeCollector.js\
	$(TYPES_DIR)/Access.js\
	$(TYPES_DIR)/Promise.js\
	$(TYPES_DIR)/Entity.js\
	$(TYPES_DIR)/EntityContext.js\
	$(TYPES_DIR)/QueryProvider.js\
	$(TYPES_DIR)/ModelBinder.js\
	$(TYPES_DIR)/Query.js\
	$(TYPES_DIR)/Queryable.js\
	$(TYPES_DIR)/EntitySet.js\
	$(TYPES_DIR)/EntityState.js\
	$(TYPES_DIR)/EntityStateManager.js\
	$(TYPES_DIR)/Exception.js\
	$(TYPES_DIR)/ServiceOperation.js\
	$(TYPES_DIR)/StorageProviderBase.js\
	$(TYPES_DIR)/EntityWrapper.js\
	$(TYPES_DIR)/Ajax/jQueryAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/WinJSAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/ExtJSAjaxWrapper.js\
	$(TYPES_DIR)/Ajax/AjaxStub.js\
	$(TYPES_DIR)/DbClient/DbCommand.js\
	$(TYPES_DIR)/DbClient/DbConnection.js\
	$(TYPES_DIR)/DbClient/OpenDatabaseClient/OpenDbCommand.js\
	$(TYPES_DIR)/DbClient/OpenDatabaseClient/OpenDbConnection.js\
	$(TYPES_DIR)/DbClient/JayStorageClient/JayStorageCommand.js\
	$(TYPES_DIR)/DbClient/JayStorageClient/JayStorageConnection.js\
	$(TYPES_DIR)/DbClient/SqLiteNjClient/SqLiteNjCommand.js\
	$(TYPES_DIR)/DbClient/SqLiteNjClient/SqLiteNjConnection.js\
	$(TYPES_DIR)/StorageProviders/modelBinderConfigCompiler.js\
	$(TYPES_DIR)/Authentication/AuthenticationBase.js\
	$(TYPES_DIR)/Authentication/Anonymous.js\
	$(TYPES_DIR)/Authentication/FacebookAuth.js\
	$(TYPES_DIR)/Authentication/BasicAuth.js\

IndexDbProvider = $(TYPES_DIR)/StorageProviders/IndexedDB/IndexedDBStorageProvider.js\

SqLiteProvider = $(TYPES_DIR)/StorageProviders/SqLite/SqLiteStorageProvider.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqLiteCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlPagingCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlOrderCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlProjectionCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/ExpressionMonitor.js\
	$(TYPES_DIR)/StorageProviders/SqLite/SqlFilterCompiler.js\
	$(TYPES_DIR)/StorageProviders/SqLite/ModelBinder/sqLite_ModelBinderCompiler.js\

oDataProvider = $(TYPES_DIR)/StorageProviders/oData/oDataProvider.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataWhereCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataOrderCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataPagingCompiler.js\
	$(TYPES_DIR)/StorageProviders/oData/oDataProjectionCompiler.js\

FacebookProvider = $(TYPES_DIR)/StorageProviders/Facebook/FacebookProvider.js\
	$(TYPES_DIR)/StorageProviders/Facebook/FacebookCompiler.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQL/user.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQL/friend.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQL/page.js\
	$(TYPES_DIR)/StorageProviders/Facebook/EntitySets/FQLContext.js\

YQLProvider = $(TYPES_DIR)/StorageProviders/YQL/YQLProvider.js\
	$(TYPES_DIR)/StorageProviders/YQL/YQLCompiler.js\
	$(TYPES_DIR)/StorageProviders/YQL/EntitySets/geo.js\
	$(TYPES_DIR)/StorageProviders/YQL/EntitySets/YQLContext.js\

InMemoryProvider = $(TYPES_DIR)/StorageProviders/InMemory/InMemoryProvider.js\
	$(TYPES_DIR)/StorageProviders/InMemory/InMemoryCompiler.js\
	$(TYPES_DIR)/StorageProviders/InMemory/InMemoryFunctionCompiler.js\

MongoDbProvider = $(TYPES_DIR)/StorageProviders/mongoDB/mongoDBStorageProvider.js\

StormProvider = $(TYPES_DIR)/StorageProviders/Storm/StormStorageProvider.js\

clean: 
	@@test ! -d $(TARGET_DIR) || rm -r $(TARGET_DIR)

all: jaydatavsdoc jaydatamin jaydata providers npms
	@@test -d $(MODULE_DIR) || mkdir -p $(MODULE_DIR) && cp ./JayDataModules/* $(MODULE_DIR)
	@@rm -r $(TEMP_DIR)

npms: npmjaydata npmindexdb npmsqlite npmodata npminmemory npmmongodb npmstorm

npmjaydata: $(TYPE_SYSTEM) $(JAYDATA_SOURCE) $(CREDITS)
	@@echo "Building jaydata npm package..."
	@@test -d $(NPM_DIR)/jaydata || mkdir -p $(NPM_DIR)/jaydata
	@@cp -r $(NPM_BASE_DIR)/jaydata/* $(NPM_DIR)/jaydata
	@@cp -xr $(TYPESYSTEM_DIR) $(NPM_DIR)/jaydata/lib
	@@cp -xr $(TYPES_DIR) $(NPM_DIR)/jaydata/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/jaydata
	@@cp -r $(MIT_LIC) $(NPM_DIR)/jaydata
	@@cp -r $(CREDITS) $(NPM_DIR)/jaydata
	@$(foreach dir,$(TYPE_SYSTEM),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/index.js;)
	@$(foreach dir,$(JAYDATA_SOURCE),echo "require('"$(dir)"');" >> $(NPM_DIR)/jaydata/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/jaydata/lib/index.js
	@@sed -e 's/jaydata@[0-9].[0-9].[0-9]/jaydata@$(VERSION)/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/' $(NPM_BASE_DIR)/jaydata/package.json > $(NPM_DIR)/jaydata/package.json

npmindexdb: $(IndexDbProvider)
	@@echo "Building IndexDb provider npm package..."
	@@test -d $(NPM_DIR)/indexdb || mkdir -p $(NPM_DIR)/indexdb
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/indexdb
	@@cp -xr $(IndexDbProvider) $(NPM_DIR)/indexdb/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/indexdb
	@@cp -r $(MIT_LIC) $(NPM_DIR)/indexdb
	@@cp -r $(CREDITS) $(NPM_DIR)/indexdb
	@$(foreach dir,$(IndexDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/indexdb/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/indexdb/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-indexdb"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata": "[0-9].[0-9].[0-9]"/"jaydata":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/indexdb/package.json

npmsqlite: $(SqLiteProvider)
	@@echo "Building SqLiteProvider provider npm package..."
	@@test -d $(NPM_DIR)/sqlite || mkdir -p $(NPM_DIR)/sqlite
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/sqlite
	@@cp -xr $(SqLiteProvider) $(NPM_DIR)/sqlite/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/sqlite
	@@cp -r $(MIT_LIC) $(NPM_DIR)/sqlite
	@@cp -r $(CREDITS) $(NPM_DIR)/sqlite
	@$(foreach dir,$(SqLiteProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/sqlite/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/sqlite/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-sqlite"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata": "[0-9].[0-9].[0-9]"/"jaydata":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/sqlite/package.json

npmodata: $(oDataProvider)
	@@echo "Building oDataProvider provider npm package..."
	@@test -d $(NPM_DIR)/odata || mkdir -p $(NPM_DIR)/odata
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/odata
	@@cp -xr $(oDataProvider) $(NPM_DIR)/odata/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/odata
	@@cp -r $(MIT_LIC) $(NPM_DIR)/odata
	@@cp -r $(CREDITS) $(NPM_DIR)/odata
	@$(foreach dir,$(oDataProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/odata/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/odata/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-odata"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata": "[0-9].[0-9].[0-9]"/"jaydata":"$(VERSION)","datajs": "1.0.3"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/odata/package.json

npminmemory: $(InMemoryProvider)
	@@echo "Building InMemoryProvider provider npm package..."
	@@test -d $(NPM_DIR)/inmemory || mkdir -p $(NPM_DIR)/inmemory
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/inmemory
	@@cp -xr $(InMemoryProvider) $(NPM_DIR)/inmemory/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/inmemory
	@@cp -r $(MIT_LIC) $(NPM_DIR)/inmemory
	@@cp -r $(CREDITS) $(NPM_DIR)/inmemory
	@$(foreach dir,$(InMemoryProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/inmemory/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/inmemory/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-inmemory"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata": "[0-9].[0-9].[0-9]"/"jaydata":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/inmemory/package.json

npmmongodb: $(MongoDbProvider)
	@@echo "Building MongoDbProvider provider npm package..."
	@@test -d $(NPM_DIR)/mongodb || mkdir -p $(NPM_DIR)/mongodb
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/mongodb
	@@cp -xr $(MongoDbProvider) $(NPM_DIR)/mongodb/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/mongodb
	@@cp -r $(MIT_LIC) $(NPM_DIR)/mongodb
	@@cp -r $(CREDITS) $(NPM_DIR)/mongodb
	@$(foreach dir,$(MongoDbProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/mongodb/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/mongodb/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-mongodb"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata": "[0-9].[0-9].[0-9]"/"jaydata":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/mongodb/package.json

npmstorm: $(StormProvider)
	@@echo "Building StormProvider provider npm package..."
	@@test -d $(NPM_DIR)/storm || mkdir -p $(NPM_DIR)/storm
	@@cp -r $(NPM_BASE_DIR)/provider/* $(NPM_DIR)/storm
	@@cp -xr $(StormProvider) $(NPM_DIR)/storm/lib
	@@cp -r $(GPL_LIC) $(NPM_DIR)/storm
	@@cp -r $(MIT_LIC) $(NPM_DIR)/storm
	@@cp -r $(CREDITS) $(NPM_DIR)/storm
	@$(foreach dir,$(StormProvider),echo "require('"$(dir)"');" >> $(NPM_DIR)/storm/lib/index.js;)
	@@echo 'module.exports = $$data;' >> $(NPM_DIR)/storm/lib/index.js
	@@sed -e 's/"name": "jaydata"/"name": "jaydata-storm"/;s/"version": "[0-9].[0-9].[0-9]"/"version": "$(VERSION)"/;s/"jaydata": "[0-9].[0-9].[0-9]"/"jaydata":"$(VERSION)"/' $(NPM_BASE_DIR)/provider/package.json > $(NPM_DIR)/storm/package.json

providers: indexdbprovider sqliteprovider odataprovider facebookprovider yqlprovider inmemoryprovider mongodbprovider stormprovider

indexdbprovider: $(IndexDbProvider) $(CREDITS)
	@@echo "Building IndexDbProvider provider..."
	@@test -d $(PROVIDERS_DIR) || mkdir -p $(PROVIDERS_DIR)
	@@cat $(CREDITS) $(IndexDbProvider) > $(PROVIDERS_DIR)/IndexDbProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR)/IndexDbProvider.js --js_output_file $(TEMP_DIR)/IndexDbProvider.min.js
	@@cat $(CREDITS) $(TEMP_DIR)/IndexDbProvider.min.js > $(PROVIDERS_DIR)/IndexDbProvider.min.js

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

.PHONY: JayDataMin JayData JayDataStandaloneMin JayDataStandalone All

