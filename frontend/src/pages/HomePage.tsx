import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import StatsStrip from '@/components/home/StatsStrip'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import LiveDemoSection from '@/components/home/LiveDemoSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import ExportSection from '@/components/home/ExportSection'
import FaqSection from '@/components/home/FaqSection'
import CtaSection from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <StatsStrip />
        <HowItWorksSection />
        <LiveDemoSection />
        <FeaturesSection />
        <ExportSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
