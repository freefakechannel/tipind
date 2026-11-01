import { siteConfig } from "@/config/site"

export interface ChannelLink {
  href: string
  /** True when the message couldn't be prefilled and the user must paste it. */
  paste: boolean
}

export interface ChannelLinks {
  /** Gmail in the browser. */
  email: ChannelLink | null
  outlook: ChannelLink | null
  mailApp: ChannelLink | null
  whatsapp: ChannelLink | null
  /** Telegram can't prefill text, so it's always paste. */
  telegram: ChannelLink | null
}

const WEB_MAIL_LIMIT = 6_000
const MAIL_APP_LIMIT = 2_000
const WHATSAPP_LIMIT = 4_000

/** Prefills the body; falls back to an empty body + paste when the URL is too long. */
function compose(
  build: (body: string) => string,
  message: string,
  limit: number
): ChannelLink {
  const full = build(encodeURIComponent(message))
  return full.length <= limit
    ? { href: full, paste: false }
    : { href: build(""), paste: true }
}

export function buildChannels(message: string, subject: string): ChannelLinks {
  const { email, telegramUsername, whatsappNumber } = siteConfig.contact
  const to = encodeURIComponent(email)
  const su = encodeURIComponent(subject)

  return {
    email: email
      ? compose(
          (body) =>
            `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`,
          message,
          WEB_MAIL_LIMIT
        )
      : null,
    mailApp: email
      ? compose(
          (body) => `mailto:${email}?subject=${su}&body=${body}`,
          message,
          MAIL_APP_LIMIT
        )
      : null,
    outlook: email
      ? compose(
          (body) =>
            `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${body}`,
          message,
          WEB_MAIL_LIMIT
        )
      : null,
    telegram: telegramUsername
      ? { href: `https://t.me/${telegramUsername}`, paste: true }
      : null,
    whatsapp: whatsappNumber
      ? compose(
          (body) => `https://wa.me/${whatsappNumber}?text=${body}`,
          message,
          WHATSAPP_LIMIT
        )
      : null,
  }
}
