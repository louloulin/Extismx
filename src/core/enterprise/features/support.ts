/**
 * Enterprise Support
 * 
 * This module provides enterprise-level support services.
 */

import {
  SupportPlan,
  SupportTier,
  SupportTicket,
  TicketPriority,
  TicketResponse,
  EnterpriseOrganization,
  OrgTeamMember
} from '../types';

/**
 * Enterprise Support Service
 */
export class EnterpriseSupport {
  private supportPlans: Map<string, SupportPlan> = new Map();
  private supportTickets: Map<string, SupportTicket> = new Map();
  private organizations: Map<string, EnterpriseOrganization> = new Map();

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

    // Count existing tickets for this plan
    const existingTickets = [...this.supportTickets.values()].filter(
      ticket => ticket.planId === planId && ticket.status !== 'closed'
    );

    if (existingTickets.length >= plan.maxSupportTickets) {
      console.error(`Maximum number of support tickets reached for plan: ${planId}`);
      return null;
    }

    const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const ticket: SupportTicket = {
      id,
      planId,
      organizationId: plan.organizationId,
      submitterEmail,
      title,
      description,
      createdAt: now,
      updatedAt: now,
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
   * Add a response to a support ticket
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

    // If ticket is closed, don't allow new responses
    if (ticket.status === 'closed') {
      console.error(`Cannot add response to closed ticket: ${ticketId}`);
      return null;
    }

    const id = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const response: TicketResponse = {
      id,
      ticketId,
      author,
      isCustomer,
      content,
      createdAt: new Date(),
      attachments
    };

    // Add response to ticket
    ticket.responses.push(response);
    
    // Update ticket status based on who responded
    if (isCustomer) {
      // If customer responded, set to waiting for support
      ticket.status = 'open';
    } else {
      // If support responded, set to waiting for customer
      ticket.status = 'waiting-for-customer';
    }

    // Update the updatedAt timestamp
    ticket.updatedAt = new Date();
    
    // Update the ticket in the map
    this.supportTickets.set(ticketId, ticket);

    console.log(`Response added to ticket ${ticketId} by ${author}`);
    return response;
  }

  /**
   * Get active support plans (not expired)
   */
  public getActiveSupportPlans(): SupportPlan[] {
    const now = new Date();
    return [...this.supportPlans.values()].filter(
      plan => plan.endDate >= now
    );
  }

  /**
   * Get high priority tickets (high or critical priority and not closed)
   */
  public getHighPriorityTickets(): SupportTicket[] {
    return [...this.supportTickets.values()].filter(
      ticket => 
        (ticket.priority === 'high' || ticket.priority === 'critical') &&
        ticket.status !== 'closed'
    );
  }

  /**
   * Get an organization by ID
   */
  public getOrganization(id: string): EnterpriseOrganization | undefined {
    return this.organizations.get(id);
  }

  /**
   * Add a team member to an organization
   */
  public addTeamMember(
    organizationId: string,
    email: string,
    name: string,
    role: 'admin' | 'developer' | 'viewer'
  ): OrgTeamMember | null {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      console.error(`Organization not found: ${organizationId}`);
      return null;
    }

    // Check if member already exists
    const existingMember = organization.teamMembers.find(member => member.email === email);
    if (existingMember) {
      console.error(`Team member already exists: ${email}`);
      return existingMember;
    }

    const id = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const member: OrgTeamMember = {
      id,
      organizationId,
      email,
      name,
      role,
      dateAdded: new Date()
    };

    organization.teamMembers.push(member);
    this.organizations.set(organizationId, organization);

    console.log(`Team member added to organization ${organization.name}: ${name}`);
    return member;
  }

  /**
   * Add a private plugin to an organization
   */
  public addPrivatePlugin(
    organizationId: string,
    pluginId: string
  ): boolean {
    const organization = this.organizations.get(organizationId);
    if (!organization) {
      console.error(`Organization not found: ${organizationId}`);
      return false;
    }

    // Check if plugin already exists
    if (organization.privatePlugins.includes(pluginId)) {
      console.error(`Plugin already exists in organization: ${pluginId}`);
      return true;
    }

    // Check plan limits
    const plan = organization.currentPlanId 
      ? this.supportPlans.get(organization.currentPlanId)
      : null;
      
    if (plan && organization.privatePlugins.length >= plan.maxPrivatePlugins) {
      console.error(`Maximum number of private plugins reached for organization: ${organizationId}`);
      return false;
    }

    organization.privatePlugins.push(pluginId);
    this.organizations.set(organizationId, organization);

    console.log(`Private plugin added to organization ${organization.name}: ${pluginId}`);
    return true;
  }

  /**
   * Close a support ticket
   */
  public closeTicket(ticketId: string): boolean {
    const ticket = this.supportTickets.get(ticketId);
    if (!ticket) {
      console.error(`Ticket not found: ${ticketId}`);
      return false;
    }

    ticket.status = 'closed';
    ticket.updatedAt = new Date();
    this.supportTickets.set(ticketId, ticket);

    console.log(`Ticket closed: ${ticketId}`);
    return true;
  }
} 