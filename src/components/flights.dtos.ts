
export interface Flight {
  flightNumber: number;
  destination: string;
  departureTime: string;
  gate: string;
  status: string;
}

export interface CreateFlightDto {
  destination: string;
  departureTime: string;
  gate: string;
}