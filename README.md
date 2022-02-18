# Private/Whitelisted Content on IPFS

## Setup

We are patching a part of the ipfs-core stack to demo our experiments.

```
yarn install
git status # check the node_modules/ipfs-bitswap/cjs/src/decision-engine/index.js is not changed, that should be a patch version with a MAGIC variable.
```

## Running

Run the following command to run the main node. It will print out the command to test the other side.

```
$ yarn run main

...
---- test connecting with another peer: ----
$ npm run peer /ip4/127.0.0.1/tcp/55532/p2p/QmQQB5MDKat7GLgjNvA7NQXDxpjZ9CvvvHWKAHbv18ewmU QmTdVqWgrBMDdGdLJargx5FHvWHW7SzSLtnGjn1tKNjdoz
...
```

Then run the other peer command.

It will try to access the data and fail:

```
$ npm run peer /ip4/127.0.0.1/tcp/55532/p2p/QmQQB5MDKat7GLgjNvA7NQXDxpjZ9CvvvHWKAHbv18ewmU QmTdVqWgrBMDdGdLJargx5FHvWHW7SzSLtnGjn1tKNjdoz

...
---- trying to load: QmTdVqWgrBMDdGdLJargx5FHvWHW7SzSLtnGjn1tKNjdoz ----
---- could not retrieve file, giving up... ----
...
```

The main node will print a message with an address to give access to this node

```
...
NODE_ID tried to access a private file CID,
visit: http://localhost:8181/allow?cid=QmTdVqWgrBMDdGdLJargx5FHvWHW7SzSLtnGjn1tKNjdoz&addr=12D3KooWHUwkRj59EEGFhNHCMiSZG52ki27ve3JMHHwJTbnTGqPk to give them access.
...
```

If you visit this webpage, you will see the "access enable" message, then you can run the npm peer command again. Now the peer has access!

```
---- trying to load: QmTdVqWgrBMDdGdLJargx5FHvWHW7SzSLtnGjn1tKNjdoz ----
---- Here is the file! ----
>>> QmTdVqWgrBMDdGdLJargx5FHvWHW7SzSLtnGjn1tKNjdoz000644 000000 000000 00000000113 14203667502 017365 0ustar00000000 000000
>>> dear diary, today I feel d9db4b4b-1c1e-4553-81d9-4422db2508bc 1645178536046
>>>
>>>
---- Load complete! ----
```