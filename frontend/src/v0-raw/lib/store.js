"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { evaluateVitals, uid } from "./clinical";
import { seedDashboard, seedMlMetrics, seedPatients, seedReferrals, seedVitals, } from "./mock-data";
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const StoreContext = createContext(null);
export function StoreProvider({ children }) {
    const [user, setUser] = useState(null);
    const [patients, setPatients] = useState(seedPatients);
    const [vitals, setVitals] = useState(seedVitals);
    const [referrals, setReferrals] = useState(seedReferrals);
    const [triageHistory, setTriageHistory] = useState([]);
    const [syncState, setSyncState] = useState("online");
    const pendingSync = useMemo(() => patients.filter((p) => !p.synced).length, [patients]);
    const login = useCallback(async (email, role, facility) => {
        await delay(500);
        const newUser = {
            id: uid("usr"),
            fullName: email.split("@")[0].replace(/[._]/g, " ") || "Clinician",
            email,
            role,
            facility,
        };
        setUser(newUser);
        return newUser;
    }, []);
    const register = useCallback(async (input) => {
        await delay(600);
        const newUser = {
            id: uid("usr"),
            fullName: input.fullName,
            email: input.email,
            role: input.role,
            facility: input.facility,
        };
        setUser(newUser);
        return newUser;
    }, []);
    const logout = useCallback(() => setUser(null), []);
    const createPatient = useCallback(async (input) => {
        await delay(400);
        const online = syncState === "online";
        const patient = {
            ...input,
            id: uid("pat"),
            riskZone: input.previousPreeclampsia ? "yellow" : "green",
            syndrome: "none",
            lastVisit: new Date().toISOString(),
            synced: online,
        };
        setPatients((prev) => [patient, ...prev]);
        setVitals((prev) => ({ ...prev, [patient.id]: [] }));
        return patient;
    }, [syncState]);
    const getVitals = useCallback((patientId) => vitals[patientId] ?? [], [vitals]);
    const extractOcr = useCallback(async () => {
        await delay(1800);
        return {
            systolic: 158 + Math.round(Math.random() * 10),
            diastolic: 104 + Math.round(Math.random() * 8),
            heartRate: 92 + Math.round(Math.random() * 10),
            spo2: 94 + Math.round(Math.random() * 3),
            temperature: Number((36.8 + Math.random() * 0.9).toFixed(1)),
            confidence: Number((0.9 + Math.random() * 0.08).toFixed(3)),
        };
    }, []);
    const evaluateTriage = useCallback(async (v, patientId) => {
        await delay(700);
        const patient = patientId ? patients.find((p) => p.id === patientId) : undefined;
        const base = evaluateVitals(v, patient?.previousPreeclampsia);
        const result = {
            ...base,
            id: uid("trg"),
            patientId,
            evaluatedAt: new Date().toISOString(),
        };
        setTriageHistory((prev) => [result, ...prev].slice(0, 25));
        if (patientId) {
            setPatients((prev) => prev.map((p) => p.id === patientId
                ? { ...p, riskZone: result.riskZone, syndrome: result.syndrome, lastVisit: result.evaluatedAt }
                : p));
            setVitals((prev) => {
                const existing = prev[patientId] ?? [];
                const record = {
                    ...v,
                    id: uid("vit"),
                    patientId,
                    recordedAt: result.evaluatedAt,
                    visitLabel: `Visit ${existing.length + 1}`,
                };
                return { ...prev, [patientId]: [...existing, record] };
            });
        }
        return result;
    }, [patients]);
    const createReferral = useCallback((result) => {
        const patient = result.patientId
            ? patients.find((p) => p.id === result.patientId)
            : undefined;
        const referral = {
            id: uid("ref"),
            patientId: result.patientId ?? "unassigned",
            patientName: patient?.fullName ?? "Unassigned Patient",
            syndrome: result.syndrome,
            riskZone: result.riskZone,
            status: "pending",
            createdAt: new Date().toISOString(),
            slaMinutes: 0,
            actions: [],
        };
        setReferrals((prev) => [referral, ...prev]);
        return referral;
    }, [patients]);
    const addReferralAction = useCallback(async (referralId, type, note) => {
        await delay(300);
        setReferrals((prev) => prev.map((r) => r.id === referralId
            ? {
                ...r,
                actions: [
                    ...r.actions,
                    { id: uid("act"), type, note, timestamp: new Date().toISOString() },
                ],
            }
            : r));
    }, []);
    const advanceReferral = useCallback((referralId, status) => {
        setReferrals((prev) => prev.map((r) => (r.id === referralId ? { ...r, status } : r)));
    }, []);
    const toggleConnectivity = useCallback(() => {
        setSyncState((prev) => (prev === "online" ? "offline" : "online"));
    }, []);
    const syncBatch = useCallback(async () => {
        await delay(1400);
        const count = patients.filter((p) => !p.synced).length;
        setPatients((prev) => prev.map((p) => ({ ...p, synced: true })));
        setSyncState("online");
        return count;
    }, [patients]);
    const value = {
        user,
        patients,
        referrals,
        triageHistory,
        dashboard: seedDashboard,
        mlMetrics: seedMlMetrics,
        syncState,
        pendingSync,
        login,
        register,
        logout,
        createPatient,
        getVitals,
        extractOcr,
        evaluateTriage,
        createReferral,
        addReferralAction,
        advanceReferral,
        toggleConnectivity,
        syncBatch,
    };
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx)
        throw new Error("useStore must be used within StoreProvider");
    return ctx;
}
