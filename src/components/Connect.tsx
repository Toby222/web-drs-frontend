import { useState } from "react";
import { ReadyState as WebSocketReadyState } from "react-use-websocket";

export type ConnectionOptions = {
  desiredName?: string;
  url: string;
};

export type ConnectComponentProps = {
  tryConnect(opts: ConnectionOptions): void;
  webSocketReadyState: WebSocketReadyState;
};

export default function Connect({
  tryConnect,
  webSocketReadyState,
}: ConnectComponentProps): JSX.Element {
  const [socketUrl, setSocketUrl] = useState("wss.tobot.tk:8085/");
  const [desiredName, setDesiredName] = useState<string | undefined>(undefined);

  return (
    <>
      <label htmlFor="ws-url">WebSocket URL:</label>
      <input
        id="ws-url"
        type="text"
        value={socketUrl}
        placeholder="wss://..."
        onChange={(e) => setSocketUrl(e.target.value)}
      />
      <label htmlFor="desired-name-input">Name:</label>
      <input
        id="desired-name-input"
        type="text"
        placeholder="..."
        onChange={(e) => setDesiredName(e.target.value)}
      />
      <button
        onClick={() => {
          console.debug("CLICK");
          tryConnect({
            url: socketUrl,
            desiredName: desiredName === "" ? undefined : desiredName,
          });
        }}
      >
        {webSocketReadyState === WebSocketReadyState.CONNECTING
          ? "Connecting..."
          : webSocketReadyState === WebSocketReadyState.OPEN
          ? "Change nickname"
          : webSocketReadyState === WebSocketReadyState.CLOSING
          ? "Disconnecting..."
          : webSocketReadyState === WebSocketReadyState.CLOSED
          ? "Connect"
          : "UNEXPECTED STATE"}
      </button>
    </>
  );
}
