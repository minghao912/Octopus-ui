const PRODUCTION = true;

export const WS_URL = PRODUCTION  
    ? "wss://octopus-server.chenminghao.co/server-ws"
    : "ws://localhost:8088";

export const HTTP_URL = PRODUCTION
    ? "https://octopus-server.chenminghao.co/server-http"
    : "https://localhost:8088";