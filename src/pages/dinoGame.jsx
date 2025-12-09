import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import dinoRun1 from "../imgs/dino_run1.png";
import dinoRun2 from "../imgs/dino_run2.png";
import cactus1 from "../imgs/cactus_1.png";
import cactus2 from "../imgs/cactus_2.png";
import boo from "../imgs/boo.png";
import dinoStanding from "../imgs/standing_still.png";
import ground from "../imgs/ground.png";
import { useTheme } from "../contexts/themeContext";
import { Clock, RefreshCcw } from "lucide-react";

const CONFIG = {
  CANVAS: {
    BASE_WIDTH: 800,
    BASE_HEIGHT: 400,
    getDimensions: () => {
      const width = Math.min(window.innerWidth - 32, 800);
      const height = (width * 400) / 800;
      return { width, height, scale: width / 800 };
    },
  },
  DINO: {
    WIDTH: 88,
    HEIGHT: 94,
    START_X: 50,
    START_Y: 306,
  },
  GROUND: {
    HEIGHT: 400,
    SPRITE_HEIGHT: 40,
  },
  GAME: {
    MIN_OBSTACLE_SPACING: 400,
    OPTIMAL_SPACING: 550,
    BASE_SPEED: 6,
    GRAVITY: 0.8,
    JUMP_VELOCITY: -17,
    FRAME_RATE: 16.67,
    SPEED_INCREASE: 0.003,
    MAX_SPEED: 17,
  },
};

// Updated obstacle types with fixed positions
const OBSTACLE_TYPES = {
  CACTUS_1: {
    width: 48,
    height: 100,
    y: 300,
    sprite: "cactus1",
    hitboxWidth: 40,
    hitboxHeight: 95,
  },
  CACTUS_2: {
    width: 98,
    height: 100,
    y: 300,
    sprite: "cactus2",
    hitboxWidth: 90,
    hitboxHeight: 95,
  },
  BOO: {
    width: 115,
    height: 93,
    y: 200,
    sprite: "boo",
    hitboxWidth: 40,
    hitboxHeight: 35,
  },
};

const DinoGame = () => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);
  const groundRef = useRef({ x: 0 });
  const [dimensions, setDimensions] = useState(CONFIG.CANVAS.getDimensions());

  const [gameState, setGameState] = useState({
    isJumping: false,
    gameOver: false,
    score: 0,
    highScore: 0,
    isPaused: false,
    currentSpeed: CONFIG.GAME.BASE_SPEED,
  });

  const gameData = useRef({
    dinoPos: { x: CONFIG.DINO.START_X, y: CONFIG.DINO.START_Y },
    obstacles: [],
    speed: CONFIG.GAME.BASE_SPEED,
    frameCount: 0,
    sprites: {},
    lastObstacleTime: 0,
  });

  // Updated sprite loading
  useEffect(() => {
    const loadSprite = (src) => {
      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => resolve(img);
        img.src = src;
      });
    };

    Promise.all([
      loadSprite(dinoRun1),
      loadSprite(dinoRun2),
      loadSprite(dinoStanding),
      loadSprite(cactus1),
      loadSprite(cactus2),
      loadSprite(ground),
      loadSprite(boo),
    ]).then(([run1, run2, standing, cact1, cact2, groundSprite, booSprite]) => {
      gameData.current.sprites = {
        run1,
        run2,
        standing,
        cactus1: cact1,
        cactus2: cact2,
        ground: groundSprite,
        boo: booSprite,
      };
    });
  }, []);

  // Updated render function with fixed scaling
  const render = useCallback(
    (ctx) => {
      const { dinoPos, obstacles, frameCount, sprites } = gameData.current;
      const { isJumping, score, highScore, gameOver } = gameState;
      const scale = dimensions.scale;

      // Clear and set background
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.fillStyle = isDarkMode ? "#1a1a1a" : "#ffffff";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Scale the context
      ctx.save();
      ctx.scale(scale, scale);

      // Draw ground - Modified ground rendering
      if (sprites.ground) {
        // Draw first ground segment
        const groundPattern = ctx.createPattern(sprites.ground, "repeat-x");
        ctx.fillStyle = groundPattern;
        ctx.save();
        ctx.translate(groundRef.current.x, 360);
        ctx.fillRect(
          0,
          0,
          CONFIG.CANVAS.BASE_WIDTH,
          CONFIG.GROUND.SPRITE_HEIGHT
        );

        // Draw second ground segment to ensure continuous ground
        ctx.translate(CONFIG.CANVAS.BASE_WIDTH, 0);
        ctx.fillRect(
          0,
          0,
          CONFIG.CANVAS.BASE_WIDTH,
          CONFIG.GROUND.SPRITE_HEIGHT
        );
        ctx.restore();
      } else {
        // Fallback ground if sprite hasn't loaded
        ctx.fillStyle = isDarkMode ? "#2a2a2a" : "#cccccc";
        ctx.fillRect(
          0,
          360,
          CONFIG.CANVAS.BASE_WIDTH,
          CONFIG.GROUND.SPRITE_HEIGHT
        );
      }

      // Draw dino
      if (sprites.run1) {
        const sprite = isJumping
          ? sprites.standing
          : frameCount % 20 < 10
          ? sprites.run1
          : sprites.run2;
        ctx.drawImage(
          sprite,
          dinoPos.x,
          dinoPos.y,
          CONFIG.DINO.WIDTH,
          CONFIG.DINO.HEIGHT
        );
      }

      // Draw obstacles
      obstacles.forEach(({ x, y, type }) => {
        const obstacleType = OBSTACLE_TYPES[type];
        if (sprites[obstacleType.sprite]) {
          ctx.drawImage(
            sprites[obstacleType.sprite],
            x,
            y,
            obstacleType.width,
            obstacleType.height
          );
        }
      });

      // Draw score
      ctx.font = "20px Arial";
      ctx.fillStyle = isDarkMode ? "#ffffff" : "#535353";
      ctx.fillText(`Score: ${score}`, 20, 30);
      ctx.fillText(`High Score: ${highScore}`, 20, 60);

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, CONFIG.CANVAS.BASE_WIDTH, CONFIG.CANVAS.BASE_HEIGHT);

        ctx.font = "30px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.fillText(
          "Game Over!",
          CONFIG.CANVAS.BASE_WIDTH / 2,
          CONFIG.CANVAS.BASE_HEIGHT / 2
        );
        ctx.fillText(
          `Score: ${score}`,
          CONFIG.CANVAS.BASE_WIDTH / 2,
          CONFIG.CANVAS.BASE_HEIGHT / 2 + 40
        );
        ctx.font = "20px Arial";
        ctx.fillText(
          "Press SPACE to continue",
          CONFIG.CANVAS.BASE_WIDTH / 2,
          CONFIG.CANVAS.BASE_HEIGHT / 2 + 80
        );
      }

      ctx.restore();
    },
    [gameState, isDarkMode, dimensions]
  );

  // Updated resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions(CONFIG.CANVAS.getDimensions());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update function remains mostly the same, but with scaled collision detection
  const update = useCallback(() => {
    const data = gameData.current;
    data.frameCount++;

    groundRef.current.x -= data.speed;
    if (groundRef.current.x <= -CONFIG.CANVAS.BASE_WIDTH) {
      groundRef.current.x = 0;
    }

    if (!gameState.gameOver && !gameState.isPaused) {
      data.speed = Math.min(
        CONFIG.GAME.MAX_SPEED,
        CONFIG.GAME.BASE_SPEED + data.frameCount * CONFIG.GAME.SPEED_INCREASE
      );
    }

    data.obstacles = data.obstacles
      .filter((o) => o.x > -OBSTACLE_TYPES[o.type].width)
      .map((o) => ({
        ...o,
        x: o.x - data.speed,
      }));

    // Add new obstacles with proper spacing
    const lastObstacle = data.obstacles[data.obstacles.length - 1];
    const currentTime = Date.now();
    const timeSinceLastObstacle = currentTime - data.lastObstacleTime;
    const minTimeGap = (CONFIG.GAME.MIN_OBSTACLE_SPACING / data.speed) * 16;

    if (
      !lastObstacle ||
      (lastObstacle.x <
        CONFIG.CANVAS.BASE_WIDTH - CONFIG.GAME.OPTIMAL_SPACING &&
        timeSinceLastObstacle > minTimeGap)
    ) {
      const types = ["CACTUS_1", "CACTUS_2", "BOO"];
      const type = types[Math.floor(Math.random() * types.length)];

      data.obstacles.push({
        x: CONFIG.CANVAS.BASE_WIDTH,
        y: OBSTACLE_TYPES[type].y,
        type,
      });

      data.lastObstacleTime = currentTime;
    }

    // Collision detection with scaled hitboxes
    const collision = data.obstacles.some(({ x, y, type }) => {
      const obstacleType = OBSTACLE_TYPES[type];
      const dinoHitbox = {
        x: data.dinoPos.x + 5,
        y: data.dinoPos.y + 5,
        width: CONFIG.DINO.WIDTH - 10,
        height: CONFIG.DINO.HEIGHT - 10,
      };

      const obstacleHitbox = {
        x: x + (obstacleType.width - obstacleType.hitboxWidth) / 2,
        y: y + (obstacleType.height - obstacleType.hitboxHeight) / 2,
        width: obstacleType.hitboxWidth,
        height: obstacleType.hitboxHeight,
      };

      return (
        dinoHitbox.x < obstacleHitbox.x + obstacleHitbox.width &&
        dinoHitbox.x + dinoHitbox.width > obstacleHitbox.x &&
        dinoHitbox.y < obstacleHitbox.y + obstacleHitbox.height &&
        dinoHitbox.y + dinoHitbox.height > obstacleHitbox.y
      );
    });

    if (collision) {
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        highScore: Math.max(prev.highScore, prev.score),
      }));
      return false;
    }

    setGameState((prev) => ({ ...prev, score: prev.score + 1 }));
    return true;
  }, [gameState.gameOver, gameState.isPaused]);

  // Game loop and event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let frameId;

    const gameLoop = () => {
      if (!gameState.gameOver && !gameState.isPaused) {
        if (update()) {
          render(ctx);
          frameId = requestAnimationFrame(gameLoop);
        }
      } else {
        render(ctx);
      }
    };

    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameState.gameOver) {
          gameData.current = {
            ...gameData.current,
            dinoPos: { x: CONFIG.DINO.START_X, y: CONFIG.DINO.START_Y },
            obstacles: [],
            speed: CONFIG.GAME.BASE_SPEED,
            frameCount: 0,
          };
          setGameState((prev) => ({
            ...prev,
            gameOver: false,
            score: 0,
            isJumping: false,
          }));
        } else if (!gameState.isJumping && !gameState.isPaused) {
          setGameState((prev) => ({ ...prev, isJumping: true }));
          let velocity = CONFIG.GAME.JUMP_VELOCITY;

          const jump = () => {
            const data = gameData.current;
            data.dinoPos.y += velocity;
            velocity += CONFIG.GAME.GRAVITY;

            if (data.dinoPos.y >= CONFIG.DINO.START_Y) {
              data.dinoPos.y = CONFIG.DINO.START_Y;
              setGameState((prev) => ({ ...prev, isJumping: false }));
              return;
            }
            requestAnimationFrame(jump);
          };
          requestAnimationFrame(jump);
        }
      } else if (e.code === "Escape") {
        setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    frameId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      cancelAnimationFrame(frameId);
    };
  }, [gameState, update, render]);

  return (
    <div className="w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={`w-full h-auto border-2 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        } rounded-lg`}
      />
    </div>
  );
};

const WaitingApproval = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setCheckingStatus(true);
        const response = await fetch(
          "http://localhost/onlineexam/backend/api/routes/api.php/check-status"
        );
        const data = await response.json();
        if (data.status === "Permissioned") navigate("/dashboard");
      } catch (error) {
        console.error("Failed to check status:", error);
      } finally {
        setCheckingStatus(false);
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div
      className={`min-h-screen py-12 px-4 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div
          className={`rounded-xl shadow-lg p-8 mb-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Waiting for Approval
            </h1>

            <button
              onClick={() => window.location.reload()}
              disabled={checkingStatus}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCcw
                className={`w-4 h-4 ${checkingStatus ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div
            className={`flex items-center gap-3 p-4 rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-gray-100"
            } mb-8`}
          >
            <Clock className={isDarkMode ? "text-gray-400" : "text-gray-600"} />
            <p
              className={`pt-3 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Your account is pending approval. Please wait while an
              administrator reviews your request.
            </p>
          </div>
        </div>

        <div className="text-center mb-8">
          <p
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            While you wait, enjoy a quick game!
          </p>
        </div>

        <div
          className={`rounded-xl shadow-lg p-8 ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <DinoGame />
        </div>
      </motion.div>
    </div>
  );
};

export default WaitingApproval;
