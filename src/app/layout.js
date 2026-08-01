import { Geist, Geist_Mono, Sacramento, Outfit, Great_Vibes } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/utilities.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const sacramento = Sacramento({
  variable: "--font-sacramento",
  weight: "400",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
});

export const metadata = {
  title: "Servify",
  description: "FYP - Professional Home Services",
  manifest: "/manifest.js",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Servify",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${sacramento.variable} ${greatVibes.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}