import React, { useRef, useState } from "react";
import { Team } from "../types";
import {
  Trophy,
  Download,
  Share2,
  X,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Instagram,
} from "lucide-react";
import * as htmlToImage from "html-to-image";

interface WinnerModalProps {
  winner: Team;
  isOpen: boolean;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  winner,
  isOpen,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      "https://joseeduardocarrera.github.io/world-cup-sim/"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);

    try {
      const dataUrl = await htmlToImage.toPng(cardRef.current, {
        pixelRatio: 2, // mejora la nitidez
        cacheBust: true,
        backgroundColor: "transparent",
      });

      const link = document.createElement("a");
      link.download = `world-cup-winner-${winner.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center gap-6 max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Card */}
        <div
          ref={cardRef}
          className="w-full aspect-square bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-yellow-500/50 rounded-xl p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-yellow-500/10 blur-3xl pointer-events-none"></div>

          <div className="w-full h-full flex flex-col items-center justify-center relative">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

            <p className="text-yellow-500/80 font-bold tracking-widest uppercase text-xs mb-2">
              My World Cup 2026 Winner is
            </p>

            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 drop-shadow-lg">
              {winner.name}
            </h2>

            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mb-6 opacity-50"></div>

            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
              World Cup Simulator 2026 App
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 w-full animate-in slide-in-from-bottom-4 delay-100">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleCopy}
              className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full transition-colors relative cursor-pointer"
              aria-label="Copy Link"
            >
              <LinkIcon size={20} />

              {copied && (
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs text-white bg-green-600 p-2 rounded">
                  Copied
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isDownloading ? (
              <span className="animate-pulse">Generating Card...</span>
            ) : (
              <>
                <Download size={20} />
                Download Winner Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
