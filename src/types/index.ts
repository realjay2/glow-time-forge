export interface KeyData {
  AltGen: boolean;
  Blacklisted: boolean;
  ExecAmt: number;
  Note: string;
  accountEmail: string;
  accountPassword: string;
  createdAt: string;
  discordID: string;
  expiresAt: string;
  key: string;
  websitePurchase: boolean;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
  global_name?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  action: string;
  verificationTime: number; // seconds to wait before marking complete
}

export interface UserProgress {
  discordId: string;
  completedTasks: string[];
  lastCompletionTime: number | null;
  tasksCompletedThisSession: string[];
}
