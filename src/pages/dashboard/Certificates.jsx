import { useEffect, useState } from "react";
import { Award, Download, CalendarDays, MapPin, Loader2, Trophy, AlertCircle } from "lucide-react";
import { getMyRegistrations, getAllEvents, downloadCertificate } from "@/services/eventService";
import { useToast } from "@/context/ToastContext";

export default function Certificates() {
  const toast = useToast();
  const [attendedEvents, setAttendedEvents] = useState([]);   // [{reg, event}]
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState("");
  const [downloading, setDownloading]       = useState(null); // registrationId being downloaded

  /* ── Load attended registrations ───────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [regRes, eventsRes] = await Promise.all([
          getMyRegistrations(),
          getAllEvents(),
        ]);

        const allEvents     = eventsRes.data;
        const registrations = regRes.data;

        // Keep only registrations marked as attended
        const attended = registrations
          .filter((r) => r.attended)
          .map((r) => ({
            reg:   r,
            event: allEvents.find((e) => String(e.id) === String(r.eventId)),
          }))
          .filter((item) => item.event); // drop orphans

        setAttendedEvents(attended);
      } catch (err) {
        console.error(err);
        setError("Failed to load certificates. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  /* ── Download handler ───────────────────────────────────────────────── */
  const handleDownload = async (registrationId, eventTitle) => {
    setDownloading(registrationId);
    try {
      const res  = await downloadCertificate(registrationId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url  = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute(
        "download",
        `certificate_${eventTitle.replace(/\s+/g, "_")}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  /* ── Format date ────────────────────────────────────────────────────── */
  const formatDate = (d) => {
    if (!d) return "TBD";
    if (Array.isArray(d))
      return new Date(d[0], d[1] - 1, d[2]).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-indigo-600" />
            My Certificates
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Certificates are issued after attendance is confirmed by your faculty.
          </p>
        </div>

        {!isLoading && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3 text-center">
            <p className="text-2xl font-black text-indigo-600">{attendedEvents.length}</p>
            <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Earned</p>
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-10 w-10 animate-spin mb-3 text-indigo-400" />
          <p className="text-sm font-medium">Loading your certificates…</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && attendedEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mb-5">
            <Award className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">No certificates yet</h2>
          <p className="text-gray-400 text-sm max-w-xs">
            Attend events and ask your faculty to mark your attendance. Your certificates will appear here.
          </p>
        </div>
      )}

      {/* Certificate cards */}
      {!isLoading && !error && attendedEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {attendedEvents.map(({ reg, event }) => (
            <CertificateCard
              key={reg.id}
              event={event}
              registrationId={reg.id}
              formatDate={formatDate}
              isDownloading={downloading === reg.id}
              onDownload={() => handleDownload(reg.id, event.title)}
            />
          ))}
        </div>
      )}

    </div>
  );
}

/* ── Certificate Card ─────────────────────────────────────────────────── */
function CertificateCard({ event, registrationId, formatDate, isDownloading, onDownload }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">

      {/* Gradient banner */}
      <div className="h-28 bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black/10" />
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
        <Award className="relative z-10 h-12 w-12 text-white/90 drop-shadow-lg" />
      </div>

      {/* Body */}
      <div className="flex-1 p-5 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
            Certificate of Participation
          </p>
          <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
            {event.title}
          </h2>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <span>{formatDate(event.eventDate)}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <MapPin className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Attended badge */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold uppercase tracking-wide rounded-full px-3 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Attended
        </div>
      </div>

      {/* Download button */}
      <div className="px-5 pb-5">
        <button
          id={`download-cert-${registrationId}`}
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download Certificate
            </>
          )}
        </button>
      </div>
    </div>
  );
}