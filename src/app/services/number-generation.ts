import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import type { PosSale } from "../types/pos-sale";
import type { RepairTicket } from "../types/repair-ticket";

type NumberKind = "device" | "invoice" | "serial";

type NumberConfig = {
  prefix: string;
  legacyPrefixes?: string[];
  minWidth: number;
  appStateKeys: string[];
  fields: string[];
};

const configs: Record<NumberKind, NumberConfig> = {
  device: {
    prefix: "DEV",
    legacyPrefixes: ["TKT"],
    minWidth: 4,
    appStateKeys: ["gamingtech_repairTickets"],
    fields: ["ticketNumber", "id", "deviceNumber"],
  },
  invoice: {
    prefix: "INV",
    minWidth: 4,
    appStateKeys: ["gamingtech_posSales", "gamingtech_repairTickets"],
    fields: ["id", "invoiceNumber"],
  },
  serial: {
    prefix: "SN",
    minWidth: 5,
    appStateKeys: ["gamingtech_repairTickets"],
    fields: ["serialNumber"],
  },
};

const sequencePattern = (prefix: string) => new RegExp(`^${prefix}-(\\d+)$`, "i");

function formatNumber(prefix: string, sequence: number, minWidth: number) {
  return `${prefix}-${String(sequence).padStart(minWidth, "0")}`;
}

function readSequence(value: unknown, prefix: string) {
  if (typeof value !== "string") return null;

  const match = value.trim().match(sequencePattern(prefix));
  if (!match) return null;

  const sequence = Number(match[1]);
  return Number.isSafeInteger(sequence) && sequence > 0 ? sequence : null;
}

function readAnySequence(value: unknown, config: NumberConfig) {
  const prefixes = [config.prefix, ...(config.legacyPrefixes ?? [])];

  for (const prefix of prefixes) {
    const sequence = readSequence(value, prefix);
    if (sequence !== null) return sequence;
  }

  return null;
}

function existingNumbersFromRecords(records: unknown, config: NumberConfig) {
  if (!Array.isArray(records)) return new Set<string>();

  return records.reduce((numbers, record) => {
    if (!record || typeof record !== "object") return numbers;

    for (const field of config.fields) {
      const value = (record as Record<string, unknown>)[field];
      if (typeof value === "string" && readAnySequence(value, config) !== null) {
        numbers.add(value.trim().toUpperCase());
      }
    }

    return numbers;
  }, new Set<string>());
}

function latestSequenceFromRecords(records: unknown, config: NumberConfig) {
  let latest = 0;

  for (const value of existingNumbersFromRecords(records, config)) {
    latest = Math.max(latest, readAnySequence(value, config) ?? 0);
  }

  return latest;
}

export async function generateNextNumber(kind: NumberKind) {
  const config = configs[kind];
  const counterRef = doc(db, "numberCounters", kind);
  const stateRefs = config.appStateKeys.map((key) => doc(db, "appState", key));

  return runTransaction(db, async (transaction) => {
    const [counterSnapshot, ...stateSnapshots] = await Promise.all([
      transaction.get(counterRef),
      ...stateRefs.map((stateRef) => transaction.get(stateRef)),
    ]);

    const records = stateSnapshots.flatMap((snapshot) => {
      const value = snapshot.data()?.value;
      return Array.isArray(value) ? value : [];
    });
    const existingNumbers = existingNumbersFromRecords(records, config);
    const latestExistingSequence = latestSequenceFromRecords(records, config);
    const latestCounterSequence = Number(counterSnapshot.data()?.lastSequence ?? 0);
    let nextSequence = Math.max(latestExistingSequence, latestCounterSequence) + 1;
    let nextValue = formatNumber(config.prefix, nextSequence, config.minWidth);

    while (existingNumbers.has(nextValue.toUpperCase())) {
      nextSequence += 1;
      nextValue = formatNumber(config.prefix, nextSequence, config.minWidth);
    }

    const reservationRef = doc(db, "numberReservations", `${kind}_${nextValue}`);
    const reservationSnapshot = await transaction.get(reservationRef);
    if (reservationSnapshot.exists()) {
      throw new Error(`${nextValue} is already reserved. Please save again.`);
    }

    transaction.set(counterRef, {
      kind,
      prefix: config.prefix,
      minWidth: config.minWidth,
      lastSequence: nextSequence,
      lastValue: nextValue,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    transaction.set(reservationRef, {
      kind,
      value: nextValue,
      sequence: nextSequence,
      createdAt: serverTimestamp(),
    });

    return nextValue;
  });
}

export async function generateRepairNumbers() {
  const [deviceNumber, internalSerialNumber, invoiceNumber] = await Promise.all([
    generateNextNumber("device"),
    generateNextNumber("serial"),
    generateNextNumber("invoice"),
  ]);

  return { deviceNumber, internalSerialNumber, invoiceNumber };
}

export async function generateInvoiceNumber() {
  return generateNextNumber("invoice");
}

export async function valueExists(kind: NumberKind, value: string, excludeId?: string) {
  const config = configs[kind];
  const remoteSnapshots = await Promise.all(config.appStateKeys.map((key) => getDoc(doc(db, "appState", key))));
  const remoteRecords = remoteSnapshots.flatMap((snapshot) => {
    const value = snapshot.data()?.value;
    return Array.isArray(value) ? value : [];
  });
  const records = remoteRecords;
  const normalizedValue = value.trim().toUpperCase();

  if (!Array.isArray(records)) return false;

  return records.some((record) => {
    if (!record || typeof record !== "object") return false;
    if (excludeId && (record as { id?: string }).id === excludeId) return false;

    return config.fields.some((field) => {
      const fieldValue = (record as Record<string, unknown>)[field];
      return typeof fieldValue === "string" && fieldValue.trim().toUpperCase() === normalizedValue;
    });
  });
}
