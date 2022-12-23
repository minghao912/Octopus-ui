import { useState, useEffect, ChangeEvent } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

import { URL } from "../utils/urls";
import { removeCode } from "../utils/delete";
import styles from "../styles/temp.module.css";

import CenteredCard from "../components/CenteredCard";

export default function Send() {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [remoteConnected, setRemoteConnected] = useState<boolean>(false);
    const [WSData, setWSData] = useState<string[]>([]);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // Message data
    const [localMessage, setLocalMessage] = useState<string>("");

    useEffect(() => {
        // Cleanup on unmount
        return function cleanup() {      
            console.log("Running cleanup...");

            // Tell server to delete code from db
            removeCode(remoteCode);
            
            // Close the original websocket
            if (!ws) return;
            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
            console.log("Closed original WS");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteCode]);

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
            // Connection established message
            else if (msg == "Connection received") {
                setRemoteConnected(true);
            }
            // Just the OKs
            else {    
                console.log(msg);
            }

            setWSData((oldData) => [...oldData, msg]);
        }

        newWS.onclose = (event) => {
            setWSConnected(false);
            setRemoteCode("");
        }

        newWS.onerror = (event) => {
            setWSConnected(false);
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

    function _connectionStatus(): JSX.Element {
        if (!WSConnected)
            return <span style={{color: "red"}}>Disconnected</span>;
        else if (WSConnected && !remoteConnected)
            return <><span style={{color: "#FF9F00"}}>Waiting for remote connection</span> on {remoteCode}</>;    // FF9F00 is amber
        else if (WSConnected && remoteConnected)
            return <><span style={{color: "green"}}>Connected</span> on {remoteCode}</>;
        else    // Should never get here
            return <span style={{color: "red", fontWeight: "bold"}}>ERROR</span>;
    }

    return (
        <CenteredCard>
            <div className={styles.main}>
                {
                    !WSConnected &&
                    <Button 
                        onClick={start} 
                        size={"large"}
                    >
                        Start
                    </Button>
                }
                <h2>{_connectionStatus()}</h2>
                <TextField
                    multiline
                    disabled={!remoteConnected}
                    minRows={4}
                    maxRows={13}
                    onChange={handleInput}
                    sx={{
                        width: '100%',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                    }}
                />
                <Button 
                    onClick={sendMessage} 
                    disabled={!remoteConnected}
                    style={{float: 'right'}}
                >
                    Send
                </Button>
            </div>
        </CenteredCard>
    );
}