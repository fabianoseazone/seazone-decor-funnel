import { useState } from "react";
import { ArrowRight, ArrowLeft, Search, Filter, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { memorialItems } from "@/data/mockData";
import { useFunnel } from "@/contexts/FunnelContext";

export function StepSpecs() {
  const { selectedPackage, nextStep, prevStep } = useFunnel();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Filter items based on selected package
  const packageItems = memorialItems.filter(item => 
    selectedPackage && item.packageLink.includes(selectedPackage)
  );

  // Apply search and category filters
  const filteredItems = packageItems.filter(item => {
    const matchesSearch = item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.specification.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(packageItems.map(item => item.category))];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="coral" className="mb-4">Memorial Descritivo</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Especificações Técnicas
        </h2>
        <p className="text-muted-foreground">
          Lista detalhada de todos os itens inclusos no seu plano
        </p>
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead className="w-20">Foto</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Especificação</TableHead>
                <TableHead className="w-20 text-center">Qtd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-secondary/30">
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="w-16 h-12 rounded-lg overflow-hidden border border-border hover:border-seazone-coral transition-colors">
                          <img
                            src={item.photoUrl}
                            alt={item.item}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <img
                          src={item.photoUrl.replace("w=200", "w=800")}
                          alt={item.item}
                          className="w-full rounded-lg"
                        />
                        <div className="mt-4">
                          <h4 className="font-semibold">{item.item}</h4>
                          <p className="text-sm text-muted-foreground">{item.specification}</p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  <TableCell className="font-medium">{item.item}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">{item.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">
                    {item.specification}
                  </TableCell>
                  <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum item encontrado com os filtros selecionados.</p>
          </div>
        )}
      </Card>

      {/* Summary */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de itens no plano</p>
              <p className="text-2xl font-bold text-foreground">
                {packageItems.length} itens
              </p>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              Memorial Completo
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button variant="coral" size="lg" onClick={nextStep}>
          Ver Condições Comerciais
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
