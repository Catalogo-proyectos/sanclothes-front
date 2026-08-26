'use client';

import ErrorComponent from '@/app/error';

export default function ErrorPreviewPage() {
  return (
    <ErrorComponent
      error={new Error('Simulación de error')}
      reset={() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }}
    />
  );
}
