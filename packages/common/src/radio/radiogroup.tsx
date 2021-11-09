import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getUpdatedFilter } from "../utils";

const initialState = {
    radioOptions: [],
};

const Actions = {
    LoadOptions: "Radiobutton.LoadOptions",
};

function reducer(state, action) {
    switch (action.type) {
        case Actions.LoadOptions:
            return {
                ...state,
                radioOptions: action.data
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

class RadioGroup extends React.Component<any, {}> {

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

    handleChange(event, value) {
        const { handleChange } = this.getControlSchemaProperties();
        handleChange && handleChange(event, value);
    }

    render() {
        const { radioOptions, schema } = this.props;
        if (Array.isArray(radioOptions) && schema && schema.fieldSchema) {
            schema.fieldSchema["options"] = radioOptions;
            const radioUIControlSchema = {
                name: `radio-control-${schema.fieldSchema.id}`,
                properties: {
                    ...schema,
                    "ui:widget": "radio_control",
                    handleChange: this.handleChange.bind(this),
                },
            };
            return (<SchemaContainer schema={radioUIControlSchema} />);
        }
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadOptions: (schema, queryParams) => dispatch(doLoadOptions(schema, queryParams))
    };
};

const RadioGroupComponent = withReducer("RadioGroup", reducer, mapDispatchToProps)(RadioGroup);
RadioGroupComponent["displayName"] = "RadioGroup";

WidgetsFactory.instance.registerFactory(RadioGroupComponent);
WidgetsFactory.instance.registerControls({
    radio: "RadioGroup",
    boolean: "RadioGroup",
    'itsy:radiogroup': "RadioGroup"
});

export default RadioGroupComponent;
