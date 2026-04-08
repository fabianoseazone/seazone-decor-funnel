import { ArrowRight, Star, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-interior.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#d6e8f0]">
      {/* Background Image with Blend */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Interior de Luxo"
          className="w-full h-full object-cover opacity-90"
        />
        {/* Very light overlay — just enough for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a5c]/30 via-[#1a3a5c]/8 to-transparent" />
      </div>

      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-seazone-coral/12 blur-[120px] animate-[drift_20s_ease-in-out_infinite]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-seazone-coral/8 blur-[100px] animate-[drift_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-white/5 blur-[80px] animate-[drift_30s_ease-in-out_infinite]" />
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 right-[15%] w-32 h-32 border border-white/10 rounded-full animate-float" />
        <div className="absolute bottom-32 right-[25%] w-20 h-20 border border-seazone-coral/20 rounded-full" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-[10%] w-2 h-2 bg-seazone-coral rounded-full animate-pulse" />
        <div className="absolute top-[45%] right-[20%] w-1.5 h-1.5 bg-seazone-coral rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-[40%] right-[12%] w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
        
        {/* Diagonal lines */}
        <div className="absolute top-0 right-1/3 w-px h-[40vh] bg-gradient-to-b from-transparent via-white/10 to-transparent transform rotate-12" />
        <div className="absolute bottom-0 right-1/4 w-px h-[30vh] bg-gradient-to-t from-transparent via-seazone-coral/20 to-transparent transform -rotate-12" />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(10,22,40,0.08)_100%)]" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 z-10">
        <div className="max-w-3xl">
          {/* Animated badge with glow */}
          <div className="inline-flex mb-8">
            <Badge className="relative bg-white/10 border-white/20 text-primary-foreground px-5 py-2.5 text-sm backdrop-blur-sm">
              <span className="absolute inset-0 rounded-full bg-seazone-coral/20 blur-md" />
               <Star className="w-4 h-4 mr-2 text-seazone-coral relative z-10" />
               <span className="relative z-10">Solução Design que Valoriza</span>
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-primary-foreground mb-8 leading-[0.95] tracking-tight">
            Seu Imóvel Pronto Para{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-seazone-coral via-white to-seazone-coral bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_25s_ease-in-out_infinite]">
                Operar em Alta
              </span>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl leading-relaxed font-light">
            Seu spot tem potencial único. A Seazone Decor trabalha para que ele alcance 
            sua máxima capacidade desde o primeiro dia de operação, com gestão transparente e entrega precisa.
          </p>

          {/* Trust Pillars - Redesigned */}
          <div className="flex flex-wrap gap-4 mb-12">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Performance Maximizada</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Operação Imediata</span>
            </div>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium">Sem Sustos no Caminho</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="xl" asChild>
              <a href="#packages">
                Conhecer Planos Decor
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Button variant="coral" size="xl" asChild>
              <a href="#client-access">
                Contratar Decor
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Stats Card - Glassmorphism */}
      <div className="absolute bottom-8 right-8 hidden lg:block animate-float">
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-seazone-coral/40 to-seazone-coral/20 rounded-3xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          
          <div className="relative bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-br from-seazone-coral to-white bg-clip-text text-transparent">60 dias</div>
                <p className="text-xs text-white/60 font-medium">Para Operar</p>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="text-center">
                <div className="text-3xl font-bold text-seazone-success">+54%</div>
                <p className="text-xs text-white/60 font-medium">Faturamento</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="absolute bottom-0 left-0 w-1/3 h-32 bg-gradient-to-r from-seazone-coral/10 to-transparent" />
      <div className="absolute top-0 right-0 w-1/4 h-24 bg-gradient-to-l from-seazone-coral/5 to-transparent" />
    </section>
  );
}
