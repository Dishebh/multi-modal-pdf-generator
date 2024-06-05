import OpenAI from "openai";
import axios from "axios";
import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";
import fs from "fs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateText(prompt) {
  console.log("prompt", prompt);

  const response = await openai.chat.completions.create({
    model: "gpt-4", // Replace with "gpt-4" if available
    prompt: "tech vision 2024",
    max_tokens: 500,
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
    ],
  });

  console.log("text!", response.data);
  return response.data;
}

async function generateImage(prompt) {
  const response = await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "512x512",
  });
  return response.data.data[0].url;
}

async function downloadImage(url) {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary");
}

async function createPDF(text, imageBuffer) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const textWidth = width - 50;
  page.drawText(text, {
    x: 25,
    y: height - 100,
    size: 12,
    maxWidth: textWidth,
    lineHeight: 14,
  });

  const image = await pdfDoc.embedJpg(imageBuffer);
  const imageDims = image.scale(0.5);
  page.drawImage(image, {
    x: 25,
    y: height / 2 - imageDims.height / 2,
    width: imageDims.width,
    height: imageDims.height,
  });

  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes.buffer, "binary");
  console.log("PDF created", pdfBuffer);

  // path should be in public folder
  const path = "public/output.pdf";
  fs.writeFileSync(path, pdfBytes);
  return pdfBuffer;
}

export async function POST(req, res) {
  const { textPrompt, imagePrompt } = req.body;

  try {
    const text =
      'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.';
    const imageUrl =
      "https://randomwordgenerator.com/img/picture-generator/57e0d6424c5aa414f1dc8460962e33791c3ad6e04e507440762e7adc934cc7_640.jpg";
    const imageBuffer = await downloadImage(imageUrl);
    const pdfBuffer = await createPDF(text, imageBuffer);

    // set headers in nextresponse
    const response = new NextResponse(pdfBuffer);
    response.headers.set("Content-Type", "application/pdf");
    response.headers.set(
      "Content-Disposition",
      "attachment; filename=output.pdf"
    );
    return response;
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
    // res.status(200).send(pdfBytes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating PDF" });
  }
}

export async function GET(req, res) {
  console.log("GET request received");
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}
