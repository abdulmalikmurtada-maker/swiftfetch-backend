const express = require("express");
const cors = require("cors");
const ytdlp = require("yt-dlp-exec");

const app = express();
const PORT = process.env.PORT || 3000;

// Allow requests from GitHub Pages (update YOUR_USERNAME below)
const allowedOrigins = [
  "https://abdulmalikmurtada-maker.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        callback(null, true);
      } else {
        callback(new Error("Ba a yarda da wannan tushen ba (CORS)"));
      }
    },
  })
);

app.use(express.json());

// ─── Health check ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SwiftFetch backend yana aiki ✅" });
});

// ─── Get video info (title, thumbnail, formats) ─────────────────
app.post("/info", async (req, res) => {
  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "URL ba daidai ba ce." });
  }

  try {
        // Tsari don gano wane cookie za a yi amfani da shi
        let cookieFile = "";
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
            cookieFile = "youtube_cookies.txt";
        } else if (url.includes("facebook.com") || url.includes("fb.watch")) {
            cookieFile = "facebook_cookies.txt";
        } else if (url.includes("tiktok.com")) {
            cookieFile = "tiktok_cookies.txt";
        } else if (url.includes("snapchat.com")) {
            cookieFile = "snapchat_cookies.txt";
        } else if (url.includes("twitter.com") || url.includes("x.com")) {
            cookieFile = "x-cookies.txt";
        } else if (url.includes("instagram.com")) {
            cookieFile = "instagram_cookies.txt";
        }

        // Haɗa tsarin yt-dlp
   // Hada tsarin yt-dlp
    const ytdlpOptions = {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        format: 'bv*+ba/b'
    };  // <--- WANNAN ALAMAR ITA TA BACE A LAYI NA 67

    // Idan akwai cookie din, a saka masa
    if (cookieFile !== "") {
            ytdlpOptions.cookies = cookieFile;
        }

        const info = await ytdlp(url, ytdlpOptions);

    // Build clean format list
    const formats = [];

    // Video + audio formats
const videoFormats = (info.formats || []).filter(
            (f) =>
            f.vcodec !== "none" &&
            f.acodec !== "none" && // <--- WANNAN LAYIN ZAI TABBATAR DA AKWAI SAUTI
            f.ext &&
            ["mp4", "webm"].includes(f.ext)
        );
    const seen = new Set();
    for (const f of videoFormats.sort(
      (a, b) => (b.height || 0) - (a.height || 0)
    )) {
      const key = `${f.height}p-${f.ext}`;
      if (!seen.has(key) && f.height) {
        seen.add(key);
        formats.push({
          formatId: f.format_id,
          label: `${f.height}p – ${f.ext.toUpperCase()}`,
          ext: f.ext,
          height: f.height,
          filesize: f.filesize || f.filesize_approx || null,
        });
      }
    }

    // Audio-only option
    const audioFormat = (info.formats || [])
      .filter((f) => f.vcodec === "none" && f.acodec !== "none")
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

    if (audioFormat) {
      formats.push({
        formatId: audioFormat.format_id,
        label: `Audio kawai – MP3`,
        ext: "mp3",
        height: null,
        filesize: audioFormat.filesize || audioFormat.filesize_approx || null,
      });
    }

    res.json({
      title: info.title,
      thumbnail: info.thumbnail,
      duration: info.duration,
      uploader: info.uploader,
      formats: formats.slice(0, 6), // max 6 options
    });
  } catch (err) {
    console.error("Info error:", err.message);
    res.status(500).json({
      error:
        "Ba a iya karbar bayanin bidiyo. Tabbatar URL daidai ce kuma bidiyon bai ɓoye ba.",
    });
  }
});

// ─── Download endpoint (streams video to client) ────────────────
app.get("/download", async (req, res) => {
  const { url, formatId, ext, title } = req.query;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "URL ba daidai ba ce." });
  }

  const safeTitle = (title || "video")
    .replace(/[^\w\s\-]/g, "")
    .trim()
    .substring(0, 60);
  const fileExt = ext || "mp4";

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeTitle}.${fileExt}"`
  );
  res.setHeader(
    "Content-Type",
    fileExt === "mp3" ? "audio/mpeg" : "video/mp4"
  );
  try {
    const options = {
            output: "-",
            noCheckCertificates: true,
            noWarnings: true
        }; // <--- MUN SAKA ALAMAR RUFE RUMBU A NAN

        if (formatId === "mp3" || fileExt === "mp3") {
            options.extractAudio = true;
            options.audioFormat = "mp3"; // <--- MUN GOGE WANCAN '){' DIN KUSKUREN YANZU
        } else {
            options.format = "best[ext=mp4]/best";
        }
    
    const download = ytdlp.exec(url, options, { stdio: ['ignore', 'pipe', 'ignore'] });
    download.stdout.pipe(res);
    download.on("error", (err) => {
      console.error("Download stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: "Kuskure yayin sauke bidiyo." });
      }
    });

    req.on("close", () => {
      download.kill();
    });
  } catch (err) {
    console.error("Download error:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Ba a iya sauke bidiyon." });
    }
  }
});

// ─── Helpers ────────────────────────────────────────────────────
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ SwiftFetch backend yana gudana akan tashar ${PORT}`);
