import { useState } from "react";
import { X, ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Maximize2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { galleryImages } from "@/data/mockData";
import { useFunnel } from "@/contexts/FunnelContext";

export function StepGallery() {
  const { selectedPackage, nextStep, prevStep } = useFunnel();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const images = selectedPackage ? galleryImages[selectedPackage] : galleryImages.premium;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Badge variant="coral" className="mb-4">Visualização 3D</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Galeria de Renders
        </h2>
        <p className="text-muted-foreground">
          Visualize como ficará seu imóvel com o pacote selecionado
        </p>
      </div>

      {/* Main Image */}
      <div className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Render ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        {/* Fullscreen Button */}
        <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
          <DialogTrigger asChild>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
            <div className="relative w-full h-[90vh]">
              <img
                src={images[currentIndex]}
                alt={`Render ${currentIndex + 1} fullscreen`}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setFullscreenOpen(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 justify-center overflow-x-auto pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              idx === currentIndex 
                ? "border-seazone-coral scale-105" 
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button variant="coral" size="lg" onClick={nextStep}>
          Ver Memorial Descritivo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
