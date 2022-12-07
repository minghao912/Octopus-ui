import { useState, useEffect, ChangeEvent } from "react";

import { URL } from "../utils/urls";

export default function Receive() {
    const [ws, setWS] = useState<WebSocket | null>(null);
    const [userCode, setUserCode] = useState<string>("");
    const [connected, setConnected] = useState<boolean>(false);
    const [data, setData] = useState<string[]>([]);

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
            setData((oldData) => [...oldData, event.data]);
        }

        newWS.onclose = (event) => {
            setConnected(false);
        }

        newWS.onerror = (event) => {
            console.error(event);
        }

        setWS(newWS);
    }

    function sendData() {
        const signalData1 = `{"type":"answer","sdp":"v=0\r\no=- 265104266604323396 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:EDT9\r\na=ice-pwd:V2jmBsDWD66Fjy53aBw7ah6A\r\na=ice-options:trickle\r\na=fingerprint:sha-256 64:5E:E9:4C:29:7D:6A:7F:34:83:47:A0:CE:C5:A0:46:66:6B:EA:BF:64:13:BB:A2:43:F7:90:2A:F8:46:D3:D3\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n"}`;
        const signalData2 = `{"type":"candidate","candidate":{"candidate":"candidate:1967928008 1 udp 2113937151 53c2e6c4-5d6a-4c55-8dd2-bcafa0e1c11e.local 60165 typ host generation 0 ufrag EDT9 network-cost 999","sdpMLineIndex":0,"sdpMid":"0"}}`;

        ws?.send(userCode + ": " + signalData1);
        ws?.send(userCode + ": " + signalData2);
    }

    return <>
        <input onChange={handleInput}></input>
        <button onClick={initializeWS}>OK</button>
        <button onClick={sendData}>Send</button>
        <h2>Connecting as: {userCode}</h2>
        <p>Socket 2 (SEND) is {connected ? <span style={{color: "green"}}>connected</span> : <span style={{color: "red"}}>disconnected</span>}</p>
        <h2>Messages</h2>
        {data && data.map(e => <p>{e}</p>)}
    </>;
}