import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IConfigLoader } from "@itsy-ui/core";
import axios from "axios";
import { RegExPatterns } from './bindingHelper';

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const configData = dataLoader.getLoader<IConfigLoader>("config");

export function setItemInLocalStorage(key: string, value: string) {
	if (typeof Storage !== undefined) {
		localStorage.setItem(key, value);
	}
}

export function removeInLocalStorage(key: string) {
	if (typeof Storage !== undefined) {
		localStorage.removeItem(key);
	}
}

export function getItemFromLocalStorage(key: string, shouldParse: boolean = true) {
	if (typeof Storage !== undefined) {
		const v = localStorage.getItem(key);
		if (v === undefined || v === null) {
			return {};
		} else {
			if (shouldParse) {
				return JSON.parse(v);
			} else {
				return v;
			}
		}
	}

	return {};
}

export const refreshToken = async () => {
	const cfg = await configData.getConfig();
	if (cfg === null) {
		throw new Error("Config.json not available for API");
	}

	const API_URL = cfg["TenantURL"];
	if (API_URL === undefined) {
		throw new Error("Config.json: TenantURL not available for API");
	}

	const tenantInfo = getItemFromLocalStorage("FV_TENANT_INFO");
	const headers = { Authorization: `Bearer ${tenantInfo.token}` };
	const options = {
		headers: {
			...headers
		},
	};
	const body = {
		"userId": tenantInfo.userAttributes.userId,
		"refreshToken": tenantInfo.refreshToken,
	};
	try {
		const result = await axios.post(`${API_URL}/api/refreshtoken`, body, options);
		if (result.data && result.data.token) {
			tenantInfo["token"] = result.data.token;
			const userPass = atob(getItemFromLocalStorage("USER_LOCAL", false)).split(":");
			userPass[1] = result.data.token;
			setItemInLocalStorage("USER_LOCAL", btoa(userPass.join(":")));
			setItemInLocalStorage("FV_TENANT_INFO", JSON.stringify(tenantInfo));
		}
	} catch (e) {
		throw e;
	}
};

export const getPageContext = (transition) => {
	let rootPageData = {}
	transition({
		type: "PAGE_GET_STATE",
		controlID: "rootPageLayout",
		onData: (pageData) => {
			rootPageData = pageData;
		}
	});
	return rootPageData;
}

export function parseJWT(token: string) {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace("-", "+").replace("_", "/");
		return JSON.parse(window.atob(base64));
	} catch {
		// in UI cases user will enter password
		return null;
	}
}

export function verifyJWT(token: string) {
	try {
		const { exp } = parseJWT(token);
		if (exp < (new Date().getTime() + 1) / 1000) {
			return false;
		}
	} catch (err) {
		return false;
	}
	return true;
}

export function isEmptyObject(obj: any) {
	return Object.keys(obj).length === 0 && obj.constructor === Object ? true : false;
}

export function isNullOrUndefined(object: any) {
	return (object === null || object === undefined || object === "") ? true : false;
}

export const isNullOrEmptyString = value => {
	return value === null || value === undefined || value === "";
};

export function getNewId() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return (`${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
	);
}

export const getUrlParamValue = (paramName) => {
	paramName = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	const regex = new RegExp(`[\\?&]${paramName}=([^&#]*)`);
	const results = regex.exec(window.location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

export const getUrlParams = (search) => {
	if (!search) return {};
	const queryParams = search.slice(search.indexOf('?') + 1).split('&')
	return queryParams.reduce((params, hash) => {
		const [key, val] = hash.split('=')
		return Object.assign(params, { [key]: decodeURIComponent(val) })
	}, {})
}

export function getlocaleText(displayName: any) {
	const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
	const pattern = /[{{}}]/g;
	const localeText = displayName.match(pattern) !== null ? localeMsg.getLocaleData(displayName.substring(2, displayName.length - 2)) : displayName;
	return localeText ? localeText : displayName;
};

export function isFunction(functionToCheck) {
	return functionToCheck && ({}.toString.call(functionToCheck) === "[object Function]" || {}.toString.call(functionToCheck) === "[object AsyncFunction]");
};

export function isObject(thing) {
	return typeof thing === 'object' && thing !== null && !Array.isArray(thing);
}

export const regexStr = /\${(.*?)}/;

export function template(templateString, templateVariables) {
	if (typeof templateString !== "string") {
		return templateString;
	}

	let tvr = templateString.match(regexStr);
	let isTemplateStringAValue = templateString.indexOf("${") === 0;
	if (tvr !== null && tvr.length > 1) {
		let g = tvr[1];
		if (g.indexOf("__") > 0) {
			let t = g.split("__");
			let r1 = t.reduce((acc, key) => {
				if (Array.isArray(acc)) {
					return acc[parseInt(key)];
				} else {
					return acc[key];
				}
			}, templateVariables);
			return r1;
		} else {
			let result = templateVariables[g];
			if (!isTemplateStringAValue) {
				return templateString.replace(regexStr, result);
			} else {
				return result ? result : templateString;
			}
		}
	} else {
		return templateString;
	}
}

export function applyTemplate(obj1, templateVariables, onlyTemplateVars?) {
	let onlyTemplateVarsCondition = onlyTemplateVars !== undefined ? onlyTemplateVars : false;
	return Object.keys(obj1).reduce((acc, key) => {
		const left = obj1[key];
		// console.log(`key: ${key}, obj: ${obj1[key]}, acc: ${JSON.stringify(acc)}`);
		if (obj1.hasOwnProperty(key) && isObject(left)) {
			acc[key] = applyTemplate(left, templateVariables);
		} else if (Array.isArray(left)) {
			acc[key] = left.map(t => {
				if (isObject(t)) {
					return applyTemplate(t, templateVariables)
				} else {
					return template(t, templateVariables);
				}
			});
		} else {
			if (typeof obj1[key] === "string" && obj1[key].indexOf("${") > -1) {
				acc[key] = template(obj1[key], templateVariables);
			} else {
				// set the prop body if its not only template vars
				if (!onlyTemplateVarsCondition) {
					acc[key] = obj1[key];
				}
			}
		}

		return acc;
	}, {});
}

export function getFeatureKey(currentPage, feature, widgetId) {
	if (currentPage && feature) {
		return Object.keys(currentPage["pageBinding"][widgetId]).find(fKey => currentPage["pageBinding"][widgetId][fKey].name === feature);
	}
	return null;
}

export function removeContentPropsFromInputMetadata(inputMetaData) {
	let contentMetadata = {};
	//supporting only single file for now, not multi select file in File Upload
	for (var key in inputMetaData) {
		const value = inputMetaData[key];
		if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
			//File comes in an array in 0 index
			contentMetadata[value[0].name] = value;
			delete inputMetaData[key];
		}
	}
	return contentMetadata;
}

export function removeArrayValue(inputValues) {
	for (var key in inputValues) {
		const value = inputValues[key];
		if (Array.isArray(value) && value.length > 0) {
			inputValues[key] = value[0];
		}
	}
	return inputValues;
}

export const getQueryParams = (queryParams, record) => {
	const params = [];
	if (queryParams && !isEmptyObject(queryParams)) {
		Object.keys(queryParams).forEach(t => {
			const matchedItems = queryParams[t].value && queryParams[t].value.match(RegExPatterns.SquareBracket); //here queryParams wrap with squareBrackets then take from selected recoed
			if (matchedItems && Array.isArray(matchedItems) && matchedItems.length > 0) {
				let value = "";
				matchedItems.forEach(item => { // if have multiple values loop the value and append to value variable
					const itemWithOutBracket = item.substring(1, item.length - 1);
					if (record.hasOwnProperty(itemWithOutBracket)) {
						value += record[itemWithOutBracket];
					}
				});
				params.push({ "paramName": t, "value": value ? value : queryParams[t].defaultValue });
			} else if (queryParams[t].value) { //it will generate with value otherwise take defaultValue
				params.push({ "paramName": t, "value": queryParams[t].value });
			} else {
				params.push({ "paramName": t, "value": queryParams[t].defaultValue });
			}
		});
		return params;
	}
	return params;
};

export const generateURLQueryParams = (metadata, record) => {
	let urlQueryParams = "?";
	const { queryParams } = metadata; //this values are at the time of creating sitMap
	const updatedQp = getQueryParams(queryParams, record);
	if (updatedQp && Array.isArray(updatedQp) && updatedQp.length > 0) {
		updatedQp.forEach(item => {
			urlQueryParams += `${item.paramName}=${item.value}&`; //in last adding & symbol
		});
		urlQueryParams = urlQueryParams.substring(0, urlQueryParams.length - 1); //here removing last & symbol in urlQueryParams
		return urlQueryParams;
	}
	return "";
};

export const mapFilterObjToString = (filterJson) => {
	let filterString = "";
	for (const key in filterJson) {
		if (filterJson.hasOwnProperty(key)) {
			const filters = filterJson[key];
			if (Array.isArray(filters) && filters.length > 0) {
				let filterText = "";
				filters.forEach(item => {
					switch (item.operation) {
						case "contains":
							filterText = filterText.length > 0 ? `${filterText} or contains(${key}:: '${item.value}')` : `contains(${key}:: '${item.value}')`;
							break;
						case "exists":
							filterText = filterText.length > 0 ? `${filterText} or exists(${key}:: '${item.value}')` : `exists(${key}:: '${item.value}')`;
							break;
						case "in":
							filterText = filterText.length > 0 ? `${filterText} or in(${key}:: '${item.value}')` : `in(${key}:: '${Array.isArray(item.value) ? item.value.join(" ") : item.value}')`;
							break;
						default:
							filterText = filterText.length > 0 ? `${filterText} or ${key} ${item.operation} '${item.value}'` : `${key} ${item.operation} '${item.value}'`;
							break;
					}
				});
				if (filterText.length > 0) {
					filterString = filterString.length > 0 ? `${filterString} and ${filterText}` : filterText;
				}
			}
		}
	}
	return filterString;
}

export function create_UUID() {
	var dt = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
	return uuid;
}

export function flatObj(obj: any) {
	let flattenObj = {};
	if (obj) {
		for (const [key, value] of Object.entries(obj)) {
			if (typeof value === "object") {
				const subflatObj = flatObj(value);
				flattenObj = { ...flattenObj, ...subflatObj };
			} else {
				flattenObj[key] = value;
			}
		}
	}
	return flattenObj;
}
