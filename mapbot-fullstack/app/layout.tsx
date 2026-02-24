import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MapBot — Mobility AI Agent | MaaS Platform',
  description: '카카오맵 기반 MaaS/DRT 모빌리티 AI 에이전트 플랫폼. 실시간 대중교통, DRT 배차, LaaS 서비스.',
  keywords: ['MaaS', 'DRT', 'MapBot', '모빌리티', '카카오맵', '대중교통', '포항'],
  openGraph: {
    title: 'MapBot — Mobility AI Agent',
    description: '나만의 모빌리티 AI 에이전트',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-[#e8e8f0] min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
