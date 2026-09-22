import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mail, 
  Calendar, 
  Trophy, 
  LogOut, 
  Edit, 
  BookOpen,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/context/ToastContext";
import { isEventExpired } from "@/services/eventService";

export default function StudentProfile() {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState({ joined: [], upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", department: "", interests: "" });
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userRes, regRes, allRes] = await Promise.all([
        API.get("/api/user/profile"),
        API.get("/api/registrations/my"),
        API.get("/api/events")
      ]);
      
      const userData = userRes.data;
      // Normalizing the role from UserProfileDTO array if necessary
      userData.role = userData.roles?.[0]?.name || userData.role || "STUDENT";
      setUser(userData);

      const myEvents = allRes.data.filter(event =>
        regRes.data.some(r => String(r.eventId) === String(event.id))
      );

      const upcoming = myEvents.filter(e => !isEventExpired(e));
      const past = myEvents.filter(e => isEventExpired(e));
      const attendedCount = regRes.data.filter(r => r.attended).length;

      setEvents({
        joined: myEvents,
        upcoming,
        past,
        certificatesCount: attendedCount
      });
    } catch (error) {
      console.error("Profile fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setFormData({
      fullName: user?.fullName || "",
      department: user?.department || "",
      interests: user?.interests ? user.interests.join(", ") : ""
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const interestsArray = formData.interests
        .split(",")
        .map(i => i.trim())
        .filter(i => i.length > 0);
        
      const res = await API.put("/api/user/profile", {
        fullName: formData.fullName,
        department: formData.department,
        interests: interestsArray
      });
      
      const userData = res.data;
      userData.role = userData.roles?.[0]?.name || userData.role || "STUDENT";
      setUser(userData);
      localStorage.setItem("studentInterests", JSON.stringify(interestsArray));
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to update profile. " + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const getInitials = (name) => {
    if (!name) return "S";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  // Get last 3 recent events
  const recentActivity = [...events.joined].sort((a, b) => {
      const dateA = Array.isArray(a.eventDate) ? new Date(a.eventDate[0], a.eventDate[1] - 1, a.eventDate[2]) : new Date(a.eventDate);
      const dateB = Array.isArray(b.eventDate) ? new Date(b.eventDate[0], b.eventDate[1] - 1, b.eventDate[2]) : new Date(b.eventDate);
      return dateB - dateA;
  }).slice(0, 3);

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto pt-32 px-6 space-y-8">
        
        {/* CSS Grid: Narrow Left, Wide Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Profile Identity */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="overflow-hidden border-none shadow-lg relative">
              {/* Banner */}
              <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 w-full relative">
                <div className="absolute -bottom-12 left-6">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-md bg-white">
                    <AvatarImage src="" alt={user?.fullName || "Student"} />
                    <AvatarFallback className="text-2xl font-bold bg-indigo-100 text-indigo-700">
                      {getInitials(user?.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <CardContent className="pt-16 pb-6 px-6">
                <div className="flex flex-col gap-1 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{user?.fullName || "Student Name"}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                      {user?.role || "Student"}
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
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  {user?.interests && user.interests.length > 0 && (
                    <div className="flex items-center gap-3 text-gray-600">
                      <BookOpen className="h-4 w-4 text-indigo-500" />
                      <span className="text-sm capitalize">{user.interests.join(", ")}</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleEditClick}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 mb-3"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
                
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center justify-center gap-2" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Dashboard Highlights */}
          <div className="lg:col-span-8 space-y-8">
            
            <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-sm border-gray-100 hover:shadow-md transition cursor-pointer" onClick={() => navigate("/dashboard/student")}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{events.joined.length}</h3>
                    <p className="text-sm font-medium text-gray-500">Events Joined</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100 hover:shadow-md transition cursor-pointer" onClick={() => navigate("/dashboard/student")}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{events.upcoming.length}</h3>
                    <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-gray-100 hover:shadow-md transition cursor-pointer" onClick={() => navigate("/dashboard/certificates")}>
                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-green-100 text-green-600 rounded-full">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">{events.certificatesCount || 0}</h3>
                    <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-sm border-gray-100">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The latest events you registered for.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <CalendarDays className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                    <p>No recent activity yet.</p>
                    <Button 
                      variant="link" 
                      className="text-indigo-600 mt-2"
                      onClick={() => navigate("/events")}
                    >
                      Browse events to join
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map(event => {
                      const eventDateObj = new Date(
                        Array.isArray(event.eventDate) 
                          ? new Date(event.eventDate[0], event.eventDate[1] - 1, event.eventDate[2])
                          : event.eventDate
                      );
                      const isCompleted = eventDateObj < today;

                      return (
                        <div key={event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors gap-4">
                          <div className="flex items-start gap-4">
                            <div className={`mt-1 p-2 rounded-full ${isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-indigo-100 text-indigo-600'}`}>
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
                              </div>
                            </div>
                          </div>
                          <Badge variant={isCompleted ? "outline" : "default"} className={!isCompleted ? "bg-indigo-600" : ""}>
                            {isCompleted ? "Completed" : "Upcoming"}
                          </Badge>
                        </div>
                      );
                    })}
                    <div className="pt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/dashboard/student")}
                      >
                        View Full Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-2xl p-0 max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-slate-300 text-sm mt-1">Update your personal information</p>
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
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interests (Comma separated)</label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="AI, Web Dev, Cloud"
                />
              </div>
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
