declare const _default: {
    preset: string;
    testEnvironment: string;
    extensionsToTreatAsEsm: string[];
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': string;
    };
    transform: {
        '^.+\\.tsx?$': (string | {
            useESM: boolean;
        })[];
    };
};
export default _default;
//# sourceMappingURL=jest.config.d.ts.map