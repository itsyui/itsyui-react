import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Breadcrumb, Dropdown } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import { BsList } from 'react-icons/bs';
import { getDeviceType, getlocaleText } from "../../utils/helper";

type NavbarUIControlProps = IWidgetControlProps;

const initialState = {
	appIcon: null,
};

export function onNavbarLoad() {
	return async (getState: any, dispatch: any, transition: any) => {
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"];
		const schemaProvider = dataLoader.getLoader("appSchemaProvider");
		const getCompanyLogo = await schemaProvider.getSchema(`/app/data`);
		const appIcon = getCompanyLogo !== null && getCompanyLogo.properties.appIcon;
		dispatch(appIconUpdate(appIcon));
	};
}

function appIconUpdate(appIcon: any) {
	return {
		type: "APPICON_UPDATE",
		icon: appIcon,
	};
}

function getTitle(t: any, props: any, layout: any) {
	if (layout !== "basic" && layout !== "layout_type_a" && layout !== "layout_type_b" && layout !== "layout_type_c" && layout !== "layout_type_d" && layout !== "layout_type_e") {
		return <span onClick={() => props.onNavItemClicked(t)} className={"appTitle"}> {t.appTitle}</span>;
	} else {
		return null;
	}
}
function getSubTitle(t: any, matches: any) {
	return <div key="check"><Breadcrumb aria-label="breadcrumb" className={`  ${matches ? "mobile_nav_breadcrumb_align" : "nav_breadcrumb_align"}`} >
		{t["path"].split("/").map(bc => <Breadcrumb.Item key={t.id} className={`${t.className}  ${matches ? "mobile_breadcrumb_font_size" : "breadcrumb_font_size"}`} color="inherit" >{bc}</Breadcrumb.Item>)}
	</Breadcrumb></div>;
}
const NavbarComponent = props => {
	const { appIcon, AvatarIconControlSchema, data, renderNavbarProfileActionItems, renderPrimaryItems, layout, titleShow, className, style } = props;
	const deviceType = getDeviceType()
	const matches = deviceType === "desktop" ? false : true;
	return (
		<div className={className ? `freshui-navbar-container ${className}` : "freshui-navbar-container"} style={style ? style : {}}>
			<Navbar bg="light" variant="light" fixed="top" className={layout === "pos" ? "header-full-width" : "header-fixed-design"}>
				<Navbar.Brand key="left-items" className="navbar-section">
					<div key="mobile-sidebar" className="menu-sectionMobile">
						<div className="logo-menu-Section">
							<div aria-label="menuIcon" onClick={props.handleSideBarClick.bind(this)}>
								<BsList />
							</div>
						</div>
					</div>
					<div key="left-menu" className="header-top-left-menu">
						{
							data.items.length > 0 &&
							<div className="navbar-title">
								{props.renderAppIcon(data, matches)}
							</div>
						}
						<ul className="horizmenu">
							<div className={matches ? "mobile_nav_left_title" : "nav_left_title"}>
								{data.items !== undefined && data.items.map(t => {
									if (t["appTitle"] && t["appTitle"] !== "") {
										return getTitle(t, props, layout);
									}
									if (matches && t.hasOwnProperty("path") && t["path"].split("/").length > 0) {
										return getSubTitle(t, matches);
									}
									return (
										t.appIcon === undefined && t["ui:widget"] === undefined ? <li key={t.id} className={t.className ? "navItem" : "nav-app-title"} onClick={props.onNavItemClicked.bind(this, t)}>{getlocaleText(t.title)}</li> : null
									);
								})
								}
							</div>
						</ul>
					</div>
				</Navbar.Brand>
				{data && Array.isArray(data.rightItems) && data.rightItems.length > 0 && <div key="right-item" className="freshui-header-top-right-menu">
					{renderPrimaryItems(data, matches)}
					{renderNavbarProfileActionItems(data, matches, AvatarIconControlSchema)}
				</div>}
			</Navbar >
		</div >
	);
};
class MaterialNavbar extends React.Component<NavbarUIControlProps, {}> {

	constructor() {
		super();
		this.state = {
			anchorEl: false,
			applunch: null,
		};
	}

	componentWillMount() {
		this.props.navbarLoad();
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	navItemClick(t: any) {
		const { onItemClick } = this._getControlSchemaProperties();
		onItemClick(t);
	}

	async onCommandExecute(navItemData: any) {
		const dataLoader = WidgetsFactory.instance.services["DataLoaderFactory"] as DataLoaderFactory;
		const commandManager = dataLoader.getLoader<ICommandManager>("commandManager");
		const cmd = commandManager.getCommand(navItemData.id, {});
		try {
			await cmd!.execute(navItemData, this.props.transition);
		} catch (e) {
		}
	}

	onNavItemClicked(item: any) {
		const { onItemClick } = this._getControlSchemaProperties();
		onItemClick(item);
	}

	renderAppIcon(data, matches) {
		const appIcon = [];
		data.items.forEach((t, i) => {
			// tslint:disable-next-line: no-unused-expression
			appIcon.push(
				<>
					{t.appIcon && <div key={`nav-logo-${i}`} className="nav-logo" onClick={() => this.onNavItemClicked(t)} >
						<div className="title-icon">< img alt="companyLogo" className={t.className ? t.className : "left-icon"} src={t.appIcon} />
						</div>
						{t.appIcon && t.title && <div style={{ alignSelf: "center" }} className={matches ? "mobile_navbar_title_content" : "navbar_title_content"}>{t.title}</div>}
					</div>}
					{
						t.hasOwnProperty("ui:widget") &&
						<div key={`nav-title-${i}`} className="nav-title">{this.renderNavbarSchemaWidget(t)}</div>
					}
				</>
			);
		});
		return appIcon.length > 0 && appIcon.map(t => t);
	}

	renderNavbarSchemaWidget(item) {
		const controlSchema = {
			name: item["id"],
			properties: {
				...item
			},
		};
		return <SchemaContainer key={item["id"]} schema={controlSchema} />;
	}

	_getCurrentUserInfo() {
		try {
			const userBTOA = localStorage.getItem("USER_LOCAL");
			return userBTOA !== undefined ? atob(userBTOA).split(":") : undefined;
		} catch (error) {
			return undefined;
		}
	}

	handleClick(event) {
		this.setState({
			anchorEl: !this.state.anchorEl,
		});
	}
	handleClose() {
		this.setState({
			anchorEl: false,
		});
	}
	handleSideBarClick(evt: any) {
		if (this.props.transition) {
			this.props.transition({ type: "TOGGLE_SIDEBAR" });
		}
	}

	renderNavbarProfileActionItems(data, matches, AvatarIconControlSchema) {
		return <Dropdown show={this.state.anchorEl} drop="left" key="profile" onToggle={(e) => this.handleClick(e)}>
			<div onClick={(e) => this.handleClick(e)} >
				<SchemaContainer schema={AvatarIconControlSchema} />
			</div>
			{
				<Dropdown.Menu className="super-colors">
					{
						data.rightItems !== undefined && data.rightItems.map(t => {
							if (matches && !t.isApplaunch) {
								return (<Dropdown.Item key={t.id} onClick={this.onNavItemClicked.bind(this, t)} >{t.title}</Dropdown.Item>)
							} else if (matches === false && !t.hasOwnProperty("isPrimary") && !t["isPrimary"]) {
								return (<Dropdown.Item key={t.id} onClick={this.onNavItemClicked.bind(this, t)} >{t.title}</Dropdown.Item>);
							}
						})
					}
				</Dropdown.Menu>
			}
		</Dropdown>;
	}

	renderPrimaryItems(data, matches) {
		const { rightItems } = data;
		const primaryItems = rightItems !== undefined && rightItems.reduce((acc, x, i) => {
			if (x.isPrimary && x.icon) {
				acc.push(<i className="freshui-icons" key={i} onClick={this.onNavItemClicked.bind(this, x)}> {x.icon}</ i>)
			}
			return acc;
		}, []);
		return Array.isArray(primaryItems) && primaryItems.length > 0 ? <div className="freshui-navbar-actions" key="primary-actions">
			{primaryItems}
		</div> : null;
	}

	renderAppLaunch(matches) {
		const appLauncherSchema = {
			name: "applauncher",
			properties: {
				"ui:widget": "app_launcher",
				matches,
				onAppIconClick: this.onNavItemClicked.bind(this),
			},
		};
		return <div key="applauncher">
			<SchemaContainer key="applauncher-widget" schema={appLauncherSchema} />
		</div>;
	}

	render() {
		const { data, layout, className, style } = this._getControlSchemaProperties();
		const AvatarIconControlSchema = {
			"name": "AvatarIcon",
			"properties": {
				"ui:widget": "avatar_icon_control",
				data: data,
			},
		};
		return (
			<NavbarComponent key="nav-bar-wrapper"
				appIcon={this.props.appIcon}
				layout={layout}
				data={data}
				AvatarIconControlSchema={AvatarIconControlSchema}
				onCommandExecute={this.onCommandExecute.bind(this)}
				onNavItemClicked={this.onNavItemClicked.bind(this)}
				handleSideBarClick={this.handleSideBarClick.bind(this)}
				handleClick={this.handleClick.bind(this)}
				renderPrimaryItems={this.renderPrimaryItems.bind(this)}
				renderNavbarProfileActionItems={this.renderNavbarProfileActionItems.bind(this)}
				renderAppIcon={this.renderAppIcon.bind(this)}
				{...this.props}
				className={className}
				style={style}
			/>
		);
	}
}

function reducer(state: any, action: any) {
	switch (action.type) {
		case "APPICON_UPDATE":
			return {
				...state,
				appIcon: action.icon,
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		navbarLoad: () => dispatch(onNavbarLoad()),

	};
};

const narbarControl = withReducer("MaterialNavbar", reducer, mapDispatchToProps)(MaterialNavbar);
narbarControl.displayName = "MaterialNavbar";

WidgetsFactory.instance.registerFactory(narbarControl);
WidgetsFactory.instance.registerControls({
	navbar_control: narbarControl.displayName,
	"itsy:ui:navbar": narbarControl.displayName
});
