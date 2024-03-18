"use client";
import React, { useState, useEffect, useRef } from "react";
import { getPromptResponse } from "../../api/getPromptResponse";
import { ChatResponse, ChatPrompt, TextArea } from "../components/chat";

const agentTypes = {
  user: "User",
  richieRich: "RichieRich",
};

export default function Home() {
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgID, setMsgID] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const connection = useRef(null);

  const handleTextAreaChange = (event) => {
    setPrompt(event.target.value);
  };

  const addMessage = (message, agent, msgID) => {
    setMessages((prev) => [
      ...prev,
      {
        agent,
        contents: message,
        msgID
      },
    ]);
  };

  const updateLastMessage = (message, agent, msgID) => {
    setMessages((arr) => {
      const index = msgID == 0 ? 0 : msgID - 1; // update the last msg      
      
      if (index !== -1) {
        let updatedContent = arr[index]?.contents ? arr[index]?.contents + message : message;
        let updatedObject = {
          agent,
          contents: updatedContent,
          msgID
        }
        console.log(arr[index], updatedObject);
        arr.splice(index, 1, updatedObject);
      } else {
        console.log(`Object with msg number ${msgID} not found.`);
      }
      return arr;
    });
  };


  const handleSubmit = async () => {
    const socket = connection.current;
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    try {
      setIsLoadingResponse(true);
      addMessage(prompt, agentTypes.user);
      addMessage(" ", agentTypes.richieRich, msgID+1);
      setMsgID(msgID+2);
      
      socket.send(prompt);

      setPrompt("");
      setIsLoadingResponse(false);
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoadingResponse(false);
    }
  };

  useEffect(() => {
    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080")
    connection.current = socket;

    // Connection opened
    socket.addEventListener("open", (event) => {
      socket.send("Connection established")
    }); 

    return () => socket.close();
  }, []);

  useEffect(() => {
    const socket = connection.current;

    // Listen for messages
    socket.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      // addMessage(event.data, agentTypes.richieRich);
      updateLastMessage(event.data, agentTypes.richieRich, msgID-1);
    });

  }, [messages]);

  return (
    <main className="flex flex-col items-center w-full bg-gray-100 h-[93vh]">
      <div
        ref={scrollContainerRef}
        className="flex flex-col overflow-y-scroll p-20 w-full mb-40"
      >
        {messages.map((message, index) =>
          message.agent === agentTypes.user ? (
            <ChatPrompt key={index} prompt={message.contents} />
          ) : (
            
            <ChatResponse key={index} response={message.contents} />
          ),
        )}
      </div>
      <TextArea
        onChange={handleTextAreaChange}
        onSubmit={handleSubmit}
        isLoading={isLoadingResponse}
        hasError={error !== null}
      />
      {error && (
        <div className="absolute bottom-0 mb-2 text-red-500">{error}</div>
      )}
    </main>
  );
}
