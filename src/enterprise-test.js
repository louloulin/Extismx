"use strict";
/**
 * Test script for the Extism Plugin Enterprise Support
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testEnterpriseSupport = testEnterpriseSupport;
var enterprise_support_1 = require("./enterprise-support");
/**
 * Main test function for enterprise support
 */
function testEnterpriseSupport() {
    return __awaiter(this, void 0, void 0, function () {
        var org1, org2, now, startDate, endDate, plan1, plan2, ticket1, ticket2, response1, response2, response3, integration, milestone1, milestone2, milestone3, activePlans, highPriorityTickets;
        return __generator(this, function (_a) {
            console.log('=== Testing Extism Plugin Enterprise Support ===\n');
            // Test organization creation
            console.log('--- Test: Creating organizations ---');
            org1 = enterprise_support_1.enterpriseSupport.createOrganization('Acme Corporation', 'John Doe', 'john@acmecorp.com', 'billing@acmecorp.com', '123 Main St, Anytown, USA', '555-123-4567');
            org2 = enterprise_support_1.enterpriseSupport.createOrganization('TechStartup Inc', 'Jane Smith', 'jane@techstartup.io', 'finance@techstartup.io', '456 Innovation Ave, Silicon Valley, USA');
            console.log("Created ".concat(2, " organizations"));
            // Test support plan creation
            console.log('\n--- Test: Creating support plans ---');
            now = new Date();
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
            plan1 = enterprise_support_1.enterpriseSupport.createSupportPlan(org1.id, 'enterprise', startDate, endDate, ['john@acmecorp.com', 'support@acmecorp.com']);
            plan2 = enterprise_support_1.enterpriseSupport.createSupportPlan(org2.id, 'standard', startDate, endDate, ['jane@techstartup.io']);
            console.log("Created ".concat(2, " support plans"));
            // Test support ticket creation
            console.log('\n--- Test: Creating support tickets ---');
            if (plan1 && plan2) {
                ticket1 = enterprise_support_1.enterpriseSupport.createSupportTicket(plan1.id, 'john@acmecorp.com', 'Cannot deploy custom plugin to production', 'We\'re trying to deploy our custom weather plugin to production but getting permission errors.', 'high', ['https://example.com/screenshots/error1.png'], ['weather-plugin-123']);
                ticket2 = enterprise_support_1.enterpriseSupport.createSupportTicket(plan2.id, 'jane@techstartup.io', 'Need help with plugin authentication', 'We\'re trying to implement authentication in our plugin but not sure about the best approach.', 'medium');
                console.log("Created ".concat(2, " support tickets"));
                // Test ticket responses
                console.log('\n--- Test: Adding responses to tickets ---');
                if (ticket1 && ticket2) {
                    response1 = enterprise_support_1.enterpriseSupport.addTicketResponse(ticket1.id, 'support@extism.io', 'Thanks for reporting this issue. Can you please provide your deployment configuration file?', false);
                    response2 = enterprise_support_1.enterpriseSupport.addTicketResponse(ticket2.id, 'support@extism.io', 'Hello Jane, for plugin authentication, we recommend using JWT tokens. Here\'s a guide: https://docs.extism.io/auth', false);
                    response3 = enterprise_support_1.enterpriseSupport.addTicketResponse(ticket2.id, 'jane@techstartup.io', 'Thanks for the quick response! We\'ll try implementing JWT authentication as suggested.', true);
                    console.log("Added ".concat(3, " responses to tickets"));
                }
            }
            // Test custom integration creation
            console.log('\n--- Test: Creating custom integration ---');
            integration = enterprise_support_1.enterpriseSupport.createCustomIntegration(org1.id, 'Enterprise SSO Integration', 'Integrate Extism plugins with Acme\'s SSO system', 'Acme Corporation requires SSO integration with their existing Azure AD system', 'Technical Requirements:\n- Azure AD integration\n- JWT token validation\n- Role-based access control', new Date(), new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()), 25000, ['integration-lead@extism.io', 'john@acmecorp.com']);
            console.log("Created custom integration: ".concat((integration === null || integration === void 0 ? void 0 : integration.name) || 'Failed to create integration'));
            // Test milestone creation
            console.log('\n--- Test: Adding milestones to integration ---');
            if (integration) {
                milestone1 = enterprise_support_1.enterpriseSupport.addIntegrationMilestone(integration.id, 'Planning Phase', 'Detailed requirements gathering and architecture design', new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14), ['Requirements document', 'Architecture diagram', 'Project timeline']);
                milestone2 = enterprise_support_1.enterpriseSupport.addIntegrationMilestone(integration.id, 'Development Phase', 'Implementation of the SSO integration', new Date(now.getFullYear(), now.getMonth() + 2, now.getDate()), ['SSO plugin code', 'Documentation', 'Test cases']);
                milestone3 = enterprise_support_1.enterpriseSupport.addIntegrationMilestone(integration.id, 'Deployment Phase', 'Deployment to production and handover', new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()), ['Deployment guide', 'Admin training', 'Support handover']);
                console.log("Added ".concat(3, " milestones to integration"));
            }
            // Test getting active support plans
            console.log('\n--- Test: Getting active support plans ---');
            activePlans = enterprise_support_1.enterpriseSupport.getActiveSupportPlans();
            console.log("Found ".concat(activePlans.length, " active support plans"));
            // Test getting high priority tickets
            console.log('\n--- Test: Getting high priority tickets ---');
            highPriorityTickets = enterprise_support_1.enterpriseSupport.getHighPriorityTickets();
            console.log("Found ".concat(highPriorityTickets.length, " high priority tickets"));
            console.log('\n=== Enterprise Support Tests Completed ===');
            return [2 /*return*/, true];
        });
    });
}
// Run the test if this file is executed directly
if (require.main === module) {
    testEnterpriseSupport().then(function (success) {
        if (success) {
            console.log('All enterprise support tests passed!');
            process.exit(0);
        }
        else {
            console.error('Some enterprise support tests failed!');
            process.exit(1);
        }
    }).catch(function (error) {
        console.error('Error running enterprise support tests:', error);
        process.exit(1);
    });
}
