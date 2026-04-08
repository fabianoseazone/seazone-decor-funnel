import { useState } from "react";
import { MapPin, Calendar, ChevronDown, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { mockUnits, mockSpots } from "@/data/mockData";
import { useFunnel } from "@/contexts/FunnelContext";
import { Unit } from "@/types/funnel";

interface UnitSelectorProps {
  onComplete: () => void;
}

export function UnitSelector({ onComplete }: UnitSelectorProps) {
  const { selectUnit, selectedUnit } = useFunnel();
  const [selectedSpot, setSelectedSpot] = useState<string>("");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");

  const filteredUnits = selectedSpot 
    ? mockUnits.filter(u => u.spot === selectedSpot)
    : mockUnits;

  const handleConfirm = () => {
    const unit = mockUnits.find(u => u.id === selectedUnitId);
    if (unit) {
      selectUnit(unit);
      onComplete();
    }
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
          {/* Spot Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-seazone-coral" />
              Empreendimento (Spot)
            </label>
            <Select value={selectedSpot} onValueChange={setSelectedSpot}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o empreendimento" />
              </SelectTrigger>
              <SelectContent>
                {mockSpots.map((spot) => (
                  <SelectItem key={spot} value={spot}>
                    {spot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-seazone-coral" />
              Unidade
            </label>
            <Select 
              value={selectedUnitId} 
              onValueChange={setSelectedUnitId}
              disabled={!selectedSpot}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedSpot ? "Selecione a unidade" : "Primeiro selecione o empreendimento"} />
              </SelectTrigger>
              <SelectContent>
                {filteredUnits.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{unit.id} - {unit.spot}</span>
                      <span className="text-xs text-muted-foreground ml-4">
                        Entrega: {unit.deliveryDate.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Unit Preview */}
          {selectedUnitId && (
            <Card variant="elevated" className="bg-seazone-success/10 border-seazone-success/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-seazone-success" />
                  <div>
                    <p className="font-medium text-foreground">
                      {filteredUnits.find(u => u.id === selectedUnitId)?.spot}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Unidade {selectedUnitId} • Entrega em{" "}
                      {filteredUnits.find(u => u.id === selectedUnitId)?.deliveryDate.toLocaleDateString("pt-BR")}
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
            disabled={!selectedUnitId}
            onClick={handleConfirm}
          >
            Iniciar Configuração
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
