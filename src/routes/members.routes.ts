import { Router } from 'express';
import { CreateMemberController } from '../controllers/members/create-member.controller';
import { DeleteMemberController } from '../controllers/members/delete-member.controller';
import { ListMembersController } from '../controllers/members/list-members.controller';
import { UpdateMemberController } from '../controllers/members/update-member.controller';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated.middleware';

const membersRoutes = Router();

const createController = new CreateMemberController();
const listController = new ListMembersController();
const updateController = new UpdateMemberController();
const deleteController = new DeleteMemberController();

membersRoutes.use(ensureAuthenticated);

// GET /members?workspaceId=...
membersRoutes.get('/', listController.handle);

// POST /members
membersRoutes.post('/', createController.handle);

// PUT /members/:id
membersRoutes.put('/:id', updateController.handle);

// DELETE /members/:id?workspaceId=...
membersRoutes.delete('/:id', deleteController.handle);

export { membersRoutes };
