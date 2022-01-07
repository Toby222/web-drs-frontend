import { useCallback, useState } from "react";
import useWebSocket, {
  ReadyState as WebSocketReadyState,
} from "react-use-websocket";

import type { Message } from "../util/types/Message";

export default function Index(): JSX.Element {
  const [count, setCount] = useState(0);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [socketUrl, setSocketUrl] = useState(
    "wss://toby222-web-drs-4gjg49gj355qq-8989.githubpreview.dev/"
  );

  function onMessage(event: MessageEvent<string>): void {
    const message: Message = JSON.parse(event.data);

    setMessageHistory([message, ...messageHistory]);
  }

  const websocket = useWebSocket(socketUrl, {
    onMessage,
  });

  const handleClickSendMessage = useCallback(() => {
    setCount(count + 1);
    websocket.sendMessage(`${count + 1}`);
  }, [count, websocket]);

  const connectionStatus = {
    [WebSocketReadyState.CONNECTING]: "Connecting",
    [WebSocketReadyState.OPEN]: "Open",
    [WebSocketReadyState.CLOSING]: "Closing",
    [WebSocketReadyState.CLOSED]: "Closed",
    [WebSocketReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[websocket.readyState];

  function trySetSocketUrl(url: string) {
    try {
      console.log(new URL("wss:" + url), url);
      setSocketUrl("wss:" + url);
    } catch (e) {
      // Invalid URL, don't do anything
    } finally {
      websocket.getWebSocket()?.close();
    }
  }

  return (
    <>
      <main>
        {/* DEBUG
        <div>
          <h4>Last messages:</h4>
          {websocket.lastMessage?.data.toString() ?? "No message received"}
          <hr />
          <h4>Ready state:</h4>
          {connectionStatus} ({websocket.readyState})
        </div>
        */}
        <ol>
          {messageHistory.map((message, idx) => {
            return (
              <span key={messageHistory.length - idx}>
                <span>{new Date(message.date).toISOString()}</span>
                {" - "}
                <span>{message.content}</span>
                <br />
              </span>
            );
          })}
        </ol>
        <div>
          <label htmlFor="ws-url">WebSocket URL:</label>
          <input
            id="ws-url"
            type={"text"}
            value={socketUrl.replace(/wss:(?:\/\/)?/, "")}
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
