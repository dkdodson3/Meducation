'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/ui/MedNotes/Header';
import DisclaimerCard from '@/components/ui/MedNotes/DisclaimerCard';
import DataForm from '@/components/ui/MedNotes/DataForm';
import { useChat } from 'ai/react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';


export default  function MedNotes() {
  const supabase = createClient();
  const [disease, setDisease] = useState('');
  const diseaseRef = useRef(disease); // Create a ref for the disease state
  const notesRef = useRef<null | HTMLDivElement>(null);
  const [isReadyForSubmit, setIsReadyForSubmit] = useState(false);

  const [selectedPhysicianType, setSelectedPhysicianType] = useState('')

  const scrollToNotes = () => {
    if (notesRef.current !== null) {
      notesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { input, handleInputChange, handleSubmit, isLoading, messages } = useChat({
    body: { disease },
    onResponse() {
      scrollToNotes();
    },
  });

  const submitEventRef = useRef<null | React.FormEvent<HTMLFormElement>>(null);

  const onSubmit = (e: any) => {
    e.preventDefault();
    const messageObject = {
      disease: input,
      physician_type: selectedPhysicianType,
    };
    const messageString = JSON.stringify(messageObject);
    submitEventRef.current = e;
    setDisease(messageString);
    setIsReadyForSubmit(true);
  };

const copyToClipboard = async (text : string) => {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text)
  } else {
    return document.execCommand('copy', true, text)
  }
}

useEffect(() => {
  if (isReadyForSubmit && disease && submitEventRef.current) {
    handleSubmit(submitEventRef.current);
    setIsReadyForSubmit(false);
  }
}, [disease, isReadyForSubmit, handleSubmit]); 

const lastMessage = messages[messages.length - 1];
const generatedNote = lastMessage?.role === "assistant" ? lastMessage.content : null;


const transformNote = (note : string) => {
  if (note) {
    const separatedNotes = note.split("<sep />")
    let newNotes: string[][] = [];
    separatedNotes.forEach((item: string) => {
      let splitItem = item.split("**")
      if (splitItem.length > 1) {
        let firstItem = splitItem[1];
        let otherItems = splitItem.slice(2);
        if (!otherItems.includes("**")) {
          newNotes.push([firstItem, ...otherItems]); // Spread the otherItems array without joining
        }
      }
    });

    return newNotes;
  };

};

const transformedNote = generatedNote ? transformNote(generatedNote) : null; 

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