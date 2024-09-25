import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Grape+Nuts&family=Poppins:wght@300;400;600&family=Work+Sans:wght@300;400;600&display=swap"
            rel="stylesheet"
          />
          <meta name="description" content="SyncPulse is an application that helps businesses understand their engineering teams better" />
          <meta
            name="keywords"
            content="
              syncpulse,  
              SyncPulse,
              SyncPulse engineering,
              SyncPulse software,
              SyncPulse tools,
              SyncPulse productivity,
              SyncPulse efficiency,
              SyncPulse performance,
              SyncPulse management,
              SyncPulse engineering management,
              SyncPulse engineering performance,
              SyncPulse engineering productivity,
              SyncPulse engineering efficiency,
              SyncPulse engineering software,
              engineering productivity,
              engineering efficiency,
              engineering software,
              engineering tools,
              engineering productivity software,
              engineering performance software,
              engineering efficiency software,
              engineering productivity tools,
              engineering performance tools,
              engineering efficiency tools,
              engineering productivity software,
              engineering performance software,
              engineering efficiency software,
              engineering productivity tools,
              engineering performance tools,
              engineering efficiency tools"
          />
          <meta property="og:title" content="SyncPulse" />
          <meta property="og:description" content="Engineering management software" />
          <meta property="og:image" content="/sample-image.png" />
          <meta property="og:url" content="https://getsyncpulse.co" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/icon.svg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
