"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
      <div className="text-center p-8">
        {error === "OAuthAccountNotLinked" && (
          <p className="text-red-500 mb-4">
            This email is already associated with another account. Please sign
            in with the same method you used previously.
          </p>
        )}
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg 
                   shadow-sm hover:shadow-md transition-all mx-auto"
        >
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
