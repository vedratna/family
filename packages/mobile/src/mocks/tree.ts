import type { SerializedTree } from "../../../backend/src/use-cases/tree/build-family-tree";

export const MOCK_FAMILY_TREE: SerializedTree = {
  nodes: [
    { personId: "person-grandma", name: "Grandma Sharma", hasAppAccount: true, generation: 0, spouseIds: [], childIds: ["person-rajesh", "person-sunita"], parentIds: [] },
    { personId: "person-rajesh", name: "Rajesh Sharma", hasAppAccount: true, generation: 1, spouseIds: ["person-priya"], childIds: ["person-amit"], parentIds: ["person-grandma"] },
    { personId: "person-priya", name: "Priya Sharma", hasAppAccount: true, generation: 1, spouseIds: ["person-rajesh"], childIds: ["person-amit"], parentIds: [] },
    { personId: "person-sunita", name: "Sunita Sharma", hasAppAccount: false, generation: 1, spouseIds: [], childIds: [], parentIds: ["person-grandma"] },
    { personId: "person-amit", name: "Amit Sharma", hasAppAccount: true, generation: 2, spouseIds: [], childIds: [], parentIds: ["person-rajesh", "person-priya"] },
  ],
  rootIds: ["person-grandma"],
  generations: 3,
};
