"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useSubscription } from "../context/SubscriptionContext";
import { useHandleSubscription } from "../hooks/useHandleSubscription";

export default function Navbar() {
  const { data: session } = useSession();
  const { isSubscribed } = useSubscription();
  const handleSubscribe = useHandleSubscription();

  const handleUnsubscribe = async () => {
    try {
      if (!session?.user?.id) {
        alert("Please sign in first");
        return;
      }

      const unsubResponse = await fetch("/api/test-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          action: "unsubscribe",
        }),
      });

      if (!unsubResponse.ok) {
        throw new Error("Failed to unsubscribe");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to unsubscribe. Please try again.");
    }
  };

  return (
    <header className="navbar">
      <h1>Cape Town Surf Spots</h1>
      <div className="auth-buttons">
        {isSubscribed ? (
          <button className="subscribe-btn" onClick={handleUnsubscribe}>
            Cancel Subscription
          </button>
        ) : (
          <button
            className="subscribe-btn"
            onClick={() =>
              handleSubscribe.mutate({
                action: "subscribe",
                userId: session?.user?.id || "",
              })
            }
          >
            Subscribe
          </button>
        )}
        {session ? (
          <button className="auth-btn" onClick={() => signOut()}>
            Sign Out
          </button>
        ) : (
          <button className="auth-btn" onClick={() => signIn("google")}>
            Sign In
          </button>
        )}
      </div>

      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #2c3e50;
        }

        .auth-buttons {
          display: flex;
          gap: 1rem;
        }

        .subscribe-btn,
        .auth-btn {
          background: var(--color-tertiary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .subscribe-btn:hover,
        .auth-btn:hover {
          background: #2980b9;
        }

        .auth-btn {
          background: #2ecc71;
        }

        .auth-btn:hover {
          background: #27ae60;
        }
      `}</style>
    </header>
  );
}
