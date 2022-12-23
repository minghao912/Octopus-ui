import React, { useState, useEffect } from "react";

import Button from "@mui/material/Button";

import { base64Encode } from "../utils/encoder";
import { URL } from "../utils/urls";
import { removeCode } from "../utils/delete";
import styles from "../styles/temp.module.css";

import CenteredCard from "../components/CenteredCard";

export default function Send(props: any) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileSelected, setFileSelected] = useState<boolean>(false);
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [remoteConnected, setRemoteConnected] = useState<boolean>(false);
    const [remoteCode, setRemoteCode] = useState<string>("");

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

    function _fileChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
        let file = (e.target as HTMLInputElement & EventTarget).files![0];
        setSelectedFile(file);
        setFileSelected(true);
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
        }

        newWS.onclose = (event) => {
            setWSConnected(false);
        }

        newWS.onerror = (event) => {
            console.error(event);
        }

        setWS(newWS);
    }

    function _uploadHandler() {
        if (!ws)
            return;
        if (!selectedFile)
            return;

        // Send "handshake" message telling server that we are sending file
        // Also includes filename, filesize
        ws.send(`${remoteCode!}: FILE,${selectedFile.name.replace(',', '-')},${selectedFile.size}`);
        console.log("Sent file metadata");

        // Split file into chunks
        let fileChunks = _splitChunks<File>(selectedFile, 1024 * 1 /* 1KB */);
        console.log("File split into chunks");

        // Turn chunks into base64 then send to remote
        fileChunks.forEach(c => {
            console.log("Processing new chunk");

            base64Encode(c).then(b64c => {
                let b64Str: string;
                if (b64c instanceof ArrayBuffer) {
                    b64Str = [...new Uint8Array(b64c)]
                                .map(x => x.toString(16).padStart(2, '0'))
                                .join('');
                } else 
                    b64Str = b64c;

                // Remove the metadata
                let temp = b64Str.split(";base64,");
                b64Str = (temp.length > 1) ? temp[1] : temp[0];

                // Send to remote
                ws.send(`${remoteCode!}: ${b64Str}`);
            });
        });
    }

    function _splitChunks<Q extends Blob>(blob: Q, chunkSize: number): Blob[] {
        let startPointer = 0, endPointer = blob.size;
        let chunks = [] as Blob[];

        while (startPointer < endPointer) {
            let newStartPointer = startPointer + chunkSize;
            chunks.push(blob.slice(startPointer, newStartPointer));
            startPointer = newStartPointer;
        }

        return chunks;
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
                <button onClick={start}>Start</button>
                <h2>{_connectionStatus()}</h2>
                <input 
                    type="file" 
                    onChange={_fileChangeHandler}
                    id="file-upload" 
                />
                <label htmlFor="file-upload">
                    <Button onClick={_uploadHandler} disabled={!remoteConnected || !fileSelected}>
                        Upload
                    </Button>
                </label>
                {
                    selectedFile &&
                    <div>
                        <p>Filename: {selectedFile.name}</p>
                        <p>Filetype: {selectedFile.type}</p>
                        <p>Size in bytes: {selectedFile.size}</p>
                    </div>
                }
                <br />
            </div>
        </CenteredCard>
    );
}