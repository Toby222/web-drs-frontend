import Image from "next/image";
import { useState } from "react";
export default function Index(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <>
      <header className="app-header">
        {" "}
        <Image
          src={require("../util/logo.svg")}
          className="logo"
          alt="logo"
          width={350}
          height={265}
        />
        <p className="header">
          Next.js + Preact + Typescript <br />
          & <br />
          Eslint + Prettier
        </p>
        <div className="content">
          <button
            onClick={() => setCount(count + 1)}
            style={{ cursor: "pointer" }}
          >
            Click me: {count}
          </button>
          <p>
            Don&apos;t forget to install ESlint and Prettier integration in your
            IDE.
          </p>
          <p>
            <a
              className="link"
              href="https://preactjs.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn Preact
            </a>
            {" | "}
            <a
              className="link"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Documentation
            </a>
          </p>
        </div>
      </header>
    </>
  );
}
