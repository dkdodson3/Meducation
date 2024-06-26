'use server';


import { OpenAIStream, StreamingTextResponse } from 'ai';
import ChatCompletionRequest, { ChatCompletionProps } from '@/app/mednotes/server'

// const runtime = 'edge'; // WHY?

export async function POST(req) {
  try {
    const stream_bool = Boolean(process.env.OPENAI_API_STREAM_BOOL);

    const textInput = await req.text();
    const requestBody = JSON.parse(textInput);
    const { disease, physician_type } = JSON.parse(requestBody.disease);
    const props = {
      diseaseInput: disease, 
      physicianType: physician_type, 
      streamBool: stream_bool
    }

    const response = await ChatCompletionRequest(props);

    console.log("Streaming: " + stream_bool);
    if (stream_bool) {
      const stream = OpenAIStream(response);
      return new StreamingTextResponse(stream);
    } else {
      return new Response(JSON.stringify(response.data), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
  } catch (error) {
      console.error('Error in POST handler:', error);
      return new Response("Internal Server Error", { status: 500 });
  }
}
