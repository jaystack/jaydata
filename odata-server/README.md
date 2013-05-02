#JayData Server
OData server NPM module for node.js with MongoDB

JayData Server is here for you if you want to [set up your own OData](http://jaydata.org/blog/how-to-set-up-a-nodejs-odata-endpoint-with-odata-server) endpoint in node.js environment with MongoDB or SQLite support. Why wouldn’t you extend your JayData skillset to the server-side?
JayData Server can be accessed using JayData library or any other OData client and it covers a wide range of features of OData protocol.

##Installing

	$ npm install odata-server

##Northwind and NewsReader OData servers

There are two example servers included. Northwind and NewsReader.

	$ node newsreader.js
	$ node northwind.js

##Supported OData v2 features

  * XML/JSON format
  * $metadata generation
  * $count
  * $inlinecount
  * $filter (eq, ne, lt, le, gt, ge, startswith, endswith, substringof, and, or)
  * $select
  * $top
  * $skip
  * $expand - Navigation properties
  * $orderbyService operations
  * Full CRUD

#Supported OData v3 features

  * Geo types
  * Geo queries (geo.distance(), geo.intersects()) (with JayData mongoDB Pro provider)
