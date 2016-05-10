import $data from '../TypeSystem/index.js';
import { DynamicMetadata } from 'jaydata-dynamic-metadata';

$data.DynamicMetadata = DynamicMetadata;
var dynamicMetadata = new DynamicMetadata($data);
$data.service = dynamicMetadata.service.bind(dynamicMetadata);
$data.initService = dynamicMetadata.initService.bind(dynamicMetadata);

export default $data
