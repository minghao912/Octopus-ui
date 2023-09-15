import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import CenteredCard from './CenteredCard';
import styles from '../styles/SenderReceiver.module.css';

export interface ISenderProps {
    getConnectionStatus: () => JSX.Element,
    startConnection: () => void,
    startUpload: () => void,
    state: {
        wsConnected: boolean,
        remoteConnected: boolean,
        fileSelected: boolean,
        alreadySent: boolean
    }
}

export default function Sender(props: ISenderProps & React.ComponentProps<typeof Grid>) {
    return (
        <Grid container spacing={2} sx={{ height: '100vh' }}>
            <Grid item xs={12}>
                <CenteredCard>
                    <div className={styles.main}>
                        {
                            !props.state.wsConnected &&
                            <Button 
                                onClick={props.startConnection} 
                                size={"large"}
                            >
                                Start
                            </Button>
                        }
                        <h2>{props.getConnectionStatus()}</h2>
                        
                        {/* Dynamic content */}
                        { props.children || null }

                        {
                            props.state.wsConnected &&
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    paddingTop: "1.5em"
                                }}
                            >
                                <Button
                                    onClick={props.startUpload}
                                    size={"large"}
                                    variant={"contained"}
                                    disabled={
                                        !props.state.remoteConnected || 
                                        !props.state.fileSelected || 
                                        props.state.alreadySent
                                    }
                                >
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                    <div style={{ padding: '3px' }} />
                                    Send
                                </Button>
                            </div>
                        }
                    </div>
                </CenteredCard>
            </Grid>
        </Grid>
    );
}