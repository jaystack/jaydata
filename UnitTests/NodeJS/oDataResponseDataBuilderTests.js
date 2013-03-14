exports.exists = function (test) {
    test.expect(1);
    test.equal(typeof $data.oDataServer.oDataResponseDataBuilder, 'function', '$data.oDataServer.oDataResponseDataBuilder exists');
    test.done();
};

var ServiceClass = function () { };

function getBuilderConfig(context, ext) {
    var builderConfig = {
        version: 'V1',
        context: context,
        baseUrl: 'http://example.com',
        simpleResult: false,
    }

    return $data.typeSystem.extend(builderConfig, ext);
}

exports['functionContext'] = {
    'resultPath': {
        methodName: function (test) {

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V1',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.notEqual(response.d.test, undefined, 'function name in result failed');

            test.done();
        },
        serviceOpName: function (test) {

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V2',
                methodConfig: { returnType: 'string', serviceOpName: 'sName' }
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.notEqual(response.d.sName, undefined, 'function name in result failed');

            test.done();
        },
        both: function (test) {

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V3',
                methodConfig: { returnType: 'string', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.notEqual(response.d.sName, undefined, 'function name in result failed');

            test.done();
        }
    },
    'stringResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V1',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.deepEqual(response, { d: { 'test': 'Hello World!' } }, 'V1: string convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V2',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.deepEqual(response, { d: { 'test': 'Hello World!' } }, 'V2: string convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V3',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.deepEqual(response, { d: { 'test': 'Hello World!' } }, 'V3: string convert failed');

            test.done();
        }
    },
    'intResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V1',
                methodConfig: { returnType: 'int' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(42);
            test.deepEqual(response, { d: { 'test': 42 } }, 'int convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V2',
                methodConfig: { returnType: 'int' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(42);
            test.deepEqual(response, { d: { 'test': 42 } }, 'int convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V3',
                methodConfig: { returnType: 'int' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(42);
            test.deepEqual(response, { d: { 'test': 42 } }, 'int convert failed');

            test.done();
        }
    },
    'dateResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V1',
                methodConfig: { returnType: 'datetime', serviceOpName: 'sName' }
            });

            var date = new Date('2000/05/05');
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(date);
            test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V2',
                methodConfig: { returnType: 'datetime', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var date = new Date('2000/05/05');
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(date);
            test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V3',
                methodConfig: { returnType: 'datetime', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var date = new Date('2000/05/05');
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(date);
            test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

            test.done();
        }
    },
    'objectResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V1',
                methodConfig: { returnType: 'object', serviceOpName: 'sName' }
            });

            var object = { a: 'test', b: 42 };
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(object);
            test.deepEqual(response, { d: { 'sName': object } }, 'object convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V2',
                methodConfig: { returnType: 'object', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var object = { a: 'test', b: 42 };
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(object);
            test.deepEqual(response, { d: { 'sName': object } }, 'object convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V3',
                methodConfig: { returnType: 'object', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var object = { a: 'test', b: 42 };
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(object);
            test.deepEqual(response, { d: { 'sName': object } }, 'object convert failed');

            test.done();
        }
    },
    'entityResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V1',
                methodConfig: { returnType: '$news.Types.Location', serviceOpName: 'sName' }
            });

            var entity = new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' });
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entity);
            test.deepEqual(response, { d: { 'sName': entity } }, 'object convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V2',
                methodConfig: { returnType: '$news.Types.Location', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var entity = new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' });
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entity);
            test.deepEqual(response, { d: { 'sName': entity } }, 'object convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig(ServiceClass, {
                version: 'V3',
                methodConfig: { returnType: '$news.Types.Location', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var entity = new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' });
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entity);
            test.deepEqual(response, { d: { 'sName': entity } }, 'object convert failed');

            test.done();
        }
    },
    arrayResult: {
        'resultPath': {
            methodName: function (test) {

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V1',
                    methodConfig: { returnType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.notEqual(response.d, undefined, 'function name in result failed');

                test.done();
            },
            serviceOpName: function (test) {

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V2',
                    methodConfig: { returnType: 'string', serviceOpName: 'sName' }
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.notEqual(response.d, undefined, 'function name in result failed');

                test.done();
            },
            both: function (test) {

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V3',
                    methodConfig: { returnType: 'string', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.notEqual(response.d, undefined, 'function name in result failed');

                test.done();
            }
        },
        'stringResult': {
            V1: function (test) {
                test.expect(2);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.equal(builder.config.version, builderConfig.version, 'version equal failed');
                test.deepEqual(response, { d: ['Hello', 'World!'] }, 'V1: string convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.deepEqual(response, { d: { results: ['Hello', 'World!']/*, __count: 2*/ } }, 'V2: string convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.deepEqual(response, { d: { results: ['Hello', 'World!']/*, __count: 2*/ } }, 'V3: string convert failed');

                test.done();
            }
        },
        'intResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'int' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse([42, 24]);
                test.deepEqual(response, { d: [42, 24] }, 'int convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'int' },
                    methodName: 'test'
                })

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse([42, 24]);
                test.deepEqual(response, { d: { results: [42, 24]/*, __count: 2*/ } }, 'int convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: 'int' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse([42, 24]);
                test.deepEqual(response, { d: { results: [42, 24]/*, __count: 2*/ } }, 'int convert failed');

                test.done();
            }
        },
        'dateResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'datetime', serviceOpName: 'sName' }
                });

                var dates = [new Date('2000/05/05'), new Date('2000/05/10')];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(dates);
                test.deepEqual(response, { d: dates }, 'datetime convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'datetime', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var dates = [new Date('2000/05/05'), new Date('2000/05/10')];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(dates);
                test.deepEqual(response, { d: { results: dates/*, __count: 2*/ } }, 'datetime convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V3',
                    methodConfig: { returnType: 'datetime', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var date = new Date('2000/05/05');
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(date);
                test.deepEqual(response, { d: { 'sName': "/Date(" + new Date('2000/05/05').valueOf() + ")/" } }, 'datetime convert failed');

                test.done();
            }
        },
        'objectResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'object', serviceOpName: 'sName' }
                });

                var objects = [{ a: 'test', b: 42 }, { a: 'test2', b: 421 }, { a: 'test3', b: 423 }];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(objects);
                test.deepEqual(response, { d: objects }, 'object convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'object', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var objects = [{ a: 'test', b: 42 }, { a: 'test2', b: 421 }, { a: 'test3', b: 423 }];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(objects);
                test.deepEqual(response, { d: { results: objects/*, __count: 3*/ } }, 'object convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: 'object', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var objects = [{ a: 'test', b: 42 }, { a: 'test2', b: 421 }, { a: 'test3', b: 423 }];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(objects);
                test.deepEqual(response, { d: { results: objects/*, __count: 3*/ } }, 'object convert failed');

                test.done();
            }
        },
        'entityResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: '$news.Types.Location', serviceOpName: 'sName' }
                });

                var entities = [new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }),
                    new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }),
                    new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }),
                    new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' })
                ];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(entities);
                test.deepEqual(response, { d: entities }, 'object convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: '$news.Types.Location', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var entities = [new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }),
                    new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }),
                    new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }),
                    new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' })
                ];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(entities);
                test.deepEqual(response, { d: { results: entities/*, __count: 4*/ } }, 'object convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig(ServiceClass, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: '$news.Types.Location', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var entities = [new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }),
                    new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }),
                    new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }),
                    new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' })
                ];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(entities);
                test.deepEqual(response, { d: { results: entities/*, __count: 4*/ } }, 'object convert failed');

                test.done();
            }
        }
    }
}

exports['entityContext'] = {
    'resultPath': {
        methodName: function (test) {

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.notEqual(response.d.test, undefined, 'function name in result failed');

            test.done();
        },
        serviceOpName: function (test) {

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                methodConfig: { returnType: 'string', serviceOpName: 'sName' }
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.notEqual(response.d.sName, undefined, 'function name in result failed');

            test.done();
        },
        both: function (test) {

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                methodConfig: { returnType: 'string', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.notEqual(response.d.sName, undefined, 'function name in result failed');

            test.done();
        }
    },
    'stringResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.deepEqual(response, { d: { 'test': 'Hello World!' } }, 'V1: string convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.deepEqual(response, { d: { 'test': 'Hello World!' } }, 'V2: string convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                methodConfig: { returnType: 'string' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse('Hello World!');
            test.deepEqual(response, { d: { 'test': 'Hello World!' } }, 'V3: string convert failed');

            test.done();
        }
    },
    'intResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                methodConfig: { returnType: 'int' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(42);
            test.deepEqual(response, { d: { 'test': 42 } }, 'int convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                methodConfig: { returnType: 'int' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(42);
            test.deepEqual(response, { d: { 'test': 42 } }, 'int convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                methodConfig: { returnType: 'int' },
                methodName: 'test'
            });

            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(42);
            test.deepEqual(response, { d: { 'test': 42 } }, 'int convert failed');

            test.done();
        }
    },
    'dateResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                methodConfig: { returnType: 'datetime', serviceOpName: 'sName' }
            });

            var date = new Date('2000/05/05');
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(date);
            test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                methodConfig: { returnType: 'datetime', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var date = new Date('2000/05/05');
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(date);
            test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                methodConfig: { returnType: 'datetime', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var date = new Date('2000/05/05');
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(date);
            test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

            test.done();
        }
    },
    'objectResult': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                methodConfig: { returnType: 'object', serviceOpName: 'sName' }
            });

            var object = { a: 'test', b: 42 };
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(object);
            test.deepEqual(response, { d: { 'sName': object } }, 'object convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                methodConfig: { returnType: 'object', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var object = { a: 'test', b: 42 };
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(object);
            test.deepEqual(response, { d: { 'sName': object } }, 'object convert failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                methodConfig: { returnType: 'object', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var object = { a: 'test', b: 42 };
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(object);
            test.deepEqual(response, { d: { 'sName': object } }, 'object convert failed');

            test.done();
        }
    },
    'entityResult': {
        V1: function (test) {
            test.expect(6);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                methodConfig: { returnType: '$news.Types.Location', serviceOpName: 'sName' }
            });

            var entity = new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' });
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entity);
            test.equal(response.d['sName'].hasOwnProperty('__metadata'), true, '__metadata property failed');
            test.equal(response.d['sName'].hasOwnProperty('Zip'), true, 'Zip property failed');
            test.equal(response.d['sName'].hasOwnProperty('City'), true, 'City property failed');
            test.equal(response.d['sName'].hasOwnProperty('Address'), true, 'Address property failed');
            test.equal(response.d['sName'].hasOwnProperty('Country'), true, 'Country property failed');
            test.equal(response.d['sName'].hasOwnProperty('Area'), false, 'Area property failed');

            test.done();
        },
        V2: function (test) {
            test.expect(6);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                methodConfig: { returnType: '$news.Types.Location', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var entity = new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' });
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entity);
            test.equal(response.d['sName'].hasOwnProperty('__metadata'), true, '__metadata property failed');
            test.equal(response.d['sName'].hasOwnProperty('Zip'), true, 'Zip property failed');
            test.equal(response.d['sName'].hasOwnProperty('City'), true, 'City property failed');
            test.equal(response.d['sName'].hasOwnProperty('Address'), true, 'Address property failed');
            test.equal(response.d['sName'].hasOwnProperty('Country'), true, 'Country property failed');
            test.equal(response.d['sName'].hasOwnProperty('Area'), false, 'Area property failed');

            test.done();
        },
        V3: function (test) {
            test.expect(6);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                methodConfig: { returnType: '$news.Types.Location', serviceOpName: 'sName' },
                methodName: 'test'
            });

            var entity = new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' });
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entity);
            test.equal(response.d['sName'].hasOwnProperty('__metadata'), true, '__metadata property failed');
            test.equal(response.d['sName'].hasOwnProperty('Zip'), true, 'Zip property failed');
            test.equal(response.d['sName'].hasOwnProperty('City'), true, 'City property failed');
            test.equal(response.d['sName'].hasOwnProperty('Address'), true, 'Address property failed');
            test.equal(response.d['sName'].hasOwnProperty('Country'), true, 'Country property failed');
            test.equal(response.d['sName'].hasOwnProperty('Area'), false, 'Area property failed');

            test.done();
        }
    },
    arrayResult: {
        'resultPath': {
            methodName: function (test) {

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V1',
                    methodConfig: { returnType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.notEqual(response.d, undefined, 'function name in result failed');

                test.done();
            },
            serviceOpName: function (test) {

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V2',
                    methodConfig: { returnType: 'string', serviceOpName: 'sName' }
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.notEqual(response.d, undefined, 'function name in result failed');

                test.done();
            },
            both: function (test) {

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V3',
                    methodConfig: { returnType: 'string', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.notEqual(response.d, undefined, 'function name in result failed');

                test.done();
            }
        },
        'stringResult': {
            V1: function (test) {
                test.expect(2);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.equal(builder.config.version, builderConfig.version, 'version equal failed');
                test.deepEqual(response, { d: ['Hello', 'World!'] }, 'V1: string convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.deepEqual(response, { d: { results: ['Hello', 'World!']/*, __count: 2*/ } }, 'V2: string convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: 'string' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(['Hello', 'World!']);
                test.deepEqual(response, { d: { results: ['Hello', 'World!']/*, __count: 2*/ } }, 'V3: string convert failed');

                test.done();
            }
        },
        'intResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'int' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse([42, 24]);
                test.deepEqual(response, { d: [42, 24] }, 'int convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'int' },
                    methodName: 'test'
                })

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse([42, 24]);
                test.deepEqual(response, { d: { results: [42, 24]/*, __count: 2*/ } }, 'int convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: 'int' },
                    methodName: 'test'
                });

                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse([42, 24]);
                test.deepEqual(response, { d: { results: [42, 24]/*, __count: 2*/ } }, 'int convert failed');

                test.done();
            }
        },
        'dateResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: 'datetime', serviceOpName: 'sName' }
                });

                var dates = [new Date('2000/05/05'), new Date('2000/05/10')];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(dates);
                test.deepEqual(response, { d: dates }, 'datetime convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: 'datetime', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var dates = [new Date('2000/05/05'), new Date('2000/05/10')];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(dates);
                test.deepEqual(response, { d: { results: dates/*, __count: 2*/ } }, 'datetime convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V3',
                    methodConfig: { returnType: 'datetime', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var date = new Date('2000/05/05');
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(date);
                test.deepEqual(response, { d: { 'sName': "/Date(" + date.valueOf() + ")/" } }, 'datetime convert failed');

                test.done();
            }
        },
        'objectResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V1',
                    methodConfig: { returnType: $data.Array, elementType: 'object', serviceOpName: 'sName' }
                });

                var objects = [{ a: 'test', b: 42 }, { a: 'test2', b: 421 }, { a: 'test3', b: 423 }];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(objects);
                test.deepEqual(response, { d: objects }, 'object convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V2',
                    methodConfig: { returnType: $data.Array, elementType: 'object', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var objects = [{ a: 'test', b: 42 }, { a: 'test2', b: 421 }, { a: 'test3', b: 423 }];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(objects);
                test.deepEqual(response, { d: { results: objects/*, __count: 3*/ } }, 'object convert failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V3',
                    methodConfig: { returnType: $data.Array, elementType: 'object', serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var objects = [{ a: 'test', b: 42 }, { a: 'test2', b: 421 }, { a: 'test3', b: 423 }];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(objects);
                test.deepEqual(response, { d: { results: objects/*, __count: 3*/ } }, 'object convert failed');

                test.done();
            }
        },
        'entityResult': {
            V1: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V1',
                    methodConfig: { returnType: 'array', elementType: $news.Types.Location, serviceOpName: 'sName' }
                });

                var entities = [new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }),
                    new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }),
                    new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }),
                    new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' })
                ];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(entities);
                test.equal(response.d instanceof $data.Array, true, 'object convert failed');

                test.done();
            },
            V2: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V2',
                    methodConfig: { returnType: 'array', elementType: $news.Types.Location, serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var entities = [new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }),
                    new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }),
                    new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }),
                    new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' })
                ];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(entities);
                test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
                //test.equal(response.d.__count, 4, 'object count failed');

                test.done();
            },
            V3: function (test) {
                test.expect(1);

                var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                    version: 'V3',
                    methodConfig: { returnType: 'array', elementType: $news.Types.Location, serviceOpName: 'sName' },
                    methodName: 'test'
                });

                var entities = [new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }),
                    new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }),
                    new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }),
                    new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' })
                ];
                var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
                var response = builder.convertToResponse(entities);
                test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
                //test.equal(response.d.__count, 4, 'object count failed');

                test.done();
            }
        }
    },
    'entitySet': {
        V1: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                collectionName: 'Articles'
            });

            var entities = [
                new $news.Types.Article({ Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() })
            ];
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entities);
            test.equal(response.d instanceof $data.Array, true, 'object convert failed');

            test.done();
        },
        V2: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                collectionName: 'Articles'
            });

            var entities = [
                new $news.Types.Article({ Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() })
            ];
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entities);
            test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
            //test.equal(response.d.__count, 5, 'object count failed');

            test.done();
        },
        V3: function (test) {
            test.expect(1);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                collectionName: 'Articles'
            });

            var entities = [
                new $news.Types.Article({ Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() })
            ];
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entities);
            test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
            //test.equal(response.d.__count, 5, 'object count failed');

            test.done();
        }
    },
    'entitySet - map': {
        V1: function (test) {
            test.expect(21);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V1',
                collectionName: 'Articles',
                selectedFields: ['Title', 'Lead']
            });

            var entities = [
                new $news.Types.Article({ Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() })
            ];
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entities);
            test.equal(response.d instanceof $data.Array, true, 'object convert failed');

            for (var i = 0; i < response.d.length; i++) {
                var item = response.d[i];

                test.equal(item.hasOwnProperty('__metadata'), true, '__metadata property failed');
                test.equal(item.hasOwnProperty('Title'), true, 'Title property failed');
                test.equal(item.hasOwnProperty('Lead'), true, 'Lead property failed');
                test.equal(item.hasOwnProperty('Body'), false, 'Body property failed');
            }

            test.done();
        },
        V2: function (test) {
            test.expect(21);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V2',
                collectionName: 'Articles',
                selectedFields: ['Title', 'Lead']
            });

            var entities = [
                new $news.Types.Article({ Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() })
            ];
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entities);
            test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
            //test.equal(response.d.__count, 5, 'object count failed');

            for (var i = 0; i < /*response.d.__count*/ response.d.results.length; i++) {
                var item = response.d.results[i];

                test.equal(item.hasOwnProperty('__metadata'), true, '__metadata property failed');
                test.equal(item.hasOwnProperty('Title'), true, 'Title property failed');
                test.equal(item.hasOwnProperty('Lead'), true, 'Lead property failed');
                test.equal(item.hasOwnProperty('Body'), false, 'Body property failed');
            }

            test.done();
        },
        V3: function (test) {
            test.expect(21);

            var builderConfig = getBuilderConfig($news.Types.NewsContext, {
                version: 'V3',
                collectionName: 'Articles',
                selectedFields: ['Title', 'Lead']
            });

            var entities = [
                new $news.Types.Article({ Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() }),
                new $news.Types.Article({ Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() })
            ];
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
            var response = builder.convertToResponse(entities);
            test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
            //test.equal(response.d.__count, 5, 'object count failed');

            for (var i = 0; i < /*response.d.__count*/ response.d.results.length; i++) {
                var item = response.d.results[i];

                test.equal(item.hasOwnProperty('__metadata'), true, '__metadata property failed');
                test.equal(item.hasOwnProperty('Title'), true, 'Title property failed');
                test.equal(item.hasOwnProperty('Lead'), true, 'Lead property failed');
                test.equal(item.hasOwnProperty('Body'), false, 'Body property failed');
            }

            test.done();
        }
    },
    'entitySet - map no key selected': function (test) {
        test.expect(21 + 5 * 5);

        var builderConfig = getBuilderConfig($news.Types.NewsContext, {
            version: 'V2',
            collectionName: 'Articles',
            selectedFields: ['Title', 'Lead']
        });

        var entities = [
            { Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() },
            { Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() },
            { Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() },
            { Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() },
            { Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() }
        ];
        var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
        var response = builder.convertToResponse(entities);
        test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
        //test.equal(response.d.__count, 5, 'object count failed');

        for (var i = 0; i < /*response.d.__count*/ response.d.results.length; i++) {
            var item = response.d.results[i];

            test.equal(item.hasOwnProperty('__metadata'), true, '__metadata property failed');
            test.equal(item.hasOwnProperty('Title'), true, 'Title property failed');
            test.equal(item.hasOwnProperty('Lead'), true, 'Lead property failed');
            test.equal(item.hasOwnProperty('Body'), false, 'Body property failed');

            test.deepEqual(item.__metadata, {
                type: '$news.Types.Article',
                id: 'http://example.com/Articles(' + (i + 1) + ')',
                uri: 'http://example.com/Articles(' + (i + 1) + ')'
            }, '__metadata property value failed');
            test.equal(item.Title, 'Article' + (i + 1), 'Title property value failed');
            test.equal(item.Lead, 'Lead' + (i + 1), 'Lead property value failed');
            test.equal(item.Id, undefined, 'Body property value failed');
            test.equal(item.Body, undefined, 'Body property value failed');

        }

        test.done();
    },
    'entitySet - map key selected': function (test) {
        test.expect(21 + 5 * 5);

        var builderConfig = getBuilderConfig($news.Types.NewsContext, {
            version: 'V2',
            collectionName: 'Articles',
            selectedFields: ['Id', 'Title', 'Lead']
        });

        var entities = [
            { Id: 1, Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date() },
            { Id: 2, Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date() },
            { Id: 3, Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date() },
            { Id: 4, Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date() },
            { Id: 5, Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date() }
        ];
        var builder = new $data.oDataServer.oDataResponseDataBuilder(builderConfig);
        var response = builder.convertToResponse(entities);
        test.equal(response.d.results instanceof $data.Array, true, 'object convert failed');
        //test.equal(response.d.__count, 5, 'object count failed');

        for (var i = 0; i < /*response.d.__count*/ response.d.results.length; i++) {
            var item = response.d.results[i];

            test.equal(item.hasOwnProperty('__metadata'), true, '__metadata property failed');
            test.equal(item.hasOwnProperty('Title'), true, 'Title property failed');
            test.equal(item.hasOwnProperty('Lead'), true, 'Lead property failed');
            test.equal(item.hasOwnProperty('Body'), false, 'Body property failed');

            test.deepEqual(item.__metadata, {
                type: '$news.Types.Article',
                id: 'http://example.com/Articles(' + (i + 1) + ')',
                uri: 'http://example.com/Articles(' + (i + 1) + ')'
            }, '__metadata property value failed');
            test.equal(item.Title, 'Article' + (i + 1), 'Title property value failed');
            test.equal(item.Lead, 'Lead' + (i + 1), 'Lead property value failed');
            test.equal(item.Id, (i + 1), 'Body property value failed');
            test.equal(item.Body, undefined, 'Body property value failed');

        }

        test.done();
    }
}
