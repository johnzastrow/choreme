import { Typography } from "@mui/material";
import { styled } from "@mui/system";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { MouseEventHandler, useState } from "react";
import NormalButton from "../../components/button/NormalButton";
import Container from "../../components/layout/Container";
import NormalTextInput from "../../components/text-input/normal-text-input";
import { useToast } from "../../hooks";
import { useSignupMutation } from "../../lib/api";
import styles from "../../styles/Home.module.css";
import { SignUpVM } from "../../types/vm";

const StyledButtonDiv = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;
const StyledTextInputDiv = styled("div")`
  display: flex;
  flex-direction: column;
`;
const StyledLogoDiv = styled("div")`
  display: flex;
  justify-content: center;
`;

const MainStyled = styled("div")`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`;

const SignUp: NextPage = () => {
  const [state, setState] = useState({
    email: "",
    password: "",
    error: {
      isError: false,
      message: "",
    },
  });
  const { showToast } = useToast();
  const [signup, { isLoading, data }] = useSignupMutation();
  const route = useRouter();

  const onTextChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.name === "email";
    switch (e.target.name) {
      case "email":
        setState({ ...state, email: e.target.value });
        break;
      case "password":
        setState({ ...state, password: e.target.value });
        break;
      case "confirmPassword":
        if (e.target.value === state.password) {
          setState({
            ...state,
            error: {
              isError: false,
              message: "",
            },
          });
        } else {
          setState({
            ...state,
            error: {
              isError: true,
              message: "Passwords do not match",
            },
          });
        }
        break;
      default:
        break;
    }
  };

  const onFormSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    //Getting value from useRef()
    const { email, password } = state;
    //Validation
    if (!email || !email.includes("@") || !password) {
      alert("Invalid details");
      return;
    }
    const signUpVM: SignUpVM = {
      email,
      password,
    };
    try {
      await signup(signUpVM).unwrap();
      showToast("Successfully signed up", "success");
      route.push("/auth");
    } catch (error) {
      console.log(error);
      // @ts-ignore
      showToast(error.data.message, "error");
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Chore Me - Authentication</title>
        <meta name="description" content="Generated by create next app" />
      </Head>

      <Container isLoading={isLoading}>
        <MainStyled>
          <StyledLogoDiv>
            <img
              src="/images/logo.png"
              alt="logo"
              height="110px"
              width={"110px"}
            />
          </StyledLogoDiv>
          <StyledTextInputDiv>
            <NormalTextInput
              label="Email"
              color="primary"
              name="email"
              onChange={onTextChanged}
              type="email"
            />
            <NormalTextInput
              label="Password"
              color="primary"
              name="password"
              onChange={onTextChanged}
              type="password"
              autoComplete="current-password"
            />
            <NormalTextInput
              label="Confirm Password"
              color="primary"
              name="confirmPassword"
              error={state.error.isError}
              helperText={state.error.isError && state.error.message}
              onChange={onTextChanged}
              type="password"
              autoComplete="current-password"
            />
          </StyledTextInputDiv>
          <StyledButtonDiv>
            <NormalButton
              variant="contained"
              color="primary"
              onClick={() => route.push("/auth")}
            >
              <Typography variant="button">Sign In</Typography>
            </NormalButton>
            <NormalButton
              variant="contained"
              color="primary"
              onClick={onFormSubmit}
            >
              <Typography variant="button">Sign Up</Typography>
            </NormalButton>
          </StyledButtonDiv>
        </MainStyled>
      </Container>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default SignUp;