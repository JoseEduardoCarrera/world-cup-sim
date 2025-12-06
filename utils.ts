import { Team, Match } from "./types";

export function generateTeamsAndMatches(initialGroups: Record<string, string[]>) {
  const teams: Record<string, Team> = {};
  const matches: Match[] = [];
  
  Object.entries(initialGroups).forEach(([groupName, teamNames]) => {
    // Initialize Teams
    teamNames.forEach(name => {
      teams[name] = {
        id: name,
        name,
        group: groupName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        pts: 0
      };
    });

    // Create Round Robin Matches
    for (let i = 0; i < teamNames.length; i++) {
      for (let j = i + 1; j < teamNames.length; j++) {
        matches.push({
          id: `${groupName}-${teamNames[i]}-${teamNames[j]}`,
          group: groupName,
          home: teamNames[i],
          away: teamNames[j],
          homeScore: null,
          awayScore: null,
          isFinished: false
        });
      }
    }
  });

  return { teams, matches };
}

export function calculateStandings(teams: Record<string, Team>, matches: Match[]): Record<string, Team[]> {
  // Reset stats
  const tempTeams = JSON.parse(JSON.stringify(teams)) as Record<string, Team>;
  
  matches.forEach(m => {
    if (m.isFinished && m.homeScore !== null && m.awayScore !== null) {
      const h = tempTeams[m.home];
      const a = tempTeams[m.away];

      h.played++;
      a.played++;
      h.gf += m.homeScore;
      h.ga += m.awayScore;
      a.gf += m.awayScore;
      a.ga += m.homeScore;

      if (m.homeScore > m.awayScore) {
        h.won++;
        h.pts += 3;
        a.lost++;
      } else if (m.homeScore < m.awayScore) {
        a.won++;
        a.pts += 3;
        h.lost++;
      } else {
        h.drawn++;
        h.pts++;
        a.drawn++;
        a.pts++;
      }
    }
  });

  const groupings: Record<string, Team[]> = {};
  
  Object.values(tempTeams).forEach(t => {
    if (!groupings[t.group]) groupings[t.group] = [];
    groupings[t.group].push(t);
  });

  // Sort
  Object.keys(groupings).forEach(g => {
    groupings[g].sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const gdA = a.gf - a.ga;
      const gdB = b.gf - b.ga;
      if (gdB !== gdA) return gdB - gdA;
      return b.gf - a.gf;
    });
  });

  return groupings;
}
