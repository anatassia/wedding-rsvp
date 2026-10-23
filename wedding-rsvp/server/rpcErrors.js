// Maps the plain-text codes raised by the Postgres booking functions
// (supabase/migrations/0002, 0003) to an HTTP status + guest-safe message.
// Never exposes raw database error text to the client.
const RPC_ERROR_MAP = {
  party_size_out_of_range: [400, "Jumlah tetamu mesti antara 1 hingga 3 orang"],
  event_date_not_found: [404, "Tarikh tidak dijumpai"],
  event_date_closed: [409, "Tarikh ini tidak lagi tersedia"],
  event_date_capacity_exceeded: [409, "Tarikh ini sudah penuh"],
  reference_code_generation_failed: [500, "Sila cuba sekali lagi"],
  rsvp_not_found: [404, "Kod rujukan atau nombor telefon tidak sepadan"],
  rsvp_cancelled: [409, "Tempahan ini telah dibatalkan"],
  capacity_below_confirmed_attendance: [409, "Kapasiti tidak boleh kurang daripada kehadiran yang disahkan"],
};

export function mapRpcError(error) {
  const code = error?.message?.trim();
  const mapped = RPC_ERROR_MAP[code];

  if (mapped) {
    const [status, message] = mapped;
    return { status, message };
  }

  return { status: 500, message: "Ralat server tidak dijangka" };
}
