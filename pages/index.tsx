import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowDownLong, faT, faFile } from '@fortawesome/free-solid-svg-icons';

import { useState } from 'react';

import styles from '../styles/home.module.css';
import Link from 'next/link';

enum STEP {
    ONE, TWO
}

enum SR {
    SEND, RECEIVE
}

export default function Home() {
    const [currentContent, setCurrentContent] = useState<JSX.Element>(_getContent(STEP.ONE, null));

    function _userAction(sr: SR) {
        // Do fly away transition
        let f = document.querySelector('.fade-item');
        f?.classList.add(styles.flyAway);

        // Then show next step
        setTimeout(() => {
            setCurrentContent(_getContent(STEP.TWO, sr));
        }, 250)
    }
    
    function _getContent(step: STEP, sr: SR | null): JSX.Element {
        if (step == STEP.ONE) {
            // Step one: Choose send or receive
            return (<Grid
                container
                spacing={2}
                direction="column"
                justifyContent="center"
                alignItems="space-around"
                sx={{
                    width: '100%',
                    height: '100%',
                    margin: 0
                }}
                className="fade-item"
            >
                <Grid item>
                    <Typography 
                        sx={{ fontSize: 24, fontWeight: 'bold' }}
                        color="text.primary"
                        align="center"
                        gutterBottom
                    >
                        I want to
                    </Typography>
                </Grid>
                <Grid item>
                    <Grid
                        container
                        spacing={1}
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        sx={{
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Grid item 
                            xs={5}
                            sx={{
                            width: '100%',
                            height: '100%'
                            }}
                        >
                            <Button
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    padding: 5,
                                    borderRadius: '16px',
                                }}
                                className={styles.raise}
                                onClick={(e) => _userAction(SR.SEND)}
                            >
                                <Grid
                                    container
                                    rowSpacing={4}
                                    direction="column"
                                    justifyContent="center"
                                    alignItems="center"
                                    sx={{ margin: 5 }}
                                >
                                    <Grid item sx={{maxWidth: '100%'}}>
                                        <FontAwesomeIcon 
                                            icon={faPaperPlane} 
                                            style={{height: '75px', color: 'black'}}
                                        />
                                    </Grid>
                                    <Grid item sx={{maxWidth: '100%'}}>
                                        <Typography
                                            sx={{ fontSize: 36 }}
                                            color="text.primary"
                                            align="center"
                                        >
                                            Send
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Button>
                        </Grid>
                        <Grid item 
                            xs={5}
                            sx={{
                            width: '100%',
                            height: '100%'
                            }}
                        >
                            <Button
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '16px',
                                }}
                                className={styles.raise}
                                onClick={(e) => _userAction(SR.RECEIVE)}
                            >
                                <Grid
                                    container
                                    rowSpacing={4}
                                    direction="column"
                                    justifyContent="center"
                                    alignItems="center"
                                    sx={{margin: 5}}
                                >
                                    <Grid item sx={{maxWidth: '100%'}}>
                                        <FontAwesomeIcon 
                                            icon={faArrowDownLong}
                                            style={{height: '75px', color: 'black'}}
                                        />
                                    </Grid>
                                    <Grid item sx={{maxWidth: '100%'}}>
                                        <Typography
                                            sx={{ fontSize: 36 }}
                                            color="text.primary"
                                            align="center"
                                        >
                                            Receive
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>);
        } else if (step == STEP.TWO) {
            if (sr == null)
                return <></>;
    
            // Step two: Choose text or file
            return (<Grid
                container
                spacing={2}
                direction="column"
                justifyContent="center"
                alignItems="space-around"
                sx={{
                    width: '100%',
                    height: '100%',
                    margin: 0
                }}
            >
                <Grid item>
                    <Typography 
                        sx={{ fontSize: 24, fontWeight: 'bold' }}
                        color="text.primary"
                        align="center"
                        gutterBottom
                    >
                        I want to {sr == SR.SEND ? "send a" : "receive a"}
                    </Typography>
                </Grid>
                <Grid item sx={{height: '80%'}}>
                    <Grid
                        container
                        spacing={1}
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        sx={{
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <Grid item 
                            xs={5}
                            sx={{
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <Button
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    padding: 5,
                                    borderRadius: '16px',
                                }}
                                className={styles.raise}
                            >
                                <Link href={sr == SR.SEND ? "/send-text" : "/receive-text"}>
                                    <Grid
                                        container
                                        rowSpacing={4}
                                        direction="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    >
                                        <Grid item sx={{maxWidth: '100%'}}>
                                            <FontAwesomeIcon 
                                                icon={faT} 
                                                style={{height: '75px', color: 'black'}}
                                            />
                                        </Grid>
                                        <Grid item sx={{maxWidth: '100%'}}>
                                            <Typography
                                                sx={{ fontSize: 36 }}
                                                color="text.primary"
                                                align="center"
                                            >
                                                Text
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Link>
                            </Button>
                        </Grid>
                        <Grid item 
                            xs={5}
                            sx={{
                                width: '100%',
                                height: '100%'
                            }}
                        >
                            <Button
                                variant="outlined"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '16px',
                                }}
                                className={styles.raise}
                            >
                                <Link href={sr == SR.SEND ? "/send-file" : "/receive-file"} as="div">
                                    <Grid
                                        container
                                        rowSpacing={4}
                                        direction="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        sx={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    >
                                        <Grid item sx={{maxWidth: '100%'}}>
                                            <FontAwesomeIcon 
                                                icon={faFile}
                                                style={{height: '75px', color: 'black'}}
                                            />
                                        </Grid>
                                        <Grid item sx={{maxWidth: '100%'}}>
                                            <Typography
                                                sx={{ fontSize: 36 }}
                                                color="text.primary"
                                                align="center"
                                            >
                                                File
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Link>
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>);
        } else return <></>;
    }

    return (<Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent="center"
        style={{ minHeight: '100vh', paddingLeft: '15%', paddingRight: '15%' }}
    >
        <Grid item xs={8}>
            <Card
                sx={{ 
                    borderRadius: '16px',
                    minHeight: '480px',
                    minWidth: '640px'
                }}
                className={styles.card}
            >
                <CardContent
                    style={{ height: '100%', width: '100%' }}
                >
                    
                    {currentContent}
                </CardContent>
            </Card>
        </Grid>
    </Grid>);
}