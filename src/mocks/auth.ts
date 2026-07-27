import { AuthResponse, CustomerProfile } from '@/types/api';

export const MOCK_USER: CustomerProfile = {
  userId: 'user_trece_001',
  email: 'customer@example.com',
  firstName: 'Juan',
  lastName: 'Pérez',
  phone: '+595981234567',
  address: 'Av. España 1420',
  city: 'Asunción',
  state: 'Central',
  zipCode: '1429',
  country: 'Paraguay',
  createdAt: '2026-01-15T10:00:00.000Z',
  isVIP: true,
  isUnsubscribed: false,
};

// Simple base64 token generator for mock JWT testing
export function generateMockJWT(payload: Partial<CustomerProfile>): string {
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
  userId: MOCK_USER.userId,
  email: MOCK_USER.email,
  firstName: MOCK_USER.firstName,
  lastName: MOCK_USER.lastName,
  token: generateMockJWT(MOCK_USER),
  expiresIn: 86400,
};
