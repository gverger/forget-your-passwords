(function() {

    angular.module('states')
        .factory('currentState', ['$rootScope', currentState]);

    function currentState($rootScope) {

        var service = {
            setProfileId: setProfileId,
            getProfileId: getProfileId,
            setAccountId: setAccountId,
            getAccountId: getAccountId
        };

        var profileId = 0;
        var accountId = 0;

        var accountIds = [];

        function getProfileId() {
            return profileId;
        }

        function getAccountId() {
            return accountId;
        }

        function setAccountId(id) {
            //if (id !== accountId) {
                accountId = id;
                $rootScope.$broadcast('state:account:updated');
            //}
        }
        
        function setProfileId(id) {
            //if (id !== profileId) {
                accountIds[profileId] = accountId;
                profileId = id;
                accountId = accountIds[profileId] || 0;
                $rootScope.$broadcast('state:profile:updated');
                $rootScope.$broadcast('state:account:updated');
            //}
        }

        return service;
    }

})();
