(function() {

    angular.
        module('passwordsApp').
        controller('mainController', mainController).
        controller('profileController', profileController).
        controller('accountsController', accountsController).
    controller('currentAccountController', currentAccountController);

    mainController.$inject = ['$scope', 'profilesManager', 'currentState'];
    profileController.$inject = ['$scope', 'profilesManager', 'passwordProvider', 'currentState'];
    accountsController.$inject = ['$scope', '$filter', 'profilesManager', 'currentState'];
    currentAccountController.$inject = ['$rootScope', '$scope', 'profilesManager', 'currentState', 'charsetsProvider']; 

    function mainController($scope, profilesManager, currentState) {
        var vm = this;
        $scope.currentState = currentState;
        $scope.profilesManager = profilesManager;

        vm.profiles = profilesManager.profiles;
        //vm.mainPassword=profilesManager.passwords;

        vm.selectProfile = function(p) {
            currentState.setProfileId(p.id);
        };

        vm.isProfileActive = function(p) {
            return p.id === currentState.getProfileId();
        };

        vm.addProfile = function() {
            var p = profilesManager.newProfile();
            currentState.setProfileId(p.id);
            $('#profile').focus();
        };
        vm.deleteProfile = function(p, idx) {
            alertify.confirm(
                "Do you really want to delete Profile " + 
                    p.name + "?",
                function(e) {
                    if (e) {
                        $scope.$apply(function() {
                            profilesManager.deleteProfile(p);
                            if (idx >= vm.profiles.length && idx > 0) {
                                idx --;
                            }
                            if (vm.profiles.length > 0) {
                                currentState.setProfileId(vm.profiles[idx].id);
                            } else {
                                currentState.noProfileId();
                            }
                        });
                    }
                });
        };
        $scope.$watch(function() {
            return angular.toJson(vm.profiles);
        }, 
        function(value, old) { if (old !== value) { saveProfiles(value); } }, true);

        vm.importProfiles = function() {
            $('#importFile').click();
        };
        $('#importFile').click(function() {
            this.value = null;
        });
        $('#importFile').change(function(e) {
            var files = e.target.files;
            vm.importAccounts(files);
        });
        vm.importAccounts = function(files) {
            var file = files[0];
            var reader = new FileReader();
            reader.onload = function(theFile) {
                $scope.$apply(function() {
                    var oldProfile = vm.profiles;
                    vm.profiles = angular.fromJson(reader.result);
                    vm.selectProfile(vm.profiles[0]);
                });
            };
            reader.readAsText(file);
        };
        vm.exportProfiles = function() {
            var a = window.document.createElement('a');
            a.href = window.URL.createObjectURL( new Blob([angular.toJson(vm.profiles)], {type: 'text/plain;charset=utf-8;'}));

            a.download = 'accounts_data.txt';

            // Append anchor to body.
            document.body.appendChild(a);
            a.click();

            // Remove anchor from body
            document.body.removeChild(a);
        };

        vm.selectProfile(vm.profiles[0]);
    }

    function profileController($scope,  profilesManager,passwordProvider, currentState) {

        var vm = this;

        // Profile update
        vm.profile = profilesManager.getProfile(currentState.getProfileId());
        vm.mainPassword = vm.profile.$$password;

        $scope.$watch('currentState.getProfileId()', function(value, oldValue) {
            vm.profile = profilesManager.getProfile(value);
            if (vm.profile) {
                vm.mainPassword = vm.profile.$$password;
            }
        });

        $scope.$watch( function() { 
            if (vm.profile) {
                return vm.profile.$$password;
            }
            return null;
        },
        function onPasswordChanged(value, oldValue) {
            if (value !== oldValue) {
                vm.checkPassword = passwordProvider.encrypt(
                    'md5', value,'',3,
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZ','','').substr(0,3);
                    vm.generatePassword();
            }
        });

        vm.generatePassword = function() {
            if (vm.profile) {
                vm.genPassword = passwordProvider.generatePassword(
                    vm.profile.$$password,
                    vm.profile.accounts[currentState.getAccountId()]);
            } else {
                vm.genPassword = "";
            }

        };
        $scope.$on('password:to-update', vm.generatePassword);

    }

    function accountsController($scope, $filter, profilesManager, currentState){
        var vm = this;
        vm.profile = profilesManager.getProfile(currentState.getProfileId());

        $scope.$watch('currentState.getProfileId()', function(value) {
            if (profilesManager.getProfile(value)) {
                vm.profile = profilesManager.getProfile(value);
            }
        });

        vm.selectAccount = function(idx) {
            currentState.setAccountId(idx);
        };
        vm.addAccount = function() {
            var account = profilesManager.newAccount(vm.profile);
            vm.selectAccount(vm.profile.accounts.length-1);
            $('#accountname').select();
        };
        vm.deleteAccount = function(ac) {
            var idx = vm.profile.accounts.indexOf(ac);
            vm.profile.accounts.splice(idx,1);
            var selIdx = currentState.getAccountId();
            if (selIdx == vm.profile.accounts.length) {
                selIdx = selIdx - 1;
            }
            vm.selectAccount(selIdx);
        };
    }


    function currentAccountController($rootScope, $scope, profilesManager, currentState, charsetsProvider) {

        $scope.currentState = currentState;
        $scope.charsetsProvider = charsetsProvider;
        var vm = this;
        var profile = profilesManager.getProfile(currentState.getProfileId());
        if (profile) {
            vm.account = profile.accounts[currentState.getAccountId()];
        }

        $scope.$on('state:account:updated', function(event) {
            var profile = profilesManager.getProfile(currentState.getProfileId());
            if (profile) {
                vm.account = profile.accounts[currentState.getAccountId()];
            }
        });
        $scope.$watch(function() {
            if (vm.account) {
                return vm.account.alg;
            }
            return null;
        }, function(alg, old_alg) {
            if (alg !== old_alg) {
                if (alg == "md5_v6" || alg == "hmac-md5_v6") {
                    vm.account.charset = 'base16';
                    $scope.charsetdisabled = true;
                }
                else {
                    $scope.charsetdisabled = false;
                }
            }
        });
        $scope.$watch(function() {
            return vm.account;
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
})();
