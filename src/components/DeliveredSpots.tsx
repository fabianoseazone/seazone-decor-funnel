import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Spot {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
}

const spots: Spot[] = [
  { id: "1", name: "Residencial Maré Alta", location: "Jurerê Internacional, Florianópolis", imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600" },
  { id: "2", name: "Edifício Brisa do Mar", location: "Praia Brava, Itajaí", imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600" },
  { id: "3", name: "Torre Aquarela", location: "Cacupé, Florianópolis", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600" },
  { id: "4", name: "Villa Serena", location: "Ingleses, Florianópolis", imageUrl: "https://images.unsplash.com/photo-1616137466211-f939a420be84?w=600" },
  { id: "5", name: "Harmonia Residence", location: "Canasvieiras, Florianópolis", imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600" },
  { id: "6", name: "Oceano Premium", location: "Bombinhas, SC", imageUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600" },
];

export function DeliveredSpots() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth / 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-14 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <span className="text-sm font-semibold tracking-widest uppercase text-accent">
            Portfólio
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mt-1">
            Spots Entregues
          </h2>
        </div>

        <div className="relative">
          {/* Navigation arrows overlaid */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 md:left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background hover:scale-110 transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 md:right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-background hover:scale-110 transition-all"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2 px-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {spots.map((spot) => {
              return (
                <div
                  key={spot.id}
                  className="group relative rounded-2xl overflow-hidden border-2 border-border shadow-md hover:shadow-lg transition-all duration-300 text-left h-48 flex-shrink-0 w-[calc(50%-0.5rem)] snap-start"
                >
                  <img
                    src={spot.imageUrl}
                    alt={spot.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-display font-bold text-white text-base">
                      {spot.name}
                    </h3>
                    <p className="text-white/70 text-xs">{spot.location}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
