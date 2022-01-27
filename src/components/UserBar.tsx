import { ConnectedUser } from "src/lib/ServerMessage";

export type UserBarProps = {
  connectedUsers: ConnectedUser[];
  currentlyTyping: string[];
  getName(id: string): string;
};

export default function UserBar({
  connectedUsers,
  currentlyTyping,
  getName,
}: UserBarProps): JSX.Element {
  return (
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
            title={id}
          >
            {getName(id)}
          </li>
        ))}
      </ol>
    </section>
  );
}
