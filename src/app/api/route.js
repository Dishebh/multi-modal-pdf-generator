import OpenAI from "openai";
import axios from "axios";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { NextResponse } from "next/server";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateText(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4", // Replace with "gpt-4" if available
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.data;
}

async function generateImage(prompt) {
  const response = await openai.images.generate({
    prompt,
    model: "dall-e-3",
    n: 1,
    size: "1024x1024",
  });

  return response.data[0].url;
}

async function downloadImage(url) {
  try {
    const response = await axios({
      url,
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data, "binary");

    // Convert the image to JPG format using sharp
    const jpgBuffer = await sharp(imageBuffer).jpeg().toBuffer();

    return jpgBuffer;
  } catch (error) {
    console.error("Error downloading or converting image:", error);
    throw error;
  }
}

async function createPDF({
  text,
  heading = "Future of Technology by 2024",
  imageBuffer1,
  imageBuffer2,
}) {
  const pdfDoc = await PDFDocument.create();
  const page1 = pdfDoc.addPage([1190.55, 841.89]); // A3 size in points
  const page2 = pdfDoc.addPage([1190.55, 841.89]); // Second page
  const { width, height } = page1.getSize();

  // Embed the image
  const image1 = await pdfDoc.embedJpg(imageBuffer1);
  const image2 = await pdfDoc.embedJpg(imageBuffer2);
  const halfWidth = width / 2;
  const imageDims = image1.scale(halfWidth / image1.width);

  // Define padding
  const padding = 20;

  // Load fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold
  );

  // Calculate positions
  const imageX = padding;
  const imageY = height - imageDims.height - 2 * padding;
  const textX = imageX + halfWidth;
  const textY = height - 100;
  const textWidth = halfWidth - padding;

  // Split the text into two halves
  const textArray = text.split(" ");
  const midIndex = Math.ceil(textArray.length / 2);
  const firstHalf = textArray.slice(0, midIndex).join(" ");
  const secondHalf = textArray.slice(midIndex).join(" ");

  // Draw the image and first half of the text on the first page
  page1.drawImage(image1, {
    x: imageX,
    y: imageY,
    width: halfWidth - padding,
    height: imageDims.height,
  });

  // Draw the heading on the first page
  page1.drawText(heading, {
    x: textX,
    y: textY,
    size: 32, // Larger font size for heading
    font: timesRomanBoldFont, // Bold font for heading
  });

  // Draw the first half of the text below the heading on the first page
  const headingHeight = 32 + 20; // Heading font size + padding
  const textPositionY = textY - headingHeight;

  page1.drawText(firstHalf, {
    x: textX,
    y: textPositionY,
    size: 18, // Larger font size for the text
    maxWidth: textWidth,
    lineHeight: 22,
    font: timesRomanFont,
  });

  // Draw the heading on the second page
  page2.drawText(heading, {
    x: padding,
    y: height - 100,
    size: 32, // Larger font size for heading
    font: timesRomanBoldFont, // Bold font for heading
  });

  // Draw the second half of the text on the second page
  page2.drawText(secondHalf, {
    x: padding,
    y: height - 150,
    size: 18,
    maxWidth: textWidth,
    lineHeight: 22,
    font: timesRomanFont,
  });

  // Draw the image on the right side of the second page
  const imageSecondPageX = width / 2 + padding;
  const imageSecondPageY = height - imageDims.height - 2 * padding;
  page2.drawImage(image2, {
    x: imageSecondPageX,
    y: imageSecondPageY,
    width: halfWidth - padding,
    height: imageDims.height,
  });

  // Save the PDF and return it as a buffer
  const pdfBytes = await pdfDoc.save();
  const pdfBuffer = Buffer.from(pdfBytes);
  return pdfBuffer;
}

export async function POST(req, res) {
  const { textPrompt } = await req.json();

  try {
    const text =
      "As an AI, I don't predict future developments, but I can give an analysis based on current trends and technologies that could potentially shape the tech world by 2024:\n" +
      "\n" +
      "1. Artificial Intelligence & Machine Learning: Since AI is one of the leading technologies that already drives various aspects of our life, we can see AI being more intertwined in a broader range of fields such as healthcare, transportation, security, entertainment, etc., and becoming more efficient and precise. With ML, we can expect improved facial recognition, prediction models, and other applications.\n" +
      "\n" +
      "2. The rise of 5G: With 5G technology, the connectivity speed is expected to be significantly higher, thus allowing for more real-time applications, more IoT devices connectivity, and overall faster data sharing.\n" +
      "\n" +
      "3. Advancements in Quantum Computing: While still in its early stages, quantum computing could potentially revolutionize our processing capabilities, enabling faster calculations and more complex algorithms.\n" +
      "\n" +
      "4. IoT and Smart Cities: With the development of IoT technology, cities will be smarter and more connected. Traffic systems, environmental monitoring, utility, and even waste management could be controlled by a network of IoT devices, making operations more efficient.\n" +
      "\n" +
      "5. Cybersecurity advancements: As technology advances, so does the potential for cyber threats. Therefore, the demand for advanced and more robust cybersecurity measures will increase.\n" +
      "\n" +
      "6. Augmented Reality (AR) and Virtual Reality (VR): Advancements in these areas could revolutionize how we work and play. VR could be used for virtual traveling, gaming, training simulations, and more, while AR can enhance our daily life experiences.\n" +
      "\n" +
      "7. Advancements in Blockchain: Blockchain could become more commonly used beyond cryptocurrencies for its excellent security and transparency. It could be used in supply chain management, finance, healthcare, and other sectors.\n" +
      "\n" +
      "8. Automation and Robotics: We could see more automation in everyday tasks and more advanced robotics used in various industries.\n" +
      "\n" +
      "9. Space Technology: With recent advancements, we can expect further developments and potentially more commercial and governmental activities in space.\n" +
      "\n" +
      "10. BioTech and MedTech: These sectors will continue to grow with technologies such as gene-editing, personalized medicine, better diagnostic tools, AI-driven drug discovery and more.\n" +
      "\n" +
      "Remember, these are all assumptions based on current trends and data, and the actual future of technology might be different as it's largely influenced by ongoing research, innovation, societal changes, and so on.";

    const imageUrl = "https://wallpapercave.com/wp/wp4471392.jpg";
    const imageUrl2 = "https://cdn.wallpapersafari.com/56/10/tZn5Dl.jpg";

    // const text2 = await generateText(textPrompt);
    // const image2 = await generateImage(textPrompt);

    const imageBuffer1 = await downloadImage(imageUrl);
    const imageBuffer2 = await downloadImage(imageUrl2);
    const pdfBuffer = await createPDF({
      text,
      heading: textPrompt,
      imageBuffer1,
      imageBuffer2,
    });

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
  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}
