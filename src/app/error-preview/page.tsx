import type { Metadata } from 'next';
import ErrorPreviewClient from './ErrorPreviewClient';

export const metadata: Metadata = {
  title: 'Vista previa de error',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ErrorPreviewPage() {
  return <ErrorPreviewClient />;
}
