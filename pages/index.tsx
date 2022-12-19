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
import CenteredCard from '../components/CenteredCard';

enum STEP {
    ONE, TWO
}

enum SR {
    SEND, RECEIVE
}

export default function Home() {
    const [currentContent, setCurrentContent] = useState<JSX.Element>(_getContent(STEP.ONE, null));

    function _userAction(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, sr: SR) {
        // Make sure button click works on first click
        e.persist();

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
                sx={{ margin: 0 }}
                className={["fade-item", styles.maxWH].join(" ")}
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
                <Grid item sx={{ height: '80%' }}>
                    <Grid
                        container
                        spacing={1}
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        className={styles.maxWH}
                    >
                        <Grid item 
                            xs={5}
                            className={styles.maxWH}
                        >
                            <Button
                                variant="outlined"
                                className={[styles.raise, styles.maxWH, styles.roundButton].join(" ")}
                                onClick={(e) => _userAction(e, SR.SEND)}
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
                            className={styles.maxWH}
                        >
                            <Button
                                variant="outlined"
                                className={[styles.raise, styles.maxWH, styles.roundButton].join(" ")}
                                onClick={(e) => _userAction(e, SR.RECEIVE)}
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
                className={styles.maxWH}
                sx={{ margin: 0 }}
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
                        className={styles.maxWH}
                    >
                        <Grid item 
                            xs={5}
                            className={styles.maxWH}
                        >
                            <Link href={sr == SR.SEND ? "/send-text" : "/receive-text"} passHref={true}>
                                <Button
                                    variant="outlined"
                                    className={[styles.raise, styles.maxWH, styles.roundButton].join(" ")}
                                >                                
                                    <Grid
                                        container
                                        rowSpacing={4}
                                        direction="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        className={styles.maxWH}
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
                                </Button>
                            </Link>
                        </Grid>
                        <Grid item 
                            xs={5}
                            className={styles.maxWH}
                        >
                            <Link href={sr == SR.SEND ? "/send-file" : "/receive-file"} passHref={true}>
                                <Button
                                    variant="outlined"
                                    className={[styles.raise, styles.maxWH, styles.roundButton].join(" ")}
                                >
                                    <Grid
                                        container
                                        rowSpacing={4}
                                        direction="column"
                                        justifyContent="center"
                                        alignItems="center"
                                        className={styles.maxWH}
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
                                </Button>
                            </Link>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>);
        } else return <></>;
    }

    return (<CenteredCard>
        {currentContent}
    </CenteredCard>);
}