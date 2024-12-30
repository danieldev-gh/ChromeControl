import { io } from "socket.io-client";
let url = localStorage.getItem("endpointUrl");
let socket;
if (url) {
  socket = io(url);
} else {
  socket = io();
}
export default socket;
