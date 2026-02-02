import { useEffect, useState } from "react";
import { Plus, Trash2, XCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useApi, useMutation } from "@/hooks/useApi";
import {
  bookingService,
  memberService,
  activityService,
  Booking,
  Member,
  Activity,
} from "@/services/api";

type ReservationForm = {
  memberId: string;
  activityId: string;
};

const Reservations = () => {
  /* =========================
     DATA
  ========================= */

  const {
    data,
    loading,
    error,
    refetch,
  } = useApi<Booking[]>(bookingService.getAll, []);

  // ✅ GARANTIT TOUJOURS UN TABLEAU
  const bookings: Booking[] = Array.isArray(data) ? data : [];

  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [form, setForm] = useState<ReservationForm>({
    memberId: "",
    activityId: "",
  });

  /* =========================
     LOAD MEMBERS & ACTIVITIES
  ========================= */

  useEffect(() => {
    memberService.getAll().then((r) => setMembers(r.data)).catch(() => {});
    activityService.getAll().then((r) => setActivities(r.data)).catch(() => {});
  }, []);

  /* =========================
     MUTATIONS
  ========================= */

  const createMutation = useMutation(bookingService.create, {
    successMessage: "Réservation créée",
    onSuccess: () => {
      setIsModalOpen(false);
      refetch();
    },
  });

  const cancelMutation = useMutation(bookingService.cancel, {
    successMessage: "Réservation annulée",
    onSuccess: refetch,
  });

  const deleteMutation = useMutation(bookingService.delete, {
    successMessage: "Réservation supprimée",
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      setSelectedBooking(null);
      refetch();
    },
  });

  /* =========================
     TABLE
  ========================= */

  const columns = [
    { key: "id", header: "ID" },
    {
      key: "member",
      header: "Membre",
      render: (b: Booking) => {
        const m = members.find((m) => m.id === b.memberId);
        return m ? `${m.firstName} ${m.lastName}` : "—";
      },
    },
    {
      key: "activity",
      header: "Activité",
      render: (b: Booking) => {
        const a = activities.find((a) => a.id === b.activityId);
        return a ? a.name : "—";
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (b: Booking) => (
        <span className="badge">{b.status}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (b: Booking) => (
        <div className="flex gap-2">
          {b.status !== "CANCELLED" && (
            <button onClick={() => cancelMutation.mutate(b.id)}>
              <XCircle className="w-4 h-4 text-warning" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedBooking(b);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  /* =========================
     RENDER
  ========================= */

  return (
    <MainLayout
      title="Gestion des Réservations"
      subtitle="Créer et gérer les réservations"
    >
      <div className="flex justify-between mb-4">
        <p className="text-muted-foreground">
          {bookings.length} réservation(s)
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="action-btn-accent"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réservation
        </button>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <p className="text-red-500 text-center">
          Impossible de charger les réservations (backend / CORS)
        </p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-muted-foreground text-center">
          Aucune réservation trouvée
        </p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <DataTable data={bookings} columns={columns} />
      )}

      {/* CREATE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouvelle réservation"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              memberId: Number(form.memberId),
              activityId: Number(form.activityId),
            });
          }}
          className="space-y-3"
        >
          <select
            className="input-field"
            value={form.memberId}
            onChange={(e) =>
              setForm({ ...form, memberId: e.target.value })
            }
            required
          >
            <option value="">-- Membre --</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.firstName} {m.lastName}
              </option>
            ))}
          </select>

          <select
            className="input-field"
            value={form.activityId}
            onChange={(e) =>
              setForm({ ...form, activityId: e.target.value })
            }
            required
          >
            <option value="">-- Activité --</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <button className="action-btn-accent w-full">
            Créer
          </button>
        </form>
      </Modal>

      {/* DELETE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer la réservation"
      >
        <button
          className="action-btn-danger w-full"
          onClick={() =>
            selectedBooking &&
            deleteMutation.mutate(selectedBooking.id)
          }
        >
          Supprimer
        </button>
      </Modal>
    </MainLayout>
  );
};

export default Reservations;
