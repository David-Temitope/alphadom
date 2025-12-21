
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, User, ShoppingCart, Shield, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      toast.error('Sign in failed: ' + error.message);
    } else {
      toast.success('Welcome back!');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      setError(error.message);
      toast.error('Sign up failed: ' + error.message);
    } else {
      toast.success('Account created! Please check your email to verify your account.');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await resetPassword(resetEmail);
    
    if (error) {
      setError(error.message);
      toast.error('Password reset failed: ' + error.message);
    } else {
      toast.success('Password reset email sent! Please check your inbox.');
      setShowResetPassword(false);
      setResetEmail('');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-400 rounded-full blur-2xl" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center">
            <img 
              src="/favicon.png" 
              alt="Alphadom Logo" 
              className="w-24 h-24 mb-4"
            />
            <h1 className="text-5xl font-bold tracking-tight">Alphadom</h1>
            <p className="text-green-100 text-lg mt-2">Your Trusted Online Marketplace</p>
          </div>

          {/* Features */}
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">500K+ Sellers</h3>
                <p className="text-sm text-green-100">Join Africa's growing marketplace</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Secure Payments</h3>
                <p className="text-sm text-green-100">Protected transactions always</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Curated Products</h3>
                <p className="text-sm text-green-100">Quality verified listings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-background p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex flex-col items-center">
              <img 
                src="/favicon.png" 
                alt="Alphadom Logo" 
                className="w-16 h-16 mb-3"
              />
              <h1 className="text-3xl font-bold text-foreground">Alphadom</h1>
              <p className="text-muted-foreground text-sm">Your Trusted Online Marketplace</p>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-lg p-6 sm:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Sign in to continue shopping
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="rounded-lg">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                {!showResetPassword ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      className="text-sm text-green-600 hover:underline w-full text-center"
                    >
                      Forgot password?
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We'll send you a link to reset your password
                      </p>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPassword(false);
                        setError('');
                      }}
                      className="text-sm text-green-600 hover:underline w-full text-center"
                    >
                      Back to sign in
                    </button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a password"
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          {/* Legal Links */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Protected by industry-standard encryption</p>
            <div className="flex justify-center gap-4 mt-2">
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            </div>
            <p className="mt-2">© 2025 Alphadom. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
