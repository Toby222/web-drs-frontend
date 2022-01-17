import { FunctionComponent } from "react";

type AuthorComponentProps = {
  authorId: string;
  authorNickname: string;
};

const AuthorComponent: FunctionComponent<AuthorComponentProps> = ({
  authorId,
  authorNickname,
}) => {
  return (
    <span
      className={
        "message-author" + (authorId !== authorNickname ? " nickname" : "")
      }
    >
      {authorNickname}
    </span>
  );
};

export default AuthorComponent;
