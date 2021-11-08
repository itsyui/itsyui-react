import { DisplayRuleOperators } from "./displayRuleEvaluator";
export const PropertyMetadataTypeDefinition = "fvclient:propertyMetadata";

export function getEnhancedTypeById(metadata, typeId) {
	const typeDef = metadata.filter(t => t["fv:typeId"] === typeId);
	if (typeDef.length > 0) {
		return typeDef[0];
	} else {
		return null;
	}
}

export function getEnhancedPropertyById(metadata, propertyId) {
	const propertyDef = metadata.relation.filter(t => t.typeId === PropertyMetadataTypeDefinition && t["fv:propertyId"] === propertyId);
	if (propertyDef.length > 0) {
		return propertyDef[0];
	} else {
		return null;
	}
}

export function parseRegexString(stringRegex) {
	const pattern = new RegExp(stringRegex);
	return pattern;
}

export function isQueryOperator(value, operators) {
	return typeof value === "object" && typeof operators === "object" &&
		Object.keys(value).some(vKey => Object.values(operators).includes(vKey)) ? true : false;
}

export function getEquivalentJSOperator(queryOperator) {
	switch (queryOperator) {
		case DisplayRuleOperators.QueryOperators.OR:
			return DisplayRuleOperators.JsOperators.OR;
		case DisplayRuleOperators.QueryOperators.AND:
			return DisplayRuleOperators.JsOperators.AND;
		case DisplayRuleOperators.QueryOperators.NOTEQUAL:
			return DisplayRuleOperators.JsOperators.NOTEQUAL;
		case DisplayRuleOperators.QueryOperators.LESSERTHAN:
			return DisplayRuleOperators.JsOperators.LESSERTHAN;
		case DisplayRuleOperators.QueryOperators.LESSERTHANORQUAL:
			return DisplayRuleOperators.JsOperators.LESSERTHANORQUAL;
		case DisplayRuleOperators.QueryOperators.GREATERTHAN:
			return DisplayRuleOperators.JsOperators.GREATERTHAN;
		case DisplayRuleOperators.QueryOperators.GREATERTHANOREQUAL:
			return DisplayRuleOperators.JsOperators.GREATERTHANOREQUAL;
		case DisplayRuleOperators.QueryOperators.ISEMPTY:
			return DisplayRuleOperators.JsOperators.ISEMPTY;
		case DisplayRuleOperators.QueryOperators.ISNOTEMPTY:
			return DisplayRuleOperators.JsOperators.ISNOTEMPTY;
		case DisplayRuleOperators.QueryOperators.IN:
			return DisplayRuleOperators.JsOperators.IN;
		case DisplayRuleOperators.QueryOperators.NOTIN:
			return DisplayRuleOperators.JsOperators.NOTIN;
		case DisplayRuleOperators.QueryOperators.LIKE:
			return DisplayRuleOperators.JsOperators.LIKE;//returning same for "$regex" case which contains "like" and "not like" (string special case)
		case DisplayRuleOperators.QueryOperators.NOT:
			return DisplayRuleOperators.JsOperators.NOT;
	}
}

export const getSubscriberWidgetTransitionControlId = (currentPage, item, subscriberComponentProps) => {
	let widgetId;
	if (currentPage && item) {
		const { providerId, providerTypeId, providerSchemaId } = item;
		if (providerId) {
			widgetId = providerId;
			subscriberComponentProps && Object.assign(subscriberComponentProps, { ...currentPage.components[providerId].properties });
		} else {
			widgetId = Object.keys(currentPage.components).find(cKey => {
				const subscriberTypeId = currentPage.components[cKey].properties.typeId;
				const subscriberSchemaId = currentPage.components[cKey].properties.formSchemaId;
				if (subscriberTypeId === providerTypeId && subscriberSchemaId === providerSchemaId) {
					subscriberComponentProps && Object.assign(subscriberComponentProps, { ...currentPage.components[cKey].properties });
					return true;
				}
			});
		}
	}
	return widgetId;
};