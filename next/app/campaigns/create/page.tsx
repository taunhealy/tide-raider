import { CampaignForm } from '@/app/components/CampaignForm';

export default function CreateCampaignPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Ad Campaign</h1>
      <CampaignForm />
    </div>
  );
}