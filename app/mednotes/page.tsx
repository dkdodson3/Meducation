'use client';

import Button from '@/components/ui/Button';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/ui/MedNotes/Header';
import DisclaimerCard from '@/components/ui/MedNotes/DisclaimerCard';


import { useChat } from 'ai/react';
import { createClient } from '@/utils/supabase/client';
import { redirect } from 'next/navigation';

const physician_type_options = {
  "": "Select your specialty...",
  "emergency_room_physician": "Emergency Room Physician",
  "inpatient_physician": "Inpatient Physician",
  "ambulatory_physician": "Ambulatory Physician",
  "general_physician": "General Physician",
  // ... other roles
};


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
    // Todo: Fix it
    // munging the data to fit the boxes... VERY BAD FORM...
    const notes = note.split("<sep />").filter(line => line.trim() !== "");
    notes[0] = "\n\n" + notes[0]
    return notes;
  }
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
      <form style={{ width: '100%'}} onSubmit={onSubmit}>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <select
              value={selectedPhysicianType}
              onChange={(e) => setSelectedPhysicianType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-white focus:ring-white my-5"
              style={{color: 'black', paddingLeft: '10px'}}
            >
            {Object.entries(physician_type_options).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex mt-10 items-center space-x-3">
          <p className="text-left font-medium">
            Enter a disease
          </p>
        </div>
        <textarea style={{color: 'black', paddingLeft: '10px'}}
          value={input}
          onChange={handleInputChange}
          rows={1}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
          placeholder={"Enter a disease name..."}
        />

        {!isLoading && (
          <Button
            className='bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full'
            type="submit"
            onClick={onSubmit}
          >
          Here we go! &rarr;
        </Button>
        )}
        {isLoading && (
          <Button
          className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
          disabled={true}
          >
          Open customer portal
          </Button>
          )}
      </form>
      
      <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
      <output className="space-y-10 my-10">
      {transformedNote && (
        <>
          <div>
            <h2
              className="sm:text-4xl text-3xl font-bold text-black mx-auto"
              ref={notesRef}
            />
          </div>
          <div className="space-y-8 flex flex-col justify-center" style={{ maxWidth: '100%'}}>
              {transformedNote.map((section, idx) => (
                  <div key={idx} className="relative p-2 border border-gray-300 shadow-lg mt-5 "  style={{ maxWidth: '100%'}}>
                      <pre style={{ maxWidth: '100%', margin: 'auto', textAlign: 'left', textWrap: 'wrap'}}>
                        <Button 
                        onClick={() => copyToClipboard(section)} 
                        className="absolute top-2 right-2 bg-blue-500 text-black rounded p-2 hover:bg-blue-700 cursor-pointer">
                            Copy
                        </Button>
                          <>
                            {section}
                          </>
                      </pre>
                      
                      
                  </div>
                ))}
            </div>
          </>
        )}
      </output>
    </main>
  </div>
  );
}