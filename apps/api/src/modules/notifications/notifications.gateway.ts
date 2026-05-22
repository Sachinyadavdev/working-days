import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { LoggerService } from '../../logger/logger.service';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly logger: LoggerService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
      this.logger.log(`User ${userId} connected via WebSocket`, 'NotificationsGateway');
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.connectedUsers.entries()]
      .find(([, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.connectedUsers.delete(userId);
      this.logger.log(`User ${userId} disconnected`, 'NotificationsGateway');
    }
  }

  /**
   * Send a notification to a specific user if they're connected
   */
  sendToUser(userId: string, notification: Record<string, unknown>) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: Record<string, unknown>) {
    this.server.emit(event, data);
  }
}
