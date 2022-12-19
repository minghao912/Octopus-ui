import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

import styles from '../styles/CenteredCard.module.css';

export default function CenteredCard(props: any): JSX.Element {
    return (<Grid
        container
        spacing={0}
        alignItems="center"
        justifyContent="center"
        style={{
            minHeight: '100vh', 
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
    </Grid>);
}