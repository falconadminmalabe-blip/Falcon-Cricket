import express from "express";
import path from "path";
import fs from "fs";
import * as XLSX from "xlsx";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json());

// Path to default local file
const DEFAULT_EXCEL_PATH = path.join(process.cwd(), "booking.xlsx");

// Initialize local booking.xlsx if it does not exist
function initDefaultExcel() {
  if (!fs.existsSync(DEFAULT_EXCEL_PATH)) {
    console.log("Initializing default booking.xlsx file on disk...");
    const sampleData = [
      {
        "Name": "Janadeepa",
        "Phone": "077 834 1657",
        "Facility": "Net Sessions",
        "Start Time": "06:03 PM",
        "End Time": "07:03 PM",
        "Status": "Confirmed"
      },
      {
        "Name": "Janadeepa",
        "Phone": "077 834 1657",
        "Facility": "Net Sessions",
        "Start Time": "02:26 PM",
        "End Time": "03:26 PM",
        "Status": "Confirmed"
      },
      {
        "Name": "Bawani",
        "Phone": "072 228 3147",
        "Facility": "Net Sessions",
        "Start Time": "01:30 PM",
        "End Time": "02:30 PM",
        "Status": "Confirmed"
      },
      {
        "Name": "Dilki",
        "Phone": "077 987 4564",
        "Facility": "Net Sessions",
        "Start Time": "01:40 PM",
        "End Time": "03:40 PM",
        "Status": "Confirmed"
      }
    ];

    try {
      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Today's Bookings");
      XLSX.writeFile(wb, DEFAULT_EXCEL_PATH);
      console.log("Default booking.xlsx successfully created!");
    } catch (err) {
      console.error("Failed to create default booking.xlsx:", err);
    }
  }
}

initDefaultExcel();

// Helper to match row keys case-insensitively
function getVal(row: any, keys: string[]): string | undefined {
  const rowKeys = Object.keys(row);
  for (const k of keys) {
    const matchedKey = rowKeys.find(rk => rk.toLowerCase().trim() === k.toLowerCase());
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return String(row[matchedKey]);
    }
  }
  return undefined;
}

// Convert Excel serial times to standard human string AM/PM
function parseTimeValue(val: any): string {
  if (val === undefined || val === null) return "";
  const str = String(val).trim();
  
  // Excel time is sometimes a fractional day number, e.g. 0.75 -> 18:00
  const num = Number(str);
  if (!isNaN(num) && num > 0 && num < 1) {
    const totalMinutes = Math.round(num * 24 * 60);
    const hours24 = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours24 >= 12 ? "PM" : "AM";
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const hrStr = hours12 < 10 ? `0${hours12}` : `${hours12}`;
    return `${hrStr}:${minStr} ${period}`;
  }
  return str;
}

// Map any Excel headers to standard structure
function parseExcelData(jsonData: any[]): any[] {
  const nameKeys = ["name", "customer", "client", "player", "user", "naam", "lead", "booked by", "passenger"];
  const phoneKeys = ["phone no.", "phone no", "phone", "contact", "mobile", "telephone", "phone number", "number", "tel", "contact number"];
  const facilityKeys = ["type", "facility", "net", "lane", "booking type", "resource", "nets", "facility booked"];
  const timeKeys = ["time", "start time", "start", "time from", "starttime", "from", "start_time", "slot"];
  const statusKeys = ["status", "state", "booking status", "approved", "confirmed"];

  return jsonData.map((row, idx) => {
    const noKeys = ["no", "id", "serial"];
    const rowIdRaw = getVal(row, noKeys);
    const parsedId = rowIdRaw ? parseInt(rowIdRaw, 10) : (idx + 1);

    const name = getVal(row, nameKeys) || `Guest ${idx + 1}`;
    const phone = getVal(row, phoneKeys) || "077 000 0000";
    const facility = getVal(row, facilityKeys) || "Net Sessions";
    const rawTime = getVal(row, timeKeys) || "09:00 AM - 10:00 AM";
    const statusVal = getVal(row, statusKeys) || "Confirmed";

    return {
      id: isNaN(parsedId) ? (idx + 1) : parsedId,
      name,
      phone,
      facility,
      time: parseTimeValue(rawTime),
      status: String(statusVal).trim().toLowerCase().includes("pending") ? "Pending" : "Confirmed"
    };
  });
}

// Endpoints
app.get("/api/bookings", async (req, res) => {
  const rawUrl = req.query.url as string || "https://www.dropbox.com/scl/fi/zsr8s25h7khrqiq3hegtx/Booking.xlsx?rlkey=x8r0yq1n4a61w148hz97o4tl3&st=mc1zyydf&dl=0";

  try {
    let workbook: XLSX.WorkBook;

    if (rawUrl) {
      console.log("Fetching custom bookings file from URL:", rawUrl);
      
      // Convert Dropbox link to direct download
      let downloadUrl = rawUrl;
      if (downloadUrl.includes("dropbox.com")) {
        downloadUrl = downloadUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com");
        // Also handle scl style share links
        downloadUrl = downloadUrl.replace("://dropbox.com", "://dl.dropboxusercontent.com");
        if (downloadUrl.includes("dl=0")) {
          downloadUrl = downloadUrl.replace("dl=0", "dl=1");
        } else if (!downloadUrl.includes("?")) {
          downloadUrl += "?dl=1";
        }
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Dropbox returned status ${response.status}`);
      }
      
      const buffer = await response.arrayBuffer();
      workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
    } else {
      // Parse local backup file
      console.log("Reading bookings from local booking.xlsx...");
      if (!fs.existsSync(DEFAULT_EXCEL_PATH)) {
        initDefaultExcel();
      }
      workbook = XLSX.readFile(DEFAULT_EXCEL_PATH);
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawJson = XLSX.utils.sheet_to_json(worksheet);
    
    const formattedData = parseExcelData(rawJson);
    return res.json({ success: true, count: formattedData.length, data: formattedData });
  } catch (error: any) {
    console.error("Booking retrieval or parsing failure:", error.message);
    
    // Fall back to local file if fetch failed
    try {
      console.log("Error occurred fetching Dropbox link. Falling back to local file parsing...");
      const workbook = XLSX.readFile(DEFAULT_EXCEL_PATH);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(worksheet);
      const formattedData = parseExcelData(rawJson);
      return res.json({ 
        success: true, 
        count: formattedData.length, 
        data: formattedData,
        warning: "Custom Dropbox sync link failed to load. Displaying local booking.xlsx contents."
      });
    } catch (fallbackError) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Dynamic Email Message Sender storage & endpoints
interface ContactMsg {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
}

const contactMessages: ContactMsg[] = [
  {
    id: "msg-1",
    name: "Janadeepa",
    email: "janadeepa@example.com",
    subject: "Coaching Availability Request",
    message: "Looking to book 1-on-1 private coaching for the afternoon net sessions next Friday. Do you have slots open?",
    timestamp: "May 25, 2026, 11:30 AM"
  }
];

app.get("/api/contact-messages", (req, res) => {
  res.json({ success: true, messages: contactMessages });
});

// Send real email using nodemailer if configured
async function sendRealEmail(fromName: string, fromEmail: string, subject: string, message: string) {
  const adminEmail = "falconadminmalabe@gmail.com";
  // Check for any of these common environment variable keys
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.log(`[Email Simulator] Real email transmission skipped: SMTP_USER and SMTP_PASS are empty in environment configuration.`);
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });

    const mailOptions = {
      from: `"${fromName}" <${user}>`,
      to: adminEmail,
      replyTo: fromEmail,
      subject: `[Falcon Contact Request] ${subject}`,
      text: `Hello Falcon Admin,\n\nYou have received a new contact submission from your Malabe Complex Cricket website.\n\nSender Name: ${fromName}\nSender Email: ${fromEmail}\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nSent via Falcon Sport Complex Dashboard`,
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #DC2626; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 0; font-family: system-ui, sans-serif;">New Support Inquiry</h2>
          <p style="margin: 6px 0;"><strong>Sender Name:</strong> ${fromName}</p>
          <p style="margin: 6px 5px 6px 0;"><strong>Sender Email:</strong> ${fromEmail}</p>
          <p style="margin: 6px 0;"><strong>Subject:</strong> ${subject}</p>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
          <p style="font-weight: 600; margin-bottom: 8px;">Message Content:</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px; font-style: italic; white-space: pre-line; line-height: 1.6; color: #334155;">
            ${message}
          </div>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;">
          <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">This communication was dispatched securely via Falcon Cricket Net Booking Systems.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Success] SMTP Message sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("[Email SMTP Error] Connection failed or credentials incorrect:", error);
    return false;
  }
}

app.post("/api/send-message", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: "All contact fields are required." });
  }

  const newMsg: ContactMsg = {
    id: `msg-${Date.now()}`,
    name,
    email,
    subject,
    message,
    timestamp: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }) + ", " + new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    })
  };

  // Prepend to local messages array so it displays on the screen
  contactMessages.unshift(newMsg);
  console.log(`[Message Lodged] In-app contact recorded for ${name} (${email})`);

  // Try real dynamic SMTP email dispatch
  const isSentReal = await sendRealEmail(name, email, subject, message);

  res.json({ 
    success: true, 
    message: isSentReal 
      ? "Your message was sent successfully to falconadminmalabe@gmail.com and logged!" 
      : "Your message has been processed successfully and simulation logged in backend console.",
    realTransmission: isSentReal ? "delivered" : "simulated"
  });
});

// Start listening and serve application files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Falcon Sport Complex Server booted successfully. Accessible at http://localhost:${PORT}`);
  });
}

startServer();
