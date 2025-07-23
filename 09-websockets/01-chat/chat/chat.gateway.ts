import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ChatService } from "./chat.service";

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection {
  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
  }

  @SubscribeMessage("chatMessage")
  async chatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { text: string },
  ) {}
}
