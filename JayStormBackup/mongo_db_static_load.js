require('jaydata');
$data.Entity.extend('$data.MasterItem', {
	Id:{type:'id', key:true, computed:true},
	Index:{type:'int'},
	Txt:{type:'string'}
});
$data.Entity.extend('$data.DetailItem', {
	Id:{type:'id', key:true, computed:true},
	Index:{type:'int'},
	MasterIndex:{type:'int'},
	Txt:{type:'string'}
});

$data.EntityContext.extend('$data.TestCtx', {
	MasterTable:{type:$data.EntitySet, elementType:$data.MasterItem},
	DetailTable:{type:$data.EntitySet, elementType:$data.DetailItem}
});

var ctx = new $data.TestCtx({name:'mongoDB', databaseName:'test1'});
ctx.onReady(function(){
	for(var i=0;i<100;i++){
		ctx.MasterTable.add(new $data.MasterItem({Index:i,Txt:'élkhlkjh k jh lkhjlkjhlkh m,ncvlysk pwerasfgvaskldj ghlasdkn cvlasckndf 9q34ugsdv,bagrv e'}));
		for(var j=0;j<3;j++){
			ctx.DetailTable.add(new $data.DetailItem({Index:j, MasterIndex:i, Txt:"llkjh lkj hlkjh lkj hlkjh lkjh lhk "}));		
		}	
		ctx.saveChanges();
	}
});
