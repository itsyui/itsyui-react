import { getLocaleString, objectEntries, WidgetsFactory } from "@itsy-ui/core";
import {
  DataLoaderFactory,
  ICommandManager,
  IDataSourceLake,
  ISchemaLoader,
} from "@itsy-ui/core";
import { IGridCellValue, IGridDataRecord } from "../data";

export const GridActions = {
  State: {
    GRID_REFRESH: "GRID_REFRESH",
    GRID_BEFORE_SELECTED_ROWS: "GRID_BEFORE_SELECTED_ROWS",
    GRID_SELECTED_ROWS: "GRID_SELECTED_ROWS",
    GRID_SELECTED_ROWS_DONE: "GRID_SELECTED_ROWS_DONE",
    GRID_COMMANDEXECUTE: "GRID_COMMANDEXECUTE",
    GRID_DONE: "GRID_DONE",
    GRID_INIT: "GRID_INIT",
    GRID_LOAD: "GRID_LOAD",
    GRID_LOAD_DONE: "GRID_LOAD_DONE",
    GRID_INIT_ROW_SUMMARY: "GRID_INIT_ROW_SUMMARY",
    GRID_BEFORE_EDIT: "GRID_BEFORE_EDIT",
    GRID_EDIT: "GRID_EDIT",
    GRID_EDIT_LOADED: "GRID_EDIT_LOADED",
    GRID_END_EDIT: "GRID_END_EDIT",
    GRID_AFTER_END_EDIT: "GRID_AFTER_END_EDIT",
    GRID_CANCEL_EDIT: "GRID_CANCEL_EDIT",
    Indicator: {
      SHOW_INDICATOR: "SHOW_INDICATOR",
      HIDE_INDICATOR: "HIDE_INDICATOR",
      UPDATE_INDICATOR: "UPDATE_INDICATOR",
    },
  },
  Loader: "GridWidget",
  DataAvailable: "GridActions.DataAvailable",
  OnRowSelected: "GridActions.OnRowSelected",
  PageChange: "GridActions.PageChange",
  ViewChange: "GridActions.ViewChange",
  SummaryUpdate: "GridActions.SummaryUpdate",
  SaveFilterText: "GridActions.SaveFilterText",
  UpdateField: "GridActions.UpdateField",
  UpdateEditingRecord: "GridActions.UpdateEditingRecord",
  UpdateContext: "GridActions.UpdateContext",
};

const defaultHiddenColumns = ["cmis:objectId"];

export function doGridInit(event: any) {
  return async (_, _dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.GRID_LOAD,
      typeId: event.typeId,
      gridSchemaId: event.gridSchemaId,
      gridSchema: event.gridSchema,
      customDatasource: event.customDatasource,
      filterText: event.filterText,
      selectedRecords: event.selectedRecords,
      rowSelectionMode: event.rowSelectionMode,
      canTriggerGridSelectedRows: event.canTriggerGridSelectedRows,
      context: event.context,
      maxItems: event.maxItems,
      pageContext: event.pageContext,
    });
  };
}

export function doGridLoad(event: any) {
  return async (_, dispatch: any, transition: any) => {
    const filterText = event.filterText !== undefined ? event.filterText : null;
    const gridSchema = event.gridSchema !== undefined ? event.gridSchema : null;
    dispatch({
      type: GridActions.UpdateField,
      typeId: event.typeId,
      rowSelectionMode:
        event.rowSelectionMode === undefined || event.rowSelectionMode === null
          ? 1
          : event.rowSelectionMode,
      canTriggerGridSelectedRows:
        event.canTriggerGridSelectedRows === undefined ||
        event.canTriggerGridSelectedRows === null
          ? true
          : event.canTriggerGridSelectedRows,
      context: event.context ? event.context : {},
      pageInfo: event.maxItems
        ? { maxItems: event.maxItems }
        : { maxItems: 10 },
      pageContext: event.pageContext ? event.pageContext : {},
    });
    if (event.typeId) {
      dispatch(
        onFetchDataServer(
          event.typeId,
          event.gridSchemaId,
          event.customDatasource,
          event.renderCustomCell,
          filterText,
          gridSchema,
          event.selectedRecords
        )
      );
    } else {
      transition({
        type: GridActions.State.GRID_LOAD_DONE,
        event: event,
      });
    }
  };
}

export function doGridLoadDone(event: any) {
  return async (_, _dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.GRID_DONE,
      event: event,
    });
  };
}

function getRow(
  row: any,
  columns: any,
  type: string
): IGridDataRecord | IGridCellValue {
  const data: any | IGridCellValue = {};
  objectEntries(row).forEach((key) => {
    const findColumnType = columns.find(
      (t) => t.name === key[0] && t.type === "widget"
    ); // Find type === widget
    if (!key[0].includes("relation")) {
      data[key[0]] = key[1];
    }
    switch (type) {
      case "object": // type === object convert value into IGridCellValue
        if (findColumnType) {
          data[key[0]] = { value: key[1], isReadonly: false };
        }
        break;
      case "string": //type === string IGridCellValue convert into value
        if (findColumnType && typeof key[1] === "object") {
          data[key[0]] = key[1].value;
        }
        break;
    }
  });
  return data;
}

export function onFetchDataServer(
  typeId: string,
  gridSchemaId?: string,
  customDatasource?: IDataSourceLake,
  renderCustomCell?: any,
  filterValue?: any,
  gridSchema?: {},
  selectedRecords?: any,
  incrementalAdd?: boolean,
  searchValue: any = null,
  isRefresh = false,
  sortingInfo: any = null
): any {
  const dataLoader = WidgetsFactory.instance.services[
    "DataLoaderFactory"
  ] as DataLoaderFactory;
  return async (getState, dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.Indicator.SHOW_INDICATOR,
      loadingMessage: "{{grid.Loadingdata}}",
    });
    const datasource =
      customDatasource !== undefined && customDatasource !== null
        ? customDatasource
        : dataLoader.getLoader<IDataSourceLake>("datasource");
    const schemaLoaderFactory = WidgetsFactory.instance.services[
      "DataLoaderFactory"
    ] as DataLoaderFactory;
    const schemaLoader = schemaLoaderFactory.getLoader<ISchemaLoader>(
      GridActions.Loader
    );
    const state = getState();
    let typeData;
    if (gridSchema) {
      typeData = gridSchema;
    } else if (state.gridSchema) {
      typeData = state.gridSchema;
    } else {
      typeData = await schemaLoader.getControlSchema({
        typeId: typeId,
        gridSchemaId: gridSchemaId,
      });
    }
    try {
      const parameters = typeData.viewAttributes
        ? Object.assign({}, typeData.viewAttributes)
        : {};
      const pageInfo: any = state.pageInfo;
      const pageInfoParams = {
        maxItems: pageInfo.maxItems,
        skipCount: pageInfo.maxItems * (state.currentPage - 1),
      };

      if (incrementalAdd && isRefresh) {
        pageInfoParams.maxItems = pageInfo.maxItems * state.currentPage;
        pageInfoParams.skipCount = 0;
      }

      if (
        state.viewAttributes &&
        state.viewAttributes.hasOwnProperty("context")
      ) {
        parameters["context"] = state.viewAttributes["context"];
      }

      //Computing default filter
      parameters.defaultFilter =
        parameters.defaultFilter &&
        Object.keys(parameters.defaultFilter).length > 0
          ? parameters.defaultFilter
          : {};

      if (
        state.viewAttributes &&
        state.viewAttributes.defaultFilter &&
        Object.keys(state.viewAttributes.defaultFilter).length > 0
      ) {
        parameters.defaultFilter = {
          ...parameters.defaultFilter,
          ...state.viewAttributes.defaultFilter,
        };
      }

      if (filterValue && Object.keys(filterValue).length > 0) {
        parameters.defaultFilter = {
          ...parameters.defaultFilter,
          ...filterValue,
        };
      }

      parameters.filter =
        searchValue && Object.keys(searchValue).length > 0
          ? { ...parameters.defaultFilter, ...searchValue }
          : { ...parameters.defaultFilter };
      const orderBy =
        sortingInfo && Object.keys(sortingInfo).length > 1
          ? `${sortingInfo.orderBy} ${sortingInfo.order}`
          : null;
      parameters.orderBy = orderBy ? orderBy : parameters.orderBy;
      const cData = typeData.propertyDefinitions;
      const rowsData = await datasource.getAll(typeId, {
        ...parameters,
        ...pageInfoParams,
        propertyDefinitions: cData,
      });

      const result = {};
      const columns: any = [];
      for (const key in cData) {
        if (cData[key].propertyType === "widget") {
          columns.push({
            name: cData[key].id,
            label: getLocaleString(cData[key], "displayName"),
            type: cData[key].propertyType,
            cellSchema: {
              ...cData[key].cellSchema,
            },
            fieldSchema: cData[key],
          });
        } else {
          columns.push({
            name: cData[key].id,
            label: getLocaleString(cData[key], "displayName"),
            type: cData[key].propertyType,
            isHidden:
              cData[key].isHidden === undefined
                ? defaultHiddenColumns.indexOf(cData[key].id) > -1
                : cData[key].isHidden,
            fieldSchema: cData[key],
          });
        }
      }
      result["columns"] = columns;
      const records: IGridDataRecord[] = rowsData.map((row) => {
        return getRow(row, columns, "object");
      });

      if (incrementalAdd && !isRefresh) {
        const { data } = getState();
        if (records.length > 0) {
          result["records"] = [...data.records, ...records];
        } else {
          result["records"] = data.records;
        }
      } else {
        result["records"] = records;
      }

      pageInfo.totalRecordsCount = rowsData["totalRecordsCount"];
      pageInfo.totalPage = Math.ceil(
        rowsData["totalRecordsCount"] / pageInfo.maxItems
      );

      const uniquePropertyId = typeData.uniquePropertyId
        ? typeData.uniquePropertyId
        : null; //uniquePropertyId is Mandatory for editing cell
      if (
        parameters.hasOwnProperty("customAction") &&
        parameters.customAction.hasOwnProperty("actions") &&
        parameters.customAction["actions"].length > 0
      ) {
        parameters["customAction"]["actions"] = parameters["customAction"][
          "actions"
        ].map((t) => {
          return { ...t, displayText: getLocaleString(t, "displayText") };
        });
      }
      dispatch(
        dataAvailable(
          typeId,
          gridSchemaId,
          result,
          uniquePropertyId,
          pageInfo,
          parameters,
          customDatasource,
          renderCustomCell,
          typeData,
          incrementalAdd,
          sortingInfo
        )
      );
      if (
        selectedRecords !== undefined &&
        selectedRecords !== null &&
        selectedRecords.length > 0
      ) {
        if (typeof selectedRecords[0] === "string") {
          const selectedRecordsArray = [];
          selectedRecords.forEach((ele) => {
            const findObj = result["records"].find(
              (t) =>
                (uniquePropertyId
                  ? t[uniquePropertyId]
                  : t["cmis:objectId"]) === ele
            );
            // tslint:disable-next-line: no-unused-expression
            findObj && selectedRecordsArray.push(findObj);
          });
          dispatch(rowSelected(selectedRecordsArray));
        } else {
          dispatch(rowSelected(selectedRecords));
        }
      }
      transition({
        type: GridActions.State.Indicator.HIDE_INDICATOR,
      });
      transition({
        type: GridActions.State.GRID_LOAD_DONE,
        event: event,
      });
      //calculate summary and update back
      if (records.length > 0 && typeData.viewAttributes.totals !== undefined) {
        transition({
          type: GridActions.State.GRID_INIT_ROW_SUMMARY,
          typeId: typeId,
          viewAttributes: typeData.viewAttributes,
          datasource: datasource,
        });
      }
    } catch (e) {
      // console.log("error loading: ", e);
      transition({
        type: GridActions.State.Indicator.HIDE_INDICATOR,
      });
    }
  };
}

function dataAvailable(
  typeId: string,
  gridSchemaId: string,
  data: any,
  uniquePropertyId: string,
  pageInfo: any,
  viewAttributes: any,
  customDataSource: any,
  renderCustomCell: any,
  typeData: {},
  incrementalAdd: boolean,
  sortingInfo: any
) {
  return {
    type: GridActions.DataAvailable,
    typeId: typeId,
    gridSchemaId: gridSchemaId,
    data: data,
    uniquePropertyId: uniquePropertyId,
    pageInfo: pageInfo,
    viewAttributes: viewAttributes,
    customDataSource: customDataSource,
    renderCustomCell: renderCustomCell,
    gridSchema: typeData,
    incrementalAdd: incrementalAdd ? incrementalAdd : false,
    sortingInfo: sortingInfo,
  };
}

function rowSelected(selectedRows: any[]) {
  return {
    type: GridActions.OnRowSelected,
    selectedRows,
  };
}

export function doGridBeforeSelectedRows(event: any) {
  return async (getState: any, _dispatch: any, transition: any) => {
    const { canTriggerGridSelectedRows, data, gridSchema } = getState();
    if (!Array.isArray(event.selectedRows)) {
      event.selectedRows = [event.selectedRows];
    }

    const selectedRecordsArray = event.selectedRows;
    const uniquePropertyId = gridSchema.uniquePropertyId
      ? gridSchema.uniquePropertyId
      : null;
    if (typeof event.selectedRows[0] === "string") {
      event.selectedRecords.forEach((ele) => {
        const findObj = data["records"].find((t) =>
          uniquePropertyId !== null
            ? t[uniquePropertyId]
            : t["cmis:objectId"] === ele
        );
        // tslint:disable-next-line: no-unused-expression
        findObj && selectedRecordsArray.push(findObj);
      });
    }

    event.selectedRecords = selectedRecordsArray;
    transition({
      type: canTriggerGridSelectedRows
        ? GridActions.State.GRID_SELECTED_ROWS
        : GridActions.State.GRID_SELECTED_ROWS_DONE,
      selectedRows: selectedRecordsArray,
    });
  };
}

export function doGridSelectedRows(event: any) {
  return async (_, _dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.GRID_SELECTED_ROWS_DONE,
      selectedRows: event.selectedRows,
    });
  };
}

export function doGridSelectedRowsDone(selectedRows: any[]) {
  return async (_getState: any, dispatch: any, transition: any) => {
    // dispatch to update reducer state
    dispatch(rowSelected(selectedRows));
    transition({
      type: GridActions.State.GRID_DONE,
    });
  };
}

export function doGridRefresh() {
  return async (getState: any, dispatch: any, transition: any) => {
    const {
      typeId,
      gridSchemaId,
      selectedRows,
      customDataSource,
      renderCustomCell,
      gridSchema,
      incrementalAdd,
      viewAttributes,
    } = getState();
    const preAppliedFilter =
      viewAttributes.filter !== undefined ? viewAttributes.filter : {};
    dispatch(
      onFetchDataServer(
        typeId,
        gridSchemaId,
        customDataSource,
        renderCustomCell,
        null,
        gridSchema,
        selectedRows,
        incrementalAdd,
        preAppliedFilter,
        true
      )
    );
    transition({
      type: GridActions.State.GRID_DONE,
    });
  };
}

export function onCurrentPageChange(currentPage: number) {
  return {
    type: GridActions.PageChange,
    currentPage,
  };
}

export const getCommandContext = (currentItem, params) => {
  const { bounded } = currentItem;
  return bounded === false ? {} : params;
};

export function onCustomButtonExecuteCommand(
  action: any,
  record: any,
  controlID: string,
  queryParams: any
) {
  const dataLoader = WidgetsFactory.instance.services[
    "DataLoaderFactory"
  ] as DataLoaderFactory;
  const commandManager =
    dataLoader.getLoader<ICommandManager>("commandManager");
  return async (getState: any, _dispatch: any, transition: any) => {
    const { typeId, gridSchemaId, customDataSource, pageContext } = getState();
    const contextPath: any = {
      typeId: typeId,
    };
    if (gridSchemaId) {
      contextPath.gridSchemaId = gridSchemaId;
    }
    const contextParams: any = {
      // this is the path to retrieve from command manager
      contextPath: contextPath,
      // this is the context for toolbar
      context: {
        ...getCommandContext(action, {
          typeId,
          record,
          customDataSource,
          controlID,
        }),
        pageContext,
      },
    };
    //to delete chilWidget grid data
    let cmd = commandManager.getCommand(action.name, contextParams.contextPath);
    if (!cmd) {
      cmd = commandManager.getCommand(action.name, {});
    }
    if (queryParams) {
      contextParams.context.queryParams = queryParams;
    }
    try {
      await cmd!.execute(contextParams.context, transition);
    } catch (e) {
      // console.log("Command execution error: ", e);
      // TODO: Show error via popup
    }
  };
}

export function doInitRowSummary(
  typeId: string,
  viewAttributes: any,
  datasource: IDataSourceLake
) {
  return async (_: any, dispatch: any, _transition: any) => {
    const columnsString = viewAttributes.totals.summaryColumns
      .map((t) => t.name)
      .join(",");
    const parameters = {
      filter:
        viewAttributes.filter !== undefined
          ? `${columnsString}, ${viewAttributes.filter.substring(2)}`
          : columnsString,
    };
    const rowsData = await datasource.getAll(typeId, parameters);
    dispatch(doCalculateRowSummary(rowsData, viewAttributes));
  };
}

function doCalculateRowSummary(records: any[], viewAttributes: any) {
  return async (_: any, dispatch: any, transition: any) => {
    // compute summary based on viewAttributes
    if (viewAttributes.totals !== undefined) {
      const summaryData = {};
      for (let i = 0; i < viewAttributes.totals.summaryColumns.length; i++) {
        const summaryColumn = viewAttributes.totals.summaryColumns[i];
        if (summaryColumn.type === "sum") {
          const colData = records.map((t) =>
            t[summaryColumn.name] !== undefined ? t[summaryColumn.name] : 0
          );
          const sum = colData.reduce((a, b) => a + b, 0);
          summaryData[summaryColumn.name] = sum;
        } else {
          summaryData[summaryColumn.name] = 0;
        }
      }

      dispatch({
        type: GridActions.SummaryUpdate,
        summaryData,
      });
    }
    transition({
      type: GridActions.State.GRID_DONE,
    });
  };
}

export function doGridFilter(params: any) {
  return async (getState: any, dispatch: any, transition: any) => {
    const {
      viewAttributes,
      typeId,
      gridSchemaId,
      customDataSource,
      renderCustomCell,
      incrementalAdd,
      selectedRows,
    } = getState();
    let searchValue = {};
    if (params.searchValue) {
      if (typeof params.searchValue === "object") {
        searchValue = params.searchValue;
      } else if (
        Array.isArray(viewAttributes.filterColumns) &&
        viewAttributes.filterColumns.length > 0
      ) {
        searchValue[viewAttributes.filterColumns[0]] = [
          {
            operation: "contains",
            value: params.searchValue,
          },
        ];
      }
    }
    dispatch(onCurrentPageChange(1));
    dispatch(
      onFetchDataServer(
        typeId,
        gridSchemaId,
        customDataSource,
        renderCustomCell,
        params.filter,
        null,
        selectedRows,
        incrementalAdd,
        searchValue,
        true
      )
    );
    transition({
      type: "GRID_DONE",
    });
  };
}

export function doGridGetState(onData: any) {
  return async (getState, _dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.GRID_DONE,
    });
    const gridState = getState();
    onData.call(null, gridState);
  };
}

export function doGridBeforeEdit(event: any) {
  return (_getState, _dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.GRID_EDIT,
      editingRecord: event.editingRecord,
    });
  };
}

function updateEditingRecord(editingRecords: []) {
  return {
    type: GridActions.UpdateEditingRecord,
    editingRecords: editingRecords,
  };
}

export function doGridEdit(event: any) {
  return (getState, dispatch: any, transition: any) => {
    const { uniquePropertyId, editingRecords } = getState();
    const { editingRecord } = event;
    let updatedRecords: any = [];
    if (editingRecords && editingRecords.length > 0) {
      const findObj = editingRecords.find(
        (t) => t[uniquePropertyId] === editingRecord[uniquePropertyId]
      );
      if (findObj) {
        updatedRecords = editingRecords.map((t) => {
          if (t[uniquePropertyId] === editingRecord[uniquePropertyId]) {
            t = { ...t, ...editingRecord };
          }
          return t;
        });
      } else {
        updatedRecords = JSON.parse(JSON.stringify(editingRecords));
        updatedRecords.push(editingRecord);
      }
    } else {
      updatedRecords = editingRecord ? [editingRecord] : [];
    }
    dispatch(updateEditingRecord(JSON.parse(JSON.stringify(updatedRecords))));
    transition({
      type: GridActions.State.GRID_EDIT_LOADED,
    });
  };
}

export function doGridEndEdit(_event: any) {
  return async (getState, _dispatch: any, transition: any) => {
    const { editingRecords, data } = getState();
    const editedRecords: IGridDataRecord[] = editingRecords.map((row) => {
      return getRow(row, data.columns, "string");
    });
    transition({
      type: GridActions.State.GRID_AFTER_END_EDIT,
      editedRecords,
    });
  };
}

export function doGridAfterEndEdit(_event: any) {
  return (_getState, _dispatch: any, transition: any) => {
    transition({
      type: GridActions.State.GRID_DONE,
    });
    transition({
      type: GridActions.State.GRID_REFRESH,
    });
  };
}

export function doGridUpdateContext(context: {}) {
  return (getState, dispatch: any, transition: any) => {
    const { viewAttributes } = getState();
    const updatedContext = { ...viewAttributes["context"], ...context };
    dispatch({
      type: GridActions.UpdateContext,
      updatedContext,
    });
    transition({
      type: GridActions.State.GRID_DONE,
    });
  };
}
