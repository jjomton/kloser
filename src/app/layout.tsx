import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Kloser - AI 결합 지인추천 캠페인 SaaS",
    template: "%s | Kloser"
  },
  description: "멀티테넌트 환경에서 추천 링크 생성, 전환 추적, 보상 계산, AI 카피 생성까지 end-to-end 지인추천 캠페인 플랫폼",
  keywords: ["지인추천", "리퍼럴", "캠페인", "AI", "마케팅", "SaaS", "추천 프로그램", "고객 확보"],
  authors: [{ name: "Kloser Team" }],
  creator: "Kloser Team",
  publisher: "Kloser",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kloser.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Kloser - AI 결합 지인추천 캠페인 SaaS",
    description: "지인추천 캠페인을 AI로 최적화하세요. 추천 링크 생성부터 전환 추적, 보상 계산까지 모든 것을 자동화합니다.",
    url: 'https://kloser.app',
    siteName: 'Kloser',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Kloser - AI 결합 지인추천 캠페인 SaaS',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kloser - AI 결합 지인추천 캠페인 SaaS',
    description: '지인추천 캠페인을 AI로 최적화하세요',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
