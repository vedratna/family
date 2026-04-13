import type { SerializedTree } from "../../../backend/src/use-cases/tree/build-family-tree";

export const MOCK_FAMILY_TREE: SerializedTree = {
  nodes: [
    {
      personId: "person-grandma",
      name: "Grandma Mouse",
      hasAppAccount: true,
      generation: 0,
      spouseIds: [],
      childIds: ["person-rajesh", "person-sunita"],
      parentIds: [],
    },
    {
      personId: "person-rajesh",
      name: "Mickey Mouse",
      hasAppAccount: true,
      generation: 1,
      spouseIds: ["person-priya"],
      childIds: ["person-amit"],
      parentIds: ["person-grandma"],
    },
    {
      personId: "person-priya",
      name: "Minnie Mouse",
      hasAppAccount: true,
      generation: 1,
      spouseIds: ["person-rajesh"],
      childIds: ["person-amit"],
      parentIds: [],
    },
    {
      personId: "person-sunita",
      name: "Daisy Duck",
      hasAppAccount: false,
      generation: 1,
      spouseIds: [],
      childIds: [],
      parentIds: ["person-grandma"],
    },
    {
      personId: "person-amit",
      name: "Donald Duck",
      hasAppAccount: true,
      generation: 2,
      spouseIds: [],
      childIds: [],
      parentIds: ["person-rajesh", "person-priya"],
    },
  ],
  rootIds: ["person-grandma"],
  generations: 3,
};
