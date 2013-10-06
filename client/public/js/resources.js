'use strict';

//Resources

angular.module('myApp.services', [])

.factory('Session', ['$resource', function($resource) {
    var _url = '/API/sessions',
        Session = $resource(_url);
        
    return Session;
  }
])

.factory('User', ['$resource', function($resource) {
    var _url = '/API/users/:username',
        User = $resource(_url, {username: '@username'}, 
            {update: {method: 'PUT'}});
    
    return User;
  }
])

.factory('ChatUser', ['$resource', function($resource) {
    var _url = '/API/chat/:username',
        _usernameUrl = '/API/chat/chatUsername/:username/get',
        ChatUser = $resource(_url);
        
    var chatUsername = $resource(_usernameUrl, {}, {
      getUsername: {method: 'GET', isArray: false, params: {username: '@username'}}
    });
    
    ChatUser.getUsername = chatUsername.getUsername;
        
    return ChatUser;
  }
])

.factory('Valid', ['$resource', function($resource) {
    var _url = '/API/valid',
        Valid = $resource(_url);
    return Valid;
  }
])

.factory('Remember', ['$resource', function($resource) {
    var _url = '/API/remember',
        Remember = $resource(_url);
    return Remember;
  }
])

.factory('Mails', ['$resource', function($resource) {
    var _url = '/API/mails',
        Mails = $resource(_url);
    return Mails;
  }
]);