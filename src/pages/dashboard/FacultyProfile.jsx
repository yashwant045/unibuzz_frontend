import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Building, 
  Phone, 
  Calendar, 
  Users, 
  MapPin,
  Loader2,
  Edit,
  CalendarDays,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyEvents, isEventExpired } from "@/services/eventService";
import API from "@/services/api";
import { useToast } from "@/context/ToastContext";

export default function FacultyProfile() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", department: "", officeLocation: "", phoneNumber: "" });
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userRes, eventsRes] = await Promise.all([
        API.get("/api/user/profile"),
        getMyEvents()
      ]);
      setUser(userRes.data);
      setEvents(eventsRes.data || []);
    } catch (error) {
      console.error("Failed to load profile data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      fullName: user?.fullName || "",
      department: user?.department || "",
      officeLocation: user?.officeLocation || "",
      phoneNumber: user?.phoneNumber || ""
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await API.put("/api/user/profile", formData);
      setUser(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to update profile. " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Analytics
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((acc, event) => acc + (event.registeredCount || 0), 0);
  
  // Sort events by date descending and get last 3
  const recentEvents = [...events].sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate)).slice(0, 3);
  const today = new Date();
  today.setHours(0,0,0,0);

  const getInitials = (name) => {
    if (!name) return "F";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* CSS Grid: Narrow Left, Wide Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile Identity */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-lg relative">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 w-full relative">
              <div className="absolute -bottom-12 left-6">
                <Avatar className="w-24 h-24 border-4 border-white shadow-md bg-white">
                  <AvatarImage src="" alt={user?.fullName || "Faculty"} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
                    {getInitials(user?.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <CardContent className="pt-16 pb-6 px-6">
              <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{user?.fullName || "Faculty Member"}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Faculty
                  </Badge>
                  {user?.department && (
                    <span className="text-sm text-gray-500 font-medium">
                      {user.department}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Contact Info</h3>
                <div className="flex items-center gap-3 text-gray-600">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                {user?.officeLocation && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{user.officeLocation}</span>
                  </div>
                )}
                {user?.phoneNumber && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{user.phoneNumber}</span>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleEditClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Dashboard Highlights */}
        <div className="lg:col-span-8 space-y-8">
          
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Highlights</h2>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm border-gray-100">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Events Organized</p>
                  <h3 className="text-3xl font-bold text-gray-900">{totalEvents}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-100">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Student Registrations</p>
                  <h3 className="text-3xl font-bold text-gray-900">{totalRegistrations}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card className="shadow-sm border-gray-100">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>The last {recentEvents.length} events you created.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <CalendarDays className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p>You haven't organized any events yet.</p>
                  <Button 
                    variant="link" 
                    className="text-blue-600 mt-2"
                    onClick={() => navigate("/dashboard/create-event")}
                  >
                    Create your first event
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEvents.map(event => {
                    const isCompleted = isEventExpired(event);

                    return (
                      <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 p-2 rounded-full ${isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                            {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <CalendarDays className="h-5 w-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {Array.isArray(event.eventDate) ? `${event.eventDate[0]}-${String(event.eventDate[1]).padStart(2, '0')}-${String(event.eventDate[2]).padStart(2, '0')}` : event.eventDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.registeredCount || 0} / {event.seats} filled
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant={isCompleted ? "outline" : "default"} className={!isCompleted ? "bg-blue-600" : ""}>
                          {isCompleted ? "Completed" : "Upcoming"}
                        </Badge>
                      </div>
                    );
                  })}
                  <div className="pt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/dashboard/my-events")}
                    >
                      View All Events
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-2xl p-0 max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-slate-300 text-sm mt-1">Update your professional information</p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-grow bg-gray-50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Dr. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({...formData, officeLocation: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Room 402, Block A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
