// import {styled} from "@mui/system";
import {Button, ButtonProps} from "@mui/material";
import {styled} from "@mui/material";


const ButtonStyled = styled(Button)<ButtonProps>`
    margin: 5px;
`
export function NormalButton(props: ButtonProps) {
    return <ButtonStyled {...props}/>
}

export default NormalButton;