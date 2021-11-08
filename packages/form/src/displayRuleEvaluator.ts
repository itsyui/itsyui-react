import { isQueryOperator, getEquivalentJSOperator } from "./utils";

export const DisplayRuleOperators = {
	QueryOperators: {
		OR: "$or",
		AND: "$and",
		NOTEQUAL: "$ne",
		LESSERTHAN: "$lt",
		LESSERTHANORQUAL: "$lte",
		GREATERTHAN: "$gt",
		GREATERTHANOREQUAL: "$gte",
		ISEMPTY: "$exists", // $exists value will be false
		ISNOTEMPTY: "$exists", // $exists value will be true
		IN: "$in",
		NOTIN: "$nin",
		LIKE: "$regex",
		NOT: "$not", // will come for not like
	},
	JsOperators: {
		OR: "||",
		AND: "&&",
		EQUAL: "===",
		NOTEQUAL: "!==",
		LESSERTHAN: "<",
		LESSERTHANORQUAL: "<=",
		GREATERTHAN: ">",
		GREATERTHANOREQUAL: ">=",
		ISEMPTY: "=== null",
		ISNOTEMPTY: "!== null",
		IN: "in",
		NOTIN: "not in",
		LIKE: "like", //for string special case
		NOT: "not",
	},
};

export class DisplayRuleEvalvator {

	//'false' will show the field in UI where as 'true' will hide the field in UI
	static handleHideOrShowField(fieldData: any, values: any, jsOperator: string = DisplayRuleOperators.JsOperators.AND, isMulti: boolean = false) {
		let condition = null;
		if (!fieldData || !fieldData.rule) { return true; }
		if (isQueryOperator(fieldData.rule, DisplayRuleOperators.QueryOperators)) {
			Object.keys(fieldData.rule).forEach((rKey => {
				jsOperator = getEquivalentJSOperator(rKey);
				condition = DisplayRuleEvalvator.getJSConditions(fieldData.rule, values, jsOperator, isMulti);
			}));
			return isMulti ? condition : condition && eval(condition) ? false : true;
		} else {
			condition = DisplayRuleEvalvator.getJSConditions(fieldData.rule, values, jsOperator, isMulti);
			// tslint:disable-next-line:no-eval
			return isMulti ? condition : condition !== null && eval(condition) ? false : true;
		}
	}

	static getJSConditions = (fieldCondition: any, formValues: any, jsOperator: string, isMulti: boolean) => {
		let jsCondition: any = "", jsComparisonOperator = DisplayRuleOperators.JsOperators.EQUAL;
		if (formValues && fieldCondition) {
			let fcValue = null;
			if (!isMulti && jsOperator === DisplayRuleOperators.JsOperators.OR) {// for 'or' conditions
				const currentConditions = fieldCondition[DisplayRuleOperators.QueryOperators.OR];
				// tslint:disable-next-line:no-unused-expression
				Array.isArray(currentConditions) && currentConditions.forEach((conditionData: any) => {
					const currentJSComparison = DisplayRuleEvalvator.handleHideOrShowField({ rule: conditionData }, formValues, jsOperator, true);
					jsCondition = jsCondition ? ` ${jsCondition} ${jsOperator} ${currentJSComparison}` : `${currentJSComparison}`;
				});
			} else {//for 'and' conditions
				Object.keys(fieldCondition).forEach((fKey: string) => {
					fcValue = fieldCondition[fKey];
					if (Array.isArray(fcValue)) {
						jsComparisonOperator = DisplayRuleOperators.JsOperators.IN;
					} else if (typeof fcValue === "object") {
						const fcKeys = Object.keys(fcValue);
						const fcValues = Object.values(fcValue);
						const fcQueryOperator = Array.isArray(fcKeys) && fcKeys.length > 0 ? fcKeys[0] : null;
						fcValue = Array.isArray(fcValues) && fcValues.length > 0 ? fcValues[0] : null;
						jsComparisonOperator = getEquivalentJSOperator(fcQueryOperator);
					}
					const comparison = DisplayRuleEvalvator.getComparisonCondition(formValues, jsComparisonOperator, fcValue, fKey, fieldCondition[fKey]);
					jsCondition = jsCondition ? ` ${jsCondition} ${jsOperator} ${comparison}` : typeof comparison === "boolean" ? comparison : `${comparison}`;
				});
			}
		}
		return jsCondition !== null ? jsCondition : true;
	}

	static getComparisonCondition = (formValues: any, jsComparisonOperator: string, fcValue: any, fKey: string, fieldCondition: any) => {
		const dateMatch = /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/;
		if (formValues[fKey] === null || formValues[fKey] === undefined || Number.isNaN(formValues[fKey])) {
			return false;
		} else if (Array.isArray(fcValue)) {
			const formArrValue = Array.isArray(formValues[fKey]) ? formValues[fKey] : [formValues[fKey]];
			const result = formArrValue.some(val => fcValue.includes(val));
			return jsComparisonOperator === DisplayRuleOperators.JsOperators.IN || jsComparisonOperator === DisplayRuleOperators.JsOperators.EQUAL ? result : !result;
		} else if (typeof formValues[fKey] === "number" && typeof fcValue === "string" && fcValue.match(dateMatch)
			&& new Date(formValues[fKey]).toString() !== "Invalid Date") {
			let fkeys = typeof fieldCondition === "object" ? Object.keys(fieldCondition) : fieldCondition;
			let fValues = typeof fieldCondition === "object" ? Object.values(fieldCondition) : fieldCondition;
			if (jsComparisonOperator === DisplayRuleOperators.JsOperators.NOT && fkeys.length === 1 && fValues.length === 1) {
				fkeys = Object.keys(fValues[0]);
				fValues = Object.values(fValues[0]);
			}
			if (Array.isArray(fkeys) && Array.isArray(fValues) && fkeys.length > 1 && fValues.length > 1) { //between case
				const between1JsOperator = getEquivalentJSOperator(fkeys[0]);
				const between2JsOperator = getEquivalentJSOperator(fkeys[1]);
				const date1 = new Date(new Date(fValues[0]).toDateString()).getTime();
				const date2 = new Date(new Date(fValues[1]).toDateString()).getTime();
				const currentValue = DisplayRuleEvalvator.getDateInTimeStamp(formValues[fKey]);
				const result = eval(`${currentValue} ${between1JsOperator} ${date1} && ${currentValue} ${between2JsOperator} ${date2}`);
				return jsComparisonOperator === DisplayRuleOperators.JsOperators.NOT ? !result : result;
			}
			return `${DisplayRuleEvalvator.getDateInTimeStamp(formValues[fKey])} ${jsComparisonOperator} ${new Date(new Date(fcValue).toDateString()).getTime()}`;
		} else if (typeof formValues[fKey] === "number") {
			let fkeys = typeof fieldCondition === "object" ? Object.keys(fieldCondition) : fieldCondition;
			let fValues = typeof fieldCondition === "object" ? Object.values(fieldCondition) : fieldCondition;
			if (jsComparisonOperator === DisplayRuleOperators.JsOperators.NOT && fkeys.length === 1 && fValues.length === 1) {
				fkeys = Object.keys(fValues[0]);
				fValues = Object.values(fValues[0]);
			}
			if (Array.isArray(fkeys) && Array.isArray(fValues) && fkeys.length > 1 && fValues.length > 1) { //between case
				const between1JsOperator = getEquivalentJSOperator(fkeys[0]);
				const between2JsOperator = getEquivalentJSOperator(fkeys[1]);
				const result = eval(`${formValues[fKey]} ${between1JsOperator} ${fValues[0]} && ${formValues[fKey]} ${between2JsOperator} ${fValues[1]}`);
				return jsComparisonOperator === DisplayRuleOperators.JsOperators.NOT ? !result : result;
			}
			return `${formValues[fKey]} ${jsComparisonOperator} ${fcValue}`;
		} else if (jsComparisonOperator === DisplayRuleOperators.JsOperators.LIKE || jsComparisonOperator === DisplayRuleOperators.JsOperators.NOT) {
			if (typeof fcValue === "object") {
				const fcValues = Object.values(fcValue);
				fcValue = fcValues.length > 0 ? fcValues[0] : fcValue;
			}
			if (typeof fcValue === "string") {
				const result = fcValue.startsWith("^") ? formValues[fKey].startsWith(fcValue.slice(1)) : fcValue.endsWith("$") ?
					formValues[fKey].endsWith(fcValue.slice(0, fcValue.length - 1)) : formValues[fKey].includes(fcValue);
				return jsComparisonOperator === DisplayRuleOperators.JsOperators.NOT ? !result : result;
			}
			return false;
		} else if (jsComparisonOperator === DisplayRuleOperators.JsOperators.ISEMPTY || jsComparisonOperator === DisplayRuleOperators.JsOperators.ISNOTEMPTY) {
			return fcValue ? !formValues[fKey] ? true : false : formValues[fKey] ? true : false;
		} else {
			return `'${formValues[fKey]}' ${jsComparisonOperator} '${fcValue}'`;
		}
	}

	static getDateInTimeStamp = (value) => {
		return new Date(new Date(value).toDateString()).getTime();
	}
}
