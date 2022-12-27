import { useState, useEffect, ChangeEvent } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { URL } from "../utils/urls";
import { getHumanReadableSize } from "../utils/nerdstuff";
import { base64Decode } from "../utils/b64";
import styles from "../styles/temp.module.css";

import CenteredCard from "../components/CenteredCard";

interface FileMetadata {
    filename: string,
    filesize: number,
}

export default function Receive(props: any) {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // File data
    const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
    const [fileData, setFileData] = useState<string[]>([] as string[]);
    const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);
    const [fileBlobs, setFileBlobs] = useState<Blob[]>([] as Blob[]);

    useEffect(() => {
        // Automatically close the websocket on unmount
        return () => {
            if (!ws) return;

            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!fileData)
            return;

        let lastMessage = fileData[fileData.length - 1];
        if (!lastMessage)
            return;

        // If we just got the END signal, start decode of file
        if (lastMessage.startsWith("END"))
            _decodeFile(fileData.slice(0, fileData.length - 1));
    }, [fileData]);

    function _handleCodeInput(e: ChangeEvent<HTMLInputElement>) {
        setRemoteCode(e.target.value);
    }

    // Initializes Websocket
    function _connect() {
        // Reset state
        setWS(null);
        setWSConnected(false);
        setFileMetadata(null);
        setFileData([] as string[]);
        setFileBlobs([] as Blob[]);
        setTotalReceivedBytes(0);

        const newWS = new WebSocket(URL + "/receive");

        newWS.onopen = (event) => {
            setWSConnected(true);

            newWS.send(remoteCode + ": INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            if (msg.startsWith('FILE')) {
                console.log("File data received");

                // Reset previous file(s)
                setFileData([] as string[]);
                setFileMetadata(null);
                setTotalReceivedBytes(0);

                // This is file metadata
                _handleNewFileMetadata(msg);
            } else if (msg.startsWith('ERROR')) {
                console.error("Error from WS server\n" + msg);
                setWSConnected(false);
            } else if (msg.startsWith('OK')) {
                console.log(msg);
            } else {
                console.log("Message data received");
                
                // This is the contents of the file
                _handleNewFileContents(msg);
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

    // String is in format FILE,filename,filesize
    function _handleNewFileMetadata(str: string) {
        let parts = str.split(',');
        let filename = parts[1];
        let filesize = parseInt(parts[2]);

        setFileMetadata({
            filename: filename,
            filesize: filesize
        });
    }

    function _handleNewFileContents(str: string) {
        // Find out how many bytes we received
        let numBytes: number;
        if (str.startsWith("END"))
            numBytes = 0;
        else {
            // Check if this is the first message that contains the data:application/octet;base64,...
            let commaIndex = str.indexOf(',');
            if (commaIndex > -1)
                numBytes = str.length - 1 - commaIndex;
            else {
                // Find how many equal signs we have
                let i = str.length - 1;
                for (; i >= 0; i--) {
                    if (str.charAt(i) != '=')
                        break;
                }
                numBytes = i + 1;
            }
        }
        numBytes = Math.floor(3 * numBytes / 4);    // Base64 encodes 3 bytes to 4 characters

        setTotalReceivedBytes((oldBytes) => oldBytes + numBytes); 
        setFileData((oldData) => [...oldData, str]);
    }

    function _decodeFile(fd: string[]) {
        console.log("Decoding file...");
        base64Decode(fd.join(''))
            .then((bb) => {
                setFileBlobs((oldBlobs) => [...oldBlobs, bb])
            });
    }

    function _startDownload() {
        if (!fileBlobs) {
            console.error("File blobs not available!");
            return;
        }

        if (!fileMetadata) {
            console.error("File metadata not available");
            return;
        }

        let tempURL = window.URL.createObjectURL(fileBlobs[0]);
        let tempLink = document.createElement("a");
        tempLink.href = tempURL;
        tempLink.setAttribute("download", fileMetadata!.filename);
        tempLink.click();
    }

    function __debug() {
        console.log(fileData);
        console.log(fileData[fileData.length - 1]);
        console.log(totalReceivedBytes);
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
                    fileMetadata &&
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            padding: "1.5em",
                            maxHeight: "65%"
                        }}
                    >
                    
                        <Typography>
                            <b>{fileMetadata.filename}</b>
                        </Typography>
                        <br />
                        <Typography>
                            {getHumanReadableSize(totalReceivedBytes)} of {getHumanReadableSize(fileMetadata.filesize)} received
                        </Typography>
                    </div>
                }
                {
                    fileBlobs.length > 0 &&
                    <Button onClick={_startDownload}>
                        Download
                    </Button>
                }
            </div>
        </CenteredCard>
    );
}