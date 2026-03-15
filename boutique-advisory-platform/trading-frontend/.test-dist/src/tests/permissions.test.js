"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const node_assert_1 = __importDefault(require("node:assert"));
const permissions_1 = require("../lib/permissions");
(0, node_test_1.default)('permissions - direct role checks', () => {
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)('ADMIN', 'settings.read'), true);
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)('INVESTOR', 'settings.read'), false);
});
(0, node_test_1.default)('permissions - owner checks', () => {
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)('SME', 'sme.update', true), true);
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)('SME', 'sme.update', false), false);
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)('INVESTOR', 'investor.update', true), true);
});
(0, node_test_1.default)('permissions - unknown permission and missing role are denied', () => {
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)(undefined, 'sme.list'), false);
    node_assert_1.default.strictEqual((0, permissions_1.hasPermission)('ADMIN', 'not.real.permission'), false);
});
(0, node_test_1.default)('permissions - canPerformAction delegates correctly', () => {
    node_assert_1.default.strictEqual((0, permissions_1.canPerformAction)('INVESTOR', 'deal', 'create'), true);
    node_assert_1.default.strictEqual((0, permissions_1.canPerformAction)('INVESTOR', 'deal', 'delete'), false);
});
(0, node_test_1.default)('permission helpers - null user gets no elevated permissions', () => {
    const helpers = (0, permissions_1.createPermissionHelpers)(null);
    node_assert_1.default.strictEqual(helpers.isAdmin, false);
    node_assert_1.default.strictEqual(helpers.canCreateSME, false);
    node_assert_1.default.strictEqual(helpers.canViewSettings, false);
});
(0, node_test_1.default)('permission helpers - admin and super-admin behavior', () => {
    const adminHelpers = (0, permissions_1.createPermissionHelpers)({ id: 'a1', role: 'ADMIN' });
    node_assert_1.default.strictEqual(adminHelpers.isAdmin, true);
    node_assert_1.default.strictEqual(adminHelpers.isSuperAdmin, false);
    node_assert_1.default.strictEqual(adminHelpers.canCreateSME, true);
    node_assert_1.default.strictEqual(adminHelpers.canAccessSystemSettings, false);
    const superAdminHelpers = (0, permissions_1.createPermissionHelpers)({ id: 'sa1', role: 'SUPER_ADMIN' });
    node_assert_1.default.strictEqual(superAdminHelpers.isAdmin, true);
    node_assert_1.default.strictEqual(superAdminHelpers.isSuperAdmin, true);
    node_assert_1.default.strictEqual(superAdminHelpers.canAccessSystemSettings, true);
});
(0, node_test_1.default)('permission helpers - finops is not implicit admin', () => {
    const finopsHelpers = (0, permissions_1.createPermissionHelpers)({ id: 'f1', role: 'FINOPS' });
    node_assert_1.default.strictEqual(finopsHelpers.isAdmin, false);
    node_assert_1.default.strictEqual(finopsHelpers.canViewSettings, false);
});
