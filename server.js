const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);

var rooms = [];

var mysql = require('mysql2');

var con = mysql.createConnection({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ai_debate"
});

app.use(express.static(path.join(__dirname+"/public")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/chat.html");
});


app.post("/signup", (req, res) => {
    con.query("SELECT * FROM Users", function (err, result) {
        if (err){
            res.status(400).json(err);
        }else{
            res.status(200).json(result);
        }
    })
  });

app.get("/ai", (req, res) => {
    let message = req.query.m;
    socket_id = "1";
    roommate_id = "2";
    send_to_ai(socket_id,roommate_id,message)
    res.send();
});

server.listen(Number(process.env.PORT || 5000), process.env.HOST || "127.0.0.1");
console.log("Server Running...")

class Person {
    constructor(socket_id, side) {
    this.socket_id = socket_id;
    this.side = side;
    }
}

async function send_to_ai(socket_id, roommate_id, first_message){
    // message = "Q: Answer in Yes or No; Is it true that " + first_message.text + "?\nA:"
    // const completion = await openai.createCompletion({
    //     model: "text-davinci-003",
    //     prompt: message,
    // });
    // console.log("username : " +  first_message.username);
    // console.log("first_message : " +  first_message.text);
    // console.log("answer : " + completion.data.choices[0].text);
    // //var answer = {username : 'AI', text : completion.data.choices[0].text.trim()};
    // var answer = completion.data.choices[0].text.trim();
    var answer = "";
    var registerTime = new Date().getTime();
    var record  = [first_message.username,socket_id, roommate_id, first_message.text, answer];
    con.query("insert into chat_history(username, my_id, mate_id, my_message, ai_answer, register_pot) values (?,?,?,?,?,Now())", record, function (err, result) {
        if (err) throw err;
    });
    io.to(roommate_id).emit("update", "AI said " + answer)
    io.to(socket_id).emit("update", "AI said " + answer)
}

io.on("connection",function(socket){
    socket.on("newuser", function(username,password,callback){
        con.connect(function(err) {
            if (err) throw err;
            con.query("SELECT * FROM Users WHERE name  = '"+username+"';", function (err,result) {
                var register_result = result.length
                if(result.length === 0){
                    var sql = 'Insert into Users(name,password,trophy,win,status) values("'+username+'","'+password+'",0,0,"offline");';
                    con.query(sql, function (err) {
                      if (err) throw err;
                      console.log("User created");
                    });
                    callback({
                        register: register_result
                    })
                }
                else{
                    callback({
                        register: register_result
                    })
                }
                socket.removeAllListeners("newuser");

            })
        });
        //socket.broadcast.emit("update", username + " joined the conversation");
    });
    socket.on("exituser", function(username){
        //socket.broadcast.emit("update", username + " left the conversation");
        const roommate_id = find_roommate(socket);
        if (roommate_id !== null) {
            io.to(roommate_id).emit("update", username + " left the conversation")
         }
    });
    socket.on("chat", function(message){
        //socket.broadcast.emit("chat", message);
        const roommate_id = find_roommate(socket);
        if (roommate_id !== null) {
            ai_answer = send_to_ai(socket.id, roommate_id, message)
            io.to(roommate_id).emit("chat", message)
         }
    });
    socket.on("match-user", function(username, password_match,callback){
        socket.set = false
        socket.name = username
        con.query("SELECT * FROM Users WHERE name  = '"+username+"';", function (err, result) {
            if(err) throw err;
            if(result.length === 1){
                if (result[0].status === "online"){
                    callback({
                        login: "online"
                    })
                    socket.set = false
                    return
                }
                else{
                    con.connect(function(err) {
                        if (err) throw err;
                        con.query("SELECT * FROM Users WHERE name  = '"+username+"';", function (err, result) {
                            if (err) throw err;
                            if (result.length === 1){
                                userpassword = result[0].password
                                if (password_match === userpassword){
                                    var login_result = result.length
                                    callback({
                                        login: login_result
                                    })
                                    socket.removeAllListeners("match-user");
                                    socket.set = true
                                    con.query("UPDATE Users SET status = 'online' WHERE name = '" + username+"';", function (err) {
                                        console.log("User: "+username+" online")
                                        if (err) throw err;
                                    })
                                }
                            }
                            
                            
                        });
                        
                    });
                }
            }
        })
        
    });
    socket.on("join", function(username,side,callback){
        con.query("UPDATE Users SET side = '"+side+"' WHERE name = '" + username+"';", function (err) {
            if (err) throw err;
        })
        if (side === "capitalism")
            side = 1
        else if (side === "socialism"){
            side = -1;
        }
        con.query("SELECT * FROM Users WHERE name  = '"+username+"';", function (err, result) {
            if(err) throw err;
            callback({
                result: result
            })

            const newUser = new Person(socket.id,side)
            const roommate_id = rooms_add(newUser)
            if (roommate_id !== null) {
                console.log("join message : " + roommate_id);
                io.to(roommate_id).emit("update", username + " joined the conversation")
                io.to(roommate_id).emit("userpf", result)
            }
        })
        
        
    });
    socket.on('rmpf', function(username) {
        const roommate_id = find_roommate(socket);
        console.log(1234)
        console.log(username)
        con.query("SELECT * FROM Users WHERE name  = '"+username+"';", function (err, result) {
            if(err) throw err;
            io.to(roommate_id).emit("otherpf", result)
            console.log(result)
        })
    });
    socket.on('disconnect', function() {
        if(socket.set){
            con.query("UPDATE Users SET status = 'offline' WHERE name = '" + socket.name+"';", function (err) {
                if (err) throw err;
            })
            console.log(socket.name);
        }    
    });
    socket.on('win',function(username,rating){
        username = 1234
        var win;
        var trophy;
        con.query("SELECT * FROM Users WHERE name  = '"+username+"';", function (err, result) {
            if(err) throw err;
            win = result[0].win;
            trophy = result[0].trophy;
            win += 1;
            trophy += Math.floor(Math.random() * 3)+8;
            con.query("UPDATE Users SET win = '"+win+"', trophy = '"+trophy+"' WHERE name = '" + username+"';", function (err) {
                if (err) throw err;
            })
        })
        
    })
});

function rooms_add(newUser){
    for (const room of rooms) {
        console.log("length : " + room.length);
        if (room.length === 1) {
            if ((parseInt(room[0].side) + parseInt(newUser.side)) == 0) {
                console.log("Find the room to join my s_id : " + newUser.socket_id);
                console.log("Find the room to join roommate_id : " + room[0].socket_id);
                room.push(newUser);
                return room[0].socket_id;
            }
        }
    }

    new_room = []
    new_room.push(newUser)
    rooms.push(new_room);
    console.log("Create a new room id " + rooms.length + " s_id : " + newUser.socket_id);
    return null;
}

function find_roommate(socket){
    console.log("find_roommate id : " + socket.id);
    for (const room of rooms) {
        console.log("find_roommate room length : " + room.length);
        for ( i = 0 ;  i < room.length ;i++) {
        //room.forEach((item, index, array) => {
             console.log("socket id : " + room[i].socket_id);
             if (room[i].socket_id === socket.id) {
                console.log("same id : " + room[i].socket_id + " index : " + i);
                if ( i === 0 ) {
                    if (room.length === 2) {
                        return room[1].socket_id;
                    }
                    else {
                        console.log("No element in find roommate 1");
                        return null;
                    }
                }
                else
                    return room[0].socket_id;
            }
        //});
        }

    }
    console.log("No element in find roommate");
}