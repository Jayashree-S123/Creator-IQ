import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Lock, Mail, User, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useCreatorAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [category, setCategory] = useState('Tech & Gadgets');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full or creator name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      category
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success('Registration successful! Welcome to CreatorIQ.');
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.error || 'Failed to create account.');
      toast.error(res.error || 'Registration failed');
    }
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
        <p className="text-sm text-muted-foreground">Create your free creator business account</p>
      </div>

      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl font-bold">Register Account</CardTitle>
          <CardDescription>
            Join CreatorIQ to unify your metrics and brand partnerships
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
              <Label htmlFor="name">Creator / Channel Name</Label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Jordan Ellis Tech"
                  className="pl-9"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jordan@creator.media"
                  className="pl-9"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Primary Niche / Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="bg-background">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="Tech & Gadgets">Tech & Gadgets</SelectItem>
                  <SelectItem value="Gaming & Esports">Gaming & Esports</SelectItem>
                  <SelectItem value="Lifestyle & Vlog">Lifestyle & Vlog</SelectItem>
                  <SelectItem value="Finance & Investing">Finance & Investing</SelectItem>
                  <SelectItem value="Education & How-To">Education & How-To</SelectItem>
                  <SelectItem value="Fitness & Wellness">Fitness & Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (min 6 characters)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Complete Registration'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <div>
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
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