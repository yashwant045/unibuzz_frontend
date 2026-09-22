import { useEffect, useState } from "react";
import { getAllEvents, isEventExpired } from "@/services/eventService";
import EventCard from "@/components/layout/EventCard";
import Navbar from "@/components/layout/Navbar";
import { CalendarDays, Filter, Search, Loader2, Sparkles, Compass } from "lucide-react";

export default function Events() {

  const [allEvents, setAllEvents] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const res = await getAllEvents();

      const parseDate = (d) => {
        if (!d) return new Date(0);
        if (Array.isArray(d)) return new Date(d[0], d[1] - 1, d[2]);
        return new Date(d);
      };

      const activeEvents = res.data.filter(event => !isEventExpired(event));

      // Sort from newest to oldest
      const sortedEvents = activeEvents.sort((a, b) => parseDate(a.eventDate) - parseDate(b.eventDate));
      setAllEvents(sortedEvents);
      
      // Recommendation Logic
      const interests = JSON.parse(localStorage.getItem("studentInterests")) || [];
      
      let recommendations = [];
      if (interests.length > 0) {
        // Recommend by interest
        recommendations = sortedEvents.filter(event => interests.includes(event.category));
      } 
      
      if (recommendations.length === 0 && sortedEvents.length > 0) {
        // Fallback: Recommend by popularity (highest registered count)
        recommendations = [...sortedEvents].sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0)).slice(0, 4);
      } else {
        // Limit to top 4 recommendations
        recommendations = recommendations.slice(0, 4);
      }

      setRecommendedEvents(recommendations);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <div className="pt-24 pb-12 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[150%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-[120px] transform rotate-12"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[100%] bg-gradient-to-l from-purple-500 to-pink-500 rounded-full blur-[100px] transform -rotate-12"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 text-sm font-medium text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Discover Upcoming Opportunities
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Campus Events</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Register for workshops, seminars, and club activities. Broaden your horizon and connect with your peers.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-16">
        
        {/* LOADING STATE */}
        {isLoading && (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-gray-500 font-medium animate-pulse">Loading amazing events...</p>
          </div>
        )}

        {/* RECOMMENDED SECTION */}
        {!isLoading && recommendedEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 p-2.5 rounded-xl shadow-sm border border-amber-200">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                <p className="text-sm text-gray-500 font-medium">Based on your interests and campus trends</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* ALL EVENTS SECTION */}
        {!isLoading && (
          <section>
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-t border-gray-200 pt-12">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 text-indigo-600 p-2.5 rounded-xl shadow-sm">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Explore All Events</h2>
                  <p className="text-sm text-gray-500 font-medium">Found {allEvents.length} upcoming events</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search events..." 
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 w-full md:w-64 shadow-sm text-sm"
                    disabled
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium">
                  <Filter className="h-4 w-4" />
                  Filter
                </button>
              </div>
            </div>

            {allEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {allEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <div className="bg-gray-50 w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-6">
                  <CalendarDays className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 max-w-md mx-auto">There are currently no upcoming events. Check back later!</p>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}