import { useCallback, useMemo, useRef, useState } from "react";
import useWebSocket, {
  ReadyState as WebSocketReadyState,
} from "react-use-websocket";
import Connect, { ConnectionOptions } from "src/components/Connect";
import MessageComponent from "src/components/Message";
import UserBar from "src/components/UserBar";
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
  const [authorId, setAuthorId] = useState("<...>");
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [desiredName, setDesiredName] = useState<string | undefined>(undefined);
  const [socketUrl, setSocketUrl] = useState("wss.tobot.tk:8085");

  const messageInput = useRef<HTMLInputElement>(null);

  const getName = useCallback(
    (id: string) => {
      if (id === authorId) {
        return (
          (connectedUsers.find((user) => user.id === id)?.desiredName ?? id) +
          " (you)"
        );
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

      if (desiredName) {
        webSocket.sendJsonMessage({
          type: MessageType.DESIRED_NAME,
          date: Date.now(),
          desiredName: desiredName,
        } as DesiredNameMessage);
      }
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
  const webSocket = useWebSocket("wss://" + socketUrl, {
    onMessage,
    onOpen() {
      keepAliveInterval = setInterval(() => {
        webSocket.sendJsonMessage({
          type: MessageType.ACK,
          date: Date.now(),
        } as AckMessage);
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

  const tryConnect = useCallback(
    (opts: ConnectionOptions) => {
      switch (webSocket.readyState) {
        case WebSocketReadyState.UNINSTANTIATED:
          throw new Error("socket is not instantiated. This should not happen");
        case WebSocketReadyState.CLOSED:
          setConnectedUsers([]);
          setMessageHistory([]);
          setAuthorId("");

          setDesiredName(opts.desiredName);
          setSocketUrl(opts.url);
          return;
        case WebSocketReadyState.CLOSING:
        case WebSocketReadyState.CONNECTING:
          console.debug("WebSocket is already connecting or closing");
          return;
        case WebSocketReadyState.OPEN:
          if (opts.desiredName === desiredName) {
            return;
          }
          setDesiredName(opts.desiredName);
          webSocket.sendJsonMessage({
            type: MessageType.DESIRED_NAME,
            date: Date.now(),
            desiredName: opts.desiredName,
          } as DesiredNameMessage);
          return;
      }
    },
    [webSocket, desiredName]
  );

  const trySendMessage = useCallback(() => {
    if (!messageInput.current) {
      return;
    }
    const messageText = messageInput.current?.value;
    if (messageText === undefined || messageText.length === 0) {
      return;
    }

    messageInput.current.value = "";

    webSocket.sendJsonMessage({
      author: authorId,
      type: MessageType.TEXT,
      date: Date.now(),
      content: messageText,
    } as TextMessage);
  }, [authorId, webSocket]);

  const handleTyping = useCallback(() => {
    if (
      webSocket.readyState === WebSocketReadyState.OPEN &&
      (shouldResendTyping || !currentlyTyping.includes(authorId))
    ) {
      webSocket.sendJsonMessage({
        type: MessageType.TYPING,
        date: Date.now(),
      } as TypingMessage);
      shouldResendTyping = false;
      setTimeout(() => (shouldResendTyping = true), 1000);
    }
  }, [authorId, currentlyTyping, webSocket]);

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
            Your name:{" "}
            <span title={authorId} style={{ fontWeight: "bold" }}>
              {getName(authorId)}
            </span>
          </>
        )}
        <br />
        <Connect
          tryConnect={tryConnect}
          webSocketReadyState={webSocket.readyState}
        />
      </header>
      <div id="container">
        <section id="message-area">
          <ol id="messages-container">
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
                onInput={handleTyping}
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
        <UserBar
          connectedUsers={connectedUsers}
          currentlyTyping={currentlyTyping}
          getName={getName}
        />
      </div>
    </main>
  );
}
