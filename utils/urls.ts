const PRODUCTION = true;

export const WS_URL = PRODUCTION  
    ? "wss://octopus-server.dragonfruit.tk/server-ws"
    : "ws://localhost:8088";

export const HTTP_URL = PRODUCTION
    ? "https://octopus-server.dragonfruit.tk/server-http"
    : "https://localhost:8088";