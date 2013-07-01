//Export module
var app = module.parent.exports.app,
    io = require('socket.io').listen(app.listen(process.env.PORT, process.env.IP)),
    utils = require('./utilities');

var globalChatUsers = null; //variable global de usuarios
var rooms = []; //salas de chat de usuarios
var userObject = {}; //objeto usuario que será guardado en globalChatUsers

io.sockets.on('connection', function (socket) {

    socket.on('adduser', function(username){ 
        userObject = {}; //Se reinicializa la variable
        userObject.username = username; //Se asigna el nombre de usuario al objeto principal
        
        if (globalChatUsers !== null){ //depués de la primera vez entra
            if (Object.keys(globalChatUsers).length % 2 === 0){ // cuándo es un usuario par
                rooms.push(username + 'Room'); //se crea la sala
                userObject.room = username + 'Room'; //se le asigna al usuario la sala creada
                userObject.estado = 'online'; //primero el usuario tiene estado online
                globalChatUsers[username] = userObject; //se guarda el objeto principal "userObject" en el global de usuarios
            }
            else{// cuándo es un usuario impar
                for (var userN in globalChatUsers){ // se recorre la variable global de usuarios
                    if (globalChatUsers[userN].estado == 'online'){ //si el usuario que encuentra está disponible
                        userObject.room = globalChatUsers[userN].room; //se le asigna al usuario actual la sala del usuario encontrado
                        userObject.estado = 'busy'; //el usuario actual pasa a estado ocupado
                        globalChatUsers[userN].estado = 'busy'; //el usuario encontrado pasa a estado ocupado
                        break;//se sale del ciclo cuándo encuentra el primer usuario disponible
                    }
                }
                globalChatUsers[username] = userObject; //se guarda el objeto principal "userObject" en el global de usuarios
            }
        }
        else{ //primera vez que se inicia la aplicación
            globalChatUsers = {}; // se inicializa la variable
            rooms.push(username + 'Room'); //se crea la primera sala
            userObject.room = username + 'Room'; //se le asigna al usuario la sala creada
            userObject.estado = 'online'; //primero el usuario tiene estado online
            globalChatUsers[username] = userObject; //se guarda el objeto principal "userObject" en el global de usuarios
        }
        
        socket.userObject = userObject; //se asigna el objeto usuario al socket
    	socket.join(socket.userObject.room); //el usuario actual entra a la sala
		socket.emit('updatechat', 'SERVER', 'you have connected to: ' + socket.userObject.room); //mensaje de servidor "usted entró a la sala"
		socket.broadcast.to(socket.userObject.room).emit('updatechat', 'SERVER', username + ' has connected to this room'); //mensaje de servidor "usuario entró a la sala"
	});
	
	socket.on('sendchat', function (message) {
        //envío de mensajes
		io.sockets.in(socket.userObject.room).emit('updatechat', socket.userObject.username, message); //se envía el mensaje a la sala del socket
	});
	
	socket.on('disconnect', function(){ 
        //desconexión de usuarios
        var salaVacia = false;
		delete globalChatUsers[socket.userObject.username];
        for (var userN in globalChatUsers){
            if (globalChatUsers[userN].room == socket.userObject.room){
                globalChatUsers[userN].estado = 'online';
                salaVacia = false;
                break;
            }
            else{salaVacia = true;}
        }
        if (salaVacia){
            //Eliminar sala sin usuarios
            utils.removeObjectArray(rooms, socket.userObject.room);
        }
        socket.broadcast.to(socket.userObject.room).emit('updatechat', 'SERVER', socket.userObject.username + ' has disconnected');
		socket.leave(socket.userObject.room);
	});
});