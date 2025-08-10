import { useState } from "react";
import type { CreateFlightDto } from "./flights.dtos";
import { CloseSvg } from "../shared/components/svg/CloseSvg";

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
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { [k: string]: string } = {};

    if (!form.destination.trim()) newErrors.destination = "Destination is required";
    if (!form.departureTime) {
      newErrors.departureTime = "Departure time is required";
    } else if (new Date(form.departureTime) <= new Date()) {
      newErrors.departureTime = "Departure time must be in the future";
    }
    if (!form.gate.trim()) newErrors.gate = "Gate is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onAdd(form);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form noValidate onSubmit={handleSubmit} className="flex flex-col h-[25rem] w-96 p-4 bg-white rounded-3xl">
        <div className="flex justify-end">
          <button type="button" onClick={onClose}>
            <CloseSvg />
          </button>
        </div>
        <span className="text-center text-xl text-[#001A68] font-light mb-4">Create Flight</span>

        <label className="text-sm font-semibold">Destination</label>
        <input
          className="border rounded px-2 py-1"
          name="destination"
          value={form.destination}
          onChange={handleChange}
        />
        {errors.destination && <p className="text-xs text-red-500">{errors.destination}</p>}

        <label className="text-sm font-semibold mt-3">Departure time</label>
        <input
          className="border rounded px-2 py-1"
          type="datetime-local"
          name="departureTime"
          value={form.departureTime}
          onChange={handleChange}
        />
        {errors.departureTime && <p className="text-xs text-red-500">{errors.departureTime}</p>}

        <label className="text-sm font-semibold mt-3">Gate</label>
        <input
          className="border rounded px-2 py-1"
          name="gate"
          value={form.gate}
          onChange={handleChange}
        />
        {errors.gate && <p className="text-xs text-red-500">{errors.gate}</p>}

        <button
          className="bg-[#2563EB] w-full text-white rounded-xl px-3 py-1 mt-5"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
