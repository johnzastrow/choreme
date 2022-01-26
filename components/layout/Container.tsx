import * as React from "react";
import { Box, BoxProps, styled } from "@mui/system";
import LoadingOverlay from "react-loading-overlay";

type BoxSxProps = BoxProps & {
  children?: React.ReactNode;
  isLoading?: boolean;
};
const BoxStyled = styled(Box)<BoxSxProps>`
  min-height: 100vh;
  padding: ${(props) => props.theme.spacing(4)}
    ${(props) => props.theme.spacing(0)};
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export function Container({ children, isLoading }: BoxSxProps) {
  return (
    <LoadingOverlay active={isLoading} spinner>
      <BoxStyled component={"div"}>{children}</BoxStyled>
    </LoadingOverlay>
  );
}

export default Container;
