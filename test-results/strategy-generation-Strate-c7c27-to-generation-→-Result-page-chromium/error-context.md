# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: strategy-generation.spec.ts >> Strategy Generation Flow - E2E >> PASS: Complete flow - Step 4 → Auto-generation → Result page
- Location: tests/e2e/strategy-generation.spec.ts:24:7

# Error details

```
TypeError: supabase.auth.signUpWithPassword is not a function
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { createClient } from '@supabase/supabase-js';
  3   | 
  4   | // Test configuration
  5   | const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ihvrawwavkqkhkygoqyo.supabase.co';
  6   | const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-YweJjOZRvNSDFG5Tf0Odw_bk2Zh2IH';
  7   | const ANON_KEY = SUPABASE_KEY;
  8   | 
  9   | // Create a Supabase client
  10  | const supabase = createClient(SUPABASE_URL, ANON_KEY);
  11  | 
  12  | test.describe('Strategy Generation Flow - E2E', () => {
  13  |   let sessionEmail = '';
  14  |   let sessionPassword = '';
  15  |   let testUserId = '';
  16  | 
  17  |   test.beforeAll(async () => {
  18  |     // Generate unique test credentials
  19  |     sessionEmail = `test-${Date.now()}@example.com`;
  20  |     sessionPassword = 'TestPassword123!';
  21  |     console.log(`📝 Test credentials: ${sessionEmail}`);
  22  |   });
  23  | 
  24  |   test('PASS: Complete flow - Step 4 → Auto-generation → Result page', async ({ page, context }) => {
  25  |     console.log('\n🔵 TEST: Step 4 → Strategy Auto-Generation → Result Page');
  26  | 
  27  |     // Step 1: Sign up test user
  28  |     console.log('\n1️⃣ Step 1: Signing up test user...');
> 29  |     const signupResp = await supabase.auth.signUpWithPassword({
      |                                            ^ TypeError: supabase.auth.signUpWithPassword is not a function
  30  |       email: sessionEmail,
  31  |       password: sessionPassword,
  32  |     });
  33  | 
  34  |     if (signupResp.error && signupResp.error.message.includes('already exists')) {
  35  |       console.log('   ℹ️ Test user already exists, signing in instead...');
  36  |       const signinResp = await supabase.auth.signInWithPassword({
  37  |         email: sessionEmail,
  38  |         password: sessionPassword,
  39  |       });
  40  |       if (signinResp.error) throw signinResp.error;
  41  |       testUserId = signinResp.data.user?.id || '';
  42  |     } else if (signupResp.error) {
  43  |       throw signupResp.error;
  44  |     } else {
  45  |       testUserId = signupResp.data.user?.id || '';
  46  |       console.log('   ✅ Signup successful');
  47  |     }
  48  | 
  49  |     // Step 2: Set auth session in browser
  50  |     console.log('\n2️⃣ Step 2: Setting browser session...');
  51  |     const { data: session } = await supabase.auth.getSession();
  52  |     if (session?.session?.access_token) {
  53  |       await context.addCookies([
  54  |         {
  55  |           name: 'sb-' + SUPABASE_URL.split('//')[1].split('.')[0] + '-auth-token',
  56  |           value: JSON.stringify(session.session),
  57  |           domain: 'localhost',
  58  |           path: '/',
  59  |         }
  60  |       ]);
  61  |       console.log('   ✅ Session set');
  62  |     }
  63  | 
  64  |     // Step 3: Navigate to confirm page
  65  |     console.log('\n3️⃣ Step 3: Navigating to Step 4 (confirm)...');
  66  |     await page.goto('/onboarding/confirm', { waitUntil: 'networkidle' });
  67  | 
  68  |     // Verify we're on confirm page
  69  |     const confirmHeading = page.getByRole('heading', { name: /入力内容の確認/ });
  70  |     await expect(confirmHeading).toBeVisible({ timeout: 5000 });
  71  |     console.log('   ✅ Confirm page loaded');
  72  | 
  73  |     // Step 4: Monitor API calls
  74  |     console.log('\n4️⃣ Step 4: Setting up API monitoring...');
  75  |     let apiCallCount = 0;
  76  |     const apiCalls: { url: string; status: number; timestamp: number }[] = [];
  77  | 
  78  |     page.on('response', (response) => {
  79  |       const url = response.url();
  80  |       if (url.includes('/api/strategy/generate')) {
  81  |         apiCallCount++;
  82  |         apiCalls.push({
  83  |           url,
  84  |           status: response.status(),
  85  |           timestamp: Date.now(),
  86  |         });
  87  |         console.log(`   🔴 API call ${apiCallCount}: ${url} - Status ${response.status()}`);
  88  |       }
  89  |     });
  90  |     console.log('   ✅ API monitoring active');
  91  | 
  92  |     // Step 5: Click "SNS設計を生成する" button
  93  |     console.log('\n5️⃣ Step 5: Clicking "SNS設計を生成する" button...');
  94  |     const button = page.getByRole('button', { name: /SNS設計を生成する/ });
  95  |     await expect(button).toBeVisible({ timeout: 5000 });
  96  | 
  97  |     // Record click time
  98  |     const clickTime = Date.now();
  99  |     await button.click();
  100 |     console.log('   ✅ Button clicked');
  101 | 
  102 |     // Step 6: Wait for strategy page navigation
  103 |     console.log('\n6️⃣ Step 6: Waiting for strategy page...');
  104 |     await page.waitForURL(/\/onboarding\/strategy/, { timeout: 10000 });
  105 |     console.log('   ✅ Navigated to /onboarding/strategy');
  106 | 
  107 |     // Step 7: Wait for auto-generation to complete
  108 |     console.log('\n7️⃣ Step 7: Waiting for auto-generation...');
  109 |     await page.waitForTimeout(2000); // Wait for API call
  110 | 
  111 |     // Step 8: Check for result page navigation or error
  112 |     console.log('\n8️⃣ Step 8: Checking final state...');
  113 |     const currentUrl = page.url();
  114 |     let finalState = 'unknown';
  115 | 
  116 |     if (currentUrl.includes('/onboarding/strategy-result')) {
  117 |       finalState = 'result-page';
  118 |       console.log('   ✅ Navigated to /onboarding/strategy-result');
  119 |     } else if (currentUrl.includes('/onboarding/strategy')) {
  120 |       // Check if loading, error, or strategy shown
  121 |       const loadingText = await page.getByText(/作成中/).isVisible().catch(() => false);
  122 |       const errorText = await page.getByText(/失敗/).isVisible().catch(() => false);
  123 |       const retryButton = await page.getByRole('button', { name: /もう一度試す/ }).isVisible().catch(() => false);
  124 | 
  125 |       if (loadingText) {
  126 |         finalState = 'loading';
  127 |       } else if (errorText || retryButton) {
  128 |         finalState = 'error';
  129 |       } else {
```