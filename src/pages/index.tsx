import { useCallback, useState } from "react";
import useWebSocket, {
  ReadyState,
  ReadyState as WebSocketReadyState,
} from "react-use-websocket";
import MessageComponent from "src/components/Message";
import { MessageType, TextMessage } from "src/lib/types/ServerMessage";
import { isServerMessage, isTextMessage } from "src/lib/types/ServerMessage";

export default function Index(): JSX.Element {
  const [enableSSL, setEnableSSL] = useState(true);
  const protocol = enableSSL ? "wss" : "ws";

  const [count, setCount] = useState(0);
  const [messageHistory, setMessageHistory] = useState<TextMessage[]>([]);
  const [socketUrl, setSocketUrl] = useState("localhost:8989/");

  function onMessage(event: MessageEvent<string>): void {
    const message = JSON.parse(event.data);

    if (!isServerMessage(message)) {
      console.log("DEBUG: ", message);
      throw new Error(`Server sent unexpected message \`${event.data}}\``);
    }

    if (isTextMessage(message)) {
      setMessageHistory([message, ...messageHistory]);
    }
  }

  let keepAliveInterval: NodeJS.Timeout;
  const websocket = useWebSocket(protocol + ":" + socketUrl, {
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
      author: "AUTHOR NOT IMPLEMENTED YET",
      type: MessageType.TEXT,
      date: Date.now(),
      content: `Hello, world! ${count}`,
    };
    websocket.sendJsonMessage(message);
  }, [count, websocket]);

  const trySetSocketUrl = useCallback(
    (url: string) => {
      try {
        console.log(new URL(protocol + ":" + url), url);
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
    [websocket, protocol]
  );

  const toggleSSL = useCallback(() => {
    setEnableSSL(!enableSSL);
    trySetSocketUrl(socketUrl.replace(/^wss?/, protocol));
  }, [enableSSL, socketUrl, trySetSocketUrl, protocol]);

  return (
    <>
      <span>
        Ready state: {ReadyState[websocket.readyState]} ({websocket.readyState})
      </span>
      <main>
        <div id="messages-container">
          {messageHistory.map((message, idx) => {
            return <MessageComponent message={message} key={idx} />;
          })}
        </div>
        <div id="message-writing-area">
          <label htmlFor="ws-url">WebSocket URL:</label>
          <input
            id="ws-url"
            type="text"
            value={socketUrl}
            onChange={(e) => trySetSocketUrl(e.target.value)}
          />
          <label htmlFor="wss">Enable SSL:</label>
          <input
            id="wss"
            type="checkbox"
            checked={enableSSL}
            onChange={toggleSSL}
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
