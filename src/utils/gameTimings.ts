export const DEFAULT_TIMINGS = [
  {
    id: 'numpuzzle',
    game: 'Number Puzzle',
    levels: [
      { id: '1-15', range: '1 - 15', limit: 10 },
      { id: '16-20', range: '16 - 20', limit: 5 }
    ]
  },
  {
    id: 'colorsort',
    game: 'Water Color Sort',
    levels: [
      { id: '1-5', range: '1 - 5', limit: 30 },
      { id: '6-10', range: '6 - 10', limit: 40 },
      { id: '11-15', range: '11 - 15', limit: 45 },
      { id: '16-20', range: '16 - 20', limit: 50 },
    ]
  },
  {
    id: 'numlink',
    game: 'NumLink',
    levels: [
      { id: 'l1', range: '1 - 5 (Level 1)', limit: 15 },
      { id: 'l2', range: '6 - 10 (Level 2)', limit: 25 },
      { id: 'l3', range: '11 - 15 (Level 3)', limit: 30 },
      { id: 'l4', range: '16 - 20 (Level 4)', limit: 40 },
    ]
  },
  {
    id: 'aptirush',
    game: 'AptiRush',
    levels: [
      { id: 'all', range: 'All 20 Questions', limit: 10 }
    ]
  },
  {
    id: 'bubble',
    game: 'Bubble Sort',
    levels: [
      { id: '1-10', range: '1 - 10', limit: 10 },
      { id: '11-20', range: '11 - 20', limit: 7 },
      { id: '21-30', range: '21 - 30', limit: 5 },
    ]
  },
  {
    id: 'crossmath',
    game: 'CrossMath',
    levels: [
      { id: '1-5', range: '1 - 5', limit: 10 },
      { id: '6-10', range: '6 - 10', limit: 15 },
      { id: '11-15', range: '11 - 15', limit: 20 },
      { id: '16-20', range: '16 - 20', limit: 25 },
    ]
  },
  {
    id: 'mirror',
    game: 'Mirror Image',
    levels: [
      { id: '1-10', range: '1 - 10', limit: 10 },
      { id: '11-20', range: '11 - 20', limit: 5 },
    ]
  },
  {
    id: 'waterimage',
    game: 'Water Image',
    levels: [
      { id: '1-10', range: '1 - 10', limit: 10 },
      { id: '11-20', range: '11 - 20', limit: 5 },
    ]
  },
  {
    id: 'numberseries',
    game: 'Number Series',
    levels: [
      { id: '1-5', range: '1 - 5', limit: 8 },
      { id: '6-10', range: '6 - 10', limit: 7 },
      { id: '11-15', range: '11 - 15', limit: 6 },
      { id: '16-20', range: '16 - 20', limit: 5 },
    ]
  },
  {
    id: 'motion',
    game: 'Motion Challenge',
    levels: [
      { id: 'all', range: 'All 10 Levels', limit: 30 }
    ]
  },
  {
    id: 'thugofwar',
    game: 'Thug of War',
    levels: [
      { id: 'all', range: 'All Questions', limit: 10 }
    ]
  }
];

export function getCustomTimings() {
  const stored = localStorage.getItem('game_timings_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse timings', e);
    }
  }
  return DEFAULT_TIMINGS;
}

export function getGameTimeLimit(gameId: string, levelOrRoundIndex: number): number {
  const timings = getCustomTimings();
  const gameConfig = timings.find((g: any) => g.id === gameId);
  if (!gameConfig) return 10; // Fallback

  const roundNum = levelOrRoundIndex + 1; // 1-based index

  if (gameId === 'aptirush' || gameId === 'motion' || gameId === 'thugofwar') {
    // Only one level group
    return gameConfig.levels[0]?.limit || 10;
  }

  // CrossMath, NumPuzzle, Bubble Sort, Number Series, Mirror, Water
  if (gameId === 'bubble') {
    if (roundNum <= 10) return gameConfig.levels.find((l: any) => l.id === '1-10')?.limit || 10;
    if (roundNum <= 20) return gameConfig.levels.find((l: any) => l.id === '11-20')?.limit || 7;
    return gameConfig.levels.find((l: any) => l.id === '21-30')?.limit || 5;
  }

  if (gameId === 'numpuzzle') {
    if (roundNum <= 15) return gameConfig.levels.find((l: any) => l.id === '1-15')?.limit || 10;
    return gameConfig.levels.find((l: any) => l.id === '16-20')?.limit || 5;
  }

  if (gameId === 'colorsort') {
    if (roundNum <= 5) return gameConfig.levels.find((l: any) => l.id === '1-5')?.limit || 30;
    if (roundNum <= 10) return gameConfig.levels.find((l: any) => l.id === '6-10')?.limit || 40;
    if (roundNum <= 15) return gameConfig.levels.find((l: any) => l.id === '11-15')?.limit || 45;
    return gameConfig.levels.find((l: any) => l.id === '16-20')?.limit || 50;
  }

  if (gameId === 'numlink') {
    const levelIndex = Math.floor(levelOrRoundIndex / 5); // 0, 1, 2, 3
    if (levelIndex === 0) return gameConfig.levels.find((l: any) => l.id === 'l1')?.limit || 15;
    if (levelIndex === 1) return gameConfig.levels.find((l: any) => l.id === 'l2')?.limit || 25;
    if (levelIndex === 2) return gameConfig.levels.find((l: any) => l.id === 'l3')?.limit || 30;
    return gameConfig.levels.find((l: any) => l.id === 'l4')?.limit || 40;
  }

  if (gameId === 'crossmath') {
    if (roundNum <= 5) return gameConfig.levels.find((l: any) => l.id === '1-5')?.limit || 10;
    if (roundNum <= 10) return gameConfig.levels.find((l: any) => l.id === '6-10')?.limit || 15;
    if (roundNum <= 15) return gameConfig.levels.find((l: any) => l.id === '11-15')?.limit || 20;
    return gameConfig.levels.find((l: any) => l.id === '16-20')?.limit || 25;
  }

  if (gameId === 'mirror' || gameId === 'waterimage') {
    if (roundNum <= 10) return gameConfig.levels.find((l: any) => l.id === '1-10')?.limit || 10;
    return gameConfig.levels.find((l: any) => l.id === '11-20')?.limit || 5;
  }

  if (gameId === 'numberseries') {
    if (roundNum <= 5) return gameConfig.levels.find((l: any) => l.id === '1-5')?.limit || 8;
    if (roundNum <= 10) return gameConfig.levels.find((l: any) => l.id === '6-10')?.limit || 7;
    if (roundNum <= 15) return gameConfig.levels.find((l: any) => l.id === '11-15')?.limit || 6;
    return gameConfig.levels.find((l: any) => l.id === '16-20')?.limit || 5;
  }

  // Default
  return 10;
}
