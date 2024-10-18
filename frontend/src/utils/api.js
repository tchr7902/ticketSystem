const BASE_URL = process.env.BASE_URL

export async function fetchTickets() {
    const response = await fetch(BASE_URL);
    return await response.json();
}

export async function createTicket(ticket) {
    const response = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
    });
    return await response.json();
}

export async function updateTicket(id, updates) {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });
    return await response.json();
}

export async function deleteTicket(id) {
    await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
}