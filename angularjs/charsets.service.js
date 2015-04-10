(function() {

    angular.
        module("charsets").
        factory("charsetsProvider", charsets);

    charsets.$inject = ["$log"];

    function charsets($log) {
        var service = {
            options: [
                { 
                    value:'base93',
                    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`~!@#$%^&*()_-+={}|[]\\:\";\'<>?,./"
                },
                {
                    value:'base62',
                    chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                },
                {
                    value:'base16',
                    chars:"0123456789abcdef"
                },
                {
                    value:'letters',
                    chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
                },
                {
                    value:'numbers',
                    chars:"0123456789"
                }
            ],
            get: get
        };

        var lookup = {};

        for (var i in service.options) {
            var aCharset = service.options[i];
            if (!lookup[aCharset.value]) {
                lookup[aCharset.value] = i;
            }
            else {
                $log.error("Duplicate values : " + aCharset.value);
            }
        }

        return service;

        function get(value) {
           return service.options[lookup[value]]; 
        }

    }
})();
