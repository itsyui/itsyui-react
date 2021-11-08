import { arrayToObjectMap, getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import {ItsyModal as Modal} from '@itsy-ui/navigation';
import React, { Component } from "react";
import {
	AppContainerActions, doAppContainerBeforeReady,
	doAppContainerChangeLayout, doAppContainerHideRegion, doAppContainerReady, doAppContainerShowRegion,
	doAppContainerUpdateSchema
} from './actions';
import reducer from './reducer';

import stateJSON from "./state.json";

class AppContainer extends Component {

	componentWillMount() {
		if (this.props.transition) {
			this.props.transition({
				type: AppContainerActions.State.APP_CONTAINER_BEFORE_READY
			});
		}
	}

	getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	getRootContainerElements() {
		if (this.props.rootContainerElements === undefined || this.props.rootContainerElements === null) {
			return null;
		}

		return this.props.rootContainerElements.map((schema, index) => {
			return <SchemaContainer key={index} schema={schema} />;
		});
	}

	render() {
		if (!this.props.loaded) {
			return null;
		}
		const { hiddenRegions, appSchema } = this.props;
		const appData = this.getControlSchemaProperties();

		const regionViews = appSchema ? arrayToObjectMap(appSchema.regions, (t) => t.name) : appData.regionViews;
		const themeView = appSchema ? appSchema.themeView : appData.themeView;
		const layoutType = appSchema ? appSchema.layoutType : appData.layoutType;
		const widgetName = appSchema && appSchema.customLayout ? appSchema.customLayout : "layout";

		const regions = Object.assign({}, regionViews);
		if (hiddenRegions.length > 0) {
			hiddenRegions.forEach(t => {
				if (regionViews.hasOwnProperty(t)) {
					delete regions[t];
				}
			});
		}
		const layoutSchema = {
			name: "home-layout",
			properties: {
				"ui:widget": widgetName,
				regions: regions,
				layoutType: this.props.layoutType ? this.props.layoutType : layoutType,
				themeView: themeView,
				className: appData.className ? appData.className : "",
				style: appData.style ? appData.style : {}
			}
		};
		const drawerControlSchema = {
			name: "app-drawer",
			properties: {
				"ui:widget": "AppDrawer",
			}
		};
		return <SchemaContainer key="home" schema={layoutSchema}>
			<SchemaContainer key="app-drawer" schema={drawerControlSchema} />
			<Modal key="app-modal" />
			{this.props.children}
			{this.props.rootContainerElements && this.props.rootContainerElements.length > 0 && this.getRootContainerElements()}
		</SchemaContainer>;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onAppContainerBeforeReady: () => dispatch(doAppContainerBeforeReady()),
		onAppContainerReady: (event) => dispatch(doAppContainerReady(event)),
		onAppContainerShowRegion: (event) => dispatch(doAppContainerShowRegion(event.regionName)),
		onAppContainerHideRegion: (event) => dispatch(doAppContainerHideRegion(event.regionName)),
		onAppContainerChangeLayout: (event) => dispatch(doAppContainerChangeLayout(event.layoutType)),
		onAppContainerUpdateSchema: (event) => dispatch(doAppContainerUpdateSchema(event.appSchema, event.rootContainerElements)),
	};
};

const AppContainerC = withReducer('AppContainer', reducer, mapDispatchToProps, stateJSON)(AppContainer);
AppContainerC.displayName = 'AppContainer';

WidgetsFactory.instance.registerFactory(AppContainerC);
WidgetsFactory.instance.registerControls({
	appContainer: 'AppContainer',
	'itsy:appcontainer': 'AppContainer'
});

export default AppContainerC;