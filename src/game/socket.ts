import { io } from "socket.io-client";

const serverPort = 2142;
const URL = `http://localhost:${serverPort}`;

const socket = io(URL, {
  autoConnect: true,
});

//If autoConnect = false, use socket.connect() to connect the client to the server.
// socket.connect();

export default socket;
