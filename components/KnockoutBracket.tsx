import React, { useMemo } from "react";
import { KnockoutMatch, MatchSource, Team } from "../types";
import { Trophy } from "lucide-react";

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
  // 1. Resolve 3rd place allocations
  // We determine which 3rd place team goes to which match slot based on availability and config.
  const allocatedThirdPlaces = useMemo(() => {
    const allocation: Record<string, Team> = {};
    const usedIds = new Set<string>();

    // Process R32 matches to fill 3rd place slots
    // Sort by ID to ensure deterministic allocation
    const r32Matches = matches
      .filter((m) => m.round === "R32")
      .sort((a, b) => a.id.localeCompare(b.id));

    r32Matches.forEach((match) => {
      [match.homeSource, match.awaySource].forEach((source, idx) => {
        if (source.type === "group_third") {
          // Find valid candidates from the user's selected 3rd place teams
          const candidates = source.validGroups
            .map((g) => groups[g]?.[2])
            .filter(
              (t) => t && thirdPlaceIds.includes(t.id) && !usedIds.has(t.id)
            );

          if (candidates.length > 0) {
            // Pick the first valid candidate (simple heuristic for sandbox)
            const selected = candidates[0];
            const key = `${match.id}-${idx === 0 ? "home" : "away"}`;
            allocation[key] = selected;
            usedIds.add(selected.id);
          }
        }
      });
    });
    return allocation;
  }, [matches, groups, thirdPlaceIds]);

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

    // Recursive helper to find all upstream match IDs
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

  return (
    <div className="w-full overflow-auto bg-slate-900/50 h-[85vh]">
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
        <div className="flex flex-col justify-center items-center px-4 shrink-0">
          <div className="mb-4 text-center">
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
    </div>
  );
};
