Tools\JsCollect.exe --p .\ --i JayData_Index.xml --o JayData-standalone.js --t standalone
Tools\JsCollect.exe --p .\ --i JayData_Index.xml --o JayData.js
Tools\JsCollect.exe --p .\ --i JayData_Index.xml --o JayData-vsdoc.js --t vsdoc
java -jar Tools\compiler.jar --js .\JayData-standalone.js --js_output_file .\JayData-standalone.min.js
java -jar Tools\compiler.jar --js .\JayData.js --js_output_file .\JayData.min.js