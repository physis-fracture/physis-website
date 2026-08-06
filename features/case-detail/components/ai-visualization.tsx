"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudyDetail } from "../api/get-study-detail";
import { Card, CardContent } from "@/components/ui/card";

type ViewMode = "original" | "surprise" | "implicit" | "overlay";

const VIEW_MODES: Array<{ value: ViewMode; label: string }> = [
  { value: "original", label: "Original" },
  { value: "surprise", label: "Surprise Map" },
  { value: "implicit", label: "Age Map" },
  { value: "overlay", label: "Overlay" },
];

export function AiVisualization({ study }: { study: StudyDetail }) {
  const images = study.images.filter((img) => img.viewUrl);
  const defaultTab = images.length > 0 ? images[0].id : "";
  const [activeImageId, setActiveImageId] = useState(defaultTab);
  const [viewMode, setViewMode] = useState<ViewMode>("original");

  if (images.length === 0 || !study.aiResult) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          No AI visualization available
        </CardContent>
      </Card>
    );
  }

  const activeImage = images.find((img) => img.id === activeImageId);
  const imageResult = study.aiResult.imageResults.find(
    (ir) => ir.image_id === activeImageId,
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">AI Maps</h3>
            {images.length > 1 && (
              <Select value={activeImageId} onValueChange={setActiveImageId}>
                <SelectTrigger className="w-auto">
                  <SelectValue placeholder="Select image" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {images.map((img) => (
                      <SelectItem key={img.id} value={img.id}>
                        {img.view}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          </div>

          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
            <TabsList className="grid w-full grid-cols-4">
              {VIEW_MODES.map((mode) => (
                <TabsTrigger key={mode.value} value={mode.value}>
                  {mode.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="relative mt-4 flex aspect-square items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
              {activeImage?.viewUrl && (
                <img
                  src={activeImage.viewUrl}
                  alt="Original radiograph"
                  className={`max-h-full max-w-full object-contain ${
                    viewMode !== "original" && viewMode !== "overlay"
                      ? "hidden"
                      : ""
                  }`}
                />
              )}

              {imageResult &&
                (viewMode === "surprise" || viewMode === "overlay") &&
                imageResult.surprise_map && (
                  <MapRenderer
                    mapData={imageResult.surprise_map}
                    type="surprise"
                    opacity={viewMode === "overlay" ? 0.5 : 1}
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                  />
                )}

              {imageResult && viewMode === "implicit" && imageResult.implicit_age_map && (
                <MapRenderer
                  mapData={imageResult.implicit_age_map}
                  type="implicit"
                  opacity={1}
                  className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                />
              )}

              {(!imageResult ||
                (!imageResult.surprise_map && viewMode === "surprise") ||
                (!imageResult.implicit_age_map && viewMode === "implicit")) &&
                viewMode !== "original" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
                    Map data not available
                  </div>
                )}
            </div>

            {viewMode === "surprise" && (
              <div className="mt-4 flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gradient-to-r from-transparent via-yellow-400 via-orange-500 to-red-600" />
              </div>
            )}

            {viewMode === "implicit" && (
              <div className="mt-4 flex flex-col gap-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Younger</span>
                  <span>Matched</span>
                  <span>Older</span>
                </div>
                <div className="h-2 w-full rounded-full border border-border bg-gradient-to-r from-blue-500 via-white to-red-500" />
              </div>
            )}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}

function MapRenderer({
  mapData,
  type,
  opacity,
  className,
}: {
  mapData: unknown;
  type: "surprise" | "implicit";
  opacity: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !Array.isArray(mapData) || mapData.length === 0) {
      return;
    }

    const rows = mapData as number[][];
    const height = rows.length;
    const width = Array.isArray(rows[0]) ? rows[0].length : 0;
    if (width === 0) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    let min = Infinity;
    let max = -Infinity;

    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const val = rows[r]?.[c];
        if (typeof val !== "number") continue;
        if (val < min) min = val;
        if (val > max) max = val;
      }
    }
    if (max === min) max = min + 1;

    let i = 0;
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        const val = rows[r]?.[c];
        const norm = typeof val === "number" ? (val - min) / (max - min) : 0;

        let red = 0,
          green = 0,
          blue = 0,
          alpha = 255;

        if (type === "surprise") {
          if (norm < 0.33) {
            red = 255;
            green = 255;
            blue = 0;
            alpha = Math.floor((norm / 0.33) * 255);
          } else if (norm < 0.66) {
            red = 255;
            green = Math.floor(255 - ((norm - 0.33) / 0.33) * 127);
            blue = 0;
          } else {
            red = 255;
            green = Math.floor(128 - ((norm - 0.66) / 0.34) * 128);
            blue = 0;
          }
        } else {
          if (norm < 0.5) {
            const n2 = norm * 2;
            red = Math.floor(n2 * 255);
            green = Math.floor(n2 * 255);
            blue = 255;
          } else {
            const n2 = (norm - 0.5) * 2;
            red = 255;
            green = Math.floor((1 - n2) * 255);
            blue = Math.floor((1 - n2) * 255);
          }
        }

        data[i++] = red;
        data[i++] = green;
        data[i++] = blue;
        data[i++] = Math.floor(alpha * opacity);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [mapData, type, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
