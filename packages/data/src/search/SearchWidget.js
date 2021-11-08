import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import React, { Component } from "react";
import { doSearchClicked, doSearchInit, doSearchInitLoaded, doSearchLoad, doSearchWithQR, doUpdateSearchValue, SearchAction } from "./actions";
import reducer from "./reducer";
import "./searchWidgetPageBinding";
import "./locale";
import stateJSON from "./state.json";

class SearchWidget extends Component {
	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	componentWillMount() {
		this.initializeSearchWidget();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.schema.designerMetadata && nextProps.schema.designerMetadata.needRefresh) {
			this.initializeSearchWidget(nextProps.schema);
		}
	}

	initializeSearchWidget(schema = null) {
		const { typeId, gridSchemaId, designerMetadata, controlID, enableQRScan } = schema ? schema : this.getControlSchemaProperties()
		if (this.props.transition) {
			this.props.transition({
				type: SearchAction.State.SEARCH_INIT,
				typeId,
				gridSchemaId,
				designerMetadata,
				enableQRScan,
				...controlID && { controlID }
			});
		}
	}

	render() {
		if (this.props.data && Object.keys(this.props.data).length !== 0) {
			this.props.data.properties = {
				...this.props.data.properties,
				className: this.props.className,
				style: this.props.style
			};
			return <SchemaContainer key="searchSChema" schema={this.props.data} />;
		}
		return null;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onSearchInit: (event) => dispatch(doSearchInit(event)),
		onSearchInitLoaded: ({ data }) => dispatch(doSearchInitLoaded(data)),
		onSearchClicked: ({ data }) => dispatch(doSearchClicked(data)),
		onSearchLoad: () => dispatch(doSearchLoad()),
		onUpdateSearchValue: ({ value }) => dispatch(doUpdateSearchValue(value)),
		onSearchWithQR: () => dispatch(doSearchWithQR()),
	};
};

const ItsySearchWidget = withReducer("SearchWidget", reducer, mapDispatchToProps, stateJSON)(SearchWidget);
ItsySearchWidget.displayName = "SearchWidget";

WidgetsFactory.instance.registerFactory(ItsySearchWidget);
WidgetsFactory.instance.registerControls({
	search: "SearchWidget",
	'itsy:search': "SearchWidget"
});

export default ItsySearchWidget;