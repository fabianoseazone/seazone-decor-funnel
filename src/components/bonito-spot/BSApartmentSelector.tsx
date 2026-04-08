import { useState, useMemo } from "react";
import { MapPin, Home, Users, ArrowRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useBonitoSpot } from "@/contexts/BonitoSpotContext";
import { ALL_APARTMENTS, TYPOLOGIES } from "@/data/bonitoSpotCatalog";
import type { Typology } from "@/types/bonitoSpot";

export function BSApartmentSelector() {
  const { selectApartment, nextStep, state } = useBonitoSpot();
  const [search, setSearch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  const floors = useMemo(() => {
    const floorSet = new Set(ALL_APARTMENTS.map(a => a.apartment.charAt(0)));
    return Array.from(floorSet).sort();
  }, []);

  const filteredApartments = useMemo(() => {
    let apts = ALL_APARTMENTS;
    if (selectedFloor) {
      apts = apts.filter(a => a.apartment.charAt(0) === selectedFloor);
    }
    if (search) {
      apts = apts.filter(a => a.apartment.includes(search));
    }
    return apts;
  }, [search, selectedFloor]);

  const handleSelect = (apt: string) => {
    selectApartment(apt);
  };

  const typologyColors: Record<Typology, string> = {
    A: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    B: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    C: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    D: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    E: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    F: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <Badge variant="coral" className="mb-4">
          <MapPin className="w-3 h-3 mr-1" /> Bonito Spot
        </Badge>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-2">
          Selecione seu Apartamento
        </h2>
        <p className="text-primary-foreground/50 text-sm">
          Rua Pedro Álvares Cabral, 629 — Bonito/MS
        </p>
      </div>

      {/* Floor filter */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedFloor === null ? "coral" : "glass"}
          size="sm"
          onClick={() => setSelectedFloor(null)}
        >
          Todos
        </Button>
        {floors.map(floor => (
          <Button
            key={floor}
            variant={selectedFloor === floor ? "coral" : "glass"}
            size="sm"
            onClick={() => setSelectedFloor(floor)}
          >
            {floor}º Andar
          </Button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
        <Input
          placeholder="Buscar apartamento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/10 border-white/15 text-primary-foreground placeholder:text-primary-foreground/30"
        />
      </div>

      {/* Apartment grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filteredApartments.map(({ apartment, typology }) => {
          const isSelected = state.apartment === apartment;
          return (
            <button
              key={apartment}
              onClick={() => handleSelect(apartment)}
              className={`
                relative rounded-xl p-3 text-center transition-all duration-200 border-2 cursor-pointer
                ${isSelected
                  ? "border-seazone-coral bg-seazone-coral/20 scale-105"
                  : "border-white/10 bg-white/5 hover:border-seazone-coral/40 hover:bg-white/10"
                }
              `}
            >
              <span className="block text-sm font-bold text-primary-foreground">{apartment}</span>
              <span className={`inline-block text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-full border ${typologyColors[typology]}`}>
                Tipo {typology}
              </span>
            </button>
          );
        })}
      </div>

      {/* Typology legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {(Object.entries(TYPOLOGIES) as [Typology, typeof TYPOLOGIES.A][]).map(([typ, info]) => (
          <span key={typ} className={`px-2 py-1 rounded-full border ${typologyColors[typ]}`}>
            Tipo {typ}: {info.hospedes} hóspedes ({info.apartamentos.length} un.)
          </span>
        ))}
      </div>

      {/* Selected preview */}
      {state.apartment && state.typology && (
        <Card className="bg-seazone-coral/10 border-seazone-coral/30 mx-auto max-w-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <Home className="w-5 h-5 text-seazone-coral" />
            <div className="flex-1">
              <p className="font-bold text-primary-foreground">Apartamento {state.apartment}</p>
              <p className="text-xs text-primary-foreground/50">
                Tipologia {state.typology} • {TYPOLOGIES[state.typology].hospedes} hóspedes
              </p>
            </div>
            <Button variant="coral" size="sm" onClick={nextStep}>
              Continuar <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
