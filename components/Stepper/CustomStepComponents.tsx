import { ReactElement } from 'react';
import { styled } from '@mui/material/styles';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import AttachmentIcon from '@mui/icons-material/Attachment';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { stepLabelClasses } from '@mui/material/StepLabel';
import { StepIconProps } from '@mui/material/StepIcon';

const GRADIENT_KEY_COLORS = ["rgb(223, 151, 230)", "rgb(201, 67, 105)", "rgb(138, 35, 135)"];

export const CustomStepConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient( 95deg,${GRADIENT_KEY_COLORS[0]} 0%,${GRADIENT_KEY_COLORS[1]} 50%,${GRADIENT_KEY_COLORS[2]} 100%)`,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            backgroundImage: `linear-gradient( 95deg,${GRADIENT_KEY_COLORS[0]} 0%,${GRADIENT_KEY_COLORS[1]} 50%,${GRADIENT_KEY_COLORS[2]} 100%)`,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        height: 3,
        border: 0,
        backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#ccc',
        borderRadius: 1,
    },
}));

const CustomStepIconRoot = styled('div')<{
    ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
    zIndex: 1,
    color: '#fff',
    width: 50,
    height: 50,
    display: 'flex',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    ...(ownerState.active && {
        backgroundImage: `linear-gradient( 136deg, ${GRADIENT_KEY_COLORS[0]} 0%, ${GRADIENT_KEY_COLORS[1]} 50%, ${GRADIENT_KEY_COLORS[2]} 100%)`,
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
    }),
    ...(ownerState.completed && {
        backgroundImage: `linear-gradient( 136deg, ${GRADIENT_KEY_COLORS[0]} 0%, ${GRADIENT_KEY_COLORS[1]} 50%, ${GRADIENT_KEY_COLORS[2]} 100%)`,
    }),
}));

export function CustomStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    const icons: { [index: string]: ReactElement } = {
        1: <WifiTetheringIcon />,
        2: <AttachmentIcon />,
    };

    return (
        <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
            {icons[String(props.icon)]}
        </CustomStepIconRoot>
    );
}