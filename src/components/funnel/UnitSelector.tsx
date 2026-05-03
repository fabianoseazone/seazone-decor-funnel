import { useState } from "react";
import { MapPin, Building2, Check, Loader2, User, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmpreendimentos } from "@/hooks/useEmpreendimentos";
import { useApartamentos } from "@/hooks/useApartamentos";
import { useFunnel } from "@/contexts/FunnelContext";
import { ProspectQuiz } from "./ProspectQuiz";
import type { Unit } from "@/types/funnel";

type Mode = "select" | "owner-login" | "owner-unit" | "prospect" | "prospect-unit";

interface UnitSelectorProps {
  onComplete: () => void;
}

export function UnitSelector({ onComplete }: UnitSelectorProps) {
  const { selectUnit, setOwnerInfo, setRecommendedPackageHint } = useFunnel();
  const [mode, setMode] = useState<Mode>("select");

  const [ownerName, setOwnerName] = useState("");
  const [ownerCpf, setOwnerCpf] = useState("");
  const [prospectPkgAbrev, setProspectPkgAbrev] = useState<string | null>(null);

  const [selectedEmpCodigo, setSelectedEmpCodigo] = useState<number | null>(null);
  const [selectedAptoCodigo, setSelectedAptoCodigo] = useState<number | null>(null);

  const { data: empreendimentos, isLoading: loadingEmps } = useEmpreendimentos();
  const { data: apartamentos, isLoading: loadingAptos } = useApartamentos(selectedEmpCodigo);

  const selectedEmp = empreendimentos?.find(e => e.codigo === selectedEmpCodigo);
  const selectedApto = apartamentos?.find(a => a.codigo === selectedAptoCodigo);

  const handleConfirm = () => {
    if (!selectedApto || !selectedEmp) return;
    setOwnerInfo(ownerName, ownerCpf);
    if (prospectPkgAbrev) setRecommendedPackageHint(prospectPkgAbrev);
    const unit: Unit = {
      id: selectedApto.apartamento_id,
      spot: selectedEmp.descricao,
      deliveryDate: new Date(),
      tipologiaCodigo: selectedApto.tipologia_codigo,
      empreendimentoCodigo: selectedApto.empreendimento_codigo,
    };
    selectUnit(unit);
    onComplete();
  };

  const handleProspectViewDetails = (pkgAbrev: string) => {
    setProspectPkgAbrev(pkgAbrev);
    setSelectedEmpCodigo(null);
    setSelectedAptoCodigo(null);
    setMode("prospect-unit");
  };

  // ── Mode selector ──────────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-seazone-coral/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-seazone-coral" />
            </div>
            <Badge variant="coral" className="mx-auto">Seazone Decor</Badge>
            <h2 className="text-3xl font-display font-bold text-primary-foreground">
              Bem-vindo ao Decor Lucrativo
            </h2>
            <p className="text-primary-foreground/60 max-w-sm mx-auto">
              Personalize o décor do seu imóvel e maximize sua rentabilidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div
              className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-seazone-coral/40 transition-all duration-300 p-8 text-center space-y-5"
              onClick={() => window.location.href = "https://dash-decor.seazone.com.br/login"}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-seazone-coral/15 border border-seazone-coral/20 flex items-center justify-center group-hover:bg-seazone-coral/20 transition-colors">
                <Building2 className="w-8 h-8 text-seazone-coral" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-primary-foreground">
                  Já sou proprietário
                </h3>
                <p className="text-sm text-primary-foreground/50">
                  Tenho um imóvel Seazone e quero configurar meu décor
                </p>
              </div>
              <Button variant="coral" className="w-full">
                Acessar minha unidade <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div
              className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all duration-300 p-8 text-center space-y-5"
              onClick={() => setMode("prospect")}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/8 border border-white/15 flex items-center justify-center group-hover:bg-white/12 transition-colors">
                <User className="w-8 h-8 text-primary-foreground/60" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-display font-bold text-primary-foreground">
                  Quero simular
                </h3>
                <p className="text-sm text-primary-foreground/50">
                  Descubra qual pacote é ideal para o meu perfil de investidor
                </p>
              </div>
              <Button variant="outline" className="w-full border-white/20 text-primary-foreground hover:bg-white/10">
                Iniciar simulação <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Prospect quiz ─────────────────────────────────────────────────────────
  if (mode === "prospect") {
    return (
      <ProspectQuiz
        onBack={() => setMode("select")}
        onViewDetails={handleProspectViewDetails}
      />
    );
  }

  // ── Owner login ───────────────────────────────────────────────────────────
  if (mode === "owner-login") {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="coral" className="mx-auto">Acesso do Proprietário</Badge>
            <h2 className="text-2xl font-display font-bold text-primary-foreground">
              Identifique-se
            </h2>
            <p className="text-primary-foreground/50 text-sm">
              Informe seus dados para acessar suas unidades
            </p>
          </div>

          <Card variant="glass" className="border border-white/10">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName" className="text-foreground">Nome completo</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerCpf" className="text-foreground">CPF</Label>
                <Input
                  id="ownerCpf"
                  value={ownerCpf}
                  onChange={e => setOwnerCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-white/10 border-white/20 text-foreground placeholder:text-foreground/40"
                />
              </div>
              <Button
                variant="coral"
                size="lg"
                className="w-full mt-2"
                disabled={!ownerName.trim() || ownerCpf.length < 3}
                onClick={() => setMode("owner-unit")}
              >
                Continuar <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-primary-foreground/40 hover:text-primary-foreground/70" onClick={() => setMode("select")}>
                Voltar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Unit selection (owner or prospect after quiz) ─────────────────────────
  const isProspect = mode === "prospect-unit";
  const titleText = isProspect ? "Selecione um empreendimento" : "Selecione sua Unidade";
  const subtitleText = isProspect
    ? "Escolha um empreendimento para ver os itens e imagens do pacote recomendado"
    : `Olá, ${ownerName.split(" ")[0]}. Selecione o imóvel que deseja configurar.`;

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Badge variant="coral" className="mx-auto">
            {isProspect ? "Decor Lucrativo" : "Acesso do Proprietário"}
          </Badge>
          <h2 className="text-2xl font-display font-bold text-primary-foreground">
            {titleText}
          </h2>
          <p className="text-primary-foreground/50 text-sm max-w-sm mx-auto">
            {subtitleText}
          </p>
        </div>

        <Card variant="glass" className="border border-white/10">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-seazone-coral" />
                Empreendimento
              </label>
              <Select
                value={selectedEmpCodigo?.toString() ?? ""}
                onValueChange={(v) => {
                  setSelectedEmpCodigo(Number(v));
                  setSelectedAptoCodigo(null);
                }}
                disabled={loadingEmps}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20">
                  <SelectValue placeholder={
                    loadingEmps ? "Carregando..." : "Selecione o empreendimento"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {empreendimentos?.map((emp) => (
                    <SelectItem key={emp.codigo} value={emp.codigo.toString()}>
                      {emp.descricao}{emp.cidade ? ` — ${emp.cidade}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-seazone-coral" />
                {isProspect ? "Unidade de referência (opcional)" : "Unidade"}
              </label>
              <Select
                value={selectedAptoCodigo?.toString() ?? ""}
                onValueChange={(v) => setSelectedAptoCodigo(Number(v))}
                disabled={!selectedEmpCodigo || loadingAptos}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20">
                  <SelectValue placeholder={
                    !selectedEmpCodigo
                      ? "Primeiro selecione o empreendimento"
                      : loadingAptos
                      ? "Carregando unidades..."
                      : "Selecione a unidade"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {apartamentos?.map((apto) => (
                    <SelectItem key={apto.codigo} value={apto.codigo.toString()}>
                      {apto.apartamento_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedApto && selectedEmp && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-seazone-success/10 border border-seazone-success/20">
                <Check className="w-5 h-5 text-seazone-success flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">{selectedEmp.descricao}</p>
                  <p className="text-xs text-muted-foreground">Unidade {selectedApto.apartamento_id}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="border-white/20 text-primary-foreground hover:bg-white/10"
                onClick={() => setMode(isProspect ? "prospect" : "owner-login")}
              >
                Voltar
              </Button>
              <Button
                variant="coral"
                size="lg"
                className="flex-1"
                disabled={!selectedAptoCodigo}
                onClick={handleConfirm}
              >
                {loadingAptos ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Carregando...</>
                ) : (
                  isProspect ? "Ver pacote recomendado" : "Iniciar Configuração"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
