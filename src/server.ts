import http from "http";
import url from "url";

export const respond = (
  res: http.ServerResponse,
  status: number,
  payload: any
): void => {
  res.writeHead(status, {
    "Content-Type": "text/javascript",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload, undefined, 2));
  return;
};

export const FiveHundredOnError = (
  f: http.RequestListener
): http.RequestListener => {
  return async (req, res) => {
    try {
      await f(req, res);
    } catch (error: any) {
      console.error(error);
      const code = error.code || undefined;
      return respond(res, 500, { error: `${error}`, code });
    }
  };
};

export const makeAuthServer = (
  whitelist: Map<string, Set<string>>
): http.Server => {
  const requestListener: http.RequestListener = FiveHundredOnError(
    async (req, res) => {
      const parsed = url.parse(req.url || "", true);
      // console.log("url:", req.url, parsed);
      const pathname = parsed.pathname;

      if (pathname === "/allow") {
        const { cid, addr } = parsed.query;

        if (typeof cid !== "string" || typeof addr !== "string") {
          return respond(res, 400, { error: "invalid addr or cid" });
        }

        if (!whitelist.has(cid)) {
          whitelist.set(cid, new Set());
        }

        whitelist.get(cid)!.add(addr);
        console.log(`peer ${addr} was allowed access to ${cid}`);
        return respond(res, 200, { status: "allowed", addr, cid });
      } else {
        return respond(res, 404, { error: `Unknown path: ${pathname}` });
      }
    }
  );

  const server = http.createServer(requestListener);
  // server.listen(9090);
  return server;
};
