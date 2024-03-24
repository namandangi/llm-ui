const WebSocket = require('ws');
const RRML2HTML = require("../utils/RRML2HTML");

class WebSocketServer {
  constructor(port) {
    this.wss = new WebSocket.Server({ port });
    this.clients = new Set();

    this.wss.on('connection', (ws) => this.handleConnection(ws));
  }

  handleConnection(ws) {
    console.log('Frontend client connected');
    this.clients.add(ws);

    ws.on('close', () => {
      console.log('Frontend client disconnected');
      this.clients.delete(ws);
    });

    ws.on('message', (data) => {
      console.log(`Received message from frontend: ${data}`);
    });
  }

  broadcast(data) {
    this.clients.forEach((ws) => {
      ws.send(RRML2HTML(data.toString()));
    });
  }

  start() {
    console.log(`WebSocket server started on port ${this.wss.options.port}`);
  }
}

module.exports = WebSocketServer;