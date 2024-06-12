'use client';

import Button from '@/components/ui/Button';
import { useState, useRef, useEffect } from 'react';
import Card from '@/components/ui/Card';
import TextareaAutosize from 'react-textarea-autosize'
import { useChat } from 'ai/react';
import { createClient } from '@/utils/supabase/client';


const physician_type_options = {
    "": "Select your specialty...",
    "emergency_room_physician": "Emergency Room Physician",
    "inpatient_physician": "Inpatient Physician",
    "ambulatory_physician": "Ambulatory Physician",
    "general_physician": "General Physician",
    // ... other roles
  };

export default  function DataForm() {
  const supabase = createClient();
  const [disease, setDisease] = useState('');
  const diseaseRef = useRef(disease);
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


return (
    <>
        <Card title="Request Information">
            <form style={{ width: '100%'}} onSubmit={onSubmit}>
                <TextareaAutosize style={{color: 'black', paddingLeft: '10px', width: '100%'}}
                value={input}
                onChange={handleInputChange}
                rows={1}
                placeholder={"Enter a disease name..."}/>
                <select
                    value={selectedPhysicianType}
                    onChange={(e) => setSelectedPhysicianType(e.target.value)}
                    className="w-full border-gray-300 shadow-sm focus:border-white focus:ring-white my-5"
                    style={{color: 'black', paddingLeft: '10px'}}
                    >
                    {Object.entries(physician_type_options).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                    ))}
                </select>
                    {!isLoading && (
                        <Button
                            style={{ width: '100%'}}
                            type="submit"
                            onClick={onSubmit}
                        >
                        Here we go! &rarr;
                        </Button>
                    )}

                    {isLoading && (
                        <Button
                            disabled={true}
                            style={{ width: '100%'}}
                        >
                        Open customer portal
                        </Button>
                    )}
            </form>
        </Card>
            {transformedNote && (
                <>
                    <div style={{ maxWidth: '100%'}}>
                        {transformedNote.map((section, idx) => (
                            <Card 
                                key={idx}
                                title={
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        {section[0]}
                                    </div>
                                    } 
                                description={
                                    // <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <pre style={{ textAlign: 'left', flex: 1, whiteSpace: 'pre-wrap' }}>
                                            {section[1]}
                                        </pre>
                                    // </div>
                                }
                                footer={
                                    // <div style={{ textAlign: 'right' }}> 
                                    <Button onClick={() => copyToClipboard(section[1])}>
                                        Copy
                                    </Button>
                                    // </div>
                                } >
                            </Card>
                        ))}
                    </div>
                </>
            )}
    </>
  );
}