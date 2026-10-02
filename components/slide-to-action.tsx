"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SlideToActionProps = {
  text?: string;
  successText?: string;
  onComplete?: () => void;
  disabled?: boolean;
  /** Change cette valeur pour réinitialiser le slider depuis le parent */
  resetKey?: string | number;
  className?: string;
};

const THUMB_SIZE = 52; // px, largeur du bouton
const COMPLETE_THRESHOLD = 0.85;
const KEYBOARD_STEP = 24; // px par pression de flèche

export function SlideToAction({
  text = "Glisser pour valider",
  successText = "Validé !",
  onComplete,
  disabled = false,
  resetKey,
  className,
}: SlideToActionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Réinitialise le slider quand resetKey change (ex: après un onComplete traité par le parent).
  // Ajustement pendant le rendu plutôt que dans un effect : évite le double rendu et le
  // warning React "setState synchronously within an effect".
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPosition(0);
    setCompleted(false);
  }

  const recalcMaxPosition = useCallback(() => {
    if (!containerRef.current) return;
    setMaxPosition(containerRef.current.offsetWidth - THUMB_SIZE - 4);
  }, []);

  // Recalcule la largeur dispo au montage et à chaque redimensionnement du conteneur
  useEffect(() => {
    recalcMaxPosition();
    const observer = new ResizeObserver(recalcMaxPosition);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [recalcMaxPosition]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || completed) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || disabled || completed) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextPosition = event.clientX - rect.left - THUMB_SIZE / 2;

    setPosition(Math.max(0, Math.min(nextPosition, maxPosition)));
  };

  const handlePointerUp = () => {
    if (!dragging || disabled || completed) return;
    setDragging(false);

    if (position >= maxPosition * COMPLETE_THRESHOLD) {
      setPosition(maxPosition);
      setCompleted(true);
      onComplete?.();
      return;
    }
    setPosition(0);
  };

  // Accessibilité clavier : flèches pour déplacer, Entrée/Espace pour valider directement
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || completed) return;

    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        setPosition(Math.min(position + KEYBOARD_STEP, maxPosition));
        break;
      case "ArrowLeft":
        event.preventDefault();
        setPosition(Math.max(position - KEYBOARD_STEP, 0));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        setPosition(maxPosition);
        setCompleted(true);
        onComplete?.();
        break;
      default:
        break;
    }
  };

  const progress = maxPosition > 0 ? Math.round((position / maxPosition) * 100) : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-14 w-full overflow-hidden rounded-full",
        "bg-muted/60 border border-border",
        "select-none touch-none",
        disabled && "opacity-50",
        className,
      )}
    >
      {/* Texte */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "text-sm font-medium text-muted-foreground",
          "pointer-events-none",
          "transition-opacity duration-200",
          completed && "opacity-0",
        )}
      >
        {text}
      </div>

      {/* Barre de progression */}
      <div
        className={cn(
          "absolute inset-y-1 left-1 rounded-full",
          "bg-primary/10",
          "transition-[width] duration-75",
        )}
        style={{ width: `${position + THUMB_SIZE}px` }}
      />

      {/* Bouton / thumb */}
      <button
        type="button"
        disabled={disabled}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={completed ? 100 : progress}
        aria-label={completed ? successText : text}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute left-1 top-1 z-10",
          "flex h-12 w-12 items-center justify-center",
          "rounded-full bg-primary text-primary-foreground",
          "shadow-md",
          "cursor-grab active:cursor-grabbing",
          "transition-[transform,background-color] duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          dragging && "transition-none",
          completed && "bg-green-600",
        )}
        style={{ transform: `translateX(${position}px)` }}
      >
        {completed ? (
          <Check className="size-5" />
        ) : (
          <ChevronRight className="size-5" />
        )}
      </button>

      {/* Texte de succès */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "text-sm font-semibold text-green-600",
          "pointer-events-none",
          "opacity-0 transition-opacity duration-200",
          completed && "opacity-100",
        )}
      >
        {successText}
      </div>
    </div>
  );
}