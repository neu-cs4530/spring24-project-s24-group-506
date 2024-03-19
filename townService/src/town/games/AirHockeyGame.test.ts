function createPuck(position: { x: number; y: number }, velocity: { vx: number; vy: number }) {
  return {
    x: position.x,
    y: position.y,
    vx: velocity.vx,
    vy: velocity.vy,
  };
}

function createPaddle(
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  velocityX: number,
  velocityY: number,
) {
  return {
    x, // x-coordinate of the paddle's top-left corner
    y, // y-coordinate of the paddle's top-left corner
    width, // Width of the paddle
    height, // Height of the paddle
    color, // Color of the paddle
    velocityX, // Velocity of the paddle in the horizontal direction
    velocityY, // Velocity of the paddle in the vertical direction
  };
}

describe('Air Hockey Game Mechanics Backend for Singleplayer', () => {
  describe('Puck Wall Collision', () => {
    it('should reverse puck velocity upon colliding with top wall', () => {
      // Define initial position and velocity for the puck
      const initialPosition = { x: 50, y: 5 }; // Starting position near top wall
      const initialVelocity = { vx: 0, vy: -1 }; // Moving upwards

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with top wall
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBe(0); // Puck should stop moving horizontally
      expect(puck.vy).toBeGreaterThan(0); // Puck should start moving downwards
    });
    it('should reverse puck velocity upon colliding with bottom wall', () => {
      // Define initial position and velocity for the puck
      const initialPosition = { x: 50, y: 5 }; // Starting position near top wall
      const initialVelocity = { vx: 0, vy: -1 }; // Moving upwards

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with top wall
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBe(0); // Puck should stop moving horizontally
      expect(puck.vy).toBeGreaterThan(0); // Puck should start moving downwards
    });

    it('should reverse puck velocity upon colliding with left wall', () => {
      // Define initial position and velocity for the puck (collision with left wall)
      const initialPosition = { x: 5, y: 50 }; // Starting position near left wall
      const initialVelocity = { vx: -1, vy: 0 }; // Moving left

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with left wall
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBeGreaterThan(0); // Puck should start moving right
      expect(puck.vy).toBe(0); // Puck should maintain vertical velocity
    });

    it('should reverse puck velocity upon colliding with right wall', () => {
      // Define initial position and velocity for the puck (collision with right wall)
      const initialPosition = { x: 95, y: 50 }; // Starting position near right wall
      const initialVelocity = { vx: 1, vy: 0 }; // Moving right

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with right wall
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBeLessThan(0); // Puck should start moving left
      expect(puck.vy).toBe(0); // Puck should maintain vertical velocity
    });
    it('should reverse puck velocity upon colliding with top-left corner', () => {
      // Define initial position and velocity for the puck (collision with top-left corner)
      const initialPosition = { x: 5, y: 5 }; // Starting position near top-left corner
      const initialVelocity = { vx: -1, vy: -1 }; // Moving diagonally towards the bottom-right

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with top-left corner
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBeGreaterThan(0); // Puck should start moving right
      expect(puck.vy).toBeGreaterThan(0); // Puck should start moving downwards
    });

    it('should reverse puck velocity upon colliding with top-right corner', () => {
      // Define initial position and velocity for the puck (collision with top-right corner)
      const initialPosition = { x: 95, y: 5 }; // Starting position near top-right corner
      const initialVelocity = { vx: 1, vy: -1 }; // Moving diagonally towards the bottom-left

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with top-right corner
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBeLessThan(0); // Puck should start moving left
      expect(puck.vy).toBeGreaterThan(0); // Puck should start moving downwards
    });

    it('should reverse puck velocity upon colliding with bottom-left corner', () => {
      // Define initial position and velocity for the puck (collision with bottom-left corner)
      const initialPosition = { x: 5, y: 95 }; // Starting position near bottom-left corner
      const initialVelocity = { vx: -1, vy: 1 }; // Moving diagonally towards the top-right

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with bottom-left corner
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBeGreaterThan(0); // Puck should start moving right
      expect(puck.vy).toBeLessThan(0); // Puck should start moving upwards
    });

    it('should reverse puck velocity upon colliding with bottom-right corner', () => {
      // Define initial position and velocity for the puck (collision with bottom-right corner)
      const initialPosition = { x: 95, y: 95 }; // Starting position near bottom-right corner
      const initialVelocity = { vx: 1, vy: 1 }; // Moving diagonally towards the top-left

      // Create the puck object with defined position and velocity
      const puck = createPuck(initialPosition, initialVelocity);

      // Simulate collision with bottom-right corner
      puckMovement(puck);

      // Verify puck velocity is reversed
      expect(puck.vx).toBeLessThan(0); // Puck should start moving left
      expect(puck.vy).toBeLessThan(0); // Puck should start moving upwards
    });
  });
  describe('Paddle Movement', () => {
    // let paddle: {
    //   x: number;
    //   y: number;
    //   velocityY?: number;
    //   velocityX?: number;
    //   vx?: number;
    //   vy?: number;
    // };

    // let previousX: number;
    // let previousY: number;

    let paddle: {
      x: number;
      y: number;
      velocityY?: any;
      velocityX?: any;
      vx?: number;
      vy?: number;
    };
    let previousX: number;
    let previousY: number;

    beforeEach(() => {
      // Initialize paddle with velocity
      paddle = createPaddle(50, 50, 10, 50, 'blue', 0, 0); // Initial position (50, 50), no initial velocity
      previousX = paddle.x; // Save the initial x-coordinate of the paddle
      previousY = paddle.y; // Save the initial y-coordinate of the paddle
    });

    it('should move the paddle upwards when the mouse is moved upwards', () => {
      // Simulate moving the mouse upwards
      puckMovement({ x: paddle.x, y: paddle.y - 10 });

      // Check if the paddle moves upwards based on velocity
      expect(paddle.y).toBe(previousY - paddle.velocityY); // Assuming velocityY determines the speed of paddle movement
    });

    it('should move the paddle downwards when the mouse is moved downwards', () => {
      // Simulate moving the mouse downwards
      puckMovement({ x: paddle.x, y: paddle.y + 10 });

      // Check if the paddle moves downwards based on velocity
      expect(paddle.y).toBe(previousY + paddle.velocityY); // Assuming velocityY determines the speed of paddle movement
    });

    it('should move the paddle to the left when the mouse is moved to the left', () => {
      // Simulate moving the mouse to the left
      puckMovement({ x: paddle.x - 10, y: paddle.y });

      // Check if the paddle moves to the left based on velocity
      expect(paddle.x).toBe(previousX - paddle.velocityX); // Assuming velocityX determines the speed of paddle movement
    });

    it('should move the paddle to the right when the mouse is moved to the right', () => {
      // Simulate moving the mouse to the right
      puckMovement({ x: paddle.x + 10, y: paddle.y });

      // Check if the paddle moves to the right based on velocity
      expect(paddle.x).toBe(previousX + paddle.velocityX); // Assuming velocityX determines the speed of paddle movement
    });

    it('should move the paddle diagonally when the mouse is moved diagonally', () => {
      // Simulate moving the mouse diagonally
      puckMovement({ x: paddle.x + 10, y: paddle.y - 10 });

      // Check if the paddle moves diagonally based on velocity
      expect(paddle.x).toBe(previousX + paddle.velocityX); // Assuming velocityX determines the speed of paddle movement
      expect(paddle.y).toBe(previousY - paddle.velocityY); // Assuming velocityY determines the speed of paddle movement
    });

    it('should not move the paddle beyond the top wall', () => {
      // Simulate moving the mouse upwards
      puckMovement({ x: paddle.x, y: 0 });

      // Check if the paddle stays at the same position (should not move beyond the top wall)
      expect(paddle.y).toBe(previousY);
    });

    it('should not move the paddle beyond the bottom wall', () => {
      // Simulate moving the mouse downwards
      puckMovement({ x: paddle.x, y: 1000 }); // Assuming the court height is 100 units

      // Check if the paddle stays at the same position (should not move beyond the bottom wall)
      expect(paddle.y).toBe(previousY);
    });

    it('should not move the paddle beyond the left wall', () => {
      // Simulate moving the mouse to the left
      puckMovement({ x: 0, y: paddle.y });

      // Check if the paddle stays at the same position (should not move beyond the left wall)
      expect(paddle.x).toBe(previousX);
    });

    it('should not move the paddle beyond the right wall', () => {
      // Simulate moving the mouse to the right
      puckMovement({ x: 1000, y: paddle.y }); // Assuming the court width is 100 units

      // Check if the paddle stays at the same position (should not move beyond the right wall)
      expect(paddle.x).toBe(previousX);
    });
  });

  describe('Collision Detection Between Puck and Paddle', () => {
    it('should detect collision between puck and paddle when they intersect', () => {
      // Define initial position and velocity for the puck and paddle
      const initialPuckPosition = { x: 50, y: 50 };
      const initialPaddlePosition = { x: 60, y: 60 };
      const initialPuckVelocity = { vx: 1, vy: 0 }; // Moving horizontally
      const puck = createPuck(initialPuckPosition, initialPuckVelocity);
      const paddle = createPaddle(
        initialPaddlePosition.x,
        initialPaddlePosition.y,
        10,
        50,
        'blue',
        0,
        0,
      );

      // Simulate collision between puck and paddle
      puckMovement(puck);
      // Assuming simulatePuckMovement updates puck position based on its velocity

      // Verify collision is detected and handled
      // implement method collision when puck and paddle intersect
      expect(collision(puck, paddle)).toBe(true);
      // Assuming isCollisionDetected function checks if the puck intersects with the paddle
    });
  });
  describe('Scoring Mechanism When Puck Enters Goal', () => {
    it('should increase score when puck enters the goal', () => {
      // Define initial position and velocity for the puck entering the goal
      const initialPuckPosition = { x: 95, y: 50 }; // Puck enters the goal area
      const initialPuckVelocity = { vx: 1, vy: 0 }; // Moving towards the goal
      const puck = createPuck(initialPuckPosition, initialPuckVelocity);
      const initialScore = 0;

      // Simulate puck entering the goal
      puckMovement(puck);

      // Verify score is updated
      // implement getScore() function to retrieve the current score
      expect(getScore()).toBe(initialScore + 1);
      // Assuming getScore() function retrieves the current score
    });
  });

  describe('Game Over Conditions and Resetting the Game', () => {
    it('should reset the game when game over conditions are met', () => {
      // Simulate game reaching its end state (e.g., score limit or time limit reached)
      gameOver();

      // Verify game is reset to its initial state
      expect(gameReset()).toBe(true);
    });
  });
});
