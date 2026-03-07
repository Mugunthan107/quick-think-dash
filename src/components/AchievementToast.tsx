import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  icon: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'brain_starter', title: 'Brain Starter', icon: '🧠', description: 'First game played!' },
  { id: 'speed_demon', title: 'Speed Demon', icon: '⚡', description: 'Solved under 5 seconds!' },
  { id: 'puzzle_addict', title: 'Puzzle Addict', icon: '🧩', description: '20 games played!' },
  { id: 'lucky_guess', title: 'Lucky Guess', icon: '🍀', description: 'Correct after wrong!' },
  { id: 'junior_einstein', title: 'Junior Einstein', icon: '👨‍🔬', description: 'High score achieved!' },
  { id: 'streak_master', title: 'Streak Master', icon: '🔥', description: '5 correct in a row!' },
  { id: 'perfect_round', title: 'Perfect Round', icon: '💎', description: 'All answers correct!' },
];

const shownAchievements = new Set<string>();

export const showAchievement = (achievementId: string) => {
  if (shownAchievements.has(achievementId)) return;
  const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
  if (!achievement) return;

  shownAchievements.add(achievementId);
  
  toast(
    `${achievement.icon} ${achievement.title}`,
    {
      description: achievement.description,
      duration: 3000,
      style: {
        background: 'linear-gradient(135deg, hsl(199 93% 96%), hsl(199 93% 90%))',
        border: '1.5px solid hsl(199 93% 70%)',
        color: 'hsl(221 39% 11%)',
      },
    }
  );
};

export const resetAchievements = () => shownAchievements.clear();

export default ACHIEVEMENTS;
