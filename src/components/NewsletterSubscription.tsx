
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight } from 'lucide-react';
import { useNewsletter } from '@/hooks/useNewsletter';

export const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [hpValue, setHpValue] = useState('');
  const { subscribe, loading } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check: if the hidden field is filled, it's likely a bot
    if (hpValue) {
      // Silently "succeed" without actually subscribing
      setEmail('');
      setHpValue('');
      return;
    }

    if (!email) return;
    
    const result = await subscribe(email);
    if (result.success) {
      setEmail('');
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100/50 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-green-100 rounded-xl">
          <Mail className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Stay Updated</h3>
          <p className="text-slate-600 text-sm">Get the latest eco-friendly products and tips</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-3">
        {/* Honeypot field - hidden from users but seen by bots */}
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            name="hp_newsletter"
            tabIndex={-1}
            autoComplete="off"
            value={hpValue}
            onChange={(e) => setHpValue(e.target.value)}
          />
        </div>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border-slate-200 focus:border-green-400 focus:ring-green-400/20 bg-white/80 backdrop-blur-sm"
          required
        />
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};
