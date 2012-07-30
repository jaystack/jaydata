$(function () {
    function LogViewModel() {
        var self = this;
        self.logs = ko.observableArray([]);
    };
    
    var viewModel = new LogViewModel();

    ko.applyBindings(viewModel);
    
    var query = function(){
        $.ajax({
            url: '/log/query'
        }).done(function(data){
            viewModel.logs(data);
        });
    };
    
    query();
    
    $('#log-clear').click(function(){
        $.ajax({
            url: '/log/clear'
        }).done(function(){
            query();
        })
    });

});
