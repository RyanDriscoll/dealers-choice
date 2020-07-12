import React, { Component } from "react";
import { auth } from "lib/firebase";
// import App from 'next/app'

class MyApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
    this.authUnsubscribe = null;
  }

  componentDidMount() {
    this.authUnsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        auth.signInAnonymously();
      }
      this.setState({ user });
    });
  }

  componentWillUnmount() {
    if (this.authUnsubscribe) {
      this.authUnsubscribe();
    }
  }

  render() {
    const { Component: PageComponent, pageProps } = this.props;
    const { user } = this.state;

    return <PageComponent {...pageProps} user={user} />;
  }
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
