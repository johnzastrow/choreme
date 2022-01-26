import {styled, TextField, TextFieldProps} from "@mui/material";

const NormalTextInputStyled = styled(TextField)<TextFieldProps>`
  && {
    width: 100%;
    margin-top: ${props => props.theme.spacing(2)};
  }
`
export function NormalTextInput(props: TextFieldProps) {
  return <NormalTextInputStyled {...props} />
}

export default NormalTextInput;