import axios from "axios";

/* ======================================================
   CONFIG
====================================================== */

const API_GATEWAY =
  import.meta.env.VITE_API_URL || "http://localhost:8080";

const PAYMENT_SERVICE =
  import.meta.env.VITE_PAYMENT_URL || "http://localhost:8084";

/* ======================================================
   AXIOS CLIENT (API GATEWAY - BASIC AUTH)
====================================================== */

export const apiClient = axios.create({
  baseURL: API_GATEWAY,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const credentials = localStorage.getItem("auth_credentials");
  if (credentials) {
    config.headers.Authorization = `Basic ${credentials}`;
  }
  return config;
});

/* ======================================================
   AXIOS CLIENT (PAYMENT - JWT)
====================================================== */

const paymentClient = axios.create({
  baseURL: PAYMENT_SERVICE,
  headers: { "Content-Type": "application/json" },
});

let jwtToken: string | null = localStorage.getItem("jwt_token");

paymentClient.interceptors.request.use((config) => {
  if (jwtToken) {
    config.headers.Authorization = `Bearer ${jwtToken}`;
  }
  return config;
});

/* ======================================================
   TYPES BACKEND (EN)
====================================================== */

export type PaymentMethod = "CARD" | "CASH" | "TRANSFER";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface Activity {
  id: number;
  name: string;
  description: string;
  coach: string;
  maxCapacity: number;
  currentParticipants: number;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: number;
  memberId: number;
  activityId: number;
  status: "CONFIRMED" | "CANCELLED";
}

export interface Payment {
  id: number;
  memberId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  description: string;
}

/* ======================================================
   DTO BACKEND
====================================================== */

export type CreatePaymentDto = {
  memberId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
};

/* ======================================================
   STRIPE API (NODE SERVICE)
====================================================== */

export const stripeApi = {
  createIntent: (payload: {
    memberId: number;
    amount: number;
    durationInMonths: number;
    description: string;
  }) =>
    fetch("http://localhost:3001/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => res.json()),
};

/* ======================================================
   BACKEND SERVICES
====================================================== */

export const memberService = {
  getAll: () => apiClient.get<Member[]>("/api/members"),
  getById: (id: number) => apiClient.get<Member>(`/api/members/${id}`),
  create: (data: Omit<Member, "id">) =>
    apiClient.post<Member>("/api/members", data),
  update: (id: number, data: Partial<Member>) =>
    apiClient.put<Member>(`/api/members/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/members/${id}`),
};

export const activityService = {
  getAll: () => apiClient.get<Activity[]>("/api/activities"),
  getById: (id: number) =>
    apiClient.get<Activity>(`/api/activities/${id}`),
  create: (data: Omit<Activity, "id">) =>
    apiClient.post<Activity>("/api/activities", data),
  update: (id: number, data: Partial<Activity>) =>
    apiClient.put<Activity>(`/api/activities/${id}`, data),
  delete: (id: number) =>
    apiClient.delete(`/api/activities/${id}`),
};

export const bookingService = {
  getAll: () => apiClient.get<Booking[]>("/api/bookings"),
  create: (data: { memberId: number; activityId: number }) =>
    apiClient.post<Booking>("/api/bookings", data),
  delete: (id: number) =>
    apiClient.delete(`/api/bookings/${id}`),
      cancel: (id: number) =>
    apiClient.put<Booking>(`/api/bookings/${id}/cancel`),
};

/* ======================================================
   PAYMENT SERVICE (JWT)
====================================================== */

export const paymentService = {
  getToken: async (username: string, password: string) => {
    const res = await axios.post<{ token: string }>(
      `${PAYMENT_SERVICE}/api/public/auth/token`,
      { username, password }
    );
    jwtToken = res.data.token;
    localStorage.setItem("jwt_token", jwtToken);
    return res.data;
  },

  getAll: () => {
    if (!jwtToken) throw new Error("JWT requis");
    return paymentClient.get<Payment[]>("/api/payments");
  },

  create: (data: CreatePaymentDto) => {
    if (!jwtToken) throw new Error("JWT requis");
    return paymentClient.post<Payment>("/api/payments", data);
  },
};

/* ======================================================
   TYPES FRONT (FR)
====================================================== */

export interface Membre {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  statut: "actif" | "inactif";
}

export type Paiement = {
  id: number;
  membreId: number;
  membreNom: string;
  montant: number;
  methode: "carte" | "especes" | "virement";
  description: string;
  statut: "complete" | "en_attente" | "echoue";
  date: string;
};

/* ======================================================
   ADAPTERS FRONT
====================================================== */

export const membresApi = {
  getAll: async () => {
    const res = await memberService.getAll();
    return {
      data: res.data.map((m) => ({
        id: m.id,
        nom: m.lastName,
        prenom: m.firstName,
        email: m.email,
        telephone: m.phone,
        statut: m.active ? "actif" : "inactif",
      })),
    };
  },
};

export const paiementsApi = {
  getAll: async (): Promise<{ data: Paiement[] }> => {
    const res = await paymentService.getAll();
    return {
      data: res.data.map((p) => ({
        id: p.id,
        membreId: p.memberId,
        membreNom: "",
        montant: p.amount / 100,
        methode:
          p.paymentMethod === "CARD"
            ? "carte"
            : p.paymentMethod === "CASH"
            ? "especes"
            : "virement",
        description: p.description,
        statut:
          p.status === "COMPLETED"
            ? "complete"
            : p.status === "FAILED"
            ? "echoue"
            : "en_attente",
        date: new Date().toISOString(),
      })),
    };
  },

  create: async (data: {
    membreId: number;
    montant: number;
    methode: "carte" | "especes" | "virement";
    description: string;
  }) => {
    return paymentService.create({
      memberId: data.membreId,
      amount: Math.round(data.montant * 100),
      paymentMethod:
        data.methode === "carte"
          ? "CARD"
          : data.methode === "especes"
          ? "CASH"
          : "TRANSFER",
      description: data.description,
    });
  },
};

/* ======================================================
   AUTH
====================================================== */

export const authService = {
  login: async (username: string, password: string) => {
    localStorage.setItem(
      "auth_credentials",
      btoa(`${username}:${password}`)
    );
    await memberService.getAll();
    try {
      await paymentService.getToken(username, password);
    } catch {}
  },

  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },

  isAuthenticated: () =>
    !!localStorage.getItem("auth_credentials"),
};

export default apiClient;
