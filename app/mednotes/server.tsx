'use server';

import { Configuration, OpenAIApi } from 'openai-edge';

const systemPrompt = `
# IDENTITY and PURPOSE

You are an experienced BOBBY5 tasked with writing SOAP notes that are consistent, concise, professional, and strictly relevant to the patient's condition.

To achieve the best possible results, follow these steps:

1. When documenting a case, omit unnecessary details and generic placeholders.
2. Ensure the note is factual, succinct, and ready for immediate inclusion in the patient's medical record without the need for further editing.
3. Do not elaborate on patient details that have not been provided.
4. Do not truncate words.
5. Only include details about the disease and treatment.
6. Be consistent in the data you return between sessions.

# OUTPUT INSTRUCTIONS

Follow these guidelines when creating your output:

- Write the sections in this order: subjective, objective, physical exam, assessment, plan, disease description, disease treatment, and expected physical presentation.
- Include a newline at the end of each section of the SOAP report.
- Avoid unnecessary spaces.
- Do not include warnings or notes; only output the requested sections.
- Ensure you adhere to ALL instructions provided when generating your output.
- Do not output markdown

# INPUT

INPUT:
`

const userPrompt = `
Write a SOAP note for a patient with "BOBBY9".
Please provide information that is directly pertinent to the diagnosis of "BOBBY9".
Include any relevant clinical essential details.
`

const getSystemPrompt = (physicianType: string) => {
    switch (physicianType) {
      case 'emergency_room_physician':
      case 'inpatient_physician':
      case 'ambulatory_physician':
      case 'general_physician':
        const physician = physicianType.replace('_', ' ')
        const retPrompt = systemPrompt.replace("BOBBY5", physician)
        return retPrompt
      default:
        return "Respond with: 'If you're seeing this message, you have encountered an error. Please contact the developer and tell them ROLE_NOT_SET.'";
    }
  };

 const getUserPrompt = (disease: string) => {
    let prompt =  "Respond with: 'If you're seeing this message, you have encountered an error. Please contact the developer and tell them PROMPT_NOT_SET.'";
    if (typeof disease === 'string' && disease.trim().length > 0) {
        prompt = userPrompt.replace('BOBBY9', disease);
    }
    return prompt;
 }

export interface ChatCompletionProps {
    diseaseInput: string;
    physicianType: string;
    modelType?: string;
    streamBool: boolean;
}

export default async function ChatCompletionRequest(
    {
        diseaseInput,
        physicianType,
        modelType = 'gpt-4o',
        // odelType = 'gpt-3.5-turbo',
        streamBool
    }: ChatCompletionProps 
) {
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(config);
    const systemPromptContent = getSystemPrompt(physicianType);
    const userPromptContent = getUserPrompt(diseaseInput);

    return openai.createChatCompletion(
        {
            model: modelType,
            stream: streamBool,
            top_p: 0,
            messages: [
                {
                    role: 'system',
                    content: systemPromptContent
                },
                {
                    role: 'user',
                    content: userPromptContent
                }
            ] 
        }
    );
}