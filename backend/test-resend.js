import { testApiKey } from './src/lib/resend.js';

(async () => {
  console.log('🧪 Testing Resend API Key...');
  const result = await testApiKey();
  console.log('Result:', result);
  
  if (result.valid) {
    console.log('✅ API Key VALID! Ready to send emails.');
  } else {
    console.log('❌ API Key INVALID:', result.message);
    console.log('💡 Fix: Get new key from https://resend.com and add to backend/.env');
  }
})();

