import { io } from "socket.io-client";

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Set();
    this.initialize();
  }

  initialize() {
    const url = localStorage.getItem("endpointUrl");
    this.connect(url || undefined);
  }

  connect(url) {
    // Disconnect existing socket if it exists
    if (this.socket) {
      this.socket.disconnect();
    }

    // Create new socket connection
    this.socket = url ? io(url) : io();

    // Notify all listeners of the new socket
    this.listeners.forEach((listener) => listener(this.socket));
  }

  // Get the current socket instance
  getSocket() {
    return this.socket;
  }

  // Add a listener to be notified when the socket changes
  addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener); // Return cleanup function
  }
}

// Create a singleton instance
const socketManager = new SocketManager();
export default socketManager;
