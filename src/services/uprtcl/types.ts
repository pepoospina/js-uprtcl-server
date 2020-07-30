export enum ProposalState {
  Open = "OPEN",
  Cancelled = "CANCELLED",
  Executed = "EXECUTED",
  Declined = "DECLINED"
}

export interface PerspectiveDetails {
  name?: string
  context?: string | undefined
  headId?: string | undefined
}

export interface Perspective {
  remote: string
  path: string
  creatorId: string
  timestamp: number
}

export const getAuthority = (perspective: Perspective): string => {
  return `${perspective.remote}:${perspective.path}`
}

export interface Proposal {
  id: string
  creatorId?: string
  toPerspectiveId?: string
  fromPerspectiveId: string
  toHeadId?: string
  fromHeadId?: string
  updates?: Array<UpdateRequest>
  state: ProposalState
  canAuthorize?: boolean
}

export interface UpdateRequest {
  fromPerspectiveId?: string
  oldHeadId?: string
  perspectiveId: string
  newHeadId: string
}

export interface Commit {
  creatorsIds: string[]
  timestamp: number
  message: string
  parentsIds: Array<string>
  dataId: string
}

export interface Hashed<T> {
  id: string
  object: T
}

export interface Proof {
  signature: string
  type: string
}
export interface Signed<T = any> {
  payload: T
  proof: Proof
}

export type Secured<T = any> = Hashed<Signed<T>>

export interface NewPerspectiveData {
  perspective: Secured<Perspective>
  details?: PerspectiveDetails
  parentId?: string
}

export interface NewProposalData {
  creatorId: string,
  fromPerspectiveId: string
  toPerspectiveId: string
  fromHeadId: string
  toHeadId: string
  updates: UpdateRequest[]
}
