echo "build hsr-browser"
npx tsc -b packages/hsr-browser
echo "build hsr-browser-rpc"
npx tsc -b packages/hsr-browser-rpc
echo "build hsr-node"
npx tsc -b packages/hsr-node
echo "build hsr-node-rpc"
npx tsc -b packages/hsr-node-rpc
echo "build hsr-node-typescript"
npx tsc -b packages/hsr-node-typescript
echo "build hsr-tests"
npx tsc -b tests/hsr-tests

cp packages/hsr-browser/package.json dist/hsr-browser/package.json
cp packages/hsr-browser-rpc/package.json dist/hsr-browser-rpc/package.json
cp packages/hsr-node/package.json dist/hsr-node/package.json
cp packages/hsr-node-rpc/package.json dist/hsr-node-rpc/package.json
cp packages/hsr-node-typescript/package.json dist/hsr-node-typescript/package.json
