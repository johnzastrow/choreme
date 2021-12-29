import { Container, ContainerProps, Stack, Typography } from "@mui/material";
import React, { ReactNode } from "react";
import LoadingOverlay from "react-loading-overlay";
import { ChoreMeAvatar } from "../avatar";
import { DropDownMenu } from "../menu";

export type ChoreLayoutProps = ContainerProps & {
  title?: string;
  avatar?: ReactNode;
  isLoading?: boolean;
};

export const ChoreLayout: React.FC<ChoreLayoutProps> = ({
  title,
  avatar,
  isLoading,
  children,
  ...props
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  return (
    <LoadingOverlay active={isLoading} spinner>
      <Container
        sx={{
          paddingTop: "1rem",
        }}
      >
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          onMouseEnter={() => setShowMenu(true)}
          onMouseLeave={() =>
            setTimeout(() => {
              setShowMenu(false);
            }, 1000)
          }
        >
          <Typography variant={"h4"}>{title}</Typography>
          {avatar}
          {showMenu && (
            <DropDownMenu
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bgcolor: "background.paper",
              }}
            />
          )}
        </Stack>
        {children}
      </Container>
    </LoadingOverlay>
  );
};

ChoreLayout.defaultProps = {
  title: "Chore Me",
  avatar: <ChoreMeAvatar />,
};
