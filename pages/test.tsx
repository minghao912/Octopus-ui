import Peer from 'simple-peer';

import { useState } from 'react';

export default function Test() {
    const [peer1, setPeer1] = useState<Peer.Instance>();
    const [peer2, setPeer2] = useState<Peer.Instance>();

    const [signalData1, setSignalData1] = useState<Peer.SignalData[]>([]);
    const [signalData2, setSignalData2] = useState<Peer.SignalData[]>([]);

    // Creates Peer 1
    function newPeer() {
        let peer1 = new Peer({initiator: true});
        setPeer1(peer1);

        peer1.on('signal', data => {
            // Send this to server
            console.log("Starting peer 1, signal data get");
            console.log(data);
            setSignalData1(prevSignalData => [...prevSignalData, data]);
        })

        peer1.on('connect', () => {
            console.log("Connection detected by peer 1");
            peer1.send('hey, how\'s it going?');
        })
    } 

    // Creates Peer 2
    function newPeer2() {
        let peer2 = new Peer();
        setPeer2(peer2);

        console.log("Creating peer 2...");

        peer2.on('signal', data => {
            // Send this to server
            console.log("Peer 2, signal data get");
            setSignalData2(prevSignalData => [...prevSignalData, data]);
        })

        peer2.on('data', data => {
            console.log("Got a message: " + data);
        })
    }

    // "Receive" peer 1's signal data from server, and then send it to peer 2
    function signal1() {
        console.log(signalData1);
        for (const sd of signalData1) {
            console.log("Signalling peer 2 with signal data: ");
            console.log(sd);
            peer2!.signal(sd);
        }
    }

    // "Receive" peer 2's signal data from server, and then send it to peer 1
    function signal2() {
        console.log(signalData2);
        for (const sd of signalData2) {
            console.log("Signalling peer 1 with signal data: ");
            console.log(sd);
            peer1!.signal(sd);
        }
    }

    function stringify(signalDataArr: Peer.SignalData[]): string[] {
        if (!signalDataArr)
            return [];

        let tempArr = [] as string[];

        signalDataArr.forEach(sd => {
            tempArr.push(JSON.stringify(sd));
        });

        return tempArr;
    }

    return (<>
        <div>
            <button onClick={newPeer}>Hello</button>
            <button onClick={newPeer2}>Hello 2</button>
            <button onClick={signal1}>Hello 3</button>
            <button onClick={signal2}>Hello 4</button>
        </div>
        <div>
            <h2>Signal Data 1</h2>
            {stringify(signalData1).map((sdStr, ind) => <p key={ind}>{sdStr}</p>)}
        </div>
        <div>
            <h2>Signal Data 2</h2>
            {stringify(signalData2).map((sdStr, ind) => <p key={ind}>{sdStr}</p>)}
        </div>
    </>)
}