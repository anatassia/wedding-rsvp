export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "Wedding RSVP backend is working",
  });
}