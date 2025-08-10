import type { CreateFlightDto, Flight } from "../components/flights.dtos";

const baseUrl = import.meta.env.VITE_API_BASE_URL
const flightsUrl = `${baseUrl}/api/Flights`

export async function fetchFlights() {
  const response = await fetch(flightsUrl);
  if (!response.ok) throw new Error("Failed to fetch flights");
  return response.json();
}

export async function searchFlights(params?: { destination?: string; status?: string }) {
  const url = new URL(`baseUrl`);
  if (params?.destination) url.searchParams.set("destination", params.destination);
  if (params?.status) url.searchParams.set("status", params.status);

  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`Failed to fetch flights (${res.status})`);

  return (await res.json()) as { data: Flight[] };
}

export async function addFlight(flight: CreateFlightDto): Promise<Flight> {
  const response = await fetch(flightsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flight),
  });
  if (!response.ok) throw new Error("Failed to add flight");
  return await response.json();
}

export async function deleteFlight(flightNumber: number): Promise<void> {
  const response = await fetch(`${flightsUrl}?flightNumber=${flightNumber}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete flight");
}