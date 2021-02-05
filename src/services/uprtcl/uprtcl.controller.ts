import { Request, Response } from 'express';
import {
  Secured,
  Perspective,
  PerspectiveDetails,
  PerspectiveGetResult,
} from '@uprtcl/evees';

import { UprtclService } from './uprtcl.service';
import { checkJwt } from '../../middleware/jwtCheck';
import {
  getUserFromReq,
  GetResult,
  SUCCESS,
  PostResult,
  ERROR,
} from '../../utils';

declare global {
  namespace Express {
    interface Request {
      user: string;
    }
  }
}

export class UprtclController {
  constructor(protected uprtclService: UprtclService) {}

  routes() {
    return [
      {
        path: '/uprtcl/1/persp',
        method: 'post',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            const elementIds = await this.uprtclService.createAndInitPerspectives(
              req.body.perspectives,
              getUserFromReq(req)
            );

            let result: PostResult = {
              result: SUCCESS,
              message: '',
              elementIds,
            };
            res.status(200).send(result);
          },
        ],
      },

      {
        path: '/uprtcl/1/persp/update',
        method: 'put',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            try {
              await this.uprtclService.updatePerspectives(
                req.body.updates,
                getUserFromReq(req)
              );

              let result: PostResult = {
                result: SUCCESS,
                message: 'perspective head updated',
                elementIds: [],
              };
              res.status(200).send(result);
            } catch (error) {
              console.error(error);
              let result: PostResult = {
                result: ERROR,
                message: error.message,
                elementIds: [],
              };
              res.status(400).send(result);
            }
          },
        ],
      },

      {
        // A Get with put, it receive the get options in the body
        path: '/uprtcl/1/persp/:perspectiveId',
        method: 'put',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            let inputs: any = {
              perspectiveId: req.params.perspectiveId,
              options: req.body,
              userId: getUserFromReq(req),
            };

            try {
              const data = await this.uprtclService.getPerspective(
                inputs.perspectiveId,
                inputs.userId,
                inputs.options
              );

              let result: GetResult<PerspectiveGetResult> = {
                result: SUCCESS,
                message: '',
                data: data,
              };

              console.log('[UPRTCL CONTROLLER] getPerspectiveDetails', {
                inputs: JSON.stringify(inputs),
                result: JSON.stringify(result),
              });

              res.status(200).send(result);
            } catch (error) {
              console.error(
                '[UPRTCL CONTROLLER] getPerspectiveDetails - Error',
                JSON.stringify(inputs),
                error
              );

              let result: GetResult<null> = {
                result: ERROR,
                message: error.message,
                data: null,
              };

              res.status(200).send(result);
            }
          },
        ],
      },

      {
        // A locate GETasPUT action (search upwards) that receives options in the body
        path: '/uprtcl/1/locate',
        method: 'put',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            try {
              let perspectives = await this.uprtclService.locatePerspective(
                req.body.elementId,
                req.body.forks,
                getUserFromReq(req)
              );

              let result: GetResult<string[]> = {
                result: SUCCESS,
                message: 'perspectives located',
                data: perspectives,
              };
              res.status(200).send(result);
            } catch (error) {
              console.error(error);
              let result: PostResult = {
                result: ERROR,
                message: error.message,
                elementIds: [],
              };
              res.status(400).send(result);
            }
          },
        ],
      },

      {
        path: '/uprtcl/1/persp/:perspectiveId',
        method: 'delete',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            try {
              await this.uprtclService.deletePerspective(
                req.params.perspectiveId,
                getUserFromReq(req)
              );

              let result: PostResult = {
                result: SUCCESS,
                message: 'perspective deleted',
                elementIds: [],
              };
              res.status(200).send(result);
            } catch (error) {
              console.error(error);
              let result: PostResult = {
                result: ERROR,
                message: error.message,
                elementIds: [],
              };
              res.status(400).send(result);
            }
          },
        ],
      },

      {
        path: '/uprtcl/1/persp/:perspectiveId/others',
        method: 'get',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            const inputs = {
              perspId: req.params.perspectiveId,
              eco: req.query.includeEcosystem,
            };

            try {
              let perspectives = await this.uprtclService.findIndPerspectives(
                inputs.perspId,
                inputs.eco === 'false'
                  ? false
                  : inputs.eco === 'true'
                  ? true
                  : inputs.eco === '' || inputs.eco === 'undefined'
                  ? false
                  : false,
                getUserFromReq(req)
              );

              let result: GetResult<string[]> = {
                result: SUCCESS,
                message: 'perspectives found',
                data: perspectives,
              };

              res.status(200).send(result);
            } catch (error) {
              console.log(error);
              let result: GetResult<string[]> = {
                result: ERROR,
                message: error.message,
                data: [],
              };
              res.status(400).send(result);
            }
          },
        ],
      },

      {
        path: '/uprtcl/1/persp',
        method: 'put',
        handler: [
          checkJwt,
          async (req: Request, res: Response) => {
            try {
              let perspectives = await this.uprtclService.findPerspectives(
                req.body.context,
                getUserFromReq(req)
              );

              let result: GetResult<string[]> = {
                result: SUCCESS,
                message: 'perspectives found',
                data: perspectives,
              };
              res.status(200).send(result);
            } catch (error) {
              console.error(error);
              let result: PostResult = {
                result: ERROR,
                message: error.message,
                elementIds: [],
              };
              res.status(400).send(result);
            }
          },
        ],
      },
    ];
  }
}
