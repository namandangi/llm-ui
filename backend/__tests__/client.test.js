// client.test.js
const WebSocket = require('ws');
const WebSocketClient = require('../websockets/client');

// jest.useRealTimers();
// jest.useFakeTimers('legacy');

describe('WebSocketClient', () => {
  let client;
  let server;

  beforeAll(() => {
    server = new WebSocket.Server({ port: 8081 });
    server.on('connection', (ws) => {
      ws.on('message', (data) => {
        ws.send(data); // Echo the received message back
      });
    });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    client = new WebSocketClient('ws://localhost:8081', 2, (data) => {
      // Handle received messages
      console.log(`received message: ${data}`);
    });
    client.connect();
  });

  afterEach(() => {
    client.ws.close();
  });

  test('should send and receive messages', (done) => {
    const message = 'Hello, World!';
    let receivedMessage;

    client.ws.on('message', (data) => {
      receivedMessage = data.toString();
    });

    client.ws.on('open', () => {
      client.send(message);
    });

    setTimeout(() => {
      expect(receivedMessage).toBe(message);
      done();
    }, 100);
  });

  // test('should handle reconnection attempts', (done) => {
  //   const maxReconnectAttempts = 2;
  //   let reconnectAttempts = 0;

  //   client.maxReconnectAttempts = maxReconnectAttempts;

  //   const originalHandleReconnect = client.handleReconnect.bind(client);
  //   client.handleReconnect = () => {
  //     reconnectAttempts++;
  //     originalHandleReconnect();
  //   };

  //   client.ws.close(); // Trigger reconnection

  //   setTimeout(() => {
  //   expect(reconnectAttempts).toBe(maxReconnectAttempts);
  //   done();
  //   }, 5000);

  // });
});