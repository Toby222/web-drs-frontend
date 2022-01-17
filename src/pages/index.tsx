import { useCallback, useMemo, useRef, useState } from "react";
import useWebSocket, {
  ReadyState,
  ReadyState as WebSocketReadyState,
} from "react-use-websocket";
import MessageComponent from "src/components/Message";
import {
  isCurrentlyTypingMessage,
  TextMessage,
  TypingMessage,
} from "src/lib/ServerMessage";
import {
  isIdResponseMessage,
  isServerMessage,
  isTextMessage,
  MessageType,
} from "src/lib/ServerMessage";

let keepAliveIntervals: NodeJS.Timeout[] = [];
let shouldResendTyping = true;

export default function Index(): JSX.Element {
  const [messageHistory, setMessageHistory] = useState<TextMessage[]>([]);
  const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);
  const [socketUrl, setSocketUrl] = useState("wss.tobot.tk:8085/");
  const [authorId, setAuthorId] = useState("");
  const messageInput = useRef<HTMLInputElement>(null);
  const messageContainer = useRef<HTMLOListElement>(null);

  const getNickname = useCallback(
    (id: string) => {
      return id === authorId ? "You" : id;
    },
    [authorId]
  );
  function onMessage(event: MessageEvent<string>): void {
    const message = JSON.parse(event.data);

    if (!isServerMessage(message)) {
      console.debug("DEBUG: ", message);
      throw new Error(`Server sent unexpected message \`${event.data}}\``);
    }

    if (isIdResponseMessage(message)) {
      setAuthorId(message.authorId);
    } else if (isTextMessage(message)) {
      setMessageHistory([...messageHistory, message]);
      console.log("scrollheight", messageContainer.current?.scrollHeight);
    } else if (isCurrentlyTypingMessage(message)) {
      setCurrentlyTyping(message.currently);
    }
  }

  let keepAliveInterval: NodeJS.Timeout;
  const websocket = useWebSocket("wss://" + socketUrl, {
    onMessage,
    onOpen() {
      keepAliveInterval = setInterval(() => {
        websocket.sendJsonMessage({
          type: MessageType.ACK,
          date: Date.now(),
        });
      }, 1000);
      keepAliveIntervals.push(keepAliveInterval);
    },
    onClose() {
      clearInterval(keepAliveInterval);
      keepAliveIntervals = keepAliveIntervals.filter(
        (interval) => interval !== keepAliveInterval
      );
    },
  });

  const handleClickSendMessage = useCallback(() => {
    if (!messageInput.current) {
      return;
    }
    const messageText = messageInput.current?.value;
    if (messageText === undefined || messageText.length === 0) {
      return;
    }

    messageInput.current.value = "";

    websocket.sendJsonMessage({
      author: authorId,
      type: MessageType.TEXT,
      date: Date.now(),
      content: messageText,
    } as TextMessage);
  }, [authorId, websocket]);

  const trySetSocketUrl = useCallback(
    (url: string) => {
      try {
        console.log(new URL("wss://" + url), url);
        setSocketUrl(url);
      } catch (e) {
        console.debug("Invalid URL");
        // Invalid URL, don't do anything
      } finally {
        if (websocket.readyState === WebSocketReadyState.OPEN) {
          websocket.getWebSocket()?.close();
        }
      }
    },
    [websocket]
  );

  function handleInput() {
    if (
      websocket.readyState === ReadyState.OPEN &&
      (shouldResendTyping || !currentlyTyping.includes(authorId))
    ) {
      websocket.sendJsonMessage({
        type: MessageType.TYPING,
        date: Date.now(),
      } as TypingMessage);
      shouldResendTyping = false;
      setTimeout(() => (shouldResendTyping = true), 1000);
    }
  }
  console.log(handleInput);

  const typingIndicator = useMemo(() => {
    if (currentlyTyping.length === 0) {
      return <>Nobody is typing</>;
    }
    if (currentlyTyping.length === 1) {
      if (currentlyTyping[0] === authorId) {
        return (
          <>
            <span className="nickname">You</span> are typing...
          </>
        );
      }
      return (
        <>
          {getNickname(currentlyTyping[0]) === currentlyTyping[0] ? (
            currentlyTyping[0]
          ) : (
            <span className="nickname">{getNickname(currentlyTyping[0])}</span>
          )}{" "}
          is typing...
        </>
      );
    }
    if (currentlyTyping.length < 4) {
      const result = currentlyTyping.map((id, idx, arr) => (
        <>
          {id === getNickname(id) ? (
            id
          ) : (
            <span className="nickname">{getNickname(id)}</span>
          )}
          {idx + 1 === arr.length ? "" : ", "}
        </>
      ));
      result.push(<> are typing...</>);

      return <>{result}</>;
    }
    return <>Several people are typing...</>;
  }, [authorId, currentlyTyping, getNickname]);

  return (
    <main>
      <header>
        {authorId === "" ? (
          <></>
        ) : (
          <>
            Your ID: <span style={{ fontWeight: "bold" }}>{authorId}</span>
          </>
        )}{" "}
        <span>Ready state: </span>
        <span style={{ fontWeight: "bold" }}>
          {ReadyState[websocket.readyState]} ({websocket.readyState})
        </span>
        <label htmlFor="ws-url">WebSocket URL:</label>
        <input
          id="ws-url"
          type="text"
          value={socketUrl}
          placeholder="wss://..."
          onChange={(e) => trySetSocketUrl(e.target.value)}
        />
      </header>
      <ol ref={messageContainer} id="messages-container">
        {messageHistory.map((message, idx) => (
          <li className="message" key={idx}>
            <MessageComponent
              message={message}
              authorNickname={getNickname(message.author)}
            />
          </li>
        ))}
      </ol>
      <div id="message-writing-area">
        <span id="typing-indicators">{typingIndicator}</span>
        <span>
          <input
            type="text"
            placeholder="Type here..."
            id="message-input"
            onInput={handleInput}
            ref={messageInput}
          />
          <button onClick={handleClickSendMessage}>Send</button>
        </span>
      </div>
    </main>
  );
}
