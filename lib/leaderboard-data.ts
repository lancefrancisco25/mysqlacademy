export interface LeaderboardEntry {
  id: string;
  name: string;
  avatarSeed: string;
  track: string;
  completedLessons: number;
  completedTasks: number;
  streakDays: number;
  scoreAllTime: number;
  scoreThisWeek: number;
  isCurrentUser?: boolean;
}

export const MOCK_STUDENTS: LeaderboardEntry[] = [
  {
    id: "stu-1",
    name: "Samantha Cruz",
    avatarSeed: "SamanthaCruz",
    track: "Transactions",
    completedLessons: 6,
    completedTasks: 16,
    streakDays: 14,
    scoreAllTime: 1480,
    scoreThisWeek: 420,
  },
  {
    id: "stu-2",
    name: "Ethan Brooks",
    avatarSeed: "EthanBrooks",
    track: "Indexing",
    completedLessons: 6,
    completedTasks: 15,
    streakDays: 11,
    scoreAllTime: 1390,
    scoreThisWeek: 380,
  },
  {
    id: "stu-3",
    name: "Maria Santos",
    avatarSeed: "MariaSantos",
    track: "Joins & Subqueries",
    completedLessons: 5,
    completedTasks: 13,
    streakDays: 9,
    scoreAllTime: 1180,
    scoreThisWeek: 310,
  },
  {
    id: "stu-4",
    name: "Alex Rivera",
    avatarSeed: "AlexRivera",
    track: "Aggregations",
    completedLessons: 4,
    completedTasks: 11,
    streakDays: 8,
    scoreAllTime: 990,
    scoreThisWeek: 260,
  },
  {
    id: "stu-5",
    name: "David Kim",
    avatarSeed: "DavidKim",
    track: "CRUD Operations",
    completedLessons: 3,
    completedTasks: 9,
    streakDays: 6,
    scoreAllTime: 840,
    scoreThisWeek: 210,
  },
  {
    id: "stu-6",
    name: "Airus Reyes",
    avatarSeed: "AirusReyes",
    track: "Relational Foundations",
    completedLessons: 3,
    completedTasks: 8,
    streakDays: 5,
    scoreAllTime: 760,
    scoreThisWeek: 180,
  },
  {
    id: "stu-7",
    name: "Carlos Mendoza",
    avatarSeed: "CarlosMendoza",
    track: "Schema Evolution",
    completedLessons: 2,
    completedTasks: 7,
    streakDays: 4,
    scoreAllTime: 650,
    scoreThisWeek: 150,
  },
  {
    id: "stu-8",
    name: "Bianca Tan",
    avatarSeed: "BiancaTan",
    track: "Joins & Subqueries",
    completedLessons: 2,
    completedTasks: 6,
    streakDays: 3,
    scoreAllTime: 590,
    scoreThisWeek: 120,
  },
  {
    id: "stu-9",
    name: "Gabriel Cruz",
    avatarSeed: "GabrielCruz",
    track: "CRUD Operations",
    completedLessons: 2,
    completedTasks: 5,
    streakDays: 2,
    scoreAllTime: 480,
    scoreThisWeek: 90,
  },
  {
    id: "stu-10",
    name: "Hannah Morales",
    avatarSeed: "HannahMorales",
    track: "Relational Foundations",
    completedLessons: 1,
    completedTasks: 3,
    streakDays: 1,
    scoreAllTime: 320,
    scoreThisWeek: 60,
  },
];
