// JayData 1.1.1
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki
//
// More info: http://jaydata.org
(function (global) {
    if (typeof window === "undefined") {
        window = this;
    }
    $data = window["$data"] || (window["$data"] = {});
})(this);

if (typeof console === 'undefined') {
    console = {
        warn: function () { },
        error: function () { },
        log: function () { },
        dir: function () { },
        time: function () { },
        timeEnd: function () { }
    };
}

if (!console.warn) console.warn = function () { };
if (!console.error) console.error = function () { };

(function ($data) {
    ///<summary>
    /// Collection of JayData services
    ///</summary>
    $data.__namespace = true;
    $data.version = "JayData 1.1.1";
    $data.versionNumber = "1.1.1";
    $data.root = {};

})($data);

// Do not remove this block, it is used by jsdoc 
/**
    @name $data.Base
    @class base class
*/
Guard = {};
Guard.requireValue = function (name, value) {
    if (typeof value === 'undefined' || value === null) {
        Guard.raise(name + " requires a value other than undefined or null");
    }
};

Guard.requireType = function (name, value, typeOrTypes) {
    var types = typeOrTypes instanceof Array ? typeOrTypes : [typeOrTypes];
    return types.some(function (item) {
        switch (typeof item) {
            case "string":
                return typeof value === item;
            case "function":
                return value instanceof item;
            default:
                Guard.raise("Unknown type format : " + typeof item + " for: "+ name);
        }
    });
};

Guard.raise = function(exception){
	if (typeof intellisense === 'undefined') {
		if (exception instanceof Exception){
			console.error(exception.name + ':', exception.message + '\n', exception);
		}else{
			console.error(exception);
		}
		throw exception;
	}
};

Object.isNullOrUndefined = function (value) {
    return value === undefined || value === null;
};
(function ObjectMethodsForPreHTML5Browsers() {

	if (!Object.getOwnPropertyNames){
		Object.getOwnPropertyNames = function(o){
			var names = [];

			for (var i in o){
				if (o.hasOwnProperty(i)) names.push(i);
			}

			return names;
		};
	}

    if (!Object.create) {
        Object.create = function (o) {
            if (arguments.length > 1) {
                Guard.raise(new Error('Object.create implementation only accepts the first parameter.'));
            }
            function F() { }
            F.prototype = o;
            return new F();
        };
    }

    if (!Object.keys) {
        var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = ['toString',
                    'toLocaleString',
                    'valueOf',
                    'hasOwnProperty',
                    'isPrototypeOf',
                    'propertyIsEnumerable',
                    'constructor'],
        dontEnumsLength = dontEnums.length;

        Object.keys = function (obj) {

            ///Refactor to Assert.IsObjectOrFunction
            if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) Guard.raise(new TypeError('Object.keys called on non-object'));

            var result = [];

            for (var prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (var i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }

            return result;
        };
    }

    if (!Object.defineProperty) {
        Object.defineProperty = function (obj, propName, propDef) {
            obj[propName] = propDef.value || {};
        };
    }

    if (!Object.defineProperties) {
        Object.defineProperties = function (obj, defines) {
            for (var i in defines) {
                if(defines.hasOwnProperty(i))
                    obj[i] = defines[i].value || {};
            }
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (handler, thisArg) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (thisArg) { handler.call(thisArg, this[i], i, this); }
                else { handler(this[i], i, this); };
            };
        };
    };

    if (!Array.prototype.filter) {
        Array.prototype.filter = function (handler, thisArg) {
            var result = [];
            for (var i = 0, l = this.length; i < l; i++) {
                var r = thisArg ?
                    handler.call(thisArg, this[i], i, this) :
                    handler(this[i], i, this);
                if (r === true) {
                    result.push(this[i]);
                }
            }
            return result;
        };
    }

    if (!Array.prototype.map) {
        Array.prototype.map = function (handler, thisArg) {
            var result = [];
            for (var i = 0, l = this.length; i < l; i++) {
                var r = thisArg ?
                    handler.call(thisArg, this[i], i, this) :
                    handler(this[i], i, this);
                result.push(r);
            }
            return result;
        };
    }

    if (!Array.prototype.some) {
        Array.prototype.some = function (handler, thisArg) {
            for (var i = 0, l = this.length; i < l; i++) {
                var r = thisArg ?
                    handler.call(thisArg, this[i], i, this) :
                    handler(this[i], i, this);
                if (r) { return true; }

            }
            return false;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (item, from) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] === item) {
                    return i;
                };
            };
            return -1;
        };
    }



})();// This file is derived from jslint.js
// 2011-06-12

// Copyright (c) 2002 Douglas Crockford  (www.JSLint.com)

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// The Software shall be used for Good, not Evil.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// WARNING: JSLint will hurt your feelings.

// JSLINT is a global function. It takes two parameters.

//     var myResult = JSLINT(source, option);

// The first parameter is either a string or an array of strings. If it is a
// string, it will be split on '\n' or '\r'. If it is an array of strings, it
// is assumed that each string represents one line. The source can be a
// JavaScript text, or HTML text, or a JSON text, or a CSS text.

// The second parameter is an optional object of options that control the
// operation of JSLINT. Most of the options are booleans: They are all
// optional and have a default value of false. One of the options, predef,
// can be an array of names, which will be used to declare global variables,
// or an object whose keys are used as global names, with a boolean value
// that determines if they are assignable.

// If it checks out, JSLINT returns true. Otherwise, it returns false.

// If false, you can inspect JSLINT.errors to find out the problems.
// JSLINT.errors is an array of objects containing these properties:

//  {
//      line      : The line (relative to 0) at which the lint was found
//      character : The character (relative to 0) at which the lint was found
//      reason    : The problem
//      evidence  : The text line in which the problem occurred
//      raw       : The raw message before the details were inserted
//      a         : The first detail
//      b         : The second detail
//      c         : The third detail
//      d         : The fourth detail
//  }

// If a stopping error was found, a null will be the last element of the
// JSLINT.errors array. A stopping error means that JSLint was not confident
// enough to continue. It does not necessarily mean that the error was
// especially heinous.

// You can request a Function Report, which shows all of the functions
// and the parameters and vars that they use. This can be used to find
// implied global variables and other problems. The report is in HTML and
// can be inserted in an HTML <body>.

//     var myReport = JSLINT.report(errors_only);

// If errors_only is true, then the report will be limited to only errors.

// You can request a data structure that contains JSLint's results.

//     var myData = JSLINT.data();

// It returns a structure with this form:

//     {
//         errors: [
//             {
//                 line: NUMBER,
//                 character: NUMBER,
//                 reason: STRING,
//                 evidence: STRING
//             }
//         ],
//         functions: [
//             {
//                 name: STRING,
//                 line: NUMBER,
//                 last: NUMBER,
//                 param: [
//                     {
//                         value: STRING
//                     }
//                 ],
//                 closure: [
//                     STRING
//                 ],
//                 var: [
//                     STRING
//                 ],
//                 exception: [
//                     STRING
//                 ],
//                 outer: [
//                     STRING
//                 ],
//                 unused: [
//                     STRING
//                 ],
//                 undef: [
//                     STRING
//                 ],
//                 global: [
//                     STRING
//                 ],
//                 label: [
//                     STRING
//                 ]
//             }
//         ],
//         globals: [
//             STRING
//         ],
//         member: {
//             STRING: NUMBER
//         },
//         urls: [
//             STRING
//         ],
//         json: BOOLEAN
//     }

// Empty arrays will not be included.

// You can obtain the parse tree that JSLint constructed while parsing. The
// latest tree is kept in JSLINT.tree. A nice stringication can be produced
// with

//     JSON.stringify(JSLINT.tree, [
//         'value',  'arity', 'name',  'first',
//         'second', 'third', 'block', 'else'
//     ], 4));

// JSLint provides three directives. They look like slashstar comments, and
// allow for setting options, declaring global variables, and establishing a
// set of allowed property names.

// These directives respect function scope.

// The jslint directive is a special comment that can set one or more options.
// The current option set is

//     adsafe     true, if ADsafe rules should be enforced
//     bitwise    true, if bitwise operators should be allowed
//     browser    true, if the standard browser globals should be predefined
//     cap        true, if upper case HTML should be allowed
//     'continue' true, if the continuation statement should be tolerated
//     css        true, if CSS workarounds should be tolerated
//     debug      true, if debugger statements should be allowed
//     devel      true, if logging should be allowed (console, alert, etc.)
//     eqeq       true, if == should be allowed
//     es5        true, if ES5 syntax should be allowed
//     evil       true, if eval should be allowed
//     forin      true, if for in statements need not filter
//     fragment   true, if HTML fragments should be allowed
//     indent     the indentation factor
//     maxerr     the maximum number of errors to allow
//     maxlen     the maximum length of a source line
//     newcap     true, if constructor names capitalization is ignored
//     node       true, if Node.js globals should be predefined
//     nomen      true, if names may have dangling _
//     on         true, if HTML event handlers should be allowed
//     passfail   true, if the scan should stop on first error
//     plusplus   true, if increment/decrement should be allowed
//     regexp     true, if the . should be allowed in regexp literals
//     rhino      true, if the Rhino environment globals should be predefined
//     undef      true, if variables can be declared out of order
//     unparam    true, if unused parameters should be tolerated
//     safe       true, if use of some browser features should be restricted
//     sloppy     true, if the 'use strict'; pragma is optional
//     sub        true, if all forms of subscript notation are tolerated
//     type       true, if types can be used inconsistently
//     vars       true, if multiple var statements per function should be allowed
//     white      true, if sloppy whitespace is tolerated
//     widget     true  if the Yahoo Widgets globals should be predefined
//     windows    true, if MS Windows-specific globals should be predefined

// For example:

/*jslint
evil: true, nomen: true, regexp: true
*/

// The properties directive declares an exclusive list of property names.
// Any properties named in the program that are not in the list will
// produce a warning.

// For example:

/*properties '\b', '\t', '\n', '\f', '\r', '!=', '!==', '"', '%',
'&', '\'', '(', '(array)', '(begin)', '(breakage)', '(complexity)', '(context)',
'(error)', '(function)', '(identifier)', '(line)', '(loopage)', '(name)',
'(number)', '(object)', '(params)', '(scope)', '(statement)', '(string)',
'(token)', '(vars)', '(verb)', ')', '*', '+', '-', '/', ';', '?', '<',
'<<', '<=', '==', '===', '>', '>=', '>>',
'>>>', ADSAFE, ActiveXObject, Array, Boolean, Buffer, COM,
CScript, Canvas, CustomAnimation, Date, Debug, E, Enumerator, Error,
EvalError, FadeAnimation, Flash, FormField, Frame, Function, HotKey,
Image, JSON, LN10, LN2, LOG10E, LOG2E, MAX_VALUE, MIN_VALUE, Math,
MenuItem, MoveAnimation, NEGATIVE_INFINITY, Number, Object, Option, PI,
POSITIVE_INFINITY, Point, RangeError, Rectangle, ReferenceError, RegExp,
ResizeAnimation, RotateAnimation, SQRT1_2, SQRT2, ScrollBar, Storage,
String, Style, SyntaxError, System, Text, TextArea, Timer, TypeError,
URIError, URL, VBArray, WScript, Web, Window, XMLDOM, XMLHttpRequest,
'\\', '^', __dirname, __filename, a, a_label, a_not_allowed,
a_not_defined, a_scope, abbr, acronym, activeborder, activecaption,
address, adsafe, adsafe_a, adsafe_autocomplete, adsafe_bad_id,
adsafe_div, adsafe_fragment, adsafe_go, adsafe_html, adsafe_id,
adsafe_id_go, adsafe_lib, adsafe_lib_second, adsafe_missing_id,
adsafe_name_a, adsafe_placement, adsafe_prefix_a, adsafe_script,
adsafe_source, adsafe_subscript_a, adsafe_tag, alert, aliceblue, all,
already_defined, and, animator, antiquewhite, appleScript, applet,
apply, approved, appworkspace, aqua, aquamarine, area, arguments, arity,
article, aside, assign, assign_exception,
assignment_function_expression, at, attribute_case_a, audio,
autocomplete, avoid_a, azure, b, background, 'background-attachment',
'background-color', 'background-image', 'background-position',
'background-repeat', bad_assignment, bad_color_a, bad_constructor,
bad_entity, bad_html, bad_id_a, bad_in_a, bad_invocation, bad_name_a,
bad_new, bad_number, bad_operand, bad_type, bad_url, bad_wrap, base,
bdo, beep, beige, big, bisque, bitwise, black, blanchedalmond, block,
blockquote, blue, blueviolet, body, border, 'border-bottom',
'border-bottom-color', 'border-bottom-style', 'border-bottom-width',
'border-collapse', 'border-color', 'border-left', 'border-left-color',
'border-left-style', 'border-left-width', 'border-right',
'border-right-color', 'border-right-style', 'border-right-width',
'border-spacing', 'border-style', 'border-top', 'border-top-color',
'border-top-style', 'border-top-width', 'border-width', bottom, br,
braille, brown, browser, burlywood, button, buttonface, buttonhighlight,
buttonshadow, buttontext, bytesToUIString, c, cadetblue, call, callee,
caller, canvas, cap, caption, 'caption-side', captiontext, center,
charAt, charCodeAt, character, chartreuse, chocolate, chooseColor,
chooseFile, chooseFolder, cite, clear, clearInterval, clearTimeout,
clip, closeWidget, closure, cm, code, col, colgroup, color, combine_var,
command, comment, comments, concat, conditional_assignment, confirm,
confusing_a, confusing_regexp, console, constructor, constructor_name_a,
content, continue, control_a, convertPathToHFS, convertPathToPlatform,
coral, cornflowerblue, cornsilk, 'counter-increment', 'counter-reset',
create, crimson, css, cursor, cyan, d, dangerous_comment, dangling_a,
darkblue, darkcyan, darkgoldenrod, darkgray, darkgreen, darkkhaki,
darkmagenta, darkolivegreen, darkorange, darkorchid, darkred,
darksalmon, darkseagreen, darkslateblue, darkslategray, darkturquoise,
darkviolet, data, datalist, dd, debug, decodeURI, decodeURIComponent,
deeppink, deepskyblue, defineClass, del, deleted, deserialize, details,
devel, dfn, dialog, dimgray, dir, direction, display, disrupt, div, dl,
document, dodgerblue, dt, duplicate_a, edge, edition, else, em, embed,
embossed, empty, 'empty-cells', empty_block, empty_case, empty_class,
encodeURI, encodeURIComponent, entityify, eqeq, errors, es5, escape, eval,
event, evidence, evil, ex, exception, exec, expected_a,
expected_a_at_b_c, expected_a_b, expected_a_b_from_c_d, expected_at_a,
expected_attribute_a, expected_attribute_value_a, expected_class_a,
expected_fraction_a, expected_id_a, expected_identifier_a,
expected_identifier_a_reserved, expected_lang_a, expected_linear_a,
expected_media_a, expected_name_a, expected_nonstandard_style_attribute,
expected_number_a, expected_operator_a, expected_percent_a,
expected_positive_a, expected_pseudo_a, expected_selector_a,
expected_small_a, expected_space_a_b, expected_string_a,
expected_style_attribute, expected_style_pattern, expected_tagname_a,
exports, f, fieldset, figure, filesystem, filter, firebrick, first,
float, floor, floralwhite, focusWidget, font, 'font-family',
'font-size', 'font-size-adjust', 'font-stretch', 'font-style',
'font-variant', 'font-weight', footer, forEach, for_if, forestgreen,
forin, form, fragment, frame, frames, frameset, from, fromCharCode,
fuchsia, fud, funct, function, function_block, function_eval,
function_loop, function_statement, function_strict, functions, g,
gainsboro, gc, ghostwhite, global, globals, gold, goldenrod, gray,
graytext, green, greenyellow, h1, h2, h3, h4, h5, h6, handheld,
hasOwnProperty, head, header, height, help, hgroup, highlight,
highlighttext, history, honeydew, hotpink, hr, 'hta:application', html,
html_confusion_a, html_handlers, i, iTunes, id, identifier,
identifier_function, iframe, img, immed, implied_evil, in,
inactiveborder, inactivecaption, inactivecaptiontext, include, indent,
indexOf, indianred, indigo, infix_in, infobackground, infotext, init,
input, ins, insecure_a, isAlpha, isApplicationRunning, isArray, isDigit,
isFinite, isNaN, ivory, join, jslint, json, kbd, keygen, keys, khaki,
konfabulatorVersion, label, label_a_b, labeled, lang, lastIndexOf,
lavender, lavenderblush, lawngreen, lbp, leading_decimal_a, led, left,
legend, lemonchiffon, length, 'letter-spacing', li, lib, lightblue,
lightcoral, lightcyan, lightgoldenrodyellow, lightgreen, lightpink,
lightsalmon, lightseagreen, lightskyblue, lightslategray,
lightsteelblue, lightyellow, lime, limegreen, line, 'line-height',
linen, link, 'list-style', 'list-style-image', 'list-style-position',
'list-style-type', load, loadClass, localStorage, location, log, m,
magenta, map, margin, 'margin-bottom', 'margin-left', 'margin-right',
'margin-top', mark, 'marker-offset', maroon, match, 'max-height',
'max-width', maxerr, maxlen, md5, mediumaquamarine, mediumblue,
mediumorchid, mediumpurple, mediumseagreen, mediumslateblue,
mediumspringgreen, mediumturquoise, mediumvioletred, member, menu,
menutext, message, meta, meter, midnightblue, 'min-height', 'min-width',
mintcream, missing_a, missing_a_after_b, missing_option,
missing_property, missing_space_a_b, missing_url, missing_use_strict,
mistyrose, mixed, mm, moccasin, mode, module, move_invocation, move_var,
n, name, name_function, nav, navajowhite, navigator, navy,
nested_comment, newcap, next, node, noframes, nomen, noscript, not,
not_a_constructor, not_a_defined, not_a_function, not_a_label,
not_a_scope, not_greater, nud, object, ol, oldlace, olive, olivedrab,
on, opacity, open, openURL, opera, optgroup, option, orange, orangered,
orchid, outer, outline, 'outline-color', 'outline-style',
'outline-width', output, overflow, 'overflow-x', 'overflow-y', p,
padding, 'padding-bottom', 'padding-left', 'padding-right',
'padding-top', 'page-break-after', 'page-break-before', palegoldenrod,
palegreen, paleturquoise, palevioletred, papayawhip, param,
parameter_a_get_b, parameter_set_a, paren, parent, parseFloat, parseInt,
passfail, pc, peachpuff, peru, pink, play, plum, plusplus, pop,
popupMenu, position, postscript, powderblue, pre, predef,
preferenceGroups, preferences, prev, print, process, progress,
projection, prompt, prototype, pt, purple, push, px, q, querystring,
quit, quote, quotes, r, radix, random, range, raw, readFile, readUrl,
read_only, reason, red, redefinition_a, regexp, reloadWidget, replace,
report, require, reserved, reserved_a, resolvePath, resumeUpdates,
rhino, right, rosybrown, royalblue, rp, rt, ruby, runCommand,
runCommandInBg, saddlebrown, safe, salmon, samp, sandybrown, saveAs,
savePreferences, scanned_a_b, screen, script, scrollbar, seagreen, seal,
search, seashell, second, section, select, serialize, sessionStorage,
setInterval, setTimeout, shift, showWidgetPreferences, sienna, silver,
skyblue, slash_equal, slateblue, slategray, sleep, slice, sloppy, small,
snow, sort, source, span, spawn, speak, speech, split, springgreen, src,
stack, statement_block, steelblue, stopping, strange_loop, strict,
strong, style, styleproperty, sub, subscript, substr, sup, supplant,
suppressUpdates, sync, system, t, table, 'table-layout', tag_a_in_b,
tan, tbody, td, teal, tellWidget, test, 'text-align', 'text-decoration',
'text-indent', 'text-shadow', 'text-transform', textarea, tfoot, th,
thead, third, thistle, threeddarkshadow, threedface, threedhighlight,
threedlightshadow, threedshadow, thru, time, title, toLowerCase,
toString, toUpperCase, toint32, token, tomato, too_long, too_many, top,
tr, trailing_decimal_a, tree, tt, tty, turquoise, tv, type,
type_inconsistency_a_b, typeof, u, ul, unclosed, unclosed_comment,
unclosed_regexp, undef, unescape, unescaped_a, unexpected_a,
unexpected_char_a_b, unexpected_comment, unexpected_property_a,
unexpected_space_a_b, 'unicode-bidi', unnecessary_initialize,
unnecessary_use, unparam, unreachable_a_b,
unrecognized_style_attribute_a, unrecognized_tag_a, unsafe, unused,
unwatch, updateNow, url, urls, use_array, use_braces, use_charAt, use_object,
use_or, use_param, used_before_a, value, valueOf, var, var_a_not, vars,
version, 'vertical-align', video, violet, visibility, was, watch,
weird_assignment, weird_condition, weird_new, weird_program,
weird_relation, weird_ternary, wheat, white, 'white-space', whitesmoke,
widget, width, window, windowframe, windows, windowtext, 'word-spacing',
'word-wrap', wrap, wrap_immediate, wrap_regexp, write_is_wrong,
writeable, yahooCheckLogin, yahooLogin, yahooLogout, yellow,
yellowgreen, 'z-index', '|', '~'
*/

// The global directive is used to declare global variables that can
// be accessed by the program. If a declaration is true, then the variable
// is writeable. Otherwise, it is read-only.

// We build the application inside a function so that we produce only a single
// global variable. That function will be invoked immediately, and its return
// value is the JSLINT function itself. That function is also an object that
// can contain data and other functions.

JAYLINT = (function () {
    'use strict';

    var adsafe_id,      // The widget's ADsafe id.
        adsafe_may,     // The widget may load approved scripts.
        adsafe_top,     // At the top of the widget script.
        adsafe_went,    // ADSAFE.go has been called.
        anonname,       // The guessed name for anonymous functions.
        approved,       // ADsafe approved urls.

    // These are operators that should not be used with the ! operator.

        bang = {
            '<': true,
            '<=': true,
            '==': true,
            '===': true,
            '!==': true,
            '!=': true,
            '>': true,
            '>=': true,
            '+': true,
            '-': true,
            '*': true,
            '/': true,
            '%': true
        },

    // These are property names that should not be permitted in the safe subset.

        banned = {
            'arguments': true,
            callee: true,
            caller: true,
            constructor: true,
            'eval': true,
            prototype: true,
            stack: true,
            unwatch: true,
            valueOf: true,
            watch: true
        },
        begin,          // The root token

    // browser contains a set of global names that are commonly provided by a
    // web browser environment.

        browser = {
            clearInterval: false,
            clearTimeout: false,
            document: false,
            event: false,
            frames: false,
            history: false,
            Image: false,
            localStorage: false,
            location: false,
            name: false,
            navigator: false,
            Option: false,
            parent: false,
            screen: false,
            sessionStorage: false,
            setInterval: false,
            setTimeout: false,
            Storage: false,
            window: false,
            XMLHttpRequest: false
        },

    // bundle contains the text messages.

        bundle = {
            a_label: "'{a}' is a statement label.",
            a_not_allowed: "'{a}' is not allowed.",
            a_not_defined: "'{a}' is not defined.",
            a_scope: "'{a}' used out of scope.",
            adsafe: "ADsafe violation.",
            adsafe_a: "ADsafe violation: '{a}'.",
            adsafe_autocomplete: "ADsafe autocomplete violation.",
            adsafe_bad_id: "ADSAFE violation: bad id.",
            adsafe_div: "ADsafe violation: Wrap the widget in a div.",
            adsafe_fragment: "ADSAFE: Use the fragment option.",
            adsafe_go: "ADsafe violation: Misformed ADSAFE.go.",
            adsafe_html: "Currently, ADsafe does not operate on whole HTML " +
                "documents. It operates on <div> fragments and .js files.",
            adsafe_id: "ADsafe violation: id does not match.",
            adsafe_id_go: "ADsafe violation: Missing ADSAFE.id or ADSAFE.go.",
            adsafe_lib: "ADsafe lib violation.",
            adsafe_lib_second: "ADsafe: The second argument to lib must be a function.",
            adsafe_missing_id: "ADSAFE violation: missing ID_.",
            adsafe_name_a: "ADsafe name violation: '{a}'.",
            adsafe_placement: "ADsafe script placement violation.",
            adsafe_prefix_a: "ADsafe violation: An id must have a '{a}' prefix",
            adsafe_script: "ADsafe script violation.",
            adsafe_source: "ADsafe unapproved script source.",
            adsafe_subscript_a: "ADsafe subscript '{a}'.",
            adsafe_tag: "ADsafe violation: Disallowed tag '{a}'.",
            already_defined: "'{a}' is already defined.",
            and: "The '&&' subexpression should be wrapped in parens.",
            assign_exception: "Do not assign to the exception parameter.",
            assignment_function_expression: "Expected an assignment or " +
                "function call and instead saw an expression.",
            attribute_case_a: "Attribute '{a}' not all lower case.",
            avoid_a: "Avoid '{a}'.",
            bad_assignment: "Bad assignment.",
            bad_color_a: "Bad hex color '{a}'.",
            bad_constructor: "Bad constructor.",
            bad_entity: "Bad entity.",
            bad_html: "Bad HTML string",
            bad_id_a: "Bad id: '{a}'.",
            bad_in_a: "Bad for in variable '{a}'.",
            bad_invocation: "Bad invocation.",
            bad_name_a: "Bad name: '{a}'.",
            bad_new: "Do not use 'new' for side effects.",
            bad_number: "Bad number '{a}'.",
            bad_operand: "Bad operand.",
            bad_type: "Bad type.",
            bad_url: "Bad url string.",
            bad_wrap: "Do not wrap function literals in parens unless they " +
                "are to be immediately invoked.",
            combine_var: "Combine this with the previous 'var' statement.",
            conditional_assignment: "Expected a conditional expression and " +
                "instead saw an assignment.",
            confusing_a: "Confusing use of '{a}'.",
            confusing_regexp: "Confusing regular expression.",
            constructor_name_a: "A constructor name '{a}' should start with " +
                "an uppercase letter.",
            control_a: "Unexpected control character '{a}'.",
            css: "A css file should begin with @charset 'UTF-8';",
            dangling_a: "Unexpected dangling '_' in '{a}'.",
            dangerous_comment: "Dangerous comment.",
            deleted: "Only properties should be deleted.",
            duplicate_a: "Duplicate '{a}'.",
            empty_block: "Empty block.",
            empty_case: "Empty case.",
            empty_class: "Empty class.",
            es5: "This is an ES5 feature.",
            evil: "eval is evil.",
            expected_a: "Expected '{a}'.",
            expected_a_b: "Expected '{a}' and instead saw '{b}'.",
            expected_a_b_from_c_d: "Expected '{a}' to match '{b}' from line " +
                "{c} and instead saw '{d}'.",
            expected_at_a: "Expected an at-rule, and instead saw @{a}.",
            expected_a_at_b_c: "Expected '{a}' at column {b}, not column {c}.",
            expected_attribute_a: "Expected an attribute, and instead saw [{a}].",
            expected_attribute_value_a: "Expected an attribute value and " +
                "instead saw '{a}'.",
            expected_class_a: "Expected a class, and instead saw .{a}.",
            expected_fraction_a: "Expected a number between 0 and 1 and " +
                "instead saw '{a}'",
            expected_id_a: "Expected an id, and instead saw #{a}.",
            expected_identifier_a: "Expected an identifier and instead saw '{a}'.",
            expected_identifier_a_reserved: "Expected an identifier and " +
                "instead saw '{a}' (a reserved word).",
            expected_linear_a: "Expected a linear unit and instead saw '{a}'.",
            expected_lang_a: "Expected a lang code, and instead saw :{a}.",
            expected_media_a: "Expected a CSS media type, and instead saw '{a}'.",
            expected_name_a: "Expected a name and instead saw '{a}'.",
            expected_nonstandard_style_attribute: "Expected a non-standard " +
                "style attribute and instead saw '{a}'.",
            expected_number_a: "Expected a number and instead saw '{a}'.",
            expected_operator_a: "Expected an operator and instead saw '{a}'.",
            expected_percent_a: "Expected a percentage and instead saw '{a}'",
            expected_positive_a: "Expected a positive number and instead saw '{a}'",
            expected_pseudo_a: "Expected a pseudo, and instead saw :{a}.",
            expected_selector_a: "Expected a CSS selector, and instead saw {a}.",
            expected_small_a: "Expected a small number and instead saw '{a}'",
            expected_space_a_b: "Expected exactly one space between '{a}' and '{b}'.",
            expected_string_a: "Expected a string and instead saw {a}.",
            expected_style_attribute: "Excepted a style attribute, and instead saw '{a}'.",
            expected_style_pattern: "Expected a style pattern, and instead saw '{a}'.",
            expected_tagname_a: "Expected a tagName, and instead saw {a}.",
            for_if: "The body of a for in should be wrapped in an if " +
                "statement to filter unwanted properties from the prototype.",
            function_block: "Function statements should not be placed in blocks. " +
                "Use a function expression or move the statement to the top of " +
                "the outer function.",
            function_eval: "The Function constructor is eval.",
            function_loop: "Don't make functions within a loop.",
            function_statement: "Function statements are not invocable. " +
                "Wrap the whole function invocation in parens.",
            function_strict: "Use the function form of 'use strict'.",
            html_confusion_a: "HTML confusion in regular expression '<{a}'.",
            html_handlers: "Avoid HTML event handlers.",
            identifier_function: "Expected an identifier in an assignment " +
                "and instead saw a function invocation.",
            implied_evil: "Implied eval is evil. Pass a function instead of a string.",
            infix_in: "Unexpected 'in'. Compare with undefined, or use the " +
                "hasOwnProperty method instead.",
            insecure_a: "Insecure '{a}'.",
            isNaN: "Use the isNaN function to compare with NaN.",
            label_a_b: "Label '{a}' on '{b}' statement.",
            lang: "lang is deprecated.",
            leading_decimal_a: "A leading decimal point can be confused with a dot: '.{a}'.",
            missing_a: "Missing '{a}'.",
            missing_a_after_b: "Missing '{a}' after '{b}'.",
            missing_option: "Missing option value.",
            missing_property: "Missing property name.",
            missing_space_a_b: "Missing space between '{a}' and '{b}'.",
            missing_url: "Missing url.",
            missing_use_strict: "Missing 'use strict' statement.",
            mixed: "Mixed spaces and tabs.",
            move_invocation: "Move the invocation into the parens that " +
                "contain the function.",
            move_var: "Move 'var' declarations to the top of the function.",
            name_function: "Missing name in function statement.",
            nested_comment: "Nested comment.",
            not: "Nested not.",
            not_a_constructor: "Do not use {a} as a constructor.",
            not_a_defined: "'{a}' has not been fully defined yet.",
            not_a_function: "'{a}' is not a function.",
            not_a_label: "'{a}' is not a label.",
            not_a_scope: "'{a}' is out of scope.",
            not_greater: "'{a}' should not be greater than '{b}'.",
            parameter_a_get_b: "Unexpected parameter '{a}' in get {b} function.",
            parameter_set_a: "Expected parameter (value) in set {a} function.",
            radix: "Missing radix parameter.",
            read_only: "Read only.",
            redefinition_a: "Redefinition of '{a}'.",
            reserved_a: "Reserved name '{a}'.",
            scanned_a_b: "{a} ({b}% scanned).",
            slash_equal: "A regular expression literal can be confused with '/='.",
            statement_block: "Expected to see a statement and instead saw a block.",
            stopping: "Stopping. ",
            strange_loop: "Strange loop.",
            strict: "Strict violation.",
            subscript: "['{a}'] is better written in dot notation.",
            tag_a_in_b: "A '<{a}>' must be within '<{b}>'.",
            too_long: "Line too long.",
            too_many: "Too many errors.",
            trailing_decimal_a: "A trailing decimal point can be confused " +
                "with a dot: '.{a}'.",
            type: "type is unnecessary.",
            type_inconsistency_a_b: "Type inconsistency: {a} and {b}.",
            unclosed: "Unclosed string.",
            unclosed_comment: "Unclosed comment.",
            unclosed_regexp: "Unclosed regular expression.",
            unescaped_a: "Unescaped '{a}'.",
            unexpected_a: "Unexpected '{a}'.",
            unexpected_char_a_b: "Unexpected character '{a}' in {b}.",
            unexpected_comment: "Unexpected comment.",
            unexpected_property_a: "Unexpected /*property*/ '{a}'.",
            unexpected_space_a_b: "Unexpected space between '{a}' and '{b}'.",
            unnecessary_initialize: "It is not necessary to initialize '{a}' " +
                "to 'undefined'.",
            unnecessary_use: "Unnecessary 'use strict'.",
            unreachable_a_b: "Unreachable '{a}' after '{b}'.",
            unrecognized_style_attribute_a: "Unrecognized style attribute '{a}'.",
            unrecognized_tag_a: "Unrecognized tag '<{a}>'.",
            unsafe: "Unsafe character.",
            url: "JavaScript URL.",
            use_array: "Use the array literal notation [].",
            use_braces: "Spaces are hard to count. Use {{a}}.",
            use_charAt: "Use the charAt method.",
            use_object: "Use the object literal notation {}.",
            use_or: "Use the || operator.",
            use_param: "Use a named parameter.",
            used_before_a: "'{a}' was used before it was defined.",
            var_a_not: "Variable {a} was not declared correctly.",
            weird_assignment: "Weird assignment.",
            weird_condition: "Weird condition.",
            weird_new: "Weird construction. Delete 'new'.",
            weird_program: "Weird program.",
            weird_relation: "Weird relation.",
            weird_ternary: "Weird ternary.",
            wrap_immediate: "Wrap an immediate function invocation in parentheses " +
                "to assist the reader in understanding that the expression " +
                "is the result of a function, and not the function itself.",
            wrap_regexp: "Wrap the /regexp/ literal in parens to " +
                "disambiguate the slash operator.",
            write_is_wrong: "document.write can be a form of eval."
        },
        comments_off,
        css_attribute_data,
        css_any,

        css_colorData = {
            "aliceblue": true,
            "antiquewhite": true,
            "aqua": true,
            "aquamarine": true,
            "azure": true,
            "beige": true,
            "bisque": true,
            "black": true,
            "blanchedalmond": true,
            "blue": true,
            "blueviolet": true,
            "brown": true,
            "burlywood": true,
            "cadetblue": true,
            "chartreuse": true,
            "chocolate": true,
            "coral": true,
            "cornflowerblue": true,
            "cornsilk": true,
            "crimson": true,
            "cyan": true,
            "darkblue": true,
            "darkcyan": true,
            "darkgoldenrod": true,
            "darkgray": true,
            "darkgreen": true,
            "darkkhaki": true,
            "darkmagenta": true,
            "darkolivegreen": true,
            "darkorange": true,
            "darkorchid": true,
            "darkred": true,
            "darksalmon": true,
            "darkseagreen": true,
            "darkslateblue": true,
            "darkslategray": true,
            "darkturquoise": true,
            "darkviolet": true,
            "deeppink": true,
            "deepskyblue": true,
            "dimgray": true,
            "dodgerblue": true,
            "firebrick": true,
            "floralwhite": true,
            "forestgreen": true,
            "fuchsia": true,
            "gainsboro": true,
            "ghostwhite": true,
            "gold": true,
            "goldenrod": true,
            "gray": true,
            "green": true,
            "greenyellow": true,
            "honeydew": true,
            "hotpink": true,
            "indianred": true,
            "indigo": true,
            "ivory": true,
            "khaki": true,
            "lavender": true,
            "lavenderblush": true,
            "lawngreen": true,
            "lemonchiffon": true,
            "lightblue": true,
            "lightcoral": true,
            "lightcyan": true,
            "lightgoldenrodyellow": true,
            "lightgreen": true,
            "lightpink": true,
            "lightsalmon": true,
            "lightseagreen": true,
            "lightskyblue": true,
            "lightslategray": true,
            "lightsteelblue": true,
            "lightyellow": true,
            "lime": true,
            "limegreen": true,
            "linen": true,
            "magenta": true,
            "maroon": true,
            "mediumaquamarine": true,
            "mediumblue": true,
            "mediumorchid": true,
            "mediumpurple": true,
            "mediumseagreen": true,
            "mediumslateblue": true,
            "mediumspringgreen": true,
            "mediumturquoise": true,
            "mediumvioletred": true,
            "midnightblue": true,
            "mintcream": true,
            "mistyrose": true,
            "moccasin": true,
            "navajowhite": true,
            "navy": true,
            "oldlace": true,
            "olive": true,
            "olivedrab": true,
            "orange": true,
            "orangered": true,
            "orchid": true,
            "palegoldenrod": true,
            "palegreen": true,
            "paleturquoise": true,
            "palevioletred": true,
            "papayawhip": true,
            "peachpuff": true,
            "peru": true,
            "pink": true,
            "plum": true,
            "powderblue": true,
            "purple": true,
            "red": true,
            "rosybrown": true,
            "royalblue": true,
            "saddlebrown": true,
            "salmon": true,
            "sandybrown": true,
            "seagreen": true,
            "seashell": true,
            "sienna": true,
            "silver": true,
            "skyblue": true,
            "slateblue": true,
            "slategray": true,
            "snow": true,
            "springgreen": true,
            "steelblue": true,
            "tan": true,
            "teal": true,
            "thistle": true,
            "tomato": true,
            "turquoise": true,
            "violet": true,
            "wheat": true,
            "white": true,
            "whitesmoke": true,
            "yellow": true,
            "yellowgreen": true,

            "activeborder": true,
            "activecaption": true,
            "appworkspace": true,
            "background": true,
            "buttonface": true,
            "buttonhighlight": true,
            "buttonshadow": true,
            "buttontext": true,
            "captiontext": true,
            "graytext": true,
            "highlight": true,
            "highlighttext": true,
            "inactiveborder": true,
            "inactivecaption": true,
            "inactivecaptiontext": true,
            "infobackground": true,
            "infotext": true,
            "menu": true,
            "menutext": true,
            "scrollbar": true,
            "threeddarkshadow": true,
            "threedface": true,
            "threedhighlight": true,
            "threedlightshadow": true,
            "threedshadow": true,
            "window": true,
            "windowframe": true,
            "windowtext": true
        },

        css_border_style,
        css_break,

        css_lengthData = {
            '%': true,
            'cm': true,
            'em': true,
            'ex': true,
            'in': true,
            'mm': true,
            'pc': true,
            'pt': true,
            'px': true
        },

        css_media,
        css_overflow,

        descapes = {
            'b': '\b',
            't': '\t',
            'n': '\n',
            'f': '\f',
            'r': '\r',
            '"': '"',
            '/': '/',
            '\\': '\\'
        },

        devel = {
            alert: false,
            confirm: false,
            console: false,
            Debug: false,
            opera: false,
            prompt: false
        },

        escapes = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '\'': '\\\'',
            '"': '\\"',
            '/': '\\/',
            '\\': '\\\\'
        },

        funct,          // The current function, including the labels used
    // in the function, as well as (verb), (context),
    // (statement), (name), (params), (complexity),
    // (loopage), (breakage), (vars)

        functionicity = [
            'closure', 'exception', 'global', 'label', 'outer', 'undef',
            'unused', 'var'
        ],

        functions,      // All of the functions
        global_funct,   // The global body
        global_scope,   // The global scope
        html_tag = {
            a: {},
            abbr: {},
            acronym: {},
            address: {},
            applet: {},
            area: { empty: true, parent: ' map ' },
            article: {},
            aside: {},
            audio: {},
            b: {},
            base: { empty: true, parent: ' head ' },
            bdo: {},
            big: {},
            blockquote: {},
            body: { parent: ' html noframes ' },
            br: { empty: true },
            button: {},
            canvas: { parent: ' body p div th td ' },
            caption: { parent: ' table ' },
            center: {},
            cite: {},
            code: {},
            col: { empty: true, parent: ' table colgroup ' },
            colgroup: { parent: ' table ' },
            command: { parent: ' menu ' },
            datalist: {},
            dd: { parent: ' dl ' },
            del: {},
            details: {},
            dialog: {},
            dfn: {},
            dir: {},
            div: {},
            dl: {},
            dt: { parent: ' dl ' },
            em: {},
            embed: {},
            fieldset: {},
            figure: {},
            font: {},
            footer: {},
            form: {},
            frame: { empty: true, parent: ' frameset ' },
            frameset: { parent: ' html frameset ' },
            h1: {},
            h2: {},
            h3: {},
            h4: {},
            h5: {},
            h6: {},
            head: { parent: ' html ' },
            header: {},
            hgroup: {},
            hr: { empty: true },
            'hta:application':
                      { empty: true, parent: ' head ' },
            html: { parent: '*' },
            i: {},
            iframe: {},
            img: { empty: true },
            input: { empty: true },
            ins: {},
            kbd: {},
            keygen: {},
            label: {},
            legend: { parent: ' details fieldset figure ' },
            li: { parent: ' dir menu ol ul ' },
            link: { empty: true, parent: ' head ' },
            map: {},
            mark: {},
            menu: {},
            meta: { empty: true, parent: ' head noframes noscript ' },
            meter: {},
            nav: {},
            noframes: { parent: ' html body ' },
            noscript: { parent: ' body head noframes ' },
            object: {},
            ol: {},
            optgroup: { parent: ' select ' },
            option: { parent: ' optgroup select ' },
            output: {},
            p: {},
            param: { empty: true, parent: ' applet object ' },
            pre: {},
            progress: {},
            q: {},
            rp: {},
            rt: {},
            ruby: {},
            samp: {},
            script: { empty: true, parent: ' body div frame head iframe p pre span ' },
            section: {},
            select: {},
            small: {},
            span: {},
            source: {},
            strong: {},
            style: { parent: ' head ', empty: true },
            sub: {},
            sup: {},
            table: {},
            tbody: { parent: ' table ' },
            td: { parent: ' tr ' },
            textarea: {},
            tfoot: { parent: ' table ' },
            th: { parent: ' tr ' },
            thead: { parent: ' table ' },
            time: {},
            title: { parent: ' head ' },
            tr: { parent: ' table tbody thead tfoot ' },
            tt: {},
            u: {},
            ul: {},
            'var': {},
            video: {}
        },

        ids,            // HTML ids
        in_block,
        indent,
        itself,         //  JSLint itself
        json_mode,
        lex,            // the tokenizer
        lines,
        lookahead,
        member,
        node = {
            Buffer: false,
            clearInterval: false,
            clearTimeout: false,
            console: false,
            exports: false,
            global: false,
            module: false,
            process: false,
            querystring: false,
            require: false,
            setInterval: false,
            setTimeout: false,
            __dirname: false,
            __filename: false
        },
        node_js,
        numbery = {
            indexOf: true,
            lastIndexOf: true,
            search: true
        },
        next_token,
        older_token,
        option,
        predefined,     // Global variables defined by option
        prereg,
        prev_token,
        properties,
        regexp_flag = {
            g: true,
            i: true,
            m: true
        },
        rhino = {
            defineClass: false,
            deserialize: false,
            gc: false,
            help: false,
            load: false,
            loadClass: false,
            print: false,
            quit: false,
            readFile: false,
            readUrl: false,
            runCommand: false,
            seal: false,
            serialize: false,
            spawn: false,
            sync: false,
            toint32: false,
            version: false
        },

        scope,      // An object containing an object for each variable in scope
        semicolon_coda = {
            ';': true,
            '"': true,
            '\'': true,
            ')': true
        },
        src,
        stack,

    // standard contains the global names that are provided by the
    // ECMAScript standard.

        standard = {
            Array: false,
            Boolean: false,
            Date: false,
            decodeURI: false,
            decodeURIComponent: false,
            encodeURI: false,
            encodeURIComponent: false,
            Error: false,
            'eval': false,
            EvalError: false,
            Function: false,
            isFinite: false,
            isNaN: false,
            JSON: false,
            Math: false,
            Number: false,
            Object: false,
            parseInt: false,
            parseFloat: false,
            RangeError: false,
            ReferenceError: false,
            RegExp: false,
            String: false,
            SyntaxError: false,
            TypeError: false,
            URIError: false
        },

        standard_property = {
            E: true,
            LN2: true,
            LN10: true,
            LOG2E: true,
            LOG10E: true,
            MAX_VALUE: true,
            MIN_VALUE: true,
            NEGATIVE_INFINITY: true,
            PI: true,
            POSITIVE_INFINITY: true,
            SQRT1_2: true,
            SQRT2: true
        },

        strict_mode,
        syntax = {},
        tab,
        token,
        urls,
        var_mode,
        warnings,

    // widget contains the global names which are provided to a Yahoo
    // (fna Konfabulator) widget.

        widget = {
            alert: true,
            animator: true,
            appleScript: true,
            beep: true,
            bytesToUIString: true,
            Canvas: true,
            chooseColor: true,
            chooseFile: true,
            chooseFolder: true,
            closeWidget: true,
            COM: true,
            convertPathToHFS: true,
            convertPathToPlatform: true,
            CustomAnimation: true,
            escape: true,
            FadeAnimation: true,
            filesystem: true,
            Flash: true,
            focusWidget: true,
            form: true,
            FormField: true,
            Frame: true,
            HotKey: true,
            Image: true,
            include: true,
            isApplicationRunning: true,
            iTunes: true,
            konfabulatorVersion: true,
            log: true,
            md5: true,
            MenuItem: true,
            MoveAnimation: true,
            openURL: true,
            play: true,
            Point: true,
            popupMenu: true,
            preferenceGroups: true,
            preferences: true,
            print: true,
            prompt: true,
            random: true,
            Rectangle: true,
            reloadWidget: true,
            ResizeAnimation: true,
            resolvePath: true,
            resumeUpdates: true,
            RotateAnimation: true,
            runCommand: true,
            runCommandInBg: true,
            saveAs: true,
            savePreferences: true,
            screen: true,
            ScrollBar: true,
            showWidgetPreferences: true,
            sleep: true,
            speak: true,
            Style: true,
            suppressUpdates: true,
            system: true,
            tellWidget: true,
            Text: true,
            TextArea: true,
            Timer: true,
            unescape: true,
            updateNow: true,
            URL: true,
            Web: true,
            widget: true,
            Window: true,
            XMLDOM: true,
            XMLHttpRequest: true,
            yahooCheckLogin: true,
            yahooLogin: true,
            yahooLogout: true
        },

        windows = {
            ActiveXObject: false,
            CScript: false,
            Debug: false,
            Enumerator: false,
            System: false,
            VBArray: false,
            WScript: false
        },

    //  xmode is used to adapt to the exceptions in html parsing.
    //  It can have these states:
    //      ''      .js script file
    //      'html'
    //      'outer'
    //      'script'
    //      'style'
    //      'scriptstring'
    //      'styleproperty'

        xmode,
        xquote,

    // Regular expressions. Some of these are stupidly long.

    // unsafe comment or string
        ax = /@cc|<\/?|script|\]\s*\]|<\s*!|&lt/i,
    // carriage return, or carriage return linefeed
        crx = /\r/g,
        crlfx = /\r\n/g,
    // unsafe characters that are silently deleted by one or more browsers
        cx = /[\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/,
    // query characters for ids
        dx = /[\[\]\/\\"'*<>.&:(){}+=#]/,
    // html token
        hx = /^\s*(['"=>\/&#]|<(?:\/|\!(?:--)?)?|[a-zA-Z][a-zA-Z0-9_\-:]*|[0-9]+|--)/,
    // identifier
        ix = /^([a-zA-Z_$][a-zA-Z0-9_$]*)$/,
    // javascript url
        jx = /^(?:javascript|jscript|ecmascript|vbscript|mocha|livescript)\s*:/i,
    // star slash
        lx = /\*\/|\/\*/,
    // characters in strings that need escapement
        nx = /[\u0000-\u001f'\\\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    // outer html token
        ox = /[>&]|<[\/!]?|--/,
    // attributes characters
        qx = /[^a-zA-Z0-9+\-_\/ ]/,
    // style
        sx = /^\s*([{:#%.=,>+\[\]@()"';]|\*=?|\$=|\|=|\^=|~=|[a-zA-Z_][a-zA-Z0-9_\-]*|[0-9]+|<\/|\/\*)/,
        ssx = /^\s*([@#!"'};:\-%.=,+\[\]()*_]|[a-zA-Z][a-zA-Z0-9._\-]*|\/\*?|\d+(?:\.\d+)?|<\/)/,
    // token
        tx = /^\s*([(){}\[.,:;'"~\?\]#@]|==?=?|\/(\*(jslint|properties|property|members?|globals?)?|=|\/)?|\*[\/=]?|\+(?:=|\++)?|-(?:=|-+)?|%=?|&[&=]?|\|[|=]?|>>?>?=?|<([\/=!]|\!(\[|--)?|<=?)?|\^=?|\!=?=?|[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+([xX][0-9a-fA-F]+|\.[0-9]*)?([eE][+\-]?[0-9]+)?)/,
    // url badness
        ux = /&|\+|\u00AD|\.\.|\/\*|%[^;]|base64|url|expression|data|mailto/i,

        rx = {
            outer: hx,
            html: hx,
            style: sx,
            styleproperty: ssx
        };


    function return_this() {
        return this;
    }

    function F() { }     // Used by Object.create

    // Provide critical ES5 functions to ES3.

    if (typeof Array.prototype.filter !== 'function') {
        Array.prototype.filter = function (f) {
            var i, length = this.length, result = [], value;
            for (i = 0; i < length; i += 1) {
                try {
                    value = this[i];
                    if (f(value)) {
                        result.push(value);
                    }
                } catch (ignore) {
                }
            }
            return result;
        };
    }

    if (typeof Array.prototype.forEach !== 'function') {
        Array.prototype.forEach = function (f) {
            var i, length = this.length, result = [];
            for (i = 0; i < length; i += 1) {
                try {
                    f(this[i]);
                } catch (ignore) {
                }
            }
            return result;
        };
    }

    if (typeof Array.isArray !== 'function') {
        Array.isArray = function (o) {
            return Object.prototype.toString.apply(o) === '[object Array]';
        };
    }

    if (!Object.prototype.hasOwnProperty.call(Object, 'create')) {
        Object.create = function (o) {
            F.prototype = o;
            return new F();
        };
    }

    if (typeof Object.keys !== 'function') {
        Object.keys = function (o) {
            var array = [], key;
            for (key in o) {
                if (Object.prototype.hasOwnProperty.call(o, key)) {
                    array.push(key);
                }
            }
            return array;
        };
    }

    if (typeof String.prototype.entityify !== 'function') {
        String.prototype.entityify = function () {
            return this
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
    }

    if (typeof String.prototype.isAlpha !== 'function') {
        String.prototype.isAlpha = function () {
            return (this >= 'a' && this <= 'z\uffff') ||
                (this >= 'A' && this <= 'Z\uffff');
        };
    }

    if (typeof String.prototype.isDigit !== 'function') {
        String.prototype.isDigit = function () {
            return (this >= '0' && this <= '9');
        };
    }

    if (typeof String.prototype.supplant !== 'function') {
        String.prototype.supplant = function (o) {
            return this.replace(/\{([^{}]*)\}/g, function (a, b) {
                var replacement = o[b];
                return typeof replacement === 'string' ||
                    typeof replacement === 'number' ? replacement : a;
            });
        };
    }


    function sanitize(a) {

        //  Escapify a troublesome character.

        return escapes[a] ||
            '\\u' + ('0000' + a.charCodeAt().toString(16)).slice(-4);
    }


    function add_to_predefined(group) {
        Object.keys(group).forEach(function (name) {
            predefined[name] = group[name];
        });
    }


    function assume() {
        if (!option.safe) {
            if (option.rhino) {
                add_to_predefined(rhino);
                option.rhino = false;
            }
            if (option.devel) {
                add_to_predefined(devel);
                option.devel = false;
            }
            if (option.browser) {
                add_to_predefined(browser);
                option.browser = false;
            }
            if (option.windows) {
                add_to_predefined(windows);
                option.windows = false;
            }
            if (option.node) {
                add_to_predefined(node);
                option.node = false;
                node_js = true;
            }
            if (option.widget) {
                add_to_predefined(widget);
                option.widget = false;
            }
        }
    }


    // Produce an error warning.

    function quit(message, line, character) {
        throw {
            name: 'JSLintError',
            line: line,
            character: character,
            message: bundle.scanned_a_b.supplant({
                a: message,
                b: Math.floor((line / lines.length) * 100)
            })
        };
    }

    function warn(message, offender, a, b, c, d) {
        var character, line, warning;
        offender = offender || next_token;  // `~
        line = offender.line || 0;
        character = offender.from || 0;
        warning = {
            id: '(error)',
            raw: bundle[message] || message,
            evidence: lines[line - 1] || '',
            line: line,
            character: character,
            a: a || offender.value,
            b: b,
            c: c,
            d: d
        };
        warning.reason = warning.raw.supplant(warning);
        JAYLINT.errors.push(warning);
        if (option.passfail) {
            quit(bundle.stopping, line, character);
        }
        warnings += 1;
        if (warnings >= option.maxerr) {
            quit(bundle.too_many, line, character);
        }
        return warning;
    }

    function warn_at(message, line, character, a, b, c, d) {
        return warn(message, {
            line: line,
            from: character
        }, a, b, c, d);
    }

    function stop(message, offender, a, b, c, d) {
        var warning = warn(message, offender, a, b, c, d);
        quit(bundle.stopping, warning.line, warning.character);
    }

    function stop_at(message, line, character, a, b, c, d) {
        return stop(message, {
            line: line,
            from: character
        }, a, b, c, d);
    }

    function expected_at(at) {
        if (!option.white && next_token.from !== at) {
            warn('expected_a_at_b_c', next_token, next_token.value, at,
                next_token.from);
        }
    }

    function aint(it, name, expected) {
        if (it[name] !== expected) {
            warn('expected_a_b', it, expected, it[name]);
            return true;
        } else {
            return false;
        }
    }


    // lexical analysis and token construction

    lex = (function lex() {
        var character, c, from, length, line, pos, source_row;

        // Private lex methods

        function collect_comment(comment, quote, line, at) {
            var comment_object = {
                comment: comment,
                quote: quote,
                at: at,
                line: line
            };
            if (comments_off || src || (xmode && xmode !== 'script' &&
                    xmode !== 'style' && xmode !== 'styleproperty')) {
                warn_at('unexpected_comment', line, character);
            } else if (xmode === 'script' && (/<\//i).test(source_row)) {
                warn_at('unexpected_a', line, character, '<\/');
            } else if (option.safe && ax.test(comment)) {
                warn_at('dangerous_comment', line, at);
            }
            if (older_token.comments) {
                older_token.comments.push(comment_object);
            } else {
                older_token.comments = [comment_object];
            }
            JAYLINT.comments.push(comment_object);
        }

        function next_line() {
            var at;
            if (line >= lines.length) {
                return false;
            }
            character = 1;
            source_row = lines[line];
            line += 1;
            at = source_row.search(/ \t/);
            if (at >= 0) {
                warn_at('mixed', line, at + 1);
            }
            source_row = source_row.replace(/\t/g, tab);
            at = source_row.search(cx);
            if (at >= 0) {
                warn_at('unsafe', line, at);
            }
            if (option.maxlen && option.maxlen < source_row.length) {
                warn_at('too_long', line, source_row.length);
            }
            return true;
        }

        // Produce a token object.  The token inherits from a syntax symbol.

        function it(type, value, quote) {
            var id, the_token;
            if (type === '(string)' || type === '(range)') {
                if (jx.test(value)) {
                    warn_at('url', line, from);
                }
            }
            the_token = Object.create(syntax[(
                type === '(punctuator)' ||
                    (type === '(identifier)' &&
                    Object.prototype.hasOwnProperty.call(syntax, value)) ?
                value :
                type
            )] || syntax['(error)']);
            if (type === '(identifier)') {
                the_token.identifier = true;
                if (value === '__iterator__' || value === '__proto__') {
                    stop_at('reserved_a', line, from, value);
                } else if (!option.nomen &&
                        (value.charAt(0) === '_' ||
                        value.charAt(value.length - 1) === '_')) {
                    warn_at('dangling_a', line, from, value);
                }
            }
            if (value !== undefined) {
                the_token.value = value;
            }
            if (quote) {
                the_token.quote = quote;
            }
            the_token.line = line;
            the_token.from = from;
            the_token.thru = character;
            the_token.prev = older_token;
            id = the_token.id;
            prereg = id && (
                ('(,=:[!&|?{};'.indexOf(id.charAt(id.length - 1)) >= 0) ||
                id === 'return'
            );
            older_token.next = the_token;
            older_token = the_token;
            return the_token;
        }

        function match(x) {
            var exec = x.exec(source_row), first;
            if (exec) {
                length = exec[0].length;
                first = exec[1];
                c = first.charAt(0);
                source_row = source_row.slice(length);
                from = character + length - first.length;
                character += length;
                return first;
            }
        }

        function string(x) {
            var c, j, r = '';

            function hex(n) {
                var i = parseInt(source_row.substr(j + 1, n), 16);
                j += n;
                if (i >= 32 && i <= 126 &&
                        i !== 34 && i !== 92 && i !== 39) {
                    warn_at('unexpected_a', line, character, '\\');
                }
                character += n;
                c = String.fromCharCode(i);
            }

            if (json_mode && x !== '"') {
                warn_at('expected_a', line, character, '"');
            }

            if (xquote === x || (xmode === 'scriptstring' && !xquote)) {
                return it('(punctuator)', x);
            }

            j = 0;
            for (; ; ) {
                while (j >= source_row.length) {
                    j = 0;
                    if (xmode !== 'html' || !next_line()) {
                        stop_at('unclosed', line, from);
                    }
                }
                c = source_row.charAt(j);
                if (c === x) {
                    character += 1;
                    source_row = source_row.slice(j + 1);
                    return it('(string)', r, x);
                }
                if (c < ' ') {
                    if (c === '\n' || c === '\r') {
                        break;
                    }
                    warn_at('control_a',
                        line, character + pos, source_row.slice(0, pos));
                } else if (c === xquote) {
                    warn_at('bad_html', line, character + j);
                } else if (c === '<') {
                    if (option.safe && xmode === 'html') {
                        warn_at('adsafe_a', line, character + pos, c);
                    } else if (source_row.charAt(pos + 1) === '/' && (xmode || option.safe)) {
                        warn_at('expected_a_b', line, character,
                            '<\\/', '</');
                    } else if (source_row.charAt(pos + 1) === '!' && (xmode || option.safe)) {
                        warn_at('unexpected_a', line, character, '<!');
                    }
                } else if (c === '\\') {
                    if (xmode === 'html') {
                        if (option.safe) {
                            warn_at('adsafe_a', line, character + pos, c);
                        }
                    } else if (xmode === 'styleproperty') {
                        j += 1;
                        character += 1;
                        c = source_row.charAt(j);
                        if (c !== x) {
                            warn_at('unexpected_a', line, character, '\\');
                        }
                    } else {
                        j += 1;
                        character += 1;
                        c = source_row.charAt(j);
                        switch (c) {
                            case '':
                                if (!option.es5) {
                                    warn_at('es5', line, character);
                                }
                                next_line();
                                j = -1;
                                break;
                            case xquote:
                                warn_at('bad_html', line, character + j);
                                break;
                            case '\'':
                                if (json_mode) {
                                    warn_at('unexpected_a', line, character, '\\\'');
                                }
                                break;
                            case 'u':
                                hex(4);
                                break;
                            case 'v':
                                if (json_mode) {
                                    warn_at('unexpected_a', line, character, '\\v');
                                }
                                c = '\v';
                                break;
                            case 'x':
                                if (json_mode) {
                                    warn_at('unexpected_a', line, character, '\\x');
                                }
                                hex(2);
                                break;
                            default:
                                c = descapes[c];
                                if (typeof c !== 'string') {
                                    warn_at('unexpected_a', line, character, '\\');
                                }
                        }
                    }
                }
                r += c;
                character += 1;
                j += 1;
            }
        }

        function number(snippet) {
            var digit;
            if (xmode !== 'style' && xmode !== 'styleproperty' &&
                    source_row.charAt(0).isAlpha()) {
                warn_at('expected_space_a_b',
                    line, character, c, source_row.charAt(0));
            }
            if (c === '0') {
                digit = snippet.charAt(1);
                if (digit.isDigit()) {
                    if (token.id !== '.' && xmode !== 'styleproperty') {
                        warn_at('unexpected_a', line, character, snippet);
                    }
                } else if (json_mode && (digit === 'x' || digit === 'X')) {
                    warn_at('unexpected_a', line, character, '0x');
                }
            }
            if (snippet.slice(snippet.length - 1) === '.') {
                warn_at('trailing_decimal_a', line, character, snippet);
            }
            if (xmode !== 'style') {
                digit = +snippet;
                if (!isFinite(digit)) {
                    warn_at('bad_number', line, character, snippet);
                }
                snippet = digit;
            }
            return it('(number)', snippet);
        }

        function regexp() {
            var b,
                bit,
                captures = 0,
                depth = 0,
                flag,
                high,
                length = 0,
                low,
                quote;
            for (; ; ) {
                b = true;
                c = source_row.charAt(length);
                length += 1;
                switch (c) {
                    case '':
                        stop_at('unclosed_regexp', line, from);
                        return;
                    case '/':
                        if (depth > 0) {
                            warn_at('unescaped_a',
                            line, from + length, '/');
                        }
                        c = source_row.slice(0, length - 1);
                        flag = Object.create(regexp_flag);
                        while (flag[source_row.charAt(length)] === true) {
                            flag[source_row.charAt(length)] = false;
                            length += 1;
                        }
                        if (source_row.charAt(length).isAlpha()) {
                            stop_at('unexpected_a',
                            line, from, source_row.charAt(length));
                        }
                        character += length;
                        source_row = source_row.slice(length);
                        quote = source_row.charAt(0);
                        if (quote === '/' || quote === '*') {
                            stop_at('confusing_regexp',
                            line, from);
                        }
                        return it('(regexp)', c);
                    case '\\':
                        c = source_row.charAt(length);
                        if (c < ' ') {
                            warn_at('control_a',
                            line, from + length, String(c));
                        } else if (c === '<') {
                            warn_at(
                            bundle.unexpected_a,
                            line,
                            from + length,
                            '\\'
                        );
                        }
                        length += 1;
                        break;
                    case '(':
                        depth += 1;
                        b = false;
                        if (source_row.charAt(length) === '?') {
                            length += 1;
                            switch (source_row.charAt(length)) {
                                case ':':
                                case '=':
                                case '!':
                                    length += 1;
                                    break;
                                default:
                                    warn_at(
                                bundle.expected_a_b,
                                line,
                                from + length,
                                ':',
                                source_row.charAt(length)
                            );
                            }
                        } else {
                            captures += 1;
                        }
                        break;
                    case '|':
                        b = false;
                        break;
                    case ')':
                        if (depth === 0) {
                            warn_at('unescaped_a',
                            line, from + length, ')');
                        } else {
                            depth -= 1;
                        }
                        break;
                    case ' ':
                        pos = 1;
                        while (source_row.charAt(length) === ' ') {
                            length += 1;
                            pos += 1;
                        }
                        if (pos > 1) {
                            warn_at('use_braces',
                            line, from + length, pos);
                        }
                        break;
                    case '[':
                        c = source_row.charAt(length);
                        if (c === '^') {
                            length += 1;
                            if (!option.regexp) {
                                warn_at('insecure_a',
                                line, from + length, c);
                            } else if (source_row.charAt(length) === ']') {
                                stop_at('unescaped_a',
                                line, from + length, '^');
                            }
                        }
                        bit = false;
                        if (c === ']') {
                            warn_at('empty_class', line,
                            from + length - 1);
                            bit = true;
                        }
                        klass: do {
                            c = source_row.charAt(length);
                            length += 1;
                            switch (c) {
                                case '[':
                                case '^':
                                    warn_at('unescaped_a',
                                line, from + length, c);
                                    bit = true;
                                    break;
                                case '-':
                                    if (bit) {
                                        bit = false;
                                    } else {
                                        warn_at('unescaped_a',
                                    line, from + length, '-');
                                        bit = true;
                                    }
                                    break;
                                case ']':
                                    if (!bit) {
                                        warn_at('unescaped_a',
                                    line, from + length - 1, '-');
                                    }
                                    break klass;
                                case '\\':
                                    c = source_row.charAt(length);
                                    if (c < ' ') {
                                        warn_at(
                                    bundle.control_a,
                                    line,
                                    from + length,
                                    String(c)
                                );
                                    } else if (c === '<') {
                                        warn_at(
                                    bundle.unexpected_a,
                                    line,
                                    from + length,
                                    '\\'
                                );
                                    }
                                    length += 1;
                                    bit = true;
                                    break;
                                case '/':
                                    warn_at('unescaped_a',
                                line, from + length - 1, '/');
                                    bit = true;
                                    break;
                                case '<':
                                    if (xmode === 'script') {
                                        c = source_row.charAt(length);
                                        if (c === '!' || c === '/') {
                                            warn_at(
                                        bundle.html_confusion_a,
                                        line,
                                        from + length,
                                        c
                                    );
                                        }
                                    }
                                    bit = true;
                                    break;
                                default:
                                    bit = true;
                            }
                        } while (c);
                        break;
                    case '.':
                        if (!option.regexp) {
                            warn_at('insecure_a', line,
                            from + length, c);
                        }
                        break;
                    case ']':
                    case '?':
                    case '{':
                    case '}':
                    case '+':
                    case '*':
                        warn_at('unescaped_a', line,
                        from + length, c);
                        break;
                    case '<':
                        if (xmode === 'script') {
                            c = source_row.charAt(length);
                            if (c === '!' || c === '/') {
                                warn_at(
                                bundle.html_confusion_a,
                                line,
                                from + length,
                                c
                            );
                            }
                        }
                        break;
                }
                if (b) {
                    switch (source_row.charAt(length)) {
                        case '?':
                        case '+':
                        case '*':
                            length += 1;
                            if (source_row.charAt(length) === '?') {
                                length += 1;
                            }
                            break;
                        case '{':
                            length += 1;
                            c = source_row.charAt(length);
                            if (c < '0' || c > '9') {
                                warn_at(
                                bundle.expected_number_a,
                                line,
                                from + length,
                                c
                            );
                            }
                            length += 1;
                            low = +c;
                            for (; ; ) {
                                c = source_row.charAt(length);
                                if (c < '0' || c > '9') {
                                    break;
                                }
                                length += 1;
                                low = +c + (low * 10);
                            }
                            high = low;
                            if (c === ',') {
                                length += 1;
                                high = Infinity;
                                c = source_row.charAt(length);
                                if (c >= '0' && c <= '9') {
                                    length += 1;
                                    high = +c;
                                    for (; ; ) {
                                        c = source_row.charAt(length);
                                        if (c < '0' || c > '9') {
                                            break;
                                        }
                                        length += 1;
                                        high = +c + (high * 10);
                                    }
                                }
                            }
                            if (source_row.charAt(length) !== '}') {
                                warn_at(
                                bundle.expected_a_b,
                                line,
                                from + length,
                                '}',
                                c
                            );
                            } else {
                                length += 1;
                            }
                            if (source_row.charAt(length) === '?') {
                                length += 1;
                            }
                            if (low > high) {
                                warn_at(
                                bundle.not_greater,
                                line,
                                from + length,
                                low,
                                high
                            );
                            }
                            break;
                    }
                }
            }
            c = source_row.slice(0, length - 1);
            character += length;
            source_row = source_row.slice(length);
            return it('(regexp)', c);
        }

        // Public lex methods

        return {
            init: function (source) {
                if (typeof source === 'string') {
                    lines = source
                        .replace(crlfx, '\n')
                        .replace(crx, '\n')
                        .split('\n');
                } else {
                    lines = source;
                }
                line = 0;
                next_line();
                from = 1;
            },

            range: function (begin, end) {
                var c, value = '';
                from = character;
                if (source_row.charAt(0) !== begin) {
                    stop_at('expected_a_b', line, character, begin,
                        source_row.charAt(0));
                }
                for (; ; ) {
                    source_row = source_row.slice(1);
                    character += 1;
                    c = source_row.charAt(0);
                    switch (c) {
                        case '':
                            stop_at('missing_a', line, character, c);
                            break;
                        case end:
                            source_row = source_row.slice(1);
                            character += 1;
                            return it('(range)', value);
                        case xquote:
                        case '\\':
                            warn_at('unexpected_a', line, character, c);
                            break;
                    }
                    value += c;
                }
            },

            // token -- this is called by advance to get the next token.

            token: function () {
                var c, i, quote, snippet;

                for (; ; ) {
                    while (!source_row) {
                        if (!next_line()) {
                            return it('(end)');
                        }
                    }
                    while (xmode === 'outer') {
                        i = source_row.search(ox);
                        if (i === 0) {
                            break;
                        } else if (i > 0) {
                            character += 1;
                            source_row = source_row.slice(i);
                            break;
                        } else {
                            if (!next_line()) {
                                return it('(end)', '');
                            }
                        }
                    }
                    snippet = match(rx[xmode] || tx);
                    if (!snippet) {
                        snippet = '';
                        c = '';
                        while (source_row && source_row < '!') {
                            source_row = source_row.slice(1);
                        }
                        if (source_row) {
                            if (xmode === 'html') {
                                return it('(error)', source_row.charAt(0));
                            } else {
                                stop_at('unexpected_a',
                                    line, character, source_row.charAt(0));
                            }
                        }
                    } else {

                        //      identifier

                        c = snippet.charAt(0);
                        if (c.isAlpha() || c === '_' || c === '$') {
                            return it('(identifier)', snippet);
                        }

                        //      number

                        if (c.isDigit()) {
                            return number(snippet);
                        }
                        switch (snippet) {

                            //      string  

                            case '"':
                            case "'":
                                return string(snippet);

                                //      // comment

                            case '//':
                                collect_comment(source_row, '//', line, character);
                                source_row = '';
                                break;

                            //      /* comment  

                            case '/*':
                                quote = '/*';
                                for (; ; ) {
                                    i = source_row.search(lx);
                                    if (i >= 0) {
                                        break;
                                    }
                                    collect_comment(source_row, quote, line, character);
                                    quote = '';
                                    if (!next_line()) {
                                        stop_at('unclosed_comment', line, character);
                                    }
                                }
                                collect_comment(source_row.slice(0, i), quote, character, line);
                                character += i + 2;
                                if (source_row.charAt(i) === '/') {
                                    stop_at('nested_comment', line, character);
                                }
                                source_row = source_row.slice(i + 2);
                                break;

                            case '':
                                break;
                            //      /  
                            case '/':
                                if (token.id === '/=') {
                                    stop_at(
                                    bundle.slash_equal,
                                    line,
                                    from
                                );
                                }
                                return prereg ? regexp() : it('(punctuator)', snippet);

                                //      punctuator

                            case '<!--':
                                length = line;
                                //                            c = character;
                                for (; ; ) {
                                    i = source_row.indexOf('--');
                                    if (i >= 0) {
                                        break;
                                    }
                                    i = source_row.indexOf('<!');
                                    if (i >= 0) {
                                        stop_at('nested_comment',
                                        line, character + i);
                                    }
                                    if (!next_line()) {
                                        stop_at('unclosed_comment', length, c);
                                    }
                                }
                                length = source_row.indexOf('<!');
                                if (length >= 0 && length < i) {
                                    stop_at('nested_comment',
                                    line, character + length);
                                }
                                character += i;
                                if (source_row.charAt(i + 2) !== '>') {
                                    stop_at('expected_a', line, character, '-->');
                                }
                                character += 3;
                                source_row = source_row.slice(i + 3);
                                break;
                            case '#':
                                if (xmode === 'html' || xmode === 'styleproperty') {
                                    for (; ; ) {
                                        c = source_row.charAt(0);
                                        if ((c < '0' || c > '9') &&
                                            (c < 'a' || c > 'f') &&
                                            (c < 'A' || c > 'F')) {
                                            break;
                                        }
                                        character += 1;
                                        source_row = source_row.slice(1);
                                        snippet += c;
                                    }
                                    if (snippet.length !== 4 && snippet.length !== 7) {
                                        warn_at('bad_color_a', line,
                                        from + length, snippet);
                                    }
                                    return it('(color)', snippet);
                                }
                                return it('(punctuator)', snippet);

                            default:
                                if (xmode === 'outer' && c === '&') {
                                    character += 1;
                                    source_row = source_row.slice(1);
                                    for (; ; ) {
                                        c = source_row.charAt(0);
                                        character += 1;
                                        source_row = source_row.slice(1);
                                        if (c === ';') {
                                            break;
                                        }
                                        if (!((c >= '0' && c <= '9') ||
                                            (c >= 'a' && c <= 'z') ||
                                            c === '#')) {
                                            stop_at('bad_entity', line, from + length,
                                            character);
                                        }
                                    }
                                    break;
                                }
                                return it('(punctuator)', snippet);
                        }
                    }
                }
            }
        };
    } ());


    function add_label(token, kind, name) {

        // Define the symbol in the current function in the current scope.

        name = name || token.value;

        // Global variables cannot be created in the safe subset. If a global variable
        // already exists, do nothing. If it is predefined, define it.

        if (funct === global_funct) {
            if (option.safe) {
                warn('adsafe_a', token, name);
            }
            if (typeof global_funct[name] !== 'string') {
                token.writeable = typeof predefined[name] === 'boolean' ?
                    predefined[name] : true;
                token.funct = funct;
                global_scope[name] = token;
            }
            if (kind === 'becoming') {
                kind = 'var';
            }

            // Ordinary variables.

        } else {

            // Warn if the variable already exists.

            if (typeof funct[name] === 'string') {
                if (funct[name] === 'undef') {
                    if (!option.undef) {
                        warn('used_before_a', token, name);
                    }
                    kind = 'var';
                } else {
                    warn('already_defined', token, name);
                }
            } else {

                // Add the symbol to the current function.

                token.funct = funct;
                token.writeable = true;
                scope[name] = token;
            }
        }
        funct[name] = kind;
    }


    function peek(distance) {

        // Peek ahead to a future token. The distance is how far ahead to look. The
        // default is the next token.

        var found, slot = 0;

        distance = distance || 0;
        while (slot <= distance) {
            found = lookahead[slot];
            if (!found) {
                found = lookahead[slot] = lex.token();
            }
            slot += 1;
        }
        return found;
    }


    function discard(it) {

        // The token will not be included in the parse tree, so move the comments
        // that are attached to the token to tokens that are in the tree.

        it = it || token;
        if (it.comments) {
            var prev = it.prev;
            while (prev.comments === null) {
                prev = prev.prev;
            }
            if (prev.comments) {
                prev.comments = prev.comments.concat(it.comments);
            } else {
                prev.comments = it.comments;
            }
        }
        it.comments = null;
    }


    function advance(id, match) {

        // Produce the next token, also looking for programming errors.

        if (indent) {

            // In indentation checking was requested, then inspect all of the line breakings.
            // The var statement is tricky because the names might be aligned or not. We
            // look at the first line break after the var to determine the programmer's
            // intention.

            if (var_mode && next_token.line !== token.line) {
                if ((var_mode !== indent || !next_token.edge) &&
                        next_token.from === indent.at -
                        (next_token.edge ? option.indent : 0)) {
                    var dent = indent;
                    for (; ; ) {
                        dent.at -= option.indent;
                        if (dent === var_mode) {
                            break;
                        }
                        dent = dent.was;
                    }
                    dent.open = false;
                }
                var_mode = null;
            }
            if (indent.open) {

                // If the token is an edge.

                if (next_token.edge) {
                    if (next_token.edge === 'label') {
                        expected_at(1);
                    } else if (next_token.edge === 'case') {
                        expected_at(indent.at - option.indent);
                    } else if (indent.mode !== 'array' || next_token.line !== token.line) {
                        expected_at(indent.at);
                    }

                    // If the token is not an edge, but is the first token on the line.

                } else if (next_token.line !== token.line) {
                    if (next_token.from < indent.at + (indent.mode ===
                            'expression' ? 0 : option.indent)) {
                        expected_at(indent.at + option.indent);
                    }
                    indent.wrap = true;
                }
            } else if (next_token.line !== token.line) {
                if (next_token.edge) {
                    expected_at(indent.at);
                } else {
                    indent.wrap = true;
                    if (indent.mode === 'statement' || indent.mode === 'var') {
                        expected_at(indent.at + option.indent);
                    } else if (next_token.from < indent.at + (indent.mode ===
                            'expression' ? 0 : option.indent)) {
                        expected_at(indent.at + option.indent);
                    }
                }
            }
        }

        switch (token.id) {
            case '(number)':
                if (next_token.id === '.') {
                    warn('trailing_decimal_a');
                }
                break;
            case '-':
                if (next_token.id === '-' || next_token.id === '--') {
                    warn('confusing_a');
                }
                break;
            case '+':
                if (next_token.id === '+' || next_token.id === '++') {
                    warn('confusing_a');
                }
                break;
        }
        if (token.id === '(string)' || token.identifier) {
            anonname = token.value;
        }

        if (id && next_token.id !== id) {
            if (match) {
                warn('expected_a_b_from_c_d', next_token, id,
                    match.id, match.line, next_token.value);
            } else if (!next_token.identifier || next_token.value !== id) {
                warn('expected_a_b', next_token, id, next_token.value);
            }
        }
        prev_token = token;
        token = next_token;
        next_token = lookahead.shift() || lex.token();
        if (token.id === '(end)') {
            discard();
        }
    }


    function do_safe() {
        if (option.adsafe) {
            option.safe = true;
        }
        if (option.safe) {
            option.browser =
                option['continue'] =
                option.css =
                option.debug =
                option.devel =
                option.evil =
                option.forin =
                option.newcap =
                option.nomen =
                option.on =
                option.rhino =
                option.sloppy =
                option.sub =
                option.undef =
                option.widget =
                option.windows = false;


            delete predefined.Array;
            delete predefined.Date;
            delete predefined.Function;
            delete predefined.Object;
            delete predefined['eval'];

            add_to_predefined({
                ADSAFE: false,
                lib: false
            });
        }
    }


    function do_globals() {
        var name, writeable;
        for (; ; ) {
            if (next_token.id !== '(string)' && !next_token.identifier) {
                return;
            }
            name = next_token.value;
            advance();
            writeable = false;
            if (next_token.id === ':') {
                advance(':');
                switch (next_token.id) {
                    case 'true':
                        writeable = predefined[name] !== false;
                        advance('true');
                        break;
                    case 'false':
                        advance('false');
                        break;
                    default:
                        stop('unexpected_a');
                }
            }
            predefined[name] = writeable;
            if (next_token.id !== ',') {
                return;
            }
            advance(',');
        }
    }


    function do_jslint() {
        var name, value;
        while (next_token.id === '(string)' || next_token.identifier) {
            name = next_token.value;
            advance();
            if (next_token.id !== ':') {
                stop('expected_a_b', next_token, ':', next_token.value);
            }
            advance(':');
            switch (name) {
                case 'indent':
                    value = +next_token.value;
                    if (typeof value !== 'number' ||
                        !isFinite(value) || value < 0 ||
                        Math.floor(value) !== value) {
                        stop('expected_small_a');
                    }
                    option.indent = value;
                    break;
                case 'maxerr':
                    value = +next_token.value;
                    if (typeof value !== 'number' ||
                        !isFinite(value) ||
                        value <= 0 ||
                        Math.floor(value) !== value) {
                        stop('expected_small_a', next_token);
                    }
                    option.maxerr = value;
                    break;
                case 'maxlen':
                    value = +next_token.value;
                    if (typeof value !== 'number' || !isFinite(value) || value < 0 ||
                        Math.floor(value) !== value) {
                        stop('expected_small_a');
                    }
                    option.maxlen = value;
                    break;
                default:
                    if (next_token.id === 'true') {
                        option[name] = true;
                    } else if (next_token.id === 'false') {
                        option[name] = false;
                    } else {
                        stop('unexpected_a');
                    }
                    if (name === 'adsafe') {
                        option.adsafe = option.safe = true;
                        do_safe();
                    } else if (name === 'safe') {
                        do_safe();
                    }
            }
            advance();
            if (next_token.id === ',') {
                advance(',');
            }
        }
        assume();
    }


    function do_properties() {
        if (!properties) {
            properties = {};
        }
        for (; ; ) {
            if (next_token.id !== '(string)' && !next_token.identifier) {
                return;
            }
            properties[next_token.value] = true;
            advance();
            if (next_token.id !== ',') {
                return;
            }
            advance(',');
        }
    }


    function directive() {
        var command = this.id,
            old_comments_off = comments_off;
        if (next_token.line === token.line && next_token.from === token.thru) {
            warn('missing_space_a_b', next_token, token.value, next_token.value);
        }
        comments_off = true;
        option.white = true;
        if (lookahead.length > 0 || next_token.comments) {
            warn('unexpected_a', this);
        }
        switch (command) {
            case '/*properties':
            case '/*property':
            case '/*members':
            case '/*member':
                do_properties();
                break;
            case '/*jslint':
                if (option.safe) {
                    warn('adsafe_a', this);
                }
                do_jslint();
                break;
            case '/*globals':
            case '/*global':
                if (option.safe) {
                    warn('adsafe_a', this);
                }
                do_globals();
                break;
            default:
                stop('unpexpected_a', this);
        }
        comments_off = old_comments_off;
        advance('*/');
    }


    // Indentation intention

    function edge(mode) {
        next_token.edge = !indent || (indent.open && (mode || true));
    }


    function step_in(mode) {
        var open, was;
        if (typeof mode === 'number') {
            indent = {
                at: mode,
                open: true,
                was: was
            };
        } else if (!indent) {
            indent = {
                at: 1,
                mode: 'statement',
                open: true
            };
        } else {
            was = indent;
            open = mode === 'var' ||
                (next_token.line !== token.line && mode !== 'statement');
            indent = {
                at: (open || mode === 'control' ?
                    was.at + option.indent : was.at) +
                    (was.wrap ? option.indent : 0),
                mode: mode,
                open: open,
                was: was
            };
            if (mode === 'var' && open) {
                var_mode = indent;
            }
        }
    }

    function step_out(id, symbol) {
        if (id) {
            if (indent && indent.open) {
                indent.at -= option.indent;
                edge();
            }
            advance(id, symbol);
        }
        if (indent) {
            indent = indent.was;
        }
    }

    // Functions for conformance of whitespace.

    function one_space(left, right) {
        left = left || token;
        right = right || next_token;
        if (right.id !== '(end)' && !option.white &&
                (token.line !== right.line ||
                token.thru + 1 !== right.from)) {
            warn('expected_space_a_b', right, token.value, right.value);
        }
    }

    function one_space_only(left, right) {
        left = left || token;
        right = right || next_token;
        if (right.id !== '(end)' && (left.line !== right.line ||
                (!option.white && left.thru + 1 !== right.from))) {
            warn('expected_space_a_b', right, left.value, right.value);
        }
    }

    function no_space(left, right) {
        left = left || token;
        right = right || next_token;
        if ((!option.white || xmode === 'styleproperty' || xmode === 'style') &&
                left.thru !== right.from && left.line === right.line) {
            warn('unexpected_space_a_b', right, left.value, right.value);
        }
    }

    function no_space_only(left, right) {
        left = left || token;
        right = right || next_token;
        if (right.id !== '(end)' && (left.line !== right.line ||
                (!option.white && left.thru !== right.from))) {
            warn('unexpected_space_a_b', right, left.value, right.value);
        }
    }

    function spaces(left, right) {
        if (!option.white) {
            left = left || token;
            right = right || next_token;
            if (left.thru === right.from && left.line === right.line) {
                warn('missing_space_a_b', right, left.value, right.value);
            }
        }
    }

    function comma() {
        if (next_token.id !== ',') {
            warn_at('expected_a_b', token.line, token.thru, ',', next_token.value);
        } else {
            if (!option.white) {
                no_space_only();
            }
            advance(',');
            discard();
            spaces();
        }
    }


    function semicolon() {
        if (next_token.id !== ';') {
            warn_at('expected_a_b', token.line, token.thru, ';', next_token.value);
        } else {
            if (!option.white) {
                no_space_only();
            }
            advance(';');
            discard();
            if (semicolon_coda[next_token.id] !== true) {
                spaces();
            }
        }
    }

    function use_strict() {
        if (next_token.value === 'use strict') {
            if (strict_mode) {
                warn('unnecessary_use');
            }
            edge();
            advance();
            semicolon();
            strict_mode = true;
            option.newcap = false;
            option.undef = false;
            return true;
        } else {
            return false;
        }
    }


    function are_similar(a, b) {
        if (a === b) {
            return true;
        }
        if (Array.isArray(a)) {
            if (Array.isArray(b) && a.length === b.length) {
                var i;
                for (i = 0; i < a.length; i += 1) {
                    if (!are_similar(a[i], b[i])) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        }
        if (Array.isArray(b)) {
            return false;
        }
        if (a.arity === b.arity && a.value === b.value) {
            switch (a.arity) {
                case 'prefix':
                case 'suffix':
                case undefined:
                    return a.id === b.id && are_similar(a.first, b.first);
                case 'infix':
                    return are_similar(a.first, b.first) &&
                    are_similar(a.second, b.second);
                case 'ternary':
                    return are_similar(a.first, b.first) &&
                    are_similar(a.second, b.second) &&
                    are_similar(a.third, b.third);
                case 'function':
                case 'regexp':
                    return false;
                default:
                    return true;
            }
        } else {
            if (a.id === '.' && b.id === '[' && b.arity === 'infix') {
                return a.second.value === b.second.value && b.second.id === '(string)';
            } else if (a.id === '[' && a.arity === 'infix' && b.id === '.') {
                return a.second.value === b.second.value && a.second.id === '(string)';
            }
        }
        return false;
    }


    // This is the heart of JSLINT, the Pratt parser. In addition to parsing, it
    // is looking for ad hoc lint patterns. We add .fud to Pratt's model, which is
    // like .nud except that it is only used on the first token of a statement.
    // Having .fud makes it much easier to define statement-oriented languages like
    // JavaScript. I retained Pratt's nomenclature.

    // .nud     Null denotation
    // .fud     First null denotation
    // .led     Left denotation
    //  lbp     Left binding power
    //  rbp     Right binding power

    // They are elements of the parsing method called Top Down Operator Precedence.

    function expression(rbp, initial) {

        // rbp is the right binding power.
        // initial indicates that this is the first expression of a statement.

        var left;
        if (next_token.id === '(end)') {
            stop('unexpected_a', token, next_token.id);
        }
        advance();
        if (option.safe && scope[token.value] &&
                scope[token.value] === global_scope[token.value] &&
                (next_token.id !== '(' && next_token.id !== '.')) {
            warn('adsafe', token);
        }
        if (initial) {
            anonname = 'anonymous';
            funct['(verb)'] = token.value;
        }
        if (initial === true && token.fud) {
            left = token.fud();
        } else {
            if (token.nud) {
                left = token.nud();
            } else {
                if (next_token.id === '(number)' && token.id === '.') {
                    warn('leading_decimal_a', token,
                        next_token.value);
                    advance();
                    return token;
                } else {
                    stop('expected_identifier_a', token, token.id);
                }
            }
            while (rbp < next_token.lbp) {
                advance();
                if (token.led) {
                    left = token.led(left);
                } else {
                    stop('expected_operator_a', token, token.id);
                }
            }
        }
        return left;
    }


    // Functional constructors for making the symbols that will be inherited by
    // tokens.

    function symbol(s, p) {
        var x = syntax[s];
        if (!x || typeof x !== 'object') {
            syntax[s] = x = {
                id: s,
                lbp: p,
                value: s
            };
        }
        return x;
    }


    function delim(s) {
        return symbol(s, 0);
    }


    function postscript(x) {
        x.postscript = true;
        return x;
    }

    function ultimate(s) {
        var x = symbol(s, 0);
        x.from = 1;
        x.thru = 1;
        x.line = 0;
        x.edge = true;
        s.value = s;
        return postscript(x);
    }


    function stmt(s, f) {
        var x = delim(s);
        x.identifier = x.reserved = true;
        x.fud = f;
        return x;
    }

    function labeled_stmt(s, f) {
        var x = stmt(s, f);
        x.labeled = true;
    }

    function disrupt_stmt(s, f) {
        var x = stmt(s, f);
        x.disrupt = true;
    }


    function reserve_name(x) {
        var c = x.id.charAt(0);
        if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
            x.identifier = x.reserved = true;
        }
        return x;
    }


    function prefix(s, f, type) {
        var x = symbol(s, 150);
        reserve_name(x);
        x.nud = (typeof f === 'function') ? f : function () {
            if (s === 'typeof') {
                one_space();
            } else {
                no_space_only();
            }
            this.first = expression(150);
            this.arity = 'prefix';
            if (this.id === '++' || this.id === '--') {
                if (!option.plusplus) {
                    warn('unexpected_a', this);
                } else if ((!this.first.identifier || this.first.reserved) &&
                        this.first.id !== '.' && this.first.id !== '[') {
                    warn('bad_operand', this);
                }
            }
            this.type = type;
            return this;
        };
        return x;
    }


    function type(s, t, nud) {
        var x = delim(s);
        x.arity = x.type = t;
        if (nud) {
            x.nud = nud;
        }
        return x;
    }

    function get_type(one) {
        var a = (one.identifier && scope[one.value]) || one;
        return a && a.type;
    }


    function conform_type(one, two, three) {

        // This takes a type string or a token, or two tokens. Optionally, it can
        // take a third token that is used as the site of the warning.

        var match = '', one_type, two_type, one_token, two_token;
        if (typeof one === 'string') {
            one_type = one;
        } else {
            one_token = (one.identifier && scope[one.value]) || one;
            one_type = one_token.type;
        }
        two_token = (two.identifier && scope[two.value]) || two;
        two_type = two_token.type;
        if (one_type) {
            if (two_type) {
                if (one_type === two_type) {
                    match = one_type;
                } else {
                    if (!option.type) {
                        warn('type_inconsistency_a_b', three || two,
                            one_type, two_type);
                    }
                }
            } else {
                two_token.type = match = one_type;
            }
        } else if (two_type) {
            if (one_token) {
                one_token.type = two_type;
            }
            match = two_type;
        }
        return match;
    }


    function reserve(s, f) {
        var x = delim(s);
        x.identifier = x.reserved = true;
        if (typeof f === 'function') {
            x.nud = f;
        }
        return x;
    }


    function constant(name, type, value) {
        var x = reserve(name);
        x.type = type;
        x.value = value;
        x.nud = return_this;
        return x;
    }


    function reservevar(s, v) {
        return reserve(s, function () {
            if (typeof v === 'function') {
                v(this);
            }
            return this;
        });
    }


    function infix(s, p, f, type, w) {
        var x = symbol(s, p);
        reserve_name(x);
        x.led = function (left) {
            this.arity = 'infix';
            if (!w) {
                spaces(prev_token, token);
                spaces();
            }
            if (!option.bitwise && this.bitwise) {
                warn('unexpected_a', this);
            }
            if (typeof f === 'function') {
                return f(left, this);
            } else {
                this.first = left;
                this.second = expression(p);
                return this;
            }
        };
        if (type) {
            x.type = type;
        }
        return x;
    }

    function expected_relation(node, message) {
        if (node.assign) {
            warn(message || bundle.conditional_assignment, node);
        }
        return node;
    }

    function expected_condition(node, message) {
        switch (node.id) {
            case '[':
            case '-':
                if (node.arity !== 'infix') {
                    warn(message || bundle.weird_condition, node);
                }
                break;
            case 'false':
            case 'function':
            case 'Infinity':
            case 'NaN':
            case 'null':
            case 'true':
            case 'undefined':
            case 'void':
            case '(number)':
            case '(regexp)':
            case '(string)':
            case '{':
                warn(message || bundle.weird_condition, node);
                break;
            case '(':
                if (node.first.id === '.' && numbery[node.first.second.value] === true) {
                    warn(message || bundle.weird_condition, node);
                }
                break;
        }
        return node;
    }

    function check_relation(node) {
        switch (node.arity) {
            case 'prefix':
                switch (node.id) {
                    case '{':
                    case '[':
                        warn('unexpected_a', node);
                        break;
                    case '!':
                        warn('confusing_a', node);
                        break;
                }
                break;
            case 'function':
            case 'regexp':
                warn('unexpected_a', node);
                break;
            default:
                if (node.id === 'NaN') {
                    warn('isnan', node);
                }
        }
        return node;
    }


    function relation(s, eqeq) {
        return infix(s, 100, function (left, that) {
            check_relation(left);
            if (eqeq && !option.eqeq) {
                warn('expected_a_b', that, eqeq, that.id);
            }
            var right = expression(100);
            if (are_similar(left, right) ||
                    ((left.id === '(string)' || left.id === '(number)') &&
                    (right.id === '(string)' || right.id === '(number)'))) {
                warn('weird_relation', that);
            }
            that.first = left;
            that.second = check_relation(right);
            conform_type(left, that.second, that);
            return that;
        }, 'boolean');
    }


    function assignop(s, op) {
        var x = infix(s, 20, function (left, that) {
            var l;
            that.first = left;
            if (left.identifier) {
                if (scope[left.value]) {
                    if (scope[left.value].writeable === false) {
                        warn('read_only', left);
                    }
                } else {
                    stop('read_only');
                }
            } else if (option.safe) {
                l = left;
                do {
                    if (typeof predefined[l.value] === 'boolean') {
                        warn('adsafe', l);
                    }
                    l = l.first;
                } while (l);
            }
            if (left === syntax['function']) {
                warn('identifier_function', token);
            }
            if (left.id === '.' || left.id === '[') {
                if (!left.first || left.first.value === 'arguments') {
                    warn('bad_assignment', that);
                }
                that.second = expression(19);
                if (that.id === '=' && are_similar(that.first, that.second)) {
                    warn('weird_assignment', that);
                }
            } else if (left.identifier && !left.reserved) {
                if (funct[left.value] === 'exception') {
                    warn('assign_exception', left);
                }
                that.second = expression(19);
                if (that.id === '=' && are_similar(that.first, that.second)) {
                    warn('weird_assignment', that);
                }
                if (that.type) {
                    conform_type(left, that);
                    conform_type(that, that.second, that);
                } else {
                    conform_type(left, that.second, that);
                }
            }
            return that;
        });
        x.assign = true;
        if (op) {
            if (syntax[op].type) {
                x.type = syntax[op].type;
            }
            if (syntax[op].bitwise) {
                x.bitwise = true;
            }
        }
        return x;
    }


    function bitwise(s, p) {
        var x = infix(s, p, 'number');
        x.bitwise = true;
        return x;
    }


    function suffix(s) {
        var x = symbol(s, 150);
        x.led = function (left) {
            no_space_only(prev_token, token);
            if (!option.plusplus) {
                warn('unexpected_a', this);
            } else if ((!left.identifier || left.reserved) &&
                    left.id !== '.' && left.id !== '[') {
                warn('bad_operand', this);
            }
            this.first = left;
            this.arity = 'suffix';
            return this;
        };
        return x;
    }


    function optional_identifier() {
        if (next_token.identifier) {
            advance();
            if (option.safe && banned[token.value]) {
                warn('adsafe_a', token);
            } else if (token.reserved && !option.es5) {
                warn('expected_identifier_a_reserved', token);
            }
            return token.value;
        }
    }

    /* gyeby: original */
    //function identifier() {
    //    var i = optional_identifier();
    //    if (!i) {
    //        stop(token.id === 'function' && next_token.id === '(' ?
    //            'name_function' : 'expected_identifier_a');
    //    }
    //    return i;
    //}
    /* gyeby: patch */
    function identifier() {
        return optional_identifier();
        //var i = optional_identifier();
        //if (!i)
        //    if(token.id === 'function' && next_token.id === '(')
        //        return "__anonym";
        //return i;
    }


    function statement() {

        var label, old_scope = scope, the_statement;

        // We don't like the empty statement.

        if (next_token.id === ';') {
            warn('unexpected_a');
            semicolon();
            return;
        }

        // Is this a labeled statement?

        if (next_token.identifier && !next_token.reserved && peek().id === ':') {
            edge('label');
            label = next_token;
            advance();
            discard();
            advance(':');
            discard();
            scope = Object.create(old_scope);
            add_label(label, 'label');
            if (next_token.labeled !== true) {
                warn('label_a_b', next_token, label.value, next_token.value);
            } else if (jx.test(label.value + ':')) {
                warn('url', label);
            } else if (funct === global_funct) {
                stop('unexpected_a', token);
            }
            next_token.label = label;
        }

        // Parse the statement.

        edge();
        step_in('statement');
        the_statement = expression(0, true);
        if (the_statement) {

            // Look for the final semicolon.

            if (the_statement.arity === 'statement') {
                if (the_statement.id === 'switch' ||
                        (the_statement.block && the_statement.id !== 'do')) {
                    spaces();
                } else {
                    semicolon();
                }
            } else {

                // If this is an expression statement, determine if it is acceptable.
                // We do not like
                //      new Blah();
                // statments. If it is to be used at all, new should only be used to make
                // objects, not side effects. The expression statements we do like do
                // assignment or invocation or delete.

                if (the_statement.id === '(') {
                    if (the_statement.first.id === 'new') {
                        warn('bad_new');
                    }
                } else if (!the_statement.assign &&
                        the_statement.id !== 'delete' &&
                        the_statement.id !== '++' &&
                        the_statement.id !== '--') {
                    warn('assignment_function_expression', token);
                }
                semicolon();
            }
        }
        step_out();
        scope = old_scope;
        return the_statement;
    }


    function statements() {
        var array = [], disruptor, the_statement;

        // A disrupt statement may not be followed by any other statement.
        // If the last statement is disrupt, then the sequence is disrupt.

        while (next_token.postscript !== true) {
            if (next_token.id === ';') {
                warn('unexpected_a', next_token);
                semicolon();
            } else {
                if (next_token.value === 'use strict') {
                    if (!node_js || funct !== global_funct || array.length > 0) {
                        warn('function_strict');
                    }
                    use_strict();
                }
                if (disruptor) {
                    warn('unreachable_a_b', next_token, next_token.value,
                        disruptor.value);
                    disruptor = null;
                }
                the_statement = statement();
                if (the_statement) {
                    array.push(the_statement);
                    if (the_statement.disrupt) {
                        disruptor = the_statement;
                        array.disrupt = true;
                    }
                }
            }
        }
        return array;
    }


    function block(ordinary) {

        // array block is array sequence of statements wrapped in braces.
        // ordinary is false for function bodies and try blocks.
        // ordinary is true for if statements, while, etc.

        var array,
            curly = next_token,
            old_inblock = in_block,
            old_scope = scope,
            old_strict_mode = strict_mode;

        in_block = ordinary;
        scope = Object.create(scope);
        spaces();
        if (next_token.id === '{') {
            advance('{');
            step_in();
            if (!ordinary && !use_strict() && !old_strict_mode &&
                    !option.sloppy && funct['(context)'] === global_funct) {
                warn('missing_use_strict');
            }
            array = statements();
            strict_mode = old_strict_mode;
            step_out('}', curly);
            discard();
        } else if (!ordinary) {
            stop('expected_a_b', next_token, '{', next_token.value);
        } else {
            warn('expected_a_b', next_token, '{', next_token.value);
            array = [statement()];
            array.disrupt = array[0].disrupt;
        }
        funct['(verb)'] = null;
        scope = old_scope;
        in_block = old_inblock;
        if (ordinary && array.length === 0) {
            warn('empty_block');
        }
        return array;
    }


    function tally_property(name) {
        if (properties && typeof properties[name] !== 'boolean') {
            warn('unexpected_property_a', token, name);
        }
        if (typeof member[name] === 'number') {
            member[name] += 1;
        } else {
            member[name] = 1;
        }
    }


    // ECMAScript parser

    syntax['(identifier)'] = {
        lbp: 0,
        identifier: true,
        nud: function () {
            var name = this.value,
                variable = scope[name],
                site,
                writeable;

            // If the variable is not in scope, then we may have an undeclared variable.
            // Check the predefined list. If it was predefined, create the global
            // variable.

            if (typeof variable !== 'object') {
                writeable = predefined[name];
                if (typeof writeable === 'boolean') {
                    global_scope[name] = variable = {
                        value: name,
                        writeable: writeable,
                        funct: global_funct
                    };
                    global_funct[name] = 'var';

                    // But if the variable is not in scope, and is not predefined, and if we are not
                    // in the global scope, then we have an undefined variable error.

                } else {
                    if (!option.undef) {
                        warn('used_before_a', token);
                    }
                    scope[name] = variable = {
                        value: name,
                        writeable: true,
                        funct: funct
                    };
                    funct[name] = 'undef';
                }

            }
            site = variable.funct;

            // The name is in scope and defined in the current function.

            if (funct === site) {

                //      Change 'unused' to 'var', and reject labels.

                switch (funct[name]) {
                    case 'becoming':
                        warn('unexpected_a', token);
                        funct[name] = 'var';
                        break;
                    case 'unused':
                        funct[name] = 'var';
                        break;
                    case 'unparam':
                        funct[name] = 'parameter';
                        break;
                    case 'unction':
                        funct[name] = 'function';
                        break;
                    case 'label':
                        warn('a_label', token, name);
                        break;
                }

                // If the name is already defined in the current
                // function, but not as outer, then there is a scope error.

            } else {
                switch (funct[name]) {
                    case 'closure':
                    case 'function':
                    case 'var':
                    case 'unused':
                        warn('a_scope', token, name);
                        break;
                    case 'label':
                        warn('a_label', token, name);
                        break;
                    case 'outer':
                    case 'global':
                        break;
                    default:

                        // If the name is defined in an outer function, make an outer entry, and if
                        // it was unused, make it var.

                        switch (site[name]) {
                            case 'function':
                            case 'unction':
                            case 'var':
                            case 'unused':
                            case 'becoming':
                            case 'closure':
                            case 'parameter':
                                site[name] = 'closure';
                                funct[name] = site === global_funct ? 'global' : 'outer';
                                break;
                            case 'unparam':
                                site[name] = 'parameter';
                                funct[name] = 'outer';
                                break;
                            case 'undef':
                                funct[name] = 'undef';
                                break;
                            case 'label':
                                warn('a_label', token, name);
                                break;
                        }
                }
            }
            return this;
        },
        led: function () {
            stop('expected_operator_a');
        }
    };

    // Build the syntax table by declaring the syntactic elements.

    type('(array)', 'array');
    type('(color)', 'color');
    type('(function)', 'function');
    type('(number)', 'number', return_this);
    type('(object)', 'object');
    type('(string)', 'string', return_this);
    type('(boolean)', 'boolean', return_this);
    type('(range)', 'range');
    type('(regexp)', 'regexp', return_this);

    ultimate('(begin)');
    ultimate('(end)');
    ultimate('(error)');
    postscript(delim('</'));
    delim('<!');
    delim('<!--');
    delim('-->');
    postscript(delim('}'));
    delim(')');
    delim(']');
    postscript(delim('"'));
    postscript(delim('\''));
    delim(';');
    delim(':');
    delim(',');
    delim('#');
    delim('@');
    delim('*/');
    postscript(reserve('case'));
    reserve('catch');
    postscript(reserve('default'));
    reserve('else');
    reserve('finally');

    reservevar('arguments', function (x) {
        if (strict_mode && funct === global_funct) {
            warn('strict', x);
        } else if (option.safe) {
            warn('adsafe', x);
        }
    });
    reservevar('eval', function (x) {
        if (option.safe) {
            warn('adsafe', x);
        }
    });
    constant('false', 'boolean', false);
    constant('Infinity', 'number', Infinity);
    constant('NaN', 'number', NaN);
    constant('null', '', null);
    reservevar('this', function (x) {
        if (strict_mode && ((funct['(statement)'] &&
                funct['(name)'].charAt(0) > 'Z') || funct === global_funct)) {
            warn('strict', x);
        } else if (option.safe) {
            warn('adsafe', x);
        }
    });
    constant('true', 'boolean', true);
    constant('undefined', '', undefined);

    infix('?', 30, function (left, that) {
        that.first = expected_condition(expected_relation(left));
        that.second = expression(0);
        spaces();
        var colon = next_token;
        advance(':');
        discard();
        spaces();
        that.third = expression(10);
        that.arity = 'ternary';
        that.type = conform_type(that.second, that.third);
        if (are_similar(that.second, that.third)) {
            warn('weird_ternary', colon);
        } else if (are_similar(that.first, that.second)) {
            warn('use_or', that);
        }
        return that;
    });

    infix('||', 40, function (left, that) {
        function paren_check(that) {
            if (that.id === '&&' && !that.paren) {
                warn('and', that);
            }
            return that;
        }

        that.first = paren_check(expected_condition(expected_relation(left)));
        that.second = paren_check(expected_relation(expression(40)));
        if (are_similar(that.first, that.second)) {
            warn('weird_condition', that);
        }
        return that;
    });

    infix('&&', 50, function (left, that) {
        that.first = expected_condition(expected_relation(left));
        that.second = expected_relation(expression(50));
        if (are_similar(that.first, that.second)) {
            warn('weird_condition', that);
        }
        return that;
    });

    prefix('void', function () {
        this.first = expression(0);
        if (this.first.id !== '(number)' || this.first.value) {
            warn('unexpected_a', this);
            return this;
        }
        this.type = 'undefined';
        return this;
    });

    bitwise('|', 70);
    bitwise('^', 80);
    bitwise('&', 90);

    relation('==', '===');
    relation('===');
    relation('!=', '!==');
    relation('!==');
    relation('<');
    relation('>');
    relation('<=');
    relation('>=');

    bitwise('<<', 120);
    bitwise('>>', 120);
    bitwise('>>>', 120);

    infix('in', 120, function (left, that) {
        warn('infix_in', that);
        that.left = left;
        that.right = expression(130);
        return that;
    }, 'boolean');
    infix('instanceof', 120, null, 'boolean');
    infix('+', 130, function (left, that) {
        if (!left.value) {
            if (left.id === '(number)') {
                warn('unexpected_a', left);
            } else if (left.id === '(string)') {
                warn('expected_a_b', left, 'String', '\'\'');
            }
        }
        var right = expression(130);
        if (!right.value) {
            if (right.id === '(number)') {
                warn('unexpected_a', right);
            } else if (right.id === '(string)') {
                warn('expected_a_b', right, 'String', '\'\'');
            }
        }
        if (left.id === right.id &&
                (left.id === '(string)' || left.id === '(number)')) {
            left.value += right.value;
            left.thru = right.thru;
            if (left.id === '(string)' && jx.test(left.value)) {
                warn('url', left);
            }
            discard(right);
            discard(that);
            return left;
        }
        that.first = left;
        that.second = right;
        that.type = conform_type(left, right, that);
        return that;
    });
    prefix('+', 'num');
    prefix('+++', function () {
        warn('confusing_a', token);
        this.first = expression(150);
        this.arity = 'prefix';
        return this;
    });
    infix('+++', 130, function (left) {
        warn('confusing_a', token);
        this.first = left;
        this.second = expression(130);
        return this;
    });
    infix('-', 130, function (left, that) {
        if ((left.id === '(number)' && left.value === 0) || left.id === '(string)') {
            warn('unexpected_a', left);
        }
        var right = expression(130);
        if ((right.id === '(number)' && right.value === 0) || right.id === '(string)') {
            warn('unexpected_a', left);
        }
        if (left.id === right.id && left.id === '(number)') {
            left.value -= right.value;
            left.thru = right.thru;
            discard(right);
            discard(that);
            return left;
        }
        that.first = left;
        that.second = right;
        return that;
    }, 'number');
    prefix('-');
    prefix('---', function () {
        warn('confusing_a', token);
        this.first = expression(150);
        this.arity = 'prefix';
        return this;
    });
    infix('---', 130, function (left) {
        warn('confusing_a', token);
        this.first = left;
        this.second = expression(130);
        return this;
    });
    infix('*', 140, function (left, that) {
        if ((left.id === '(number)' && (left.value === 0 || left.value === 1)) || left.id === '(string)') {
            warn('unexpected_a', left);
        }
        var right = expression(140);
        if ((right.id === '(number)' && (right.value === 0 || right.value === 1)) || right.id === '(string)') {
            warn('unexpected_a', right);
        }
        if (left.id === right.id && left.id === '(number)') {
            left.value *= right.value;
            left.thru = right.thru;
            discard(right);
            discard(that);
            return left;
        }
        that.first = left;
        that.second = right;
        return that;
    }, 'number');
    infix('/', 140, function (left, that) {
        if ((left.id === '(number)' && left.value === 0) || left.id === '(string)') {
            warn('unexpected_a', left);
        }
        var right = expression(140);
        if ((right.id === '(number)' && (right.value === 0 || right.value === 1)) || right.id === '(string)') {
            warn('unexpected_a', right);
        }
        if (left.id === right.id && left.id === '(number)') {
            left.value /= right.value;
            left.thru = right.thru;
            discard(right);
            discard(that);
            return left;
        }
        that.first = left;
        that.second = right;
        return that;
    }, 'number');
    infix('%', 140, function (left, that) {
        if ((left.id === '(number)' && (left.value === 0 || left.value === 1)) || left.id === '(string)') {
            warn('unexpected_a', left);
        }
        var right = expression(140);
        if ((right.id === '(number)' && right.value === 0) || right.id === '(string)') {
            warn('unexpected_a', right);
        }
        if (left.id === right.id && left.id === '(number)') {
            left.value %= right.value;
            left.thru = right.thru;
            discard(right);
            discard(that);
            return left;
        }
        that.first = left;
        that.second = right;
        return that;
    }, 'number');

    suffix('++');
    prefix('++');

    suffix('--');
    prefix('--');
    prefix('delete', function () {
        one_space();
        var p = expression(0);
        if (!p || (p.id !== '.' && p.id !== '[')) {
            warn('deleted');
        }
        this.first = p;
        return this;
    });


    prefix('~', function () {
        no_space_only();
        if (!option.bitwise) {
            warn('unexpected_a', this);
        }
        expression(150);
        return this;
    }, 'number');
    prefix('!', function () {
        no_space_only();
        this.first = expected_condition(expression(150));
        this.arity = 'prefix';
        if (bang[this.first.id] === true) {
            warn('confusing_a', this);
        }
        return this;
    }, 'boolean');
    prefix('typeof', null, 'string');
    prefix('new', function () {
        one_space();
        var c = expression(160), i, p, v;
        this.first = c;
        if (c.id !== 'function') {
            if (c.identifier) {
                switch (c.value) {
                    case 'Object':
                        warn('use_object', token);
                        break;
                    case 'Array':
                        if (next_token.id === '(') {
                            p = next_token;
                            p.first = this;
                            advance('(');
                            if (next_token.id !== ')') {
                                p.second = expression(0);
                                if (p.second.id !== '(string)' || !p.second.value) {
                                    expected_condition(p.second, bundle.use_array);
                                    i = false;
                                } else {
                                    i = true;
                                }
                                while (next_token.id !== ')' && next_token.id !== '(end)') {
                                    if (i) {
                                        warn('use_array', p);
                                        i = false;
                                    }
                                    advance();
                                }
                            } else {
                                warn('use_array', token);
                            }
                            advance(')', p);
                            discard();
                            return p;
                        }
                        warn('use_array', token);
                        break;
                    case 'Number':
                    case 'String':
                    case 'Boolean':
                    case 'Math':
                    case 'JSON':
                        warn('not_a_constructor', c);
                        break;
                    case 'Function':
                        if (!option.evil) {
                            warn('function_eval');
                        }
                        break;
                    case 'Date':
                    case 'RegExp':
                        break;
                    default:
                        if (c.id !== 'function') {
                            v = c.value.charAt(0);
                            if (!option.newcap && (v < 'A' || v > 'Z')) {
                                warn('constructor_name_a', token);
                            }
                        }
                }
            } else {
                if (c.id !== '.' && c.id !== '[' && c.id !== '(') {
                    warn('bad_constructor', token);
                }
            }
        } else {
            warn('weird_new', this);
        }
        if (next_token.id !== '(') {
            warn('missing_a', next_token, '()');
        }
        return this;
    });

    infix('(', 160, function (left, that) {
        if (indent && indent.mode === 'expression') {
            no_space(prev_token, token);
        } else {
            no_space_only(prev_token, token);
        }
        if (!left.immed && left.id === 'function') {
            warn('wrap_immediate');
        }
        var p = [];
        if (left) {
            conform_type('function', left);
            if (left.identifier) {
                if (left.value.match(/^[A-Z]([A-Z0-9_$]*[a-z][A-Za-z0-9_$]*)?$/)) {
                    if (left.value !== 'Number' && left.value !== 'String' &&
                            left.value !== 'Boolean' && left.value !== 'Date') {
                        if (left.value === 'Math' || left.value === 'JSON') {
                            warn('not_a_function', left);
                        } else if (left.value === 'Object') {
                            warn('use_object', token);
                        } else if (left.value === 'Array' || !option.newcap) {
                            warn('missing_a', left, 'new');
                        }
                    }
                }
            } else if (left.id === '.') {
                if (option.safe && left.first.value === 'Math' &&
                        left.second === 'random') {
                    warn('adsafe', left);
                } else if (left.second.value === 'split' &&
                        left.first.id === '(string)') {
                    warn('use_array', left.second);
                }
            }
        }
        step_in();
        if (next_token.id !== ')') {
            no_space();
            for (; ; ) {
                edge();
                p.push(expression(10));
                if (next_token.id !== ',') {
                    break;
                }
                comma();
            }
        }
        no_space();
        step_out(')', that);
        if (typeof left === 'object') {
            if (left.value === 'parseInt' && p.length === 1) {
                warn('radix', left);
            }
            if (!option.evil) {
                if (left.value === 'eval' || left.value === 'Function' ||
                        left.value === 'execScript') {
                    warn('evil', left);
                } else if (p[0] && p[0].id === '(string)' &&
                        (left.value === 'setTimeout' ||
                        left.value === 'setInterval')) {
                    warn('implied_evil', left);
                }
            }
            if (!left.identifier && left.id !== '.' && left.id !== '[' &&
                    left.id !== '(' && left.id !== '&&' && left.id !== '||' &&
                    left.id !== '?') {
                warn('bad_invocation', left);
            }
        }
        that.first = left;
        that.second = p;
        if (!option.type) {
            if (left.id === '.') {
                if (left.second.value === 'charAt' || left.second.value === 'substring') {
                    conform_type('string', that);
                    conform_type('string', left.first);
                    p.forEach(function (value) {
                        conform_type('number', value);
                    });
                } else if (left.second.value === 'toString' || left.second.value === 'stringify') {
                    conform_type('string', that);
                }
            } else if (left.identifier) {
                if (left.value === 'String') {
                    conform_type('string', that);
                }
            }
        }
        return that;
    }, '', true);

    prefix('(', function () {
        step_in('expression');
        discard();
        no_space();
        edge();
        if (next_token.id === 'function') {
            next_token.immed = true;
        }
        var value = expression(0);
        value.paren = true;
        no_space();
        step_out(')', this);
        discard();
        if (value.id === 'function') {
            if (next_token.id === '(') {
                warn('move_invocation');
            } else {
                warn('bad_wrap', this);
            }
        }
        return value;
    });

    infix('.', 170, function (left, that) {
        no_space(prev_token, token);
        no_space();
        var name = identifier();
        if (typeof name === 'string') {
            tally_property(name);
        }
        that.first = left;
        that.second = token;
        if (left && left.value === 'arguments' &&
                (name === 'callee' || name === 'caller')) {
            warn('avoid_a', left, 'arguments.' + name);
        } else if (!option.evil && left && left.value === 'document' &&
                (name === 'write' || name === 'writeln')) {
            warn('write_is_wrong', left);
        } else if (option.adsafe) {
            if (!adsafe_top && left.value === 'ADSAFE') {
                if (name === 'id' || name === 'lib') {
                    warn('adsafe', that);
                } else if (name === 'go') {
                    if (xmode !== 'script') {
                        warn('adsafe', that);
                    } else if (adsafe_went || next_token.id !== '(' ||
                            peek(0).id !== '(string)' ||
                            peek(0).value !== adsafe_id ||
                            peek(1).id !== ',') {
                        stop('adsafe_a', that, 'go');
                    }
                    adsafe_went = true;
                    adsafe_may = false;
                }
            }
            adsafe_top = false;
        }
        if (!option.evil && (name === 'eval' || name === 'execScript')) {
            warn('evil');
        } else if (option.safe) {
            for (; ; ) {
                if (banned[name] === true) {
                    warn('adsafe_a', token, name);
                }
                if (typeof predefined[left.value] !== 'boolean' ||    //// check for writeable
                        next_token.id === '(') {
                    break;
                }
                if (standard_property[name] === true) {
                    if (next_token.id === '.') {
                        warn('adsafe', that);
                    }
                    break;
                }
                if (next_token.id !== '.') {
                    warn('adsafe', that);
                    break;
                }
                advance('.');
                token.first = that;
                token.second = name;
                that = token;
                name = identifier();
                if (typeof name === 'string') {
                    tally_property(name);
                }
            }
        }
        if (name === 'length') {
            conform_type('number', that);
        }
        return that;
    }, '', true);

    infix('[', 170, function (left, that) {
        var left_type = get_type(left), e, s;
        no_space_only(prev_token, token);
        no_space();
        step_in();
        edge();
        e = expression(0);
        switch (get_type(e)) {
            case 'number':
                if (e.id === '(number)' && left.id === 'arguments') {
                    warn('use_param', left);
                }
                if (!left_type) {
                    conform_type('array', left);
                }
                break;
            case 'string':
                if (e.id === '(string)') {
                    if (option.safe && (banned[e.value] ||
                        e.value.charAt(0) === '_' || e.value.slice(-1) === '_')) {
                        warn('adsafe_subscript_a', e);
                    } else if (!option.evil &&
                        (e.value === 'eval' || e.value === 'execScript')) {
                        warn('evil', e);
                    } else if (!option.sub && ix.test(e.value)) {
                        s = syntax[e.value];
                        if (!s || !s.reserved) {
                            warn('subscript', e);
                        }
                    }
                    tally_property(e.value);
                } else if (option.safe && e.id !== 'typeof') {
                    warn('adsafe_subscript_a', e);
                }
                conform_type('object', left);
                break;
            case undefined:
                switch (get_type(left)) {
                    case 'array':
                        conform_type('number', e);
                        break;
                    case 'object':
                        conform_type('string', e);
                        break;
                    case 'string':
                        if (!option.type) {
                            warn('use_charAt', that);
                        }
                        that.type = 'string';
                        break;
                }
                if (option.safe) {
                    warn('adsafe_subscript_a', e);
                }
                break;
            default:
                if (option.safe) {
                    warn('adsafe_subscript_a', e);
                } else {
                    warn('bad_type');
                }
        }
        step_out(']', that);
        discard();
        no_space(prev_token, token);
        that.first = left;
        that.second = e;
        return that;
    }, '', true);

    prefix('[', function () {
        this.arity = 'prefix';
        this.first = [];
        this.type = 'array';
        step_in('array');
        while (next_token.id !== '(end)') {
            while (next_token.id === ',') {
                warn('unexpected_a', next_token);
                advance(',');
                discard();
            }
            if (next_token.id === ']') {
                break;
            }
            indent.wrap = false;
            edge();
            this.first.push(expression(10));
            if (next_token.id === ',') {
                comma();
                if (next_token.id === ']' && !option.es5) {
                    warn('unexpected_a', token);
                    break;
                }
            } else {
                break;
            }
        }
        step_out(']', this);
        discard();
        return this;
    }, 170);


    function property_name() {
        var id = optional_identifier(true);
        if (!id) {
            if (next_token.id === '(string)') {
                id = next_token.value;
                if (option.safe) {
                    if (banned[id]) {
                        warn('adsafe_a');
                    } else if (id.charAt(0) === '_' ||
                            id.charAt(id.length - 1) === '_') {
                        warn('dangling_a');
                    }
                }
                advance();
            } else if (next_token.id === '(number)') {
                id = next_token.value.toString();
                advance();
            }
        }
        return id;
    }


    function function_params() {
        var id, paren = next_token, params = [];
        advance('(');
        step_in();
        discard();
        no_space();
        if (next_token.id === ')') {
            no_space();
            step_out(')', paren);
            discard();
            return;
        }
        for (; ; ) {
            edge();
            id = identifier();
            params.push(token);
            add_label(token, option.unparam ? 'parameter' : 'unparam');
            if (next_token.id === ',') {
                comma();
            } else {
                no_space();
                step_out(')', paren);
                discard();
                return params;
            }
        }
    }


    function complexity(exp) {
        var score = 0;
        if (exp) {
            if (Array.isArray(exp)) {
                exp.forEach(function (tok) {
                    score += complexity(tok);
                });
            } else {
                switch (exp.arity) {
                    case 'statement':
                        switch (exp.id) {
                            case 'if':
                                score += complexity(exp.first) + complexity(exp.block) +
                            complexity(exp['else']) + 1;
                                break;
                            case 'while':
                            case 'do':
                                if (exp.first.id !== 'true' && exp.first.value !== 1) {
                                    score += 1;
                                }
                                score += complexity(exp.first) + complexity(exp.block);
                                break;
                            case 'for':
                                if (exp.second !== undefined &&
                                exp.second.id !== 'true' &&
                                exp.second.value !== 1) {
                                    score += 1;
                                }
                                score += complexity(exp.first) + complexity(exp.second) +
                            complexity(exp.third) + complexity(exp.block);
                                break;
                            case 'switch':
                                score += complexity(exp.first) +
                            complexity(exp.second) + exp.second.length;
                                if (exp.second[exp.second.length - 1].id === 'default') {
                                    score -= 1;
                                }
                                break;
                            case 'try':
                                if (exp.second) {
                                    score += 1;
                                }
                                if (exp.third) {
                                    score += 1;
                                }
                                score += complexity(exp.first) + complexity(exp.second) +
                            complexity(exp.third) + complexity(exp.block);
                                break;
                        }
                        break;
                    case 'prefix':
                        score += complexity(exp.first);
                        break;
                    case 'case':
                    case 'infix':
                        score += complexity(exp.first) + complexity(exp.second);
                        if (exp.id === '&&' || exp.id === '||') {
                            score += 1;
                        }
                        break;
                    case 'ternary':
                        score += complexity(exp.first) + complexity(exp.second) + complexity(exp.third);
                        break;
                }
            }
        }
        return score;
    }


    function do_function(func, name) {
        var old_funct = funct,
            old_option = option,
            old_properties = properties,
            old_scope = scope;
        funct = {
            '(name)': name || '\'' + (anonname || '').replace(nx, sanitize) + '\'',
            '(line)': next_token.line,
            '(context)': old_funct,
            '(breakage)': 0,
            '(loopage)': 0,
            '(scope)': scope,
            '(token)': func
        };
        properties = old_properties && Object.create(old_properties);
        option = Object.create(old_option);
        scope = Object.create(old_scope);
        functions.push(funct);
        func.name = name;
        if (name) {
            add_label(func, 'function', name);
        }
        func.writeable = false;
        func.first = funct['(params)'] = function_params();
        func.type = 'function';
        one_space();
        func.block = block(false);
        funct['(complexity)'] = complexity(func.block) + 1;
        funct = old_funct;
        option = old_option;
        properties = old_properties;
        scope = old_scope;
    }


    assignop('=');
    assignop('+=', '+');
    assignop('-=', '-');
    assignop('*=', '*');
    assignop('/=', '/').nud = function () {
        stop('slash_equal');
    };
    assignop('%=', '%');
    assignop('&=', '&');
    assignop('|=', '|');
    assignop('^=', '^');
    assignop('<<=', '<<');
    assignop('>>=', '>>');
    assignop('>>>=', '>>>');


    prefix('{', function () {
        var get, i, j, name, p, set, seen = {};
        this.arity = 'prefix';
        this.first = [];
        this.type = 'object';
        step_in();
        while (next_token.id !== '}') {
            indent.wrap = false;

            // JSLint recognizes the ES5 extension for get/set in object literals,
            // but requires that they be used in pairs.

            edge();
            if (next_token.value === 'get' && peek().id !== ':') {
                if (!option.es5) {
                    warn('es5');
                }
                get = next_token;
                advance('get');
                one_space_only();
                name = next_token;
                i = property_name();
                if (!i) {
                    stop('missing_property');
                }
                get.value = '';
                do_function(get);
                if (funct['(loopage)']) {
                    warn('function_loop', get);
                }
                p = get.first;
                if (p) {
                    warn('parameter_a_get_b', p[0], p[0].value, i);
                }
                comma();
                set = next_token;
                set.value = '';
                spaces();
                edge();
                advance('set');
                one_space_only();
                j = property_name();
                if (i !== j) {
                    stop('expected_a_b', token, i, j || next_token.value);
                }
                do_function(set);
                p = set.first;
                if (!p || p.length !== 1) {
                    stop('parameter_set_a', set, 'value');
                } else if (p[0].value !== 'value') {
                    stop('expected_a_b', p[0], 'value', p[0].value);
                }
                name.first = [get, set];
            } else {
                name = next_token;
                i = property_name();
                if (typeof i !== 'string') {
                    stop('missing_property');
                }
                advance(':');
                discard();
                spaces();
                name.first = expression(10);
            }
            this.first.push(name);
            if (seen[i] === true) {
                warn('duplicate_a', next_token, i);
            }
            seen[i] = true;
            tally_property(i);
            if (next_token.id !== ',') {
                break;
            }
            for (; ; ) {
                comma();
                if (next_token.id !== ',') {
                    break;
                }
                warn('unexpected_a', next_token);
            }
            if (next_token.id === '}' && !option.es5) {
                warn('unexpected_a', token);
            }
        }
        step_out('}', this);
        discard();
        return this;
    });

    stmt('{', function () {
        discard();
        warn('statement_block');
        this.arity = 'statement';
        this.block = statements();
        this.disrupt = this.block.disrupt;
        advance('}', this);
        discard();
        return this;
    });

    stmt('/*global', directive);
    stmt('/*globals', directive);
    stmt('/*jslint', directive);
    stmt('/*member', directive);
    stmt('/*members', directive);
    stmt('/*property', directive);
    stmt('/*properties', directive);

    stmt('var', function () {

        // JavaScript does not have block scope. It only has function scope. So,
        // declaring a variable in a block can have unexpected consequences.

        // var.first will contain an array, the array containing name tokens
        // and assignment tokens.

        var assign, id, name;

        if (funct['(vars)'] && !option.vars) {
            warn('combine_var');
        } else if (funct !== global_funct) {
            funct['(vars)'] = true;
        }
        this.arity = 'statement';
        this.first = [];
        step_in('var');
        for (; ; ) {
            name = next_token;
            id = identifier();
            add_label(name, 'becoming');

            if (next_token.id === '=') {
                assign = next_token;
                assign.first = name;
                spaces();
                advance('=');
                spaces();
                if (next_token.id === 'undefined') {
                    warn('unnecessary_initialize', token, id);
                }
                if (peek(0).id === '=' && next_token.identifier) {
                    stop('var_a_not');
                }
                assign.second = expression(0);
                assign.arity = 'infix';
                this.first.push(assign);
                if (assign.second.type) {
                    name.type = assign.second.type;
                }
            } else {
                this.first.push(name);
            }
            if (funct[id] === 'becoming') {
                funct[id] = 'unused';
            }
            if (next_token.id !== ',') {
                break;
            }
            comma();
            indent.wrap = false;
            if (var_mode && next_token.line === token.line &&
                    this.first.length === 1) {
                var_mode = null;
                indent.open = false;
                indent.at -= option.indent;
            }
            spaces();
            edge();
        }
        var_mode = null;
        step_out();
        return this;
    });

    stmt('function', function () {
        one_space();
        if (in_block) {
            warn('function_block', token);
        }
        var name = next_token, id = identifier();
        add_label(name, 'unction');
        no_space();
        do_function(this, id);
        if (next_token.id === '(' && next_token.line === token.line) {
            stop('function_statement');
        }
        this.arity = 'statement';
        return this;
    });

    prefix('function', function () {
        one_space();
        var id = optional_identifier();
        if (id) {
            no_space();
        } else {
            id = '';
        }
        do_function(this, id);
        if (funct['(loopage)']) {
            warn('function_loop');
        }
        this.arity = 'function';
        return this;
    });

    stmt('if', function () {
        var paren = next_token;
        one_space();
        advance('(');
        step_in('control');
        discard();
        no_space();
        edge();
        this.arity = 'statement';
        this.first = expected_condition(expected_relation(expression(0)));
        no_space();
        step_out(')', paren);
        discard();
        one_space();
        this.block = block(true);
        if (next_token.id === 'else') {
            one_space();
            advance('else');
            discard();
            one_space();
            this['else'] = next_token.id === 'if' || next_token.id === 'switch' ?
                statement(true) : block(true);
            if (this['else'].disrupt && this.block.disrupt) {
                this.disrupt = true;
            }
        }
        return this;
    });

    stmt('try', function () {

        // try.first    The catch variable
        // try.second   The catch clause
        // try.third    The finally clause
        // try.block    The try block

        var exception_variable, old_scope, paren;
        if (option.adsafe) {
            warn('adsafe_a', this);
        }
        one_space();
        this.arity = 'statement';
        this.block = block(false);
        if (next_token.id === 'catch') {
            one_space();
            advance('catch');
            discard();
            one_space();
            paren = next_token;
            advance('(');
            step_in('control');
            discard();
            no_space();
            edge();
            old_scope = scope;
            scope = Object.create(old_scope);
            exception_variable = next_token.value;
            this.first = exception_variable;
            if (!next_token.identifier) {
                warn('expected_identifier_a', next_token);
            } else {
                add_label(next_token, 'exception');
            }
            advance();
            no_space();
            step_out(')', paren);
            discard();
            one_space();
            this.second = block(false);
            scope = old_scope;
        }
        if (next_token.id === 'finally') {
            discard();
            one_space();
            advance('finally');
            discard();
            one_space();
            this.third = block(false);
        } else if (!this.second) {
            stop('expected_a_b', next_token, 'catch', next_token.value);
        }
        return this;
    });

    labeled_stmt('while', function () {
        one_space();
        var paren = next_token;
        funct['(breakage)'] += 1;
        funct['(loopage)'] += 1;
        advance('(');
        step_in('control');
        discard();
        no_space();
        edge();
        this.arity = 'statement';
        this.first = expected_relation(expression(0));
        if (this.first.id !== 'true') {
            expected_condition(this.first, bundle.unexpected_a);
        }
        no_space();
        step_out(')', paren);
        discard();
        one_space();
        this.block = block(true);
        if (this.block.disrupt) {
            warn('strange_loop', prev_token);
        }
        funct['(breakage)'] -= 1;
        funct['(loopage)'] -= 1;
        return this;
    });

    reserve('with');

    labeled_stmt('switch', function () {

        // switch.first             the switch expression
        // switch.second            the array of cases. A case is 'case' or 'default' token:
        //    case.first            the array of case expressions
        //    case.second           the array of statements
        // If all of the arrays of statements are disrupt, then the switch is disrupt.

        var particular,
            the_case = next_token,
            unbroken = true;
        funct['(breakage)'] += 1;
        one_space();
        advance('(');
        discard();
        no_space();
        step_in();
        this.arity = 'statement';
        this.first = expected_condition(expected_relation(expression(0)));
        no_space();
        step_out(')', the_case);
        discard();
        one_space();
        advance('{');
        step_in();
        this.second = [];
        while (next_token.id === 'case') {
            the_case = next_token;
            the_case.first = [];
            the_case.arity = 'case';
            spaces();
            edge('case');
            advance('case');
            for (; ; ) {
                one_space();
                particular = expression(0);
                the_case.first.push(particular);
                if (particular.id === 'NaN') {
                    warn('unexpected_a', particular);
                }
                no_space_only();
                advance(':');
                discard();
                if (next_token.id !== 'case') {
                    break;
                }
                spaces();
                edge('case');
                advance('case');
                discard();
            }
            spaces();
            the_case.second = statements();
            if (the_case.second && the_case.second.length > 0) {
                particular = the_case.second[the_case.second.length - 1];
                if (particular.disrupt) {
                    if (particular.id === 'break') {
                        unbroken = false;
                    }
                } else {
                    warn('missing_a_after_b', next_token, 'break', 'case');
                }
            } else {
                warn('empty_case');
            }
            this.second.push(the_case);
        }
        if (this.second.length === 0) {
            warn('missing_a', next_token, 'case');
        }
        if (next_token.id === 'default') {
            spaces();
            the_case = next_token;
            the_case.arity = 'case';
            edge('case');
            advance('default');
            discard();
            no_space_only();
            advance(':');
            discard();
            spaces();
            the_case.second = statements();
            if (the_case.second && the_case.second.length > 0) {
                particular = the_case.second[the_case.second.length - 1];
                if (unbroken && particular.disrupt && particular.id !== 'break') {
                    this.disrupt = true;
                }
            }
            this.second.push(the_case);
        }
        funct['(breakage)'] -= 1;
        spaces();
        step_out('}', this);
        return this;
    });

    stmt('debugger', function () {
        if (!option.debug) {
            warn('unexpected_a', this);
        }
        this.arity = 'statement';
        return this;
    });

    labeled_stmt('do', function () {
        funct['(breakage)'] += 1;
        funct['(loopage)'] += 1;
        one_space();
        this.arity = 'statement';
        this.block = block(true);
        if (this.block.disrupt) {
            warn('strange_loop', prev_token);
        }
        one_space();
        advance('while');
        discard();
        var paren = next_token;
        one_space();
        advance('(');
        step_in();
        discard();
        no_space();
        edge();
        this.first = expected_condition(expected_relation(expression(0)), bundle.unexpected_a);
        no_space();
        step_out(')', paren);
        discard();
        funct['(breakage)'] -= 1;
        funct['(loopage)'] -= 1;
        return this;
    });

    labeled_stmt('for', function () {
        var blok, filter, ok = false, paren = next_token, the_in, value;
        this.arity = 'statement';
        funct['(breakage)'] += 1;
        funct['(loopage)'] += 1;
        advance('(');
        step_in('control');
        discard();
        spaces(this, paren);
        no_space();
        if (next_token.id === 'var') {
            stop('move_var');
        }
        edge();
        if (peek(0).id === 'in') {
            value = next_token;
            switch (funct[value.value]) {
                case 'unused':
                    funct[value.value] = 'var';
                    break;
                case 'closure':
                case 'var':
                    break;
                default:
                    warn('bad_in_a', value);
            }
            conform_type('string', value);
            advance();
            the_in = next_token;
            advance('in');
            the_in.first = value;
            the_in.second = expression(20);
            conform_type('object', the_in.second);
            step_out(')', paren);
            discard();
            this.first = the_in;
            blok = block(true);
            if (!option.forin) {
                if (blok.length === 1 && typeof blok[0] === 'object' &&
                        blok[0].value === 'if' && !blok[0]['else']) {
                    filter = blok[0].first;
                    while (filter.id === '&&') {
                        filter = filter.first;
                    }
                    switch (filter.id) {
                        case '===':
                        case '!==':
                            ok = filter.first.id === '[' ? (
                            filter.first.first.value === the_in.second.value &&
                            filter.first.second.value === the_in.first.value
                        ) : (
                            filter.first.id === 'typeof' &&
                            filter.first.first.id === '[' &&
                            filter.first.first.first.value === the_in.second.value &&
                            filter.first.first.second.value === the_in.first.value
                        );
                            break;
                        case '(':
                            ok = filter.first.id === '.' && ((
                            filter.first.first.value === the_in.second.value &&
                            filter.first.second.value === 'hasOwnProperty' &&
                            filter.second[0].value === the_in.first.value
                        ) || (
                            filter.first.first.value === 'ADSAFE' &&
                            filter.first.second.value === 'has' &&
                            filter.second[0].value === the_in.second.value &&
                            filter.second[1].value === the_in.first.value
                        ) || (
                            filter.first.first.id === '.' &&
                            filter.first.first.first.id === '.' &&
                            filter.first.first.first.first.value === 'Object' &&
                            filter.first.first.first.second.value === 'prototype' &&
                            filter.first.first.second.value === 'hasOwnProperty' &&
                            filter.first.second.value === 'call' &&
                            filter.second[0].value === the_in.second.value &&
                            filter.second[1].value === the_in.first.value
                        ));
                            break;
                    }
                }
                if (!ok) {
                    warn('for_if', this);
                }
            }
        } else {
            if (next_token.id !== ';') {
                edge();
                this.first = [];
                for (; ; ) {
                    this.first.push(expression(0, 'for'));
                    if (next_token.id !== ',') {
                        break;
                    }
                    comma();
                }
            }
            semicolon();
            if (next_token.id !== ';') {
                edge();
                this.second = expected_relation(expression(0));
                if (this.second.id !== 'true') {
                    expected_condition(this.second, bundle.unexpected_a);
                }
            }
            semicolon(token);
            if (next_token.id === ';') {
                stop('expected_a_b', next_token, ')', ';');
            }
            if (next_token.id !== ')') {
                this.third = [];
                edge();
                for (; ; ) {
                    this.third.push(expression(0, 'for'));
                    if (next_token.id !== ',') {
                        break;
                    }
                    comma();
                }
            }
            no_space();
            step_out(')', paren);
            discard();
            one_space();
            blok = block(true);
        }
        if (blok.disrupt) {
            warn('strange_loop', prev_token);
        }
        this.block = blok;
        funct['(breakage)'] -= 1;
        funct['(loopage)'] -= 1;
        return this;
    });

    disrupt_stmt('break', function () {
        var label = next_token.value;
        this.arity = 'statement';
        if (funct['(breakage)'] === 0) {
            warn('unexpected_a', this);
        }
        if (next_token.identifier && token.line === next_token.line) {
            one_space_only();
            if (funct[label] !== 'label') {
                warn('not_a_label', next_token);
            } else if (scope[label].funct !== funct) {
                warn('not_a_scope', next_token);
            }
            this.first = next_token;
            advance();
        }
        return this;
    });

    disrupt_stmt('continue', function () {
        if (!option['continue']) {
            warn('unexpected_a', this);
        }
        var label = next_token.value;
        this.arity = 'statement';
        if (funct['(breakage)'] === 0) {
            warn('unexpected_a', this);
        }
        if (next_token.identifier && token.line === next_token.line) {
            one_space_only();
            if (funct[label] !== 'label') {
                warn('not_a_label', next_token);
            } else if (scope[label].funct !== funct) {
                warn('not_a_scope', next_token);
            }
            this.first = next_token;
            advance();
        }
        return this;
    });

    disrupt_stmt('return', function () {
        this.arity = 'statement';
        if (next_token.id !== ';' && next_token.line === token.line) {
            one_space_only();
            if (next_token.id === '/' || next_token.id === '(regexp)') {
                warn('wrap_regexp');
            }
            this.first = expression(20);
        }
        return this;
    });

    disrupt_stmt('throw', function () {
        this.arity = 'statement';
        one_space_only();
        this.first = expression(20);
        return this;
    });


    //  Superfluous reserved words

    reserve('class');
    reserve('const');
    reserve('enum');
    reserve('export');
    reserve('extends');
    reserve('import');
    reserve('super');

    // Harmony reserved words

    reserve('let');
    reserve('yield');
    reserve('implements');
    reserve('interface');
    reserve('package');
    reserve('private');
    reserve('protected');
    reserve('public');
    reserve('static');


    // Parse JSON

    function json_value() {

        function json_object() {
            var brace = next_token, object = {};
            advance('{');
            if (next_token.id !== '}') {
                while (next_token.id !== '(end)') {
                    while (next_token.id === ',') {
                        warn('unexpected_a', next_token);
                        comma();
                    }
                    if (next_token.id !== '(string)') {
                        warn('expected_string_a');
                    }
                    if (object[next_token.value] === true) {
                        warn('duplicate_a');
                    } else if (next_token.value === '__proto__') {
                        warn('dangling_a');
                    } else {
                        object[next_token.value] = true;
                    }
                    advance();
                    advance(':');
                    json_value();
                    if (next_token.id !== ',') {
                        break;
                    }
                    comma();
                    if (next_token.id === '}') {
                        warn('unexpected_a', token);
                        break;
                    }
                }
            }
            advance('}', brace);
        }

        function json_array() {
            var bracket = next_token;
            advance('[');
            if (next_token.id !== ']') {
                while (next_token.id !== '(end)') {
                    while (next_token.id === ',') {
                        warn('unexpected_a', next_token);
                        comma();
                    }
                    json_value();
                    if (next_token.id !== ',') {
                        break;
                    }
                    comma();
                    if (next_token.id === ']') {
                        warn('unexpected_a', token);
                        break;
                    }
                }
            }
            advance(']', bracket);
        }

        switch (next_token.id) {
            case '{':
                json_object();
                break;
            case '[':
                json_array();
                break;
            case 'true':
            case 'false':
            case 'null':
            case '(number)':
            case '(string)':
                advance();
                break;
            case '-':
                advance('-');
                no_space_only();
                advance('(number)');
                break;
            default:
                stop('unexpected_a');
        }
    }


    // CSS parsing.

    function css_name() {
        if (next_token.identifier) {
            advance();
            return true;
        }
    }


    function css_number() {
        if (next_token.id === '-') {
            advance('-');
            no_space_only();
        }
        if (next_token.id === '(number)') {
            advance('(number)');
            return true;
        }
    }


    function css_string() {
        if (next_token.id === '(string)') {
            advance();
            return true;
        }
    }

    function css_color() {
        var i, number, paren, value;
        if (next_token.identifier) {
            value = next_token.value;
            if (value === 'rgb' || value === 'rgba') {
                advance();
                paren = next_token;
                advance('(');
                for (i = 0; i < 3; i += 1) {
                    if (i) {
                        comma();
                    }
                    number = next_token.value;
                    if (next_token.id !== '(string)' || number < 0) {
                        warn('expected_positive_a', next_token);
                        advance();
                    } else {
                        advance();
                        if (next_token.id === '%') {
                            advance('%');
                            if (number > 100) {
                                warn('expected_percent_a', token, number);
                            }
                        } else {
                            if (number > 255) {
                                warn('expected_small_a', token, number);
                            }
                        }
                    }
                }
                if (value === 'rgba') {
                    comma();
                    number = +next_token.value;
                    if (next_token.id !== '(string)' || number < 0 || number > 1) {
                        warn('expected_fraction_a', next_token);
                    }
                    advance();
                    if (next_token.id === '%') {
                        warn('unexpected_a');
                        advance('%');
                    }
                }
                advance(')', paren);
                return true;
            } else if (css_colorData[next_token.value] === true) {
                advance();
                return true;
            }
        } else if (next_token.id === '(color)') {
            advance();
            return true;
        }
        return false;
    }


    function css_length() {
        if (next_token.id === '-') {
            advance('-');
            no_space_only();
        }
        if (next_token.id === '(number)') {
            advance();
            if (next_token.id !== '(string)' &&
                    css_lengthData[next_token.value] === true) {
                no_space_only();
                advance();
            } else if (+token.value !== 0) {
                warn('expected_linear_a');
            }
            return true;
        }
        return false;
    }


    function css_line_height() {
        if (next_token.id === '-') {
            advance('-');
            no_space_only();
        }
        if (next_token.id === '(number)') {
            advance();
            if (next_token.id !== '(string)' &&
                    css_lengthData[next_token.value] === true) {
                no_space_only();
                advance();
            }
            return true;
        }
        return false;
    }


    function css_width() {
        if (next_token.identifier) {
            switch (next_token.value) {
                case 'thin':
                case 'medium':
                case 'thick':
                    advance();
                    return true;
            }
        } else {
            return css_length();
        }
    }


    function css_margin() {
        if (next_token.identifier) {
            if (next_token.value === 'auto') {
                advance();
                return true;
            }
        } else {
            return css_length();
        }
    }

    function css_attr() {
        if (next_token.identifier && next_token.value === 'attr') {
            advance();
            advance('(');
            if (!next_token.identifier) {
                warn('expected_name_a');
            }
            advance();
            advance(')');
            return true;
        }
        return false;
    }


    function css_comma_list() {
        while (next_token.id !== ';') {
            if (!css_name() && !css_string()) {
                warn('expected_name_a');
            }
            if (next_token.id !== ',') {
                return true;
            }
            comma();
        }
    }


    function css_counter() {
        if (next_token.identifier && next_token.value === 'counter') {
            advance();
            advance('(');
            advance();
            if (next_token.id === ',') {
                comma();
                if (next_token.id !== '(string)') {
                    warn('expected_string_a');
                }
                advance();
            }
            advance(')');
            return true;
        }
        if (next_token.identifier && next_token.value === 'counters') {
            advance();
            advance('(');
            if (!next_token.identifier) {
                warn('expected_name_a');
            }
            advance();
            if (next_token.id === ',') {
                comma();
                if (next_token.id !== '(string)') {
                    warn('expected_string_a');
                }
                advance();
            }
            if (next_token.id === ',') {
                comma();
                if (next_token.id !== '(string)') {
                    warn('expected_string_a');
                }
                advance();
            }
            advance(')');
            return true;
        }
        return false;
    }


    function css_shape() {
        var i;
        if (next_token.identifier && next_token.value === 'rect') {
            advance();
            advance('(');
            for (i = 0; i < 4; i += 1) {
                if (!css_length()) {
                    warn('expected_number_a');
                    break;
                }
            }
            advance(')');
            return true;
        }
        return false;
    }


    function css_url() {
        var c, url;
        if (next_token.identifier && next_token.value === 'url') {
            next_token = lex.range('(', ')');
            url = next_token.value;
            c = url.charAt(0);
            if (c === '"' || c === '\'') {
                if (url.slice(-1) !== c) {
                    warn('bad_url');
                } else {
                    url = url.slice(1, -1);
                    if (url.indexOf(c) >= 0) {
                        warn('bad_url');
                    }
                }
            }
            if (!url) {
                warn('missing_url');
            }
            if (option.safe && ux.test(url)) {
                stop('adsafe_a', next_token, url);
            }
            urls.push(url);
            advance();
            return true;
        }
        return false;
    }


    css_any = [css_url, function () {
        for (; ; ) {
            if (next_token.identifier) {
                switch (next_token.value.toLowerCase()) {
                    case 'url':
                        css_url();
                        break;
                    case 'expression':
                        warn('unexpected_a');
                        advance();
                        break;
                    default:
                        advance();
                }
            } else {
                if (next_token.id === ';' || next_token.id === '!' ||
                        next_token.id === '(end)' || next_token.id === '}') {
                    return true;
                }
                advance();
            }
        }
    } ];


    css_border_style = [
        'none', 'dashed', 'dotted', 'double', 'groove',
        'hidden', 'inset', 'outset', 'ridge', 'solid'
    ];

    css_break = [
        'auto', 'always', 'avoid', 'left', 'right'
    ];

    css_media = {
        'all': true,
        'braille': true,
        'embossed': true,
        'handheld': true,
        'print': true,
        'projection': true,
        'screen': true,
        'speech': true,
        'tty': true,
        'tv': true
    };

    css_overflow = [
        'auto', 'hidden', 'scroll', 'visible'
    ];

    css_attribute_data = {
        background: [
            true, 'background-attachment', 'background-color',
            'background-image', 'background-position', 'background-repeat'
        ],
        'background-attachment': ['scroll', 'fixed'],
        'background-color': ['transparent', css_color],
        'background-image': ['none', css_url],
        'background-position': [
            2, [css_length, 'top', 'bottom', 'left', 'right', 'center']
        ],
        'background-repeat': [
            'repeat', 'repeat-x', 'repeat-y', 'no-repeat'
        ],
        'border': [true, 'border-color', 'border-style', 'border-width'],
        'border-bottom': [
            true, 'border-bottom-color', 'border-bottom-style',
            'border-bottom-width'
        ],
        'border-bottom-color': css_color,
        'border-bottom-style': css_border_style,
        'border-bottom-width': css_width,
        'border-collapse': ['collapse', 'separate'],
        'border-color': ['transparent', 4, css_color],
        'border-left': [
            true, 'border-left-color', 'border-left-style', 'border-left-width'
        ],
        'border-left-color': css_color,
        'border-left-style': css_border_style,
        'border-left-width': css_width,
        'border-right': [
            true, 'border-right-color', 'border-right-style',
            'border-right-width'
        ],
        'border-right-color': css_color,
        'border-right-style': css_border_style,
        'border-right-width': css_width,
        'border-spacing': [2, css_length],
        'border-style': [4, css_border_style],
        'border-top': [
            true, 'border-top-color', 'border-top-style', 'border-top-width'
        ],
        'border-top-color': css_color,
        'border-top-style': css_border_style,
        'border-top-width': css_width,
        'border-width': [4, css_width],
        bottom: [css_length, 'auto'],
        'caption-side': ['bottom', 'left', 'right', 'top'],
        clear: ['both', 'left', 'none', 'right'],
        clip: [css_shape, 'auto'],
        color: css_color,
        content: [
            'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote',
            css_string, css_url, css_counter, css_attr
        ],
        'counter-increment': [
            css_name, 'none'
        ],
        'counter-reset': [
            css_name, 'none'
        ],
        cursor: [
            css_url, 'auto', 'crosshair', 'default', 'e-resize', 'help', 'move',
            'n-resize', 'ne-resize', 'nw-resize', 'pointer', 's-resize',
            'se-resize', 'sw-resize', 'w-resize', 'text', 'wait'
        ],
        direction: ['ltr', 'rtl'],
        display: [
            'block', 'compact', 'inline', 'inline-block', 'inline-table',
            'list-item', 'marker', 'none', 'run-in', 'table', 'table-caption',
            'table-cell', 'table-column', 'table-column-group',
            'table-footer-group', 'table-header-group', 'table-row',
            'table-row-group'
        ],
        'empty-cells': ['show', 'hide'],
        'float': ['left', 'none', 'right'],
        font: [
            'caption', 'icon', 'menu', 'message-box', 'small-caption',
            'status-bar', true, 'font-size', 'font-style', 'font-weight',
            'font-family'
        ],
        'font-family': css_comma_list,
        'font-size': [
            'xx-small', 'x-small', 'small', 'medium', 'large', 'x-large',
            'xx-large', 'larger', 'smaller', css_length
        ],
        'font-size-adjust': ['none', css_number],
        'font-stretch': [
            'normal', 'wider', 'narrower', 'ultra-condensed',
            'extra-condensed', 'condensed', 'semi-condensed',
            'semi-expanded', 'expanded', 'extra-expanded'
        ],
        'font-style': [
            'normal', 'italic', 'oblique'
        ],
        'font-variant': [
            'normal', 'small-caps'
        ],
        'font-weight': [
            'normal', 'bold', 'bolder', 'lighter', css_number
        ],
        height: [css_length, 'auto'],
        left: [css_length, 'auto'],
        'letter-spacing': ['normal', css_length],
        'line-height': ['normal', css_line_height],
        'list-style': [
            true, 'list-style-image', 'list-style-position', 'list-style-type'
        ],
        'list-style-image': ['none', css_url],
        'list-style-position': ['inside', 'outside'],
        'list-style-type': [
            'circle', 'disc', 'square', 'decimal', 'decimal-leading-zero',
            'lower-roman', 'upper-roman', 'lower-greek', 'lower-alpha',
            'lower-latin', 'upper-alpha', 'upper-latin', 'hebrew', 'katakana',
            'hiragana-iroha', 'katakana-oroha', 'none'
        ],
        margin: [4, css_margin],
        'margin-bottom': css_margin,
        'margin-left': css_margin,
        'margin-right': css_margin,
        'margin-top': css_margin,
        'marker-offset': [css_length, 'auto'],
        'max-height': [css_length, 'none'],
        'max-width': [css_length, 'none'],
        'min-height': css_length,
        'min-width': css_length,
        opacity: css_number,
        outline: [true, 'outline-color', 'outline-style', 'outline-width'],
        'outline-color': ['invert', css_color],
        'outline-style': [
            'dashed', 'dotted', 'double', 'groove', 'inset', 'none',
            'outset', 'ridge', 'solid'
        ],
        'outline-width': css_width,
        overflow: css_overflow,
        'overflow-x': css_overflow,
        'overflow-y': css_overflow,
        padding: [4, css_length],
        'padding-bottom': css_length,
        'padding-left': css_length,
        'padding-right': css_length,
        'padding-top': css_length,
        'page-break-after': css_break,
        'page-break-before': css_break,
        position: ['absolute', 'fixed', 'relative', 'static'],
        quotes: [8, css_string],
        right: [css_length, 'auto'],
        'table-layout': ['auto', 'fixed'],
        'text-align': ['center', 'justify', 'left', 'right'],
        'text-decoration': [
            'none', 'underline', 'overline', 'line-through', 'blink'
        ],
        'text-indent': css_length,
        'text-shadow': ['none', 4, [css_color, css_length]],
        'text-transform': ['capitalize', 'uppercase', 'lowercase', 'none'],
        top: [css_length, 'auto'],
        'unicode-bidi': ['normal', 'embed', 'bidi-override'],
        'vertical-align': [
            'baseline', 'bottom', 'sub', 'super', 'top', 'text-top', 'middle',
            'text-bottom', css_length
        ],
        visibility: ['visible', 'hidden', 'collapse'],
        'white-space': [
            'normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'inherit'
        ],
        width: [css_length, 'auto'],
        'word-spacing': ['normal', css_length],
        'word-wrap': ['break-word', 'normal'],
        'z-index': ['auto', css_number]
    };

    function style_attribute() {
        var v;
        while (next_token.id === '*' || next_token.id === '#' ||
                next_token.value === '_') {
            if (!option.css) {
                warn('unexpected_a');
            }
            advance();
        }
        if (next_token.id === '-') {
            if (!option.css) {
                warn('unexpected_a');
            }
            advance('-');
            if (!next_token.identifier) {
                warn('expected_nonstandard_style_attribute');
            }
            advance();
            return css_any;
        } else {
            if (!next_token.identifier) {
                warn('expected_style_attribute');
            } else {
                if (Object.prototype.hasOwnProperty.call(css_attribute_data, next_token.value)) {
                    v = css_attribute_data[next_token.value];
                } else {
                    v = css_any;
                    if (!option.css) {
                        warn('unrecognized_style_attribute_a');
                    }
                }
            }
            advance();
            return v;
        }
    }


    function style_value(v) {
        var i = 0,
            n,
            once,
            match,
            round,
            start = 0,
            vi;
        switch (typeof v) {
            case 'function':
                return v();
            case 'string':
                if (next_token.identifier && next_token.value === v) {
                    advance();
                    return true;
                }
                return false;
        }
        for (; ; ) {
            if (i >= v.length) {
                return false;
            }
            vi = v[i];
            i += 1;
            if (typeof vi === 'boolean') {
                break;
            } else if (typeof vi === 'number') {
                n = vi;
                vi = v[i];
                i += 1;
            } else {
                n = 1;
            }
            match = false;
            while (n > 0) {
                if (style_value(vi)) {
                    match = true;
                    n -= 1;
                } else {
                    break;
                }
            }
            if (match) {
                return true;
            }
        }
        start = i;
        once = [];
        for (; ; ) {
            round = false;
            for (i = start; i < v.length; i += 1) {
                if (!once[i]) {
                    if (style_value(css_attribute_data[v[i]])) {
                        match = true;
                        round = true;
                        once[i] = true;
                        break;
                    }
                }
            }
            if (!round) {
                return match;
            }
        }
    }

    function style_child() {
        if (next_token.id === '(number)') {
            advance();
            if (next_token.value === 'n' && next_token.identifier) {
                no_space_only();
                advance();
                if (next_token.id === '+') {
                    no_space_only();
                    advance('+');
                    no_space_only();
                    advance('(number)');
                }
            }
            return;
        } else {
            if (next_token.identifier &&
                    (next_token.value === 'odd' || next_token.value === 'even')) {
                advance();
                return;
            }
        }
        warn('unexpected_a');
    }

    function substyle() {
        var v;
        for (; ; ) {
            if (next_token.id === '}' || next_token.id === '(end)' ||
                    (xquote && next_token.id === xquote)) {
                return;
            }
            while (next_token.id === ';') {
                warn('unexpected_a');
                semicolon();
            }
            v = style_attribute();
            advance(':');
            if (next_token.identifier && next_token.value === 'inherit') {
                advance();
            } else {
                if (!style_value(v)) {
                    warn('unexpected_a');
                    advance();
                }
            }
            if (next_token.id === '!') {
                advance('!');
                no_space_only();
                if (next_token.identifier && next_token.value === 'important') {
                    advance();
                } else {
                    warn('expected_a_b',
                        next_token, 'important', next_token.value);
                }
            }
            if (next_token.id === '}' || next_token.id === xquote) {
                warn('expected_a_b', next_token, ';', next_token.value);
            } else {
                semicolon();
            }
        }
    }

    function style_selector() {
        if (next_token.identifier) {
            if (!Object.prototype.hasOwnProperty.call(html_tag, option.cap ?
                    next_token.value.toLowerCase() : next_token.value)) {
                warn('expected_tagname_a');
            }
            advance();
        } else {
            switch (next_token.id) {
                case '>':
                case '+':
                    advance();
                    style_selector();
                    break;
                case ':':
                    advance(':');
                    switch (next_token.value) {
                        case 'active':
                        case 'after':
                        case 'before':
                        case 'checked':
                        case 'disabled':
                        case 'empty':
                        case 'enabled':
                        case 'first-child':
                        case 'first-letter':
                        case 'first-line':
                        case 'first-of-type':
                        case 'focus':
                        case 'hover':
                        case 'last-child':
                        case 'last-of-type':
                        case 'link':
                        case 'only-of-type':
                        case 'root':
                        case 'target':
                        case 'visited':
                            advance();
                            break;
                        case 'lang':
                            advance();
                            advance('(');
                            if (!next_token.identifier) {
                                warn('expected_lang_a');
                            }
                            advance(')');
                            break;
                        case 'nth-child':
                        case 'nth-last-child':
                        case 'nth-last-of-type':
                        case 'nth-of-type':
                            advance();
                            advance('(');
                            style_child();
                            advance(')');
                            break;
                        case 'not':
                            advance();
                            advance('(');
                            if (next_token.id === ':' && peek(0).value === 'not') {
                                warn('not');
                            }
                            style_selector();
                            advance(')');
                            break;
                        default:
                            warn('expected_pseudo_a');
                    }
                    break;
                case '#':
                    advance('#');
                    if (!next_token.identifier) {
                        warn('expected_id_a');
                    }
                    advance();
                    break;
                case '*':
                    advance('*');
                    break;
                case '.':
                    advance('.');
                    if (!next_token.identifier) {
                        warn('expected_class_a');
                    }
                    advance();
                    break;
                case '[':
                    advance('[');
                    if (!next_token.identifier) {
                        warn('expected_attribute_a');
                    }
                    advance();
                    if (next_token.id === '=' || next_token.value === '~=' ||
                        next_token.value === '$=' ||
                        next_token.value === '|=' ||
                        next_token.id === '*=' ||
                        next_token.id === '^=') {
                        advance();
                        if (next_token.id !== '(string)') {
                            warn('expected_string_a');
                        }
                        advance();
                    }
                    advance(']');
                    break;
                default:
                    stop('expected_selector_a');
            }
        }
    }

    function style_pattern() {
        if (next_token.id === '{') {
            warn('expected_style_pattern');
        }
        for (; ; ) {
            style_selector();
            if (next_token.id === '</' || next_token.id === '{' ||
                    next_token.id === '(end)') {
                return '';
            }
            if (next_token.id === ',') {
                comma();
            }
        }
    }

    function style_list() {
        while (next_token.id !== '</' && next_token.id !== '(end)') {
            style_pattern();
            xmode = 'styleproperty';
            if (next_token.id === ';') {
                semicolon();
            } else {
                advance('{');
                substyle();
                xmode = 'style';
                advance('}');
            }
        }
    }

    function styles() {
        var i;
        while (next_token.id === '@') {
            i = peek();
            advance('@');
            if (next_token.identifier) {
                switch (next_token.value) {
                    case 'import':
                        advance();
                        if (!css_url()) {
                            warn('expected_a_b',
                            next_token, 'url', next_token.value);
                            advance();
                        }
                        semicolon();
                        break;
                    case 'media':
                        advance();
                        for (; ; ) {
                            if (!next_token.identifier || css_media[next_token.value] === true) {
                                stop('expected_media_a');
                            }
                            advance();
                            if (next_token.id !== ',') {
                                break;
                            }
                            comma();
                        }
                        advance('{');
                        style_list();
                        advance('}');
                        break;
                    default:
                        warn('expected_at_a');
                }
            } else {
                warn('expected_at_a');
            }
        }
        style_list();
    }


    // Parse HTML

    function do_begin(n) {
        if (n !== 'html' && !option.fragment) {
            if (n === 'div' && option.adsafe) {
                stop('adsafe_fragment');
            } else {
                stop('expected_a_b', token, 'html', n);
            }
        }
        if (option.adsafe) {
            if (n === 'html') {
                stop('adsafe_html', token);
            }
            if (option.fragment) {
                if (n !== 'div') {
                    stop('adsafe_div', token);
                }
            } else {
                stop('adsafe_fragment', token);
            }
        }
        option.browser = true;
    }

    function do_attribute(a, v) {
        var u, x;
        if (a === 'id') {
            u = typeof v === 'string' ? v.toUpperCase() : '';
            if (ids[u] === true) {
                warn('duplicate_a', next_token, v);
            }
            if (!/^[A-Za-z][A-Za-z0-9._:\-]*$/.test(v)) {
                warn('bad_id_a', next_token, v);
            } else if (option.adsafe) {
                if (adsafe_id) {
                    if (v.slice(0, adsafe_id.length) !== adsafe_id) {
                        warn('adsafe_prefix_a', next_token, adsafe_id);
                    } else if (!/^[A-Z]+_[A-Z]+$/.test(v)) {
                        warn('adsafe_bad_id');
                    }
                } else {
                    adsafe_id = v;
                    if (!/^[A-Z]+_$/.test(v)) {
                        warn('adsafe_bad_id');
                    }
                }
            }
            x = v.search(dx);
            if (x >= 0) {
                warn('unexpected_char_a_b', token, v.charAt(x), a);
            }
            ids[u] = true;
        } else if (a === 'class' || a === 'type' || a === 'name') {
            x = v.search(qx);
            if (x >= 0) {
                warn('unexpected_char_a_b', token, v.charAt(x), a);
            }
            ids[u] = true;
        } else if (a === 'href' || a === 'background' ||
                a === 'content' || a === 'data' ||
                a.indexOf('src') >= 0 || a.indexOf('url') >= 0) {
            if (option.safe && ux.test(v)) {
                stop('bad_url', next_token, v);
            }
            urls.push(v);
        } else if (a === 'for') {
            if (option.adsafe) {
                if (adsafe_id) {
                    if (v.slice(0, adsafe_id.length) !== adsafe_id) {
                        warn('adsafe_prefix_a', next_token, adsafe_id);
                    } else if (!/^[A-Z]+_[A-Z]+$/.test(v)) {
                        warn('adsafe_bad_id');
                    }
                } else {
                    warn('adsafe_bad_id');
                }
            }
        } else if (a === 'name') {
            if (option.adsafe && v.indexOf('_') >= 0) {
                warn('adsafe_name_a', next_token, v);
            }
        }
    }

    function do_tag(name, attribute) {
        var i, tag = html_tag[name], script, x;
        src = false;
        if (!tag) {
            stop(
                bundle.unrecognized_tag_a,
                next_token,
                name === name.toLowerCase() ? name : name + ' (capitalization error)'
            );
        }
        if (stack.length > 0) {
            if (name === 'html') {
                stop('unexpected_a', token, name);
            }
            x = tag.parent;
            if (x) {
                if (x.indexOf(' ' + stack[stack.length - 1].name + ' ') < 0) {
                    stop('tag_a_in_b', token, name, x);
                }
            } else if (!option.adsafe && !option.fragment) {
                i = stack.length;
                do {
                    if (i <= 0) {
                        stop('tag_a_in_b', token, name, 'body');
                    }
                    i -= 1;
                } while (stack[i].name !== 'body');
            }
        }
        switch (name) {
            case 'div':
                if (option.adsafe && stack.length === 1 && !adsafe_id) {
                    warn('adsafe_missing_id');
                }
                break;
            case 'script':
                xmode = 'script';
                advance('>');
                if (attribute.lang) {
                    warn('lang', token);
                }
                if (option.adsafe && stack.length !== 1) {
                    warn('adsafe_placement', token);
                }
                if (attribute.src) {
                    if (option.adsafe && (!adsafe_may || !approved[attribute.src])) {
                        warn('adsafe_source', token);
                    }
                    if (attribute.type) {
                        warn('type', token);
                    }
                } else {
                    step_in(next_token.from);
                    edge();
                    use_strict();
                    adsafe_top = true;
                    script = statements();

                    // JSLint is also the static analyzer for ADsafe. See www.ADsafe.org.

                    if (option.adsafe) {
                        if (adsafe_went) {
                            stop('adsafe_script', token);
                        }
                        if (script.length !== 1 ||
                            aint(script[0], 'id', '(') ||
                            aint(script[0].first, 'id', '.') ||
                            aint(script[0].first.first, 'value', 'ADSAFE') ||
                            aint(script[0].second[0], 'value', adsafe_id)) {
                            stop('adsafe_id_go');
                        }
                        switch (script[0].first.second.value) {
                            case 'id':
                                if (adsafe_may || adsafe_went ||
                                script[0].second.length !== 1) {
                                    stop('adsafe_id', next_token);
                                }
                                adsafe_may = true;
                                break;
                            case 'go':
                                if (adsafe_went) {
                                    stop('adsafe_go');
                                }
                                if (script[0].second.length !== 2 ||
                                aint(script[0].second[1], 'id', 'function') ||
                                !script[0].second[1].first ||
                                script[0].second[1].first.length !== 2 ||
                                aint(script[0].second[1].first[0], 'value', 'dom') ||
                                aint(script[0].second[1].first[1], 'value', 'lib')) {
                                    stop('adsafe_go', next_token);
                                }
                                adsafe_went = true;
                                break;
                            default:
                                stop('adsafe_id_go');
                        }
                    }
                    indent = null;
                }
                xmode = 'html';
                advance('</');
                if (!next_token.identifier && next_token.value !== 'script') {
                    warn('expected_a_b', next_token, 'script', next_token.value);
                }
                advance();
                xmode = 'outer';
                break;
            case 'style':
                xmode = 'style';
                advance('>');
                styles();
                xmode = 'html';
                advance('</');
                if (!next_token.identifier && next_token.value !== 'style') {
                    warn('expected_a_b', next_token, 'style', next_token.value);
                }
                advance();
                xmode = 'outer';
                break;
            case 'input':
                switch (attribute.type) {
                    case 'radio':
                    case 'checkbox':
                    case 'button':
                    case 'reset':
                    case 'submit':
                        break;
                    case 'text':
                    case 'file':
                    case 'password':
                    case 'file':
                    case 'hidden':
                    case 'image':
                        if (option.adsafe && attribute.autocomplete !== 'off') {
                            warn('adsafe_autocomplete');
                        }
                        break;
                    default:
                        warn('bad_type');
                }
                break;
            case 'applet':
            case 'body':
            case 'embed':
            case 'frame':
            case 'frameset':
            case 'head':
            case 'iframe':
            case 'noembed':
            case 'noframes':
            case 'object':
            case 'param':
                if (option.adsafe) {
                    warn('adsafe_tag', next_token, name);
                }
                break;
        }
    }


    function closetag(name) {
        return '</' + name + '>';
    }

    function html() {
        var attribute, attributes, is_empty, name, old_white = option.white,
            quote, tag_name, tag, wmode;
        xmode = 'html';
        xquote = '';
        stack = null;
        for (; ; ) {
            switch (next_token.value) {
                case '<':
                    xmode = 'html';
                    advance('<');
                    attributes = {};
                    tag_name = next_token;
                    if (!tag_name.identifier) {
                        warn('bad_name_a', tag_name);
                    }
                    name = tag_name.value;
                    if (option.cap) {
                        name = name.toLowerCase();
                    }
                    tag_name.name = name;
                    advance();
                    if (!stack) {
                        stack = [];
                        do_begin(name);
                    }
                    tag = html_tag[name];
                    if (typeof tag !== 'object') {
                        stop('unrecognized_tag_a', tag_name, name);
                    }
                    is_empty = tag.empty;
                    tag_name.type = name;
                    for (; ; ) {
                        if (next_token.id === '/') {
                            advance('/');
                            if (next_token.id !== '>') {
                                warn('expected_a_b', next_token, '>', next_token.value);
                            }
                            break;
                        }
                        if (next_token.id && next_token.id.charAt(0) === '>') {
                            break;
                        }
                        if (!next_token.identifier) {
                            if (next_token.id === '(end)' || next_token.id === '(error)') {
                                warn('expected_a_b', next_token, '>', next_token.value);
                            }
                            warn('bad_name_a');
                        }
                        option.white = false;
                        spaces();
                        attribute = next_token.value;
                        option.white = old_white;
                        advance();
                        if (!option.cap && attribute !== attribute.toLowerCase()) {
                            warn('attribute_case_a', token);
                        }
                        attribute = attribute.toLowerCase();
                        xquote = '';
                        if (Object.prototype.hasOwnProperty.call(attributes, attribute)) {
                            warn('duplicate_a', token, attribute);
                        }
                        if (attribute.slice(0, 2) === 'on') {
                            if (!option.on) {
                                warn('html_handlers');
                            }
                            xmode = 'scriptstring';
                            advance('=');
                            quote = next_token.id;
                            if (quote !== '"' && quote !== '\'') {
                                stop('expected_a_b', next_token, '"', next_token.value);
                            }
                            xquote = quote;
                            wmode = option.white;
                            option.white = true;
                            advance(quote);
                            use_strict();
                            statements();
                            option.white = wmode;
                            if (next_token.id !== quote) {
                                stop('expected_a_b', next_token, quote, next_token.value);
                            }
                            xmode = 'html';
                            xquote = '';
                            advance(quote);
                            tag = false;
                        } else if (attribute === 'style') {
                            xmode = 'scriptstring';
                            advance('=');
                            quote = next_token.id;
                            if (quote !== '"' && quote !== '\'') {
                                stop('expected_a_b', next_token, '"', next_token.value);
                            }
                            xmode = 'styleproperty';
                            xquote = quote;
                            advance(quote);
                            substyle();
                            xmode = 'html';
                            xquote = '';
                            advance(quote);
                            tag = false;
                        } else {
                            if (next_token.id === '=') {
                                advance('=');
                                tag = next_token.value;
                                if (!next_token.identifier &&
                                    next_token.id !== '"' &&
                                    next_token.id !== '\'' &&
                                    next_token.id !== '(string)' &&
                                    next_token.id !== '(string)' &&
                                    next_token.id !== '(color)') {
                                    warn('expected_attribute_value_a', token, attribute);
                                }
                                advance();
                            } else {
                                tag = true;
                            }
                        }
                        attributes[attribute] = tag;
                        do_attribute(attribute, tag);
                    }
                    do_tag(name, attributes);
                    if (!is_empty) {
                        stack.push(tag_name);
                    }
                    xmode = 'outer';
                    advance('>');
                    break;
                case '</':
                    xmode = 'html';
                    advance('</');
                    if (!next_token.identifier) {
                        warn('bad_name_a');
                    }
                    name = next_token.value;
                    if (option.cap) {
                        name = name.toLowerCase();
                    }
                    advance();
                    if (!stack) {
                        stop('unexpected_a', next_token, closetag(name));
                    }
                    tag_name = stack.pop();
                    if (!tag_name) {
                        stop('unexpected_a', next_token, closetag(name));
                    }
                    if (tag_name.name !== name) {
                        stop('expected_a_b',
                        next_token, closetag(tag_name.name), closetag(name));
                    }
                    if (next_token.id !== '>') {
                        stop('expected_a_b', next_token, '>', next_token.value);
                    }
                    xmode = 'outer';
                    advance('>');
                    break;
                case '<!':
                    if (option.safe) {
                        warn('adsafe_a');
                    }
                    xmode = 'html';
                    for (; ; ) {
                        advance();
                        if (next_token.id === '>' || next_token.id === '(end)') {
                            break;
                        }
                        if (next_token.value.indexOf('--') >= 0) {
                            stop('unexpected_a', next_token, '--');
                        }
                        if (next_token.value.indexOf('<') >= 0) {
                            stop('unexpected_a', next_token, '<');
                        }
                        if (next_token.value.indexOf('>') >= 0) {
                            stop('unexpected_a', next_token, '>');
                        }
                    }
                    xmode = 'outer';
                    advance('>');
                    break;
                case '(end)':
                    return;
                default:
                    if (next_token.id === '(end)') {
                        stop('missing_a', next_token,
                        '</' + stack[stack.length - 1].value + '>');
                    } else {
                        advance();
                    }
            }
            if (stack && stack.length === 0 && (option.adsafe ||
                    !option.fragment || next_token.id === '(end)')) {
                break;
            }
        }
        if (next_token.id !== '(end)') {
            stop('unexpected_a');
        }
    }


    // The actual JSLINT function itself.

    itself = function (the_source, the_option) {
        var i, predef, tree;
        JAYLINT.comments = [];
        JAYLINT.errors = [];
        JAYLINT.tree = '';
        begin = older_token = prev_token = token = next_token =
            Object.create(syntax['(begin)']);
        predefined = {};
        add_to_predefined(standard);
        if (the_option) {
            option = Object.create(the_option);
            predef = option.predef;
            if (predef) {
                if (Array.isArray(predef)) {
                    for (i = 0; i < predef.length; i += 1) {
                        predefined[predef[i]] = true;
                    }
                } else if (typeof predef === 'object') {
                    add_to_predefined(predef);
                }
            }
            do_safe();
        } else {
            option = {};
        }
        option.indent = +option.indent || 0;
        option.maxerr = option.maxerr || 50;
        adsafe_id = '';
        adsafe_may = adsafe_top = adsafe_went = false;
        approved = {};
        if (option.approved) {
            for (i = 0; i < option.approved.length; i += 1) {
                approved[option.approved[i]] = option.approved[i];
            }
        } else {
            approved.test = 'test';
        }
        tab = '';
        for (i = 0; i < option.indent; i += 1) {
            tab += ' ';
        }
        global_scope = scope = {};
        global_funct = funct = {
            '(scope)': scope,
            '(breakage)': 0,
            '(loopage)': 0
        };
        functions = [funct];

        comments_off = false;
        ids = {};
        in_block = false;
        indent = null;
        json_mode = false;
        lookahead = [];
        member = {};
        node_js = false;
        properties = null;
        prereg = true;
        src = false;
        stack = null;
        strict_mode = false;
        urls = [];
        var_mode = null;
        warnings = 0;
        xmode = '';
        lex.init(the_source);

        assume();

        try {
            advance();
            if (next_token.id === '(number)') {
                stop('unexpected_a');
            } else if (next_token.value.charAt(0) === '<') {
                html();
                if (option.adsafe && !adsafe_went) {
                    warn('adsafe_go', this);
                }
            } else {
                switch (next_token.id) {
                    case '{':
                    case '[':
                        json_mode = true;
                        json_value();
                        break;
                    case '@':
                    case '*':
                    case '#':
                    case '.':
                    case ':':
                        xmode = 'style';
                        advance();
                        if (token.id !== '@' || !next_token.identifier ||
                            next_token.value !== 'charset' || token.line !== 1 ||
                            token.from !== 1) {
                            stop('css');
                        }
                        advance();
                        if (next_token.id !== '(string)' &&
                            next_token.value !== 'UTF-8') {
                            stop('css');
                        }
                        advance();
                        semicolon();
                        styles();
                        break;

                    default:
                        if (option.adsafe && option.fragment) {
                            stop('expected_a_b',
                            next_token, '<div>', next_token.value);
                        }

                        // If the first token is predef semicolon, ignore it. This is sometimes used when
                        // files are intended to be appended to files that may be sloppy. predef sloppy
                        // file may be depending on semicolon insertion on its last line.

                        step_in(1);
                        if (next_token.id === ';' && !node_js) {
                            semicolon();
                        }
                        adsafe_top = true;
                        tree = statements();
                        begin.first = tree;
                        JAYLINT.tree = begin;
                        if (option.adsafe && (tree.length !== 1 ||
                            aint(tree[0], 'id', '(') ||
                            aint(tree[0].first, 'id', '.') ||
                            aint(tree[0].first.first, 'value', 'ADSAFE') ||
                            aint(tree[0].first.second, 'value', 'lib') ||
                            tree[0].second.length !== 2 ||
                            tree[0].second[0].id !== '(string)' ||
                            aint(tree[0].second[1], 'id', 'function'))) {
                            stop('adsafe_lib');
                        }
                        if (tree.disrupt) {
                            warn('weird_program', prev_token);
                        }
                }
            }
            indent = null;
            advance('(end)');
        } catch (e) {
            if (e) {        // `~
                JAYLINT.errors.push({
                    reason: e.message,
                    line: e.line || next_token.line,
                    character: e.character || next_token.from
                }, null);
            }
        }
        return JAYLINT.errors.length === 0;
    };


    // Data summary.

    itself.data = function () {
        var data = { functions: [] },
            function_data,
            globals,
            i,
            j,
            kind,
            members = [],
            name,
            the_function,
            undef = [],
            unused = [];
        if (itself.errors.length) {
            data.errors = itself.errors;
        }

        if (json_mode) {
            data.json = true;
        }

        if (urls.length > 0) {
            data.urls = urls;
        }

        globals = Object.keys(global_scope).filter(function (value) {
            return value.charAt(0) !== '(' ? value : undefined;
        });
        if (globals.length > 0) {
            data.globals = globals;
        }

        for (i = 1; i < functions.length; i += 1) {
            the_function = functions[i];
            function_data = {};
            for (j = 0; j < functionicity.length; j += 1) {
                function_data[functionicity[j]] = [];
            }
            for (name in the_function) {
                if (Object.prototype.hasOwnProperty.call(the_function, name)) {
                    if (name.charAt(0) !== '(') {
                        kind = the_function[name];
                        if (kind === 'unction' || kind === 'unparam') {
                            kind = 'unused';
                        }
                        if (Array.isArray(function_data[kind])) {
                            function_data[kind].push(name);
                            if (kind === 'unused') {
                                unused.push({
                                    name: name,
                                    line: the_function['(line)'],
                                    'function': the_function['(name)']
                                });
                            } else if (kind === 'undef') {
                                undef.push({
                                    name: name,
                                    line: the_function['(line)'],
                                    'function': the_function['(name)']
                                });
                            }
                        }
                    }
                }
            }
            for (j = 0; j < functionicity.length; j += 1) {
                if (function_data[functionicity[j]].length === 0) {
                    delete function_data[functionicity[j]];
                }
            }
            function_data.name = the_function['(name)'];
            function_data.param = the_function['(params)'];
            function_data.line = the_function['(line)'];
            function_data['(complexity)'] = the_function['(complexity)'];
            data.functions.push(function_data);
        }

        if (unused.length > 0) {
            data.unused = unused;
        }
        if (undef.length > 0) {
            data.undef = undef;
        }

        members = [];
        for (name in member) {
            if (typeof member[name] === 'number') {
                data.member = member;
                break;
            }
        }

        return data;
    };


    itself.report = function (errors_only) {
        var data = itself.data(),
            err, evidence, i, j, key, keys, length, mem = '', name, names,
            output = [], snippets, the_function, warning;

        function detail(h, value) {
            var comma_needed, singularity;
            if (Array.isArray(value)) {
                output.push('<div><i>' + h + '</i> ');
                value = value.sort().forEach(function (item) {
                    if (item !== singularity) {
                        singularity = item;
                        output.push((comma_needed ? ', ' : '') + singularity);
                        comma_needed = true;
                    }
                });
                output.push('</div>');
            } else if (value) {
                output.push('<div><i>' + h + '</i> ' + value + '</div>');
            }
        }

        if (data.errors || data.unused || data.undef) {
            err = true;
            output.push('<div id=errors><i>Error:</i>');
            if (data.errors) {
                for (i = 0; i < data.errors.length; i += 1) {
                    warning = data.errors[i];
                    if (warning) {
                        evidence = warning.evidence || '';
                        output.push('<p>Problem' + (isFinite(warning.line) ? ' at line ' +
                            warning.line + ' character ' + warning.character : '') +
                            ': ' + warning.reason.entityify() +
                            '</p><p class=evidence>' +
                            (evidence && (evidence.length > 80 ? evidence.slice(0, 77) + '...' :
                            evidence).entityify()) + '</p>');
                    }
                }
            }

            if (data.undef) {
                snippets = [];
                for (i = 0; i < data.undef.length; i += 1) {
                    snippets[i] = '<code><u>' + data.undef[i].name + '</u></code>&nbsp;<i>' +
                        data.undef[i].line + ' </i> <small>' +
                        data.undef[i]['function'] + '</small>';
                }
                output.push('<p><i>Undefined variable:</i> ' + snippets.join(', ') + '</p>');
            }
            if (data.unused) {
                snippets = [];
                for (i = 0; i < data.unused.length; i += 1) {
                    snippets[i] = '<code><u>' + data.unused[i].name + '</u></code>&nbsp;<i>' +
                        data.unused[i].line + ' </i> <small>' +
                        data.unused[i]['function'] + '</small>';
                }
                output.push('<p><i>Unused variable:</i> ' + snippets.join(', ') + '</p>');
            }
            if (data.json) {
                output.push('<p>JSON: bad.</p>');
            }
            output.push('</div>');
        }

        if (!errors_only) {

            output.push('<br><div id=functions>');

            if (data.urls) {
                detail("URLs<br>", data.urls, '<br>');
            }

            if (xmode === 'style') {
                output.push('<p>CSS.</p>');
            } else if (data.json && !err) {
                output.push('<p>JSON: good.</p>');
            } else if (data.globals) {
                output.push('<div><i>Global</i> ' +
                    data.globals.sort().join(', ') + '</div>');
            } else {
                output.push('<div><i>No new global variables introduced.</i></div>');
            }

            for (i = 0; i < data.functions.length; i += 1) {
                the_function = data.functions[i];
                names = [];
                if (the_function.param) {
                    for (j = 0; j < the_function.param.length; j += 1) {
                        names[j] = the_function.param[j].value;
                    }
                }
                output.push('<br><div class=function><i>' + the_function.line +
                    '</i> ' + the_function.name.entityify() +
                    '(' + names.join(', ') + ')</div>');
                detail('<big><b>Undefined</b></big>', the_function.undef);
                detail('<big><b>Unused</b></big>', the_function.unused);
                detail('Closure', the_function.closure);
                detail('Variable', the_function['var']);
                detail('Exception', the_function.exception);
                detail('Outer', the_function.outer);
                detail('Global', the_function.global);
                detail('Label', the_function.label);
                detail('Complexity', the_function['(complexity)']);
            }

            if (data.member) {
                keys = Object.keys(data.member);
                if (keys.length) {
                    keys = keys.sort();
                    mem = '<br><pre id=properties>/*properties ';
                    length = 13;
                    for (i = 0; i < keys.length; i += 1) {
                        key = keys[i];
                        name = ix.test(key) ? key :
                            '\'' + key.entityify().replace(nx, sanitize) + '\'';
                        if (length + name.length > 72) {
                            output.push(mem + '<br>');
                            mem = '    ';
                            length = 1;
                        }
                        length += name.length + 2;
                        if (data.member[key] === 1) {
                            name = '<i>' + name + '</i>';
                        }
                        if (i < keys.length - 1) {
                            name += ', ';
                        }
                        mem += name;
                    }
                    output.push(mem + '<br>*/</pre>');
                }
                output.push('</div>');
            }
        }
        return output.join('');
    };
    itself.jslint = itself;

    itself.edition = '2012-05-01';

    return itself;

} ());
(function init($data, global) {

    function il(msg) {
        if (typeof intellisense !== 'undefined') {
            if (!intellisense.i) {
                intellisense.i = 0;
            }
            intellisense.i = intellisense.i + 1;
            intellisense.logMessage(msg + ":" + intellisense.i);
        }
    }


    function MemberDefinition(memberDefinitionData, definedClass) {
        
        ///<field name="name" type="String">*</field>
        ///<field name="dataType" type="Object">*</field>
        ///<field name="elementType" type="Object"></field>
        ///<field name="kind" type="String" />
        ///<field name="classMember" type="Boolean" />
        ///<field name="set" type="Function" />
        ///<field name="get" type="Function" />
        ///<field name="value" type="Object" />
        ///<field name="initialValue" type="Object" />
        ///<field name="method" type="Function" />
        ///<field name="enumerable" type="Boolean" />
        ///<field name="configurable" type="Boolean" />
        ///<field name="key" type="Boolean" />
        ///<field name="computed" type="Boolean" />
        ///<field name="storeOnObject" type="Boolean">[false] if false value is stored in initData, otherwise on the object</field>
        ///<field name="monitorChanges" type="Boolean">[true] if set to false propertyChange events are not raise and property tracking is disabled</field>

        this.kind = MemberTypes.property;
        //this.definedBy = definedClass;
        Object.defineProperty(this, 'definedBy', { value: definedClass, enumerable:false, configurable: false, writable: false });
        if (memberDefinitionData) {
            if (typeof memberDefinitionData === 'function' || typeof memberDefinitionData.asFunction === 'function') {
                this.method = memberDefinitionData;
                this.kind = MemberTypes.method;
            } else {
                this.enumerable = true;
                this.configurable = true;
                if (typeof memberDefinitionData === "number") {
                    this.value = memberDefinitionData;
                    this.dataType = "integer";
                } else if (typeof memberDefinitionData === "string") {
                    this.value = memberDefinitionData;
                    this.dataType = typeof memberDefinitionData;
                } else {
                    for (var item in memberDefinitionData) {
                        if (memberDefinitionData.hasOwnProperty(item)) {
                            this[item] = memberDefinitionData[item];
                        }
                    }
                }
            }
            if (this.type !== undefined) {
                this.dataType = this.dataType || this.type;
            } else {
                this.type = this.dataType;
            }
        }
    }


    MemberDefinition.prototype.createPropertyDescriptor = function (classFunction, value) {
        ///<returns type="Object" />
        var pd = this;
        var result = {
            enumerable: this.enumerable == undefined ? true : this.enumerable,
            configurable: this.configurable == undefined ? true : this.configurable
        };
        if (this.set && this.get) {
            result.set = this.set;
            result.get = this.get;
        } else if ("value" in this || value) {
            result.value = value || this.value;
            //TODO
            //result.writable = this.writable;
            result.writable = true;
        }
        else {
            result.set = function (value) { this.storeProperty(pd, value); };
            result.get = function () { return this.retrieveProperty(pd); };
        }
        return result;
    };
    MemberDefinition.prototype.createStorePropertyDescriptor = function (value) {
        var pd = this;
        return { enumerable: false, writable: true, configurable: pd.configurable, value: value };
    };
    MemberDefinition.prototype.createGetMethod = function () {
        var pd = this;
        return {
            enumerable: false, writable: false, configurable: false,
            value: function (callback) { return this.getProperty(pd, callback); }
        };
    };
    MemberDefinition.prototype.createSetMethod = function () {
        var pd = this;
        return {
            enumerable: false, writable: false, configurable: false,
            value: function (value, callback) { return this.setProperty(pd, value, callback); }
        };
    };

    MemberDefinition.prototype.toJSON = function () {
        var alma = {};
        for (var name in this) {
            if (name !== 'defineBy' && name !== 'storageModel') {
                alma[name] = this[name];
            }
        }
        return alma;
    }

    //TODO global/window
    $data.MemberDefinition = window["MemberDefinition"] = MemberDefinition;
    
    var memberDefinitionPrefix = '$';
    function MemberDefinitionCollection() { };
    MemberDefinitionCollection.prototype = {
		clearCache: function(){
			this.arrayCache = undefined;
			this.pubMapPropsCache = undefined;
			this.keyPropsCache = undefined;
			this.propByTypeCache = undefined;
		},
        asArray: function () {
            if (!this.arrayCache) {
                this.arrayCache = [];
                for (var i in this) {
                    if (i.indexOf(memberDefinitionPrefix) === 0)
                        this.arrayCache.push(this[i]);
                }
            }
            return this.arrayCache;
        },
        getPublicMappedProperties: function () {
			if (!this.pubMapPropsCache){
				this.pubMapPropsCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && !this[i].notMapped && this[i].enumerable)
						this.pubMapPropsCache.push(this[i]);
				}
			}
			return this.pubMapPropsCache;// || (this.pubMapPropsCache = this.asArray().filter(function (m) { return m.kind == 'property' && !m.notMapped && m.enumerable; }));
		},
		getPublicMappedPropertyNames: function(){
		    if (!this.pubMapPropNamesCache){
		        this.pubMapPropNamesCache = [];
		        for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && !this[i].notMapped && this[i].enumerable)
						this.pubMapPropNamesCache.push(this[i].name);
				}
		    }
		    return this.pubMapPropNamesCache;
		},
        getKeyProperties: function () {
			if (!this.keyPropsCache){
				this.keyPropsCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'property' && this[i].key)
						this.keyPropsCache.push(this[i]);
				}
			}
			return this.keyPropsCache;
			//return this.keyPropsCache || (this.keyPropsCache = this.asArray().filter(function (m) { return m.kind == 'property' && m.key; }));
		},
		getPublicMappedMethods: function(){
		    if (!this.pubMapMethodsCache){
				this.pubMapMethodsCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].kind == 'method' && this[i].method/* && this.hasOwnProperty(i)*/)
						this.pubMapMethodsCache.push(this[i]);
				}
			}
			return this.pubMapMethodsCache;
		},
        getPropertyByType: function (type) {
			if (!this.propByTypeCache){
				this.propByTypeCache = [];
				for (var i in this){
					if (i.indexOf(memberDefinitionPrefix) === 0 && this[i].dataType == type)
						this.propByTypeCache.push(this[i]);
				}
			}
			return this.propByTypeCache;
			//return this.propByTypeCache || (this.propByTypeCache = this.asArray().filter(function (m) { return m.dataType == type; }));
		},
        getMember: function (name) { return this[memberDefinitionPrefix + name]; },
        setMember: function (value) { this[memberDefinitionPrefix + value.name] = value; }
    };
    MemberDefinitionCollection.prototype.constructor = MemberDefinitionCollection;
    $data.MemberDefinitionCollection = window["MemberDefinitionCollection"] = MemberDefinitionCollection;

    
    eval('function Base() { };');

    $data.Base = Base;

    $data.Base.fullName = '$data.Base';
    if (!$data.Base.name) {
        $data.Base.name = "Base";
    };

    $data.Base.prototype.storeProperty = function (memberDefinition, value) {
        var backingFieldName = "_" + memberDefinition.name;
        if (!this[backingFieldName]) {
            Object.defineProperty(this, backingFieldName, memberDefinition.createStorePropertyDescriptor(value));
        }
        else {
            this[backingFieldName] = value;
        }
    };

    $data.Base.prototype.retrieveProperty = function (memberDefinition) {
        var backingFieldName = "_" + memberDefinition.name;
        return this[backingFieldName];
    };

    $data.Base.prototype.setProperty = function (memberDefinition, value, callback) {
        this[memberDefinition.name] = value;
        callback();
    };
    $data.Base.prototype.getProperty = function (memberDefinition, callback) {
        callback.apply(this, [this[memberDefinition.name]]);
    };
    $data.Base.extend = function (name, instanceDefinition, classDefinition) {
        return $data.Class.define(name, null, null, instanceDefinition, classDefinition);
    };
    //window['Base'] = Base;

    function ClassEngineBase() {
        this.classNames = {};
    }

    function MemberTypes() {
        ///<field name="method" type="string" />
        ///<field name="property" type="string" />
        ///<field name="field" type="string" />
        ///<field name="complexProperty" type="string" />
    }
    MemberTypes.__enum = true;

    MemberTypes.method = "method";
    MemberTypes.property = "property";
    MemberTypes.navProperty = "navProperty";
    MemberTypes.complexProperty = "complexProperty";
    MemberTypes.field = "field";

    $data.MemberTypes = MemberTypes;

    function TypeCreator() {

    }

    function TypeCreateStep(definedBy, initFunc) {
        this.definedBy = definedBy;
        this.initfunc = initFunc;
    }
    TypeCreateStep.constructor = "constructor";
    TypeCreateStep.classConstructor = "classConstructor";
    TypeCreateStep.mixin = "mixin";
    TypeCreateStep.propagation = "propagation";

    function TypeCreateObject()
    {
        this._createOrder = [];
        this._createOrder.calculated = false;
        this.keyIndex = [];

        this.constructorKeys = [];
        this.mixinKeys = [];
        this.propagationKeys = [];

        this.steppes = {};

        this.addStep = function (stepType, defined, typeCreateFunc) {
            this._createOrder.calculated = false;
            var key = defined.name + '_' + stepType;
            if (this.steppes[key])
                Guard.raise(new Exception("ERROR: '" + key + "' already defined!", "Type build error"));

            switch (stepType) {
                case TypeCreateStep.constructor:
                case TypeCreateStep.classConstructor:
                    this.constructorKeys.push(key);
                    break;
                case TypeCreateStep.mixin:
                    this.mixinKeys.push(key);
                    break;
                case TypeCreateStep.propagation:
                    this.propagationKeys.push(key);
                    break;
                default:
                    return;
            }

            this.steppes[key] = new TypeCreateStep(defined, typeCreateFunc);
        };
        this.keyCount = function(){
            return this.constructorKeys.length + this.mixinKeys.length + this.propagationKeys.length;
        };

        this.getOrderedSteppes = function () {
            if (this._createOrder.calculated == false) {
                var _this = this;
                //function _concatStep(key) {
                //    _this._createOrder.push(_this.steppes[key]);
                //}

                this._createOrder = [];
                for (var i = 0, l = mixinKeys.length; i < l; i++) {
                    _this._createOrder.push(_this.steppes[mixinKeys[i]]);
                }
                for (var i = 0, l = constructorKeys.length; i < l; i++) {
                    _this._createOrder.push(_this.steppes[constructorKeys[i]]);
                }
                for (var i = 0, l = propagationKeys.length; i < l; i++) {
                    _this._createOrder.push(_this.steppes[propagationKeys[i]]);
                }
                //this.mixinKeys.forEach(_concatStep);
                //this.constructorKeys.forEach(_concatStep);
                //this.propagationKeys.forEach(_concatStep);

                this._createOrder.calculated = true;
            }

            return this._createOrder;
        };
    }

    ClassEngineBase.prototype = {

    getClass: function(classReference) {

    },

    getProperties: function (classFunction) {
        return classFunction.propertyDefinitions;
    },



    define: function (className, baseClass, interfaces, instanceDefinition, classDefinition) {
        /// <signature>
        ///     <summary>Creates a Jaydata type</summary>
        ///     <param name="className" type="String">Name of the class</param>
        ///     <param name="baseClass" type="Function">Basetype of the class</param>
        ///     <param name="interfaces" type="Object" elementType="Function" />
        ///     <param name="instanceDefinition" type="Object">Class definition (properties, methods, etc)</param>
        ///     <param name="classDefinition" type="Object">Class static definition</param>
        ///     <example>
        ///         
        ///         var t = new $data.Class.define('Types.A', $data.Base, null, {
        ///             constructor: function(){ },
        ///             func1: function(){ },
        ///             member1: { type: 'string' }
        ///         }, { 
        ///             staticFunc1: function() {}    
        ///         })
        ///         
        ///     </example>
        /// </signature>

        return this.defineEx(className, [{ type: baseClass }], interfaces, instanceDefinition, classDefinition);
    },
    defineEx: function (className, baseClasses, interfaces, instanceDefinition, classDefinition) {
        /// <signature>
        ///     <summary>Creates a Jaydata type</summary>
        ///     <param name="className" type="String">Name of the class</param>
        ///     <param name="baseClasses" type="Array" elementType="Functions">Basetypes of the class. First is a real base, others are mixins</param>
        ///     <param name="interfaces" type="Object" elementType="Function" />
        ///     <param name="instanceDefinition" type="Object">Class definition (properties, methods, etc)</param>
        ///     <param name="classDefinition" type="Object">Class static definition</param>
        ///     <example>
        ///         
        ///         var t = new $data.Class.define('Types.A', [$data.Base, $data.Mixin1, $data.Mixin2], null, {
        ///             constructor: function(){ },
        ///             func1: function(){ },
        ///             member1: { type: 'string' }
        ///         }, { 
        ///             staticFunc1: function() {}    
        ///         })
        ///         
        ///     </example>
        /// </signature>
        /// <signature>
        ///     <summary>Creates a Jaydata type</summary>
        ///     <param name="className" type="String">Name of the class</param>
        ///     <param name="baseClasses" type="Array" elementType="Object">Basetypes of the class. First is a real base, others are mixins or propagations</param>
        ///     <param name="interfaces" type="Object" elementType="Function" />
        ///     <param name="instanceDefinition" type="Object">Class definition (properties, methods, etc)</param>
        ///     <param name="classDefinition" type="Object">Class static definition</param>
        ///     <example>
        ///         
        ///         var t = new $data.Class.define('Types.A', [
        ///                         { type: $data.Base, params: [1, 'secondParameterValue', new ConstructorParameter(0)] },
        ///                         { type: $data.Mixin1, },
        ///                         { type: $data.Mixin2, },
        ///                         { type: $data.Propagation1, params: [new ConstructorParameter(1)], propagateTo:'Propagation1' },
        ///                         { type: $data.Propagation2, params: ['firstParameterValue'], propagateTo:'Propagation2' }
        ///                     ], null, {
        ///             constructor: function(){ },
        ///             func1: function(){ },
        ///             member1: { type: 'string' }
        ///         }, { 
        ///             staticFunc1: function() {}    
        ///         })
        ///         
        ///     </example>
        /// </signature>

        //il("!defineClass was invoked:" + className);

        if (baseClasses.length == 0) {
            baseClasses.push({ type: $data.Base });
        } else if (baseClasses.length > 0 && !baseClasses[0].type){
            baseClasses[0].type = $data.Base;
        }
        for (var i = 0, l=baseClasses.length; i < l; i++){
            if (typeof baseClasses[i] === 'function')
                baseClasses[i] = { type: baseClasses[i] };
        }

        var providedCtor = instanceDefinition ? instanceDefinition.constructor : undefined;

        var classNameParts = className.split('.');
        var shortClassName = classNameParts.splice(classNameParts.length - 1, 1)[0];

        var root = window;
        for (var i = 0; i < classNameParts.length; i++){
            var part = classNameParts[i];
            if (!root[part]) {
                //console.log("namespace missing:" + part + ", creating");
                var ns = {};
                ns.__namespace = true;
                root[part] = ns;
            }
            root = root[part];
        }
        
        /*classNameParts.forEach(function (part) {
            if (!root[part]) {
                //console.log("namespace missing:" + part + ", creating");
                var ns = {};
                ns.__namespace = true;
                root[part] = ns;
            }
            root = root[part];
        });*/

        var classFunction = null;
        classFunction = this.classFunctionBuilder(shortClassName, baseClasses, classDefinition, instanceDefinition);
        classFunction.fullName = className;
        classFunction.namespace = classNameParts.join('.'); //classname splitted

        this.buildType(classFunction, baseClasses, instanceDefinition, classDefinition);

        classFunction.name = shortClassName;
        Container.registerType(className, classFunction);

        if (typeof intellisense !== 'undefined') {
            if (instanceDefinition && instanceDefinition.constructor) {
                intellisense.annotate(classFunction, instanceDefinition.constructor);
            }
        }

        root[shortClassName] = this.classNames[className] = classFunction;

        //classFunction.prototype.constructor = instanceDefinition.constructor;
        //classFunction.constructor = instanceDefinition.constructor;
        //classFunction.toJSON = function () { return classFunction.memberDefinitions.filter( function(md) { return md; };
        return classFunction;
    },
    classFunctionBuilder: function (name, base, classDefinition, instanceDefinition) {
        return new Function('base', 'classDefinition', 'instanceDefinition', 'return function ' + name + ' (){ ' + 
            this.bodyBuilder(base, classDefinition, instanceDefinition) + ' \n}; ')(base, classDefinition, instanceDefinition);
    },
    bodyBuilder: function (bases, classDefinition, instanceDefinition) {
        var mixin = '';
        var body = '';
        var propagation = '';

        for (var i = 0, l = bases.length; i < l; i++) {
            var base = bases[i];
            var index = i;
            if (index == 0) { //ctor func
                if (base && base.type) {
                    body += '    var baseArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
                    body += '    ' + base.type.fullName + '.apply(this, baseArguments); \n';
                }
            } else {
                if (base && base.type && base.propagateTo) {
                    //propagation
                    propagation += '    ' + (!propagation ? 'var ' : '' + '') + 'propagationArguments = $data.typeSystem.createCtorParams(arguments, base[' + index + '].params, this); \n';
                    propagation += '    this["' + base.propagateTo + '"] =  Object.create(' + base.type.fullName + '.prototype); \n' +
                                   '    ' + base.type.fullName + '.apply(this["' + base.propagateTo + '"], propagationArguments); \n';
                }
                else if (base && base.type && base.type.memberDefinitions && base.type.memberDefinitions.$constructor && !base.propagateTo) {
                    //mixin
                    mixin += '    ' + base.type.fullName + '.memberDefinitions.$constructor.method.apply(this); \n';
                }
            }
        }
        if (instanceDefinition && instanceDefinition.constructor != Object) 
            body += "    instanceDefinition.constructor.apply(this, arguments); \n";

        return '\n    //mixins \n' + mixin + '\n    //construction \n' + body + '\n    //propagations \n' + propagation;
    },

    buildType: function (classFunction, baseClasses, instanceDefinition, classDefinition) {
        var baseClass = baseClasses[0].type;
        classFunction.inheritsFrom = baseClass;

        if (baseClass) {
            classFunction.prototype = Object.create(baseClass.prototype);
            classFunction.memberDefinitions = Object.create(baseClass.memberDefinitions || new MemberDefinitionCollection());
			classFunction.memberDefinitions.clearCache();

			var staticDefs = baseClass.staticDefinitions;
			if (staticDefs){
				staticDefs = staticDefs.asArray();
				if (staticDefs) {
            		for(var i = 0; i < staticDefs.length; i++) {
						this.buildMember(classFunction, staticDefs[i], undefined, 'staticDefinitions');
            		}
				}
			}
            classFunction.baseTypes = baseClass.baseTypes || [];
            for (var i = 0; i < baseClasses.length; i++){
                classFunction.baseTypes.push(baseClasses[i].type);
            }
            //classFunction.baseTypes = (baseClass.baseTypes || []).concat(baseClasses.map(function (base) { return base.type; }));
            if (!classFunction.isAssignableTo) {
                Object.defineProperty(classFunction, "isAssignableTo", {
                    value: function (type) {
                        return this === type || this.baseTypes.indexOf(type) >= 0;
                    },
                    writable: false,
                    enumerable: false,
                    configurable: false
                });
            }
        }

        if (classDefinition) {
            this.buildStaticMembers(classFunction, classDefinition);

            if (classDefinition.constructor)
                classFunction.classConstructor = classDefinition.constructor;
        }

        if (instanceDefinition) {
            this.buildInstanceMembers(classFunction, instanceDefinition);
        }

        var mixins = [].concat(baseClasses);
        mixins.shift();
        if (Object.keys(mixins).length > 0)
            this.buildInstanceMixins(classFunction, mixins);

        classFunction.__class = true;

        classFunction.prototype.constructor = classFunction;

        Object.defineProperty(classFunction.prototype, "getType", {
            value: function () {
                return classFunction;
            },
            writable: false,
            enumerable: false,
            configurable: false
        });


        classFunction.extend = function (name, instanceDefinition, classDefinition) {
            return $data.Class.define(name, classFunction, null, instanceDefinition, classDefinition);
        };

        Object.defineProperty(classFunction, "getMemberDefinition", {
            value: function (name) {
                return classFunction.memberDefinitions.getMember(name);
            }
        });

    },

    addMethod: function (holder, name, method, propagation) {
        if (!propagation || (typeof intellisense !== 'undefined')) {
            holder[name] = method;
            } else {
                holder[name] = function () {
                    return method.apply(this[propagation], arguments);
                };
            }
    },

    addProperty: function (holder, name, propertyDescriptor, propagation) {
        
        //holder[name] = {};

        if (propagation)
        {
            propertyDescriptor.configurable = true;
            if (propertyDescriptor.get)
            {
                var origGet = propertyDescriptor.get;
                propertyDescriptor.get = function () {
                    if (!this[propagation])
                        Guard.raise(new Exception("not inicialized"));
                    return origGet.apply(this[propagation], arguments);
                };
            }
            if (propertyDescriptor.set) {
                var origSet = propertyDescriptor.set;
                propertyDescriptor.set = function () {
                    if (!this[propagation])
                        Guard.raise(new Exception("not inicialized"));
                    origSet.apply(this[propagation], arguments);
                };
            }
        }

        Object.defineProperty(holder, name, propertyDescriptor);
    },

    addField: function(holder, name, field) {
        Guard.raise("not implemented");
    },

    buildMethod: function (classFunction, memberDefinition, propagation) {
        ///<param name="classFunction" type="Function">The object that will receive member</param>
        ///<param name="memberDefinition" type="MemberDefinition">the newly added member</param>
        var holder = memberDefinition.classMember ? classFunction : classFunction.prototype;
        this.addMethod(holder, memberDefinition.name, memberDefinition.method, propagation);
    },

    buildProperty: function (classFunction, memberDefinition, propagation) {
        ///<param name="classFunction" type="Function">The object that will receive member</param>
        ///<param name="memberDefinition" type="MemberDefinition">the newly added member</param>
        var holder = memberDefinition.classMember ? classFunction : classFunction.prototype;
        var pd = memberDefinition.createPropertyDescriptor(classFunction);
        this.addProperty(holder, memberDefinition.name, pd, propagation);

        //if lazyload TODO
        if (!memberDefinition.classMember && classFunction.__setPropertyfunctions == true) {
            var pdGetMethod = memberDefinition.createGetMethod();
            this.addProperty(holder, 'get_' + memberDefinition.name, pdGetMethod, propagation);

            var pdSetMethod = memberDefinition.createSetMethod();
            this.addProperty(holder, 'set_' + memberDefinition.name, pdSetMethod, propagation);
        }
    },


    buildMember: function (classFunction, memberDefinition, propagation, memberCollectionName) {
        ///<param name="memberDefinition" type="MemberDefinition" />
        memberCollectionName = memberCollectionName || 'memberDefinitions';
        classFunction[memberCollectionName] = classFunction[memberCollectionName] || new MemberDefinitionCollection();

        classFunction[memberCollectionName].setMember(memberDefinition);

        switch (memberDefinition.kind) {
            case MemberTypes.method:
                this.buildMethod(classFunction, memberDefinition, propagation);
                break;
            case MemberTypes.navProperty:
            case MemberTypes.complexProperty:
            case MemberTypes.property:
                this.buildProperty(classFunction, memberDefinition, propagation);
                break;
            default: Guard.raise("Unknown member type: " + memberDefinition.kind + "," + memberDefinition.name);
        }
    },

    buildStaticMembers: function (classFunction, memberListDefinition) {
        ///<param name="classFunction" type="Object">The class constructor that will be extended</param>
        ///<param name="memberListDefinition" type="Object"></param>
        var t = this;
        for (var item in memberListDefinition)
        {
            if (memberListDefinition.hasOwnProperty(item)) {
                var memberDefinition = new MemberDefinition(memberListDefinition[item], classFunction);
                memberDefinition.name = item;
                memberDefinition.classMember = true;
                t.buildMember(classFunction, memberDefinition, undefined, 'staticDefinitions');
            }
        }
    },

    buildInstanceMembers: function (classFunction, memberListDefinition) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="memberListDefinition" type="Object"></param>
        ///pinning t outside of the closure seems actually faster then passing in the this  and referencing
        var t = this;
        for (var item in memberListDefinition) {
            if (memberListDefinition.hasOwnProperty(item)) {
                var memberDefinition = new MemberDefinition(memberListDefinition[item], classFunction);

                memberDefinition.name = item;
                t.buildMember(classFunction, memberDefinition);
            }
        }
    },

    copyMembers: function(sourceType, targetType) {
        ///<param name="sourceType" type="Function" />
        ///<param name="targetType" type="Function" />
        function il(msg) {
            if (typeof intellisense === 'undefined') {
                return;
            }
            intellisense.logMessage(msg);
        }

        Object.keys(sourceType.prototype).forEach(function (item, i, src) {
            if (item !== 'constructor' && item !== 'toString') {
                il("copying item:" + item);
                targetType.prototype[item] = sourceType[item];
            }
        });
    },

    buildInstanceMixins: function (classFunction, mixinList) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="mixinList" type="Array"></param>

        classFunction.mixins = classFunction.mixins || [];
        classFunction.propagations = classFunction.propagations || [];

        for(var i = 0; i < mixinList.length; i++) {
            var item = mixinList[i];
            //if (classFunction.memberDefinitions.getMember(item.type.name)) {
            if (item.propagateTo) {
                this.buildInstancePropagation(classFunction, item);
                classFunction.propagations.push(item);
                classFunction.propagations[item.type.name] = true;
            } else {
                this.buildInstanceMixin(classFunction, item);
                classFunction.mixins.push(item);
                classFunction.mixins[item.type.name] = true;
            }
        };
    },
    buildInstanceMixin: function (classFunction, typeObj) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="typeObj" type="Object"></param>

        var memberDefs = typeObj.type.memberDefinitions.asArray();
        for (var i = 0, l = memberDefs.length; i < l; i++) {
            var itemName = memberDefs[i].name;
            if (itemName !== 'constructor' && !classFunction.memberDefinitions.getMember(itemName)) {
                this.buildMember(classFunction, memberDefs[i]);
            }
            }
    },
    buildInstancePropagation: function (classFunction, typeObj) {
        ///<param name="classFunction" type="Function">The class constructor whose prototype will be extended</param>
        ///<param name="typeObj" type="Object"></param>

        var memberDefs = typeObj.type.memberDefinitions.asArray();
        for (var i = 0, l = memberDefs.length; i < l; i++) {
            var itemName = memberDefs[i].name;
            if (itemName !== 'constructor' && !classFunction.memberDefinitions.getMember(itemName)) {
                this.buildMember(classFunction, memberDefs[i], typeObj.propagateTo);
            }
            }
    }

};

    $data.Class = Class = new ClassEngineBase();


(function (global) {

    function ContainerCtor() {

        var classNames = {};
        var consolidatedClassNames = [];
        var classTypes = [];

        this.classNames = classNames;
        this.consolidatedClassNames = consolidatedClassNames;
        this.classTypes = classTypes;

        var mappedTo = [];
        this.mappedTo = mappedTo;

        var self = this;

        this["holder"] = null;

        var IoC = function (type, parameters) {
            var t = self.resolveType(type);
            var inst = Object.create(t.prototype);
            t.apply(inst, parameters);
            return inst;
        };

        this.mapType = function (aliasTypeOrName, realTypeOrName) {
            Guard.requireValue("aliasType", aliasTypeOrName);
            Guard.requireValue("realType", realTypeOrName);
            var aliasT = this.getType(aliasTypeOrName);
            var realT = this.getType(realTypeOrName);
            var aliasPos = classTypes.indexOf(aliasT);
            var realPos = classTypes.indexOf(realT);
            mappedTo[aliasPos] = realPos;
        },

        this.resolve = function (type, parameters) {
            var classFunction = this.resolveType(type, parameters);
            return new classFunction(parameters);
        };

        this.resolveName = function (type) {
            var t = this.resolveType(type);
            var tPos = classTypes.indexOf(t);
            return consolidatedClassNames[tPos];
        };

        this.isPrimitiveType = function(type) {
            var t = this.resolveType(type);
            return t === Number || t === String || t === Date || t === String || t === Boolean || t === Array || t === Object ||
                t === $data.Number || t === $data.String || t === $data.Date || t === $data.String || t === $data.Boolean || t === $data.Array || t === $data.Object;
        };

        this.resolveType = function (typeOrName) {
            var t = typeOrName;
            t = this.getType(t);
            var posT = classTypes.indexOf(t);
			return typeof mappedTo[posT] === 'undefined' ? t : classTypes[mappedTo[posT]];
        };

        this.getTypes = function () {
            var keys = Object.keys(classNames);
            var ret = [];
            for (var i = 0; i < keys.length; i++){
                var className = keys[i];
                ret.push({ name: className, type: classTypes[classNames[className]], toString: function () { return this.name; } });
            }
            return ret;
            
            /*return Object.keys(classNames).map(function (className, index) {
                return { name: className, type: classTypes[classNames[className]], toString: function () { return this.name; } };
            });*/
        };

        //this.getTypeName( in type);
        //this.resolveType()
        //this.inferTypeFromValue = function (value) {

        this.getTypeName = function (value) {
            switch (typeof value) {
                case 'object':
                    if (value == null) return '$data.Object';
                    if (value instanceof Array) return '$data.Array';
                    if (value.getType) return value.getType().fullName;
                    if (value instanceof Date) return '$data.Date';
                    //if(value instanceof "number") return
                default:
                    return typeof value;
            }
        };

        this.isTypeRegistered = function (typeOrName) {
            if (typeof typeOrName === 'function') {
                return classTypes.indexOf(typeOrName) > -1;
            } else {
                return typeOrName in classNames;
            }
        };

        this.unregisterType = function (type) {
            Guard.raise("Unimplemented");
        };

        this.getType = function (typeOrName) {
            Guard.requireValue("typeOrName", typeOrName);
            if (typeof typeOrName === 'function') {
                return typeOrName;
            };

            if (!(typeOrName in classNames)) {
                Guard.raise(new Exception("Unable to resolve type:" + typeOrName));
            };
            return classTypes[classNames[typeOrName]];
        };

        this.getName = function (typeOrName) {
            var t = this.getType(typeOrName);
            var tPos = classTypes.indexOf(t);
            if (tPos == -1)
                Guard.raise("unknown type to request name for: " + typeOrName);
            return consolidatedClassNames[tPos];
        };

		this.getDefault = function (typeOrName) {
			var t = this.resolveType(typeOrName);
			switch (t){
				case $data.Number: return 0.0;
				case $data.Integer: return 0;
				case $data.String: return '';
				case $data.Boolean: return false;
				default: return null;
			}
		};

        //name array ['', '', '']
        this.registerType = function(nameOrNamesArray, type, factoryFunc) {
            ///<signature>
            ///<summary>Registers a type and optionally a lifetimeManager with a name
            ///that can be used to later resolve the type or create new instances</summary>
            ///<param name="nameOrNamesArray" type="Array">The names of the type</param>
            ///<param name="type" type="Function">The type to register</param>
            ///<param name="instanceManager" type="Function"></param>
            ///</signature>
            ///<signature>
            ///<summary>Registers a new type that </summary>
            ///<param name="aliasType" type="Function">The name of the type</param>
            ///<param name="actualType" type="Function">The type to register</param>
            ///</signature>


            ///TODO remove
            /*if (typeof typeNameOrAlias === 'string') {
                if (classNames.indexOf(typeNameOrAlias) > -1) {
                    Guard.raise("Type already registered. Remove first");
                }
            }*/

            if (!nameOrNamesArray) {
                return;
            }

            //todo add ('number', 'number')
            if (typeof type === "string") {
                type = self.resolveType(type);
            }

            if (typeof nameOrNamesArray === 'string') {
                var tmp = [];
                tmp.push(nameOrNamesArray);
                nameOrNamesArray = tmp;
            }

            for (var i = 0; i < nameOrNamesArray.length; i++) {
                var parts = nameOrNamesArray[i].split('.');
                var item = {};
                item.shortName = parts[parts.length - 1];
                item.fullName = nameOrNamesArray[i];
                nameOrNamesArray[i] = item;
            }

            //if (type.


            var creatorFnc = function () { return IoC(type, arguments); };

            if (typeof intellisense !== 'undefined') {
                intellisense.annotate(creatorFnc, type);
            }

            for (var i = 0, l = nameOrNamesArray.length; i < l; i++) {
                var item = nameOrNamesArray[i];
                if (!(("create" + item.shortName) in self)) {
                    if (typeof factoryFunc === 'function') {
                        self["create" + item.shortName] = factoryFunc;
                    } else {
                        self["create" + item.shortName] = creatorFnc;
                    }
                } else {
                    if (console) { console.warn("warning: short names overlap:" + item.shortName + ", Container.create" + item.shortName + " has not been updated"); }
                };

                var typePos = classTypes.indexOf(type);
                if (typePos == -1) {
                    //new type
                    typePos = classTypes.push(type) - 1;
                    var fn = item.fullName;
                    consolidatedClassNames[typePos] = item.fullName;
                };

                if (item.fullName in classNames) {
                    console.warn("warning:!!! This typename has already been registered:" + item.fullName);
                };
                classNames[item.fullName] = typePos;
            }

			if (!type.name){
				type.name = nameOrNamesArray[0].shortName;
			}
        };
    }

    $data.Number = typeof Number !== 'undefined' ? Number : function JayNumber() { };
    $data.Integer = typeof Integer !== 'undefined' ? Integer : function JayInteger() {  };
    $data.Date = typeof Date !== 'undefined' ? Date : function JayDate() { };
    $data.String = typeof String !== 'undefined' ? String : function JayString() { };
    $data.Boolean = typeof Boolean !== 'undefined' ? Boolean : function JayBoolean() { };
    $data.Blob = /*typeof Blob !== 'undefined' ? Blob :*/ function JayBlob() { };
    $data.Array = typeof Array !== 'undefined' ? Array : function JayArray() { };
    $data.Object = typeof Object !== 'undefined' ? Object : function JayObject() { };
    $data.ObjectID = typeof ObjectID !== 'undefined' ? ObjectID : function JayObjectID(){};
    $data.Function = Function;

    var c;
    global["Container"] = $data.Container = c = global["C$"] = new ContainerCtor();
    c.registerType(["$data.Number", "number", "float", "real", "decimal", "JayNumber"], $data.Number);
    c.registerType(["$data.Integer", "int", "integer", "int16", "int32", "int64", "JayInteger"], $data.Integer);
    c.registerType(["$data.String", "string", "text", "character", "JayString"], $data.String);
    c.registerType(["$data.Array", "array", "Array", "[]", "JayArray"], $data.Array, function () {
        return $data.Array.apply(undefined, arguments);
    });
    c.registerType(["$data.Date", "datetime", "date", "JayDate"], $data.Date);
    c.registerType(["$data.Boolean", "bool", "boolean", "JayBoolean"], $data.Boolean);
    c.registerType(["$data.Blob", "blob", "JayBlob"], $data.Blob);
    c.registerType(["$data.Object", "Object", "object", "{}", "JayObject"], $data.Object);
    c.registerType(["$data.Function", "Function", "function"], $data.Function);
    c.registerType(['$data.ObjectID', 'ObjectID', 'objectId', 'objectid', 'ID', 'Id', 'id', 'JayObjectID'], $data.ObjectID);

})(window);

global["$C"] = function () { Class.define.apply(Class, arguments); };


$data.Class.ConstructorParameter = ConstructorParameter = $data.Class.define('ConstructorParameter', null, null, {
    constructor: function (paramIndex) {
        ///<param name="paramIndex" type="integer" />
        this.paramIndex = paramIndex;
    },
    paramIndex: {}
});
/*$data.Class.MixinParameter = MixinParameter = $data.Class.define('MixinParameter', null, null, {
    constructor: function (typeName) {
        ///<param name="paramIndex" type="integer">
        this.typeName = typeName;
    },
    typeName: {}
});*/

//var e = new Entity();


/*$data.Interface = Class.define("Interface", null, null, {
    constructor: function() { Guard.raise("Can not create an interface"); }
},
{
    define: function (name, definition) {
        var result = Class.define(name, $data.Interface, null, null, definition);
        delete result.__class;
        result.__interface = true;
        return result;
    }
});



$data.Observable = Observable = Class.define("Observable", null, null, {
    propertyChanged: { dataType: $data.Event }
}, { 
    createFromInstance: function(instance) {
        var propNames = instance.getClass().memberDefinitions.f
    }
});*/


})($data, window);

$data.defaultErrorCallback = function () {
    //console.log('DEFAULT ERROR CALLBACK:');
    /*if (console.dir)
        console.dir(arguments);
    else
        console.log(arguments);*/
    Guard.raise(new Exception("DEFAULT ERROR CALLBACK!", "DefaultError", arguments));
};
$data.defaultSuccessCallback = function () { console.log('DEFAULT SUCCES CALLBACK'); };
$data.defaultNotifyCallback = function () { console.log('DEFAULT NOTIFY CALLBACK'); };

$data.typeSystem = {
    __namespace: true,
    /*inherit: function (ctor, baseType) {
        var proto = new baseType();
        ctor.prototype = $.extend(proto, ctor.prototype);
        //console.dir(proto);
        ctor.prototype.base = new baseType();
        //console.dir(ctor.prototype.base);
        ctor.prototype.constructor = ctor;
        return ctor;
    },*/
    //mix: function (type, mixin) {
    //    type.prototype = $.extend(type.prototype || {}, mixin.prototype || {});
    //    type.mixins = type.mixins || [];
    //    type.mixins.push(mixin);
    //    return type;
    //},
    extend: function (target) {
        /// <summary>
        /// Extends an object with properties of additional parameters.
        /// </summary>
        /// <signature>
        /// <param name="target" type="Object">Object that will be extended.</param>
        /// <param name="object" type="Object">Object to extend target with.</param>
        /// <param name="objectN" optional="true" parameterArray="true" type="Object">Object to extend target with.</param>
        /// </signature>        
    	/// <returns></returns>
        if (typeof target !== 'object' && typeof target !== 'function')
            Guard.raise('Target must be object or function');

        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            if (obj === null || typeof obj === 'undefined')
                continue;
            for (key in obj) {
                target[key] = obj[key];
            }
        }        
        return target;
    },
    createCallbackSetting: function (callBack, defaultSetting) {
        var setting = {
            success: $data.defaultSuccessCallback,
            error: $data.defaultErrorCallback,
            notify: $data.defaultNotifyCallback
        };
        if (defaultSetting != undefined && defaultSetting != null) {
            setting = defaultSetting;
        }
        if (callBack == null || callBack == undefined) {
            return setting;
        }
        if (typeof callBack == 'function') {
            return this.extend(setting, { success: callBack });
        }
        return this.extend(setting, callBack);
    },
    createCtorParams: function(source, indexes, thisObj) {
        ///<param name="source" type="Array" />Paramerter array
        ///<param name="indexes" type="Array" />
        ///<param name="thisObj" type="Object" />
        if (indexes) {
            var paramArray = [];
            for (var i = 0, l = indexes.length; i < l; i++) {
                var item = i;
                if (indexes[item] instanceof ConstructorParameter)
                    paramArray.push(source[indexes[item].paramIndex]);
                else if (typeof indexes[item] === "function")
                    paramArray.push(indexes[item].apply(thisObj));
                else
                    paramArray.push(indexes[item]);
            }
            return paramArray;
        }
        return source;
    },
    writePropertyValues: function (obj)
    {
        if (obj && obj.getType && obj.getType().memberDefinitions)
        {
            this.writeProperties(obj, obj.getType().memberDefinitions.asArray().filter(
                function (md) { return (md.kind == "property" || md.kind == "navProperty" || md.kind == "complexProperty") && !md.prototypeProperty; }
                ));
        }
    },
    writeProperties: function (obj, members)
    {
        var defines = {};
        for (var i = 0, l = members.length; i < l; i++) {
            var memDef = members[i];
            defines[memDef.name] = memDef.createPropertyDescriptor(null, memDef.value);
        }

        Object.defineProperties(obj, defines);

    },
    writeProperty: function (obj, member, value)
    {
        var memDef = typeof member === 'string' ? obj.getType().memberDefinitions.getMember(member) : member;
        if (memDef) {
            var propDef = memDef.createPropertyDescriptor(null, value);
            //////OPTIMIZATION
            Object.defineProperty(obj, memDef.name, propDef);
        }
    }
};
$data.ASTNode = function() {
    ///<field name="arity" type="string">represents the kind of the AST node</field>
    ///<field name="edge" type="Boolean" />
    ///<field name="identifier" type="Boolean" />
    ///<field name="first" type="ASTNode">Contains the first part of the expression</field>
    ///<field name="id" type="String" />
    ///<field name="type" type="String" />
}

$data.FunctionASTNode = function() {
    ///<field name="value" type="string">The name of the function</field>
    ///<field name="first" type="Array" elementType="ASTNode">Contains the function parameters</field>
    ///<field name="block" type="ASTNode">The function body</field>
}
$data.FunctionASTNode.prototype = new $data.ASTNode();

$data.ParameterASTNode = function() {
    ///<field name="value" type="string">The name of the parameter</field>
    ///<field name="type" type="string" />
    ///<field name="func" type="" />
}
$data.MemberAccessASTNode = function() {
    ///<field name="value" type="string">The name of the parameter</field>
    ///<field name="type" type="string" />
    ///<field name="first" type="ASTNode" />
    ///<field name="second" type="ParameterASTNode" />
}
$data.MemberAccessASTNode.prototype = new $data.ASTNode();

$data.ConstantASTNode = function() {
    ///<field name="type" type="string">The datatype of the constant value</field>
    ///<field name="value" type="Object">The constant value</field>
}


$data.ASTParserResult = function(result, tree, errors) {
    ///<field name="success" type="boolean"></field>
    this.success = (tree != '');
    this.result = result;
    this.tree = tree;
    this.errors = errors;
}

$data.ASTParser = function() {
}

$data.ASTParser.parseCode = function (code) {
    var codeStr;

    if (!code || (codeStr = code.toString()) === '') {
        return new $data.ASTParserResult(false, null, null);
    }

    if (typeof JAYLINT === 'undefined') {
        Guard.raise(new Exception('JAYLINT is required', 'Not Found!'));
    }

    var jsLint = JAYLINT(codeStr);
    var result = new $data.ASTParserResult(jsLint, JAYLINT.tree, JAYLINT.errors);
    
    return result;
};
//TODO: Finish refactoring ExpressionNode.js

$data.Class.define("$data.Expressions.ExpressionType", null, null, {}, {
    Constant: "constant", // { type:LITERAL, executable:true, valueType:, value: }
    Variable: "variable", // { type:VARIABLE, executable:true, name: }
    MemberAccess: "memberAccess",    // { type:MEMBERACCESS, executable:true, expression:, member: }
    Call: "call",

/* binary operators */
    Equal: "equal",
    NotEqual: "notEqual",
    EqualTyped: "equalTyped",
    NotEqualTyped: "notEqualTyped",
    GreaterThen: "greaterThan",
    LessThen: "lessThan",
    GreaterThenOrEqual: "greaterThanOrEqual",
    LessThenOrEqual: "lessThenOrEqual", 
    Or: "or",
    OrBitwise: "orBitwise",
    And: "and",
    AndBitwise: "andBitwise",


    In: "in",

    Add: "add",
    Divide: "divide",
    Multiply: "multiply",
    Subtract: "subtract",
    Modulo: "modulo",
    ArrayIndex: "arrayIndex",

/* unary operators */
    New: "new",
    Positive: "positive",
    Negative: "negative",
    Increment: "increment",
    Decrement: "decrement",
    Not: "not",


    This: "this",
    LambdaParameterReference: "lambdaParameterReference",
    LambdaParameter: "lambdaParameter",
    Parameter: "parameter",

    ArrayLiteral: "arrayLiteral",
    ObjectLiteral: "objectLiteral",
    ObjectField: "objectField",
    Function: "Function",
    Unknown: "UNKNOWN",

    EntitySet: "EntitySet",
    ServiceOperation: "ServiceOperation",
    EntityField: "EntityField",
    EntityContext: "EntityContext",
    Entity: "Entity",
    Filter: "Filter",
    First: "First",
    Count: "Count",
    Single: "Single",
    Some: "Some",
    Every: "Every",
    ToArray: "ToArray",
    ForEach: "ForEach",
    Projection: "Projection",
    EntityMember: "EntityMember",
    EntityFieldOperation: "EntityFieldOperation",
    FrameOperation: "FrameOperation",
    EntityBinary: "EntityBinary",
    Code: "Code",
    ParametricQuery: "ParametricQuery",
    MemberInfo: "MemberInfo",
    QueryParameter: "QueryParameter",
    ComplexEntityField: "ComplexEntityField",
    
    Take: "Take",
    Skip: "Skip",
    OrderBy: "OrderBy",
    OrderByDescending: "OrderByDescending",
    Include: "Include",
    Count: "Count"
});

$data.BinaryOperator = function() {
    ///<field name="operator" type="string" />
    ///<field name="expressionType" type="$data.ExpressionType" />
    ///<field name="type" type="string" />
}

$data.binaryOperators = [
    { operator: "==", expressionType: $data.Expressions.ExpressionType.Equal, type: "boolean", implementation: function (a, b) { return a == b; } },
    { operator: "===", expressionType: $data.Expressions.ExpressionType.EqualTyped, type: "boolean", implementation: function (a, b) { return a === b; } },
    { operator: "!=", expressionType: $data.Expressions.ExpressionType.NotEqual, type: "boolean", implementation: function (a, b) { return a != b; } },
    { operator: "!==", expressionType: $data.Expressions.ExpressionType.NotEqualTyped, type: "boolean", implementation: function (a, b) { return a !== b; } },
    { operator: ">", expressionType: $data.Expressions.ExpressionType.GreaterThen, type: "boolean", implementation: function (a, b) { return a > b; } },
    { operator: ">=", expressionType: $data.Expressions.ExpressionType.GreaterThenOrEqual, type: "boolean", implementation: function (a, b) { return a >= b; } },
    { operator: "<=", expressionType: $data.Expressions.ExpressionType.LessThenOrEqual, type: "boolean", implementation: function (a, b) { return a <= b; } },
    { operator: "<", expressionType: $data.Expressions.ExpressionType.LessThen, type: "boolean", implementation: function (a, b) { return a < b; } },
    { operator: "&&", expressionType: $data.Expressions.ExpressionType.And, type: "boolean", implementation: function (a, b) { return a && b; } },
    { operator: "||", expressionType: $data.Expressions.ExpressionType.Or, type: "boolean", implementation: function (a, b) { return a || b; } },
    { operator: "&", expressionType: $data.Expressions.ExpressionType.AndBitwise, type: "number", implementation: function (a, b) { return a & b; } },
    { operator: "|", expressionType: $data.Expressions.ExpressionType.OrBitwise, type: "number", implementation: function (a, b) { return a | b; } },
    { operator: "+", expressionType: $data.Expressions.ExpressionType.Add, type: "number", implementation: function (a, b) { return a + b; } },
    { operator: "-", expressionType: $data.Expressions.ExpressionType.Subtract, type: "number", implementation: function (a, b) { return a - b; } },
    { operator: "/", expressionType: $data.Expressions.ExpressionType.Divide, type: "number", implementation: function (a, b) { return a / b; } },
    { operator: "%", expressionType: $data.Expressions.ExpressionType.Modulo, type: "number", implementation: function (a, b) { return a % b; } },
    { operator: "*", expressionType: $data.Expressions.ExpressionType.Multiply, type: "number", implementation: function (a, b) { return a * b; } },
    { operator: "[", expressionType: $data.Expressions.ExpressionType.ArrayIndex, type: "number", implementation: function (a, b) { return a[b]; } },
    { operator: "in", expressionType: $data.Expressions.ExpressionType.In, type: 'boolean', implementation: function (a, b) { return a in b; } }
];


$data.binaryOperators.resolve = function (operator) {
    var result = $data.binaryOperators.filter(function (item) { return item.operator == operator; });
    if (result.length > 0)
        return operator;
    //Guard.raise("Unknown operator: " + operator);
};

$data.binaryOperators.contains = function (operator) {
    return $data.binaryOperators.some(function (item) { return item.operator == operator; });
};

$data.binaryOperators.getOperator = function (operator) {
    ///<returns type="BinaryOperator" />
    var result = $data.binaryOperators.filter(function (item) { return item.operator == operator; });
    if (result.length < 1)
        Guard.raise("Unknown operator: " + operator);
    return result[0];
};


$data.unaryOperators = [
    { operator: "+", arity:"prefix", expressionType : $data.Expressions.ExpressionType.Positive, type: "number", implementation: function(operand) { return +operand; } },
    { operator: "-", arity:"prefix", expressionType : $data.Expressions.ExpressionType.Negative, type: "number", implementation: function(operand) { return -operand; } },
    { operator: "++", arity:"prefix", expressionType : $data.Expressions.ExpressionType.Increment, type: "number", implementation: function(operand) { return ++operand; } },
    { operator: "--", arity:"prefix", expressionType: $data.Expressions.ExpressionType.Decrement, type: "number", implementation: function (operand) { return --operand; } },
    { operator: "++", arity: "suffix", expressionType: $data.Expressions.ExpressionType.Increment, type: "number", implementation: function (operand) { return operand++; } },
    { operator: "!", arity: "prefix", expressionType: $data.Expressions.ExpressionType.Not, type: "boolean", implementation: function (operand) { return !operand; } },
    { operator: "--", arity:"suffix", expressionType: $data.Expressions.ExpressionType.Decrement, type: "number", implementation: function (operand) { return operand--; } }
    
    //{ operator: "new", expressionType : $data.Expressions.ExpressionType.New, type: "object", implementation: function(operand) { return new operand; }
];

$data.unaryOperators.resolve = function (operator) {
    var result = $data.unaryOperators.filter(function (item) { return item.operator == operator ; });
    if (result.length > 0)
        return operator;
    //Guard.raise("Unknown operator: " + operator);
};

$data.unaryOperators.contains = function (operator) {
    return $data.unaryOperators.some(function (item) { return item.operator == operator; });
};

$data.unaryOperators.getOperator = function (operator, arity) {
    ///<returns type="BinaryOperator" />
    var result = $data.unaryOperators.filter(function (item) { return item.operator == operator && (!arity || item.arity == arity); });
    if (result.length < 1)
        Guard.raise("Unknown operator: " + operator);
    return result[0];
};


$data.timeIt = function(fn, iterations) {
    iterations = iterations || 1;

    console.time("!");
    for (var i = 0; i < iterations; i++) {
        fn();
    }
    console.timeEnd("!");
}

$data.Expressions.OperatorTypes = {
    UNARY: "UNARY",                  // { type:UNARY, executable:true, operator:, operand: }
    INCDEC: "INCDEC",                // { type:INCDEC, executable:true, operator:, operand:, suffix: }
    DECISION: "DECISION",            // { type:DECISION, executable:true, expression:, left:, right: }
    METHODCALL: "METHODCALL",        // { type:METHODCALL, executable:true, object:, method:, args: }
    NEW: "NEW",                      // { type:NEW, executable:true, values: [] };
    JSONASSIGN: "JSONASSIGN",        // { type:JSONASSIGN, executable:true, left:, right: }
    ARRAYACCESS: "ARRAYACCESS",      // { type:ARRAYACCESS, executable:true, array:, index: }
    UNKNOWN: "UNKNOWN"
};

$data.executable = true;

function jsonify(obj) { return JSON.stringify(obj, null, "\t"); }

$C('$data.Expressions.ExpressionNode', $data.Entity, null, {
    constructor: function () {
        ///<summary>Provides a base class for all Expressions.</summary>
        ///<field name="nodeType" type="string">Represents the expression type of the node&#10;
        ///For the list of expression node types refer to $data.Expressions.ExpressionType
        ///</field>
        ///<field name="type" type="Function">The result type of the expression</field>
        ///<field name="executable" type="boolean">True if the expression can be evaluated to yield a result</field>
        ///this.nodeType = $data.Expressions.ExpressionType.Unknown;
        ///this.type = type;
        ///this.nodeType = $data.Expressions.ExpressionType.Unknown;
        ///this.executable = (executable === undefined || executable === null) ? true : executable;
        ///TODO
        this.expressionType = this.constructor;
    },

    getJSON: function () { return jsonify(this); },

    //TOBLOG maybe
    expressionType: {
        value: undefined,
        ////OPTIMIZE
        set: function (value) {
            var _expressionType;
            Object.defineProperty(this, "expressionType", {
                set: function (value) {
                    if (typeof value === 'string') {
                        value = Container.resolveType(value);
                    }
                    _expressionType = value;
                },
                get: function (value) {
                    //IE ommits listing JSON.stringify in call chain

                        if (arguments.callee.caller == jsonify || arguments.callee.caller == JSON.stringify) {
                        return Container.resolveName(_expressionType);
                    }
                    return _expressionType;
                },
                enumerable: true
            });

            this.expressionType = value;
        },
        get: function () { return undefined; },
        enumerable: true
    },

    ///toString: function () { },
    nodeType: { value: $data.Expressions.ExpressionType.Unknown, writable: false },

    type: {},

    isTerminated: { value: false },

    toString: function () {
        return this.value;
    }
}, null);


$C('$data.Expressions.UnaryExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (operand, operator, nodeType, resolution) {
    	/// <summary>
    	/// Represents an operation with only one operand and an operator
    	/// </summary>
    	/// <param name="operand"></param>
    	/// <param name="operator"></param>
    	/// <param name="nodeType"></param>
    	/// <param name="resolution"></param>
        this.operand = operand;
        this.operator = operator;
        this.nodeType = nodeType;
        this.resolution = resolution;
    },

    operator: { value: undefined, writable: true },
    operand: { value: undefined, writable: true },
    nodeType: { value: undefined, writable: true }
});
$C('$data.Expressions.ArrayLiteralExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (items) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        ///<field name="items" type="Array" elementType="$data.Expression.ExpressionNode" />
        this.items = items || [];
    },
    nodeType: { value: $data.Expressions.ExpressionType.ArrayLiteral, writable: true },

    items: { value: undefined, dataType: Array, elementType: $data.Expressions.ExpressionNode },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        ///<var nam
        var result = "[" + this.items.map(function (item) { return item.toString(); }).join(",") + "]";
        return result;
    }
}, null);

$C('$data.Expressions.CallExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (expression, member, args) {
        ///<summary>Represents a call to an object or global method</summary>
        ///<field name="object" type="$data.Expressions.ExpressionNode">The expression for object that has the method</field>
        ///<field name="member" type="$data.MemberDefinition">The member descriptor</field>
        this.expression = expression;
        this.member = member;
        this.args = args;
    },

    nodeType: {
        value: $data.Expressions.ExpressionType.Call
    },

    expression: {
        value: undefined,
        dataType: $data.Expressions.ExpressionNode,
        writable: true
    },

    member: {
        value: undefined,
        dataType: $data.MemberDefinition,
        writable: true
    },

    type: {
        value: undefined,
        writable: true
    },

    implementation: {
        get: function () {
            return function(thisObj, method, args) {
                if (typeof method !== 'function') {
                    method = thisObj[method];
                }
                Guard.requireType("method", method, Function);
                return method.apply(thisObj, args);
            };
        },
        set: function (value) { Guard.raise("Property can not be set"); }
    },

    toString: function (debug) {
        return this.object.toString() + "." + this.member.toString() + "(" + ")";
    }

});
$C('$data.Expressions.CodeParser', null, null, {

    constructor: function (scopeContext) {
        ///<signature>
        ///<param name="scopeContext" type="$data.Expressions.EntityContext" />
        ///</signature>
        ///<signature>
        ///</signature>
        this.scopeContext = scopeContext;
        this.lambdaParams = [];
    },

    log: function(logInfo) {
        if (this.scopeContext)
            this.scopeContext.log(logInfo);
    },

    parseExpression: function (code, resolver) {
        ///<signature>
        ///<summary>Parses the provided code and returns a parser result with parser information</summary>
        ///<param name="code" type="string">The JavaScript code to parse &#10;ex: "function (a,b,c) { return a + b /c }"</param>
        ///<param name="resolver" type="string">The ParameterResolver class that resolves vaiable and parameteres references</param>
        ///<returns type="$data.Expressions.ExpressionParserResult" />
        ///</signature>
        if (typeof code === 'object') { code = ''; }
        var result = {
            success: true,
            errorMessage: '',
            errorDetails: ''
        };
        ///<var name="AST" type="Date" />
        var AST = $data.ASTParser.parseCode(code);
        this.log({ event: "AST", data: AST });
        if (!AST.success) {
            return {
                success: false,
                error: "ASTParser error",
                errorMessage: (AST.errors) ? JSON.stringify(AST.errors) : "could not get code"
            };
        }
        var b = this.Build2(AST.tree.first[0]);
        result = { success: true, expression: b, errors: AST.errors };
        return result;
    },

    createExpression: function (code, resolver) {
        ///<signature>
        ///<summary>Parses the provided code and returns a JavaScript code expression tree</summary>
        ///<param name="code" type="string">The JavaScript code to parse &#10;ex: "a + b /c"</param>
        ///<param name="resolver" type="string">The ParameterResolver class that resolves vaiable and parameteres references</param>
        ///<returns type="$data.Expressions.ExpressionParserResult" />
        ///</signature>
        ///<signature>
        ///<summary>Parses the provided code and returns a JavaScript code expression tree</summary>
        ///<param name="code" type="Function">The JavaScript function to parse &#10;ex: "function (a,b,c) { return a + b /c }"</param>
        ///<param name="resolver" type="string">The ParameterResolver class that resolves vaiable and parameteres references</param>
        ///<returns type="$data.Expressions.ExpressionParserResult" />
        ///</signature>

        var result = this.parseExpression(code, resolver);
        if (!result.success) {
            Guard.raise("ExpressionParserError: " + result.errorMessage);
        }
        return result.expression;
    },

    Build2: function (node) {
        ///<param name="node" type="Lint" />
        ///<returns type="$data.Expressions.ExpressionNode" />
        var n;
        switch (node.arity) {
            case "number":
            case "string":
                n = this.BuildConstant(node);
                break;
            case "prefix":
                switch (node.value) {
                    case "{": 
                        n = this.BuildObjectLiteral(node);
                        break;
                    case "[":
                        n = this.BuildArrayLiteral(node);
                        break;
                    case $data.unaryOperators.resolve(node.value):
                        n = this.BuildUnary(node);
                        break;
                    //TODO: default case
                }
                break;
            case "suffix":
                switch (node.value) {
                    case $data.unaryOperators.resolve(node.value):
                        n = this.BuildUnary(node);
                        break;
                    default:
                        Guard.raise("Unknown suffix: " + node.value);
                }
                break;
            case "infix":
                switch (node.value) {
                    case "[":
                        n = this.BuildArray(node);
                        break;
                    case $data.binaryOperators.resolve(node.value):
                        n = this.BuildSimpleBinary(node);
                        break;
                    case "function":
                        Guard.raise("Unexpected function arity");
                    case "(":
                        n = this.BuildCall(node);
                        break;
                    case ".":
                        n = this.BuildProperty(node);
                        break;
                    default:
                        debugger;
                        //TODO: remove debugger, throw exception or break
                }
                break;
            case "statement":
                switch (node.value) {
                    case "function":
                        n = this.BuildFunction(node);
                        //TODO: consider adding break
                }
                break;
            default:
                switch (node.value) {
                    case "function":
                        n = this.BuildFunction(node);
                        break;
                    case "true":
                    case "false":
                    case "null":
                        n = this.BuildConstant(node);
                        break;
                    case "this":
                        n = this.BuildThis(node);
                        break;
                    default:
                        n = this.BuildParameter(node);
                        break;
                }
        }
        return n;
    },

    BuildThis: function (node) {
        var result = Container.createThisExpression();
        return result;
    },

    BuildConstant: function (node) {
        ///<param name="node" type="ConstantASTNode" />
        var value = node.value;
        var type = node.type;
        if (node.reserved === true) {
            switch (node.value) {
                case "true": value = true; type = typeof true; break;
                case "false": value = false; type = typeof false; break;
                case "null": value = null; type = typeof null; break;
                //TODO: missing default case
            }
        }
        var result = new $data.Expressions.ConstantExpression(value, type);
        return result;
    },

    BuildFunctionParameter: function (node) {

    },
    
    BuildArray: function (node) {
        switch (node.second.type) {
            case "string":
                return this.BuildProperty(node);
            case "number":
            default:
                return this.BuildSimpleBinary(node);
        }
    },

    BuildParameter: function (node) {
        ///<param name="node" type="ParameterASTNode" />
        ///<returns type="$data.Expressions.ParameterExpression" />
        var paramName = node.value;
        //TODO
        //var paramType = this.resolver.resolveParameterType(node);
        var nodeType = node.funct ? $data.Expressions.ExpressionType.LambdaParameter :
                                    this.lambdaParams.indexOf(node.value) > -1 ?
                                                $data.Expressions.ExpressionType.LambdaParameterReference : $data.Expressions.ExpressionType.Parameter;
        var result = new $data.Expressions.ParameterExpression(node.value, null, nodeType);

        if (nodeType == $data.Expressions.ExpressionType.LambdaParameterReference) {
            result.paramIndex = this.lambdaParams.indexOf(node.value);
        }

        return result;
    },

    BuildArrayLiteral: function(node) {
        var self = this;
        var items = node.first.map(function (item) { return self.Build2(item); });
        var result = new $data.Expressions.ArrayLiteralExpression(items);
        return result;
    },

    BuildObjectLiteral: function (node) {
        var self = this;
        var fields = node.first.map(function (item) {
            var eItem = self.Build2(item.first);
            var result = new $data.Expressions.ObjectFieldExpression(item.value, eItem);
            return result;
        });
        var result = new $data.Expressions.ObjectLiteralExpression(fields);
        return result;
    },

    BuildFunction: function (node) {
        ///<param name="node" type="FunctionASTNode"/>
        ///<returns type="$data.Expressions.FunctionExpression" />
        var self = this;
        var paramStack = [];
        var params = node.first && node.first.map(function (paramNode) {
            //paramStack.push(paramNode.value);
            this.lambdaParams.push(paramNode.value);
            return self.BuildParameter(paramNode);
        }, this);
        params = params || [];

        //skipping return for convenience
        //Possible we should raise an error as predicates and selectors can
        //not be code blocks just expressions

        var hasReturn = node.block.length == 0 ? false :
            node.block[0].value === "return" ? true : false;
        var body = (node.block.length > 0) ? this.Build2(hasReturn ? node.block[0].first : node.block[0]) : null;

        paramStack.forEach(function () { this.lambdaParams.pop(); }, this);

        var result = new $data.Expressions.FunctionExpression(node.value, params, body);
        params.forEach(function (param) {
            Object.defineProperty(param, "owningFunction", { value: result, enumerable: false });
        });

        //TODO place on prototyope
        result.name = node.name;
        return result;
    },

    BuildCall: function (node) {
        var self = this;
        var method = self.Build2(node.first);
        var args = node.second.map(function (exp) { return self.Build2(exp); });
        var member;
        var expression;
        switch(true){
            case method instanceof $data.Expressions.PropertyExpression:
                expression = method.expression;
                member = method.member;
                break;
            case method instanceof $data.Expressions.ParameterExpression:
                expression = Container.createConstantExpression(null, typeof null);  
                member = method;
                break;
            //TODO: missing default case
        }

        var result = Container.createCallExpression(expression, member, args);
        return result;
    },

    BuildProperty: function (node) {
        ///<summary>Builds a PropertyExpression from the AST node</summary>
        ///<param name="node" type="MemberAccessASTNode" />
        ///<returns type="$data.Expressions.PropertyExpression" />
        var expression = this.Build2(node.first);
        //TODO
        //var type = expression.type;
        //var member = type.getMemberDefinition()
        //TODO how to not if?????
        var member;
        if (node.second.identifier) {
            member = new $data.Expressions.ConstantExpression(node.second.value, "string");
        } else {
            member = this.Build2(node.second);
        }
        var result = new $data.Expressions.PropertyExpression(expression, member);
        return result;
    },


    BuildUnary: function(node) {
        var operator = $data.unaryOperators.getOperator(node.value, node.arity);
        var nodeType = operator.expressionType;
        var operand = this.Build2(node.first);
        var result = new $data.Expressions.UnaryExpression(operand, operator, nodeType);
        return result;
    },

    BuildSimpleBinary: function (node) {
        ///<param name="node" type="LintInflixNode" />

        var operator = $data.binaryOperators.getOperator(node.value);
        var nodeType = operator.expressionType;

        var left = this.Build2(node.first || node.left);
        var right = this.Build2(node.second || node.right);
        var result = new $data.Expressions.SimpleBinaryExpression(left, right, nodeType, node.value, operator.type);
        return result;
    }   

    //Build: function (node, expNode) {
    //    var n;
    //    switch (node.arity) {
    //        case "ternary":
    //            if (node.value == "?")
    //                n = this.BuildDecision(node, expNode);
    //            else
    //                Guard.raise("Value of ternary node isn't implemented: " + node.value);
    //            break;
    //        case null:
    //        default:
    //            Guard.raise("Arity isn't implemented: " + node.arity);
    //    }
    //    return n;
    //},

});

$C('$data.Expressions.ConstantExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (value, type, name) {
        this.value = value;
        //TODO
        this.type = Container.getTypeName(value);
        this.name = name;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Constant, enumerable: true },
    type: { value: Object, writable: true },
    value: { value: undefined, writable: true },
    toString: function (debug) {
        //return "[constant: " + this.value.toString() + "]";
        return this.value.toString();
    }
});


$C('$data.Expressions.FunctionExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (name, parameters, body) {
        ///<signature>
        ///<summary>Represents a function declaration.</summary>
        ///<param name="name" type="String">Function name</param>
        ///<param name="parameters" type="Array" elementType="$data.Expressions.ParameterExpression">The list of function parameters</param>
        ///<param name="body" type="$data.Expressions.ExpressionNode" />
        ///</signature>
        ///<field name="parameters" type="Array" elementType="$data.Expressions.ParameterExpression">The list of function parameters</field>
        ///<field name="body" type="$data.Expressions.ExpressionNode">The function body</field>

        this.parameters = parameters || [];
        this.name = name;
        this.body = body;
    },

    toString: function (debug) {
        var paramStrings = this.parameters.map(function (p) {
            return p.toString();
        });
        paramStrings = paramStrings.join(",");
        var bodyString = (this.body ? this.body.toString(debug) : '');
        return "function " + this.name + "(" + paramStrings + ") { " + bodyString + "}";
    },
    nodeType: { value: $data.Expressions.ExpressionType.Function, writable: true },
    parameters: { value: undefined, dataType: Array, elementType: $data.Expressions.ParameterExpression },
    body: { value: undefined, dataType: $data.Expressions.ExpressionNode },
    type: {}
}, null);
$C('$data.Expressions.ObjectFieldExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (fieldName, expression) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        this.fieldName = fieldName;
        this.expression = expression;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ObjectField, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);

$C('$data.Expressions.ObjectLiteralExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (members) {
        ///<summary>Represent an object initializer literal expression &#10;Ex: { prop: value}</summary>
        ///<param name="member" type="Array" elementType="$data.Expressions.ObjectFieldExpression" />
        this.members = members;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ObjectLiteral, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    },

    implementation: {
        get: function () {
            return function(namesAndValues) {
                var result = { };
                namesAndValues.forEach(function(item) {
                    result[item.name] = item.value;
                });
                return result;
            };
        },
        set: function () {
        }
    }

}, null);
$C('$data.Expressions.PagingExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, expression, nType) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        this.source = source;
        this.amount = expression;
        this.nodeType = nType;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Unknown, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);
$C('$data.Expressions.ParameterExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (name, type, nodeType) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        //this.writePropertyValue("name", name);
        //this.writePropertyValue("type", type);
        this.nodeType = nodeType || $data.Expressions.ExpressionType.Parameter;
        this.name = name;
        this.type = type || "unknown";
        var _owningFunction;
    },

    owningFunction: { value: undefined, enumerable: false },
    nodeType: { value: $data.Expressions.ExpressionType.Parameter, writable: true },
    name: { value: undefined, dataType: String, writable: true },
    type: { value: undefined, dataType: "object", writable: true},
    toString: function (debug) {
        var result;
        result = debug ? this.type + " " : "";
        result = result + this.name;
        return result;
    }
}, null);
$C('$data.Expressions.PropertyExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (expression, member) {
        ///<summary>Represents accessing a property or field of an object</summary>
        ///<param name="expression" type="$data.Expressions.ExpressionNode">The expression for the property owner object</param>
        ///<param name="member" type="$data.Expressions.ConstantExpression">The member descriptor</param>
        ///<field name="expression" type="$data.Expressions.ExpressionNode">The expression for the property owner object</field>
        ///<field name="member" type="$data.Expression.ConstantExpression">The member descriptor</field>
        Object.defineProperty(this, "expression", { value: expression, enumerable: true });
        Object.defineProperty(this, "member", { value: member, enumerable: true });
        this.type = member.dataType;
    },

    nodeType: {
        value: $data.Expressions.ExpressionType.MemberAccess
    },

    expression: {
        value: undefined,
        dataType: $data.Expressions.ExpressionNode,
        writable: true
    },

    implementation: {
        get: function () {
            return function (holder, memberName) {
                if (holder[memberName] === undefined)
                    Guard.raise(new Exception("Parameter '" + memberName + "' not found in context", 'Property not found!'));
                return holder[memberName];
            };
        },
        set: function () {
        }
    },

    member: {
        value: undefined,
        dataType: $data.MemberDefinition,
        writable: true
    },

    type: {
        value: undefined,
        writable: true
    },

    toString: function (debug) {
        return this.expression.toString() + "." + this.member.toString();
    }

});

$C('$data.Expressions.SimpleBinaryExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (left, right, nodeType, operator, type, resolution) {
        ///<summary>Represents a bin operation with left and right operands and an operator///</summary>
        ///<param name="left" type="$data.Expression.ExpressionNode">The left element of the binary operation</param>
        ///<param name="right" type="$data.Expression.ExpressionNode">The right element of the binary operation</param>
        ///<field name="implementation" type="function" />
        this.left = left;
        this.right = right;
        this.nodeType = nodeType;
        this.operator = operator;
        this.type = type;
        this.resolution = resolution;
    },

    implementation: {
        get: function () {
            return $data.binaryOperators.getOperator(this.operator).implementation;
        },
        set: function () { }

    },
    //nodeType: { value: $data.Expressions.ExpressionType },
    type: { value: "number", writable: true }
});
$C('$data.Expressions.ThisExpression', $data.Expressions.ExpressionNode, null, {
    nodeType: { value: $data.Expressions.ExpressionType.This }
});
$C('$data.Expressions.ExpressionVisitor', null, null,
    {
        constructor: function () {
            this._deep = 0;
        },

        Visit: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNode"/>
            
            //this._deep = this._deep + 1;
            if (!eNode) {
                return eNode;
            }

            var result = null;
            
                switch (eNode.expressionType) {
                    case $data.Expressions.ParameterExpression:
                        result = this.VisitParameter(eNode, context);
                        break;
                    case $data.Expressions.ConstantExpression:
                        result = this.VisitConstant(eNode, context);
                        break;
                    case $data.Expressions.FunctionExpression:
                        result = this.VisitFunction(eNode, context);
                        break;
                    case $data.Expressions.CallExpression:
                        result = this.VisitCall(eNode, context);
                        break;
                    case $data.Expressions.SimpleBinaryExpression:
                        result = this.VisitBinary(eNode, context);
                        break;
                    case $data.Expressions.PropertyExpression:
                        result = this.VisitProperty(eNode, context);
                        break;
                        //result = th
                    case $data.Expressions.ThisExpression:
                        result = this.VisitThis(eNode, context);
                        break;
                    case $data.Expressions.ObjectLiteralExpression:
                        result = this.VisitObjectLiteral(eNode, context);
                        break;
                    case $data.Expressions.ObjectFieldExpression:
                        result = this.VisitObjectField(eNode, context);
                        break;
                    case $data.Expressions.ArrayLiteralExpression:
                        result = this.VisitArrayLiteral(eNode, context);
                        break;
                    case $data.Expressions.UnaryExpression:
                        result = this.VisitUnary(eNode, context);
                        break;
                    default:
                        debugger;
                        break;
                    //case VARIABLE:

                    //    result = this.VisitVariable(eNode, context);
                    //    break;
                    //case MEMBERACCESS:
                    //    result = this.VisitMember(eNode, context);
                    //    break;
                    //case BINARY:
                    //    result = this.VisitBinary(eNode, context);
                    //    break;
                    //case UNARY:
                    //    result = this.VisitUnary(eNode, context);
                    //    break;
                    //case INCDEC:
                    //    result = this.VisitIncDec(eNode, context);
                    //    break;
                    //case EQUALITY: result = this.VisitEquality(eNode, context); break;
                    //case DECISION: result = this.VisitDecision(eNode, context); break;
                    //case METHODCALL: result = this.VisitMethodCall(eNode, context); break;
                    //case NEW: result = this.VisitNew(eNode, context); break;
                    //case JSONASSIGN: result = this.VisitJsonAssign(eNode, context); break;
                    //case ARRAYACCESS: result = this.VisitArrayAccess(eNode, context); break;
                    //default:
                    //    Guard.raise("Type isn't implemented: " + eNode.type);
                }
            
            this._deep = this._deep - 1;
            return result;
        },

        VisitArrayLiteral: function(eNode, context) {
            ///<param name="eNode" type="$data.Expressions.ArrayLiteralExpression" />
            var self = this;
            var items = eNode.items.map(function (item) {
                return self.Visit(item, context);
            });
            var result = Container.createArrayLiteralExpression(items);
            return result;
        },

        VisitObjectLiteral: function(eNode, context) {
            ///<param name="eNode" type="$data.Expressions.ObjectLiteralExpression" />
            var self = this;
            var members = eNode.members.map(function (member) {
                return self.Visit(member, context);
            });
            var result = Container.createObjectLiteralExpression(members);
            return result;
        },

        VisitObjectField: function(eNode, context) {
            ///<param name="eNode" type="$data.Expressions.ObjectLiteralExpression" />
            var expression = this.Visit(eNode.expression, context);
            var result = Container.createObjectFieldExpression(eNode.fieldName, expression);
            return result;
        },

        VisitThis: function (eNode, context) {
            return eNode;
        },
        VisitCall: function (eNode, context) {
            ///<param name="eNode" type="$data.Expressions.CallExpression" />
            var self = this;
            var args = eNode.args.map(function (arg) { return this.Visit(arg, context); }, this);
            var expression = this.Visit(eNode.expression, context);
            var member = this.Visit(eNode.member, context);
            return new $data.Expressions.CallExpression(expression, member, args);
        },

        VisitParameter: function(eNode, context) {
            ///<param name="eNode" type="$data.Expressions.ParameterExpression" />
            ///<returns type="$data.Expressions.ParameterExpression" />
            //var result  = new $data.Expressions.ParameterExpression(eNode.name, eNode.type, eNode.nodeType);
            return eNode;
        },

        VisitConstant: function (eNode, context) {
            ///<param name="eNode" type="$data.Expressions.ParameterExpression" />
            ///<returns type="$data.Expressions.ParameterExpression" />
            //var result  = new $data.Expressions.ParameterExpression(eNode.name, eNode.type, eNode.nodeType);
            return eNode;
        },

        VisitFunction: function(eNode, context) {
            ///<param name="eNode" type="$data.Expressions.FunctionExpression" />
            var self = this;

            var params = eNode.parameters.map(function (p, i) {
                return self.Visit(p, context);
            });

            var body = self.Visit(eNode.body, context);
            var result = new $data.Expressions.FunctionExpression(eNode.name, params, body);
            return result;
        },

        VisitBinary: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.SimpleBinaryExpression"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            return new $data.Expressions.SimpleBinaryExpression(left, right, eNode.nodeType, eNode.operator, eNode.type);
        },

        VisitProperty: function (eNode, context) {
            ///<param name="eNode" type="$data.Expressions.PropertyExpression" />
            var expression = this.Visit(eNode.expression, context);
            var member = this.Visit(eNode.member, context);
            return new $data.Expressions.PropertyExpression(expression, member);
            //var member = 
        },

        VisitUnary: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.UnaryExpression"/>
            ///<param name="context" type="Object"/>
            ///<returns type="$data.Expressions.UnaryExpression"/>
            var operand = this.Visit(eNode.operand, context);
            if (operand === eNode.operand) 
                return eNode;
            return new $data.Expressions.UnaryExpression(operand, eNode.operator, eNode.nodeType);
        },

        VisitDecision: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.DecisionExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.DecisionExpressionNode"/>

            var expression = this.Visit(eNode.expression, context);
            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (expression === eNode.expression && left === eNode.left && right === eNode.right)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(eNode.executable, expression, left, right);
        },

        VisitNew: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.NewExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.NewExpressionNode"/>

            var values = this.VisitArray(eNode.values, context);
            if (values === eNode.values)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.NewExpressionNode.create(true, values);
        },
        VisitArrayAccess: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode"/>

            var array = this.Visit(eNode.array, context);
            var index = this.Visit(eNode.index, context);
            if (array === eNode.array && index === eNode.index)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode.create(true, array, index);
        },
        VisitArray: function (eNodes, context) {
            var args = [];
            var ok = true;
            for (var i = 0; i < eNodes.length; i++) {
                args[i] = this.Visit(eNodes[i], context);
                ok = ok && args[i] === eNodes[i];
            }
            return ok ? eNodes : args;
        },
        GetMemberChain: function (memberAccess, context) {
            // { type:MEMBERACCESS, executable:true, expression:, member: }
            if (memberAccess.expression.type == MEMBERACCESS) {
                var a = this.GetMemberChain(memberAccess.expression, context);
                a.push(memberAccess.member);
                return a;
            }
            return [memberAccess.expression, memberAccess.member];
        }
    }, {});$C("$data.Expressions.ParameterProcessor", $data.Expressions.ExpressionVisitor, null, {
    constructor: function () {
        ///<summary>Provides a base class for several ParameterProcessors like GlobalParameterProcessor or LambdaParameterProcessor</summary>
    },

    Visit: function (node, context) {
        if ((node instanceof $data.Expressions.ParameterExpression ||
            node instanceof $data.Expressions.ThisExpression)
            && this.canResolve(node)) {
            var result = this.resolve(node, context);
            if (result !== node)
                result["resolvedBy"] = this.constructor.name;
            return result;
        } else {
            return node;
        }
    },

    canResolve: function (paramExpression) {
        ///<returns type="boolean" />
        Guard.raise("Pure method");
    },
    resolve: function (paramExpression) {
        ///<returns type="XXX" />
        Guard.raise("Pure method");
    }
});
$C("$data.Expressions.GlobalContextProcessor", $data.Expressions.ParameterProcessor, null, {
    constructor: function (global) {
        ///<param name="global" type="object" />
        this.global = global;
    },

    canResolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        return paramExpression.nodeType == $data.Expressions.ExpressionType.Parameter &&
               paramExpression.name in this.global;
    },

    resolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        ///<returns type="$data.Expressions.ExpressionNode" />
        var resultValue = this.global[paramExpression.name];
        var expression = Container.createConstantExpression(resultValue, typeof resultValue, paramExpression.name);
        return expression;
    }

});



$C("$data.Expressions.ConstantValueResolver", $data.Expressions.ParameterProcessor, null, {
    constructor: function (paramsObject, global) {
        ///<param name="global" type="object" />
        this.globalResolver = Container.createGlobalContextProcessor(global);
        this.paramsObject = paramsObject;
    },

    canResolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        return (paramExpression.nodeType == $data.Expressions.ExpressionType.This && this.paramsObject) 
                    ? true : this.globalResolver.canResolve(paramExpression);
    },

    resolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        ///<returns type="$data.Expressions.ExpressionNode" />
        if (paramExpression.nodeType == $data.Expressions.ExpressionType.This) {
            return Container.createConstantExpression(this.paramsObject, typeof this.paramsObject, 'this');
        }
        return this.globalResolver.resolve(paramExpression);
    }

});$C("$data.Expressions.LocalContextProcessor", $data.Expressions.GlobalContextProcessor, null, {
    constructor: function (evalMethod) {
        ///<param name="global" type="object" />
        this.canResolve = function (paramExpression) {
            ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
            return paramExpression.nodeType == $data.Expressions.ExpressionType.Parameter &&
                (evalMethod("typeof " + paramExpression.name) !== 'undefined');
        };
        this.resolve = function(paramExpression) {
            ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
            ///<returns type="$data.Expressions.ExpressionNode" />
            var resultValue = evalMethod(paramExpression.name);
            var expression = Container.createConstantExpression(resultValue, typeof resultValue);
            return expression;
        };

    }
    });
$C("$data.Expressions.LambdaParameterProcessor", $data.Expressions.ParameterProcessor, null, {
    constructor: function (lambdaParameterTypeInfos) {
        ///<param name="global" />
        ///<param name="evalMethod" />
        var paramIndices = {};
        var $idx = "name";

        this.canResolve = function (paramExpression, context) {
            if (paramExpression.nodeType == $data.Expressions.ExpressionType.LambdaParameter) {
                var fnParams = paramExpression.owningFunction.parameters;

                if (fnParams.length == 1 && paramExpression.name == fnParams[0].name) {
                    paramIndices[paramExpression.name] = lambdaParameterTypeInfos[0];
                    return true;
                }

                for (var j = 0; j < fnParams.length; j++) {
                    if (fnParams[j].name == paramExpression.name) {
                        paramIndices[paramExpression.name] = lambdaParameterTypeInfos[j];
                        return true;
                    }
                }
                return false;
            }
            return false;
        };

        this.resolve = function(paramExpression, context) {
            var lambdaParamType = paramIndices[paramExpression.name];
            var result = Container.createParameterExpression(paramExpression.name,
                lambdaParamType,
                $data.Expressions.ExpressionType.LambdaParameter);
            Object.defineProperty(result, "owningFunction", { value: paramExpression.owningFunction, enumerable: false });
            return result;
        };
    }

});
$C('$data.Expressions.ParameterResolverVisitor', $data.Expressions.ExpressionVisitor, null, {

    constructor: function (expression, resolver) {
    	/// <summary>
    	/// ParameterResolverVisitor traverses the JavaScript Code Expression tree and converts
        /// outer but otherwise execution local variable references into ConstantExpressions-t.
        /// for example: context.Persons.filter(function(p) { return p.Name == document.location.href })
        /// is transformed into a constant that has the current href as its value
    	/// </summary>
    	/// <param name="expression"></param>
    	/// <param name="resolver"></param>
        this.lambdaParamCache = {};
    },

    Visit: function (expression, resolver) {
        ///<param name="expression" type="$data.Expressions.ExpressionNode" />
        ///<param name="resolver" type="$data.Expressions.Resolver" />
        //TODO base call is just ugly
        return $data.Expressions.ExpressionVisitor.prototype.Visit.call(this, expression, resolver);

    },


    VisitArrayLiteral: function(eNode, context) {
        var self = this;
        var items = eNode.items.map(function (item) { return self.Visit(item, context); });
        var allLocal = items.every(function (item) {
            return item instanceof $data.Expressions.ConstantExpression;
        });

        if (allLocal) {
            items = items.map(function (item) { return item.value });
            return Container.createConstantExpression(items, "array");
        } else {
            return Container.createArrayLiteralExpression(items);
        }
    },

    VisitObjectLiteral: function(eNode, context) {
        var self = this;
        var members = eNode.members.map(function (item) { return self.Visit(item, context); });
        var allLocal = members.every(function (member) {
            return member.expression instanceof $data.Expressions.ConstantExpression;
        });

        if (allLocal) {
            var params = members.map(function (member) { return { name: member.fieldName, value: member.expression.value }; });
            return Container.createConstantExpression(eNode.implementation(params));
        } else {
            return Container.createObjectLiteralExpression(members);
        }
    },

    VisitThis: function(eNode, resolver) {
        return resolver.Visit(eNode, resolver);
    },

    VisitParameter: function(eNode, resolver) {
        ///<param name="eNode" type="$data.Expressions.ParameterExpression" />
        ///<param name="resovler" type="$data.Expressions.ParameterResolver" />
        ///<returns type="$data.Expressions.ParameterExpression" />

        var node;
        ///TODO let the resolver handle lambdaReferences if it wants to deal with it
        switch(eNode.nodeType){
            case $data.Expressions.ExpressionType.Parameter:
            case $data.Expressions.ExpressionType.LambdaParameter:
                node = resolver.Visit(eNode, resolver);
                if (node.nodeType == $data.Expressions.ExpressionType.LambdaParameter) {
                    this.lambdaParamCache[node.name] = node;
                }
                return node;
            case $data.Expressions.ExpressionType.LambdaParameterReference:
                var lambdaParam = this.lambdaParamCache[eNode.name];
                if (lambdaParam) {
                    node = Container.createParameterExpression(eNode.name,
                            lambdaParam.type,
                            $data.Expressions.ExpressionType.LambdaParameterReference);
                    node.paramIndex = eNode.paramIndex;
                    //node.typeName = lambdaParam.type.name || lambdaParam.type;
                    return node;
                }
                break;
            default:
                return eNode;

        }
            

        return eNode;
    },

    VisitConstant: function (eNode, context) {
        ///<param name="eNode" type="$data.Expressions.ParameterExpression" />
        ///<returns type="$data.Expressions.ParameterExpression" />
        return eNode;
    },

    VisitFunction: function(eNode, context) {
        ///<param name="eNode" type="$data.Expressions.FunctionExpression" />

        var self = this;
        var params = eNode.parameters.map(function (p, i) {
            var result = self.Visit(p, context);
            return result;
        });
        var body = self.Visit(eNode.body, context);
        var result = new $data.Expressions.FunctionExpression(eNode.name, params, body);

        return result;
    },

    VisitBinary: function (eNode, context) {
        ///<summary></summary>
        ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>
        ///<param name="context" type="Object"/>
        ///<return type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>

        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        var expr = $data.Expressions;

        if (left instanceof expr.ConstantExpression && right instanceof expr.ConstantExpression) 
        {
                var result = eNode.implementation(left.value, right.value);
                return Container.createConstantExpression(result);
        }
        return new Container.createSimpleBinaryExpression(left, right, eNode.nodeType, eNode.operator, eNode.type);
    },

    VisitUnary: function (eNode, context) {
        ///<summary></summary>
        ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>
        ///<param name="context" type="Object"/>
        ///<return type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>

        var operand = this.Visit(eNode.operand, context);
        //var imp = $data.unaryOperators.getOperator(
        var expr = $data.Expressions;
        if (operand  instanceof expr.ConstantExpression)
        {
                var result = eNode.operator.implementation(operand.value);
                return Container.createConstantExpression(result);
        }
        return new Container.createUnaryExpression(operand, eNode.operator, eNode.nodeType);
    },

    VisitProperty: function (eNode, context) {
        ///<param name="eNode" type="$data.Expressions.PropertyExpression" />
        var expression = this.Visit(eNode.expression, context);
        var member = this.Visit(eNode.member, context);
        var result;
        if (expression instanceof $data.Expressions.ConstantExpression &&
            member instanceof $data.Expressions.ConstantExpression) {
            ///TODO implement checking for the member, throw on error
            result = eNode.implementation(expression.value, member.value);

            //Method call processed before
            //if (typeof result === 'function') {
            //    return new $data.Expressions.ConstantExpression(
            //        function () { return result.apply(expression.value, arguments); });
            //}
            return Container.createConstantExpression(result, typeof result, expression.name + '$' + member.value);
        }
        if (expression === eNode.expression && member === eNode.member)
            return eNode;
  
        result = Container.createPropertyExpression(expression, member);
        return result;
    },

    VisitCall: function (eNode, context) {
        ///<param name="eNode" type="$data.Expressions.CallExpression" />
        function isExecutable(args, body, obj) {
            return body instanceof $data.Expressions.ConstantExpression &&
                //global methods will not have a this.
                (!obj || obj instanceof $data.Expressions.ConstantExpression) &&
                args.every(function(item) {
                    return item instanceof $data.Expressions.ConstantExpression;
                });
        }
        var call = $data.Expressions.ExpressionVisitor.prototype.VisitCall.apply(this, arguments);
        var obj = call.expression;
        var body  = call.member;
        var args = call.args;

        if (isExecutable(args, body, obj)) {
            var fn = body.value;
            if (typeof fn === 'string' && obj.value) {
                fn = obj.value[fn];
            }
            if (typeof fn !== 'function') {
                //TODO dig that name out from somewhere
                Guard.raise("Constant expression is not a method...");
            }
            var value = eNode.implementation(obj.value, fn, args);
            return new $data.Expressions.ConstantExpression(value);
        }
        return call;
    }
}, {});
$C("$data.Expressions.AggregatedVisitor", $data.Expressions.ExpressionVisitor, null, {
    constructor: function (visitors) {
        ///<param name="resolver" type="Array" elementType="$data.Expression.ParameterResolver" />

        this.Visit = function (node, context) {
            for (var i = 0; i < visitors.length; i++) {
                var n = visitors[i].Visit(node, context);
                if (n !== node)
                    return n;
            }
            return node;
        };
    }

});
//"use strict"; // suspicious code

$C('$data.Expressions.LogicalSchemaBinderVisitor',
    $data.Expressions.ExpressionVisitor, null,
    {
        constructor: function (expression, binder) {
            
        },

        VisitProperty: function (expression, context) {
            ///<param name="expression" type="$data.Expressions.ExpressionNode" />
            var exp = this.Visit(expression.expression, context);
            var mem = this.Visit(expression.member, context);

            var type = exp.type;
            var memberType = context.memberResolver.resolve(type, mem.value);
            mem.type = memberType;
            return Container.createPropertyExpression(exp, mem);
        }

    }, {});$data.Class.define('$data.Expressions.ExpTreeVisitor',
    null, null,
    {
        constructor: function () {
            this._deep = 0;
        },
        Visit: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.ExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.ExpressionNode"/>
            this._deep = this._deep + 1;
            var result = null;
            switch (eNode.type) {
                case LITERAL: result = this.VisitLiteral(eNode, context); break;
                case VARIABLE: result = this.VisitVariable(eNode, context); break;
                case MEMBERACCESS: result = this.VisitMember(eNode, context); break;
                case BINARY: result = this.VisitBinary(eNode, context); break;
                case UNARY: result = this.VisitUnary(eNode, context); break;
                case INCDEC: result = this.VisitIncDec(eNode, context); break;
                case EQUALITY: result = this.VisitEquality(eNode, context); break;
                case DECISION: result = this.VisitDecision(eNode, context); break;
                case METHODCALL: result = this.VisitMethodCall(eNode, context); break;
                case NEW: result = this.VisitNew(eNode, context); break;
                case JSONASSIGN: result = this.VisitJsonAssign(eNode, context); break;
                case ARRAYACCESS: result = this.VisitArrayAccess(eNode, context); break;
                default:
                    Guard.raise("Type isn't implemented: " + eNode.type);
            }
            this._deep = this._deep - 1;
            return result;
        },
        VisitLiteral: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.LiteralExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.LiteralExpressionNode"/>
            
            return eNode;
        },
        VisitVariable: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.VariableExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.VariableExpressionNode"/>

            return eNode;
        },
        VisitMember: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode"/>

            var expression = this.Visit(eNode.expression, context);
            var member = this.Visit(eNode.member, context);
            if (expression === eNode.expression && member === eNode.member)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(eNode.executable, expression, member);
        },
        VisitBinary: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (left === eNode.left && right === eNode.right)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(eNode.executable, eNode.operator, left, right);
        },
        VisitUnary: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.UnaryExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.UnaryExpressionNode"/>

            var operand = this.Visit(eNode.operand, context);
            if (operand === eNode.operand)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(eNode.executable, eNode.operator, operand);
        },
        VisitIncDec: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.IncDecExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.IncDecExpressionNode"/>

            var operand = this.Visit(eNode.operand, context);
            if (operand === eNode.operand)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(eNode.executable, eNode.operator, operand, eNode.suffix);
        },
        VisitEquality: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.EqualityExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.EqualityExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (left === eNode.left && right === eNode.right)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(eNode.executable, eNode.operator, left, right);
        },
        VisitDecision: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.DecisionExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.DecisionExpressionNode"/>

            var expression = this.Visit(eNode.expression, context);
            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (expression === eNode.expression && left === eNode.left && right === eNode.right)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(eNode.executable, expression, left, right);
        },
        VisitMethodCall: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode"/>

            var object = eNode.object ? this.Visit(eNode.object, context) : null;
            var args = this.VisitArray(eNode.args, context);
            if (object === eNode.object && args === eNode.args)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(eNode.executable, object, eNode.method, args);
        },
        VisitNew: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.NewExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.NewExpressionNode"/>

            var values = this.VisitArray(eNode.values, context);
            if (values === eNode.values)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.NewExpressionNode.create(true, values);
        },
        VisitJsonAssign: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (left === eNode.left && right === eNode.right)
                return eNode;
            left.JSONASSIGN = true;
            right.JSONASSIGN = true;
            return $data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode.create(true, left, right);
        },
        VisitArrayAccess: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode"/>

            var array = this.Visit(eNode.array, context);
            var index = this.Visit(eNode.index, context);
            if (array === eNode.array && index === eNode.index)
                return eNode;
            return $data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode.create(true, array, index);
        },
        VisitArray: function (eNodes, context) {
            var args = [];
            var ok = true;
            for (var i = 0; i < eNodes.length; i++) {
                args[i] = this.Visit(eNodes[i], context);
                ok = ok && args[i] === eNodes[i];
            }
            return ok ? eNodes : args;
        },
        GetMemberChain: function (memberAccess, context) {
            // { type:MEMBERACCESS, executable:true, expression:, member: }
            if (memberAccess.expression.type == MEMBERACCESS) {
                var a = this.GetMemberChain(memberAccess.expression, context);
                a.push(memberAccess.member);
                return a;
            }
            return [memberAccess.expression, memberAccess.member];
        }
    }, {});$data.Class.define('$data.Expressions.SetExecutableVisitor', $data.Expressions.ExpTreeVisitor, null,
{
    Visit: function (eNode, context) {
        switch (eNode.type) {
            case LITERAL: return this.VisitLiteral(eNode, context);
            case VARIABLE: return this.VisitVariable(eNode, context);
            case MEMBERACCESS: return this.VisitMember(eNode, context);
            case BINARY: return this.VisitBinary(eNode, context);
            case UNARY: return this.VisitUnary(eNode, context);
            case INCDEC: return this.VisitIncDec(eNode, context);
            case EQUALITY: return this.VisitEquality(eNode, context);
            case DECISION: return this.VisitDecision(eNode, context);
            case METHODCALL: return this.VisitMethodCall(eNode, context);
            case NEW: return this.VisitNew(eNode, context);
            case JSONASSIGN: return this.VisitJsonAssign(eNode, context);
            case ARRAYACCESS: return this.VisitArrayAccess(eNode, context);
            default:
                Guard.raise("Type isn't implemented: " + eNode.type);
        }
    },

    VisitBinary: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left === eNode.left && right === eNode.right && (left.executable && right.executable == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(left.executable && right.executable, eNode.operator, left, right);
    },
    VisitUnary: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand === eNode.operand)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(operand.executable, eNode.operator, operand);
    },
    VisitIncDec: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand === eNode.operand)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(operand.executable, eNode.operator, operand, eNode.suffix);
    },
    VisitEquality: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left === eNode.left && right === eNode.right && (left.executable && right.executable == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(left.executable && right.executable, eNode.operator, left, right);
    },
    VisitDecision: function (eNode, context) {
        var expression = this.Visit(eNode.expression, context);
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (expression === eNode.expression && left === eNode.left && right === eNode.right && (left.executable && right.executable && expression.executable == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(left.executable && right.executable && expression.executable, expression, left, right);
    },
    VisitMethodCall: function (eNode, context) {
        var object = eNode.object ? this.Visit(eNode.object, context) : null;
        var args = this.VisitArray(eNode.args, context);
        if (object === eNode.object && args === eNode.args && ((object == null ? true : object.executable) == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(object == null ? true : object.executable, object, eNode.method, args);
    },
    VisitNew: function (eNode, context) {
        // { type:NEW, executable:true, values: [] };
        var values = this.VisitArray(eNode.values, context);
        if (values === eNode.values)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.NewExpressionNode.create(true, values);
    },
    VisitJsonAssign: function (eNode, context) {
        // { type:JSONASSIGN, executable:true, left: variable, right: right }
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left === eNode.left && right === eNode.right)
            return eNode;
        left.JSONASSIGN = true;
        right.JSONASSIGN = true;
        return $data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode.create(true, left, right);
    },
    VisitArrayAccess: function (eNode, context) {
        // { type:ARRAYACCESS, executable:true, array:, index: }
        var array = this.Visit(eNode.array, context);
        var index = this.Visit(eNode.index, context);
        if (array === eNode.array && index === eNode.index)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode.create(true, array, index);
    },
    VisitArray: function (eNodes, context) {
        var args = [];
        var ok = true;
        for (var i = 0; i < eNodes.length; i++) {
            args[i] = this.Visit(eNodes[i], context);
            ok = ok && args[i] === eNodes[i];
        }
        return ok ? eNodes : args;
    },

    VisitLiteral: function (eNode, context) {
        return { type: eNode.type, executable: true, value: eNode.value, valueType: eNode.valueType };
    },
    VisitVariable: function (eNode, context) {
        if (typeof context.paramContext[eNode.name] == undefined) // isn't param  //TODO: check ParamContext
            Guard.raise("Variable is not defined in the paramContext: " + eNode.name);
        //this._setExecutable(eNode, true);
        return $data.Expressions.ExpressionNodeTypes.VariableExpressionNode.create(true, "Math", "GLOBALOBJECT");
    },
    VisitMember: function (eNode, context) {
        var chain = this.GetMemberChain(eNode);
        var firstMember = chain[0].name;
        var isLambdaParam = context.lambdaParams.indexOf(firstMember) >= 0;
        var isLocalParam = firstMember == context.paramsName; //TODO: check ParamContext // old: typeof context.paramContext[firstMember] != "undefined";
        if (!isLocalParam && !isLambdaParam)
            Guard.raise("Variable is not defined in the paramContext or the lambda parameters: " + firstMember);

        return $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(isLocalParam, eNode.expression, eNode.member);
    }
}, null);$data.Class.define('$data.Expressions.ExecutorVisitor', $data.Expressions.ExpTreeVisitor, null,
{
    //--
    VisitVariable: function (eNode, context) {
        if (!eNode.executable)
            return eNode;
        var value = (eNode.name == context.paramsName) ? context.paramContext : window[eNode.name];
        if (typeof value == 'undefined')
			Guard.raise(
				new Exception("Unknown variable in '" + context.operation + "' operation. The variable isn't referenced in the parameter context and it's not a global variable: '" + eNode.name + "'.",
                "InvalidOperation", { operationName: context.operation, missingParameterName: eNode.name })
				);
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitMember: function (eNode, context) {
        if (!eNode.executable)
            return eNode;
        var chain = this.GetMemberChain(eNode);
        var value;
        for (var i = 0; i < chain.length; i++) {
            if (i == 0)
                value = context.paramContext;
            else
                value = value[chain[i].name];
        }
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);


    },
    VisitUnary: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand !== eNode.operand)
            eNode = $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(eNode.executable, eNode.operator, operand);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        var src;
        var operandValue = ((operand.valueType == "string") ? ("'" + operand.value + "'") : operand.value);
        src = "value = " + eNode.operator + " " + operandValue;
        eval(src);

        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitIncDec: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand !== eNode.operand)
            eNode = $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(eNode.executable, eNode.operator, operand, eNode.suffix);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        if (eNode.suffix)
            value = eNode.operator == "++" ? operand.value++ : operand.value--;
        else
            value = eNode.operator == "++" ? ++operand.value : --operand.value;
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitBinary: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left !== eNode.left || right !== eNode.right)
            eNode = $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(eNode.executable, eNode.operator, left, right);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        var src;
        var leftValue = ((left.valueType == "string") ? ("'" + left.value + "'") : left.value);
        var rightValue = ((right.valueType == "string") ? ("'" + right.value + "'") : right.value);
        src = "value = " + leftValue + " " + eNode.operator + " " + rightValue;
        eval(src);

        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitEquality: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left !== eNode.left || right !== eNode.right)
            eNode = $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(eNode.executable, eNode.operator, left, right);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        var src;
        var leftValue = ((left.valueType == "string") ? ("'" + left.value + "'") : left.value);
        var rightValue = ((right.valueType == "string") ? ("'" + right.value + "'") : right.value);
        src = "value = " + leftValue + " " + eNode.operator + " " + rightValue;
        eval(src);
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitDecision: function (eNode, context) {
        var expression = this.Visit(eNode.expression, context);
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (expression !== eNode.expression || left !== eNode.left || right !== eNode.right)
            eNode = $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(eNode.executable, expression, left, right);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value = expression.value ? left.value : right.value;
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitMethodCall: function (eNode, context) {
        var object = eNode.object ? this.Visit(eNode.object, context) : null;
        var args = this.VisitArray(eNode.args, context);
        if (object !== eNode.object || args != eNode.args)
            eNode = $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(eNode.executable, object, eNode.method, args);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var a = [];
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            var t = typeof arg.value;
            a.push((t == "string") ? ("'" + arg.value + "'") : arg.value);
        }
        var value;
        var src = object ?
			"value = object.value[eNode.method](" + a.join(",") + ");"
			:
			"value = " + eNode.method + "(" + a.join(",") + ");";
        eval(src);

        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitArrayAccess: function (eNode, context) {
        // { type:ARRAYACCESS, executable:true, array:, index: }
        var arrayNode = this.Visit(eNode.array, context);
        var indexNode = this.Visit(eNode.index, context);
        var value = arrayNode.value[indexNode.value];
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    }
}, null); $data.Class.define('$data.Expressions.ExpressionBuilder', null, null,
{
    constructor: function (context) {
        this.context = context;
    },
    _isLambdaParam: function (name) {
        var p = this.context.lambdaParams;
        for (var i = 0; i < p.length; i++) {
            if (p[i] == name)
                return true;
        }
        return false;
    },
    _isParam: function (name) {
        return this.context.paramContext[name] != undefined;
    },
    _isParamRoot: function (name) {
        return this.context.paramsName == name;
    },
    Build: function (node, expNode) {
        var n;
        switch (node.arity) {
            case "infix":
                if ("(" == node.value)
                    n = this.BuildMethodCall(node, expNode);
                else if ("." == node.value)
                    n = this.BuildMember(node, expNode);
                else if (["===", "==", "!==", "!=", ">", "<", ">=", "<="].indexOf(node.value) >= 0)
                    n = this.BuildEquality(node, expNode);
                else if (["&&", "||"].indexOf(node.value) >= 0)
                    n = this.BuildBinary(node, expNode);
                else if (["+", "-", "*", "/", "%"].indexOf(node.value) >= 0)
                    n = this.BuildBinary(node, expNode);
                else if ("[" == node.value)
                    n = this.BuildArrayAccess(node, expNode);
                else
                    Guard.raise("Value of infix node isn't implemented: " + node.value);
                break;
            case "prefix":
                if (["+", "-", "!"].indexOf(node.value) >= 0)
                    n = this.BuildUnary(node, expNode);
                else if (["++", "--"].indexOf(node.value) >= 0)
                    n = this.BuildIncDec(node, expNode);
                else if ("{" == node.value/* && "object" == node.type*/) //TODO: check the second condition necessity
                    n = this.BuildNewExpression(node, expNode);
                else
                    Guard.raise("Value of prefix node isn't implemented: " + node.value);
                break;
            case "suffix":
                if (["++", "--"].indexOf(node.value) >= 0)
                    n = this.BuildIncDec(node, expNode);
                else
                    Guard.raise("Value of suffix node isn't implemented: " + node.value);
                break;
            case "string":
            case "number":
                n = this.BuildLiteral(node, expNode); //TODO: more arity to literal?
                break;
            case "ternary":
                if (node.value == "?")
                    n = this.BuildDecision(node, expNode);
                else
                    Guard.raise("Value of ternary node isn't implemented: " + node.value);
                break;
            case null:
            case undefined:
                if (node.type == "boolean" && (node.value == "true" || node.value == "false"))
                    n = this.BuildBoolLiteral(node, expNode);
                else
                    n = this.BuildVariable(node, expNode);
                break;
            default:
                Guard.raise("Arity isn't implemented: " + node.arity);
        }
        return n;
    },
    BuildNewExpression: function (node, expNode) {
        var newExpression = $data.Expressions.ExpressionNodeTypes.NewExpressionNode.create(true, []);
        var n = node.first;
        for (var i = 0; i < n.length; i++)
            newExpression.values.push(this.Build(n[i], newExpression));
        return newExpression;
    },
    BuildLiteral: function (node, expNode) {
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, node.arity, node.value);
    },
    BuildBoolLiteral: function (node, expNode) {
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, node.type, node.value == "true" ? true : false);
    },
    BuildVariable: function (node, expNode) {
        if (!node.first) {
            if (expNode.type == MEMBERACCESS) {
                var subType;
                if (this._isLambdaParam(node.value))
                    subType = "LAMBDAPARAM";
                else if (this._isParamRoot(node.value))
                    subType = "PARAMETERROOT";
                else if (this._isParam(node.value))
                    subType = "PARAMETER";
                else
                    subType = "PROPERTY";
            }
            else {
                if (this._isLambdaParam(node.value))
                    subType = "LAMBDAPARAM";
                else if (this._isParamRoot(node.value))
                    subType = "PARAMETERROOT";
                else if (this._isParam(node.value))
                    subType = "PARAMETER";
                else if (window[node.value] != undefined)
                    subType = "GLOBALOBJECT";
                else
					Guard.raise(
						new Exception("Unknown variable in '" + this.context.operation + "' operation. The variable isn't referenced in the parameter context and it's not a global variable: '" + node.value + "'.",
                        "InvalidOperation", { operationName: this.context.operation, missingParameterName: node.value })
						);
            }
            return $data.Expressions.ExpressionNodeTypes.VariableExpressionNode.create(true, node.value, subType);
        }

        var left = $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, "name", node.value);

        var jsonAssign = $data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode.create(true);
        var right = this.Build(node.first, jsonAssign);
        //left.parent = jsonAssign;
        jsonAssign.left = left;
        jsonAssign.right = right;

        left.JSONASSIGN = true;
        right.JSONASSIGN = true;

        return jsonAssign;
    },
    BuildMember: function (node, expNode) {
        if (node.value != "." || node.arity != "infix") {
            if (node.type == "string") { //TODO: more types?
                return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, node.arity, node.value);
            }
            return $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(true, null, node.value);
        }
        var result = $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(true);
        var expression = this.Build(node.first, result);
        var member = this.Build(node.second, result);
        result.expression = expression;
        result.member = member;
        return result;
    },
    BuildUnary: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(true, node.value);
        result.operand = this.Build(node.first, result);
        return result;
    },
    BuildIncDec: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(true, node.value, null, node.arity == "suffix");
        result.operand = this.Build(node.first, result);
        return result;
    },
    BuildBinary: function (node, expNode) {
        if (!node.first) Guard.raise("Cannot build binary: node.first is null");
        if (!node.second) Guard.raise("Cannot build binary: node.second is null");
        var result = $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(true, node.value);
        result.left = this.Build(node.first, result);
        result.right = this.Build(node.second, result);
        return result;
    },
    BuildEquality: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(true, node.value);
        result.left = this.Build(node.first, result);
        result.right = this.Build(node.second, result);
        return result;
    },
    BuildDecision: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(true);
        result.expression = this.Build(node.first, result);
        result.left = this.Build(node.second, result);
        result.right = this.Build(node.third, result);
        return result;
    },
    BuildMethodCall: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(true);
        if (node.first.type == "function") {
            //-- object's function
            result.object = this.Build(node.first.first, result);
            result.method = node.first.second.value;
        }
        else {
            //-- global function
            if (node.first.type != null)
                Guard.raise("Cannot build MethodCall because type is " + type);
            result.object = null;
            result.method = node.first.value;
        }
        var argNodes = node.second;
        var args = [];
        for (var i = 0; i < argNodes.length; i++) {
            var arg = argNodes[i];
            args[i] = this.Build(arg, result);
        }
        result.args = args;
        return result;
    },
    BuildArrayAccess: function (node, expNode) {
        // { type:ARRAYACCESS, executable:true, array:, index: }
        var result = $data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode.create(true);
        result.array = this.Build(node.first, result);
        result.index = this.Build(node.second, result);
        return result;
    }
}, null);$C('$data.Expressions.AssociationInfoExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (associationInfo) {
        this.associationInfo = associationInfo;
    },
    nodeType: { value: $data.Expressions.ExpressionType.AssociationInfo, enumerable: true }
});$C('$data.Expressions.CodeExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, parameters) {
        if (Container.resolveType(Container.getTypeName(source)) == $data.String && source.replace(/^[\s\xA0]+/, "").match("^function") != "function") {
            source = "function (it) { return " + source + "; }";
        }

        this.source = source;
        this.parameters = parameters;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Code, enumerable: true }
});$C('$data.Expressions.CodeToEntityConverter', $data.Expressions.ExpressionVisitor, null, {
    constructor: function (scopeContext) {
        ///<summary>This visitor converts a JS language tree into a semantical Entity Expression Tree &#10;This visitor should be invoked on a CodeExpression</summary>
        ///<param name="context">context.thisArg contains parameters, context.lambdaParams should have an array value</param>
        this.scopeContext = scopeContext;
        this.parameters = [];

    },


    VisitBinary: function (expression, context) {
        var left = this.Visit(expression.left, context);
        var right = this.Visit(expression.right, context);

        var operatorResolution = this.scopeContext.resolveBinaryOperator(expression.nodeType, expression, context.frameType);
        var result = Container.createSimpleBinaryExpression(left, right, expression.nodeType, expression.operator, expression.type, operatorResolution);
        return result;
    },

    VisitUnary: function (expression, context) {
        var operand = this.Visit(expression.operand, context);
        var operatorResolution = this.scopeContext.resolveUnaryOperator(expression.nodeType, expression, context.frameType);
        var result = Container.createUnaryExpression(operand, expression.operator, expression.nodeType, operatorResolution);
        return result;
    },

    VisitParameter: function (expression, context) {
        Guard.requireValue("context", context);
        var et = $data.Expressions.ExpressionType;
        switch (expression.nodeType) {
            case et.LambdaParameterReference:
                var result = Container.createEntityExpression(context.lambdaParameters[expression.paramIndex], { lambda: expression.name });
                return result;
            case et.LambdaParameter:
                //TODO: throw descriptive exception or return a value
                break;
            default:
                Guard.raise("Global parameter " + expression.name + " not found. For query parameters use 'this.field' notation");
                break;
        }
    },

    VisitThis: function (expression, context) {
        ///<summary>converts the ThisExpression into a QueryParameterExpression tha't value will be evaluated and stored in this.parameters collection</summary>
        var index = this.parameters.push({ name: "", value: undefined }) - 1;
        var result = Container.createQueryParameterExpression("", index, context.queryParameters, undefined);
        return result;
    },

    VisitFunction: function (expression, context) {
        var result = $data.Expressions.ExpressionVisitor.prototype.VisitFunction.apply(this, arguments);
        return result.body;
    },

    VisitCall: function (expression, context) {
        //var exp = this.Visit(expression.expression);
        var self = this;
        var exp = this.Visit(expression.expression, context);
        var member = this.Visit(expression.member, context);
        var args = expression.args.map(function (arg) {
            return self.Visit(arg, context);
        });
        var result;

        ///filter=>function(p) { return p.Title == this.xyz.BogusFunction('asd','basd');}
        switch (true) {
            case exp instanceof $data.Expressions.QueryParameterExpression:
                var argValues = args.map(function (a) { return a.value; });
                result = expression.implementation(exp.value, member.value, argValues);
                //var args = expressions
                return Container.createQueryParameterExpression(exp.name + "$" + member.value, exp.index, result, typeof result);
            case exp instanceof $data.Expressions.EntityFieldExpression:

            case exp instanceof $data.Expressions.EntityFieldOperationExpression:
                var operation = this.scopeContext.resolveFieldOperation(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity field operation: " + member.getJSON());
                }
                member = Container.createMemberInfoExpression(operation);
                result = Container.createEntityFieldOperationExpression(exp, member, args);
                return result;

            case exp instanceof $data.Expressions.EntitySetExpression:
                var operation = this.scopeContext.resolveSetOperations(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity field operation: " + member.getJSON());
                }
                member = Container.createMemberInfoExpression(operation);
                result = Container.createFrameOperationExpression(exp, member, args);
                return result;
                
            default:
                Guard.raise("VisitCall: Only fields can have operations: " + expression.getType().name);
                //TODO we must not alter the visited tree
        }

    },

    VisitProperty: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.PropertyExpression" />
        var exp = this.Visit(expression.expression, context);
        var member = this.Visit(expression.member, context);

        //Guard.requireType("member", member, $data.Expressions.ConstantExpression);
        Guard.requireType("member", member, $data.Expressions.ConstantExpression);

        function isPrimitiveType(memberDefinitionArg) {

            var t = memberDefinitionArg.dataType;
            if (typeof t === 'function') { return false; }

			// suspicious code
            /*switch (t) {
                //TODO: implement this
            }*/
        }

        switch (exp.expressionType) {
            case $data.Expressions.EntityExpression:
                var memberDefinition = exp.getMemberDefinition(member.value);
                if (!memberDefinition) {
                    Guard.raise(new Exception("Unknown member: " + member.value, "MemberNotFound"));
                }
                //var storageMemberDefinition =
                var storageField = memberDefinition.storageModel
                                                   .PhysicalType.memberDefinitions.getMember(memberDefinition.name);
                var res;
                var memberDefinitionExp;
                switch (storageField.kind) {
                    case "property":
                        memberDefinitionExp = Container.createMemberInfoExpression(memberDefinition);
                        res = Container.createEntityFieldExpression(exp, memberDefinitionExp);
                        return res;
                    case "navProperty":
                        var assocInfo = memberDefinition.storageModel.Associations[memberDefinition.name];
                        var setExpression = Container.createEntitySetExpression(exp, Container.createAssociationInfoExpression(assocInfo));
                        if (assocInfo.ToMultiplicity !== "*") {
                            var ee = Container.createEntityExpression(setExpression, {});
                            return ee;
                        }/* else {
                            context.lambdaParameters.push(setExpression);
                        }*/
                        return setExpression;
                    case "complexProperty":
                        memberDefinitionExp = Container.createMemberInfoExpression(memberDefinition);
                        res = Container.createComplexTypeExpression(exp, memberDefinitionExp);
                        return res;
                        //TODO: missing default case
                }

                //s/switch => property or navigationproperty
            case $data.Expressions.ComplexTypeExpression:
                var memDef = exp.getMemberDefinition(member.value);
                if (!(memDef)) {
                    Guard.raise("Unknown member " + member.value + " on " + exp.entityType.name);
                }
                var memDefExp = Container.createMemberInfoExpression(memDef);
                var result;
                //TODO!!!!
                if (Container.isPrimitiveType(Container.resolveType(memDef.dataType))) {
                    result = Container.createEntityFieldExpression(exp, memDefExp);
                    return result;
                }
                result = Container.createComplexTypeExpression(exp, memDefExp);
                return result;
            case $data.Expressions.QueryParameterExpression:
                var value = expression.implementation(exp.value, member.value);
                this.parameters[exp.index].name += "$" + member.value;
                this.parameters[exp.index].value = value;
                return Container.createQueryParameterExpression(exp.name + "$" + member.value, exp.index, value, Container.getTypeName(value));
            case $data.Expressions.EntityFieldExpression:
            case $data.Expressions.EntityFieldOperationExpression:
                var operation = this.scopeContext.resolveFieldOperation(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity field operation: " + member.getJSON());
                }
                member = Container.createMemberInfoExpression(operation);
                result = Container.createEntityFieldOperationExpression(exp, member, []);

                return result;
            default:
                Guard.raise("Unknown expression type to handle: " + exp.expressionType.name);
        }
    }
});$C('$data.Expressions.ComplexTypeExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.ComplexTypeExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        Guard.requireType("source", source, [$data.Expressions.EntityExpression, $data.Expressions.ComplexTypeExpression]);
        Guard.requireType("selector", selector, [$data.Expressions.EntityExpression, $data.Expressions.MemberInfoExpression]);
        this.source = source;
        this.selector = selector;
        var dt = source.entityType.getMemberDefinition(selector.memberName).dataType;
        var t = Container.resolveType(dt);
        this.entityType = t;
    },

    getMemberDefinition: function (name) {
        return this.entityType.getMemberDefinition(name);
    },

    nodeType: { value: $data.Expressions.ExpressionType.Com }
});

$C('$data.Expressions.EntityContextExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (instance) {
        ///<param name="instance" type="$data.EntityContext" />
        Object.defineProperty(this, "instance", { value: instance, enumerable: false });
        //this.instance = instance;
        //this.storage_type = {};
        //this.typeName = this.type.name;
    },
    //instance: { enumerable: false, value: undefined },
    nodeType : { value: $data.Expressions.ExpressionType.EntityContext, enumerable: true }

});
$C('$data.Expressions.EntityExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.IndexingExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.AccessorExpression" />
        ///</signature>
        Guard.requireValue("source", source);
        Guard.requireValue("selector", selector);
        if (!(source instanceof $data.Expressions.EntitySetExpression) && !(source instanceof $data.Expressions.ServiceOperationExpression)) {
            Guard.raise("Only EntitySetExpressions can be the source for an EntityExpression");
        }

        this.source = source;
        this.selector = selector;

        this.entityType = this.source.elementType;
        this.storageModel = this.source.storageModel;

        Guard.requireValue("entityType", this.entityType);
        Guard.requireValue("storageModel", this.storageModel);

    },

    getMemberDefinition: function (name) {
        var memdef = this.entityType.getMemberDefinition(name);
        if (!(memdef)) {
            Guard.raise(new Exception("Unknown member " + name + " on type "+ this.entityType.name, "MemberNotFound"));
        };
            memdef.storageModel = this.storageModel;
        return memdef;
    },

    nodeType: { value: $data.Expressions.ExpressionType.Entity }
});$C('$data.Expressions.EntityExpressionVisitor', null, null, {

    constructor: function () {
        this.lambdaTypes = [];
    },

    canVisit: function (expression) {
        return expression instanceof $data.Expressions.ExpressionNode;
    },

    Visit: function (expression, context) {
        if (!this.canVisit(expression))
            return expression;

        var visitorName = "Visit" + expression.getType().name;
        if (visitorName in this) {
            var fn = this[visitorName];
            var result = fn.call(this, expression, context);
            if (typeof result === 'undefined') {
                return expression;
            }
            return result;
        }
        //console.log("unhandled expression type:" + expression.getType().name);
        return expression;
    },
    VisitToArrayExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source) {
            return Container.createToArrayExpression(source);
        }
        return expression;
    },
    VisitForEachExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source) {
            return Container.createForEachExpression(source);
        }
        return expression;
    },
    VisitMemberInfoExpression: function (expression, context) {
        return expression;
    },

    VisitSingleExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createSingleExpression(source);
        return expression;
    },

    VisitFirstExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createFirstExpression(source);
        return expression;
    },

    VisitSomeExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createSomeExpression(source);
        return expression;
    },

    VisitEveryExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createEveryExpression(source);
        return expression;
    },

    VisitCountExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createCountExpression(source);
        return expression;
    },

    VisitObjectLiteralExpression: function (expression, context) {
        var newValues = expression.members.map(function (ofe) {
            return this.Visit(ofe, context);
        }, this);
        var equal = true;
        for (var i = 0; i < expression.members.length; i++) {
            equal = equal && (expression.members[i] === newValues[i]);
        }
        if (!equal) {
            return Container.createObjectLiteralExpression(newValues);
        }
        return expression;
    },
    VisitObjectFieldExpression: function (expression, context) {
        var newExpression = this.Visit(expression.expression, context);
        if (expression.expression !== newExpression) {
            return Container.createObjectFieldExpression(expression.fieldName, newExpression);
        }
        return expression;
    },
    VisitIncludeExpression: function (expression, context) {
        var newExpression = this.Visit(expression.source, context);
        if (newExpression !== expression.source) {
            return Container.createIncludeExpression(newExpression, expression.selector);
        }
        return expression;
    },

    VisitUnaryExpression: function(expression, context) {

    	/// <param name="expression" type="$data.Expressions.UnaryExpression"></param>
    	/// <param name="context"></param>
        var operand = this.Visit(expression.operand, context);
        if (expression.operand !== operand) {
            return Container.createUnaryExpression(operand, expression.operator, expression.nodeType, expression.resolution);
        };
        return expression;
    },

    VisitSimpleBinaryExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.SimpleBinaryExpression"/>
        ///<param name="context" type="Object"/>
        //<returns type="$data.Expressions.SimpleBinaryExpression"/>
        var left = this.Visit(expression.left, context);
        var right = this.Visit(expression.right, context);
        if (left !== expression.left || right !== expression.right) {
            return new $data.Expressions.SimpleBinaryExpression(left, right, expression.nodeType,
                expression.operator, expression.type, expression.resolution);
        }
        return expression;
    },

    VisitEntityContextExpression: function (expression, context) {
        return expression;
    },

    VisitCodeExpression: function (expression, context) {
        /// <param name="expression" type="$data.Expressions.CodeExpression"></param>
        /// <param name="context"></param>
        /// <returns type="$data.Expressions.CodeExpression"></returns>
        return expression;
    },

    VisitComplexTypeExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var result = Container.createComplexTypeExpression(source, selector);
            return result;
        }
        return expression;
    },

    VisitEntityExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var result = Container.createEntityExpression(source, selector);
            return result;
        }
        return expression;
    },

    VisitEntityFieldExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var result = Container.createEntityFieldExpression(source, selector);
            return result;
        }
        return expression;
    },

    VisitEntityFieldOperationExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var operation = this.Visit(expression.operation, context);
        var parameters = expression.parameters.map(function (p) {
            return this.Visit(p);
        }, this);
        var result = Container.createEntityFieldOperationExpression(source, operation, parameters);
        return result;
    },

    VisitParametricQueryExpression: function (expression, context) {
        var exp = this.Visit(expression.expression, context);
        var args = expression.parameters.map(function (p) {
            return this.Visit(p);
        }, this);
        var result = Container.createParametricQueryExpression(exp, args);
        return result;
    },

    VisitEntitySetExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createEntitySetExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitFilterExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createFilterExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitProjectionExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createProjectionExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitOrderExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createOrderExpression(source, selector, expression.nodeType);
        }
        return expression;
    },
    VisitPagingExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var amount = this.Visit(expression.amount, context);
        if (source !== expression.source || amount !== expression.amount) {
            return Container.createPagingExpression(source, amount, expression.nodeType);
        }
        return expression;
    }
});
$C('$data.Expressions.EntityFieldExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector) {
        ///<param name="source" type="$data.Entity.EntityExpression" />
        ///<param name="selector" type="$data.Entity.MemberInfoExpression" />
        this.selector = selector;
        this.source = source;


        if (this.selector instanceof $data.Expressions.MemberInfoExpression ||  this.selector.name) {
            this.memberName = this.selector.name; 
        }
    },

    nodeType: { value: $data.Expressions.ExpressionType.EntityField }
});

$C('$data.Expressions.EntityFieldOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, operation, parameters) {
        this.source = source;
        this.operation = operation;
        this.parameters = parameters;
    },
    nodeType: { value: $data.Expressions.ExpressionType.EntityFieldOperation }

});$C('$data.Expressions.EntitySetExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector, params, instance) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityContextExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.ParametricQueryExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.CodeExpression" />
        ///</signature>
        Guard.requireType("source", source, 
                    [$data.Expressions.EntityContextExpression, $data.Expressions.EntitySetExpression]);
        Guard.requireType("selector", source,
                    [$data.Expressions.MemberInfoExpression, $data.Expressions.CodeExpression, $data.Expressions.ParametricQueryExpression]);

        Object.defineProperty(this, "source", { value: source, enumerable: true, writable: true });
        Object.defineProperty(this, "selector", { value: selector, enumerable: true, writable: true });
        Object.defineProperty(this, "params", { value: params, enumerable: true, writable: true });

        Object.defineProperty(this, "instance", { value: instance, enumerable: false, writable: true });
        /*this.source = source;
        this.selector = selector;
        this.params = params;
        this.instance = instance;*/

        function findContext() {
            //TODO: use source from function parameter and return a value at the end of the function
            var r = source;
            while (r) {
                if (r instanceof $data.Expressions.EntityContextExpression) {
                    return r;
                }
                r = r.source;
            }
        }

        ///TODO!!!
        this.storage_type = {};
        var c = findContext();
        switch (true) {
            case this.source instanceof $data.Expressions.EntityContextExpression:
                Guard.requireType("selector", selector, $data.Expressions.MemberInfoExpression);
                this.elementType = selector.memberDefinition.elementType;
                this.storageModel = c.instance._storageModel.getStorageModel(this.elementType);
                break;
            case this.source instanceof $data.Expressions.EntityExpression:
                Guard.requireType("selector", selector, $data.Expressions.AssociationInfoExpression);
                this.elementType = selector.associationInfo.ToType;
                this.storageModel = c.instance._storageModel.getStorageModel(this.elementType);
                break;
            case this.source instanceof $data.Expressions.EntitySetExpression:
                this.elementType = this.source.elementType;
                this.storageModel = this.source.storageModel;
                break;
            case this.source instanceof $data.Expressions.ServiceOperationExpression:
                this.elementType = this.source.elementType;//?????????
                this.storageModel = this.source.storageModel;
                break;
            default:
                Guard.raise("Unknown source type for EntitySetExpression: " + this.source.getType().name);
        }

		// suspicious code
        /*if (this.source instanceof $data.Expressions.EntitySetExpression) {
                //TODO: missing operation
        }*/
        //EntityTypeInfo

    },
    /*source: { enumerable: true, writable: true, value: undefined },
    selector: { enumerable: true, writable: true, value: undefined },
    params: { enumerable: true, writable: true, value: undefined },
    instance: { enumerable: false, writable: true, value: undefined },*/
    nodeType: { value: $data.Expressions.ExpressionType.EntitySet, enumerable: true }
});
$C('$data.Expressions.FrameOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, operation, parameters) {
        this.source = source;
        this.operation = operation;
        this.parameters = parameters;
    },
    nodeType: { value: $data.Expressions.ExpressionType.FrameOperation }

});
$C('$data.Expressions.FilterExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.ParametricQueryExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.CodeExpression" />
        ///</signature>
        this.resultType = $data.Array;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Filter, enumerable: true }
});

$C('$data.Expressions.FrameOperator', $data.Expressions.ExpressionNode, null, {
    constructor: function () {
        this.isTerminated = true;
    }
});

$C('$data.Expressions.CountExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Integer;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Count, enumerable: true }
});

$C('$data.Expressions.SingleExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Single, enumerable: true }
});

$C('$data.Expressions.FirstExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.First, enumerable: true }
});

$C('$data.Expressions.ForEachExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Array;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ForEach, enumerable: true }
});
$C('$data.Expressions.ToArrayExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Array;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ToArray, enumerable: true }
});

$C('$data.Expressions.SomeExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Some, enumerable: true }
});

$C('$data.Expressions.EveryExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Every, enumerable: true }
});$C('$data.Expressions.IncludeExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector) {
    },
    nodeType: { value: $data.Expressions.ExpressionType.Include, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);
$C('$data.Expressions.MemberInfoExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (memberDefinition) {
        this.memberDefinition = memberDefinition;
        this.memberName = memberDefinition.name;
    },
    nodeType: { value: $data.Expressions.ExpressionType.MemberInfo, enumerable: true }

});$C('$data.Expressions.OrderExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, expression, nType) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        //this.source = source;
        //this.selector = expression;
        this.nodeType = nType;
    },
    nodeType: { value: $data.Expressions.ExpressionType.OrderBy, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);
$C('$data.Expressions.ParametricQueryExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (expression, parameters) {
        this.expression = expression;
        this.parameters = parameters;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ParametricQuery, enumerable: true }
});$C('$data.Expressions.ProjectionExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector, params, instance) {

    },
    nodeType: { value: $data.Expressions.ExpressionType.Projection, enumerable: true }

});


$C('$data.Expressions.QueryExpressionCreator', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (scopeContext) {
        ///<param name="scopeContext" type="$data.Expressions.EntityContext" />
        Guard.requireValue("scopeContext", scopeContext);
        this.scopeContext = scopeContext;
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.source instanceof $data.Expressions.EntityContextExpression) {
            this.lambdaTypes.push(expression);
        }
        return expression;
    },

    VisitServiceOperationExpression: function (expression, context) {
        if (expression.source instanceof $data.Expressions.EntityContextExpression) {
            this.lambdaTypes.push(expression);
        }
        return expression;
    },

    VisitCodeExpression: function (expression, context) {
        ///<summary>Converts the CodeExpression into an EntityExpression</summary>
        ///<param name="expression" type="$data.Expressions.CodeExpression" />
        var source = expression.source.toString();
        var jsCodeTree = Container.createCodeParser(this.scopeContext).createExpression(source);
        this.scopeContext.log({ event: "JSCodeExpression", data: jsCodeTree });

        //TODO rename classes to reflex variable names
        //TODO engage localValueResolver here
        //var globalVariableResolver = Container.createGlobalContextProcessor(window);
        var constantResolver = Container.createConstantValueResolver(expression.parameters, window);
        var parameterProcessor = Container.createParameterResolverVisitor();

        jsCodeTree = parameterProcessor.Visit(jsCodeTree, constantResolver);

        this.scopeContext.log({ event: "JSCodeExpressionResolved", data: jsCodeTree });
        var code2entity = Container.createCodeToEntityConverter(this.scopeContext);

        ///user provided query parameter object (specified as thisArg earlier) is passed in
        var entityExpression = code2entity.Visit(jsCodeTree, {  queryParameters: expression.parameters, lambdaParameters: this.lambdaTypes, frameType: context.frameType });

        ///parameters are referenced, ordered and named, also collected in a flat list of name value pairs
        var result = Container.createParametricQueryExpression(entityExpression, code2entity.parameters);
        this.scopeContext.log({ event: "EntityExpression", data: entityExpression });

        return result;
    },


    VisitFilterExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createFilterExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitProjectionExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createProjectionExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitOrderExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createOrderExpression(source, selector, expression.nodeType);
        }
        return expression;
    }
});$C('$data.Expressions.QueryParameterExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (name, index, value, type) {
        this.name = name;
        this.index = index;
        this.value = value;
        //TODO
        this.type = Container.getTypeName(value);
    },

    nodeType: { value: $data.Expressions.ExpressionType.QueryParameter, writable: false }
});$C('$data.Expressions.RepresentationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (kind) {
    },

    getMemberDefinition: function (name) {
        return this.entityType.getMemberDefinition(name);
    },

    nodeType: { value: $data.Expressions.ExpressionType.Entity }
});

$C('$data.Expressions.ServiceOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector, params, cfg) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityContextExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///<param name="params" type="$data.Array" />
        ///<param name="cfg" type="$data.Object" />
        ///</signature>
        Guard.requireType("source", source, [$data.Expressions.EntityContextExpression]);
        Guard.requireType("selector", source, [$data.Expressions.MemberInfoExpression]);

        Object.defineProperty(this, "source", { value: source, enumerable: true, writable: true });
        Object.defineProperty(this, "selector", { value: selector, enumerable: true, writable: true });
        Object.defineProperty(this, "params", { value: params, enumerable: true, writable: true });
        Object.defineProperty(this, "cfg", { value: cfg, enumerable: false, writable: true });
        
        function findContext() {
            //TODO: use source from function parameter and return a value at the end of the function
            var r = source;
            while (r) {
                if (r instanceof $data.Expressions.EntityContextExpression) {
                    return r;
                }
                r = r.source;
            }
        }

        var c = findContext();
        switch (true) {
            case this.source instanceof $data.Expressions.EntityContextExpression:
                this.elementType = cfg.elementType ? Container.resolveType(cfg.elementType) : Container.resolveType(cfg.returnType);
                this.storageModel = cfg.elementType ? c.instance._storageModel.getStorageModel(Container.resolveType(cfg.elementType)) : null;
                break;
            default:
                Guard.raise("Unknown source type for EntitySetExpression: " + this.source.getType().name);
        }

    },
    nodeType: { value: $data.Expressions.ExpressionType.ServiceOperation, enumerable: true }
});
$data.Class.define('$data.Validation.ValidationError', null, null, {
    constructor: function (message, propertyDefinition, type) {
        ///<param name="message" type="string" />
        ///<param name="propertyDefinition" type="$data.MemberDefinition" />

        this.Message = message;
        this.PropertyDefinition = propertyDefinition;
        this.Type = type;
    },
    Type: { dataType: 'string' },
    Message: { dataType: "string" },
    PropertyDefinition: { dataType: $data.MemberDefinition }
}, null);

$data.Class.define('$data.Validation.EntityValidationBase', null, null, {

    ValidateEntity: function (entity) {
        ///<param name="entity" type="$data.Entity" />
        return [];
    },

    ValidateEntityField: function (entity, memberDefinition) {
        ///<param name="entity" type="$data.Entity" />
        ///<param name="memberDefinition" type="$data.MemberDefinition" />
        return [];
    },

    getValidationValue: function (memberDefinition, validationName) {
        Guard.raise("Pure class");
    },
    getValidationMessage: function (memberDefinition, validationName, defaultMessage) {
        Guard.raise("Pure class");
    }

}, null);

$data.Validation = $data.Validation || {};
$data.Validation.Entity = new $data.Validation.EntityValidationBase();

$data.Class.define('$data.Validation.EntityValidation', $data.Validation.EntityValidationBase, null, {

    ValidateEntity: function (entity) {
        ///<param name="entity" type="$data.Entity" />

        var errors = [];
        entity.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            errors = errors.concat(this.ValidateEntityField(entity, memDef, undefined, true));
        }, this);
        return errors;
    },
    ValidateEntityField: function (entity, memberDefinition, newValue, valueNotSet) {
        ///<param name="entity" type="$data.Entity" />
        ///<param name="memberDefinition" type="$data.MemberDefinition" />
        var errors = [];
        var typeName = Container.resolveName(Container.resolveType(memberDefinition.dataType));
        var value = !valueNotSet ? newValue : entity[memberDefinition.name];
        this.fieldValidate(entity, memberDefinition, value, errors, typeName);
        return errors;
    },

    getValidationValue: function (memberDefinition, validationName) {
        if (memberDefinition[validationName] && memberDefinition[validationName].value)
            return memberDefinition[validationName].value;
        else
            return memberDefinition[validationName];
    },
    getValidationMessage: function (memberDefinition, validationName, defaultMessage) {
        var eMessage = defaultMessage;
        if (typeof memberDefinition[validationName] == "object" && memberDefinition[validationName].message)
            eMessage = memberDefinition[validationName].message;
        else if (memberDefinition.errorMessage)
            eMessage = memberDefinition.errorMessage;

        return eMessage;
    },
    createValidationError: function (memberDefinition, validationName, defaultMessage) {
        return new $data.Validation.ValidationError(this.getValidationMessage(memberDefinition, validationName, defaultMessage), memberDefinition, validationName);
    },

    supportedValidations: {
        value: {
            '$data.Number': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
                maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; }
            },
            '$data.Integer': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
                maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; }
            },
            '$data.String': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minLength: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length >= definedValue; },
                maxLength: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length <= definedValue; },
                length: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length == definedValue; },
                regex: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.match(definedValue); }
            },
            '$data.Date': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
                maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; }
            },
            '$data.Boolean':{
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; }
            },
            '$data.Array': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                length: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length == definedValue; }
            },
            '$data.Object': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; }
            }
        }
    },

    fieldValidate: function (entity, memberDefinition, value, errors, validationTypeName) {
        ///<param name="memberDefinition" type="$data.MemberDefinition" />
        ///<param name="value" type="Object" />
        ///<param name="errors" type="Array" />
        ///<param name="validationTypeName" type="string" />
        if ((entity.entityState == $data.EntityState.Modified && entity[memberDefinition.name] == undefined))
            return;

        var validatonGroup = this.supportedValidations[validationTypeName];
        if (validatonGroup) {
            var validations = Object.keys(validatonGroup);
            validations.forEach(function (validation) {
                if (memberDefinition[validation] && validatonGroup[validation] && !validatonGroup[validation].call(entity, value, this.getValidationValue(memberDefinition, validation)))
                    errors.push(this.createValidationError(memberDefinition, validation, 'Validation error!'));
            }, this);
        }
    }

}, null);

$data.Validation.Entity = new $data.Validation.EntityValidation();

$data.Class.define('$data.Notifications.ChangeDistributorBase', null, null, {
    distributeData: function (collectorData) {
        Guard.raise("Pure class");
    }
}, null);
$data.Class.define('$data.Notifications.ChangeCollectorBase', null, null, {
    buildData: function (entityContextData) {
        Guard.raise("Pure class");
    },
    processChangedData: function (entityData) {
        if (this.Distrbutor && this.Distrbutor.distributeData)
            this.Distrbutor.distributeData(this.buildData(entityData));
    },
    Distrbutor: { enumerable: false, dataType: $data.Notifications.ChangeDistributorBase, storeOnObject: true }
}, null);
$data.Class.define('$data.Notifications.ChangeDistributor', $data.Notifications.ChangeDistributorBase, null, {
    constructor: function (broadcastUrl) {
        this.broadcastUrl = broadcastUrl;
    },
    distributeData: function (data) {
        $data.ajax({
            url: this.broadcastUrl,
            type: "POST",
            data: 'data=' + JSON.stringify(data),
            succes: this.success,
            error: this.error
        });
    },
    broadcastUrl: { dataType: "string" },
    success: function () { },
    error: function () { }
}, null);
$data.Class.define('$data.Notifications.ChangeCollector', $data.Notifications.ChangeCollectorBase, null, {
    buildData: function (entities) {
        var result = [];
        entities.forEach(function (element) {
            var resObj = { entityState: element.data.entityState, typeName: element.data.getType().name };
            var enumerableMemDefCollection = [];

            switch (element.data.entityState) {
                case $data.EntityState.Added:
                    enumerableMemDefCollection = element.data.getType().memberDefinitions.getPublicMappedProperties();
                    break;
                case $data.EntityState.Modified:
                    enumerableMemDefCollection = element.data.changedProperties;
                    break;
                case $data.EntityState.Deleted:
                    enumerableMemDefCollection = element.data.getType().memberDefinitions.getKeyProperties();
                    break;
                default:
                    break;
            }

            enumerableMemDefCollection.forEach(function (memDef) {
                resObj[memDef.name] = element.data[memDef.name];
            });

            result.push(resObj);
        });

        return result;
    }
}, null);$data.Class.define('$data.Access', null, null, {}, {
    isAuthorized: function(access, user, roles, callback){
        console.log('isAuthorized', arguments);
        var error;
        
        if (!access) error = 'Access undefined';
        if (typeof access !== 'number') error = 'Invalid access type';
        if (!user) user = {}; //error = 'User undefined';
        if (!user.roles) user.roles = {}; //error = 'User has no roles';
        if (!roles) roles = {}; //error = 'Roles undefined';
        if (!(roles instanceof Array || typeof roles === 'object')) error = 'Invald roles type';
        
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        
        if (error){
            clbWrapper.error(error, 'Access authorization');
            return pHandlerResult;
        }
        
        if (user.roles instanceof Array){
            var r = {};
            for (var i = 0; i < user.roles.length; i++){
                if (typeof user.roles[i] === 'string') r[user.roles[i]] = true;
            }
            user.roles = r;
        }
        
        if (roles instanceof Array){
            var r = {};
            for (var i = 0; i < roles.length; i++){
                if (typeof roles[i] === 'string') r[roles[i]] = true;
            }
            roles = r;
        }
        
        var args = arguments;
        var readyFn = function(result){
            if (result) clbWrapper.success(result);
            else clbWrapper.error('Authorization failed', args);
        };
        
        var rolesKeys = Object.getOwnPropertyNames(roles);
        var i = 0;
        
        var callbackFn = function(result){
            if (result) readyFn(result);
        
            if (typeof roles[rolesKeys[i]] === 'boolean' && roles[rolesKeys[i]]){
                if (user.roles[rolesKeys[i]]) readyFn(true);
                else{
                    i++;
                    if (i < rolesKeys.length) callbackFn();
                    else readyFn(false);
                }
            }else if (typeof roles[rolesKeys[i]] === 'function'){
                var r = roles[rolesKeys[i]].call(user);
                
                if (typeof r === 'function') r.call(user, (i < rolesKeys.length ? callbackFn : readyFn));
                else{
                    if (r) readyFn(true);
                    else{
                        i++;
                        if (i < rolesKeys.length) callbackFn();
                        else readyFn(false);
                    }
                }
            }else if (typeof roles[rolesKeys[i]] === 'number'){
                if (((typeof user.roles[rolesKeys[i]] === 'number' && (user.roles[rolesKeys[i]] & access)) ||
                    (typeof user.roles[rolesKeys[i]] !== 'number' && user.roles[rolesKeys[i]])) &&
                    (roles[rolesKeys[i]] & access)) user.roles[rolesKeys[i]] &&  readyFn(true);
                else{
                    i++;
                    if (i < rolesKeys.length) callbackFn();
                    else readyFn(false);
                }
            }
        };
        
        callbackFn();
        
        return pHandlerResult;
    },
    None: 0,
    Create: 1,
    Read: 2,
    Update: 4,
    Delete: 8,
    Execute: 16
});
$data.Class.define('$data.Promise', null, null, {
    always: function () { Guard.raise(new Exception('$data.Promise.always', 'Not implemented!')); },
    done: function () { Guard.raise(new Exception('$data.Promise.done', 'Not implemented!')); },
    fail: function () { Guard.raise(new Exception('$data.Promise.fail', 'Not implemented!')); },
    isRejected: function () { Guard.raise(new Exception('$data.Promise.isRejected', 'Not implemented!')); },
    isResolved: function () { Guard.raise(new Exception('$data.Promise.isResolved', 'Not implemented!')); },
    //notify: function () { Guard.raise(new Exception('$data.Promise.notify', 'Not implemented!')); },
    //notifyWith: function () { Guard.raise(new Exception('$data.Promise.notifyWith', 'Not implemented!')); },
    pipe: function () { Guard.raise(new Exception('$data.Promise.pipe', 'Not implemented!')); },
    progress: function () { Guard.raise(new Exception('$data.Promise.progress', 'Not implemented!')); },
    promise: function () { Guard.raise(new Exception('$data.Promise.promise', 'Not implemented!')); },
    //reject: function () { Guard.raise(new Exception('$data.Promise.reject', 'Not implemented!')); },
    //rejectWith: function () { Guard.raise(new Exception('$data.Promise.rejectWith', 'Not implemented!')); },
    //resolve: function () { Guard.raise(new Exception('$data.Promise.resolve', 'Not implemented!')); },
    //resolveWith: function () { Guard.raise(new Exception('$data.Promise.resolveWith', 'Not implemented!')); },
    state: function () { Guard.raise(new Exception('$data.Promise.state', 'Not implemented!')); },
    then: function () { Guard.raise(new Exception('$data.Promise.then', 'Not implemented!')); }
}, null);

$data.Class.define('$data.PromiseHandlerBase', null, null, {
    constructor: function () { },
    createCallback: function (callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        return cbWrapper = {
            success: callBack.success,
            error: callBack.error,
            notify: callBack.notify
        };
    },
    getPromise: function () {
        return new $data.Promise();
    }
}, null);

$data.PromiseHandler = $data.PromiseHandlerBase;
var EventSubscriber = $data.Class.define("EventSubscriber", null, null, {
    constructor: function (handler, state, thisArg) {
        /// <param name="handler" type="Function">
        ///     <summary>event handler</summary>
        ///     <signature>
        ///         <param name="sender" type="$data.Entity" />
        ///         <param name="eventData" type="EventData" />
        ///         <param name="state" type="Object" />
        ///     </signature>
        /// </param>
        /// <param name="state" type="Object" optional="true">custom state object</param>
        /// <param name="thisArg" type="Object" optional="true">[i]this[/i] context for handler</param>
        ///
        /// <field name="handler" type="function($data.Entity sender, EventData eventData, Object state)">event handler</field>
        /// <field name="state" type="Object">custom state object</field>
        /// <field name="thisArg">[i]this[/i] context for handler</field>
        this.handler = handler;
        this.state = state;
        this.thisArg = thisArg;
    },
    handler: {},
    state: {},
    thisArg: {}
});

$data.Event = Event = $data.Class.define("$data.Event", null, null, {
    constructor: function (name, sender) {
        ///<param name="name" type="string">The name of the event</param>
        ///<param name="sender" type="Object">The originator/sender of the event. [this] in handlers will be set to this</param>
        var subscriberList = null;
        var parentObject = sender;

        function detachHandler(list, handler) {
            ///<param name="list" type="Array" elementType="EventSubscriber" />
            ///<param name="handler" type="Function" />
            list.forEach(function (item, index) {
                if (item.handler == handler) {
                    list.splice(index, 1);
                }
            });
        }

        this.attach = function (handler, state, thisArg) {
            ///<param name="handler" type="Function">
            ///<signature>
            ///<param name="sender" type="Object" />
            ///<param name="eventData" type="Object" />
            ///<param name="state" type="Object" />
            ///</signature>
            ///</param>
            ///<param name="state" type="Object" optional="true" />
            ///<param name="thisArg" type="Object" optional="true" />
            if (!subscriberList) {
                subscriberList = [];
            }
            subscriberList.push(new EventSubscriber(handler, state, thisArg || sender));
        };
        this.detach = function (handler) {
            detachHandler(subscriberList, handler);
        };
        this.fire = function (eventData, snder) {
            var snd = snder || sender || this;
            eventData.eventName = name;
            ///<value name="subscriberList type="Array" />
            if (subscriberList) {
                subscriberList.forEach(function (subscriber) {
                    ///<param name="subscriber" type="EventSubscriber" />
                    subscriber.handler.call(subscriber.thisArg, snd, eventData, subscriber.state);
                });
            }
        };
    }
});


var eventData = $data.Class.define("EventData", null, null, {
    eventName: {}
});

var PropertyChangeEventData = $data.Class.define("PropertyChangeEventData", EventData, null, {
    constructor: function (propertyName, oldValue, newValue) {
        this.propertyName = propertyName;
        this.oldValue = oldValue;
        this.newValue = newValue;
    },
    propertyName: {},
    oldValue: {},
    newValue: {}
});

var PropertyValidationEventData = $data.Class.define("PropertyValidationEventData", EventData, null, {
    constructor: function (propertyName, oldValue, newValue, errors) {
        this.propertyName = propertyName;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.errors = errors;
        this.cancel = false;
    },
    propertyName: {},
    oldValue: {},
    newValue: {},
    errors: {},
    cancel: {}
});

$data.Entity = Entity = $data.Class.define("$data.Entity", null, null, {
    constructor: function (initData) {
        /// <description>
        ///     This class provide a light weight, object-relational interface between 
        ///     your javascript code and database.
        /// </description>
        ///
        /// <signature>
        ///     <param name="initData" type="Object">initialization data</param>
        ///     <example>
        ///         var category = new $news.Types.Category({ Title: 'Tech' });
        ///         $news.context.Categories.add(category);
        ///     </example>
        /// </signature>
        ///
        /// <field name="initData" type="Object">initialization data</field>
        /// <field name="context" type="$data.EntityContext"></field>
        /// <field name="propertyChanging" type="$data.Event"></field>
        /// <field name="propertyChanged" type="$data.Event"></field>
        /// <field name="propertyValidationError" type="$data.Event"></field>
        /// <field name="isValidated" type="Boolean">Determines the current $data.Entity is validated.</field>
        /// <field name="ValidationErrors" type="Array">array of $data.Validation.ValidationError</field>
        /// <field name="ValidationErrors" type="Array">array of MemberDefinition</field>
        /// <field name="entityState" type="Integer"></field>
        /// <field name="changedProperties" type="Array">array of MemberDefinition</field>

        //this.initData = {};
        if (this.getType().__copyPropertiesToInstance) {
            $data.typeSystem.writePropertyValues(this);
        }

        Object.defineProperty(this, 'initData', { enumerable: false, configurable: true, writable: true, value: {} });
        //this.initData = {};
        var ctx = null;
        Object.defineProperty(this, 'context', { enumerable: false, configurable: false, get: function () { return ctx; }, set: function (value) { ctx = value; } });
        //this.context = ctx;
        if (arguments.length == 1 && typeof initData === "object") {
            var typeMemDefs = this.getType().memberDefinitions;
            var memDefNames = typeMemDefs.getPublicMappedPropertyNames();//.map(function (memDef) { return memDef.name; });
//            if (Object.keys(initData).every(function (key) { return memDefNames.indexOf(key) != -1; })) {
//                this.initData = initData;
//            }
            this.initData = {};
            for (var i in initData){
                if (memDefNames.indexOf(i) > -1){
                    this.initData[i] = Container.resolveType(typeMemDefs.getMember(i).type) === $data.Date && typeof initData[i] === 'string' ? new Date(initData[i]) : initData[i];
                }
            }
            
            this.changedProperties = undefined;
            this.entityState = undefined;
        }
    },
    //initData: { enumerable: false, configurable: true, writable: true },
    //context: { enumerable: false, configurable: false, get: function () { return ctx; }, set: function (value) { ctx = value; } },
    toString: function () {
        /// <summary>Returns a string that represents the current $data.Entity</summary>
        /// <returns type="String"/>

        return this.getType().fullName + "(" + (this.Id || this.Name || '') + ")"
    },
    toJSON: function () {
        /// <summary>Creates pure JSON object from $data.Entity.</summary>
        /// <returns type="Object">JSON representation</returns>

        var result = {};
        var self = this;
        this.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            result[memDef.name] = self[memDef.name];
        });
        return result;
    },
    equals: function (entity) {
        /// <summary>Determines whether the specified $data.Entity is equal to the current $data.Entity.</summary>
        /// <returns type="Boolean">[b]true[/b] if the specified $data.Entity is equal to the current $data.Entity; otherwise, [b]false[/b].</returns>

        if (entity.getType() !== this.getType()) {
            return false;
        }
        var entityPk = this.getType().memberDefinitions.getKeyProperties();
        for (var i = 0; i < entityPk.length; i++) {
            if (this[entityPk[i].name] == entity[entityPk[i].name]) {
                return true;
            }
        }
        return false;
    },
    //propertyChanging: { dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false },

    //propertyChanged: { dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false },
    propertyChanging: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            var member = 'propertyChanging';
            var memDef = this.getType().memberDefinitions.getMember(member);

            if (memDef) {
                delete this[member];
                delete memDef.get;
                delete memDef.set;
                Object.defineProperty(this, member, memDef.createPropertyDescriptor());
                this[member] = new Event(member, this);
                return this[member];
            }
        },
        set: function () { }
    },
    propertyChanged: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            var member = 'propertyChanged';
            var memDef = this.getType().memberDefinitions.getMember(member);

            if (memDef) {
                delete this[member];
                delete memDef.get;
                delete memDef.set;
                Object.defineProperty(this, member, memDef.createPropertyDescriptor());
                this[member] = new Event(member, this);
                return this[member];
            }
        },
        set: function () { }
    },
    propertyValidationError: {
        dataType: $data.Event, storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, prototypeProperty: true,
        get: function () {
            var member = 'propertyValidationError';
            var memDef = this.getType().memberDefinitions.getMember(member);

            if (memDef) {
                delete this[member];
                delete memDef.get;
                delete memDef.set;
                Object.defineProperty(this, member, memDef.createPropertyDescriptor());
                this[member] = new Event(member, this);
                return this[member];
            }
        },
        set: function () { }
    },

    // protected
    storeProperty: function (memberDefinition, value) {
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="value" />

        //if (origValue == value) return;
        var eventData = null;
        if (memberDefinition.monitorChanges != false && (this._propertyChanging || this._propertyChanged || "instancePropertyChanged" in this.constructor)) {
            var origValue = this[memberDefinition.name];
            eventData = new PropertyChangeEventData(memberDefinition.name, origValue, value);
            if (this._propertyChanging)
                this.propertyChanging.fire(eventData);
        }

        if (memberDefinition.monitorChanges != false && (this._propertyValidationError || "instancePropertyValidationError" in this.constructor)) {
            var errors = $data.Validation.Entity.ValidateEntityField(this, memberDefinition, value);
            if (errors.length > 0) {
                var origValue = this[memberDefinition.name];
                var errorEventData = new PropertyValidationEventData(memberDefinition.name, origValue, value, errors);

                if (this._propertyValidationError)
                    this.propertyValidationError.fire(errorEventData);
                if ("instancePropertyValidationError" in this.constructor)
                    this.constructor["instancePropertyValidationError"].fire(errorEventData, this);

                if (errorEventData.cancel == true)
                    return;
            }
        }

        if (memberDefinition.storeOnObject == true) {
            //TODO refactor to Base.getBackingFieldName
            var backingFieldName = "_" + memberDefinition.name;
            if (!this[backingFieldName]) {
                Object.defineProperty(this, backingFieldName, memberDefinition.createStorePropertyDescriptor(value));
            }
            else {
                this[backingFieldName] = value;
            }
        } else {
            this.initData[memberDefinition.name] = value;
        }
        this.isValidated = false;

        if (memberDefinition.monitorChanges != false && this.entityState == $data.EntityState.Unchanged)
            this.entityState = $data.EntityState.Modified;

        if (memberDefinition.monitorChanges != false) {
            if (!this.changedProperties) {
                this.changedProperties = [];
            }

            if (!this.changedProperties.some(function (memDef) { return memDef.name == memberDefinition.name }))
                this.changedProperties.push(memberDefinition);

            if (this._propertyChanged)
                this.propertyChanged.fire(eventData);

            //TODO mixin framework
            if ("instancePropertyChanged" in this.constructor) {
                this.constructor["instancePropertyChanged"].fire(eventData, this);
            }
        }
    },

    // protected
    retrieveProperty: function (memberDefinition) {
        /// <param name="memberDefinition" type="MemberDefinition" />

        if (memberDefinition.storeOnObject == true) {
            //TODO refactor to Base.getBackingFieldName
            var backingFieldName = "_" + memberDefinition.name;
            return this[backingFieldName];
        } else {
            return this.initData[memberDefinition.name];
        }
    },

    // protected
    getProperty: function (memberDefinition, callback) {
        /// <summary>Retrieve value of member</summary>
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="callback" type="Function">
        ///     <signature>
        ///         <param name="value" />
        ///     </signature>
        /// </param>
        /// <returns>value associated for [i]memberDefinition[/i]</returns>

        if (this[memberDefinition.name] != undefined) {
            callback(this[memberDefinition.name]);
            return;
        }

        if (!this.context)
            Guard.raise(new Exception('Entity not in context', 'Invalid operation'));

        return this.context.loadItemProperty(this, memberDefinition, callback);
    },
    // protected
    setProperty: function (memberDefinition, value, callback) {
        /// <param name="memberDefinition" type="MemberDefinition" />
        /// <param name="value" />
        /// <param name="callback" type="Function">done</param>
        this[memberDefinition.name] = value;
        callback();
    },

    isValid: function () {
        /// <summary>Determines the current $data.Entity is validated and valid.</summary>
        /// <returns type="Boolean" />

        if (!this.isValidated) {
            this.ValidationErrors = $data.Validation.Entity.ValidateEntity(this);
            this.isValidated = true;
        }
        return this.ValidationErrors.length == 0;
    },
    isValidated: { dataType: "bool", storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false, value: false },
    ValidationErrors: {
        dataType: Array,
        elementType: $data.Validation.ValidationError,
        storeOnObject: true,
        monitorChanges: false,
        notMapped: true,
        enumerable: false
    },

    resetChanges: function () {
        /// <summary>reset changes</summary>

        delete this._changedProperties;
    },

    changedProperties: {
        dataType: Array,
        elementType: window["MemberDefinition"],
        storeOnObject: true,
        monitorChanges: false,
        notMapped: true,
        enumerable: false
    },
    entityState: { dataType: "integer", storeOnObject: true, monitorChanges: false, notMapped: true, enumerable: false }/*,
    toJSON: function () {
        if (this.context) {
            var itemType = this.getType();
            var storageModel = this.context._storageModel[itemType.name];
            var o = new Object();
            for (var property in this) {
                if (typeof this[property] !== "function") {
                    var excludedFields = storageModel.Associations.every(function (association) {
                        return association.FromPropertyName == property && (association.FromMultiplicity == "0..1" || association.FromMultiplicity == "1");
                    }, this);
                    if (!excludedFields) {
                        o[property] = this[property];
                    }
                }
            }
            return o;
        }
        return this;
    }   */
}, {
    //create get_[property] and set_[property] functions for properties
    __setPropertyfunctions: { value: true, notMapped: true, enumerable: false, storeOnObject: true },
    //copy public properties to current instance
    __copyPropertiesToInstance: { value: false, notMapped: true, enumerable: false, storeOnObject: true }
});

$data.Class.define('$data.StorageModel', null, null, {
    constructor: function () {
        ///<field name="LogicalType" type="$data.Entity">User defined type</field>
        this.ComplexTypes = [];
        this.Associations = [];
    },
    LogicalType: {},
    LogicalTypeName: {},
    PhysicalType: {},
    PhysicalTypeName: {},
    EventHandlers: {},
    Roles: {},
    TableName: {},
    ComplexTypes: {},
    Associations: {},
    EntitySetReference: {}
}, null);
$data.Class.define('$data.Association', null, null, {
    constructor: function (initParam) {
        if (initParam) {
            this.From = initParam.From;
            this.FromType = initParam.FromType;
            this.FromMultiplicity = initParam.FromMultiplicity;
            this.FromPropertyName = initParam.FromPropertyName;
            this.To = initParam.To;
            this.ToType = initParam.ToType;
            this.ToMultiplicity = initParam.ToMultiplicity;
            this.ToPropertyName = initParam.ToPropertyName;
        }
    },
    From: {},
    FromType: {},
    FromMultiplicity: {},
    FromPropertyName: {},
    To: {},
    ToType: {},
    ToMultiplicity: {},
    ToPropertyName: {},
    ReferentialConstraint: {}
}, null);
$data.Class.define('$data.ComplexType', $data.Association, null, {}, null);

$data.Class.define('$data.EntityContext', null, null,
{
    constructor: function (storageProviderCfg, user){
        /// <description>Provides facilities for querying and working with entity data as objects.</description>
        ///<param name="storageProviderCfg" type="Object">Storage provider specific configuration object.</param>

        //Initialize properties
        this.lazyLoad = false;
        this.trackChanges = false;
        this._entitySetReferences = {};
        this._storageModel = [];

        var ctx = this;
        this._storageModel.getStorageModel = function (typeName) {
            var resolvedType = Container.resolveType(typeName);
            return ctx._storageModel.filter(function (s) { return s.LogicalType === resolvedType; })[0];
        };
        if (typeof storageProviderCfg.name === 'string') {
            var tmp = storageProviderCfg.name;
            storageProviderCfg.name = [tmp];
        }
        var i = 0, providerType;
        var providerList = [].concat(storageProviderCfg.name);
        var callBack = $data.typeSystem.createCallbackSetting({ success: this._successInitProvider });
        $data.StorageProviderLoader.load(providerList, {
            success: function (providerType) {
                ctx.storageProvider = new providerType(storageProviderCfg, ctx);
                ctx.storageProvider.setContext(ctx);
                ctx.stateManager = new $data.EntityStateManager(ctx);

                if (storageProviderCfg.name in ctx.getType()._storageModelCache) {
                    ctx._storageModel = ctx.getType()._storageModelCache[storageProviderCfg.name];
                } else {
                    ctx._initializeStorageModel();
                    ctx.getType()._storageModelCache[storageProviderCfg.name] = ctx._storageModel;
                }

                ctx._initializeEntitySets(ctx.constructor);
                ctx._user = (storageProviderCfg && storageProviderCfg.user) || user;

                ctx._isOK = false;
                if (ctx.storageProvider) {
                    ctx.storageProvider.initializeStore(callBack);
                }
            },
            error: function () {
                callBack.error('Provider fallback failed!');
            }
        });
        /*
        while (!(providerType = $data.StorageProviderBase.getProvider(storageProviderCfg.name[i])) && i < storageProviderCfg.name.length) i++;
        if (providerType){
            this.storageProvider = new providerType(storageProviderCfg, this);
            this.storageProvider.setContext(this);
            this.stateManager = new $data.EntityStateManager(this);

            if (storageProviderCfg.name in this.getType()._storageModelCache){
                this._storageModel = this.getType()._storageModelCache[storageProviderCfg.name];
            }else{
                this._initializeStorageModel();
                this.getType()._storageModelCache[storageProviderCfg.name] = this._storageModel;
            }
        }else{
            Guard.raise(new Exception("Provider fallback failed!", "Not Found"));
        }
        this._initializeEntitySets(this.constructor);
        this._user = (storageProviderCfg && storageProviderCfg.user) || user;

        this._isOK = false;
        var callBack = $data.typeSystem.createCallbackSetting({ success: this._successInitProvider });
        if (this.storageProvider){
            this.storageProvider.initializeStore(callBack);
        }
        */
    },
    getDataType: function (dataType) {
        // Obsolate
        if (typeof dataType == "string") {
            var memDef_dataType = this[dataType];
            if (memDef_dataType === undefined || memDef_dataType === null) { memDef_dataType = eval(dataType); }
            return memDef_dataType;
        }
        return dataType;
    },
    _initializeEntitySets: function (ctor) {
        if (ctor.inheritsFrom !== null && ctor.inheritsFrom !== undefined) {
            this._initializeEntitySets(ctor.inheritsFrom);
        }
        //this._storageModel.forEach(function (storageModel) {
        for (var i = 0, l = this._storageModel.length; i < l; i++){
            var storageModel = this._storageModel[i];
            this[storageModel.ItemName] = new $data.EntitySet(storageModel.LogicalType, this, storageModel.ItemName, storageModel.EventHandlers, storageModel.Roles);
            var sm = this[storageModel.ItemName];
            sm.name = storageModel.ItemName;
            sm.tableName = storageModel.TableName;
            sm.eventHandlers = storageModel.EventHandlers;
            this._entitySetReferences[storageModel.LogicalType.name] = sm;

            storageModel.EntitySetReference = sm;
        }
        //}, this);
    },
    _initializeStorageModel: function () {

        this.getType().memberDefinitions.asArray().forEach(function (item) {
            if ('dataType' in item) {
                var itemResolvedDataType = Container.resolveType(item.dataType);
                if (itemResolvedDataType && itemResolvedDataType.isAssignableTo && itemResolvedDataType.isAssignableTo($data.EntitySet)) {
                    var storageModel = new $data.StorageModel();
                    storageModel.TableName = item.tableName || item.name;
                    storageModel.ItemName = item.name;
                    storageModel.LogicalType = Container.resolveType(item.elementType);
                    storageModel.LogicalTypeName = storageModel.LogicalType.name;
                    storageModel.PhysicalTypeName = $data.EntityContext._convertLogicalTypeNameToPhysical(storageModel.LogicalTypeName);
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeCreate = item.beforeCreate;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeRead = item.beforeRead;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeUpdate = item.beforeUpdate;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeDelete = item.beforeDelete;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterCreate = item.afterCreate;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterRead = item.afterRead;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterUpdate = item.afterUpdate;
                    }
                    if (item.beforeCreate){
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterDelete = item.afterDelete;
                    }
                    var roles = item.roles;
                    var r = {};
                    if (roles instanceof Array){
                        for (var i = 0; i < roles.length; i++){
                            if (typeof roles[i] === 'string') r[roles[i]] = true;
                        }
                    }else r = roles;
                    storageModel.Roles = r;
                    this._storageModel.push(storageModel);
                }
            }
        }, this);

        if (typeof intellisense !== 'undefined')
            return;

        this._storageModel.forEach(function (storageModel) {
            ///<param name="storageModel" type="$data.StorageModel">Storage model item</param>
            var dbEntityInstanceDefinition = {};

            storageModel.Associations = storageModel.Associations || [];
            storageModel.ComplexTypes = storageModel.ComplexTypes || [];
            storageModel.LogicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
                ///<param name="memDef" type="MemberDefinition">Member definition instance</param>

                var memDefResolvedDataType = Container.resolveType(memDef.dataType);

                if ((this.storageProvider.supportedDataTypes.indexOf(memDefResolvedDataType) > -1) && Object.isNullOrUndefined(memDef.inverseProperty)) {
                    //copy member definition
                    var t = JSON.parse(JSON.stringify(memDef));
                    //change datatype to resolved type
                    t.dataType = memDefResolvedDataType;
                    dbEntityInstanceDefinition[memDef.name] = t;
                    return;
                }

                this._buildDbType_navigationPropertyComplite(memDef, memDefResolvedDataType, storageModel);



                //var memDef_dataType = this.getDataType(memDef.dataType);
                if ((memDefResolvedDataType === $data.Array || (memDefResolvedDataType.isAssignableTo && memDefResolvedDataType.isAssignableTo($data.EntitySet))) && (memDef.inverseProperty && memDef.inverseProperty !== '$$unbound')) {
                    this._buildDbType_Collection_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                } else {
                    if (memDef.inverseProperty) {
                        if (memDef.inverseProperty === '$$unbound') {
                            //member definition is navigation but not back reference
                            if (memDefResolvedDataType === $data.Array) {
                                this._buildDbType_Collection_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                            } else {
                                this._buildDbType_ElementType_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                            }
                        } else {
                            //member definition is navigation property one..one or one..many case
                            var fields = memDefResolvedDataType.memberDefinitions.getMember(memDef.inverseProperty);
                            if (fields) {
                                if (fields.elementType) {
                                    //member definition is one..many connection
                                    var referealResolvedType = Container.resolveType(fields.elementType);
                                    if (referealResolvedType === storageModel.LogicalType) {
                                        this._buildDbType_ElementType_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                                    } else {
                                        if (typeof intellisense === 'undefined') {
                                            Guard.raise(new Exception('Inverse property not valid, refereed item element type not match: ' + storageModel.LogicalTypeName, ', property: ' + memDef.name));
                                        }
                                    }
                                } else {
                                    //member definition is one..one connection
                                    this._buildDbType_ElementType_OneOneDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                                }
                            } else {
                                if (typeof intellisense === 'undefined') {
                                    Guard.raise(new Exception('Inverse property not valid'));
                                }
                            }
                        }
                    } else {
                        //member definition is a complex type
                        this._buildDbType_addComplexTypePropertyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                    }
                }
            }, this);
            this._buildDbType_modifyInstanceDefinition(dbEntityInstanceDefinition, storageModel, this);
            var dbEntityClassDefinition = {};
            dbEntityClassDefinition.convertTo = this._buildDbType_generateConvertToFunction(storageModel, this);
            this._buildDbType_modifyClassDefinition(dbEntityClassDefinition, storageModel, this);

            //create physical type
            storageModel.PhysicalType = $data.Class.define(storageModel.PhysicalTypeName, $data.Entity, null, dbEntityInstanceDefinition, dbEntityClassDefinition);
        }, this);
    },
    _buildDbType_navigationPropertyComplite: function (memDef, memDefResolvedDataType, storageModel) {
        if (!memDef.inverseProperty) {
            var refMemDefs = null;
            if (memDefResolvedDataType === $data.Array || (memDefResolvedDataType.isAssignableTo && memDefResolvedDataType.isAssignableTo($data.EntitySet))) {
                var refStorageModel = this._storageModel.getStorageModel(Container.resolveType(memDef.elementType));
                if (refStorageModel) {
                    refMemDefs = refStorageModel.LogicalType.memberDefinitions.getPublicMappedProperties().filter(function (m) {
                        return ((m.inverseProperty == memDef.name) && (Container.resolveType(m.dataType) === Container.resolveType(storageModel.LogicalType)))
                    });
                }
            } else {
                var refStorageModel = this._storageModel.getStorageModel(memDefResolvedDataType);
                if (refStorageModel) {
                    refMemDefs = refStorageModel.LogicalType.memberDefinitions.getPublicMappedProperties().filter(function (m) {
                        if (m.elementType) {
                            return ((m.inverseProperty == memDef.name) && (Container.resolveType(m.elementType) === storageModel.LogicalType))
                        } else {
                            return ((m.inverseProperty == memDef.name) && (Container.resolveType(m.dataType) === storageModel.LogicalType))
                        }

                    });
                }
            }
            if (refMemDefs) {
                if (refMemDefs.length > 1) {
                    if (typeof intellisense !== 'undefined') {
                        Guard.raise(new Exception('More than one inverse property refer to this member definition: ' + memDef.name + ', type: ' + Container.resolveName(storageModel.LogicalType)));
                    }
                }
                var refMemDef = refMemDefs.pop();
                if (refMemDef) {
                    memDef.inverseProperty = refMemDef.name;
                }
            }
        } else {
            var refStorageModel = null;
            if (memDefResolvedDataType === $data.Array || (memDefResolvedDataType.isAssignableTo && memDefResolvedDataType.isAssignableTo($data.EntitySet))) {
                refStorageModel = this._storageModel.getStorageModel(Container.resolveType(memDef.elementType));

            } else {
                refStorageModel = this._storageModel.getStorageModel(memDefResolvedDataType);
            }

            var p = refStorageModel.LogicalType.memberDefinitions.getMember(memDef.inverseProperty);
            if (p) {
                if (p.inverseProperty) {
                    if (p.inverseProperty != memDef.name) {
                        if (typeof intellisense === 'undefined') {
                            Guard.raise(new Exception('Inverse property mismatch'));
                        }
                    }
                } else {
                    p.inverseProperty = memDef.name;
                }
            }

        }
    },
    _buildDbType_generateConvertToFunction: function (storageModel) { return function (instance) { return instance; }; },
    _buildDbType_modifyInstanceDefinition: function (instanceDefinition, storageModel) { return; },
    _buildDbType_modifyClassDefinition: function (classDefinition, storageModel) { return; },
    _buildDbType_addComplexTypePropertyDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name, $data.MemberTypes.complexProperty);
        var complexType = this._createComplexElement(storageModel.LogicalType, "", memDef.name, memDef_dataType, "", "");
        storageModel.ComplexTypes[memDef.name] = complexType;
        storageModel.ComplexTypes.push(complexType);
    },
    _buildDbType_Collection_OneManyDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        var refereedType = Container.resolveType(memDef.elementType);
        if (refereedType === undefined || refereedType === null) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("Element type definition error", "Field definition", memDef));
            }
        }
        var refereedStorageModel = this._storageModel.filter(function (s) { return s.LogicalType === refereedType; })[0];
        if (!refereedStorageModel) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("No EntitySet definition for the following element type", "Field definition", memDef));
            }
        }

        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name);
        var associationType = memDef.inverseProperty === '$$unbound' ? '$$unbound' : '0..1';
        var association = this._addAssociationElement(storageModel.LogicalType, associationType, memDef.name, refereedStorageModel.LogicalType, "*", memDef.inverseProperty);
        storageModel.Associations[memDef.name] = association;
        storageModel.Associations.push(association);
    },
    _buildDbType_ElementType_OneManyDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        var refereedType = Container.resolveType(memDef.dataType);
        if (refereedType === undefined || refereedType === null) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("Element type definition error", "Field definition", memDef));
            }
        }
        var refereedStorageModel = this._storageModel.filter(function (s) { return s.LogicalType === refereedType; })[0];
        if (!refereedStorageModel) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("No EntitySet definition for the following element type", "Field definition", memDef));
            }
        }

        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name);
        var associationType = memDef.inverseProperty === '$$unbound' ? '$$unbound' : '*';
        var association = this._addAssociationElement(storageModel.LogicalType, associationType, memDef.name, refereedStorageModel.LogicalType, "0..1", memDef.inverseProperty);
        storageModel.Associations[memDef.name] = association;
        storageModel.Associations.push(association);
    },
    _buildDbType_ElementType_OneOneDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        var refereedType = Container.resolveType(memDef.dataType);
        if (refereedType === undefined || refereedType === null) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("Element type definition error", "Field definition", memDef));
            }
        }
        var refereedStorageModel = this._storageModel.filter(function (s) { return s.LogicalType === refereedType; })[0];
        if (!refereedStorageModel) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("No EntitySet definition following element type", "Field definition", memDef));
            }
        }

        var refereedMemberDefinition = refereedStorageModel.LogicalType.memberDefinitions.getMember(memDef.inverseProperty);
        if (!refereedMemberDefinition.required && !memDef.required) { if (typeof intellisense === 'undefined') { if (typeof intellisense === 'undefined') { Guard.raise(new Exception('In one to one connection, one side must required!', 'One to One connection', memDef)); } } }

        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name);

        association = this._addAssociationElement(storageModel.LogicalType,
                                                 memDef.required ? "0..1" : "1",
                                                 memDef.name,
                                                 refereedStorageModel.LogicalType,
                                                 memDef.required ? "1" : "0..1",
                                                 memDef.inverseProperty);
        storageModel.Associations[memDef.name] = association;
        storageModel.Associations.push(association);
    },
    _addNavigationPropertyDefinition: function (definition, member, associationName, kind) {
        var t = JSON.parse(JSON.stringify(member));
        t.dataType = $data.EntitySet;
        t.notMapped = true;
        t.kind = kind ? kind : $data.MemberTypes.navProperty;
        t.association = associationName;
        definition[member.name] = t;
    },
    _addAssociationElement: function (fromType, fromMultiplicity, fromPropName, toType, toMultiplicity, toPropName) {
        return new $data.Association({
            From: fromType.name,
            FromType: fromType,
            FromMultiplicity: fromMultiplicity,
            FromPropertyName: fromPropName,
            To: toType.name,
            ToType: toType,
            ToMultiplicity: toMultiplicity,
            ReferentialConstraint: [],
            ToPropertyName: toPropName
        });
    },
    _createComplexElement: function (fromType, fromMultiplicity, fromPropName, toType, toMultiplicity, toPropName) {
        return new $data.ComplexType({
            From: fromType.name,
            FromType: fromType,
            FromMultiplicity: fromMultiplicity,
            FromPropertyName: fromPropName,
            To: toType.name,
            ToType: toType,
            ToMultiplicity: toMultiplicity,
            ReferentialConstraint: [],
            ToPropertyName: toPropName
        });
    },

    _successInitProvider: function (result) {
        if (result != undefined && result._isOK != undefined) {
            result._isOK = true;
            if (result.onReadyFunction) {
                result.onReadyFunction(result);
            }
        }

    },
    onReady: function (fn) {
        /// <signature>
        ///     <summary>
        ///         Sets the callback function to be called when the initialization of the EntityContext has successfully finished.
        ///     </summary>
        ///     <param name="successCallback" type="Function">
        ///         <summary>Success callback</summary>
        ///         <param name="entityContext" type="$data.EntityContext">Current entityContext object</param>
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>
        ///         Sets the callback functions to be called when the initialization of the EntityContext has finished.
        ///     </summary>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        var pHandler = new $data.PromiseHandler();
        var callBack = pHandler.createCallback(fn);
        this.onReadyFunction = callBack.success;
        if (this._isOK) {
            callBack.success(this);
        }
        return pHandler.getPromise();
    },
    getEntitySetFromElementType: function (elementType) {
        /// <signature>
        ///     <summary>Gets the matching EntitySet for an element type.</summary>
        ///     <param name="elementType" type="Function" />
        ///     <returns type="$data.EntitySet" />
        /// </signature>
        /// <signature>
        ///     <summary>Gets the matching EntitySet for an element type.</summary>
        ///     <param name="elementType" type="String" />
        ///     <returns type="$data.EntitySet" />
        /// </signature>
        var result = this._entitySetReferences[elementType];
        if (!result) {
            try {
                result = this._entitySetReferences[eval(elementType).name];
            } catch (ex) { }
        }
        return result;
    },
    executeQuery: function (queryable, callBack) {
        var query = new $data.Query(queryable.expression, queryable.defaultType, this);
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var that = this;
        var clbWrapper = {};
        clbWrapper.success = function (query) {
            query.buildResultSet(that);
            var successResult;
            
            if (query.expression.nodeType === $data.Expressions.ExpressionType.Single ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Count ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Some ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Every) {
                if (query.result.length !== 1) {
                    callBack.error(new Exception('result count failed'));
                    return;
                }

                successResult = query.result[0];
            } else if (query.expression.nodeType === $data.Expressions.ExpressionType.First) {
                if (query.result.length === 0) {
                    callBack.error(new Exception('result count failed'));
                    return;
                }

                successResult = query.result[0];
            } else {
                successResult = query.result;
            }
            
            var readyFn = function(){
                callBack.success(successResult);
            };
            
            var i = 0;
            var sets = query.getEntitySets();
            
            var callbackFn = function(){
                var es = sets[i];
                if (es.afterRead){
                    i++;
                    var r = es.afterRead.call(this, successResult, sets, query);
                    if (typeof r === 'function'){
                        r.call(this, i < sets.length ? callbackFn : readyFn, successResult, sets, query);
                    }else{
                        if (i < sets.length){
                            callbackFn();
                        }else readyFn();
                    }
                }else readyFn();
            }
            
            if (sets.length) callbackFn();
            else readyFn();
        };
        
        clbWrapper.error = callBack.error;
        var sets = query.getEntitySets();
        
        var ex = true;
        var wait = false;
        var ctx = this;
        
        var readyFn = function(cancel){
            if (cancel === false) ex = false;
            
            if (ex) ctx.storageProvider.executeQuery(query, clbWrapper);
            else{
                query.rawDataList = [];
                query.result = [];
                clbWrapper.success(query);
            }
        };
        
        var i = 0;
        var callbackFn = function(cancel){
            if (cancel === false) ex = false;
            
            var es = sets[i];
            if (es.beforeRead){
                i++;
                var r = es.beforeRead.call(this, sets, query);
                if (typeof r === 'function'){
                    r.call(this, (i < sets.length && ex) ? callbackFn : readyFn, sets, query);
                }else{
                    if (r === false) ex = false;
                    
                    if (i < sets.length && ex){
                        callbackFn();
                    }else readyFn();
                }
            }else readyFn();
        };
        
        if (sets.length) callbackFn();
        else readyFn();
    },
    saveChanges: function (callback) {
        /// <signature>
        ///     <summary>
        ///         Saves the changes made to the context.
        ///     </summary>
        ///     <param name="successCallback" type="Function">
        ///         <summary>Success callback</summary>
        ///         <param name="entityContext" type="$data.EntityContext">Current entityContext object</param>
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>
        ///         Saves the changes made to the context.
        ///     </summary>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        var changedEntities = [];
        var trackedEntities = this.stateManager.trackedEntities;
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();

        var skipItems = [];
        while (trackedEntities.length > 0) {
            var additionalEntities = [];
            trackedEntities.forEach(function (entityCachedItem) {
                var sModel = this._storageModel.getStorageModel(entityCachedItem.data.getType());
                if (entityCachedItem.data.entityState == $data.EntityState.Unchanged) {
                    entityCachedItem.skipSave = true;
                    skipItems.push(entityCachedItem.data);
                } else {
                    if (entityCachedItem.data.entityState == $data.EntityState.Modified) {
                        if (entityCachedItem.data.changedProperties) {
                            var changeStoredProperty = entityCachedItem.data.changedProperties.some(function (p) {
                                var pMemDef = sModel.PhysicalType.memberDefinitions.getMember(p.name);
                                if (pMemDef.kind == $data.MemberTypes.navProperty) {
                                    var a = sModel.Associations[pMemDef.association];
                                    var multiplicity = a.FromMultiplicity + a.ToMultiplicity;
                                    return ((multiplicity == '*0..1') || (multiplicity == '0..11'))
                                }
                                return true;
                            });
                            if (!changeStoredProperty) {
                                entityCachedItem.skipSave = true;
                                skipItems.push(entityCachedItem.data);
                            }
                        }
                    }
                }

                var navigationProperties = sModel.PhysicalType.memberDefinitions.asArray().filter(function (p) { return p.kind == $data.MemberTypes.navProperty; });
                navigationProperties.forEach(function (navProp) {
                    var association = sModel.Associations[navProp.name]; //eg.:"Profile"
                    var name = navProp.name; //eg.: "Profile"
                    var navPropertyName = association.ToPropertyName; //eg.: User

                    var connectedDataList = [].concat(entityCachedItem.data[name]);
                    connectedDataList.forEach(function (data) {
                        if (data) {
                            var value = data[navPropertyName];
                            var associationType = association.FromMultiplicity + association.ToMultiplicity;
                            if (association.FromMultiplicity === '$$unbound') {
                                if (data instanceof $data.Array) {
                                    entityCachedItem.dependentOn = entityCachedItem.dependentOn || [];
                                    data.forEach(function (dataItem) {
                                        if ((entityCachedItem.dependentOn.indexOf(data) < 0) && (data.skipSave !== true)) {
                                            entityCachedItem.dependentOn.push(data);
                                        }
                                    }, this);
                                } else {
                                    entityCachedItem.dependentOn = entityCachedItem.dependentOn || [];
                                    if ((entityCachedItem.dependentOn.indexOf(data) < 0) && (data.skipSave !== true)) {
                                        entityCachedItem.dependentOn.push(data);
                                    }
                                }
                            } else {
                                switch (associationType) {
                                    case "*0..1": //Array
                                        if (value) {
                                            if (value instanceof Array) {
                                                if (value.indexOf(entityCachedItem.data) == -1) {
                                                    value.push(entityCachedItem.data);
                                                }
                                            } else {
                                                if (typeof intellisense === 'undefined') {
                                                    Guard.raise("Item must be array or subtype of array");
                                                }
                                            }
                                        } else {
                                            data[navPropertyName] = [entityCachedItem.data];
                                        }
                                        break;
                                    default: //Item
                                        if (value) {
                                            if (value !== entityCachedItem.data) {
                                                if (typeof intellisense === 'undefined') {
                                                    Guard.raise("Integrity check error! Item assigned to another entity!");
                                                }
                                            }
                                        } else {
                                            data[navPropertyName] = entityCachedItem.data; //set back reference for live object
                                        }
                                        break;
                                }
                                switch (associationType) {
                                    case "*0..1":
                                    case "0..11":
                                        entityCachedItem.dependentOn = entityCachedItem.dependentOn || [];
                                        if ((entityCachedItem.dependentOn.indexOf(data) < 0) && (data.skipSave !== true)) {
                                            entityCachedItem.dependentOn.push(data);
                                        }
                                        break;
                                }
                            }
                            if (!data.entityState) {
                                data.entityState = $data.EntityState.Added;
                            }
                            if (additionalEntities.indexOf(data) == -1) {
                                additionalEntities.push(data);
                            }
                        }
                    }, this);
                }, this);
            }, this);

            trackedEntities.forEach(function (entity) {
                if (entity.skipSave !== true) { changedEntities.push(entity); }
            });

            trackedEntities = [];
            additionalEntities.forEach(function (item) {
                if (!skipItems.some(function (entity) { return entity == item; })) {
                    if (!changedEntities.some(function (entity) { return entity.data == item; })) {
                        trackedEntities.push({ data: item, entitySet: this.getEntitySetFromElementType(item.getType().name) });
                    }
                }
            }, this);
        }


        changedEntities.forEach(function (d) {
            if (d.dependentOn) {
                var temp = [];
                for (var i = 0; i < d.dependentOn.length; i++) {
                    if (skipItems.indexOf(d.dependentOn[i]) < 0) {
                        temp.push(d.dependentOn[i]);
                    }
                }
                d.dependentOn = temp;
            }
        });
        skipItems = null;
        var ctx = this;
        if (changedEntities.length == 0) { clbWrapper.success(0); return pHandlerResult; }

        //validate entities
        var errors = [];
        changedEntities.forEach(function (entity) {
            if (entity.data.entityState === $data.EntityState.Added) {
                entity.data.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
                    if (memDef.required && !memDef.computed && !entity.data[memDef.name]) entity.data[memDef.name] = Container.getDefault(memDef.dataType);
                }, this);
            }
            if ((entity.data.entityState != $data.EntityState.Added || entity.data.entityState != $data.EntityState.Modified)
                && !entity.data.isValid()) {
                errors.push({ item: entity.data, errors: entity.data.ValidationErrors });
            }
        });
        if (errors.length > 0) {
            clbWrapper.error(errors);
            return pHandlerResult;
        }
        
        var eventData = {};
        for (var i = 0; i < changedEntities.length; i++){
            var it = changedEntities[i];
            var n = it.entitySet.elementType.name;
            var es = this._entitySetReferences[n];
            if (es.beforeCreate || es.beforeUpdate || es.beforeDelete){
                if (!eventData[n]) eventData[n] = {};
                
                switch (it.data.entityState){
                    case $data.EntityState.Added:
                        if (es.beforeCreate){
                            if (!eventData[n].createAll) eventData[n].createAll = [];
                            eventData[n].createAll.push(it);
                        }
                        break;
                    case $data.EntityState.Modified:
                        if (es.beforeUpdate){
                            if (!eventData[n].modifyAll) eventData[n].modifyAll = [];
                            eventData[n].modifyAll.push(it);
                        }
                        break;
                    case $data.EntityState.Deleted:
                        if (es.beforeDelete){
                            if (!eventData[n].deleteAll) eventData[n].deleteAll = [];
                            eventData[n].deleteAll.push(it);
                        }
                        break;
                }
            }
        }
        
        var readyFn = function(cancel){
            if (cancel){
                cancelEvent = 'async';
                changedEntities.length = 0;
            }
            
            if (changedEntities.length){
                //console.log('changedEntities: ', changedEntities.map(function(it){ return it.data.initData; }));
                ctx.storageProvider.saveChanges({
                    success: function () {
                        ctx._postProcessSavedItems(clbWrapper, changedEntities);
                    },
                    error: clbWrapper.error
                }, changedEntities);
            }else clbWrapper.success(0);
            
            /*else if (cancelEvent) clbWrapper.error(new $data.Exception('saveChanges cancelled from event [' + cancelEvent + ']'));
            else Guard.raise('No changed entities');*/
        };
        
        var cancelEvent;
        var ies = Object.getOwnPropertyNames(eventData);
        var i = 0;
        var cmd = ['beforeUpdate', 'beforeDelete', 'beforeCreate'];
        var cmdAll = {
            beforeCreate: 'createAll',
            beforeDelete: 'deleteAll',
            beforeUpdate: 'modifyAll'
        };
        
        var callbackFn = function(cancel){
            if (cancel){
                cancelEvent = 'async';
                changedEntities.length = 0;
            }
        
            var es = ctx._entitySetReferences[ies[i]];
            var c = cmd.pop();
            var ed = eventData[ies[i]];
            var all = ed[cmdAll[c]];
            
            if (all){
                var m = all.map(function(it){ return it.data; });
                if (!cmd.length){
                    cmd = ['beforeUpdate', 'beforeDelete', 'beforeCreate'];
                    i++;
                }
                
                var r = es[c].call(ctx, m);
                if (typeof r === 'function'){
                    r.call(ctx, (i < ies.length && !cancelEvent) ? callbackFn : readyFn, m);
                }else if (r === false){
                    cancelEvent = (es.name + '.' + c);
                    all.forEach(function(it){
                        var ix = changedEntities.indexOf(it);
                        changedEntities.splice(ix, 1);
                    });
                    
                    readyFn();
                }else{
                    if (i < ies.length && !cancelEvent) callbackFn();
                    else readyFn();
                }
            }else{
                if (!cmd.length){
                    cmd = ['beforeUpdate', 'beforeDelete', 'beforeCreate'];
                    i++;
                }
                
                if (i < ies.length && !cancelEvent) callbackFn();
                else readyFn();
            }
        };
        
        if (i < ies.length) callbackFn();
        else readyFn();
        
        return pHandlerResult;
    },
    prepareRequest: function () { },
    _postProcessSavedItems: function (callBack, changedEntities) {
        if (this.ChangeCollector && this.ChangeCollector instanceof $data.Notifications.ChangeCollectorBase)
            this.ChangeCollector.processChangedData(changedEntities);

        var eventData = {};
        var ctx = this;
        changedEntities.forEach(function (entity) {
            var oes = entity.data.entityState;
            
            entity.data.entityState = $data.EntityState.Unchanged;
            entity.data.changedProperties = [];
            entity.physicalData = undefined;
            
            var n = entity.entitySet.elementType.name;
            var es = ctx._entitySetReferences[n];
            if (es.afterCreate || es.afterUpdate || es.afterDelete){
                if (!eventData[n]) eventData[n] = {};
                    
                switch (oes){
                    case $data.EntityState.Added:
                        if (es.afterCreate){
                            if (!eventData[n].createAll) eventData[n].createAll = [];
                            eventData[n].createAll.push(entity);
                        }
                        break;
                    case $data.EntityState.Modified:
                        if (es.afterUpdate){
                            if (!eventData[n].modifyAll) eventData[n].modifyAll = [];
                            eventData[n].modifyAll.push(entity);
                        }
                        break;
                    case $data.EntityState.Deleted:
                        if (es.afterDelete){
                            if (!eventData[n].deleteAll) eventData[n].deleteAll = [];
                            eventData[n].deleteAll.push(entity);
                        }
                        break;
                }
            }
        });
        
        var ies = Object.getOwnPropertyNames(eventData);
        var i = 0;
        var ctx = this;
        var cmd = ['afterUpdate', 'afterDelete', 'afterCreate'];
        var cmdAll = {
            afterCreate: 'createAll',
            afterDelete: 'deleteAll',
            afterUpdate: 'modifyAll'
        };
        
        var readyFn = function(){
            if (!ctx.trackChanges) {
                ctx.stateManager.reset();
            }
            
            callBack.success(changedEntities.length);
        };
        
        var callbackFn = function(){
            var es = ctx._entitySetReferences[ies[i]];
            var c = cmd.pop();
            var ed = eventData[ies[i]];
            var all = ed[cmdAll[c]];
            if (all){
                var m = all.map(function(it){ return it.data; });
                if (!cmd.length){
                    cmd = ['afterUpdate', 'afterDelete', 'afterCreate'];
                    i++;
                }
                
                var r = es[c].call(ctx, m);
                if (typeof r === 'function'){
                    r.call(ctx, i < ies.length ? callbackFn : readyFn, m);
                }else{
                    if (i < ies.length) callbackFn();
                    else readyFn();
                }
            }else{
                if (!cmd.length){
                    cmd = ['afterUpdate', 'afterDelete', 'afterCreate'];
                    i++;
                }
                
                if (i < ies.length) callbackFn();
                else readyFn();
            }
        };
        
        if (i < ies.length) callbackFn();
        else readyFn();
    },
    forEachEntitySet: function (fn, ctx) {
        /// <summary>
        ///     Iterates over the entity sets' of current EntityContext.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     <param name="entitySet" type="$data.EntitySet" />
        /// </param>
        /// <param name="ctx">'this' argument for the 'fn' function.</param>
        for (var entitySetName in this._entitySetReferences) {
            var actualEntitySet = this._entitySetReferences[entitySetName];
            fn.call(ctx, actualEntitySet);
        }
    },

    loadItemProperty: function (entity, property, callback) {
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="String">Property name</param>
        ///     <param name="callback" type="Function">
        ///         <summary>C  allback function</summary>
        ///         <param name="propertyValue" />
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="String">Property name</param>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="MemberDefinition">Property definition</param>
        ///     <param name="callback" type="Function">
        ///         <summary>Callback function</summary>
        ///         <param name="propertyValue" />
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="MemberDefinition">Property definition</param>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        Guard.requireType('entity', entity, $data.Entity);

        var memberDefinition = typeof property === 'string' ? entity.getType().memberDefinitions.getMember(property) : property;

        if (entity[memberDefinition.name] != undefined) {
            var pHandler = new $data.PromiseHandler();
            callBack = pHandler.createCallback(callback);
            callback.success(entity[memberDefinition.name]);
            return pHandler.getPromise();
        }

        var isSingleSide = true;
        var storageModel = this._storageModel.getStorageModel(entity.getType().fullName);
        var elementType = Container.resolveType(memberDefinition.dataType);
        if (elementType === $data.Array || (elementType.isAssignableTo && elementType.isAssignableTo($data.EntitySet))) {
            elementType = Container.resolveType(memberDefinition.elementType);

            isSingleSide = false;

        } else {
            var associations = storageModel.Associations.filter(function (assoc) { return assoc.FromPropertyName == memberDefinition.name; })[0];
            if (associations && associations.FromMultiplicity === "0..1" && associations.ToMultiplicity === "1")
                isSingleSide = false;
        }

        if (isSingleSide === true) {
            //singleSide

            var filterFunc = "function (e) { return";
            var filterParams = {};
            storageModel.LogicalType.memberDefinitions.getKeyProperties().forEach(function (memDefKey, index) {
                if (index > 0)
                    filterFunc += ' &&';
                filterFunc += " e." + memDefKey.name + " == this.key" + index;
                filterParams['key' + index] = entity[memDefKey.name];
            });
            filterFunc += "; }"

            return storageModel.EntitySetReference
                .map('function (e) { return e.' + memberDefinition.name + ' }')
                .single(filterFunc, filterParams, callback);
        } else {
            //multipleSide

            var filterFunc = "function (e) { return"
            var filterParams = {};
            storageModel.LogicalType.memberDefinitions.getKeyProperties().forEach(function (memDefKey, index) {
                if (index > 0)
                    filterFunc += ' &&';
                filterFunc += " e." + memberDefinition.inverseProperty + "." + memDefKey.name + " == this.key" + index;
                filterParams['key' + index] = entity[memDefKey.name];
            });
            filterFunc += "; }"

            var entitySet = this.getEntitySetFromElementType(elementType);
            return entitySet
                .filter(filterFunc, filterParams)
                .toArray(callback);
        }

    },

    getTraceString: function (queryable) {
        /// <summary>
        /// Returns a trace string. Used for debugging purposes!
        /// </summary>
        /// <param name="queryable" type="$data.Queryable" />
        /// <returns>Trace string</returns>
        var query = new $data.Query(queryable.expression, queryable.defaultType, this);
        return this.storageProvider.getTraceString(query);
    },
    log: function (logInfo) {
        //noop as do nothing
    },

    resolveBinaryOperator: function (operator, expression, frameType) {
        return this.storageProvider.resolveBinaryOperator(operator, expression, frameType);
    },
    resolveUnaryOperator: function (operator, expression, frameType) {
        return this.storageProvider.resolveUnaryOperator(operator, expression, frameType);
    },
    resolveFieldOperation: function (operation, expression, frameType) {
        return this.storageProvider.resolveFieldOperation(operation, expression, frameType);
    },
    resolveSetOperations: function (operation, expression, frameType) {
        return this.storageProvider.resolveSetOperations(operation, expression, frameType);
    },
    _generateServiceOperationQueryable: function (functionName, returnEntitySet, arg, parameters) {
        if(typeof console !== 'undefined' && console.log)
            console.log('Obsolate: _generateServiceOperationQueryable, $data.EntityContext');

        var params = [];
        for (var i = 0; i < parameters.length; i++) {
            var obj = {};
            obj[parameters[i]] = Container.resolveType(Container.getTypeName(arg[i]));
            params.push(obj);
        }

        var tempOperation = $data.EntityContext.generateServiceOperation({ serviceName: functionName, returnType: $data.Queryable, elementType: this[returnEntitySet].elementType, params: params });
        return tempOperation.apply(this, arg);
    },
    attach: function (entity) {
        /// <summary>
        ///     Attaches an entity to its matching entity set.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the attached entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.attach(entity);
    },
    attachOrGet: function (entity) {
        /// <summary>
        ///     Attaches an entity to its matching entity set, or returns if it's already attached.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.attachOrGet(entity);
    },
    add: function (entity) {
        /// <summary>
        ///     Adds a new entity to its matching entity set.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the added entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.add(entity);
    },
    remove: function (entity) {
        /// <summary>
        ///     Removes an entity from its matching entity set.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the removed entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.remove(entity);
    }
}, {
    generateServiceOperation: function (cfg) {

        var fn;
        if (cfg.serviceMethod) {
            var returnType = cfg.returnType ? Container.resolveType(cfg.returnType) : {};
            if (returnType.isAssignableTo && returnType.isAssignableTo($data.Queryable)) {
                fn = cfg.serviceMethod;
            } else {
                fn = function () {
                    var lastParam = arguments[arguments.length - 1];

                    var pHandler = new $data.PromiseHandler();
                    var cbWrapper;

                    var args = arguments;
                    if (typeof lastParam === 'function') {
                        cbWrapper = pHandler.createCallback(lastParam);
                        arguments[arguments.length - 1] = cbWrapper;
                    } else {
                        cbWrapper = pHandler.createCallback();
                        arguments.push(cbWrapper);
                    }

                    try {
                        var result = cfg.serviceMethod.apply(this, arguments);
                        if (result !== undefined)
                            cbWrapper.success(result);
                    } catch (e) {
                        cbWrapper.error(e);
                    }

                    return pHandler.getPromise();
                }
            }

        } else {
            fn = function () {

                var virtualEntitySet = cfg.elementType ? this.getEntitySetFromElementType(Container.resolveType(cfg.elementType)) : null;

                var paramConstExpression = null;
                if (cfg.params) {
                    paramConstExpression = [];
                    for (var i = 0; i < cfg.params.length; i++) {
                        //TODO: check params type
                        for (var name in cfg.params[i]) {
                            paramConstExpression.push(Container.createConstantExpression(arguments[i], Container.resolveType(cfg.params[i][name]), name));
                        }
                    }
                }

                var ec = Container.createEntityContextExpression(this);
                var memberdef = this.getType().getMemberDefinition(cfg.serviceName);
                var es = Container.createServiceOperationExpression(ec,
                        Container.createMemberInfoExpression(memberdef),
                        paramConstExpression,
                        cfg);

                //Get callback function
                var clb = arguments[arguments.length - 1];
                if (typeof clb !== 'function') {
                    clb = undefined;
                }

                if (virtualEntitySet) {
                    var q = Container.createQueryable(virtualEntitySet, es);
                    if (clb) {
                        es.isTerminated = true;
                        return q._runQuery(clb);
                    }
                    return q;
                }
                else {
                    var returnType = Container.resolveType(cfg.returnType);

                    var q = Container.createQueryable(this, es);
                    q.defaultType = returnType;

                    if (returnType === $data.Queryable) {
                        q.defaultType = Container.resolveType(cfg.elementType);
                        if (clb) {
                            es.isTerminated = true;
                            return q._runQuery(clb);
                        }
                        return q;
                    }
                    es.isTerminated = true;
                    return q._runQuery(clb);
                }
            };
        };

        var params = [];
        if (cfg.params) {
            for (var i = 0; i < cfg.params.length; i++) {
                var param = cfg.params[i];
                for (var name in param)
                {
                    params.push({
                        name: name,
                        type: param[name]
                    });
                }
            }
        }
        $data.typeSystem.extend(fn, cfg, { params: params });

        return fn;
    },
    _convertLogicalTypeNameToPhysical: function (name) {
        return name + '_$db$';
    },
    _storageModelCache: {
        get: function () {
            if (!this.__storageModelCache)
                this.__storageModelCache = {};
            return this.__storageModelCache;
        },
        set: function () {
            //todo exception
        }
    }
});
$data.Class.define('$data.QueryProvider', null, null,
{
    //TODO: instance member?????
    constructor: function () { this.requiresExpressions= false },
    executeQuery: function (queryable, resultHandler) {
    },
    getTraceString: function (queryable) {
    }
}, null);$data.Class.define('$data.ModelBinder', null, null, {

    constructor: function(context){
        this.context = context;
        this.cache = {};
    },

    call: function (data, meta) {
        if (!Object.getOwnPropertyNames(meta).length) {
            return data;
        }
        var data = data;
		if (meta.$type){
			var type = Container.resolveName(meta.$type);
            var converter = this.context.storageProvider.fieldConverter.fromDb[type];
			var result = converter ? converter() : new (Container.resolveType(meta.$type))(); //Container['create' + Container.resolveType(meta.$type).name]();
		}

        if (meta.$selector){
			var metaSelector = meta.$selector;
			if (!(metaSelector instanceof Array)){
				metaSelector = [metaSelector];
			}

			var i = 0;
			var part;
			while (i < metaSelector.length){
				part = data;
				var selector = metaSelector[i];
				var type = selector.split(':');
				switch (type[0]){
					case 'json':
						var path = type[1].split('.');
						while (path.length) {
						    if (typeof part[path[0]] === 'undefined') {
								if (i === metaSelector.length){
									return undefined;
								}else if (path.length){
									break;
								}
							}else{
								part = part[path[0]];
								path = path.slice(1);
								if (part === null) return part;
							}
						}
						if (!path.length){
							i = metaSelector.length;
						}
						break;
					case 'css':
					case 'xml':
						if (part.querySelector){
							part = part[meta.$item ? 'querySelectorAll' : 'querySelector'](type[1]);
						}else{
							part = $(part).find(type[1]);
							if (!meta.$item) part = part[0];
						}
						break;
				}
				i++;
			}

			data = part;
			if (!data){
				return data;
			}
        }

		if (meta.$value){
			if (typeof meta.$value === 'function'){
				result = meta.$value.call(meta, meta, data);
            }else if (meta.$type){
                var type = Container.resolveName(meta.$type);
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                result = converter ? converter(meta.$value) : new (Container.resolveType(meta.$type))(meta.$value); //Container['create' + Container.resolveType(meta.$type).name](meta.$value);
            }else result = meta.$value;
        }else if (meta.$source){
            if (meta.$type){
                var type = Container.resolveName(meta.$type);
                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                result = converter ? converter(data[meta.$source]) : new (Container.resolveType(meta.$type))(data[meta.$source]); //Container['create' + Container.resolveType(meta.$type).name](data[meta.$source]);
            }else result = (meta.$source.split(':')[0] == 'attr' && data.getAttribute) ? data.getAttribute(meta.$source.split(':')[1]) : (meta.$source == 'textContent' && !data[meta.$source] ? $(data).text() : data[meta.$source]);
        }else if (meta.$item){
            for (var i = 0; i < data.length; i++){
                var r = this.call(data[i], meta.$item);
                result.push(r);
            }
        }else{
            var key = '';
            if (meta.$keys){
                for (var j = 0; j < meta.$keys.length; j++) { key += (meta.$type + '_' + meta.$keys[j] + '#' + data[meta.$keys[j]]); }
                if (!this.cache[key]){
                    for (var j in meta){
                        if (j.indexOf('$') < 0){
                            if (!meta[j].$item) {
                                if (meta[j].$type || meta[j].$source) { result[j] = this.call(data, meta[j]); }
                                else if (meta.$type) {
                                    var type = Container.resolveName(meta.$type.memberDefinitions.getMember(j).type);
                                    var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                                    result[j] = converter ? converter(data[meta[j]]) : new (Container.resolveType(meta.$type.memberDefinitions.getMember(j).type))(data[meta[j]]); //Container['create' + Container.resolveType(meta.$type.memberDefinitions.getMember(j).type).name](data[meta[j]]);
                                } else { result[j] = meta[j].$source ? data[meta[j].$source] : data[meta[j]]; }
                            } else { result[j] = this.call(data, meta[j]); }
                        }
                    }
                    this.cache[key] = result;
                }else{
                    result = this.cache[key];
                    for (var j in meta){
                        if (j.indexOf('$') < 0){
                            if (meta[j].$item) { result[j].push(this.call(data, meta[j].$item)); }
                        }
                    }
                }
            }else{
                for (var j in meta){
                    if (j.indexOf('$') < 0){
                        if (!meta[j].$item) {
                            if (meta[j].$type || meta[j].$source) { result[j] = this.call(data, meta[j]); }
                            else if (meta.$type) {
                                var type = Container.resolveName(Container.resolveType(meta.$type).memberDefinitions.getMember(j).type);
                                var converter = this.context.storageProvider.fieldConverter.fromDb[type];
                                result[j] = converter ? converter(data[meta[j]]) : new (Container.resolveType(meta.$type.memberDefinitions.getMember(j).type))(data[meta[j]]); //Container['create' + Container.resolveType(meta.$type.memberDefinitions.getMember(j).type).name](data[meta[j]]);
                            } else { result[j] = meta[j].$source ? data[meta[j].$source] : data[meta[j]]; }
                        } else { result[j] = this.call(data, meta[j]); }
                    }
                }
            }
        }

        return result;
    }
});
$C('$data.queryBuilder', null, null, {
    constructor: function () {
        this._fragments = {};
        this.selectedFragment = null;
        this._binderConfig = {};
        this.modelBinderConfig = this._binderConfig;
        this._binderConfigPropertyStack = [];
    },
    selectTextPart: function (name) {
        if (!this._fragments[name]) {
            this._fragments[name] = { text: '', params: [] };
        }
        this.selectedFragment = this._fragments[name];
    },
    getTextPart: function (name) {
        return this._fragments[name];
    },
    addText: function (textParticle) {
        this.selectedFragment.text += textParticle;
    },
    addParameter: function (param) {
        this.selectedFragment.params.push(param);
    },
    selectModelBinderProperty: function (name) {
        this._binderConfigPropertyStack.push(this.modelBinderConfig);
        if (!(name in this.modelBinderConfig)) {
            this.modelBinderConfig[name] = {};
        }
        this.modelBinderConfig = this.modelBinderConfig[name];
    },
    popModelBinderProperty: function () {
        if (this._binderConfigPropertyStack.length === 0) {
            this.modelBinderConfig = this._binderConfig();
        } else {
            this.modelBinderConfig = this._binderConfigPropertyStack.pop();
        }
    },
    resetModelBinderProperty: function (name) {
        this._binderConfigPropertyStack = [];
        this.modelBinderConfig = this._binderConfig;
    },
    addKeyField: function (name) {
        if(!this.modelBinderConfig['$keys']){
            this.modelBinderConfig['$keys'] = new Array();
        }
        this.modelBinderConfig['$keys'].push(name);
    }
});
$C('$data.Query', null, null,
{
    constructor: function (expression, defaultType, context) {
        ///<param name="context" type="$data.EntityContext" />
        ///<field name="expression" type="$data.Expressions.ExpressionNode" />
        ///<field name="context" type="$data.EntityContext" />
        Object.defineProperty(this, "expression", { value: expression, enumerable: true });
        Object.defineProperty(this, "context", { value: context, enumerable: true });
        //TODO: expressions get as JSON string?!
        
        this.expressions = expression;
        this.defaultType = defaultType;
        this.result = [];
        this.rawDataList = [];
        this.modelBinderConfig = {};
        this.context = context;
    },
        
    rawDataList: { dataType: "Array" },
    result: { dataType: "Array" },
    resultType: {},
    buildResultSet: function (ctx) {
        var converter = new $data.ModelBinder(this.context);
        this.result = converter.call(this.rawDataList, this.modelBinderConfig);
        return;
    },
    getEntitySets: function(){
        var ret = [];
        var ctx = this.context;
        
        var fn = function(expression){
            if (expression instanceof $data.Expressions.EntitySetExpression){
                if (ret.indexOf(ctx._entitySetReferences[expression.elementType.name]) < 0)
                    ret.push(ctx._entitySetReferences[expression.elementType.name]);
            }
            if (expression.source) fn(expression.source);
        };
        
        fn(this.expression);
        
        return ret;
    }
}, null);
$data.Class.define('$data.Queryable', null, null,
{
    constructor: function (source, rootExpression) {
        ///	<signature>
        /// <summary>Provides a base class for classes supporting JavaScript Language Query.</summary>
        /// <description>Provides a base class for classes supporting JavaScript Language Query.</description>
        /// <param name="source" type="$data.EntitySet" />
        /// <param name="rootExpression" type="$data.Expressions.ExpressionNode"></param>
        ///	</signature>
        ///	<signature>
        /// <summary>Provides a base class for classes supporting JavaScript Language Query.</summary>
        /// <description>Provides a base class for classes supporting JavaScript Language Query.</description>
        /// <param name="source" type="$data.EntityContext" />
        /// <param name="rootExpression" type="$data.Expressions.ExpressionNode"></param>
        ///	</signature>

        var context = source instanceof $data.EntityContext ? source : source.entityContext;
        this.defaultType = source instanceof $data.EntityContext ? null : source.defaultType;
        Object.defineProperty(this, "entityContext", { value: context, writable: false, enumerable: true });
        this.expression = rootExpression;
    },

    filter: function (predicate, thisArg) {
        ///<summary>Filters a set of entities using a boolean expression.</summary>
        ///<param name="predicate" type="Function">A boolean query expression</param>
        ///<param name="thisArg" type="Object">The query parameters</param>
        ///<returns type="$data.Queryable" />
        ///<signature>
        ///<summary>Filters a set of entities using a boolean expression formulated as string.</summary>
        ///<param name="predicate" type="string">
        ///The expression body of the predicate function in string. &#10;
        ///To reference the lambda parameter use the 'it' context variable. &#10;
        ///Example: filter("it.Title == 'Hello'")
        ///</param>
        ///<param name="thisArg" type="Object" />
        ///<returns type="$data.Queryable" />
        ///</signature>
        ///<signature>
        ///<summary>Filters a set of entities using a bool expression formulated as a JavaScript function.</summary>
        ///<param name="predicate" type="Function">
        ///</param>
        ///<param name="thisArg" type="Object" optional="true">
        ///Contains the predicate parameters
        ///</param>
        ///<returns type="$data.Queryable" />
        ///<example>
        ///Filtering a set of entities with a predicate function&#10;
        ///var males = Persons.filter( function( person ) { return person.Gender == 'Male' } );
        ///</example>
        ///<example>
        ///Filtering a set of entities with a predicate function and parameters&#10;
        ///var draftables = Persons.filter( function( person ) {
        ///     return person.Gender == this.gender &amp;&amp; person.Age &gt; this.age
        /// }, { gender: 'Male',  age: 21 });
        ///</example>
        ///<example>
        ///Filtering a set of entities with a predicate as a string and parameters&#10;
        ///var draftables = Persons.filter("it.Gender == this.gender &amp;&amp;  it.Age &gt; this.age",
        /// { gender: 'Male',  age: 21 });
        ///</example>
        ///</signature>

        this._checkOperation('filter');
        var expression = Container.createCodeExpression(predicate, thisArg);
        var expressionSource = this.expression;
        if (this.expression instanceof $data.Expressions.FilterExpression) {
            expressionSource = this.expression.source;

            var operatorResolution = this.entityContext.storageProvider.resolveBinaryOperator("and");
            expression = Container.createSimpleBinaryExpression(this.expression.selector, expression, "and", "filter", "boolean", operatorResolution);
        }
        var exp = Container.createFilterExpression(expressionSource, expression);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    where: function (predicate, params) {
        ///<summary>Where is a convenience alias for C# developers. Use filter instead.</summary>
		///<returns type="$data.Queryable" />
        return this.filter(predicate, params);
    },

    map: function (projection, thisArg) {
		///	<summary>Map specifies the shape or type of each returned element. You can specify whether your results will consist of complete Person objects, just one member, a subset of members, or some completely different result type based on a computation or new object creation. When map produces something other than a copy of the source element, the operation is called a projection. The use of projections to transform data is a powerful capability of JavaScript Language Query expressions.</summary>
        ///	<param name="projection" type="Function">A projection expression</param>
        ///	<param name="thisArg" type="Object">The query parameters</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Map specifies the shape or type of each returned element. You can specify whether your results will consist of complete Person objects, just one member, a subset of members, or some completely different result type based on a computation or new object creation. When map produces something other than a copy of the source element, the operation is called a projection. The use of projections to transform data is a powerful capability of JavaScript Language Query expressions.</summary>
        ///		<param name="projection" type="string">
        ///			The expression body of the projection function in string. &#10;
		///			To reference the lambda parameter use the 'it' context variable. &#10;
		///			Example: map("{ i: it.Id, t: it.Title }")
        ///		</param>
        ///		<param name="thisArg" type="Object" />
        ///		<returns type="$data.Queryable" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Map specifies the shape or type of each returned element. You can specify whether your results will consist of complete Person objects, just one member, a subset of members, or some completely different result type based on a computation or new object creation. When map produces something other than a copy of the source element, the operation is called a projection. The use of projections to transform data is a powerful capability of JavaScript Language Query expressions.</summary>
        ///		<param name="projection" type="Function">
        ///			Projection function to specify the shape or type of each returned element.
        ///		</param>
        ///		<param name="thisArg" type="Object" optional="true">
        ///			Contains the projection parameters.
        ///		</param>
        ///		<returns type="$data.Queryable" />
        ///		<example>
		///			Projection to get an array of the full name property of a set of Person entities&#10;
        ///			var personFullNames = Persons.map( function( person ) { return person.FullName; } );
        ///		</example>
        ///		<example>
		///			Projection to get an array of the required fields of Person entities in an anonymous type.&#10;
        ///			var custom = Persons.map( function( person ) {
        ///				return { FullName: person.FullName, Info: { Address: person.Location.Address, Phone: person.Phone } };
        ///			});
        ///		</example>
        ///	</signature>

        this._checkOperation('map');
        var codeExpression = Container.createCodeExpression(projection, thisArg);
        var exp = Container.createProjectionExpression(this.expression, codeExpression);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    select: function (projection, thisArg) {
		///<summary>Select is a convenience alias for C# developers. Use map instead.</summary>
		///<returns type="$data.Queryable" />
        return this.map(projection, thisArg);
    },

    length: function (onResult) {
		///	<summary>Returns the number of entities (or projected object) in a query as the callback parameter.</summary>
        ///	<param name="onResult" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Returns the number of entities (or projected object) in a query as the callback parameter.</summary>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Returns the number of entities (or projected object) in a query as the callback parameter.</summary>
        ///		<param name="onResult" type="Object">
        ///			Object of callback functions to handle success and error. &#10;
		///			Example: { success: function(cnt) { ... }, error: function() { alert("Something went wrong..."); } }
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get the count of Person entities. &#10;
        ///			Persons.length( function( cnt ) { alert("There are " + cnt + " person(s) in the database."); } );
        ///		</example>
        ///	</signature>

        this._checkOperation('length');
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var countExpression = Container.createCountExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(countExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }
		
        return pHandler.getPromise();
    },
	count: function (onResult) {
		///<summary>Count is a convenience alias for C# developers. Use length instead.</summary>
		///<returns type="$data.Integer" />
        return this.length(onResult);
    },

    forEach: function (iterator) {
		///	<summary>Calls the iterator function for all entity (or projected object) in the query.</summary>
        ///	<param name="iterator" type="Function">Iterator function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Calls the iterator function for all entity (or projected object) in the query.</summary>
        ///		<param name="iterator" type="Function">
        ///			Iterator function to handle the result elements.
        ///		</param>
        ///		<returns type="$data.Promise" />
		///		<example>
		///			Log the full name of each Person. &#10;
        ///			Persons.forEach( function( person ) { console.log(person.FullName; } );
        ///		</example>
        ///	</signature>

        this._checkOperation('forEach');
        var pHandler = new $data.PromiseHandler();
        function iteratorFunc(items) { items.forEach(iterator); }
        var cbWrapper = pHandler.createCallback(iteratorFunc);

        var forEachExpression = Container.createForEachExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(forEachExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    toArray: function (onResult_items) {
		///	<summary>Returns the query result as the callback parameter.</summary>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Returns the query result as the callback parameter.</summary>
        ///		<param name="onResult_items" type="Function">
        ///			The callback function to handle the result.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Returns the query result as the callback parameter.</summary>
        ///		<param name="onResult_items" type="Object">
        ///			Object of callback functions to handle success and error. &#10;
		///			Example: { success: function(result) { ... }, error: function() { alert("Something went wrong..."); } }
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get all Person entities. &#10;
        ///			Persons.toArray( function( result ) { console.dir(result); } );
        ///		</example>
        ///	</signature>

        if (onResult_items instanceof $data.Array)
        {
            return this.toArray(function (results) {
                onResult_items.length = 0;
                results.forEach(function (item, idx) {
                    onResult_items.push(item);
                });
            });
        }

        this._checkOperation('toArray');
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult_items);

        var toArrayExpression = Container.createToArrayExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(toArrayExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    single: function (filterPredicate, thisArg, onResult) {
		///	<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
		///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
		///		<param name="filterPredicate" type="string">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
		///		<param name="filterPredicate" type="Function">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get "George" from the Person entity set. &#10;
        ///			Persons.single( function( person ) { return person.FirstName == this.name; }, { name: "George" }, {&#10;
		///				success: function ( result ){ ... },&#10;
		///				error: function () { ... }
		///			});
        ///		</example>
        ///	</signature>

        this._checkOperation('single');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(2);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var singleExpression = Container.createSingleExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(singleExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    some: function (filterPredicate, thisArg, onResult) {
        ///	<summary>Filters a set of entities using a boolean expression and returns true if the query has any result element.</summary>
        ///	<param name="filterPredicate" type="Function">Filter function</param>
        ///	<param name="thisArg" type="Function">The query parameters for filter function</param>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns true if the query has any result element.</summary>
        ///		<param name="filterPredicate" type="string">
        ///			Same as in filter.
        ///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns true if the query has any result element.</summary>
        ///		<param name="filterPredicate" type="Function">
        ///			Same as in filter.
        ///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
        ///         Is there any person who's first name is "George"? &#10;
        ///			Persons.some( function( person ) { return person.FirstName == this.name; }, { name: "George" }, {&#10;
        ///				success: function ( result ){ ... },&#10;
        ///				error: function () { ... }
        ///			});
        ///		</example>
        ///	</signature>

        this._checkOperation('some');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var someExpression = Container.createSomeExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(someExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    every: function (filterPredicate, thisArg, onResult) {
        ///	<summary>Filters a set of entities using a boolean expression and returns true if all elements of the EntitySet is in the result set.</summary>
        ///	<param name="filterPredicate" type="Function">Filter function</param>
        ///	<param name="thisArg" type="Function">The query parameters for filter function</param>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a </summary>
        ///		<param name="filterPredicate" type="string">
        ///			Same as in filter.
        ///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
        ///		<param name="filterPredicate" type="Function">
        ///			Same as in filter.
        ///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
        ///			Result is true when all person are married. &#10;
        ///			Persons.every( function( person ) { return person.Married == true; }, null, {&#10;
        ///				success: function ( result ){ ... },&#10;
        ///				error: function () { ... }
        ///			});
        ///		</example>
        ///	</signature>

        this._checkOperation('every');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var everyExpression = Container.createEveryExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(everyExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },


    take: function (amount) {
		///	<summary>Returns only a specified number of elements from the start of the result set.</summary>
        ///	<param name="amount" type="$data.Integer">The number of elements to return.</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Returns only a specified number of elements from the start of the result set.</summary>
        ///		<param name="amount" type="$data.Integer">
        ///			The number of elements to skip.
        ///		</param>
        ///		<returns type="$data.Queryable" />
		///		<example>
		///			Log the full name of each Person. &#10;
        ///			Persons.take(10).forEach( function( person ) { console.log(person.FullName; } );
        ///		</example>
        ///	</signature>

        this._checkOperation('take');
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, $data.Expressions.ExpressionType.Take);
        return Container.createQueryable(this, takeExp);
    },
    skip: function (amount) {
		///	<summary>Skip a specified number of elements from the start of the result set.</summary>
        ///	<param name="amount" type="$data.Integer">The number of elements to skip.</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Skip a specified number of elements from the start of the result set.</summary>
        ///		<param name="amount" type="$data.Integer">
        ///			The number of elements to skip.
        ///		</param>
        ///		<returns type="$data.Queryable" />
		///		<example>
		///			Log the full name of each Person. &#10;
        ///			Persons.skip(1).take(5).forEach( function( person ) { console.log(person.FullName; } );
        ///		</example>
        ///	</signature>

        this._checkOperation('skip');
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, $data.Expressions.ExpressionType.Skip);
        return Container.createQueryable(this, takeExp);
    },

    orderBy: function (selector, thisArg) {
		///<summary>Order a set of entities using an expression.</summary>
        ///<param name="selector" type="Function">An order expression</param>
        ///<param name="thisArg" type="Object">The query parameters</param>
        ///<returns type="$data.Queryable" />
        ///<signature>
        ///<summary>Order a set of entities using an expression.</summary>
        ///<param name="selector" type="string">
        ///The expression body of the order function in string. &#10;
        ///To reference the lambda parameter use the 'it' context variable. &#10;
        ///Example: orderBy("it.Id")
        ///</param>
        ///<param name="thisArg" type="Object" />
        ///<returns type="$data.Queryable" />
        ///</signature>
        ///<signature>
        ///<summary>Order a set of entities using an expression.</summary>
        ///<param name="selector" type="Function">
        ///</param>
        ///<param name="thisArg" type="Object" optional="true">
        ///Contains the predicate parameters
        ///</param>
        ///<returns type="$data.Queryable" />
        ///<example>
        ///Ordering a set of entities with a predicate function&#10;
        ///var males = Persons.orderBy( function( person ) { return person.Id; } );
        ///</example>
        ///</signature>

        this._checkOperation('orderBy');
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, $data.Expressions.ExpressionType.OrderBy);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    orderByDescending: function (selector, thisArg) {
		///<summary>Order a set of entities descending using an expression.</summary>
        ///<param name="selector" type="Function">An order expression</param>
        ///<param name="thisArg" type="Object">The query parameters</param>
        ///<returns type="$data.Queryable" />
        ///<signature>
        ///<summary>Order a set of entities descending using an expression.</summary>
        ///<param name="selector" type="string">
        ///The expression body of the order function in string. &#10;
        ///To reference the lambda parameter use the 'it' context variable. &#10;
        ///Example: orderBy("it.Id")
        ///</param>
        ///<param name="thisArg" type="Object" />
        ///<returns type="$data.Queryable" />
        ///</signature>
        ///<signature>
        ///<summary>Order a set of entities descending using an expression.</summary>
        ///<param name="selector" type="Function">
        ///</param>
        ///<param name="thisArg" type="Object" optional="true">
        ///Contains the predicate parameters
        ///</param>
        ///<returns type="$data.Queryable" />
        ///<example>
        ///Ordering a set of entities with a predicate function&#10;
        ///var males = Persons.orderByDescending( function( person ) { return person.Id; } );
        ///</example>
        ///</signature>

        this._checkOperation('orderByDescending');
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, $data.Expressions.ExpressionType.OrderByDescending);
        var q = Container.createQueryable(this, exp);
        return q;
    },

    first: function (filterPredicate, thisArg, onResult) {
		///	<summary>Filters a set of entities using a boolean expression and returns the first element.</summary>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
		///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns the first element.</summary>
		///		<param name="filterPredicate" type="string">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns the first element.</summary>
		///		<param name="filterPredicate" type="Function">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get "George" from the Person entity set. &#10;
        ///			Persons.first( function( person ) { return person.FirstName == this.name; }, { name: "George" }, function ( result ){ ... });
        ///		</example>
        ///	</signature>

        this._checkOperation('first');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var firstExpression = Container.createFirstExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(firstExpression);
            q.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },


    include: function (selector) {
		///	<summary>Includes the given entity set in the query if it's an inverse property.</summary>
        ///	<param name="selector" type="$data.String">Entity set name</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Includes the given entity set in the query if it's an inverse property.</summary>
        ///		<param name="selector" type="$data.String">
        ///			The name of the entity set you want to include in the query.
        ///		</param>
        ///		<returns type="$data.Queryable" />
		///		<example>
		///			Include the Category on every Article. &#10;
        ///			Articles.include("Category");
        ///		</example>
        ///	</signature>

        this._checkOperation('include');
        var constExp = Container.createConstantExpression(selector, "string");
        var takeExp = Container.createIncludeExpression(this.expression, constExp);
        return Container.createQueryable(this, takeExp);
    },

    _runQuery: function (onResult_items) {
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult_items);

        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(this.expression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    toTraceString: function (name) {
		///	<summary>Returns the trace string of the query.</summary>
        ///	<param name="name" type="$data.String">Name of the execution method (toArray, length, etc.).</param>
        ///	<returns type="$data.String" />
        ///	<signature>
        ///		<summary>Returns the trace string of the query.</summary>
        ///		<param name="name" type="$data.String">
        ///			Name of the execution method (toArray, length, etc.). Optional. Default value is "toArray".
        ///		</param>
        ///		<returns type="$data.String" />
		///		<example>
		///			Get the trace string for Articles.toArray() &#10;
        ///			Articles.toTraceString();
        ///		</example>
        ///	</signature>

        var expression = this.expression;

        if (name) {
            expression = Container['create' + name + 'Expression'](expression);
        } else {
            expression = Container.createToArrayExpression(expression);
        }

        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        expression = preparator.Visit(expression);

        //this.expression = expression;
        var q = Container.createQueryable(this, expression)
        return q.entityContext.getTraceString(q);
    },

    _checkOperation: function (name) {
        var operation = this.entityContext.resolveSetOperations(name);
        if (operation.invokable != undefined && !operation.invokable)
            Guard.raise(new Exception("Operation '" + name + "' is not invokable with the provider"));
    },
    defaultType: {}

}, null);
///EntitySet is responsible for
/// -creating and holding entityType through schema
/// - provide Add method
/// - provide Delete method
/// - provide Update method
/// - provide queryProvider for queryable

$data.EntitySchemaConfig = function EntitySchemaConfig() {
    this.Name = "";
};
$data.entitySetState = { created: 0, defined: 1, active: 2 };

$data.Class.defineEx('$data.EntitySet',
    [
        { type: $data.Queryable, params: [new ConstructorParameter(1)] }
    ], null,
{
    constructor: function (elementType, context, collectionName, eventHandlers, roles) {
        /// <signature>
        ///     <summary>Represents a typed entity set that is used to perform create, read, update, and delete operations</summary>
        ///     <param name="elementType" type="Function" subClassOf="$data.Entity">Type of entity set elements, elementType must be subclass of $data.Entity</param>
        ///     <param name="context" type="$data.EntityContext">Context of the EntitySet</param>
        ///     <param name="collectionName" type="String">Name of the EntitySet</param>
        /// </signature>
        this.createNew = this[elementType.name] = elementType;
        this.stateManager = new $data.EntityStateManager(this);
        this.elementType = elementType;
        this.collectionName = collectionName;
        this.roles = roles;
        /*Object.defineProperty(this, "elementType", { value: elementType, enumerable: true });
        Object.defineProperty(this, "collectionName", { value: collectionName, enumerable: true });
        Object.defineProperty(this, "roles", { value: roles, enumerable: true });*/
        
        for (var i in eventHandlers){
            this[i] = eventHandlers[i];
        }
        
        this._checkRootExpression();
    },
    executeQuery: function (expression, on_ready) {
        //var compiledQuery = this.entityContext
        var callBack = $data.typeSystem.createCallbackSetting(on_ready);
        this.entityContext.executeQuery(expression, callBack);
    },
    getTraceString: function (expression) {
        return this.entityContext.getTraceString(expression);
    },
    setContext: function (entityContext) {
        this.entitySetState = $data.entitySetState.active;
        this.entityContext = entityContext;
        this.entityContext[this.schema.name] = this[this.schema.name];
    },
    _trackEntity: function (entity) {
        var trackedEntities = this.entityContext.stateManager.trackedEntities;
        for (var i = 0; i < trackedEntities.length; i++) {
            if (trackedEntities[i].data === entity)
                return;
        }
        trackedEntities.push({ entitySet: this, data: entity });
    },
    add: function (entity) {
        /// <signature>
        ///     <summary>Creates a typed entity and adds to the context.</summary>
        ///     <param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///     <example>
        ///         
        ///         Persons.add({ Name: 'John', Email: 'john@example.com', Age: 30, Gender: 'Male' });
        ///         
        ///     </example>
        /// </signature>
        /// <signature>
        ///     <summary>Adds the given entity to the context.</summary>
        ///     <param name="entity" type="$data.Entity">The entity to add</param>
        ///     <example>
        ///
        ///         Persons.add(new $news.Types.Person({ Name: 'John', Email: 'john@example.com', Age: 30, Gender: 'Male' }));
        ///
        ///     </example>
        ///     <example>
        ///
        ///         var person = new $news.Types.Person({ Name: 'John', Email: 'john@example.com', Age: 30, Gender: 'Male' });
        ///         Persons.add(person);
        ///
        ///     </example>
        /// </signature>

        var data = entity;
        if (entity instanceof $data.EntityWrapper) {
            data = entity.getEntity();
        } else if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }
        data.entityState = $data.EntityState.Added;
        data.changedProperties = undefined;
        data.context = this.entityContext;
        this._trackEntity(data);
    },
    remove: function (entity) {
        /// <signature>
        ///     <summary>Creates a typed entity and marks it as Deleted.</summary>
        ///     <param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///     <example>
        ///         Person will be marked as Deleted where an id is 5. Id is a key of entity.
        ///         Persons.remove({ Id: 5 });
        ///
        ///     </example>
        /// </signature>
        /// <signature>
        ///     <summary>Marks the given entity as Deleted.</summary>
        ///     <param name="entity" type="$data.Entity">The entity to remove</param>
        ///     <example>
        ///         
        ///         Persons.remove(person);
        ///
        ///     </example>
        ///     <example>
        ///         Person will be marked as Deleted where an Id is 5. Id is a key of entity.
        ///         Persons.add(new $news.Types.Person({ Id: 5 }));
        ///
        ///     </example>
        /// </signature>

        var data = entity;
        if (entity instanceof $data.EntityWrapper) {
            data = entity.getEntity();
        } else if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }
        data.entityState = $data.EntityState.Deleted;
        data.changedProperties = undefined;
        this._trackEntity(data);
    },
    attach: function (entity) {
        /// <signature>
        ///     <summary>Creates a typed entity and adds to the Context with Unchanged state.</summary>
        ///     <param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///     <example>
        ///         
        ///         Persons.attach({ Id: 5, Email: 'newEmail@example.com' });
        ///
        ///     </example>
        /// </signature>
        /// <signature>
        ///     <summary>Adds to the context and sets state Unchanged.</summary>
        ///     <param name="entity" type="$data.Entity">The entity to attach</param>
        ///     <example>
        ///
        ///         Persons.attach(person);
        ///
        ///     </example>
        ///     <example>
        ///         Set an entity's related entities without loading 
        ///
        ///         var categoryPromo = new $news.Types.Category({ Id: 5 });
        ///         Category.attach(categoryPromo);
        ///         var article = new $news.Types.Article({ Title: 'New Article title', Body: 'Article body', Category: [ categoryPromo ] });
        ///         Article.attach(article);
        ///
        ///     </example>
        /// </signature>

        var data = entity;
        if (entity instanceof $data.EntityWrapper) {
            data = entity.getEntity();
        } else if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }
        
        for (var i = 0; i < this.entityContext.stateManager.trackedEntities.length; i++) {
            var current = this.entityContext.stateManager.trackedEntities[i];
            if (current.data === data)
                break;
            if (current.data.equals(data)) {
                Guard.raise(new Exception("Context already contains this entity!!!"));
            }
        }

        data.entityState = $data.EntityState.Unchanged;
        data.changedProperties = undefined;
        data.context = this.entityContext;
        this._trackEntity(data);
    },
    detach: function (entity) {
        /// <signature>
        ///     <summary>Creates a typed entity and detach from the Context with Detached state.</summary>
        ///     <param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///     <example>
        ///         Person will be Detached where an id is 5. Id is a key of entity.
        ///         Persons.detach({ Id: 5 });
        ///
        ///     </example>
        /// </signature>
        /// <signature>
        ///     <summary>Detach from the context and sets state Detached.</summary>
        ///     <param name="entity" type="$data.Entity">The entity to detach</param>
        ///     <example>
        ///
        ///         Persons.detach(person);
        ///
        ///     </example>
        ///     <example>
        ///         Person will be Detached where an Id is 5. Id is a key of entity.
        ///         Persons.add(new $news.Types.Person({ Id: 5 }));
        ///
        ///     </example>
        /// </signature>

        var data = entity;
        if (entity instanceof $data.EntityWrapper) {
            data = entity.getEntity();
        } else if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }

        var existsItem = this.entityContext.stateManager.trackedEntities.filter(function (i) { return i.data.equals(data); }).pop();
        if (existsItem) {
            var idx = this.entityContext.stateManager.trackedEntities.indexOf(existsItem);
            entity.entityState = $data.EntityState.Detached;
            this.entityContext.stateManager.trackedEntities.splice(idx, 1);
            return;
        }
    },
    attachOrGet: function (entity) {
        /// <signature>
        ///     <summary>Creates a typed entity and adds to the Context with Unchanged state.</summary>
        ///     <param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///     <returns type="$data.Entity" />
        ///     <example>
        ///         Id is a key of entity.
        ///         var person = Persons.attachOrGet({ Id: 5  });
        ///
        ///     </example>
        /// </signature>
        /// <signature>
        ///     <summary>If not in context then adds to it and sets state Unchanged.</summary>
        ///     <param name="entity" type="$data.Entity">The entity to detach</param>
        ///     <returns type="$data.Entity" />
        ///     <example>
        ///
        ///         var attachedPerson = Persons.attachOrGet(person);
        ///
        ///     </example>
        ///     <example>
        ///         Id is a key of entity.
        ///         var p = new $news.Types.Person({ Id: 5 });
        ///         var attachedPerson = Persons.attachOrGet(p);
        ///
        ///     </example>
        /// </signature>

        var data = entity;
        if (entity instanceof $data.EntityWrapper) {
            data = entity.getEntity();
        } else if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }

        var existsItem = this.entityContext.stateManager.trackedEntities.filter(function (i) { return i.data.equals(data); }).pop();
        if (existsItem) {
            return existsItem.data;
        }

        data.entityState = $data.EntityState.Unchanged;
        data.changedProperties = undefined;
        data.context = this.entityContext;
        this._trackEntity(data);
        return data;
    },
    //find: function (keys) {
    //    //todo global scope
    //    if (!this.entityKeys) {
    //        this.entityKeys = this.createNew.memberDefinition.filter(function (prop) { return prop.key; }, this);
    //    }
    //    this.entityContext.stateManager.trackedEntities.forEach(function (item) {
    //        if (item.entitySet == this) {
    //            var isOk = true;
    //            this.entityKeys.forEach(function (item, index) { isOK = isOk && (item.data[item.name] == keys[index]); }, this);
    //            if (isOk) {
    //                return item.data;
    //            }
    //        }
    //    }, this);
    //    //TODO: db call
    //    return null;
    //},
    loadItemProperty: function (entity, memberDefinition, callback) {
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="String">Property name</param>
        ///     <param name="callback" type="Function">
        ///         <summary>Callback function</summary>
        ///         <param name="propertyValue" />
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="String">Property name</param>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="$data.MemberDefinition">Property definition</param>
        ///     <param name="callback" type="Function">
        ///         <summary>Callback function</summary>
        ///         <param name="propertyValue" />
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="$data.MemberDefinition">Property definition</param>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>

        return this.entityContext.loadItemProperty(entity, memberDefinition, callback);
    },
    _checkRootExpression: function () {
        if (!this.expression) {
            //var ec = new $data.Expressions.EntityContextExpression(this.entityContext);
            var ec = Container.createEntityContextExpression(this.entityContext);
            //var name = entitySet.collectionName;
            //var entitySet = this.entityContext[entitySetName];
            var memberdef = this.entityContext.getType().getMemberDefinition(this.collectionName);
            var es = Container.createEntitySetExpression(ec,
                Container.createMemberInfoExpression(memberdef), null,
                this);
            this.expression = es;
            this.defaultType = this.elementType;
        }
    }
}, null);
$data.EntityState = {
    Detached:0,
    Unchanged: 10,
    Added: 20,
    Modified: 30,
    Deleted: 40
};$data.Class.define('$data.EntityStateManager', null, null,
{
    constructor: function (entityContext) {
        this.entityContext = null;
        this.trackedEntities = [];
        this.init(entityContext);
    },
    init: function (entityContext) {
        this.entityContext = entityContext;
    },
    reset: function () {
        this.trackedEntities = [];
    }
}, null);Exception = function(message, name, data) {
    Error.call(this);
	if (Error.captureStackTrace)
	    Error.captureStackTrace(this, this.constructor);
    
    this.name = name || "Exception";
    this.message = message;
    this.data = data;

    //this.toString = function() { return JSON.stringify(this); };

}

Exception.prototype.__proto__ = Error.prototype;

Exception.prototype._getStackTrace = function () {
    var callstack = [];
    var isCallstackPopulated = false;
	// unreachable code
    //return;
    /*try {
        i.dont.exist += 0;
    }
    catch (e) {
        if (e.stack) { // Firefox, Chrome
            var lines = e.stack.split('\n');
            for (var i = 0, len = lines.length; i < len; i++) {
                //if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                if (lines[i].indexOf(" at ") >= 0)
                    callstack.push(lines[i]);
            }
            //Remove call to printStackTrace()
            callstack.shift();
            //TODO: Remove call to new Exception( chain
            //callstack.shift();
            isCallstackPopulated = true;
        }
        else if (window.opera && e.message) { //Opera
            var lines = e.message.split('\n');
            for (var i = 0, len = lines.length; i < len; i++) {
                if (lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/)) {
                    var entry = lines[i];
                    //Append next line also since it has the file info
                    if (lines[i + 1]) {
                        entry += ' at ' + lines[i + 1];
                        i++;
                    }
                    callstack.push(entry);
                }
            }
            //Remove call to printStackTrace()
            callstack.shift();
            //TODO: Remove call to new Exception( chain
            //callstack.shift();
            isCallstackPopulated = true;
        }
    }

    //if (!isCallstackPopulated) { //IE and Safari
    //    var currentFunction = arguments.callee.caller;
    //    while (currentFunction) {
    //        var fn = currentFunction.toString();
    //        var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf('(')) || 'anonymous';
    //        callstack.push(fname);
    //        if (currentFunction == currentFunction.caller) {
    //            Guard.raise("Infinite loop");
    //        }
    //        currentFunction = currentFunction.caller;
    //    }
    //}
    return callstack.join("\n\r");	 */
};
Function.prototype.toServiceOperation = function(config){
    return new $data.FunctionImport(this, config);
};

$data.FunctionImport = function(fn, config){
    Object.defineProperty(this, 'asFunction', { value: fn });
    Object.getPrototypeOf(this).valueOf = function(){
        return this.asFunction;
    };
    Object.getPrototypeOf(this).toString = function(){
        return this.asFunction.toString();
    };
    Object.getPrototypeOf(this).call = function(){
        return this.asFunction.call.apply(arguments[0], Array.prototype.slice.call(arguments, 1));
    };
    Object.getPrototypeOf(this).apply = function(scope, args){
        return this.asFunction.apply(scope, args);
    };
    if (config) fn.extend(config);
};

$data.FunctionImport.prototype = {
    extend: function(extend){
        for (var i in extend){
            this[i] = extend[i];
        }
        
        return this;
    },
    chain: function(before, after){
        var fn = this;
        
        var ret = function(){
            var chain = arguments.callee.chainFn;
            var args = [];
            if (arguments.length){
                for (var i = 0; i < arguments.length; i++){
                    args.push(arguments[i]);
                }
            }
            var argsCount = args.length;
            var i = 0;
            
            var readyFn = function(){
                if (args[args.length - 1] && args[args.length - 1].success && typeof args[args.length - 1].success === 'function'){
                    var fn = args[args.length - 1].success;
                    fn.apply(this, arguments);
                }else return arguments.length ? arguments[0] : undefined;
            };
            
            var callbackFn = function(){
                var fn = chain[i];
                i++;
                
                var r = fn.apply(this, args);
                if (typeof r === 'function'){
                    var argsFn = arguments;
                    args[argsCount] = (i < chain.length ? (function(){ return callbackFn.apply(this, argsFn); }) : (function(){ return readyFn.apply(this, argsFn); }));
                    r.apply(this, args);
                }else{
                    if (i < chain.length){
                        callbackFn.apply(this, arguments);
                    }else readyFn(this, arguments);
                }
            }
            
            callbackFn();
        };
        
        if (!ret.chainFn) ret.chainFn = (before || []).concat([fn].concat(after || []));
        
        return ret;
    },
    before: function(on){
        var ret = this;
        
        if (!this.chainFn) ret = ret.chain();
        ret.chainFn.unshift(on);
            
        return ret;
    },
    after: function(on){
        var ret = this;
        
        if (!this.chainFn) ret = ret.chain();
        ret.chainFn.push(on);
            
        return ret;
    },
    asResult: function(type, config){
        return this.extend({
            resultType: type,
            resultCfg: config
        });
    },
    returns: function(type, elementType){
        if (typeof type === 'string')
            type = Container.resolveType(type);
            
        if (typeof elementType === 'string')
            elementType = Container.resolveType(elementType);

        return this.extend({
            returnType: type,
            elementType: elementType
        });
    },
    params: function(params){
        /*for (var p in params){
            if (typeof params[p] === 'string')
                params[p] = Container.resolveType(params[p]);
        }*/
        
        return this.extend({
            params: params
        });
    },
    serviceName: function(serviceName){
        return this.extend({
            serviceName: serviceName
        });
    },
    httpMethod: function(method){
        return this.extend({
            method: method
        });
    },
    webGet: function(){
        return this.method('GET');
    },
    webInvoke: function(){
        return this.method('POST');
    },
    authorize: function(roles, callback){
        var r = {};
        if (roles instanceof Array){
            for (var i = 0; i < roles.length; i++){
                if (typeof roles[i] === 'string') r[roles[i]] = true;
            }
        }else r = roles;
        
        this.roles = r;

        var fn = this;
        
        ret = function(){
            var pHandler = new $data.PromiseHandler();
            var clbWrapper = pHandler.createCallback(callback);
            var pHandlerResult = pHandler.getPromise();
            var args = arguments;
            
            clbWrapper.success = clbWrapper.success.after(function(){
                fn.apply(this, args);
            });
            
            $data.Access.isAuthorized($data.Access.Execute, this.user, fn.roles, clbWrapper);
            
            return pHandlerResult;
        };
        
        return ret;
    },
    toPromise: function(callback){
        var fn = this;
        
        var ret = function(){
            var pHandler = new $data.PromiseHandler();
            var clbWrapper = pHandler.createCallback(callback);
            var pHandlerResult = pHandler.getPromise();
            
            arguments[arguments.length++] = clbWrapper;
            fn.apply(this, arguments);
            
            return pHandlerResult;
        };
        
        return this;
    }
};

$data.ServiceOperation = (function(){
    var fn = arguments.callee;
    
    var virtualEntitySet = fn.elementType ? this.getEntitySetFromElementType(Container.resolveType(fn.elementType)) : null;
    
    var paramConstExpression = null;
    if (fn.params) {
        paramConstExpression = [];
        for (var i = 0; i < fn.params.length; i++) {
            //TODO: check params type
            for (var name in fn.params[i]) {
                paramConstExpression.push(Container.createConstantExpression(arguments[i], Container.resolveType(fn.params[i][name]), name));
            }
        }
    }

    var ec = Container.createEntityContextExpression(this);
    var memberdef = this.getType().getMemberDefinition(fn.serviceName);
    var es = Container.createServiceOperationExpression(ec,
            Container.createMemberInfoExpression(memberdef),
            paramConstExpression,
            fn);

    //Get callback function
    var clb = arguments[arguments.length - 1];
    if (typeof clb !== 'function') {
        clb = undefined;
    }

    if (virtualEntitySet) {
        var q = Container.createQueryable(virtualEntitySet, es);
        if (clb) {
            es.isTerminated = true;
            return q._runQuery(clb);
        }
        return q;
    }
    else {
        var returnType = Container.resolveType(fn.returnType);

        var q = Container.createQueryable(this, es);
        q.defaultType = returnType;

        if (returnType === $data.Queryable) {
            q.defaultType = Container.resolveType(fn.elementType);
            if (clb) {
                es.isTerminated = true;
                return q._runQuery(clb);
            }
            return q;
        }
        es.isTerminated = true;
        return q._runQuery(clb);
    }
}).toServiceOperation();
$data.StorageProviderLoader = {
    isSupported: function (providerName) {
        switch (providerName) {
            case 'indexedDb':
                return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            case 'storm':
                return 'XMLHttpRequest' in window;
            case 'webSql':
            case 'sqLite':
                return 'openDatabase' in window;
            default:
                return true;
        }
    },
    npmModules: {        
        'indexedDb': 'jaydata-indexeddb',
        'InMemory': 'jaydata-inmemory',
        'mongoDB': 'jaydata-mongodb',
        'oData': 'jaydata-odata',
        'sqLite': 'jaydata-sqlite',
        'webSql': 'jaydata-sqlite',
        'storm': 'jaydata-storm'
    },
    load: function (providerList, callback) {
        function getUrl(providerName) {
            switch (providerName) {
                case 'storm':
                    providerName = 'Storm';
                    break;
            }
            var jaydataScriptMin = document.querySelector('script[src$="jaydata.min.js"]');
	    var jaydataScript = document.querySelector('script[src$="jaydata.js"]');
            if (jaydataScriptMin) return jaydataScriptMin.src.substring(0, jaydataScriptMin.src.lastIndexOf('/') + 1) + 'jaydataproviders/' + providerName + 'Provider.min.js';
            else if (jaydataScript) return jaydataScript.src.substring(0, jaydataScript.src.lastIndexOf('/') + 1) + 'jaydataproviders/' + providerName + 'Provider.js';
            else return 'jaydataproviders/' + providerName + 'Provider.js';
        };

        function loadScript(url, callback) {
            if (!url)
                callback(false);

            function getHttpRequest() {
                if (window.XMLHttpRequest)
                    return new XMLHttpRequest();
                else if (window.ActiveXObject)
                    return new ActiveXObject("MsXml2.XmlHttp");
            }

            var oXmlHttp = getHttpRequest();
            oXmlHttp.onreadystatechange = function () {
                if (oXmlHttp.readyState == 4) {
                    if (oXmlHttp.status == 200 || oXmlHttp.status == 304) {
                        eval.call(window, oXmlHttp.responseText);
                        if (typeof callback === 'function')
                            callback(true);
                    } else {
                        if (typeof callback === 'function') {
                            callback(false);
                        }
                    }
                }
            }
            oXmlHttp.open('GET', url, true);
            oXmlHttp.send(null);
        };


        var currentProvider = providerList.shift();

        if ($data.RegisteredStorageProviders) {
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                callback.success(provider)
                return;
            }
        }

        if (!this.isSupported(provider)) {
            this.load(providerList, callback);
            return;
        }

        if (typeof module !== 'undefined' && typeof require !== 'undefined') {
            // NodeJS
            var provider = null;
            try {
                require(this.npmModules[currentProvider]);
                provider = $data.RegisteredStorageProviders[currentProvider];
            } catch (e) {
            }
            if (provider) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                callback.success(provider);
            } else if (providerList.length > 0) {
                this.load(providerList, callback);
            } else {
                callback.error();
            }

            return;
        }

        var url = getUrl(currentProvider);

        loadScript(url, function (successful) {
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (successful && provider) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                callback.success(provider);
            } else if (providerList.length > 0) {
                this.load(providerList, callback);
            } else {
                callback.error();
            }
        });
    }
}
$data.storageProviders = {
    DbCreationType: {
        Merge: 10,
        DropTableIfChanged: 20,
        DropAllExistingTables: 30
    }
}

$data.ConcurrencyMode = { Fixed: 'fixed', None: 'nonde' };
$data.Class.define('$data.StorageProviderBase', null, null,
{
    constructor: function (schemaConfiguration) {
        this.providerConfiguration = schemaConfiguration || {};
    },
    providers: {},
    supportedDataTypes: { value: [], writable: false },
    initializeStore: function (callBack) {
        Guard.raise("Pure class");
    },

    executeQuery: function (queryable, callBack) {
        Guard.raise("Pure class");
    },

    buildIndependentBlocks: function (changedItems) {
        /// <summary>
        /// Build and processes a dependency graph from the changed items,
        /// and generates blocks that can be inserted to the database sequentially.
        /// </summary>
        /// <param name="changedItems">Array of changed items to build independent blocks from.</param>
        var edgesTo = [];
        var edgesFrom = [];

        function hasOwnProperty(obj) {
            /// <summary>
            /// Returns true if object has own property (used for 'hashset'-like objects)
            /// </summary>
            /// <param name="obj">Target object</param>
            /// <returns>True if the object has own property</returns>
            for (var p in obj) {
                if (obj.hasOwnProperty(p))
                    return true;
            }
            return false;
        }

        // Building edgesTo and edgesFrom arrays (containing only indeces of items in changedItems array.
        for (var i = 0; i < changedItems.length; i++) {
            var current = changedItems[i];
            if (!current.dependentOn || current.dependentOn.length == 0) {
                // This item is independent
                continue;
            }

            var to = null;
            // Iterating over items 'current' depends on
            for (var j = 0; j < current.dependentOn.length; j++) {
                var currentDependency = current.dependentOn[j];
                if (currentDependency.entityState == $data.EntityState.Unchanged) {
                    continue;
                }
                to = to || {};
                // Getting the index of current dependency
                var ixDependendOn = -1;
                for (var k = 0; k < changedItems.length; k++) {
                    if (changedItems[k].data == currentDependency) {
                        ixDependendOn = k;
                        break;
                    }
                }
                // Sanity check
                if (ixDependendOn == -1) {
                    Guard.raise(new Exception('Dependent object not found', 'ObjectNotFound', current.dependentOn[j]));
                }
                // Setting edge in 'to' array
                to[ixDependendOn] = true;
                // Setting edge in 'from' array
                from = edgesFrom[ixDependendOn] || {};
                from[i] = true;
                edgesFrom[ixDependendOn] = from;
            }
            // Persisting found edges in edgesTo array
            if (to !== null)
                edgesTo[i] = to;
        }

        // Array of sequentialyl independent blocks (containing objects, not just their id's)
        var independentBlocks = [];
        // Objects getting their dependency resolved in the current cycle.
        var currentBlock = [];
        // Filling currentBlock with initially independent objects.
        for (var x = 0; x < changedItems.length; x++) {
            if (!edgesTo.hasOwnProperty(x)) {
                currentBlock.push(x);
            }
        }
        while (currentBlock.length > 0) {
            // Shifting currentBlock to cbix,
            // and clearing currentBlock for next independent block
            var cbix = [].concat(currentBlock);
            currentBlock = [];
            // Iterating over previous independent block, to generate the new one
            for (var b = 0; b < cbix.length; b++) {
                var dependentNodes = edgesFrom[cbix[b]];
                if (typeof dependentNodes !== 'undefined') {
                    for (var d in dependentNodes) {
                        // Removing edge from 'edgesTo'
                        delete edgesTo[d][cbix[b]];
                        // Check if has any more dependency
                        if (!hasOwnProperty(edgesTo[d])) {
                            // It doesn't, so let's clean up a bit
                            delete edgesTo[d];
                            // and push the item to 'currentBlock'
                            currentBlock.push(d);
                        }
                    }
                }
                // Clearing processed item from 'edgesFrom'
                delete edgesFrom[cbix[b]];
            }
            // Push cbix t to independentBlocks
            var cb = [];
            for (var c = 0; c < cbix.length; c++) {
                var item = changedItems[cbix[c]];
                if (item.data.entityState != $data.EntityState.Unchanged)
                    cb.push(item);
            }
            if (cb.length > 0)
                independentBlocks.push(cb);
        }
        return independentBlocks;
    },
    getTraceString: function (queryable) {
        Guard.raise("Pure class");
    },
    setContext: function (ctx) {
        this.context = ctx;
    },

    supportedFieldOperations: {
        value: {
            length: { dataType: "number", allowedIn: "filter, map" },
            substr: { dataType: "string", allowedIn: "filter", parameters: [{ name: "startFrom", dataType: "number" }, { name: "length", dataType: "number" }] },
            toLowerCase: { dataType: "string" }
        },
        enumerable: true,
        writable: true
    },

    resolveFieldOperation: function (operationName, expression, frameType) {
        ///<summary></summary>
        var result = this.supportedFieldOperations[operationName];
        if (!result) {
            Guard.raise(new Exception("Field operation '" + operationName + "' is not supported by the provider"));
        };
        if (frameType && result.allowedIn) {
            if ((result.allowedIn instanceof Array && !result.allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(result.allowedIn instanceof Array) && frameType !== Container.resolveType(result.allowedIn))) {
                            Guard.raise(new Exception(operationName + " not supported in: " + frameType.name));
                        }
        }
        result.name = operationName;
        return result;
    },

    supportedBinaryOperators: {
        value: {
            equal: { mapTo: 'eq', dataType: "boolean" }
        },
        enumerable: true,
        writable: true
    },

    resolveBinaryOperator: function (operator, expression, frameType) {
        var result = this.supportedBinaryOperators[operator];
        if (!result) {
            Guard.raise(new Exception("Binary operator '" + operator + "' is not supported by the provider"));
        };
        if (frameType && result.allowedIn) {
            if ((result.allowedIn instanceof Array && !result.allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(result.allowedIn instanceof Array) && frameType !== Container.resolveType(result.allowedIn))) {
                            Guard.raise(new Exception(operator + " not supported in: " + frameType.name));
                        }
        }
        result.name = operator;
        return result;
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: 'not' }
        },
        enumerable: true,
        writable: true
    },
    resolveUnaryOperator: function (operator, expression, frameType) {
        var result = this.supportedUnaryOperators[operator];
        if (!result) {
            Guard.raise(new Exception("Unary operator '" + operator + "' is not supported by the provider"));
        };
        if (frameType && result.allowedIn) {
            if ((result.allowedIn instanceof Array && !result.allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(result.allowedIn instanceof Array) && frameType !== Container.resolveType(result.allowedIn))) {
                            Guard.raise(new Exception(operator + " not supported in: " + frameType.name));
                        }
        }
        result.name = operator;
        return result;
    },

    supportedSetOperations: {
        value: {
            toArray: { invokable: true, allowedIn: [] }
        },
        enumerable: true,
        writable: true
    },
    resolveSetOperations: function (operation, expression, frameType) {
        var result = this.supportedSetOperations[operation];
        if (!result) {
            Guard.raise(new Exception("Operation '" + operation + "' is not supported by the provider"));
        };
        var allowedIn = result.allowedIn || [];
        if (frameType && allowedIn) {
            if ((allowedIn instanceof Array && !allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(allowedIn instanceof Array) && frameType !== Container.resolveType(allowedIn))) {
                Guard.raise(new Exception(operation + " not supported in: " + frameType.name));
            }
        }
        return result;
    },


    makePhysicalTypeDefinition: function (entityDefinition, association) {
    }
},
{
    registerProvider: function (name, provider) {
        $data.RegisteredStorageProviders = $data.RegisteredStorageProviders || [];
        $data.RegisteredStorageProviders[name] = provider;
    },
    getProvider: function (name) {
		var provider = $data.RegisteredStorageProviders[name];
		if (!provider)
            console.warn("Provider not found: '" + name + "'");
		return provider;
        /*var provider = $data.RegisteredStorageProviders[name];
        if (!provider)
            Guard.raise(new Exception("Provider not found: '" + name + "'", "Not Found"));
        return provider;*/
    },
    isSupported: {
        get: function () { return true; },
        set: function () { }
    }
});$data.Base.extend('$data.EntityWrapper', {
    getEntity: function () {
        Guard.raise("pure object");
    }
});
if (typeof jQuery !== 'undefined' && jQuery.ajax) {
    $data.ajax = $data.ajax || jQuery.ajax;
}

if (typeof WinJS !== 'undefined' && WinJS.xhr) {
    $data.ajax = $data.ajax || function (options) {
        $data.typeSystem.extend(options, {
            dataType: 'json',
            headers: {}
        });
        var dataTypes = {
            'json': {
                accept: 'application/json, text/javascript',
                convert: JSON.parse
            },
            'text': {
                accept: 'text/plain',
                convert: function (e) { return e; }
            },
            'html': {
                accept: 'text/html',
                convert: function (e) { return e; }
            },
            'xml': {
                accept: 'application/xml, text/xml',
                convert: function (e) {
                    // TODO?
                    return e;
                }
            }
        }
        var dataTypeContext = dataTypes[options.dataType.toLowerCase()];

        options.headers.Accept = dataTypeContext.accept;

        var successClb = options.success || $data.defaultSuccessCallback;
        var errorClb = options.error || $data.defaultErrorCallback;
        var progressClb = options.progress;

        var success = function (r) {
            var result = dataTypeContext.convert(r.responseText);
            successClb(result);
        }
        var error = function (r) {
            var error = dataTypeContext.convert(r.responseText);
            errorClb(error);
        }
        var progress = progressClb;

        WinJS.xhr(options)
        .done(success, error, progress);
    }
}

if (typeof Ext !== 'undefined' && typeof Ext.Ajax) {
    $data.ajax = $data.ajax || function (options) {
        Ext.Ajax.request(options);
    };
}

$data.ajax = $data.ajax || function () {
    var cfg = arguments[arguments.length - 1];
    var clb = $data.typeSystem.createCallbackSetting(cfg);
    clb.error("Not implemented");
};


$C('$data.modelBinder.FindProjectionVisitor', $data.Expressions.EntityExpressionVisitor, null, {
    VisitProjectionExpression: function (expression) {
        this.projectionExpression = expression;
    }
});

$C('$data.modelBinder.ModelBinderConfigCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (query, includes, oDataProvider) {
        this._query = query;
        this._includes = includes;
        this._isoDataProvider = oDataProvider || false;
    },
    VisitSingleExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitSomeExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitEveryExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitToArrayExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitFirstExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitForEachExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitServiceOperationExpression: function (expression) {
        var returnType = Container.resolveType(expression.cfg.returnType);
        if ((typeof returnType.isAssignableTo === 'function' && returnType.isAssignableTo($data.Queryable)) || returnType === $data.Array) {
            this._defaultModelBinder(expression);
        } else {
            var builder = Container.createqueryBuilder();
            builder.modelBinderConfig['$type'] = returnType;
            if (typeof returnType.isAssignableTo === 'function' && returnType.isAssignableTo($data.Entity)) {
                builder.modelBinderConfig['$selector'] = ['json:' + expression.cfg.serviceName];
            } else {
                builder.modelBinderConfig['$source'] = expression.cfg.serviceName;
            }
            this.VisitExpression(expression, builder);
            builder.resetModelBinderProperty();
            this._query.modelBinderConfig = builder.modelBinderConfig;
        }
    },
    VisitCountExpression: function (expression) {
        var builder = Container.createqueryBuilder();

        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = $data.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    VisitConstantExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.type;
        builder.modelBinderConfig['$value'] = expression.value;
    },

    VisitExpression: function (expression, builder) {
        var projVisitor = Container.createFindProjectionVisitor();
        projVisitor.Visit(expression);

        if (projVisitor.projectionExpression) {
            this.Visit(projVisitor.projectionExpression, builder);
        } else {
            this.DefaultSelection(builder);
        }
    },
    _defaultModelBinder: function (expression) {
        var builder = Container.createqueryBuilder();
        builder.modelBinderConfig['$type'] = $data.Array;
        if (this._isoDataProvider) {
            builder.modelBinderConfig['$selector'] = ['json:d.results', 'json:d', 'json:results'];
        }
        builder.modelBinderConfig['$item'] = {};
        builder.selectModelBinderProperty('$item');

        this.VisitExpression(expression, builder);

        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        if (elementType.memberDefinitions) {
            elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
                if ((!storageModel) || (storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name])) {

                    if (!storageModel && this._query.context.storageProvider.supportedDataTypes.indexOf(Container.resolveType(prop.dataType)) < 0) {
                        //complex type
                        builder.selectModelBinderProperty(prop.name);
                        builder.modelBinderConfig['$type'] = Container.resolveType(prop.dataType);
                        if (this._isoDataProvider) {
                            builder.modelBinderConfig['$selector'] = ['json:' + prop.name + '.results', 'json:' + prop.name];
                        } else {
                            builder.modelBinderConfig['$selector'] = 'json:' + prop.name;
                        }
                        this._addPropertyToModelBinderConfig(Container.resolveType(prop.dataType), builder);
                        builder.popModelBinderProperty();
                    } else {
                        if (prop.key) {
                            builder.addKeyField(prop.name);
                        }
                        if (prop.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                            builder.modelBinderConfig[prop.name] = { $selector: 'json:__metadata', $source: 'etag' }
                        } else {
                            builder.modelBinderConfig[prop.name] = prop.name;
                        }
                    }
                }
            }, this);
        } else {
            /*builder._binderConfig = {
                $selector: ['json:results'],
                $type: $data.Array,
                $item:{
                    $type: elementType,
                    $value: function (meta, data) { return data; }
                }
            }*/
            builder._binderConfig.$item = { };
            builder.modelBinderConfig = builder._binderConfig.$item;


            
        }
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    _addComplexTypeProperties: function (complexTypes, builder) {
        complexTypes.forEach(function (ct) {

            builder.selectModelBinderProperty(ct.FromPropertyName);
            builder.modelBinderConfig['$type'] = ct.ToType;
            if (this._isoDataProvider) {
                builder.modelBinderConfig['$selector'] = ['json:' + ct.FromPropertyName + '.results', 'json:' + ct.FromPropertyName];
            } else {
                builder.modelBinderConfig['$selector'] = 'json:' + ct.FromPropertyName;
            }
            this._addPropertyToModelBinderConfig(ct.ToType, builder);

            builder.popModelBinderProperty();
        }, this);
    },
    DefaultSelection: function (builder) {
        //no projection, get all item from entitySet
        builder.modelBinderConfig['$type'] = this._query.defaultType;

        var storageModel = this._query.context._storageModel.getStorageModel(this._query.defaultType);
        this._addPropertyToModelBinderConfig(this._query.defaultType, builder);
        if (this._includes) {
            this._includes.forEach(function (include) {
                var includes = include.name.split('.');
                var association = null;
                var tmpStorageModel = storageModel;
                for (var i = 0; i < includes.length; i++) {
                    if (builder.modelBinderConfig.$item) builder.selectModelBinderProperty('$item');
                    builder.selectModelBinderProperty(includes[i]);
                    association = tmpStorageModel.Associations[includes[i]];
                    tmpStorageModel = this._query.context._storageModel.getStorageModel(association.ToType);
                }
                if (this._isoDataProvider) {
                    builder.modelBinderConfig['$selector'] = ['json:' + includes[includes.length - 1] + '.results', 'json:' + includes[includes.length - 1]];
                } else {
                    builder.modelBinderConfig['$selector'] = 'json:' + includes[includes.length - 1];
                }
                if (association.ToMultiplicity === '*') {
                    builder.modelBinderConfig['$type'] = $data.Array;
                    builder.selectModelBinderProperty('$item');
                    builder.modelBinderConfig['$type'] = include.type;
                    this._addPropertyToModelBinderConfig(include.type, builder);
                    builder.popModelBinderProperty();
                } else {
                    builder.modelBinderConfig['$type'] = include.type;
                    this._addPropertyToModelBinderConfig(include.type, builder);
                }

                for (var i = 0; i < includes.length; i++) {
                    builder.popModelBinderProperty();
                }
            }, this);
        }
    },
    VisitProjectionExpression: function (expression, builder) {
        this.hasProjection = true;
        this.Visit(expression.selector, builder);
    },
    VisitParametricQueryExpression: function (expression, builder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            this.Visit(expression.expression, builder);
        }

    },
    VisitEntityAsProjection: function (expression, builder) {
        this.Visit(expression.source, builder);
        builder.modelBinderConfig['$type'] = expression.entityType;
        this._addPropertyToModelBinderConfig(expression.entityType, builder);
    },

    VisitEntityFieldExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
    },
    VisitMemberInfoExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
        if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
            this._addPropertyToModelBinderConfig(Container.resolveType(expression.memberDefinition.type), builder);
        } else {

            builder.modelBinderConfig['$source'] = expression.memberName;
        }
    },
    VisitEntitySetExpression: function (expression, builder) {
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, builder);
            this.Visit(expression.selector, builder);
        }

    },
    VisitComplexTypeExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);


        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            if (builder.modelBinderConfig.$selector instanceof $data.Array) {
                var temp = builder.modelBinderConfig.$selector[1];
                builder.modelBinderConfig.$selector[0] = temp + '.' + expression.selector.memberName + '.results';
                builder.modelBinderConfig.$selector[1] = temp + '.' + expression.selector.memberName;
            } else {
                builder.modelBinderConfig.$selector += '.' + expression.selector.memberName;
            }

        } else {
            if (this._isoDataProvider) {
                builder.modelBinderConfig['$selector'] = ['json:' + expression.selector.memberName + '.results', 'json:' + expression.selector.memberName];
            } else {
                builder.modelBinderConfig['$selector'] = 'json:' + expression.selector.memberName;
            }
        }
    },
    VisitEntityExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
    },
    VisitAssociationInfoExpression: function (expression, builder) {
        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            if (builder.modelBinderConfig.$selector instanceof $data.Array) {
                var temp = builder.modelBinderConfig.$selector[1];
                builder.modelBinderConfig.$selector[0] = temp + '.' + expression.associationInfo.FromPropertyName + '.results';
                builder.modelBinderConfig.$selector[1] = temp + '.' + expression.associationInfo.FromPropertyName;
            } else {
                builder.modelBinderConfig.$selector += '.' + expression.associationInfo.FromPropertyName;
            }

        } else {
            if (this._isoDataProvider) {
                builder.modelBinderConfig['$selector'] = ['json:' + expression.associationInfo.FromPropertyName + '.results', 'json:' + expression.associationInfo.FromPropertyName];
            } else {
                builder.modelBinderConfig['$selector'] = 'json:' + expression.associationInfo.FromPropertyName;
            }
        }
    },
    VisitObjectLiteralExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = $data.Object;
        expression.members.forEach(function (of) {
            this.Visit(of, builder);
        }, this);
    },
    VisitObjectFieldExpression: function (expression, builder) {
        builder.selectModelBinderProperty(expression.fieldName);
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            this.Visit(expression.expression, builder);
        }
        builder.popModelBinderProperty();
    }
});$data.Class.define("$data.Authentication.AuthenticationBase", null, null, {
    constructor: function (cfg) {
        this.configuration = cfg || {};
        this.Authenticated = false;
    },
    /// { error:, abort:, pending:, success: }
    Login: function (callbacks) {
         Guard.raise("Pure class");
    },
    Logout: function () {
        Guard.raise("Pure class");
    },
    CreateRequest: function (cfg) {
        Guard.raise("Pure class");
    }

}, null);$data.Class.define("$data.Authentication.Anonymous", $data.Authentication.AuthenticationBase, null, {
    constructor: function (cfg) {
        this.configuration = cfg || {};
        this.Authenticated = false;
    },
    /// { error:, abort:, pending:, success: }
    Login: function (callbacks) {
    },
    Logout: function () {
    },
    CreateRequest: function (cfg) {
        $data.ajax(cfg);
    }

}, null);$data.Class.define("$data.Authentication.FacebookAuth", $data.Authentication.AuthenticationBase, null, {
    constructor: function (cfg) {
        this.configuration = $data.typeSystem.extend({
            Url_code: '',
            type_code: '',
            scope: '',
            Url_token: '',
            type_token: '',
            access_token: '',
            app_id: ''
        }, cfg);
    },
    Login: function (callbacks) {
        if (this.Authenticated) {
            return;
        }

        var provider = this;
        provider.configuration.stateCallbacks = callbacks || {};

        $data.ajax({
            url: this.configuration.Url_code,
            data: 'type=' + provider.configuration.type_code + '&client_id=' + provider.configuration.app_id + '&scope=' + provider.configuration.scope,
            type: 'POST',
            dataType: 'json',
            success: function (data) {
                if (typeof provider.configuration.stateCallbacks.pending == "function")
                    provider.configuration.stateCallbacks.pending(data);
                provider._processRequestToken(data);
                provider.Authenticated = true;
            },
            error: function () {
                if (typeof provider.configuration.stateCallbacks.error == "function")
                    provider.configuration.stateCallbacks.error(arguments);
            }
        });
    },
    Logout: function () {
        this.Authenticated = false;
    },
    CreateRequest: function (cfg) {
        if (!cfg)
            return;
        var _this = this;

        if (cfg.url && this.Authenticated) {
            var andChar = '?';
            if (cfg.url.indexOf(andChar) > 0)
                andChar = '&';

            if (this.configuration.access_token)
                cfg.url = cfg.url + andChar + 'access_token=' + this.configuration.access_token;
        }

        $data.ajax(cfg);
    },
    _processRequestToken: function (verification_data) {
        var provider = this;

        $data.ajax({
            url: provider.configuration.Url_token,
            data: 'type=' + provider.configuration.type_token + '&client_id=' + provider.configuration.app_id + '&code=' + verification_data.code,
            type: 'POST',
            dataType: 'json',
            success: function(result) {
                provider.configuration.access_token = result.access_token;
                if (typeof provider.configuration.stateCallbacks.success == "function")
                    provider.configuration.stateCallbacks.success(result);
            },
            error: function(obj) {
                var data = eval('(' + obj.responseText + ')');
                if (data.error) {
                    if (data.error.message == "authorization_pending") {
                        setTimeout(function() {
                            provider._processRequestToken(verification_data);
                        }, 2000);
                    } else if ("authorization_declined") {
                        if (typeof provider.configuration.stateCallbacks.abort == "function")
                            provider.configuration.stateCallbacks.abort(arguments);
                    }
                }
            }
        });
    }
}, null);$data.Class.define("$data.Authentication.BasicAuth.BasicAuth", $data.Authentication.AuthenticationBase, null, {
    constructor: function (cfg) {
        this.configuration = $data.typeSystem.extend({
            Username: '',
            Password: ''
        }, cfg);
    },
    Login: function (callbacks) {
        if (callbacks && typeof callbacks.pending == "function")
            callbacks.pending();
    },
    Logout: function () {
    },
    CreateRequest: function (cfg) {
        if (!cfg)
            return;
        var _this = this;

        var origBeforeSend = cfg.beforeSend;
        cfg.beforeSend = function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic  " + _this.__encodeBase64(_this.configuration.Username + ":" + _this.configuration.Password));

            if(typeof origBeforeSend == "function")
                origBeforeSend(xhr);
        };
        
        $data.ajax(cfg);
    },
    __encodeBase64: function (val) {
        var b64array = "ABCDEFGHIJKLMNOP" +
                           "QRSTUVWXYZabcdef" +
                           "ghijklmnopqrstuv" +
                           "wxyz0123456789+/" +
                           "=";

        input = val;
        var base64 = "";
        var hex = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            base64 = base64 +
                        b64array.charAt(enc1) +
                        b64array.charAt(enc2) +
                        b64array.charAt(enc3) +
                        b64array.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return base64;
    }
}, null);