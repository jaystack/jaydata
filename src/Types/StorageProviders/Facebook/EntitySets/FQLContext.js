$data.Class.define('$data.storageProviders.Facebook.EntitySets.Command', null, null, {
    constructor: function (cfg) {
        this.Config = $data.typeSystem.extend({
            CommandValue: ""
        }, cfg);
    },
    toString: function () {
        return this.Config.CommandValue;
    },
    Config: {}
}, {
    'to$data.Integer': function (value) {
        return value;
    },
    'to$data.Number': function (value) {
        return value;
    }
});

$data.Class.define("$data.Facebook.FQLContext", $data.EntityContext, null, {
    constructor: function(){
        var friendsQuery = this.Friends
                .where(function (f) { return f.uid1 == this.me; }, { me: $data.Facebook.FQLCommands.me })
                .select(function (f) { return f.uid2; });

        this.MyFriends = this.Users
                .where(function (u) { return u.uid in this.friends; }, { friends: friendsQuery });
    },
    Users: {
        dataType: $data.EntitySet,
        tableName: 'user',
        elementType: $data.Facebook.types.FbUser
    },
    Friends: {
        dataType: $data.EntitySet,
        tableName: 'friend',
        elementType: $data.Facebook.types.FbFriend
    },
    Pages: {
        dataType: $data.EntitySet,
        tableName: 'page',
        elementType: $data.Facebook.types.FbPage
    }
}, null);

$data.Facebook.FQLCommands = {
    __namespace: true,
    me: new $data.storageProviders.Facebook.EntitySets.Command({ CommandValue: "me()" }),
    now: new $data.storageProviders.Facebook.EntitySets.Command({ CommandValue: "now()" })
};


