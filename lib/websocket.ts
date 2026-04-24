import { WebSocketServer, WebSocket } from "ws";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080; // Parse the port to an integer

const wss = new WebSocketServer({ port: port });

wss.on("connection", (ws: WebSocket) => {
     ws.on("message", () => {});
});

export const broadcast = (message: any) => {
     wss.clients.forEach((client: WebSocket) => {
          if (client.readyState === WebSocket.OPEN) {
               client.send(JSON.stringify(message));
          }
     });
};
