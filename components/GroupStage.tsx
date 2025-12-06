import React from 'react';
import { Team, Match } from '../types';
import { PlayCircle, Shuffle } from 'lucide-react';

interface GroupStageProps {
  groups: Record<string, Team[]>;
  matches: Match[];
  onMatchUpdate: (matchId: string, homeScore: number, awayScore: number) => void;
  onSimulateGroup: (groupName: string) => void;
}

const GroupTable = ({ groupName, teams }: { groupName: string, teams: Team[] }) => (
  <div className="bg-slate-800 rounded-lg p-4 shadow-lg border border-slate-700">
    <h3 className="text-xl font-bold text-yellow-400 mb-2">Group {groupName}</h3>
    <table className="w-full text-sm text-left">
      <thead className="text-slate-400 border-b border-slate-700">
        <tr>
          <th className="py-2">Team</th>
          <th className="text-center">P</th>
          <th className="text-center">W</th>
          <th className="text-center">D</th>
          <th className="text-center">L</th>
          <th className="text-center">GD</th>
          <th className="text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((t, idx) => (
          <tr key={t.id} className={`border-b border-slate-700/50 ${idx < 2 ? 'bg-green-900/20' : ''} ${idx === 2 ? 'bg-blue-900/10' : ''}`}>
            <td className="py-2 font-medium flex items-center gap-2">
              <span className={`w-1 h-full block ${idx < 2 ? 'text-green-500' : idx === 2 ? 'text-blue-400' : 'text-slate-600'}`}>
                {idx + 1}
              </span>
              {t.name}
            </td>
            <td className="text-center">{t.played}</td>
            <td className="text-center">{t.won}</td>
            <td className="text-center">{t.drawn}</td>
            <td className="text-center">{t.lost}</td>
            <td className="text-center">{t.gf - t.ga}</td>
            <td className="text-center font-bold text-white">{t.pts}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const GroupMatches = ({ matches, onUpdate }: { matches: Match[], onUpdate: (id: string, h: number, a: number) => void }) => {
  return (
    <div className="grid gap-2 mt-2">
      {matches.map(m => (
        <div key={m.id} className="flex items-center justify-between text-xs bg-slate-900/50 p-2 rounded">
          <span className="w-1/3 text-right truncate pr-2">{m.home}</span>
          <div className="flex gap-1 items-center justify-center w-1/3">
             <input 
               type="number" 
               className="w-8 h-6 bg-slate-700 text-center rounded focus:ring-1 focus:ring-yellow-500 outline-none"
               value={m.homeScore ?? ''}
               onChange={(e) => onUpdate(m.id, parseInt(e.target.value) || 0, m.awayScore || 0)}
             />
             <span>-</span>
             <input 
               type="number" 
               className="w-8 h-6 bg-slate-700 text-center rounded focus:ring-1 focus:ring-yellow-500 outline-none"
               value={m.awayScore ?? ''}
               onChange={(e) => onUpdate(m.id, m.homeScore || 0, parseInt(e.target.value) || 0)}
             />
          </div>
          <span className="w-1/3 text-left truncate pl-2">{m.away}</span>
        </div>
      ))}
    </div>
  );
}

export const GroupStage: React.FC<GroupStageProps> = ({ groups, matches, onMatchUpdate, onSimulateGroup }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
      {Object.entries(groups).sort().map(([groupName, teams]) => {
        const groupMatches = matches.filter(m => m.group === groupName);
        return (
          <div key={groupName} className="flex flex-col gap-2">
            <GroupTable groupName={groupName} teams={teams as Team[]} />
            <div className="flex justify-end px-2">
              <button 
                onClick={() => onSimulateGroup(groupName)}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-yellow-400 transition-colors"
              >
                <Shuffle size={12} /> Quick Sim
              </button>
            </div>
            <GroupMatches matches={groupMatches} onUpdate={onMatchUpdate} />
          </div>
        );
      })}
    </div>
  );
};