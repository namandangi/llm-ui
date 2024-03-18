const express = require("express");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");

const { getRichieRichResponse } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const requestPrompt = req.body.prompt;
  const response = await getRichieRichResponse(requestPrompt);
  const responseHTML = RRML2HTML(response);
  res.send(responseHTML);
});

const establishWSClientForAPI = () => {
  
  const wss = new WebSocket('ws://localhost:8082/v1/stream');

  wss.on('open', () => {
    console.log('WebSocket connection established!');
    
    // Should send prompt from frontend to api here
    wss.send('Football Players');

  });

  wss.on('message', (message) => {
    console.log('Received message from API:', (message.toString()));
  });
}

establishWSClientForAPI();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
