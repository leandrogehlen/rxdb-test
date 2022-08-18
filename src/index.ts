import { createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/dexie";

const contactSchema = {
  title: "Contact schema",
  version: 0,
  description: "Describes a contact",
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100
    },
    name: {
      type: "string"
    }
  }
};

export async function initDatabase() {
  const database = await createRxDatabase({
    name: "testdb",
    storage: getRxStorageDexie()
  });

  await database.addCollections({
    contacts: {
      schema: contactSchema
    }
  });

  return database;
}

initDatabase();
