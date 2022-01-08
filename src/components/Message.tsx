import { FunctionComponent } from "react";
import { TextMessage } from "src/lib/ServerMessage";

type Props = {
  message: TextMessage;
};

const MessageComponent: FunctionComponent<Props> = ({ message }) => {
  return (
    <span>
      {new Date(message.date).toISOString()}
      {message.content}
    </span>
  );
};
export default MessageComponent;
