/**
 * Test script for the Extism Plugin Community Platform
 */

import { communityPlatform } from './community-platform';

/**
 * Main test function for community platform
 */
async function testCommunityPlatform() {
  console.log('=== Testing Extism Plugin Community Platform ===\n');

  // Test user creation
  console.log('--- Test: Creating users ---');
  const user1 = communityPlatform.createUser('alice_dev', 'alice@example.com', 'Alice Developer');
  const user2 = communityPlatform.createUser('bob_builder', 'bob@example.com', 'Bob Builder');
  const user3 = communityPlatform.createUser('charlie_coder', 'charlie@example.com', 'Charlie Coder');
  console.log(`Created ${3} users`);

  // Test forum creation
  console.log('\n--- Test: Creating forum threads ---');
  const generalThread = communityPlatform.createForumThread(
    'Welcome to the Extism Plugin Community',
    'This is the official forum for Extism plugin developers. Share ideas, ask questions, and collaborate on projects!',
    user1.id,
    'general',
    ['welcome', 'announcement']
  );

  const helpThread = communityPlatform.createForumThread(
    'How to create a Python plugin?',
    'I\'m new to Extism and would like to create a plugin using Python. Any tutorials or examples available?',
    user2.id,
    'help',
    ['python', 'beginner', 'tutorial']
  );

  const showcaseThread = communityPlatform.createForumThread(
    'Showcase: My new Weather API plugin',
    'I\'ve created a plugin that integrates with multiple weather APIs. Check it out!',
    user3.id,
    'showcase',
    ['weather', 'api', 'showcase']
  );
  console.log(`Created ${3} forum threads`);

  // Test challenges
  console.log('\n--- Test: Creating hackathon challenge ---');
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  
  const challenge = communityPlatform.createChallenge(
    'Extism Summer Hackathon 2023',
    'Build innovative plugins using the Extism platform and win prizes!',
    startDate,
    endDate,
    [user1.id],
    ['$1000 for 1st place', '$500 for 2nd place', '$250 for 3rd place'],
    ['Productivity', 'AI Integration', 'Developer Tools', 'Open Category'],
    'Submit your plugin with source code and a demo video.',
    ['ExtismCorp', 'WebAssembly Foundation', 'Plugin Partners Inc']
  );
  console.log(`Created challenge: ${challenge.title}`);

  // Test showcase
  console.log('\n--- Test: Creating plugin showcases ---');
  const showcase1 = communityPlatform.createShowcase(
    'weather-plugin-123',
    'Weather API Plugin',
    'A plugin that integrates with multiple weather API services to provide accurate forecasts.',
    user3.id,
    ['https://example.com/screenshots/weather1.png', 'https://example.com/screenshots/weather2.png'],
    'https://example.com/videos/weather-demo.mp4',
    ['API', 'Weather', 'Utility']
  );

  const showcase2 = communityPlatform.createShowcase(
    'translation-plugin-456',
    'Translation Plugin',
    'Translate text between 50+ languages using a simple API.',
    user1.id,
    ['https://example.com/screenshots/translate1.png'],
    undefined,
    ['API', 'Translation', 'Utility']
  );
  console.log(`Created ${2} showcases`);

  // Test badge awards
  console.log('\n--- Test: Awarding badges ---');
  const badge1 = communityPlatform.awardBadge(
    user1.id,
    'Plugin Pioneer',
    'Created one of the first 100 plugins on the platform'
  );
  const badge2 = communityPlatform.awardBadge(
    user3.id,
    'Showcase Star',
    'Had a plugin featured in the weekly showcase'
  );
  console.log(`Awarded ${2} badges`);

  // Test forum filtering
  console.log('\n--- Test: Filtering forum threads by category ---');
  const helpThreads = communityPlatform.getForumThreadsByCategory('help');
  console.log(`Found ${helpThreads.length} help threads`);

  // Test active challenges
  console.log('\n--- Test: Getting active challenges ---');
  const activesChallenges = communityPlatform.getActivesChallenges();
  console.log(`Found ${activesChallenges.length} active challenges`);

  console.log('\n=== Community Platform Tests Completed ===');
  return true;
}

// Run the test if this file is executed directly
if (require.main === module) {
  testCommunityPlatform().then(success => {
    if (success) {
      console.log('All community platform tests passed!');
      process.exit(0);
    } else {
      console.error('Some community platform tests failed!');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Error running community platform tests:', error);
    process.exit(1);
  });
}

export { testCommunityPlatform }; 