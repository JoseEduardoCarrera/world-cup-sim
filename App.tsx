import React, { useState, useMemo } from 'react';
import { INITIAL_GROUPS, R32_CONFIG, R16_CONFIG, QF_CONFIG, SF_CONFIG, FINAL_CONFIG } from './constants';
import { generateTeamsAndMatches, calculateStandings } from './utils';
import { GroupStage } from './components/GroupStage';
import { ThirdPlaceSelection } from './components/ThirdPlaceSelection';
import { KnockoutBracket } from './components/KnockoutBracket';
import { Trophy, Users, GitBranch } from 'lucide-react';
import { Match, KnockoutMatch } from './types';

enum Phase {
  GROUPS = 'GROUPS',
  THIRD_SELECTION = 'THIRD_SELECTION',
  KNOCKOUT = 'KNOCKOUT'
}

export default function App() {
  // --- State ---
  const [phase, setPhase] = useState<Phase>(Phase.GROUPS);
  
  // Initialize data once
  const [data, setData] = useState(() => generateTeamsAndMatches(INITIAL_GROUPS));
  const [selectedThirdPlaceIds, setSelectedThirdPlaceIds] = useState<string[]>([]);
  
  const [knockoutMatches, setKnockoutMatches] = useState<KnockoutMatch[]>([
    ...R32_CONFIG, ...R16_CONFIG, ...QF_CONFIG, ...SF_CONFIG, ...FINAL_CONFIG
  ]);

  // --- Derived State ---
  const standings = useMemo(() => calculateStandings(data.teams, data.matches), [data]);
  
  // --- Handlers ---

  const updateGroupMatch = (matchId: string, homeScore: number, awayScore: number) => {
    setData(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === matchId ? { ...m, homeScore, awayScore, isFinished: true } : m)
    }));
  };

  const simulateGroup = (groupName: string) => {
    setData(prev => ({
      ...prev,
      matches: prev.matches.map(m => {
        if (m.group === groupName && !m.isFinished) {
          // Weighted random roughly based on nothing since we don't have seed data, just purely random for sandbox
          const h = Math.floor(Math.random() * 4); 
          const a = Math.floor(Math.random() * 4);
          return { ...m, homeScore: h, awayScore: a, isFinished: true };
        }
        return m;
      })
    }));
  };

  const handleThirdPlaceToggle = (id: string) => {
    if (selectedThirdPlaceIds.includes(id)) {
      setSelectedThirdPlaceIds(prev => prev.filter(tid => tid !== id));
    } else if (selectedThirdPlaceIds.length < 8) {
      setSelectedThirdPlaceIds(prev => [...prev, id]);
    }
  };

  const updateKnockoutMatch = (matchId: string, winnerId: string, score: string) => {
     setKnockoutMatches(prev => prev.map(m => m.id === matchId ? { ...m, winnerId, score } : m));
  };

  // --- Navigation & Helpers ---

  const allGroupMatchesFinished = data.matches.every(m => m.isFinished);
  
  // Get all 3rd place teams sorted by performance
  const thirdPlaceCandidates = useMemo(() => {
    return Object.values(standings).map(groupTeams => groupTeams[2]).sort((a, b) => {
      // Sort by points, then GD, then GF
      if (b.pts !== a.pts) return b.pts - a.pts;
      if ((b.gf - b.ga) !== (a.gf - a.ga)) return (b.gf - b.ga) - (a.gf - a.ga);
      return b.gf - a.gf;
    });
  }, [standings]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Trophy className="text-yellow-500 w-8 h-8" />
             <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
               World Cup Simulator 2026
             </h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPhase(Phase.GROUPS)}
              className={`p-2 rounded-lg flex items-center gap-2 ${phase === Phase.GROUPS ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Users size={18} /> <span className="hidden md:inline">Group Stage</span>
            </button>
            <button 
              onClick={() => setPhase(Phase.THIRD_SELECTION)}
              className={`p-2 rounded-lg flex items-center gap-2 ${phase === Phase.THIRD_SELECTION ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <Users size={18} /> <span className="hidden md:inline">3rd Place</span>
            </button>
            <button 
              onClick={() => setPhase(Phase.KNOCKOUT)}
              className={`p-2 rounded-lg flex items-center gap-2 ${phase === Phase.KNOCKOUT ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <GitBranch size={18} /> <span className="hidden md:inline">Bracket</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-hidden">
        {phase === Phase.GROUPS && (
          <div className="max-w-7xl mx-auto">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-white">Group Stage</h2>
               {!allGroupMatchesFinished && (
                 <button 
                    onClick={() => Object.keys(INITIAL_GROUPS).forEach(g => simulateGroup(g))}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold shadow-lg transition-all"
                 >
                   Simulate All Groups
                 </button>
               )}
               {allGroupMatchesFinished && (
                  <button 
                    onClick={() => setPhase(Phase.THIRD_SELECTION)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg transition-all animate-pulse"
                  >
                    Proceed to 3rd Place Selection
                  </button>
               )}
             </div>
             <GroupStage 
               groups={standings} 
               matches={data.matches} 
               onMatchUpdate={updateGroupMatch}
               onSimulateGroup={simulateGroup}
             />
          </div>
        )}

        {phase === Phase.THIRD_SELECTION && (
          <ThirdPlaceSelection 
            candidates={thirdPlaceCandidates} 
            selectedIds={selectedThirdPlaceIds}
            onToggle={handleThirdPlaceToggle}
            onConfirm={() => setPhase(Phase.KNOCKOUT)}
          />
        )}

        {phase === Phase.KNOCKOUT && (
          <div className="h-full">
            <h2 className="text-2xl font-bold text-white mb-4 ml-8">Knockout Stage</h2>
            <KnockoutBracket 
              matches={knockoutMatches}
              teams={data.teams}
              groups={standings}
              thirdPlaceIds={selectedThirdPlaceIds}
              onMatchUpdate={updateKnockoutMatch}
            />
          </div>
        )}
      </main>
    </div>
  );
}