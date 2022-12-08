import { useState, useEffect, ChangeEvent } from "react";
import Peer from 'simple-peer';

import { URL } from "../utils/urls";

export default function Receive() {
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [userCode, setUserCode] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    const [data, setData] = useState<string[]>([]);

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

    function handleInput(e: ChangeEvent<HTMLInputElement>) {
        setUserCode(e.target.value);
    }

    function initializeWS() {
        const newWS = new WebSocket(URL + "/receive");

        newWS.onopen = (event) => {
            setConnected(true);

            newWS.send(userCode + ": INIT");
        }

        newWS.onmessage = (event) => {
            let msg = event.data as string;

            setData((oldData) => [...oldData, msg]);

            if (msg.startsWith('{')) {
                console.log(msg);
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

    function readRemoteData() {
        let peer2 = new Peer();
        setPeer(peer2);

        console.log("Creating peer 2...");

        peer2.on('signal', data => {
            // Send this to server
            console.log("Peer 2, signal data get");
            setSignalData(prevSignalData => [...prevSignalData, data]);
        })

        peer2.on('data', data => {
            console.log("Got a message: " + data);
        })

        for (const sd of remoteSignalData)
            peer2.signal(sd);
    }

    function sendData() {
        for (const sd of signalData)
            ws?.send(userCode + ": " + JSON.stringify(sd));
    }

    return <>
        <input onChange={handleInput}></input>
        <button onClick={initializeWS}>OK</button>
        <button onClick={readRemoteData}>Read Remote Data</button>
        <button onClick={sendData}>Send Signal Data</button>
        <h2>Connecting as: {userCode}</h2>
        <p>Socket 2 (SEND) is {connected ? <span style={{color: "green"}}>connected</span> : <span style={{color: "red"}}>disconnected</span>}</p>
        <h2>Messages</h2>
        {data && data.map((e, ind) => <p key={ind}>{e}</p>)}
    </>;
}