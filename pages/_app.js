// pages/_app.js
import Head from "next/head";
import "@/styles/globals.css";
import { poppins } from "@/lib/fonts";




export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0f172a" />
      </Head>

      <main className={poppins.className}>
        <Component {...pageProps} />
      </main>
    </>
  );
}
