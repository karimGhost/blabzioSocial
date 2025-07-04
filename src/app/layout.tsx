import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
export const metadata: Metadata = {
  title: 'Blabzio',
  description: 'Connect and Share with Blabzio',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Blabzio",
              url: "https://Blabzio-social.vercel.app",
              telephone: "+254113287002",
              address: {
                "@type": "PostalAddress",
                addressCountry: "KE",
              },
              description: "Connect and Share with Blabzio",
            }),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      
          <link rel="manifest" href="/manifest.json" />
  

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

          <title>

    Blabzio
  </title>

              <meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>

  <meta name="description" content="Messaging connect Social." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://magnetics-social.vercel.app" />
        <meta name="theme-color" content="#ffffff" />
      
      </head>
      <body className="font-body antialiased">
      <AuthProvider>
        {children}
        </AuthProvider>  
        <Toaster />
              </body>
    </html>
  );
}
