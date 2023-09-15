import { useState, useEffect, ChangeEvent } from "react";

import TextField from "@mui/material/TextField";

import { WS_URL } from "../utils/urls";
import { removeCode } from "../utils/delete";

import useWindowDimensions, { MAX_MOBILE_WIDTH } from "../utils/useWindowDimensions";
import Sender from "../components/Sender";

export default function Send() {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [remoteConnected, setRemoteConnected] = useState<boolean>(false);
    const [WSData, setWSData] = useState<string[]>([]);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // Message data
    const [localMessage, setLocalMessage] = useState<string>("");

    // For styling
    const [_, width] = useWindowDimensions();
    const isMobile = (width! < MAX_MOBILE_WIDTH);

    useEffect(() => {
        if (width != null) {
            // setIsMobile(width < MAX_MOBILE_WIDTH);
        }
    }, [width])

    useEffect(() => {
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            cleanup();
        });

        window.addEventListener('unload', (e) => {
            cleanup();
        })

        // Cleanup on unmount
        function cleanup() {      
            console.log("Running cleanup...");

            // Tell server to delete code from db
            removeCode(remoteCode);
            
            // Close the original websocket
            if (!ws) return;
            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
            console.log("Closed original WS");
        }

        return cleanup;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remoteCode]);

    function _handleInput(e: ChangeEvent<HTMLInputElement>) {
        setLocalMessage(e.target.value);
    }

    // Initializes Websocket
    function _startWS() {
        // Reset state
        setWS(null);
        setWSConnected(false);
        setRemoteConnected(false);
        setRemoteCode("");

        const newWS = new WebSocket(WS_URL + "/send");

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

    function _sendMessage() {
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
        <Sender
            getConnectionStatus={_connectionStatus}
            startConnection={_startWS}
            startUpload={_sendMessage}
            state={{
                wsConnected: WSConnected,
                remoteConnected,
                fileSelected: (localMessage !== ""),
                alreadySent: false, // Allow multiple messages to be sent
            }}
        >
            <TextField
                multiline
                disabled={!remoteConnected}
                minRows={isMobile ? 8 : 4}
                maxRows={13}
                onChange={_handleInput}
                sx={{
                    width: '100%',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                }}
            />
        </Sender>
    );
}