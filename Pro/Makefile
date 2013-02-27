TYPES_DIR_PRO = ./Pro/Types
TYPESYSTEM_DIR_PRO = ./Pro/TypeSystem
TARGET_DIR_PRO = $(TARGET_DIR)/pro
MODULE_DIR_PRO = $(TARGET_DIR_PRO)/jaydatamodules
PRO_DIR = pro
PROVIDERS_DIR_PRO = $(TARGET_DIR)/$(PRO_DIR)/jaydataproviders
PROPROVIDERS_DIR_COM = $(TARGET_DIR)/$(PRO_DIR)/pro_providers
PROPROVIDERS_DIR_TRIAL = $(TARGET_DIR)/pro_providers

CREDITS_BASE_COMMERCIAL = ./Pro/CREDITS.txt
CREDITS_COMMERCIAL = $(TEMP_DIR)/CREDITS_COMMERCIAL.txt
CREDITS_BASE_TRIAL = ./Pro/CREDITS_TRIAL.txt
CREDITS_TRIAL = $(TEMP_DIR)/CREDITS_TRIAL.txt
CREDITS_BASE_PRO = ./Pro/CREDITS_PRO.txt
CREDITS_PRO = $(TEMP_DIR)/CREDITS_PRO.txt

TYPE_SYSTEM_PRO = $(TYPESYSTEM_DIR_PRO)/initializeJayDataPro.js\

IndexedDbProProvider = $(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBStorageProvider.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDbExpressionExecutor.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBCompiler.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBPhysicalAndFilterExpression.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBLogicalAndFilterExpression.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBLogicalOrFilterExpression.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBLogicalInFilterExpression.js\
	$(TYPES_DIR_PRO)/StorageProviders/IndexedDB/IndexedDBTransaction.js\

SqLiteProProvider = $(TYPES_DIR_PRO)/StorageProviders/SqLite/SqLiteStorageProvider.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqLiteCompiler.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqlPagingCompiler.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqlOrderCompiler.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqlProjectionCompiler.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqlExpressionMonitor.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqlFilterCompiler.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/SqlTransaction.js\
	$(TYPES_DIR_PRO)/StorageProviders/SqLite/ModelBinder/sqLite_ModelBinderCompiler.js\



pro: makeprodirs proproviders
	@@rm -r $(TEMP_DIR)

commercial: makeprodirs jaydatacommercialvsdoc jaydatacommercialmin jaydatacommercial providers_cls jaydatamodules_pro
	@@rm -r $(TEMP_DIR)

full: all commercial pro

makeprodirs: 
	@@test -d $(TARGET_DIR_PRO) || mkdir -p $(TARGET_DIR_PRO)

proproviders: indexeddbproprovider sqliteproprovider

indexeddbproprovider: $(IndexedDbProProvider) $(CREDITS_PRO) $(CREDITS_TRIAL)
	@@echo "Building IndexedDbProvider - Pro provider..."
	@@test -d $(PROPROVIDERS_DIR_COM) || mkdir -p $(PROPROVIDERS_DIR_COM)
	@@test -d $(PROPROVIDERS_DIR_TRIAL) || mkdir -p $(PROPROVIDERS_DIR_TRIAL)
	@@cat $(CREDITS_PRO) $(IndexedDbProProvider) > $(PROPROVIDERS_DIR_COM)/IndexedDbProProvider.js
	@@java -jar $(COMPILER) --js $(PROPROVIDERS_DIR_COM)/IndexedDbProProvider.js --js_output_file $(TEMP_DIR)/IndexedDbProProvider.min.js
	@@cat $(CREDITS_PRO) $(TEMP_DIR)/IndexedDbProProvider.min.js > $(PROPROVIDERS_DIR_COM)/IndexedDbProProvider.min.js
	@@cat $(CREDITS_TRIAL) $(TEMP_DIR)/IndexedDbProProvider.min.js > $(PROPROVIDERS_DIR_TRIAL)/IndexedDbProProvider.min.js

sqliteproprovider: $(SqLiteProProvider) $(CREDITS_PRO) $(CREDITS_TRIAL)
	@@echo "Building SqLiteProvider - Pro provider..."
	@@test -d $(PROPROVIDERS_DIR_COM) || mkdir -p $(PROPROVIDERS_DIR_COM)
	@@test -d $(PROPROVIDERS_DIR_TRIAL) || mkdir -p $(PROPROVIDERS_DIR_TRIAL)
	@@cat $(CREDITS_PRO) $(SqLiteProProvider) > $(PROPROVIDERS_DIR_COM)/SqLiteProProvider.js
	@@java -jar $(COMPILER) --js $(PROPROVIDERS_DIR_COM)/SqLiteProProvider.js --js_output_file $(TEMP_DIR)/SqLiteProProvider.min.js
	@@cat $(CREDITS_PRO) $(TEMP_DIR)/SqLiteProProvider.min.js > $(PROPROVIDERS_DIR_COM)/SqLiteProProvider.min.js
	@@cat $(CREDITS_TRIAL) $(TEMP_DIR)/SqLiteProProvider.min.js > $(PROPROVIDERS_DIR_TRIAL)/SqLiteProProvider.min.js

providers_cls: indexeddbprovider_cls sqliteprovider_cls odataprovider_cls facebookprovider_cls yqlprovider_cls inmemoryprovider_cls mongodbprovider_cls stormprovider_cls webapiprovider_cls

indexeddbprovider_cls: $(IndexedDbProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial IndexedDbProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(IndexedDbProvider) > $(PROVIDERS_DIR_PRO)/IndexedDbProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/IndexedDbProvider.js --js_output_file $(TEMP_DIR)/IndexedDbProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/IndexedDbProvider.min.js > $(PROVIDERS_DIR_PRO)/IndexedDbProvider.min.js

sqliteprovider_cls: $(SqLiteProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial SqLiteProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(SqLiteProvider) > $(PROVIDERS_DIR_PRO)/SqLiteProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/SqLiteProvider.js --js_output_file $(TEMP_DIR)/SqLiteProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/SqLiteProvider.min.js > $(PROVIDERS_DIR_PRO)/SqLiteProvider.min.js

odataprovider_cls: $(oDataProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial oDataProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(oDataProvider) > $(PROVIDERS_DIR_PRO)/oDataProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/oDataProvider.js --js_output_file $(TEMP_DIR)/oDataProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/oDataProvider.min.js > $(PROVIDERS_DIR_PRO)/oDataProvider.min.js

webapiprovider_cls: $(WebApiProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial WebApiProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(WebApiProvider) > $(PROVIDERS_DIR_PRO)/WebApiProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/WebApiProvider.js --js_output_file $(TEMP_DIR)/WebApiProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/WebApiProvider.min.js > $(PROVIDERS_DIR_PRO)/WebApiProvider.min.js

facebookprovider_cls: $(FacebookProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial FacebookProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(FacebookProvider) > $(PROVIDERS_DIR_PRO)/FacebookProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/FacebookProvider.js --js_output_file $(TEMP_DIR)/FacebookProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/FacebookProvider.min.js > $(PROVIDERS_DIR_PRO)/FacebookProvider.min.js

yqlprovider_cls: $(YQLProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial YQLProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(YQLProvider) > $(PROVIDERS_DIR_PRO)/YQLProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/YQLProvider.js --js_output_file $(TEMP_DIR)/YQLProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/YQLProvider.min.js > $(PROVIDERS_DIR_PRO)/YQLProvider.min.js

inmemoryprovider_cls: $(InMemoryProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial InMemoryProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(InMemoryProvider) > $(PROVIDERS_DIR_PRO)/InMemoryProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/InMemoryProvider.js --js_output_file $(TEMP_DIR)/InMemoryProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/InMemoryProvider.min.js > $(PROVIDERS_DIR_PRO)/InMemoryProvider.min.js

mongodbprovider_cls: $(MongoDbProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial MongoDbProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(MongoDbProvider) > $(PROVIDERS_DIR_PRO)/MongoDbProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/MongoDbProvider.js --js_output_file $(TEMP_DIR)/MongoDbProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/MongoDbProvider.min.js > $(PROVIDERS_DIR_PRO)/MongoDbProvider.min.js

stormprovider_cls: $(StormProvider) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial StormProvider provider..."
	@@test -d $(PROVIDERS_DIR_PRO) || mkdir -p $(PROVIDERS_DIR_PRO)
	@@cat $(StormProvider) > $(PROVIDERS_DIR_PRO)/StormProvider.js
	@@java -jar $(COMPILER) --js $(PROVIDERS_DIR_PRO)/StormProvider.js --js_output_file $(TEMP_DIR)/StormProvider.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/StormProvider.min.js > $(PROVIDERS_DIR_PRO)/StormProvider.min.js



jaydatamodules_pro: deferredmodule_pro errorhandlermodule_pro formbindermodule_pro handlebarsmodule_pro inmemorymodule_pro kendomodule_pro knockoutmodule_pro qdeferredmodule_pro senchamodule_pro templatemodule_pro validatemodule_pro

deferredmodule_pro: $(DeferredModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Deferred module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(DeferredModule) > $(MODULE_DIR_PRO)/deferred.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/deferred.js --js_output_file $(TEMP_DIR)/deferred.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/deferred.min.js > $(MODULE_DIR_PRO)/deferred.min.js

errorhandlermodule_pro: $(ErrorHandlerModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial ErrorHandler module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(ErrorHandlerModule) > $(MODULE_DIR_PRO)/errorhandler.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/errorhandler.js --js_output_file $(TEMP_DIR)/errorhandler.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/errorhandler.min.js > $(MODULE_DIR_PRO)/errorhandler.min.js

formbindermodule_pro: $(FormBinderModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial FormBinder module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(FormBinderModule) > $(MODULE_DIR_PRO)/formBinder.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/formBinder.js --js_output_file $(TEMP_DIR)/formBinder.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/formBinder.min.js > $(MODULE_DIR_PRO)/formBinder.min.js

handlebarsmodule_pro: $(HandlebarsModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Handlebars module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(HandlebarsModule) > $(MODULE_DIR_PRO)/handlebars.js
	#@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/handlebars.js --js_output_file $(TEMP_DIR)/handlebars.min.js
	#@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/handlebars.min.js > $(MODULE_DIR_PRO)/handlebars.min.js

inmemorymodule_pro: $(InMemoryModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial InMemory module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(InMemoryModule) > $(MODULE_DIR_PRO)/inMemory.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/inMemory.js --js_output_file $(TEMP_DIR)/inMemory.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/inMemory.min.js > $(MODULE_DIR_PRO)/inMemory.min.js

kendomodule_pro: $(KendoModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Kendo module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(KendoModule) > $(MODULE_DIR_PRO)/kendo.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/kendo.js --js_output_file $(TEMP_DIR)/kendo.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/kendo.min.js > $(MODULE_DIR_PRO)/kendo.min.js

knockoutmodule_pro: $(KnockoutModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Knockout module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(KnockoutModule) > $(MODULE_DIR_PRO)/knockout.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/knockout.js --js_output_file $(TEMP_DIR)/knockout.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/knockout.min.js > $(MODULE_DIR_PRO)/knockout.min.js

qdeferredmodule_pro: $(QDeferredModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial QDeferred module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(QDeferredModule) > $(MODULE_DIR_PRO)/qDeferred.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/qDeferred.js --js_output_file $(TEMP_DIR)/qDeferred.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/qDeferred.min.js > $(MODULE_DIR_PRO)/qDeferred.min.js

senchamodule_pro: $(SenchaModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Sencha module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(SenchaModule) > $(MODULE_DIR_PRO)/sencha.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/sencha.js --js_output_file $(TEMP_DIR)/sencha.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/sencha.min.js > $(MODULE_DIR_PRO)/sencha.min.js

templatemodule_pro: $(TemplateModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Template module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(TemplateModule) > $(MODULE_DIR_PRO)/template.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/template.js --js_output_file $(TEMP_DIR)/template.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/template.min.js > $(MODULE_DIR_PRO)/template.min.js

validatemodule_pro: $(ValidateModule) $(CREDITS_COMMERCIAL)
	@@echo "Building Commercial Validate module..."
	@@test -d $(MODULE_DIR_PRO) || mkdir -p $(MODULE_DIR_PRO)
	@@cat $(CREDITS_COMMERCIAL) $(ValidateModule) > $(MODULE_DIR_PRO)/Validate.js
	@@java -jar $(COMPILER) --js $(MODULE_DIR_PRO)/Validate.js --js_output_file $(TEMP_DIR)/Validate.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/Validate.min.js > $(MODULE_DIR_PRO)/Validate.min.js


jaydatacommercialvsdoc: jaydatacommercial $(CREDITS_COMMERCIAL)
	@@echo "Building JayData - Commercial vsdoc version..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(VSDOC_SOURCE) $(TEMP_DIR)/jaydata.js > $(TEMP_DIR)/jaydata-vsdoc.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/jaydata-vsdoc.js > $(TARGET_DIR_PRO)/jaydata-vsdoc.js

jaydatacommercialmin: jaydatacommercial $(CREDITS_COMMERCIAL)
	@@echo "Minifying JayData - Commercial library..."
	@@test -d $(TARGET_DIR_PRO) || mkdir -p $(TARGET_DIR_PRO)
	@@java -jar $(COMPILER) --js $(TARGET_DIR_PRO)/jaydata.js --js_output_file $(TEMP_DIR)/jaydata.min.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/jaydata.min.js > $(TARGET_DIR_PRO)/jaydata.min.js

jaydatacommercial: $(TEMP_DIR)/CommercialTypeSystems.js $(CREDITS_COMMERCIAL)
	@@echo "Building JayData - Commercial library..."
	@@test -d $(TARGET_DIR_PRO) || mkdir -p $(TARGET_DIR_PRO)
	@@cat $(TEMP_DIR)/CommercialTypeSystems.js $(TYPE_SYSTEM_PRO) $(JAYDATA_SOURCE) > $(TEMP_DIR)/jaydata.js
	@@cat $(CREDITS_COMMERCIAL) $(TEMP_DIR)/jaydata.js > $(TARGET_DIR_PRO)/jaydata.js

$(TEMP_DIR)/CommercialTypeSystems.js : $(TYPE_SYSTEM) $(TYPE_SYSTEM_PRO) $(TYPE_SYSTEM_CLIENT)
	@@echo "Building JayData - Commercial type system..."
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@cat $(TYPE_SYSTEM_CLIENT) $(TYPE_SYSTEM_PRO) $(TYPE_SYSTEM) | \
	sed -e 's/$data.version = "JayData [0-9].[0-9].[0-9]"/$data.version = "JayData $(VERSION)"/;s/$data.versionNumber = "[0-9].[0-9].[0-9]"/$data.versionNumber = "$(VERSION)"/' > $(TEMP_DIR)/CommercialTypeSystems.js


$(CREDITS_COMMERCIAL): $(CREDITS_BASE_COMMERCIAL)
	@@echo "Create CREDITS_COMMERCIAL.txt file"
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@sed -e 's/JayData [0-9].[0-9].[0-9]/JayData $(VERSION)/' $(CREDITS_BASE_COMMERCIAL) > $(CREDITS_COMMERCIAL)

$(CREDITS_PRO): $(CREDITS_BASE_PRO)
	@@echo "Create CREDITS_PRO.txt file"
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@sed -e 's/JayData [0-9].[0-9].[0-9]/JayData $(VERSION)/' $(CREDITS_BASE_PRO) > $(CREDITS_PRO)

$(CREDITS_TRIAL): $(CREDITS_BASE_TRIAL)
	@@echo "Create CREDITS_TRIAL.txt file"
	@@test -d $(TEMP_DIR) || mkdir -p $(TEMP_DIR)
	@@sed -e 's/JayData [0-9].[0-9].[0-9]/JayData $(VERSION)/' $(CREDITS_BASE_TRIAL) > $(CREDITS_TRIAL)

