import { useCallback, useMemo, useRef, useState } from "react";
import useWebSocket, {
  ReadyState,
  ReadyState as WebSocketReadyState,
} from "react-use-websocket";
import MessageComponent from "src/components/Message";
import type {
  AckMessage,
  ConnectedUser,
  DesiredNameMessage,
  TextMessage,
  TypingMessage,
} from "src/lib/ServerMessage";
import {
  isConnectedUsersMessage,
  isCurrentlyTypingMessage,
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
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const desiredNameInput = useRef<HTMLInputElement>(null);
  const messageInput = useRef<HTMLInputElement>(null);
  const messageContainer = useRef<HTMLOListElement>(null);

  const getName = useCallback(
    (id: string) => {
      if (id === authorId) {
        return "You";
      } else {
        return connectedUsers.find((user) => user.id === id)?.desiredName ?? id;
      }
    },
    [authorId, connectedUsers]
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
    } else if (isCurrentlyTypingMessage(message)) {
      setCurrentlyTyping(message.currently);
    } else if (isConnectedUsersMessage(message)) {
      setConnectedUsers(message.connected);
    } else {
      console.warn("Server sent unhandled message", message);
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
        } as AckMessage);
      }, 1000);
      keepAliveIntervals.push(keepAliveInterval);

      if (desiredNameInput.current?.value.length) {
        websocket.sendJsonMessage({
          type: MessageType.DESIRED_NAME,
          date: Date.now(),
          desiredName: desiredNameInput.current.value,
        } as DesiredNameMessage);
      }
    },
    onClose() {
      clearInterval(keepAliveInterval);
      keepAliveIntervals = keepAliveIntervals.filter(
        (interval) => interval !== keepAliveInterval
      );
    },
  });

  const trySendMessage = useCallback(() => {
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
        console.debug(new URL("wss://" + url), url);
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
          {getName(currentlyTyping[0]) === currentlyTyping[0] ? (
            currentlyTyping[0]
          ) : (
            <span className="nickname">{getName(currentlyTyping[0])}</span>
          )}{" "}
          is typing...
        </>
      );
    }
    if (currentlyTyping.length < 4) {
      const result = currentlyTyping.map((id, idx, arr) => (
        <>
          {id === getName(id) ? (
            id
          ) : (
            <span className="nickname">{getName(id)}</span>
          )}
          {idx + 1 === arr.length ? "" : ", "}
        </>
      ));
      result.push(<> are typing...</>);

      return <>{result}</>;
    }
    return <>Several people are typing...</>;
  }, [authorId, currentlyTyping, getName]);

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
        <label htmlFor="desired-name-input">Name:</label>
        <input
          ref={desiredNameInput}
          id="desired-name-input"
          type="text"
          placeholder="..."
        />
      </header>
      <div id="container">
        <section id="message-area">
          <ol ref={messageContainer} id="messages-container">
            {messageHistory.map((message, idx) => (
              <li className="message" key={idx}>
                <MessageComponent
                  message={message}
                  authorNickname={getName(message.author)}
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
                onKeyPress={(keyEvent) => {
                  if (keyEvent.key === "Enter") {
                    trySendMessage();
                  }
                }}
                ref={messageInput}
              />
              <button onClick={trySendMessage}>Send</button>
            </span>
          </div>
        </section>
        <section id="user-area">
          <h2>Users</h2>
          <ol>
            {connectedUsers.map(({ id }) => (
              <li
                className={
                  "user" +
                  (currentlyTyping.includes(id) ? " typing" : "") +
                  (getName(id) !== id ? " nickname" : "")
                }
                key={id}
              >
                {getName(id)}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  );
}
