import { Perspective, Commit, DataDto } from "./types";
import { DGraphService, PermissionType } from "../../db/dgraph.service";
import { AccessService } from "../access/access.service";

export class UprtclService {

  constructor(protected db: DGraphService, protected access: AccessService) {
  }

  async createPerspective(
    perspective: Perspective, 
    delegateTo: string | null, 
    loggedUserId: string): Promise<string> {
    console.log('[UPRTCL-SERVICE] createPerspective', perspective);
    let perspId = await this.db.createPerspective(perspective);
    await this.access.setAccessConfig(perspId, delegateTo, loggedUserId);
    return perspId;
  };

  async getPerspective(perspectiveId: string, loggedUserId: string): Promise<Perspective | null> {
    if (!(await this.access.isRole(perspectiveId, loggedUserId, PermissionType.Read))) return null;

    let perspective = await this.db.getPerspective(perspectiveId);
    console.log('[UPRTCL-SERVICE] getPerspective', {perspectiveId}, perspective);
    return perspective;
  };

  async getContextPerspectives(context: string): Promise<Perspective[]> {
    console.log('[UPRTCL-SERVICE] getContextPerspectives', {context});
    let perspectives = await this.db.getContextPerspectives(context);
    return perspectives;
  };

  async updatePerspective(perspectiveId: string, headId: string): Promise<void> {
    console.log('[UPRTCL-SERVICE] updatePerspective', {perspectiveId}, {headId});
    await this.db.updatePerspective(perspectiveId, headId);
  };

  async getPerspectiveHead(perspectiveId: string): Promise<string> {
    console.log('[UPRTCL-SERVICE] getPerspectiveHead', {perspectiveId});
    let perspective = await this.db.getPerspectiveHead(perspectiveId);
    return perspective;
  };  

  async createCommit(commit: Commit, loggedUserId: string): Promise<string> {
    console.log('[UPRTCL-SERVICE] createCommit', commit);
    let uid = await this.db.createCommit(commit);
    return uid;
  };

  async getCommit(commitId: string, loggedUserId: string): Promise<Commit | null> {
    console.log('[UPRTCL-SERVICE] getCommit', {commitId});
    let commit = await this.db.getCommit(commitId);
    return commit;
  };

  async createData(data: DataDto, loggedUserId: string): Promise<string> {
    console.log('[UPRTCL-SERVICE] createData', data);
    let uid = await this.db.createData(data);
    return uid;
  };

  async getData(dataId: string): Promise<any> {
    console.log('[UPRTCL-SERVICE] getData', dataId);
    let data = await this.db.getData(dataId);
    return data;
  };

  async addKnownSources(elementId: string, sources: Array<string>) {
    console.log('[UPRTCL-SERVICE] addKnownSources', {elementId}, {sources});
    await this.db.addKnownSources(elementId, sources);
  }

  async getKnownSources(elementId: string):Promise<Array<string>> {
    console.log('[UPRTCL-SERVICE] getKnownSources', {elementId});
    let sources = this.db.getKnownSources(elementId);
    return sources;
  }

  getOrigin():Promise<string> {
    console.log('[UPRTCL-SERVICE] getOrigin');
    return this.db.getOrigin();
  }
}

