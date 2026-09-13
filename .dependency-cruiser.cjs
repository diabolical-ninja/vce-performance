module.exports = {
  forbidden: [
    {
      name: "no-circular-dependencies",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "no-upward-shared-imports",
      severity: "error",
      from: { path: "^src/shared/" },
      to: { path: "^src/(app|features|components|lib)/" },
    },
    {
      name: "no-feature-to-app-imports",
      severity: "error",
      from: { path: "^src/features/" },
      to: { path: "^src/app/" },
    },
    {
      name: "no-cross-feature-imports",
      severity: "error",
      from: { path: "^src/features/([^/]+)/" },
      to: { path: "^src/features/([^/]+)/" },
    },
    {
      name: "client-components-avoid-server-only-modules",
      severity: "error",
      from: { path: "^src/(components|features)/" },
      to: {
        path: "(^server-only$|^node:fs$|^node:child_process$|^node:net$|^node:tls$)",
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.(test|spec|stories)\\.(ts|tsx)$" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
  },
};
