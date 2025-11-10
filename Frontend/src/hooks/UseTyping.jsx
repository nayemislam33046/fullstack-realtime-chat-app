import { useState, useEffect } from "react";

export const useTyping = (callback, delay = 1000) => {
  const [isTyping, setIsTyping] = useState(false);
  const [timer, setTimer] = useState(null);

  const onKeyDown = () => {
    if (!isTyping) {
      setIsTyping(true);
      callback(true);
    }

    clearTimeout(timer);
    const newTimer = setTimeout(() => {
      setIsTyping(false);
      callback(false);
    }, delay);
    setTimer(newTimer);
  };

  useEffect(() => {
    return () => {
      clearTimeout(timer);
    };
  }, [timer]);

  return { onKeyDown };
};
