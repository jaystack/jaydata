var fn = function(){

};

fn.prototype.method = function(){
    console.log(eval('user'));
};

var inst = new fn();

var invoke = function(){
    var user = {name:'foo'};
    //console.log(inst.method.toString());
    //var fn = eval('(' + inst.method.toString() + ')');
    //fn();
    inst.method();
};

invoke(1, 2, 3);
