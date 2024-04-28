import Fish from "../Fish";

interface IFishStateBehaviour {
  frame?(dt: number, fish: Fish): void;
  cleanup?(fish: Fish): void;
}

export default IFishStateBehaviour; 