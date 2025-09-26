import Script from "next/script";

const GoogleAnalytics = ({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID?: string }) => {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js? 
        id=${GA_MEASUREMENT_ID}`}
      ></Script>
      <Script
        id="google-analytics"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      ></Script>
    </>
  );
};

export default GoogleAnalytics;