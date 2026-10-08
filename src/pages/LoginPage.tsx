import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

const ACCOUNTS = [
  {
    label: 'Demo Creator',
    email: 'creator@example.com',
    password: 'creator123',
    description: 'Creator demo account',
    icon: User,
  },
  {
    label: 'Demo Admin',
    email: 'admin@example.com',
    password: 'admin123',
    description: 'Administrator demo account',
    icon: ShieldCheck,
  },
  {
    label: 'My Creator Account',
    email: 'jayashreesathish19@gmail.com',
    password: '',
    description: 'Your CreatorIQ account',
    icon: User,
  },
];

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useCreatorAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user) {
      const from =
        (location.state as { from?: string })?.from || '/dashboard';

      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleAccountSelect = (
    account: typeof ACCOUNTS[number]
  ) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);

    if (account.password) {
      toast.success(
        account.label + ' selected. Email and password filled.'
      );
    } else {
      toast.success(
        'Your Creator account selected. Enter your password.'
      );
    }
  };

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

    try {
      const res = await login(email.trim(), password);

      if (res.success) {
        toast.success('Welcome back to CreatorIQ!');

        const from =
          (location.state as { from?: string })?.from || '/dashboard';

        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Authentication failed.');
        toast.error(res.error || 'Invalid credentials');
      }
    } catch {
      setError('Unable to connect to the CreatorIQ backend.');
      toast.error('Unable to connect to the backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 mb-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>

          <span className="font-extrabold text-2xl tracking-tight">
            Creator<span className="text-primary font-black">IQ</span>
          </span>
        </Link>

        <p className="text-sm text-muted-foreground">
          Sign in to your creator business dashboard
        </p>
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">
            Sign In
          </CardTitle>

          <CardDescription>
            Select an account or enter your credentials manually.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <Label>Available Accounts</Label>

            <div className="grid gap-2">
              {ACCOUNTS.map((account) => {
                const Icon = account.icon;

                const isSelected =
                  email.toLowerCase() === account.email.toLowerCase();

                return (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    onClick={() => handleAccountSelect(account)}
                    className={
                      'w-full h-auto min-h-[58px] justify-start text-left px-3 py-2 ' +
                      (isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5')
                    }
                  >
                    <div
                      className={
                        'w-9 h-9 rounded-lg flex items-center justify-center mr-3 shrink-0 ' +
                        (isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground')
                      }
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">
                        {account.label}
                      </div>

                      <div className="text-xs text-muted-foreground truncate">
                        {account.email}
                      </div>

                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {account.password
                          ? 'Email + password ready'
                          : 'Enter your password'}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Account credentials
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
              </Label>

              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />

                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password
              </Label>

              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-9"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  autoComplete="current-password"
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
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <div>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>

          <Link
            to="/"
            className="hover:text-foreground"
          >
            ← Back to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
