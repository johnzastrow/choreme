import { Alert, IconButton, Snackbar, SnackbarProps } from "@mui/material";
import React from "react";
import { useToast } from "../../hooks";
import CloseIcon from "@mui/icons-material/Close";
import { RootState } from "../../store/index";
import { useSelector } from "react-redux";

export type ToastProps = SnackbarProps & {
  type?: "success" | "error" | "info" | "warning";
  message?: string;
};

export const Toast: React.FC<ToastProps> = () => {
  const { hideToast } = useToast();
  const toastState = useSelector((state: RootState) => state.toast);

  return (
    <Snackbar
      open={toastState.isOpen}
      autoHideDuration={3000}
      onClose={hideToast}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => hideToast()}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <Alert severity={toastState.type ?? "info"} sx={{ width: "100%" }}>
        {toastState.message}
      </Alert>
    </Snackbar>
  );
};
