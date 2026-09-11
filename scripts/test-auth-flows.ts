import prisma from '../lib/prisma'

const BASE_URL = 'http://localhost:3000'

async function runTests() {
  console.log('🧪 Running Complete Authentication Flows Test Suite...\n')

  const testEmail = `cust_${Date.now()}@example.com`
  const testPassword = 'TestPassword@123'
  let customerCookie = ''
  let adminCookie = ''

  // ==========================================
  // Flow 1: Customer Registration
  // ==========================================
  console.log('--- [FLOW 1] Customer Registration ---')
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alice Baker',
      email: testEmail,
      phone: '+1 555 123 4567',
      password: testPassword,
      confirmPassword: testPassword,
    }),
  })
  const regData = await regRes.json()
  console.log('Registration Status:', regRes.status, 'Response:', regData)
  if (regRes.status !== 201 || !regData.success || regData.data.role !== 'CUSTOMER') {
    throw new Error('Flow 1 Failed: Customer registration did not create CUSTOMER role')
  }
  console.log('✓ Flow 1 Passed: Customer registered successfully with role CUSTOMER\n')

  // Capture session cookie from register
  const rawRegCookie = regRes.headers.get('set-cookie')
  if (rawRegCookie) {
    customerCookie = rawRegCookie.split(';')[0]
  }

  // ==========================================
  // Flow 2: Customer Login
  // ==========================================
  console.log('--- [FLOW 2] Customer Login ---')
  const custLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  })
  const custLoginData = await custLoginRes.json()
  console.log('Customer Login Status:', custLoginRes.status, 'Response:', custLoginData)
  if (custLoginRes.status !== 200 || !custLoginData.success || custLoginData.data.role !== 'CUSTOMER') {
    throw new Error('Flow 2 Failed: Customer login failed')
  }
  const rawCustCookie = custLoginRes.headers.get('set-cookie')
  if (rawCustCookie) {
    customerCookie = rawCustCookie.split(';')[0]
  }
  console.log('✓ Flow 2 Passed: Customer authenticated with role CUSTOMER\n')

  // ==========================================
  // Flow 3: Admin Login
  // ==========================================
  console.log('--- [FLOW 3] Admin Login ---')
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123'
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
    }),
  })
  const adminLoginData = await adminLoginRes.json()
  console.log('Admin Login Status:', adminLoginRes.status, 'Response:', adminLoginData)
  if (adminLoginRes.status !== 200 || !adminLoginData.success || adminLoginData.data.role !== 'ADMIN') {
    throw new Error('Flow 3 Failed: Admin login failed or role is not ADMIN')
  }
  const rawAdminCookie = adminLoginRes.headers.get('set-cookie')
  if (rawAdminCookie) {
    adminCookie = rawAdminCookie.split(';')[0]
  }
  console.log('✓ Flow 3 Passed: Admin authenticated with role ADMIN\n')

  // ==========================================
  // Flow 4: Customer Tries Accessing Admin
  // ==========================================
  console.log('--- [FLOW 4] Customer Tries Accessing Admin Route ---')
  const custAdminRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: customerCookie },
  })
  const custAdminData = await custAdminRes.json()
  console.log('Customer Admin API Status:', custAdminRes.status, 'Response:', custAdminData)
  if (custAdminRes.status !== 403) {
    throw new Error(`Flow 4 Failed: Expected 403 Forbidden, got ${custAdminRes.status}`)
  }
  console.log('✓ Flow 4 Passed: Customer is strictly rejected from Admin APIs with 403 Forbidden\n')

  // ==========================================
  // Flow 5: Logged-out / Unauthenticated Admin Access
  // ==========================================
  console.log('--- [FLOW 5] Unauthenticated Access to Admin Route ---')
  const noAuthAdminRes = await fetch(`${BASE_URL}/api/admin/stats`)
  const noAuthData = await noAuthAdminRes.json()
  console.log('Unauthenticated Admin API Status:', noAuthAdminRes.status, 'Response:', noAuthData)
  if (noAuthAdminRes.status !== 401) {
    throw new Error(`Flow 5 Failed: Expected 401 Unauthorized, got ${noAuthAdminRes.status}`)
  }
  console.log('✓ Flow 5 Passed: Unauthenticated request rejected with 401 Unauthorized\n')

  // ==========================================
  // Flow 6: Admin Successfully Accesses Admin APIs
  // ==========================================
  console.log('--- [FLOW 6] Admin Accesses Admin API ---')
  const adminStatsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  })
  const adminStatsData = await adminStatsRes.json()
  console.log('Admin API Status:', adminStatsRes.status, 'Response:', adminStatsData)
  if (adminStatsRes.status !== 200 || !adminStatsData.success) {
    throw new Error('Flow 6 Failed: Admin could not access admin stats')
  }
  console.log('✓ Flow 6 Passed: Admin accesses admin APIs without issues\n')

  // ==========================================
  // Flow 7: Password Reset Flow
  // ==========================================
  console.log('--- [FLOW 7] Forgot & Reset Password Flow ---')
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  })
  const forgotData = await forgotRes.json()
  console.log('Forgot Password Status:', forgotRes.status, 'Response:', forgotData)
  if (!forgotData.success || !forgotData.resetUrl) {
    throw new Error('Flow 7 Failed: Forgot password did not generate reset URL')
  }

  const token = forgotData.resetUrl.split('token=')[1]
  const newPassword = 'NewSecretPassword@456'

  const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      password: newPassword,
      confirmPassword: newPassword,
    }),
  })
  const resetData = await resetRes.json()
  console.log('Reset Password Status:', resetRes.status, 'Response:', resetData)
  if (!resetData.success) {
    throw new Error('Flow 7 Failed: Reset password was rejected')
  }

  // Verify login with NEW password
  const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: newPassword,
    }),
  })
  const newLoginData = await newLoginRes.json()
  console.log('New Password Login Status:', newLoginRes.status, 'Success:', newLoginData.success)
  if (newLoginRes.status !== 200 || !newLoginData.success) {
    throw new Error('Flow 7 Failed: Could not login with new password')
  }
  console.log('✓ Flow 7 Passed: Forgot password, token verification, password reset, and new login completed!\n')

  // Clean up test user
  await prisma.user.delete({ where: { email: testEmail } }).catch(() => {})

  console.log('🎉 ALL 7 AUTHENTICATION FLOWS VERIFIED AND PASSED SUCCESSFULLY!')
}

runTests()
  .catch((err) => {
    console.error('❌ Test Suite Failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
