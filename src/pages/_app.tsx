import "../styles.scss";

import App from "next/app";
import Head from "next/head";

class CustomApp extends App {
  render() {
    return (
      <>
        <Head>
          <title key="page-title">DRS Chat</title>
        </Head>
        {super.render()}
      </>
    );
  }
}

export default CustomApp;
