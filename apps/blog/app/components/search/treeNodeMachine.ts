import { createMachine } from "xstate";

export const treeNodeMachine = createMachine({
  id: "treeNode",
  initial: "visible",
  states: {
    visible: {}, // later: expanded/collapsed/etc
  },
});
