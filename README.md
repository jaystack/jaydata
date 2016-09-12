[![JayData Logo](https://s3.amazonaws.com/jaydata-cdn/logo_jaydata_dark.png)](http://jaydata.org)

[![NPM](https://nodei.co/npm/jaydata.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/jaydata/)

[![npm version](https://badge.fury.io/js/jaydata.svg)](https://badge.fury.io/js/jaydata)
[![Dependency Status](https://david-dm.org/jaystack/jaydata.svg)](https://david-dm.org/jaystack/jaydata)
[![Issue Stats](http://issuestats.com/github/jaystack/jaydata/badge/issue?style=flat)](http://issuestats.com/github/jaydata/jaydata)
[![Issue Stats](http://issuestats.com/github/jaystack/jaydata/badge/pr?style=flat)](http://issuestats.com/github/jaydata/jaydata)

[![license MIT](http://img.shields.io/badge/license-MIT-blue.svg)](license-MIT)
[![license GPL](http://img.shields.io/badge/license-GPL-blue.svg)](license-GPL)

JayData is a unified data access library for JavaScript to CRUD data from different sources like WebSQL/SQLite,
IndexedDB, MongoDb, OData, HTML5 localStorage.
The library can be integrated with KendoUI, Knockout.js, Handlebars.js or Sencha Touch 2 and can be used on
Node.js as well. Check out the latest [JayData examples](https://github.com/jaystack/odata-v4-client-examples) 

JayData not only provides JavaScript Language Query (JSLQ) syntax to access local (in-browser and mobile)
and remote databases, but builds the queries and executes/processes the requests of the essential data
sources and data services to make developers able to concentrate only on the business logic.

Microsoft .NET developers can utilize Entity Framework and LINQ on server-side to perform operations on
data from different databases. The aim of JayData library is to give a similar tool to JavaScript developers.

JayData is cross-platform (runs on HTML5 desktop and mobile browsers, can be hosted in Cordova/PhoneGap environment
on iPhone, iPad, Android or Windows Phone 8+) and cross-layer as it works on client-side and server-side (Node.JS).

Please read the release notes for current status of the providers.

Visit http://jaydata.org for detailed information and documentation.

Official builds are released on CodePlex (http://jaydata.codeplex.com) can be used to develop applications, to get
the structured sourcecode to develop JayData itself, visit http://github.com/jaystack/jaydata

Feed of Latest releases, tutorials: https://twitter.com/jaydataorg
Feed of commits in development branch: https://twitter.com/jaydatadev

JayData comes with multiple licensing: you can use it under MIT license if ship software software under MIT,
but it should be used under GPL if you distribute your software under GPLv2. JayData Pro is a closed-source
commercial product recommended for enterprise projects and commercial development efforts.
http://jaystack.com/licensing

## Installation

```bash
$ npm install jaydata
```

## How to build

```bash
$ git clone https://github.com/jaystack/jaydata.git
$ cd jaydata
$ npm install
$ gulp
```

## Related projects
[JaySvcUtil](https://github.com/jaystack/jaysvcutil) - Code generator tool that builds JayData data model classes from $metadata service of OData endpoints. 
[Dynamic Metadata](https://github.com/jaystack/jaydata-dynamic-metadata)
