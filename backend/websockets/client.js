const WebSocket = require('ws');

class WebSocketClient {
  constructor(url, onMessage) {
    this.ws = new WebSocket(url);
    this.onMessage = onMessage;

    this.ws.on('open', () => {
      console.log('Connected to GPT API');
    });

    this.ws.on('close', () => {
      console.log('Disconnected from GPT API');
    });

    this.ws.on('message', (data) => {
      console.log(`Received message from API: ${data}`);
      this.onMessage(data);
    });
  }

  send(data) {
    this.ws.send(data);
  }
}

module.exports = WebSocketClient;