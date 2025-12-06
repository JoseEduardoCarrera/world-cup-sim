import React from 'react';
import { KnockoutMatch, MatchSource, Team } from '../types';
import { Trophy, ChevronRight } from 'lucide-react';

interface BracketProps {
  matches: KnockoutMatch[];
  teams: Record<string, Team>;
  groups: Record<string, Team[]>;
  thirdPlaceIds: string[];
  onMatchUpdate: (matchId: string, winnerId: string, score: string) => void;
}

// Group matches by round
const ROUNDS = ['R32', 'R16', 'QF', 'SF', 'FINAL'];

export const KnockoutBracket: React.FC<BracketProps> = ({ matches, teams, groups, thirdPlaceIds, onMatchUpdate }) => {
  const getTeamForSource = (source: MatchSource): Team | null => {
    if (source.type === 'match_winner') {
      const m = matches.find(m => m.id === source.matchId);
      return m?.winnerId ? teams[m.winnerId] : null;
    }
    
    // Group logic needs sorted groups
    // Ideally we pass calculated standings or just recalculate casually here since they are frozen
    // But in App.tsx we passed `groups` as sorted lists.
    
    if (source.type === 'group_winner') {
      return groups[source.group]?.[0] || null;
    }
    if (source.type === 'group_runner_up') {
      return groups[source.group]?.[1] || null;
    }
    // Third place is tricky, we need the UI to let us pick IF there are multiple options
    // BUT the prompt implies specific slots. 
    // In this implementation, if source is 'group_third', we verify if the slot is filled by the bracket logic
    // For now, let's implement the 'selection' logic within the match card if it's a 3rd place slot
    return null; 
  };
  
  // Custom resolver for 3rd place logic which is complex
  // If a match needs a 3rd place team, we check the validGroups list.
  // We find the FIRST available team from validGroups that was selected by the user.
  // In a real app this uses a constraint table. Here we use a heuristic:
  // Find first team in validGroups list that is in thirdPlaceIds.
  // If multiple match, we might need a manual picker, but let's automate for sandbox simplicity:
  // We need to ensure we don't pick the SAME team for two matches.
  // This requires a global allocation map.
  
  // Let's build the allocation map once on render
  const allocatedThirdPlaces: Record<string, Team> = {}; 
  const usedThirdPlaceIds = new Set<string>();

  // Pre-calculate 3rd place slots for R32 matches
  matches.filter(m => m.round === 'R32').forEach(match => {
     [match.homeSource, match.awaySource].forEach((source, idx) => {
        if (source.type === 'group_third') {
           // Find a candidate
           const candidates = source.validGroups
             .map(g => groups[g]?.[2]) // Get the actual 3rd place team object
             .filter(t => t && thirdPlaceIds.includes(t.id) && !usedThirdPlaceIds.has(t.id));
           
           if (candidates.length > 0) {
              const selected = candidates[0];
              const key = `${match.id}-${idx}`; // unique slot key
              allocatedThirdPlaces[key] = selected;
              usedThirdPlaceIds.add(selected.id);
           }
        }
     });
  });

  const getTeam = (match: KnockoutMatch, side: 'home' | 'away'): Team | null => {
    // If winner determined manually in state (from props), return it? 
    // No, props.matches only stores outcome. We need input participants.
    
    const source = side === 'home' ? match.homeSource : match.awaySource;
    
    if (source.type === 'group_third') {
      return allocatedThirdPlaces[`${match.id}-${side === 'home' ? 0 : 1}`] || null;
    }
    
    return getTeamForSource(source);
  };

  return (
    <div className="flex flex-nowrap overflow-x-auto gap-8 p-8 min-h-[80vh]">
      {ROUNDS.map((round) => {
        const roundMatches = matches.filter(m => m.round === round);
        if (roundMatches.length === 0) return null;

        return (
          <div key={round} className="flex flex-col justify-around min-w-[300px] gap-4">
             <h3 className="text-center font-bold text-yellow-500 uppercase tracking-widest mb-4 sticky top-0 bg-slate-900 py-2 z-10">{round}</h3>
             {roundMatches.map(match => {
               const homeTeam = getTeam(match, 'home');
               const awayTeam = getTeam(match, 'away');
               const hasTeams = homeTeam && awayTeam;
               const winner = match.winnerId ? teams[match.winnerId] : null;

               return (
                 <div key={match.id} className="bg-slate-800 border border-slate-700 rounded-lg p-3 relative shadow-lg flex flex-col gap-2">
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-px bg-slate-700"></div>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-px bg-slate-700"></div>
                    
                    {/* Header with Match ID */}
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase">
                       <span>Match {match.id}</span>
                    </div>

                    {/* Teams */}
                    <div className="flex flex-col gap-1">
                      {[homeTeam, awayTeam].map((team, idx) => (
                        <div 
                          key={idx}
                          onClick={() => hasTeams && team && onMatchUpdate(match.id, team.id, "1-0")}
                          className={`
                            flex justify-between items-center p-2 rounded cursor-pointer transition-colors
                            ${team?.id === winner?.id ? 'bg-green-600 text-white' : 'bg-slate-700/50 hover:bg-slate-700'}
                            ${!team ? 'opacity-50' : ''}
                          `}
                        >
                           <span className="font-medium truncate max-w-[140px]">{team?.name || "TBD"}</span>
                           {team?.id === winner?.id && <span className="text-xs font-bold">{match.score || "W"}</span>}
                        </div>
                      ))}
                    </div>
                 </div>
               );
             })}
          </div>
        );
      })}
    </div>
  );
};