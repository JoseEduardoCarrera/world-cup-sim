import { GroupData, KnockoutMatch } from "./types";

export const INITIAL_GROUPS: Record<string, string[]> = {
  "A": ["Mexico", "South Africa", "South Korea", "Dinamarca"],
  "B": ["Canada", "Switzerland", "Qatar", "Italia"],
  "C": ["Brazil", "Morocco", "Scotland", "Haiti"],
  "D": ["USA", "Paraguay", "Australia", "Turquía"],
  "E": ["Germany", "Ecuador", "Ivory Coast", "Curacao"],
  "F": ["Netherlands", "Japan", "Tunisia", "Suecia"],
  "G": ["Belgium", "Egypt", "Iran", "New Zealand"],
  "H": ["Spain", "Uruguay", "Saudi Arabia", "Cape Verde"],
  "I": ["France", "Senegal", "Bolivia", "Norway"],
  "J": ["Argentina", "Algeria", "Austria", "Jordan"],
  "K": ["Portugal", "Colombia", "Uzbekistan", "Jamaica"],
  "L": ["England", "Croatia", "Panama", "Ghana"]
};

// Based on the user prompt mapping. 
// We assign IDs 73-88 to the R32 matches sequentially as they appeared in the prompt list.
export const R32_CONFIG: KnockoutMatch[] = [
  { id: '73', round: 'R32', homeSource: { type: 'group_runner_up', group: 'A' }, awaySource: { type: 'group_runner_up', group: 'B' } },
  { id: '74', round: 'R32', homeSource: { type: 'group_winner', group: 'E' }, awaySource: { type: 'group_third', validGroups: ['A', 'B', 'C', 'D', 'F'] } },
  { id: '75', round: 'R32', homeSource: { type: 'group_winner', group: 'F' }, awaySource: { type: 'group_runner_up', group: 'C' } },
  { id: '76', round: 'R32', homeSource: { type: 'group_winner', group: 'C' }, awaySource: { type: 'group_runner_up', group: 'F' } },
  { id: '77', round: 'R32', homeSource: { type: 'group_winner', group: 'I' }, awaySource: { type: 'group_third', validGroups: ['C', 'D', 'F', 'G', 'H'] } },
  { id: '78', round: 'R32', homeSource: { type: 'group_runner_up', group: 'E' }, awaySource: { type: 'group_runner_up', group: 'I' } },
  { id: '79', round: 'R32', homeSource: { type: 'group_winner', group: 'A' }, awaySource: { type: 'group_third', validGroups: ['C', 'E', 'F', 'H', 'I'] } },
  { id: '80', round: 'R32', homeSource: { type: 'group_winner', group: 'L' }, awaySource: { type: 'group_third', validGroups: ['E', 'H', 'I', 'J', 'K'] } },
  { id: '81', round: 'R32', homeSource: { type: 'group_winner', group: 'D' }, awaySource: { type: 'group_third', validGroups: ['B', 'E', 'F', 'I', 'J'] } },
  { id: '82', round: 'R32', homeSource: { type: 'group_winner', group: 'G' }, awaySource: { type: 'group_third', validGroups: ['A', 'E', 'H', 'I', 'J'] } },
  { id: '83', round: 'R32', homeSource: { type: 'group_runner_up', group: 'K' }, awaySource: { type: 'group_runner_up', group: 'L' } },
  { id: '84', round: 'R32', homeSource: { type: 'group_winner', group: 'H' }, awaySource: { type: 'group_runner_up', group: 'J' } },
  { id: '85', round: 'R32', homeSource: { type: 'group_winner', group: 'B' }, awaySource: { type: 'group_third', validGroups: ['E', 'F', 'G', 'I', 'J'] } },
  { id: '86', round: 'R32', homeSource: { type: 'group_winner', group: 'J' }, awaySource: { type: 'group_runner_up', group: 'H' } },
  { id: '87', round: 'R32', homeSource: { type: 'group_winner', group: 'K' }, awaySource: { type: 'group_third', validGroups: ['D', 'E', 'I', 'J', 'L'] } },
  { id: '88', round: 'R32', homeSource: { type: 'group_runner_up', group: 'D' }, awaySource: { type: 'group_runner_up', group: 'G' } },
];

// Based on the prompt logic for R16
export const R16_CONFIG: KnockoutMatch[] = [
  { id: '89', round: 'R16', homeSource: { type: 'match_winner', matchId: '74' }, awaySource: { type: 'match_winner', matchId: '77' } },
  { id: '90', round: 'R16', homeSource: { type: 'match_winner', matchId: '73' }, awaySource: { type: 'match_winner', matchId: '75' } },
  { id: '91', round: 'R16', homeSource: { type: 'match_winner', matchId: '76' }, awaySource: { type: 'match_winner', matchId: '78' } },
  { id: '92', round: 'R16', homeSource: { type: 'match_winner', matchId: '79' }, awaySource: { type: 'match_winner', matchId: '80' } },
  { id: '93', round: 'R16', homeSource: { type: 'match_winner', matchId: '83' }, awaySource: { type: 'match_winner', matchId: '84' } },
  { id: '94', round: 'R16', homeSource: { type: 'match_winner', matchId: '81' }, awaySource: { type: 'match_winner', matchId: '82' } },
  { id: '95', round: 'R16', homeSource: { type: 'match_winner', matchId: '86' }, awaySource: { type: 'match_winner', matchId: '88' } },
  { id: '96', round: 'R16', homeSource: { type: 'match_winner', matchId: '85' }, awaySource: { type: 'match_winner', matchId: '87' } },
];

export const QF_CONFIG: KnockoutMatch[] = [
  { id: '97', round: 'QF', homeSource: { type: 'match_winner', matchId: '90' }, awaySource: { type: 'match_winner', matchId: '89' } },
  { id: '98', round: 'QF', homeSource: { type: 'match_winner', matchId: '91' }, awaySource: { type: 'match_winner', matchId: '92' } },
  { id: '99', round: 'QF', homeSource: { type: 'match_winner', matchId: '94' }, awaySource: { type: 'match_winner', matchId: '93' } },
  { id: '100', round: 'QF', homeSource: { type: 'match_winner', matchId: '96' }, awaySource: { type: 'match_winner', matchId: '95' } },
];

export const SF_CONFIG: KnockoutMatch[] = [
  { id: '101', round: 'SF', homeSource: { type: 'match_winner', matchId: '97' }, awaySource: { type: 'match_winner', matchId: '98' } },
  { id: '102', round: 'SF', homeSource: { type: 'match_winner', matchId: '99' }, awaySource: { type: 'match_winner', matchId: '100' } },
];

export const FINAL_CONFIG: KnockoutMatch[] = [
  { id: '103', round: 'FINAL', homeSource: { type: 'match_winner', matchId: '101' }, awaySource: { type: 'match_winner', matchId: '102' } },
];
