import { HTTP_URL } from "./urls";

export function removeCode(remoteCode: string | null): void {
    if (!remoteCode) {
        console.log("No remote code provided, will not send delete request");
        return;
    }

    console.log(`Sending delete signal for ${remoteCode}`);

    fetch(`${HTTP_URL}/remove?code=${remoteCode}`, {
        method: "DELETE"
    });
}