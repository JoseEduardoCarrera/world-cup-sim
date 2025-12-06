import React from "react";
import { Team } from "../types";
import { CheckCircle2, Circle } from "lucide-react";

interface ThirdPlaceProps {
  candidates: Team[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
}

export const ThirdPlaceSelection: React.FC<ThirdPlaceProps> = ({
  candidates,
  selectedIds,
  onToggle,
  onConfirm,
}) => {
  const remaining = 8 - selectedIds.length;
  const canConfirm = remaining === 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Select Best 3rd Place Teams
        </h2>
        <p className="text-slate-400">
          The 8 best performing 3rd place teams advance to the Round of 32.
        </p>
        <div
          className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${
            canConfirm
              ? "bg-green-500/20 text-green-400"
              : "bg-yellow-500/20 text-yellow-400"
          }`}
        >
          <span className="font-bold">{remaining}</span> slots remaining
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {candidates.map((team, idx) => {
          const isSelected = selectedIds.includes(team.id);
          const isDisabled = !isSelected && remaining === 0;

          return (
            <div
              key={team.id}
              onClick={() => !isDisabled && onToggle(team.id)}
              className={`
                relative p-4 rounded-lg border cursor-pointer transition-all
                ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : isDisabled
                    ? "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-slate-700/30 border-slate-600 hover:bg-slate-700 hover:border-slate-500"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-slate-500 w-6">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white">
                      {team.name}
                    </h4>
                    <div className="text-xs text-slate-400 flex gap-3">
                      <span>Group {team.group}</span>
                      <span>{team.pts} pts</span>
                      <span>{team.gf - team.ga} GD</span>
                      <span>{team.gf} GF</span>
                    </div>
                  </div>
                </div>
                <div>
                  {isSelected ? (
                    <CheckCircle2 className="text-blue-400" />
                  ) : (
                    <Circle className="text-slate-600" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          disabled={!canConfirm}
          onClick={onConfirm}
          className={`
            px-8 py-3 rounded-lg font-bold text-lg transition-all
            ${
              canConfirm
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/50 cursor-pointer"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }
          `}
        >
          Confirm & Start Knockout Stage
        </button>
      </div>
    </div>
  );
};
