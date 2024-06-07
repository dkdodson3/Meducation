'use client';

import Image from 'next/image';
import { GetServerSideProps } from 'next';
import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/ui/MedNotes/Header';
import Disclaimer from '@/components/ui/MedNotes/Disclaimer';
import Button from '@/components/ui/Button';
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

// Nextjs calls this automatically when the page is requested.
export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: {
        destination: '/signin',
        permanent: false,
      },
    };
  }

  return {
    props: {
      user,
    },
  };
};

const Page = () => {
  const [disease, setDisease] = useState('');
  const diseaseRef = useRef(disease); // Create a ref for the disease state
  const notesRef = useRef<null | HTMLDivElement>(null);
  const [isReadyForSubmit, setIsReadyForSubmit] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [selectedPhysicianType, setSelectedPhysicianType] = useState('')

  const toggleAccordion = () => {
    setIsAccordionOpen(!isAccordionOpen);
  };

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
  return note.split("<sep />");
};

const transformedNote = generatedNote && transformNote(generatedNote); 

return (
  <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
    <Header />
    <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
      {/* Accordion for Legal Disclaimer */}
      <div style={{ width: '100%', marginTop: '20px' }}>
        <Button style={{
              width: '100%',
              textAlign: 'left',
              backgroundColor: '#f3f3f3',
              padding: '10px',
              fontSize: '18px',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
            }}
            onClick={toggleAccordion}>
          Legal Disclaimer (Click To Expand)
        </Button>
        {isAccordionOpen && <Disclaimer />}
      </div>
      <form className="max-w-xl w-full" onSubmit={onSubmit}>
        <div className="flex mt-10 items-center space-x-3">
          <select
              value={selectedPhysicianType}
              onChange={(e) => setSelectedPhysicianType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
            >
            {Object.entries(physician_type_options).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex mt-10 items-center space-x-3">
          <Image
            src="/1-black.png"
            width={30}
            height={30}
            alt="1 icon"
            className="mb-5 sm:mb-0"
          />
          <p className="text-left font-medium">
            Enter a disease <span className="text-slate-500"></span>.
          </p>
        </div>
        <textarea
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
              className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
              ref={notesRef}
            />
          </div>
          <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
              {transformedNote.map((section, idx) => (

                  <div key={idx} className="relative p-2 border border-gray-300 shadow-lg mt-5">
                      <pre className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-copy border preformatted-text" style={{ maxWidth: '100%', margin: 'auto', textAlign: 'left' }}>
                          {section}
                      </pre>
                      
                      <Button 
                      onClick={() => copyToClipboard(section)} 
                      className="absolute top-2 right-2 bg-blue-500 text-white rounded p-2 hover:bg-blue-700 cursor-pointer">
                          Copy
                      </Button>
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

export default Page;