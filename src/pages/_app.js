import React from "react";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import AuthenticateUser from "components/AuthenticateUser";

const MyApp = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <Head>
        <title>Dealer's Choice</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthenticateUser />
      <Component {...pageProps} />
    </RecoilRoot>
  );
};

export default MyApp;
