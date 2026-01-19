import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

// Font configuration per Manual Ch 4.2.1
// Inter is specified in globals.css and tailwind.config.ts as the primary font
// Using system font stack with Inter as preferred when available
// This approach avoids build-time network dependency on Google Fonts

export const metadata: Metadata = {
  title: {
    default: "Olera - Find Trusted Elder Care Providers",
    template: "%s | Olera",
  },
  description:
    "Find trusted elder care providers near you. Compare home care, assisted living, memory care, and nursing homes. Read reviews, check pricing, and connect with verified caregivers nationwide.",
  keywords: [
    "elder care",
    "senior care",
    "assisted living",
    "home care",
    "memory care",
    "nursing homes",
    "caregivers",
    "hospice care",
    "respite care",
    "independent living",
    "senior housing",
    "care providers",
  ],
  authors: [{ name: "Olera" }],
  creator: "Olera",
  publisher: "Olera",
  metadataBase: new URL("https://olera.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://olera.com",
    title: "Olera - Find Trusted Elder Care Providers",
    description:
      "Find trusted elder care providers near you. Compare home care, assisted living, memory care, and nursing homes. Read reviews, check pricing, and connect with verified caregivers.",
    siteName: "Olera",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Olera - Elder Care Made Simple",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olera - Find Trusted Elder Care Providers",
    description:
      "Find trusted elder care providers near you. Compare facilities, read reviews, and connect with verified caregivers nationwide.",
    images: ["/og-image.svg"],
    creator: "@olera",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
