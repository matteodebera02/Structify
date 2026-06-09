import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/home/HeroSection'
import HowItWorksSection from '@/components/home/HowItWorksSection'
import LiveDemoSection from '@/components/home/LiveDemoSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import ExportSection from '@/components/home/ExportSection'
import CtaSection from '@/components/home/CtaSection'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <LiveDemoSection />
        <FeaturesSection />
        <ExportSection />
        <CtaSection />
      </main>
    </div>
  )
}
