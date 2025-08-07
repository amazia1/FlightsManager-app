import { useState } from "react";
import type { CreateFlightDto } from "./flights.dtos";

type Props = {
  onAdd: (flight: CreateFlightDto) => void;
  onClose: () => void;
  isLoading?: boolean;
};


export default function FlightsForm({ onAdd, onClose, isLoading }: Props) {
  const [form, setForm] = useState<CreateFlightDto>({
    destination: "",
    departureTime: "",
    gate: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(form);
  }


  return (
    <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
      <input
        required
        className="border rounded px-2 py-1"
        placeholder="Destination"
        name="destination"
        value={form.destination}
        onChange={handleChange}
      />
      <input
        required
        className="border rounded px-2 py-1"
        placeholder="Departure Time"
        type="datetime-local"
        name="departureTime"
        value={form.departureTime}
        onChange={handleChange}
      />
      <input
        required
        className="border rounded px-2 py-1"
        placeholder="Gate"
        name="gate"
        value={form.gate}
        onChange={handleChange}
      />
      <button className="bg-blue-600 text-white rounded px-3 py-1" type="submit" disabled={isLoading}>
        Add Flight
      </button>
    </form>
  );
}

