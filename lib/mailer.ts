import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMeetupEmail({
  to,
  groupNames,
  cafe,
  date,
}: {
  to: string | string[];
  groupNames: string;
  cafe: { name: string; address: string };
  date: string;
}) {
  const formattedDate = new Date(date).toLocaleString("en-US", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
    timeZone: "Europe/Paris",
  });

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    cafe.address
  )}`;

  const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    <p>Hello ${groupNames} 👋</p>

    <p>
      Your place is reserved for the meetup on <strong>${formattedDate}</strong>.
    </p>

    <p><strong>📍 Meetup Location</strong></p>

    <p>
      We’ve chosen a comfortable and welcoming spot where conversations flow easily
      and everyone can feel at ease.
    </p>

    <p>
      <strong>Name:</strong> ${cafe.name}<br />
      <strong>Address:</strong><br />
      <a
        href="${mapUrl}"
        target="_blank"
        style="
          display: inline-block;
          margin-top: 8px;
          padding: 10px 16px;
          background: #FFD100;
          color: #2F1107;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
        "
      >
        ${cafe.address}
      </a>
    </p>

    <!-- 🔔 EVENTS BUTTON -->
    <div style="margin: 30px 0; text-align: center;">
      <a
        href="${process.env.NEXTAUTH_URL}/events"
        target="_blank"
        style="
          display: inline-block;
          padding: 14px 28px;
          background: #2F1107;
          color: #ffffff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
        "
      >
        View Event Details
      </a>
    </div>

    <p style="font-size: 14px; color: #555;">
      Arrive a few minutes early, grab your favorite drink, and look for a friendly
      group ready to meet you. Our hosts will make sure you feel right at home.
    </p>
  </div>
`;

  await transporter.sendMail({
    from: `"Meetlyr" <${process.env.SMTP_USER}>`,
    to,
    subject: "Your Coffee Meetup Details ☕",
    html,
  });
}
