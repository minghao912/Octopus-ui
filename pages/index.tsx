import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowDownLong } from '@fortawesome/free-solid-svg-icons';

import styles from '../styles/home.module.css';
import Link from 'next/link';

export default function Home() {
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
                    <Grid
                        container
                        spacing={2}
                        direction="row"
                        justifyContent="center"
                        alignItems="center"
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
                                <Grid item xs={5}>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            padding: 5,
                                            borderRadius: '16px',
                                        }}
                                    >
                                        <Link href="send-text">
                                            <Grid
                                                container
                                                rowSpacing={4}
                                                direction="column"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Grid item>
                                                    <FontAwesomeIcon 
                                                        icon={faPaperPlane} 
                                                        style={{height: '75px', color: 'black'}}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        sx={{ fontSize: 48, margin: 5 }}
                                                        color="text.primary"
                                                        align="center"
                                                    >
                                                        Send
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Link>
                                    </Button>
                                </Grid>
                                <Grid item xs={5}>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            padding: 5,
                                            borderRadius: '16px',
                                        }}
                                    >
                                        <Link href="/receive">
                                            <Grid
                                                container
                                                rowSpacing={4}
                                                direction="column"
                                                justifyContent="center"
                                                alignItems="center"
                                            >
                                                <Grid item>
                                                    <FontAwesomeIcon 
                                                        icon={faArrowDownLong}
                                                        style={{height: '75px', color: 'black'}}
                                                    />
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        sx={{ fontSize: 48, margin: 5 }}
                                                        color="text.primary"
                                                        align="center"
                                                    >
                                                        Receive
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Link>
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Grid>
    </Grid>);
}