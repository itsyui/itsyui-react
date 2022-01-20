import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getUpdatedFilter } from "../utils";

const initialState = {
    selectOptions: [],
};

const Actions = {
    LoadOptions: "Selectbox.LoadOptions",
    UpdateSelectValue: "Selectbox.UpdateSelectValue",
};

function reducer(state, action) {
    switch (action.type) {
        case Actions.LoadOptions:
            return {
                ...state,
                selectOptions: action.options,
            };
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

function updateOptions(options, defaultValue) {
    return {
        type: Actions.LoadOptions,
        options,
        defaultValue,
    };
}

export function doLoadOptions(controlProps) {
    return async (_getState, dispatch, transition) => {
        const { fieldSchema, handleChange, value, queryParams } = controlProps;
        const { options, datasource, metadata, defaultValue } = fieldSchema;
        let selectOptions = [];
        if (metadata && metadata.typeId) {
            const { typeId, valueKey, displayKey } = metadata;
            const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
            let schemaDatasource = datasource ? (datasource.getAll ? datasource : dataLoader.getLoader(datasource)) : dataLoader.getLoader("datasource");
            if (schemaDatasource) {
                const parameters = {
                    propertyDefinitions: [valueKey, ...(Array.isArray(displayKey) ? displayKey : [])].reduce((propDefs, key) => { return { ...propDefs, ...{ [key]: {} } } }, {}),
                    filter: metadata.filter ? (typeof metadata.filter === "string" ? JSON.parse(metadata.filter) : metadata.filter) : {},
                    orderBy: metadata.orderBy ? metadata.orderBy : "",
                };
                parameters.filter = await getUpdatedFilter(parameters.filter, queryParams, transition);
                const data = await schemaDatasource.getAll(typeId ? typeId.toString() : "", parameters);
                selectOptions = getKeyValuePairOptions(data, valueKey, displayKey);
            }
        } else if (Array.isArray(options)) {
            selectOptions = options;
        }
        const updatedValue = value ? value : defaultValue;
        dispatch(updateOptions(selectOptions, updatedValue));
        updatedValue && handleChange && handleChange(undefined, updatedValue);
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

class SelectBox extends React.Component<any, {}> {

    componentWillMount() {
        const controlProps = this.getControlSchemaProperties();
        this.props.onLoadOptions(controlProps);
    }

    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    handleChange(_event, value) {
        const { handleChange } = this.getControlSchemaProperties();
        if (value && handleChange) {
            handleChange(undefined, value);
        }
    }

    render() {
        const { selectOptions, schema } = this.props;
        if (Array.isArray(selectOptions) && schema && schema.fieldSchema) {
            schema.fieldSchema["options"] = selectOptions;
            const selectboxUIControlSchema = {
                name: `selectbox-control-${schema.fieldSchema.id}`,
                properties: {
                    ...schema,
                    "ui:widget": "dropdown_control",
                    handleChange: this.handleChange.bind(this),
                },
            };
            return (<SchemaContainer schema={selectboxUIControlSchema} />);
        }
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadOptions: (controlProps) => dispatch(doLoadOptions(controlProps)),
    };
};

const SelectBoxComponent = withReducer("SelectBox", reducer, mapDispatchToProps)(SelectBox);
SelectBoxComponent["displayName"] = "SelectBox";

WidgetsFactory.instance.registerFactory(SelectBoxComponent);
WidgetsFactory.instance.registerControls({
    dropdown: "SelectBox",
    'itsy:dropdown': "SelectBox"
});

export default SelectBoxComponent;
