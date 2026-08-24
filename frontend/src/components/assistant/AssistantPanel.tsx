"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { assistantApi } from "@/lib/api";
import type { PendingApproval } from "@/lib/types";

type SpeechRecognitionResultEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  abort: () => void;
  start: () => void;
  stop: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type AssistantPanelProps = {
  onMutated: () => Promise<void>;
};

const welcomeMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "I can manage your Clearlist tasks and answer questions about them. What should we do?",
};

const suggestions = [
  "How many tasks are due tomorrow?",
  "How many tasks have I completed?",
  "Show my active tasks",
];

export function AssistantPanel({ onMutated }: AssistantPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [prompt, setPrompt] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const speechBaseRef = useRef("");

  useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = navigator.language || "en-US";
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join("");

      setPrompt(`${speechBaseRef.current}${transcript}`.trimStart());
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError("Voice input could not be started. Please check your microphone permission.");
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    void Promise.resolve().then(() => setSpeechSupported(true));

    return () => {
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  function toggleListening() {
    const recognition = recognitionRef.current;
    if (!recognition || isSending) return;

    if (isListening) {
      recognition.stop();
      return;
    }

    setError(null);
    speechBaseRef.current = prompt.trim() ? `${prompt.trim()} ` : "";
    setIsListening(true);

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setError("Voice input could not be started. Please try again.");
    }
  }

  async function sendPrompt(event?: FormEvent, value = prompt) {
    event?.preventDefault();
    if (isListening) recognitionRef.current?.stop();
    const text = value.trim();
    if (!text || isSending) return;

    setPrompt("");
    setError(null);
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text },
    ]);
    setIsSending(true);

    try {
      const response = await assistantApi.prompt(text, conversationId);
      setConversationId(response.conversation_id);
      setPendingApprovals(response.pending_approvals);
      if (response.text) {
        setMessages((current) => [
          ...current,
          { id: Date.now() + 1, role: "assistant", text: response.text },
        ]);
      }
      if (response.should_refresh) await onMutated();
    } catch {
      setError("The assistant could not complete that request. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function decide(approval: PendingApproval, approved: boolean) {
    if (!conversationId || isSending) return;

    setError(null);
    setIsSending(true);
    try {
      const response = await assistantApi.approve(conversationId, approval.id, approved);
      setPendingApprovals((current) => current.filter(({ id }) => id !== approval.id));
      if (response.text) {
        setMessages((current) => [
          ...current,
          { id: Date.now(), role: "assistant", text: response.text },
        ]);
      }
      if (response.should_refresh) await onMutated();
    } catch {
      setError("We could not record that approval decision. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function resetConversation() {
    if (isSending) return;

    if (isListening) recognitionRef.current?.stop();
    setError(null);
    setIsSending(true);

    try {
      await assistantApi.reset();
      setMessages([welcomeMessage]);
      setPrompt("");
      setConversationId(null);
      setPendingApprovals([]);
    } catch {
      setError("The conversation could not be reset. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {isOpen && (
        <section
          id="assistant-widget"
          className="assistant-panel assistant-widget"
          aria-labelledby="assistant-heading"
        >
          <div className="assistant-header">
            <div>
              <p className="assistant-kicker">Clearlist intelligence</p>
              <h2 id="assistant-heading">Ask your task assistant</h2>
              <p>Use natural language to plan, update, and understand your day.</p>
            </div>
              <div className="assistant-header-actions">
                <button
                  type="button"
                  className="assistant-reset"
                  aria-label="Reset conversation"
                  title="Delete previous conversations and start a new one"
                  disabled={isSending}
                  onClick={() => void resetConversation()}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                    <path d="M5 8.5A7.5 7.5 0 1 1 6.8 18" />
                    <path d="M5 4.5v4h4" />
                  </svg>
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  className="assistant-close"
                  aria-label="Close task assistant"
                  onClick={() => setIsOpen(false)}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
          </div>

          <div className="assistant-messages" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`assistant-message assistant-message-${message.role}`}>
                <span className="assistant-message-label">{message.role === "user" ? "You" : "Clearlist"}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {isSending && <p className="assistant-thinking">Thinking through your tasks...</p>}
          </div>

          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="assistant-approval" role="alert">
              <div>
                <strong>Confirm task deletion</strong>
                <p>{approval.reason ?? "This action cannot be undone."}</p>
                <small>Task ID: {String(approval.arguments.id ?? "unknown")}</small>
              </div>
              <div className="assistant-approval-actions">
                <button
                  type="button"
                  className="button-secondary"
                  disabled={isSending}
                  onClick={() => void decide(approval, false)}
                >
                  Keep task
                </button>
                <button
                  type="button"
                  className="button-danger"
                  disabled={isSending}
                  onClick={() => void decide(approval, true)}
                >
                  Delete task
                </button>
              </div>
            </div>
          ))}

          {messages.length === 1 && (
            <div className="assistant-suggestions">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => void sendPrompt(undefined, suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {error && <p className="assistant-error" role="alert">{error}</p>}
          <form className="assistant-form" onSubmit={(event) => void sendPrompt(event)}>
            <label htmlFor="assistant-prompt" className="sr-only">Ask the task assistant</label>
            <input
              id="assistant-prompt"
              className="field"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. Create a task to review the brief tomorrow"
              maxLength={4000}
              disabled={isSending}
            />
            <button
              type="button"
              className={`assistant-mic ${isListening ? "assistant-mic-listening" : ""}`}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              title={speechSupported ? "Talk to Clearlist" : "Voice input is not supported in this browser"}
              disabled={!speechSupported || isSending}
              onClick={toggleListening}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="11" rx="3" />
                <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7" />
              </svg>
              <span className="sr-only">{isListening ? "Listening" : "Use voice input"}</span>
            </button>
            <button type="submit" className="button-primary" disabled={isSending || !prompt.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className={`assistant-toggle ${isOpen ? "assistant-toggle-open" : ""}`}
        aria-controls="assistant-widget"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close task assistant" : "Open task assistant"}
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <span aria-hidden="true">×</span>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M5 6.75A2.75 2.75 0 0 1 7.75 4h8.5A2.75 2.75 0 0 1 19 6.75v5.5A2.75 2.75 0 0 1 16.25 15H12l-4.5 4v-4.08A2.75 2.75 0 0 1 5 12.25v-5.5Z" />
            <path d="M12 7.25v4.5M9.75 9.5h4.5" />
          </svg>
        )}
      </button>
    </>
  );
}
