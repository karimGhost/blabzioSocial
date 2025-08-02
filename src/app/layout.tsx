// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Titlebar from '@/components/Titlebar';
import Script from 'next/script';
import Head from 'next/head';
export const metadata: Metadata = {
  title: 'Blabzio',
  description: 'Connect and Share with Blabzio',
  metadataBase: new URL("https://blabzio.vercel.app"),
  openGraph: {
    title: "Blabzio - chat-connect-Socialize.",
    description: "Check out this awesome post!",
    url: "https://blabzio.vercel.app",
    images: ["/icons/android-chrome-192x192.png"],
    siteName: "Blabzio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blabzio",
    description: "Messaging connect Social.",
    images: ["/icons/android-chrome-192x192.png"],
  },
  themeColor: "#0f0f0f",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        {/* Dark Mode Script */}
        <Script id="theme-toggle" strategy="beforeInteractive">
          {`
            (function () {
              try {
                const theme = localStorage.getItem("theme");
                if (theme === "dark" || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (_) {}
            })();
          `}
        </Script>
      </Head>
      <body className="font-body antialiased">
        
        <div style={{marginRight:"100px"}}>
         <Titlebar />

          </div>    
                <main className='pt-titlebar' style={{ marginBottom:"100px", paddingTop: 'env(titlebar-area-height, 30px)' }}>

        <AuthProvider>
      
          {children}
        </AuthProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
