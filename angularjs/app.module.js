(function() {
    var profilesTest= [
        {"name":"Annie et Guillaume","accounts": [
            {"name":"Evernote","charset":"base93","length":8,"counter":1,"alg":"md5","user":"annieetguillaume","prefix":"","suffix":""}]},
            {"name":"Guillaume","accounts":[{"name":"Facebook","charset":"base93","length":8,"counter":1,"alg":"md5","user":"verger.guillaume@gmail.com","prefix":"","suffix":""},{"name":"Gmail","charset":"base93","length":8,"counter":1,"alg":"md5","user":"bidon","prefix":"","suffix":""}]}
    ];


    angular.module('passwordsApp', ['states', 'profiles', 'password', 'charsets']);
})();
