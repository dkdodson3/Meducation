'use client';

import Header from '@/components/ui/MedNotes/Header';
import DisclaimerCard from '@/components/ui/MedNotes/DisclaimerCard';
import DataForm from '@/components/ui/MedNotes/DataForm';


export default function MedNotes() {
// const {
//   data: { user }
// } = await supabase.auth.getUser();

// if (!user) {
//   return redirect('/signin');
// }

return (
  <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
    <Header />
    <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20"> 
      <DisclaimerCard />
      <DataForm />
    </main>
  </div>
  );
}