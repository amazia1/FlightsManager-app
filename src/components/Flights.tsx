import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFlight, deleteFlight, fetchFlights, searchFlights } from "../api/flights";
import type { CreateFlightDto, Flight } from "./flights.dtos";
import { useEffect, useMemo, useState } from "react";
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table'
import FlightsForm from "./FlightForm";
import { formattedDate } from "../shared/app-constants";
import { PlusSvg } from "../shared/components/svg/PlusSvg";
import { RemoveSvg } from "../shared/components/svg/RemoveSvg";
import { CloseSvg } from "../shared/components/svg/CloseSvg";

  const baseUrl = import.meta.env.VITE_API_BASE_URL
  const webSocketsUrl = `${baseUrl}/hubs/notifications`
  const statuses = ['Scheduled', 'Boarding', 'Departed', 'Landed']

  const Flights = () => {
  const queryClient = useQueryClient();
  
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState<string>("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const hasFilters = !!search || !!status;

  const baseQuery = useQuery({
    queryKey: ["flights"],
    queryFn: fetchFlights,
    enabled: !hasFilters,
  });

  const filteredQuery = useQuery({
    queryKey: ["flights", { destination: search || undefined, status: status || undefined }],
    queryFn: () => searchFlights({ destination: search || undefined, status: status || undefined }),
    enabled: hasFilters,
  });

  const isLoading = baseQuery.isLoading || filteredQuery.isLoading;
  const error = baseQuery.error || filteredQuery.error as Error | null;
  const flightsData: Flight[] = (hasFilters ? filteredQuery.data : baseQuery.data)?.data ?? [];

 
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
    data: flightsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by destination…"
            className="border rounded px-2 py-1 focus:outline-none"
          />
        </div>

        <select
          value={statusInput}
          onChange={(e) => setStatusInput(e.target.value)}
          className="border rounded px-2 py-1 focus:outline-none"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch(searchInput.trim());
            setStatus(statusInput);
          }}
          className="py-1 rounded-md border text-white px-3 bg-[#2563EB]"
        >
          Search
        </button>

        {(search || status) && (
          <button
            onClick={() => { setSearch(""); setStatus(""); }}
            className="text-md flex gap-x-1 items-center mx-3"
          >
            <CloseSvg />
            <span>Clear Filters</span>
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
          
      <div className="rounded-2xl border overflow-hidden">
        <div className="max-h-[70dvh] overflow-y-auto">
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
