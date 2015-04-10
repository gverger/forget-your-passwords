var charsets={
    'base93': "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:\";\'<>?,./",
    'base62': "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    'base16': "0123456789abcdef",
    'letters': "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    'numbers': "0123456789"
};

var profilesTest= [
    {"name":"Annie et Guillaume","accounts": [
        {"name":"Evernote","charset":"base93","length":8,"counter":1,"alg":"md5","user":"annieetguillaume","prefix":"","suffix":""}]},
        {"name":"Guillaume","accounts":[{"name":"Facebook","charset":"base93","length":8,"counter":1,"alg":"md5","user":"verger.guillaume@gmail.com","prefix":"","suffix":""},{"name":"Gmail","charset":"base93","length":8,"counter":1,"alg":"md5","user":"bidon","prefix":"","suffix":""}]}
];

var emptyAccount = {"name":"","charset":"base93","length":8,"counter":1,"alg":"md5","user":"","prefix":"","suffix":""};

var module = angular.module('passwordsApp', ['states', 'profiles', 'password']);

module.controller('mainController', ['$scope', 'profilesManager', 'currentState', mainController]);

function mainController($scope, profilesManager, currentState) {
    var mv = this;
    $scope.currentState = currentState;
    $scope.profilesManager = profilesManager;

    mv.profiles = profilesManager.profiles;
    //mv.mainPassword=profilesManager.passwords;

    mv.selectProfile = function(p) {
        currentState.setProfileId(p.id);
    };

    mv.isProfileActive = function(p) {
        return p.id === currentState.getProfileId();
    };

    mv.addProfile = function() {
        var p = profilesManager.newProfile();
        currentState.setProfileId(p.id);
        $('#profile').focus();
    };
    mv.deleteProfile = function(p, idx) {
        alertify.confirm(
            "Do you really want to delete Profile " + 
               p.name + "?",
            function(e) {
                if (e) {
                    $scope.$apply(function() {
                        profilesManager.deleteProfile(p);
                        if (idx >= mv.profiles.length && idx > 0) {
                            idx --;
                        }
                        if (mv.profiles.length > 0) {
                            currentState.setProfileId(mv.profiles[idx].id);
                        } else {
                            currentState.noProfileId();
                        }
                    });
                }
            });
    };
    $scope.$watch(function() {
        return angular.toJson(mv.profiles);
    }, 
    function(value, old) { if (old !== value) { saveProfiles(value); } }, true);

    mv.importProfiles = function() {
        $('#importFile').click();
    };
    $('#importFile').click(function() {
        this.value = null;
    });
    $('#importFile').change(function(e) {
        var files = e.target.files;
        mv.importAccounts(files);
    });
    mv.importAccounts = function(files) {
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function(theFile) {
            $scope.$apply(function() {
                var oldProfile = mv.profiles;
                mv.profiles = angular.fromJson(reader.result);
                mv.selectProfile(mv.profiles[0]);
            });
        };
        reader.readAsText(file);
    };
    mv.exportProfiles = function() {
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL( new Blob([angular.toJson(mv.profiles)], {type: 'text/plain;charset=utf-8;'}));

        a.download = 'accounts_data.txt';

        // Append anchor to body.
        document.body.appendChild(a);
        a.click();

        // Remove anchor from body
        document.body.removeChild(a);
    };

    mv.selectProfile(mv.profiles[0]);
}

module.controller('profileController', ['$scope', 'profilesManager', 'passwordProvider', 'currentState', profileController]);
function profileController($scope,  profilesManager,passwordProvider, currentState) {

    var mv = this;

    // Profile update
    mv.profile = profilesManager.getProfile(currentState.getProfileId());
    mv.mainPassword = mv.profile.$$password;

    $scope.$watch('currentState.getProfileId()', function(value, oldValue) {
            mv.profile = profilesManager.getProfile(value);
            if (mv.profile) {
                mv.mainPassword = mv.profile.$$password;
            }
    });

    $scope.$watch( function() { 
        if (mv.profile) {
            return mv.profile.$$password;
        }
        return null;
    },
    function onPasswordChanged(value, oldValue) {
        if (value !== oldValue) {
            mv.checkPassword = passwordProvider.encrypt(
                'md5', value,'',3,
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ','','').substr(0,3);
                mv.generatePassword();
        }
    });

    mv.generatePassword = function() {
        if (mv.profile) {
        mv.genPassword = passwordProvider.generatePassword(
            mv.profile.$$password,
            mv.profile.accounts[currentState.getAccountId()]);
        } else {
            mv.genPassword = "";
        }
            
    };
    $scope.$on('password:to-update', mv.generatePassword);

}

module.controller('accountsController', function($scope, $filter, profilesManager, currentState){
    var mv = this;
    mv.accounts = profilesManager.getProfile(currentState.getProfileId()).accounts;

    $scope.$watch('currentState.getProfileId()', function(value) {
        if (profilesManager.getProfile(value)) {
            mv.accounts = profilesManager.getProfile(value).accounts;
        }
    });

    mv.selectAccount = function(idx) {
        currentState.setAccountId(idx);
    };
    mv.addAccount = function() {
        mv.accounts.push(jQuery.extend(true, {}, emptyAccount));
        mv.selectAccount(mv.accounts.length-1);
        $('#accountname').select();
    };
    mv.deleteAccount = function(ac) {
        var idx = mv.accounts.indexOf(ac);
        mv.accounts.splice(idx,1);
        var selIdx = currentState.getAccountId();
        if (selIdx == mv.accounts.length) {
            selIdx = selIdx - 1;
        }
        mv.selectAccount(selIdx);
    };
});

module.controller('currentAccountController', ['$rootScope', '$scope', 'profilesManager', 'currentState', currentAccountController]);

function currentAccountController($rootScope, $scope, profilesManager, currentState) {

    $scope.currentState = currentState;
    var mv = this;
        var profile = profilesManager.getProfile(currentState.getProfileId());
        if (profile) {
            mv.account = profile.accounts[currentState.getAccountId()];
        }

    $scope.$on('state:account:updated', function(event) {
        var profile = profilesManager.getProfile(currentState.getProfileId());
        if (profile) {
            mv.account = profile.accounts[currentState.getAccountId()];
        }
    });
    $scope.$watch(function() {
        if (mv.account) {
            return mv.account.alg;
        }
        return null;
    }, function(alg, old_alg) {
        if (alg !== old_alg) {
            if (alg == "md5_v6" || alg == "hmac-md5_v6") {
                mv.account.charset = 'base16';
                $scope.charsetdisabled = true;
            }
            else {
                $scope.charsetdisabled = false;
            }
        }
    });
    $scope.$watch(function() {
        return mv.account;
    }, function(value) {
        $rootScope.$broadcast('password:to-update');
    }, true);
}

function checkLocalStorageSupport() {
    try {
        return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
        return false;
    }
}

function saveProfiles(profiles) {
    if (!checkLocalStorageSupport()) {
        alertify.error('No storage for this browser');
    }
    alertify.log("Save" + profiles);
    //window.localStorage.setItem('profiles',profiles);
}
