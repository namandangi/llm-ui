const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const { getRichieRichResponse } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");
const { client } = require("websocket");
const { WebSocketServer, WebSocketClient } = require('./websockets/index');

const PORT = 8081;
const wss_PORT = 8080;
const wss_URL = 'ws://localhost:8082/v1/stream';
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


const wsserver = new WebSocketServer(wss_PORT);
const wsclient = new WebSocketClient(wss_URL, (data) => {
  wsserver.broadcast(data);
});

wsserver.start();

wsserver.wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    wsclient.send(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
