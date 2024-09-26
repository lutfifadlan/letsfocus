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
          <meta name="description" content="Let's Focus is an all-in-one productivity app that helps you focus on what matters most." />
          <meta
            name="keywords"
            content="
              letsfocus,
              lets focus,
              focus,
              productivity,
              focus app,
              focus tracker,
              focus timer,
              focus pomodoro,
              focus productivity,
            "
          />
          <meta property="og:title" content="Let's Focus" />
          <meta property="og:description" content="All-in-one productivity app" />
          <meta property="og:image" content="/logo.svg" />
          <meta property="og:url" content="https://letsfocus.today" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/logo.svg" />
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
