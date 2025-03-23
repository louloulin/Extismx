const fs = require('fs');

console.log("Starting Auth System Tests...\n");

// 模拟UI测试
function testAuthUIComponents() {
  console.log("--- Testing Auth UI Components ---");
  // 检查登录页面文件是否存在
  const loginPageExists = fs.existsSync('./extism-registry/src/app/auth/login/page.tsx');
  console.log(`[${loginPageExists ? '✅ PASS' : '❌ FAIL'}] Login page component`);

  // 检查注册页面文件是否存在
  const registerPageExists = fs.existsSync('./extism-registry/src/app/auth/register/page.tsx');
  console.log(`[${registerPageExists ? '✅ PASS' : '❌ FAIL'}] Registration page component`);

  // 检查邮箱验证页面文件是否存在
  const verificationPageExists = fs.existsSync('./extism-registry/src/app/auth/verification-sent/page.tsx');
  console.log(`[${verificationPageExists ? '✅ PASS' : '❌ FAIL'}] Email verification page component`);

  return loginPageExists && registerPageExists && verificationPageExists;
}

// 模拟登录流程测试
function testLoginFlow() {
  console.log("\n--- Testing Login Flow ---");
  
  try {
    // 检查登录页面内容
    const loginPageContent = fs.readFileSync('./extism-registry/src/app/auth/login/page.tsx', 'utf8');
    
    // 检查是否包含登录表单元素
    const hasEmailField = loginPageContent.includes('id="email"');
    const hasPasswordField = loginPageContent.includes('id="password"');
    const hasSubmitButton = loginPageContent.includes('type="submit"');
    
    console.log(`[${hasEmailField ? '✅ PASS' : '❌ FAIL'}] Email input field`);
    console.log(`[${hasPasswordField ? '✅ PASS' : '❌ FAIL'}] Password input field`);
    console.log(`[${hasSubmitButton ? '✅ PASS' : '❌ FAIL'}] Submit button`);

    // 检查错误处理
    const hasErrorHandling = loginPageContent.includes('setError(');
    console.log(`[${hasErrorHandling ? '✅ PASS' : '❌ FAIL'}] Error handling`);

    return hasEmailField && hasPasswordField && hasSubmitButton && hasErrorHandling;
  } catch (err) {
    console.log(`[❌ FAIL] Unable to read login page: ${err.message}`);
    return false;
  }
}

// 模拟注册流程测试
function testRegistrationFlow() {
  console.log("\n--- Testing Registration Flow ---");
  
  try {
    // 检查注册页面内容
    const registerPageContent = fs.readFileSync('./extism-registry/src/app/auth/register/page.tsx', 'utf8');
    
    // 检查是否包含注册表单元素
    const hasNameField = registerPageContent.includes('id="name"');
    const hasEmailField = registerPageContent.includes('id="email"');
    const hasUsernameField = registerPageContent.includes('id="username"');
    const hasPasswordField = registerPageContent.includes('id="password"');
    const hasConfirmPasswordField = registerPageContent.includes('id="confirmPassword"');
    
    console.log(`[${hasNameField ? '✅ PASS' : '❌ FAIL'}] Name input field`);
    console.log(`[${hasEmailField ? '✅ PASS' : '❌ FAIL'}] Email input field`);
    console.log(`[${hasUsernameField ? '✅ PASS' : '❌ FAIL'}] Username input field`);
    console.log(`[${hasPasswordField ? '✅ PASS' : '❌ FAIL'}] Password input field`);
    console.log(`[${hasConfirmPasswordField ? '✅ PASS' : '❌ FAIL'}] Confirm password field`);

    // 检查验证功能
    const hasValidation = registerPageContent.includes('password !== confirmPassword');
    console.log(`[${hasValidation ? '✅ PASS' : '❌ FAIL'}] Password validation`);

    return hasNameField && hasEmailField && hasUsernameField && hasPasswordField && 
           hasConfirmPasswordField && hasValidation;
  } catch (err) {
    console.log(`[❌ FAIL] Unable to read registration page: ${err.message}`);
    return false;
  }
}

// 模拟邮箱验证流程测试
function testVerificationFlow() {
  console.log("\n--- Testing Email Verification Flow ---");
  
  try {
    // 检查验证页面内容
    const verificationPageContent = fs.readFileSync('./extism-registry/src/app/auth/verification-sent/page.tsx', 'utf8');
    
    // 检查是否包含必要元素
    const hasEmailSentMessage = verificationPageContent.includes('Check your email') || 
                               verificationPageContent.includes('sent you a verification');
    const hasResendOption = verificationPageContent.includes('Resend verification');
    
    console.log(`[${hasEmailSentMessage ? '✅ PASS' : '❌ FAIL'}] Email sent confirmation message`);
    console.log(`[${hasResendOption ? '✅ PASS' : '❌ FAIL'}] Resend verification option`);

    return hasEmailSentMessage && hasResendOption;
  } catch (err) {
    console.log(`[❌ FAIL] Unable to read verification page: ${err.message}`);
    return false;
  }
}

// 运行所有测试
const uiTestResult = testAuthUIComponents();
const loginTestResult = testLoginFlow();
const registrationTestResult = testRegistrationFlow();
const verificationTestResult = testVerificationFlow();

// 汇总测试结果
console.log("\n--- Test Summary ---");
console.log(`UI Components: ${uiTestResult ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Login Flow: ${loginTestResult ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Registration Flow: ${registrationTestResult ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Verification Flow: ${verificationTestResult ? '✅ PASS' : '❌ FAIL'}`);

const overallResult = uiTestResult && loginTestResult && registrationTestResult && verificationTestResult;
console.log(`\nOverall Status: ${overallResult ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

// 添加测试结果到测试结果文件
try {
  fs.appendFileSync('./test-results.txt', "\n--- 用户身份验证系统 ---\n");
  fs.appendFileSync('./test-results.txt', `登录页面: ${uiTestResult && loginTestResult ? '✅ PASS' : '❌ FAIL'}\n`);
  fs.appendFileSync('./test-results.txt', `注册页面: ${uiTestResult && registrationTestResult ? '✅ PASS' : '❌ FAIL'}\n`);
  fs.appendFileSync('./test-results.txt', `邮箱验证: ${uiTestResult && verificationTestResult ? '✅ PASS' : '❌ FAIL'}\n`);
  fs.appendFileSync('./test-results.txt', `测试总结: ${overallResult ? '✅ 通过' : '❌ 失败'}\n`);
} catch (err) {
  console.error("无法写入测试结果文件:", err);
} 