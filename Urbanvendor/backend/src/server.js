require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectDB();

    const server = http.createServer(app);
    const { Server } = require('socket.io');
    const { socketHandler } = require('./socket/socketHandler');

    const io = new Server(server, {
      cors: {
        origin: '*', // Allow all origins for dev
        methods: ['GET', 'POST']
      }
    });

    app.set('io', io);

    // Initialize Socket Handler
    socketHandler(io);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
