import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { getUpdatedFilter } from "../utils";
import { getlocaleText } from "@itsy-ui/utils";
import "./locale";

const initialState = {
    lookupOptions: [],
};

const Actions = {
    LoadDataSource: "AutoComplete.LoadDataSource",
    ChildWidget: {
        CHILD_FORM_INIT: "CHILD_FORM_INIT"
    },
};

function reducer(state, action) {
    switch (action.type) {
        case Actions.LoadDataSource:
            return {
                ...state,
                lookupOptions: action.data
            };
        default:
            return state === undefined ? initialState :
                Object.keys(state).length === 0 ? initialState : state;
    }
}

function doUpdateData(id, data) {
    return {
        type: Actions.LoadDataSource,
        id,
        data
    };
}

export function doLoadData(schema, queryParams) {
    return async (getState, dispatch, transition) => {
        const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
        let data = [];
        let datasource = schema.datasource ? (schema.datasource.getAll ? schema.datasource : dataLoader.getLoader(schema.datasource)) : dataLoader.getLoader("datasource");
        if (datasource && !schema.metadata.isLocal) {
            const parameters = {
                propertyDefinitions: [schema.metadata.valueKey, ...(Array.isArray(schema.metadata.displayKey) ? schema.metadata.displayKey : [])].reduce((propDefs, key) => { return { ...propDefs, ...{ [key]: {} } } }, {}),
                filter: schema.metadata.filter ? (typeof schema.metadata.filter === "string" ? JSON.parse(schema.metadata.filter) : schema.metadata.filter) : {},
            };
            parameters.filter = await getUpdatedFilter(parameters.filter, queryParams, transition);

            if (schema.metadata) {
                const typeId = schema.metadata.typeId ? schema.metadata.typeId.toString() : "";
                data = await datasource.getAll(typeId, parameters);
            }
        } else if (schema.metadata.isLocal) { // for updating local options
            if (typeof (schema.metadata.data) === "string") {
                data.push(...JSON.parse(schema.metadata.data));
            } else {
                data.push(...schema.metadata.data);
            }
        }
        dispatch(doUpdateData(schema.id, data));
    };
}

class LookUpControl extends React.Component {
    componentWillMount() {
        const schema = this.props.schema ? (this.props.schema.fieldSchema ? this.props.schema.fieldSchema : this.props.schema) : null;
        if (schema) {
            this.props.onLoadData(schema, this.props.schema.queryParams);
        }
    }

    handleAddButton = (transition, data) => {
        transition({
            type: Actions.ChildWidget.CHILD_FORM_INIT,
            id: data.id,
            metadata: data.metadata
        });
    }

    renderAddButton = (transition, metadata) => {
        return <Button type="primary" onClick={this.handleAddButton.bind(this, transition, metadata)}>
            {getlocaleText("{{app.Add}}")}
        </Button>;
    }

    getControlSchemaProperties() {
        const registry = getDefaultRegistry();
        const { definitions } = registry;
        const schema = retrieveSchema(this.props.schema, definitions);
        return schema;
    }

    render() {
        if (Array.isArray(this.props.lookupOptions) && this.props.schema && this.props.schema.fieldSchema) {
            this.props.schema.fieldSchema["lookupOptions"] = this.props.lookupOptions;
            const selectLookupControlSchema = {
                name: `lookup-control-${this.props.schema.fieldSchema.id}`,
                properties: {
                    ...this.props.schema,
                    "ui:widget": "lookup",
                },
            };
            return (<div key="look-up-container" className="lookup-contianer">
                <SchemaContainer schema={selectLookupControlSchema} />
                {this.props.schema.fieldSchema.canAddData && this.renderAddButton(this.props.transition, this.props.schema.fieldSchema)}
            </div>);
        }
        return null;
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onLoadData: (schema, queryParams) => dispatch(doLoadData(schema, queryParams))
    };
};

const LookupComponent = withReducer("LookUpControl", reducer, mapDispatchToProps)(LookUpControl);
LookupComponent["displayName"] = "LookUpControl";

WidgetsFactory.instance.registerFactory(LookupComponent);
WidgetsFactory.instance.registerControls({
    mdclookup: "LookUpControl",
    'itsy:lookup': "LookUpControl"
});

export default LookupComponent;
