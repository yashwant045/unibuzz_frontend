import React, { useState, useEffect } from 'react';
import { registerEvent, getEventRegistrations, getMyRegistrations, markAttended, updateEvent, deleteEvent } from "@/services/eventService";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, MapPin, Users, Mail, GraduationCap, CheckCircle2, Circle, Loader2, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

function EventCard({ event, isPast = false, onEventUpdated }) {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrations, setRegistrations] = useState([]);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    location: "",
    seats: "",
    category: "Workshop"
  });

  const { isStudent, isFaculty } = React.useMemo(() => {
    const token = localStorage.getItem("token");
    let role = "";
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        role = payload.role;
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
    return {
      isStudent: role === "STUDENT",
      isFaculty: role === "FACULTY"
    };
  }, []);

  const [myRegistrations, setMyRegistrations] = useState([]);

  useEffect(() => {
    if (isStudent) {
      const fetchMyRegistrations = async () => {
        try {
          const res = await getMyRegistrations();
          setMyRegistrations(res.data);
        } catch (err) {}
      };
      fetchMyRegistrations();
    }
  }, [isStudent]);

  const alreadyRegistered = myRegistrations.some(r => String(r.eventId) === String(event.id));

  const formatDateForInput = (d) => {
    if (!d) return "";
    if (Array.isArray(d)) {
      const year = d[0];
      const month = String(d[1]).padStart(2, '0');
      const day = String(d[2]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (typeof d === 'string') {
      return d.split('T')[0];
    }
    return "";
  };

  const handleOpenEditModal = () => {
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      eventDate: formatDateForInput(event.eventDate),
      eventTime: event.eventTime || "",
      location: event.location || "",
      seats: event.seats || "",
      category: event.category || "Workshop"
    });
    setShowEditModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      toast.success("Event deleted successfully!");
      setShowDeleteModal(false);
      if (onEventUpdated) {
        onEventUpdated();
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to delete event: " + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (editForm.eventDate < todayStr) {
      toast.warning("Event date cannot be in the past.");
      return;
    }

    if (editForm.eventDate === todayStr && editForm.eventTime) {
      const now = new Date();
      const [h, m] = editForm.eventTime.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(h, m, 0, 0);
      if (selectedTime < now) {
        toast.warning("Event time cannot be in the past for today's date.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateEvent(event.id, {
        ...editForm,
        seats: parseInt(editForm.seats, 10) || 0
      });
      toast.success("Event updated successfully!");
      setShowEditModal(false);
      if (onEventUpdated) {
        onEventUpdated();
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast.error("Failed to update event: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    if (!event.id || alreadyRegistered || isRegistering) return;
    setIsRegistering(true);
    try {
      await registerEvent(event.id);
      toast.success("Seat booked successfully! 🎉");
      if (onEventUpdated) {
        onEventUpdated();
      } else {
        window.location.reload();
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      if (message.toLowerCase().includes("already registered")) {
        toast.info("You are already registered for this event!");
      } else if (message.toLowerCase().includes("full") || message.toLowerCase().includes("booked")) {
        toast.error("Seat booking failed: Event is fully booked!");
      } else {
        toast.error("Seat booking failed: " + message);
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleViewRegistrations = async () => {
    if (!event.id) return;
    try {
      const res = await getEventRegistrations(event.id);
      setRegistrations(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch registrations", err);
    }
  };

  // ── Mark attendance handler ───────────────────────────────────────────
  const [marking, setMarking] = useState(null); // studentEmail being toggled

  const handleToggleAttendance = async (studentEmail) => {
    setMarking(studentEmail);
    try {
      const res = await markAttended(event.id, studentEmail);
      const newAttended = res.data.attended; // use server's truth
      setRegistrations((prev) =>
        prev.map((r) =>
          r.studentEmail === studentEmail ? { ...r, attended: newAttended } : r
        )
      );
      toast.success(newAttended ? "Student marked as present" : "Attendance unmarked");
    } catch (err) {
      console.error("Failed to toggle attendance", err);
      toast.error("Could not update attendance. Please try again.");
    } finally {
      setMarking(null);
    }
  };

  // Robust date formatting
  const formattedDate = React.useMemo(() => {
    const d = event.eventDate;
    if (!d) return "TBD";
    if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`;
    return d;
  }, [event.eventDate]);

  // Format 24-hour time string (e.g. "14:30") to 12-hour AM/PM format (e.g. "2:30 PM")
  const formattedTime = React.useMemo(() => {
    const timeStr = event.eventTime;
    if (!timeStr) return "";
    if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
      return timeStr;
    }
    const [hourStr, minuteStr] = timeStr.split(":");
    if (!hourStr || !minuteStr) return timeStr;
    
    let hour = parseInt(hourStr, 10);
    const minute = minuteStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    
    return `${hour}:${minute} ${ampm}`;
  }, [event.eventTime]);

  const percentageFilled = event.seats ? Math.min(100, Math.round(((event.registeredCount || 0) / event.seats) * 100)) : 0;
  const isFull = percentageFilled >= 100;

  const attendedCount = registrations.filter((r) => r.attended).length;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200 flex flex-col h-full bg-white group rounded-2xl">
        {/* Banner area */}
        <div className={`h-24 relative overflow-hidden flex items-start justify-between p-3 ${isPast ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600'}`}>
          <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:bg-transparent"></div>
          <div>
            {event.category && (
              <Badge className="relative z-10 bg-white/90 text-indigo-700 hover:bg-white border-none shadow-sm backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                {event.category}
              </Badge>
            )}
          </div>
          {isFaculty && (
            <div className="relative z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal();
                }}
                className="bg-white/90 hover:bg-white text-indigo-700 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-105"
                title="Edit Event"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="bg-white/90 hover:bg-red-50 text-red-600 p-1.5 rounded-full shadow-sm backdrop-blur-sm transition-all hover:scale-105"
                title="Delete Event"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <CardContent className="flex-grow flex flex-col p-5 pt-4">
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
            {event.title}
          </h2>

          {event.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="mt-auto space-y-2">
            <div className="flex items-center text-sm text-gray-600 gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="font-medium truncate">{formattedDate}</span>
              {formattedTime && (
                <span className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md ml-auto">
                  <Clock className="h-3 w-3" />
                  {formattedTime}
                </span>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-600 gap-2">
              <MapPin className="h-4 w-4 text-purple-500 shrink-0" />
              <span className="font-medium truncate">{event.location || "TBA"}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600 gap-2">
              <GraduationCap className="h-4 w-4 text-pink-500 shrink-0" />
              <span className="font-medium truncate">{event.facultyEmail || "Faculty"}</span>
            </div>
            
            <div className="pt-3 mt-1 border-t border-gray-100">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span>{event.registeredCount || 0} / {event.seats || '∞'} Booked</span>
                </div>
                {isFull ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                    Fully Booked
                  </span>
                ) : (event.seats && (event.seats - (event.registeredCount || 0)) <= 5) ? (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                    🔥 Only {event.seats - (event.registeredCount || 0)} Left
                  </span>
                ) : (
                  <span className="text-xs font-bold text-indigo-600">{percentageFilled}%</span>
                )}
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                  style={{ width: `${percentageFilled}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 bg-gray-50 border-t border-gray-100">
          {isStudent && (
            <Button
              disabled={alreadyRegistered || (isFull && !alreadyRegistered) || isRegistering}
              onClick={handleRegister}
              className={`w-full font-semibold tracking-wide flex items-center justify-center gap-2 ${
                alreadyRegistered 
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none font-bold" 
                  : isFull 
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              }`}
              variant={alreadyRegistered ? "outline" : "default"}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Securing Seat...
                </>
              ) : alreadyRegistered ? (
                "✓ Seat Registered"
              ) : isFull ? (
                "Fully Booked"
              ) : (
                "Book Seat Now"
              )}
            </Button>
          )}
          
          {isFaculty && (
            <div className="w-full flex items-center gap-2">
              <Button
                onClick={handleViewRegistrations}
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-semibold tracking-wide shadow-md text-xs py-2"
              >
                Registrations
              </Button>
              <Button
                onClick={handleOpenEditModal}
                variant="outline"
                className="px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-semibold"
                title="Edit Details"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                className="px-3 border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                title="Delete Event"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          )}
          
          {!isStudent && !isFaculty && (
            <Button disabled variant="outline" className="w-full">
              Login to Register
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* ── Edit Event Modal ── */}
      {showEditModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Faculty Portal</p>
                <h2 className="text-xl font-bold">Edit Event Details</h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center text-base"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={editForm.eventDate}
                    onChange={(e) => setEditForm({ ...editForm, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Event Time
                  </label>
                  <input
                    type="time"
                    required
                    value={editForm.eventTime}
                    onChange={(e) => setEditForm({ ...editForm, eventTime: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium bg-white"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Coding">Coding</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Technical">Technical</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Total Seats
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editForm.seats}
                  onChange={(e) => setEditForm({ ...editForm, seats: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Pretty On-Screen Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-200"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.7)" }}
          onClick={() => !isDeleting && setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm p-6 overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200 border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Warning Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 shadow-sm">
                <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                Delete Event?
              </h3>

              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Are you sure you want to delete <strong className="text-gray-800">"{event.title}"</strong>?
                <br />
                <span className="text-xs text-red-500 font-medium mt-1 block">
                  This action cannot be undone and registered students will be notified.
                </span>
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-sm font-semibold shadow-lg shadow-red-500/25 hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Registration + Attendance Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-5 text-white flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                    Registrations & Attendance
                  </p>
                  <h2 className="text-xl font-bold text-white truncate">
                    {event.title}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-shrink-0 text-slate-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full flex items-center justify-center text-lg leading-none"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-300" />
                  <span className="text-sm font-semibold text-white">
                    {registrations.length}
                    <span className="text-slate-400 font-normal"> registered</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/20 rounded-lg px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">
                    {attendedCount}
                    <span className="text-emerald-400/70 font-normal"> present</span>
                  </span>
                </div>
              </div>

              {/* Faculty hint */}
              {isFaculty && registrations.length > 0 && (
                <p className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-500" />
                  Click <strong className="text-slate-300">Mark Present</strong> to enable certificate download for a student.
                </p>
              )}
            </div>

            {/* ── Student List ── */}
            <div className="flex-1 overflow-y-auto bg-gray-50 px-5 py-4">
              {registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-7 w-7 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-semibold">No registrations yet</p>
                  <p className="text-gray-400 text-sm mt-1">Students who register will appear here.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {registrations.map((reg, index) => {
                    const isAttended   = reg.attended;
                    const isBeingMarked = marking === reg.studentEmail;

                    return (
                      <div
                        key={reg.id ?? index}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all duration-200 ${
                          isAttended
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-sm"
                        }`}
                      >
                        {/* Index */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
                          isAttended
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        }`}>
                          {index + 1}
                        </div>

                        {/* Student info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {reg.studentName || reg.studentEmail || reg.studentId || "—"}
                          </p>
                          {reg.studentEmail && reg.studentName && (
                            <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3" />
                              {reg.studentEmail}
                            </p>
                          )}
                        </div>

                        {/* Attendance control (faculty only) */}
                        {isFaculty ? (
                          <button
                            id={`toggle-present-${reg.id}`}
                            onClick={() => handleToggleAttendance(reg.studentEmail)}
                            disabled={isBeingMarked}
                            title={isAttended ? "Click to undo attendance" : "Mark as present"}
                            className={`flex-shrink-0 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                              isAttended
                                ? "text-emerald-700 bg-emerald-100 border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                : "text-slate-600 bg-slate-100 border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600"
                            }`}
                          >
                            {isBeingMarked ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isAttended ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                            {isBeingMarked ? "Saving…" : isAttended ? "Present" : "Mark Present"}
                          </button>
                        ) : (
                          <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                            isAttended
                              ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                              : "text-gray-500 bg-gray-50 border-gray-200"
                          }`}>
                            {isAttended ? "Present" : "Registered"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex-shrink-0 px-5 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                <span className="font-bold text-gray-800">{attendedCount}</span> / {registrations.length} marked present
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EventCard;
