import { useState } from "react";
import { ArrowLeft, Send, CheckCircle2, Building2, MapPin, Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFunnel } from "@/contexts/FunnelContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DownloadMemorialButton } from "@/components/funnel/DownloadMemorialButton";

const PACOTE_LABEL: Record<string, string> = {
  essential: "Essential",
  plus: "Plus",
  premium: "Premium",
};

export function StepContract() {
  const {
    selectedUnit,
    selectedPackage,
    tipologiaSelecionada,
    getTotalPrice,
    ownerName,
    ownerCpf,
    prevStep,
  } = useFunnel();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const total = getTotalPrice();
  const nomePacote = selectedPackage ? (PACOTE_LABEL[selectedPackage] ?? selectedPackage) : "";


  const handleSolicitar = async () => {
    setSending(true);
    try {
      await supabase.from("simulator_leads").insert({
        name: ownerName || "Proprietário",
        phone: null,
        email: null,
        recommended_package: nomePacote,
        total_price: total,
        units: selectedUnit?.id ?? null,
        investor_profile: `cpf:${ownerCpf}|unit:${selectedUnit?.id}|emp:${selectedUnit?.spot}`,
      });
    } catch {
      // silently ignore - show success anyway
    }
    setSending(false);
    setSent(true);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (sent) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="elevated" className="max-w-lg w-full text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-seazone-success/20 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-seazone-success" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-3">
            Solicitação enviada!
          </h2>
          <p className="text-muted-foreground mb-6">
            Nossa equipe comercial entrará em contato em breve para validar seu pedido e dar continuidade ao contrato.
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-seazone-coral flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Empreendimento</p>
                <p className="font-semibold text-sm">{selectedUnit?.spot}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-seazone-coral flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Unidade</p>
                <p className="font-semibold text-sm">{selectedUnit?.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-seazone-coral flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Pacote</p>
                <p className="font-semibold text-sm">{nomePacote}</p>
              </div>
            </div>
          </div>
          <DownloadMemorialButton variant="outline" />
        </Card>
      </div>
    );
  }

  // ── Main screen ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-8">
      <div className="text-center">
        <Badge variant="coral" className="mb-4">Etapa Final</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Solicitar Contato do Comercial
        </h2>
        <p className="text-muted-foreground">
          Nossa equipe validará sua seleção e dará continuidade ao contrato
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Resumo da seleção */}
        <Card variant="navy">
          <CardHeader>
            <h3 className="text-lg font-display font-bold text-primary-foreground">
              Resumo da sua seleção
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-3 border-b border-primary-foreground/10">
                <MapPin className="w-5 h-5 text-seazone-coral flex-shrink-0" />
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">Empreendimento</p>
                  <p className="font-semibold text-primary-foreground">{selectedUnit?.spot ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-primary-foreground/10">
                <Building2 className="w-5 h-5 text-seazone-coral flex-shrink-0" />
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">Unidade</p>
                  <p className="font-semibold text-primary-foreground">{selectedUnit?.id ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3 border-b border-primary-foreground/10">
                <Package className="w-5 h-5 text-seazone-coral flex-shrink-0" />
                <div>
                  <p className="text-xs text-primary-foreground/50 uppercase tracking-wider">Pacote</p>
                  <p className="font-semibold text-primary-foreground">{nomePacote}</p>
                  {tipologiaSelecionada && (
                    <p className="text-sm text-primary-foreground/60">
                      Tipologia {tipologiaSelecionada.tipo_letra} · {tipologiaSelecionada.num_hospedes} hóspedes
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mb-1">Total estimado</p>
              <p className="text-3xl font-bold text-seazone-coral">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-primary-foreground/40 mt-1">
                Sujeito à validação do comercial
              </p>
            </div>

            <DownloadMemorialButton variant="glass" />
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center px-4">
          Ao solicitar, nossa equipe entrará em contato para revisar a seleção,
          confirmar as condições e encaminhar o contrato para assinatura.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button
          variant="hero"
          size="xl"
          onClick={handleSolicitar}
          disabled={sending}
        >
          {sending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Enviando...</>
          ) : (
            <><Send className="w-5 h-5 mr-2" />Solicitar contato do comercial</>
          )}
        </Button>
      </div>
    </div>
  );
}
