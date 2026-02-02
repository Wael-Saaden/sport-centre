import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useApi, useMutation } from "@/hooks/useApi";
import { activityService } from "@/services/api";

type Activity = {
  id: number;
  name: string;
  description: string;
  coach: string;
  maxCapacity: number;
  currentParticipants: number;
  startTime: string;
  endTime: string;
};

const Activites = () => {
  const { data: activities, loading, refetch } = useApi(
    activityService.getAll,
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    coach: "",
    maxCapacity: 10,
    startTime: "",
    endTime: "",
  });

  /* ================= CREATE / UPDATE ================= */

  const createMutation = useMutation(activityService.create, {
    successMessage: "Activité créée avec succès",
    onSuccess: () => {
      setIsModalOpen(false);
      resetForm();
      refetch();
    },
  });

  const updateMutation = useMutation(
    (data: { id: number; payload: any }) =>
      activityService.update(data.id, data.payload),
    {
      successMessage: "Activité modifiée avec succès",
      onSuccess: () => {
        setIsModalOpen(false);
        resetForm();
        refetch();
      },
    }
  );

  const deleteMutation = useMutation(activityService.delete, {
    successMessage: "Activité supprimée",
    onSuccess: () => refetch(),
  });

  /* ================= HANDLERS ================= */

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      coach: "",
      maxCapacity: 10,
      startTime: "",
      endTime: "",
    });
    setSelectedActivity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      currentParticipants: 0,
    };

    if (selectedActivity) {
      await updateMutation.mutate({
        id: selectedActivity.id,
        payload,
      });
    } else {
      await createMutation.mutate(payload);
    }
  };

  /* ================= TABLE ================= */

  const columns = [
    {
      key: "name",
      header: "Activité",
      render: (a: Activity) => (
        <div>
          <p className="font-medium">{a.name}</p>
          <p className="text-xs text-muted-foreground">
            {a.currentParticipants}/{a.maxCapacity}
          </p>
        </div>
      ),
    },
    {
      key: "coach",
      header: "Coach",
      render: (a: Activity) => a.coach,
    },
    {
      key: "actions",
      header: "Actions",
      render: (a: Activity) => (
        <div className="flex gap-2">
          <button onClick={() => {
            setSelectedActivity(a);
            setForm(a);
            setIsModalOpen(true);
          }}>
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => deleteMutation.mutate(a.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout title="Gestion des Activités">
      <div className="flex justify-between mb-4">
        <p>{activities?.length || 0} activité(s)</p>
        <button onClick={() => setIsModalOpen(true)} className="action-btn-accent">
          <Plus className="w-4 h-4" /> Nouvelle activité
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <DataTable data={activities || []} columns={columns} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedActivity ? "Modifier activité" : "Nouvelle activité"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input placeholder="Nom" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Coach" value={form.coach}
            onChange={(e) => setForm({ ...form, coach: e.target.value })} />
          <input type="number" placeholder="Capacité"
            value={form.maxCapacity}
            onChange={(e) => setForm({ ...form, maxCapacity: Number(e.target.value) })} />
          <input type="datetime-local" value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <input type="datetime-local" value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })} />

          <button type="submit" className="action-btn-accent">
            {selectedActivity ? "Modifier" : "Créer"}
          </button>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default Activites;
