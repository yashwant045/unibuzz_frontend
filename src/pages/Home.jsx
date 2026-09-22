import Navbar from "@/components/layout/Navbar";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-full">

      <div
        className="h-screen bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1505373877841-8d25f7d46678)",
        }}
      >

        <div className="absolute inset-0 bg-black/60"></div>

        <Navbar />

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-6">

          <h1 className="text-5xl font-bold mb-6">
            Never Miss a Campus Event
          </h1>

          <p className="text-xl mb-8 max-w-2xl">
            Discover workshops, seminars, expert talks & campus activities all in one place.
          </p>

          <button
            onClick={() => navigate("/events")}
            className="bg-yellow-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-400 transition"
          >
            Explore Events
          </button>

        </div>

      </div>
    </div>
  );
}
