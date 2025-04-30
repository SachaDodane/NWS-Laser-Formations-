import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <span>&copy; {new Date().getFullYear()} NWS Laser Formations</span>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/politique-confidentialite" className="hover:text-blue-600">Confidentialité</Link>
          <Link href="/cgv-cgu" className="hover:text-blue-600">CGU / CGV</Link>
          <Link href="/mentions-legales" className="hover:text-blue-600">Mentions légales</Link>
        </div>
      </div>
    </footer>
  );
}
