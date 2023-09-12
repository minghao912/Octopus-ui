import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faArrowDownLong, faT, faFile } from '@fortawesome/free-solid-svg-icons';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import styles from '../styles/ActionSelector.module.css';
import { CustomStepConnector, CustomStepIcon } from './Stepper/CustomStepComponents';
import CenteredCard from '../components/CenteredCard';
import useWindowDimensions, { MAX_MOBILE_WIDTH } from '../utils/useWindowDimensions';
import { Step, StepLabel, Stepper } from '@mui/material';

enum STEP {
    ZERO = 0,
    ONE = 1
}

enum SR {
    SEND, RECEIVE
}

export default function ActionSelector() {
    const [_, width] = useWindowDimensions();
    const isMobile = (width! < MAX_MOBILE_WIDTH);

    
    const [stepInfo, setStepInfo] = useState<[STEP, SR | null]>([STEP.ZERO, null]);
    const [currentButtons, setCurrentButtons] = useState<JSX.Element>(_getButtons(...stepInfo));
    
    useEffect(() => {
        if (width != null) {
            // setIsMobile(width < MAX_MOBILE_WIDTH);
            setCurrentButtons(_getButtons(...stepInfo));
        }
    }, [width])

    function _userAction(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, sr: SR) {
        // Make sure button click works on first click
        e.persist();

        // Set state
        setStepInfo([STEP.ONE, sr]);

        // Do fly away transition
        let f = document.querySelector('.fade-item');
        f?.classList.add(styles.flyAway);

        // Then show next step
        setTimeout(() => {
            setCurrentButtons(_getButtons(STEP.ONE, sr));
        }, 250)
    }
    
    function _getButtons(step: STEP, sr: SR | null): JSX.Element {
        const iconStyle = isMobile ? {height: '50px', color: 'black'} : {height: '75px', color: 'black'}
        const fontSize = isMobile ? '24px' : '36px';

        if (step == STEP.ZERO) {
            // Step one: Choose send or receive
            return (<>
                <Grid item 
                    xs={5}
                    className={isMobile ? styles.halfH : styles.maxWH}
                >
                    <Button
                        variant="outlined"
                        onClick={(e) => _userAction(e, SR.SEND)}
                        className={
                            [
                                styles.raise, 
                                styles.maxWH, 
                                (isMobile ? styles.roundButtonMobile : styles.roundButton)
                            ].join(" ")
                        }
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
                                    icon={faPaperPlane} 
                                    style={iconStyle}
                                />
                            </Grid>
                            <Grid item sx={{maxWidth: '100%'}}>
                                <Typography
                                    sx={{ fontSize: fontSize }}
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
                    className={isMobile ? styles.halfH : styles.maxWH}
                >
                    <Button
                        variant="outlined"
                        onClick={(e) => _userAction(e, SR.RECEIVE)}
                        className={
                            [
                                styles.raise, 
                                styles.maxWH, 
                                (isMobile ? styles.roundButtonMobile : styles.roundButton)
                            ].join(" ")
                        }
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
                                    icon={faArrowDownLong}
                                    style={iconStyle}
                                />
                            </Grid>
                            <Grid item sx={{maxWidth: '100%'}}>
                                <Typography
                                    sx={{ fontSize: fontSize }}
                                    color="text.primary"
                                    align="center"
                                >
                                    Receive
                                </Typography>
                            </Grid>
                        </Grid>
                    </Button>
                </Grid>
            </>);
        } else if (step == STEP.ONE) {
            if (sr == null)
                return <></>;
    
            // Step two: Choose text or file
            return (<>
                <Grid
                    container
                    spacing={1}
                    direction={isMobile ? "column" : "row"}
                    justifyContent="space-around"
                    alignItems="center"
                    className={styles.maxWH}
                >
                    <Grid item 
                        xs={5}
                        className={isMobile ? styles.halfH : styles.maxWH}
                    >
                        <Link href={sr == SR.SEND ? "/send-text" : "/receive-text"} passHref={true}>
                            <Button
                                variant="outlined"
                                className={
                                    [
                                        styles.raise, 
                                        styles.maxWH, 
                                        (isMobile ? styles.roundButtonMobile : styles.roundButton)
                                    ].join(" ")
                                }
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
                                            style={iconStyle}
                                        />
                                    </Grid>
                                    <Grid item sx={{maxWidth: '100%'}}>
                                        <Typography
                                            sx={{ fontSize: fontSize }}
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
                                className={
                                    [
                                        styles.raise, 
                                        styles.maxWH, 
                                        (isMobile ? styles.roundButtonMobile : styles.roundButton)
                                    ].join(" ")
                                }
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
                                            style={iconStyle}
                                        />
                                    </Grid>
                                    <Grid item sx={{maxWidth: '100%'}}>
                                        <Typography
                                            sx={{ fontSize: fontSize }}
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
            </>);
        } else return <></>;
    }

    return (
        <CenteredCard>
            <Grid
                container
                spacing={1}
                direction="column"
                justifyContent="center"
                alignItems="space-around"
                sx={{ margin: 0 }}
                className={styles.maxWH}
            >
                <Grid item
                    sx={{ height: '20%' }}
                >
                    <Stepper alternativeLabel activeStep={stepInfo[0]} connector={<CustomStepConnector />}>
                        <Step key="STEP_0">
                            <StepLabel StepIconComponent={CustomStepIcon}>Transmission mode</StepLabel>
                        </Step>
                        <Step key="STEP_1">
                            <StepLabel StepIconComponent={CustomStepIcon}>Transmission type</StepLabel>
                        </Step>
                    </Stepper>
                </Grid>
                <Grid item>
                    <Grid
                        container
                        spacing={1}
                        direction={isMobile ? "column" : "row"}
                        justifyContent="space-around"
                        alignItems="center"
                        className="fade-item"
                        sx={{ height: '80%', paddingTop: '5%' }}
                    >
                        {currentButtons}
                    </Grid>
                </Grid>
            </Grid>
        </CenteredCard>
    );
}