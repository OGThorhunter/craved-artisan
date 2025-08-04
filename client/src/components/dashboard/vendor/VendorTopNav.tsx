export default function VendorTopNav() {
  return (
    <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <h1 className="text-lg font-semibold">Vendor Dashboard</h1>
      <div className="flex gap-4 items-center">
        <span className="text-sm text-[#777]">Craved Artisan</span>
        <img src="/logo-icon.png" alt="Craved Logo" className="h-6 w-6 rounded-full" />
      </div>
    </header>
  );
} 