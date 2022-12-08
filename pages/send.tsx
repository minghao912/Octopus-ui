import { useState, useEffect, ChangeEvent } from "react";
import Peer from 'simple-peer';

import { URL } from "../utils/urls";
import styles from "../styles/temp.module.css";

export default function Send() {
    // Websocket data
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [WSConnected, setWSConnected] = useState<boolean>(false);
    const [WSData, setWSData] = useState<string[]>([]);
    const [remoteCode, setRemoteCode] = useState<string>("");

    // WebRTC data
    const [peer, setPeer] = useState<Peer.Instance | null>(null);
    const [localSD, setLocalSD] = useState<Peer.SignalData[]>([]);
    const [remoteSD, setRemoteSD] = useState<Peer.SignalData[]>([]);
    const [peerConnected, setPeerConnected] = useState<boolean>(false);

    // Message data
    const [localMessage, setLocalMessage] = useState<string>("");
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

    function handleInput(e: ChangeEvent<HTMLInputElement>) {
        setLocalMessage(e.target.value);
    }

    // Initializes Websocket and Peer
    function start() {
        _initPeer()
            .then(p => _initWS(p[0], p[1]))
            .catch(err => console.error(err));
    }

    function _initWS(peerRef: Peer.Instance, peerSD: Peer.SignalData[]) {
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

                // Send Peer 1's signal data
                for (const sd of peerSD)
                    newWS.send(msg + ": " + JSON.stringify(sd));
            }

            // All other messages should be the remote peer's signal data
            else if (msg.startsWith('{')) {
                console.log("Remote SD received. Signalling local Peer.");
                peerRef.signal(JSON.parse(msg));
                setRemoteSD((old) => [...old, JSON.parse(msg)]);
            } 
            
            // Probably an error if we get here
            else {    
                console.log(msg);
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

    function _initPeer(): Promise<[Peer.Instance, Peer.SignalData[]]> {
        return new Promise((resolve, reject) => {
            let peer1 = new Peer({initiator: true});
            setPeer(peer1);

            let sd: Peer.SignalData[] = [];

            peer1.on('signal', data => {
                // Send this to server
                console.log("Starting peer 1, signal data get. Appending to local array.");
                setLocalSD(prevSignalData => [...prevSignalData, data]);
                sd.push(data);

                // Two signal data means OK
                if (sd.length >= 2) {
                    resolve([peer1, sd]);
                }
            })

            peer1.on('connect', () => {
                console.log("Connection detected by peer 1");
                setPeerConnected(true);
            })

            peer1.on('data', (data) => {
                console.log("Got a message: " + data);
                setNewestMessage(data.toString());
            })

            peer1.on('error', (err) => {
                reject(err);
            })
        });
    }

    function sendMessage() {
        peer?.send(localMessage);
    }

    return <div className={styles.main}>
        <button onClick={start}>Start</button>
        <h2>{WSConnected ? <><span style={{color: "green"}}>Connected</span> {remoteCode}</> : <span style={{color: "red"}}>Disconnected</span>}</h2>
        {(WSConnected && !peerConnected) ? <h2>Waiting for remote connection...</h2> : null}
        <input onChange={handleInput} disabled={!peerConnected}></input>
        <button onClick={sendMessage} disabled={!peerConnected}>Send</button>
        <h2>From Remote</h2>
        {newestMessage && <p>{newestMessage}</p>}
    </div>;
}