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
        let peer2 = new Peer({
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }, 
                    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' },
                    { urls: 'stun:stun.qq.com:3478' },
                    { urls: 'stun:stun2.l.google.com:19302' }
                ]
            }
        });
        setPeer(peer2);

        console.log("Creating peer 2...");

        // Automatically close the websocket on unmount
        return () => {
            if (!ws) return;

            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleCodeInput(e: ChangeEvent<HTMLInputElement>) {
        setRemoteCode(e.target.value);
    }

    function handleInput(e: ChangeEvent<HTMLInputElement>) {
        setLocalMessage(e.target.value);
    }

    // Initializes Websocket and Peer
    function connect() {
        _initWS()
            .then(wsRef => _configPeer(wsRef));
    }

    function _initWS(): Promise<WebSocket> {
        const newWS = new WebSocket(URL + "/receive");

        newWS.onopen = (event) => {
            setWSConnected(true);

            newWS.send(remoteCode + ": INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            if (msg.startsWith('{')) {
                peer?.signal(JSON.parse(msg));
                setRemoteSD((old) => [...old, JSON.parse(msg)]);
            } else {
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

        return new Promise((resolve, reject) => {
            resolve(newWS);
        });
    }

    function _configPeer(wsRef: WebSocket) {
        if (!peer) {
            console.error("Peer is null!");
            return;
        }

        peer.on('signal', data => {
            // Send this to server
            console.log("Peer 2, signal data get");
            wsRef.send(remoteCode + ": " + JSON.stringify(data));

            setLocalSD(prevSignalData => [...prevSignalData, data]);
        })

        peer.on('data', data => {
            console.log("Got a message: " + data);
            setNewestMessage(data.toString());
        })

        peer.on('connect', () => {
            console.log("Peer 2, connection detected");
            setPeerConnected(true);
        })
    }

    function sendMessage() {
        peer?.send(localMessage);
    }

    return <div className={styles.main}>
        <input onChange={handleCodeInput}></input>
        <button onClick={connect}>Connect</button>
        <h2>{WSConnected ? <span style={{color: "green"}}>Connected</span> : <span style={{color: "red"}}>Disconnected</span>}</h2>
        {(WSConnected && !peerConnected) ? <h2>Waiting for remote connection...</h2> : null}
        <input onChange={handleInput} disabled={!peerConnected}></input>
        <button onClick={sendMessage} disabled={!peerConnected}>Send</button>
        <h2>From Remote</h2>
        {newestMessage && <p>{newestMessage}</p>}
    </div>;
}