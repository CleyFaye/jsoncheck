const loadGruntTasks = require("load-grunt-tasks");
const {readFileSync} = require("fs");

const getLicenseJS = () => [
  "/**",
  " * @preserve",
  " * @license",
  ...readFileSync("./LICENSE", "utf8")
    .split("\n")
    .map(c => ` * ${c}`),
  " */",
].join("\n");

const LIB_DIR = "lib";

// eslint-disable-next-line max-lines-per-function
module.exports = grunt => {
  loadGruntTasks(grunt);
  grunt.initConfig({
    "clean": {
      cache: [
        "**/.cache",
        ".tsbuildinfo",
        ".tscache",
      ],
      build: [
        LIB_DIR,
      ],
    },
    "ts": {
      "lib": {
        tsconfig: {
          tsconfig: "./",
          passThrough: true,
        },
      },
    },
    "usebanner": {
      options: {banner: getLicenseJS()},
      lib: {
        files: [{
          cwd: LIB_DIR,
          expand: true,
          src: ["**/*.js"],
        }],
      },
    },
  });

  grunt.registerTask(
    "build",
    [
      "ts:lib",
      "usebanner:lib",
    ],
  );

  grunt.registerTask("default", ["build"]);
};
