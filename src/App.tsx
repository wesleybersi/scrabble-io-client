import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import Game from "./game/game";
import socket from "./game/socket";
import IconNL from "./assets/icon-nl.png";
import { HiUsers as IconUsers } from "react-icons/hi";
import { VscWholeWord as IconWords } from "react-icons/vsc";
import { IoIosClose as IconClose } from "react-icons/io";
interface GameData {
  userCount: number;
  wordCount: number;
  characterCount: number;
  longestWord?: { value: string; by: string; color?: string };
  player: {
    id: string;
    name: string;
    color: number;
    row: number;
    col: number;
    x: number;
    y: number;
    score: number;
    position: number;
    solvedWords: string[];
    longestWord: string;
  };
  timeRemaining: number;
  positions: { id: string; row: number; col: number; color: number }[];
  leaderboard: {
    position: number;
    name: string;
    color: number;
    score: number;
  }[];
}

interface TileInfo {
  id: number;
  letter: string;
  value: number;
  row: number;
  col: number;
  moveCount: number;
  solver?: { name: string; color: number };
  firstInteraction?: { name: string; color: number; at: string };
  lastInteraction?: { name: string; color: number; at: string };
  words: {
    position: number;
    word: string;
    solver: { name: string; color: number; at: string };
    description: string[];
  }[];
}
function App() {
  const [gridSize, setGridSize] = useState<{ rows: number; cols: number }>({
    rows: 0,
    cols: 0,
  });
  const [longestWord, setLongestWord] = useState<{ value: string; by: string }>(
    { value: "", by: "" }
  );
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [positions, setPositions] = useState<
    { id: string; row: number; col: number; color: string }[]
  >([]);
  const [leaderboard, setLeaderboard] = useState<
    { position: number; name: string; color: number; score: number }[]
  >([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [playerData, setPlayerData] = useState<{
    id: string;
    name: string;
    color: string;
    row: number;
    col: number;
    x: number;
    y: number;
    score: number;
    position: number;
    solvedWords: string[];
    longestWord: string;
  }>({
    id: "",
    name: "",
    color: "",
    score: 0,
    row: 0,
    col: 0,
    x: 0,
    y: 0,
    position: 100,
    solvedWords: [],
    longestWord: "",
  });

  const [tileInfo, setTileInfo] = useState<TileInfo | null>(null);

  useEffect(() => {
    socket.on("Initial Game Data", (gameData) => {
      const rows = gameData.grid.rows;
      const cols = gameData.grid.cols;
      setGridSize({ rows, cols });
    });

    socket.on("Tile Information", (data: TileInfo | null) => {
      setTileInfo(data);
    });

    socket.on("Game Update", (gameData: GameData) => {
      const timer = formatTime(gameData.timeRemaining);
      setTimeRemaining(timer);
      setPlayerData({
        ...gameData.player,
        color: numericColorToHex(gameData.player.color),
      });
      setLongestWord({
        value: gameData.longestWord?.value ?? "",
        by: gameData.longestWord?.by ?? "",
      });
      setWordCount(gameData.wordCount);
      setCharacterCount(gameData.characterCount);
      setLeaderboard(gameData.leaderboard);
      const positions = [];
      for (const position of gameData.positions) {
        positions.push({
          ...position,
          color: numericColorToHex(position.color),
        });
      }
      setPositions(positions);
      setUserCount(gameData.userCount);
    });
  }, [socket]);
  return (
    <div className={styles.App} style={{ cursor: "none" }}>
      <div className={styles.ui}>
        {tileInfo && (
          <section className={styles.tile}>
            <div>
              <h3>Tile #{tileInfo?.id}</h3>
            </div>
            {tileInfo.solver && (
              <div>
                Belongs to:{" "}
                <span
                  style={{
                    color: numericColorToHex(tileInfo.solver.color),
                    fontWeight: 600,
                  }}
                >
                  {tileInfo.solver.name}
                </span>
              </div>
            )}
            <div style={{ paddingTop: "1rem" }}>
              x: {tileInfo.col} y: {tileInfo.row}
            </div>
            {tileInfo.letter && (
              <div>
                Letter: {tileInfo.letter === " " ? "All" : tileInfo.letter}
              </div>
            )}
            {tileInfo.value && (
              <div>
                Value: {tileInfo.letter === "?" ? "?" : tileInfo.value}{" "}
              </div>
            )}

            <div style={{ paddingTop: "1rem" }}>
              {tileInfo.moveCount === 0
                ? "Tile has not moved yet."
                : `Tile has moved a total of ${tileInfo.moveCount} times`}
            </div>
            {tileInfo.firstInteraction && (
              <div>
                First moved: {tileInfo.firstInteraction.at} by{" "}
                <span
                  style={{
                    color: numericColorToHex(tileInfo.firstInteraction.color),
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  {tileInfo.firstInteraction.name}
                </span>
              </div>
            )}
            {tileInfo.lastInteraction && (
              <div>
                Last moved: {tileInfo.lastInteraction.at} by{" "}
                <span
                  style={{
                    color: numericColorToHex(tileInfo.lastInteraction.color),
                    fontWeight: 600,
                  }}
                >
                  {tileInfo.lastInteraction.name}
                </span>
              </div>
            )}

            {tileInfo.words.length > 0 && (
              <>
                <div style={{ paddingTop: "1rem" }}>
                  Tile is part of
                  {tileInfo.words.length === 1 ? " one word:" : " two words:"}
                </div>
                {tileInfo.words.map((word) => (
                  <div>
                    {word.word
                      .split(word.word[word.position - 1])
                      .map((string, index) => {
                        return (
                          <>
                            <span>{string}</span>
                            {index === 0 && (
                              <span
                                style={{
                                  color:
                                    tileInfo.solver &&
                                    numericColorToHex(tileInfo.solver.color),
                                  fontWeight: 600,
                                }}
                              >
                                {word.word[word.position - 1]}
                              </span>
                            )}
                          </>
                        );
                      })}{" "}
                    - Solved {word.solver.at} by{" "}
                    <span
                      style={{
                        color:
                          tileInfo.solver &&
                          numericColorToHex(word.solver.color),
                        fontWeight: 600,
                      }}
                    >
                      {word.solver.name}
                    </span>
                    {word.description.length > 0 && (
                      <div style={{ paddingTop: "1rem" }}>
                        Word definition:
                        {word.description.map((paragraph) => (
                          <p>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </section>
        )}
        <section className={styles.player}>
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              className={styles.item}
              style={{
                minWidth: "250px",
                minHeight: "2.75rem",
                background: index === 0 ? playerData.color : "",
                marginRight: `calc(250px + ${index * 16}px)`,
              }}
            >
              {index === 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "1.25rem",
                    fontWeight: 600,
                  }}
                >
                  <span className={styles.transcolor}>
                    <span
                      className={styles.inner}
                      style={{
                        backgroundColor: playerData.color,
                      }}
                    />
                  </span>
                  <span>{playerData.name}</span>
                </div>
              )}
              {index === 1 && (
                <div style={{ display: "flex", gap: "2rem" }}>
                  <span className={styles.transcolor}>
                    <span className={styles.inner} />
                  </span>
                  <span>Score: {playerData.score}</span>
                  <span>Longest: {playerData.longestWord?.length}</span>
                </div>
              )}
              {/* {index === 2 && (
                <button
                  style={{ pointerEvents: "all" }}
                  onClick={() => socket.emit("Random Position Request")}
                >
                  Random
                </button>
              )} */}
            </div>
          ))}
        </section>
        <section className={styles.timer}>
          <div className={styles.left}>
            {gridSize.rows} x {gridSize.cols}
          </div>
          <div className={styles.lang}>
            <img src={IconNL} alt="NL" />
          </div>

          <div className={styles.time}>
            <span>{timeRemaining}</span>
          </div>
          <div className={styles.left}>
            <IconUsers size="24px" />
            {userCount}
          </div>
          <div className={styles.left}>Solved: {wordCount}</div>
          {/* <div className={styles.left}>
            
          </div> */}
          {/* <div className={styles.longest}>
            {longestWord.value[0]}
            {longestWord.value.slice(1).toLowerCase()}(
            {playerData.longestWord?.length})
          </div> */}
        </section>

        <section className={styles.leaderboard}>
          {leaderboard
            .slice(0, 8)
            .map(({ position, name, color, score }, index, arr) => (
              <div
                className={styles.item}
                style={{
                  minWidth: "265px",
                  marginLeft: `calc(250px + ${index * 16}px)`,
                  // opacity: index === arr.length - 2 ? 0 : 1,
                  // marginTop: index === arr.length - 1 ? "-1rem" : "",
                }}
              >
                <span
                  className={styles.color}
                  style={{ background: numericColorToHex(color) }}
                ></span>
                <span className={styles.position}>{position}</span>
                {/* <span>-</span> */}
                <span>{name}</span>
                <span className={styles.score}>{score}</span>
              </div>
            ))}
        </section>
        <section
          className={styles.map}
          style={{
            aspectRatio: `${gridSize.cols} / ${gridSize.rows}`,
            width: 200,
          }}
        >
          {/* {gridSize.rows} */}
          {/* {gridSize.cols} */}
          {positions.map((position) => {
            const isClient = position.id === playerData.id;
            return (
              <span
                style={{
                  display: "block",
                  position: "absolute",
                  top: `${(position.row / gridSize.rows) * 100}%`,
                  left: `${(position.col / gridSize.cols) * 100}%`,
                  width: isClient ? 8 : 3,
                  height: isClient ? 8 : 3,
                  borderRadius: "50%",
                  background: position.color,
                  transition: "1s ease all",
                  // outline: isClient ? "1px solid rgba(255,255,255,0.75)" : "",
                }}
              ></span>
            );
          })}
        </section>
        <section className={styles.words}></section>
      </div>
      <Game />
    </div>
  );
}

export default App;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

function numericColorToHex(colorValue: number) {
  // Ensure the input is a number and convert it to a hexadecimal string
  const hexString = colorValue.toString(16);

  // Add '0x' prefix and pad with zeros if necessary to ensure 6 characters
  const hexColor = `#${hexString.padStart(6, "0")}`;

  return hexColor;
}
