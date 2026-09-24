export type Branch = 
  | 'CSE'
  | 'CSE (AI & ML)'
  | 'IT' 
  | 'ECE' 
  | 'Mechanical' 
  | 'Electrical' 
  | 'Civil' 
  | 'Chemical'
  | 'Textile'
  | 'Biotechnology'
  | 'Aerospace'
  | 'Agriculture'
  | 'Automobile'
  | 'Other';
export type AcademicSession = '2026–27';
export type Year = 'B.Tech 1st Year';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';
export type QuestionType = 'MCQ' | 'Numerical' | 'Conceptual' | 'Code-based' | 'Mixed';

export interface Subject {
  subjectId: string;
  subjectName: string;
  code: string;
  category: string;
  branch: Branch;
  applicableBranches?: Branch[];
  year: Year;
  semester: number;
  academicSession: AcademicSession;
  description: string;
  officialSource: string;
  lastVerified: string;
  status: 'verified' | 'pending_review' | 'draft';
  units: Unit[];
}

export interface Unit {
  unitNumber: number;
  unitTitle: string;
  topics: string[];
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  subjectId: string;
  unit: number;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  sourceContext: string;
  generatedAt: string;
  isAiGenerated: boolean;
}

export const MASTER_ADMIN_EMAILS = [
  'infosphere569@gmail.com',
  'ayushgupt640@gmail.com',
] as const;

export type UserRole = 'student' | 'subadmin' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'banned';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  university: string;
  collegeName?: string;
  academicSession: AcademicSession;
  year: Year;
  branch: Branch;
  studyGoals: string[];
  dailyQuestionsTarget: number;
  dailyMinutesTarget: number;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  questionsSolved: number;
  accuracy: number;
  battlesPlayed: number;
  battlesWon: number;
  battlesLost: number;
  subjectStats: {
    [subjectId: string]: {
      solved: number;
      correct: number;
      xp?: number;
    };
  };
  achievements: string[];
  isOnboarded: boolean;
  role: UserRole;
  status?: AccountStatus;
  isBanned?: boolean;
  banReason?: string;
  bannedAt?: string;
  bannedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LiveStats {
  studentsOnline: number;
  questionsSolvedToday: number;
  activeBattles: number;
  aiQuestionsGenerated: number;
}

export interface BattleSession {
  battleId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionCount: number;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  player1: {
    uid: string;
    displayName: string;
    branch: string;
    score: number;
    currentQuestionIndex: number;
    isFinished: boolean;
    answers?: { [qIndex: number]: boolean };
  };
  player2?: {
    uid: string;
    displayName: string;
    branch: string;
    score: number;
    currentQuestionIndex: number;
    isFinished: boolean;
    answers?: { [qIndex: number]: boolean };
  } | null;
  questions: Question[];
  winnerId?: string | null;
  createdAt: string;
}

export interface BattleQuestionRecord {
  questionId?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  selectedOption: string | null;
  isCorrect: boolean;
  timeTakenSeconds?: number;
}

export interface UserBattleRecord {
  id: string;
  battleId: string;
  userId: string;
  mode: 'multiplayer' | 'solo';
  subjectId: string;
  subjectName: string;
  topic?: string;
  difficulty: string;
  myScore: number;
  opponentScore?: number;
  opponentUid?: string;
  opponentName?: string;
  opponentBranch?: string;
  opponentCollege?: string;
  result: 'won' | 'lost' | 'tied';
  xpEarned: number;
  questions: BattleQuestionRecord[];
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  conditionType: 'battles' | 'questions' | 'streak' | 'xp' | 'accuracy';
  conditionValue: number;
}

export interface PlatformBroadcast {
  id: string;
  title: string;
  message: string;
  targetBranch: string;
  priority?: 'normal' | 'important' | 'urgent';
  sender?: string;
  senderRole?: string;
  actionTab?: AppTab;
  imageUrl?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface PromotionPopup {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  badgeText?: string;
  actionUrl?: string;
  actionButtonText?: string;
  displaySeconds?: number;
  isActive: boolean;
  priority?: number;
  clickCount?: number;
  viewCount?: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface AppNotification {
  id: string;
  userId?: string;
  type: 'battle_challenge' | 'streak_reminder' | 'achievement' | 'battle_result' | 'system' | 'broadcast' | 'community_reply' | 'community_tag';
  title: string;
  message: string;
  read: boolean;
  priority?: 'normal' | 'important' | 'urgent';
  createdAt: string;
  actionTab?: AppTab;
  imageUrl?: string;
  actionUrl?: string;
  postId?: string;
  commentId?: string;
  battleId?: string;
  fromUserName?: string;
  fromUserId?: string;
  fromUserBranch?: string;
  fromUserCollege?: string;
  subjectId?: string;
  subjectName?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  status?: 'pending' | 'accepted' | 'declined';
}

export interface RecentOpponent {
  opponentUid: string;
  opponentName: string;
  opponentBranch: string;
  opponentCollege?: string;
  lastSubjectId: string;
  lastSubjectName: string;
  lastTopic?: string;
  myScore: number;
  opponentScore: number;
  result: 'won' | 'lost' | 'tied';
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  education: string;
  description: string;
  photoURL?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  college?: string;
  branch?: string;
  category: string;
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  authorBranch: string;
  authorCollege?: string;
  authorRole?: UserRole;
  text: string;
  createdAt: string;
  likesCount: number;
  likedBy?: string[];
  replyToCommentId?: string;
  replyToAuthorName?: string;
  replyToAuthorUid?: string;
}

export interface CommunityPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorPhoto?: string;
  authorBranch: string;
  authorCollege?: string;
  authorRole?: UserRole;
  title: string;
  content: string;
  category: 'doubt' | 'notes' | 'meme' | 'discussion' | 'showcase' | 'general';
  tags: string[];
  imageUrl?: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  upvotesCount: number;
  downvotesCount: number;
  upvotedBy: string[];
  downvotedBy: string[];
  reactions?: {
    fire?: string[];
    helpful?: string[];
    applause?: string[];
    rocket?: string[];
    heart?: string[];
  };
  commentsCount: number;
  viewsCount?: number;
  viewedBy?: string[];
  isPinned?: boolean;
  isHighlighted?: boolean;
  pinnedAt?: string;
  isEdited?: boolean;
  editedAt?: string;
  editedByAdmin?: boolean;
  isDeleted?: boolean;
  deletedByAdmin?: boolean;
  deletedAt?: string;
  deletedByAdminName?: string;
  adminDeleteReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export type AppTab = 
  | 'landing' 
  | 'dashboard' 
  | 'ailab' 
  | 'battle' 
  | 'community' 
  | 'leaderboard' 
  | 'profile' 
  | 'admin'
  | 'about'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'team'
  | 'sitemap';


