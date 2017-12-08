(function(){
    'use strick';

    angular.module('app', [
        'ngMaterial',
        'ngMessages',
        'ngAnimate',
        'ui.router',
        'app.user',
        'app.class'
    ])
    .value('variables', {
        "urlApi": 'http://localhost/sweep-manager/src/API',
    });

})();

(function(){
    'use strict';
    
    angular
        .module('app.class', [
            'ui.router',
            'app.user'
        ])
})();

(function(){
    'use strict';
    
    angular
        .module('app.user', [
            'ui.router'
        ])
})();
(function () {
    'use strict';

    angular
        .module('app.class')
        .controller('ClassController', ClassController);

    ClassController.$inject = ['loginFactory', 'userFactory', '$mdDialog', 'orderByFilter', '$state'];

    function ClassController(loginFactory, userFactory, $mdDialog, orderByFilter, $state) {
        var vm = this;
        vm.className = loginFactory.getUser().user_class;
        vm.editStudants = editStudants;
        vm.editStudantDialog = editStudantDialog;
        vm.exit = exit;
        vm.newStudantDialog = newStudantDialog;
        vm.notSelected = notSelected;
        vm.removeStudant = removeStudant;
        vm.someoneStudant = someoneStudant;
        vm.studants = orderStudants(loginFactory.getUser().studants);
        vm.sweep = sweep;
        vm.toggleSelecteds = toggleSelecteds;


        vm.$onInit = function () {
            if (!vm.studants) {
                vm.studants = [];
            }
        }

        /* Private */
        function exit() {
            $state.go('home');
        }

        function convertSelectsStudants(selecteds) {
            var studantsKeys = [];
            for (var key in selecteds) {
                if (selecteds[key]) {
                    studantsKeys.push(new Number(key));
                }
            }
            var studantsSelects = [];
            for (var key in studantsKeys) {
                studantsSelects.push(vm.studants[studantsKeys[key]]);
            }
            return studantsSelects;
        }

        function orderStudants(studants) {
            studants = angular.forEach(studants, function (studant) {
                studant.times = new Number(studant.times);
            });
            return orderByFilter(studants, ['times', 'name']);
        }

        function objectToArray(object) {
            var array = [];
            angular.forEach(object, function (item) {
                array.push(item);
            });
            return array;
        }

        /* Publics */
        function editStudantDialog($event, studants, callback) {
            var body = angular.element(document.body);
            $mdDialog.show({
                parent: body,
                targetEvent: $event,
                templateUrl: 'app/class/edit-studant-dialog.html',
                locals: {
                    editStudants: angular.copy(studants),
                    callback: callback
                },
                controller: EditStudantDialogController,
                controllerAs: 'vm'
            });

            EditStudantDialogController.$inject = ['editStudants', 'callback', '$mdDialog', 'userFactory'];

            function EditStudantDialogController(editStudants, callback, $mdDialog, userFactory) {
                var vm = this;
                vm.close = close;
                vm.editStudants = editStudants;
                vm.callbackEditStudant = callback;
                vm.studants = angular.copy(convertSelectsStudants(studants));

                function close() {
                    $mdDialog.hide();
                }

                function editStudants(editStudants, callback) {

                    userFactory.editStudants(editStudants).then(function (result) {
                        callback(editStudants);
                    });
                }

            }

        }

        /* Publics */
        function editStudants(studants) {
            vm.studants = vm.studants.map(function (studant) {
                studants.forEach(function (editStudant) {
                    if (editStudant.id == studant.id) {
                        studant = editStudant;
                    }
                });
                return studant;
            });
            $mdDialog.hide();
        }

        function notSelected(swepper, value) {
            return swepper != value;
        }

        function newStudantDialog(event) {
            var confirm = $mdDialog.prompt()
                .title('Cadastro')
                .textContent('Preencha o campo abaixo para cadastrar um aluno.')
                .placeholder('Aluno')
                .ariaLabel('Aluno')
                .targetEvent(event)
                .ok('Adicionar')
                .cancel('Cancelar');

            $mdDialog.show(confirm).then(function (result) {
                var data = {
                    class: loginFactory.getUser().user_id,
                    name: result
                };
                userFactory.createStudant(data).then(function (result) {
                    var studant = result.data;
                    vm.studants.push({
                        id: studant.studant_id,
                        name: studant.studant_name,
                        times: studant.studant_times,
                    });
                    vm.studants = orderStudants(vm.studants);
                });
            });
        };

        function removeStudant(studants) {
            var studantsSelects = convertSelectsStudants(studants);
            userFactory.removeStudants(studantsSelects).then(function () {
                vm.studants = vm.studants.filter(function (studant) {
                    angular.copy({}, studants);
                    return studantsSelects.indexOf(studant) == -1;
                });
            });
        }

        function someoneStudant(studants) {
            studants = objectToArray(studants);
            return studants && studants.indexOf(true) != -1;
        }

        function sweep(studants) {
            userFactory.sweep(studants);
            studants = objectToArray(studants);
            vm.studants = vm.studants.map(function (studant) {
                if (studants.indexOf(studant) != -1) {
                    studant.times++;
                    return studant;
                }
                return studant;
            });
            vm.studants = orderStudants(vm.studants);
        }

        function toggleSelecteds(studants, selected) {
            if (selected) {
                angular.copy({}, studants);
            } else {
                var i = 0;
                var newSelect = {};
                angular.forEach(vm.studants, function (studant) {
                    newSelect[i++] = true;
                });
                angular.copy(newSelect, studants);
            }
        }
    }
})();

(function(){
    'use strict';

    angular
        .module('app.class')
        .config(routes)

        routes.$inject = ['$stateProvider'];
        function routes($stateProvider){
            $stateProvider
                .state('class', {
                    url: '/turma',
                    templateUrl: 'app/class/class.html',
                    controller: 'ClassController',
                    controllerAs: 'vm',
                    onEnter: ['$state', 'loginFactory',function($state, loginFactory){
                        if(loginFactory.getUser() == {}) $state.go("home");
                        if(!loginFactory.getUser().user_id) $state.go("home");
                        if(!loginFactory.getUser().user_class) $state.go("firstTime");
                    }]
                })
                .state('firstTime', {
                    url: '/turma/primeiravisita',
                    templateUrl: 'app/class/first-time.html',
                    controller: 'FirstTimeController',
                    controllerAs: 'vm',
                    onEnter: ['$state', 'loginFactory',function($state, loginFactory){
                        if(loginFactory.getUser() == {}) $state.go("home");
                        if(!loginFactory.getUser().user_id) $state.go("home");
                        if(loginFactory.getUser().user_class) $state.go("class");
                    }]
                })
        }

})();

(function () {
    'use strict';

    angular
        .module('app.class')
        .controller('FirstTimeController', FirstTimeController);

    FirstTimeController.$inject = ['userFactory', 'loginFactory', '$state'];

    function FirstTimeController(userFactory, loginFactory, $state) {
        var vm = this;
        vm.setClass = setClass;

        function setClass(className) {
            var data = {
                className: className
            }
            userFactory.defineClassName(data);
            loginFactory.getUser().user_class = className;
            $state.go('class');
        }
    }
})();

(function(){
    'use strick';

    angular
        .module('app')
        .config(routes)
    
    routes.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];
    function routes ($locationProvider, $stateProvider, $urlRouterProvider) {
        $stateProvider
            .state({
                name: 'home',
                url: '/',
                controller: "homeController",
                controllerAs: "homeVm",
                templateUrl: "app/pages/home.html" 
            });
        $urlRouterProvider.otherwise('/');
    }
    
})();
(function () {
    'use strict';

    angular
        .module('app')
        .config(materialTheme)

    materialTheme.$inject = ['$mdThemingProvider'];

    function materialTheme($mdThemingProvider) {
        $mdThemingProvider
            .theme('default')
            .primaryPalette('teal')
            .accentPalette('indigo');
    };
})();

(function () {
    'use strict';

    angular
        .module('app')
        .directive('passwordCheck', passwordCheck);

    passwordCheck.$inject = [];

    function passwordCheck() {
        var directive = {
            require: 'ngModel',
            link: link,
            restrict: 'A',
            scope: {
                passwordCheck: "=passwordCheck"
            },
        };
        return directive;

        function link(scope, element, attrs, controller) {
            controller.$validators.passwordCheck = function (modelValue, viewValue) {
                return scope.passwordCheck === modelValue;
            }
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('app')
        .controller('homeController', homeController);

    homeController.$inject = ['$state','loginFactory', 'userFactory'];
    function homeController($state, loginFactory, userFactory){
        var vm = this;            
        
        //Variables
        vm.signin = {};
        vm.isUserAvailability = 1;
        vm.userAction = 'login';  
        
        //Functions
        vm.isAction = isAction;
        vm.setAction = setAction;
        vm.userCreated = userCreated;
        vm.userLogged = userLogged;
        
        //Publics
        function isAction(action){
            return vm.userAction === action;
        }
        
        function setAction(action){
            vm.userAction = action;
        }
        
        function userCreated(user){
            userFactory.login(user).then(function(result){
                userLogged(result.data);
            });
        }

        function userLogged(){
            $state.go("class");
        }
        
    }
})();

(function(){
    'use strict';
    
    angular
        .module('app.user')
        .factory('loginFactory', loginFactory);
    
    loginFactory.$inject = [];
    function loginFactory(){
        var user = false;
        
        var service = {
            getUser: getUser,
            setUser: setUser,
            cleanUser: cleanUser
        }
        return service;
        
        function getUser(){
            return user;
        }
        
        function setUser(newUser){
            user = newUser;
        }
        
        function cleanUser(){
            setUser(false);
        }

    }
})();

(function() {
    'use strict';

    angular
        .module('app.user')
        .controller('SignController', SignController);

    SignController.$inject = ['$rootScope', '$scope','userFactory', 'loginFactory'];
    function SignController($rootScope, $scope, userFactory, loginFactory){
        var vm = this;
        vm.create = create;
        vm.login = login;
        vm.logout = logout;

        function create(user, form, success, error){
            var userData = angular.copy(user);
            angular.copy({}, user);
            userFactory.create(userData).then(function(result){
                if($scope[form]){
                    $scope[form].$setUntouched();
                    $scope[form].$setPristine();
                }
                success(userData);
            });
        }

        function login(user, form, success, error){
            var userData = angular.copy(user);
            angular.copy({}, user)
            userFactory.login(userData).then(function(result){
                if(result.data){
                    if($scope[form]){
                        $scope[form].$setUntouched();
                        $scope[form].$setPristine();
                    }
                    loginFactory.setUser(result.data);
                    success(result.data);
                }
            });
        }

        function logout(callback){
            loginFactory.cleanUser();
            callback();
        }
    }
})();

(function () {
    'use strict';
    angular
        .module('app.user')
        .service('userFactory', userFactory);

    userFactory.$inject = ['$http', 'variables', '$location', 'loginFactory'];

    function userFactory($http, variables, $location, loginFactory) {
        var service = {
            checkAvailability: checkAvailability,
            create: create,
            createStudant: createStudant,
            editStudants: editStudants,
            defineClassName: defineClassName,
            login: login,
            removeStudants: removeStudants,
            sweep: sweep
        }
        return service;

        function checkAvailability(username) {
            return $http.get(variables.urlApi + '/users/checkAvailability/' + username);
        };

        function create(data) {
            return $http.post(variables.urlApi + '/users', data);
        };

        function createStudant(data){
            data.action = "createStudant";
            return $http.post(variables.urlApi + '/users', data);
        }

        function editStudants(studants){
            var data = {
                action: 'editStudants',
                studants: studants
            };
            return $http.post(variables.urlApi + '/users', data);
        }

        function defineClassName(data) {
            data.action = "defineClass";
            data.id = loginFactory.getUser().user_id;
            return $http.post(variables.urlApi + '/users', data);
        }

        function login(data) {
            return $http.post(variables.urlApi + '/login', data);
        };

        function removeStudants(studants){
            var data = {
                studants: studants,
                action: "removeStudant"
            };
            return $http.post(variables.urlApi + '/users', data);
        }

        function sweep(studants) {
            var data = {};
            data.action = "sweep";
            data.studants = studants;
            return $http.post(variables.urlApi + '/users', data);
        };


    }
})();

(function () {
    'use strict';

    angular
        .module('app.user')
        .directive('username', username);

    username.$inject = ['userFactory', '$timeout', '$q'];

    function username(userFactory, $timeout, $q) {
        var directive = {
            require: 'ngModel',
            link: link,
            restrict: 'A',
        };
        return directive;

        function link(scope, element, attrs, controller) {
            controller.$asyncValidators.username = function (modelValue, viewValue) {

                var defer = $q.defer();

                userFactory.checkAvailability(modelValue)
                  .then(function (result) {
                      if(result.data.available){
                          defer.resolve();
                      }else{
                          defer.reject();
                      }
                  })

                return defer.promise;
            };
        }
    }
})();

//# sourceMappingURL=app.js.map
