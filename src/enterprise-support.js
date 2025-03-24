"use strict";
/**
 * Extism Plugin Enterprise Support
 *
 * This module provides enterprise-level support and integration services for the Extism plugin platform.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterpriseSupport = exports.EnterpriseSupport = void 0;
/**
 * Enterprise Support Service
 */
var EnterpriseSupport = /** @class */ (function () {
    function EnterpriseSupport() {
        this.supportPlans = new Map();
        this.supportTickets = new Map();
        this.organizations = new Map();
        this.customIntegrations = new Map();
    }
    /**
     * Create a new enterprise organization
     */
    EnterpriseSupport.prototype.createOrganization = function (name, contactName, contactEmail, billingEmail, billingAddress, contactPhone) {
        var id = "org_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var org = {
            id: id,
            name: name,
            billingEmail: billingEmail,
            billingAddress: billingAddress,
            contactName: contactName,
            contactEmail: contactEmail,
            contactPhone: contactPhone,
            isActive: true,
            createdAt: new Date(),
            teamMembers: [],
            privatePlugins: []
        };
        this.organizations.set(id, org);
        console.log("Enterprise organization created: ".concat(name));
        return org;
    };
    /**
     * Create a support plan for an organization
     */
    EnterpriseSupport.prototype.createSupportPlan = function (organizationId, tier, startDate, endDate, contactEmails) {
        var organization = this.organizations.get(organizationId);
        if (!organization) {
            console.error("Organization not found: ".concat(organizationId));
            return null;
        }
        // Default values based on tier
        var maxSupportTickets = 5;
        var responseTimeSLA = 24;
        var hasPhoneSupport = false;
        var hasDedicatedSupport = false;
        var hasCustomIntegrations = false;
        var maxPrivatePlugins = 5;
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
        var id = "plan_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var plan = {
            id: id,
            organizationId: organizationId,
            tier: tier,
            contactEmails: contactEmails,
            startDate: startDate,
            endDate: endDate,
            maxSupportTickets: maxSupportTickets,
            responseTimeSLA: responseTimeSLA,
            hasPhoneSupport: hasPhoneSupport,
            hasDedicatedSupport: hasDedicatedSupport,
            hasCustomIntegrations: hasCustomIntegrations,
            maxPrivatePlugins: maxPrivatePlugins,
            customFeatures: []
        };
        this.supportPlans.set(id, plan);
        // Update organization with the plan ID
        organization.currentPlanId = id;
        this.organizations.set(organizationId, organization);
        console.log("Support plan created for organization ".concat(organization.name, ": ").concat(tier));
        return plan;
    };
    /**
     * Create a support ticket
     */
    EnterpriseSupport.prototype.createSupportTicket = function (planId, submitterEmail, title, description, priority, attachments, relatedPlugins) {
        if (priority === void 0) { priority = 'medium'; }
        if (attachments === void 0) { attachments = []; }
        if (relatedPlugins === void 0) { relatedPlugins = []; }
        var plan = this.supportPlans.get(planId);
        if (!plan) {
            console.error("Support plan not found: ".concat(planId));
            return null;
        }
        var organization = this.organizations.get(plan.organizationId);
        if (!organization) {
            console.error("Organization not found: ".concat(plan.organizationId));
            return null;
        }
        // Check if organization has active plan
        if (!organization.isActive) {
            console.error("Organization is not active: ".concat(organization.name));
            return null;
        }
        // Check if the plan has reached the maximum number of tickets
        var orgTickets = Array.from(this.supportTickets.values())
            .filter(function (ticket) { return ticket.planId === planId && ticket.status !== 'closed'; });
        if (orgTickets.length >= plan.maxSupportTickets) {
            console.error("Maximum number of tickets reached for plan: ".concat(planId));
            return null;
        }
        var id = "ticket_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var ticket = {
            id: id,
            planId: planId,
            organizationId: plan.organizationId,
            submitterEmail: submitterEmail,
            title: title,
            description: description,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'open',
            priority: priority,
            responses: [],
            attachments: attachments,
            relatedPlugins: relatedPlugins
        };
        this.supportTickets.set(id, ticket);
        console.log("Support ticket created: ".concat(title));
        return ticket;
    };
    /**
     * Respond to a support ticket
     */
    EnterpriseSupport.prototype.addTicketResponse = function (ticketId, author, content, isCustomer, attachments) {
        if (attachments === void 0) { attachments = []; }
        var ticket = this.supportTickets.get(ticketId);
        if (!ticket) {
            console.error("Ticket not found: ".concat(ticketId));
            return null;
        }
        var responseId = "response_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var response = {
            id: responseId,
            ticketId: ticketId,
            author: author,
            isCustomer: isCustomer,
            content: content,
            createdAt: new Date(),
            attachments: attachments
        };
        ticket.responses.push(response);
        ticket.updatedAt = new Date();
        // Update ticket status based on response
        if (!isCustomer) {
            ticket.status = 'waiting-for-customer';
        }
        else if (ticket.status === 'waiting-for-customer') {
            ticket.status = 'in-progress';
        }
        this.supportTickets.set(ticketId, ticket);
        console.log("Response added to ticket ".concat(ticketId));
        return response;
    };
    /**
     * Create a custom integration project
     */
    EnterpriseSupport.prototype.createCustomIntegration = function (organizationId, name, description, requirements, technicalSpecs, startDate, targetEndDate, budget, teamMembers) {
        if (teamMembers === void 0) { teamMembers = []; }
        var organization = this.organizations.get(organizationId);
        if (!organization) {
            console.error("Organization not found: ".concat(organizationId));
            return null;
        }
        if (!organization.currentPlanId) {
            console.error("Organization has no active plan: ".concat(organization.name));
            return null;
        }
        var plan = this.supportPlans.get(organization.currentPlanId);
        if (!plan || !plan.hasCustomIntegrations) {
            console.error("Organization's plan does not include custom integrations: ".concat(organization.name));
            return null;
        }
        var id = "integration_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var integration = {
            id: id,
            organizationId: organizationId,
            planId: organization.currentPlanId,
            name: name,
            description: description,
            status: 'planning',
            startDate: startDate,
            targetEndDate: targetEndDate,
            budget: budget,
            requirements: requirements,
            technicalSpecs: technicalSpecs,
            milestones: [],
            teamMembers: teamMembers
        };
        this.customIntegrations.set(id, integration);
        console.log("Custom integration created: ".concat(name));
        return integration;
    };
    /**
     * Add a milestone to a custom integration
     */
    EnterpriseSupport.prototype.addIntegrationMilestone = function (integrationId, name, description, dueDate, deliverables) {
        if (deliverables === void 0) { deliverables = []; }
        var integration = this.customIntegrations.get(integrationId);
        if (!integration) {
            console.error("Integration not found: ".concat(integrationId));
            return null;
        }
        var id = "milestone_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
        var milestone = {
            id: id,
            integrationId: integrationId,
            name: name,
            description: description,
            dueDate: dueDate,
            status: 'not-started',
            deliverables: deliverables
        };
        integration.milestones.push(milestone);
        this.customIntegrations.set(integrationId, integration);
        console.log("Milestone added to integration ".concat(integration.name, ": ").concat(name));
        return milestone;
    };
    /**
     * Get active support plans
     */
    EnterpriseSupport.prototype.getActiveSupportPlans = function () {
        var now = new Date();
        return Array.from(this.supportPlans.values())
            .filter(function (plan) { return plan.startDate <= now && plan.endDate >= now; });
    };
    /**
     * Get high priority tickets
     */
    EnterpriseSupport.prototype.getHighPriorityTickets = function () {
        return Array.from(this.supportTickets.values())
            .filter(function (ticket) { return (ticket.priority === 'high' || ticket.priority === 'critical') && ticket.status !== 'closed'; })
            .sort(function (a, b) {
            // Sort by priority first, then by age
            if (a.priority !== b.priority) {
                return a.priority === 'critical' ? -1 : 1;
            }
            return a.createdAt.getTime() - b.createdAt.getTime();
        });
    };
    /**
     * Get organization by ID
     */
    EnterpriseSupport.prototype.getOrganization = function (id) {
        return this.organizations.get(id);
    };
    /**
     * Get integration by ID
     */
    EnterpriseSupport.prototype.getIntegration = function (id) {
        return this.customIntegrations.get(id);
    };
    return EnterpriseSupport;
}());
exports.EnterpriseSupport = EnterpriseSupport;
/**
 * Export singleton instance
 */
exports.enterpriseSupport = new EnterpriseSupport();
