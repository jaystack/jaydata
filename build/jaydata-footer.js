	/*var $data = require('jaydata/core');
	$data.version = 'JayData <%=pkg.version %>';
	$data.versionNumber = '<%=pkg.version %>';*/

	if (typeof window !== "undefined"){
		window.require = require;
	}

	if (typeof exports === "object" && typeof module !== "undefined") {
		module.exports = require('jaydata/core')
	} else if (typeof define === "function" && define.amd) {
		var interopRequire = require;
		define([], function(){
			return interopRequire('jaydata/core');
		});

		define('jaydata/core', [], function(){
			return interopRequire('jaydata/core');
		});
	} else {
		var g;
		if (typeof window !== "undefined") {
			g = window
		} else if (typeof global !== "undefined") {
			g = global
		} else if (typeof self !== "undefined") {
			g = self
		} else {
			g = this
		}
		g.$data = require('jaydata/core');
	}
})();
