	/*var $data = require('jaydata/core');
	$data.version = 'JayData <%=pkg.version %>';
	$data.versionNumber = '<%=pkg.version %>';*/

	if (typeof exports === "object" && typeof module !== "undefined") {
		module.exports = require('<%=module.require[1].expose %>')
	} else if (typeof define === "function" && define.amd) {
		var interopRequire = require;
		define([], function(){
			return interopRequire('<%=module.require[1].expose %>');
		});

		define('<%=module.require[1].expose %>', [], function(){
			return interopRequire('<%=module.require[1].expose %>');
		});
	} else {
		var g;
		if (typeof window !== "undefined") {
			window.require = require;
			g = window
		} else if (typeof global !== "undefined") {
			g = global
		} else if (typeof self !== "undefined") {
			g = self
		} else {
			g = this
		}
		g.$data = require('<%=module.require[1].expose %>');
	}
})();
