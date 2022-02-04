import React from "react";

type AuthorComponentProps = {
  authorId: string;
  authorNickname: string;
};

const AuthorComponent = React.memo(function Author({
  authorId,
  authorNickname,
}: AuthorComponentProps) {
  return (
    <span
      className={
        "message-author" + (authorId !== authorNickname ? " nickname" : "")
      }
      title={authorId}
    >
      {authorNickname}
    </span>
  );
});

export default AuthorComponent;
