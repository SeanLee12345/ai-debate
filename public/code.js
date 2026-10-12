(function(){
    const middle = document.querySelector(".middle")
    const socket = io();

    let uname;
    var capitalism = false
    var socialism = false
    var username;

    middle.querySelector(".join-screen #join-user").addEventListener("click", function(){
        passwordMatch();
    });
    middle.querySelector(".join-screen #password_match").addEventListener("keydown", (event) =>{
        if(event.key === "Enter"){
            passwordMatch();
        }
    });
    function passwordMatch(){
        username = middle.querySelector(".join-screen #username").value;
        let password_match = middle.querySelector(".join-screen #password_match").value;
        online = false
        if (username.length === 0){
            setTimeout("Blink4()",50);
            document.getElementById("blink2").style.backgroundColor = "";
            document.getElementById("blink2").innerHTML = "&nbsp;";
            return;
        }
        if (password_match === 0){
            setTimeout("Blink4()",50)
            document.getElementById("blink2").style.backgroundColor = "";
            document.getElementById("blink2").innerHTML = "&nbsp;";
            return;
        }
        //Match Username and Password using database here
        socket.emit("match-user",username,password_match,(response) => {
            if(response.login === 1){
                uname = username;
                RemClass("join-screen");
                AddClass("choose");
                return;
            }
            else if(response.login === "online"){
                online = true
                setTimeout("Blink6()",50)
                document.getElementById("blink2").style.backgroundColor = ""
                document.getElementById("blink2").innerHTML = "&nbsp;"
                return;
            }
        });
        setTimeout(function() {
            if(online === false){
                setTimeout("Blink4()",50)
                document.getElementById("blink2").style.backgroundColor = ""
                document.getElementById("blink2").innerHTML = "&nbsp;"
            }
        },10)
    }
    middle.querySelector(".join-screen #to-register").addEventListener("click", function(){
        RemClass("join-screen");
        AddClass("register");
    });
    middle.querySelector(".chat-screen #send-message").addEventListener("click", function(){
        sendMessage();
    });
    middle.querySelector(".chat-screen #message-input").addEventListener("keydown", (event) =>{
        if(event.key === "Enter"){
            sendMessage();
        }
    });
    function sendMessage(){
        let message = middle.querySelector(".chat-screen #message-input").value;
        if (message.length == 0){
            return;
        }
        renderMessage("my",{
            username:uname,
            text: message
        });
        socket.emit("chat",{
            username:uname,
            text:message
        });
        middle.querySelector(".chat-screen #message-input").value = "";
    }
    middle.querySelector(".chat-screen #exit-chat").addEventListener("click", function(){
        socket.emit("exituser",uname);
        window.location.href = window.location.href;
    });

    socket.on("update",function(update){
        renderMessage("update",update);
    });
    socket.on("chat",function(message){
        renderMessage("other",message);
    }); 
    socket.on("userpf",function(result){
        document.getElementById("otherpf").innerHTML = result[0].name;
        document.getElementById("otherside").innerHTML = "Side: "+result[0].side[0].toUpperCase()+result[0].side.slice(1, result[0].side.length);
        document.getElementById("otherwin").innerHTML = "Wins: "+result[0].win;
        document.getElementById("otherty").innerHTML = "Trophies: "+result[0].trophy;
        console.log(username)
        socket.emit("rmpf", username)
    }); 
    socket.on("otherpf",function(result){
        console.log(result)
        document.getElementById("otherpf").innerHTML = result[0].name;
        document.getElementById("otherside").innerHTML = "Side: "+result[0].side[0].toUpperCase()+result[0].side.slice(1, result[0].side.length);
        document.getElementById("otherwin").innerHTML = "Wins: "+result[0].win;
        document.getElementById("otherty").innerHTML = "Trophies: "+result[0].trophy;
    });

    function renderMessage(type,message){
        let messageContainer = middle.querySelector(" .chat-screen .messages");
        if(type == "my"){
            let el = document.createElement("div");
            el.setAttribute("class","message my-message");
            el.innerHTML = '<div><div class = "name">You</div><div class = "text">'+message.text+'</div></div>';
            messageContainer.appendChild(el);
        } else if(type == "other"){
            let el = document.createElement("div");
            el.setAttribute("class","message other-message");
            el.innerHTML = '<div><div class = "name">'+message.username+'</div><div class = "text">'+message.text+'</div></div>';
            messageContainer.appendChild(el);
        } else if(type == "update"){
            let el = document.createElement("div");
            el.setAttribute("class","update");
            el.innerText = message;
            messageContainer.appendChild(el);
        }
        messageContainer.scrollTop - messageContainer.scrollHeight - messageContainer.clientHeight;
    }
    middle.querySelector("#btojoin").addEventListener("click", function(){
        document.getElementById("password").value = "";
        document.getElementById("password-check").value = "";
        document.getElementById("creuser").value = "";
        RemClass("register");
        AddClass("join-screen");
    })
    middle.querySelector("#register").addEventListener("click", function(){
        createAccount();
    });
    middle.querySelector("#password-check").addEventListener("keydown", (event) =>{
        if(event.key === "Enter"){
            createAccount();
        }
    });
    function createAccount(){
        password = document.getElementById("password").value;
        passwordcheck = document.getElementById("password-check").value;
        username = document.getElementById("creuser").value;
        if(username != ""){
            if(password === passwordcheck){
                if(password === ""){
                    setTimeout("Blink2()",50);
                }
                else{
                    socket.emit("newuser",username,password,(response) => {
                        console.log(response.register)
                        if(response.register === 0){
                            document.getElementById("password").value = "";
                            document.getElementById("password-check").value = "";
                            document.getElementById("creuser").value = "";
                            RemClass("register");
                            AddClass("join-screen");
                        }
                        else{
                            setTimeout("Blink3()",50)
                            document.getElementById("blink").style.backgroundColor = ""
                            document.getElementById("blink").innerHTML = "&nbsp;"

                        }
                    });

                }
                document.getElementById("blink").style.backgroundColor = ""
                document.getElementById("blink").innerHTML = "&nbsp;"
            }
            else{
                setTimeout("Blink()",50);
                document.getElementById("blink").style.backgroundColor = ""
                document.getElementById("blink").innerHTML = "&nbsp;"

            }
        }
        else{
            setTimeout("Blink5()",50)
            document.getElementById("blink").style.backgroundColor = ""
            document.getElementById("blink").innerHTML = "&nbsp;"
        }
    }
    middle.querySelector("#choose_side").addEventListener("click", function(){
        if(capitalism === true || socialism === true){
            if(capitalism === true){
                side = "capitalism"
            }
            else{
                side = "socialism"
            }
            socket.emit("join",uname,side,(response) => {
                result = response.result
                document.getElementById("yourpf").innerHTML = "You("+result[0].name+")";
                document.getElementById("yourside").innerHTML = "Side: "+result[0].side[0].toUpperCase()+result[0].side.slice(1, result[0].side.length);
                document.getElementById("yourwin").innerHTML = "Wins: "+result[0].win;
                document.getElementById("yourty").innerHTML = "Trophies: "+result[0].trophy;
                
            })
            RemClass("choose");
            AddClass("chat-screen");
        }
        
    });
    middle.querySelector("#capitalism").addEventListener("click", function(){
        if(capitalism === false){
            capitalism = true
            socialism = false
            document.getElementById("socialism").style.padding = "14px 40px"
            document.getElementById("socialism").style.borderWidth = "2px";
            document.getElementById("socialism").style.width = "49%";
            document.getElementById("socialism").style.backgroundColor = "#ffffff"
            document.getElementById("capitalism").style.padding = "10px 40px"
            document.getElementById("capitalism").style.borderWidth = "5px";
            document.getElementById("capitalism").style.width = "49%";
            document.getElementById("capitalism").style.backgroundColor = "#eeeeee"
        }
        else{
            capitalism = false
            document.getElementById("capitalism").style.padding = "14px 40px"
            document.getElementById("capitalism").style.borderWidth = "2px";
            document.getElementById("capitalism").style.width = "49%";
            document.getElementById("capitalism").style.backgroundColor = "#ffffff"
        }
    });
    middle.querySelector("#socialism").addEventListener("click", function(){
        if(socialism === false){
            socialism = true
            capitalism = false
            document.getElementById("capitalism").style.padding = "14px 40px"
            document.getElementById("capitalism").style.borderWidth = "2px";
            document.getElementById("capitalism").style.width = "49%";
            document.getElementById("capitalism").style.backgroundColor = "#ffffff"
            document.getElementById("socialism").style.padding = "10px 40px"
            document.getElementById("socialism").style.borderWidth = "5px";
            document.getElementById("socialism").style.width = "49%";
            document.getElementById("socialism").style.backgroundColor = "#eeeeee"
        }
        else{
            socialism = false
            document.getElementById("socialism").style.padding = "14px 40px"
            document.getElementById("socialism").style.borderWidth = "2px";
            document.getElementById("socialism").style.width = "49%";
            document.getElementById("socialism").style.backgroundColor = "#ffffff"
            
        }
        

    });
    middle.querySelector("#win").addEventListener("click", function(){
        socket.emit("exituser",uname);
        let username = middle.querySelector(".join-screen #username").value;
        var rating = 0;
        socket.emit("win",username,rating)
        RemClass("join-screen");
        AddClass("win-screen");
    });
    middle.querySelector("#rematch").addEventListener("click", function(){
        RemClass("win-screen");
        AddClass("join-screen");
    });
})();
function Blink(){
    document.getElementById("blink").style.backgroundColor = "#ffffff"
    document.getElementById("blink").innerHTML = "The passwords do not match"
    document.getElementById("password").value = "";
    document.getElementById("password-check").value = "";
}
function Blink2(){
    document.getElementById("blink").style.backgroundColor = "#ffffff"
    document.getElementById("blink").innerHTML = "Please put in a password"
}
function Blink3(){
    document.getElementById("blink").style.backgroundColor = "#ffffff"
    document.getElementById("blink").innerHTML = "Username is already taken"
}
function Blink4(){
    document.getElementById("blink2").style.backgroundColor = "#ffffff"
    document.getElementById("blink2").innerHTML = "Username or Password is incorrect"
}
function Blink5(){
    document.getElementById("blink").style.backgroundColor = "#ffffff"
    document.getElementById("blink").innerHTML = "Please put in a username"
}
function Blink6(){
    document.getElementById("blink2").style.backgroundColor = "#ffffff"
    document.getElementById("blink2").innerHTML = "User is already online"
}
function RemClass(class_name){
    nofc = document.getElementsByClassName(class_name);
    for (var i = 0; i < nofc.length; i++) {
        nofc[i].classList.remove('active')
    }
}
function AddClass(class_name){
    nofc = document.getElementsByClassName(class_name);
    for (var i = 0; i < nofc.length; i++) {
        nofc[i].classList.add('active')
    }
}