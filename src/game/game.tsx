import { useRef, useEffect } from "react";
import useWindowSize from "../hooks/useWindowSize";
import * as Phaser from "phaser";
import Main from "./scenes/MainScene";
import EditorPanel from "./scenes/EditorPanel";

import { create } from "zustand";

const Game = () => {
  const [windowSize, isResizing] = useWindowSize(200);
  const gameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: "100%",
      height: "100%",
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      fullscreenTarget: document.documentElement,
      fullscreen: {
        resizeCameras: true,
      },
      zoom: window.devicePixelRatio,
      parent: "phaser-game",
      backgroundColor: "#1A1817",
      scene: [Main, EditorPanel],
      pixelArt: true,
      render: {
        antialias: true,
        pixelArt: true,
        roundPixels: true,
      },
    };

    const game = new Phaser.Game(config);

    //Global variables
    // game.registry.set("cellSize", 16);

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, [gameRef]);

  return <div ref={gameRef} id="phaser-game" />;
};

export default Game;
