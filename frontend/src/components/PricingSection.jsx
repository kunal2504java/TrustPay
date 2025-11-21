import { useState } from 'react';
import { CheckIcon } from './Icons';

const PricingSection = ({ onLogin }) => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for freelancers and individuals getting started with secure payments",
      price: 0,
      yearlyPrice: 0,
      buttonText: "Get Started Free",
      popular: false,
      features: [
        "Up to 10 escrows/month",
        "2% transaction fee",
        "Basic UPI integration",
        "Email support",
        "Blockchain proof of transactions",
        "7-day escrow duration"
      ]
    },
    {
      name: "Business",
      description: "Best for growing businesses and small merchants needing advanced features",
      price: 999,
      yearlyPrice: 9999,
      buttonText: "Start Business Plan",
      popular: true,
      features: [
        "Unlimited escrows",
        "1.5% transaction fee",
        "Priority UPI processing",
        "24/7 priority support",
        "Advanced blockchain analytics",
        "Custom escrow duration",
        "API access",
        "Webhook integrations"
      ]
    },
    {
      name: "Enterprise",
      description: "Advanced solution for platforms and large teams with custom requirements",
      price: 4999,
      yearlyPrice: 49999,
      buttonText: "Contact Sales",
      popular: false,
      features: [
        "Everything in Business, plus:",
        "1% transaction fee",
        "Dedicated account manager",
        "Custom integration support",
        "White-label options",
        "SLA guarantees",
        "Advanced fraud protection",
        "Custom compliance features"
      ]
    }
  ];

  return (
    <section className="py-20 px-6 bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-700 rounded-full filter blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-800 rounded-full filter blur-[128px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-white mb-4" style={{ fontFamily: 'Clash Grotesk', fontWeight: 500 }}>
            Plans that work best for you
          </h2>
          <p className="text-xl text-gray-300 mb-8" style={{ fontFamily: 'Clash Grotesk', fontWeight: 200 }}>
            Trusted by thousands. Choose the perfect plan for your needs.
          </p>

          {/* Pricing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="relative flex bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full p-1">
              <button
                onClick={() => setIsYearly(false)}
                className={`relative z-10 px-8 py-2.5 rounded-full font-medium transition-all ${
                  !isYearly ? 'text-white' : 'text-gray-400'
                }`}
              >
                {!isYearly && (
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full shadow-lg shadow-gray-500/50"></span>
                )}
                <span className="relative">Monthly</span>
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`relative z-10 px-8 py-2.5 rounded-full font-medium transition-all ${
                  isYearly ? 'text-white' : 'text-gray-400'
                }`}
              >
                {isYearly && (
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full shadow-lg shadow-gray-500/50"></span>
                )}
                <span className="relative flex items-center gap-2">
                  Yearly
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                    Save 17%
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50 border-2 border-gray-500 shadow-2xl shadow-gray-500/30 scale-105'
                  : 'bg-gray-800/30 backdrop-blur-sm border border-gray-700 hover:border-gray-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

                {/* Price */}
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-white">
                    ₹{isYearly ? plan.yearlyPrice.toLocaleString() : plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 ml-2">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={onLogin}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white hover:shadow-xl hover:shadow-gray-500/50 hover:scale-105'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-gray-700">
                <h4 className="font-semibold text-white mb-4">
                  {plan.name === 'Starter' ? 'Free includes:' : 
                   plan.name === 'Business' ? 'Everything in Starter, plus:' : 
                   'Everything in Business, plus:'}
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-600/20 flex items-center justify-center mt-0.5">
                        <CheckIcon className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Need a custom plan? We're here to help.
          </p>
          <button
            onClick={onLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            Contact our sales team →
          </button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
