import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { BsChevronDoubleLeft, BsChevronDoubleRight, BsChevronDown, BsChevronUp, BsXDiamond } from 'react-icons/bs';
import { getBasePath, getDeviceType } from "../../../utils/helper";
import "./horizontalSidebar"

interface ISidebarUIProps {
	canShowSidebar: boolean;
}
interface ResponsiveDrawerProps {
	container?: Element;
}
type SidebarUIControlProps = ResponsiveDrawerProps & ISidebarUIProps;

const stateJSON = {
	"initial": "onLoaded",
	"states": {
		"onLoaded": {
			"on": {
				"TOGGLE_SIDEBAR": "toggleSidebar",
			}
		},
		"toggleSidebar": {
			"onEntry": [
				"onToggleSidebar"
			],
			"on": {
				"SIDEBAR_DONE": "onLoaded"
			},
		}
	}
};

function doToggleSidebar() {
	return async (_, dispatch: any, transition: any) => {
		dispatch(updateToggleState());
		transition({
			type: "SIDEBAR_DONE"
		});
	};
}

function updateToggleState() {
	return {
		type: "TOGGLE_SIDEBAR"
	};
}

function reducer(state: any, action: any) {
	switch (action.type) {
		case "TOGGLE_SIDEBAR":
			return {
				...state,
				canShowSidebar: !state.canShowSidebar
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}
function toggleSidebar(transition) {
	transition({ type: "TOGGLE_SIDEBAR" });
}

function getContainsURL(childUrl, pathName, queryParams) {
	if (Array.isArray(childUrl) && pathName) {
		return childUrl.some(item => {
			const isPathURL = pathName.endsWith(item); // if pathName match return true, otherwise will check with pathName and queryParams
			return !isPathURL && queryParams ? `${pathName}${queryParams}`.endsWith(item) : isPathURL;
		});
	}
	return false;
}

function renderTooltip(subOption, props) {
	return (
		<Tooltip key={subOption.title} show={props.canShowSidebar ? false : true} id={subOption.title}>
			{subOption.title}
		</Tooltip>
	)
}

function drawer(data, props, layout) {
	const textDirection = layout === "layout_type_a" || layout === "layout_type_e" ? "text-direction" : "";
	const basePath = getBasePath();
	return data.map((subOption, i) => {
		if (layout !== "basic" && layout !== "layout_type_a" && layout !== "layout_type_d" && layout !== "layout_type_e" && subOption.hasOwnProperty("appIcon")) {
			subOption.id = "navbar:title_command";
			return <div className="sidebar-title-card">
				<div className={subOption.className ? subOption.className : props.canShowSidebar ? "list-item-avatar-expand" : "list-item-avatar"}>
					{props.canShowSidebar && <li tabIndex={0} aria-label={subOption.title} onClick={() => props.onTitleClicked(subOption)} className="logo-text" >
						{subOption.title}
					</li>}
					<div className={props.canShowSidebar ? "logo-avatar" : "logo-avatar-collabs"}>
						<img alt="appLogo" tabIndex={0} src={subOption.appIcon} className="MuiAvatarImage" />
					</div>
				</div>
			</div>;
		} else if (!subOption.children || subOption.children.length === 0) {
			let containUrl = false;
			if (subOption.hasOwnProperty("childUrl")) {
				const pathName: string = window.location.pathname;
				const queryParams = window.location.search;
				containUrl = getContainsURL(subOption.childUrl, pathName, queryParams);
			}
			let listItemClass = props.canShowSidebar ? "freshui-list-item icon-align list-item-avatar-expand" : "freshui-list-item icon-align";
			listItemClass = containUrl ? listItemClass + ' ' + "active" : listItemClass + ' ' + "sidebar_text_color fresh-sidebar-text-color";
			return (
				subOption.appIcon === undefined &&
				<OverlayTrigger
					placement="top-end"
					trigger={props.canShowSidebar ? "" : "hover"}
					overlay={renderTooltip(subOption, props)}
					key={i}
				>
					<a href={subOption.url && window.location.origin + basePath + subOption.url} className="sidebar-atag-item" tabIndex={0} title={subOption.title}>
						<li className={listItemClass + ' ' + textDirection}
							onClick={props.onSidebarItemClicked.bind(this, subOption)}
							key={subOption.title}>
							{subOption.image && subOption.image !== "" ? <img src={subOption.image} className={props.canShowSidebar ? "sidebar-imageIcon" : "collabse-sidebar-image"} /> : (subOption.iconName && subOption.iconName !== "" || subOption.className && subOption.className !== "") ?
								<i className={subOption.className + " " + "sidebar-icon"}>{subOption.iconName}</i> : <BsXDiamond className="default-sidebar-icon" />}
							{props.canShowSidebar && <div aria-label={subOption.title} className={layout === "layout_type_a" || layout === "layout_type_e" ? "sidebar-vertical-align-text" : "sidebar-menu-text"}
							>
								{subOption.title}
							</div>
							}
						</li>
					</a>
				</OverlayTrigger>
			);
		}
		const isCollapsable = () => {
			const url = window.location.href;
			if (props.selectedItems[subOption.title] === false) {
				return false;
			}
			const shouldCollapse = props.selectedItems[subOption.title] ? props.selectedItems[subOption.title] :
				subOption.children ? subOption.children.find(t => url.includes(t.url)) ? true : false : false;
			return shouldCollapse;
		};
		return (
			<div key={subOption.title}>
				<OverlayTrigger
					placement="top-end"
					overlay={renderTooltip(subOption, props)}
					trigger={props.canShowSidebar ? "" : "hover"}
					key={i}
				>
					<a href={subOption.url && window.location.origin + basePath + subOption.url} tabIndex={0} className="sidebar-atag-item" title={subOption.title}>
						<li className={"sidebar_text_color" + " " + "freshui-list-item icon-align textDirection"}
							onClick={props.onSidebarItemClicked.bind(this, subOption)}>
							{subOption.image && subOption.image !== "" ? <img src={subOption.image} className="sidebar-imageIcon" /> : (subOption.iconName && subOption.iconName !== "" || subOption.className && subOption.className !== "") ? <i className={subOption.className + " " + "sidebar-icon"}>{subOption.iconName}</i> : <BsXDiamond className="default-sidebar-icon" />}
							{props.canShowSidebar && <> <div className="sidebar-menu-text" aria-label={subOption.title}>
								{subOption.title}
							</div>
								<div>
									{props.canShowSidebar ? isCollapsable() ?
										<BsChevronUp /> : <BsChevronDown /> : ""}
								</div></>
							}
						</li>
					</a>
				</OverlayTrigger>
				<div className="childe-item-render fresh-childe-item-render">
					{isCollapsable() && drawer(subOption.children, props, layout)}
				</div>
			</div>
		);
	});
}
const Sidebar = props => {
	const { data, container, layout, className, style } = props;
	const matchs = deviceType !== "desktop" ? true : false
	const VerticalMenu = (layout === "layout_type_d" || layout === "layout_type_e") ? "verticalMenu" : "";
	if (layout === "layout_type_b" || layout === "layout_type_c") {
		const sidebarHorizontlSchema = {
			"name": "horizontal sidebar",
			properties: {
				"ui:widget": "horizontal_sidebar",
				"data": data,
				"container": container,
				"layout": layout,
				"keySelected": props.keySelected,
				className: className,
				style: style
			},
		};
		return <SchemaContainer schema={sidebarHorizontlSchema} />;
	} else {
		return (<div className={className ? `freshui-drawer-root ${className}` : "freshui-drawer-root"} style={style ? style : {}}> {!matchs &&
			<div className={props.canShowSidebar ? `${"freshui-expended-sidebar"} ${VerticalMenu}` : `${"freshui-collapse-sidebar"} ${VerticalMenu}`} >
				<div className="sidebar-item fresh-sidebar-item">
					{drawer(data, props, layout)}
				</div>
				< div className="sidebar-bottom-icon fresh-sidebar-bottom-icon">
					<div className="sidebar_bottom_line" />
					<div className={props.canShowSidebar ? "drawerHeader" : "drawerHeader_close"} tabIndex={0}>
						<div className="bottom-iconDiv" onClick={() => toggleSidebar(props.transition)} tabIndex={0}>
							{props.canShowSidebar ? <BsChevronDoubleLeft className="bottom-icon" /> : <BsChevronDoubleRight className="bottom-icon" />}
						</div>
					</div>
				</div>
			</div >}
			{matchs && props.canShowSidebar &&
				<div className="freshui-mobile-root" >
					<div className="backdrop" onClick={() => toggleSidebar(props.transition)} />
					<div className="freshui-mobile-sidebar-inner-contianer">
						<div className="sidebar-item" tabIndex={0}>
							{drawer(data, props, layout)}
						</div>
					</div>
				</div>
			}
		</div>
		);
	}
};

const deviceType = getDeviceType();
const initialState = {
	canShowSidebar: deviceType !== "desktop" ? false : true,
};
class MaterialSidebar extends React.Component<SidebarUIControlProps, {}> {

	constructor(props) {
		super(props)
		this.state = {
			selectedItems: {}
		}
	}

	getMenuicon() {
		const { data, layout } = this._getControlSchemaProperties();
		const customizedDiv = document.getElementsByClassName("menu-sectionMobile");
		const customizedRootDiv = document.getElementsByClassName("freshui-root-content-container")
		if (data && data.length > 0 && customizedDiv.length > 0) {
			customizedDiv[0].className = `menu-sectionMobile data-available`;
		} else if (customizedDiv.length > 0) {
			customizedDiv[0].className = "menu-sectionMobile";
		}
		if (data && data.length > 0 && customizedRootDiv.length > 0) {
			if (layout === "layout_type_b" || layout === "layout_type_c") {
				customizedRootDiv[0].className = "freshui-root-content-container without-sidebar";
			} else if (layout === "basic" || layout === "layout_type_a") {
				customizedRootDiv[0].className = this.props.canShowSidebar === undefined ? "freshui-root-content-container" : this.props.canShowSidebar ? "freshui-root-content-container expanded-sidebar" : "freshui-root-content-container collapse-sidebar";
			}
		} else if (customizedRootDiv.length > 0) {
			customizedRootDiv[0].className = "freshui-root-content-container";
		}
	}

	componentDidUpdate() {
		this.getMenuicon();
	}

	componentDidMount() {
		this.getMenuicon();
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}
	_groupData(data: any[]) {
		return data.reduce((item1, item2) => {
			if (!item1[item2["group"]]) { item1[item2["group"]] = []; }
			item1[item2["group"]].push(item2);
			return item1;
		}, {});
	}

	_getParentSelectedItem(data: any, selectedItem: any, result: any) {
		if (data.children !== undefined) {
			for (let i = 0; i < data.children.length; i++) {
				if (selectedItem.title == data.children[i].title) {
					result.items.push(data.title);
					result.items.push(data.children[i].title);
					result.found = true;
					break;
				}
				else if (data.children[i].children !== undefined) {
					return this._getParentSelectedItem(data.children[i], selectedItem, result);
				}
			}
		}
		return result;
	}

	onSidebarItemClicked(item: any, e: any) {
		const { keySelected } = this._getControlSchemaProperties();
		let updatedItems = {};
		if (!item["children"] || item.children.length === 0) {
			keySelected(item);
		}
		if (Object.keys(this.state.selectedItems).length === 0) {
			updatedItems = { [item.title]: true }
		} else {
			const foundItem = this.state.selectedItems.hasOwnProperty(item.title);
			updatedItems = foundItem ? { [item.title]: !this.state.selectedItems[item.title] } : item.parentId ?
				{ [item.title]: true } : item.children ? item.children.find(t => this.state.selectedItems[t.title]) ? { [item.title]: false } : { [item.title]: true } : { [item.title]: false };
		}
		
		if (deviceType !== "desktop" && !item["children"]) {
			this.props.transition({ type: "TOGGLE_SIDEBAR" });
		}

		this.setState({ selectedItems: updatedItems });
		e.preventDefault();
	}
	onTitleClicked(item: any) {
		const { keySelected } = this._getControlSchemaProperties();
		keySelected(item);
	}
	render() {
		const { data, keySelected, layout, className, style } = this._getControlSchemaProperties();
		return <Sidebar
			layout={layout}
			canShowSidebar={this.state.canShowSidebar}
			selectedItems={this.state.selectedItems}
			data={data}
			keySelected={keySelected}
			onSidebarItemClicked={this.onSidebarItemClicked.bind(this)}
			_getControlSchemaProperties={this._getControlSchemaProperties.bind(this)}
			onTitleClicked={this.onTitleClicked.bind(this)}
			{...this.props}
			className={className}
			style={style}
		/>
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		onToggleSidebar: () => dispatch(doToggleSidebar()),
	};
};

const sidebarControl = withReducer('MaterialSidebar', reducer, mapDispatchToProps, stateJSON)(MaterialSidebar);
sidebarControl.displayName = 'MaterialSidebar';

WidgetsFactory.instance.registerFactory(sidebarControl);
WidgetsFactory.instance.registerControls({
	sidebar_control: "MaterialSidebar",
	"itsy:ui:sidebar": "MaterialSidebar"
});
