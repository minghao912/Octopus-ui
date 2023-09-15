import { useState, useEffect, ChangeEvent } from "react";

import TextField from "@mui/material/TextField";

import { WS_URL } from "../utils/urls";
import useWindowDimensions, { MAX_MOBILE_WIDTH } from "../utils/useWindowDimensions";
import Receiver from "../components/Receiver";

export default function Receive() {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [WSData, setWSData] = useState<string[]>([]);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // Message data
    const [newestMessage, setNewestMessage] = useState<string>("");

    // For styling
    const [_, width] = useWindowDimensions();
    const isMobile = (width! < MAX_MOBILE_WIDTH);

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

    function _handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Enter")
            _connect();
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
        <Receiver
            startConnection={_connect}
            input={{
                handleCodeInput: _handleCodeInput,
                handleKeyDown: _handleKeyDown
            }}
            state={{ wsConnected: WSConnected }}
        >
            {
                WSConnected &&
                <h2>Incoming Message</h2>
            }
            {
                newestMessage && 
                <TextField
                    multiline
                    variant={"outlined"}
                    minRows={isMobile ? 8 : 4}
                    maxRows={13}
                    sx={{
                        width: '100%',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap'
                    }}
                    InputProps={{ readOnly: true }}
                    value={newestMessage}
                />
            }
        </Receiver>
    );
}