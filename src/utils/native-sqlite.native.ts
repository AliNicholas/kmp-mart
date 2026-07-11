import * as SQLite from "expo-sqlite";

export const openNativeDatabase = (name: string) =>
  SQLite.openDatabaseSync(name);
