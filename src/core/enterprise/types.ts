/**
 * Enterprise Module Types
 * 
 * This file contains type definitions for the enterprise features module.
 */

/**
 * Types of enterprise support tiers
 */
export type SupportTier = 'basic' | 'standard' | 'premium' | 'enterprise';

/**
 * Enterprise support plan
 */
export interface SupportPlan {
  id: string;
  organizationId: string;
  tier: SupportTier;
  contactEmails: string[];
  startDate: Date;
  endDate: Date;
  maxSupportTickets: number;
  responseTimeSLA: number; // response time in hours
  hasPhoneSupport: boolean;
  hasDedicatedSupport: boolean;
  hasCustomIntegrations: boolean;
  maxPrivatePlugins: number;
  customFeatures: string[];
}

/**
 * Support ticket status
 */
export type TicketStatus = 'open' | 'in-progress' | 'waiting-for-customer' | 'resolved' | 'closed';

/**
 * Support ticket priority
 */
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Support ticket
 */
export interface SupportTicket {
  id: string;
  planId: string;
  organizationId: string;
  submitterEmail: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  status: TicketStatus;
  priority: TicketPriority;
  assignee?: string;
  responses: TicketResponse[];
  attachments: string[];
  relatedPlugins?: string[];
}

/**
 * Support ticket response
 */
export interface TicketResponse {
  id: string;
  ticketId: string;
  author: string;
  isCustomer: boolean;
  content: string;
  createdAt: Date;
  attachments: string[];
}

/**
 * Custom integration project
 */
export interface CustomIntegration {
  id: string;
  organizationId: string;
  planId: string;
  name: string;
  description: string;
  status: 'planning' | 'development' | 'testing' | 'deployed' | 'maintenance';
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  budget: number;
  requirements: string;
  technicalSpecs: string;
  milestones: IntegrationMilestone[];
  teamMembers: string[];
  repositoryUrl?: string;
}

/**
 * Integration project milestone
 */
export interface IntegrationMilestone {
  id: string;
  integrationId: string;
  name: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  deliverables: string[];
}

/**
 * Enterprise organization
 */
export interface EnterpriseOrganization {
  id: string;
  name: string;
  billingEmail: string;
  billingAddress: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  currentPlanId?: string;
  isActive: boolean;
  createdAt: Date;
  teamMembers: OrgTeamMember[];
  privatePlugins: string[];
}

/**
 * Organization team member
 */
export interface OrgTeamMember {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: 'admin' | 'developer' | 'viewer';
  dateAdded: Date;
} 