console.log(`Laya setup is intentionally explicit and does not modify the upstream repository.

1. Export a local ONNX bundle using the upstream laya-ts instructions.
2. Build laya-ts in the separate read-only checkout or use an existing installed laya-ts package.
3. Set LAYA_MODEL_DIR to the exported bundle directory.
4. Set LAYA_TS_MODULE to the absolute path of laya-ts/dist/index.js.
5. Start the lab with pnpm dev.

Until both variables are set, the Laya panel reports NOT_CONFIGURED.`);
