import { ClerkProvider } from "@clerk/nextjs";
import { light } from "@clerk/themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Kanit } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ClientLayout from "./components/ClientLayout";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "Inherit",
  description: "Inherit: A Unified Learning & Coding Platform",
  openGraph: {
    type: "website",
    url: "https://inherit-xtradrill.vercel.app",
    title: "Inherit",
    description: "Inherit: A Unified Learning & Coding Platform",
    image:
      "https://raw.githubusercontent.com/takitajwar17/inherit/refs/heads/main/public/inherit.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: light,
      }}
    >
      <html lang="en">
        <head>
          <meta property="og:type" content={metadata.openGraph.type} />
          <meta property="og:url" content={metadata.openGraph.url} />
          <meta property="og:title" content={metadata.openGraph.title} />
          <meta
            property="og:description"
            content={metadata.openGraph.description}
          />
          <meta property="og:image" content={metadata.openGraph.image} />
        </head>
        <body className={kanit.className}>
          {/* Retain ClientLayout to manage conditional Sidebar rendering */}
          <ClientLayout>
            <main>
              {/* Keep the new background styling from the incoming changes */}
              <div className="flex items-start justify-center min-h-screen min-w-full">
                <div className="w-full h-full">{children}</div>
              </div>
            </main>
          </ClientLayout>
          <ToastContainer />
          <Analytics />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
