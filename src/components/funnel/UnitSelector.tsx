import { useState } from "react";
import { MapPin, Building2, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { Unit } from "@/types/funnel";

interface UnitSelectorProps {
  onComplete: () => void;
}

export function UnitSelector({ onComplete }: UnitSelectorProps) {
  const { selectUnit } = useFunnel();
  const [selectedEmpCodigo, setSelectedEmpCodigo] = useState<number | null>(null);
  const [selectedAptoCodigo, setSelectedAptoCodigo] = useState<number | null>(null);

  const { data: empreendimentos, isLoading: loadingEmps } = useEmpreendimentos();
  const { data: apartamentos, isLoading: loadingAptos } = useApartamentos(selectedEmpCodigo);

  const selectedEmp = empreendimentos?.find(e => e.codigo === selectedEmpCodigo);
  const selectedApto = apartamentos?.find(a => a.codigo === selectedAptoCodigo);

  const handleConfirm = () => {
    if (!selectedApto || !selectedEmp) return;
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

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <Badge variant="coral" className="mx-auto mb-4">
            Acesso do Investidor
          </Badge>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Selecione sua Unidade
          </h2>
          <p className="text-muted-foreground">
            Escolha o empreendimento e a unidade para iniciar seu projeto
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

          <Button
            variant="coral"
            size="lg"
            className="w-full"
            disabled={!selectedAptoCodigo}
            onClick={handleConfirm}
          >
            {loadingAptos ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Carregando...</>
            ) : (
              "Iniciar Configuração"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
