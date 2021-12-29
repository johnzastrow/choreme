import {IconButton, Stack, Typography} from "@mui/material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

export type ChoreNavigationProps = {
    onNext: () => void;
    onPrevious: () => void;
    indicatorText: string;
};

export function ChoreNavigation({onNext, onPrevious, indicatorText}: ChoreNavigationProps) {
    return <Stack direction={"row"} alignItems={"center"} justifyContent={"center"}>
        <IconButton aria-label={"previous"} onClick={() => onPrevious()}>
            <ArrowBackIosNewIcon/>
        </IconButton>
        <Typography>{indicatorText}</Typography>
        <IconButton aria-label={"next"} onClick={() => onNext()}>
            <ArrowForwardIosIcon/>
        </IconButton>
    </Stack>
}