
import React, { useState, useMemo } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Mail, Lock, User, ShoppingCart, Shield, Sparkles, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  const checks = {
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    length: password.length >= 8,
  };
  
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const strength = (passedChecks / 5) * 100;
  
  let label = 'Very Weak';
  let color = 'bg-destructive';
  
  if (strength >= 100) {
    label = 'Strong';
    color = 'bg-primary';
  } else if (strength >= 80) {
    label = 'Good';
    color = 'bg-emerald-500';
  } else if (strength >= 60) {
    label = 'Fair';
    color = 'bg-yellow-500';
  } else if (strength >= 40) {
    label = 'Weak';
    color = 'bg-orange-500';
  }
  
  return { checks, strength, label, color };
};

const Auth = () => {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const passwordStrength = useMemo(() => checkPasswordStrength(signupPassword), [signupPassword]);

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
      logger.error('Sign in error:', error);
      setError("Invalid email or password");
      toast.error("Invalid email or password");
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
    const password = signupPassword;
    const fullName = formData.get('fullName') as string;

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Strong password validation
    const { checks } = passwordStrength;
    if (!checks.lowercase || !checks.uppercase || !checks.digit || !checks.symbol || !checks.length) {
      setError('Weak Password - Include uppercase, lowercase, digit and symbol (min 8 chars)');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      logger.error('Sign up error:', error);
      // Check for weak password error from Supabase
      if (error.message?.toLowerCase().includes('password')) {
        setError('Weak Password');
        toast.error('Weak Password');
      } else {
        setError("Could not create account");
        toast.error('Sign up failed. Please try again.');
      }
    } else {
      toast.success('Account created! Please check your email to verify your account.');
      setConfirmPassword('');
      setSignupPassword('');
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        // Log the actual error for debugging, but keep the UI message generic
        logger.error('Password reset attempt error:', error);
      }

      // Always show generic success message to prevent account enumeration
      toast.success('If an account exists with this email, a reset link has been sent.');
      setShowResetPassword(false);
      setResetEmail('');
    } catch (err) {
      logger.error('Password reset unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-green-400 rounded-full blur-2xl" />
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo with white background */}
          <div className="mb-8 flex flex-col items-center">
            <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
              <img 
                src="/favicon.png" 
                alt="Alphadom Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Alphadom</h1>
            <p className="text-green-100 text-lg mt-2">Your Online Marketplace</p>
          </div>

          {/* Features for everyone */}
          <div className="space-y-6 max-w-sm">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Great Prices</h3>
                <p className="text-sm text-green-100">Affordable products for everyone</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Verified Vendors</h3>
                <p className="text-sm text-green-100">Shop with confidence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Start Selling Today</h3>
                <p className="text-sm text-green-100">Turn your hustle into income</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex flex-col items-center">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                <img 
                  src="/favicon.png" 
                  alt="Alphadom Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Alphadom</h1>
              <p className="text-gray-600 text-sm">Your Online Marketplace</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 sm:p-8">
            {/* Error Alert - Fixed position to prevent layout shift */}
            <div className="min-h-[48px] mb-4">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in duration-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
              <p className="text-gray-600 text-sm mt-1">
                Sign in to start shopping or selling
              </p>
            </div>

            <Tabs defaultValue="signin" className="w-full" onValueChange={() => setError('')}>
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
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="Create a strong password"
                        className="pl-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {signupPassword && (
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2">
                          <Progress value={passwordStrength.strength} className={`h-2 ${passwordStrength.color}`} />
                          <span className={`text-xs font-medium ${
                            passwordStrength.strength >= 100 ? 'text-primary' :
                            passwordStrength.strength >= 60 ? 'text-yellow-600' : 'text-destructive'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                          <div className={`flex items-center gap-1 ${passwordStrength.checks.lowercase ? 'text-primary' : 'text-muted-foreground'}`}>
                            {passwordStrength.checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Lowercase
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.checks.uppercase ? 'text-primary' : 'text-muted-foreground'}`}>
                            {passwordStrength.checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Uppercase
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.checks.digit ? 'text-primary' : 'text-muted-foreground'}`}>
                            {passwordStrength.checks.digit ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Number
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.checks.symbol ? 'text-primary' : 'text-muted-foreground'}`}>
                            {passwordStrength.checks.symbol ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            Symbol
                          </div>
                          <div className={`flex items-center gap-1 ${passwordStrength.checks.length ? 'text-primary' : 'text-muted-foreground'}`}>
                            {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                            8+ characters
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    By creating an account, you agree to our{' '}
                    <Link to="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </div>

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
