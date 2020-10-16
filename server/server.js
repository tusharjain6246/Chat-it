var path = require('path');
const http = require('http');

const express = require('express');
const socketIO = require('socket.io');
const moment = require('moment');

var date = moment();
console.log(date.format('h: mm a'));

const {generateMessage, generateLocationMessage, generateBotMessage} = require ('./utils/message.js');
const {isReal} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');

const port = process.env.PORT || 3000;
var publicPath = path.join(__dirname, '../public');
console.log(publicPath);
var app = express();
var  server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket)=>{
  console.log('new connection done');
  console.log(io.engine.clientsCount);
//  emit sends to everyone
//   socket.emit('newMsg',generateMessage('admin', 'welcome to chat app'));
//  broadcast emit sends to eveyone except me
//   socket.broadcast.emit('newMsg',generateMessage('admin', 'new user joines'));

  socket.on('join',async (params,callback)=>  {
    if(!isReal(params.name) || !isReal(params.room)){
      callback('name and room r required');
    }
    // if(params)
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id,params.name,params.room);

    io.to(params.room).emit('updateList', users.getUserList(params.room));


    // socket.emit('newMsg',generateMessage('admin', 'welcome to chat app'));

    socket.broadcast.to(params.room).emit('newMsg',generateMessage('admin', `${params.name} joins`));
    if(params.type =="student"){
      socket.emit('newMsg',generateBotMessage('admin', 'How may I help'));
    }
    callback();
  });

  socket.on('createMsg',(msg, callback)=>{
    console.log('create meaasage', msg);
    var user = users.getUser(socket.id);

    // else if()
    if (user && typeof msg.text =="string" && msg.text !=="") {
      // io.to(user.room).emit('newMsg',generateMessage(user.name, msg.text));
      var text;
      if(msg.text.includes('services')){
        socket.emit('newMsg',generateMessage(user.name, msg.text));

        text = "I can provide the services like different quizzes available, the class timings and many more";
        socket.emit('newMsg',generateBotMessage("admin", text));

        // io.to(user.room).emit('newMsg',generateMessage("admin", text));
      }
      else if(msg.text.includes("class timings")){
        socket.emit('newMsg',generateMessage(user.name, msg.text));
        text = `Monday 9-10am
        Tuesday 10-12am`;
        socket.emit('newMsg',generateBotMessage("admin", text));

        // io.to(user.room).emit('newMsg',generateMessage("admin", text));
      }
      else{
        io.to(user.room).emit('newMsg',generateMessage(user.name, msg.text));
      }

    }

    callback('this is from server');
  });

  socket.on('createLocation',(coords)=>{
    var user = users.getUser(socket.id);
    if(user){
      io.to(user.room).emit('newLocationMsg', generateLocationMessage(user.name,coords.latitude,coords.longitude));
    }
  })

  socket.on('disconnect',()=>{
    console.log('disconnected to users');

    var user = users.removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('updateList', users.getUserList(user.room));
      io.to(user.room).emit('newMsg', generateMessage('admin', `${user.name} has left`));
    }
  });
});

server.listen(port, ()=>{
  console.log(`server started at port ${port}`);
});
