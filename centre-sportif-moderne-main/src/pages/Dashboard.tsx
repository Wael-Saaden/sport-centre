import {
  Users,
  Dumbbell,
  Calendar,
  CreditCard,
  TrendingUp,
  Activity as ActivityIcon,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/ui/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useApi } from "@/hooks/useApi";
import {
  bookingService,
  memberService,
  activityService,
  Booking,
} from "@/services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   DEMO CHART DATA
========================= */

const chartData = [
  { name: "Lun", revenus: 1200 },
  { name: "Mar", revenus: 1800 },
  { name: "Mer", revenus: 1400 },
  { name: "Jeu", revenus: 2200 },
  { name: "Ven", revenus: 2800 },
  { name: "Sam", revenus: 3200 },
  { name: "Dim", revenus: 1600 },
];

const Dashboard = () => {
  /* =========================
     DATA
  ========================= */

  const { data: members, loading: membersLoading } = useApi(
    memberService.getAll,
    []
  );

  const { data: activities, loading: activitiesLoading } = useApi(
    activityService.getAll,
    []
  );

  const { data: bookings, loading: bookingsLoading } = useApi(
    bookingService.getAll,
    []
  );

  const isLoading = membersLoading || activitiesLoading || bookingsLoading;

  /* =========================
     STATS
  ========================= */

  const totalMembers = members?.length || 0;
  const activeMembers = members?.filter((m) => m.active).length || 0;
  const totalActivities = activities?.length || 0;

  const today = new Date().toISOString().split("T")[0];
  const todayReservations =
    bookings?.filter((b) => b.id && today).length || 0;

  const recentReservations = bookings?.slice(0, 5) || [];

  /* =========================
     BADGES
  ========================= */

  const getStatusBadge = (status: Booking["status"]) => {
    const classes = {
      CONFIRMED: "badge-success",
      PENDING: "badge-warning",
      CANCELLED: "badge-danger",
    };

    const labels = {
      CONFIRMED: "Confirmée",
      PENDING: "En attente",
      CANCELLED: "Annulée",
    };

    return <span className={classes[status]}>{labels[status]}</span>;
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <MainLayout
      title="Tableau de bord"
      subtitle="Vue d'ensemble de votre centre sportif"
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Chargement du tableau de bord..." />
        </div>
      ) : (
        <>
          {/* ===== STATS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Membres"
              value={totalMembers}
              icon={Users}
              color="primary"
            />
            <StatCard
              title="Membres Actifs"
              value={activeMembers}
              icon={ActivityIcon}
              color="accent"
            />
            <StatCard
              title="Activités"
              value={totalActivities}
              icon={Dumbbell}
              color="warning"
            />
            <StatCard
              title="Réservations"
              value={bookings?.length || 0}
              icon={Calendar}
              color="accent"
            />
          </div>

          {/* ===== CHART + RECENT ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CHART */}
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Aperçu des Revenus
                  </h3>
                  <p className="text-sm text-muted-foreground">Cette semaine</p>
                </div>
                <TrendingUp className="w-5 h-5 text-success" />
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="colorRevenus"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(160, 84%, 39%)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(160, 84%, 39%)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenus"
                      stroke="hsl(160, 84%, 39%)"
                      fill="url(#colorRevenus)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RECENT RESERVATIONS */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Réservations Récentes
                </h3>
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>

              <div className="space-y-4">
                {recentReservations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune réservation récente
                  </p>
                ) : (
                  recentReservations.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          Réservation #{r.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Membre #{r.memberId} • Activité #{r.activityId}
                        </p>
                      </div>
                      {getStatusBadge(r.status)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default Dashboard;
