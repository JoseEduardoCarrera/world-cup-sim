export interface Team {
  id: string;
  name: string;
  group: string;
  // Stats
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  pts: number;
}

export interface GroupData {
  name: string;
  teams: string[]; // Team IDs
}

export interface Match {
  id: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  group: string;
  isFinished: boolean;
}

export interface KnockoutMatch {
  id: string; // e.g., "73", "81"
  round: 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL';
  homeSource: MatchSource;
  awaySource: MatchSource;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  winnerId?: string | null;
  score?: string; // "2-1"
  prediction?: string; // AI prediction
}

export type MatchSource = 
  | { type: 'group_winner'; group: string }
  | { type: 'group_runner_up'; group: string }
  | { type: 'group_third'; validGroups: string[] }
  | { type: 'match_winner'; matchId: string };
