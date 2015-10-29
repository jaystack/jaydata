import $data from 'jaydata/core';

$data.mongoDBDriver = require('mongodb');

import objectid from './ClientObjectID.js';
import converter from './mongoDBConverter.js';
import modelbinder from './mongoDBModelBinderConfigCompiler.js';
import filter from './mongoDBFilterCompiler.js';
import fn from './mongoDBFunctionCompiler.js';
import order from './mongoDBOrderCompiler.js';
import paging from './mongoDBPagingCompiler.js';
import projection from './mongoDBProjectionCompiler.js';
import compiler from './mongoDBCompiler.js';
import provider from './mongoDBStorageProvider.js';

export default $data;
