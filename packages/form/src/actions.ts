import { getLocaleString, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IDataSourceLake, ISchemaLoader } from "@itsy-ui/core";
import { parseRegexString } from "./utils";
import { getNewId } from "@itsy-ui/utils";
const Yup = require("yup");

export const FormActions = {
	AppActions: {
		State: {
			Modal: {
				SHOW_MODAL: "SHOW_MODAL",
				HIDE_MODAL: "HIDE_MODAL",
			},
			Indicator: {
				SHOW_INDICATOR: "SHOW_INDICATOR",
				HIDE_INDICATOR: "HIDE_INDICATOR",
			},
		},
	},
	State: {
		FORM_INIT: "FORM_INIT",
		FORM_INIT_LOAD: "FORM_INIT_LOAD",
		FORM_SCHEMA_BEFORE_LOAD: "FORM_SCHEMA_BEFORE_LOAD",
		FORM_SCHEMA_LOADED: "FORM_SCHEMA_LOADED",
		FORM_DONE: "FORM_DONE",
		FORM_LOADED: "FORM_LOADED",
		FORM_SUBMIT_CLICK: "FORM_SUBMIT_CLICK",
		FORM_BEFORE_SUBMIT: "FORM_BEFORE_SUBMIT",
		FORM_SUBMIT: "FORM_SUBMIT",
		FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
		FORM_VALUE_RESET: "FORM_VALUE_RESET",
		FORM_EXIT: "FORM_EXIT",
		FORM_DATA_FETCH: "FORM_DATA_FETCH",
		FORM_DATA_AFTER_LOAD: "FORM_DATA_AFTER_LOAD",
		FORM_RELOAD: "FORM_RELOAD",
		FORM_ERROR: "FORM_ERROR",
		FORM_BEFORE_HANDLE_CHANGE: "FORM_BEFORE_HANDLE_CHANGE",
		FORM_BEFORE_HANDLE_BLUR: "FORM_BEFORE_HANDLE_BLUR",
		FORM_VALUE_UPDATE: "FORM_VALUE_UPDATE",
		FORM_UPDATE_PROPERTY_DEFINITIONS: "FORM_UPDATE_PROPERTY_DEFINITIONS",
		FORM_UPDATE_SECTION: "FORM_UPDATE_SECTION",
	},
	Loader: "FormWidget",
	LoadMetadata: "FormActions.LoadMetadata",
	FormValues: "FormActions.FormValues",
	FormGenericError: "FormActions.GenericError",
	FormSubmitRef: "FormActions.FormSubmitRef",
	UpdateFormValues: "FormActions.UpdateFormValues",
	UpdateCurrentFormValues: "FormActions.UpdateCurrentFormValues",
	UpdatePropertyDefinitions: "FormActions.UpdatePropertyDefinitions",
	UpdateSection: "FormActions.UpdateSection",
	UpdateReadOnlyFields: "FormActions.UpdateReadOnlyFields",
	UpdateIsDirty: "FormActions.UpdateIsDirty",
	UpdateExtraParams: "FormActions.UpdateExtraParams",
	UpdateVisibleFieldValidationSchema: "FormActions.UpdateVisibleFieldValidationSchema",
	RefreshForm: "FormActions.RefreshForm",
	RestFormError: "FormActions.RestFormError",
	PropertyType: {
		STRING: "string",
		INTEGER: "integer",
		DATETIME: "datetime",
		LOOKUP: "lookup",
		BOOLEAN: "boolean",
		CHOICELIST: "choicelist",
	}
};

function loadMetadata(metadata: any, typeId: string, formSchemaId: string, validationSchema: any, displayRuleSchema: any, extraParams: {}, customDataSource: any) {
	return {
		type: FormActions.LoadMetadata,
		metadata: metadata,
		typeId: typeId,
		formSchemaId: formSchemaId,
		validationSchema: validationSchema,
		displayRuleSchema: displayRuleSchema,
		extraParams: extraParams,
		customDataSource: customDataSource,
	};
}

function genericFormError(formErrorMessage: string) {
	return {
		type: FormActions.FormGenericError,
		formErrorMessage,
	};
}

export function updateFormSubmitRef(formSubmitRef: any) {
	return {
		type: FormActions.FormSubmitRef,
		formSubmitRef,
	};
}

export function doFormInit(event: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_INIT_LOAD,
			typeId: event.typeId,
			objectData: event.objectData,
			formSchemaId: event.formSchemaId,
			formSchemaData: event.formSchemaData,
			extraParams: event.extraParams,
			queryParams: event.queryParams,
			customDataSource: event.customDataSource,
		});
	};
}

export function doFormInitLoad(event: any) {
	return async (_, dispatch: any, _transition: any) => {
		dispatch(onLoadMetadata(event.typeId, event.objectData, event.formSchemaId, event.formSchemaData, event.extraParams, event.queryParams, event.customDataSource));
	};
}

export function onLoadMetadata(typeId: string, objectData: string | any, formSchemaId: string, formSchemaData: any, extraParams: {}, queryParams: {}, customDataSource: any) {
	return async (_, _dispatch: any, transition: any) => {
		const schemaLoaderFactory = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>(FormActions.Loader);
		let formSchema = null;
		if (formSchemaData !== undefined) {
			formSchema = formSchemaData;
		} else {
			formSchema = await schemaLoader.getControlSchema({ typeId: typeId, formSchemaId: formSchemaId });
		}
		if (formSchema) {
			const validationSchema = getValidationSchema(formSchema.propertyDefinitions);
			transition({
				type: FormActions.State.FORM_SCHEMA_BEFORE_LOAD,
				typeId: typeId,
				formSchemaId: formSchemaId,
				objectData: objectData,
				formSchema: formSchema,
				validationSchema: validationSchema,
				extraParams: extraParams,
				queryParams: queryParams,
				customDataSource: customDataSource,
			});
		} else {
			transition({
				type: FormActions.State.FORM_ERROR,
				errorMessage: "{{form.schema_error}}",
			});
		}
	};
}

export function doFormSchemaBeforeLoad(typeId: string, formSchemaId: string, objectData: string | any, formSchema: any, validationSchema: any, extraParams: {}, queryParams: {}, customDataSource: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_SCHEMA_LOADED,
			typeId: typeId,
			formSchemaId: formSchemaId,
			objectData: objectData,
			formSchema: formSchema,
			validationSchema: validationSchema,
			extraParams: extraParams,
			queryParams: queryParams,
			customDataSource: customDataSource,
		});
	};
}

export function doFormSchemaLoaded(typeId: string, formSchemaId: string, objectData: string | any, metadata: any, validationSchema: any, displayRuleSchema?: any, extraParams?: {}, queryParams?: {}, customDataSource?: any) {
	return async (getState: any, dispatch: any, transition: any) => {
		// render metadata first so the form UI load
		dispatch(loadMetadata(metadata, typeId, formSchemaId, validationSchema, displayRuleSchema, { ...extraParams, ...queryParams && { queryParams } }, customDataSource));
		if (typeof objectData === "string") {
			// objectData is objectId
			const objectId = objectData as string;
			if (objectId !== undefined && objectId !== null && objectId !== "") {
				transition({
					type: FormActions.State.FORM_DATA_FETCH,
					typeId: typeId,
					objectId: objectId,
					formSchema: metadata,
				});
			}
		} else {
			const { customDataSource, metadata } = getState();
			const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
			const datasource = customDataSource ? customDataSource : dataLoader.getLoader<IDataSourceLake>("datasource");
			const hasRelatedRecords = metadata.propertyDefinitions ? Object.keys(metadata.propertyDefinitions).some(key => metadata.propertyDefinitions[key].fieldType === "mapped") : false;
			if (hasRelatedRecords && objectData) {
				const relatedRecords = await getRelatedRecords(objectData["cmis:objectId"], datasource, metadata.propertyDefinitions);
				objectData = { ...objectData, ...relatedRecords };
			}
			// object data is record
			transition({
				type: FormActions.State.FORM_DATA_AFTER_LOAD,
				typeId: typeId,
				record: objectData,
				formSchema: metadata,
			});
		}
	};
}

export function doFormDataFetch(typeId: string, objectId: string, formSchema: {}) {
	return async (getState, dispatch: any, transition: any) => {
		const { customDataSource, metadata } = getState();
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const datasource = customDataSource ? customDataSource : dataLoader.getLoader<IDataSourceLake>("datasource");
		try {
			let record = {};
			if (objectId !== undefined && objectId !== null && objectId !== "") {
				record = await datasource.getObject(typeId, objectId);
				const hasRelatedRecords = metadata.propertyDefinitions ? Object.keys(metadata.propertyDefinitions).some(key => metadata.propertyDefinitions[key].fieldType === "mapped") : false;
				if (hasRelatedRecords) {
					const relatedRecords = await getRelatedRecords(objectId, datasource, metadata.propertyDefinitions);
					record = { ...record, ...relatedRecords };
				}
			}

			transition({
				type: FormActions.State.FORM_DATA_AFTER_LOAD,
				typeId: typeId,
				objectId: objectId,
				formSchema: formSchema,
				record: record,
			});
		} catch (e) {
			// transition to form error
			dispatch(genericFormError(e.message));
		}
	};
}

export async function getRelatedRecords(parentId: string, datasource: any, propDefs: any) {
	const relatedRecords = {};
	if (parentId && datasource && propDefs) {
		await Promise.all(Object.keys(propDefs).map(async (propKey) => {
			if (propDefs.hasOwnProperty(propKey)) {
				const fieldSchema = propDefs[propKey];
				if (fieldSchema && fieldSchema.fieldType === "mapped" && fieldSchema.metadata) {
					const { idField, typeId } = fieldSchema.metadata;
					const query = { "filter": { [idField]: [{ operation: "eq", value: `${parentId}` }] } };
					const records = await datasource.getAll(typeId, query);
					if (records) { delete records.totalRecordsCount; }
					relatedRecords[fieldSchema.id] = records ? records : [];
				}
			}
		}));
	}
	return relatedRecords;
}

export function doFormDataAfterLoad(typeId: string, objectId: string, record: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_RELOAD,
			typeId: typeId,
			objectId: objectId,
			record: record,
		});
	};
}

export function doFormReload(typeId: string, objectId: string, record: any) {
	return async (getState, dispatch: any, transition: any) => {
		const { displayRuleSchema, validationSchema } = getState();
		if (displayRuleSchema !== undefined && Object.keys(displayRuleSchema).length > 0) {
			dispatch(renderRules(displayRuleSchema, record, validationSchema));
		}
		transition({
			type: FormActions.State.FORM_LOADED,
		});
		// dispatch initial values to form reducer state
		dispatch({
			type: FormActions.FormValues,
			typeId: typeId,
			objectId: objectId,
			formValues: record,
		});
	};
}

export function doFormSubmitClick() {
	return (getState: any, _dispatch: any, transition: any) => {
		const { formSubmitRef } = getState();
		if (formSubmitRef !== undefined) {
			formSubmitRef.current.click();
			transition({
				type: FormActions.State.FORM_BEFORE_SUBMIT,
			});
		} else {
			// error case
		}
	};
}

export function doFormBeforeSubmit(values: any, setSubmitting: any) {
	setSubmitting(false);
	return (_, dispatch: any, transition: any) => {
		transition({
			type: FormActions.AppActions.State.Indicator.SHOW_INDICATOR,
			loadingMessage: "{{form.submitIndicator}}",
		});
		dispatch(updateFormValues(values));
		transition({
			type: FormActions.State.FORM_SUBMIT,
			values: values,
		});
		dispatch({
			type: FormActions.UpdateIsDirty,
		});
	};
}

function updateFormValues(values: any) {
	return {
		type: FormActions.UpdateFormValues,
		values,
	};
}

export function doFormAfterSubmit() {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { typeId, objectId } = getState();
		// reload form
		transition({
			type: FormActions.AppActions.State.Indicator.HIDE_INDICATOR,
		});
		transition({
			type: FormActions.State.FORM_LOADED,
			typeId: typeId,
			objectId: objectId,
		});
	};
}

export function doFormValueReset() {
	return async (getState: any, dispatch: any, transition: any) => {
		const { typeId, formSchemaId, objectId } = getState();
		const values = {};
		dispatch(updateFormValues(values));
		transition({
			type: FormActions.State.FORM_INIT,
			typeId: typeId,
			formSchemaId: formSchemaId,
			objectId: objectId,
		});
	};
}

export function doFormShowError(evt: any) {
	return async (_, dispatch: any, transition: any) => {
		const errorMessage = getLocaleString(evt, "errorMessage");
		dispatch(genericFormError(errorMessage));
		transition({
			type: FormActions.State.FORM_LOADED,
		});
		transition({
			type: FormActions.AppActions.State.Indicator.HIDE_INDICATOR,
		});
	};
}

export function formOnHandleChange(value: any, eventType: string) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { formValues } = getState();
		transition({
			type: FormActions.State.FORM_BEFORE_HANDLE_CHANGE,
			value,
			formValues,
			eventType,
		});
	};
}

export function doFormBeforeHandleChange(currentValue: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_VALUE_UPDATE,
			values: currentValue,
		});
	};
}

function updateCurentformValues(values: any, mode: number | undefined) {
	return {
		type: FormActions.UpdateCurrentFormValues,
		values,
		mode,
	};
}

export function formOnHandleBlur(value: any) {
	return async (getState: any, _dispatch: any, transition: any) => {
		const { formValues } = getState();
		transition({
			type: FormActions.State.FORM_BEFORE_HANDLE_BLUR,
			value,
			formValues,
		});
	};
}

export function doFormBeforeHandleBlur(currentValue: any) {
	return async (_, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_VALUE_UPDATE,
			values: currentValue,
		});
	};
}

function renderRules(displayRuleSchema: any, formValues: {}, validationSchema: any) {
	return (_getState, dispatch: any, _transition: any) => {
		const readOnlyFields = {}, vSchema = {};
		Object.keys(displayRuleSchema).forEach(ele => {
			const isReadOnly = displayRuleSchema[ele].call(null, formValues);
			readOnlyFields[ele] = isReadOnly;
		});
		if (validationSchema && Object.keys(validationSchema).length > 0) {
			Object.keys(validationSchema).forEach(id => {
				if (readOnlyFields.hasOwnProperty(id) && !readOnlyFields[id]) {
					vSchema[id] = validationSchema[id];
				} else if (!readOnlyFields.hasOwnProperty(id)) {
					vSchema[id] = validationSchema[id];
				}
			});
		}
		dispatch({
			type: FormActions.UpdateReadOnlyFields,
			readOnlyFields,
			visibleFieldVSchema: vSchema,
		});
	};
}

export function doFormValueUpdate(values: any, mode: number | undefined) {
	return async (getState, dispatch: any, transition: any) => {
		dispatch(updateCurentformValues(values, mode));
		const { formValues, displayRuleSchema, isDirty, validationSchema } = getState();
		if (!isDirty) {
			dispatch({
				type: FormActions.UpdateIsDirty,
			});
		}
		if (displayRuleSchema !== undefined && Object.keys(displayRuleSchema).length > 0) {
			dispatch(renderRules(displayRuleSchema, formValues, validationSchema));
		}
		transition({
			type: FormActions.State.FORM_LOADED,
		});
	};
}

const getValidationSchema = (propertyDefs: any) => {
	const validation = {};
	const localeMsg = WidgetsFactory.instance.services["appStateProvider"];
	const requireString = localeMsg.getLocaleData("comman.isRequired");
	for (const x in propertyDefs) {
		const property = propertyDefs[x];
		property["displayName"] = getLocaleString(property, "displayName");
		if (property.required || property.validationPattern) {
			const errorMsg = property.validationError ? property.validationError : `${[property.displayName] + requireString}`;
			const requiredMsg = !property.validationPattern && property.validationError ? property.validationError : `${[property.displayName] + requireString}`
			switch (property.propertyType) {
				case FormActions.PropertyType.STRING: {
					let yupStringObj = Yup.string();
					if (property.required) {
						yupStringObj = yupStringObj.required(requiredMsg);
					}
					if (property.validationPattern) {// making stringified regex to  regex
						const regexPattern = parseRegexString(property.validationPattern);
						yupStringObj = yupStringObj.matches(regexPattern, property.validationError);

					}
					validation[property.id] = yupStringObj;
					break;
				};
				case FormActions.PropertyType.INTEGER: {
					let yupObj = property.validationPattern ? Yup.string() : Yup.number();
					if (property.required) {
						yupObj = yupObj.required(requiredMsg)
					}
					if (property.validationPattern) {
						const regexPattern = parseRegexString(property.validationPattern);
						yupObj = yupObj.matches(regexPattern, property.validationError);
					}
					validation[property.id] = yupObj;
					break;
				};
				case FormActions.PropertyType.LOOKUP:
				case FormActions.PropertyType.CHOICELIST:
				case FormActions.PropertyType.DATETIME: {
					if (property.required) {
						validation[property.id] = Yup.string()
							.required(errorMsg);
					}
					break;
				};
				case FormActions.PropertyType.BOOLEAN: {
					if (property.required) {
						validation[property.id] = Yup.boolean()
							.required(errorMsg);
					}
					break;
				};
			}
		}
	}

	return validation;
};
function updatePropertyDefinitions(propertyDefinitions: any, mode: number, updatedValidationSchema: {}) {
	return {
		type: FormActions.UpdatePropertyDefinitions,
		propertyDefinitions,
		mode,
		updatedValidationSchema,
	};
}

export function doFormUpdatePropertyDefinitions(event: any) {
	return async (getState, dispatch: any, transition: any) => {
		const { validationSchema } = getState();
		const validation = event.mode && event.mode === 0 ? {} : getValidationSchema(event.propertyDefinitions);
		const updateValidationSchema = { ...validationSchema, ...validation };
		dispatch(updatePropertyDefinitions(event.propertyDefinitions, event.mode, updateValidationSchema));
		const { metadata } = getState();
		const currentVS = getValidationSchema(metadata.propertyDefinitions);
		dispatch({
			type: FormActions.UpdateVisibleFieldValidationSchema,
			visibleFieldVSchema: currentVS,
		});
		transition({
			type: FormActions.State.FORM_LOADED,
		});
	};
}

export function doFormBeforeUpdateSection(event: any) {
	return async (_getState, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_UPDATE_SECTION,
			sections: event.sections,
		});
	};
}

function updateSection(sections: any) {
	return {
		type: FormActions.UpdateSection,
		sections,
	};
}

export function doFormUpdateSection(event: any) {
	return async (_getState, dispatch: any, transition: any) => {
		dispatch(updateSection(event.sections));
		transition({
			type: FormActions.State.FORM_LOADED,
		});
	};
}

export function doFormGetState(onData: any) {
	return async (getState, _dispatch: any, transition: any) => {
		transition({
			type: FormActions.State.FORM_LOADED,
		});
		const formState = getState();
		onData.call(null, formState);
	};
}

export function doFormUpdateExtraParams(params: {}) {
	return async (getState, dispatch: any, transition: any) => {
		const { extraParams } = getState();
		const updatedParams = { ...extraParams, ...params };
		dispatch({
			type: FormActions.UpdateExtraParams,
			updatedParams,
		});
		transition({
			type: FormActions.State.FORM_LOADED,
		});
	};
}

function refreshForm(isHardReload: boolean, typeId: string) {
	return {
		type: FormActions.RefreshForm,
		formComponentKey: isHardReload ? `form-${typeId}-${getNewId()}` : null,
		values: {},
	};
}

export function doFormRefresh(event: any) {
	return async (_getState: any, dispatch: any, transition: any) => {
		const { typeId, isHardReload } = event;
		dispatch(refreshForm(isHardReload, typeId));
		transition({
			type: FormActions.State.FORM_LOADED,
		});
	};
}

export function doResetFromError() {
	return (_getState: any, dispatch: any) => {
		dispatch({ type: FormActions.RestFormError });
	};
}