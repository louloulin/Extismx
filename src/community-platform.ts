/**
 * Extism Plugin Community Platform
 * 
 * This module provides functionality for the community aspects of the Extism plugin ecosystem.
 * It includes features for forums, showcases, challenges, and developer engagement.
 */

import { PluginPackage } from './registry-types';

/**
 * User profile for the community platform
 */
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
  joinDate: Date;
  plugins: string[]; // IDs of plugins created by this user
  contributions: string[]; // IDs of plugins contributed to
  badges: Badge[];
}

/**
 * Badge for user achievements
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  dateAwarded: Date;
}

/**
 * Forum discussion thread
 */
export interface ForumThread {
  id: string;
  title: string;
  author: string; // User ID
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  category: 'general' | 'help' | 'showcase' | 'announcements' | 'plugins';
  replies: ForumReply[];
  views: number;
  pinned: boolean;
}

/**
 * Reply to a forum thread
 */
export interface ForumReply {
  id: string;
  author: string; // User ID
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  parentId?: string; // For nested replies
}

/**
 * Hackathon or challenge event
 */
export interface Challenge {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  prizes: string[];
  categories: string[];
  rules: string;
  submissions: ChallengeSubmission[];
  organizers: string[]; // User IDs
  sponsors: string[];
}

/**
 * Submission to a challenge
 */
export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  pluginId: string;
  userId: string;
  description: string;
  submissionDate: Date;
  screenshots: string[];
  videoUrl?: string;
  repoUrl?: string;
  score?: number;
  feedback?: string[];
}

/**
 * Plugin showcase entry
 */
export interface ShowcaseItem {
  id: string;
  pluginId: string;
  title: string;
  description: string;
  screenshots: string[];
  videoUrl?: string;
  featured: boolean;
  featuredOrder?: number;
  publishDate: Date;
  likes: number;
  views: number;
  category: string[];
}

/**
 * Community Platform class
 */
export class CommunityPlatform {
  private users: Map<string, UserProfile> = new Map();
  private forums: Map<string, ForumThread> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private showcases: Map<string, ShowcaseItem> = new Map();

  /**
   * Create a new user profile
   */
  public createUser(username: string, email: string, displayName: string): UserProfile {
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: UserProfile = {
      id,
      username,
      displayName,
      email,
      joinDate: new Date(),
      plugins: [],
      contributions: [],
      badges: []
    };
    this.users.set(id, user);
    console.log(`User created: ${username}`);
    return user;
  }

  /**
   * Create a new forum thread
   */
  public createForumThread(
    title: string, 
    content: string, 
    authorId: string, 
    category: ForumThread['category'],
    tags: string[] = []
  ): ForumThread {
    const id = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const thread: ForumThread = {
      id,
      title,
      author: authorId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags,
      category,
      replies: [],
      views: 0,
      pinned: false
    };
    this.forums.set(id, thread);
    console.log(`Forum thread created: ${title}`);
    return thread;
  }

  /**
   * Create a new challenge or hackathon
   */
  public createChallenge(
    title: string,
    description: string,
    startDate: Date,
    endDate: Date,
    organizerIds: string[],
    prizes: string[] = [],
    categories: string[] = [],
    rules: string = '',
    sponsors: string[] = []
  ): Challenge {
    const id = `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const challenge: Challenge = {
      id,
      title,
      description,
      startDate,
      endDate,
      prizes,
      categories,
      rules,
      submissions: [],
      organizers: organizerIds,
      sponsors
    };
    this.challenges.set(id, challenge);
    console.log(`Challenge created: ${title}`);
    return challenge;
  }

  /**
   * Feature a plugin in the showcase
   */
  public createShowcase(
    pluginId: string,
    title: string,
    description: string,
    userId: string,
    screenshots: string[] = [],
    videoUrl?: string,
    categories: string[] = []
  ): ShowcaseItem {
    const id = `showcase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const showcase: ShowcaseItem = {
      id,
      pluginId,
      title,
      description,
      screenshots,
      videoUrl,
      featured: false,
      publishDate: new Date(),
      likes: 0,
      views: 0,
      category: categories
    };
    this.showcases.set(id, showcase);
    console.log(`Showcase created for plugin: ${title}`);
    return showcase;
  }

  /**
   * Get forum threads by category
   */
  public getForumThreadsByCategory(category: ForumThread['category']): ForumThread[] {
    return Array.from(this.forums.values())
      .filter(thread => thread.category === category)
      .sort((a, b) => {
        // Pinned threads first, then by date
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
  }

  /**
   * Get active challenges
   */
  public getActivesChallenges(): Challenge[] {
    const now = new Date();
    return Array.from(this.challenges.values())
      .filter(challenge => challenge.startDate <= now && challenge.endDate >= now)
      .sort((a, b) => b.endDate.getTime() - a.endDate.getTime());
  }

  /**
   * Get featured showcase items
   */
  public getFeaturedShowcases(): ShowcaseItem[] {
    return Array.from(this.showcases.values())
      .filter(item => item.featured)
      .sort((a, b) => {
        if (a.featuredOrder !== undefined && b.featuredOrder !== undefined) {
          return a.featuredOrder - b.featuredOrder;
        }
        return b.publishDate.getTime() - a.publishDate.getTime();
      });
  }

  /**
   * Award a badge to a user
   */
  public awardBadge(userId: string, badgeName: string, badgeDescription: string): Badge | null {
    const user = this.users.get(userId);
    if (!user) {
      console.error(`User not found: ${userId}`);
      return null;
    }

    const badge: Badge = {
      id: `badge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: badgeName,
      description: badgeDescription,
      iconUrl: `https://extism-plugins.io/badges/${badgeName.toLowerCase().replace(/\s+/g, '-')}.svg`,
      dateAwarded: new Date()
    };

    user.badges.push(badge);
    this.users.set(userId, user);
    console.log(`Badge awarded to user ${user.username}: ${badgeName}`);
    return badge;
  }
}

/**
 * Export singleton instance
 */
export const communityPlatform = new CommunityPlatform(); 