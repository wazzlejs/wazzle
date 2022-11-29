
var config = {
    verbose: true,
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    testPathIgnorePatterns: ["/lib/", "/esm/"]
};
export default config;
