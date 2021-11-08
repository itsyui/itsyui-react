import { ICustomStateMachineData, WidgetsFactory } from "@itsy-ui/core";
import { DataLoaderFactory, IConfigLoader, IDataSourceLake, IPageBindProvider } from "@itsy-ui/core";
import axios from "axios";
import { getRelatedRecords } from "./actions";
import { DisplayRuleEvalvator } from "./displayRuleEvaluator";
import { getSubscriberWidgetTransitionControlId } from "./utils";
import { getItemFromLocalStorage, isEmptyObject, getNewId, applyTemplate, getFeatureKey, removeContentPropsFromInputMetadata, removeArrayValue, generateURLQueryParams, RegExPatterns, getSubscriberWidgetControlId, getWidgetId } from "@itsy-ui/utils";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const pageBindProvider: IPageBindProvider = dataLoader.getLoader("pageBindProvider");
const schemaProvider: any = dataLoader.getLoader("appSchemaProvider");

const Actions = {
	Features: {
		UseCustomDatasource: "useCustomDatasource",
		UpdateFormContextFromGrid: "updateFormContextFromGrid",
		DefaultFormSubmit: "defaultFormSubmit",
		InvokeProcessFlowOnFormSubmit: "invokeProcessFlowOnFormSubmit",
		SetRecordId: "setRecordId",
		DisplayRule: "displayRule",
	},
	Form: {
		FORM_SCHEMA_LOADED: "FORM_SCHEMA_LOADED",
		FORM_BEFORE_HANDLE_CHANGE: "FORM_BEFORE_HANDLE_CHANGE",
		FORM_AFTER_SUBMIT: "FORM_AFTER_SUBMIT",
		FORM_ERROR: "FORM_ERROR",
	},
	Page: {
		PAGE_GET_STATE: "PAGE_GET_STATE",
	},
	Grid: {
		GRID_SELECTED_ROWS_DONE: "GRID_SELECTED_ROWS_DONE",
	},
	Type: {
		NAVIGATE_URL: "NAVIGATE_URL",
		FORM_REFRESH: "FORM_REFRESH",
	},
};
const FormReloadType = {
	Self: "self",
	External: "external",
};
function doForwardGridSelectedRowsToForm(evt: any, currentPage: any) {
	return async (getState, _dispatch, transition) => {
		const { controlID, selectedRows } = evt;
		const { customDataSource } = getState();
		let selectedRecord = selectedRows[selectedRows.length - 1];
		let subscribeWidgetControlID;

		if (controlID.match(RegExPatterns.GUID)) { // checking controlID is GUID or not
			const subscriberComponentProps: any = {};
			subscribeWidgetControlID = getSubscriberWidgetControlId(currentPage, controlID, Actions.Features.UpdateFormContextFromGrid, subscriberComponentProps);
			if (selectedRecord && subscriberComponentProps.typeId && subscriberComponentProps.formSchemaId) {
				const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
				const datasource = customDataSource ? customDataSource : dataLoader.getLoader<IDataSourceLake>("datasource");
				const subscriberFormSchema = await schemaProvider.getSchema(`/app/${subscriberComponentProps.typeId.replace(/:/g, "_")}/form/${subscriberComponentProps.formSchemaId.replace(/:/g, "_")}/data`);
				const hasRelatedRecords = subscriberFormSchema ? Object.keys(subscriberFormSchema.propertyDefinitions).some(key => subscriberFormSchema.propertyDefinitions[key].fieldType === "mapped") : false;
				if (hasRelatedRecords) {
					const relatedRecords = await getRelatedRecords(selectedRecord["cmis:objectId"], datasource, subscriberFormSchema.propertyDefinitions);
					selectedRecord = { ...selectedRecord, ...relatedRecords };
				}
			}
		}

		transition({
			...subscribeWidgetControlID && { controlID: subscribeWidgetControlID, strict: true },
			type: "FORM_BEFORE_HANDLE_CHANGE",
			value: selectedRecord,
		});
		transition({
			controlID: controlID,
			strict: true,
			type: "GRID_SELECTED_ROWS_DONE",
			selectedRows: selectedRows,
		});
	};
}

const updateFormContextFromGridStateMachine = (currentPage) => {
	const selectedRowFormGridBinding: ICustomStateMachineData = {
		name: "SeletedRowFormGridBinding",
		stateJSON: {
			"states": {
				"gridSelectedRows": {
					"onEntry": [
						"onGridSelectedRows",
					],
					"on": {
						"GRID_SELECTED_ROWS_DONE": "gridSelectedRowsDone",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onGridSelectedRows: (evt) => dispatch(doForwardGridSelectedRowsToForm(evt, currentPage)),
			};
		},
	};

	return selectedRowFormGridBinding;
};

pageBindProvider.putSchema("GridWidget", "updateFormContextFromGrid", updateFormContextFromGridStateMachine);

function doFormSubmitCustomDatasource(event: any, currentPage: any, featureMetadata: any) {
	return async (getState, _dispatch: any, transition: any) => {
		const { values, controlID } = event;
		const { metadata } = getState();
		//Get the data form Page layout
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.UseCustomDatasource);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		const featureKey = getFeatureKey(currentPage, Actions.Features.UseCustomDatasource, widgetId);
		const customDatasourceName = currentPage["pageBinding"][widgetId] ? currentPage["pageBinding"][widgetId][featureKey]["metadata"]["datasource"] : "";
		const datasource = customDatasourceName ? dataLoader.getLoader<IDataSourceLake>(customDatasourceName) : dataLoader.getLoader<IDataSourceLake>("datasource");
		try {
			if (datasource) {
				await datasource.upsert(values, metadata);
				transition({
					controlID: controlID,
					strict: true,
					type: Actions.Form.FORM_AFTER_SUBMIT,
				});

				if (featureMetadata.onSubmitTransitions && featureMetadata.onSubmitTransitions.length > 0) {
					for (let index = 0; index < featureMetadata.onSubmitTransitions.length; index++) {
						const element = featureMetadata.onSubmitTransitions[index];
						if (element.type) {
							transition(element);
						}
					}
				}
			} else {
				transition({
					controlID: controlID,
					strict: true,
					type: Actions.Form.FORM_ERROR,
					errorMessage: `Error getting datasource: ${customDatasourceName}`,
				});
			}
		} catch (er) {
			transition({
				controlID: controlID,
				strict: true,
				type: Actions.Form.FORM_ERROR,
				errorMessage: er,
			});
		}
	};
}

const formSubmitCustomDatasourceStateMachine = (currentPage, featureMetadata) => {
	const formSubmitCustomDatasourceBinding: ICustomStateMachineData = {
		name: "formSubmitCustomDatasourceBinding",
		stateJSON: {
			"states": {
				"formSubmit": {
					"onEntry": [
						"onFormSubmitCustomDatasource",
					],
					"on": {
						"FORM_AFTER_SUBMIT": "formAfterSubmit",
						"FORM_ERROR": "formError",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onFormSubmitCustomDatasource: (event) => dispatch(doFormSubmitCustomDatasource(event, currentPage, featureMetadata)),
			};
		},
	};
	return formSubmitCustomDatasourceBinding;
};

pageBindProvider.putSchema("FormWidget", Actions.Features.UseCustomDatasource, formSubmitCustomDatasourceStateMachine);


function executeTransition(item: any, formValues: any, transition: any, responseData: any, currentPage?: any, stateProps?: any) {
	if (item.type === Actions.Type.NAVIGATE_URL && item.pageURL) {
		const history = WidgetsFactory.instance.services["history"];
		const baseURL = history.location.pathname.split("/");
		baseURL.pop();
		const params = generateURLQueryParams(item, { ...formValues, ...responseData });
		const url = `${baseURL.join("/")}/${item["pageURL"]}${params && params}`;
		delete item.pageURL;
		delete item.queryParams;
		item["url"] = url;
	} else if (item.type === Actions.Type.FORM_REFRESH && currentPage && stateProps) {
		const itemDeleteProps = ["providerSchemaId", "providerTypeId", "source"];
		let { typeId, controlID } = stateProps;
		if (item.source === FormReloadType.External) {
			const subscriberComponentProps: any = {};
			const subscriberControlID = getSubscriberWidgetTransitionControlId(currentPage, item, subscriberComponentProps);
			typeId = subscriberComponentProps.typeId;
			controlID = subscriberControlID;
		}
		item = { ...item, ...{ typeId, controlID, strict: true } };
		itemDeleteProps.forEach(key => delete item[key]);
	}
	item["responseData"] = responseData;
	transition(item);
}

function doDefaultFormSubmit(event: any, currentPage: any, featureMetadata: any) {
	return async (getState, _dispatch: any, transition: any) => {
		const { values, controlID } = event;
		const { metadata, customDataSource, typeId } = getState();
		const datasource = customDataSource ? customDataSource : dataLoader.getLoader<IDataSourceLake>("datasource");
		const { save } = featureMetadata.metadata;
		if (!values.hasOwnProperty("cmis:name")) {
			values["cmis:name"] = getNewId();
		}
		const withResponsValue = { ...values };
		try {
			let responseData;
			if (save !== false) {
				if (datasource.upsert !== undefined) {
					responseData = await datasource.upsert(values, metadata);
				} else {
					responseData = await datasource.create(values, metadata);
				}
				if (responseData && responseData.succinctProperties) {
					Object.keys(responseData.succinctProperties).forEach(t => withResponsValue[t] = Array.isArray(responseData.succinctProperties[t]) ? responseData.succinctProperties[t][0] : responseData.succinctProperties[t]);
				}
			}

			transition({
				controlID: controlID,
				strict: true,
				type: Actions.Form.FORM_AFTER_SUBMIT,
			});

			if (featureMetadata.onSubmitTransitions && featureMetadata.onSubmitTransitions.length > 0) {
				for (let index = 0; index < featureMetadata.onSubmitTransitions.length; index++) {
					const element = featureMetadata.onSubmitTransitions[index];
					if (element.type) {
						executeTransition(element, withResponsValue, transition, responseData, currentPage, { controlID, typeId });
					}
				}
			}
		} catch (er) {
			const errorMessage = er && er.response && er.response.data ? er.response.data.errorMessage && er.response.data.errorMessage : er.message ? er.message : "";
			transition({
				controlID: controlID,
				strict: true,
				type: Actions.Form.FORM_ERROR,
				errorMessage: errorMessage,
			});
		}
	};
}

const formSubmitStateMachine = (currentPage, featureMetadata) => {
	const formSubmitPageBinding: ICustomStateMachineData = {
		name: "defaultformSubmit",
		stateJSON: {
			"states": {
				"formSubmit": {
					"onEntry": [
						"onDefaultFormSubmit",
					],
					"on": {
						"FORM_AFTER_SUBMIT": "formAfterSubmit",
						"FORM_ERROR": "formError",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onDefaultFormSubmit: (event) => dispatch(doDefaultFormSubmit(event, currentPage, featureMetadata)),
			};
		},
	};

	return formSubmitPageBinding;
};

pageBindProvider.putSchema("FormWidget", Actions.Features.DefaultFormSubmit, formSubmitStateMachine);

const getRecordFromRecordId = (recordId, queryParams) => {
	const matchedItem = recordId && recordId.match(RegExPatterns.SquareBracket);
	let objectId = "";
	if (matchedItem && Array.isArray(matchedItem) && matchedItem.length > 0 && queryParams && !isEmptyObject(queryParams)) {
		objectId = queryParams.hasOwnProperty(matchedItem[0].substring(1, matchedItem[0].length - 1)) ? queryParams[matchedItem[0].substring(1, matchedItem[0].length - 1)] : "";
	} else {
		objectId = recordId;
	}
	return objectId;
};

const getRecordFromQueryParams = (fromQueryParams, queryParams) => {
	const data = {};
	const splitedQp = fromQueryParams && fromQueryParams.split(",");
	if (splitedQp && Array.isArray(splitedQp) && splitedQp.length > 0) {
		splitedQp.forEach(ele => {
			if (queryParams.hasOwnProperty(ele)) {
				data[ele] = queryParams[ele];
			}
		});
		return data;
	}

	return data;
};

function doSetRecordIdFormInit(event: any, currentPage: any) {
	return async (_getState, _dispatch: any, transition: any) => {
		const { controlID, queryParams } = event;
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.SetRecordId);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		const featureKey = getFeatureKey(currentPage, Actions.Features.SetRecordId, widgetId);
		const metadata = currentPage["pageBinding"][widgetId][featureKey]["metadata"]; //getting data from current features
		const { recordFrom, recordId, fromQueryParams } = metadata;
		let objectData;
		if (recordFrom) {
			if (recordFrom === "recordId") {
				objectData = getRecordFromRecordId(recordId, queryParams);
			} else {
				objectData = getRecordFromQueryParams(fromQueryParams, queryParams);
			}
		} else {
			objectData = getRecordFromRecordId(recordId, queryParams);
		}
		transition({
			...event,
			controlID,
			strict: true,
			type: "FORM_INIT_LOAD",
			...objectData && { objectData: objectData },
		});
	};
}

const setRecordIdStateMachine = (currentPage) => {
	const setRecordIdBinding: ICustomStateMachineData = {
		name: "setRecordIdBinding",
		stateJSON: {
			"states": {
				"formInit": {
					"onEntry": [
						"onSetRecordIdFormInit",
					],
					"on": {
						"FORM_INIT_LOAD": "formInitLoad",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onSetRecordIdFormInit: (event) => dispatch(doSetRecordIdFormInit(event, currentPage)),
			};
		},
	};

	return setRecordIdBinding;
};

pageBindProvider.putSchema("FormWidget", Actions.Features.SetRecordId, setRecordIdStateMachine);

const getInputParamsValuesFromQueryParams = (params, queryParams) => {
	if (params && !isEmptyObject(params) && queryParams && !isEmptyObject(queryParams)) {
		Object.keys(params).forEach(t => {
			const matchedValue = new RegExp(RegExPatterns.SquareBracket).exec(params[t]);
			if (matchedValue && Array.isArray(matchedValue) && matchedValue.length > 0 && queryParams.hasOwnProperty(matchedValue[1])) {
				params[t] = queryParams[matchedValue[1]];
			}
		});
	}
	return params;
};

function doInvokeProcessFlowOnFormSubmit(event: any, currentPage: any, featureMetadata: any) {
	return async (getState, _dispatch: any, transition: any) => {
		const { values, controlID } = event;
		const formState = getState();

		const configData = dataLoader.getLoader<IConfigLoader>("config");
		const cfg = await configData.getConfig();
		if (cfg === null) {
			throw new Error("Config.json not available for API");
		}
		const PF_URL = cfg["PF_URL"];
		if (!PF_URL) {
			throw new Error("Connector configuration missing in the application");
		}

		const localFVData: any = getItemFromLocalStorage("FV_TENANT_INFO");
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.InvokeProcessFlowOnFormSubmit);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		const featureKey = getFeatureKey(currentPage, Actions.Features.InvokeProcessFlowOnFormSubmit, widgetId);
		const metadata = currentPage["pageBinding"][widgetId][featureKey]["metadata"];

		if (metadata && !isEmptyObject(metadata) && metadata.processFlow) {
			try {
				const headers = {
					"Content-Type": "application/json",
					"x-cmis-repo-id": localFVData.repository[0],
					"x-cmis-tenantId": localFVData.tenantId,
					"authorization": metadata.useBearer ?
						`Bearer ${localFVData.token}` :
						`Basic ${btoa(`${localFVData.userAttributes["userId"]}:${localFVData.token}`)}`,
				};
				const params = metadata.params && typeof metadata.params === "string" ? JSON.parse(metadata.params) : metadata.params ? metadata.params : {};
				let inputMetaData: any = { userId: localFVData.userAttributes.userId };
				const { extraParams } = formState;
				const inputParams = getInputParamsValuesFromQueryParams(params, extraParams.queryParams);
				const updatedRecord = { ...values, ...inputParams };
				inputMetaData = { ...inputMetaData, ...updatedRecord };
				const { save } = metadata;
				if (save) {
					const datasource = formState.customDataSource ? formState.customDataSource : dataLoader.getLoader<IDataSourceLake>("datasource");
					let responseData;
					if (datasource.upsert !== undefined) {
						responseData = await datasource.upsert(values, formState.metadata);
					} else {
						responseData = await datasource.create(values, formState.metadata);
					}
					if (responseData) {
						if (metadata.template) {
							inputMetaData = applyTemplate(metadata.template, { ...responseData["succinctProperties"], ...inputMetaData }, true);
							//remove this after cmis fix
							inputMetaData = removeArrayValue(inputMetaData);
						} else {
							inputMetaData = { ...inputMetaData, "cmis:objectId": responseData["cmis:objectId"] };
						}
					}
				} else {
					if (metadata.template) {
						inputMetaData = applyTemplate(metadata.template, { ...inputMetaData }, true);
					}
				}

				let body: any = null;
				if (metadata.requestType === "multipart") {
					body = new FormData();
					const contentMetaData = removeContentPropsFromInputMetadata(inputMetaData);

					if (metadata.processFlowName) {
						body.append("deploymentName", metadata.processFlowName);
					} else {
						body.append("deploymentId", metadata.processFlow);
					}

					body.append("variables", JSON.stringify(inputMetaData));
					// append content at root level of form data
					for (let key in contentMetaData) {
						body.append(key, contentMetaData[key][0], key);
					}
					headers["Content-Type"] = "multipart/form-data";
				} else {
					body = {
						"variables": inputMetaData,
					};
					if (metadata.processFlowName) {
						body["deploymentName"] = metadata.processFlowName;
					} else {
						body["deploymentId"] = metadata.processFlow;
					}
				}

				const res = await axios.post(`${PF_URL}/pf/process-instances`, body, { headers });
				transition({
					controlID: controlID,
					strict: true,
					type: Actions.Form.FORM_AFTER_SUBMIT,
				});

				if (featureMetadata.onSubmitTransitions && featureMetadata.onSubmitTransitions.length > 0) {
					const resData = getPfResponseData(res);
					for (let index = 0; index < featureMetadata.onSubmitTransitions.length; index++) {
						const element = featureMetadata.onSubmitTransitions[index];
						if (element.type) {
							executeTransition(element, values, transition, resData);
						}
					}
				}
			} catch (er) {
				const response = er && er.response && er.response.data ? er.response.data : er.message ? er.message : null;
				let errorMessage = response ? response.message || response.errorMessage : null;
				if (!errorMessage)
					errorMessage = "Error in network call";
				transition({
					controlID: controlID,
					strict: true,
					type: Actions.Form.FORM_ERROR,
					errorMessage: errorMessage,
				});
			}
		} else {
			transition({
				controlID: controlID,
				strict: true,
				type: Actions.Form.FORM_ERROR,
				errorMessage: "Error getting current page",
			});
		}

	};
}

const getPfResponseData = (responseData) => {
	return responseData && responseData.hasOwnProperty("data") && responseData["data"].hasOwnProperty("data") ? responseData["data"]["data"] : {};
}

const invokeProcessflowOnFormSubmitStateMachine = (currentPage, featureMetadata) => {
	const invokeProcessflowOnFormSubmitPageBinding: ICustomStateMachineData = {
		name: "invokeProcessflowOnFormSubmit",
		stateJSON: {
			"states": {
				"formSubmit": {
					"onEntry": [
						"onInvokeProcessFlowOnFormSubmit",
					],
					"on": {
						"FORM_AFTER_SUBMIT": "formAfterSubmit",
						"FORM_ERROR": "formError",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onInvokeProcessFlowOnFormSubmit: (event) => dispatch(doInvokeProcessFlowOnFormSubmit(event, currentPage, featureMetadata)),
			};
		},
	};

	return invokeProcessflowOnFormSubmitPageBinding;
};

pageBindProvider.putSchema("FormWidget", Actions.Features.InvokeProcessFlowOnFormSubmit, invokeProcessflowOnFormSubmitStateMachine);

function doDisplayRuleBindingFormSchemaBeforeLoad(event: any, currentPage: any) {
	return async (_getState, _dispatch: any, transition: any) => {
		const { typeId, formSchemaId, objectData, formSchema, validationSchema, extraParams, controlID } = event;
		const currentWidgetId = getWidgetId(currentPage, controlID, Actions.Features.DisplayRule);
		const widgetId = currentWidgetId ? currentWidgetId : controlID;
		const featureKey = getFeatureKey(currentPage, Actions.Features.DisplayRule, widgetId);
		const displayRuleConfigMetadata = currentPage["pageBinding"][widgetId] ? currentPage["pageBinding"][widgetId][featureKey]["metadata"]["displayRuleData"] : "";
		if (displayRuleConfigMetadata) {
			transition({
				controlID: controlID,
				strict: true,
				type: Actions.Form.FORM_SCHEMA_LOADED,
				typeId: typeId,
				formSchemaId: formSchemaId,
				objectData: objectData,
				formSchema: formSchema,
				validationSchema: validationSchema,
				displayRuleSchema: getRenderRule(displayRuleConfigMetadata),
				extraParams: extraParams,
			});
		} else {
			transition({
				controlID: controlID,
				strict: true,
				type: Actions.Form.FORM_SCHEMA_LOADED,
				typeId: typeId,
				formSchemaId: formSchemaId,
				objectData: objectData,
				formSchema: formSchema,
				validationSchema: validationSchema,
				extraParams: extraParams,
			});
		}
	};
}

function getRenderRule(displayRuleConfigMetadata: []) {
	const schema: any = {};
	if (displayRuleConfigMetadata && displayRuleConfigMetadata.length > 0) {
		displayRuleConfigMetadata.forEach((ele, _index) => {
			if (!schema.hasOwnProperty(ele["field"])) {
				schema[ele["field"]] = (values) => {
					if (values) {
						return DisplayRuleEvalvator.handleHideOrShowField(ele, values);
					}
					return true;
				};
			}
		});
	}
	return schema;
}

const formDisplayRuleStateMachine = (currentPage) => {
	const displayRuleFormBinding: ICustomStateMachineData = {
		name: "displayRuleCustomStateMachine",
		stateJSON: {
			"states": {
				"formSchemaBeforeLoad": {
					"onEntry": [
						"onDisplayRuleBindingFormSchemaBeforeLoad",
					],
					"on": {
						"FORM_SCHEMA_LOADED": "formSchemaLoaded",
						"FORM_ERROR": "formError",
					},
				},
			},
		},
		mapDispatchToAction: (dispatch) => {
			return {
				onDisplayRuleBindingFormSchemaBeforeLoad: (event) => dispatch(doDisplayRuleBindingFormSchemaBeforeLoad(event, currentPage)),
			};
		},
	};

	return displayRuleFormBinding;
};

pageBindProvider.putSchema("FormWidget", Actions.Features.DisplayRule, formDisplayRuleStateMachine);
