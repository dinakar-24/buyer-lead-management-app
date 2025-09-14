'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AnimatedBackground />

      <Card className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-md border border-red-500/30 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            There was an error logging you in. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/auth/login">
            <Button variant="secondary">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
