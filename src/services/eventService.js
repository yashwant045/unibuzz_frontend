import API from "./api";

export const getAllEvents = () => {
  return API.get("/api/events");
};

export const createEvent = (data) => {
  return API.post("/api/events", data);
};

export const getMyEvents = () => {
  return API.get("/api/events/my");
};

export const deleteEvent = (id) => {
  return API.delete(`/api/events/${id}`);
};

export const updateEvent = (id, data) => {
  return API.put(`/api/events/${id}`, data);
};

export const registerEvent = (eventId) => {
  return API.post(`/api/registrations/${eventId}`);
};

export const getMyRegistrations = () => {
  return API.get("/api/registrations/my");
};

export const getEventRegistrations = (eventId) => {
  return API.get(`/api/registrations/event/${eventId}`);
};

/**
 * Downloads a PDF certificate for a given registrationId.
 * responseType: 'blob' is required to receive binary data correctly.
 */
export const downloadCertificate = (registrationId) => {
  return API.get(`/api/certificates/download/${registrationId}`, {
    responseType: "blob",
  });
};

/**
 * Faculty marks a student as attended for a specific event.
 * PUT /api/registrations/{eventId}/attend?studentEmail=...
 */
export const markAttended = (eventId, studentEmail) => {
  return API.put(`/api/registrations/${eventId}/attend`, null, {
    params: { studentEmail },
  });
};

/**
 * Robust helper to check if an event date + time has expired.
 */
export const isEventExpired = (event) => {
  if (!event || !event.eventDate) return true;
  const now = new Date();
  
  let eventDateObj;
  if (Array.isArray(event.eventDate)) {
    eventDateObj = new Date(event.eventDate[0], event.eventDate[1] - 1, event.eventDate[2]);
  } else {
    eventDateObj = new Date(event.eventDate);
  }
  
  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);
  
  const eventDateZero = new Date(eventDateObj);
  eventDateZero.setHours(0, 0, 0, 0);
  
  if (eventDateZero < todayZero) return true;
  if (eventDateZero > todayZero) return false;
  
  // Same day: check eventTime if specified
  if (event.eventTime) {
    try {
      const timeStr = event.eventTime.trim().toUpperCase();
      let hour = 0, minute = 0;
      if (timeStr.includes("AM") || timeStr.includes("PM")) {
        const isPm = timeStr.includes("PM");
        const clean = timeStr.replace("AM", "").replace("PM", "").trim();
        const parts = clean.split(":");
        hour = parseInt(parts[0], 10);
        minute = parts[1] ? parseInt(parts[1], 10) : 0;
        if (isPm && hour < 12) hour += 12;
        if (!isPm && hour === 12) hour = 0;
      } else {
        const parts = timeStr.split(":");
        hour = parseInt(parts[0], 10);
        minute = parts[1] ? parseInt(parts[1], 10) : 0;
      }
      const eventTimeObj = new Date();
      eventTimeObj.setHours(hour, minute, 0, 0);
      return now > eventTimeObj;
    } catch (e) {}
  }
  return false;
};
