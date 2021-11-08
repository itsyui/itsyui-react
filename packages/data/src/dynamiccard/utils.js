import { WidgetsFactory } from "@itsy-ui/core";

export const getUrlParamValue = (paramName) => {
	paramName = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	const regex = new RegExp(`[\\?&]${paramName}=([^&#]*)`);
	const results = regex.exec(window.location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

export const getWidth = (span) => {
	switch (span) {
		case 12:
			return "100%";
		case 11:
			return "91.66666667%";
		case 10:
			return "83.33333333%";
		case 9:
			return "75%";
		case 8:
			return "66.66666667%";
		case 7:
			return "58.33333333%";
		case 6:
			return "50%";
		case 5:
			return "41.66666667%";
		case 4:
			return "33.33333333%";
		case 3:
			return "25%";
		case 2:
			return "16.66666667%";
		case 1:
			return "8.33333333%";
		default:
			return "100%";
	}
}

export const getSchema = (schema, key, record) => {
	let updatedSchema;
	switch (schema["ui:widget"]) {
		case "itsy:label":
		case "label":
			const pattern = /[{{}}]/g;
			if (schema.id.match(pattern)) {
				record[key] = getlocaleText(schema.id);
			}
			if (schema.model) {
				record[key] = record[schema.model] ? record[schema.model][schema.id] ? record[schema.model][schema.id] :
					Array.isArray(record[schema.model]) ? record[schema.model][0][schema.id] : "" : record[schema.id] ? record[schema.id] : ""
			}
			if (schema.type === "date") {
				record[key] = new Date(record[schema.id]).toDateString()
			}
			return {
				name: key,
				properties: {
					...schema,
					title: record[key] && schema.prefix ? `${schema.prefix} ${record[key].toString()}` : record[key] ? record[key].toString() : ""
				}
			};
		case "itsy:image":
		case "image_control":
			let imageId;
			if (schema.fieldSchema.model) {
				record[key] = record[schema.fieldSchema.model] && record[schema.fieldSchema.model][schema.id] ?
					record[schema.fieldSchema.model][schema.id] : record[schema.id] ? record[schema.id] : "";
				if (record[schema.fieldSchema.model]) {
					imageId = schema.fieldSchema.primaryKey && record[schema.fieldSchema.model][schema.fieldSchema.primaryKey] ? record[schema.fieldSchema.model][schema.fieldSchema.primaryKey] :
						record[schema.fieldSchema.model]["cmis:objectId"] ? record[schema.fieldSchema.model]["cmis:objectId"] :
							schema.fieldSchema.primaryKey && record[schema.fieldSchema.primaryKey] ? record[schema.fieldSchema.primaryKey] : record["cmis:objectId"] ? record["cmis:objectId"] : "";
				} else {
					imageId = schema.fieldSchema.primaryKey && record[schema.fieldSchema.primaryKey] ? record[schema.fieldSchema.primaryKey] : record["cmis:objectId"] ? record["cmis:objectId"] : "";
				}
			}
			return {
				name: key,
				properties: {
					...schema,
					...schema.fieldSchema,
					"image_id": imageId,
					"image_value": record[key],
				}
			}
		case "itsy:link":
		case "external_link":
			return {
				name: key,
				properties: {
					...schema,
					label: record[schema.fieldSchema.model] ? record[schema.fieldSchema.model][schema.fieldSchema.title] : schema.fieldSchema.title,
					url: record[schema.fieldSchema.externalurl]
				}
			};
		default:
			return {
				name: key,
				properties: {
					...schema,
					value: record[key],
					[schema.recordProperty]: record,
				}
			}
	}
}
export function getlocaleText(displayName) {
	const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
	const pattern = /[{{}}]/g;
	const localeText = displayName && displayName.match !== undefined && displayName.match(pattern) !== null ? localeMsg.getLocaleData(displayName.substring(2, displayName.length - 2)) : displayName;
	return localeText ? localeText : displayName ? displayName : "";
};