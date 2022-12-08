import { useState, useEffect } from "react";
import Peer from 'simple-peer';

import { URL } from "../utils/urls";

export default function Send() {
    const [connected, setConnected] = useState<boolean>(false);
    const [data, setData] = useState<string[]>([]);
    const [ws, setWS] = useState<WebSocket | null>(null);

    const [peer, setPeer] = useState<Peer.Instance | null>(null);
    const [signalData, setSignalData] = useState<Peer.SignalData[]>([]);
    const [remoteSignalData, setRemoteSignalData] = useState<Peer.SignalData[]>([]);

    useEffect(() => {
        // Automatically close the websocket on unmount
        return () => {
            if (!ws) return;

            ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
            ws.close();
        }
    }, []);

    function initializeSend() {
        const newWS = new WebSocket(URL + "/send");

        newWS.onopen = (event) => {
            setConnected(true);

            newWS.send("INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            setData((oldData) => [...oldData, msg]);

            if (msg.startsWith('{')) {
                console.log("HI: " + msg);
                setRemoteSignalData((old) => [...old, JSON.parse(msg)]);
            }
        }

        newWS.onclose = (event) => {
            setConnected(false);
        }

        newWS.onerror = (event) => {
            console.error(event);
        }

        setWS(newWS);
    }

    function createPeer() {
        let peer1 = new Peer({initiator: true});
        setPeer(peer1);

        peer1.on('signal', data => {
            // Send this to server
            console.log("Starting peer 1, signal data get");
            console.log(data);
            setSignalData(prevSignalData => [...prevSignalData, data]);
        })

        peer1.on('connect', () => {
            console.log("Connection detected by peer 1");
            peer1.send('hey, how\'s it going?');
        })
    }

    function sendWebRTCData() {
        for (const sd of signalData) {
            console.log("Sending data...");
            console.log(JSON.stringify(sd));
            ws?.send(data[0] + ": " + JSON.stringify(sd));
        }
    }

    function readPeerSignal() {
        for (const sd of remoteSignalData) {
            console.log("Signalling Peer with remote data...");
            peer?.signal(sd);
        }
    }

    return <>
        <button onClick={initializeSend}>Init WS</button>
        <button onClick={createPeer}>Create Peer</button>
        <button onClick={sendWebRTCData}>Send Data</button>
        <button onClick={readPeerSignal}>Read Incoming Signal Data</button>
        <p>Socket 1 (SEND) is {connected ? <span style={{color: "green"}}>connected</span> : <span style={{color: "red"}}>disconnected</span>}</p>
        <h2>Messages</h2>
        {data && data.map((e, ind) => <p key={ind}>{e}</p>)}
    </>;
}