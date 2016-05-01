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
        if (profiles === null) {
            profiles = [];
            newProfile();
        }

        var service = {
            profiles: profiles,
            password: password,
            newProfile: newProfile,
            getProfile: getProfile,
            getProfileFromIdx: getProfileFromIdx,
            mergeWithProfiles: mergeWithProfiles,
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


        return service;

        function newProfile() {
            var newP = angular.copy(emptyProfile);
            newP.id = nextId;
            nextId ++;
            profiles.push(newP);
            return newP;
        }

        function addProfile(p) {
            p.id = nextId;
            nextId ++;
            profiles.push(p);
            return p;
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

         function mergeWithProfiles(listofprofiles) {
            for (var i = 0; i < listofprofiles.length; i++) {
                var p = listofprofiles[i];
                var already_there = false;
                for (var j = 0; j < profiles.length; j++) {
                    if (profiles[j].name == p.name) {
                        for (var acIdx = 0; acIdx < p.accounts.length; acIdx++) {
                            addToProfile(p.accounts[acIdx], profiles[j]);
                        };
                        already_there = true;
                        continue;
                    }
                };
                if (!already_there) {
                    addProfile(p);
                }
            };
        };

        function addToProfile(ac, p) {
            for (var i = 0; i < p.accounts.length; i++) {
                var pAc = p.accounts[i];
                if (pAc.name == ac.name && pAc.user == ac.user) {
                    //alertify.log(ac.name + "(" + ac.user + ") already present");
                    return ;
                }
            };
            // Attention, pas de copie de ac !
            p.accounts.push(ac);
        }


    }

})();
