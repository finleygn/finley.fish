import { AutonomousSmoothValue, lerp } from "@fishley/wwwgraphics/animation";
import { renderLoop } from "@fishley/wwwgraphics/app";
import { MousePositionTracker } from "@fishley/wwwgraphics/interaction";
import imageAsciiCharset from "./assets/ascii.png";
import imageLilypad from "./assets/lilypad.png";
import { appCanvas } from "./element";
import Ascii from "./entities/Ascii";
import Fish from "./entities/Fish";
import Lilypad from "./entities/Lilypad";
import Ripples from "./entities/Ripple";
import GlobalContext from "./framework/GlobalContext";
import { createWebGLInstance, loadTexture } from "./framework/webgl";
import FrameBuffer from "./framework/FrameBuffer";
import ThePlane from "./entities/ThePlane";
import Mat4, { from_vec2, identity, invert, multiply, rotate, scale, to_vec2, transformPoint, translate } from "./math/Mat4";
import { Vec2 } from "@fishley/wwwgraphics/math";

const gl = createWebGLInstance(appCanvas);
gl.clearColor(0,0,0,1); 



const initialPosition = { x: 0.5, y: 0.5 };
const cursorTrailPosition = {
    x: new AutonomousSmoothValue(initialPosition.x, 0.08),
    y: new AutonomousSmoothValue(initialPosition.y, 0.08),
}
const tracker = new MousePositionTracker(initialPosition.x, initialPosition.y, document.body);


// astro resolves src/ image imports to ImageMetadata rather than a bare url
const texture_charset = loadTexture(gl, imageAsciiCharset.src);
const texture_lilypad = loadTexture(gl, imageLilypad.src);

const globalContext = new GlobalContext(gl, appCanvas);
const ripples = new Ripples(globalContext);

const lilypad1 = new Lilypad(globalContext);
const lilypad1position_x = 1;
const lilypad1position_y = -0.5;
lilypad1.rotation = 0;
lilypad1.scale.x = 1;
lilypad1.scale.y = 1;

const lilypad2 = new Lilypad(globalContext);
const lilypad2position_x = 0.8;
const lilypad2position_y = 0.5;
lilypad2.rotation = -4;
lilypad2.scale.x = 0.6;
lilypad2.scale.y = 0.6;

const fish = [
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
    Fish.randomFish(globalContext),
].sort((a, b) => a.depth - b.depth);
const ascii = new Ascii(globalContext);

const thePlane = new ThePlane(globalContext);
//


const maskFrameBuffer = new FrameBuffer(gl, appCanvas.width, appCanvas.height);
const asciiFrameBuffer = new FrameBuffer(gl, appCanvas.width, appCanvas.height);

//

let renderMask = false;
window.addEventListener("keydown", (e) => {
    if (e.key === " ") {
        renderMask = !renderMask;
    }
});


window.addEventListener("mousedown", (e) => {
  const rect = appCanvas.getBoundingClientRect();
  const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ndcY = 1 - ((e.clientY - rect.top) / rect.height) * 2;

  const inv = new Mat4();
  multiply(inv, globalContext.perspectiveProjection);
  multiply(inv, thePlane.modelMatrix);
  if (!invert(inv, inv)) return;

  const near = transformPoint(inv, ndcX, ndcY, -1);
  const far = transformPoint(inv, ndcX, ndcY, 1);

  // intersect the ray with the curved surface from object.vert.glsl: z = -(x² + y²)
  const dx = far[0] - near[0];
  const dy = far[1] - near[1];
  const dz = far[2] - near[2];
  const a = dx * dx + dy * dy;
  const b = 2 * (near[0] * dx + near[1] * dy) + dz;
  const c = near[0] * near[0] + near[1] * near[1] + near[2];

  let t: number;
  if (Math.abs(a) < 1e-9) {
    t = -c / b;
  } else {
    const disc = b * b - 4 * a * c;
    if (disc < 0) return;
    const sq = Math.sqrt(disc);
    const t0 = (-b - sq) / (2 * a);
    const t1 = (-b + sq) / (2 * a);
    // nearest hit in front of the camera
    t = t0 >= 0 ? Math.min(t0, t1 >= 0 ? t1 : t0) : t1;
  }
  if (!(t >= 0)) return;

  const localX = near[0] + dx * t;
  const localY = near[1] + dy * t;

  const aspect = appCanvas.clientWidth / appCanvas.clientHeight;

  const p = new Vec2(localX * 2 * aspect, localY * 2);

  ripples.createRipple(p, 0, 1);
  ripples.createRipple(p, 0.1, 0.6);
  ripples.createRipple(p, 0.4, 0.2);
});

const SCALE = 3;







renderLoop(
    (frame) => {
        globalContext.update(frame.dt);

 
        cursorTrailPosition.x.target = tracker.x;
        cursorTrailPosition.y.target = tracker.y;

        // Slowly approach the mouse position
        cursorTrailPosition.x.tick(frame.dt);
        cursorTrailPosition.y.tick(frame.dt);

        // globalContext.projection.translate(
        //     new Vec2(
        //         cursorTrailPosition.x.value * 0.1,
        //         -cursorTrailPosition.y.value * 0.1,
        //     ),
        // );

        // Resolution updates
        // const resolutionMultiple = Math.max(
        //   appCanvas.clientWidth / CHAR_SIZE,
        //   appCanvas.clientHeight / CHAR_SIZE
        // ) / Math.max(appCanvas.clientWidth, appCanvas.clientHeight);
        const width = appCanvas.clientWidth;
        const height = appCanvas.clientHeight;
        gl.canvas.width = width * window.devicePixelRatio;
        gl.canvas.height = height * window.devicePixelRatio;

        identity(thePlane.modelMatrix);
        translate(thePlane.modelMatrix, [0, 0, -2])
        rotate(thePlane.modelMatrix, 0.5, [
            lerp(-0.2, 0, cursorTrailPosition.y.value),
            lerp(-0.4, -0.15, cursorTrailPosition.x.value),
            0
        ])
        scale(thePlane.modelMatrix, [SCALE, SCALE, 1])

        lilypad2.position.x = lilypad2position_x + Math.sin(frame.elapsed) * 0.01;
        lilypad2.position.y = lilypad2position_y + Math.sin(frame.elapsed) * 0.05;


        lilypad1.position.x = lilypad1position_x + Math.sin(frame.elapsed) * 0.01;
        lilypad1.position.y = lilypad1position_y + Math.sin(frame.elapsed) * 0.05;


        // Draw elements

        // Draw mask

        for (const f of fish) {
            f.update(frame.dt);
        }
        
        maskFrameBuffer.setTextureDimensions(appCanvas.width, appCanvas.height)
        asciiFrameBuffer.setTextureDimensions(appCanvas.width, appCanvas.height)

        // draw black and white
        maskFrameBuffer.draw(() => {
            for (const f of fish) {
                f.draw();
            }

            ripples.draw();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture_lilypad);
            
            lilypad1.draw();
            lilypad2.draw();
        })

        // draw ascii        
        asciiFrameBuffer.draw(() => {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, maskFrameBuffer.outputTexture);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, texture_charset);

            gl.clear(gl.COLOR_BUFFER_BIT);
            ascii.draw();
        })


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, asciiFrameBuffer.outputTexture);

        
        

        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        thePlane.draw()

        gl.clearColor(0, 0, 0, 1);


        // draw to rotated plane

    

        
    },
    { longestFrame: 1000 / 60 },
);
