import { Resend } from 'resend';

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️ [RESEND] No API key - running in DEV MODE');
    return null;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ [RESEND] Client initialized');
  return resend;
};

export const sendEmail = async (params) => {
  const resend = getResendClient();
  
  if (!resend) {
    console.log(`📱 [DEV MODE] Would send to ${params.to}:`, {
      subject: params.subject,
      codePreview: params.html?.match(/<span[^&]*>(\\d{6})</)?.[1] || 'CODE'
    });
    return {
      success: true,
      devMode: true,
      message: 'Email skipped (DEV MODE) - check console for code'
    };
  }

  try {
    console.log(`📤 [RESEND] Sending to ${params.to[0]} - Subject: ${params.subject}`);
    const { data, error } = await resend.emails.send(params);
    
    if (error) {
      console.error('❌ [RESEND API ERROR] Detailed:', {
        message: error.message,
        code: error.code || 'UNKNOWN',
        statusCode: error?.data?.statusCode,
        email: params.to[0],
        fullError: error
      });
      return { success: false, error: error.message, code: error.code };
    }
    
    console.log(`✅ [RESEND] Email sent successfully to ${params.to[0]}`);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('💥 [RESEND CRASH] Raw error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return { success: false, error: error.message };
  }
};

export const testApiKey = async () => {
  const resend = getResendClient();
  if (!resend) return { valid: false, message: 'No API key' };
  
  try {
    const { data, error } = await resend.domains.list();
    return {
      valid: !error,
      message: error ? error.message : 'API key valid'
    };
  } catch (error) {
    return { valid: false, message: error.message };
  }
};

export default getResendClient;

