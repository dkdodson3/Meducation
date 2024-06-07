'use server';

import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';


// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = 'edge';

// Helper function to get the system message based on physician type
const getSystemMessage = (physicianType) => {
    switch (physicianType) {
      case 'emergency_room_physician':
      case 'inpatient_physician':
      case 'ambulatory_physician':
      case 'general_physician':
        return `You are an experienced ${physicianType.replace('_', ' ')} responsible for writing SOAP notes that are concise, professional, and strictly relevant to the patient's condition. When documenting a case, unnecessary details and generic placeholders are to be omitted. Your task will be to write each of the following sections in this order: the subjective, objective, physical exam, assessment, plan, disease description, disease treatment, and expected physical presentation as a result of treatment components. The note should be factual, succinct, and ready for immediate inclusion in the patient's medical record without the need for further editing. Make sure to not include specific details about the patient, only details about the disease and treatment. When you finish a section of the SOAP report, include a blank line before starting the next section. Also include the text "<sep />" at the end of each section.`;
      default:
        return "Respond with: 'If you're seeing this message, you have encountered an error. Please contact the developer and tell them ROLE_NOT_SET.'";
    }
  };


export async function POST(req) {
    try {
        const textInput = await req.text(); // Get the stringified JSON text from the request
        const requestBody = JSON.parse(textInput)

        const { disease, physician_type} = JSON.parse(requestBody.disease);
        const systemMessageContent = getSystemMessage(physician_type)

        let prompt =  "Respond with: 'If you're seeing this message, you have encountered an error. Please contact the developer and tell them PROMPT_NOT_SET.'";
        if (typeof disease === 'string' && disease.trim().length > 0) {
        prompt = `Your task now is to write only a SOAP note for a patient with ${disease}. Please provide information that is directly pertinent to the diagnosis of ${disease}, including any relevant clinical essential details.`;
        }
        const response = await openai.createChatCompletion({
        model: 'gpt-4o',
        stream: true,
        messages: [
            {
            role: 'system',
            content: systemMessageContent
            },
            {
            role: 'user',
            content: prompt
            }
        ] 
        });

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);
} catch (error) {
    console.error('Error in POST handler:', error);
    return new Response("Internal Server Error", { status: 500 });
}
}
