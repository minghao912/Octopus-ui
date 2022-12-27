import { useState, useEffect, ChangeEvent } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { WS_URL } from "../utils/urls";
import styles from "../styles/temp.module.css";

import CenteredCard from "../components/CenteredCard";

export default function Receive() {
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

    function _handleCodeInput(e: ChangeEvent<HTMLInputElement>) {
        setRemoteCode(e.target.value);
    }

    // Initializes Websocket
    function _connect() {
        const newWS = new WebSocket(WS_URL + "/receive");

        newWS.onopen = (event) => {
            setWSConnected(true);

            newWS.send(remoteCode + ": INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            if (msg.startsWith('FILE')) {
                console.log("File data received");
            } else if (msg.startsWith('ERROR')) {
                console.error("Error from WS server\n" + msg);
                setWSConnected(false);
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
            <div className={[styles.main, styles.maxWH].join(' ')}>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "left",
                    }}
                >
                    <TextField 
                        label="Your 6-digit code"
                        onChange={_handleCodeInput}
                    />
                    <div style={{marginRight: "10px"}} />
                    <Button 
                        size={"large"}
                        onClick={_connect}
                    >
                        Connect
                    </Button>
                </div>
                <h2>
                    {
                        WSConnected
                            ? <span style={{color: "green"}}>Connected</span> 
                            : <span style={{color: "red"}}>Disconnected</span>
                    }
                </h2>
                {
                    WSConnected &&
                    <h2>Incoming Message</h2>
                }
                {
                    newestMessage && 
                    <Typography style={{
                        wordWrap: "break-word",
                        height: "65%",
                        overflowY: "auto",
                        whiteSpace: "pre-line"
                    }}>
                        {newestMessage}
                    </Typography>
                }
            </div>
        </CenteredCard>
    );
}