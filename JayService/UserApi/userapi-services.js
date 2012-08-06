/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 8/6/12
 * Time: 11:25 AM
 * To change this template use File | Settings | File Templates.
 */
$data.ServiceBase.extend('$data.UserAPI.FunctionImport', {
    addEntity: (function(name, fullname, namespace){
        return function(success, error){
            var self = this;
            this.context.Entities.filter(function(it){ return it.FullName === this.fullname; }, { fullname: fullname }).length(function(cnt){
                if (cnt) self.error('Entity type already exists.');
                else{
                    self.context.Entities.add(new $data.ContextAPI.Entity({
                        Name: name,
                        FullName: fullname,
                        Namespace: namespace
                    }));
                    self.context.saveChanges(self);
                }
            });
        };
    }).toServiceOperation().params([
        { name: 'name', type: 'string' },
        { name: 'fullname', type: 'string' },
        { name: 'namespace', type: 'string' }
    ]).returns('int')
});