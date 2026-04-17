const express = require('express');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = 3000;

app.get('/fetch-emails', (req, res) => {

    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({ error: "IMAP Timeout" });
        }
    }, 15000);

    const imap = new Imap({
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: {
            servername: 'imap.gmail.com'
        }
    });

    imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
            if (err) {
                clearTimeout(timeout);
                if (!res.headersSent) res.status(500).json({ error: "Inbox Error" });
                imap.end();
                return;
            }

            const start = Math.max(1, box.messages.total - 10);
            const f = imap.seq.fetch(`${start}:*`, { bodies: '' });

            let emails = [];
            let pending = 0;
            let finished = false;

            f.on('message', (msg) => {
                msg.on('body', (stream) => {
                    pending++;

                    simpleParser(stream, (err, mail) => {
                        if (!err && mail) {
                            emails.push({
                                subject: mail.subject || "No Subject",
                                text: mail.text || mail.html || "",
                                from: mail.from?.text || ""
                            });
                        }

                        pending--;

                        if (finished && pending === 0 && !res.headersSent) {
                            clearTimeout(timeout);
                            console.log("Emails fetched:", emails.length);
                            res.json(emails);
                            imap.end();
                        }
                    });
                });
            });

            f.once('end', () => {
                finished = true;

                if (pending === 0 && !res.headersSent) {
                    clearTimeout(timeout);
                    console.log("Emails fetched:", emails.length);
                    res.json(emails);
                    imap.end();
                }
            });
        });
    });

    imap.once('error', (err) => {
        clearTimeout(timeout);
        console.error("IMAP ERROR:", err);

        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }

        imap.end();
    });

    imap.connect();
});

app.post('/check-url', async (req, res) => {
    const text = req.body.text;

    if (!process.env.SAFE_BROWSING_API_KEY) {
        console.warn("[API] Missing key");
        return res.json({ isDangerous: false });
    }

    if (!text) return res.json({ isDangerous: false });

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let urls = text.match(urlRegex);

    if (!urls || urls.length === 0) {
        return res.json({ isDangerous: false });
    }

    urls = [...new Set(
        urls.map(url => url.replace(/[.,;]$/, ''))
    )].slice(0, 5);

    const payload = {
        client: {
            clientId: "phishing-detector",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: urls.map(url => ({ url }))
        }
    };

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.SAFE_BROWSING_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        if (!response.ok) {
            console.error("[API ERROR]", response.status);
            return res.json({ isDangerous: false });
        }

        const data = await response.json();

        const isDangerous = !!(data.matches && data.matches.length > 0);

        if (isDangerous) {
            console.warn("[API ALERT] Malicious URL detected");
        }

        return res.json({ isDangerous });

    } catch (err) {
        if (err.name === "AbortError") {
            console.error("[API] Timeout");
        } else {
            console.error("[API ERROR]", err.message);
        }
        return res.json({ isDangerous: false });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy running on http://localhost:${PORT}`);
});
