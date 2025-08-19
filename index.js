import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

export default async function handler(req, res) {
  const { avatar } = req.query;

  if (!avatar) {
    return res.status(400).json({ error: "Missing avatar URL" });
  }

  try {
    // Load meme template (fixed 512x512 base image)
    const template = await loadImage("https://i.imgur.com/cLEixM0.jpg");

    // Load avatar from URL
    const avatarResp = await axios.get(avatar, { responseType: "arraybuffer" });
    const avatarImg = await loadImage(Buffer.from(avatarResp.data));

    // Create canvas with template size
    const canvas = createCanvas(512, 512);
    const ctx = canvas.getContext("2d");

    // Draw background template
    ctx.drawImage(template, 0, 0, 512, 512);

    // === Position avatar inside meme ===
    const avatarBox = {
      x: 256,   // horizontal placement
      y: 258,   // vertical placement
      size: 263 // avatar size (width & height)
    };

    // Draw avatar inside box
    ctx.drawImage(avatarImg, avatarBox.x, avatarBox.y, avatarBox.size, avatarBox.size);

    // Output image
    res.setHeader("Content-Type", "image/png");
    const buffer = await canvas.encode("png");
    return res.send(buffer);
  } catch (err) {
    console.error("Canvas error:", err);
    return res.status(500).json({ error: "Error generating image" });
  }
}
