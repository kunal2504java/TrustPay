import Aurora from '../components/Aurora/Aurora';
import AnimatedText from '../components/AnimatedText';
import BubbleMenu from '../components/BubbleMenu/BubbleMenu';
import PixelCard from '../components/PixelCard/PixelCard';
import LogoLoop from '../components/LogoLoop/LogoLoop';
import PricingSection from '../components/PricingSection';
import { ReactLogo, ViteLogo, TailwindLogo, NodeLogo, PolygonLogo, SolanaLogo, AvalancheLogo } from '../components/TechLogos';
import { ShieldCheckIcon, UsersIcon, StoreIcon, GlobeIcon, HeartIcon, UserIcon, IndianRupeeIcon, FileTextIcon } from '../components/Icons';

const LandingHeader = ({ onLogin }) => {
  const menuItems = [
    {
      label: 'About',
      href: '#404',
      ariaLabel: 'About',
      rotation: -8,
      hoverStyles: { bgColor: '#4F46E5', textColor: '#ffffff' }
    },
    {
      label: 'Vision',
      href: '#404',
      ariaLabel: 'Vision',
      rotation: 8,
      hoverStyles: { bgColor: '#7C3AED', textColor: '#ffffff' }
    },
    {
      label: 'Contact',
      href: '#404',
      ariaLabel: 'Contact',
      rotation: -8,
      hoverStyles: { bgColor: '#3A29FF', textColor: '#ffffff' }
    },
    {
      label: 'API/SDK',
      href: '#404',
      ariaLabel: 'API and SDK Documentation',
      rotation: 8,
      hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' }
    }
  ];

  return (
    <BubbleMenu
      logo={
        <div className="flex items-center space-x-2 text-white">
          <ShieldCheckIcon className="w-5 h-5" />
          <span className="font-black text-lg">TrustPay</span>
        </div>
      }
      items={menuItems}
      menuAriaLabel="Toggle navigation"
      menuBg="rgba(255, 255, 255, 0.1)"
      menuContentColor="#ffffff"
      useFixedPosition={true}
      animationEase="back.out(1.5)"
      animationDuration={0.5}
      staggerDelay={0.12}
    />
  );
};

const HeroSection = ({ onLogin }) => {
  return (
    <section className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-black">
      <Aurora 
        colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
        blend={0.5}
        amplitude={1.0}
        speed={0.5}
      />
      
      <div className="flex-1 flex items-center justify-center relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center text-white pt-20">
          <AnimatedText 
            text="TrustPay" 
            className="text-6xl md:text-8xl font-black mb-6"
            delay={0.05}
          />
          
          <h2 className="text-3xl md:text-4xl font-light mb-4">
            UPI Payments You Can Actually Trust.
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-white/90">
            The trust layer for India's payments. Pay safely, get paid confidently.
          </p>
          <button 
            onClick={onLogin}
            className="bg-white text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Create Your First Escrow
          </button>
        </div>
      </div>
    </section>
  );
};

const TechStackBanner = () => {
  const techLogos = [
    { node: <ReactLogo />, title: 'React' },
    { node: <ViteLogo />, title: 'Vite' },
    { node: <TailwindLogo />, title: 'Tailwind CSS' },
    { node: <NodeLogo />, title: 'Node.js' },
    { node: <PolygonLogo />, title: 'Polygon' },
    { node: <SolanaLogo />, title: 'Solana' },
    { node: <AvalancheLogo />, title: 'Avalanche' }
  ];

  return (
    <div className="relative -mt-16 mb-4 z-20 bg-transparent">
      <div className="flex items-center justify-center py-6 bg-transparent">
        <div className="w-full max-w-2xl bg-transparent">
          <div className="opacity-40 hover:opacity-70 transition-opacity duration-300 bg-transparent">
            <LogoLoop
              logos={techLogos}
              speed={50}
              direction="left"
              logoHeight={28}
              gap={60}
              pauseOnHover
              fadeOut
              fadeOutColor="transparent"
              ariaLabel="Technology stack and supported blockchains"
              className="text-white bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerShowcase = () => {
  const personas = [
    {
      title: 'Freelancer',
      role: 'Tech Freelancer',
      description: 'Needs payment assurance before delivering work to new clients. Mobile-first, uses UPI daily.',
      icon: <UsersIcon />,
      variant: 'blue'
    },
    {
      title: 'Small Merchant',
      role: 'D2C Store Owner',
      description: 'Runs an online store and wants to accept pre-orders without fraud risk. Low tolerance for extra steps.',
      icon: <StoreIcon />,
      variant: 'purple'
    },
    {
      title: 'Platform Owner',
      role: 'Marketplace Owner',
      description: 'Wants to offer escrow-backed payments to build trust on his platform. Seeks seamless UPI integration.',
      icon: <GlobeIcon />,
      variant: 'yellow'
    },
    {
      title: 'NGO Finance Lead',
      role: 'NGO Finance Manager',
      description: 'Needs verifiable receipts for donor transparency. Requires secure, traceable payment solutions.',
      icon: <HeartIcon />,
      variant: 'pink'
    }
  ];

  return (
    <section id="about" className="py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-gray-900">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
          Who We Protect
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {personas.map((persona, index) => (
            <PixelCard key={index} variant={persona.variant} className="w-full max-w-[300px]">
              <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                <div>
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 text-white">
                    {persona.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{persona.title}</h3>
                  <p className="text-sm font-semibold text-indigo-300 mb-3">{persona.role}</p>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {persona.description}
                </p>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  );
};

const CreateEscrowTeaser = ({ onLogin }) => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.3}
          amplitude={0.5}
          speed={0.3}
        />
      </div>
      
      <div className="max-w-xl mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
          Simple. Secure. Seamless.
        </h2>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white mb-2.5">
                Payee's UPI ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value="freelancer@okbank"
                  disabled
                  className="w-full pl-11 pr-4 py-3.5 border-0 rounded-lg bg-white/5 text-gray-300 placeholder-gray-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2.5">
                Amount (INR)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <IndianRupeeIcon className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value="5,000"
                  disabled
                  className="w-full pl-11 pr-4 py-3.5 border-0 rounded-lg bg-white/5 text-gray-300 placeholder-gray-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2.5">
                Purpose
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-0 pl-4 pointer-events-none text-gray-500">
                  <FileTextIcon className="w-4 h-4" />
                </div>
                <textarea 
                  rows="3"
                  value="UI design milestone 1"
                  disabled
                  className="w-full pl-11 pr-4 py-3.5 border-0 rounded-lg bg-white/5 text-gray-300 placeholder-gray-500 resize-none"
                />
              </div>
            </div>
            
            <button 
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-indigo-500/30 transition-all transform hover:scale-[1.02] mt-6"
            >
              Get Started to Create
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const LandingFooter = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-16 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div id="vision">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Our Vision
            </h3>
            <p className="text-gray-300 leading-relaxed">
              At TrustPay, we envision a future where every digital transaction in India is secure, transparent, and trustworthy. We're building the infrastructure that empowers freelancers, merchants, and everyday users to transact with complete confidence through UPI-based escrow services.
            </p>
          </div>
          
          <div id="contact">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Contact Us
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center gap-2">
                <span className="text-indigo-400">📧</span> kunalpsingh25@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <span className="text-purple-400">📞</span> +91 90058 10309
              </p>
              <p className="flex items-center gap-2">
                <span className="text-pink-400">📍</span> Greater Noida, Uttar Pradesh, India
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-gray-400">
          <p>© 2025 TrustPay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default function LandingPage({ onLogin }) {
  return (
    <div>
      <LandingHeader onLogin={onLogin} />
      <HeroSection onLogin={onLogin} />
      <TechStackBanner />
      <CustomerShowcase />
      <CreateEscrowTeaser onLogin={onLogin} />
      <PricingSection onLogin={onLogin} />
      <LandingFooter />
    </div>
  );
}
