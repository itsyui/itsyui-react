import { GridActions } from './actions';

const initialState = {
	currentPage: 1,
	typeId: "",
	gridSchemaId: null,
	uniquePropertyId: null,
	data: [],
	summaryData: {},
	selectedRows: [],
	pageInfo: {},
	viewAttributes: {}, // this is available via schema for view customization,
	customDataSource: {},
	renderCustomCell: {},
	filterText: "",
	gridSchema: null,
	rowSelectionMode: 2, // 0 means NONE,1 means single row select,2 means multi-select
	incrementalAdd: false, // if incrementalAdd true means appends records in data,
	editingRecords: [],
	canTriggerGridSelectedRows: true,
	loaded: false,
	pageContext: {}
};

function reducer(state, action) {
	switch (action.type) {
		case GridActions.DataAvailable:
			return {
				...state,
				typeId: action.typeId,
				data: action.data,
				gridSchemaId: action.gridSchemaId,
				pageInfo: action.pageInfo,
				uniquePropertyId: action.uniquePropertyId,
				viewAttributes: action.viewAttributes,
				selectedRows: [],
				customDataSource: action.customDataSource,
				renderCustomCell: action.renderCustomCell,
				gridSchema: action.gridSchema,
				incrementalAdd: action.incrementalAdd,
				sortingInfo: action.sortingInfo,
				loaded: true
			};
		case GridActions.UpdateField:
			return {
				...state,
				typeId: action.typeId,
				rowSelectionMode: parseInt(action.rowSelectionMode),
				canTriggerGridSelectedRows: action.canTriggerGridSelectedRows,
				viewAttributes: { ...state.viewAttributes, context: action.context },
				pageInfo: action.pageInfo,
				pageContext: action.pageContext
			};
		case GridActions.OnRowSelected:
			return {
				...state,
				selectedRows: action.selectedRows
			};
		case GridActions.PageChange:
			return {
				...state,
				currentPage: action.currentPage
			};
		case GridActions.SummaryUpdate:
			return {
				...state,
				summaryData: action.summaryData
			};
		case GridActions.SaveFilterText:
			return {
				...state,
				filterText: action.value
			};
		case GridActions.UpdateEditingRecord:
			return {
				...state,
				editingRecords: action.editingRecords,
			};
		case GridActions.UpdateContext:
			return {
				...state,
				viewAttributes: { ...state.viewAttributes, context: action.updatedContext }
			};
		default:
			return state === undefined ? initialState :
				Object.keys(state).length === 0 ? initialState : state;
	}
}

export default reducer;