const loadGruntTasks = require("load-grunt-tasks");

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
  });

  grunt.registerTask(
    "build",
    [
      "ts:lib",
    ],
  );

  grunt.registerTask("default", ["build"]);
};
