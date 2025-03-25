/**
 * Enterprise Custom Integration
 * 
 * This module provides enterprise-level custom integration services.
 */

import {
  CustomIntegration,
  IntegrationMilestone
} from '../types';

/**
 * Enterprise Custom Integration Service
 */
export class EnterpriseIntegration {
  private customIntegrations: Map<string, CustomIntegration> = new Map();

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
  ): CustomIntegration {
    const id = `integration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const integration: CustomIntegration = {
      id,
      organizationId,
      planId: '', // Will be set later
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
   * Update integration status
   */
  public updateIntegrationStatus(
    integrationId: string,
    status: 'planning' | 'development' | 'testing' | 'deployed' | 'maintenance'
  ): boolean {
    const integration = this.customIntegrations.get(integrationId);
    if (!integration) {
      console.error(`Integration not found: ${integrationId}`);
      return false;
    }

    integration.status = status;
    this.customIntegrations.set(integrationId, integration);

    console.log(`Integration ${integration.name} status updated to: ${status}`);
    return true;
  }

  /**
   * Complete a milestone
   */
  public completeMilestone(
    integrationId: string,
    milestoneId: string
  ): boolean {
    const integration = this.customIntegrations.get(integrationId);
    if (!integration) {
      console.error(`Integration not found: ${integrationId}`);
      return false;
    }

    const milestoneIndex = integration.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) {
      console.error(`Milestone not found: ${milestoneId}`);
      return false;
    }

    integration.milestones[milestoneIndex].status = 'completed';
    integration.milestones[milestoneIndex].completedDate = new Date();
    this.customIntegrations.set(integrationId, integration);

    console.log(`Milestone ${integration.milestones[milestoneIndex].name} marked as completed`);
    return true;
  }

  /**
   * Get a custom integration by ID
   */
  public getIntegration(id: string): CustomIntegration | undefined {
    return this.customIntegrations.get(id);
  }

  /**
   * Get all integrations for an organization
   */
  public getOrganizationIntegrations(organizationId: string): CustomIntegration[] {
    return [...this.customIntegrations.values()].filter(
      integration => integration.organizationId === organizationId
    );
  }

  /**
   * Add team member to integration
   */
  public addTeamMemberToIntegration(
    integrationId: string,
    memberId: string
  ): boolean {
    const integration = this.customIntegrations.get(integrationId);
    if (!integration) {
      console.error(`Integration not found: ${integrationId}`);
      return false;
    }

    if (integration.teamMembers.includes(memberId)) {
      console.warn(`Team member already part of integration: ${memberId}`);
      return true;
    }

    integration.teamMembers.push(memberId);
    this.customIntegrations.set(integrationId, integration);

    console.log(`Team member added to integration ${integration.name}: ${memberId}`);
    return true;
  }

  /**
   * Set integration repository URL
   */
  public setRepositoryUrl(
    integrationId: string,
    repositoryUrl: string
  ): boolean {
    const integration = this.customIntegrations.get(integrationId);
    if (!integration) {
      console.error(`Integration not found: ${integrationId}`);
      return false;
    }

    integration.repositoryUrl = repositoryUrl;
    this.customIntegrations.set(integrationId, integration);

    console.log(`Repository URL set for integration ${integration.name}: ${repositoryUrl}`);
    return true;
  }
} 