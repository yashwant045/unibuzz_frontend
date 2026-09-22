import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/services/api";
import { getAllEvents, isEventExpired } from "@/services/eventService";
import EventCard from "@/components/layout/EventCard";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);

  useEffect(() => {
    console.log("Dashboard loaded");
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load all events and recommended first
      const res = await getAllEvents();

      const parseDate = (d) => {
        if (!d) return new Date(0);
        if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
        return new Date(d);
      };
      const sortByMostRecent = (arr) =>
        [...arr].sort((a, b) => parseDate(b.eventDate) - parseDate(a.eventDate));

      const activeEvents = res.data.filter(e => !isEventExpired(e));
      setEvents(sortByMostRecent(activeEvents));

      // Fetch profile for interests
      const profileRes = await API.get("/api/user/profile");
      const interests = profileRes.data.interests || [];

      const filtered = activeEvents.filter(e => 
        interests.some(interest => e.category?.toLowerCase().includes(interest.toLowerCase()))
      );
      setRecommended(sortByMostRecent(filtered));

      // Load joined/upcoming
      const reg = await API.get("/api/registrations/my");
      const all = await getAllEvents();

      const myEvents = all.data.filter(event =>
        reg.data.some(r => String(r.eventId) === String(event.id))
      );

      const upcomingEvents = myEvents.filter(e => !isEventExpired(e));

      setJoinedEvents(sortByMostRecent(myEvents));
      setUpcoming(sortByMostRecent(upcomingEvents));
    } catch (err) {
      console.log("ERROR:", err);
    }
  };

  return (
    <div className="space-y-10 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <button 
          onClick={loadData}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          Refresh
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 p-6">
        <div className="text-center bg-white/70 backdrop-blur rounded-xl shadow-lg p-8 border">
          <h2 className="text-4xl font-bold text-indigo-600 mb-2">{joinedEvents.length}</h2>
          <p className="text-gray-600 font-medium">Events Joined</p>
        </div>
        <div className="text-center bg-white/70 backdrop-blur rounded-xl shadow-lg p-8 border">
          <h2 className="text-4xl font-bold text-purple-600 mb-2">{upcoming.length}</h2>
          <p className="text-gray-600 font-medium">Upcoming Events</p>
        </div>
        <div className="text-center bg-white/70 backdrop-blur rounded-xl shadow-lg p-8 border">
          <h2 className="text-4xl font-bold text-green-600 mb-2">0</h2>
          <p className="text-gray-600 font-medium">Certificates</p>
        </div>
      </div>

      {/* RECOMMENDED EVENTS */}
      {recommended.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            🎯 Recommended Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map(e => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      )}

      {/* ALL EVENTS */}
      <div>
        <h2 className="text-xl font-bold mb-6">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(e => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      </div>
    </div>
  );
}
