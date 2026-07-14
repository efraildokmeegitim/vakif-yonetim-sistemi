import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // O(n) remove, for simple case it's fine. 
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    if (data && data.userId) {
      this.userSockets.set(data.userId.toString(), client.id);
      console.log(`User ${data.userId} registered with socket ${client.id}`);
    }
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId.toString());
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  sendToAll(notification: any) {
    this.server.emit('notification', notification);
  }
}
