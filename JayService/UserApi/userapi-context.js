/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 8/6/12
 * Time: 11:24 AM
 * To change this template use File | Settings | File Templates.
 */
$data.Entity.extend('$data.UserAPI.User', {
    UserId: { type: 'id', key: true, computed: true },
    UserName: { type: 'string', required: true },
    MobileAlias: { type: 'string', required: false },
    Disabled: { type: 'boolean' }
});
$data.EntityContext.extend('$data.UserAPI.Context', {
    Users: { type: $data.EntitySet, elementType: $data.UserAPI.User }
});