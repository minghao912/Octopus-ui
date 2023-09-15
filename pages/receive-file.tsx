import { useState, useEffect, ChangeEvent, CSSProperties } from "react";

import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch, faDownload } from '@fortawesome/free-solid-svg-icons';

import { WS_URL } from "../utils/urls";
import { getHumanReadableSize } from "../utils/nerdstuff";
import { base64Decode } from "../utils/b64";
import Receiver from "../components/Receiver";

interface FileMetadata {
    filename: string,
    filesize: number,
    chunks: number,
}

export default function Receive(props: any) {
    const [errorOccurred, setErrorOccurred] = useState<string | undefined>(undefined);

    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // File data
    const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
    const [fileData, setFileData] = useState<Uint8Array[]>([] as Uint8Array[]);
    const [totalReceivedSegments, setTotalReceivedSegments] = useState<number>(0);
    const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);
    const [fileBlob, setFileBlob] = useState<Blob | undefined>();

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
        if (fileMetadata && totalReceivedSegments >= fileMetadata.chunks)
            _decodeFile(fileData);
    }, [totalReceivedSegments]);

    function _handleCodeInput(e: ChangeEvent<HTMLInputElement>) {
        setRemoteCode(e.target.value);
    }

    function _handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === "Enter")
            _connect();
    }

    // Initializes Websocket
    function _connect() {
        // Reset state
        setWS(null);
        setWSConnected(false);
        setFileMetadata(null);
        setFileData([] as Uint8Array[]);
        setFileBlob(undefined);
        setTotalReceivedBytes(0);

        const newWS = new WebSocket(WS_URL + "/receive");

        newWS.onopen = (event) => {
            setWSConnected(true);

            newWS.send(remoteCode + ": INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            if (msg.startsWith('FILE')) {
                console.log("File data received");

                // Reset previous file(s)
                setFileData([] as Uint8Array[]);
                setFileMetadata(null);
                setTotalReceivedBytes(0);

                // This is file metadata
                _handleNewFileMetadata(msg);
            } else if (msg.startsWith('ERROR')) {
                console.error("Error from WS server\n" + msg);
                setErrorOccurred(`${msg.split(": ")[1]}`);
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
        let chunks = parseInt(parts[3]);

        setFileMetadata({ filename, filesize, chunks });
        setFileData([...Array(Math.ceil(filesize / 1024))]);
    }

    function _handleNewFileContents(b64: string) {
        const contents = base64Decode(b64);

        const segmentNumber = new Int32Array(contents.buffer.slice(0, 4))[0];
        const segmentSize = new Int16Array(contents.buffer.slice(4, 4 + 2))[0];
        const data = contents.slice(4 + 2);

        console.log(segmentNumber, segmentSize, data);

        setTotalReceivedBytes((oldBytes) => oldBytes + segmentSize); 
        setTotalReceivedSegments((oldSegments) => oldSegments + 1);

        setFileData((oldData) => {
            let newData = [...oldData];
            newData[segmentNumber] = data;

            return newData;
        });
    }

    function _decodeFile(fd: Uint8Array[]) {
        console.log("Decoding file...");
        setFileBlob(new Blob(fd));
    }

    function _startDownload() {
        if (!fileBlob) {
            console.error("File blobs not available, trying again");
            try {
                _decodeFile(fileData);
            } catch (err) {
                console.error("File blobs still not available!");
                setErrorOccurred("File blobs not available");
                return;
            }
        }

        if (!fileMetadata) {
            console.error("File metadata not available");
            setErrorOccurred("File metadata not available");
            return;
        }

        let tempURL = window.URL.createObjectURL(fileBlob!);
        let tempLink = document.createElement("a");
        tempLink.href = tempURL;
        tempLink.setAttribute("download", fileMetadata!.filename);
        tempLink.click();
    }

    function _getProgressBarText(): string {
        return `${getHumanReadableSize(totalReceivedBytes)} of ${getHumanReadableSize(fileMetadata!.filesize)} received`
    }

    function _getIcon(): JSX.Element {
        const iconCSS = {
            marginTop: "10px",
            marginBottom: "10px",
            color: "black"
        } as CSSProperties

        // Allow download if we have received all of the file (w/ 1% error just in case)
        if (Math.abs(totalReceivedBytes - fileMetadata!.filesize) < (0.01 * fileMetadata!.filesize))
            return (
                <Button onClick={_startDownload}>
                    <FontAwesomeIcon
                        icon={faDownload}
                        size={"6x"}
                        style={iconCSS}
                    />
                </Button>
            );
        else
            return (
                <FontAwesomeIcon 
                    icon={faCircleNotch} 
                    className={"fa-spin"} 
                    size={"6x"}
                    style={iconCSS}
                />
            );
    }

    function __debug() {
        console.log(fileData);
        console.log(fileData[fileData.length - 1]);
        console.log(totalReceivedBytes);
    }

    return (
        <Receiver
            startConnection={_connect}
            error={{
                errorOccurred,
                setErrorOccurred
            }}
            input={{
                handleCodeInput: _handleCodeInput,
                handleKeyDown: _handleKeyDown
            }}
            state={{ wsConnected: WSConnected }}
        >
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
                    {_getIcon()}
                    <Typography align="center" style={{wordWrap: 'break-word'}}>
                        <b>{fileMetadata.filename}</b>
                    </Typography>
                    <Grid spacing={1} container style={{ marginTop: "10px", marginBottom: "10px" }}>
                        <Grid xs item>
                            <LinearProgress 
                                variant="determinate"
                                value={(totalReceivedBytes / fileMetadata.filesize) * 100}
                                style={{
                                    borderRadius: "5px",
                                    height: "10px",
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Typography align="center">
                        {_getProgressBarText()}
                    </Typography>
                </div>
            }
        </Receiver>
    );
}