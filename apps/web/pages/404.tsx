import React from "react";
import { Alert } from "../components/Alert";
import { Layout } from "../components/Layout";

const Custom404Page = () => {
  return (
    <Layout>
      <Alert type="info" message="page does not exist" />
    </Layout>
  );
};

export default Custom404Page;
