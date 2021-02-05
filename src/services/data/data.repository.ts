import { Entity } from '@uprtcl/evees';

import { DGraphService } from '../../db/dgraph.service';
import { UserRepository } from '../user/user.repository';
import { DATA_SCHEMA_NAME } from './data.schema';
import { ipldService } from '../ipld/ipldService';
import { decodeData, encodeData } from './utils';

const dgraph = require('dgraph-js');

export class DataRepository {
  constructor(
    protected db: DGraphService,
    protected userRepo: UserRepository
  ) {}

  /** All data objects are stored as textValues, intValues, floatValues and boolValues
   * or links to other objects, if the value is a valid CID string.
   * The path of the property in the JSON object is stored in a facet */
  async createDatas(datas: Entity<any>[]): Promise<Entity<any>[]> {
    if (datas.length === 0) return [];
    await this.db.ready();

    let query = ``;
    let nquads = ``;
    let entities: Entity<any>[] = [];

    for (let hashedData of datas) {
      const data = hashedData.object;
      const id =
        hashedData.id !== ''
          ? hashedData.id
          : await ipldService.validateSecured(hashedData);

      query = query.concat(`\ndata${id} as var(func: eq(xid, ${id}))`);
      nquads = nquads.concat(`\nuid(data${id}) <xid> "${id}" .`);

      nquads = nquads.concat(`\nuid(data${id}) <stored> "true" .`);
      nquads = nquads.concat(
        `\nuid(data${id}) <dgraph.type> "${DATA_SCHEMA_NAME}" .`
      );

      // patch store quotes of string attributes as symbol
      const dataCoded = encodeData(data);
      nquads = nquads.concat(`\nuid(data${id}) <jsonString> "${dataCoded}" .`);

      entities.push({
        id,
        object: data,
      });
    }

    const mu = new dgraph.Mutation();
    const req = new dgraph.Request();

    req.setQuery(`query {${query}}`);
    mu.setSetNquads(nquads);
    req.setMutationsList([mu]);

    let result = await this.db.callRequest(req);
    console.log(
      '[DGRAPH] createData',
      { query },
      { nquads },
      result.getUidsMap().toArray()
    );
    return entities;
  }

  async getData(dataId: string): Promise<Entity<Object>> {
    await this.db.ready();

    const query = `query {
      data(func: eq(xid, ${dataId})) {
        xid
        stored
        jsonString
      }
    }`;

    let result = await this.db.client.newTxn().query(query);
    const json = result.getJson();
    console.log('[DGRAPH] getData', { query, json });

    if (json.data.length === 0) {
      throw new Error(`element with xid ${dataId} not found`);
    }

    if (json.data.length > 1) {
      throw new Error(
        `unexpected number of entries ${json.data.length} for xid ${dataId}`
      );
    }

    if (!json.data[0].stored) {
      throw new Error(`element with xid ${dataId} content not stored`);
    }

    const data = decodeData(json.data[0].jsonString);

    console.log('[DGRAPH] getData', { query, json, data });

    return {
      id: dataId,
      object: data,
    };
  }
}
