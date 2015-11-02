module.exports = function(config) {
	config.set({
		reporters: ['progress', 'html', 'coverage'],
		htmlReporter: {
			outputDir: 'docs', // where to put the reports
			templatePath: null, // set if you moved jasmine_template.html
			focusOnFailures: true, // reports show failures on start
			namedFiles: false, // name files instead of creating sub-directories
			pageTitle: null, // page title for reports; browser info by default
			urlFriendlyName: false, // simply replaces spaces with _ for files/dirs
			// experimental
			preserveDescribeNesting: false, // folded suites stay folded
			foldAll: false // reports start folded (only with preserveDescribeNesting)
		},
		browsers: ['Chrome'/*, 'Firefox', 'IE'*/],
		browserNoActivityTimeout: 999999,
		frameworks: ['qunit'],
    	plugins: [
			'karma-coverage',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-ie-launcher',
			'karma-html-reporter',
			'karma-istanbul-reporter',
			'karma-qunit'
		],
    	files: [
			'oldEndpoint/Scripts/jquery-1.8.0.js',
			'external/odatajs-4.0.0/odatajs-4.0.0.js',
			'dist/public/jaydata.js',
			'dist/public/jaydataproviders/YQLProvider.js',
			'dist/public/jaydataproviders/oDataProvider.js',
			'dist/public/jaydataproviders/SqLiteProvider.js',
			'dist/public/jaydataproviders/InMemoryProvider.js',
			'dist/public/jaydataproviders/IndexedDbProvider.js',
			'test/compatiblity.js',
			'test/qunit/NewsReaderContext.js',
			'test/qunit/scripts/converterTests.js',
			'test/qunit/scripts/inMemoryProviderTests.js',
			'test/qunit/scripts/typeSystemTests.js',
			'test/qunit/scripts/EntityContextTests.js',
			'test/qunit/scripts/indexedDbProviderTest.js',
			'test/qunit/scripts/sqLiteProviderTests.js',
			'test/qunit/scripts/sqLiteCompilerTests.js',
			'test/qunit/scripts/sqLiteCRUDTests.js'
    	],
		preprocessors: {
			'dist/public/jaydata.js': ['coverage']
	    },
		coverageReporter: {
	    	type : 'html',
	      	dir : 'coverage/'
	  	}
	});
};
