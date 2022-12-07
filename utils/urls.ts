const PRODUCTION = false;

export const URL = PRODUCTION  
    ? "wss://octopus.dragonfruit.tk/server-ws"
    : "ws://localhost:8088";