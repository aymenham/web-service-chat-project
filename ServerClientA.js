var http = require('http');
var url = require('url');

var portInterServer1 = 8090;
var portInterServer2 = 8081;
var PORT_SERVER_REGISTER = 7000;

var portClient1 = 8000;
var portClient2 = 8001;



var host1 = "localhost";
var host2 = "localhost";
var HOST_SERVER_REGISTER = "localhost"; 

var optionRegister = {
  port: PORT_SERVER_REGISTER,
  hostname: HOST_SERVER_REGISTER,
  host: HOST_SERVER_REGISTER + ":" + PORT_SERVER_REGISTER,
  path: "",
  method: "",
};

var name = ""

var messages = {};
var users = []



const isNameExist =  (name)=>{

  
     const user = users.find((element) => element.name == name);

     return user

}

//validation envoie un message 
const validateRequestClient = (user)=>{

   if (!user.name) return "name missed";
   else if (!user.message) return "message missed";
   else {
     const user = checkname(user.name);
     if (user) return user;
   }

   return false;

}

var clientRequestHandler = function(req, res){
    var path = req.url.split('?')[0];
    if(!path || path =='/'){
        res.writeHead(404, {'Content-type': 'application/json'});
        res.end('{message : "page not found"}');
    }else{
        if(req.method == 'GET'){
            res.writeHead(200, {'Content-type': 'application/json'});

            if(path=='/users'){

                optionRegister.path = path
                optionRegister.method = req.method

                const request = http.request(
                  optionRegister,
                  function (response) {
                    var body = "";
                    response.on("error", function (e) {
                      console.log(e);
                      res.writeHead(500, {
                        "Content-type": "application/json",
                      });
                      res.end(e);
                    });
                    response.on("data", function (data) {
                      body += data.toString();
                    });
                    response.on("end", function () {
                      res.writeHead(200, {
                        "Content-type": "application/json",
                      });
                      users = JSON.parse(body)
                      res.end(body);
                    });
                  }
                );

                request.on("error", function (e) {
                  console.log(e);
                  res.writeHead(500, { "Content-type": "application/json" });
                  res.end(e);
                });
                req.pipe(request);



            }else {

              const name = path.split("/")[1];
              const isSended = messages[name];
              
                      if (!isSended) {
                        res.end(JSON.stringify([]));
                      } else {
                        const message = JSON.stringify(messages[name]);
                        res.end(message);
                        messages[name] = 0;
                        delete messages[name];
                      }
            }

        }else if(req.method == 'POST'){


             if (path == "/register") {
               optionRegister.path = path;
               optionRegister.method = req.method;

               const request = http.request(optionRegister, function (response) {
                 var body = "";
                 response.on("error", function (e) {
                   console.log(e);
                   res.writeHead(500, {
                     "Content-type": "application/json",
                   });
                   res.end(e);
                 });
                 response.on("data", function (data) {
                   body += data.toString();
                 });
                 response.on("end", function () {
                   res.writeHead(200, {
                     "Content-type": "application/json",
                   });

                   const result = JSON.parse(body);
                   
                   if(result.name){
                     name = JSON.parse(body).name
                   }
                  users = result.users
                  console.log(result);
                  console.log(users);
                  res.end(body);
                 });
               });

               request.on("error", function (e) {
                 console.log(e);
                 res.writeHead(500, { "Content-type": "application/json" });
                 res.end(e);
               });
               req.pipe(request);
             }

            else  {

              const user = isNameExist(path.split("/")[1]);
              if(!user){
                  res.end("{message : name pas en ligne ou n'existe pas}")
              }

              else {
                const PORT  = user.port
                const HOST  = user.host
                  var options = {
                    port: PORT,
                    hostname: HOST,
                    host: host2 + ":" + PORT,
                    path: path,
                    method: req.method,
                  };
                  var request = http.request(options, function (response) {
                    var body = "";
                    response.on("error", function (e) {
                      console.log(e);
                      res.writeHead(500, {
                        "Content-type": "application/json",
                      });
                      res.end(e);
                    });
                    response.on("data", function (data) {
                      body += data.toString();
                    });
                    response.on("end", function () {
                      res.writeHead(200, {
                        "Content-type": "application/json",
                      });
                     
                      res.end(body);
                    });
                  });
                  request.on("error", function (e) {
                    console.log(e);
                    res.writeHead(500, {
                      "Content-type": "application/json",
                    });
                    res.end(e);
                  });
                  req.pipe(request);
              }
            }

            
           
        }else{
            res.writeHead(404, {'Content-type': 'application/json'});
            res.end('{message : "page not found"}');
        }
    }
}
var interServerRequestHandler = function (req, res) {
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, { "Content-type": "application/json" });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "POST") {
      
      var body = "";
      res.writeHead(200, { "Content-type": "application/json" });
      req.on("data", function (data) {
        body += data.toString();
      });
      req.on("end", function () {
        const object = JSON.parse(body);
        const name = object.name;
        const message = object.message;
        if (!messages[name]) {
          messages[name] = [];
        }
        messages[name].push(message);
        res.end('{status : "ok"}');
      });
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
    }
  }
};
var clientServer = http.createServer(clientRequestHandler);
var interServer = http.createServer(interServerRequestHandler);
clientServer.listen(portClient1);
interServer.listen(portInterServer1);