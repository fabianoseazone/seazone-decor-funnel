import { useState } from "react";
import { MapPin, Building2, Check, Loader2, User, ChevronRight } from "lucide-react";
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

type Mode = "select" | "owner-login" | "owner-unit" | "prospect";

interface UnitSelectorProps {
  onComplete: () => void;
}

export function UnitSelector({ onComplete }: UnitSelectorProps) {
  const { selectUnit, setOwnerInfo } = useFunnel();
  const [mode, setMode] = useState<Mode>("select");

  const [ownerName, setOwnerName] = useState("");
  const [ownerCpf, setOwnerCpf] = useState("");

  const [selectedEmpCodigo, setSelectedEmpCodigo] = useState<number | null>(null);
  const [selectedAptoCodigo, setSelectedAptoCodigo] = useState<number | null>(null);

  const { data: empreendimentos, isLoading: loadingEmps } = useEmpreendimentos();
  const { data: apartamentos, isLoading: loadingAptos } = useApartamentos(selectedEmpCodigo);

  const selectedEmp = empreendimentos?.find(e => e.codigo === selectedEmpCodigo);
  const selectedApto = apartamentos?.find(a => a.codigo === selectedAptoCodigo);

  const handleConfirm = () => {
    if (!selectedApto || !selectedEmp) return;
    setOwnerInfo(ownerName, ownerCpf);
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

  // ── Mode selector ──────────────────────────────────────────────────────────
  if (mode === "select") {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="coral" className="mx-auto">Seazone Decor</Badge>
            <h2 className="text-3xl font-display font-bold text-primary-foreground">
              Bem-vindo ao Decor Lucrativo
            </h2>
            <p className="text-primary-foreground/70">
              Personalize o décor do seu imóvel e maximize sua rentabilidade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card
              variant="glass"
              className="cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
              onClick={() => setMode("owner-login")}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-seazone-coral/20 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-seazone-coral" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-primary-foreground mb-1">
                    Já sou proprietário
                  </h3>
                  <p className="text-sm text-primary-foreground/60">
                    Tenho um imóvel Seazone e quero configurar meu décor
                  </p>
                </div>
                <Button variant="coral" className="w-full group-hover:shadow-lg">
                  Acessar minha unidade <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card
              variant="glass"
              className="cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
              onClick={() => setMode("prospect")}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground/70" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-primary-foreground mb-1">
                    Quero simular
                  </h3>
                  <p className="text-sm text-primary-foreground/60">
                    Descubra qual pacote é ideal para o meu perfil de investidor
                  </p>
                </div>
                <Button variant="glass" className="w-full group-hover:shadow-lg">
                  Iniciar simulação <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── Prospect quiz ─────────────────────────────────────────────────────────
  if (mode === "prospect") {
    return <ProspectQuiz onBack={() => setMode("select")} />;
  }

  // ── Owner login ───────────────────────────────────────────────────────────
  if (mode === "owner-login") {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-4">
        <Card variant="glass" className="w-full max-w-md">
          <CardHeader className="text-center pb-6">
            <Badge variant="coral" className="mx-auto mb-4">Acesso do Proprietário</Badge>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Identifique-se
            </h2>
            <p className="text-muted-foreground text-sm">
              Informe seus dados para acessar suas unidades
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">Nome completo</Label>
              <Input
                id="ownerName"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerCpf">CPF</Label>
              <Input
                id="ownerCpf"
                value={ownerCpf}
                onChange={e => setOwnerCpf(e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setMode("select")}>
                Voltar
              </Button>
              <Button
                variant="coral"
                className="flex-1"
                disabled={!ownerName.trim() || ownerCpf.length < 3}
                onClick={() => setMode("owner-unit")}
              >
                Continuar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Owner unit selection ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <Badge variant="coral" className="mx-auto mb-4">
            Acesso do Proprietário
          </Badge>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Selecione sua Unidade
          </h2>
          <p className="text-muted-foreground text-sm">
            Olá, <strong>{ownerName.split(" ")[0]}</strong>. Selecione o empreendimento e a unidade que deseja configurar.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
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
              <SelectTrigger className="w-full">
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
              Unidade
            </label>
            <Select
              value={selectedAptoCodigo?.toString() ?? ""}
              onValueChange={(v) => setSelectedAptoCodigo(Number(v))}
              disabled={!selectedEmpCodigo || loadingAptos}
            >
              <SelectTrigger className="w-full">
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
            <Card variant="elevated" className="bg-seazone-success/10 border-seazone-success/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-seazone-success" />
                  <div>
                    <p className="font-medium text-foreground">{selectedEmp.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Unidade {selectedApto.apartamento_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setMode("owner-login")}>
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
                "Iniciar Configuração"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
