import React from "react";
import Head from "next/head";
import AuthenticateUser from "components/AuthenticateUser";
import { wrapper } from "store/store";
import "bootstrap/dist/css/bootstrap.min.css";

const MyApp = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <title>Dealer's Choice</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthenticateUser />
      <Component {...pageProps} />
    </>
  );
};

export default wrapper.withRedux(MyApp);
