import React from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";

import CenteredCard from "./CenteredCard";
import styles from "../styles/SenderReceiver.module.css";

export interface IReceiverProps {
    startConnection: () => void,
    error?: {
        errorOccurred: string | undefined,
        setErrorOccurred: (value: React.SetStateAction<string | undefined>) => void,
    }
    input: {
        handleCodeInput: React.ChangeEventHandler<HTMLInputElement>,
        handleKeyDown: React.KeyboardEventHandler<HTMLDivElement>
    }
    state: {
        wsConnected: boolean
    }
}

export default function Receiver(props: IReceiverProps & React.ComponentProps<typeof Grid>) {
    return (
        <Grid container spacing={2} sx={{ height: '100vh' }}>
            <Grid item xs={12}>
                {
                    props.error &&
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={props.error!.errorOccurred != undefined}
                        onClose={() => props.error!.setErrorOccurred(undefined)}
                        autoHideDuration={5000}
                    >
                        <Alert severity="error" onClose={() => props.error!.setErrorOccurred(undefined)}>{props.error!.errorOccurred}</Alert>
                    </Snackbar>
                }
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
                                onChange={props.input.handleCodeInput}
                                onKeyDown={props.input.handleKeyDown}
                            />
                            <div style={{marginRight: "10px"}} />
                            <Button 
                                size={"large"}
                                onClick={props.startConnection}
                            >
                                Connect
                            </Button>
                        </div>
                        <h2>
                            {
                                props.state.wsConnected
                                    ? <span style={{color: "green"}}>Connected</span> 
                                    : <span style={{color: "red"}}>Disconnected</span>
                            }
                        </h2>

                        {/* Dynamic Content */}
                        { props.children || null }
                    </div>
                </CenteredCard>
            </Grid>
        </Grid>
    );
}