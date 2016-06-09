// import mock$data from '../core.js';
// import $data from 'jaydata/core';
// import { expect } from 'chai';

// describe('OpenType Entity', () => {
// 	it('should transform raw open type JSON to typed entity with dynamic fields', () => {
// 		var type = $data.Entity.extend('OpenEntity', {
// 			id: { type: 'int', key: true, computed: true },
// 			key: { type: 'string' },
// 			value: { type: 'string' }
// 		}, {
// 			openType: { value: 'external' }
// 		});
// 		var mb = new $data.ModelBinder({
// 			storageProvider: {
// 				fieldConverter: {
// 					fromDb: {
// 						'$data.Integer': (value) => { return value; },
// 						'$data.String': (value) => { return value; }
// 					}
// 				}
// 			}
// 		});
// 		var mbConfig = {
// 			$type: $data.Array,
// 			$item: {
// 				$type: type,
// 				id: 'id',
// 				key: 'key',
// 				value: 'value'
// 			}
// 		};
// 		var result = mb.call([{
// 			id: 1,
// 			key: 'key',
// 			value: 'value',
// 			dyn1: 42,
// 			dyn2: 'cats',
// 			dyn3: {
// 				a: 1,
// 				b: 2
// 			},
// 			dyn4: true
// 		}], mbConfig);
		
// 		expect(result[0].id).to.equal(1);
// 		expect(result[0].key).to.equal('key');
// 		expect(result[0].value).to.equal('value');
// 		expect(result[0].external).to.deep.equal({
// 			dyn1: 42,
// 			dyn2: 'cats',
// 			dyn3: {
// 				a: 1,
// 				b: 2
// 			},
// 			dyn4: true
// 		});
// 	});
// });