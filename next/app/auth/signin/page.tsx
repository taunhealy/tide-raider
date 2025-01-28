"use client";

import { signIn, getProviders } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [providers, setProviders] = useState<any>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    loadProviders();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
      <div className="text-center p-8">
        {error === "OAuthAccountNotLinked" && (
          <p className="text-red-500 mb-4">
            This email is already associated with another account. Please sign
            in with the same method you used previously.
          </p>
        )}
        {providers &&
          Object.values(providers).map((provider: any) => (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id, { callbackUrl })}
              className="flex items-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-lg 
                       shadow-sm hover:shadow-md transition-all mx-auto"
            >
              <span>Sign in with {provider.name}</span>
            </button>
          ))}
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
