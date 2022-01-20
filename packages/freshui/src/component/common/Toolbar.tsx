import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { getDeviceType } from "../../utils/helper";

const ToolbarComponents = props => {
	const { renderToolbarActionItems, renderPrimaryMobileIconButtons, renderMobileMenu, items, itemClick, renderPrimaryButtons, align, className, style } = props;
	const deviceType = getDeviceType();
	const matches = deviceType === "desktop" ? false : true;
	const alignstyle = align !== undefined && align === "right" ? "flex-end" : align === "center" ? "center" : "flex-start";
	return (
		<div className={className ? `${className} fresh-inner-header-menu` : "fresh-inner-header-menu"} style={style} tabIndex={0}>
			{!matches && <div style={{ "justifyContent": alignstyle }} className={"sectionDesktop"} tabIndex={0}>
				{renderPrimaryButtons(items, itemClick, alignstyle)}
				{renderToolbarActionItems(props)}
			</div>}
			{matches && <div style={{ "justifyContent": alignstyle }} className={"sectionMobile"} tabIndex={0}>
				{renderPrimaryMobileIconButtons(items, itemClick, alignstyle)}
				{renderMobileMenu(props)}
			</div>}
		</div >
	);
};

class ToolbarUI extends React.Component<IWidgetControlProps, {}> {
	constructor() {
		super();
		this.state = {
			menuItems: [],
			anchorEl: null,
		}
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	_doCustomToolbarButtonExecute(name: string, currentObject: {}) {
		this.handleClose();
		this.props.transition({
			type: "TOOLBAR_COMMANDEXECUTE",
			name,
			currentObject
		});
	}

	handleClick(event: any, isMobile: boolean = false) {
		const { items } = this._getControlSchemaProperties();
		const menuItems = Array.isArray(items) ? items.reduce((accum, t) => {
			if (t.enabled !== false && (isMobile || t.isPrimary !== true)) {
				accum.push(t);
			}
			return accum;
		}, []) : [];

		if (menuItems.length > 0) {
			this.setState({
				anchorEl: event.currentTarget,
			});
		}
	}

	handleClose() {
		this.setState({
			anchorEl: null,
		});
	}

	renderToolbarActionItems(props) {
		const menuItems = Array.isArray(props.items) ? props.items.filter(t => t.enabled !== false && t.isPrimary !== true) : [];
		return menuItems.length > 0 &&
			<>
				<Dropdown className="tool-bar">
					<Dropdown.Toggle >
						<BsThreeDotsVertical className={"menuicon"} onClick={(e) => props.handleClick(e)} />
					</Dropdown.Toggle>
					{<Dropdown.Menu show={Boolean(this.state.anchorEl)} className="super-colors">
						{
							menuItems.map((t, i) => {
								return <Dropdown.Item key={t.id + '-' + i} onClick={this._doCustomToolbarButtonExecute.bind(this, t.name, t)} disabled={t.enabled !== undefined ? !t.enabled : true}>{t.displayText}</Dropdown.Item>;
							})
						}
					</Dropdown.Menu>
					}
				</Dropdown>
			</>;
	}

	renderPrimaryButtons(items, itemClick, alignstyle) {
		const primaryItems = [];
		items !== undefined && items.map((t, i) => {
			(t.enabled !== false && t.isPrimary === true)
				? primaryItems.push(<Button key={i} variant="primary" size="sm"
					className={t.className ? `freshui-primary-button ${t.className}` : "freshui-primary-button"} onClick={() => itemClick(t.name, t)}
					disabled={t.disable ? t.disable : false}
				>
					{t.iconPosition === "startIcon" && <i className="freshui-icons">{t.iconName}</i>}
					{t.displayText}
					{t.iconPosition === "endIcon" && <i className="freshui-icons">{t.iconName}</i>}
				</Button>) : null;
		});
		return primaryItems.length > 0 && primaryItems;
	}

	renderPrimaryMobileIconButtons(items, itemClick, alignstyle) {
		const primaryItems = [];
		items !== undefined && items.map((t, index) => {
			(t.enabled !== false && t.isPrimary === true) && (primaryItems.push(<Button key={index} variant="primary" size="sm"
				className={t.className ? `freshui-primary-button ${t.className}` : "freshui-primary-button"} onClick={() => itemClick(t.name, t)}
				disabled={t.disable ? t.disable : false}
			>
				{t.iconPosition === "startIcon" && <i className="freshui-icons">{t.iconName}</i>}
				{t.displayText}
				{t.iconPosition === "endIcon" && <i className="freshui-icons">{t.iconName}</i>}
			</Button>));
		});
		return primaryItems.length > 0 && primaryItems;
	}

	renderMobileMenu(props) {
		const menuItems = Array.isArray(props.items) ? props.items.filter(t => t.isPrimary !== true && t.enabled !== false) : [];
		return menuItems.length > 0 &&
			<>
				<Dropdown>
					<Dropdown.Toggle >
						<BsThreeDotsVertical className={"menuicon"} onClick={(e) => props.handleClick(e, true)} />
					</Dropdown.Toggle>
					{<Dropdown.Menu show={Boolean(this.state.anchorEl)} className="super-colors">
						{
							menuItems.map((t, i) => {
								return <Dropdown.Item key={t.id + '-' + i} onClick={this._doCustomToolbarButtonExecute.bind(this, t.name, t)} disabled={t.enabled !== undefined ? !t.enabled : true}>{t.displayText}</Dropdown.Item>;
							})
						}
					</Dropdown.Menu>
					}
				</Dropdown>
			</>;
	}
	render() {
		const { items, itemClick, align, className, style } = this._getControlSchemaProperties();
		return (
			<ToolbarComponents
				align={align}
				items={items}
				itemClick={itemClick}
				renderPrimaryButtons={this.renderPrimaryButtons.bind(this)}
				renderToolbarActionItems={this.renderToolbarActionItems.bind(this)}
				handleClick={this.handleClick.bind(this)}
				renderMobileMenu={this.renderMobileMenu.bind(this)}
				renderPrimaryMobileIconButtons={this.renderPrimaryMobileIconButtons.bind(this)}
				{...this.props}
				className={className}
				style={style}
			/>
		);
	}
}

const mapDispatchToProps = () => {
	return {};
};

const ToolbarComponent = withReducer('ToolbarUI', mapDispatchToProps)(ToolbarUI);
ToolbarComponent.displayName = 'ToolbarUI';

WidgetsFactory.instance.registerFactory(ToolbarComponent);
WidgetsFactory.instance.registerControls({
	toolbar_control: 'ToolbarUI',
	"itsy:ui:toolbar": 'ToolbarUI'
});

export default ToolbarComponent;