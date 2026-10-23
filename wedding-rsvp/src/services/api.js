async function parseResponse(res) {
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.success) {
    const message = payload?.message || "Something went wrong. Please try again.";
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return payload;
}

export async function getPublicDates() {
  const res = await fetch("/api/dates");
  return parseResponse(res);
}

// Open-access booking: anyone with the link can submit, no code needed.
export async function createRsvp(body) {
  const res = await fetch("/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

// "Semak / Ubah RSVP": every call here is verified by reference_code + phone.
export async function lookupRsvp(referenceCode, phone) {
  const res = await fetch("/api/rsvp/manage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference_code: referenceCode, phone }),
  });
  return parseResponse(res);
}

export async function updateRsvp(referenceCode, phone, body) {
  const res = await fetch("/api/rsvp/manage", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference_code: referenceCode, phone, ...body }),
  });
  return parseResponse(res);
}

export async function cancelRsvp(referenceCode, phone) {
  const res = await fetch("/api/rsvp/manage", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference_code: referenceCode, phone }),
  });
  return parseResponse(res);
}

export async function getWishes() {
  const res = await fetch("/api/wishes");
  return parseResponse(res);
}

export async function createWish(body) {
  const res = await fetch("/api/wishes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

function authHeaders(accessToken) {
  return { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
}

export async function adminListGuests(accessToken, params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  );
  const res = await fetch(`/api/admin/guests?${query.toString()}`, { headers: authHeaders(accessToken) });
  return parseResponse(res);
}

export async function adminSetEventDate(accessToken, id, body) {
  const res = await fetch(`/api/admin/dates/${id}`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });
  return parseResponse(res);
}

export async function adminExportCsv(accessToken, params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  );
  const res = await fetch(`/api/admin/export?${query.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    let message = "Unable to export guest list";
    try {
      const payload = await res.json();
      message = payload?.message || message;
    } catch {
      /* response wasn't JSON (CSV body expected) — keep default message */
    }
    throw new Error(message);
  }

  return res.blob();
}
