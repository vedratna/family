import rootConfig from "../../eslint.config.mjs";
import boundaries from "eslint-plugin-boundaries";

export default [
  ...rootConfig,
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "domain", pattern: "src/domain/**" },
        { type: "use-cases", pattern: "src/use-cases/**" },
        { type: "repositories-interfaces", pattern: "src/repositories/interfaces/**" },
        { type: "repositories-dynamodb", pattern: "src/repositories/dynamodb/**" },
        { type: "handlers", pattern: "src/handlers/**" },
        { type: "shared", pattern: "src/shared/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "disallow",
          rules: [
            {
              from: "domain",
              allow: [],
            },
            {
              from: "repositories-interfaces",
              allow: ["domain"],
            },
            {
              from: "use-cases",
              allow: ["domain", "repositories-interfaces", "shared"],
            },
            {
              from: "repositories-dynamodb",
              allow: ["domain", "repositories-interfaces"],
            },
            {
              from: "handlers",
              allow: [
                "use-cases",
                "domain",
                "shared",
                "repositories-interfaces",
                "repositories-dynamodb",
              ],
            },
            {
              from: "shared",
              allow: ["domain"],
            },
          ],
        },
      ],
    },
  },
];
