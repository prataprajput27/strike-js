const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

// Set the canvas size to match the window size
canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector("#scoreEl");
const startGameBtn = document.querySelector("#startGameBtn");
const modalEl = document.querySelector("#modalEl");
const bigScoreEl = document.querySelector("#bigScoreEl");
const bigTimerEl = document.querySelector("#bigTimerEl");
const highScoreEl = document.querySelector("#highScoreEl");
const categoryMessageEl = document.querySelector("#categoryMessage");

// Load background sound
let backgroundSound = new Audio("SoundEffects/space-ship-background-noise.mp3");

// Define a class for the player
class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  // Method to draw the player on the canvas
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
}

// Define a class for the projectiles
class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  // Method to draw the projectile on the canvas
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  // Method to update the position of the projectile
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
// Define a class for the enemies
class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  // Method to draw the enemy on the canvas
  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }

  // Method to update the position of the enemy
  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

// Define a friction value to simulate slowing down of particles over time
const friction = 0.99;

// Define a class for the particles
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 2; // Alpha value for fading out effect
  }

  // Method to draw the particle on the canvas
  draw() {
    c.save();
    c.globalAlpha = this.alpha;
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.restore();
  }

  // Method to update the position and alpha value of the particle
  update() {
    this.draw();
    this.velocity.x *= friction; // Apply friction to slow down the particle
    this.velocity.y *= friction; // Apply friction to slow down the particle
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01; // Reduce alpha value for fading out effect
  }
}
// Calculate the initial position of the player at the center of the canvas
const x = canvas.width / 2;
const y = canvas.height / 2;

// Create a new player object with initial position, radius, and color
let player = new Player(x, y, 30, "#fafafa");

// Initialize arrays to store projectiles, enemies, and particles
let projectiles = [];
let enemies = [];
let particles = [];

// Variable to store the interval for spawning enemies
let timerInterval;

// Function to initialize the game state
function init() {
  // Reset player position and properties
  player = new Player(x, y, 30, "#fafafa");
  // Reset arrays for projectiles, enemies, and particles
  projectiles = [];
  enemies = [];
  particles = [];
  // Reset score and update score display elements
  score = 0;
  scoreEl.innerText = score;
  bigScoreEl.innerText = score;

  // Clear any existing timer interval
  if (timerInterval) clearInterval(timerInterval);

  // Retrieve the high score from localStorage
  const highScore = localStorage.getItem("highScore");
  if (highScore) {
    highScoreEl.innerText = highScore;
    bigScoreEl.innerText = highScore;
  }
}

// Function to spawn enemies at regular intervals
function spawnEnemies() {
  setInterval(() => {
    // Randomize the radius of the enemy
    const radius = Math.random() * (30 - 10) + 10;

    let x, y;
    // Randomize initial position of the enemy
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    // Randomize color of the enemy
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;

    // Calculate angle towards the center of the canvas
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);

    // Calculate velocity based on angle
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    // Create a new enemy object with random properties
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 1000); // Spawn enemies every 1000ms (1 second)
}
let animationId; // Variable to store the ID returned by requestAnimationFrame
let score = 0; // Initialize the score to 0

function animate() {
  // Request the next animation frame and store its ID in animationId
  animationId = requestAnimationFrame(animate);

  // Clear the entire canvas before drawing new frame
  c.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the galaxy background
  drawGalaxy();

  // Draw the player
  player.draw();

  // Update and draw particles
  particles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0.1) {
      // Remove particles with low alpha
      particles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  // Update and draw projectiles
  projectiles.forEach((projectile, projIndex) => {
    projectile.update();

    // Remove projectiles that are out of bounds
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(projIndex, 1);
    }
  });

  // Update and draw enemies
  enemies.forEach((enemy, index) => {
    enemy.update();

    // Check for collision with player
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      // End the game if collision occurs
      cancelAnimationFrame(animationId);
      modalEl.style.display = "flex";
      bigScoreEl.innerText = score;
      categoryMessageEl.innerText = getMessageBasedOnScore(score);

      // Update the high score if the current score is higher
      if (score > parseInt(localStorage.getItem("highScore") || 0)) {
        localStorage.setItem("highScore", score);
        bigScoreEl.innerText = score;
        highScoreEl.innerText = score;
      }

      clearInterval(timerInterval); // Clear the timer interval when game ends
      let endGameSound = new Audio("SoundEffects/small-rock-break.mp3");
      endGameSound.play();
    }

    // Check for collision with projectiles
    projectiles.forEach((projectile, projIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      if (dist - enemy.radius - projectile.radius < 1) {
        // Increase score and create particles for enemy destruction
        score += 100;
        scoreEl.innerText = score;

        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }

        // Decrease enemy size or remove it if too small
        if (enemy.radius - 10 > 5) {
          enemy.radius -= 10;
        } else {
          score += 300;
          scoreEl.innerText = score;

          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projIndex, 1);
          }, 0);
        }
      }
    });
  });
}
// Event listener to shoot projectiles on click
addEventListener("click", (event) => {
  const angle = Math.atan2(
    event.clientY - canvas.height / 2,
    event.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6,
  };

  // Create a new projectile at the player's position with calculated velocity
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );

  // Play a laser sound effect
  let laserSound = new Audio("SoundEffects/short-laser-gun-shot.wav");
  laserSound.play();
});

// Event listener to start the game
startGameBtn.addEventListener("click", () => {
  // Initialize game state
  init();
  // Start the game loop
  animate();
  // Spawn enemies
  spawnEnemies();
  // Start background sound
  backgroundSound.loop = true;
  backgroundSound.play();
  // Hide the modal
  modalEl.style.display = "none";

  // Retrieve the high score from localStorage at the start of the game
  const highScore = localStorage.getItem("highScore");
  if (highScore) {
    highScoreEl.innerText = highScore;
  }

  let timer = 0;
  let timerElement = document.getElementById("timer");

  // Update timer every second
  timerInterval = setInterval(() => {
    timer++;
    timerElement.innerText = `Time: ${timer}s`;
    bigTimerEl.innerHTML = `${timer}s`;
  }, 1000);
});

// Arrays to store different celestial objects in the galaxy
let stars = [];
let planets = [];
let meteors = [];

// Function to draw the galaxy background
function drawGalaxy() {
  c.fillStyle = "black"; // Background color
  c.fillRect(0, 0, canvas.width, canvas.height);

  // Generate stars
  if (stars.length < 500) {
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 2;
      const opacity = Math.random();
      stars.push({ x, y, radius, opacity });
    }
  }

  // Draw stars
  stars.forEach((star, index) => {
    // Twinkle effect
    if (Math.random() > 0.995) {
      star.opacity = star.opacity === 1 ? 0.5 : 1; // Toggle between full and half opacity
    }

    c.save();
    c.beginPath();
    c.translate(star.x, star.y);
    c.moveTo(0, -star.radius);
    for (let i = 0; i < 5; i++) {
      c.rotate(Math.PI / 5);
      c.lineTo(0, -(star.radius * 0.5));
      c.rotate(Math.PI / 5);
      c.lineTo(0, -star.radius);
    }
    c.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    c.fill();
    c.restore();

    // Update star position with slight random movement
    star.x += (Math.random() - 0.5) * 0.2;
    star.y += (Math.random() - 0.5) * 0.2;

    // Remove star if out of bounds
    if (
      star.x < 0 ||
      star.x > canvas.width ||
      star.y < 0 ||
      star.y > canvas.height
    ) {
      stars.splice(index, 1);
    }
  });
}

// Function to get the message based on the player's performance
function getMessageBasedOnScore(score) {
  if (score < 1499) {
    return "Keep trying! Practice makes perfect.";
  } else if (score >= 1500 && score < 2999) {
    return "Good job! You're getting better.";
  } else if (score >= 3000 && score < 5999) {
    return "Great work! You're a skilled player.";
  } else if (score >= 6000 && score < 7999) {
    return "Awesome! You're a pro at this!";
  } else if (score >= 8000 && score < 9999) {
    return "Incredible! You're a legend!";
  } else {
    return "Unbelievable! Are you a gamer seriously?";
  }
}
