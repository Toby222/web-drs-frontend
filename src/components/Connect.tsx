import { useState } from "react";
export type ConnectionOptions = {
  desiredName?: string;
  url: string;
};

export type ConnectComponentProps = {
  tryConnect(opts: ConnectionOptions): void;
};

export default function Connect({
  tryConnect,
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
        onClick={() =>
          tryConnect({
            url: socketUrl,
            desiredName: desiredName === "" ? undefined : desiredName,
          })
        }
      >
        Connect
      </button>
    </>
  );
}
