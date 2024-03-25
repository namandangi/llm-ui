const express = require("express");
const cors = require("cors");
const http = require("http");

const { getRichieRichResponse } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");
const { WebSocketServer, WebSocketClient } = require('./websockets/index');
const { PORT, wss_PORT, maxReconnectAttempts, wss_URL } = require('./config/constants');

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
const wsclient = new WebSocketClient(wss_URL, maxReconnectAttempts, (data) => {
  wsserver.broadcast(data);
});

wsclient.connect();
wsserver.start();

wsserver.wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    wsclient.send(data);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
