var gulp = require('gulp');
var concat = require('gulp-concat');

var typeSystemSrc = ['TypeSystem/initializeJayData.js', 'TypeSystem/Exception.js', 'TypeSystem/utils.js', 'TypeSystem/PreHtml5Compatible.js', 'TypeSystem/TypeSystem.js', 'TypeSystem/Types/Types.js', 'TypeSystem/Trace/Trace.js', 'TypeSystem/Trace/Logger.js', 'TypeSystem/Types/Types.js', 'TypeSystem/Types/SimpleBase.js', 'TypeSystem/Types/Geospatial.js', 'TypeSystem/Types/Geography.js', 'TypeSystem/Types/Geometry.js', 'TypeSystem/Types/Guid.js', 'TypeSystem/Types/Blob.js', 'TypeSystem/Types/EdmTypes.js', 'TypeSystem/Types/Converter.js', 'TypeSystem/Extensions.js'];
var typeSystemClientSrc = ['../Scripts/acorn.js', 'TypeSystem/initializeJayDataClient.js'];
var jayDataSrc = ['build/TypeSystems.all.js', 'Types/Expressions/ExpressionNode2.js', 'Types/Expressions/ArrayLiteralExpression.js', 'Types/Expressions/CallExpression.js', 'Types/Expressions/CodeParser.js', 'Types/Expressions/ConstantExpression.js', 'Types/Expressions/FunctionExpression.js', 'Types/Expressions/ObjectFieldExpression.js', 'Types/Expressions/ObjectLiteralExpression.js', 'Types/Expressions/PagingExpression.js', 'Types/Expressions/ParameterExpression.js', 'Types/Expressions/PropertyExpression.js', 'Types/Expressions/SimpleBinaryExpression.js', 'Types/Expressions/ThisExpression.js', 'Types/Expressions/Visitors/ExpressionVisitor.js', 'Types/Expressions/Visitors/ParameterProcessor.js', 'Types/Expressions/Visitors/GlobalContextProcessor.js', 'Types/Expressions/Visitors/LocalContextProcessor.js', 'Types/Expressions/Visitors/LambdaParameterProcessor.js', 'Types/Expressions/Visitors/ParameterResolverVisitor.js', 'Types/Expressions/Visitors/LogicalSchemaBinderVisitor.js', 'Types/Expressions/Visitors/ExpTreeVisitor.js', 'Types/Expressions/Visitors/SetExecutableVisitor.js', 'Types/Expressions/Visitors/ExecutorVisitor.js', 'Types/Expressions/ExpressionBuilder.js', 'Types/Expressions/EntityExpressions/AssociationInfoExpression.js', 'Types/Expressions/EntityExpressions/CodeExpression.js', 'Types/Expressions/EntityExpressions/CodeToEntityConverter.js', 'Types/Expressions/EntityExpressions/ComplexTypeExpression.js', 'Types/Expressions/EntityExpressions/EntityContextExpression.js', 'Types/Expressions/EntityExpressions/EntityExpression.js', 'Types/Expressions/EntityExpressions/EntityExpressionVisitor.js', 'Types/Expressions/EntityExpressions/ExpressionMonitor.js', 'Types/Expressions/EntityExpressions/EntityFieldExpression.js', 'Types/Expressions/EntityExpressions/EntityFieldOperationExpression.js', 'Types/Expressions/EntityExpressions/EntitySetExpression.js', 'Types/Expressions/EntityExpressions/FrameOperationExpression.js', 'Types/Expressions/EntityExpressions/FilterExpression.js', 'Types/Expressions/EntityExpressions/IncludeExpression.js', 'Types/Expressions/EntityExpressions/MemberInfoExpression.js', 'Types/Expressions/EntityExpressions/OrderExpression.js', 'Types/Expressions/EntityExpressions/ParametricQueryExpression.js', 'Types/Expressions/EntityExpressions/ProjectionExpression.js', 'Types/Expressions/EntityExpressions/QueryExpressionCreator.js', 'Types/Expressions/EntityExpressions/QueryParameterExpression.js', 'Types/Expressions/EntityExpressions/RepresentationExpression.js', 'Types/Expressions/EntityExpressions/ServiceOperationExpression.js', 'Types/Expressions/ContinuationExpressionBuilder.js', 'Types/Validation/EntityValidationBase.js', 'Types/Validation/EntityValidation.js', 'Types/Notifications/ChangeDistributorBase.js', 'Types/Notifications/ChangeCollectorBase.js', 'Types/Notifications/ChangeDistributor.js', 'Types/Notifications/ChangeCollector.js', 'Types/Transaction.js', 'Types/Access.js', 'Types/Promise.js', 'Types/Entity.js', 'Types/EntityContext.js', 'Types/QueryProvider.js', 'Types/ModelBinder.js', 'Types/QueryBuilder.js', 'Types/Query.js', 'Types/Queryable.js', 'Types/EntitySet.js', 'Types/EntityState.js', 'Types/EntityAttachModes.js', 'Types/EntityStateManager.js', 'Types/ItemStore.js', 'Types/StorageProviderLoader.js', 'Types/StorageProviderBase.js', 'Types/ServiceOperation.js', 'Types/EntityWrapper.js', 'Types/Ajax/jQueryAjaxWrapper.js', 'Types/Ajax/WinJSAjaxWrapper.js', 'Types/Ajax/ExtJSAjaxWrapper.js', 'Types/Ajax/AjaxStub.js', 'Types/StorageProviders/modelBinderConfigCompiler.js', 'Types/Authentication/AuthenticationBase.js', 'Types/Authentication/Anonymous.js', 'Types/Authentication/FacebookAuth.js', 'Types/Authentication/BasicAuth.js', 'JaySvcUtil/JaySvcUtil.js', 'JayDataModules/deferred.js', 'Types/JayStorm.js'];


gulp.task('TypeSystems', function () {
    return gulp.src(typeSystemSrc)
                .pipe(concat('TypeSystems.js'))
                .pipe(gulp.dest('build'));
});

gulp.task('TypeSystemsClient', function () {
    return gulp.src(typeSystemClientSrc)
                .pipe(concat('TypeSystemsClient.js'))
                .pipe(gulp.dest('build'));
});

gulp.task('TypeSystemsAll', ['TypeSystems', 'TypeSystemsClient'], function () {
    return gulp.src(['build/TypeSystemsClient.js', 'build/TypeSystems.js'])
                .pipe(concat('TypeSystems.all.js'))
                .pipe(gulp.dest('build'));
});

gulp.task('JayDataAll', ['TypeSystemsAll'], function () {
    return gulp.src(jayDataSrc)
                .pipe(concat('JayData.all.js'))
                .pipe(gulp.dest('build'));
});



