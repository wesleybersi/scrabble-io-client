import { useState, useEffect } from "react";

type WindowSize = {
  width: number;
  height: number;
};

const useWindowSize = (delay = 100): [WindowSize, boolean] => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      setIsResizing(true);
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => setIsResizing(false), delay);

      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [delay]);

  return [windowSize, isResizing];
};

export default useWindowSize;
