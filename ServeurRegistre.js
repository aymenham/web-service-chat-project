const http = require("http");

const PORT_SERVER_REGISTER = 7000;
var optionPing = {
  port: "",
  hostname: "",
  host: "",
  path: "/ping",
  method: "POST",
};

const users = [];

// vérifier si utilisateur existe dèja
const checkUsername = (username) => {
  const user = users.find((element) => element.username == username);

  if (user) return true;

  return false;
};

// checker les error pour un registre
//ajouter host en requiert
const validateRegisterError = (user) => {
  if (!user.username || !user.port) {
    if (!user.username) return "username missed";

    if (!user.port) return "port missed";
  } else if (user.port) {
    if (typeof user.port != "number") return "port is not a number";
    else {
      if (!Number.isInteger(user.port)) return "port is not an integer";
      else {
        const isUserExist = checkUsername(user.username);
        if (isUserExist) return "username existe dèja";
      }
    }
  }

  return false;
};

// Heartbeat des clients
const postData = {
  message: "liste des utilisateurs connectés",
  users: users,
};

const HeartBeatRequest = function () {
  const filteredUsers = postData.users.filter(function (user) {
    return user.isOnline;
  });
  postData.users = filteredUsers;
  console.log("filtered data :", postData);
  if (users.length > 0) {
    //Need to update users
    for (let i = 0; i < users.length; i++) {
      //spécificité de chaque utilisateur
      const hostnameClient = users[i].host;
      const portClient = users[i].port;
      const hostClient = `${hostnameClient}:${portClient}`;
      optionPing.hostname = hostnameClient;
      optionPing.port = portClient;
      optionPing.host = hostClient;
      //prépare la requête
      var req = http.request(optionPing, function (res) {
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on("end", function () {
          users[i].isOnline = true;
        });
        res.on("error", function (e) {
          console.error(`problem with response: ${e.message}`);
        });
      });
      req.on("error", function (e) {
        users[i].isOnline = false;
        console.error(`problem with request: ${e.message}`);
      });
      //envoyer le résultat de la list en post
      req.write(JSON.stringify(postData));
      req.end();
    }
  }
};
//periodicité de 30s
setInterval(HeartBeatRequest, 30000);

var RegisterServerRequestHandler = function (req, res) {
  var path = req.url.split("?")[0];
  if (!path || path == "/") {
    res.writeHead(404, { "Content-type": "application/json" });
    res.end('{message : "page not found"}');
  } else {
    if (req.method == "GET") {
      res.end(JSON.stringify(users));
    } else if (req.method == "POST") {
      var body = "";
      res.writeHead(200, { "Content-type": "application/json" });
      req.on("data", function (data) {
        body += data.toString();
      });
      req.on("end", function () {
        const user = JSON.parse(body);
        if (user instanceof Object) {
          const validate = validateRegisterError(user);

          if (validate) {
            res.end(JSON.stringify({ message: validate }));
          } else {
            user.isOnline = true;
            users.push(user);
            res.end(JSON.stringify(user));
          }
        } else {
          res.end(
            JSON.stringify({
              message:
                "error data  type : il faut mettre un object avec username et son port",
            })
          );
        }
      });
    } else {
      res.writeHead(404, { "Content-type": "application/json" });
      res.end('{message : "page not found"}');
    }
  }
};

const server = http.createServer(RegisterServerRequestHandler);

server.listen(PORT_SERVER_REGISTER);
