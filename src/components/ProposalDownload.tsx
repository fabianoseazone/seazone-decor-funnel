import { Download, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { packages, type PackageType } from "./PackageSelector";
import { toast } from "sonner";

interface ProposalDownloadProps {
  selectedPackage: PackageType;
}

export function ProposalDownload({ selectedPackage }: ProposalDownloadProps) {
  const selectedPkg = packages.find((p) => p.id === selectedPackage)!;

  const handleDownload = () => {
    toast.success("Preparando sua Proposta Inteligente em PDF...", {
      description: "Sua proposta estará pronta para compartilhar no WhatsApp em instantes.",
    });
    
    console.log("PDF Generation Hook - Sienge ERP Integration Point", {
      package: selectedPkg,
      timestamp: new Date().toISOString(),
    });
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `🏠 Seazone Decor - Solução Design que Valoriza\n\n` +
      `📦 Plano: ${selectedPkg.name}\n` +
      `💰 Investimento: R$ ${selectedPkg.price.toLocaleString("pt-BR")}\n\n` +
      `✅ Projeto de Arquitetura GRÁTIS incluso\n` +
      `✅ Parcelamento em até 18x disponível\n` +
      `✅ Imóvel pronto para operar em 60 dias\n\n` +
      `Vamos conversar sobre como acelerar sua operação!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <section className="py-20 px-4 bg-secondary/50" id="proposal">
      <div className="container mx-auto max-w-4xl">
        <Card variant="navy" className="overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-white/10 border-white/20 text-primary-foreground">
                Proposta Personalizada
              </Badge>
               <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                 Sua Proposta Design que Valoriza
               </h2>
              <p className="text-primary-foreground/70 max-w-xl mx-auto">
                Gere uma proposta profissional em PDF pronta para compartilhar — 
                com todos os detalhes para seu imóvel começar a operar rapidamente.
              </p>
            </div>

            {/* Proposal Preview */}
            <div className="bg-white/10 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-white/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-primary-foreground">
                    Seazone_Proposta_{selectedPkg.name}.pdf
                  </h4>
                  <p className="text-sm text-primary-foreground/60">
                    Gerado com sua configuração selecionada
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-primary-foreground">{selectedPkg.name}</p>
                  <p className="text-xs text-primary-foreground/60">Plano</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-2xl font-bold text-seazone-coral">
                    R$ {selectedPkg.price.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-primary-foreground/60">Investimento</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="coral" size="xl" onClick={handleDownload}>
                <Download className="w-5 h-5" />
                Baixar Proposta Inteligente
              </Button>
              <Button variant="glass" size="xl" onClick={handleWhatsAppShare}>
                <MessageCircle className="w-5 h-5" />
                Compartilhar via WhatsApp
              </Button>
            </div>

            <p className="text-center text-sm text-primary-foreground/50 mt-6">
              Integração com Sienge ERP
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
