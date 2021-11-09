import { getItemFromLocalStorage } from "@itsy-ui/utils";

export function canExecuteCommand(commandItem) {
	let isExecute = false;
	if (commandItem) {
		if (Array.isArray(commandItem.roles) && commandItem.roles.length > 0) {
			const tenantInfo = getItemFromLocalStorage("FV_TENANT_INFO");
			const userRoles = tenantInfo ? tenantInfo.roles : null;
			isExecute = Array.isArray(userRoles) && commandItem.roles.some(role => userRoles.includes(role))
							? true : false;
		} else {
			isExecute = true;
		}
	}
	return isExecute;
}