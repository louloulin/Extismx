// 由于node-fetch v3是ESM-only模块，我们用动态导入
// 先导入assert
const assert = require('assert');

// 配置
const BASE_URL = 'http://localhost:3008';
const API_PREFIX = '/api/admin';

// 测试函数
async function runTests() {
  console.log('\nStarting Management Console Tests...\n');
  
  // 动态导入fetch
  const fetch = (await import('node-fetch')).default;
  
  try {
    // 测试统计API
    console.log('--- Testing Stats API ---');
    const statsResponse = await fetch(`${BASE_URL}${API_PREFIX}/stats`);
    assert.equal(statsResponse.status, 200, 'Stats API should return 200');
    const statsData = await statsResponse.json();
    assert.ok(statsData.total_users > 0, 'Should have total users count');
    assert.ok(statsData.total_plugins > 0, 'Should have total plugins count');
    assert.ok(statsData.total_downloads > 0, 'Should have total downloads count');
    console.log('[✅ PASS] Stats API overall test');
    
    // 测试热门插件API
    const topPluginsResponse = await fetch(`${BASE_URL}${API_PREFIX}/stats?type=top_plugins`);
    assert.equal(topPluginsResponse.status, 200, 'Top plugins API should return 200');
    const topPluginsData = await topPluginsResponse.json();
    assert.ok(Array.isArray(topPluginsData), 'Should return an array of plugins');
    assert.ok(topPluginsData.length > 0, 'Should have at least one plugin');
    assert.ok(topPluginsData[0].name, 'Plugins should have a name');
    assert.ok(topPluginsData[0].downloads, 'Plugins should have downloads count');
    console.log('[✅ PASS] Stats API - Top plugins test');
    
    // 测试用户管理API
    console.log('\n--- Testing Users API ---');
    const usersResponse = await fetch(`${BASE_URL}${API_PREFIX}/users`);
    assert.equal(usersResponse.status, 200, 'Users API should return 200');
    const usersData = await usersResponse.json();
    assert.ok(usersData.users, 'Should have users array');
    assert.ok(usersData.total > 0, 'Should have total count');
    console.log('[✅ PASS] Users API - List users test');
    
    // 测试用户筛选
    const devUsersResponse = await fetch(`${BASE_URL}${API_PREFIX}/users?role=developer&limit=5`);
    assert.equal(devUsersResponse.status, 200, 'Filtered users API should return 200');
    const devUsersData = await devUsersResponse.json();
    assert.ok(devUsersData.users.length > 0, 'Should have developer users');
    assert.ok(devUsersData.users.every(user => user.role === 'developer'), 'All users should be developers');
    console.log('[✅ PASS] Users API - Filter by role test');
    
    // 测试插件管理API
    console.log('\n--- Testing Plugins API ---');
    const pluginsResponse = await fetch(`${BASE_URL}${API_PREFIX}/plugins`);
    assert.equal(pluginsResponse.status, 200, 'Plugins API should return 200');
    const pluginsData = await pluginsResponse.json();
    assert.ok(pluginsData.plugins, 'Should have plugins array');
    assert.ok(pluginsData.total > 0, 'Should have total count');
    console.log('[✅ PASS] Plugins API - List plugins test');
    
    // 测试插件筛选
    const pendingPluginsResponse = await fetch(`${BASE_URL}${API_PREFIX}/plugins?status=pending`);
    assert.equal(pendingPluginsResponse.status, 200, 'Filtered plugins API should return 200');
    const pendingPluginsData = await pendingPluginsResponse.json();
    assert.ok(pendingPluginsData.plugins.length > 0, 'Should have pending plugins');
    assert.ok(pendingPluginsData.plugins.every(plugin => plugin.status === 'pending'), 'All plugins should be pending');
    console.log('[✅ PASS] Plugins API - Filter by status test');
    
    // 测试插件排序
    const sortedPluginsResponse = await fetch(`${BASE_URL}${API_PREFIX}/plugins?sortBy=downloads&sortDir=desc`);
    assert.equal(sortedPluginsResponse.status, 200, 'Sorted plugins API should return 200');
    const sortedPluginsData = await sortedPluginsResponse.json();
    assert.ok(sortedPluginsData.plugins.length > 0, 'Should have plugins');
    
    // 检查是否按下载量降序排序
    let isDescSorted = true;
    for (let i = 1; i < sortedPluginsData.plugins.length; i++) {
      if (sortedPluginsData.plugins[i-1].downloads < sortedPluginsData.plugins[i].downloads) {
        isDescSorted = false;
        break;
      }
    }
    assert.ok(isDescSorted, 'Plugins should be sorted by downloads in descending order');
    console.log('[✅ PASS] Plugins API - Sort by downloads test');
    
    // 测试前端页面
    console.log('\n--- Testing Frontend Pages ---');
    const adminPageResponse = await fetch(`${BASE_URL}/admin`);
    assert.equal(adminPageResponse.status, 200, 'Admin page should return 200');
    const adminPageHtml = await adminPageResponse.text();
    assert.ok(adminPageHtml.includes('管理控制台'), 'Admin page should contain the title');
    console.log('[✅ PASS] Admin dashboard page test');
    
    // 测试总结
    console.log('\n--- Test Summary ---');
    console.log('Overall Status: ✅ ALL TESTS PASSED');
    console.log('Management Console implementation is complete and functioning correctly.');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests(); 