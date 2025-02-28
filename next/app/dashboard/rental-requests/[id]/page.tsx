"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { RequestStatusBadge } from "@/app/components/requests/RequestStatusBadge";
import { RequestDetails } from "@/app/components/requests/RequestDetails";
import { RequestChat } from "@/app/components/requests/RequestChat";
import type { RentalRequest, ChatMessage, RequestStatus } from "@prisma/client";

export default function RentalRequestPage({
  params,
}: {
  params: { id: string };
}) {
  const [request, setRequest] = useState<RentalRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const isOwner = session?.user?.id === request?.ownerId;
  const isRenter = session?.user?.id === request?.renterId;

  useEffect(() => {
    const fetchRequestData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/rental-requests/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch request data");
        }

        const data = await response.json();
        setRequest(data.request);
        setMessages(data.messages);
      } catch (err) {
        setError("Error loading request details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestData();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    try {
      const response = await fetch(`/api/rental-requests/${params.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update request status");
      }

      const updatedRequest = await response.json();
      setRequest(updatedRequest);
    } catch (err) {
      console.error("Error updating request status:", err);
      // You could add a toast notification here
    }
  };

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch(
        `/api/rental-requests/${params.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const newMessage = await response.json();
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      // You could add a toast notification here
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 font-primary">Loading...</div>;
  }

  if (error || !request) {
    return (
      <div className="container mx-auto p-4 font-primary">
        Error: {error || "Request not found"}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 font-primary">
      <h1 className="text-2xl font-bold mb-6">Rental Request</h1>

      <RequestStatusBadge status={request.status} />
      <RequestDetails request={request} />

      {/* Owner Actions */}
      {isOwner && request.status === "PENDING" && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => handleStatusUpdate("ACCEPTED")}
            className="btn-primary"
          >
            Accept
          </button>
          <button
            onClick={() => handleStatusUpdate("DECLINED")}
            className="btn-secondary"
          >
            Decline
          </button>
        </div>
      )}

      {/* Renter Actions */}
      {isRenter && request.status === "PENDING" && (
        <div className="mt-6">
          <button
            onClick={() => handleStatusUpdate("CANCELLED")}
            className="btn-secondary"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Chat Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>
        <RequestChat
          messages={messages}
          requestId={params.id}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
