import { useDispatch } from "react-redux";
import { toastActions } from "../store/toast/index";

// TODO: use Snackbar props as a parameter
export function useToast() {
  const dispatch = useDispatch();
  const { showToast, hideToast } = toastActions;
  const _showToast = (message: string, type: "success" | "error") => {
    dispatch(showToast({ message, type }));
  };
  const _hideToast = () => {
    dispatch(hideToast());
  };
  return { showToast: _showToast, hideToast: _hideToast };
}
