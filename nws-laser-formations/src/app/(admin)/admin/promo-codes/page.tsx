import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { connectDB } from '@/lib/db/connect';
import PromoCode from '@/models/PromoCode';
import PromoCodesList from '@/components/admin/PromoCodesList';

export const metadata = {
  title: 'Gestion des codes promo | NWS Laser Formations',
  description: 'Administration des codes promotionnels',
};

async function getPromoCodes() {
  await connectDB();
  
  const promoCodes = await PromoCode.find().sort({ createdAt: -1 }).lean();
  
  return promoCodes.map((code: any) => ({
    _id: code._id.toString(),
    code: code.code,
    discount: code.discount,
    isFreePass: code.isFreePass || false,
    maxUses: code.maxUses,
    currentUses: code.currentUses || 0,
    isActive: code.isActive,
    expiresAt: code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : 'Pas de date d\'expiration',
    createdAt: code.createdAt ? new Date(code.createdAt).toLocaleDateString() : 'N/A',
  }));
}

export default async function PromoCodesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }
  
  const promoCodes = await getPromoCodes();
  
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link
              href="/admin"
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à l'administration
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des codes promo
            </h1>
            <p className="mt-2 text-gray-600">
              Créez et gérez les codes promotionnels et les pass gratuits pour les formations.
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Client component for managing promo codes */}
          <PromoCodesList initialCodes={promoCodes} />
        </div>
      </div>
    </div>
  );
}
