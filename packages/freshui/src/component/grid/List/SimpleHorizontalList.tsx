import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import { Button, Dropdown, ListGroup } from 'react-bootstrap';
import { BsThreeDotsVertical } from "react-icons/bs";
import { ISimpleHorizontalListWidgetProps } from "./listTypes";

type SimpleHorizontalListControlProps = IWidgetControlProps & ISimpleHorizontalListWidgetProps;

function getListItemActions(id: string, actions: any, props: any, executeCommand: any, gridStyle: string) {
	if (Array.isArray(actions) && actions.length > 0) {
		const { handleMoreBtnClick, anchorEl, handleClose, currentFocusedRow } = props;
		const primaryItem = actions.find(t => t.isPrimary && t.enabled);
		const primaryAction = primaryItem && (primaryItem.iconPosition == "none"
			? <Button color="secondary" variant="outline-primary" size="sm" className=""
				onClick={(e) => executeCommand(primaryItem, id, props, e)} tabIndex={0} aria-label={primaryItem.displayText}
			>{primaryItem.displayText}</Button >
			: <Button color="secondary" variant="outline-primary" size="sm" className="freshui-btn-control"
				onClick={(e) => executeCommand(primaryItem, id, props, e)} tabIndex={0} aria-label={primaryItem.displayText}
			>
				{primaryItem.iconPosition === "startIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
				{primaryItem.displayText}
				{primaryItem.iconPosition === "endIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
			</Button >);

		const nonPrimaryActions = actions.filter(t => primaryItem ? (t.name !== primaryItem.name && t.enabled) : t.enabled);
		return (
			<div className="model-actions">
				{primaryAction}
				{nonPrimaryActions && nonPrimaryActions.length > 0 &&
					<div className="customize-table-action" onClick={handleMoreBtnClick.bind(this, id)}>
						<Dropdown>
							<Dropdown.Toggle>
								<BsThreeDotsVertical />
							</Dropdown.Toggle>
							{anchorEl && currentFocusedRow === id &&
								<Dropdown.Menu show={Boolean(anchorEl)} className="super-colors">
									{
										nonPrimaryActions.map((t, i) => {
											return <Dropdown.Item key={`${id}-${i}`} data-id={id} onClick={(e) => executeCommand(t, id, props, e)}>{t.displayText}</Dropdown.Item>;
										})
									}
								</Dropdown.Menu>
							}
						</Dropdown>
					</div>
				}
			</div>);
	}
	return null;
}

const SimpleHorizontalList = props => {
	const { index, listId, listViewProps, row, avatarValue, primaryValue, secondaryValue, tertiaryValue, actions, onListSelect, renderCell, executeCommand, gridStyle } = props;
	const actionItems = getListItemActions(listId, actions, listViewProps, executeCommand, gridStyle);
	const listProps = listViewProps ? listViewProps : {};
	const isSelected = (id) => {
		const { selectedRows, viewAttributes, rows } = listProps;
		const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(rows[0])[0];
		const selectedObj = selectedRows.find(srow => srow[primaryFieldId] === id);
		return selectedObj !== undefined;
	};
	const textAvatar = listProps.viewAttributes["isTextAvatar"];
	return (
		<div onClick={(event) => onListSelect(event, listId, { ...listProps })} className={gridStyle === "condensed" ? "condensed-row" : "normal-row"}>
			<ListGroup horizontal className={isSelected(listId) ? `${"freshui-select-listView"} ${"Listmodel-whole-container"}` : `${"Listmodel-whole-container"}`} tabIndex={0}>
				{avatarValue && <ListGroup.Item className={textAvatar ? "list-text-avatar list-avatar" : "list-avatar"} key={"grid_item_avatar" + listId}>
					{renderCell(avatarValue.column, row, "avatar", listProps)}
				</ListGroup.Item>
				}
				<ListGroup.Item className={textAvatar ? "list-text-avatar-content list-view-details-container" : "list-view-details-container"} tabIndex={0}>
					{primaryValue && <div className="list-primary-text" key={"grid_item_primary" + listId} >
						{renderCell(primaryValue.column, row, "primary", listProps)}
					</div>
					}
					{secondaryValue && <div className="list-secondary-text" key={"grid_item_secondary" + listId} >
						{renderCell(secondaryValue.column, row, "secondary", listProps)}
					</div>}
					{/* {tertiaryValue && <div className="list-tertiary-text" key={"grid_item_tertiary" + listId} >
						{renderCell(tertiaryValue.column, row, "tertiary", listProps)}
					</div>} */}
				</ListGroup.Item>
				{actionItems && <ListGroup.Item tabIndex={0} className="simple-list-action" key={"grid_item_actions" + listId} >
					{actionItems}
				</ListGroup.Item>}
			</ListGroup>
		</div >
	);
};

class SimpleHorizontalListControl extends React.Component<SimpleHorizontalListControlProps, {}> {

	_getControlSchemaProperties = (props) => {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(props.schema, definitions);
		return schema;
	}

	render() {
		const { index, listId, listViewProps, row, primaryValue, secondaryValue, tertiaryValue, avatarValue, actions, onListSelect, renderCell, executeCommand, gridStyle } = this._getControlSchemaProperties(this.props);
		return (
			<SimpleHorizontalList
				gridStyle={gridStyle}
				index={index}
				listId={listId}
				listViewProps={listViewProps}
				row={row}
				primaryValue={primaryValue}
				secondaryValue={secondaryValue}
				tertiaryValue={tertiaryValue}
				avatarValue={avatarValue}
				actions={actions}
				renderCell={renderCell}
				onListSelect={onListSelect}
				executeCommand={executeCommand}
				{...this.props}
			/>
		);
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const SimpleHorizontalListControlC = withReducer("SimpleHorizontalListControl", mapDispatchToProps)(SimpleHorizontalListControl);
SimpleHorizontalListControlC["displayName"] = "SimpleHorizontalListControl";

WidgetsFactory.instance.registerFactory(SimpleHorizontalListControlC);
WidgetsFactory.instance.registerControls({
	simple_horizontal_list_control: "SimpleHorizontalListControl",
	'itsy:ui:horizontallist': "SimpleHorizontalListControl",
});
