import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

import useWindowDimensions, { MAX_MOBILE_WIDTH } from '../utils/useWindowDimensions';
import styles from '../styles/CenteredCard.module.css';

export default function CenteredCard(props: any): JSX.Element {
    const [_, width] = useWindowDimensions();

    if (width && width < MAX_MOBILE_WIDTH) { // Mobile narrow screen
        return (
            <Grid
            container
            spacing={0}
            alignItems="center"
            justifyContent="center"
            style={{
                minHeight: 'calc(480px * 1.4)', 
                height: '100vh',
                minWidth: 'calc(300px * 1.3)', 
                paddingLeft: '15%', 
                paddingRight: '15%' 
            }}
        >
            <Grid item xs={8} style={{minHeight: '480px', minWidth: '300px'}}>
                <Card
                    sx={{ 
                        borderRadius: '16px',
                        minHeight: '480px',
                        minWidth: '300px'
                    }}
                    className={styles.card}
                >
                    <CardContent
                        className={styles.maxWH}
                    >
                        {props.children}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        )
    }
    else return (   // Regular landscape
        <Grid
            container
            spacing={0}
            alignItems="center"
            justifyContent="center"
            style={{
                minHeight: 'calc(480px * 1.4)', 
                height: '100vh',
                minWidth: 'calc(640px * 1.3)', 
                paddingLeft: '15%', 
                paddingRight: '15%' 
            }}
        >
            <Grid item xs={8} style={{minHeight: '480px', minWidth: '640px'}}>
                <Card
                    sx={{ 
                        borderRadius: '16px',
                        minHeight: '480px',
                        minWidth: '640px'
                    }}
                    className={styles.card}
                >
                    <CardContent
                        className={styles.maxWH}
                    >
                        {props.children}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}