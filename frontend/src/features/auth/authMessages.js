export const translateAuthError = (error, fallback = 'حدث خطأ، يرجى المحاولة مرة أخرى.') => {
  const message = String(error?.message || error || '').toLowerCase()

  if (message.includes('otp') && (message.includes('invalid') || message.includes('expired') || message.includes('not found'))) {
    return 'رمز التحقق غير صحيح أو انتهت صلاحيته.'
  }
  if (message.includes('code') && message.includes('invalid')) {
    return 'رمز التحقق غير صحيح أو انتهت صلاحيته.'
  }
  if (message.includes('email') && (message.includes('does not exist') || message.includes('not found'))) {
    return 'لا يوجد حساب مسجل بهذا البريد الإلكتروني.'
  }
  if (message.includes('email') && (message.includes('exist') || message.includes('registered'))) {
    return 'هذا البريد الإلكتروني مسجل بالفعل.'
  }
  if (message.includes('password') && (message.includes('incorrect') || message.includes('invalid'))) {
    return 'كلمة المرور غير صحيحة.'
  }
  if (message.includes('credential') || message.includes('credent') || message.includes('unauthorized')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
  }
  if (message.includes('network') || message.includes('connect')) {
    return 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.'
  }
  if (message.includes('expired') || message.includes('token')) {
    return 'انتهت صلاحية الرابط. يرجى طلب رابط جديد.'
  }
  if (message.includes('reset link')) {
    return 'رابط إعادة تعيين كلمة المرور غير صالح أو انتهت صلاحيته.'
  }

  return fallback
}
