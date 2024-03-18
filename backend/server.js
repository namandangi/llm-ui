const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const { getRichieRichResponse } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");

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

const establishWSServerForFrontend = () => {
  const wss = new WebSocket.Server({ port: 8080 });
  console.log("setup ws server");
    wss.on('connection', function connection(ws) {

        // can't send the ws object out
        console.log('connected to ws2');
        ws.send('sending test message to client');

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
    
    // Should send prompt from frontend to api here
    // wss.send('Football Players');

  });

  wss.on('message', (message) => {
    console.log('Received message from API:', (message.toString()));
  });
}

establishWSClientForAPI();
establishWSServerForFrontend();

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
