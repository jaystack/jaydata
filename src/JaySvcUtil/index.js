import $data from '../TypeSystem/index.js';
import { DynamicMetadata, odatajs } from 'jaydata-dynamic-metadata';

$data.DynamicMetadata = DynamicMetadata;
var dynamicMetadata = new DynamicMetadata($data);
$data.service = dynamicMetadata.service.bind(dynamicMetadata);
$data.initService = dynamicMetadata.initService.bind(dynamicMetadata);
$data.odatajs = odatajs;

export default $data
