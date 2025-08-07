
import Flights from "./components/Flights";

function App() {
  //const filter = useSelector((state: RootState) => state.ui.filter);
  //const dispatch = useDispatch();

  return (
    <div className="h-[100dvh] bg-gray-50 overflow-hidden">

      <nav className="bg-white shadow mb-6 h-16">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-500">Flights Management</div>
        </div>
      </nav>

      <main className="container flex flex-col h-[80dvh] mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-4 text-gray-800">Welcome to flight management!</h1>
        <Flights />
      </main>
    </div>
  );
}

export default App;