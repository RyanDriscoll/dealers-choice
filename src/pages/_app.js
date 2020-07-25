import React from "react";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import AuthenticateUser from "components/AuthenticateUser";
import { UserProvider } from "context/userContext";
import { wrapper } from "store/store";

const MyApp = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <UserProvider>
        <Head>
          <title>Dealer's Choice</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <AuthenticateUser />
        <Component {...pageProps} />
      </UserProvider>
    </RecoilRoot>
  );
};

export default wrapper.withRedux(MyApp);
