"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PDFPreviewProps {
  pdfUrl: string;
}

export function PDFPreview({ pdfUrl }: PDFPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // A4 width in pixels at 96 DPI is approx 794px
        const a4Width = 794;
        // Calculate scale to fit width
        const newScale = width / a4Width;
        setScale(newScale);
      }
    };

    // Initial calculation
    updateScale();

    // Update on resize
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-gray-100/50"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted/50 backdrop-blur-sm">
          <div className="text-center space-y-2">
            <Loader2 className="size-8 text-primary animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading preview...
            </p>
          </div>
        </div>
      )}

      <div
        style={{
          width: "794px", // A4 width
          height: "1123px", // A4 height
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          backgroundColor: "white",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title="Resume Preview"
          onLoad={handleLoad}
          style={{ pointerEvents: "none", colorScheme: "light" }} // Disable interaction and force light scheme
        />
      </div>
    </div>
  );
}
