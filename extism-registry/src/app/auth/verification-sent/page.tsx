import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function VerificationSentPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link to complete your registration
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="my-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 text-primary"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <div className="text-center">
            <p className="mb-2">
              The email contains a verification link that will activate your account.
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              If you don't see the email in your inbox, please check your spam folder.
            </p>
          </div>

          <Button className="w-full" asChild>
            <Link href="/auth/login">
              Proceed to login
            </Link>
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <div className="text-center text-sm">
            Didn't receive the email?{' '}
            <button className="text-primary hover:underline">
              Resend verification email
            </button>
          </div>
          <div className="text-center text-sm">
            <Link href="/auth/register" className="text-primary hover:underline">
              Use a different email address
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 