const { sleep } = require('./util');
const { CID } = require('multiformats/cid');
const IPFS = require('./ipfs-wrapper');

async function main() {
  // Create the node
  const ipfsNode = await IPFS.create();

  // Add content to the node
  const { cid: cid1 } = await ipfsNode.add({ content: 'd9db4b4b-1c1e-4553-81d9-4422db2508bc'}); // QmUBpaezsejgC7MTS9Ay8wJVstJ4WEoicQdjm3v25QmfZP
  const { cid: cid2 } = await ipfsNode.add({ content: 'f8e7f745-6567-4a8f-b2fa-f13a6133d9eb'}); // QmTuTjgZvd5pY1iesPaEwuYJWAJ7h4M6Bu36N1xDU5Wpfi
  console.log(`Public CID:`, cid1);
  console.log(`Private CID:`, cid2);

  // Whitelisting

  // Create whitelist and add CIDs to whitelist
  const cidWhitelist = new Map();
  cidWhitelist.set('QmTuTjgZvd5pY1iesPaEwuYJWAJ7h4M6Bu36N1xDU5Wpfi', new Set());

  // Register a bitswap block:get handler that interceps the request and determines if the node will give the block to it's peer
  ipfsNode.bitswap.register('block:get', ({ cid, peerId }) => {
    const cidStr = cid.toString();
    console.log('Does whitelist have cid?', cidWhitelist.has(cidStr));
    if(!cidWhitelist.has(cidStr)) return true;
    
    const allowedPeers = cidWhitelist.get(cidStr) ?? new Set();
    console.log('Does whitelist have peerId?', allowedPeers.has(peerId.toB58String()));
    return allowedPeers.has(peerId);
  });

  const stop = async () => {
    await ipfsNode.stop();
    console.log("stopped");
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  await sleep(3000);
}

main();