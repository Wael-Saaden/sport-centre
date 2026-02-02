import { useState } from "react";
import { Plus, Edit, Trash2, Mail } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useApi, useMutation } from "@/hooks/useApi";
import { memberService, Member } from "@/services/api";

const Membres = () => {
  /* =========================
     DATA
  ========================= */

  const { data: membres, loading, refetch } = useApi(
    memberService.getAll,
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  /* =========================
     MUTATIONS
  ========================= */

  const createMutation = useMutation(memberService.create, {
    successMessage: "Membre créé avec succès",
    onSuccess: () => {
      closeModal();
      refetch();
    },
  });

  const updateMutation = useMutation(
    (data: { id: number; member: Partial<Member> }) =>
      memberService.update(data.id, data.member),
    {
      successMessage: "Membre modifié avec succès",
      onSuccess: () => {
        closeModal();
        refetch();
      },
    }
  );

  const deleteMutation = useMutation(memberService.delete, {
    successMessage: "Membre supprimé avec succès",
    onSuccess: () => {
      setIsDeleteModalOpen(false);
      setSelectedMember(null);
      refetch();
    },
  });

  /* =========================
     HANDLERS
  ========================= */

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    setSelectedMember(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setSelectedMember(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone || "",
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (member: Member) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedMember) {
      await updateMutation.mutate({
        id: selectedMember.id,
        member: formData,
      });
    } else {
      await createMutation.mutate({
        ...formData,
        active: true,
      });
    }
  };

  const handleDelete = async () => {
    if (selectedMember) {
      await deleteMutation.mutate(selectedMember.id);
    }
  };

  /* =========================
     TABLE
  ========================= */

  const columns = [
    {
      key: "name",
      header: "Membre",
      render: (m: Member) => (
        <div>
          <p className="font-medium text-foreground">
            {m.firstName} {m.lastName}
          </p>
          <p className="text-xs flex items-center gap-1 text-muted-foreground">
            <Mail className="w-3 h-3" /> {m.email}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (m: Member) => (
        <div className="flex gap-2">
          <button onClick={() => handleOpenEdit(m)}>
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => handleOpenDelete(m)}>
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
      title="Gestion des Membres"
      subtitle="Gérez les membres de votre centre"
    >
      <div className="flex justify-between mb-4">
        <p className="text-muted-foreground">
          {membres?.length || 0} membre(s)
        </p>
        <button onClick={handleOpenCreate} className="action-btn-accent">
          <Plus className="w-4 h-4" />
          Nouveau
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <DataTable data={membres || []} columns={columns} />
      )}

      {/* CREATE / EDIT */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedMember ? "Modifier le membre" : "Nouveau membre"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            placeholder="Prénom"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            placeholder="Nom"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="input-field"
            required
          />
          <input
            placeholder="Téléphone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="input-field"
          />

          <button
            className="action-btn-accent w-full"
            disabled={createMutation.loading || updateMutation.loading}
          >
            {selectedMember ? "Modifier" : "Créer"}
          </button>
        </form>
      </Modal>

      {/* DELETE */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Supprimer le membre"
      >
        <p className="mb-4">
          Supprimer{" "}
          <strong>
            {selectedMember?.firstName} {selectedMember?.lastName}
          </strong>{" "}
          ?
        </p>
        <button
          onClick={handleDelete}
          className="action-btn-danger w-full"
          disabled={deleteMutation.loading}
        >
          Supprimer
        </button>
      </Modal>
    </MainLayout>
  );
};

export default Membres;
