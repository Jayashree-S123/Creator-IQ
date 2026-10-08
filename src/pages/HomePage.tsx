import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  Share2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Video,
  FileSpreadsheet,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreatorAuth } from '@/contexts/CreatorAuthContext';

export default function HomePage() {
  const { user } = useCreatorAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground">
      {/* Navigation Bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              Creator<span className="text-primary font-black">IQ</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#analytics" className="hover:text-foreground transition-colors">Analytics</a>
            <a href="#sponsorships" className="hover:text-foreground transition-colors">Sponsorships</a>
            <a href="#revenue" className="hover:text-foreground transition-colors">Revenue</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/dashboard">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-sm font-medium">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/register">
                    <span>Start Free Trial</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden border-b border-border bg-gradient-to-b from-background to-card/40">
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-fade-in">
            <Zap className="w-3.5 h-3.5" />
            <span>Next-Gen Intelligence for Professional Creators</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight md:leading-none mb-6">
            Turn Audience Attention Into <br />
            <span className="text-primary">Predictable Creator Revenue</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
            Unified multi-platform analytics, live sponsorship pipeline tracking, and automated revenue insights for creators scaling their media business.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto text-base px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Link to={user ? "/dashboard" : "/register"}>
                <span>Explore Live Demo Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base px-8 py-6 border-border hover:bg-muted">
              <Link to="/login">
                <span>Sign in with Demo Account</span>
              </Link>
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 pt-12 border-t border-border/80 text-left">
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-foreground">2.4M+</div>
              <div className="text-xs text-muted-foreground mt-1">Total Audience Reach</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-primary">$18.5k</div>
              <div className="text-xs text-muted-foreground mt-1">Average Monthly GMV</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-foreground">5 Platforms</div>
              <div className="text-xs text-muted-foreground mt-1">Unified Data Ingestion</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div className="text-xs text-muted-foreground mt-1">Deterministic Accuracy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="outline" className="text-primary border-primary/30 mb-3">Complete Toolkit</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Everything You Need to Run Your Creator Business</h2>
            <p className="text-muted-foreground mt-3">From raw YouTube CTR metrics to closed sponsorship invoices, manage it all in one cohesive dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cross-Platform Content Intelligence</h3>
              <p className="text-sm text-muted-foreground flex-1">
                Real-time tracking of views, watch duration, engagement rates, and top performers across YouTube, Instagram, TikTok, Twitter, and Twitch.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-primary font-medium">
                <span>View Content Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sponsorship Pipeline & Invoicing</h3>
              <p className="text-sm text-muted-foreground flex-1">
                Keep track of brand deals from initial pitch to signed contract, deliverable deadlines, and confirmed payment receipts.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-primary font-medium">
                <span>View Sponsorships</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Media Kit & Executive Reports</h3>
              <p className="text-sm text-muted-foreground flex-1">
                Generate clean, branded performance reports in CSV, JSON, or printable PDF formats ready to send to sponsors and brand partners.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-primary font-medium">
                <span>Generate Reports</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-16 bg-card/60">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Ready to upgrade your creator workflows?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of modern digital creators who rely on CreatorIQ for daily analytics and brand management.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" asChild className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/register">Create Creator Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/dashboard">Instant Live Dashboard Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="mt-auto border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">CreatorIQ</span>
            <span>© 2026 CreatorIQ Media Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-foreground">Login</Link>
            <Link to="/register" className="hover:text-foreground">Register</Link>
            <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}