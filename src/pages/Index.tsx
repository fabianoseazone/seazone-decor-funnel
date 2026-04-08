import { Toaster } from "@/components/ui/sonner";
import { HeroSection } from "@/components/HeroSection";
import { PackageSelector } from "@/components/PackageSelector";


import { ClientAccessSection } from "@/components/ClientAccessSection";
import { DeliveredSpots } from "@/components/DeliveredSpots";

function Index() {

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Hero */}
      <HeroSection />

      <PackageSelector />
      
      <ClientAccessSection />
      <DeliveredSpots />

      {/* Footer */}
      <footer className="bg-hero py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-primary-foreground mb-2">
                Seazone Decor
              </h3>
               <p className="text-primary-foreground/60 text-sm">
                 Solução Design que Valoriza para Alta Performance
               </p>
            </div>
            <div className="flex gap-8 text-sm text-primary-foreground/60">
              <span>Integração Itaú/Rede</span>
              <span>•</span>
              <span>Sienge ERP</span>
              <span>•</span>
              <span>Arquitetura Profissional</span>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-primary-foreground/40">
            © 2024 Seazone Decor. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Index;
