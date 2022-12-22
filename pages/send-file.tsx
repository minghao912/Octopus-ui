import React, { useState } from "react";

import Button from "@mui/material/Button";

import { base64Encode } from "../utils/encoder";

import CenteredCard from "../components/CenteredCard";

export default function Send(props: any) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [debugStr, setDebugStr] = useState<string>("");

    function _fileChangeHandler(e: React.ChangeEvent<HTMLInputElement>) {
        let file = (e.target as HTMLInputElement & EventTarget).files![0]
        setSelectedFile(file);
    }

    function _submissionHandler() {
        base64Encode(selectedFile!).then(b64 => {
            let b64Str: string;
            if (b64 instanceof ArrayBuffer) {
                b64Str = [...new Uint8Array(b64)]
                            .map(x => x.toString(16).padStart(2, '0'))
                            .join('');
            } else 
                b64Str = b64;

            setDebugStr(b64Str);
        });        
    }

    return (
        <CenteredCard>
            <input 
                type="file" 
                onChange={_fileChangeHandler}
                id="file-upload" 
            />
            <label htmlFor="file-upload">
                <Button onClick={_submissionHandler}>
                    Upload
                </Button>
            </label>
            {
                selectedFile &&
                <div>
					<p>Filename: {selectedFile.name}</p>
					<p>Filetype: {selectedFile.type}</p>
					<p>Size in bytes: {selectedFile.size}</p>
				</div>
            }
            <br />
            <p style={{wordWrap: 'break-word'}}>{debugStr}</p>
        </CenteredCard>
    );
}