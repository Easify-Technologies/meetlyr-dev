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
      <strong>Name: ${cafe.name}</strong><br />
      <strong>Address: ${cafe.address}</strong><br />
    </p>

    <p style="font-size: 14px; color: #555;">
      Arrive a few minutes early, grab your favorite drink, and look for a friendly
      group ready to meet you. Our hosts will make sure you feel right at home.
    </p>

    <p>Is this your first time?</p>

    <p>
      Take 5 minutes to read these questions that everyone has asked before you:
    </p>

    <p>
      <strong>What if I freak out before?</strong>
      Don't worry, everyone's a little stressed their first time! We make sure to
      match you with the right people so you feel comfortable and the conversation
      flows naturally.
    </p>

    <p>
      <strong>How do I cancel?</strong>
      If you cancel before 48 hours, we'll have time to find someone
      to replace you. After that, your reservation is confirmed and cannot be
      modified. In case of an extraordinary event, please contact the Meetlyr team.
      <br />
      <strong>IMPORTANT:</strong> cancellations can only be made in the app.
    </p>

    <p>
      <strong>Who am I going to meet?</strong>
      Meetlyr is open to everyone—especially open-minded people who want to meet
      new people. We're not a dating app or a bachelor party, but a unique moment of
      human connection.
    </p>

    <p>
      If you're reading this, you've done the hard part. Good job! Now all you have
      to do is show up and find the group ready to meet you.
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
