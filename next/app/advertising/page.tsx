'use client'

import { useState } from 'react';

export default function AdvertisingPage() {
  const [error, setError] = useState('');
  const [beachName, setBeachName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [adImage, setAdImage] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // First submit the form data and get the ad ID
      const formData = new FormData();
      formData.append('beachName', beachName);
      formData.append('companyName', companyName);
      formData.append('email', email);
      formData.append('linkUrl', linkUrl);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      if (adImage) {
        formData.append('adImage', adImage);
      }

      const submitResponse = await fetch('/api/advertising/submit', {
        method: 'POST',
        body: formData,
      });

      if (!submitResponse.ok) {
        const error = await submitResponse.json();
        throw new Error(error.error || 'Failed to submit ad request');
      }

      const { id } = await submitResponse.json();

      // Then create checkout with the ad ID
      const checkoutResponse = await fetch('/api/advertising/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adId: id }),
      });

      if (!checkoutResponse.ok) {
        const error = await checkoutResponse.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      const { url } = await checkoutResponse.json();
      window.location.href = url;
    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Advertise Your Business</h1>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="beachName" className="block text-sm font-medium text-gray-700 mb-1">
            Beach Name
          </label>
          <input
            type="text"
            id="beachName"
            value={beachName}
            onChange={(e) => setBeachName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="adImage" className="block text-sm font-medium text-gray-700 mb-1">
            Advertisement Image
          </label>
          <input
            type="file"
            id="adImage"
            accept="image/*"
            onChange={(e) => setAdImage(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Advertisement Link URL
          </label>
          <input
            type="url"
            id="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="https://..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
