import { useState } from "react";
import { ArrowLeft, Download, FileText, Check, Sparkles, PartyPopper } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFunnel } from "@/contexts/FunnelContext";
import { packagesData } from "@/data/mockData";
import { toast } from "sonner";

export function StepContract() {
  const { 
    selectedUnit, 
    selectedPackage, 
    signatoryData, 
    updateSignatory, 
    termsAccepted, 
    setTermsAccepted,
    contractSigned,
    signContract,
    getTotalPrice,
    prevStep 
  } = useFunnel();

  const selectedPkg = packagesData.find(p => p.id === selectedPackage);

  const handleDownloadPDF = () => {
    toast.success("Gerando PDF do contrato...", {
      description: "O download iniciará em instantes.",
    });
    
    // Simulate PDF generation
    console.log("PDF Generation - Contract Data:", {
      signatory: signatoryData,
      unit: selectedUnit,
      package: selectedPkg,
      total: getTotalPrice(),
    });
  };

  const handleSign = () => {
    if (!termsAccepted) {
      toast.error("Aceite os termos para continuar");
      return;
    }
    if (!signatoryData.name || !signatoryData.taxId) {
      toast.error("Preencha nome e CPF/CNPJ");
      return;
    }
    signContract();
  };

  if (contractSigned) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="elevated" className="max-w-lg w-full text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-seazone-success/20 flex items-center justify-center animate-scale-in">
            <PartyPopper className="w-12 h-12 text-seazone-success" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Contrato Assinado!
          </h2>
          <p className="text-muted-foreground mb-6">
            Parabéns! Seu projeto Seazone Decor foi iniciado com sucesso. 
            Nossa equipe entrará em contato em breve para os próximos passos.
          </p>
          <div className="bg-secondary/50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-muted-foreground">Unidade</p>
                <p className="font-semibold">{selectedUnit?.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pacote</p>
                <p className="font-semibold">{selectedPkg?.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Investimento</p>
                <p className="font-semibold text-seazone-coral">
                  R$ {getTotalPrice().toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Signatário</p>
                <p className="font-semibold">{signatoryData.name}</p>
              </div>
            </div>
          </div>
          <Button variant="coral" size="lg" onClick={handleDownloadPDF}>
            <Download className="w-5 h-5" />
            Baixar Contrato Assinado
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="coral" className="mb-4">Etapa Final</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Assinatura do Contrato
        </h2>
        <p className="text-muted-foreground">
          Revise os dados e finalize seu projeto
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Signatory Form */}
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-display font-bold">Dados do Signatário</h3>
            <p className="text-sm text-muted-foreground">
              Dados específicos para este contrato
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nome Completo / Razão Social *</Label>
                <Input
                  id="name"
                  value={signatoryData.name}
                  onChange={(e) => updateSignatory({ name: e.target.value })}
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="taxId">CPF / CNPJ *</Label>
                <Input
                  id="taxId"
                  value={signatoryData.taxId}
                  onChange={(e) => updateSignatory({ taxId: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="company">Empresa (opcional)</Label>
                <Input
                  id="company"
                  value={signatoryData.company}
                  onChange={(e) => updateSignatory({ company: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={signatoryData.address}
                  onChange={(e) => updateSignatory({ address: e.target.value })}
                  placeholder="Endereço completo"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={signatoryData.email}
                  onChange={(e) => updateSignatory({ email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={signatoryData.phone}
                  onChange={(e) => updateSignatory({ phone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Preview */}
        <Card variant="navy">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-foreground" />
              <div>
                <h3 className="text-lg font-display font-bold text-primary-foreground">
                  Contrato de Prestação de Serviços
                </h3>
                <p className="text-sm text-primary-foreground/60">
                  Seazone Decor - {selectedPkg?.name}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64 rounded-lg bg-white/5 p-4">
              <div className="text-sm text-primary-foreground/80 space-y-4">
                <p className="font-bold text-primary-foreground">
                  CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE DECORAÇÃO E EQUIPAGEM
                </p>
                <p>
                  <strong>CONTRATANTE:</strong> {signatoryData.name || "[Nome do Contratante]"}<br />
                  <strong>CPF/CNPJ:</strong> {signatoryData.taxId || "[Documento]"}<br />
                  <strong>Endereço:</strong> {signatoryData.address || "[Endereço]"}
                </p>
                <p>
                  <strong>CONTRATADA:</strong> Seazone Gestão de Imóveis Ltda.<br />
                  <strong>CNPJ:</strong> 00.000.000/0001-00
                </p>
                <p>
                  <strong>OBJETO:</strong> Prestação de serviços de decoração, equipagem e 
                  preparação para operação de aluguel por temporada do imóvel identificado 
                  como Unidade {selectedUnit?.id} - {selectedUnit?.spot}.
                </p>
                <p>
                  <strong>PACOTE:</strong> {selectedPkg?.name}<br />
                  <strong>VALOR TOTAL:</strong> R$ {getTotalPrice().toLocaleString("pt-BR")}<br />
                  <strong>CONDIÇÃO:</strong> 18 parcelas iguais no cartão de crédito
                </p>
                <p>
                  <strong>PRAZO DE EXECUÇÃO:</strong> 60 dias corridos a partir da verificação 
                  da ligação de energia elétrica do imóvel.
                </p>
                <p>
                  <strong>ENTREGA:</strong> Imóvel pronto para operação nas plataformas de 
                  aluguel por temporada, incluindo todos os itens descritos no Memorial 
                  Descritivo anexo a este contrato.
                </p>
                <p className="italic text-primary-foreground/60">
                  [Cláusulas adicionais sobre garantias, responsabilidades e condições gerais...]
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Terms & Actions */}
      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                Li e concordo com os <span className="text-seazone-coral underline">Termos e Condições</span> e 
                com a <span className="text-seazone-coral underline">Política de Privacidade</span> da Seazone Decor.
              </Label>
            </div>
            
            <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button 
          variant="hero" 
          size="xl" 
          onClick={handleSign}
          disabled={!termsAccepted || !signatoryData.name || !signatoryData.taxId}
        >
          <Sparkles className="w-5 h-5" />
          Assinar e Finalizar
        </Button>
      </div>
    </div>
  );
}
