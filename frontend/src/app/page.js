"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "lodash";
import { ChatResponse, ChatPrompt, TextArea } from "../components/chat";

const agentTypes = {
  user: "User",
  richieRich: "RichieRich",
};
const maxReconnectAttempts = 5;
const debouncingInterval = 20; // in ms --> the performance varies drastically for different prompts | still 15-25 is a sweet spot
const socketURL = "ws://localhost:8080";

export default function Home() {
  // debugger
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgID, setMsgID] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const scrollContainerRef = useRef(null);
  const genText = useRef("");
  const connection = useRef(null);

  const handleTextAreaChange = useCallback((event) => {
    setPrompt(event.target.value);
  }, [prompt]);

  const addMessage = useCallback((message, agent, msgID) => {
    setMessages((prev) => [
      ...prev,
      {
        agent,
        contents: message,
        msgID
      },
    ]);
  }, []);

  const updateLastMessage = useCallback((message, idToBeUpdated) => {
    setMessages(prevMsgs => prevMsgs.map(msg => 
      msg.msgID == idToBeUpdated ? {...msg, contents: msg.contents + message} : msg
      ));
      genText.current = "";
  }, []);

  const debouncedUpdateLastMessage = debounce((data, id) => {
    updateLastMessage(data, id);
  }, debouncingInterval);


  const handleSubmit = useCallback(async () => {
    const socket = connection.current;
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    try {
      setIsLoadingResponse(true);

      addMessage(prompt, agentTypes.user, msgID);
      addMessage("", agentTypes.richieRich, msgID+1);

      setMsgID(msgID+2);
      
      socket.send(prompt);

      setPrompt("");
      setIsLoadingResponse(false);
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoadingResponse(false);
    }
  });

  useEffect(() => {
    scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
  }, [messages]);

  const setupWebSocket = () => {
    const socket = new WebSocket(socketURL)
    connection.current = socket;

    // Connection opened
    socket.addEventListener("open", (event) => {
      console.log("Connection established");
      setReconnectAttempts(0);
    }); 

    socket.addEventListener("error", (event) => {
      console.error("WebSocket error observed:", event);
    });

    socket.addEventListener("close", (event) => {
      console.log(`WebSocket closed with code: ${event.code}`);
      handleReconnect();
    });

    return () => socket.close();
  }

  const handleReconnect = () => {
    if (reconnectAttempts < maxReconnectAttempts) {
        let timeout = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff
        setTimeout(() => {
            setReconnectAttempts(reconnectAttempts + 1);
            setupWebSocket(); // Attempt to reconnect
        }, timeout);
    } else {
        console.log("Max reconnect attempts reached, not attempting further reconnects.");
    }
};

  useEffect(() => {
    setupWebSocket();
    const socket = connection.current;
    return () => {
      if(socket.readyState === WebSocket.OPEN) {
        socket.close(); // Close WebSocket on component unmount
      } 
    }
  }, []);

  const handleMessage = async (event) => {
    console.log("Message from server ", event);
    genText.current += event.data;
    debouncedUpdateLastMessage(genText.current, msgID - 1); 
  };

  useEffect(() => {
    const socket = connection.current;

    // Listen for messages
    socket.addEventListener("message", handleMessage);

    return () => socket.removeEventListener("message", handleMessage); // important to unmount the even listener or else it creates duplicate messages

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
