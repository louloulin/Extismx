/**
 * Extism Plugin Enterprise Support
 * 
 * This module provides enterprise-level support and integration services for the Extism plugin platform.
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

/**
 * Enterprise Support Service
 */
export class EnterpriseSupport {
  private supportPlans: Map<string, SupportPlan> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();
  private organizations: Map<string, EnterpriseOrganization> = new Map();
  private customIntegrations: Map<string, CustomIntegration> = new Map();

  /**
   * Create a new enterprise organization
   */
  public createOrganization(
    name: string,
    contactName: string,
    contactEmail: string,
    billingEmail: string,
    billingAddress: string,
    contactPhone?: string
  ): EnterpriseOrganization {
    const id = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const org: EnterpriseOrganization = {
      id,
      name,
      billingEmail,
      billingAddress,
      contactName,
      contactEmail,
      contactPhone,
      isActive: true,
      createdAt: new Date(),
      teamMembers: [],
      privatePlugins: []
    };
    this.organizations.set(id, org);
    console.log(`Enterprise organization created: ${name}`);
    return org;
  }

  /**
   * Create a support plan for an organization
   */
  public createSupportPlan(
    organizationId: string,
    tier: SupportTier,
    startDate: Date,
    endDate: Date,
    contactEmails: string[]
  ): SupportPlan | null {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      console.error(`Organization not found: ${organizationId}`);
      return null;
    }

    // Default values based on tier
    let maxSupportTickets = 5;
    let responseTimeSLA = 24;
    let hasPhoneSupport = false;
    let hasDedicatedSupport = false;
    let hasCustomIntegrations = false;
    let maxPrivatePlugins = 5;

    switch (tier) {
      case 'standard':
        maxSupportTickets = 15;
        responseTimeSLA = 12;
        break;
      case 'premium':
        maxSupportTickets = 50;
        responseTimeSLA = 6;
        hasPhoneSupport = true;
        maxPrivatePlugins = 20;
        break;
      case 'enterprise':
        maxSupportTickets = 999; // unlimited
        responseTimeSLA = 2;
        hasPhoneSupport = true;
        hasDedicatedSupport = true;
        hasCustomIntegrations = true;
        maxPrivatePlugins = 999; // unlimited
        break;
    }

    const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const plan: SupportPlan = {
      id,
      organizationId,
      tier,
      contactEmails,
      startDate,
      endDate,
      maxSupportTickets,
      responseTimeSLA,
      hasPhoneSupport,
      hasDedicatedSupport,
      hasCustomIntegrations,
      maxPrivatePlugins,
      customFeatures: []
    };

    this.supportPlans.set(id, plan);

    // Update organization with the plan ID
    organization.currentPlanId = id;
    this.organizations.set(organizationId, organization);

    console.log(`Support plan created for organization ${organization.name}: ${tier}`);
    return plan;
  }

  /**
   * Create a support ticket
   */
  public createSupportTicket(
    planId: string,
    submitterEmail: string,
    title: string,
    description: string,
    priority: TicketPriority = 'medium',
    attachments: string[] = [],
    relatedPlugins: string[] = []
  ): SupportTicket | null {
    const plan = this.supportPlans.get(planId);
    if (!plan) {
      console.error(`Support plan not found: ${planId}`);
      return null;
    }

    const organization = this.organizations.get(plan.organizationId);
    if (!organization) {
      console.error(`Organization not found: ${plan.organizationId}`);
      return null;
    }

    // Check if organization has active plan
    if (!organization.isActive) {
      console.error(`Organization is not active: ${organization.name}`);
      return null;
    }

    // Check if the plan has reached the maximum number of tickets
    const orgTickets = Array.from(this.supportTickets.values())
      .filter(ticket => ticket.planId === planId && ticket.status !== 'closed');
    
    if (orgTickets.length >= plan.maxSupportTickets) {
      console.error(`Maximum number of tickets reached for plan: ${planId}`);
      return null;
    }

    const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const ticket: SupportTicket = {
      id,
      planId,
      organizationId: plan.organizationId,
      submitterEmail,
      title,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'open',
      priority,
      responses: [],
      attachments,
      relatedPlugins
    };

    this.supportTickets.set(id, ticket);
    console.log(`Support ticket created: ${title}`);
    return ticket;
  }

  /**
   * Respond to a support ticket
   */
  public addTicketResponse(
    ticketId: string,
    author: string,
    content: string,
    isCustomer: boolean,
    attachments: string[] = []
  ): TicketResponse | null {
    const ticket = this.supportTickets.get(ticketId);
    if (!ticket) {
      console.error(`Ticket not found: ${ticketId}`);
      return null;
    }

    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const response: TicketResponse = {
      id: responseId,
      ticketId,
      author,
      isCustomer,
      content,
      createdAt: new Date(),
      attachments
    };

    ticket.responses.push(response);
    ticket.updatedAt = new Date();
    
    // Update ticket status based on response
    if (!isCustomer) {
      ticket.status = 'waiting-for-customer';
    } else if (ticket.status === 'waiting-for-customer') {
      ticket.status = 'in-progress';
    }

    this.supportTickets.set(ticketId, ticket);
    console.log(`Response added to ticket ${ticketId}`);
    return response;
  }

  /**
   * Create a custom integration project
   */
  public createCustomIntegration(
    organizationId: string,
    name: string,
    description: string,
    requirements: string,
    technicalSpecs: string,
    startDate: Date,
    targetEndDate: Date,
    budget: number,
    teamMembers: string[] = []
  ): CustomIntegration | null {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      console.error(`Organization not found: ${organizationId}`);
      return null;
    }

    if (!organization.currentPlanId) {
      console.error(`Organization has no active plan: ${organization.name}`);
      return null;
    }

    const plan = this.supportPlans.get(organization.currentPlanId);
    if (!plan || !plan.hasCustomIntegrations) {
      console.error(`Organization's plan does not include custom integrations: ${organization.name}`);
      return null;
    }

    const id = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const integration: CustomIntegration = {
      id,
      organizationId,
      planId: organization.currentPlanId,
      name,
      description,
      status: 'planning',
      startDate,
      targetEndDate,
      budget,
      requirements,
      technicalSpecs,
      milestones: [],
      teamMembers
    };

    this.customIntegrations.set(id, integration);
    console.log(`Custom integration created: ${name}`);
    return integration;
  }

  /**
   * Add a milestone to a custom integration
   */
  public addIntegrationMilestone(
    integrationId: string,
    name: string,
    description: string,
    dueDate: Date,
    deliverables: string[] = []
  ): IntegrationMilestone | null {
    const integration = this.customIntegrations.get(integrationId);
    if (!integration) {
      console.error(`Integration not found: ${integrationId}`);
      return null;
    }

    const id = `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const milestone: IntegrationMilestone = {
      id,
      integrationId,
      name,
      description,
      dueDate,
      status: 'not-started',
      deliverables
    };

    integration.milestones.push(milestone);
    this.customIntegrations.set(integrationId, integration);
    console.log(`Milestone added to integration ${integration.name}: ${name}`);
    return milestone;
  }

  /**
   * Get active support plans
   */
  public getActiveSupportPlans(): SupportPlan[] {
    const now = new Date();
    return Array.from(this.supportPlans.values())
      .filter(plan => plan.startDate <= now && plan.endDate >= now);
  }

  /**
   * Get high priority tickets
   */
  public getHighPriorityTickets(): SupportTicket[] {
    return Array.from(this.supportTickets.values())
      .filter(ticket => (ticket.priority === 'high' || ticket.priority === 'critical') && ticket.status !== 'closed')
      .sort((a, b) => {
        // Sort by priority first, then by age
        if (a.priority !== b.priority) {
          return a.priority === 'critical' ? -1 : 1;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  /**
   * Get organization by ID
   */
  public getOrganization(id: string): EnterpriseOrganization | undefined {
    return this.organizations.get(id);
  }

  /**
   * Get integration by ID
   */
  public getIntegration(id: string): CustomIntegration | undefined {
    return this.customIntegrations.get(id);
  }
}

/**
 * Export singleton instance
 */
export const enterpriseSupport = new EnterpriseSupport(); 