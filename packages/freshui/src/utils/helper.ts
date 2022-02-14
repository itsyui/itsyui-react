import { WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, ICommandManager } from "@itsy-ui/core";
import { DateTimeMode, Language, ImageExtensions } from './constants';

export function isEnvContainsKey(key) {
	if (process.env.MODE && process.env.MODE.includes(key)) {
		return true;
	}
	return false;
}
export function getlocaleText(displayName: string) {
	const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
	const pattern = /[{{}}]/g;
	const localeText = displayName && displayName.match && displayName.match(pattern) !== null ? localeMsg.getLocaleData(displayName.substring(2, displayName.length - 2)) : displayName;
	return localeText ? localeText : displayName ? displayName : "";
};

export function getSortingData(chartData: any, sortBy: any, sortfield?: any) {
	if (chartData != null && sortBy != null && sortBy === "Asc") {
		chartData.sort(function (a, b) {
			if (sortfield) {
				return a[sortfield] - b[sortfield];
			}
			else {
				return a - b;
			}
		});

	} else if (chartData != null && sortBy != null && sortBy === "Desc") {
		chartData.sort(function (a, b) {
			if (sortfield) {
				return b[sortfield] - a[sortfield];
			}
			else {
				return b - a;
			}
		});
		return chartData;
	};
}


export const getUrlParamValue = (paramName) => {
	paramName = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	const regex = new RegExp(`[\\?&]${paramName}=([^&#]*)`);
	const results = regex.exec(window.location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};
export const getDate = (date, type) => {
	if (date) {
		const locale = getUserPreferredLang();
		const dateLocale = getDateTimeLocale(locale);
		let dateValue = new Date(date);
		if (dateValue.toString() === "Invalid Date") {
			dateValue = new Date(parseInt(date, 10));
		}
		if (type === DateTimeMode.DATE) {
			return dateValue.toLocaleDateString(dateLocale);
		} else if (type === DateTimeMode.TIME) {
			return dateValue.toLocaleTimeString(dateLocale);
		}
		return dateValue.toLocaleString(dateLocale);
	}
	return "";
};

export function getUserPreferredLang() {
	let locale = window.navigator.language.split("-")[0];
	if (localStorage["FV_TENANT_INFO"]) {
		const user = JSON.parse(localStorage["FV_TENANT_INFO"]);
		if (user && user.userAttributes) {
			locale = user.userAttributes.preferredLang;
		}
	}
	let value = Language.find(lang => lang === locale);
	if (!value) {
		value = "en";
	}
	return value;
}

export function getDateTimeLocale(locale) {
	switch (locale) {
		case "de":
			return "de-DE";
		case "fr":
			return "fr-FR";
		default:
			return "en-GB";
	}
}
export function getTextValueString(textValue) {
	if (textValue.includes("{{")) {
		return getlocaleText(textValue);
	}
	else {
		return textValue;
	}
}

export function getEnabledItems(items: any, transition: any) {
	if (Array.isArray(items) && items.find(action => action.hasOwnProperty("roles")) && transition) {
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
		items = items.filter(t => {
			const cmd = commandManager.getCommand(t.name, {});
			if (cmd !== null) {
				t.enabled = cmd.canExecute({ "config": t }, transition);
				return t.enabled ? t : null;
			}
			return null;
		});
	}
	return items;
}

export const convertFileToBase64 = async (file) => {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	const result = await new Promise((resolve, reject) => {
		reader.onload = function () {
			resolve(reader.result.toString());
		};
	});
	return result;
};

export const isValidFileName = (fileName) => {
	let isValid = false;
	if (fileName) {
		const validFileNamePattern = new RegExp(/\`|\~|\!|\@|\$|\%|\^|\&|\*|\+|\||\\|\'|\>|\?|\/|\""|\;/g);
		isValid = !validFileNamePattern.test(fileName);
	}
	return isValid;
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
export function getTimeOut(i: any) {
	const basicTime = 750;
	const time = basicTime * i;
	return time;
}
export function getBasePath() {
	const history = WidgetsFactory.instance.services["history"];
	const windowPathName = window.location.pathname;
	let basePath;
	if (history !== undefined && history.location.pathname) {
		basePath = windowPathName.replace(history.location.pathname, "");
	} else {
		return null;
	}
	return basePath;
}

export function getFileName(file: string) {
	const fileSplit = file.split(";");
	file = fileSplit.length > 1 && fileSplit[1].indexOf(".") > -1 ? fileSplit[1] : file;
	return file;
}

export function getDeviceType() {
	const ua = navigator.userAgent;
	if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
		return "tablet";
	}
	if (
		/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
			ua
		)
	) {
		return "mobile";
	}
	return "desktop";
};

export function isImageBase64Content(fileName: string) {
	const fNameSplit = fileName ? fileName.split(".") : [];
	return fNameSplit.length > 1 && ImageExtensions.some(extension => fNameSplit[1].toLowerCase() === extension);
};

export function getJustifyContent(hAlignment, schema, style) {
	let justify = "flex-start"
	if (hAlignment) {
		justify = hAlignment === "right" ? "flex-end" : hAlignment === "center" ? "center" : "flex-start";
	} else if (schema && schema.hAlignment) {
		justify = schema.hAlignment === "right" ? "flex-end" : schema.hAlignment === "center" ? "center" : "flex-start";
	} else if (style && style.justifyContent) {
		justify = style.justifyContent === "right" ? "flex-end" : style.justifyContent === "center" ? "center" : "flex-start";
	}
	return justify
}

export function getAlignItems(vAlignment, schema, style) {
	let alignItem = "center";
	if (vAlignment) {
		alignItem = vAlignment === "bottom" ? "flex-end" : vAlignment === "top" ? "flex-start" : "center";
	} else if (schema && schema.vAlignment) {
		alignItem = schema.vAlignment === "bottom" ? "flex-end" : schema.vAlignment === "top" ? "flex-start" : "center";
	} else if (style && style.alignSelf) {
		alignItem = style.alignSelf === "bottom" ? "flex-end" : style.alignSelf === "top" ? "flex-start" : "center";
	}
	return alignItem
}

export function getFormLabelClassName(fieldSchema: any = {}) {
	const { readOnly, required } = fieldSchema;
	if (readOnly && required) {
		return "text-label label-disabled required-field";
	} else if (readOnly) {
		return "text-label label-disabled";
	} else if (required) { 
		return "text-label required-field";
	}
	return "text-label";
}