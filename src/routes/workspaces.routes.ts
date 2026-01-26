import { Router } from 'express';
import { GetWorkspaceController } from '../controllers/workspaces/get-workspace.controller';
import { InviteMemberController } from '../controllers/workspaces/invite-member.controller';
import { RemoveMemberController } from '../controllers/workspaces/remove-member.controller';
import { UpdateWorkspaceController } from '../controllers/workspaces/update-workspace.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';
// 👇 AQUI ESTAVA O ERRO: Removemos o .ts do final
import { AcceptInviteController } from '../controllers/workspaces/accept-invite.controller';
import { ListUserInvitesController } from '../controllers/workspaces/list-user-invites.controller';

const workspacesRoutes = Router();

const getController = new GetWorkspaceController();
const updateController = new UpdateWorkspaceController();
const inviteController = new InviteMemberController();
const removeController = new RemoveMemberController();
const acceptController = new AcceptInviteController();
const listInvitesController = new ListUserInvitesController();

workspacesRoutes.use(ensureAuthenticated);

workspacesRoutes.get('/:id', getController.handle);
workspacesRoutes.put('/:id', updateController.handle);
workspacesRoutes.post('/:id/invite', inviteController.handle);
workspacesRoutes.delete('/:id/members/:memberId', removeController.handle);
workspacesRoutes.get('/invites/me', listInvitesController.handle);
workspacesRoutes.post('/invites/:id/accept', acceptController.handle);

export { workspacesRoutes };
