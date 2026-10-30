import Ascii from "./entities/Ascii";
import Fish from "./entities/Fish";
import Lilypad from "./entities/Lilypad";
import Ripples from "./entities/Ripple";
import ThePlane from "./entities/ThePlane";
import type GlobalContext from "./framework/GlobalContext";

function createScene(globalContext: GlobalContext) {
  const ripples = new Ripples(globalContext);

  const lilypad1 = new Lilypad(globalContext);
  lilypad1.rotation = 0;
  lilypad1.scale.x = 0.4;
  lilypad1.scale.y = 0.4;

  const lilypad2 = new Lilypad(globalContext);
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

  return {
    ascii,
    thePlane,
    fish,
    ripples,
    lilypads: [lilypad1, lilypad2]
  };
}

export default createScene;
