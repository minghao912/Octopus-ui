import { useState, useEffect } from "react";

import { URL } from "../utils/urls";

export default function Send() {
    const [connected, setConnected] = useState<boolean>(false);
    const [code, setCode] = useState<string[]>([]);
    const [ws, setWS] = useState<WebSocket | null>(null);

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
            setCode((oldCode) => [...oldCode, event.data]);
        }

        newWS.onclose = (event) => {
            setConnected(false);
        }

        newWS.onerror = (event) => {
            console.error(event);
        }

        setWS(newWS);
    }

    function sendWebRTCData() {
        const signalData1 = `{"type":"offer","sdp":"v=0\r\no=- 948512473557000494 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\na=extmap-allow-mixed\r\na=msid-semantic: WMS\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:9hQt\r\na=ice-pwd:SYBR7HzGmk4aObh4flmu198v\r\na=ice-options:trickle\r\na=fingerprint:sha-256 E0:81:DD:18:5F:03:5F:4B:C5:91:7C:D8:F7:DF:5B:79:10:A3:D2:B6:04:75:90:E8:B8:00:C8:49:7F:A3:EC:EC\r\na=setup:actpass\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n"}`;
        const signalData2 = `{"type":"candidate","candidate":{"candidate":"candidate:1721207964 1 udp 2113937151 53c2e6c4-5d6a-4c55-8dd2-bcafa0e1c11e.local 51458 typ host generation 0 ufrag 9hQt network-cost 999","sdpMLineIndex":0,"sdpMid":"0"}}`;

        ws?.send(code[0] + ": " + signalData1);
        ws?.send(code[0] + ": " + signalData2);
    }

    return <>
        <button onClick={initializeSend}>Start</button>
        <button onClick={sendWebRTCData}>Send Data</button>
        <p>Socket 1 (SEND) is {connected ? <span style={{color: "green"}}>connected</span> : <span style={{color: "red"}}>disconnected</span>}</p>
        <h2>Messages</h2>
        {code && code.map(e => <p>{e}</p>)}
    </>;
}