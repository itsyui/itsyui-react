import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IConfigLoader, IDataSourceLake } from "@itsy-ui/core";
import axios from "axios";
import { getItemFromLocalStorage, setItemInLocalStorage } from "./helper";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const configData = dataLoader.getLoader<IConfigLoader>("config");

export const KEYS = {
	FV_TENANT_INFO: "FV_TENANT_INFO",
	FV_APPSTATE: "FV_APPSTATE",
};

export interface IPermission {
	create: boolean;
	read: boolean;
	update: boolean;
	delete: boolean;
	share: boolean;
	aclPropagation?: string;
}

export interface IPermissionData {
	[propName: string]: IPermission;
}

export interface IRoleData {
	roleName: string;
	typePermissions: IPermissionData;
}

export const API = {
	Role: "roles",
	AddUserToRole: "roles/user",
	GetRolesForUser: "api/user/roles",
	GetRoles: "roles/get",
	Permissions: "roles/permissions",
	UpdatePermissions: "roles/updatepermissions",
};
export const getAllTypeDefs = async () => {
	const datasource: any = dataLoader.getLoader<IDataSourceLake>("datasource");
	try {
		const typeDefs = await datasource.getAll("fv:typeMetadata", {});
		if (typeDefs.numItems > 0) {
			const currentObjects = typeDefs.objects.map((rowData) => {
				if (rowData.object && rowData.object.succinctProperties) {
					return rowData.object.succinctProperties;
				} else {
					return null;
				}
			});
			return currentObjects;
		} else {
			return [];
		}
	} catch (e) {
		throw e;
	}
};

const getRoleData = async (tenantInfo: any, roleName: string) => {
	const cfg = await configData.getConfig();
	if (cfg === null) {
		throw new Error("Config.json not available for API");
	}

	const API_URL = cfg["TenantURL"];
	if (API_URL === undefined) {
		throw new Error("Config.json: TenantURL not available for API");
	}

	// const headers = { Authorization: `Bearer ${tenantInfo.token}` };
	const options = {
		headers: {
			"Content-Type": "application/json",
			"x-cmis-repo-id": tenantInfo.repository[0],
			"authorization": `Bearer ${tenantInfo.token}`,
		},
	};
	const body = {
		"repository": tenantInfo.repository[0],
	};
	try {
		const result = await axios.get(`${API_URL}/api/${API.Role}?role=${roleName}&userId=${tenantInfo.userAttributes.userId}`, options);
		return result.data ? result.data : null;
	} catch (e) {
		throw e;
	}
};

export async function getTenantRoles() {
	const tenantInfo: any = getItemFromLocalStorage(KEYS.FV_TENANT_INFO);
	const cfg = await configData.getConfig();
	if (cfg === null) {
		throw new Error("Config.json not available for API");
	}

	const API_URL = cfg["TenantURL"];
	if (API_URL === undefined) {
		throw new Error("Config.json: TenantURL not available for API");
	}
	const options = {
		headers: {
			"Content-Type": "application/json",
			"x-cmis-repo-id": tenantInfo.repository[0],
			"authorization": "Basic " + btoa(`${tenantInfo.userAttributes.userId}` + ":" + `${tenantInfo.token}`),
		},
	};
	try {
		const allRole = await axios.get(`${API_URL}/api/${API.Role}?userId=${tenantInfo.userAttributes.userId}`, options)
		if (allRole.data && allRole.data.length > 0) {
			setItemInLocalStorage("FV_ROLES", JSON.stringify(allRole.data));
		}
		return allRole.data.length > 0 ? allRole.data : []
	} catch (ex) {
		console.error(ex);
		return [];
	}
}

function getRoleFromLocalStorage(roleName: string) {
	let roleInfo;
	const Appstate: any = getItemFromLocalStorage(KEYS.FV_APPSTATE);
	if (Appstate && Object.keys(Appstate).length === 0 || !Appstate.roles) {
		return null;
	}
	roleInfo = Object.keys(Appstate.roles).length > 0 && Appstate.roles;
	roleInfo = roleInfo ? roleInfo.find(r => r.roleName === roleName) : undefined;
	return roleInfo ? roleInfo : undefined;
}

export async function getRoleByName(roleName: string): Promise<IRoleData> {
	let roleInfo;
	const tenantInfo: any = getItemFromLocalStorage(KEYS.FV_TENANT_INFO);
	roleInfo = await getRoleData(tenantInfo, roleName);
	delete roleInfo.role;

	const typePermissions: IPermissionData = {};
	const typeKeys = Object.keys(roleInfo);
	for (let pIndex = 0; pIndex < typeKeys.length; pIndex++) {
		const typeData = roleInfo[typeKeys[pIndex]];
		const perm = typeData.permissions;
		typePermissions[typeKeys[pIndex]] = {
			"aclPropagation": typeData["aclPropagation"] ? typeData["aclPropagation"] : "",
			create: perm ? perm.filter(pr => pr === "create").length > 0 : false,
			read: perm ? perm.filter(pr => pr === "read").length > 0 : false,
			update: perm ? perm.filter(pr => pr === "update").length > 0 : false,
			delete: perm ? perm.filter(pr => pr === "delete").length > 0 : false,
			share: perm ? perm.filter(pr => pr === "share").length > 0 : false,
		};
	}
	const roleData: IRoleData = {
		roleName: roleName,
		typePermissions: typePermissions,
	};
	return roleData;
}

export async function getRolesForUser(): Promise<IRoleData[]> {
	const tenantInfo: any = getItemFromLocalStorage(KEYS.FV_TENANT_INFO);
	let roles = getItemFromLocalStorage("FV_ROLES");
	let rolesDataArray: IRoleData[] = roles;
	if (!roles || Object.keys(roles).length === 0) {
		const cfg = await configData.getConfig();
		if (cfg === null) {
			throw new Error("Config.json not available for API");
		}
		const API_URL = cfg["TenantURL"];
		if (API_URL === undefined) {
			throw new Error("Config.json: TenantURL not available for API");
		}
		const headers = { Authorization: `Bearer ${tenantInfo.token}` };
		const options = {
			headers: {
				...headers,
				"x-cmis-repo-id": tenantInfo.repository[0],
				"x-cmis-tenantid": tenantInfo.tenantId
			},
		};
		try {
			const result = await axios.get(`${API_URL}/${API.GetRolesForUser}?userId=${tenantInfo.userAttributes.userId}`, options);
			rolesDataArray = result.data ? result.data : [];
			return rolesDataArray;
		} catch (e) {
			throw e;
		}
	}
	return rolesDataArray;
}

function getTypePermFromRole(roleData: IRoleData, roleTypeId: string) {
	if (roleTypeId in roleData.typePermissions) {
		const roleTypePermission = roleData.typePermissions[roleTypeId];
		return roleTypePermission;
	}

	return null;
}

export function isRolesEnabled(rolesData: IRoleData[], roleTypeId: string): boolean {
	const roleToBeFound = rolesData.filter(t => roleTypeId in t.typePermissions);
	return roleToBeFound.length > 0;
}

export function getPermissionForRoleTypeId(rolesData: IRoleData[], roleTypeId: string): IPermission {
	// return a merged role data based on all roles combined
	const roles = rolesData.map(r => getTypePermFromRole(r, roleTypeId));
	const permission: IPermission = {
		create: false,
		read: false,
		update: false,
		share: false,
		delete: false,
	};
	for (let index = 0; index < roles.length; index++) {
		const roleTypePermission = roles[index];
		if (!roleTypePermission) {
			continue;
		}

		// only if it already false then check with the current roleTypePermission, if any of the roleTypePermission is true then it is always true
		if (!permission.create) {
			permission.create = roleTypePermission.create;
		}

		if (!permission.read) {
			permission.read = roleTypePermission.read;
		}

		if (!permission.update) {
			permission.update = roleTypePermission.update;
		}

		if (!permission.share) {
			permission.share = roleTypePermission.share;
		}

		if (!permission.delete) {
			permission.delete = roleTypePermission.delete;
		}
	}
	return permission;
}

export function hasPermission(rolesData: IRoleData[], roleTypeId: string, t: (p: IPermission) => boolean) {
	const perm = getPermissionForRoleTypeId(rolesData, roleTypeId);
	return t(perm);
}

export function getPermissions(data) {
	const keys = Object.keys(data);
	const permissions = [];
	keys.forEach(t => {
		if (t.match(/create/gi) != null && data[t]) {
			permissions.push(t);
		} else if (t.match(/read/gi) != null && data[t]) {
			permissions.push(t);
		} else if (t.match(/update/gi) != null && data[t]) {
			permissions.push(t);
		} else if (t.match(/delete/gi) != null && data[t]) {
			permissions.push(t);
		} else if (t.match(/share/gi) != null && data[t]) {
			permissions.push(t);
		}
	});
	return permissions;
}
