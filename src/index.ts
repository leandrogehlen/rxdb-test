import { createRxDatabase, RxDatabase } from "rxdb";
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

async function initDatabase() {
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

function createReplicator(database: RxDatabase) {
  return replicateRxCollection({
    waitForLeadership : false,
    collection: database.contacts,
    replicationIdentifier: 'my-rest-replication-to-https://example.com/api/sync',
    live: true,
    pull: {
      async handler(lastCheckpoint, batchSize) {
        console.log('lastCheckpoint', lastCheckpoint);
        console.log('batchSize', batchSize);

        const last = {id: 'abcdef', updatedAt: new Date().getTime()};

        return {
          documents: lastCheckpoint ? [] : [last],
          checkpoint: last
        };
      },
    },
  });
}

initDatabase().then(async(db) => {
  let replicator = createReplicator(db);

  await replicator.awaitInSync();
  await replicator.cancel();

  replicator = createReplicator(db);

  await replicator.awaitInSync();
  await replicator.cancel();

});
