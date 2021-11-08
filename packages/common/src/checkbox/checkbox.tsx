import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getUpdatedFilter } from "../utils";

const initialState = {
    checkOptions: [],
};

const Actions = {
    LoadOptions: "Checkbox.LoadOptions",
};

function reducer(state, action) {
    switch (action.type) {
        case Actions.LoadOptions:
            return {
                ...state,
                checkOptions: action.data
            };
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

function doUpdateOptions(data) {
    return {
        type: Actions.LoadOptions,
        data
    };
}

export function doLoadOptions(schema, queryParams) {
    return async (_getState, dispatch, transition) => {
        const { value, datasource, metadata } = schema;
        if (metadata && metadata.typeId) {
            const { typeId, valueKey, displayKey } = metadata;
            const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
            let schemaDatasource = datasource ? (datasource.getAll ? datasource : dataLoader.getLoader(datasource)) : dataLoader.getLoader("datasource");
            if (schemaDatasource) {
                const parameters = {
                    propertyDefinitions: [valueKey, ...(Array.isArray(displayKey) ? displayKey : [])].reduce((propDefs, key) => { return { ...propDefs, ...{ [key]: {} } } }, {}),
                    filter: metadata.filter ? (typeof metadata.filter === "string" ? JSON.parse(metadata.filter) : metadata.filter) : {}
                };
                parameters.filter = await getUpdatedFilter(parameters.filter, queryParams, transition);
                const data = await schemaDatasource.getAll(typeId ? typeId.toString() : "", parameters);
                dispatch(doUpdateOptions(getKeyValuePairOptions(data, valueKey, displayKey)));
            }
        } else if (Array.isArray(value)) {
            dispatch(doUpdateOptions(value));
        }
    };
}

function getKeyValuePairOptions(data, valueKey, displayKey) {
    const options = [];
    if (data && valueKey && displayKey) {
        displayKey = Array.isArray(displayKey) && displayKey.length > 0 ? displayKey[0] : displayKey;
        data.forEach(item => {
            options.push({ key: item[valueKey], value: item[displayKey] });
        });
    }
    return options;
}

class CheckBox extends React.Component<any, {}> {

    componentWillMount() {
        const { fieldSchema, queryParams } = this.getControlSchemaProperties();
        this.props.onLoadOptions(fieldSchema, queryParams);
    }

    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    handleChange(_event: any, eValue: string) {
        const controlProps = this.getControlSchemaProperties();
        if (controlProps.value instanceof Array) {
            const index = controlProps.value.findIndex(item => item === eValue);
            index > -1 ? controlProps.value.splice(index, 1) : controlProps.value.push(eValue);
            controlProps.handleChange(undefined, controlProps.value);
        } else {
            controlProps.value = [eValue];
            controlProps.handleChange(undefined, controlProps.value);
        }
    }

    render() {
        const { checkOptions, schema } = this.props;
        if (Array.isArray(checkOptions) && schema && schema.fieldSchema) {
            schema.fieldSchema["options"] = checkOptions;
            const checkboxUIControlSchema = {
                name: `checkbox-control-${schema.fieldSchema.id}`,
                properties: {
                    ...schema,
                    "ui:widget": "checkbox_control",
                    handleChange: this.handleChange.bind(this),
                },
            };
            return (<SchemaContainer schema={checkboxUIControlSchema} />);
        }
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadOptions: (schema, queryParams) => dispatch(doLoadOptions(schema, queryParams))
    };
};

const CheckBoxComponent = withReducer("CheckBox", reducer, mapDispatchToProps)(CheckBox);
CheckBoxComponent["displayName"] = "CheckBox";

WidgetsFactory.instance.registerFactory(CheckBoxComponent);
WidgetsFactory.instance.registerControls({
    checkbox: "CheckBox",
    choicelist: "CheckBox",
    'itsy:checkbox': "CheckBox"
});

export default CheckBoxComponent;
