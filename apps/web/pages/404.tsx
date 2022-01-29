import React from "react";
import { ErrorAlert } from "../components/ErrorAlert";
import { Layout } from "../components/Layout";

const Custom404Page = () => {
  return (
    <Layout>
      <ErrorAlert title="uh-oh" message="page does not exist" color="indigo" />
    </Layout>
  );
};

export default Custom404Page;
