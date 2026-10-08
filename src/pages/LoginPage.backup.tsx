import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginDemo, user } = useCreatorAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsSubmitting(true);
const res = await login(email, password);
setIsSubmitting(false);

    if (res.success) {
      toast.success('Welcome back to CreatorIQ!');
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Authentication failed.');
      toast.error(res.error || 'Invalid credentials');
    }
  };

  const handleDemoLogin = () => {
    loginDemo();
    toast.success('Logged in as Alex Rivera (Demo Creator)');
    const from = (location.state as { from?: string })?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight">
            Creator<span className="text-primary font-black">IQ</span>
          </span>
        </Link>
        <p className="text-sm text-muted-foreground">Sign in to your creator business dashboard</p>
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials or use the one-click demo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alex@creatoriq.dev"
                  className="pl-9"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-muted-foreground">Demo: creator123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or one-click demo</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-primary/30 hover:bg-primary/10 text-primary font-medium"
            onClick={handleDemoLogin}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Instant Demo Sign In (Alex Rivera)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <div>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </div>
          <Link to="/" className="hover:text-foreground">
            ← Back to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}