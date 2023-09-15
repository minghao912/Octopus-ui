import React, { useState, useEffect } from "react";
import Dropzone, { DropzoneState } from "react-dropzone";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { base64Encode } from "../utils/b64";
import { WS_URL } from "../utils/urls";
import { removeCode } from "../utils/delete";
import { getHumanReadableSize } from "../utils/nerdstuff";
import Sender from "../components/Sender";
import styles from "../styles/SendFile.module.css";

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

    function _fileChangeHandler(files: File[]) {
        setSelectedFile(files[0]);
        setFileSelected(true);
    }

    // Initializes Websocket
    function _startWS() {
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

        // Split file into chunks
        let fileChunks = _splitChunks<File>(selectedFile, 1024 * 1 /* 1KB */);
        console.log("File split into chunks");

        // Send "handshake" message telling server that we are sending file
        // Also includes filename, filesize, chunk count
        ws.send(`${remoteCode!}: FILE,${selectedFile.name.replaceAll(',', '-')},${selectedFile.size},${fileChunks.length}`);
        console.log("Sent file metadata");

        // Add metadata to chunks then send to remote
        for (const [i, c] of fileChunks.entries()) {
            console.log("Processing new chunk");

            // Get binary data from blob (1024 B)
            const unblobified = await c.arrayBuffer();
            const fileBinaryData = new Uint8Array(unblobified);

            // Create metadata
            let segmentNumber = new Int32Array(1);
            segmentNumber[0] = i;

            let segmentSize = new Int16Array(1);
            segmentSize[0] = fileBinaryData.byteLength;

            // Combine into one ArrayBuffer
            let finalBinaryData = new Uint8Array(segmentNumber.byteLength + segmentSize.byteLength + fileBinaryData.byteLength);
            const dv = new DataView(finalBinaryData.buffer);

            dv.setUint32(0, segmentNumber[0], true);
            dv.setUint16(4, segmentSize[0], true);
            finalBinaryData.set(fileBinaryData, (segmentNumber.byteLength + segmentSize.byteLength));

            // Send to remote
            const finalData = base64Encode(finalBinaryData);
            ws.send(`${remoteCode!}: ${finalData}`);
        }
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
            return <span style={{ color: "red" }}>Disconnected</span>;
        else if (WSConnected && !remoteConnected)
            return <><span style={{ color: "#FF9F00" }}>Waiting for remote connection</span> on {remoteCode}</>;    // FF9F00 is amber
        else if (WSConnected && remoteConnected)
            return <><span style={{ color: "green" }}>Connected</span> on {remoteCode}</>;
        else    // Should never get here
            return <span style={{ color: "red", fontWeight: "bold" }}>ERROR</span>;
    }

    function _dropzoneText(): JSX.Element {
        if (!selectedFile) {
            return (
                <Typography
                    sx={{ fontSize: 24, textTransform: 'none', wordWrap: 'break-word', maxWidth: '100%' }}
                    color="text.primary"
                    align="center"
                >
                    {
                        WSConnected
                            ? "Drag file here or click to select"
                            : "Click the start button above"
                    }
                </Typography>
            );
        } else {
            return (
                <Typography
                    component={"span"}
                    sx={{ fontSize: 24, textTransform: 'none', wordWrap: 'break-word', maxWidth: '100%' }}
                    color="text.primary"
                    align="center"
                >
                    <p style={{ wordWrap: 'break-word' }}>{selectedFile.name}</p>
                    <br />
                    <p style={{ wordWrap: 'break-word' }}>{getHumanReadableSize(selectedFile.size)}</p>
                </Typography>
            );
        }
    }

    return (
        <Sender
            getConnectionStatus={_connectionStatus}
            startConnection={_startWS}
            startUpload={_uploadHandler}
            state={{
                wsConnected: WSConnected,
                remoteConnected,
                fileSelected,
                alreadySent
            }}
        >
            <Dropzone
                onDrop={_fileChangeHandler}
                maxFiles={1}
                disabled={!WSConnected}
            >
                {
                    ({ getRootProps, getInputProps }: DropzoneState) => (
                        <section className={styles.droparea}>
                            <div className={styles.maxWH} {...getRootProps()}>
                                <input {...getInputProps()} type="file" />
                                <Button
                                    className={[styles.maxWH, styles.roundButton].join(' ')}
                                    disabled={!WSConnected}
                                    style={{ minHeight: '200px' }}
                                >
                                    {_dropzoneText()}
                                </Button>
                            </div>
                        </section>
                    )
                }
            </Dropzone>
        </Sender>          
    );
}