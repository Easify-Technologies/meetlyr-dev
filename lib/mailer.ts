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
  to: string | string[]; // ✅ accept both string and string[]
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
  });

  const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
    <p>Hello ${groupNames} 👋</p>

    <p>
      Your place is reserved for the meetup on <strong>${formattedDate}</strong> at
      <strong>${cafe.name}</strong>, ${cafe.address}.
    </p>

    <p>Is this your first time?</p>

    <p>
      Take 5 minutes to read these questions that everyone has asked before you:
    </p>

    <p>
      <strong>But where is the Meetup?</strong>
      You'll find out in the app on the morning of the event.
      All information will always be here:
      <a href="https://app.meetlyr.com/" target="_blank" rel="noopener noreferrer">
        https://app.meetlyr.com/
      </a>
    </p>

    <p>
      <strong>What if I freak out before?</strong>
      Don't worry, everyone's a little stressed their first time!
    </p>

    <p>
      <strong>How do I cancel?</strong>
      If you cancel before midnight on Wednesday, we'll have time to find someone
      to replace you, and that's pretty cool for the rest of the group.<br />
      <strong>IMPORTANT:</strong> cancellations can only be made in the app
      (not by email or WhatsApp).
    </p>

    <p>
      <strong>Who am I going to meet?</strong>
      Meetlyr is open to everyone, especially open-minded people who want to meet
      new people. Remember, we're not a dating app; we're not a bachelor party, but
      a unique moment of human connection full of surprises 😇
    </p>

    <p>
      If you're reading this, you've done the hard part. Good job! Now, all you
      have to do is show up and find the group ready to meet you.
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
