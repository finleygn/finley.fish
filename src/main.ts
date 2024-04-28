import default_vertex_shader_src from './shader/default.vert.glsl?raw';
import bricks_frag_shader_src from './shader/bricks.frag.glsl?raw';
import Fish, { FishState } from './fish/Fish';
import Vector2 from './fish/Vector2';
import MousePositionTracker from './fish/MousePosition';

const mouseTracker = new MousePositionTracker();

/**
 * Fish setup
 */
const fishElement = <HTMLSpanElement>document.getElementsByClassName('fish')[0];
const fishIconElement = <HTMLSpanElement>document.getElementsByClassName('fish-icon')[0];
const addFishButton = <HTMLButtonElement>document.getElementById('add-fish');

if (!fishElement || !fishIconElement || !addFishButton) {
  throw new Error("No fish element found.");
}

const originalFish = new Fish(fishElement, fishIconElement, mouseTracker);
const fish = [originalFish];

addFishButton.onclick = (event) => {
  /**
   * Create Fish Element
   */
  const newFishContainer = document.createElement('span');
  const newFishIcon = document.createElement('span');
  newFishContainer.className = 'fish';
  newFishIcon.className = 'fish-icon';
  newFishContainer.style.top = `${Math.random() * window.innerHeight}px`;
  newFishContainer.style.left = `${Math.random() * window.innerWidth}px`;

  newFishIcon.innerText = "🐟";

  newFishContainer.appendChild(newFishIcon);
  document.body.prepend(newFishContainer);

  /**
   * Setup Fish State 
   */
  const newFish = new Fish(newFishContainer, newFishIcon, mouseTracker);
  // And point to the mouse position, as we can't get that without a mouse move event otherwise :(
  const lookDirection = new Vector2(event.pageX, event.pageY).direction(newFish.getPosition());
  newFish.setDirection(lookDirection);
  newFish.setVelocity(lookDirection);
  newFish.setState(FishState.CHASE);
  fish.push(newFish); // Add to the school c:
}

originalFish.onStateChange((state) => {
  if (state === FishState.ALERT) {
    setTimeout(() => {
      addFishButton.style.display = "block";
    }, 1000);
  }
})

/**
 * Background stuffs
 */
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
if (!canvas) throw new Error("No canvas found.");

const gl = canvas.getContext('webgl2');
if (!gl) throw new Error("WEBGL2 not supported.")

function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  throw new Error();
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program.");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
  throw new Error();
}



const vertexShader = createShader(gl, gl.VERTEX_SHADER, default_vertex_shader_src);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, bricks_frag_shader_src);

const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

const positionBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Full screen tri
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
    3, -1,
    -1, 3,
  ]),
  gl.STATIC_DRAW
);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(
  positionAttributeLocation,
  2,
  gl.FLOAT,
  false,
  0,
  0
);

const time0 = (new Date()).getTime();

const timeLocation = gl.getUniformLocation(program, "u_time");
const resolutionLocation = gl.getUniformLocation(program, "u_resolution");

gl.useProgram(program);
gl.bindVertexArray(vao);


/**
 * Canvas & Fish Updates...
 */
let lastFrameTime = Date.now();

const resizeAndDraw = () => {
  const currentTime = Date.now()
  let dt = currentTime - lastFrameTime;
  lastFrameTime = currentTime;

  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  const needResize = canvas.width != displayWidth || canvas.height != displayHeight;

  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform1f(timeLocation, (new Date()).getTime() - time0);
  gl.uniform2fv(resolutionLocation, [canvas.width, canvas.height]);

  // RUN HERE
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  for (const fishie of fish) {
    fishie.frame(dt, fish);
  }

  requestAnimationFrame(resizeAndDraw);
};


resizeAndDraw();
window.addEventListener('resize', resizeAndDraw);
