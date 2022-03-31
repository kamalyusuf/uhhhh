// import { createGetInitialProps } from "@mantine/next";
// import Document from "next/document";
//
// const getInitialProps = createGetInitialProps();
//
// export default class _Document extends Document {
//   static getInitialProps = getInitialProps;
// }
import Document, { DocumentContext } from "next/document";
import { ServerStyles, createStylesServer } from "@mantine/next";
import Script from "next/script";

const stylesServer = createStylesServer();

export default class _Document extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          <ServerStyles html={initialProps.html} server={stylesServer} />
        </>
      ),
      head: [
        <>
          <Script async src="https://cdn.splitbee.io/sb.js" />
        </>
      ]
    };
  }
}
