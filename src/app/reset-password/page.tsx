import type { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Página privada para restablecer la contraseña de una cuenta SANT CLOTHES.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/reset-password',
  },
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
