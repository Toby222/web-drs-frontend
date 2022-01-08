import { FunctionComponent } from "react";

type AuthorComponentProps = {
  authorId: string;
};

const AuthorComponent: FunctionComponent<AuthorComponentProps> = ({
  authorId,
}) => {
  return <span className="message-author">{authorId}</span>;
};

export default AuthorComponent;
