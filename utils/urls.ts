const PRODUCTION = true;

export const URL = PRODUCTION  
    ? "wss://octopus-server.dragonfruit.tk/server-ws"
    : "ws://localhost:8088";