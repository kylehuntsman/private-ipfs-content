import process from "process";
const { sleep } = require("./util");
const IPFS = require("./ipfs-wrapper");
import { CID } from "multiformats/cid";
import PeerId from "peer-id";
import { makeAuthServer } from "./server";
import { IPFS as IPFSCore } from "ipfs-core";
import globSource from "ipfs-utils/src/files/glob-source.js";
import all from "it-all";

const PORT = 8181;

const main = async () => {
  // Create the node
  const ipfsNode: IPFSCore = await IPFS.create();

  const result = await all(ipfsNode.addAll(globSource("./", "demo/**/*")));
  console.log("result:", result);

  // Add content to the node
  const { cid: cid1 } = await ipfsNode.add({
    content: `dear diary, today I feel d9db4b4b-1c1e-4553-81d9-4422db2508bc ${Date.now()}`,
  }); // QmUBpaezsejgC7MTS9Ay8wJVstJ4WEoicQdjm3v25QmfZP
  const { cid: cid2 } = await ipfsNode.add({
    content: `Script: Toy Story 9817231231 ${Date.now()}`,
  });

  console.log("cid1:", cid1.toString());
  console.log("cid2:", cid2.toString());

  console.log("---- test connecting with another peer: ----");
  // @ts-ignore
  ipfsNode.libp2p.multiaddrs.forEach((addr) => {
    // @ts-ignore
    const peerID = ipfsNode.libp2p.peerId.toB58String()
    console.log(
      `$ npm run peer ${addr.toString()}/p2p/${peerID} ${cid1.toString()}`
    );
  });

  // Whitelisting

  // Create whitelist and add CIDs to whitelist
  const cidWhitelist = new Map();

  cidWhitelist.set(cid1.toString(), new Set());

  // Register a bitswap block:get handler that interceps the request and determines if the node will give the block to it's peer
  // @ts-ignore
  ipfsNode.bitswap.register(
    "block:get",
    ({ cid, peerId }: { cid: CID; peerId: PeerId }) => {
      console.log(cid, typeof cid);
      // @ts-ignore
      const cidStr = cid.toString();
      const peerStr = peerId.toB58String();

      console.log(`peer: ${peerStr} tries to acces ${cidStr}`);

      console.log("cidWhitelist:", cidWhitelist);
      const hasCID = cidWhitelist.has(cidStr);

      if (!hasCID) {
        return true; // public by default
      }

      const peerIsAllowed = cidWhitelist.get(cidStr)?.has(peerStr) || false;

      console.log("Does whitelist have cid?", hasCID);
      console.log("Does whitelist have peerId?", peerIsAllowed);

      if (!peerIsAllowed) {
        console.log(`${peerStr} tried to access a private file ${cidStr},`);
        console.log(
          `visit: http://localhost:${PORT}/allow?cid=${cidStr}&addr=${peerStr} to give them access.`
        );
      }

      return peerIsAllowed;
    }
  );

  // Create our authorization UI
  const server = makeAuthServer(cidWhitelist);
  server.listen(PORT);

  // Clean up behing us
  const stop = async () => {
    await ipfsNode.stop();
    // @ts-ignore
    await ipfsNode.libp2p.stop();
    console.log("stopped");
    await new Promise((resolve) => server.close(resolve));
    process.exit(0);
  };

  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  await sleep(3000);
};

main();
