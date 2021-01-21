const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const elementsToRender = [];

const PlayerSize = 30; // Wielkosc gracza
const PlayerColor = '#8cb3da'; // Kolor gracza
const PlayerMaxSpeed = 1.5; // Maksymalna predkosc gracza
const EndColor = '#e91e63'; // Kolor konca gry
const PadColor = '#545c63'; // Kolor miejsc poczatkowych i koncowych
const HoleCount = 50; // Liczba dziur

const player = new Player(window.innerWidth / 2, window.innerHeight - PlayerSize * 2);

const overlay = document.getElementById('overlay');
const timer = document.getElementById('timer');

let TimeStarted;
let GameStarted = false;
let GameEnded = undefined;
let EndAnimationFrames = 0;
let MaxAnimationFrames = 120; // 120 klatek koncowych (ok 2 sek przy 60fps)

document.getElementById('start').onclick = function () {
  GameStarted = true;
  TimeStarted = new Date();
  timer.style.display = 'block';
  document.getElementById('start').style.display = overlay.style.display = 'none';
};

generateHoles();

function render() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Start + end pads
  drawCircle(window.innerWidth / 2, 0, 150, ctx, PadColor);
  drawCircle(window.innerWidth / 2, window.innerHeight, 150, ctx, PadColor);

  drawCircle(window.innerWidth / 2, PlayerSize * 2, PlayerSize + 10, ctx, EndColor);

  for (let element of elementsToRender) {
    element.renderMe(ctx);
  }

  if (!!GameEnded && ++EndAnimationFrames <= MaxAnimationFrames) {
    player.x = player.x + (EndAnimationFrames / MaxAnimationFrames) * (GameEnded.x - player.x);
    player.y = player.y + (EndAnimationFrames / MaxAnimationFrames) * (GameEnded.y - player.y);
  }
  player.renderMe(ctx);

  if (GameStarted) {
    timer.innerText = calculateTime();
  }

  window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);

function calculateTime() {
  const time = new Date().getTime() - TimeStarted.getTime();
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time - minutes * 60000) / 1000);
  const ms = Math.floor((time - minutes * 60000 - seconds * 1000) / 10);
  return ('' + minutes).padStart(2, '0') + ':' + ('' + seconds).padStart(2, '0') + ':' + ('' + ms).padStart(2, '0');
}

function generateHoles() {
  for (let i = 0; i < HoleCount; i++) {
    const holeSize = PlayerSize + Math.random() * 30;
    const coords = generateCoords(holeSize);
    if (coords[0] != -1) elementsToRender.push(new Hole(coords[0], coords[1], holeSize));
  }
}

function generateCoords(size) {
  let x = -1,
    y = -1;
  let counter = 0;
  do {
    x = Math.random() * window.innerWidth;
    y = Math.random() * window.innerHeight;
    if (++counter >= 100) break; // only allow 100 searches
  } while (!nothingIsNear(x, y, size));
  if (nothingIsNear(x, y, size)) return [x, y];
  else return [-1, -1];
}

function nothingIsNear(x, y, size) {
  if (calculateDistance(x, y, window.innerWidth / 2, 0) < 150 + size || calculateDistance(x, y, window.innerWidth / 2, window.innerHeight) < 150 + size) return false;
  for (let element of elementsToRender) {
    if (calculateDistance(element.x, element.y, x, y) < element.radius + size + PlayerSize * 2) return false;
  }
  return true;
}

function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawCircle(x, y, radius, ctx, color = 'black') {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function endGame(win, goTo) {
  GameStarted = false;
  GameEnded = goTo;
  const gameended = document.getElementById('game-ended');
  overlay.style.display = gameended.style.display = 'block';
  timer.style.display = 'none';
  gameended.innerText = win ? 'Gratulacje, wygrałeś! Twój czas to: ' + calculateTime() : 'Niestety, przegrałeś..';
  player.movementVector = { x: 0, y: 0 };
  gameended.onclick = function () {
    location.reload();
  };
}

function Hole(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.renderMe = (ctx) => {
    drawCircle(this.x, this.y, this.radius, ctx);
  };
}

function Player(x, y) {
  this.x = x;
  this.y = y;
  this.movementVector = { x: 0, y: 0 };
  window.addEventListener(
    'deviceorientation',
    (event) => {
      if (GameStarted) {
        const dir = event.alpha * -1;
        const str = (Math.abs(Math.abs(event.beta) - 90) / 90) * PlayerMaxSpeed;
        this.movementVector = { x: Math.cos(dir / 45 - Math.PI / 2) * str, y: Math.sin(dir / 45 - Math.PI / 2) * str };
      }
    },
    true
  );

  this.renderMe = (ctx) => {
    if (GameStarted) {
      if (calculateDistance(this.x, this.y, window.innerWidth / 2, PlayerSize * 2) <= PlayerSize * 2 + 10) {
        endGame(true, { x: window.innerWidth / 2, y: PlayerSize * 2 });
      } else {
        for (const element of elementsToRender) {
          if (calculateDistance(this.x, this.y, element.x, element.y) <= PlayerSize + element.radius) {
            endGame(false, { x: element.x, y: element.y });
            break;
          }
        }
      }
    }
    this.x = Math.max(PlayerSize, Math.min(window.innerWidth - PlayerSize, this.x + this.movementVector.x));
    this.y = Math.max(PlayerSize, Math.min(window.innerHeight - PlayerSize, this.y + this.movementVector.y));
    drawCircle(this.x, this.y, PlayerSize, ctx, PlayerColor);
  };
}
