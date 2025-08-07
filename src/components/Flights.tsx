import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFlight, fetchFlights } from "../api/flights";
import type { CreateFlightDto, Flight } from "./flights.dtos";
import { useEffect, useState } from "react";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import FlightsForm from "./FlightForm";
import { formattedDate } from "../shared/app-constants";

const baseUrl = import.meta.env.VITE_API_BASE_URL
const webSocketsUrl = `${baseUrl}/hubs/notifications`

const Flights = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["flights"],
    queryFn: fetchFlights,
  });

  const table = useReactTable({
    data: data?.data, // Your flights array
    columns: [
      { header: "Flight #", accessorKey: "flightNumber" },
      { header: "Destination", accessorKey: "destination" },
      {
        header: "Departure",
        accessorKey: "departureTime",
        cell: info => {
          const value = info.getValue() as string;
          if (!value) return "";
          return formattedDate(value)
        }
      },
      { header: "Gate", accessorKey: "gate" },
      { header: "Status", accessorKey: "status" },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const addFlightMutation = useMutation({
    mutationFn: addFlight,
    onSuccess: (newFlight: Flight) => {
      queryClient.setQueryData<Flight[]>(['flights'], (old = []) => [...old, newFlight]);
      setShowForm(false);
    },
  });

  useEffect(() => {
  const connection = new HubConnectionBuilder()
    .withUrl(webSocketsUrl, {
      transport: HttpTransportType.WebSockets
    })
    .build();

  connection.start()
    .then(() => {
      connection.on("FlightCreated", (msg) => {
        queryClient.invalidateQueries({ queryKey: ["flights"] });
      });
      connection.on("FlightDeleted", (msg) => {
        queryClient.invalidateQueries({ queryKey: ["flights"] });
      });
    })
    .catch(err => {
      console.error("SignalR error:", err);
    });

  return () => { connection.stop(); };
}, []);

  if (isLoading) return <div>Loading flights...</div>;
  if (error) return <div>Error loading flights: {error.message}</div>;

  const handleAddFlight = (flight: Omit<CreateFlightDto, "flightNumber">) => {
    addFlightMutation.mutate(flight);
  };

  return (
    <div className="flex flex-col w-full">
    
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          onClick={() => setShowForm(true)}
        >
          + Add
        </button>

        {showForm && (
          <FlightsForm
            onAdd={handleAddFlight}
            onClose={() => setShowForm(false)}
            isLoading={addFlightMutation.isPending}
          />
        )}
            
        <table className="min-w-full border">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="p-2 border-b">{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="p-2 border-b">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Flights;
