// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Titlebar from '@/components/Titlebar';
import Script from 'next/script';
import Head from 'next/head';
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
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
     <head>
       <script
    dangerouslySetInnerHTML={{
      __html: `
        try {
          const storedTheme = localStorage.getItem('darkmode');
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (_) {}
      `,
    }}
  />
      </head>
      <body className="font-body antialiased">
                <ServiceWorkerRegister />

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
