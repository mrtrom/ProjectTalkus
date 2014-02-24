module.exports = function(app) {

//Export module
  var config = require('./config'),
      io = require('socket.io').listen(app.listen(config.port));

//Require modules
  var utils = require('./../controllers/utilities');

  GLOBAL.globalChatUsers = null; //variable global de usuarios
  var rooms = []; //salas de chat de usuarios
  var userObject = {}; //objeto usuario que será guardado en globalChatUsers

  io.sockets.on('connection', function (socket) {
    socket.on('adduser', function(username){
      if (username !== null && username !== ""){
        userObject = {}; //Se reinicializa la variable
        userObject.username = username; //Se asigna el nombre de usuario al objeto principal

        if (GLOBAL.globalChatUsers !== null){ //depués de la primera vez entra

          var arrayOfKeys = [];
          for (var userKey in GLOBAL.globalChatUsers){ // se recorre la variable global de usuarios
            if (GLOBAL.globalChatUsers[userKey].estado === 'online' && GLOBAL.globalChatUsers[userKey].username !== userObject.username){ //si el usuario que encuentra está disponible
              arrayOfKeys.push(userKey);
            }
          }
          if (arrayOfKeys.length === 0){
            var newRoomLarge = rooms.length + "Room";
            rooms.push(newRoomLarge); //se crea la sala
            userObject.room = newRoomLarge; //se le asigna al usuario la sala creada
            userObject.estado = 'online'; //primero el usuario tiene estado online
            GLOBAL.globalChatUsers[username] = userObject; //se guarda el objeto principal "userObject" en el global de usuarios
          }
          else{
            var userN = arrayOfKeys[Math.round(Math.random() * (arrayOfKeys.length - 1))];
            userObject.room = GLOBAL.globalChatUsers[userN].room; //se le asigna al usuario actual la sala del usuario encontrado
            userObject.estado = 'busy'; //el usuario actual pasa a estado ocupado
            GLOBAL.globalChatUsers[userN].estado = 'busy'; //el usuario encontrado pasa a estado ocupado

            var bothUsers = [];

            bothUsers.push(GLOBAL.globalChatUsers[userN].username);
            bothUsers.push(username);

            socket.emit('updateAnonymInfo', 'SERVER', bothUsers);
            socket.broadcast.to(userObject.room).emit('updateAnonymInfo', 'SERVER', bothUsers);

            GLOBAL.globalChatUsers[username] = userObject; //se guarda el objeto principal "userObject" en el global de usuarios
          }
        }
        else{ //primera vez que se inicia la aplicación
          GLOBAL.globalChatUsers = {}; // se inicializa la variable
          var newRoom = rooms.length + "Room";
          rooms.push(newRoom); //se crea la primera sala
          userObject.room = newRoom; //se le asigna al usuario la sala creada
          userObject.estado = 'online'; //primero el usuario tiene estado online
          GLOBAL.globalChatUsers[username] = userObject; //se guarda el objeto principal "userObject" en el global de usuarios
        }
        socket.userObject = userObject; //se asigna el objeto usuario al socket
        socket.join(socket.userObject.room); //el usuario actual entra a la sala
        socket.emit('updatechat', 'SERVER', '<span class="muted">you have connected to: ' + socket.userObject.room + '</span>', 'connect'); //mensaje de servidor "usted entró a la sala"
        socket.broadcast.to(socket.userObject.room).emit('updatechat', 'SERVER', '<span class="muted">'+ "Anonym" + ' has connected to this room</span>', 'connect'); //mensaje de servidor "usuario entró a la sala"
      }
    });

    socket.on('sendchat', function (message) {
      //envío de mensajes
      socket.emit('updatechat', socket.userObject.username, message); //mensaje de servidor "usted entró a la sala"
      socket.broadcast.to(socket.userObject.room).emit('updatechat', socket.userObject.username, message); //mensaje de servidor "usuario entró a la sala"
    });

    socket.on('userWriting', function(){
      //Enviar mensaje de usuario copiando
      socket.broadcast.to(socket.userObject.room).emit('showWriting');
    });

    socket.on('userNotWriting', function(){
      //Enviar mensaje de usuario copiando
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