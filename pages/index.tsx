import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { TypeAnimation } from "react-type-animation";

import ActionSelector from "../components/ActionSelector";

export default function Home() {
    const SENDABLE_NOUNS = ["photos", "videos", "bills", "homework", "drawings", "letters", "blueprints"];
    const TYPING_TIME_DELAY_MS = 2000;

    return (
        <Grid container spacing={2} sx={{ height: '100vh', overflow: 'hidden' }}>
            <Grid item xs={12} sx={{ paddingTop: '3% !important' }}>
                <div style={{ textAlign: 'center' }}>
                    <Typography style={{ fontSize: 72 }}><b>Octopus</b></Typography>
                    <Typography variant="h4">
                        Send&nbsp;
                        <TypeAnimation
                            sequence={SENDABLE_NOUNS.map((n) => [n, TYPING_TIME_DELAY_MS]).flat()}
                            wrapper="b"
                            speed={25}
                            repeat={Infinity}
                        />
                        to anyone, anywhere.
                    </Typography>
                </div>
            </Grid>
            <Grid item xs={12}>
                <ActionSelector />
            </Grid>
        </Grid>
    );
}