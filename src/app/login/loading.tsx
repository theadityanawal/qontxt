// src/app/login/loading.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-48" />
        </CardHeader>

        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </main>
  );
}
