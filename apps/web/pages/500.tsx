import React from "react";
import { ErrorAlert } from "../components/ErrorAlert";
import { Layout } from "../components/Layout";

const Custom500Page = () => {
  return (
    <Layout>
      <ErrorAlert title="uh-oh" message="something went wrong" color="indigo" />
    </Layout>
  );
};

export default Custom500Page;
