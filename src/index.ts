import { createRxDatabase } from "rxdb";
import { replicateRxCollection } from "rxdb/plugins/replication";
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

initDatabase().then(async(db) => {
  replicateRxCollection({
    waitForLeadership : false,
    collection: db.contacts,
    replicationIdentifier: 'my-rest-replication-to-https://example.com/api/sync',
    pull: {
        /**
         * Pull handler
         */
        async handler(lastCheckpoint, batchSize) {
            console.log('lastCheckpoint', lastCheckpoint);
            console.log('batchSize', batchSize)
            return {
                documents: [],
                checkpoint: null
            };
        },
        batchSize: 10,
    },
});

});
