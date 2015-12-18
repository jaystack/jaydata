import odatajs from 'odatajs'

class MetadataReader {

	read({url}, done) {
		console.log(url)
		odatajs.oData.read(url,
		r => done(undefined, r),
		e => done(e),
		odatajs.oData.metadataHandler)
	}
}

export default new MetadataReader()