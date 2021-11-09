import { FormActions } from './actions';

const initialState = {
	typeId: "",
	formSchemaId: "",
	metadata: {},
	formValues: {},
	formErrorMessage: "",
	formSubmitRef: {},
	formCancelRef: {},
	displayRuleSchema: {},
	readOnlyFields: {},
	isDirty: false,
	extraParams: null,
	customDataSource: null,
	visibleFieldValidationSchema: {},
	formComponentKey: null,
	loaded: false
};

function reducer(state, action) {
	switch (action.type) {
		case FormActions.LoadMetadata:
			return {
				...state,
				metadata: action.metadata,
				typeId: action.typeId,
				formSchemaId: action.formSchemaId,
				validationSchema: action.validationSchema,
				displayRuleSchema: action.displayRuleSchema,
				extraParams: action.extraParams,
				customDataSource: action.customDataSource,
				visibleFieldValidationSchema: action.validationSchema,
				loaded: true
			};
		case FormActions.FormValues:
			return {
				...state,
				formValues: action.formValues,
				typeId: action.typeId,
				objectId: action.objectId
			};
		case FormActions.FormGenericError:
			return {
				...state,
				formErrorMessage: action.formErrorMessage
			};
		case FormActions.FormSubmitRef:
			return {
				...state,
				formSubmitRef: action.formSubmitRef
			};
		case FormActions.FormCancelRef:
			return {
				...state,
				formCancelRef: action.formCancelRef
			};
		case FormActions.UpdateFormValues:
			return {
				...state,
				formValues: action.values
			};
		case FormActions.UpdateCurrentFormValues:
			if (action.mode !== undefined && action.mode === 0) { // if mode === 0 remove previous formValues and assign formValues = action.values
				return {
					...state,
					formValues: action.values,
				};
			}
			return {
				...state,
				formValues: {
					...state.formValues,
					...action.values
				}
			};
		case FormActions.UpdatePropertyDefinitions: {
			const propertyDefLength = Object.keys(action.propertyDefinitions).length;
			if (action.mode !== undefined) { // if mode === 0 delete particular propertyDefinitions,validationSchema and formValues
				if (action.mode === 0) {
					const id = Object.keys(action.propertyDefinitions);
					const newPropertyDefinitions = state.metadata && state.metadata.propertyDefinitions ? JSON.parse(JSON.stringify(state.metadata.propertyDefinitions)) : {};
					const newFormValues = state.formValues ? JSON.parse(JSON.stringify(state.formValues)) : {};
					const newValidationSchema = { ...state.validationSchema };
					delete newPropertyDefinitions[id];
					delete newFormValues[id];
					delete newValidationSchema[id];
					return {
						...state,
						metadata: Object.assign({ ...state.metadata, propertyDefinitions: newPropertyDefinitions }),
						formValues: newFormValues,
						validationSchema: newValidationSchema,
						visibleFieldValidationSchema: newValidationSchema,
					};
				} else if (action.mode === 1) { // if mode === 1 replace the propertyDefinitions
					return {
						...state,
						metadata: Object.assign({ ...state.metadata, propertyDefinitions: action.propertyDefinitions }),
					};
				}

			}
			else if (propertyDefLength === 1) {
				const oldPropertyDefinitions = state.metadata.propertyDefinitions;
				const newPropertyDefinitions = Object.assign({ ...oldPropertyDefinitions, ...action.propertyDefinitions });
				return {
					...state,
					metadata: Object.assign({ ...state.metadata, propertyDefinitions: newPropertyDefinitions }),
					validationSchema: action.updatedValidationSchema
				};
			} else {
				const newPropertyDefinitions = Object.assign({}, action.propertyDefinitions);
				return {
					...state,
					metadata: Object.assign({ ...state.metadata, propertyDefinitions: newPropertyDefinitions }),
					validationSchema: action.updatedValidationSchema,
				};
			}
			break;
		}
		case FormActions.UpdateSection:
			return {
				...state,
				metadata: Object.assign({ ...state.metadata, sections: action.sections })
			};
		case FormActions.UpdateReadOnlyFields: {
			const newPropertyDefinitions = state.metadata.propertyDefinitions;
			Object.keys(action.readOnlyFields).forEach(t => {
				newPropertyDefinitions[t]["readOnly"] = action.readOnlyFields[t];
			});
			return {
				...state,
				metadata: Object.assign({ ...state.metadata, propertyDefinitions: newPropertyDefinitions }),
				readOnlyFields: Object.assign({}, action.readOnlyFields),
				visibleFieldValidationSchema: action.visibleFieldVSchema,
			};
		}
		case FormActions.UpdateIsDirty: {
			return {
				...state,
				isDirty: !state.isDirty,
			};
		}
		case FormActions.UpdateExtraParams:
			return {
				...state,
				extraParams: action.updatedParams
			};
		case FormActions.UpdateVisibleFieldValidationSchema:
			return {
				...state,
				visibleFieldValidationSchema: action.visibleFieldVSchema,
			};
		case FormActions.RefreshForm:
			return {
				...state,
				formValues: action.values,
				formComponentKey: action.formComponentKey,
			};
		case FormActions.RestFormError:
			return {
				...state,
				formErrorMessage: null,
			}
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;