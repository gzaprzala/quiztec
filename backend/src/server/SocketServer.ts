import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import passport from 'passport';
import { Request } from 'express';
import { display } from '#lib/display';
import { ClientToServerEvents, ServerToClientEvents } from '#types/api/socket';
import { generateSessionMiddleware } from './middlewares';
import { User as UserEntity } from '#database/entities/User';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserEntity {}
  }
}

declare module 'express-session' {
  interface SessionData {
    passport: {
      user: string;
    };
  }
}

export class SocketServer {
  private static instance: SocketServer;

  public readonly io: Server<ClientToServerEvents, ServerToClientEvents>;

  public static async createInstance(httpServer: HTTPServer): Promise<SocketServer> {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer(httpServer);
      await SocketServer.instance.registerRoutes();

      return SocketServer.instance;
    } else {
      throw new Error('SocketServer instance already initialized');
    }
  }

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      throw new Error('SocketServer instance not initialized');
    }

    return SocketServer.instance;
  }

  constructor(httpServer: HTTPServer) {
    this.io = new Server(httpServer);
  }

  private async registerRoutes() {
    const sessionMiddleware = await generateSessionMiddleware();

    this.io.engine.use(sessionMiddleware);
    this.io.engine.use(passport.initialize());
    this.io.engine.use(passport.session());

    this.io.use((socket, next) => {
      const req = socket.request as Request;
      if (req.isUnauthenticated()) next(new Error('Unauthenticated'));

      next();
    });

    this.io.on('connection', async (socket) => {
      const req = socket.request as Request;

      if (req.isUnauthenticated() || req.user === undefined) {
        display.error.nextLine('SocketServer', 'Unauthenticated user connected');
        return socket.disconnect(true);
      }

      await socket.join(req.user._id.toHexString());

      socket.onAny((event, ...message) => {
        display.debug.nextLine('SocketServer', event, message);
      });

      display.debug.nextLine('SocketServer', 'User connected', req.user.username);
      socket.on('disconnect', () => {
        display.debug.nextLine('SocketServer', 'User disconnected', req.user?.username ?? '');
      });
    });
  }

  public static disconnectUser(userId: string): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(userId).disconnectSockets(true);
  }

  public static emitToUser<T extends keyof ServerToClientEvents>(
    userId: string,
    event: T,
    ...args: Parameters<ServerToClientEvents[T]>
  ): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.in(userId).emit(event, ...args);
  }

  public static emitToAll<T extends keyof ServerToClientEvents>(event: T, ...args: Parameters<ServerToClientEvents[T]>): void {
    const socketServer = SocketServer.getInstance();

    socketServer.io.emit(event, ...args);
  }
}
