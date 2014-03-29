module.exports = function(app) {

	/*global ot:false */
	/*global opentok:false */

//Export module
	var config = require('./config'),
			io = require('socket.io').listen(app.listen(config.port), {log: false}),
			opentok = require('opentok'),
			ot = new opentok.OpenTokSDK(config.opentok.key, config.opentok.secret);

	GLOBAL.globalChatUsers = {}; //variable global de usuarios
	var soloUsersVideo = [];
	var soloUsersText = [];

	io.sockets.on('connection', function (socket) {

		/*GENERAL SOCKETS */

		socket.on('adduser', function(username, roomType){
			if (username !== undefined && username !== null && username !== "" &&
					roomType !== undefined && roomType !== null && roomType !== ""){

				ot.createSession(config.app.hostname, {}, function(session) {
					// Each user should be a moderator
					socket.userData = {
						sessionId: session,
						token: ot.generateToken({
							sessionId: session,
							role: opentok.RoleConstants.MODERATOR
						}),
						username: username,
						roomType: roomType
					};

					GLOBAL.globalChatUsers[socket.id] = socket;

					if (roomType !== 'text'){
						// Send initialization data for video chat back to the client
						socket.emit('initialVideo', socket.userData);
					}
					else{
						// Send initialization data for text chat back to the client
						socket.emit('initialText', socket.userData);
					}

				});
			}

		});

		socket.on('user image', function (message) {
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];
			socket.emit('updatechat', socket.userData.username, message, 'message', 'me' , true);
			partnerSocket.emit('updatechat', socket.userData.username, message, 'message' , 'partner' , true);
		});
		socket.on('user sound', function (message) {
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];
			socket.emit('updatechat', socket.userData.username, message, 'message', 'me' , false , true);
			partnerSocket.emit('updatechat', socket.userData.username, message, 'message' , 'partner' , false , true);
		});

		socket.on('sendchat', function (message) {
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			socket.emit('updatechat', socket.userData.username, message, 'message', 'me');
			partnerSocket.emit('updatechat', socket.userData.username, message, 'message' , 'partner');
		});

		socket.on('userWriting', function(){
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];
			partnerSocket.emit('showWriting');
		});

		socket.on('userNotWriting', function(){
			if (socket.partner){
				var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];
				if (partnerSocket){
					partnerSocket.emit('hideWriting');
				}
			}
		});

		socket.on('disconnectPartners', function(type, data) {
			if (socket.partner && socket.partner.socketId) {
				var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

				if (type && type === 'text'){

					partnerSocket.emit('hideWriting');
					partnerSocket.emit('updatechat', '', '', 'meDejaron');
					partnerSocket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');
					partnerSocket.emit('disconnectPartner');
					socket.emit('disconnectPartner');

					socket.status = "online";

					// Create a "user" data object for me
					var me = {
						socketId: socket.id
					};

					soloUsersText.push(me);

					partnerSocket.status = "waiting";

					// Mark that my new partner and me are partners
					partnerSocket.partner = null;
					socket.partner = null;

				}
				else{

					partnerSocket.emit('updatechat', '', '', 'meDejaron');
					partnerSocket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');

					socket.status = "online";

					partnerSocket.status = "waiting";

					// Mark that my new partner and me are partners
					partnerSocket.partner = null;
					socket.partner = null;

					socket.emit('disconnectPartnerMe');
					partnerSocket.emit('disconnectPartner');
				}
			}
		});

		socket.on('disconnect', function(){
			console.log('disconnect');
			if (socket.partner){
				var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

				if (partnerSocket){
					partnerSocket.emit('updatechat', '', '', 'meDejaron');
					partnerSocket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');
					partnerSocket.status = "waiting";

					socket.leave(partnerSocket);
				}
			}

			delete GLOBAL.globalChatUsers[socket.id];
		});

		/*END GENERAL SOCKETS */

		/*SOCKETS FOR VIDEOCHAT*/

		socket.on('nextVideo', function(data){

			// Create a "user" data object for me
			var me = {
				sessionId: data.sessionId,
				socketId: socket.id
			};

			var partner;
			var partnerSocket;

			var filteredArray = soloUsersVideo.filter(function(e){
				return e.socketId !== me.socketId;
			});

			// Look for a user to partner with in the list of solo users
			if (filteredArray.length > 0){
				var randomNumber = Math.round(Math.random() * (filteredArray.length - 1));

				var tmpUser = filteredArray[randomNumber];

				// Make sure our last partner is not our new partner and i am not my own partner
				if (socket.partner !== tmpUser && tmpUser !== me) {
					// Get the socket client for this user
					partnerSocket = GLOBAL.globalChatUsers[tmpUser.socketId];

					// Remove the partner we found from the list of solo users
					soloUsersVideo.splice(randomNumber, 1);

					// Remove my object from the list of solo users
					for(var i = 0; i < soloUsersText.length; i++){
						if (soloUsersText[i].socketId === me.socketId){
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

				// Tell myself to subscribe to my partner
				socket.emit('subscribe', {
					sessionId: partner.sessionId,
					token: ot.generateToken({
						sessionId: partner.sessionId,
						role: opentok.RoleConstants.SUBSCRIBER
					})
				});

				// Tell my partner to subscribe to me
				partnerSocket.emit('subscribe', {
					sessionId: me.sessionId,
					token: ot.generateToken({
						sessionId: me.sessionId,
						role: opentok.RoleConstants.SUBSCRIBER
					})
				});

				// Mark that my new partner and me are partners
				socket.partner = partner;
				partnerSocket.partner = me;

				// Mark that we are not in the list of solo users anymore
				socket.status = "busy";
				partnerSocket.status = "busy";

			} else {

				// delete that i had a partner if i had one
				if (socket.partner) {
					delete socket.partner;
				}

				// add myself to list of solo users if i'm not in the list
				if (socket.status !== "online") {
					socket.status = "online";
					soloUsersVideo.push(me);
				}

				// tell myself that there is nobody to chat with right now
				socket.emit('empty');
			}

			console.log('me: ' + socket.id);

			if (partnerSocket){
				console.log('partner: ' + partnerSocket.id);
			}
			else{
				console.log('partner: ');
			}

		});

		/*END SOCKETS FOR VIDEOCHAT*/

		/*SOCKETS FOR TEXTCHAT*/

		socket.on('nextText', function(){

			// Create a "user" data object for me
			var me = {
				socketId: socket.id
			};

			var partner;
			var partnerSocket;

			var filteredArray = soloUsersText.filter(function(e){
				return e.socketId !== me.socketId;
			});

			// Look for a user to partner with in the list of solo users
			if (filteredArray.length > 0){
				var randomNumber = Math.round(Math.random() * (filteredArray.length - 1));

				var tmpUser = filteredArray[randomNumber];

				// Make sure our last partner is not our new partner and i am not my own partner
				if (socket.partner !== tmpUser && tmpUser.socketId !== me.socketId) {
					// Get the socket client for this user
					partnerSocket = GLOBAL.globalChatUsers[tmpUser.socketId];

					// Remove the partner we found from the list of solo users
					soloUsersText.splice(randomNumber, 1);

					// Remove my object from the list of solo users
					for(var i = 0; i < soloUsersText.length; i++){
						if (soloUsersText[i].socketId === me.socketId){
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
				socket.status = "busy";
				partnerSocket.status = "busy";

				socket.emit('updateAnonymInfo', 'SERVER');
				partnerSocket.emit('updateAnonymInfo', 'SERVER');

				socket.emit('updatechat', 'SERVER', '<span class="muted">you have connected to this room</span>', 'connect');
				partnerSocket.emit('updatechat', 'SERVER', '<span class="muted">'+ "Anonym" + ' has connected to this room</span>', 'connect');

			} else {

				// delete that i had a partner if i had one
				if (socket.partner) {
					delete socket.partner;
				}

				// add myself to list of solo users if i'm not in the list
				if (socket.status !== "online") {
					socket.status = "online";
					soloUsersText.push(me);
				}

				// tell myself that there is nobody to chat with right now
				socket.emit('empty');
				socket.emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');
			}

			console.log('me: ' + socket.id);

			if (partnerSocket){
				console.log('partner: ' + partnerSocket.id);
			}
			else{
				console.log('partner: ');
			}

		});

		socket.on('nextTextVideo', function(data){

			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			console.log('partnerSockert: ');
			console.log(partnerSocket.userData);

			console.log('socket: ');
			console.log(socket.userData);

			if (socket.partner) {

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
		});

		socket.on('newVideoChat', function() {
			socket.emit('initialChatVideoInTextRoom', socket.userData);
		});

		socket.on('newVideoChat2', function() {
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			socket.emit('updatechat', '', '', 'showMessageVideoMe');
			partnerSocket.emit('updatechat', '', '', 'showMessageVideoAnonym');
		});

		socket.on('succesNewVideoChat', function() {
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			socket.emit('initialChatVideoInTextRoom', socket.userData, 'second');

			socket.emit('updatechat', '', '', 'succesMessageVideoMe');
			partnerSocket.emit('updatechat', '', '', 'succesMessageVideoAnonym');
		});

		socket.on('failNewVideoChat', function(){
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			socket.emit('updatechat', '', '', 'failMessageVideoMe');
			partnerSocket.emit('updatechat', '', '', 'failMessageVideoAnonym');
		});

		socket.on('cancelVideoChat', function(){
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			socket.emit('disconnectPartner');
			partnerSocket.emit('disconnectPartner');

			socket.emit('updatechat', '', '', 'cancelMessageVideoMe');
			partnerSocket.emit('updatechat', '', '', 'cancelMessageVideoAnonym');
		});

		socket.on('cancelPusblish', function(){
			var partnerSocket = GLOBAL.globalChatUsers[socket.partner.socketId];

			socket.emit('cancelPublishingStream');
			partnerSocket.emit('cancelPublishingStream');
		});

		/*END SOCKETS FOR TEXTCHAT*/

	});
};