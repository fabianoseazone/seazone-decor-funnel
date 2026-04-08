import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, User, MessageCircle, Presentation } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DemoRequestDialog } from "./DemoRequestDialog";

export function ClientAccessSection() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const handleDemoAccess = () => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      toast.success("Acesso autorizado!", {
        description: "Redirecionando para o configurador...",
      });
      navigate("/bonito-spot");
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    handleDemoAccess();
  };

  return (
    <section className="py-20 px-4 bg-hero" id="client-access">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Info */}
           <div className="text-center lg:text-left">
            
             <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
               Inicie seu Projeto{" "}
               <span className="text-gradient-coral">Design que Valoriza</span>
             </h2>
            
             <p className="text-lg text-primary-foreground/70 mb-8">
               Quer transformar seu imóvel com o padrão Seazone Decor? Mesmo sem ser investidor Spot, você pode contratar nossos planos. Agende uma conversa e receba uma proposta personalizada.
             </p>

            <div className="flex flex-col gap-3">
              <Button 
                variant="glass"
                size="lg" 
                className="w-full"
                onClick={() => setDemoOpen(true)}
              >
                <Presentation className="w-5 h-5 mr-2" />
                Solicite uma Demonstração
              </Button>

              <Button 
                variant="default"
                size="lg" 
                className="w-full bg-seazone-success hover:bg-seazone-success/90 text-white"
                onClick={() => window.open("https://wa.me/5548999999999?text=Olá! Gostaria de saber mais sobre o Seazone Decor.", "_blank")}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar com Consultor via WhatsApp
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-primary-foreground/50">
              Já é investidor Spot? Acesse o configurador ao lado para uma jornada 100% digital.
              </p>
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="max-w-md mx-auto w-full">
            <Badge className="mb-4 bg-white/10 border-white/20 text-primary-foreground mx-auto flex w-fit">
              <User className="w-4 h-4 mr-2" />
              Área do Investidor
            </Badge>
          <Card variant="glass" className="w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-coral-gradient flex items-center justify-center">
                <LogIn className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">
                Acesso Investidor Spot
              </h3>
              <p className="text-muted-foreground">
                Acesse o configurador exclusivo investidor spot e customize sua escolha de pacote. Visualize renders 3D, escolha forma de pagamento e finalize seu contrato em uma experiência 100% digital.
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  variant="coral" 
                  size="lg" 
                  className="w-full"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Entrando..."
                  ) : (
                    <>
                      Acessar Configurador
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  Modo de demonstração
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDemoAccess}
                  disabled={isLoading}
                >
                  Acessar como Visitante
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
      <DemoRequestDialog open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
