const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const { getRichieRichResponse } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");
const { client } = require("websocket");

const PORT = 8081;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const requestPrompt = req.body.prompt;
  const response = await getRichieRichResponse(requestPrompt);
  const responseHTML = RRML2HTML(response);
  res.send(responseHTML);
});

const clients = [];

const establishWSServerForFrontend = () => {
  const wss = new WebSocket.Server({ port: 8080 });
  console.log("setup ws server");
    wss.on('connection', function connection(ws) {

      clients.push(ws);
        // can't send the ws object out
        console.log('connected to ws2');

        ws.on('message', function incoming(data) {
          console.log('Received from frontend:', data.toString());
        });
         
    });

  return wss;
}


const establishWSClientForAPI = () => {
  
  const wss = new WebSocket('ws://localhost:8082/v1/stream');

  wss.on('open', () => {
    console.log('WebSocket connection established!');
  
      // def not a great idea? need to maintain a session mapping between client id to api server id, redis?
      console.log("num clients: ", clients.length);
      if(clients.length > 0){
        clients.forEach(client => {
          client.on('message', function incoming(data) {
            console.log('Received from frontend:', data.toString());
            wss.send(data);
          });
        })
      }
  });

  wss.on('message', (message) => {

    console.log('Received message from API:', (message.toString()));

      if (clients.length > 0) {        
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
              client.send(RRML2HTML(message.toString()));
          }
        });
      } else {
          console.log('No clients connected');
      }
  });
}

establishWSClientForAPI();
establishWSServerForFrontend();

// Maybe keep polling for active connections? setTimeout/setInterval? 
// Still requires manual refreshing for client

// #Hacker 101
setInterval(establishWSClientForAPI, 5000);

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
