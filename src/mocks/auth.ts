import { AuthResponse, CustomerProfile } from '@/types/api';

export const MOCK_USER: CustomerProfile = {
  id: 'user_trece_001',
  email: 'customer@example.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  phone: '+595981234567',
  addresses: [],
};

// Simple base64 token generator for mock JWT testing
export function generateMockJWT(payload: { userId?: string; email?: string; firstName?: string; lastName?: string }): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(
    JSON.stringify({
      userId: payload.userId || 'user_trece_001',
      email: payload.email || 'customer@example.com',
      firstName: payload.firstName || 'Juan',
      lastName: payload.lastName || 'Pérez',
      role: 'customer',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    })
  );
  const signature = 'mock_signature_trece13';
  return `${header}.${body}.${signature}`;
}

export const MOCK_AUTH_RESPONSE: AuthResponse = {
  userId: MOCK_USER.id,
  email: MOCK_USER.email,
  firstName: MOCK_USER.firstName,
  lastName: MOCK_USER.lastName,
  token: generateMockJWT({ userId: MOCK_USER.id, email: MOCK_USER.email }),
  expiresIn: 86400,
};
