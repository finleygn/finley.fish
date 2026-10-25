import { AutonomousSmoothValue } from "@fishley/wwwgraphics/animation";
import { lerp } from "@fishley/wwwgraphics/math";
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
import Mat4, * as mat4 from "@fishley/wwwgraphics/math/mat4";
import Vec2 from "@fishley/wwwgraphics/math/vec2";
import Vec3, * as vec3 from "@fishley/wwwgraphics/math/vec3";

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
const lilypad1position_x = -0.3;
const lilypad1position_y = -0.5;
lilypad1.rotation = 0;
lilypad1.scale.x = 0.4;
lilypad1.scale.y = 0.4;

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


export function transformPoint(m: Mat4, x: number, y: number, z: number): Vec3 {
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return new Vec3(
    (m[0] * x + m[4] * y + m[8] * z + m[12]) / w,
    (m[1] * x + m[5] * y + m[9] * z + m[13]) / w,
    (m[2] * x + m[6] * y + m[10] * z + m[14]) / w,
  );
}

window.addEventListener("mousedown", (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = 1 - (e.clientY / window.innerHeight) * 2;

  const inv = new Mat4();
  mat4.multiply(inv, globalContext.perspectiveProjection);
  mat4.multiply(inv, thePlane.modelMatrix);
  if (!mat4.invert(inv)) return;

  // get point in the planes local space
  const near = transformPoint(inv, x, y, -1);
  const far = transformPoint(inv, x, y, 1);
  
  // How how from the near plane to the_plane. works because plane is always at z=0
  const d = vec3.direction(near, far);
  const t = -near.z / d.z;
  const distance = vec3.multiplyScalar(vec3.from(d), t);

  const intersect = vec3.add(
    vec3.from(near),
    distance
 );
 
 // to -1 - 1 space
 vec3.multiplyScalar(intersect, 2);

  const p = new Vec2(intersect.x, intersect.y);

  ripples.createRipple(p, 0, new Vec2(1, 1));
  ripples.createRipple(p, 0.1, new Vec2(0.6, 0.6));
  ripples.createRipple(p, 0.4, new Vec2(0.2, 0.2));
});

const SCALE = 2;
const PLANE_OFFSET = new Vec3(0, 0, -2);
const PLANE_SCALE = new Vec3(1, 1, 1);
// Bottom edge of the plane, which is the edge closest to the camera once it tilts back
const PLANE_PIVOT = new Vec3(0, -1 / 2, 0);
const PLANE_PIVOT_INVERSE = new Vec3(0, 1 / 2, 0);
const planeRotationAxis = new Vec3(0, 0, 0);



renderLoop(
    (frame) => {
        globalContext.update(frame.dt);

 
        cursorTrailPosition.x.target = tracker.x;
        cursorTrailPosition.y.target = tracker.y;

        // Slowly approach the mouse position
        cursorTrailPosition.x.tick(frame.dt);
        cursorTrailPosition.y.tick(frame.dt);

        const width = appCanvas.clientWidth;
        const height = appCanvas.clientHeight;
        gl.canvas.width = width * window.devicePixelRatio;
        gl.canvas.height = height * window.devicePixelRatio;

        mat4.identity(thePlane.modelMatrix);
        mat4.translate(thePlane.modelMatrix, PLANE_OFFSET);
        // planeRotationAxis.y = lerp(-0.01, 0.01, cursorTrailPosition.x.value);
        // planeRotationAxis.x = lerp(-1, -0.7, cursorTrailPosition.y.value);

        // Rotate around the near edge rather than the centre
        // mat4.translate(thePlane.modelMatrix, PLANE_PIVOT);
        // mat4.rotate(
        //     thePlane.modelMatrix,
        //     lerp(Math.PI/2, -1, cursorTrailPosition.y.value),
        //     { x: -1, y: 0, z: 0 }
        // );
        // mat4.translate(thePlane.modelMatrix, PLANE_PIVOT_INVERSE);

        // mat4.scale(thePlane.modelMatrix, PLANE_SCALE);

        lilypad2.position.x = lilypad2position_x + Math.sin(frame.elapsed) * 0.01;
        lilypad2.position.y = lilypad2position_y + Math.sin(frame.elapsed) * 0.05;


        lilypad1.position.x = lilypad1position_x + Math.sin(frame.elapsed) * 0.01;
        lilypad1.position.y = lilypad1position_y + Math.sin(frame.elapsed) * 0.05;


        // Draw elements

        // Draw mask

        for (const f of fish) {
            f.update(frame.dt);
        }
        
        // The plane is square, so render the mask and ascii square too or they get stretched onto it
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
            
            // lilypad1.draw();
            // lilypad2.draw();
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

        
        

        // gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        thePlane.draw()

        gl.clearColor(0, 0, 0, 1);


        // draw to rotated plane

    

        
    },
    { longestFrame: 1000 / 60 },
);
