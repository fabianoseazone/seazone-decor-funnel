import { ArrowRight, ArrowLeft, DollarSign, Receipt, Percent, Calculator, MessageCircle, RotateCcw, Send, User, Phone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useBonitoSpot } from "@/contexts/BonitoSpotContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BSFinancialSummary() {
  const { state, getReferenceTotal, getDecorFeeAmount, getAdmFee, getGrandTotal, getGuestCount, prevStep, reset } = useBonitoSpot();
  const [leadName, setLeadName] = useState("");
  const [leadContact, setLeadContact] = useState("");
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);

  const total = getGrandTotal();
  const decorFee = getDecorFeeAmount();
  const admFee = getAdmFee();
  const valorProdutos = (total - decorFee) / 1.13;

  const saveLead = async () => {
    if (!leadName.trim()) { toast.error("Informe seu nome."); return; }
    if (!leadContact.trim()) { toast.error("Informe e-mail ou telefone."); return; }
    const isEmail = leadContact.includes("@");
    setLeadSaving(true);
    const { error } = await supabase.from("simulator_leads").insert({
      name: leadName.trim(),
      email: isEmail ? leadContact.trim() : null,
      phone: !isEmail ? leadContact.trim() : null,
      recommended_package: state.selectedPackage,
      unit_price: Math.round(total),
      total_price: Math.round(total),
      units: 1,
      is_spot: true,
      investor_profile: "bonito-spot",
    });
    setLeadSaving(false);
    if (error) { toast.error("Erro ao salvar. Tente novamente."); return; }
    setLeadSaved(true);
    toast.success("Dados salvos com sucesso!");
  };

  const handleWhatsApp = async () => {
    if (leadName.trim() && leadContact.trim() && !leadSaved) await saveLead();
    const message = encodeURIComponent(
      `🏠 Bonito Spot - Orçamento Decoração\n\n` +
      `🏢 Apartamento: ${state.apartment}\n` +
      `📐 Tipologia: ${state.typology} (${getGuestCount()} hóspedes)\n` +
      `📦 Pacote: ${state.selectedPackage}\n\n` +
      `💰 Valor Produtos: R$ ${valorProdutos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` +
      `🎨 Taxa Decor: R$ ${decorFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` +
      `📋 Taxa ADM (13%): R$ ${admFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n` +
      `✅ Total: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\n` +
      `Gostaria de receber o orçamento detalhado!`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const consultantWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá! Tenho interesse no pacote ${state.selectedPackage} para o Apto ${state.apartment} do Bonito Spot.\n` +
      `Valor: R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n` +
      `Gostaria de falar com um consultor.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <Badge className="mb-3 bg-white/10 text-primary-foreground/60 border-white/15">
          Apto {state.apartment} • Tipo {state.typology} • {state.selectedPackage}
        </Badge>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
          Resumo Financeiro
        </h2>
      </div>

      {/* Breakdown */}
      <Card className="bg-white/5 border-white/10 max-w-md mx-auto">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <DollarSign className="w-4 h-4" /> Valor Produtos
            </div>
            <span className="text-primary-foreground font-semibold">
              R$ {valorProdutos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <Receipt className="w-4 h-4" /> Taxa Decor
            </div>
            <span className="text-primary-foreground font-semibold">
              R$ {decorFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
              <Percent className="w-4 h-4" /> Taxa ADM (13%)
            </div>
            <span className="text-primary-foreground font-semibold">
              R$ {admFee.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-seazone-coral font-bold">
              <Calculator className="w-5 h-5" /> Total
            </div>
            <span className="text-2xl font-bold text-seazone-coral">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-xs text-primary-foreground/30 text-center">
            Índice de correção: IGP-M • Mês de correção: 01/11/2025
          </p>
        </CardContent>
      </Card>

      {/* Lead capture */}
      <div className="max-w-md mx-auto space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-semibold text-primary-foreground text-center">
              📲 Receba seu orçamento via WhatsApp
            </p>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                <Input
                  placeholder="Seu nome"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="pl-10 bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-seazone-coral"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
                <Input
                  placeholder="E-mail ou telefone"
                  value={leadContact}
                  onChange={(e) => setLeadContact(e.target.value)}
                  className="pl-10 bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-seazone-coral"
                />
              </div>
            </div>
            <Button variant="coral" size="lg" className="w-full" onClick={handleWhatsApp} disabled={leadSaving || leadSaved}>
              {leadSaved ? <>✓ Enviado!</> : leadSaving ? <>Salvando...</> : <><Send className="w-4 h-4" /> Enviar via WhatsApp</>}
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-primary-foreground/30 uppercase tracking-wider">ou</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button variant="glass" size="lg" className="w-full" onClick={consultantWhatsApp}>
          <MessageCircle className="w-5 h-5" /> Falar com um Consultor
        </Button>

        <div className="flex justify-center gap-3">
          <Button variant="glass" size="default" onClick={prevStep}>
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <Button variant="glass" size="default" onClick={reset}>
            <RotateCcw className="w-4 h-4" /> Recomeçar
          </Button>
        </div>
      </div>
    </div>
  );
}
