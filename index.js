const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.smtp_server,
  port: 2525,
  secure: false,
  auth: {
    user: process.env.smtp_user,
    pass: process.env.smtp_pass,
  },
});
app.use(express.json());

app.post("/gen", async (req, res) => {
  const url = req.body.url, name = req.body.name, filename = name + ".pdf";
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "networkidle2",
  });
  await page.setViewport({ width: 1920, height: 180 });
  await page.pdf({
    path: `./pdfs/${filename}`,
    scale: 2,
    width: 2560,
    height: 1600,
    format: "A4",
  });
  await browser.close();
  try {
    let info = await transporter.sendMail({
      from: process.env.from_email,
      to: process.env.kindle_to,
      subject: name,
      attachments: {
        path: `./pdfs/${filename}`,
      },
    });
    res.status(200).send("Done!");
  } catch (e) {
    res.status(200).send(e);
  }
});

app.listen(3500, () => {
  console.log("Server started!");
});

/* Example cURL 
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"url":"https://overreacted.io/my-decade-in-review/","name":"review"}' \
  http://localhost:3500/gen
*/
