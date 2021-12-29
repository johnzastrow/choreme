import { Button, ButtonProps, styled } from "@mui/material";

const ButtonStyled = styled(Button)<ButtonProps>`
  margin: 5px;
`;
export function TextButton(props: ButtonProps) {
  return <ButtonStyled {...props} variant="text" />;
}

export default TextButton;
