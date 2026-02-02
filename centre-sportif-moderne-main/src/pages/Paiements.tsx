import { useState } from 'react';
import { Plus, CreditCard, Banknote, Building } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useApi, useMutation } from '@/hooks/useApi';
import { paiementsApi, membresApi, Paiement, stripeApi } from '@/services/api';
import StripePaymentModal from '@/components/payments/StripePaymentModal';

const Paiements = () => {
  const { data: paiements, loading, refetch } = useApi(paiementsApi.getAll, []);
  const { data: membres } = useApi(membresApi.getAll, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    membreId: 0,
    montant: 0,
    methode: 'carte' as Paiement['methode'],
    description: '',
  });

  const createMutation = useMutation(paiementsApi.create, {
    successMessage: 'Paiement enregistré avec succès',
    onSuccess: () => {
      setIsModalOpen(false);
      resetForm();
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      membreId: 0,
      montant: 0,
      methode: 'carte',
      description: '',
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.methode !== 'carte') {
      const membre = membres?.find((m) => m.id === formData.membreId);

await createMutation.mutate({
  membreId: formData.membreId,
  montant: formData.montant,
  methode: formData.methode,
  description: formData.description,
});

      return;
    }

    const res = await stripeApi.createIntent({
      memberId: formData.membreId,
      amount: Math.round(formData.montant * 100),
      durationInMonths: 1,
      description: formData.description,
    });

    setClientSecret(res.clientSecret);
  };

  const getStatutBadge = (statut: Paiement['statut']) => {
    const classes = {
      complete: 'badge-success',
      en_attente: 'badge-warning',
      echoue: 'badge-danger',
    };
    const labels = {
      complete: 'Complété',
      en_attente: 'En attente',
      echoue: 'Échoué',
    };
    return <span className={classes[statut]}>{labels[statut]}</span>;
  };

  const columns = [
    { key: 'membreNom', header: 'Membre' },
    { key: 'description', header: 'Description' },
    {
      key: 'montant',
      header: 'Montant',
      render: (p: Paiement) => `${p.montant.toLocaleString('fr-FR')} €`,
    },
    {
      key: 'methode',
      header: 'Méthode',
      render: (p: Paiement) => (
        <span className="flex gap-2 items-center">
          {p.methode === 'carte' && <CreditCard className="w-4 h-4" />}
          {p.methode === 'especes' && <Banknote className="w-4 h-4" />}
          {p.methode === 'virement' && <Building className="w-4 h-4" />}
          {p.methode}
        </span>
      ),
    },
    {
      key: 'statut',
      header: 'Statut',
      render: (p: Paiement) => getStatutBadge(p.statut),
    },
  ];

  return (
    <MainLayout title="Gestion des Paiements" subtitle="Suivez les paiements du centre">
      <div className="flex justify-end mb-4">
        <button onClick={handleOpenCreate} className="action-btn-accent">
          <Plus className="w-4 h-4" />
          Nouveau paiement
        </button>
      </div>

      <DataTable columns={columns} data={paiements || []} loading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enregistrer un paiement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            className="input-field"
            value={formData.membreId}
            onChange={(e) => setFormData({ ...formData, membreId: Number(e.target.value) })}
            required
          >
            <option value="">Sélectionner un membre</option>
            {membres?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.prenom} {m.nom}
              </option>
            ))}
          </select>

          <input
            className="input-field"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <input
            type="number"
            className="input-field"
            placeholder="Montant"
            value={formData.montant}
            onChange={(e) => setFormData({ ...formData, montant: Number(e.target.value) })}
          />

          <select
            className="input-field"
            value={formData.methode}
            onChange={(e) =>
              setFormData({ ...formData, methode: e.target.value as Paiement['methode'] })
            }
          >
            <option value="carte">Carte bancaire</option>
            <option value="especes">Espèces</option>
            <option value="virement">Virement</option>
          </select>

          <button type="submit" className="action-btn-accent w-full">
            Enregistrer
          </button>
        </form>
      </Modal>

      {clientSecret && (
        <StripePaymentModal
          clientSecret={clientSecret}
          onClose={() => setClientSecret(null)}
          onSuccess={() => {
            setClientSecret(null);
            setIsModalOpen(false);
            refetch();
          }}
        />
      )}
    </MainLayout>
  );
};

export default Paiements;
