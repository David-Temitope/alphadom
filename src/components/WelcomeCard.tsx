import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import welcomeImage from '@/assets/welcome-alphadom.png';

export const WelcomeCard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const checkFirstVisit = async () => {
      if (!user) return;

      // Check localStorage for first visit flag
      const hasSeenWelcome = localStorage.getItem(`alphadom_welcome_${user.id}`);
      
      if (!hasSeenWelcome) {
        // Fetch user's name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]); // Get first name
        } else {
          setUserName('Friend');
        }

        // Show welcome card after a short delay
        setTimeout(() => {
          setIsOpen(true);
        }, 1500);
      }
    };

    checkFirstVisit();
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`alphadom_welcome_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent">
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white rounded-full shadow-md"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Welcome Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={welcomeImage}
              alt="Welcome to Alphadom"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-6 pt-2 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {userName}! 🎉
              </h2>
              <p className="text-gray-600 mt-2">
                We're thrilled to have you join the Alphadominity community!
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Connect with us to get the most out of Alphadom:
              </p>

              {/* Discord */}
              <a
                href="https://discord.gg/9nKy89ww"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Join Discord</p>
                  <p className="text-xs text-gray-500">Disputes, questions, connect with vendors</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://whatsapp.com/channel/0029VbBMmq2G8l5Nl5k5r201"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">WhatsApp Channel</p>
                  <p className="text-xs text-gray-500">News and updates</p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/share/16WJUWkNS6/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Follow on Facebook</p>
                  <p className="text-xs text-gray-500">Build the Alphadominity community</p>
                </div>
              </a>
            </div>

            <p className="text-xs text-center text-gray-500">
              Not interested now? You can find these links at the bottom of the page.
            </p>

            <Button
              onClick={handleClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Let's Get Started!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
