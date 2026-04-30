const express = require('express')
const nodemailer = require('nodemailer')
const { ImapFlow } = require('imapflow')
const adminMiddleware = require('../middleware/adminMiddleware')

const router = express.Router()
router.use(adminMiddleware)

// Créer le transporteur SMTP Yahoo
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  })
}

// POST /api/admin/email/send
router.post('/send', async (req, res) => {
  const { to, subject, body } = req.body
  if (!to || !subject || !body) {
    return res.status(400).json({ message: 'Destinataire, sujet et message sont requis.' })
  }

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"DNZ-Group Admin" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text: body,
      html: `<div style="font-family:sans-serif;line-height:1.6">${body.replace(/\n/g, '<br>')}</div>`
    })
    res.json({ message: 'Email envoyé avec succès.' })
  } catch (err) {
    console.error('Erreur envoi email:', err.message)
    res.status(500).json({ message: 'Échec de l\'envoi : ' + err.message })
  }
})

// GET /api/admin/email/inbox?limit=30
router.get('/inbox', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 30, 100)

  const client = new ImapFlow({
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    logger: false
  })

  try {
    await client.connect()
    const mailbox = await client.mailboxOpen('INBOX')
    const total = mailbox.exists

    if (total === 0) {
      await client.logout()
      return res.json([])
    }

    // Lire les N derniers emails
    const start = Math.max(1, total - limit + 1)
    const messages = []

    for await (const msg of client.fetch(`${start}:*`, {
      uid: true,
      flags: true,
      envelope: true,
      bodyStructure: true,
      bodyParts: ['text']
    })) {
      let bodyText = ''
      if (msg.bodyParts) {
        for (const [, buf] of msg.bodyParts) {
          bodyText += buf.toString('utf-8')
        }
      }

      messages.push({
        uid: msg.uid,
        subject: msg.envelope.subject || '(sans objet)',
        from: msg.envelope.from?.[0]
          ? `${msg.envelope.from[0].name || ''} <${msg.envelope.from[0].address}>`.trim()
          : 'Inconnu',
        date: msg.envelope.date,
        seen: msg.flags.has('\\Seen'),
        body: bodyText.slice(0, 2000)
      })
    }

    await client.logout()
    res.json(messages.reverse())
  } catch (err) {
    console.error('Erreur lecture inbox:', err.message)
    try { await client.logout() } catch {}
    res.status(500).json({ message: 'Impossible de lire la boîte mail : ' + err.message })
  }
})

// GET /api/admin/email/sent?limit=20
router.get('/sent', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50)

  const client = new ImapFlow({
    host: 'imap.mail.yahoo.com',
    port: 993,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    logger: false
  })

  try {
    await client.connect()

    // Trouver le dossier Sent de Yahoo
    const list = await client.list()
    const sentFolder = list.find(f =>
      /sent/i.test(f.name) || /envoy/i.test(f.name)
    )

    if (!sentFolder) {
      await client.logout()
      return res.json([])
    }

    const mailbox = await client.mailboxOpen(sentFolder.path)
    const total = mailbox.exists

    if (total === 0) {
      await client.logout()
      return res.json([])
    }

    const start = Math.max(1, total - limit + 1)
    const messages = []

    for await (const msg of client.fetch(`${start}:*`, {
      uid: true,
      flags: true,
      envelope: true,
      bodyParts: ['text']
    })) {
      let bodyText = ''
      if (msg.bodyParts) {
        for (const [, buf] of msg.bodyParts) {
          bodyText += buf.toString('utf-8')
        }
      }

      messages.push({
        uid: msg.uid,
        subject: msg.envelope.subject || '(sans objet)',
        to: msg.envelope.to?.[0]
          ? `${msg.envelope.to[0].name || ''} <${msg.envelope.to[0].address}>`.trim()
          : 'Inconnu',
        date: msg.envelope.date,
        body: bodyText.slice(0, 2000)
      })
    }

    await client.logout()
    res.json(messages.reverse())
  } catch (err) {
    console.error('Erreur lecture sent:', err.message)
    try { await client.logout() } catch {}
    res.status(500).json({ message: 'Impossible de lire les envoyés : ' + err.message })
  }
})

module.exports = router
