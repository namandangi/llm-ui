// server.test.js
const WebSocket = require('ws');
const WebSocketServer = require('../websockets/server');

describe('WebSocketServer', () => {
  let server;
  let client;

  beforeEach(() => {
    server = new WebSocketServer(8080);
    client = new WebSocket('ws://localhost:8080');
  });

  afterEach(() => {
    server.wss.close();
    client.close();
  });

  test('should broadcast message to all connected clients', (done) => {
    const message = 'Hello, World!';
    let receivedMessage;

    client.on('message', (data) => {
      receivedMessage = data.toString();
    });

    client.on('open', () => {
      server.broadcast(message);
    });

    setTimeout(() => {
      expect(receivedMessage).toBe(message);
      done();
    }, 100);
  });

  test('should handle client connection and disconnection', (done) => {
    let connectedClients = 0;
    let disconnectedClients = 0;

    server.wss.on('connection', () => {
      connectedClients++;
    });

    client.on('close', () => {
      disconnectedClients++;
    });

    client.on('open', () => {
      client.close();
    });

    setTimeout(() => {
      expect(connectedClients).toBe(1);
      expect(disconnectedClients).toBe(1);
      done();
    }, 100);
  });
});