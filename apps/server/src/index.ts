import 'dotenv/config';
import { Server } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import { HubRoom } from './rooms/HubRoom.js';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { connectDatabase } from './db/prisma.js';

const app = express();
const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer,
  }),
});

gameServer.define('hub', HubRoom);

const PORT = Number(process.env.PORT) || 2567;

async function start() {
  try {
    await connectDatabase();
    console.log('✅ Database connected');

    httpServer.listen(PORT, () => {
      console.log(`🎮 Colyseus Hub server running on port ${PORT}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
