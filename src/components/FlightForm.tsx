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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      
      <form noValidate onSubmit={handleSubmit} className="flex flex-col h-96 w-96 p-4 bg-white rounded-3xl">
        <div className="flex flex-col w-full my-2">
          <div className="flex w-full">
            <div onClick={onClose}>
              <CloseSvg/>
            </div>
            
          </div>
          <span className="text-center text-xl text-[#001A68] font-light">Create Flight</span>
        </div>
        <div className="flex flex-col gap-y-5">
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Destination</span>
            <input
              required
              className="border rounded px-2 py-1"
              placeholder="Destination"
              name="destination"
              value={form.destination}
              onChange={handleChange}
            />
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Departure time</span>
            <input
              required
              className="border rounded px-2 py-1"
              placeholder="Departure Time"
              type="datetime-local"
              name="departureTime"
              value={form.departureTime}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold">Gate</span>
            <input
              required
              className="border rounded px-2 py-1"
              placeholder="Gate"
              name="gate"
              value={form.gate}
              onChange={handleChange}
            />
          </div>

          <button className="bg-[#2563EB] w-full text-white rounded-xl px-3 py-1" type="submit" disabled={isLoading}>
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

