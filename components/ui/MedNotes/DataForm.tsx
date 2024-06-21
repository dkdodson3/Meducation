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

interface Message {
  role: string;
  content: string;
}

export default  function DataForm() {
  const supabase = createClient();
  const [finalStreamData, setFinalStreamData] = useState('');
  const [disease, setDisease] = useState('');
  const [accumulatedContent, setAccumulatedContent] = useState('');
  const [selectedPhysicianType, setSelectedPhysicianType] = useState('')
  const [isReadyForSubmit, setIsReadyForSubmit] = useState(false);
  const notesRef = useRef<null | HTMLDivElement>(null);
  const [transformedNote, setTransformedNote] = useState<string[][]>([]);
  const [shouldRenderCard, setShouldRenderCard] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitEventRef = useRef<null | React.FormEvent<HTMLFormElement>>(null);
  
  const { input, handleInputChange, handleSubmit, isLoading, messages } = useChat({
    body: { disease },
    onResponse() {
      scrollToNotes();
      setFinalStreamData(messages.map(message => message.content).join('\n'));
    },
    onFinish(finishedMessage) {
      setFinalStreamData(finishedMessage.content.split("<sep />").join("\n"));
    }
  });

  const scrollToNotes = () => {
    if (notesRef.current !== null) {
      notesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const onSubmit = (e: any) => {
    e.preventDefault();
    const messageObject = {
      disease: input,
      physician_type: selectedPhysicianType,
    };
    setDisease(JSON.stringify(messageObject));
    submitEventRef.current = e;
    setIsReadyForSubmit(true);
    setShouldRenderCard(false);
  };

  const copyToClipboard = async (text : string) => {
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(text)
    } else {
      document.execCommand('copy', true, text)
    }
  };

  useEffect(() => {
    if (isReadyForSubmit && disease && submitEventRef.current) {
      handleSubmit(submitEventRef.current);
      setIsReadyForSubmit(false);
    }
  }, [disease, isReadyForSubmit, handleSubmit]);

  const lastMessage = messages[messages.length - 1];
  const generatedNote = lastMessage?.role === "assistant" ? lastMessage.content : null;

  useEffect(() => {
    const transformNote = (note: string): string[][] => {
      if (!note) return [];
      return note.split("<sep />").map((item) => {
        const splitIndex = item.indexOf(":");
        if (splitIndex !== -1) {
          const title = item.slice(0, splitIndex).trim();
          const content = item.slice(splitIndex + 1).trim();
          return [title, content];
        }
        return [];
      }).filter(item => item.length > 0);
    };

    const transformed = transformNote(accumulatedContent);

    if (generatedNote) {
      const transformed = transformNote(generatedNote);
      setTransformedNote(transformed);
      setShouldRenderCard(true);
    }
  }, [generatedNote]);

  useEffect(() => {
    if (isSubmitted) {
      // Reset isSubmitted to false after processing
      setIsSubmitted(false);
    }
  }, [isSubmitted]);

  const renderTransformedNotes = () => {
    return transformedNote.map((section, idx) => (
      <Card 
        key={idx}
        title={<div style={{ textAlign: 'left', flex: 1 }}>{section[0]}</div>} 
        footer={
          <Button onClick={() => copyToClipboard(section[1])} style={{width: "25%", textAlign: 'center'}}>
            Copy
          </Button>
        }
      >
        <pre style={{ textAlign: 'left', flex: 1, whiteSpace: 'pre-wrap' }}>
          {section[1]}
        </pre>
      </Card>
    ));
  };

  return (
    <>
        <Card 
          title="Request Information"
          description={<div style={{ textAlign: 'left'}}>
            <b>Enter a Disease</b>
            </div>
          }
          footer={
            <Button
              type="submit"
              onClick={onSubmit}
              style={{width: "25%"}}
            >
              GET DATA &rarr;
              </Button>
            }
          >
            <form style={{ width: '100%', textAlign: 'left'}} onSubmit={onSubmit}>
              <div>
                <TextareaAutosize style={{color: 'black', paddingLeft: '10px', width: '100%'}}
                value={input}
                onChange={handleInputChange}
                rows={1}
                placeholder={"Enter a disease name..."}/>
              </div>
              <div>
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
              </div>
            </form>
        </Card>
        {shouldRenderCard && transformedNote.length > 0 && (
          <div style={{ width: '100%', textAlign: 'center'}}>
            {renderTransformedNotes()}

            {/* <Card
            title="Retrieved Data"
            footer={
              <Button onClick={() => copyToClipboard(finalStreamData)}>
                  Copy All
              </Button>
            }>
              {renderTransformedNotes()}
            </Card> */}
          </div>
        )}
    </>
  );
}