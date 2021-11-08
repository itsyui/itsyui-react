import { getDefaultRegistry, IWidgetControlProps, retrieveSchema, SchemaContainer } from "@itsy-ui/core";
import * as React from "react";
import { Col, Row } from "react-bootstrap";
import { DateTimeMode } from "../../utils/constants";
import { getDate, getlocaleText } from "../../utils/helper";
import Pagination from 'react-bootstrap/Pagination';
import "./Cards/AvatarCard";
import { IAvatarCardWidgetProps, ICardTypes, ICardValue, IComplexInteractionCardWidgetProps, IHorizontalCardWidgetProps, IMediaCardWidgetProps, ISimpleCardWidgetProps } from "./Cards/cardTypes";
import GridPagination from "./GridPagination";
// import "./Cards/SimpleCard";
import "./Cards/MediaCard";
// import "./Cards/HorizontalCard";
// import "./Cards/ComplexInteractionCard";

interface ICardViewLayoutProps {
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
}

type CardViewUIControlProps = IWidgetControlProps & ICardViewLayoutProps;


function renderCell(col: any, cellValue: any, idx: any, props: any) {
	const { renderCustomCell, renderCustomCellFields } = props;
	if (col.type === "datetime") {
		const displayType = col.fieldSchema && col.fieldSchema.displayType ? col.fieldSchema.displayType : DateTimeMode.DATE;
		const dateValue = getDate(cellValue, displayType);
		return <span> {dateValue} </span>;
	} else if (col.type === "custom") {
		return renderCustomCell && renderCustomCell(col, cellValue, idx);
	} else if (col.type === "widget") {
		return renderCustomCellFields && renderCustomCellFields(col, cellValue, idx);
	} else if (col.type === "image") {
		return null;
	} else if (col.type === "boolean") {
		const boolValue = cellValue && cellValue[col.name] !== undefined ? `${cellValue[col.name]}` : `false`;    //if user didn't toggle switch & submit
		return <span>{`${boolValue}`}</span>;
	} else {
		return <span title={cellValue}>{cellValue}</span>;
	}
}

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
		const columnValue = { column: column, value: "" };
		const fieldSchema = column.fieldSchema ? column.fieldSchema : {};
		const { displayKey, fieldType, mappedTypeId } = fieldSchema;
		const typeData = row[mappedTypeId];
		if (typeData && fieldType === "mapped" && Array.isArray(displayKey)) {
			columnValue.value = displayKey.reduce((colValue, key) => {
				return Array.isArray(typeData) && typeData.length > 0 ? typeData[0][key] ? colValue === "" ? `${typeData[0][key]}` : `${colValue},${typeData[0][key]}` : colValue
					: typeData[key] ? colValue === "" ? `${typeData[key]}` : `${colValue}, ${typeData[key]}` : colValue
			}, "");
		} else {
			columnValue.value = Array.isArray(row[column.name]) ? row[column.name].join(", ") : row[column.name];
		}
		return columnValue;
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
		return <ul className="pagination react-bootstrap-table-page-btns-ul">
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

const CardView = props => {
	const { rows, columns, currentPage, viewAttributes, pageInfo, paginationChange, handleScroll } = props;
	const { getActions } = props.schema;
	const cardAttributes = viewAttributes && viewAttributes.attributes && Object.keys(viewAttributes.attributes).length > 0 ? viewAttributes.attributes : {
		"primary": columns && columns.length > 0 ? columns[0].name : null,
		"secondary": columns && columns.length > 1 ? columns[1].name : null,
		"tertiary": columns && columns.length > 2 ? columns[2].name : null,
	};
	const page = currentPage - 1;
	const cardType = viewAttributes && viewAttributes.cardType ? viewAttributes.cardType : cardAttributes.cardType;
	const gridItemLg = cardType === ICardTypes.horizontal ? 4 : 3;
	const isIncrementalAdd = viewAttributes && viewAttributes.attributes && viewAttributes.attributes.incrementalAdd !== undefined ? viewAttributes.attributes.incrementalAdd : false;
	const primaryFieldId = viewAttributes && viewAttributes.primaryColumn ? viewAttributes.primaryColumn : Object.keys(rows[0])[0];
	const customClassName = props.className ? `card-view ${props.className}` : "card-view";
	const customStyle = props.style ? props.style : {};
	const showPaging = pageInfo.totalRecordsCount > pageInfo.maxItems;
	return (<>
		<Row className={customClassName} style={customStyle}>
			{
				rows.map((row, i) => {
					const id = row[primaryFieldId];
					const primaryValue = getValue(row, columns, cardAttributes.primary);
					const secondaryValue = getValue(row, columns, cardAttributes.secondary);
					const tertiaryValue = getValue(row, columns, cardAttributes.tertiary);
					const avatarSrc = getValue(row, columns, cardAttributes.avatar);
					const mediaSrc = getValue(row, columns, cardAttributes.media);
					const actions = getActions(row);
					const cardUIControlSchema = getCardUIControlSchema(cardType, id, props, avatarSrc, primaryValue, secondaryValue, tertiaryValue, actions, mediaSrc, row);
					return (
						<Col className="freshui-card-container" xs={12} md={6} lg={gridItemLg} xl={3} key={"grid_item_" + i}>
							<SchemaContainer schema={cardUIControlSchema} />
						</Col>
					);
				})
			}
		</Row >
		{showPaging &&
			getPagination(paginationChange, pageInfo, currentPage, page, handleScroll, rows, isIncrementalAdd)}
	</>
	);
};

const getCardUIControlSchema = (cardType: string, id: string, props: any, avatarSrc: any, primaryValue: ICardValue, secondaryValue: ICardValue, tertiaryValue: ICardValue, actions: any, mediaSrc: any, row: any) => {
	let cardUIControlSchema;
	if (cardType === ICardTypes.media) {
		const mediaCardControlProps: IMediaCardWidgetProps = {
			cardId: id,
			cardViewProps: { ...props },
			mediaSrc: mediaSrc && mediaSrc.value,
			primaryValue: primaryValue,
			secondaryValue: secondaryValue,
			tertiaryValue: tertiaryValue,
			actions: actions,
			onCardSelect: onRowSelect,
			renderCell: renderCell,
			executeCommand: executeCommand,
		};
		cardUIControlSchema = {
			name: `${cardType}_${id}`,
			properties: {
				"ui:widget": "media_card_control",
				"cardType": cardType,
				...mediaCardControlProps,
			},
		};
	} else if (cardType === ICardTypes.dynamic) {
		const { schema, pageContext } = props;
		const { viewAttributes } = schema;
		const { typeId, schemaId } = viewAttributes;
		cardUIControlSchema = {
			name: `${cardType}_${id}`,
			properties: {
				"ui:widget": "itsy:dynamiccard",
				"fieldSchema": {
					"typeId": typeId,
					"schemaId": schemaId,
					"record": row,
					...schema
				},
				pageContext,
			},
		};
	} else {
		const avatarCardControlProps: IAvatarCardWidgetProps = {
			cardId: id,
			cardViewProps: { ...props },
			avatarSrc: avatarSrc && avatarSrc.value,
			primaryValue: primaryValue,
			secondaryValue: secondaryValue,
			tertiaryValue: tertiaryValue,
			actions: actions,
			onCardSelect: onRowSelect,
			renderCell: renderCell,
			executeCommand: executeCommand,
		};
		cardUIControlSchema = {
			name: `${cardType}_${id}`,
			properties: {
				"ui:widget": "avatar_card_control",
				"cardType": cardType,
				...avatarCardControlProps,
			},
		};
	}
	return cardUIControlSchema;
};

class CardViewLayout extends React.Component<CardViewUIControlProps, {}> {

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
		const { viewAttributes, renderCustomCell, renderCustomCellFields, rowSelectionMode, className, style, pageContext } = this._getControlSchemaProperties(this.props);
		return (
			<CardView
				viewAttributes={viewAttributes}
				renderCustomCell={renderCustomCell}
				renderCustomCellFields={renderCustomCellFields}
				rowSelectionMode={rowSelectionMode}
				commandExecute={this.commandExecute.bind(this)}
				handleMoreBtnClick={this.handleMoreBtnClick.bind(this)}
				handleClose={this.handleClose.bind(this)}
				anchorEl={this.state.anchorEl} setAnchorEl={this.setAnchorEl.bind(this)}
				currentFocusedRow={this.state.currentFocusedRow}
				handleScroll={this.handleScroll.bind(this)}
				{...this.props}
				className={className}
				style={style}
				pageContext={pageContext}
			/>
		);
	}
}

export default CardViewLayout;
