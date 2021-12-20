import React, { useState } from "react";
import { Nav, Button } from "react-bootstrap";
import { getDefaultRegistry, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import Dropdown from "react-bootstrap/Dropdown";

const getControlSchemaProperties = (props) => {
	const registry = getDefaultRegistry();
	const { definitions } = registry;
	const schema = retrieveSchema(props.schema, definitions);
	return schema;
};

const handleMoreItemsClick = (event, setAnchorEl) => {
	event.stopPropagation();
	setAnchorEl(event.currentTarget);
};

const getTabItems = (items) => {
	const primaryItems = [], moreItems = [];
	if (Array.isArray(items)) {
		items.forEach(item => {
			if (primaryItems.length < 4 && item.primary) {
				primaryItems.push(item);
			} else {
				moreItems.push(item);
			}
		});
	}
	return [primaryItems, moreItems];
};

const renderPrimaryItems = (primaryItems, props) => {
	const { handleChange } = getControlSchemaProperties(props);
	return Array.isArray(primaryItems) && primaryItems.map((tab, index) => {
		const { title, icon, path, primary } = tab;
		if (primary && icon) {
			return <Nav.Item key={`tab-${index}`} tabIndex={0}>
				<Button
					variant="light"
					className="nav-link bottom-nav-link"
					activeClassName="active"
					onClick={() => handleChange(path)}
					tabIndex={0}
					aria-label={title}
				>
					<div className="row d-flex flex-column justify-content-center align-items-center">
						<i className="freshui-icons">{icon}</i>
						<div className="bottom-tab-label">{title}</div>
					</div>
				</Button>
			</Nav.Item>;
		}
	});
};

const renderMoreItems = (moreItems, props, anchorEl, setAnchorEl) => {
	const { handleChange } = getControlSchemaProperties(props);
	return Array.isArray(moreItems) && moreItems.length > 0 &&
		<Nav.Item key={`tab-more`}>
			<div onClick={(event) => handleMoreItemsClick(event, setAnchorEl)}>
				<Dropdown>
					<Dropdown.Toggle >
						<div className="row d-flex flex-column justify-content-center align-items-center">
							<i className="freshui-icons">more_horiz</i>
							<div className="bottom-tab-label">More</div>
						</div>
					</Dropdown.Toggle>
					{anchorEl &&
						<Dropdown.Menu show={Boolean(anchorEl)} className="super-colors">
							{
								moreItems.map((tab, i) => {
									const { title, path } = tab;
									return <Dropdown.Item key={`${i}`} data-id={i} onClick={() => handleChange(path)}>{title}</Dropdown.Item>;
								})
							}
						</Dropdown.Menu>
					}
				</Dropdown>
			</div>
		</Nav.Item>;
};

const renderStickyBottomNavbar = (props) => {
	const { tabitems } = getControlSchemaProperties(props);
	const [anchorEl, setAnchorEl] = useState();
	const [primaryItems, moreItems] = getTabItems(tabitems);
	return <nav className="navbar fixed-bottom navbar-light d-block bottom-tab-nav" role="navigation">
		<Nav className="w-100">
			<div className=" d-flex flex-row justify-content-around w-100">
				{renderPrimaryItems(primaryItems, props)}
				{renderMoreItems(moreItems, props, anchorEl, setAnchorEl)}
			</div>
		</Nav>
	</nav>;
};

const NavbarBottom = (props) => {
	return renderStickyBottomNavbar(props);
};

const mapDispatchToProps = (dispatch) => { return {}; };
const narbarBottomControl = withReducer("NavbarBottom", mapDispatchToProps)(NavbarBottom);

narbarBottomControl.displayName = "NavbarBottom";

WidgetsFactory.instance.registerFactory(narbarBottomControl);
WidgetsFactory.instance.registerControls({
	navbar_bottom_control: narbarBottomControl.displayName,
});
