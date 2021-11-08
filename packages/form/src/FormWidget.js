import { getDefaultRegistry, getLocaleString, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import { Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { getlocaleText } from "@itsy-ui/utils";
import {
	doFormAfterSubmit, doFormBeforeHandleBlur, doFormBeforeHandleChange, doFormBeforeSubmit,
	doFormBeforeUpdateSection, doFormDataAfterLoad, doFormDataFetch,
	doFormGetState, doFormInit, doFormInitLoad, doFormReload,
	doFormSchemaBeforeLoad, doFormSchemaLoaded, doFormShowError, doFormSubmitClick,
	doFormUpdateExtraParams, doFormUpdatePropertyDefinitions, doFormUpdateSection, doFormValueReset, doFormValueUpdate, FormActions,
	formOnHandleBlur, formOnHandleChange, onLoadMetadata, updateFormSubmitRef, doFormRefresh, doResetFromError
} from './actions';
import reducer from "./reducer";
import "./form.css";
import "./FormSchemaLoader";
import "./formWidgetBinding";
import "./Repeater/Repeater";
import "./locale";

import stateJSON from "./state.json";

const tailFormItemLayout = {
	wrappercol: {
		xs: {
			span: 24,
			offset: 0,
		},
		sm: {
			span: 16,
			offset: 8,
		},
	},
};

const getCustomSchemaContainer = (t, props) => {
	t.controlSchema.properties["formikProps"] = props;
	return <>
		<SchemaContainer key={t.id} schema={t.controlSchema} />

		{props.errors[t.id] && <div className="ant-alert ant-alert-error">
			<i class="anticon anticon-cross-circle ant-alert-icon"></i>
			<span class="ant-alert-message">{props.errors[t.id]}</span>
		</div>}
	</>;
};

const getFormInput = (t, props) => {
	if (t.hasOwnProperty("ui:widget")) {
		const input = t["ui:widget"];
		switch (input) {
			case 'customWidget':
				return getCustomSchemaContainer(t, props);
			default: {
				const formikHandlers = {
					handleBlur: (e, changedValue) => {
						if (e !== undefined) {
							props.handleBlur(e);
						}
						const value = { [t.id]: changedValue };
						props.formHandleChange(value, "blur");
					},
					handleChange: (e, changedValue, shouldTrigger) => {
						if (e !== undefined && typeof e === "object") {
							props.handleChange(e);
						} else {
							props.setFieldValue(t.id, changedValue);
						}

						const triggerFormHandleChange = shouldTrigger === undefined ? true : shouldTrigger;
						if (triggerFormHandleChange) {
							const value = { [t.id]: changedValue };
							props.formHandleChange(value, "change");
						}
					}
				};
				t["displayName"] = getLocaleString(t, "displayName");
				t["placeholderText"] = getLocaleString(t, "placeholderText");
				const controlSchema = {
					"name": t.id,
					"properties": {
						"ui:widget": t["ui:widget"],
						"fieldSchema": t,
						"error": props.errors[t.id],
						"value": props.values[t.id],
						"isReadonly": props.isReadonly,
						formValues: props.values,
						"queryParams": props.queryParams,
						...formikHandlers,
					},
				};
				return controlSchema;
			}
		}
	}
};

const getFormItems = (propertyDefs, props) => {
	const dataform = [];
	for (var prop in propertyDefs) {
		dataform.push(propertyDefs[prop]);
	}
	if (dataform === null && dataform === undefined) {
		return <span></span>;
	}
	else {
		return dataform.reduce((obj, item) => {
			if (props.designerMetadata || !item.hidden) {
				obj[item.id] = getFormInput(item, props);
			}
			return obj;
		}, {});
	}
};

const generateLayout = (propertyDefinitions, sections, customFormPanel, displaySchemaOptions, readOnlyFields, props) => {
	let filteredPropertyDefinitions = Object.assign({}, propertyDefinitions);
	if ((!displaySchemaOptions || displaySchemaOptions === "hidden") && readOnlyFields && Object.keys(readOnlyFields).length > 0) {
		Object.keys(readOnlyFields).forEach(element => {
			if (readOnlyFields[element]) {
				delete filteredPropertyDefinitions[element];
			}
		});
	}
	var formItemMap = getFormItems(filteredPropertyDefinitions, props);
	const formPanelControlSchema = {
		name: `form-panel`,
		properties: {
			"ui:widget": "form_panel",
			formItems: formItemMap,
			propertyDefinitions: filteredPropertyDefinitions,
			sections: sections,
			controlID: props.controlID ? props.controlID : `${props.typeId}_${props.formSchemaId}`,
			extraParams: props["extraParams"],
			isModal: props.isModal,
			extraParams: props["extraParams"],
			isReadonly: props.isReadonly,
			showSubmitButton: props.showSubmitButton,
			submitButtonText: props.submitButtonText
		},
	};
	if (customFormPanel) {
		customFormPanel.properties["formItems"] = formItemMap;
		customFormPanel.properties["propertyDefinitions"] = propertyDefinitions;
		customFormPanel.properties["sections"] = sections;
		customFormPanel.properties["extraParams"] = props["extraParams"];
		customFormPanel.properties["isReadonly"] = props.isReadonly;
	}
	return <SchemaContainer schema={customFormPanel ? customFormPanel : formPanelControlSchema} />;
};

const FormComponent = props => {
	const {
		handleSubmit,
		formSubmitRef,
		onCancelTransition,
		isModal,
		formHeader,
		isCancelRequired,
		isSubmitting,
		transition,
		metadata,
		customFormPanel,
		displaySchemaOptions,
		readOnlyFields
	} = props;
	const { propertyDefinitions, sections } = metadata;
	const submitGroupStyle = isModal ? { display: "none" } : {};
	const cancelGroupStyle = !isCancelRequired ? { display: "none" } : {};

	const handleCancel = () => {
		transition(onCancelTransition);
	};

	return (
		<form onSubmit={handleSubmit}>
			{formHeader &&
				<div>
					<label style={{ fontWeight: "bold" }}>{formHeader}</label>
				</div>
			}
			{
				generateLayout(propertyDefinitions, sections, customFormPanel, displaySchemaOptions, readOnlyFields, props)
			}
			<div className="form_btn" {...tailFormItemLayout} style={submitGroupStyle}>
				<button ref={formSubmitRef} key="submit" type="submit" disabled={isSubmitting} >
					{getlocaleText("{{form.Submit}}")}
				</button>
				<button style={cancelGroupStyle} key="cancel" onClick={handleCancel}>
					{getlocaleText("{{app.Cancel}}")}
				</button>
			</div>
		</form>
	);
};

const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
class FormWidget extends React.Component {

	constructor(props) {
		super(props);
		this.formSubmitRef = React.createRef();
	}

	componentWillMount() {
		this.initializeForm();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.schema.designerMetadata && nextProps.schema.designerMetadata.needRefresh) {
			this.initializeForm(nextProps.schema);
		}
	}

	initializeForm(schema = null) {
		const { objectId, record, formSchema, initialTransition, extraParams, queryParams, dataSource } = this.getControlSchemaProperties();
		let { typeId, formSchemaId } = this.getControlSchemaProperties();
		const objectData = record !== undefined ? (typeof (record) === "string" ? JSON.parse(record) : record) : objectId;
		const customDataSource = dataSource && typeof dataSource === "string" && dataSource !== "datasource" ? dataLoader.getLoader(dataSource) : dataSource && typeof dataSource === "object" ? dataSource : null;
		if (this.props.transition) {
			const transitionEvent = initialTransition !== undefined ? initialTransition : FormActions.State.FORM_INIT;
			typeId = schema && schema.typeId ? schema.typeId : typeId;
			formSchemaId = schema && schema.formSchemaId ? schema.formSchemaId : formSchemaId;
			if (typeId) {
				this.props.transition({
					type: transitionEvent,
					typeId: typeId,
					objectData: objectData,
					formSchemaId: formSchemaId,
					formSchemaData: formSchema,
					extraParams: schema && schema.extraParams ? schema.extraParams : extraParams,
					queryParams: queryParams,
					customDataSource: customDataSource
				});
			}
		}
	}

	componentDidMount() {
		// store formSubmitRef in reducer state
		this.props.onUpdateFormSubmitRef(this.formSubmitRef);
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	handleSubmit = (values, setSubmitting) => {
		const { onSubmit, onFormBeforeSubmit } = this.props;
		if (onSubmit) {
			setSubmitting(false);
			onSubmit(values);
		} else {
			onFormBeforeSubmit(values, setSubmitting);
		}
	}

	handleClick() {
		if (this.formSubmitRef) {
			this.formSubmitRef.current.click();
		}
	}

	_renderFormError() {
		const formError = {
			name: "formError",
			properties: {
				"ui:widget": "formError",
				"errorMessage": this.props.formErrorMessage,
				onClose: () => { 
					this.props.onResetFormError();
				},
			}
		};

		return <SchemaContainer schema={formError} />;
	}

	render() {
		if (!this.props.loaded) {
			return <span className="form-loading">{getlocaleText("{{form.init}}")}</span>;
		}
		if (!this.props.typeId) {
			return <span className="widgetError">{getlocaleText("{{widget.error}}")}</span>;
		}

		const visibleFieldValidationSchema = Yup.object().shape(this.props.visibleFieldValidationSchema);
		const { isModal, readonly, isCancelRequired, formHeader, onCancelTransition, customPanel, displaySchemaOptions,
			validateOnBlur, typeId, formSchemaId, controlID, queryParams, submitButtonText, showSubmitButton, designerMetadata } = this.getControlSchemaProperties();
		const className = this.props.className ? this.props.className : "";
		const customStyle = this.props.style ? this.props.style : {};
		return (
			<div className={className} style={customStyle}>
				{this.props.formErrorMessage &&
					this.props.formErrorMessage !== "" && this._renderFormError()
				}
				<Formik
					key={`formik-${this.props.typeId}`}
					initialValues={this.props.formValues}
					validationSchema={visibleFieldValidationSchema}
					validateOnChange={false}
					validateOnBlur={validateOnBlur !== undefined ? validateOnBlur : true}
					enableReinitialize={true}
					onSubmit={(values, { setSubmitting }) => {
						this.handleSubmit(values, setSubmitting);
					}}>
					{p => (
						<FormComponent
							key={this.props.formComponentKey ? this.props.formComponentKey : `form-${this.props.typeId}`}
							formSubmitRef={this.formSubmitRef}
							onSubmit={this.handleSubmit.bind(this)}
							metadata={this.props.metadata}
							isReadonly={readonly !== undefined ? readonly : false}
							isModal={isModal !== undefined ? isModal : false}
							isCancelRequired={isCancelRequired !== undefined ? isCancelRequired : false}
							formHeader={formHeader !== undefined && formHeader}
							onCancelTransition={onCancelTransition !== undefined && onCancelTransition}
							transition={this.props.transition}
							formHandleBlur={this.props.formHandleBlur}
							formHandleChange={this.props.formHandleChange}
							customFormPanel={customPanel}
							displaySchemaOptions={displaySchemaOptions}
							readOnlyFields={this.props.readOnlyFields}
							extraParams={this.props.extraParams}
							typeId={typeId}
							formSchemaId={formSchemaId}
							controlID={controlID}
							queryParams={queryParams}
							showSubmitButton={showSubmitButton}
							submitButtonText={submitButtonText}
							designerMetadata={designerMetadata}
							{...p}
						/>
					)}
				</Formik>
			</div>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		loadMetadata: (typeId, objectData, formSchemaId) => dispatch(onLoadMetadata(typeId, objectData, formSchemaId)),
		onFormInit: (event) => dispatch(doFormInit(event)),
		onFormInitLoad: (event) => dispatch(doFormInitLoad(event)),
		onFormSchemaBeforeLoad: ({ typeId, formSchemaId, objectData, formSchema, validationSchema, extraParams, queryParams, customDataSource }) => dispatch(doFormSchemaBeforeLoad(typeId, formSchemaId, objectData, formSchema, validationSchema, extraParams, queryParams, customDataSource)),
		onFormSchemaLoaded: ({ typeId, formSchemaId, objectData, formSchema, validationSchema, displayRuleSchema, extraParams, queryParams, customDataSource }) => dispatch(doFormSchemaLoaded(typeId, formSchemaId, objectData, formSchema, validationSchema, displayRuleSchema, extraParams, queryParams, customDataSource)),
		onFormDataFetch: ({ typeId, objectId, formSchema }) => dispatch(doFormDataFetch(typeId, objectId, formSchema)),
		onFormDataAfterLoad: ({ typeId, objectId, record }) => dispatch(doFormDataAfterLoad(typeId, objectId, record)),
		onFormReload: ({ typeId, objectId, record }) => dispatch(doFormReload(typeId, objectId, record)),
		onFormSubmitClick: () => dispatch(doFormSubmitClick()),
		onFormBeforeSubmit: (values, setSubmitting) => dispatch(doFormBeforeSubmit(values, setSubmitting)),
		onUpdateFormSubmitRef: (formSubmitRef) => dispatch(updateFormSubmitRef(formSubmitRef)),
		onFormError: (event) => dispatch(doFormShowError(event)),
		formHandleChange: (value, eventType) => dispatch(formOnHandleChange(value, eventType)),
		onFormBeforeHandleChange: ({ value }) => dispatch(doFormBeforeHandleChange(value)),
		formHandleBlur: (value) => dispatch(formOnHandleBlur(value)),
		onFormBeforeHandleBlur: ({ value }) => dispatch(doFormBeforeHandleBlur(value)),
		onFormAfterSubmit: () => dispatch(doFormAfterSubmit()),
		onFormValueReset: () => dispatch(doFormValueReset()),
		onFormValueUpdate: ({ values, mode }) => dispatch(doFormValueUpdate(values, mode)),
		onFormUpdatePropertyDefinitions: (event) => dispatch(doFormUpdatePropertyDefinitions(event)),
		onFormBeforeUpdateSection: (event) => dispatch(doFormBeforeUpdateSection(event)),
		onFormUpdateSection: (event) => dispatch(doFormUpdateSection(event)),
		onFormGetState: (event) => dispatch(doFormGetState(event.onData)),
		onFormUpdateExtraParams: (event) => dispatch(doFormUpdateExtraParams(event.params)),
		onFormRefresh: (event) => dispatch(doFormRefresh(event)),
		onResetFormError: () => dispatch(doResetFromError())
	};
};

const FormWidgetC = withReducer('FormWidget', reducer, mapDispatchToProps, stateJSON)(FormWidget);
FormWidgetC.displayName = 'FormWidget';

WidgetsFactory.instance.registerFactory(FormWidgetC);
WidgetsFactory.instance.registerControls({
	form: 'FormWidget',
	'itsy:form': 'FormWidget'
});

export default FormWidgetC;