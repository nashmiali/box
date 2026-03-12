import express from "express";
import { createServer as createViteServer } from "vite";
import { Readable } from "stream";

// Allow self-signed certificates for Xtream Codes servers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy route for Xtream API
  app.all("/api/proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }

      let targetUrlObj;
      try {
        targetUrlObj = new URL(targetUrl);
      } catch (e) {
        return res.status(400).json({ error: "Invalid url parameter" });
      }

      // Remove url from query params to forward the rest
      const { url, ...queryParams } = req.query;
      
      Object.entries(queryParams).forEach(([key, value]) => {
        targetUrlObj.searchParams.append(key, value as string);
      });

      const response = await fetch(targetUrlObj.toString(), {
        method: req.method,
        headers: {
          "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      // Forward status and headers
      res.status(response.status);
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });

      // Pipe the response body
      if (response.body) {
        // @ts-ignore - Readable.fromWeb is available in Node 18+ but might not be in types
        const nodeStream = Readable.fromWeb(response.body);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Proxy request failed" });
    }
  });

  // Proxy route for video streams to bypass Mixed Content
  app.get("/api/stream", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).send("Missing url parameter");
      }

      let targetUrlObj;
      try {
        targetUrlObj = new URL(targetUrl);
      } catch (e) {
        return res.status(400).send("Invalid url parameter");
      }

      const headers: Record<string, string> = {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Connection": "keep-alive"
      };

      // Forward Range header for VOD seeking
      if (req.headers.range) {
        headers["Range"] = req.headers.range;
      }

      const response = await fetch(targetUrlObj.toString(), {
        headers,
        redirect: 'follow'
      });

      if (!response.ok) {
        console.error(`Proxy failed for ${targetUrl}: ${response.status} ${response.statusText}`);
        // If 456, it might be a max connections or blocked UA issue
        if (response.status === 456) {
           console.error("Error 456: This usually means the IPTV account has reached its maximum allowed connections, or the stream format is not supported.");
        }
        return res.status(response.status).send(response.statusText);
      }

      // Forward headers
      response.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        // Don't forward content-encoding as we might be decoding it
        if (lowerKey !== 'content-encoding') {
          res.setHeader(key, value);
        }
      });

      // Set CORS headers just in case
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Use the final URL after redirects for base URL calculation
      const finalUrl = response.url || targetUrl;

      // If it's an m3u8 playlist, rewrite URIs
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('mpegurl') || contentType.includes('application/vnd.apple.mpegurl') || finalUrl.includes('.m3u8')) {
        const text = await response.text();
        const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);
        const urlObj = new URL(finalUrl);
        const origin = urlObj.origin;
        
        const rewrittenText = text.split('\n').map(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            let absoluteUri = trimmed;
            if (!trimmed.startsWith('http')) {
              if (trimmed.startsWith('/')) {
                absoluteUri = origin + trimmed;
              } else {
                absoluteUri = baseUrl + trimmed;
              }
            }
            return `/api/stream?url=${encodeURIComponent(absoluteUri)}`;
          }
          return line;
        }).join('\n');
        
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        // Remove content-length as we modified the body
        res.removeHeader('content-length');
        return res.send(rewrittenText);
      }

      // For TS segments or MP4 files, pipe the stream
      if (response.body) {
        // @ts-ignore
        const nodeStream = Readable.fromWeb(response.body);
        
        req.on('close', () => {
          nodeStream.destroy();
        });

        nodeStream.on('error', (err: any) => {
          console.error("Stream piping error:", err);
          if (!res.headersSent) {
            res.status(500).end();
          } else {
            res.end();
          }
        });

        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error("Stream proxy error:", error);
      if (!res.headersSent) {
        res.status(500).send("Stream proxy failed");
      } else {
        res.end();
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
