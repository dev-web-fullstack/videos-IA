import fs from "fs";
import path from "path";

export function ensureVideoFolder() {

  const dir = path.join(
    process.cwd(),
    "public",
    "videos"
  );

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true,
    });
  }

  return dir;
}

export function generateVideoName() {
  return `final-${Date.now()}.mp4`;
}