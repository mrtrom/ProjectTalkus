'use strict';

/*global Modules:true */

Modules.services.factory('ChatUser', ['$resource', function($resource) {
  var _url = '/API/chat/:username',
      _usernameUrl = '/API/chat/chatUsername/:username/get',
      ChatUser = $resource(_url);

  var chatUsername = $resource(_usernameUrl, {}, {
    getUsername: {method: 'GET', isArray: false, params: {username: '@username'}}
  });

  ChatUser.getUsername = chatUsername.getUsername;

  return ChatUser;
}]);