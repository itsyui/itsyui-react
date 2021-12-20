/* eslint-disable */
import { getDefaultRegistry, retrieveSchema, SchemaContainer, WidgetsFactory, withReducer } from "@itsy-ui/core";
import * as React from "react";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory, { PaginationProvider, PaginationListStandalone } from "react-bootstrap-table2-paginator";
import { BsThreeDotsVertical, BsArrowDown, BsArrowUp, BsArrowDownUp } from "react-icons/bs";
import { DateTimeMode } from "../../utils/constants";
import { getDate, getlocaleText, isEnvContainsKey } from "../../utils/helper";
import CardViewLayout from "./CardView";
import ListViewLayout from "./ListView";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";


interface TenantListTableProps {
	columnData: any[];
	numSelected: number;
	onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
	rowCount: number;
	orderBy: string;
	order: string;
	onSortingClick: (event: any, name: string) => void;
}

const TableViewActions = (props: any) => {
	const { customAction, gridStyle } = props;
	if (customAction && Array.isArray(customAction) && customAction.length > 0) {
		const { handleMoreBtnClick, anchorEl, handleClose, currentFocusedRow, record, handleCustomButtonClick, id } = props;
		const primaryItem = customAction.find(t => t.isPrimary && t.enabled);
		const primaryAction = primaryItem && (primaryItem.iconPosition == "none" ? <Button color="secondary" variant="outline-primary" size="sm" className=""
			onClick={handleCustomButtonClick.bind(this, primaryItem, record)} tabIndex={0} aria-label={primaryItem.displayText}
		>
			{primaryItem.displayText}
		</Button >
			: <Button color="secondary" variant="outline-primary" size="sm" className="freshui-btn-control"
				onClick={handleCustomButtonClick.bind(this, primaryItem, record)} tabIndex={0} aria-label={primaryItem.displayText}
			>
				{primaryItem.iconPosition === "startIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
				{primaryItem.displayText}
				{primaryItem.iconPosition === "endIcon" && <i className="freshui-icons">{primaryItem.icon}</i>}
			</Button >);
		const nonPrimaryActions = customAction.filter(t => primaryItem ? (t.name !== primaryItem.name && t.enabled) : t.enabled);
		return (
			<span className="table-action">
				{primaryAction}
				{nonPrimaryActions && nonPrimaryActions.length > 0 &&
					<div className="customize-table-action " onClick={handleMoreBtnClick.bind(this, id)}>
						<Dropdown>
							<Dropdown.Toggle >
								<BsThreeDotsVertical />
							</Dropdown.Toggle>
							{anchorEl && currentFocusedRow === id &&
								<Dropdown.Menu show={Boolean(anchorEl)} className="super-colors">
									{
										nonPrimaryActions.map((t, i) => {
											return <Dropdown.Item key={`${id}-${i}`} data-id={id} onClick={handleCustomButtonClick.bind(this, t, record)}>{t.displayText}</Dropdown.Item>;
										})
									}
								</Dropdown.Menu>
							}
						</Dropdown>
					</div>
				}
			</span>);
	}
	return null;
};

const getShowMore = (handleShowMore, totalSize, data) => {
	const visibleShowMore = totalSize === data.length;
	if (!visibleShowMore) {
		return <ul className="pagination react-bootstrap-table-page-btns-ul">
			<li className="active page-item" title="show more record(s)">
				<a className="page-link" onClick={handleShowMore} tabIndex={0} aria-label={getlocaleText("{{grid.showmore}}")}>{getlocaleText("{{grid.showmore}}")}</a>
			</li>
		</ul>
	}
	return null;
}

const getPagination = (paginationProps, handleShowMore, totalSize, data, isIncrementalAdd) => {
	return <>
		{
			isIncrementalAdd ? getShowMore(handleShowMore, totalSize, data) : <PaginationListStandalone {...paginationProps} />
		}
	</>
}

const RenderTable = (props: any) => {
	const { data, columns, page, sizePerPage, onTableChange, totalSize, keyField
		, isIncrementalAdd, handleShowMore, onRowSelect, primaryColumn, rowSelectionMode, selectedRows, className, style } = props;
	const options: any = { custom: true, page, sizePerPage, totalSize };
	const rowEvents = {
		onClick: (e, row, rowIndex) => {
			const id = primaryColumn ? row[primaryColumn] : row[Object.keys(row)[0]];
			onRowSelect(e, id);
		},
	};
	const selectedIds = Array.isArray(selectedRows) ? selectedRows.map(rec => rec[keyField]) : [];
	const selectRow = {
		mode: rowSelectionMode === 2 ? "checkbox" : "radio",
		clickToSelect: true,
		hideSelectColumn: true,
		bgColor: "rgb(241 245 255)",
		selected: selectedIds,
	};
	const customClassName = className ? `root ${className}` : "root";
	const showPaging = totalSize > sizePerPage;
	return <div className={customClassName} style={style}>
		<PaginationProvider pagination={paginationFactory(options)} tabIndex={0}>
			{({ paginationProps, paginationTableProps }) => (
				<div className="TableWrapper">
					<BootstrapTable
						remote={true}
						keyField={keyField}
						data={data}
						columns={columns}
						bordered={false}
						onTableChange={onTableChange}
						rowEvents={rowEvents}
						selectRow={selectRow}
						rowClasses="reduceHeight"
						{...paginationTableProps}
					/>
					{showPaging && getPagination(paginationProps, handleShowMore, totalSize, data, isIncrementalAdd)}
				</div>
			)}
		</PaginationProvider>
	</div>;
};

class TableViewWidget extends React.Component {

	constructor() {
		super();
		this.state = {
			anchorEl: null,
			netxItem: 1,
			lastIcon: true,
		};
	}

	_getControlSchemaProperties() {
		const registry = getDefaultRegistry();
		const { definitions } = registry;
		const schema = retrieveSchema(this.props.schema, definitions);
		return schema;
	}

	renderCell(cell: string, row: any, rowIndex: number, formatExtraData: any) {
		const { col, idx, controlProps, tableProps } = formatExtraData;
		const { renderCustomCell, renderCustomCellFields, viewAttributes, getActions } = controlProps;
		const { gridStyle, primaryColumn } = viewAttributes;
		const primaryFieldId = primaryColumn ? primaryColumn : Object.keys(row)[0];
		const id = row[primaryFieldId];

		if (col.type === "datetime") {
			const displayType = col.fieldSchema && col.fieldSchema.displayType ? col.fieldSchema.displayType : DateTimeMode.DATE;
			const dateValue = getDate(row[col.name], displayType);
			return <span> {dateValue} </span>;
		} else if (col.type === "custom") {
			return renderCustomCell && renderCustomCell(col, row, idx, gridStyle);
		} else if (col.type === "widget") {
			return renderCustomCellFields && renderCustomCellFields(col, null, row);
		} else if (col.type === "customAction") {
			const rowActions = getActions(row);
			const { renderCustomAction } = tableProps;
			return renderCustomAction(rowActions, row, id, gridStyle, tableProps);
		} else if (col.type === "boolean") {
			const boolValue = row && row[col.name] !== undefined ? `${row[col.name]}` : `false`;    //if user didn't toggle switch & submit
			return <span>{`${boolValue}`}</span>;
		} else {
			const fieldSchema = col.fieldSchema ? col.fieldSchema : {};
			const { displayKey, fieldType, mappedTypeId } = fieldSchema;
			const typeData = row[mappedTypeId];
			let columnValue = "";
			if (typeData && fieldType === "mapped" && Array.isArray(displayKey)) {
				columnValue = displayKey.reduce((colValue, key) => {
					return Array.isArray(typeData) && typeData.length > 0 ? typeData[0][key] ? colValue === "" ? `${typeData[0][key]}` : `${colValue},${typeData[0][key]}` : colValue
						: typeData[key] ? colValue === "" ? `${typeData[key]}` : `${colValue}, ${typeData[key]}` : colValue;
				}, "");
			} else {
				columnValue = Array.isArray(row[col.name]) ? row[col.name].join(", ") : row[col.name];
			}
			return <span key={rowIndex} title={columnValue}>{columnValue}</span>;
		}
	}

	handleCustomButtonClick = (action: any, record: any, event: any) => {
		const { customButtonClick } = this._getControlSchemaProperties();
		this.setAnchorEl(null);
		customButtonClick(action, record);
		event.stopPropagation();
	}

	handleMoreBtnClick(id: string, event: any) {
		event.stopPropagation();
		const { viewAttributes } = this._getControlSchemaProperties();
		const actions = viewAttributes.customAction && Array.isArray(viewAttributes.customAction.actions) && viewAttributes.customAction.actions.length > 0 ? viewAttributes.customAction.actions : [];
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

	renderCustomAction(customAction: any, record: any, id: string, gridStyle: string, tableProps: any) {
		const { handleCustomButtonClick, handleMoreBtnClick, handleClose, setAnchorEl, anchorEl, currentFocusedRow } = tableProps;
		return <TableViewActions
			id={id}
			gridStyle={gridStyle}
			customAction={customAction}
			record={record}
			handleCustomButtonClick={handleCustomButtonClick}
			handleMoreBtnClick={handleMoreBtnClick}
			handleClose={handleClose}
			setAnchorEl={setAnchorEl}
			anchorEl={anchorEl}
			currentFocusedRow={currentFocusedRow}
		/>;
	}

	handleSelectAllClick(event: React.ChangeEvent<HTMLInputElement>) {
		const { data, onGridSelectedRows } = this._getControlSchemaProperties();
		if (event.target.checked) {
			onGridSelectedRows(data.records);
			return;
		}
		onGridSelectedRows([]);
	}

	onRowSelect = (event: React.MouseEvent<unknown>, id: string) => {
		const { onGridSelectedRows, selectedRows, data, rowSelectionMode, viewAttributes } = this._getControlSchemaProperties();
		const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(data.records[0])[0];
		const selectedRecord = data.records.filter(rec => rec[primaryFieldId] === id);
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

	isSelected = (id) => {
		const { selectedRows, viewAttributes, data } = this._getControlSchemaProperties();
		const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(data.records[0])[0];
		const selectedObj = selectedRows.find(row => row[primaryFieldId] === id);
		return selectedObj !== undefined;
	}

	handleShowMore = (event: unknown) => {
		const { paginationChange, currentPage, pageInfo } = this._getControlSchemaProperties();
		if (pageInfo.totalPage > currentPage) { paginationChange(currentPage + 1, true); }
	}

	onSortCaret = (order, column) => {
		if (!order) {
			return <BsArrowDownUp className="sort-caret" />;
		} else if (order === "asc") {
			return <BsArrowDown className="sort-caret" />;
		} else if (order === "desc") {
			return <BsArrowUp className="sort-caret" />;
		}
		return null;
	}

	getTransformedColumns = (data: any, controlProps: any, tableProps: any, viewAttributes: any) => {
		const { allowSort, sortColumns } = viewAttributes;
		return data && Array.isArray(data.columns) ? [].concat.apply([], data.columns.filter((col, index) => {
			col.dataField = col.name;
			col.text = col.label;
			col.formatter = this.renderCell;
			col.formatExtraData = { col, idx: index, controlProps, tableProps };
			this.getColumnSortDetails(allowSort, sortColumns, col);
			return !col.isHidden;
		})) : [];
	}

	getColumnSortDetails = (allowSort: boolean, sortColumns: any[], col: any) => {
		if (allowSort && col) {
			if (!Array.isArray(sortColumns) || sortColumns.length === 0 || sortColumns.find(c => c === col.name)) {
				col.sort = true;
				col.onSort = (field, order) => {
					this.onSortingClick(field);
				};
				col.sortFunc = (a, b, order, dataField, rowA, rowB) => {
					return null;
				};
				col.sortCaret = this.onSortCaret;
			}
		}
	}

	getTableProps = () => {
		const { anchorEl, currentFocusedRow } = this.state;
		return {
			handleCustomButtonClick: this.handleCustomButtonClick.bind(this),
			handleMoreBtnClick: this.handleMoreBtnClick.bind(this),
			handleClose: this.handleClose.bind(this),
			setAnchorEl: this.setAnchorEl.bind(this),
			renderCustomAction: this.renderCustomAction.bind(this),
			anchorEl,
			currentFocusedRow,
		};
	}

	getColumns(data: any) {
		const controlProps = this._getControlSchemaProperties();
		const { viewAttributes } = controlProps;
		const tableProps = this.getTableProps();
		const transformedColumns = this.getTransformedColumns(data, controlProps, tableProps, viewAttributes);
		if (viewAttributes && viewAttributes.customAction && viewAttributes.customAction.actions.length > 0) {
			const customAction = viewAttributes.customAction;
			const col = {
				dataField: "action",
				text: "",
				type: "customAction",
			};
			transformedColumns.push({
				...col,
				formatter: this.renderCell,
				formatExtraData: { col, controlProps, tableProps },
			});
		}
		return transformedColumns;
	}

	getKeyFieldName(data, viewAttributes) {
		const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(data.records[0])[0];
		return primaryFieldId;
	}

	handleTableChange(type: string, { page, sizePerPage }) {
		if (type === "pagination") {
			const { paginationChange } = this._getControlSchemaProperties();;
			paginationChange(page);
		}
	}

	onSortingClick(name: string) {
		const { sortingChange, sortingInfo } = this._getControlSchemaProperties();
		const updateSortingInfo = sortingInfo ? { ...sortingInfo } : {};
		if (updateSortingInfo.orderBy === name) {
			updateSortingInfo.order = updateSortingInfo.order === "asc" ? "desc" : "asc";
		} else {
			updateSortingInfo.orderBy = name;
			updateSortingInfo.order = "asc";
		}
		updateSortingInfo.orderBy && sortingChange(updateSortingInfo);
	}

	render() {
		const controlProps = this._getControlSchemaProperties();
		const { data, selectedRows, viewAttributes, currentPage, pageInfo, onGridSelectedRows, customButtonClick, paginationChange, rowSelectionMode, className, style } = controlProps;
		const { viewType, customGridViewId, emptyRecordsMessage, attributes, primaryColumn } = viewAttributes;
		const rowSelection = {
			selectedRowKeys: selectedRows && selectedRows.length > 0 ? selectedRows.map(t => data.records.indexOf(t)) : [],
			onChange: this.onRowSelect.bind(this),
		};
		const columns = this.getColumns(data);
		const isIncrementalAdd = attributes && attributes.incrementalAdd !== undefined ? attributes.incrementalAdd : false;
		if (!isEnvContainsKey("tablet") && (viewType === "table" || viewType === undefined)) {
			if (!data || (Array.isArray(columns) && columns.length === 0) || !Array.isArray(data.records) || data.records.length === 0) {
				return <span className="no-data-text">{emptyRecordsMessage ? emptyRecordsMessage : getlocaleText("{{grid.noRecords}}")}</span>;
			}
			const keyField = this.getKeyFieldName(data, viewAttributes);
			return <RenderTable
				data={data.records}
				columns={columns}
				page={currentPage}
				sizePerPage={pageInfo.maxItems}
				onTableChange={this.handleTableChange.bind(this)}
				totalSize={pageInfo.totalRecordsCount}
				keyField={keyField}
				isIncrementalAdd={isIncrementalAdd}
				handleShowMore={this.handleShowMore}
				onRowSelect={this.onRowSelect}
				rowSelectionMode={rowSelectionMode}
				selectedRows={selectedRows}
				primaryColumn={primaryColumn}
				className={className}
				style={style}
			/>;
		} else if (viewType === "card") {
			if (!data || (Array.isArray(columns) && columns.length === 0) || !Array.isArray(data.records) || data.records.length === 0) {
				return <span className="no-data-text">{emptyRecordsMessage ? emptyRecordsMessage : getlocaleText("{{grid.noRecords}}")}</span>;
			}
			return (
				<CardViewLayout columns={columns}
					rows={data.records}
					rowSelection={rowSelection}
					viewType={viewType}
					viewAttributes={viewAttributes}
					selectedRows={selectedRows}
					customButtonClick={customButtonClick}
					onGridSelectedRows={onGridSelectedRows}
					paginationChange={paginationChange}
					currentPage={currentPage}
					pageInfo={pageInfo}
					schema={this.props.schema}
					className={className}
					style={style}
					{...this.props}
				/>
			);
		} else if (viewType === "custom" && customGridViewId) {
			const customViewControlSchema = {
				name: viewType,
				properties: {
					...this.props,
					...controlProps,
					"ui:widget": customGridViewId,
					viewType,
				},
			};
			return <SchemaContainer schema={customViewControlSchema} />;
		} else {
			if (!data || (Array.isArray(columns) && columns.length === 0) || !Array.isArray(data.records) || data.records.length === 0) {
				return <span className="no-data-text">{emptyRecordsMessage ? emptyRecordsMessage : getlocaleText("{{grid.noRecords}}")}</span>;
			}
			return (
				<ListViewLayout columns={columns}
					rows={data.records}
					rowSelection={rowSelection}
					viewType={viewType}
					viewAttributes={viewAttributes}
					selectedRows={selectedRows}
					customButtonClick={customButtonClick}
					onGridSelectedRows={onGridSelectedRows}
					paginationChange={paginationChange}
					currentPage={currentPage}
					pageInfo={pageInfo}
					schema={this.props.schema}
					className={className}
					style={style}
					{...this.props}
				/>
			);
		}
	}
}

const mapDispatchToProps = (dispatch) => {
	return {};
};

const TableViewWidgetC = withReducer("TableViewWidget", mapDispatchToProps)(TableViewWidget);
TableViewWidgetC["displayName"] = "TableViewWidget";

// register the control in WidgetsFactory
WidgetsFactory.instance.registerFactory(TableViewWidgetC);
WidgetsFactory.instance.registerControls({
	grid_control: "TableViewWidget",
	'itsy:ui:grid': "TableViewWidget",
});
