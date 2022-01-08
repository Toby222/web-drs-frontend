import { FunctionComponent, useEffect, useState } from "react";
import { TextMessage } from "src/lib/ServerMessage";

import AuthorComponent from "./Author";

type MessageComponentProps = {
  message: TextMessage;
};
enum MONTH_NAMES {
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
}

function getFormattedDate(
  date: Date,
  prefomattedDate?: string,
  hideYear = false
) {
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  if (prefomattedDate) {
    // Today at 10:20
    // Yesterday at 10:20
    return `${prefomattedDate} at ${hours}:${minutes}`;
  }

  if (hideYear) {
    // 10. January at 10:20
    return `${day}. ${month} at ${hours}:${minutes}`;
  }

  // 10. January 2017. at 10:20
  return `${day}. ${month} ${year}. at ${hours}:${minutes}`;
}

// --- Main function
function timeAgo(dateParam: Date | number) {
  const date = typeof dateParam === "object" ? dateParam : new Date(dateParam);
  const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
  const today = new Date();
  const yesterday = new Date(today.getTime() - DAY_IN_MS);
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const isToday = today.toDateString() === date.toDateString();
  const isYesterday = yesterday.toDateString() === date.toDateString();
  const isThisYear = today.getFullYear() === date.getFullYear();

  if (seconds < 5) {
    return "now";
  } else if (seconds < 60) {
    return `${seconds} seconds ago`;
  } else if (seconds < 90) {
    return "about a minute ago";
  } else if (minutes < 60) {
    return `${minutes} minutes ago`;
  } else if (isToday) {
    return getFormattedDate(date, "Today"); // Today at 10:20
  } else if (isYesterday) {
    return getFormattedDate(date, "Yesterday"); // Yesterday at 10:20
  } else if (isThisYear) {
    return getFormattedDate(date, undefined, true); // 10. January at 10:20
  } else {
    return getFormattedDate(date); // 10. January 2017. at 10:20
  }
}

const MessageComponent: FunctionComponent<MessageComponentProps> = ({
  message,
}) => {
  const date = new Date(message.date);
  const [timeAgoString, setTimeAgoString] = useState(timeAgo(message.date));

  useEffect(() => {
    const checkTimeAgo = () => {
      const newTimeAgoString = timeAgo(message.date);
      if (timeAgoString !== newTimeAgoString) {
        setTimeAgoString(newTimeAgoString);
      }
    };

    const interval = setInterval(checkTimeAgo, 5000);
    return () => clearInterval(interval);
  }, [message.date, timeAgoString]);

  return (
    <div className="message">
      <h2>
        <AuthorComponent authorId={message.author} />
        <sub>
          <time className="message-date" dateTime={date.toISOString()}>
            {timeAgoString}
          </time>
        </sub>
      </h2>
      <div className="message-content">{message.content}</div>
    </div>
  );
};

export default MessageComponent;
