import { headers } from "next/headers";
import LoginButton from "@/app/login/LoginButton";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const headersList = headers();
  const callbackUrl = headersList.get("referer") || "/";

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow-md font-primary">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

      <LoginButton callbackUrl={callbackUrl} />

      <p className="mt-4 text-sm text-gray-600 text-center">
        You'll be redirected to: {callbackUrl}
      </p>
    </div>
  );
}
