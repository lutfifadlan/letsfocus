import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Grape+Nuts&family=Poppins:wght@300;400;600&family=Work+Sans:wght@300;400;600&family=Bricolage+Grotesque:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
          {process.env.NODE_ENV === 'production' && (
            <>
              <script async src="https://cdn.seline.so/seline.js" data-token="070947bcbabaef4"></script>
              <script defer src="https://cloud.umami.is/script.js" data-website-id="46873c0d-9b3b-4209-91f1-41856d7120b3"></script>
              <script src="https://autoback.link/autobacklink.js?ref=letsfocus.today" defer async></script>
            </>
          )}
          <meta name="google-site-verification" content="bzX0de0J2dmI32xsLO5RcRb8dN5YzDW2WKZXv8cAMxY" />
          <meta name="description" content="Let's Focus is a modern todo list app that helps you focus on what matters most." />
          <meta
            name="keywords"
            content="
              productivity app,
              todo list,
              todolist,
              todo list app,
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
          <meta property="og:description" content="Let's Focus is a modern todo list app that helps you focus on what matters most." />
          <meta property="og:image" content="/logo.png" />
          <meta property="og:url" content="https://letsfocus.today" />
          <meta property="og:type" content="website" />
          <link rel="icon" href="/logo.png" />
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
