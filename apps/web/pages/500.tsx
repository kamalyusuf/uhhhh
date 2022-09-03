import React from "react";
import { Alert } from "../components/Alert";
import { Layout } from "../components/Layout";

const Custom500Page = () => {
  return (
    <Layout>
      <Alert type="error" message="something went wrong" />
    </Layout>
  );
};

export default Custom500Page;
