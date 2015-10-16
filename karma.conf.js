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
			'oldEndpoint/Scripts/jquery-1.9.0.min.js',
			'dist/JayData.js',
			'test/qunit/scripts/converterTests.js',
			'test/qunit/scripts/typeSystemTests.js'
    	],
		preprocessors: {
			'dist/JayData.js': ['coverage']
	    },
		coverageReporter: {
	    	type : 'html',
	      	dir : 'coverage/'
	  	}
	});
};
