import { useState, useEffect, ChangeEvent } from "react";

import CenteredCard from "../components/CenteredCard";

import { URL } from "../utils/urls";
import styles from "../styles/temp.module.css";

export default function Send() {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [WSData, setWSData] = useState<string[]>([]);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // Message data
    const [newestMessage, setNewestMessage] = useState<string>("");

    useEffect(() => {
        // Automatically close the websocket on unmount
        return () => {
            if (!ws) return;

            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleCodeInput(e: ChangeEvent<HTMLInputElement>) {
        setRemoteCode(e.target.value);
    }

    // Initializes Websocket
    function connect() {
        const newWS = new WebSocket(URL + "/receive");

        newWS.onopen = (event) => {
            setWSConnected(true);

            newWS.send(remoteCode + ": INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            if (msg.startsWith('FILE')) {
                console.log("File data received");
            } else {
                console.log("Message data received");
                setNewestMessage(msg);
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

    return (
        <CenteredCard>
            <div className={styles.main}>
                <input onChange={handleCodeInput}></input>
                <button onClick={connect}>Connect</button>
                <h2>{WSConnected ? <span style={{color: "green"}}>Connected</span> : <span style={{color: "red"}}>Disconnected</span>}</h2>
                <h2>Incoming Message</h2>
                {newestMessage && <p>{newestMessage}</p>}
            </div>
        </CenteredCard>
    );
}