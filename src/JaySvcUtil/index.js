import $data from '../TypeSystem/index.js';
import { DynamicMetadata, odatajs, Annotations, Metadata } from 'jaydata-dynamic-metadata';

$data.Annotations = Annotations;
$data.Metadata = Metadata;

$data.DynamicMetadata = DynamicMetadata;
var dynamicMetadata = new DynamicMetadata($data);
$data.service = dynamicMetadata.service.bind(dynamicMetadata);
$data.initService = dynamicMetadata.initService.bind(dynamicMetadata);
$data.odatajs = odatajs;

export default $data
