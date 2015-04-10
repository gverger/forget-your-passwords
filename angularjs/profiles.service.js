(function() {


    angular.module('profiles').factory('profilesManager', profilesManager);

    var emptyProfile = {
        "name":"New Profile",
        "$$password":"", // $$ to make it exclude from angular to json
        "accounts":[]
    };

    var emptyAccount = {
        "name":"",
        "charset":"base93",
        "length":8,
        "counter":1,
        "alg":"md5",
        "user":"",
        "prefix":"",
        "suffix":""
    };

    function profilesManager() {

        var profiles = angular.fromJson(window.localStorage.getItem("profiles"));
        var service = {
            profiles: profiles,
            password: password,
            newProfile: newProfile,
            getProfile: getProfile,
            getProfileFromIdx: getProfileFromIdx,
            deleteProfile: deleteProfile,
            newAccount: newAccount
        };


        // Test des identifiants
        // Coherence avec versions precedentes
        var cpt = 1;
        var nextId = 1;
        for ( var i in profiles ) {
            var p = profiles[i];
            if (!p.id) {
                p.id = cpt;
                cpt++;
            }
            if (nextId <= p.id) {
                nextId = p.id+1;
            }
            if (!p.$$password) {
                p.$$password = "";
            }
        }

        if (profiles === null) {
            profiles = [];
            newProfile();
        }

        return service;

        function newProfile() {
            var newP = angular.copy(emptyProfile);
            newP.id = nextId;
            nextId ++;
            profiles.push(newP);
            return newP;
        }

        function getProfile(profileId) {
            for ( var i = 0; i < profiles.length; i++ ) {
                if (profiles[i].id === profileId) {
                    return profiles[i];
                }
            }
            return null;
        }

        function getProfileFromIdx(profileIdx) {
            return profiles[profileIdx];
        }

        function password(profile) {
            return profile.$$password;
        }

        function deleteProfile(profile) {
            for ( var idx = 0; idx < profiles.length; idx++ ) {
                if ( profile.id === profiles[idx].id ) {
                    profiles.splice(idx,1);
                    return profile;
                }
            }
            return null;
        }

        function newAccount(profile) {
            var account = angular.copy(emptyAccount);
            profile.accounts.push(account);
            return account;
        }

    }

})();
