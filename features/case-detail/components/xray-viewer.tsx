"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyDetail } from "../api/get-study-detail";

export function XrayViewer({ study }: { study: StudyDetail }) {
  const images = study.images.filter((img) => img.viewUrl);
  const defaultTab = images.length > 0 ? images[0].id : "";
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  if (images.length === 0) {
    return <div className="flex h-[55vh] min-h-[320px] items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">No images available.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {images.map((img) => (
            <TabsTrigger key={img.id} value={img.id}>
              {img.view || "Image"} {img.laterality !== "unknown" ? `(${img.laterality})` : ""}
            </TabsTrigger>
          ))}
        </TabsList>

        {images.map((img) => (
          <TabsContent key={img.id} value={img.id} className="mt-3">
            <InteractiveViewer imageUrl={img.viewUrl!} />
            {study.aiResult && (
              <div className="mt-2 text-sm text-muted-foreground text-center">
                {(() => {
                  const ir = study.aiResult.imageResults.find(r => r.image_id === img.id);
                  return ir && ir.triage_score != null ? `Image Triage Score: ${(ir.triage_score * 100).toFixed(1)}` : "No AI result for this image";
                })()}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function InteractiveViewer({ imageUrl }: { imageUrl: string }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const newScale = prev - e.deltaY * 0.005;
      return Math.min(Math.max(0.5, newScale), 4);
    });
  };

  const handleMouseDown = (e: MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPos({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    window.addEventListener("mouseup", handleMouseUpGlobal);
    return () => window.removeEventListener("mouseup", handleMouseUpGlobal);
  }, []);

  return (
    <div className="relative flex h-[55vh] min-h-[320px] items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
      <div className="absolute right-2 top-2 z-10">
        <Button variant="secondary" size="icon" onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }} aria-label="Reset view">
          <RotateCcw />
        </Button>
      </div>
      <div 
        ref={containerRef}
        className={`flex h-full w-full items-center justify-center ${scale > 1 ? "cursor-move" : ""}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageUrl}
          alt="Radiograph"
          className="max-w-full max-h-full object-contain pointer-events-none"
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.1s ease-out",
          }}
        />
      </div>
    </div>
  );
}
