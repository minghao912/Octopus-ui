import React, { useState, useEffect } from "react";
import Dropzone from "react-dropzone";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import { base64Encode } from "../utils/b64";
import { WS_URL } from "../utils/urls";
import { removeCode } from "../utils/delete";
import { getHumanReadableSize } from "../utils/nerdstuff";
import styles from "../styles/temp.module.css";

import CenteredCard from "../components/CenteredCard";

export default function Send(props: any) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileSelected, setFileSelected] = useState<boolean>(false);
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [remoteConnected, setRemoteConnected] = useState<boolean>(false);
    const [remoteCode, setRemoteCode] = useState<string>("");
    const [alreadySent, setAlreadySent] = useState<boolean>(false);

    useEffect(() => {
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            cleanup();
        });

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

    function _fileChangeHandler(files: File[]) {
        setSelectedFile(files[0]);
        setFileSelected(true);
    }

    // Initializes Websocket
    function start() {
        // Reset state
        setSelectedFile(null);
        setFileSelected(false);
        setWS(null);
        setWSConnected(false);
        setRemoteConnected(false);
        setRemoteCode("");
        setAlreadySent(false);

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
        }

        newWS.onclose = (event) => {
            setWSConnected(false);
        }

        newWS.onerror = (event) => {
            console.error(event);
            setWSConnected(false);
        }

        setWS(newWS);
    }

    async function _uploadHandler() {
        if (!ws)
            return;
        if (!selectedFile)
            return;

        // Set already sent
        setAlreadySent(true);

        // Send "handshake" message telling server that we are sending file
        // Also includes filename, filesize
        ws.send(`${remoteCode!}: FILE,${selectedFile.name.replace(',', '-')},${selectedFile.size}`);
        console.log("Sent file metadata");

        // Split file into chunks
        let fileChunks = _splitChunks<File>(selectedFile, 1020 * 1 /* 1KB */);
        console.log("File split into chunks");

        // Turn chunks into base64 then send to remote
        let firstChunk = true;
        for (const c of fileChunks) {
            console.log("Processing new chunk");

            let b64c = await base64Encode(c);

            let b64Str: string;
            if (b64c instanceof ArrayBuffer) {
                b64Str = [...new Uint8Array(b64c)]
                            .map(x => x.toString(16).padStart(2, '0'))
                            .join('');
            } else 
                b64Str = b64c;

            // Remove the metadata
            if (!firstChunk) {
                let temp = b64Str.split(";base64,");
                b64Str = (temp.length > 1) ? temp[1] : temp[0];
            } else 
                firstChunk = !firstChunk;

            // Send to remote
            ws.send(`${remoteCode!}: ${b64Str}`);
        }

        // Let remote know we're finished
        setTimeout(() => {
            ws.send(`${remoteCode}: END`);
        }, 1000);
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

    function _dropzoneText(): JSX.Element {
        if (!selectedFile) {
            return (
                <Typography
                    sx={{ fontSize: 24, textTransform: 'none', wordWrap: 'break-word', maxWidth: '100%' }}
                    color="text.primary"
                    align="center"
                >
                    Drag file here or click to select
                </Typography>
            );
        } else {
            return (
                <Typography
                    sx={{ fontSize: 24, textTransform: 'none', wordWrap: 'break-word', maxWidth: '100%' }}
                    color="text.primary"
                    align="center"
                >
                    <p style={{wordWrap: 'break-word'}}>{selectedFile.name}</p>
                    <br />
                    <p style={{wordWrap: 'break-word'}}>{getHumanReadableSize(selectedFile.size)}</p>
                </Typography>
            );
        }
    }

    return (
        <CenteredCard>
            <div className={[styles.main, styles.maxWH].join(' ')}>
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
                <Dropzone
                    onDrop={_fileChangeHandler}
                    maxFiles={1}
                    disabled={!WSConnected}
                >
                    {
                        ({getRootProps, getInputProps}) => (
                            <section className={styles.droparea}>
                                <div className={styles.maxWH} {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Button
                                        className={[styles.maxWH, styles.roundButton].join(' ')}
                                        disabled={!WSConnected}
                                    >
                                        {_dropzoneText()}
                                    </Button>
                                </div>
                            </section>
                        )
                    }
                </Dropzone>
                {
                    WSConnected && 
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            padding: "1.5em"
                        }}
                    >
                        <Button 
                            onClick={_uploadHandler} 
                            size={"large"}
                            disabled={!remoteConnected || !fileSelected || alreadySent}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                            <div style={{ padding: '3px' }} />
                            Send
                        </Button>
                    </div>
                }
            </div>
        </CenteredCard>
    );
}