import { WidgetsFactory } from "@itsy-ui/core";
import { getItemFromLocalStorage, isEmptyObject, regexStr, template } from "@itsy-ui/utils";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];

export const getAppId = (transition) => {
	let rootPageData = {};
	transition({
		type: "PAGE_GET_STATE",
		controlID: "rootPageLayout",
		onData: (pageData) => {
			rootPageData = pageData;
		},
	});
	if (rootPageData && rootPageData.urlParams) {
		return rootPageData.urlParams.pathName.split("/")[2];
	}
	return null;
};

async function getUserContextFromDB(tenantInfo, appId) {
	const datasource = dataLoader.getLoader("datasource");
	let metadata = {};
	if (appId && tenantInfo && tenantInfo.roles && Array.isArray(tenantInfo.roles) && tenantInfo.roles.length > 0) {
		try {
			const schemaProvider = dataLoader.getLoader("appSchemaProvider");
			const extConfig = await schemaProvider.getSchema(`/app/userMapping/data`); // getting userMapping Json file from DB
			for (const key in tenantInfo.roles) {
				const role = tenantInfo.roles[key];
				if (extConfig && extConfig[role]) { // based on users role,to fetch specify modal and get the specify user item
					const item =   await datasource.getAll(extConfig[role], { filter: `fv:userId eq ${tenantInfo["userAttributes"]["userId"]}` });
					if (item && item.numItems > 0) {
						metadata = { ...metadata, ...item.objects[0]["object"]["succinctProperties"] }; // if user have multiple role, base on user role item it will append 
					}
				}
			}
		} catch (err) {
			console.log(`error in while getting userMapping file: ${err}`);
		}
	}

	return !isEmptyObject(metadata) ? metadata : null;
}

export async function getUserContext(appId, templateKey) { // once we get userContext from DB will store that value in localStorage
	const userContext = getItemFromLocalStorage("USER_CONTEXT");
	const tenantInfo = getItemFromLocalStorage("FV_TENANT_INFO");

	const userId = tenantInfo.userAttributes.userId;
	if (userContext && appId && userId && !isEmptyObject(userContext) && userContext[appId] && userContext[appId][userId]) { // base on appId checking userContext there or not
		return userContext[appId][userId][templateKey] ? userContext[appId][userId][templateKey] : null;
	}

	const dbUserContext = await getUserContextFromDB(tenantInfo, appId); // if localStorage not there means get that value for DB
	if (dbUserContext) {
		const updatedContext = {
			...userContext, ...userContext[appId] ? { [appId]: { ...userContext[appId], [userId]: dbUserContext } } :
				{ [appId]: { [userId]: dbUserContext } }
		};
		localStorage.setItem("USER_CONTEXT", JSON.stringify(updatedContext)); // storaging value in localStorage 
		return dbUserContext[templateKey] ? dbUserContext[templateKey] : null;
	}
	return null;
}

export function templateValueContainsUserKeyWord(userTemplateValue) {
	if (typeof userTemplateValue !== "string") {
		return null;
	}
	const templateValue = userTemplateValue.match(regexStr); // matching patten 
	if (Array.isArray(templateValue) && templateValue.length > 0 && typeof templateValue[1] === "string" && templateValue[1].startsWith("user.")) { // checking templateValue having user. or not
		return templateValue[1].replace("user.", ""); // removing user. value
	}
	return null;
}

export async function getUpdatedFilter(filter, queryParams, transition) {
	for (const key in filter) {
		if (filter.hasOwnProperty(key)) {
			const filterItem = filter[key]
			for (const filterKey in filterItem) {
				const item = filterItem[filterKey];
				const tenantInfo = getItemFromLocalStorage("FV_TENANT_INFO");
				let templateVal = template(item.value, { ...tenantInfo.userAttributes, ...queryParams, }) // matching template key

				const userTemplateKey = templateValueContainsUserKeyWord(templateVal); // checking templateKey contains "user." keyWord
				if (userTemplateKey) { // if userTemplateKey not null, base on userTemplateKey wil get userContext value
					const appId = getAppId(transition);
					templateVal = await getUserContext(appId, userTemplateKey);
				}

				item.value = templateVal;
			}

		}
	}
	return filter;
}