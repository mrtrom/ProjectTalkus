module.exports = function(app) {

	/*global ot:false */
	/*global opentok:false */

//Export module
	var config = require('./config'),
			utils = require('./../controllers/utilities'),
			io = require('socket.io').listen(app.listen(config.port), {log: false}),
			opentok = require('opentok'),
			ot = new opentok.OpenTokSDK(config.opentok.key, config.opentok.secret);

	GLOBAL.globalChatUsers = null; //variable global de usuarios
	var rooms = []; //salas de chat de usuarios
	var userObject = {}; //objeto usuario que será guardado en globalChatUsers

	//principal socket connection
	io.sockets.on('connection', function (socket) {

		//add user to chat
		//username: username in clientSide
		//tipoSala: text, video
		socket.on('adduser', function(username, tipoSala){
			if (username !== undefined && username !== null && username !== "" &&
					tipoSala !== undefined && tipoSala !== null && tipoSala !== ""){

				//Se reinicializa la variable
				userObject = {};
				//Se asigna el nombre de usuario al objeto principal
				userObject.username = username;
				//Se asinga el socket al objeto principal
				userObject.id = socket;
				//Se asinga el tipo de sala al objeto principal
				userObject.roomType = tipoSala;

				//depués de la primera vez entra
				if (GLOBAL.globalChatUsers !== null){

					//return online users
					var arrayOfKeys = [];
					// se recorre la variable global de usuarios
					for (var userKey in GLOBAL.globalChatUsers){
						//si el usuario que encuentra está disponible
						if (GLOBAL.globalChatUsers[userKey].estado === 'online' && GLOBAL.globalChatUsers[userKey].username !== userObject.username){
							arrayOfKeys.push(userKey);
						}
					}

					//If online users == 0
					if (arrayOfKeys.length === 0){
						var newRoomLarge = rooms.length + "Room";
						//se crea la sala
						rooms.push(newRoomLarge);
						//se le asigna al usuario la sala creada
						userObject.room = newRoomLarge;
						//primero el usuario tiene estado online
						userObject.estado = 'online';
					}
					//If online users > 0
					else{
						//Get random user in list
						var userN = arrayOfKeys[Math.round(Math.random() * (arrayOfKeys.length - 1))];
						//se le asigna al usuario actual la sala del usuario encontrado
						userObject.room = GLOBAL.globalChatUsers[userN].room;
						//primero el usuario tiene estado online
						userObject.estado = 'online';
						//se asinga el nombre del compañero
						userObject.partnerName = userN;
						GLOBAL.globalChatUsers[userN].partnerName = userObject.username;

						//Si el tipo de sala es sólo de texto
						if (tipoSala === 'text'){
							//el usuario actual pasa a estado ocupado
							userObject.estado = 'busy';
							//el usuario encontrado pasa a estado ocupado
							GLOBAL.globalChatUsers[userN].estado = 'busy';
						}

						//both users to update chat
						var bothUsers = [];
						bothUsers.push(GLOBAL.globalChatUsers[userN].username);
						bothUsers.push(username);

						//update chat for both users
						socket.emit('updateAnonymInfo', 'SERVER', bothUsers);
						socket.broadcast.to(userObject.room).emit('updateAnonymInfo', 'SERVER', bothUsers);
					}
				}
				//primera vez que se inicia la aplicación
				else{
					//se inicializa la variable
					GLOBAL.globalChatUsers = {};
					var newRoom = rooms.length + "Room";
					//se crea la primera sala
					rooms.push(newRoom);
					//se le asigna al usuario la sala creada
					userObject.room = newRoom;
					//primero el usuario tiene estado online
					userObject.estado = 'online';
				}


				//Si el tipo de sala es de video
				if (tipoSala === 'video'){
					ot.createSession(config.app.hostname, function(session) {
						// Each user should be a moderator
						var data = {
							sessionId: session,
							token: ot.generateToken({
								sessionId: session,
								role: opentok.RoleConstants.MODERATOR
							})
						};

						//se le asigna la información de la sala de video al objeto principal
						userObject.data = data;
						userObject.readyToVideo = true;

						// Send initialization data back to the client
						socket.emit('initial', data);

					});
				}
				//se asigna el objeto usuario al socket
				socket.userObject = userObject;
				//se guarda el objeto principal "userObject" en el global de usuarios
				GLOBAL.globalChatUsers[username] = userObject;

				//el usuario actual entra a la sala
				socket.join(socket.userObject.room);
				//mensaje de servidor para mí "usted entró a la sala"
				socket.emit('updatechat', 'SERVER', '<span class="muted">you have connected to: ' + socket.userObject.room + '</span>', 'connect');
				//mensaje de servidor para el compañero "usuario entró a la sala"
				socket.broadcast.to(socket.userObject.room).emit('updatechat', 'SERVER', '<span class="muted">'+ "Anonym" + ' has connected to this room</span>', 'connect');
			}
		});

		socket.on('newVideoChat', function() {
			ot.createSession(config.app.hostname, function(session) {
				// Each user should be a moderator
				var data = {
					sessionId: session,
					token: ot.generateToken({
						sessionId: session,
						role: opentok.RoleConstants.MODERATOR
					})
				};

				console.log('data');
				console.log(data);
				console.log('username partner: ' + socket.userObject.partnerName);

				//se le asigna la información de la sala de video al objeto principal
				socket.userObject.data = data;
				socket.userObject.readyToVideo = false;
				GLOBAL.globalChatUsers[socket.userObject.username] = socket.userObject;

				socket.emit('initial', data);
			});

//			socket.emit('updatechat', '', '', 'showMessageVideoMe');
//			socket.broadcast.to(socket.userObject.room).emit('updatechat', '', '', 'showMessageVideoAnonym');
		});

		socket.on('newVideoChat2', function() {
			socket.emit('updatechat', '', '', 'showMessageVideoMe');
			socket.broadcast.to(socket.userObject.room).emit('updatechat', '', '', 'showMessageVideoAnonym');
		});

		socket.on('succesNewVideoChat', function() {

			ot.createSession(config.app.hostname, function(session) {
				// Each user should be a moderator
				var data = {
					sessionId: session,
					token: ot.generateToken({
						sessionId: session,
						role: opentok.RoleConstants.MODERATOR
					})
				};
				console.log('data');
				console.log(data);
				console.log('username partner: ' + socket.userObject.partnerName);


				//se le asigna la información de la sala de video al objeto principal
				socket.userObject.data = data;
				socket.userObject.readyToVideo = true;
				GLOBAL.globalChatUsers[socket.userObject.partnerName].readyToVideo = true;
				GLOBAL.globalChatUsers[socket.userObject.username] = socket.userObject;

				// Send initialization data back to the client
				socket.emit('initial', data);
				//socket.broadcast.to(socket.userObject.room).emit('initial', GLOBAL.globalChatUsers[socket.userObject.partnerName].data);

			});

			socket.emit('updatechat', '', '', 'succesMessageVideoMe');
			socket.broadcast.to(socket.userObject.room).emit('updatechat', '', '', 'succesMessageVideoAnonym');
		});

		socket.on('failNewVideoChat', function(){
			socket.emit('disconnectPartner');
			socket.broadcast.to(socket.userObject.room).emit('disconnectPartner');

			socket.emit('updatechat', '', '', 'failMessageVideoMe');
			socket.broadcast.to(socket.userObject.room).emit('updatechat', '', '', 'failMessageVideoAnonym');
		});

		socket.on('next', function () {
			// Create a "user" data object for me
			var me = {
				sessionId: socket.userObject.data.sessionId,
				socketId: socket.id
			};

			var partner, //información del compañero
					partnerSocket, // información del socket del compañero;
					userN;

			//Si tenemos compañero para chatear en el objeto
			if (socket.userObject.partnerName !== undefined && socket.userObject.partnerName !== null){
				userN = socket.userObject.partnerName;
			}


			//Si tenemos compañero
			if (userN){

				//Se asigna el objeto del compañero
				var tmpUser = GLOBAL.globalChatUsers[userN];


				if (GLOBAL.globalChatUsers[userN] !== undefined){
					// Get the socket client for this user
					partnerSocket = GLOBAL.globalChatUsers[userN].id;

					//el usuario actual pasa a estado ocupado
					userObject.estado = 'busy';
					//el usuario encontrado pasa a estado ocupado
					GLOBAL.globalChatUsers[userN].estado = 'busy';
				}


				// If the user we found exists...
				if (partnerSocket && socket.userObject.readyToVideo === true) {
					// Set as our partner
					partner = tmpUser;
				}
			}

			// If we found a partner...
			if (partner) {

				console.log('partner: ' + GLOBAL.globalChatUsers[userN].data.sessionId);
				console.log('me: ' + me.sessionId);

				// Tell myself to subscribe to my partner
				socket.emit('subscribe', {
					sessionId: GLOBAL.globalChatUsers[userN].data.sessionId,
					token: ot.generateToken({
						sessionId: GLOBAL.globalChatUsers[userN].data.sessionId,
						role: opentok.RoleConstants.SUBSCRIBER
					})
				});

				// Tell my partner to subscribe to me
				socket.broadcast.to(partner.room).emit('subscribe', {
					sessionId: me.sessionId,
					token: ot.generateToken({
						sessionId: me.sessionId,
						role: opentok.RoleConstants.SUBSCRIBER
					})
				});

				// Mark that my new partner and me are partners
				socket.partner = partner;
				partnerSocket.partner = me;

			}
			else {

				// delete that i had a partner if i had one
				if (socket.partner) {
					delete socket.partner;
				}

				// tell myself that there is nobody to chat with right now
				socket.emit('empty');
			}
		});

		socket.on('disconnectPartners', function() {
			if (socket.partner && socket.partner.socketId && socket.userObject.partnerName !== undefined) {
				var partnerSocket = GLOBAL.globalChatUsers[socket.userObject.partnerName].id;

				if (partnerSocket) {
					partnerSocket.emit('disconnectPartner');
				}

				socket.emit('disconnectPartner');
			}
		});

		//envío de mensajes
		socket.on('sendchat', function (message) {
			//mensaje de servidor "usted entró a la sala"
			socket.emit('updatechat', socket.userObject.username, message, 'message');
			//mensaje de servidor "usuario entró a la sala"
			socket.broadcast.to(socket.userObject.room).emit('updatechat', socket.userObject.username, message, 'message');
		});

		//Enviar mensaje de usuario copiando
		socket.on('userWriting', function(){
			socket.broadcast.to(socket.userObject.room).emit('showWriting');
		});

		//Enviar mensaje de usuario copiando
		socket.on('userNotWriting', function(){
			socket.broadcast.to(socket.userObject.room).emit('hideWriting');
		});

		//desconexión de usuarios
		socket.on('disconnect', function(){
			var salaVacia = false;
			//Se elimina el usuario actual en la lista de usuarios
			if (socket.userObject !== undefined){
				delete GLOBAL.globalChatUsers[socket.userObject.username];

				for (var userN in GLOBAL.globalChatUsers){
					if (GLOBAL.globalChatUsers[userN].room === socket.userObject.room){
						GLOBAL.globalChatUsers[userN].estado = 'waiting';
						salaVacia = false;
						break;
					}
					else{
						salaVacia = true;
					}
				}

				if(salaVacia === true){
					utils.removeObjectArray(rooms, socket.userObject.room);
				}

				socket.broadcast.to(socket.userObject.room).emit('updatechat', 'SERVER', 'Anonym has disconnected', 'leave');
				socket.leave(socket.userObject.room);
				delete GLOBAL.globalChatUsers[socket.userObject];
			}
		});
	});
};