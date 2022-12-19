import { URL } from "./urls";

export function removeCode(remoteCode: string | null): void {
    if (!remoteCode) {
        console.log("No remote code provided, will not send delete request");
        return;
    }

    console.log(`Sending delete signal for ${remoteCode}`);
    const wsDelete = new WebSocket(URL + "/remove");
    wsDelete.onopen = (event) => {
        wsDelete.send(remoteCode);
    }
    wsDelete.onmessage = (event) => {
        console.log(event.data as string);
    }
    wsDelete.onerror = (error) => {
        console.log(error);
    }
}