// import Button from '@material-ui/core/Button';
import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory } from '@itsy-ui/core';
import * as React from "react";
import { isEnvContainsKey } from "../../utils/helper";
interface LayoutUIProps {
	layoutType: string;
}

type LayoutUIControlProps = IWidgetControlProps & LayoutUIProps;

const LayoutComponent = props => {
	const { themes, layoutType } = props;
	return (
		<div className="root" >
			<div className={isEnvContainsKey("tablet") ? "tablet-freshui-body-main-container" : layoutType === "simple" ? "basic-container" : "freshui-body-main-container"}>
				{props.generateLayout()}
			</div>
		</div>
	)
}

export class LayoutWidget extends React.Component<LayoutUIControlProps, {}> {

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	basicLayout = () => {
		const { regions, layoutType } = this._getControlSchemaProperties();
		if ("navbar" in regions) {
			regions["navbar"]["properties"]["layout"] = layoutType;
		}
		if ("sidebar" in regions) {
			regions["sidebar"]["properties"]["layout"] = layoutType;
		}
		return <>

			<div className="freshui-body-sub-container">
				<div className="freshui-inner-body-container">
					<div className={'freshui-inner-body-container-contentarea'}>
						{
							"navbar" in regions &&
							<SchemaContainer schema={regions["navbar"]} />
						}
						<div className="freshui-root-content-container">
							{
								"sidebar" in regions &&
								<SchemaContainer schema={regions["sidebar"]} />
							}
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		</>;
	};

	posLayout = () => {
		const { regions } = this._getControlSchemaProperties();
		if ("navbar" in regions) {
			regions["navbar"]["properties"]["layout"] = "pos";
		}
		return <>
			<div className="freshui-body-sub-container">
				<div className="freshui-inner-body-container">
					<div className={'freshui-inner-body-container-contentarea'}>
						{
							"navbar" in regions &&
							<SchemaContainer schema={regions["navbar"]} />
						}
						<div className="freshui-root-content-container">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		</>;
	}
	horizontlLayout = () => {
		const { regions, layoutType } = this._getControlSchemaProperties();
		if ("navbar" in regions) {
			regions["navbar"]["properties"]["layout"] = layoutType;
		}
		if ("sidebar" in regions) {
			regions["sidebar"]["properties"]["layout"] = layoutType;
		}
		return <>
			<div className="freshui-body-sub-container-horizontal">
				<div className="freshui-inner-body-container">
					<div className={'freshui-inner-body-container-contentarea'}>
						{
							"navbar" in regions &&
							<SchemaContainer schema={regions["navbar"]} />
						}
						{
							"sidebar" in regions &&
							<SchemaContainer schema={regions["sidebar"]} />
						}
						<div className="freshui-root-content-container">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		</>;
	}
	sidebarClassic = () => {
		const { regions, layoutType } = this._getControlSchemaProperties();
		if ("navbar" in regions) {
			regions["navbar"]["properties"]["layout"] = layoutType;
		}
		if ("sidebar" in regions) {
			regions["sidebar"]["properties"]["layout"] = layoutType;
		}
		return <>
			{
				"sidebar" in regions &&
				<SchemaContainer schema={regions["sidebar"]} />
			}
			<div className="freshui-body-sub-container">
				<div className="freshui-inner-body-container">
					<div className={'freshui-inner-body-container-contentarea'}>
						{
							"navbar" in regions &&
							<SchemaContainer schema={regions["navbar"]} />
						}
						<div className="freshui-root-content-container">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		</>;
	}
	contentOnlyLayout = () => {
		const { regions } = this._getControlSchemaProperties();
		return <>
			<div className="freshui-body-sub-container">
				<div className="freshui-inner-body-container">
					<div className={'freshui-inner-body-container-contentarea'}>
						<div className="freshui-root-content-container without-sidebar">
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		</>;
	}

	generateLayout = () => {
		let { layoutType } = this._getControlSchemaProperties();

		layoutType = this.props.layoutType ? this.props.layoutType : layoutType ? layoutType : "basic";
		let layout;
		if (layoutType) {
			if (layoutType === "basic" || layoutType === "layout_type_a") {
				layout = this.basicLayout();
			} else if (layoutType === "pos") {
				layout = this.posLayout();
			} else if (layoutType === "layout_type_b" || layoutType === "layout_type_c") {
				layout = this.horizontlLayout();
			} else if (layoutType === "layout_type_d" || layoutType === "layout_type_e") {
				layout = this.sidebarClassic();
			} else if (layoutType === "layout_type_f") {
				layout = this.contentOnlyLayout();
			} else {
				layout = this.props.children;
			}
		}
		return layout;
	}

	render() {
		const { regions, themeView, layoutType } = this._getControlSchemaProperties();
		return (
			<LayoutComponent
				layoutType={layoutType}
				generateLayout={this.generateLayout.bind(this)}
				{...this.props}
			/>
		);
	}
}
LayoutWidget["displayName"] = 'LayoutWidget';
WidgetsFactory.instance.registerFactory(LayoutWidget);
WidgetsFactory.instance.registerControls({
	layout: 'LayoutWidget',
	"itsy:ui:layout": 'LayoutWidget'
});