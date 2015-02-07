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

var emptyProfile = {"name":"New Profile","accounts":[]};
var emptyAccount = {"name":"","charset":"base93","length":8,"counter":1,"alg":"md5","user":"","prefix":"","suffix":""};

var module = angular.module('passwordsApp', []);

module.controller('mainController', function($scope) {

  $scope.profiles = angular.fromJson(window.localStorage.getItem("profiles"));
  if ($scope.profiles == null) {
    $scope.profiles = [jQuery.extend(true,{},emptyProfile)];
  }

  $scope.selectProfile = function(idx) {
    $scope.selectedProfile = idx;
    $scope.selectAccount(0);
  };
  $scope.addProfile = function() {
    $scope.profiles.push(jQuery.extend(true,{},emptyProfile));
    $scope.selectProfile($scope.profiles.length -1);
    $('#profile').focus();
  };
  $scope.deleteProfile = function() {
    alertify.confirm(
      "Do you really want to delete Profile " + 
      $scope.profiles[$scope.selectedProfile].name + "?",
      function(e) {
        if (e) {
          $scope.$apply(function() {
            $scope.profiles.splice($scope.selectedProfile,1);
            if ($scope.selectedProfile >= $scope.profiles.length) {
              $scope.selectedProfile --;
            }
          });
        };
      });
  };
  $scope.selectAccount = function(idx) {
    $scope.selectedAccount = idx;
  };
  $scope.$watch('mainPassword[selectedProfile]', function() {
    $scope.passwordToGenerate();
  });
  //$scope.$watch(function() { return angular.toJson($scope.profiles); }, function(old,value) { saveProfiles(value) alertify.log("Save"); },true);
  $scope.$watchCollection(function() { return angular.toJson($scope.profiles);}, function(value, old) { if (old !== value) {saveProfiles(value);
                          //                         alertify.log(old);alertify.log(value);
  } });
  $scope.passwordToGenerate = function() {
    setCheckPassword($scope);
    $scope.genPassword = preGeneratePassword($scope.mainPassword[$scope.selectedProfile], $scope.profiles[$scope.selectedProfile].accounts[$scope.selectedAccount]);
  }
  $scope.importProfiles = function() {
    $('#importFile').click();
  }
  $('#importFile').click(function() {
    this.value = null;
  });
  $('#importFile').change(function(e) {
    var files = e.target.files;
    $scope.importAccounts(files);
  });
  $scope.importAccounts = function(files) {
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(theFile) {
      $scope.$apply(function() {
        $scope.profiles = angular.fromJson(reader.result);
        $scope.selectProfile(0);
        $scope.selectAccount(0);
      });
    };
    reader.readAsText(file);
  };
  $scope.exportProfiles = function() {
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL( new Blob([angular.toJson($scope.profiles)], {type: 'text/plain;charset=utf-8;'}));

    a.download = 'accounts_data.txt';

    // Append anchor to body.
    document.body.appendChild(a)
    a.click();

    // Remove anchor from body
    document.body.removeChild(a)
  };



  $scope.mainPassword={};
  $scope.selectProfile(0);
});

module.controller('accountsController', function($scope, $filter){
  $scope.$watch('profiles[selectedProfile].accounts', function(value) {
    $scope.accounts = value;
  });
  $scope.showElement = {};
  $scope.hover = function(el) {
    if ($scope.showElement[el]) {
      $scope.showElement[el]  = !$scope.showElement[el];
    }
    else {
      $scope.showElement[el] = true;
    }
  }
  $scope.addAccount = function() {
    $scope.accounts.push(jQuery.extend(true, {}, emptyAccount));
    $scope.selectAccount($scope.accounts.length-1);
    $('#accountname').select();
  }
  $scope.deleteAccount = function(ac, $index) {
    for (var idx = 0, len = $scope.accounts.length; idx < len; idx++) {
      var ac_idx = $scope.accounts[idx];
      if (ac_idx.name == ac.name && ac_idx.user == ac.user) {
        alertify.log("Removing " + ac.name);
        $scope.accounts.splice(idx,1);
        if ($index == $scope.accounts.length) {
          $index = $index - 1;
        }
        $scope.selectAccount($index);
        return ;
      }
    }
  }
});

module.controller('currentAccountController', function($scope) {
  $scope.$watch('accounts[selectedAccount]', function(value) {
    $scope.account = value;
  });
  $scope.$watch("account.alg", function(alg) {
    if (alg == "md5_v6" || alg == "hmac-md5_v6") {
      $scope.account.charset = 'base16';
      $scope.charsetdisabled = true;
    }
    else {
      $scope.charsetdisabled = false;
    }
  });
  $scope.$watch(function() {
    return angular.toJson($scope.account);
  }, function(value) {
    $scope.passwordToGenerate();
  });
});

function checkLocalStorageSupport() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

function saveProfiles(profiles) {
  if (!checkLocalStorageSupport()) {
    alertify.error('No storage for this browser');
  }
  window.localStorage.setItem('profiles',profiles);
}
