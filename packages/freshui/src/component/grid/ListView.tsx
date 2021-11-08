import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer } from "@itsy-ui/core";
import * as React from "react";
import Image from 'react-bootstrap/Image';
import { DateTimeMode } from "../../utils/constants";
import { getDate, getlocaleText } from "../../utils/helper";
import { IListValue, ISimpleHorizontalListWidgetProps } from "./List/listTypes";
import "./List/SimpleHorizontalList";
import GridPagination from "./GridPagination";

interface IListViewLayoutProps {
	columns: any[];
	rows: any[];
	rowSelection: any;
	viewType: any;
	viewAttributes: any;
	selectedRows: any[];
	customButtonClick: any;
	onGridSelectedRows: any;
	paginationChange: any;
	currentPage: any;
	pageInfo: any;
	className: string,
	style: any
}
type ListViewUIControlProps = IWidgetControlProps & IListViewLayoutProps;

function onRowSelect(event: any, id: string, props: any) {
	const { selectedRows, rows, onGridSelectedRows, rowSelectionMode, viewAttributes } = props;
	const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(rows[0])[0];
	const selectedRecord = rows.filter(rec => rec[primaryFieldId] === id);
	let newSelected: string[] = [];
	if (rowSelectionMode === 2) {
		const isAlreadySelected = selectedRows.find(rec => rec[primaryFieldId] === id);
		if (!isAlreadySelected) {
			newSelected = newSelected.concat(selectedRows, selectedRecord);
		} else {
			if (selectedRows.length === 1) {
				newSelected = newSelected.concat(selectedRows.slice(1));
			} else {
				const index = selectedRows.findIndex(rec => rec[primaryFieldId] === id);
				newSelected = newSelected.concat(selectedRows.slice(0, index), selectedRows.slice(index + 1));
			}
		}
		onGridSelectedRows(newSelected);
	} else if (rowSelectionMode === 1) {
		onGridSelectedRows(selectedRecord);
	}
}

function renderCell(column: any, row: any, listAttr: string, listProps: any, classes: any, props: any, primaryValue?: any) {
	// const { renderCustomCellFields } = this.props;
	if (column.type === "image" || listAttr === "avatar") {
		const avatarImageSrc = Array.isArray(row[column.name]) && row[column.name].length > 0 ? row[column.name][0] : row[column.name];
		return (
			listProps.viewAttributes["isTextAvatar"] === undefined && !listProps.viewAttributes["isTextAvatar"] && avatarImageSrc ? <div className="list-image-div">
				<Image
					className="list-image"
					src={avatarImageSrc}
				/>
			</div> : listProps.viewAttributes["isTextAvatar"] !== undefined && listProps.viewAttributes["isTextAvatar"] ? <div className="text-avatar-icon" >
				{avatarImageSrc && typeof (avatarImageSrc) === "string" ? avatarImageSrc.substr(0, 2) : ""}
			</div> : ""

		);
	} else if (column.type === DateTimeMode.DATE_TIME) {
		const displayType = column.fieldSchema && column.fieldSchema.displayType ? column.fieldSchema.displayType : DateTimeMode.DATE;
		const dateValue = getDate(row[column.name], displayType);
		return (
			<div className={"model-" + listAttr}>{dateValue}</div>
		);
	} else if (column.type === "widget") {
		// return renderCustomCellFields && renderCustomCellFields(column, null, row);
	} else if (column.type === "boolean") {
		const boolValue = row && row[column.name] !== undefined ? `${row[column.name]}` : `false`;    //if user didn't toggle switch & submit
		return <span>{`${boolValue}`}</span>;
	} else {
		const fieldSchema = column.fieldSchema ? column.fieldSchema : {};
		const { displayKey, fieldType, mappedTypeId } = fieldSchema;
		const typeData = row[mappedTypeId];
		let columnValue = "";
		if (typeData && fieldType === "mapped" && Array.isArray(displayKey)) {
			columnValue = displayKey.reduce((colValue, key) => {
				return Array.isArray(typeData) && typeData.length > 0 ? typeData[0][key] ? colValue === "" ? `${typeData[0][key]}` : `${colValue},${typeData[0][key]}` : colValue
					: typeData[key] ? colValue === "" ? `${typeData[key]}` : `${colValue}, ${typeData[key]}` : colValue
			}, "");
		} else {
			columnValue = Array.isArray(row[column.name]) ? row[column.name].join(", ") : row[column.name];
		}
		return <div className={`model-${listAttr}`} >
			{columnValue}
		</div>;
	}
}

function getColumn(columnName: string, columns: any) {
	if (columns && columns.length > 0 && columnName) {
		const filteredColumns = columns.filter(col => col.name === columnName);
		return filteredColumns && filteredColumns.length > 0 ? filteredColumns[0] : null;
	}
	return null;
}

function getValue(row: any, columns: any, columnName: string) {
	const column = getColumn(columnName, columns);
	if (column && row) {
		return {
			"column": column,
			"value": row[column.name],
		};
	}
	return null;
}

function executeCommand(action: any, id: string, props: any, event: any) {
	const { rows, commandExecute, viewAttributes } = props;
	const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(rows[0])[0];
	const selectedRecord = rows.find(rec => rec[primaryFieldId] === id);
	commandExecute(action, selectedRecord, event);
}

function getShowMore(handleScroll, pageInfo, rows) {
	const visibleShowMore = pageInfo.totalRecordsCount === rows.length;
	if (!visibleShowMore) {
		return < ul className="pagination react-bootstrap-table-page-btns-ul">
			<li className="active page-item" title="show more record(s)">
				<a className="page-link" onClick={handleScroll}>{getlocaleText("{{grid.showmore}}")}</a>
			</li>
		</ul>
	}
	return null;
}

function getPagination(paginationChange, pageInfo, currentPage, page, handleScroll, rows, isIncrementalAdd) {
	return <>
		{isIncrementalAdd ? getShowMore(handleScroll, pageInfo, rows) :
			< GridPagination
				paginationChange={paginationChange}
				pageInfo={pageInfo}
				currentPage={currentPage}
				page={page}
			/>
		}
	</>
}

const ListView = props => {
	const { rows, columns, viewAttributes, currentPage, pageInfo, paginationChange, handleScroll } = props;
	const { getActions } = props.schema;
	const actions = viewAttributes.customAction && viewAttributes.customAction.actions !== undefined && viewAttributes.customAction.actions.length > 0 ? viewAttributes.customAction.actions : [];
	const listAttributes = viewAttributes && viewAttributes.attributes && Object.keys(viewAttributes.attributes).length > 0 ? viewAttributes.attributes : {
		"primary": columns && columns.length > 0 ? columns[0].name : null,
		"secondary": columns && columns.length > 1 ? columns[1].name : null,
		"tertiary": columns && columns.length > 2 ? columns[2].name : null,
	};
	const page = currentPage - 1;
	const listType = viewAttributes && viewAttributes.listType ? viewAttributes.listType : listAttributes.listType;
	const gridStyle = viewAttributes.gridStyle;
	const isIncrementalAdd = viewAttributes && viewAttributes.attributes && viewAttributes.attributes.incrementalAdd !== undefined ? viewAttributes.attributes.incrementalAdd : false;
	const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(rows[0])[0];
	const customClassName = props.className ? `model-list ${props.className}` : "model-list";
	const customStyle = props.style ? props.style : {};
	const showPaging = pageInfo.totalRecordsCount > pageInfo.maxItems;
	return (
		<div className={customClassName} style={customStyle}>
			{
				rows.map((row, index) => {
					const id = row[primaryFieldId];
					const primaryValue = getValue(row, columns, listAttributes.primary ? listAttributes.primary : columns[0].name);
					const secondaryValue = getValue(row, columns, listAttributes.secondary ? listAttributes.secondary : columns[1].name);
					const tertiaryValue = getValue(row, columns, listAttributes.tertiary ? listAttributes.tertiary : columns.length > 2 ? columns[2].name : null);
					const avatarValue = getValue(row, columns, listAttributes.avatar);
					const actions = getActions(row);
					const listUIControlSchema = getListUIControlSchema(index, listType, id, props, row, primaryValue, secondaryValue, tertiaryValue, avatarValue, actions, listAttributes.additionalColumns, gridStyle);
					return <SchemaContainer key={index} schema={listUIControlSchema} />;
				})
			}
			{showPaging &&
				getPagination(paginationChange, pageInfo, currentPage, page, handleScroll, rows, isIncrementalAdd)}
		</div >
	);
};

// tslint:disable-next-line: max-line-length
const getListUIControlSchema = (index: any, listType: string, id: string, props: any, row: any, primaryValue: IListValue, secondaryValue: IListValue, tertiaryValue: IListValue, avatarValue?: IListValue, actions?: any[], additionalColumns?: any[], gridStyle: string) => {
	let listUIControlSchema;
	const simpleHorizontalListControlProps: ISimpleHorizontalListWidgetProps = {
		listId: id,
		listViewProps: { ...props },
		row: row,
		gridStyle,
		primaryValue: primaryValue,
		secondaryValue: secondaryValue,
		tertiaryValue: tertiaryValue,
		avatarValue: avatarValue,
		actions: actions,
		index: index,
		onListSelect: onRowSelect,
		renderCell: renderCell,
		executeCommand: executeCommand,
	};
	listUIControlSchema = {
		name: listType,
		properties: {
			"ui:widget": "simple_horizontal_list_control",
			"listType": listType,
			...simpleHorizontalListControlProps,
		},
	};
	return listUIControlSchema;
};

class ListViewLayout extends React.Component<ListViewUIControlProps, {}> {

	constructor() {
		super();
		this.state = {
			anchorEl: null,
		};
	}

	_getControlSchemaProperties = (props) => {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(props.schema, definitions);
		return schema;
	}

	commandExecute(action: any, rows: any, evt: any) {
		const { customButtonClick } = this.props;
		this.setAnchorEl(null);
		customButtonClick(action, rows);
		evt.stopPropagation();
	}

	handleMoreBtnClick(id: string, event: any) {
		event.stopPropagation();
		const { viewAttributes } = this.props;
		const actions = viewAttributes.customAction && viewAttributes.customAction.actions !== undefined && viewAttributes.customAction.actions.length > 0 ? viewAttributes.customAction.actions : [];
		if (actions && actions.length > 0) {
			this.setAnchorEl(event.currentTarget, id);
		}
	}

	handleClose(event: any) {
		event.stopPropagation();
		event.preventDefault();
		this.setState({
			anchorEl: null,
		});
	}

	setAnchorEl(el: any, id: string) {
		this.setState({
			anchorEl: el,
			currentFocusedRow: id,
		});
	}

	handleScroll = (event: unknown) => {
		const { paginationChange, currentPage, pageInfo } = this._getControlSchemaProperties(this.props);
		if (pageInfo.totalPage > currentPage) { paginationChange(currentPage + 1, true); }
	}

	render() {
		const { viewAttributes, renderCustomCell, renderCustomCellFields, rowSelectionMode, gridStyle, className, style } = this._getControlSchemaProperties(this.props);
		return (
			<ListView
				viewAttributes={viewAttributes}
				renderCustomCell={renderCustomCell}
				rowSelectionMode={rowSelectionMode}
				renderCustomCellFields={renderCustomCellFields}
				commandExecute={this.commandExecute.bind(this)}
				handleMoreBtnClick={this.handleMoreBtnClick.bind(this)}
				handleClose={this.handleClose.bind(this)}
				anchorEl={this.state.anchorEl}
				setAnchorEl={this.setAnchorEl.bind(this)}
				currentFocusedRow={this.state.currentFocusedRow}
				handleScroll={this.handleScroll.bind(this)}
				{...this.props}
				className={className}
				style={style}
			/>
		);
	}
}

export default ListViewLayout;
