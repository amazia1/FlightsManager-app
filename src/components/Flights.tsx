import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFlight, deleteFlight, fetchFlights } from "../api/flights";
import type { CreateFlightDto, Flight } from "./flights.dtos";
import { useEffect, useMemo, useState } from "react";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import FlightsForm from "./FlightForm";
import { formattedDate } from "../shared/app-constants";
import { PlusSvg } from "../shared/components/svg/PlusSvg";
import { RemoveSvg } from "../shared/components/svg/RemoveSvg";

const baseUrl = import.meta.env.VITE_API_BASE_URL
const webSocketsUrl = `${baseUrl}/hubs/notifications`

const Flights = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["flights"],
    queryFn: fetchFlights,
  });

  const [search, setSearch] = useState("");                // textbox input
  const [status, setStatus] = useState<string | "">("");   // dropdown
  const debouncedSearch = useDebounced(search, 300);       // 300ms debounce

  const flightsData: Flight[] = data?.data ?? [];

  const statuses = ['Scheduled', 'Boarding', 'Departed', 'Landed']

  const filteredData = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return flightsData.filter(f => {
      const byDestination = !q || f.destination?.toLowerCase().includes(q);
      const byStatus = !status || f.status === status;
      return byDestination && byStatus;
    });
  }, [flightsData, debouncedSearch, status]);

  const deleteFlightMutation = useMutation({
    mutationFn: (flightNumber: number) => deleteFlight(flightNumber),
    onMutate: async (flightNumber) => {
      await queryClient.cancelQueries({ queryKey: ['flights'] });
      const prev = queryClient.getQueryData(['flights']);
      queryClient.setQueryData<{ data: Flight[] }>(["flights"], old =>
        old ? { data: old.data.filter(f => f.flightNumber !== flightNumber) } : { data: [] }
      );
      return { prev };
    },

    onError: (_err, _flightNumber, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["flights"], ctx.prev);
    },
  });

  const columns = useMemo<ColumnDef<Flight>[]>(() => [
    { header: "Flight no.", accessorKey: "flightNumber" },
    { header: "Destination", accessorKey: "destination" },
    {
      header: "Departure",
      accessorKey: "departureTime",
      cell: info => {
        const value = info.getValue<string>();
        return value ? formattedDate(value) : "";
      },
    },
    { header: "Gate", accessorKey: "gate" },
    { header: "Status", accessorKey: "status" },
    {
      id: "actions",
      cell: ({ row }) => {
        const flight = row.original as Flight;
        return (
          <div className="cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              console.log("delete click", flight.flightNumber);
              deleteFlightMutation.mutate(Number(flight.flightNumber));
            }
          }>
            <RemoveSvg />
          </div>
        );
      },
    },
  ], [deleteFlightMutation]);

  const table = useReactTable({
    //data: data?.data,
    data: filteredData,
    columns,
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
      <div className="flex w-full justify-between items-center mb-3">
        <h2 className="text-2xl font-light text-[#001A68]">Flights Board</h2>
        <button
          className="bg-[#2563EB] text-white px-3 py-1 rounded py-1 px-2 rounded-xl"
          onClick={() => setShowForm(true)}
        >
          <div className="flex items-center gap-x-3">
            <PlusSvg />
            <p>Add new flight</p>
          </div>
        </button>
      </div>


       <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by destination…"
            className="border rounded px-2 py-1 focus:outline-none"
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {(search || status) && (
          <button
            onClick={() => { setSearch(""); setStatus(""); }}
            className="py-1 rounded-md border px-3"
          >
            Clear filters
          </button>
        )}
      </div>


      {showForm && (
        <FlightsForm
          onAdd={handleAddFlight}
          onClose={() => setShowForm(false)}
          isLoading={addFlightMutation.isPending}
        />
      )}
          
      <div className="rounded-2xl overflow-hidden">
        <div className="h-[70dvh] overflow-y-auto">  {/* vertical scroll */}
          <table className="min-w-full bg-white border-none">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-6 py-3 font-semibolt text-sm text-left text-[#5C5C5C] border-b">{flexRender(header.column.columnDef.header, header.getContext())}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-3 border-b text-sm text-[#001A68]">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Flights;

function useDebounced<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
