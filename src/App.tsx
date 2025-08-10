
import Flights from "./components/Flights";
import { FlightSvg } from "./shared/components/svg/FlightSvg";

function App() {
 
  return (
    <div className="h-[100dvh] bg-[#EFF6FF] overflow-hidden">

      <nav className="bg-white shadow-lg mb-6 h-16">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex gap-x-2 items-center">
            <FlightSvg />
            <h1 className="font-bold text-2xl text-[#001A68]">Flights Manager</h1>
          </div>
          
        </div>
      </nav>

      <main className="container flex flex-col h-[80dvh] mt-4 mx-auto px-4">
        
        <Flights />
      </main>
    </div>
  );
}

export default App;