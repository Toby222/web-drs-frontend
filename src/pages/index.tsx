import { useCallback, useState } from "react";
import useWebSocket, {
  ReadyState,
  ReadyState as WebSocketReadyState,
} from "react-use-websocket";
import MessageComponent from "src/components/Message";
import type { TextMessage } from "src/lib/ServerMessage";
import {
  isIdResponseMessage,
  isServerMessage,
  isTextMessage,
  MessageType,
} from "src/lib/ServerMessage";

export default function Index(): JSX.Element {
  const [count, setCount] = useState(0);
  const [messageHistory, setMessageHistory] = useState<TextMessage[]>([]);
  const [socketUrl, setSocketUrl] = useState("wss.tobot.tk:8085/");
  const [authorId, setAuthorId] = useState("<???>");

  function onMessage(event: MessageEvent<string>): void {
    const message = JSON.parse(event.data);

    if (!isServerMessage(message)) {
      console.log("DEBUG: ", message);
      throw new Error(`Server sent unexpected message \`${event.data}}\``);
    }

    if (isIdResponseMessage(message)) {
      setAuthorId(message.authorId);
    } else if (isTextMessage(message)) {
      setMessageHistory([...messageHistory, message]);
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
    },
    onClose() {
      clearInterval(keepAliveInterval);
    },
  });

  const handleClickSendMessage = useCallback(() => {
    setCount(count + 1);
    const message: TextMessage = {
      author: authorId,
      type: MessageType.TEXT,
      date: Date.now(),
      content: `Hello, world! ${count}`,
    };
    websocket.sendJsonMessage(message);
  }, [count, websocket, authorId]);

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

  return (
    <>
      <main>
        <ol id="messages-container">
          {messageHistory.map((message, idx) => (
            <li key={idx}>
              <MessageComponent message={message} />
            </li>
          ))}
        </ol>
        <div id="message-writing-area">
          <span>Ready state: </span>
          <span style={{ fontWeight: "bold" }}>
            {ReadyState[websocket.readyState]} ({websocket.readyState})
          </span>
          <label htmlFor="ws-url">WebSocket URL:</label>
          <input
            id="ws-url"
            type="text"
            value={socketUrl}
            onChange={(e) => trySetSocketUrl(e.target.value)}
          />
          <button
            disabled={websocket.readyState !== WebSocketReadyState.OPEN}
            onClick={handleClickSendMessage}
          >
            Click to send message.
          </button>
        </div>
      </main>
    </>
  );
}
