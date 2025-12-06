import React, { useMemo, useState } from "react";
import { KnockoutMatch, MatchSource, Team } from "../types";
import { Trophy, AlertCircle, Share2 } from "lucide-react";
import { WinnerModal } from "./WinnerModal";

interface BracketProps {
  matches: KnockoutMatch[];
  teams: Record<string, Team>;
  groups: Record<string, Team[]>;
  thirdPlaceIds: string[];
  onMatchUpdate: (matchId: string, winnerId: string, score: string) => void;
}

export const KnockoutBracket: React.FC<BracketProps> = ({
  matches,
  teams,
  groups,
  thirdPlaceIds,
  onMatchUpdate,
}) => {
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  // 1. Deterministic Backtracking Solver for 3rd Place Allocation
  // This simulates the fixed FIFA table by finding the first valid assignment
  // given the constraints. Since the search order is fixed, it is deterministic.
  const allocatedThirdPlaces = useMemo(() => {
    // 1. Get all matches that require a 3rd place team
    const r32Matches = matches
      .filter(
        (m) =>
          m.round === "R32" &&
          (m.homeSource.type === "group_third" ||
            m.awaySource.type === "group_third")
      )
      .sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Sort by ID to ensure fixed order

    // 2. Get the actual team objects for the selected IDs, sorted by Group ID (A, B, C...)
    const selectedTeams = thirdPlaceIds
      .map((id) => {
        // Find the team in the groups structure (groups are sorted by standing, so 3rd place is index 2)
        // But we just need to find the team object by ID from the `teams` map ideally,
        // or search the groups. 'teams' map is complete.
        return teams[id];
      })
      .filter(Boolean)
      .sort((a, b) => a.group.localeCompare(b.group)); // Fixed order: Group A team always tried before Group B team

    // 3. Backtracking Solver Function
    const solve = (
      matchIndex: number,
      usedTeamIds: Set<string>
    ): Record<string, Team> | null => {
      // Base case: All matches filled
      if (matchIndex === r32Matches.length) {
        return {};
      }

      const match = r32Matches[matchIndex];
      // Identify which side needs the 3rd place
      const isHomeThird = match.homeSource.type === "group_third";
      const source = isHomeThird ? match.homeSource : match.awaySource;
      const key = `${match.id}-${isHomeThird ? "home" : "away"}`;

      // If source is not actually group_third (shouldn't happen due to filter), skip
      if (source.type !== "group_third")
        return solve(matchIndex + 1, usedTeamIds);

      const validGroups = source.validGroups;

      // Find candidates for this specific match
      const candidates = selectedTeams.filter(
        (team) => !usedTeamIds.has(team.id) && validGroups.includes(team.group)
      );

      // Try each candidate
      for (const team of candidates) {
        // Recurse
        const newUsed = new Set(usedTeamIds);
        newUsed.add(team.id);

        const result = solve(matchIndex + 1, newUsed);

        if (result !== null) {
          // Solution found in this branch
          return { [key]: team, ...result };
        }
      }

      // No candidates worked for this branch
      return null;
    };

    // Run solver
    const solution = solve(0, new Set());

    // If no solution found (should not happen with valid 8/12 sets defined by FIFA), return empty
    return solution || {};
  }, [matches, teams, thirdPlaceIds]);

  // 2. Helper to get team for a specific match side
  const getTeam = (
    match: KnockoutMatch,
    side: "home" | "away"
  ): Team | null => {
    const source = side === "home" ? match.homeSource : match.awaySource;

    if (source.type === "group_third") {
      return allocatedThirdPlaces[`${match.id}-${side}`] || null;
    }

    if (source.type === "match_winner") {
      const m = matches.find((m) => m.id === source.matchId);
      return m?.winnerId ? teams[m.winnerId] : null;
    }

    if (source.type === "group_winner")
      return groups[source.group]?.[0] || null;
    if (source.type === "group_runner_up")
      return groups[source.group]?.[1] || null;

    return null;
  };

  // 3. Split matches into Left and Right trees
  const { leftMatches, rightMatches, finalMatch } = useMemo(() => {
    const final = matches.find((m) => m.round === "FINAL");
    if (!final) return { leftMatches: [], rightMatches: [], finalMatch: null };

    const traceUpstream = (rootId: string | undefined): Set<string> => {
      const set = new Set<string>();
      if (!rootId) return set;

      const stack = [rootId];
      while (stack.length) {
        const id = stack.pop()!;
        set.add(id);
        const m = matches.find((x) => x.id === id);
        if (m) {
          if (m.homeSource.type === "match_winner")
            stack.push(m.homeSource.matchId);
          if (m.awaySource.type === "match_winner")
            stack.push(m.awaySource.matchId);
        }
      }
      return set;
    };

    const leftRootId =
      final.homeSource.type === "match_winner"
        ? final.homeSource.matchId
        : null;
    const rightRootId =
      final.awaySource.type === "match_winner"
        ? final.awaySource.matchId
        : null;

    const leftIds = traceUpstream(leftRootId);
    const rightIds = traceUpstream(rightRootId);

    return {
      leftMatches: matches.filter((m) => leftIds.has(m.id)),
      rightMatches: matches.filter((m) => rightIds.has(m.id)),
      finalMatch: final,
    };
  }, [matches]);

  const MatchCard = ({
    match,
    isFinal = false,
  }: {
    match: KnockoutMatch;
    isFinal?: boolean;
  }) => {
    const homeTeam = getTeam(match, "home");
    const awayTeam = getTeam(match, "away");
    const hasTeams = homeTeam && awayTeam;
    const winner = match.winnerId ? teams[match.winnerId] : null;

    return (
      <div
        className={`
        bg-slate-800 border border-slate-700 rounded relative shadow-lg flex flex-col gap-0.5
        ${
          isFinal
            ? "p-3 w-56 scale-110 border-yellow-600/50 bg-slate-800/90 z-10"
            : "p-1.5 w-40"
        }
      `}
      >
        {!isFinal && (
          <>
            {/* Connectors */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-px bg-slate-700 opacity-50"></div>
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-px bg-slate-700 opacity-50"></div>
          </>
        )}

        <div className="flex justify-between items-center text-[9px] text-slate-500 uppercase mb-0.5 px-1">
          <span>#{match.id}</span>
          {isFinal && <Trophy size={10} className="text-yellow-500" />}
        </div>

        {[homeTeam, awayTeam].map((team, idx) => (
          <div
            key={idx}
            onClick={() =>
              hasTeams && team && onMatchUpdate(match.id, team.id, "1-0")
            }
            className={`
                flex items-center px-1.5 py-1 rounded cursor-pointer transition-colors text-xs
                ${
                  team?.id === winner?.id
                    ? "bg-green-600 text-white font-bold shadow-sm"
                    : "bg-slate-700/30 hover:bg-slate-700 text-slate-300"
                }
                ${!team ? "opacity-40" : ""}
              `}
          >
            <div className="flex items-center gap-1.5 overflow-hidden w-full">
              {team?.id === winner?.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
              )}
              <span className="truncate">{team?.name || "TBD"}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const hasTBD =
    Object.keys(allocatedThirdPlaces).length < 8 && thirdPlaceIds.length >= 8;
  const winner = finalMatch?.winnerId ? teams[finalMatch.winnerId] : null;

  return (
    <div className="w-full overflow-auto bg-slate-900/50 h-[85vh]">
      {hasTBD && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2">
          <AlertCircle size={16} />
          <span className="text-sm">
            Invalid 3rd Place Combination - No Valid Pattern Found
          </span>
        </div>
      )}

      {/* Container: min-w-fit ensures it expands to fit content without clipping left side when scrolled */}
      <div className="flex justify-center items-center min-w-fit mx-auto h-full px-4 py-8">
        {/* LEFT BRACKET */}
        <div className="flex gap-4">
          {["R32", "R16", "QF", "SF"].map((round) => (
            <div
              key={`left-${round}`}
              className="flex flex-col justify-around py-2"
            >
              <div className="text-center font-bold text-slate-600 text-[10px] uppercase mb-1 tracking-wider">
                {round}
              </div>
              {leftMatches
                .filter((m) => m.round === round)
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
            </div>
          ))}
        </div>

        {/* CENTER FINAL */}
        <div className="flex flex-col justify-center items-center px-4 shrink-0 gap-6">
          <div className="text-center">
            <Trophy className="w-10 h-10 text-yellow-500 mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
            <h2 className="text-sm font-bold text-white mt-1 uppercase tracking-widest">
              Final
            </h2>
          </div>

          {finalMatch ? (
            <MatchCard match={finalMatch} isFinal />
          ) : (
            <div className="text-slate-500 text-xs">Loading...</div>
          )}

          {winner && (
            <button
              onClick={() => setShowWinnerModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-yellow-500/20 transform hover:scale-105 transition-all"
            >
              <Share2 size={14} />
              <span>Share Winner</span>
            </button>
          )}
        </div>

        {/* RIGHT BRACKET (Reversed Order) */}
        <div className="flex gap-4">
          {["SF", "QF", "R16", "R32"].map((round) => (
            <div
              key={`right-${round}`}
              className="flex flex-col justify-around py-2"
            >
              <div className="text-center font-bold text-slate-600 text-[10px] uppercase mb-1 tracking-wider">
                {round}
              </div>
              {rightMatches
                .filter((m) => m.round === round)
                .map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
            </div>
          ))}
        </div>
      </div>

      {winner && (
        <WinnerModal
          winner={winner}
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
        />
      )}
    </div>
  );
};
