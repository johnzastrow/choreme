import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import React from "react";
import { Provider } from "react-redux";
import { Toast } from "../components/toast";
import { store } from "../store";
import "../styles/globals.css";
import {CssBaseline} from "@mui/material";

function MyApp({ Component, pageProps }: AppProps) {
  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);
  return (
    <SessionProvider session={pageProps.session}>
      <Provider store={store}>
        <CssBaseline />
        <Component {...pageProps} />
        <Toast />
      </Provider>
    </SessionProvider>
  );
}

export default MyApp;
