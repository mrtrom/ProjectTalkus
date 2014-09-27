module.exports = function(app) {

  /*global ot:false */
  /*global opentok:false */
  /*global __:false */

//Export module
  var config = require('./config'),
      logger = require('./winston'),
      io = require('socket.io').listen(app.listen(config.port), {log: false}),
      path = require('path');

  GLOBAL.globalChatUsers = {}; //global variable for users
  var soloUsersVideo = []; //users who left alone in videochat
  var soloUsersText = []; //users who left alone in textchat

  io.sockets.on('connection', function (socket) {

    /*GENERAL SOCKETS */

    /*adduser:
     Adds a user to the chat.
     * username: username provide by server
     * roomType: room type:
     * -text
     * -video
     ***/
    socket.on('adduser', function(username, roomType){

      if (username !== undefined && username !== null && username !== "" &&
          roomType !== undefined && roomType !== null && roomType !== ""){

        // Creates a session for a specific socket
        socket.userData = {
          username: username,
          roomType: roomType
        };

        GLOBAL.globalChatUsers[socket.id] = socket;

        if (roomType !== 'text'){
          // Send initialization data for video chat back to the client
          socket.emit('initialVideo', socket.userData, 'video', null, true);
        }
        else{
          // Send initialization data for text chat back to the client
          socket.emit('initialText', socket.userData);
        }

      }
    });

    socket.on('getSocketID', function(){
      socket.emit('getSocketIDClient', socket.id);
    });

    socket.on('sessionDescription', function(message){
      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('message', message);
        }
        else{
          logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no socket.partner exist');
      }
    });

    socket.on('candidate', function(message){
      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('message', message);
        }
        else{
          logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no socket.partner exist');
      }
    });

    socket.on('hangUp', function(message){
      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('message', message);
        }
        else{
          logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no socket.partner exist');
      }
    });

    /*userImage:
     Send images to the chat
     * message: image that will be sent to the chat
     ***/
    socket.on('userImage', function (message) {
      socket.emit('updatechat', socket.userData.username, message, 'message', 'me' , true);

      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('updatechat', socket.userData.username, message, 'message' , 'partner' , true);
        }
        else{
          logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no socket.partner exist');
      }
    });

    /*sendchat:
     Send text message to the chat
     * message: message that will be sent to the chat
     ***/
    socket.on('sendchat', function (message) {
      socket.emit('updatechat', socket.userData.username, message, 'message', 'me');

      if (socket.partner){
        //If i have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('updatechat', socket.userData.username, message, 'message' , 'partner');
        }
        else{
          logger.info('chatConfig', ' - ', 'sendchat', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'sendchat', ' - ', 'no socket.partner exist');
      }
    });

    /*userWriting:
     Show "user writing" message in chat window
     ***/
    socket.on('userWriting', function(){
      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('showWriting');
        }
        else{
          logger.info('chatConfig', ' - ', 'userWriting', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userWriting', ' - ', 'no socket.partner exist');
      }
    });

    /*userNotWriting:
     Hide "user writing" message in chat window
     ***/
    socket.on('userNotWriting', function(){
      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('hideWriting');
        }
        else{
          logger.info('chatConfig', ' - ', 'userNotWriting', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userNotWriting', ' - ', 'no socket.partner exist');
      }
    });

    /*disconnectPartners:
     Disconnect both partners when one of them decides it
     ***/
    socket.on('disconnectPartners', function(type) {

      if (socket.partner && socket.partner.socketId) {

        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){

          //Hide "user writing" message in partner chat window
          partnerSocket.emit('hideWriting');

          //Update partner window with "user leaves message"
          partnerSocket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');

          if (type && type === 'text'){
            //Disconnect partner from my published stream
            partnerSocket.emit('disconnectPartner', 'text');
          }
          else{
            //Disconnect partner from my published stream
            partnerSocket.emit('disconnectPartner', 'video');
          }

          //Put my partner "Waiting"
          partnerSocket.status = config.opentokStates.waiting;

          // Mark that my new partner and me are partners
          partnerSocket.partner = null;

        }
        else{
          logger.info('chatConfig', ' - ', 'disconnectPartners', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'disconnectPartners', ' - ', 'no socket.partner exist');
      }

      //Put me "Online"
      socket.status = config.opentokStates.online;

      if (type && type === 'text'){
        //Push me into soloUsersText
        soloUsersText.push({socketId: socket.id, username: socket.userData.username});
      }
      else{
        //Push me into soloUsersVideo
        soloUsersVideo.push({socketId: socket.id, username: socket.userData.username});
      }

      if (type && type === 'text'){
        //Disconnect me from my partner published stream
        socket.emit('disconnectMe', socket.userData, 'text');
      }
      else{
        //Disconnect me from my partner published stream
        socket.emit('disconnectMe', socket.userData, 'video');
      }

      socket.partner = null;

    });

    /*disconnect:
     Disconnect from the socket
     ***/
    socket.on('disconnect', function(){
      if (socket.partner){
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //Update partner window with "user leaves message"
          partnerSocket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');

          //Put my partner "Waiting"
          partnerSocket.status = config.opentokStates.waiting;

          //Leave the socket
          socket.leave(partnerSocket);
        }
        else{
          logger.info('chatConfig', ' - ', 'disconnect', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'disconnect', ' - ', 'no socket.partner exist');
      }

      //delete me from the global users
      delete GLOBAL.globalChatUsers[socket.id];
    });

    /*END GENERAL SOCKETS */

    /*SOCKETS FOR VIDEOCHAT*/

    /*nextVideo:
     Find a new user to chat in Video Chat window
     * data: publis Session provider by OT
     ***/
    socket.on('nextVideo', function(data){

      // Create a "user" data object for me
      var me = {
        socketId: socket.id,
        username: data.username
      };

      var usernameForFilter = me.username === 'Anonym' ? '' : me.username;

      var partner;
      var partnerSocket;

      //Get alone users EXCEPT me
      var filteredArray = soloUsersVideo.filter(function(e){
        return e.socketId !== me.socketId && e.username !== usernameForFilter;
      });

      // Look for a user to partner with in the list of solo filtered users
      if (filteredArray.length > 0){

        //Gets a random user in solo users filtered list
        var randomNumber = Math.round(Math.random() * (filteredArray.length - 1));

        //Get user object obtained from list
        var tmpUser = filteredArray[randomNumber];

        // Make sure our last partner is not our new partner and i am not my own partner
        if (socket.partner !== tmpUser && tmpUser !== me) {

          // Get the socket client for this user
          partnerSocket = GLOBAL.globalChatUsers[tmpUser.socketId];

          // Remove the partner we found from the list of solo users
          soloUsersVideo.splice(randomNumber, 1);

          // Remove my object from the list of solo users
          for(var i = 0; i < soloUsersVideo.length; i++){
            if (soloUsersVideo[i].socketId === me.socketId){
              soloUsersVideo.splice(i, 1);
              break;
            }
          }

          // If the user we found exists...
          if (partnerSocket) {
            // Set as our partner and quit the loop today
            partner = tmpUser;
          }
          else{
            logger.info('chatConfig', ' - ', 'nextVideo', ' - ', 'no partnerSocket exist');
          }
        }
      }

      // If we found a partner...
      if (partner) {

        //socket.emit('subscribe', partner.socketId);
        //partnerSocket.emit('subscribe', me.socketId);

        // Mark that my new partner and me are partners
        socket.partner = partner;
        partnerSocket.partner = me;

        // Mark that we are not in the list of solo users anymore
        socket.status = config.opentokStates.busy;
        partnerSocket.status = config.opentokStates.busy;

        //Get Anonym info on my window
        socket.emit('updateAnonymInfo', 'SERVER');

        //Get Anonym info on partner window
        partnerSocket.emit('updateAnonymInfo', 'SERVER');

        //Update my window with connected message
        socket.emit('updatechat', 'SERVER', '<span class="muted">Anonym has connected</span>', 'connect', 'video', null, null, 'me');

        //Update partner window with connected message
        partnerSocket.emit('updatechat', 'SERVER', '<span class="muted">'+ "Anonym" + ' has connected</span>', 'connect', 'video', null, null, 'Anonym');

      } else {

        // delete that i had a partner if i had one
        if (socket.partner) {
          delete socket.partner;
        }

        // add myself to list of solo users if i'm not in the list
        if (socket.status !== config.opentokStates.online) {
          socket.status = config.opentokStates.online;
          soloUsersVideo.push(me);
        }

        // tell myself that there is nobody to chat with right now
        socket.emit('empty');
      }
    });

    /*END SOCKETS FOR VIDEOCHAT*/

    /*SOCKETS FOR TEXTCHAT*/

    /*nextText:
     Find a new user to chat in text Chat window
     ***/
    socket.on('nextText', function(data){

      // Create a "user" data object for me
      var me = {
        socketId: socket.id,
        username: data.username
      };

      var usernameForFilter = me.username === 'Anonym' ? '' : me.username;

      var partner;
      var partnerSocket;

      //Get alone users EXCEPT me
      var filteredArray = soloUsersText.filter(function(e){
        return e.socketId !== me.socketId && e.username !== usernameForFilter;
      });

      // Look for a user to partner with in the list of solo users
      if (filteredArray.length > 0){

        //Gets a random user in solo users filtered list
        var randomNumber = Math.round(Math.random() * (filteredArray.length - 1));

        //Get user object obtained from list
        var tmpUser = filteredArray[randomNumber];


        // Make sure our last partner is not our new partner and i am not my own partner
        if (socket.partner !== tmpUser && tmpUser.socketId !== me.socketId) {

          // Get the socket client for this user
          partnerSocket = GLOBAL.globalChatUsers[tmpUser.socketId];

          // Remove the partner we found from the list of solo users
          soloUsersText.splice(randomNumber, 1);

          // Remove my object from the list of solo users
          for (var i = 0; i < soloUsersText.length; i++) {
            if (soloUsersText[i].socketId === me.socketId) {
              soloUsersText.splice(i, 1);
              break;
            }
          }

          // If the user we found exists...
          if (partnerSocket) {
            // Set as our partner and quit the loop today
            partner = tmpUser;
          }
        }
      }

      // If we found a partner...
      if (partner) {

        // Join to the partner room
        socket.join(partnerSocket);
        partnerSocket.join(socket);

        // Mark that my new partner and me are partners
        socket.partner = partner;
        partnerSocket.partner = me;

        // Mark that we are not in the list of solo users anymore
        socket.status = config.opentokStates.busy;
        partnerSocket.status = config.opentokStates.busy;

        //Get Anonym info on my window
        socket.emit('updateAnonymInfo', 'SERVER');

        //Get Anonym info on partner window
        partnerSocket.emit('updateAnonymInfo', 'SERVER');

        //Update my window with connected message
        socket.emit('updatechat', 'SERVER', '<span class="muted">Anonym has connected</span>', 'connect', 'text');

        //Update partner window with connected message
        partnerSocket.emit('updatechat', 'SERVER', '<span class="muted">'+ "Anonym" + ' has connected</span>', 'connect', 'text');

      } else {

        // delete that i had a partner if i had one
        if (socket.partner) {
          delete socket.partner;
        }

        // add myself to list of solo users if i'm not in the list
        if (socket.status !== config.opentokStates.online) {
          socket.status = config.opentokStates.online;
          soloUsersText.push(me);
        }

        // tell myself that there is nobody to chat with right now
        socket.emit('empty');

        //Update partner window with "user leaves message"
        //socket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');
      }
    });

    /*nextTextVideo:
     Subscribe users video in text room
     ***/
    socket.on('nextTextVideo', function(){
      if (socket.partner) {
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          // Tell myself to subscribe to my partner
          socket.emit('subscribe', {
            sessionId: partnerSocket.userData.sessionId,
            token: ot.generateToken({
              sessionId: partnerSocket.userData.sessionId,
              role: opentok.RoleConstants.SUBSCRIBER
            })
          });

          // Tell my partner to subscribe to me
          partnerSocket.emit('subscribe', {
            sessionId: socket.userData.sessionId,
            token: ot.generateToken({
              sessionId: socket.userData.sessionId,
              role: opentok.RoleConstants.SUBSCRIBER
            })
          });
        }
        else{
          logger.info('chatConfig', ' - ', 'userImage', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'nextTextVideo', ' - ', 'no socket.partner exist');
      }
    });

    /*newVideoChat:
     New video petition on text room
     ***/
    socket.on('newVideoChat', function(roomType, typeUser) {
      if (roomType && roomType === 'text'){
        if (typeUser && typeUser === 'Anonym'){
          socket.emit('initialVideo', socket.userData, 'text', 'Anonym', true);
        }
        else{
          socket.emit('initialVideo', socket.userData, 'text', null, true);
        }
      }
      else{
        socket.emit('initialVideo', socket.userData, 'video', null, true);
      }
    });

    socket.on('userNoCamera', function(){
      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('partnerNoCamera');
        }
        else{
          logger.info('chatConfig', ' - ', 'userNoCamera', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'userNoCamera', ' - ', 'no socket.partner exist');
      }
    });

    /*newVideoChat2:
     Show message for video petition
     ***/
    socket.on('newVideoChat2', function() {
      socket.emit('updatechat', '', '', 'showMessageVideoMe');

      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('updatechat', '', '', 'showMessageVideoAnonym');
        }
        else{
          logger.info('chatConfig', ' - ', 'newVideoChat2', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'newVideoChat2', ' - ', 'no socket.partner exist');
      }
    });

    /*succesNewVideoChat:
     Succes to start new Video Chat in text room
     ***/
    socket.on('succesNewVideoChat', function() {

      socket.emit('initialChatVideoInTextRoom', socket.userData, 'second');
      socket.emit('updatechat', '', '', 'succesMessageVideoMe');

      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('updatechat', '', '', 'succesMessageVideoAnonym');
        }
        else{
          logger.info('chatConfig', ' - ', 'succesNewVideoChat', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'succesNewVideoChat', ' - ', 'no socket.partner exist');
      }
    });

    /*failNewVideoChat:
     Failed to start new Video Chat in text room
     ***/
    socket.on('failNewVideoChat', function(){

      socket.emit('updatechat', '', '', 'failMessageVideoMe');

      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('cancelPublishingStream');
          partnerSocket.emit('updatechat', '', '', 'cancelMessageVideoAnonym');
          partnerSocket.emit('updatechat', '', '', 'failMessageVideoAnonym');
        }
        else{
          logger.info('chatConfig', ' - ', 'failNewVideoChat', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'failNewVideoChat', ' - ', 'no socket.partner exist');
      }
    });

    /*cancelVideoChat:
     Cancel Video Chat subscribe in text room
     ***/
    socket.on('cancelVideoChat', function(){
      socket.emit('updatechat', '', '', 'cancelMessageVideoMe');

      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('updatechat', '', '', 'cancelMessageVideoAnonym');
        }
        else{
          logger.info('chatConfig', ' - ', 'cancelVideoChat', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'cancelVideoChat', ' - ', 'no socket.partner exist');
      }
    });

    /*cancelPusblish:
     Cancel Video Chat publish in text room
     ***/
    socket.on('cancelPusblish', function(){

      socket.emit('cancelPublishingStream');

      if (socket.partner){
        //If I have partner
        var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

        if (partnerSocket){
          //If partner exists
          partnerSocket.emit('cancelPublishingStream');
        }
        else{
          logger.info('chatConfig', ' - ', 'cancelPusblish', ' - ', 'no partnerSocket exist');
        }
      }
      else{
        logger.info('chatConfig', ' - ', 'cancelPusblish', ' - ', 'no socket.partner exist');
      }
    });

    /*END SOCKETS FOR TEXTCHAT*/

  });
};