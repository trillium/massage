import TestimonialsSection from '@/components/landingPage/TestimonialsSection'
import AboutSection from '@/components/landingPage/AboutSection'
import FeatureHighlightsSection from '@/components/landingPage/FeatureHighlightsSection'
import PricingSection from '@/components/landingPage/PricingSection'
import HowItWorksSection from '@/components/landingPage/HowItWorksSection'
import HeroSection from '@/components/landingPage/HeroSection'
import ContactSection from '@/components/landingPage/ContactSection'
import SectionContainer from '@/components/SectionContainer'
import BookSessionButton from '@/components/BookSessionButton'
import { ServiceAreaSection } from '@/components/landingPage/ServiceAreaSection'

export default function Page({}) {
  return (
    <SectionContainer>
      {/* Nav */}
      <div className="flex flex-col items-center space-y-12 sm:space-y-16 md:space-y-24">
        <HeroSection />
        <FeatureHighlightsSection />
        <AboutSection />
        <ServiceAreaSection />
        <TestimonialsSection />
        <HowItWorksSection />
        <PricingSection />
        <ContactSection />
        <BookSessionButton title="Book a Session!" href="/book" />
      </div>
      {/* Footer */}
    </SectionContainer>
  )
}
