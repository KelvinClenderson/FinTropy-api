"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membersRoutes = void 0;
const express_1 = require("express");
const create_member_controller_1 = require("../controllers/members/create-member.controller");
const delete_member_controller_1 = require("../controllers/members/delete-member.controller");
const list_members_controller_1 = require("../controllers/members/list-members.controller");
const update_member_controller_1 = require("../controllers/members/update-member.controller");
const ensure_authenticated_middleware_1 = require("../middlewares/ensure-authenticated.middleware");
const membersRoutes = (0, express_1.Router)();
exports.membersRoutes = membersRoutes;
const createController = new create_member_controller_1.CreateMemberController();
const listController = new list_members_controller_1.ListMembersController();
const updateController = new update_member_controller_1.UpdateMemberController();
const deleteController = new delete_member_controller_1.DeleteMemberController();
membersRoutes.use(ensure_authenticated_middleware_1.ensureAuthenticated);
// GET /members?workspaceId=...
membersRoutes.get('/', listController.handle);
// POST /members
membersRoutes.post('/', createController.handle);
// PUT /members/:id
membersRoutes.put('/:id', updateController.handle);
// DELETE /members/:id?workspaceId=...
membersRoutes.delete('/:id', deleteController.handle);
