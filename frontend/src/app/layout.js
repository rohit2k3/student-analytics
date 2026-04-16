import { Space_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import Providers from "../components/providers";

const displaySans = Space_Grotesk({
  variable: "--font-display-sans",
  subsets: ["latin"],
});

const bodySerif = Source_Serif_4({
  variable: "--font-body-serif",
  subsets: ["latin"],
});

export const metadata = {
  title: "Student Performance Analyzer",
  description: "Analyze semester outcomes, get AI recommendations, and improve next-sem performance.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${displaySans.variable} ${bodySerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
