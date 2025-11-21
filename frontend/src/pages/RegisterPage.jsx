import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LiquidChrome from '../components/LiquidChrome/LiquidChrome';

function RegisterPage({ onSwitchToLogin }) {
  const { register, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    vpa: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('RegisterPage: Form submitted');
    setLoading(true);
    setLocalError('');

    // Basic validation
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    console.log('RegisterPage: Calling register...');
    const result = await register(formData);
    console.log('RegisterPage: Register result:', result);
    
    if (!result.success) {
      setLocalError(result.error);
      console.error('RegisterPage: Registration failed:', result.error);
    } else {
      console.log('RegisterPage: Registration successful!');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* LiquidChrome Background */}
      <div className="absolute inset-0 opacity-30" style={{ pointerEvents: 'none' }}>
        <LiquidChrome 
          baseColor={[0.1, 0.1, 0.1]}
          speed={0.2}
          amplitude={0.3}
          frequencyX={2}
          frequencyY={2}
          interactive={true}
        />
      </div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div>
          <h2 className="mt-6 text-center text-4xl text-white" style={{ fontFamily: 'Clash Grotesk', fontWeight: 500 }}>
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400" style={{ fontFamily: 'Clash Grotesk', fontWeight: 200 }}>
            Join TrustPay and start secure transactions
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(localError || error) && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded">
              {localError || error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label htmlFor="vpa" className="block text-sm font-medium text-gray-300 mb-2">
                UPI ID (Optional)
              </label>
              <input
                id="vpa"
                name="vpa"
                type="text"
                value={formData.vpa}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="yourname@upi"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Already have an account? <span className="font-semibold">Sign in</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
