const WebSocket = require('ws');

class WebSocketClient {
  constructor(url, maxReconnectAttempts, onMessage) {
    this.url = url;
    this.onMessage = onMessage;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.on('open', () => {
      console.log('Connected to third-party API');
      this.reconnectAttempts = 0;
    });

    this.ws.on('close', () => {
      console.log('Disconnected from third-party API');
      this.handleReconnect();
    });

    this.ws.on('message', (data) => {
      console.log(`Received message from API: ${data}`);
      this.onMessage(data);
    });
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(data);
    } else {
        console.log('WebSocket connection is not open.');
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const timeout = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff

      setTimeout(() => {
        this.reconnectAttempts += 1;
        console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts})...`);
        this.connect(); // Attempt to reconnect
      }, timeout);
    } else {
      console.log('Max reconnect attempts reached, not attempting further reconnects.');
    }
  }
}

module.exports = WebSocketClient;