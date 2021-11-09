import * as React from "react";
import { withRouter } from "react-router-dom";
import { withReducer, WidgetsFactory, SchemaContainer, getLocaleString } from "@itsy-ui/core";
import { DataLoaderFactory, IAppSchemaProvider } from "@itsy-ui/core";
import { getUrlParams } from "@itsy-ui/utils";
import { AppbarActions, doAppBarInit, doAppBarRefresh, doappItemClick, doAppBarCommandExecute } from "./actions";
import reducer from "./reducer";
import "./AppBarSchemaLoader";
const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
const schemaProvider = dataLoader.getLoader<IAppSchemaProvider>("appSchemaProvider");
import stateJSON from "./state.json";

class MobileAppBarWidget extends React.Component<any, {}> {

	componentWillMount() {
		if (this.props.transition) {
			this.props.transition({
				type: AppbarActions.State.APPBAR_INIT,
			});
		}
	}
	_onappItemClicked(appItemData: any) {
		const queryParams = getUrlParams(this.props.location.search);
		const data = {
			"typeId": queryParams.typeId,
			"gridSchemaId": queryParams.gridSchemaId,
			"appItemData": appItemData
		}
		this.props.appItemClick(data);
	}

	generateLocaleString(data: any) {
		const items = {};
		const leftItems = data.items ? data.items.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		}) : [];
		const rightItems = data.rightItems ? data.rightItems.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		}) : [];
		const rightIconItems = data.rightIconItems ? data.rightIconItems.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		}) : [];
		const leftIconItems = data.leftIconItems ? data.leftIconItems.map(t => {
			t["title"] = getLocaleString(t, "title");
			return t;
		}) : [];
		const properties = data.properties ? data.properties.map(t => {
			t["displayName"] = getLocaleString(t, "displayName");
			return t;
		}) : [];
		items["items"] = leftItems;
		items["rightItems"] = rightItems;
		items["rightIconItems"] = rightIconItems;
		items["leftIconItems"] = leftIconItems;
		items["properties"] = properties;
		return items;
	}

	_getAppbarUIControlSchema() {
		const _getAppbarUIControlSchema = {
			name: `appbar-ui-control`,
			properties: {
				"ui:widget": "appbar_control",
				data: this.generateLocaleString(JSON.parse(JSON.stringify(this.props.data))),
				onItemClick: this._onappItemClicked.bind(this),
			},
		};

		return <SchemaContainer schema={_getAppbarUIControlSchema} />;
	}

	render() {
		if (this.props.data && this.props.data !== null && Object.keys(this.props.data).length > 0) {
			return this._getAppbarUIControlSchema();
		} else {
			return <label>No data</label>;
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onAppBarInit: () => dispatch(doAppBarInit()),
		onAppBarRefresh: (event) => dispatch(doAppBarRefresh(event.items)),
		appItemClick: (data) => dispatch(doappItemClick(data.appItemData, data.typeId, data.gridSchemaId)),
		onAppBarCommandExecute: (event) => dispatch(doAppBarCommandExecute(event.appItemData, event.typeId, event.gridSchemaId)),
	};
};

const ItsyMobileAppBar = withReducer("MobileAppBarWidget", reducer, mapDispatchToProps, stateJSON)(withRouter(MobileAppBarWidget));
ItsyMobileAppBar.displayName = "MobileAppBarWidget";

WidgetsFactory.instance.registerFactory(ItsyMobileAppBar);
WidgetsFactory.instance.registerControls({
	Mobile_appbar_control: "MobileAppBarWidget",
	"itsy:appbar": "MobileAppBarWidget"
});

export default ItsyMobileAppBar;