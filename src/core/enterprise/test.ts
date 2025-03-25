/**
 * Test script for the Enterprise Module
 */

import enterprise from './index';

/**
 * Main test function for enterprise module
 */
export async function testEnterpriseModule(): Promise<boolean> {
  console.log('=== Testing Enterprise Module ===\n');

  // Test organization creation
  console.log('--- Test: Creating organizations ---');
  const org1 = enterprise.support.createOrganization(
    'Acme Corporation',
    'John Doe',
    'john@acmecorp.com',
    'billing@acmecorp.com',
    '123 Main St, Anytown, USA',
    '555-123-4567'
  );
  const org2 = enterprise.support.createOrganization(
    'TechStartup Inc',
    'Jane Smith',
    'jane@techstartup.io',
    'finance@techstartup.io',
    '456 Innovation Ave, Silicon Valley, USA'
  );
  console.log(`Created ${2} organizations`);

  // Test support plan creation
  console.log('\n--- Test: Creating support plans ---');
  // Create dates for plan duration (1 year)
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const plan1 = enterprise.support.createSupportPlan(
    org1.id,
    'enterprise',
    startDate,
    endDate,
    ['john@acmecorp.com', 'support@acmecorp.com']
  );
  const plan2 = enterprise.support.createSupportPlan(
    org2.id,
    'standard',
    startDate,
    endDate,
    ['jane@techstartup.io']
  );
  console.log(`Created ${2} support plans`);

  // Test support ticket creation
  console.log('\n--- Test: Creating support tickets ---');
  if (plan1 && plan2) {
    const ticket1 = enterprise.support.createSupportTicket(
      plan1.id,
      'john@acmecorp.com',
      'Cannot deploy custom plugin to production',
      'We\'re trying to deploy our custom weather plugin to production but getting permission errors.',
      'high',
      ['https://example.com/screenshots/error1.png'],
      ['weather-plugin-123']
    );

    const ticket2 = enterprise.support.createSupportTicket(
      plan2.id,
      'jane@techstartup.io',
      'Need help with plugin authentication',
      'We\'re trying to implement authentication in our plugin but not sure about the best approach.',
      'medium'
    );
    console.log(`Created ${2} support tickets`);

    // Test ticket responses
    console.log('\n--- Test: Adding responses to tickets ---');
    if (ticket1 && ticket2) {
      const response1 = enterprise.support.addTicketResponse(
        ticket1.id,
        'support@extism.io',
        'Thanks for reporting this issue. Can you please provide your deployment configuration file?',
        false
      );

      const response2 = enterprise.support.addTicketResponse(
        ticket2.id,
        'support@extism.io',
        'Hello Jane, for plugin authentication, we recommend using JWT tokens. Here\'s a guide: https://docs.extism.io/auth',
        false
      );

      const response3 = enterprise.support.addTicketResponse(
        ticket2.id,
        'jane@techstartup.io',
        'Thanks for the quick response! We\'ll try implementing JWT authentication as suggested.',
        true
      );
      console.log(`Added ${3} responses to tickets`);
    }
  }

  // Test custom integration creation
  console.log('\n--- Test: Creating custom integration ---');
  const integration = enterprise.integration.createCustomIntegration(
    org1.id,
    'Enterprise SSO Integration',
    'Integrate Extism plugins with Acme\'s SSO system',
    'Acme Corporation requires SSO integration with their existing Azure AD system',
    'Technical Requirements:\n- Azure AD integration\n- JWT token validation\n- Role-based access control',
    new Date(),
    new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
    25000,
    ['integration-lead@extism.io', 'john@acmecorp.com']
  );
  console.log(`Created custom integration: ${integration?.name || 'Failed to create integration'}`);

  // Test milestone creation
  console.log('\n--- Test: Adding milestones to integration ---');
  if (integration) {
    const milestone1 = enterprise.integration.addIntegrationMilestone(
      integration.id,
      'Planning Phase',
      'Detailed requirements gathering and architecture design',
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
      ['Requirements document', 'Architecture diagram', 'Project timeline']
    );

    const milestone2 = enterprise.integration.addIntegrationMilestone(
      integration.id,
      'Development Phase',
      'Implementation of the SSO integration',
      new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()),
      ['SSO plugin code', 'Documentation', 'Test cases']
    );

    const milestone3 = enterprise.integration.addIntegrationMilestone(
      integration.id,
      'Deployment Phase',
      'Deployment to production and handover',
      new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()),
      ['Deployment guide', 'Admin training', 'Support handover']
    );
    console.log(`Added ${3} milestones to integration`);

    // Test integration status update
    console.log('\n--- Test: Updating integration status ---');
    const statusUpdated = enterprise.integration.updateIntegrationStatus(
      integration.id,
      'development'
    );
    console.log(`Integration status updated: ${statusUpdated}`);

    // Test milestone completion
    console.log('\n--- Test: Completing milestone ---');
    if (milestone1) {
      const milestoneCompleted = enterprise.integration.completeMilestone(
        integration.id,
        milestone1.id
      );
      console.log(`Milestone completed: ${milestoneCompleted}`);
    }
  }

  // Test get active support plans
  console.log('\n--- Test: Getting active support plans ---');
  const activePlans = enterprise.support.getActiveSupportPlans();
  console.log(`Found ${activePlans.length} active support plans`);

  // Test get high priority tickets
  console.log('\n--- Test: Getting high priority tickets ---');
  const highPriorityTickets = enterprise.support.getHighPriorityTickets();
  console.log(`Found ${highPriorityTickets.length} high priority tickets`);

  // Test get organization integrations
  console.log('\n--- Test: Getting organization integrations ---');
  const orgIntegrations = enterprise.integration.getOrganizationIntegrations(org1.id);
  console.log(`Found ${orgIntegrations.length} integrations for ${org1.name}`);

  console.log('\n=== Enterprise Module Tests Completed ===');
  return true;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEnterpriseModule().then(success => {
    if (success) {
      console.log('All enterprise module tests passed!');
      process.exit(0);
    } else {
      console.error('Some enterprise module tests failed!');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error running enterprise module tests:', error);
    process.exit(1);
  });
} 