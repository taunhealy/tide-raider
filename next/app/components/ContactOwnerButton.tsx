"use client";

import { useState } from "react";
import { BoardContactForm } from "./boards/BoardContactForm";

interface ContactOwnerButtonProps {
  ownerEmail: string;
  ownerName: string;
  contactType?: "email" | "boardRental";
  boardId?: string;
  availableBeaches?: Array<{ id: string; name: string }>;
}

export function ContactOwnerButton({
  ownerEmail,
  ownerName,
  contactType = "email",
  boardId,
  availableBeaches = [],
}: ContactOwnerButtonProps) {
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (contactType === "email") {
      setIsEmailVisible(true);
    } else if (contactType === "boardRental") {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="font-primary">
      <button
        onClick={handleClick}
        className="btn-tertiary px-4 py-2 text-[16px] leading-6"
      >
        {contactType === "boardRental" ? "Request Rental" : "Contact Owner"}
      </button>

      {/* Email Display */}
      {contactType === "email" && isEmailVisible && (
        <div className="mt-2 space-y-2">
          <p className="text-[var(--color-text-primary)]">
            Contact {ownerName} at:
          </p>
          <a
            href={`mailto:${ownerEmail}`}
            className="text-[var(--color-tertiary)] hover:opacity-90 transition-colors"
          >
            {ownerEmail}
          </a>
        </div>
      )}

      {/* Rental Modal */}
      {contactType === "boardRental" && isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Request Board Rental
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              {boardId && (
                <BoardContactForm
                  boardId={boardId}
                  availableBeaches={availableBeaches}
                  onSubmit={(formData) => {
                    // Handle form submission
                    console.log(formData);
                    setIsModalOpen(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
