const express = require('express');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(cors()); // Allows the extension to talk to this server
app.use(helmet()); // Security headers

const PORT = 3000;

app.get('/fetch-emails', (req, res) => {
    const imap = new Imap({
        user: 'your_gmail_here',
        password: 'your_password_here',
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    });

    imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
            if (err) return res.status(500).json({ error: "Inbox Error" });

            // Fetch the last 5 messages
            const f = imap.seq.fetch(`${box.messages.total - 4}:*`, { bodies: '' });
            let emails = [];

            f.on('message', (msg) => {
                msg.on('body', (stream) => {
                    simpleParser(stream, (err, mail) => {
                        emails.push({
                            subject: mail.subject,
                            body: mail.text,
                            from: mail.from.text
                        });
                        if (emails.length === 5) {
                            res.json(emails);
                            imap.end();
                        }
                    });
                });
            });
        });
    });

    imap.once('error', (err) => res.status(500).json({ error: "IMAP Fail" }));
    imap.connect();
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));