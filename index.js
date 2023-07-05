const canvas = document.querySelector("canvas");
const C = canvas.getContext("2d");

canvas.width = window.innerWidth; //whole screen width & height
canvas.height = window.innerHeight;

//C.fillStyle = 'black'
//C.fillRect(0, 0, canvas.width, canvas.height) // arguments(x, y, width, height)

class Player {
  // This method constructor will called everytime we will create new player
  constructor({ position, velocity }) {
    this.position = position; // {x,y}
    this.velocity = velocity;
    this.rotation = 0; // it just need 0 radian rotation to start drawing
  }

  draw() {
    C.save();
    C.translate(this.position.x, this.position.y); // Taking centre position
    C.rotate(this.rotation); //it will roate whole canva screen but w ejust want to rotate spaceship from its center position
    C.translate(-this.position.x, -this.position.y);

    //For darwing circle we use arc method
    //We are checking whether player is made in center or not
    // arguments(x, y, radius, beginning angle of an arc always be 0, radians or complete circle 360deg, direction false for counterclockwise & True for clockwise)
    C.beginPath();
    C.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
    C.fillStyle = "red";
    C.fill();
    C.closePath();

    // C.fillStyle = 'red'
    // C.fillRect(this.position.x, this.position.y, 100, 100)

    // Drawing a Triangle
    C.beginPath();
    C.moveTo(this.position.x + 30, this.position.y);
    C.lineTo(this.position.x - 10, this.position.y - 10);
    C.lineTo(this.position.x - 10, this.position.y + 10);
    C.closePath();

    C.strokeStyle = "white";
    C.stroke();
    C.restore();
  }

  // updating & creating new player each time player starts to moving
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  // Game library
  getVertices() {
    const cos = Math.cos(this.rotation)
    const sin = Math.sin(this.rotation)

    return [
      {
        x: this.position.x + cos * 30 - sin * 0,
        y: this.position.y + sin * 30 + cos * 0,
      },
      {
        x: this.position.x + cos * -10 - sin * 10,
        y: this.position.y + sin * -10 + cos * 10,
      },
      {
        x: this.position.x + cos * -10 - sin * -10,
        y: this.position.y + sin * -10 + cos * -10,
      },
    ]
  }
}

// Projectile(Shooting circle)
class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
  }

  draw() {
    C.beginPath();
    C.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    C.closePath();
    C.fillStyle = "white";
    C.fill();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

// Spawning Asteroids
class Asteroid {
  constructor({ position, velocity, radius }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius; //random will give any random value between 0 to 1
  }

  draw() {
    C.beginPath();
    C.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    C.closePath();
    C.strokeStyle = "white";
    C.stroke();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
const player = new Player({
  position: { x: canvas.width / 2, y: canvas.height / 2 }, //For centering the position
  velocity: { x: 0, y: 0 },
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

//player.draw()

const SPEED = 3;
const ROTATIONAL_SPEED = 0.05;
const FRICTION = 0.97;
const PROJECTILE_SPEED = 3;

//Managing multiple projectiles
const projectiles = [];
const asteroids = [];

const intervalId = window.setInterval(() => {
  const index = Math.floor(Math.random() * 4);
  let x, y;
  let vx, vy;
  let radius = 50 * Math.random() + 10;

  switch (index) {
    case 0: // left side of the screen
      x = 0 - radius;
      y = Math.random() * canvas.height;
      vx = 1;
      vy = 0;
      break;
    case 1: // bottom side of the screen
      x = Math.random() * canvas.width;
      y = canvas.height + radius;
      vx = 0;
      vy = -1;
      break;
    case 2: // right side of the screen
      x = canvas.width + radius;
      y = Math.random() * canvas.height;
      vx = -1;
      vy = 0;
      break;
    case 3: // top side of the screen
      x = Math.random() * canvas.width;
      y = 0 - radius;
      vx = 0;
      vy = 1;
      break;
  }
  asteroids.push(
    new Asteroid({
      position: {
        x: x,
        y: y,
      },
      velocity: {
        x: vx,
        y: vy,
      },
      radius,
    })
  );
  console.log(asteroids)
}, 3000);

//Hiting Asteroids
function circleCollision(circle1, circle2) {
  const xDifference = circle2.position.x - circle1.position.x
  const yDifference = circle2.position.y - circle1.position.y
   
  // for finding radius of centres of two circles
  const distance = Math.sqrt(
    xDifference * xDifference + yDifference * yDifference
  )

  if (distance <= circle1.radius + circle2.radius) {
    //console.log('two have collided')
    return true
  }

  return false
}

function circleTriangleCollision(circle, triangle) {
  // Check if the circle is colliding with any of the triangle's edges
  for (let i = 0; i < 3; i++) {
    let start = triangle[i]
    let end = triangle[(i + 1) % 3]

    let dx = end.x - start.x
    let dy = end.y - start.y
    let length = Math.sqrt(dx * dx + dy * dy)

    let dot =
      ((circle.position.x - start.x) * dx +
        (circle.position.y - start.y) * dy) /
      Math.pow(length, 2)

    let closestX = start.x + dot * dx
    let closestY = start.y + dot * dy

    if (!isPointOnLineSegment(closestX, closestY, start, end)) {
      closestX = closestX < start.x ? start.x : end.x
      closestY = closestY < start.y ? start.y : end.y
    }

    dx = closestX - circle.position.x
    dy = closestY - circle.position.y

    let distance = Math.sqrt(dx * dx + dy * dy)

    if (distance <= circle.radius) {
      return true
    }
  }

  // No collision
  return false
}

function isPointOnLineSegment(x, y, start, end) {
  return (
    x >= Math.min(start.x, end.x) &&
    x <= Math.max(start.x, end.x) &&
    y >= Math.min(start.y, end.y) &&
    y <= Math.max(start.y, end.y)
  )
}


function animate() {
  // This method calls animate over & over again
  const animationId = window.requestAnimationFrame(animate);
  //console.log('animate')
  C.fillStyle = "black";
  C.fillRect(0, 0, canvas.width, canvas.height);

  player.update();

  // Rendering Projectile Through Backend
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    projectile.update();

    // garbage collection for projectiles
    if (
      projectile.position.x + projectile.radius < 0 ||
      projectile.position.x - projectile.radius > canvas.width ||
      projectile.position.y - projectile.radius > canvas.height ||
      projectile.position.y + projectile.radius < 0
    ) {
      projectiles.splice(i, 1);
    }
  }

  // Asteroid Managemnet
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const asteroid = asteroids[i];
    asteroid.update();

    if (circleTriangleCollision(asteroid, player.getVertices())) {
      console.log('GAME OVER')
      window.cancelAnimationFrame(animationId)
      clearInterval(intervalId)
    }

    // garbage collection for projectiles
    if (
      asteroid.position.x + asteroid.radius < 0 ||
      asteroid.position.x - asteroid.radius > canvas.width ||
      asteroid.position.y - asteroid.radius > canvas.height ||
      asteroid.position.y + asteroid.radius < 0
    ) {
      asteroids.splice(i, 1);
    }

    // projectiles
    for (let j = projectiles.length - 1; j >= 0; j--) {
      const projectile = projectiles[j]

      if (circleCollision(asteroid, projectile)) {
        asteroids.splice(i, 1)
        projectiles.splice(j, 1)
      }
    }
  }

  //player.velocity.x = 0 // else statemnet just write it lie that for cleaner code
  //player.velocity.y = 0

  if (keys.w.pressed) {
    // moving player to right direction
    player.velocity.y = Math.sin(player.rotation) * SPEED; // use this Math function to move player in up/down direction as it was movng on right stiil after rotating it
    player.velocity.x = Math.cos(player.rotation) * SPEED;
  } else if (!keys.w.pressed) {
    // using this to directly not stop space ship it will take 0.97 time to stop slowly
    player.velocity.x *= FRICTION;
    player.velocity.y *= FRICTION;
  }

  if (keys.d.pressed) player.rotation += ROTATIONAL_SPEED;
  //radians. Moving player in clockwise direction
  else if (keys.a.pressed) player.rotation -= ROTATIONAL_SPEED; // Moving player in anti-clockwise direction
}

animate();

//console.log(player)

window.addEventListener("keydown", (event) => {
  // other methods are mouse click, touch etc. whenever person put finger on key so keydown method will work
  switch (
    event.code // switch is same as if else conditions
  ) {
    // using code = keyH it will work same as lowercase & uppercase. If you will use Key = H / h so you have to click capslock for capital H
    case "KeyW":
      //console.log('w was pressed')
      keys.w.pressed = true;
      break;
    case "KeyA":
      //console.log('a was pressed')
      keys.a.pressed = true;
      break;
    case "KeyD":
      //console.log('d was pressed')
      keys.d.pressed = true;
      break;
    case "Space":
      projectiles.push(
        new Projectile({
          //Spawning shoots from tip of projectile
          position: {
            x: player.position.x + Math.cos(player.rotation) * 30,
            y: player.position.y + Math.sin(player.rotation) * 30,
          },
          velocity: {
            x: Math.cos(player.rotation) * PROJECTILE_SPEED,
            y: Math.sin(player.rotation) * PROJECTILE_SPEED,
          },
        })
      );
      break;
  }
});

// Method for calling Keyup when u will stop pressing key spacesip will stop moving
window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "KeyW":
      keys.w.pressed = false;
      break;
    case "KeyA":
      keys.a.pressed = false;
      break;
    case "KeyD":
      keys.d.pressed = false;
      break;
  }
});
