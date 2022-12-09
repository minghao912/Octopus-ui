import { useState, useEffect, ChangeEvent } from "react";

import { URL } from "../utils/urls";
import styles from "../styles/temp.module.css";

export default function Send() {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [WSData, setWSData] = useState<string[]>([]);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // Message data
    const [localMessage, setLocalMessage] = useState<string>("");

    useEffect(() => {
        // Automatically close the websocket on unmount
        return () => {
            if (!ws) return;

            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleInput(e: ChangeEvent<HTMLInputElement>) {
        setLocalMessage(e.target.value);
    }

    // Initializes Websocket
    function start() {
        const newWS = new WebSocket(URL + "/send");

        newWS.onopen = (event) => {
            setWSConnected(true);

            newWS.send("INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            // The first message should be a code (entirely numbers)
            if (/^\d+$/.test(msg)) {
                // Store it for use
                setRemoteCode(msg);
            }
            // Just the OKs
            else {    
                console.log(msg);
            }

            setWSData((oldData) => [...oldData, msg]);
        }

        newWS.onclose = (event) => {
            setWSConnected(false);
        }

        newWS.onerror = (event) => {
            console.error(event);
        }

        setWS(newWS);
    }

    function sendMessage() {
        if (!ws) {
            console.error("WS is null!");
            return;
        }

        ws.send(remoteCode + ": " + localMessage);
    }

    return <div className={styles.main}>
        <button onClick={start}>Start</button>
        <h2>{WSConnected ? <><span style={{color: "green"}}>Connected</span> {remoteCode}</> : <span style={{color: "red"}}>Disconnected</span>}</h2>
        <input onChange={handleInput} disabled={!WSConnected}></input>
        <button onClick={sendMessage} disabled={!WSConnected}>Send</button>
        <h2>From Remote</h2>
    </div>;
}