var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var dt = new Date();
var utcDate = dt.toUTCString();
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chat');

// variable declaration done and giving index file
app.get('/', function(req, res){
res.sendFile('index.html', { root: __dirname });
});


app.get('/log_out.html', function(req, res){
res.sendFile('log_out.html', { root: __dirname });
});
// Session starts
io.on('connection', function(socket){
  socket.on('join',function(user){
  socket.username=user;
 socket.emit('welcome message', user + " Welcome to the Chat Room");

  db.serialize(function() {
  db.run("CREATE TABLE if not exists user (name TEXT, login TEXT)");
  db.run("CREATE TABLE if not exists msglog (name TEXT, msg TEXT,time TEXT)");
  var stmt = db.prepare("INSERT INTO user VALUES (?,?)");
  var d = new Date();
  var n = d.toLocaleTimeString();
  stmt.run(socket.username, n);
  stmt.finalize();

/* 
  db.run(" DROP TABLE if exists user;",function(err){
     console.log("Error is "+ err);
});

   db.run(" DROP TABLE if exists msglog;",function(err){
     console.log("Error is "+ err);
 });
*/

  db.each("SELECT * FROM(SELECT * FROM msglog ORDER BY time DESC limit 10) tmp ORDER by tmp.time ASC;", function(err, row) {
  //    console.log("User Name : "+row.name + "Message ::" + row.msg + "Time Stamps::"+ row.time);
     socket.emit('chat message', '<div id="user">' + row.name+'</div><div id="mesg">'+row.msg+'</div><div id="times">'+row.time +'</div>');
   // socket.emit ('history',row.time);
     //socket.emit ('history',row.msg);
  });

});
});

  socket.on('chat message', function(msg){
   var d = new Date();
  var n = d.toLocaleTimeString();
   io.emit('chat message', '<div id="user">' + socket.username+'</div><div id="mesg">'+msg+'</div><div id="times">'+n +'</div>');
  // io.emit('chat message', n);
  // io.emit('chat message', msg);
  var stmt = db.prepare("INSERT INTO msglog VALUES (?,?,?)");
  stmt.run(socket.username,msg, utcDate);
  stmt.finalize();
  });

  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
