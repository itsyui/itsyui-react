import * as React from "react";
import { getDefaultRegistry, getLocaleString, ICustomStateMachineData, ICustomStateMachineProvider, retrieveSchema, SchemaContainer, StateManagerContext, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { CommandOptions, DataLoaderFactory, IAppSchemaProvider, ICommandManager } from "@itsy-ui/core";
import { RepeaterDatasource } from "./repeaterDataSourceLake";
import { any } from "prop-types";

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
const customStateProvider = dataLoader.getLoader<ICustomStateMachineProvider>("customStateProvider");
const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");

export class RepeaterControl extends React.Component<any, any> {

	private static datasourceInstance: any = {};

	constructor(props: any) {
		super(props);
		this.state = {
			formSchema: {},
		};
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillMount() {
		const { fieldSchema, value } = this._getControlSchemaProperties();
		const { id, metadata } = fieldSchema;
		const { typeId, formSchemaId, formSchema, cardinality } = metadata;
		const contextPath = { typeId, ...formSchemaId && { formSchemaId } };
		const isMulti = (!cardinality || cardinality === "multi") ? true : false;
		RepeaterControl.datasourceInstance[id] = new RepeaterDatasource();
		const receivedRecords = Array.isArray(value) ? RepeaterControl.datasourceInstance[id].getParseRecords(value) : [];
		this.removeCustomStateProvider(contextPath);
		this.registerCustomStateProvider(contextPath);
		this.registerRepeaterGridCommands(contextPath);
		if (formSchemaId) {
			schemaProvider.getSchema(`/app/${typeId && typeId.replace(/:/g, "_")}/form/${formSchemaId}/data`)
				.then(repeaterFormSchema => {
					this.setState({
						formSchema: repeaterFormSchema,
					});
				}).catch(() => {
					// tslint:disable-next-line:no-console
					console.error("Error while getting repeater schema.");
				});
		} else {
			this.setState({ formSchema });
		}
		if (!isMulti && receivedRecords.length > 0) {
			RepeaterControl.datasourceInstance[id].initializeRecords(receivedRecords);
		}
	}

	componentDidUpdate() {
		const { fieldSchema, value } = this._getControlSchemaProperties();
		const { typeId, formSchemaId, cardinality } = fieldSchema.metadata;
		const isMulti = (!cardinality || cardinality === "multi") ? true : false;
		const repeaterDatasource = RepeaterControl.datasourceInstance[fieldSchema.id];
		const receivedRecords = Array.isArray(value) ? repeaterDatasource.getParseRecords(value) : [];
		if (isMulti) {
			if (receivedRecords.length > 0) { repeaterDatasource.initializeRecords(receivedRecords); }
			// tslint:disable-next-line:no-unused-expression
			this.props.transition && this.props.transition({
				controlID: `${typeId}_${formSchemaId}_grid`,
				strict: true,
				type: "GRID_REFRESH",
			});
		} else if (!isMulti && this.isNewSingleEditRecord() && receivedRecords.length > 0) {
			repeaterDatasource.initializeRecords(receivedRecords);
			// tslint:disable-next-line: no-unused-expression
			this.props.transition && this.props.transition({
				controlID: formSchemaId ? `${typeId}_${formSchemaId}` : typeId,
				strict: true,
				type: "FORM_BEFORE_HANDLE_CHANGE",
				value: receivedRecords[0],
			});
		}
	}

	componentWillUnmount() {
		const { fieldSchema } = this._getControlSchemaProperties();
		const { cardinality, typeId, formSchemaId } = fieldSchema.metadata;
		const isMulti = (!cardinality || cardinality === "multi") ? true : false;
		if (isMulti) {
			this.props.transition({
				controlID: `${typeId}_${formSchemaId}_grid`,
				strict: true,
				type: "GRID_REFRESH",
			});
		} else {
			const contextPath = { typeId, ...formSchemaId && { formSchemaId } };
			this.removeCustomStateProvider(contextPath);
		}
	}

	//checking for cardinality single edit change (previous and current record)
	isNewSingleEditRecord() {
		const { value, fieldSchema } = this._getControlSchemaProperties();
		const receivedRecords = Array.isArray(value) ? [...value] : [];
		const currentRecords = RepeaterControl.datasourceInstance[fieldSchema.id].getActualRecords();
		const isSameValues = receivedRecords.length > 0 && currentRecords.length > 0
			&& Object.values(receivedRecords[0]).join(",") === Object.values(currentRecords[0]).join(",");
		return currentRecords.length <= 0 || (receivedRecords.length > 0 &&
			(currentRecords[0]["cmis:objectId"] !== receivedRecords[0]["cmis:objectId"]) || !isSameValues);
	}

	getGridSchemaJSON() {
		const { fieldSchema, formValues } = this._getControlSchemaProperties();
		const { typeId, formSchemaId, idField } = fieldSchema.metadata;
		const filter = idField && formValues && formValues["cmis:objectId"] ? { [idField]: [{ operation: "eq", value: formValues["cmis:objectId"] }] } : {};
		return {
			"id": typeId,
			"displayName": getLocaleString(fieldSchema, "displayName"),
			"description": getLocaleString(fieldSchema, "displayName"),
			"baseId": "cmis:item",
			"parentId": "cmis:item",
			"viewAttributes": {
				"orderBy": "cmis:objectId asc",
				"viewType": "table",
				"defaultFilter": filter,
				"customAction": {
					"title": "",
					"actions": [
						{
							"name": `${typeId}_${formSchemaId}_edit`,
							"displayText": "{{fvb.resourcesEdit}}",
							"icon": "edit",
							"isPrimary": true,
						},
						{
							"name": `${typeId}_${formSchemaId}_delete`,
							"displayText": "{{fvb.resourcesDelete}}",
							"icon": "delete",
						},
					],
				},
			},
			"propertyDefinitions": this.getRepeaterGridPropDefs(),
		};
	}

	addIconClick() {
		const { fieldSchema } = this._getControlSchemaProperties();
		const { typeId, formSchemaId } = fieldSchema.metadata;
		const drawerData = {
			title: getLocaleString(fieldSchema, "displayName"),
			width: 520,
			controlSchema: {
				name: "form",
				properties: {
					"ui:widget": "form",
					typeId: typeId,
					formSchemaId: formSchemaId,
					displaySchemaOptions: "hidden",
					isModal: true,
					controlID: `${typeId}_${formSchemaId}`,
				},
			},
			onOk: () => {
				this.props.transition({
					type: "FORM_SUBMIT_CLICK",
					controlID: `${typeId}_${formSchemaId}`,
					strict: true,
				});
			},
			onCancelTransition: {
				type: "HIDE_DRAWER",
			},
			customState: {
				contextPath: { typeId: typeId, formSchemaId: formSchemaId },
			},
		};
		this.props.transition({
			type: "SHOW_DRAWER",
			event: drawerData,
		});
	}

	getRepeaterGridPropDefs() {
		const { fieldSchema } = this._getControlSchemaProperties();
		const { idField } = fieldSchema.metadata;
		const repeaterFormSchema = { ...this.state.formSchema };
		const propDefs = {};
		if (repeaterFormSchema.propertyDefinitions) {
			Object.keys(repeaterFormSchema.propertyDefinitions).forEach((key) => {
				const fieldPropDefs = { ...repeaterFormSchema.propertyDefinitions[key] };
				if (fieldPropDefs.id !== idField) {
					propDefs[key] = fieldPropDefs;
				}
			});
		}
		return propDefs;
	}

	getCustomStateMachineData() {
		const repeaterStateMachineData: ICustomStateMachineData = {
			stateJSON: {
				states: {
					formSchemaBeforeLoad: {
						onEntry: [
							"onRepeaterFormSchemaBeforeLoad",
						],
						on: {
							FORM_SCHEMA_LOADED: "formSchemaLoaded",
							FORM_ERROR: "formError",
						},
					},
					formBeforeHandleChange: {
						onEntry: [
							"onRepeaterHandleChange",
						],
						on: {
							FORM_VALUE_UPDATE: "formValueUpdate",
						},
					},
					formSubmit: {
						onEntry: [
							"onRepeaterFormSubmit",
						],
						on: {
							FORM_AFTER_SUBMIT: "formAfterSubmit",
							FORM_ERROR: "formError",
						},
					},
				},
			},
			mapDispatchToAction: (dispatch) => {
				return {
					onRepeaterFormSchemaBeforeLoad: ({ typeId, formSchemaId, objectData, formSchema, validationSchema, extraParams }) =>
						dispatch(this.doRepeaterFormSchemaBeforeLoad(typeId, formSchemaId, objectData, formSchema, validationSchema, extraParams)),
					onRepeaterHandleChange: (event) => dispatch(this.doRepeaterHandleChange(event)),
					onRepeaterFormSubmit: ({ values }) => dispatch(this.doRepeaterFormSubmit(values)),
				};
			},
		};
		return repeaterStateMachineData;
	}

	registerCustomStateProvider(props: any) {
		const repeaterStateMachineData = this.getCustomStateMachineData();
		customStateProvider.registerCustomStateMachine("FormWidget", props, repeaterStateMachineData);
	}

	removeCustomStateProvider(props: any) {
		const repeaterStateMachineData = this.getCustomStateMachineData();
		customStateProvider.removeCustomStateMachine("FormWidget", props, repeaterStateMachineData);
	}

	doRepeaterFormSchemaBeforeLoad(typeId: string, formSchemaId: string, objectData: string | any, formSchema: any, validationSchema: any, extraParams: {}) {
		return async (_getState, _dispatch: any, transition: any) => {
			const updatedFormSchema = { ...formSchema };
			const propDefs = updatedFormSchema.propertyDefinitions;
			const updatedRecords = { ...objectData };
			const { fieldSchema } = this._getControlSchemaProperties();
			const { idField } = fieldSchema.metadata;
			Object.keys(propDefs).map(fieldKey => {
				if (propDefs[fieldKey] && idField === propDefs[fieldKey].id) {
					delete propDefs[fieldKey];
				}
			});
			transition({
				type: "FORM_SCHEMA_LOADED",
				typeId: typeId,
				formSchemaId: formSchemaId,
				objectData: updatedRecords,
				formSchema: updatedFormSchema,
				validationSchema: validationSchema,
				extraParams: extraParams,
			});
		};
	}

	doRepeaterHandleChange(event: any) {
		return async (getState, _dispatch: any, transition: any) => {
			const { formValues } = getState();
			const record = { ...formValues, ...event.value };
			const { fieldSchema, handleChange } = this._getControlSchemaProperties();
			const { cardinality } = fieldSchema.metadata;
			const isMulti = fieldSchema && (!cardinality || cardinality === "multi") ? true : false;
			transition({
				type: "FORM_VALUE_UPDATE",
				values: record,
				controlID: event.controlID,
				strict: true,
			});
			if (!isMulti && handleChange) {
				const repeaterDatasource = RepeaterControl.datasourceInstance[fieldSchema.id];
				await repeaterDatasource.upsert(record, { cardinality: cardinality });
				const records = repeaterDatasource.getActualRecords();
				handleChange(undefined, records);
			}
		};
	}

	doRepeaterFormSubmit(values: any) {
		return async (_getState: any, _dispatch: any, transition: any) => {
			const { fieldSchema, handleChange } = this._getControlSchemaProperties();
			const { typeId, formSchemaId } = fieldSchema.metadata;
			const contextPath = { typeId: typeId, formSchemaId: formSchemaId };
			const record = { ...values };
			const repeaterDatasource = RepeaterControl.datasourceInstance[fieldSchema.id];
			await repeaterDatasource.upsert(record, {});
			const records = repeaterDatasource.getActualRecords();
			if (handleChange) { handleChange(undefined, repeaterDatasource.getParseRecords(records)); }
			this.removeCustomStateProvider(contextPath);
			this.registerCustomStateProvider(contextPath);
			transition({
				type: "HIDE_DRAWER",
			});
			transition({
				type: "HIDE_INDICATOR",
			});
		};
	}

	//Register edit and delete commands for repeater grid records
	registerRepeaterGridCommands(props: any) {
		if (props) {
			const { fieldSchema, handleChange } = this._getControlSchemaProperties();
			const editRecord: CommandOptions<any> = {
				canExecute: () => {
					return true;
				},
				execute: async (data: any, transition: (data: any) => void) => {
					const { typeId, formSchemaId } = fieldSchema.metadata;
					const drawerData = {
						title: getLocaleString(fieldSchema, "displayName"),
						width: 520,
						controlSchema: {
							name: "form",
							properties: {
								"ui:widget": "form",
								typeId: typeId,
								formSchemaId: formSchemaId,
								displaySchemaOptions: "hidden",
								isModal: true,
								controlID: `${typeId}_${formSchemaId}`,
								record: { ...data.record },
							},
						},
						onOk: () => {
							transition({
								type: "FORM_SUBMIT_CLICK",
								controlID: `${typeId}_${formSchemaId}`,
								strict: true,
							});
						},
						onCancelTransition: {
							type: "HIDE_DRAWER",
						},
						customState: {
							contextPath: { typeId: typeId, formSchemaId: formSchemaId },
						},
					};
					transition({
						type: "SHOW_DRAWER",
						event: drawerData,
					});
				},
			};
			commandManager.registerCommand(`${props.typeId}_${props.formSchemaId}_edit`, {}, editRecord);

			const deleteRecord: CommandOptions<any> = {
				canExecute: () => {
					return true;
				},
				execute: async (data: any) => {
					const repeaterDatasource = RepeaterControl.datasourceInstance[fieldSchema.id];
					await repeaterDatasource.delete(data.record);
					const records = repeaterDatasource.getActualRecords();
					if (handleChange) { handleChange(undefined, records); }
				},
			};
			commandManager.registerCommand(`${props.typeId}_${props.formSchemaId}_delete`, {}, deleteRecord);
		}
	}

	renderRepeaterFormFields() {
		const { fieldSchema } = this._getControlSchemaProperties();
		const { typeId, formSchemaId } = fieldSchema.metadata;
		const repeaterDatasource = RepeaterControl.datasourceInstance[fieldSchema.id];
		const record = repeaterDatasource.records.length > 0 ? { ...repeaterDatasource.records[0] } : {};
		const controlSchema = {
			name: "form",
			properties: {
				"ui:widget": "form",
				typeId: typeId,
				isModal: true,
				controlID: formSchemaId ? `${typeId}_${formSchemaId}` : typeId,
				record: { ...record },
				...formSchemaId ? { formSchemaId } : { formSchema: this.state.formSchema },
			},
		};
		const contextPath = { typeId, ...formSchemaId && { formSchemaId } };
		return (
			<StateManagerContext.Provider key={`repeater-provider-${fieldSchema.id}`} value={{ contextPath }}>
				<SchemaContainer key={formSchemaId ? `${typeId}_${formSchemaId}` : typeId} schema={controlSchema} />
			</StateManagerContext.Provider>
		);
	}

	renderRepeaterDetails() {
		const { fieldSchema } = this._getControlSchemaProperties();
		const { typeId, formSchemaId } = fieldSchema.metadata;
		const repeaterDatasource = RepeaterControl.datasourceInstance[fieldSchema.id];
		const gridSchema = {
			name: "grid",
			properties: {
				"ui:widget": "grid",
				typeId: typeId,
				controlID: `${typeId}_${formSchemaId}_grid`,
				gridSchema: this.getGridSchemaJSON(),
				customDataSource: repeaterDatasource,
			},
		};
		return <SchemaContainer key={fieldSchema.id} schema={gridSchema} />;
	}

	getSubFormHeader(fieldSchema) {
		const repeaterUiSchema = {
			name: "sub-form-header",
			properties: {
				"ui:widget": "subform_header_ui",
				fieldSchema: fieldSchema,
				onIconClick: this.addIconClick.bind(this)
			},
		}
		return (<div className="repeater-title-container">
			<SchemaContainer key="sub-form-heade" schema={repeaterUiSchema} />
		</div>);
	}

	render() {
		const { fieldSchema } = this._getControlSchemaProperties();
		const { cardinality } = fieldSchema.metadata;
		const isMulti = (!cardinality || cardinality === "multi") ? true : false;
		const formSchema = this.state.formSchema && Object.keys(this.state.formSchema).length > 0 ? this.state.formSchema : null;
		const applyDisabled = fieldSchema.readOnly ? " label-disabled" : "";
		return <div className={`repeater-${isMulti ? "multi" : "single"}${applyDisabled}`}>
			{
				isMulti ? <>{this.getSubFormHeader(fieldSchema)}{formSchema ? <div>{this.renderRepeaterDetails()}</div> : null}</>
					: <div>{this.renderRepeaterFormFields()}</div>
			}
		</div>;
	}
}

const mapDispatchToProps = () => {
	return {};
};

const repeaterControl = withReducer("RepeaterControl", mapDispatchToProps)(RepeaterControl);
repeaterControl.displayName = "RepeaterControl";

WidgetsFactory.instance.registerFactory(repeaterControl);
WidgetsFactory.instance.registerControls({
	repeater: "RepeaterControl",
	'itsy:repeater': "RepeaterControl"
});
