import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Head from "next/head";

interface Props {
  // ReactNode represents any props that come into the children component
  children?: ReactNode;
  title?: String;
}

const Layout = ({ title, children }: Props) => {
  return (
    <>
      <Head>
        <title>
          {/* The title name is dynamic depending on the specific page */}
          {title
            ? title + " | 24/7 Vasteloavend Muzieek"
            : "Carnival Radio | 24/7 Vasteloavend Muzieek"}
        </title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
        
      </Head>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default Layout;
